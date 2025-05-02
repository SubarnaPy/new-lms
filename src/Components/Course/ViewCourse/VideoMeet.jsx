import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export default function LiveClassComponent({ roomId, userRole }) {
  const localVideoRef = useRef(null);
  const [peers, setPeers] = useState({});
  const localStreamRef = useRef(null);
  const pcMap = useRef({});
  const myIdRef = useRef(null);

  // Debug helper
  const log = (...args) => console.log('[LiveClass]', ...args);

  // Capture our socket ID on connect
  useEffect(() => {
    socket.on('connect', () => {
      myIdRef.current = socket.id;
      log('Connected to signaling server. My socket ID:', socket.id);
    });
    return () => socket.off('connect');
  }, []);

  // Main mesh setup
  useEffect(() => {
    const joinRoom = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        log('Acquired local media stream');
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;

        socket.emit('join-room', roomId, { role: userRole });
        log('Emitted join-room:', roomId, userRole);

        // Existing users
        socket.on('all-users', users => {
          log('all-users event, users:', users.map(u => u.id));
          users.forEach(({ id: peerId }) => {
            const isOfferer = myIdRef.current < peerId;
            createPeerConnection(peerId, isOfferer);
          });
        });

        // New user joined
        socket.on('user-joined', ({ id: peerId }) => {
          log('user-joined event, peerId:', peerId);
          const isOfferer = myIdRef.current < peerId;
          createPeerConnection(peerId, isOfferer);
        });

        // Incoming offer
        socket.on('offer', async ({ caller, sdp }) => {
          log('Received offer from', caller);
          const pc = createPeerConnection(caller, false);
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          log('Set remote description for offer from', caller);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          log('Created and set local answer for', caller);
          socket.emit('answer', { target: caller, sdp: pc.localDescription });
          log('Sent answer to', caller);
        });

        // Incoming answer
        socket.on('answer', async ({ responder, sdp }) => {
          log('Received answer from', responder);
          const pc = pcMap.current[responder];
          if (!pc) {
            log('No peer connection found for', responder);
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          log('Set remote description for answer from', responder);
        });

        // Incoming ICE candidate
        socket.on('ice-candidate', async ({ sender, candidate }) => {
          log('Received ICE candidate from', sender, candidate);
          const pc = pcMap.current[sender];
          if (pc && candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              log('Added ICE candidate for', sender);
            } catch (err) {
              console.error('[LiveClass] ICE error', err);
            }
          }
        });

        // Peer disconnected
        socket.on('user-disconnected', id => {
          log('User disconnected:', id);
          if (pcMap.current[id]) {
            pcMap.current[id].close();
            delete pcMap.current[id];
          }
          setPeers(prev => {
            const clone = { ...prev };
            delete clone[id];
            return clone;
          });
        });
      } catch (err) {
        console.error('[LiveClass] Error accessing media devices:', err);
      }
    };

    log('Initializing room join for', roomId);
    joinRoom();

    return () => {
      log('Cleaning up socket and peer connections');
      socket.off('all-users');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
      Object.values(pcMap.current).forEach(pc => pc.close());
      pcMap.current = {};
      setPeers({});
    };
  }, [roomId, userRole]);

  const createPeerConnection = (peerId, isOfferer) => {
    if (pcMap.current[peerId]) {
      log('PeerConnection already exists for', peerId);
      return pcMap.current[peerId];
    }
    log('Creating PeerConnection for', peerId, 'offerer:', isOfferer);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcMap.current[peerId] = pc;

    // Add local tracks
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
      log('Added local track to PC for', peerId, track.kind);
    });

    // Prepare remote stream container
    const remoteStream = new MediaStream();
    pc.ontrack = e => {
      remoteStream.addTrack(e.track);
      log('Received remote track from', peerId, e.track.kind);
    };

    // ICE candidate event
    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', { target: peerId, candidate: e.candidate });
        log('Sent ICE candidate to', peerId, e.candidate);
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      log('Connection state for', peerId, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setPeers(prev => ({ ...prev, [peerId]: remoteStream }));
        log('Peer connected, adding to state:', peerId);
      }
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        log('Peer connection closed or failed for', peerId);
        pc.close();
        delete pcMap.current[peerId];
        setPeers(prev => {
          const clone = { ...prev };
          delete clone[peerId];
          return clone;
        });
      }
    };

    // Negotiation
    if (isOfferer) {
      pc.onnegotiationneeded = async () => {
        try {
          log('Negotiation needed with', peerId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: peerId, sdp: offer });
          log('Sent offer to', peerId);
        } catch (err) {
          console.error('[LiveClass] Negotiation error', err);
        }
      };
    }

    return pc;
  };

  return (
    <div>
      <h2>Role: {userRole}</h2>
      <video ref={localVideoRef} autoPlay playsInline muted width={300} />
      <h3>Remote Peers:</h3>
      {Object.entries(peers).map(([id, stream]) => (
        <video
          key={id}
          ref={el => el && (el.srcObject = stream)}
          autoPlay
          playsInline
          width={300}
        />
      ))}
    </div>
  );
}
