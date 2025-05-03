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
  UserGroupIcon,
  HandRaisedIcon,
  FolderArrowDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/solid';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { PaperAirplaneIcon,FaceSmileIcon } from '@heroicons/react/24/outline';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [raisedHands, setRaisedHands] = useState([]);
  const [files, setFiles] = useState([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

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


   // Raise hand functionality
   const raiseHand = () => {
    socket.emit('raise-hand', { userId: myIdRef.current });
  };

   // File handling
   const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          data: event.target.result,
          sender: myIdRef.current
        };
        socket.emit('send-file', fileData);
        setFiles(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    }
  };

    // Add dark mode classes to main container
    const themeClasses = `
    ${isDarkMode ? 
      'bg-gray-900 text-gray-100' : 
      'bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900'}
  `;

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if(!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    socket.on('raise-hand', (userId) => {
      setRaisedHands(prev => [...new Set([...prev, userId])]);
    });

    socket.on('send-file', (fileData) => {
      setFiles(prev => [...prev, fileData]);
    });
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

    // Enhanced UI Components
    const ControlButton = ({ icon: Icon, onClick, tooltip, active, variant }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`
              p-2.5 transition-all rounded-full
              ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
                active ? 'bg-blue-600 text-white' :
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
            `}
          >
            <Icon className="w-6 h-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );



  return (
<div className={`h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Enhanced Floating Controls */}
      <div className={`fixed flex gap-3 p-2 -translate-x-1/2 rounded-full shadow-lg bottom-6 left-1/2 
        ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/90 border-gray-100'} 
        border backdrop-blur-sm`}>
        
        <ControlButton
          icon={isDarkMode ? MoonIcon : SunIcon}
          onClick={toggleDarkMode}
          tooltip="Toggle Theme"
        />

        <ControlButton
          icon={videoEnabled ? VideoCameraIcon : VideoCameraSlashIcon}
          onClick={toggleVideo}
          tooltip={videoEnabled ? "Disable Video" : "Enable Video"}
          active={videoEnabled}
        />

        <ControlButton
          icon={audioEnabled ? MicrophoneIcon : SpeakerXMarkIcon}
          onClick={toggleAudio}
          tooltip={audioEnabled ? "Mute Audio" : "Unmute Audio"}
          active={audioEnabled}
        />

        {userRole === 'STUDENT' && (
          <ControlButton
            icon={HandRaisedIcon}
            onClick={raiseHand}
            tooltip="Raise Hand"
            active={raisedHands.includes(myIdRef.current)}
          />
        )}

        <ControlButton
          icon={screenSharing ? StopCircleIcon : PresentationChartBarIcon}
          onClick={shareScreen}
          tooltip={screenSharing ? "Stop Sharing" : "Share Screen"}
          active={screenSharing}
        />

        <ControlButton
          icon={PhoneXMarkIcon}
          onClick={endCall}
          tooltip="End Call"
          variant="danger"
        />
      </div>

      {/* Enhanced Main Layout */}
      <div className="grid h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 p-6">
        {/* Participants Panel with Raised Hands */}
        {userRole === 'INSTRUCTOR' && (
          <div className={`p-4 rounded-2xl shadow-sm border 
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            {/* ... participants list */}
            {raisedHands.length > 0 && (
              <div className="p-3 mt-4 rounded-lg bg-blue-100/20">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-500">
                  <HandRaisedIcon className="w-5 h-5" />
                  Raised Hands ({raisedHands.length})
                </h4>
                {raisedHands.map(id => (
                  <div key={id} className="flex items-center gap-2 mt-2 text-sm">
                    <span>Student {id.slice(0,6)}</span>
                    <button 
                      onClick={() => setRaisedHands(prev => prev.filter(i => i !== id))}
                      className="ml-auto text-red-500 hover:text-red-600"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Whiteboard Section */}
        <div className={`rounded-2xl shadow-sm border 
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">
              {userRole === 'INSTRUCTOR' ? "Class Whiteboard" : "Shared Whiteboard"}
            </h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100/20">
                <FolderArrowDownIcon className="w-5 h-5" />
              </button>
              {userRole === 'INSTRUCTOR' && (
                <button className="p-2 rounded-lg hover:bg-gray-100/20">
                  <HandRaisedIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <Whiteboard 
            roomId={roomId} 
            editable={userRole === 'INSTRUCTOR'}
            className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
          />
        </div>

        {/* Enhanced Chat Panel with File Sharing */}
        <div className={`rounded-2xl shadow-sm border transition-transform
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Chat header with file upload */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold">Class Chat</h3>
            </div>
            <div className="flex gap-2">
              <label className="p-1 rounded-lg cursor-pointer hover:bg-gray-100/20">
                <FolderArrowDownIcon className="w-5 h-5" />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                className="p-1 rounded-lg hover:bg-gray-100/20"
              >
                <FaceSmileIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat messages with files */}
          <div className="p-4 space-y-4 overflow-y-auto">
            {files.map((file, i) => (
              <div key={`file-${i}`} className="p-3 rounded-lg bg-blue-100/20">
                <div className="flex items-center gap-2">
                  <FolderArrowDownIcon className="w-5 h-5 text-blue-500" />
                  <a 
                    href={file.data} 
                    download={file.name}
                    className="text-blue-500 hover:underline"
                  >
                    {file.name}
                  </a>
                </div>
                <p className="mt-1 text-sm text-gray-500">From: {file.sender}</p>
              </div>
            ))}

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

        {/* Additional UI Enhancements */}
        {screenSharing && (
        <div className="fixed px-3 py-1 text-sm text-white rounded-full bottom-24 left-6 bg-red-500/90">
          Screen Sharing Active
        </div>
      )}

      {userRole === 'STUDENT' && raisedHands.includes(myIdRef.current) && (
        <div className="fixed px-3 py-1 text-sm text-white rounded-full bottom-24 left-6 bg-green-500/90">
          Hand Raised ✓
        </div>
      )}
    </div>
  );
}
