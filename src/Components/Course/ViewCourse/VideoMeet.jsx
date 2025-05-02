import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

// Simple Whiteboard for instructor
function Whiteboard() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';

    const getPos = e => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseDown = e => {
      drawing.current = true;
      lastPos.current = getPos(e);
    };
    const onMouseMove = e => {
      if (!drawing.current) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    };
    const onMouseUp = () => { drawing.current = false; };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return <canvas ref={canvasRef} width={800} height={400} style={{ border: '1px solid #ccc', margin: '16px auto', display: 'block' }} />;
}

export default function LiveClassComponent({ roomId, userRole }) {
  const localVideoRef = useRef(null);
  const [peers, setPeers] = useState({});
  const localStreamRef = useRef(null);
  const pcMap = useRef({});
  const myIdRef = useRef(null);

  // Controls state
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const log = (...args) => console.log('[LiveClass]', ...args);

  // Chat listener effect
  useEffect(() => {
    socket.on('chat-message', ({ sender, text }) => {
      setMessages(prev => [...prev, { sender, text }]);
    });
    return () => socket.off('chat-message');
  }, []);

  // Signaling and media effect
  useEffect(() => {
    // Signaling handlers
    const handleAllUsers = users => {
      log('all-users:', users);
      users.forEach(({ id: peerId, role: peerRole }) => createPeerConnection(peerId, true, peerRole));
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
      log('sent answer to', caller);
    };
    const handleAnswer = async ({ responder, sdp }) => {
      log('answer from', responder);
      const pc = pcMap.current[responder];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        log('set remote answer for', responder);
      }
    };
    const handleIce = async ({ sender, candidate }) => {
      const pc = pcMap.current[sender];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          log('added ICE candidate for', sender);
        } catch (err) {
          console.error('ICE error', err);
        }
      }
    };
    const handleDisconnect = peerId => {
      log('user disconnected', peerId);
      const pc = pcMap.current[peerId];
      if (pc) pc.close();
      delete pcMap.current[peerId];
      setPeers(prev => {
        const copy = { ...prev };
        delete copy[peerId];
        return copy;
      });
    };

    // Join room and set up media
    const joinRoom = async () => {
      try {
        log('joining room', roomId, userRole);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        socket.emit('join-room', roomId, { role: userRole });

        socket.on('all-users', handleAllUsers);
        socket.on('user-joined', handleUserJoined);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIce);
        socket.on('user-disconnected', handleDisconnect);
      } catch (err) {
        console.error('getUserMedia error', err);
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
    log('creating PC for', peerId, 'offerer?', isOfferer);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcMap.current[peerId] = pc;

    // add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
        log('added track', track.kind, 'to', peerId);
      });
    }

    // receive remote
    const remoteStream = new MediaStream();
    pc.ontrack = e => {
      remoteStream.addTrack(e.track);
      setPeers(prev => ({ ...prev, [peerId]: { stream: remoteStream, role: peerRole } }));
      log('received track', e.track.kind, 'from', peerId);
    };

    // ICE
    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', { target: peerId, candidate: e.candidate });
        log('sent ICE to', peerId);
      }
    };

    // negotiation
    if (isOfferer) {
      pc.onnegotiationneeded = async () => {
        log('negotiationneeded for', peerId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: peerId, sdp: pc.localDescription, role: userRole });
          log('sent offer to', peerId);
        } catch (err) {
          console.error('negotiation error', err);
        }
      };
    }

    return pc;
  };

  // UI rendering
  const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' };
  const videoStyle = { width: '240px', height: '180px', borderRadius: '8px', border: '2px solid #ccc' };
  const singleStyle = { ...videoStyle, width: '480px', height: '360px' };
  const controlBar = { display: 'flex', justifyContent: 'center', gap: '12px', margin: '12px 0' };
  const chatPanel = { border: '1px solid #ccc', padding: '8px', width: '300px', height: '400px', overflowY: 'auto' };
  const messageStyle = { margin: '4px 0' };

  const studentPeers = Object.entries(peers).filter(([_, p]) => p.role === 'STUDENT');
  const instructorPeers = Object.entries(peers).filter(([_, p]) => p.role === 'INSTRUCTOR');

  // Control handlers
  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    tracks.forEach(track => {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    });
  };
  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    tracks.forEach(track => {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    });
  };
  const shareScreen = async () => {
    if (screenSharing) {
      shareScreen(); // toggles back
      return;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      Object.values(pcMap.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(screenTrack);
      });
      screenTrack.onended = () => shareScreen();
      setScreenSharing(true);
    } catch (err) {
      console.error('screen share error', err);
    }
  };
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit('chat-message', { text: chatInput, sender: myIdRef.current });
    setMessages(prev => [...prev, { sender: 'Me', text: chatInput }]);
    setChatInput('');
  };
  const endCall = () => {
    Object.values(pcMap.current).forEach(pc => pc.close());
    socket.disconnect();
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ textAlign: 'center' }}>Role: {userRole}</h2>
      <div style={controlBar}>
        <button onClick={toggleVideo}>{videoEnabled ? 'Video Off' : 'Video On'}</button>
        <button onClick={toggleAudio}>{audioEnabled ? 'Mute' : 'Unmute'}</button>
        <button onClick={shareScreen}>{screenSharing ? 'Stop Share' : 'Share Screen'}</button>
        <button onClick={endCall}>End Call</button>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          {userRole === 'INSTRUCTOR' ? (
            <>  
              <h3>Your Preview</h3>
              <video ref={localVideoRef} autoPlay playsInline muted style={videoStyle} />
              <h3>Students</h3>
              <div style={gridStyle}>
                {studentPeers.map(([id, { stream }]) => (
                  <video key={id} ref={el => el && (el.srcObject = stream)} autoPlay playsInline style={videoStyle} />
                ))}
              </div>
              <Whiteboard />
            </>
          ) : (
            <>  
              <h3>Instructor</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                {instructorPeers.map(([id, { stream }]) => (
                  <video key={id} ref={el => el && (el.srcObject = stream)} autoPlay playsInline style={singleStyle} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={chatPanel}>
          <h4>Chat</h4>
          <div style={{ height: '300px', overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={messageStyle}><strong>{m.sender}:</strong> {m.text}</div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: '8px' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} style={{ flex: 1, marginRight: '4px' }} />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
