import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import {
  VideoCameraIcon,
  SpeakerXMarkIcon, // Replace MicrophoneSlashIcon
  MicrophoneIcon,
  VideoCameraSlashIcon,
  // MicrophoneIcon,
  MicrophoneSlashIcon,
  PresentationChartBarIcon,
  StopCircleIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { AcademicCapIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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
  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = !t.enabled);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = !t.enabled);
  };
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
  // const grid = { display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' };
  // const videoStyle = { width: 240, height: 180, borderRadius: 8, border: '2px solid #ccc' };
  // const bigVideo = { ...videoStyle, width: 480, height: 360 };
  // const chatStyle = { border: '1px solid #ccc', padding: 8, width: 300, height: 400, overflowY: 'auto' };

  // const studentPeers = Object.entries(peers).filter(([,p]) => p.role==='STUDENT');
  // const instructorPeers = Object.entries(peers).filter(([,p]) => p.role==='INSTRUCTOR');

  const ControlButton = ({ icon: Icon, onClick, active, label, variant = 'default' }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        variant === 'red' 
          ? 'bg-red-600 hover:bg-red-700' 
          : active 
            ? 'bg-gray-700 hover:bg-gray-600' 
            : 'bg-gray-600 hover:bg-gray-500'
      } text-white`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900">
    {/* Top Controls */}
    <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <AcademicCapIcon className="w-6 h-6 text-blue-500" />
        <span className="text-xl font-bold text-gray-100">{roomId}</span>
        <div className="px-2 py-1 ml-4 text-sm text-gray-300 bg-gray-700 rounded-md">
          {roomId}
        </div>
      </div>
      
      <div className="flex gap-3">
        <ControlButton
          icon={videoEnabled ? VideoCameraIcon : VideoCameraSlashIcon}
          onClick={toggleVideo}
          active={videoEnabled}
          label={videoEnabled ? "Video On" : "Video Off"}
        />
        <ControlButton
          icon={audioEnabled ? MicrophoneIcon : SpeakerXMarkIcon}
          onClick={toggleAudio}
          active={audioEnabled}
          label={audioEnabled ? "Mic On" : "Mic Off"}
        />
        <ControlButton
          icon={screenSharing ? StopCircleIcon : PresentationChartBarIcon}
          onClick={shareScreen}
          active={screenSharing}
          label={screenSharing ? "Stop Sharing" : "Share Screen"}
          variant={screenSharing ? "red" : "default"}
        />
        <button
          onClick={endCall}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
        >
          <PhoneXMarkIcon className="w-5 h-5" />
          <span>Leave</span>
        </button>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex flex-1 overflow-hidden">
      {/* Participants Column (Instructor Only) */}
      {userRole === 'INSTRUCTOR' && (
        <div className="flex flex-col bg-gray-800 border-r border-gray-700 w-80">
          <div className="p-4 border-b border-gray-700">
            <h3 className="flex items-center gap-2 font-semibold text-gray-300">
              <UserGroupIcon className="w-5 h-5" />
              Participants ({Object.keys(peers).length + 1})
            </h3>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="relative group">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full bg-gray-900 rounded-lg aspect-video"
              />
              <div className="absolute px-2 py-1 text-sm text-gray-300 rounded-md bottom-2 left-2 bg-gray-900/80">
                You (Instructor)
              </div>
            </div>

            {Object.entries(peers).map(([id, { stream, role }]) => (
              role === 'STUDENT' && (
                <div key={id} className="relative group">
                  <video 
                    ref={e => e && (e.srcObject = stream)}
                    autoPlay 
                    playsInline 
                    className="w-full bg-gray-900 rounded-lg aspect-video"
                  />
                  <div className="absolute px-2 py-1 text-sm text-gray-300 rounded-md bottom-2 left-2 bg-gray-900/80">
                    Student {id.slice(-4)}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Main Stage */}
      <div className="flex flex-col flex-1 bg-gray-900">
        {userRole === 'STUDENT' ? (
          // Student View - Fullscreen Instructor Video
          <div className="relative flex-1 bg-gray-800">
            {Object.entries(peers).map(([id, { stream, role }]) => (
              role === 'INSTRUCTOR' && (
                <video
                  key={id}
                  ref={e => e && (e.srcObject = stream)}
                  autoPlay
                  playsInline
                  className="absolute inset-0 object-cover w-full h-full p-5 m-6"
                />
              )
            ))}
            <div className="absolute px-3 py-1 text-gray-300 rounded-lg bottom-4 left-4 bg-gray-900/80">
              Live -
            </div>
          </div>
        ) : (
          // Instructor View - Whiteboard
          <div className="flex flex-col flex-1">
            <div className="flex-1 p-4 bg-gray-800">
              <Whiteboard 
                roomId={roomId} 
                editable={true}
                className="h-full bg-white rounded-lg"
              />
            </div>
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <h3 className="flex items-center gap-2 font-semibold text-gray-300">
                <PaintBrushIcon className="w-5 h-5" />
                Collaborative Whiteboard
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <div className={`w-96 bg-gray-800 border-l border-gray-700 flex flex-col ${isChatOpen ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="flex items-center gap-2 font-semibold text-gray-300">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Class Chat
          </h3>
          <button
            onClick={() => setIsChatOpen(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${m.sender === 'Me' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                <div className="mb-1 text-sm font-medium">
                  {m.sender === 'Me' ? 'You' : m.sender}
                </div>
                <div className="text-sm break-words">{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 text-gray-300 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Chat Toggle */}
    {!isChatOpen && (
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed p-3 text-white transition-colors bg-blue-600 rounded-full shadow-lg bottom-4 right-4 hover:bg-blue-700 group"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
        {/* {unreadMessages > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
            {unreadMessages}
          </span>
        )} */}
      </button>
    )}
  </div>

// Reusable ControlButton component

  );
}