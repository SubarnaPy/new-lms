import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import {
  VideoCameraIcon,
  SpeakerXMarkIcon, // Replace MicrophoneSlashIcon
  MicrophoneIcon,
  VideoCameraSlashIcon,
  

  PresentationChartBarIcon,
  StopCircleIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
// import { Tooltip } from '@material-tailwind/react';

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

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50">
  {/* Floating Controls */}
  <div className="fixed flex gap-3 p-2 -translate-x-1/2 border border-gray-100 rounded-full shadow-lg bottom-6 left-1/2 bg-white/90 backdrop-blur-sm">
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={toggleVideo}
          className="p-2.5 text-gray-600 transition-all hover:bg-gray-100 rounded-full"
        >
          {videoEnabled ? (
            <VideoCameraIcon className="w-6 h-6 text-blue-600" />
          ) : (
            <VideoCameraSlashIcon className="w-6 h-6 text-red-600" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{videoEnabled ? "Disable Video" : "Enable Video"}</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={toggleAudio}
          className="p-2.5 text-gray-600 transition-all hover:bg-gray-100 rounded-full"
        >
          {audioEnabled ? (
            <MicrophoneIcon className="w-6 h-6 text-blue-600" />
          ) : (
            <SpeakerXMarkIcon className="w-6 h-6 text-red-600" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{audioEnabled ? "Mute Audio" : "Unmute Audio"}</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={shareScreen}
          className="p-2.5 text-gray-600 transition-all hover:bg-gray-100 rounded-full"
        >
          {screenSharing ? (
            <StopCircleIcon className="w-6 h-6 text-red-600" />
          ) : (
            <PresentationChartBarIcon className="w-6 h-6 text-purple-600" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{screenSharing ? "Stop Sharing" : "Share Screen"}</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={endCall}
          className="p-2.5 text-white transition-all bg-red-600 hover:bg-red-700 rounded-full"
        >
          <PhoneXMarkIcon className="w-6 h-6" />
        </button>
      </TooltipTrigger>
      <TooltipContent>End Call</TooltipContent>
    </Tooltip>
  </div>

  {/* Main Layout */}
  <div className="grid h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 p-6">
    {/* Participants Panel (Left) */}
    {userRole === 'INSTRUCTOR' && (
      <div className="p-4 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <UserGroupIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Participants <span className="text-gray-500">({Object.keys(peers).length})</span>
          </h3>
        </div>
        <div className="space-y-4 overflow-y-auto h-[calc(100vh-180px)]">
          {Object.entries(peers).map(([id, { stream, role }]) => (
            role === 'STUDENT' && (
              <div key={id} className="relative p-3 transition-colors group rounded-xl bg-gray-50 hover:bg-blue-50">
                <video 
                  ref={e => e && (e.srcObject = stream)}
                  autoPlay 
                  playsInline 
                  className="w-full bg-gray-200 rounded-lg aspect-video"
                />
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Student {id.slice(0, 6)}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    )}

    {/* Main Content Area */}
    <div className="flex flex-col gap-6">
      {/* Instructor Preview / Student View */}
      <div className="relative flex-1 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {userRole === 'INSTRUCTOR' ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Your Camera Preview</h3>
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="flex-1 object-contain w-full bg-gray-800 rounded-b-2xl"
            />
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 gap-4 p-4">
            {Object.entries(peers).map(([id, { stream, role }]) => (
              role === 'INSTRUCTOR' && (
                <video
                  key={id}
                  ref={e => e && (e.srcObject = stream)}
                  autoPlay
                  playsInline
                  className="w-full h-full bg-gray-800 rounded-xl"
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* Whiteboard Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[400px]">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            {userRole === 'INSTRUCTOR' ? "Class Whiteboard" : "Shared Whiteboard"}
          </h3>
        </div>
        <Whiteboard 
          roomId={roomId} 
          editable={userRole === 'INSTRUCTOR'}
          className="h-[calc(400px-57px)]"
        />
      </div>
    </div>

    {/* Chat Panel (Right) */}
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Class Chat</h3>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.sender === 'Me' ? 'justify-end' : ''}`}>
              {m.sender !== 'Me' && (
                <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-blue-600 rounded-full">
                  {m.sender.slice(0,1)}
                </div>
              )}
              <div className={`max-w-[75%] p-3 rounded-xl ${m.sender === 'Me' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <p className="text-sm font-medium text-gray-700">{m.sender}</p>
                <p className="mt-1 text-gray-600 break-words">{m.text}</p>
                <span className="block mt-1 text-xs text-right text-gray-400">{m.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="relative">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="w-full px-4 py-2 pr-12 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="absolute p-2 text-blue-600 -translate-y-1/2 right-2 top-1/2 hover:text-blue-700"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Chat Toggle Button */}
  {!isChatOpen && (
    <button
      onClick={() => setIsChatOpen(true)}
      className="fixed p-3 text-white transition-colors bg-blue-600 rounded-full shadow-lg bottom-24 right-6 hover:bg-blue-700"
    >
      <ChatBubbleLeftRightIcon className="w-6 h-6" />
    </button>
  )}
</div>
  );
}