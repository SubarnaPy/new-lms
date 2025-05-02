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
    <div className="h-screen bg-gray-100">
      {/* Controls Bar */}
      <div className="flex justify-center gap-4 p-4 bg-white shadow-sm">
        <button 
          onClick={toggleVideo}
          className="p-2 text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700"
          title={videoEnabled ? "Disable Video" : "Enable Video"}
        >
          {videoEnabled ? (
            <VideoCameraIcon className="w-6 h-6" />
          ) : (
            <VideoCameraSlashIcon className="w-6 h-6" />
          )}
        </button>

        <button 
          onClick={toggleAudio}
          className="p-2 text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700"
          title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
        >
          {audioEnabled ? (
            <MicrophoneIcon className="w-6 h-6" />
          ) : (
            <SpeakerXMarkIcon className="w-6 h-6" />
          )}
        </button>

        <button 
          onClick={shareScreen}
          className={`p-2 rounded-full transition-colors ${
            screenSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={screenSharing ? "Stop Sharing" : "Share Screen"}
        >
          {screenSharing ? (
            <StopCircleIcon className="w-6 h-6" />
          ) : (
            <PresentationChartBarIcon className="w-6 h-6" />
          )}
        </button>

        <button 
          onClick={endCall}
          className="p-2 text-white transition-colors bg-red-600 rounded-full hover:bg-red-700"
          title="End Call"
        >
          <PhoneXMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Participants Sidebar (Instructor Only) */}
        {userRole === 'INSTRUCTOR' && (
          <div className="w-64 p-4 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <UserGroupIcon className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold">Participants ({Object.keys(peers).length})</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(peers).map(([id, { stream, role }]) => (
                role === 'STUDENT' && (
                  <div key={id} className="p-2 rounded-lg shadow-sm bg-gray-50">
                    <video 
                      ref={e => e && (e.srcObject = stream)}
                      autoPlay 
                      playsInline 
                      className="w-full bg-black rounded-lg aspect-video"
                    />
                    <p className="mt-1 text-sm text-gray-600 truncate">Student {id.slice(0, 6)}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {userRole === 'INSTRUCTOR' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-4 bg-white shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold">Your Preview</h3>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full bg-black rounded-xl aspect-video"
                />
              </div>

              <div className="p-4 bg-white shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold">Whiteboard</h3>
                <Whiteboard roomId={roomId} editable={true} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-4 bg-white shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold">Instructor View</h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {Object.entries(peers).map(([id, { stream, role }]) => (
                    role === 'INSTRUCTOR' && (
                      <video
                        key={id}
                        ref={e => e && (e.srcObject = stream)}
                        autoPlay
                        playsInline
                        className="w-full bg-black rounded-xl aspect-video"
                      />
                    )
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold">Class Whiteboard</h3>
                <Whiteboard roomId={roomId} editable={false} />
              </div>
            </div>
          )}
        </div>

        {/* Chat Floating Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed p-3 text-white transition-colors bg-blue-600 rounded-full shadow-lg bottom-4 right-4 hover:bg-blue-700"
          title="Open Chat"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </button>

        {/* Chat Modal */}
        {isChatOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Class Chat</h3>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-gray-500 rounded-full hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                      {m.sender === 'Me' ? 'Y' : m.sender.slice(0,1)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{m.sender}</p>
                      <p className="text-gray-600 break-words">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        )}
      </div>
    </div>
  );
}