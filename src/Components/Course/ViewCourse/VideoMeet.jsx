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

  // Capture our socket ID on connect
  useEffect(() => {
    socket.on('connect', () => {
      myIdRef.current = socket.id;
    });
    return () => socket.off('connect');
  }, []);

  // Main mesh setup
  useEffect(() => {
    const joinRoom = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;

      socket.emit('join-room', roomId, { role: userRole });

      socket.on('all-users', users => {
        users.forEach(({ id: peerId }) => {
          const isOfferer = myIdRef.current < peerId;
          createPeerConnection(peerId, isOfferer);
        });
      });
      socket.on('user-joined', ({ id: peerId }) => {
        const isOfferer = myIdRef.current < peerId;
        createPeerConnection(peerId, isOfferer);
      });
      socket.on('offer', async ({ caller, sdp }) => {
        const pc = createPeerConnection(caller, false);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: caller, sdp: pc.localDescription });
      });
      socket.on('answer', async ({ responder, sdp }) => {
        const pc = pcMap.current[responder];
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      });
      socket.on('ice-candidate', async ({ sender, candidate }) => {
        const pc = pcMap.current[sender];
        if (pc && candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('ICE error', err);
          }
        }
      });
      socket.on('user-disconnected', id => {
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
    };

    joinRoom();
    return () => {
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
    if (pcMap.current[peerId]) return pcMap.current[peerId];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcMap.current[peerId] = pc;

    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    const remoteStream = new MediaStream();
    pc.ontrack = e => remoteStream.addTrack(e.track);

    pc.onicecandidate = e => {
      if (e.candidate) socket.emit('ice-candidate', { target: peerId, candidate: e.candidate });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setPeers(prev => ({ ...prev, [peerId]: remoteStream }));
      }
    };
    if (isOfferer) pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: peerId, sdp: offer });
      } catch (err) {
        console.error('Negotiation error', err);
      }
    };

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
