// \[media pointer="file-service://file-KdPPma5r1xKShB6fz7pdZd"]
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const socket = io(SERVER_URL);

export default function LiveClassComponent({ roomId, userRole }){
  const localVideoRef = useRef();
  const [peers, setPeers] = useState({});
  const localStreamRef = useRef();
  const pcMap = useRef({});

  useEffect(() => {
    const joinRoom = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;

      socket.emit('join-room', roomId, { role: userRole });

      socket.on('all-users', users => {
        if (userRole === 'INSTRUCTOR') {
          users.forEach(({ id }) => createPeerConnection(id, true));
        }
      });

      socket.on('user-joined', ({ id, role }) => {
        if (userRole === 'INSTRUCTOR') {
          createPeerConnection(id, true);
        } else {
          createPeerConnection(id, false); // just prepare to receive offer
        }
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
        if (!pc || !candidate) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate', err);
        }
      });

      socket.on('user-disconnected', id => {
        if (pcMap.current[id]) {
          pcMap.current[id].close();
          delete pcMap.current[id];
        }
        setPeers(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      });
    };

    joinRoom();
  }, [roomId, userRole]);

  const createPeerConnection = (peerId, isOfferer) => {
    if (pcMap.current[peerId]) return pcMap.current[peerId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pcMap.current[peerId] = pc;

    // Add local tracks
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    // Remote stream handling
    const remoteStream = new MediaStream();
    pc.ontrack = ({ track }) => {
      remoteStream.addTrack(track);
    };
    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          target: peerId,
          candidate: e.candidate,
        });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setPeers(prev => ({ ...prev, [peerId]: remoteStream }));
      }
    };

    if (isOfferer) {
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: peerId, sdp: offer });
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
          ref={video => {
            if (video) video.srcObject = stream;
          }}
          autoPlay
          playsInline
          width={300}
        />
      ))}
    </div>
  );
};

// export default Room;
