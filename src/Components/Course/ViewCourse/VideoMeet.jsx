import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
// import { useParams } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';

export default function LiveClassComponent({ roomId,userRole }) {
  // const { roomId } = useParams();
  const [peers, setPeers] = useState([]);             // Array of { id, role }
  const localVideoRef = useRef();
  const remoteContainerRef = useRef();
  const peersRef = useRef({});                        // id → RTCPeerConnection
  const pendingCandidates = useRef({});               // id → [RTCICECandidateInit]
  const localStreamRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    if (!roomId) return;
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;

        socket.emit('join-room', roomId, { role: userRole });

        socket.on('all-users', existingPeers => {
          const toConnect = userRole === 'INSTRUCTOR'
            ? existingPeers
            : existingPeers.filter(p => p.role === 'INSTRUCTOR');

          setPeers(toConnect);
          toConnect.forEach(peer => {
            if (!peersRef.current[peer.id]) {
              const pc = createPeerConnection(peer.id, socket, stream);
              peersRef.current[peer.id] = pc;
              negotiate(pc, peer.id, socket);
            }
          });
        });

        socket.on('user-joined', peer => {
          const shouldSee = userRole === 'INSTRUCTOR' || peer.role === 'INSTRUCTOR';
          if (!shouldSee) return;

          setPeers(prev => [...prev, peer]);
          if (!peersRef.current[peer.id]) {
            const pc = createPeerConnection(peer.id, socket, stream);
            peersRef.current[peer.id] = pc;
            negotiate(pc, peer.id, socket);
          }
        });

        socket.on('offer', async ({ sdp, caller }) => {
          let pc = peersRef.current[caller];
          if (!pc) {
            pc = createPeerConnection(caller, socket, stream);
            peersRef.current[caller] = pc;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          flushCandidates(caller, pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { target: caller, sdp: answer });
        });

        socket.on('answer', async ({ sdp, responder }) => {
          const pc = peersRef.current[responder];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            flushCandidates(responder, pc);
          }
        });

        socket.on('ice-candidate', ({ candidate, sender }) => {
          const pc = peersRef.current[sender];
          if (!pc || !pc.remoteDescription) {
            // queue until setRemoteDescription
            pendingCandidates.current[sender] = pendingCandidates.current[sender] || [];
            pendingCandidates.current[sender].push(candidate);
          } else {
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          }
        });

        socket.on('user-disconnected', id => {
          setPeers(prev => prev.filter(p => p.id !== id));
          const pc = peersRef.current[id];
          if (pc) {
            pc.close();
            delete peersRef.current[id];
          }
          const vid = document.getElementById(id);
          if (vid) vid.remove();
        });
      })
      .catch(console.error);

    return () => {
      const s = socketRef.current;
      s.off('all-users');
      s.off('user-joined');
      s.off('offer');
      s.off('answer');
      s.off('ice-candidate');
      s.off('user-disconnected');
      s.disconnect();

      localStreamRef.current?.getTracks().forEach(t => t.stop());
      remoteContainerRef.current?.replaceChildren();
    };
  }, [roomId, userRole]);

  function createPeerConnection(id, socket, stream) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // add tracks exactly once here
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', { target: id, candidate: e.candidate });
      }
    };

    pc.ontrack = e => {
      let video = document.getElementById(id);
      if (!video) {
        video = document.createElement('video');
        video.id = id;
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = '300px';
        video.style.margin = '5px';
        remoteContainerRef.current.appendChild(video);
      }
      video.srcObject = e.streams[0];
    };

    return pc;
  }

  async function negotiate(pc, targetId, socket) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { target: targetId, sdp: offer });
  }

  function flushCandidates(peerId, pc) {
    const queued = pendingCandidates.current[peerId] || [];
    queued.forEach(cand => {
      pc.addIceCandidate(new RTCIceCandidate(cand)).catch(console.error);
    });
    pendingCandidates.current[peerId] = [];
  }

  return (
    <div>
      <h1>Live Classroom: {roomId}</h1>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '300px', border: '1px solid #ccc' }}
      />
      <div
        ref={remoteContainerRef}
        style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}
      >
        {peers.map(({ id, role }) => (
          <div key={id} style={{ textAlign: 'center', margin: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {role}
            </div>
            <video id={id} autoPlay playsInline style={{ width: '300px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
