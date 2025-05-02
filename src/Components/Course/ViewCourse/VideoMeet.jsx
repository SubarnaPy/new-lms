import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export default function LiveClassComponent({ roomId, userRole }) {
  const localVideoRef = useRef(null);
  const [peers, setPeers] = useState({}); // { [id]: { stream, role } }
  const localStreamRef = useRef(null);
  const pcMap = useRef({});
  const myIdRef = useRef(null);

  // Generic logger
  const log = (...args) => console.log('[LiveClass]', ...args);

  useEffect(() => {
    // Handlers
    const handleAllUsers = (users) => {
      log('all-users:', users);
      users.forEach(({ id: peerId, role: peerRole }) => {
        createPeerConnection(peerId, true, peerRole);
      });
    };

    const handleUserJoined = ({ id: peerId, role: peerRole }) => {
      log('user-joined:', peerId, peerRole);
      createPeerConnection(peerId, false, peerRole);
    };

    const handleOffer = async ({ caller, sdp, role: peerRole }) => {
      log('offer from', caller);
      const pc = createPeerConnection(caller, false, peerRole);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { target: caller, sdp: pc.localDescription });
    };

    const handleAnswer = async ({ responder, sdp }) => {
      log('answer from', responder);
      const pc = pcMap.current[responder];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const handleIce = async ({ sender, candidate }) => {
      const pc = pcMap.current[sender];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleDisconnect = (peerId) => {
      log('disconnect:', peerId);
      const pc = pcMap.current[peerId];
      if (pc) pc.close();
      delete pcMap.current[peerId];
      setPeers(prev => {
        const copy = { ...prev };
        delete copy[peerId];
        return copy;
      });
    };

    // Join after connection
    const joinRoom = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        } else {
          log('localVideoRef not assigned yet');
        }
        socket.emit('join-room', roomId, { role: userRole });
        log('join-room', roomId, userRole);

        socket.on('all-users', handleAllUsers);
        socket.on('user-joined', handleUserJoined);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIce);
        socket.on('user-disconnected', handleDisconnect);
      } catch (err) {
        console.error('[LiveClass] getUserMedia error', err);
      }
    };

    const onConnect = () => {
      myIdRef.current = socket.id;
      log('connected as', socket.id);
      joinRoom();
    };

    socket.on('connect', onConnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('all-users', handleAllUsers);
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIce);
      socket.off('user-disconnected', handleDisconnect);
      Object.values(pcMap.current).forEach(pc => pc.close());
      pcMap.current = {};
      setPeers({});
    };
  }, [roomId, userRole]);

  const createPeerConnection = (peerId, isOfferer, peerRole) => {
    if (pcMap.current[peerId]) return pcMap.current[peerId];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcMap.current[peerId] = pc;

    // local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    // remote stream
    const remoteStream = new MediaStream();
    pc.ontrack = e => {
      remoteStream.addTrack(e.track);
      setPeers(prev => ({ ...prev, [peerId]: { stream: remoteStream, role: peerRole } }));
    };

    // ICE
    pc.onicecandidate = e => {
      if (e.candidate) socket.emit('ice-candidate', { target: peerId, candidate: e.candidate });
    };

    if (isOfferer) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: peerId, sdp: pc.localDescription, role: userRole });
        } catch (err) {
          console.error('[LiveClass] offer err', err);
        }
      };
    }

    return pc;
  };

  // Styles
  const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' };
  const videoStyle = { width: '240px', height: '180px', borderRadius: '8px', border: '2px solid #ccc' };
  const singleStyle = { ...videoStyle, width: '480px', height: '360px' };

  // Render
  const studentPeers = Object.entries(peers).filter(([_, p]) => p.role === 'STUDENT');
  const instructorPeers = Object.entries(peers).filter(([_, p]) => p.role === 'INSTRUCTOR');

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ textAlign: 'center' }}>Role: {userRole}</h2>
      {userRole === 'INSTRUCTOR' ? (
        <>
          <h3>Your Preview</h3>
          <video ref={localVideoRef} autoPlay muted style={videoStyle} />
          <h3>Students</h3>
          <div style={gridStyle}>
            {studentPeers.map(([id, { stream }]) => (
              <video key={id} ref={el => el && (el.srcObject = stream)} autoPlay style={videoStyle} />
            ))}
          </div>
        </>
      ) : (
        <>
          <h3>Instructor</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            {instructorPeers.map(([id, { stream }]) => (
              <video key={id} ref={el => el && (el.srcObject = stream)} autoPlay style={singleStyle} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
