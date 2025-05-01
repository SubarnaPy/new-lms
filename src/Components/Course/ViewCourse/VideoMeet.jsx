import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';

export default function LiveClassComponent({ userRole }) {
  const { roomId } = useParams();            // ensure you’re actually passing roomId via the URL
  const [peers, setPeers] = useState([]);    // Array<{ id, role }>
  const localVideoRef = useRef();
  const remoteContainerRef = useRef();
  const peersRef = useRef({});               // id → RTCPeerConnection
  const pendingCands = useRef({});           // id → RTCIceCandidateInit[]
  const localStreamRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    if (!roomId) return;
    console.log('Connecting to room', roomId, 'as', userRole);

    // 1) open socket with role in query
    const socket = io(SERVER_URL, { query: { role: userRole } });
    socketRef.current = socket;

    // 2) get camera/mic
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;

        // join the room
        socket.emit('join-room', roomId, { role: userRole });
        console.log('→ join-room emitted');

        // initial peer list
        socket.on('all-users', existing => {
          console.log('← all-users', existing);
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

        // someone just joined
        socket.on('user-joined', peer => {
          console.log('← user-joined', peer);
          const see = userRole === 'INSTRUCTOR' || peer.role === 'INSTRUCTOR';
          if (!see) return;

          setPeers(prev => [...prev, peer]);
          if (!peersRef.current[peer.id]) {
            const pc = createPeer(peer.id, socket, stream);
            peersRef.current[peer.id] = pc;
            negotiate(pc, peer.id, socket);
          }
        });

        // incoming offer — **no more `stable` guard** here
        socket.on('offer', async ({ sdp, caller }) => {
          console.log('← offer from', caller);
          let pc = peersRef.current[caller];
          if (!pc) {
            pc = createPeer(caller, socket, stream);
            peersRef.current[caller] = pc;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          flushCands(caller, pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { target: caller, sdp: answer });
          console.log('→ answer sent to', caller);
        });

        // incoming answer — only when we sent an offer
        socket.on('answer', async ({ sdp, responder }) => {
          console.log('← answer from', responder);
          const pc = peersRef.current[responder];
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            flushCands(responder, pc);
          } else {
            console.warn('— ignoring answer; state is', pc?.signalingState);
          }
        });

        // ICE candidates
        socket.on('ice-candidate', ({ candidate, sender }) => {
          const pc = peersRef.current[sender];
          if (!pc || !pc.remoteDescription) {
            pendingCands.current[sender] = pendingCands.current[sender] || [];
            pendingCands.current[sender].push(candidate);
            console.log('→ queued candidate from', sender);
          } else {
            pc.addIceCandidate(new RTCIceCandidate(candidate))
              .catch(e => console.error('cand error', e));
          }
        });

        // peer left
        socket.on('user-disconnected', id => {
          console.log('← user-disconnected', id);
          setPeers(p => p.filter(x => x.id !== id));
          const pc = peersRef.current[id];
          if (pc) { pc.close(); delete peersRef.current[id]; }
          const vid = document.getElementById(id);
          if (vid) vid.remove();
        });
      })
      .catch(console.error);

    // cleanup
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

  function createPeer(id, socket, stream) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    // add local tracks once
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.onicecandidate = e => {
      if (e.candidate) socket.emit('ice-candidate', { target: id, candidate: e.candidate });
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

  async function negotiate(pc, id, socket) {
    console.log('→ creating offer for', id);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { target: id, sdp: offer });
  }

  function flushCands(id, pc) {
    const list = pendingCands.current[id] || [];
    list.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error));
    pendingCands.current[id] = [];
    if (list.length) console.log(`→ flushed ${list.length} queued candidates for ${id}`);
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
