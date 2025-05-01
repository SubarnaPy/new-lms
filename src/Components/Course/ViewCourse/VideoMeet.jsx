import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';

export default function LiveClassComponent({roomId, userRole }) {
  // const { roomId } = useParams();

  console.log(roomId, userRole )
  const [peers, setPeers] = useState([]);               // Array<{ id, role }>
  const localVideoRef = useRef();
  const remoteContainerRef = useRef();
  const peersRef = useRef({});                          // id → RTCPeerConnection
  const pendingCandidates = useRef({});                 // id → ICECandidateInit[]
  const localStreamRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    if (!roomId) return;
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    // 1) Acquire local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;

        // 2) Join room with role
        socket.emit('join-room', roomId, { role: userRole });

        // 3) Handle initial peer list
        socket.on('all-users', existing => {
          const toConnect = userRole === 'INSTRUCTOR'
            ? existing
            : existing.filter(p => p.role === 'INSTRUCTOR');

          setPeers(toConnect);
          toConnect.forEach(peer => {
            if (!peersRef.current[peer.id]) {
              const pc = createPeer(peer.id, socket, stream);
              peersRef.current[peer.id] = pc;
              negotiate(pc, peer.id, socket);
            }
          });
        });

        // 4) Handle newcomers
        socket.on('user-joined', peer => {
          const see = userRole === 'INSTRUCTOR' || peer.role === 'INSTRUCTOR';
          if (!see) return;

          setPeers(prev => [...prev, peer]);
          if (!peersRef.current[peer.id]) {
            const pc = createPeer(peer.id, socket, stream);
            peersRef.current[peer.id] = pc;
            negotiate(pc, peer.id, socket);
          }
        });

        // 5) Incoming offer
        socket.on('offer', async ({ sdp, caller }) => {
          let pc = peersRef.current[caller];
          if (!pc) {
            pc = createPeer(caller, socket, stream);
            peersRef.current[caller] = pc;
          }
          if (pc.signalingState === 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            flushCandidates(caller, pc);

            const ans = await pc.createAnswer();
            await pc.setLocalDescription(ans);
            socket.emit('answer', { target: caller, sdp: ans });
          }
        });

        // 6) Incoming answer
        socket.on('answer', async ({ sdp, responder }) => {
          const pc = peersRef.current[responder];
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            flushCandidates(responder, pc);
          }
        });

        // 7) ICE candidates
        socket.on('ice-candidate', ({ candidate, sender }) => {
          const pc = peersRef.current[sender];
          if (!pc || !pc.remoteDescription) {
            pendingCandidates.current[sender] = pendingCandidates.current[sender] || [];
            pendingCandidates.current[sender].push(candidate);
          } else {
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          }
        });

        // 8) Peer disconnected
        socket.on('user-disconnected', id => {
          setPeers(prev => prev.filter(p => p.id !== id));
          const pc = peersRef.current[id];
          if (pc) { pc.close(); delete peersRef.current[id]; }
          const vid = document.getElementById(id);
          if (vid) vid.remove();
        });
      })
      .catch(console.error);

    // Cleanup
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

  // Create PC and add local tracks once
  function createPeer(id, socket, stream) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // add your tracks exactly once
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

  // Send an offer
  async function negotiate(pc, id, socket) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { target: id, sdp: offer });
  }

  // Flush any queued ICE candidates
  function flushCandidates(id, pc) {
    const list = pendingCandidates.current[id] || [];
    list.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error));
    pendingCandidates.current[id] = [];
  }

  return (
    <div>
      <h1>Live Classroom: {roomId}</h1>
      <video
        ref={localVideoRef}
        autoPlay muted playsInline
        style={{ width: '300px', border: '1px solid #ccc' }}
      />
      <div
        ref={remoteContainerRef}
        style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}
      >
        {peers.map(({ id, role }) => (
          <div key={id} style={{ textAlign: 'center', margin: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{role}</div>
            <video id={id} autoPlay playsInline style={{ width: '300px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
