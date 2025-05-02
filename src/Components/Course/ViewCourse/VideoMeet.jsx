import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

// Collaborative Whiteboard for instructor


function Whiteboard({ roomId, editable }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';

    const getPos = e => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const emitDraw = ({ prevX, prevY, x, y }) => {
      socket.emit('whiteboard-draw', { roomId, prevX, prevY, x, y });
    };

    // Local drawing
    const onMouseDown = e => {
      if (!editable) return;
      drawing.current = true;
      lastPos.current = getPos(e);
    };
    const onMouseMove = e => {
      if (!editable || !drawing.current) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      emitDraw({ prevX: lastPos.current.x, prevY: lastPos.current.y, x: pos.x, y: pos.y });
      lastPos.current = pos;
    };
    const onMouseUp = () => { drawing.current = false; };

    // Remote drawing
    const onRemoteDraw = ({ roomId: rid, prevX, prevY, x, y }) => {
      if (rid !== roomId) return;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    socket.on('whiteboard-draw', onRemoteDraw);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      socket.off('whiteboard-draw', onRemoteDraw);
    };
  }, [roomId, editable]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '400px',
        border: '1px solid #ccc',
        margin: '16px auto',
        display: 'block'
      }}
    />
  );
}
export default function LiveClassComponent({ roomId, userRole }) {
  const localVideoRef = useRef(null);
  const [peers, setPeers] = useState({}); // { id: { stream, role } }
  const localStreamRef = useRef(null);
  const pcMap = useRef({});
  const myIdRef = useRef(null);

  // Controls state
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Chat listener
  useEffect(() => {
    const onMsg = ({ sender, text }) => setMessages(prev => [...prev, { sender, text }]);
    socket.on('chat-message', onMsg);
    return () => socket.off('chat-message', onMsg);
  }, []);

  // Signaling & media
  useEffect(() => {
    const handleAllUsers = users => users.forEach(({ id, role }) => createPeer(id, true, role));
    const handleUserJoined = ({ id, role }) => createPeer(id, false, role);
    const handleOffer = async ({ caller, sdp, role }) => {
      const pc = createPeer(caller, false, role);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { target: caller, sdp: pc.localDescription });
    };
    const handleAnswer = async ({ responder, sdp }) => {
      const pc = pcMap.current[responder];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };
    const handleIce = async ({ sender, candidate }) => {
      const pc = pcMap.current[sender];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };
    const handleDisconnect = id => {
      const pc = pcMap.current[id]; pc && pc.close(); delete pcMap.current[id];
      setPeers(prev => { const p = { ...prev }; delete p[id]; return p; });
    };

    const joinRoom = async () => {
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
    };

    const onConnect = () => { myIdRef.current = socket.id; joinRoom(); };
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

  const createPeer = (id, isOfferer, role) => {
    if (pcMap.current[id]) return pcMap.current[id];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcMap.current[id] = pc;
    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    const remoteStream = new MediaStream();
    pc.ontrack = e => {
      remoteStream.addTrack(e.track);
      setPeers(p => ({ ...p, [id]: { stream: remoteStream, role } }));
    };
    pc.onicecandidate = e => e.candidate && socket.emit('ice-candidate', { target: id, candidate: e.candidate });
    if (isOfferer) pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { target: id, sdp: pc.localDescription, role: userRole });
    };
    return pc;
  };

  // Controls
  const toggleVideo = () => 
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = !t.enabled);
  const toggleAudio = () => 
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = !t.enabled);
  const shareScreen = async () => {
    if (screenSharing) return window.location.reload();
    const disp = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const track = disp.getVideoTracks()[0];
    Object.values(pcMap.current).forEach(pc => pc.getSenders().find(s => s.track.kind==='video').replaceTrack(track));
    track.onended = () => window.location.reload();
    setScreenSharing(true);
  };
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit('chat-message', { text: chatInput, sender: myIdRef.current });
    setMessages(m => [...m, { sender: 'Me', text: chatInput }]);
    setChatInput('');
  };
  const endCall = () => {
    Object.values(pcMap.current).forEach(pc => pc.close());
    socket.disconnect();
  };

  // Render
  const grid = { display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' };
  const videoStyle = { width: 240, height: 180, borderRadius: 8, border: '2px solid #ccc' };
  const bigVideo = { ...videoStyle, width: 480, height: 360 };
  const chatStyle = { border: '1px solid #ccc', padding: 8, width: 300, height: 400, overflowY: 'auto' };

  const studentPeers = Object.entries(peers).filter(([,p]) => p.role==='STUDENT');
  const instructorPeers = Object.entries(peers).filter(([,p]) => p.role==='INSTRUCTOR');

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: 'center' }}>Role: {userRole}</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: 12 }}>
        <button onClick={toggleVideo}>Toggle Video</button>
        <button onClick={toggleAudio}>Toggle Audio</button>
        <button onClick={shareScreen}>{screenSharing ? 'Stop Share' : 'Share Screen'}</button>
        <button onClick={endCall}>End Call</button>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {userRole==='INSTRUCTOR' ? (
            <>
              <h3>Your Preview</h3>
              <video ref={localVideoRef} autoPlay playsInline muted style={videoStyle} />
              <h3>Students</h3>
              <div style={grid}>
                {studentPeers.map(([id,{stream}]) => (
                  <video key={id} ref={e => e && (e.srcObject = stream)} autoPlay playsInline style={videoStyle} />
                ))}
              </div>
              <Whiteboard roomId={roomId} editable={true} />
            </>
          ) : (
            <>
              <h3>Instructor</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                {instructorPeers.map(([id,{stream}]) => (
                  <video key={id} ref={e => e && (e.srcObject = stream)} autoPlay playsInline style={bigVideo} />
                ))}
              </div>
              <Whiteboard roomId={roomId} editable={false} />
            </>
          )}
        </div>
        <div style={{ ...chatStyle, flexShrink: 0, marginTop: 48 }}>
          <h4>Class Chat</h4>
          <div style={{ height: 300, overflowY: 'auto' }}>
            {messages.map((m,i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <b>{m.sender}:</b> {m.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: 8 }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              style={{ flex: 1, marginRight: 4, padding: 4 }}
            />
            <button onClick={sendMessage} style={{ padding: '4px 8px' }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}