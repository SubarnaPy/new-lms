import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const socket = io(SERVER_URL);

export default function LiveClassComponent({ roomId, userRole }) {
  
  const localVideoRef = useRef();
  const canvasRef = useRef();
  const [peers, setPeers] = useState({});
  const [userList, setUserList] = useState([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const localStreamRef = useRef();
  const screenStreamRef = useRef();
  const pcMap = useRef({});
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Whiteboard drawing logic
  useEffect(() => {
    if (!showWhiteboard) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    const handleMouseDown = (e) => {
      setDrawing(true);
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseMove = (e) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      setDrawing(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
    };
  }, [showWhiteboard, drawing, color, lineWidth]);

  // WebRTC and media controls
  const toggleMedia = async (type) => {
    const stream = localStreamRef.current;
    const tracks = stream.getTracks().filter(track => track.kind === type);
    tracks.forEach(track => track.enabled = !track.enabled);
    
    if (type === 'video') setIsVideoOn(!isVideoOn);
    if (type === 'audio') setIsAudioOn(!isAudioOn);
  };

  const toggleScreenShare = async () => {
    if (!isSharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const videoTrack = screenStream.getVideoTracks()[0];
        
        Object.values(pcMap.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video');
          sender.replaceTrack(videoTrack);
        });

        localVideoRef.current.srcObject = screenStream;
        setIsSharingScreen(true);
        
        videoTrack.onended = () => toggleScreenShare();
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      
      Object.values(pcMap.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(videoTrack);
      });

      screenStreamRef.current.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = localStreamRef.current;
      setIsSharingScreen(false);
    }
  };

  const handleEndCall = () => {
    Object.values(pcMap.current).forEach(pc => pc.close());
    localStreamRef.current.getTracks().forEach(track => track.stop());
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
    socket.emit('leave-room', roomId);
    navigate(`/course/${courseId}`);
  };

  useEffect(() => {
    const joinRoom = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;

      socket.emit('join-room', roomId, { role: userRole });

      socket.on('all-users', users => {
        setUserList(users);
        if (userRole === 'INSTRUCTOR') {
          users.forEach(({ id }) => createPeerConnection(id, true));
        }
      });

      socket.on('user-joined', ({ id, role }) => {
        setUserList(prev => [...prev, { id, role }]);
        if (userRole === 'INSTRUCTOR') {
          createPeerConnection(id, true);
        } else {
          createPeerConnection(id, false);
        }
      });

      socket.on('offer', async ({ caller, sdp }) => {
        const pc = createPeerConnection(caller, false);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: caller, sdp: pc.localDescription });
      });

      socket.on('answer', async ({ responder, sdp }) => {
        const pc = pcMap.current[responder];
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on('ice-candidate', async ({ sender, candidate }) => {
        const pc = pcMap.current[sender];
        if (!pc || !candidate) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate', err);
        }
      });

      socket.on('user-disconnected', id => {
        if (pcMap.current[id]) {
          pcMap.current[id].close();
          delete pcMap.current[id];
        }
        setPeers(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        setUserList(prev => prev.filter(u => u.id !== id));
      });
    };

    joinRoom();
  }, [roomId, userRole]);

  const createPeerConnection = (peerId, isOfferer) => {
    if (pcMap.current[peerId]) return pcMap.current[peerId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pcMap.current[peerId] = pc;

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    const remoteStream = new MediaStream();
    pc.ontrack = ({ track }) => {
      remoteStream.addTrack(track);
    };

    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', { target: peerId, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setPeers(prev => ({ ...prev, [peerId]: remoteStream }));
      }
    };

    if (isOfferer) {
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: peerId, sdp: offer });
      };
    }

    return pc;
  };

  return (
    <div className="flex min-h-screen text-gray-100 bg-gray-900">
      {/* Participants Sidebar */}
      <div className="w-64 p-4 overflow-y-auto bg-gray-800">
        <h2 className="mb-4 text-xl font-bold">Participants ({userList.length})</h2>
        <div className="space-y-4">
          {userList.map(({ id, role }) => (
            <div key={id} className="p-2 bg-gray-700 rounded-lg">
              <div className="text-sm font-medium">
                {role === 'INSTRUCTOR' ? '👨🏫 Instructor' : `👤 Student ${id.slice(0, 5)}`}
              </div>
              {peers[id] && (
                <video
                  ref={video => video && (video.srcObject = peers[id])}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-32 mt-2 rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Video/Whiteboard Area */}
        <div className="relative flex-1 p-4 bg-gray-800">
          {showWhiteboard ? (
            <canvas
              ref={canvasRef}
              width="1280"
              height="720"
              className="w-full h-full bg-white rounded-lg"
            />
          ) : (
            <div className="relative h-full">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted={userRole !== 'INSTRUCTOR'}
                className="object-cover w-full h-full rounded-lg"
              />
              <div className="absolute px-3 py-1 bg-black bg-opacity-50 rounded-lg bottom-4 left-4">
                {userRole} ({isVideoOn ? '📹 On' : '📹 Off'} | {isAudioOn ? '🎙️ On' : '🎙️ Off'})
              </div>
            </div>
          )}
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center justify-center h-20 space-x-6 bg-gray-800">
          <button
            onClick={() => toggleMedia('video')}
            className={`p-3 rounded-full ${isVideoOn ? 'bg-blue-600' : 'bg-red-600'} hover:opacity-80`}
          >
            {isVideoOn ? '📹' : '📷❌'}
          </button>
          
          <button
            onClick={() => toggleMedia('audio')}
            className={`p-3 rounded-full ${isAudioOn ? 'bg-blue-600' : 'bg-red-600'} hover:opacity-80`}
          >
            {isAudioOn ? '🎙️' : '🎤❌'}
          </button>
          
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full ${isSharingScreen ? 'bg-purple-600' : 'bg-blue-600'} hover:opacity-80`}
          >
            🖥️
          </button>
          
          <button
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className={`p-3 rounded-full ${showWhiteboard ? 'bg-green-600' : 'bg-blue-600'} hover:opacity-80`}
          >
            🎨
          </button>
          
          <button
            onClick={handleEndCall}
            className="p-3 bg-red-600 rounded-full hover:opacity-80"
          >
            📞❌
          </button>
        </div>

        {/* Chat Section */}
        <div className="h-64 p-4 bg-gray-800 border-t border-gray-700">
          <div className="mb-2 overflow-y-auto h-44">
            {chat.map((msg, i) => (
              <div key={i} className="mb-2">
                <span className="font-medium text-blue-400">{msg.sender}: </span>
                <span className="text-gray-300">{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg"
              placeholder="Type a message..."
            />
            <button
              onClick={() => {
                setChat([...chat, { sender: userRole, text: message }]);
                setMessage('');
              }}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Whiteboard Controls */}
      {showWhiteboard && (
        <div className="w-64 p-4 bg-gray-800 border-l border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Brush Size</label>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(e.target.value)}
                className="w-full"
              />
            </div>
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }}
              className="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
              Clear Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
}