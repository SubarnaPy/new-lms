import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';

export default function LiveClassComponent({roomId, userRole }) {
  // const { roomId } = useParams();
  const [peers, setPeers] = useState([]);             // Array of { id, role }
  const localVideoRef = useRef();
  const remoteContainerRef = useRef();
  const peersRef = useRef({});                        // id → RTCPeerConnection
  const localStreamRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    if (!roomId) return;
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    // 1) get local media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;

        // 2) join the room, sending our role
        socket.emit('join-room', roomId, { role: userRole });

        // 3) handle the initial list of peers
        socket.on('all-users', existingPeers => {
          // decide which peers to connect to
          const toConnect = userRole === 'INSTRUCTOR'
            ? existingPeers
            : existingPeers.filter(p => p.role === 'INSTRUCTOR');

          // save them for rendering
          setPeers(toConnect);

          // and create WebRTC offers
          toConnect.forEach(({ id }) => {
            const pc = createPeerConnection(id, socket);
            peersRef.current[id] = pc;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.createOffer().then(offer => {
              pc.setLocalDescription(offer);
              socket.emit('offer', { target: id, sdp: offer });
            });
          });
        });

        // 4) handle newcomers
        socket.on('user-joined', peer => {
          const shouldSee = userRole === 'INSTRUCTOR' || peer.role === 'INSTRUCTOR';
          if (!shouldSee) return;

          setPeers(prev => [...prev, peer]);
          const pc = createPeerConnection(peer.id, socket);
          peersRef.current[peer.id] = pc;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });

        // 5) WebRTC signaling
        socket.on('offer', async ({ sdp, caller }) => {
          const pc = peersRef.current[caller] || createPeerConnection(caller, socket);
          peersRef.current[caller] = pc;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { target: caller, sdp: answer });
        });

        socket.on('answer', async ({ sdp, responder }) => {
          const pc = peersRef.current[responder];
          if (pc && !pc.remoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          }
        });

        socket.on('ice-candidate', ({ candidate, sender }) => {
          const pc = peersRef.current[sender];
          if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on('user-disconnected', id => {
          setPeers(prev => prev.filter(p => p.id !== id));
          if (peersRef.current[id]) {
            peersRef.current[id].close();
            delete peersRef.current[id];
          }
          const vid = document.getElementById(id);
          if (vid) vid.remove();
        });
      })
      .catch(console.error);

    // cleanup on unmount
    return () => {
      // remove all listeners
      const s = socketRef.current;
      s.off('all-users');
      s.off('user-joined');
      s.off('offer');
      s.off('answer');
      s.off('ice-candidate');
      s.off('user-disconnected');
      s.disconnect();

      // stop all local tracks
      localStreamRef.current?.getTracks().forEach(t => t.stop());

      // clear remote videos
      remoteContainerRef.current?.replaceChildren();
    };
  }, [roomId, userRole]);

  function createPeerConnection(id, socket) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

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
