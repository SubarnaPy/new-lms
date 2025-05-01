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
  const [whiteboardPaths, setWhiteboardPaths] = useState([]);
const [screenSharerId, setScreenSharerId] = useState(null);



  // Whiteboard drawing logic
  useEffect(() => {
    if (!showWhiteboard) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all stored paths
    whiteboardPaths.forEach(path => {
      ctx.beginPath();
      ctx.moveTo(path.startX, path.startY);
      ctx.lineTo(path.endX, path.endY);
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.lineWidth;
      ctx.stroke();
    });
  }, [showWhiteboard, whiteboardPaths]);
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
    const handleWhiteboardDraw = (path) => {
      setWhiteboardPaths(prev => [...prev, path]);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(path.startX, path.startY);
      ctx.lineTo(path.endX, path.endY);
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.lineWidth;
      ctx.stroke();
    };
    const handleWhiteboardClear = () => {
      setWhiteboardPaths([]);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    socket.on('whiteboard-draw', handleWhiteboardDraw);
    socket.on('whiteboard-clear', handleWhiteboardClear);
  
    return () => {
      socket.off('whiteboard-draw', handleWhiteboardDraw);
      socket.off('whiteboard-clear', handleWhiteboardClear);
    };
  }, []);
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      setChat(prev => [...prev, message]);
    };
  
    socket.on('receive-message', handleReceiveMessage);
    return () => socket.off('receive-message', handleReceiveMessage);
  }, []);

  useEffect(() => {
    const handleScreenSharingUpdate = ({ isSharing, sharerId }) => {
      setIsSharingScreen(isSharing);
      setScreenSharerId(sharerId);
    };
  
    socket.on('screen-sharing-update', handleScreenSharingUpdate);
    return () => socket.off('screen-sharing-update', handleScreenSharingUpdate);
  }, []);

  useEffect(() => {
    const handleRoomData = (data) => {
      // Merge new users with existing peers
      setUserList(prevUsers => {
        const newUsers = data.users.filter(newUser => 
          !prevUsers.some(prevUser => prevUser.id === newUser.id)
        );
        
        // Reconnect to all users in the room
        data.users.forEach(({ id }) => {
          if (!pcMap.current[id] && userRole === 'INSTRUCTOR') {
            createPeerConnection(id, true);
          }
        });

        return [...prevUsers.filter(prevUser => 
          data.users.some(newUser => newUser.id === prevUser.id)
        ), ...newUsers];
      });

      // Restore other room state
      setChat(data.chat);
      setWhiteboardPaths(data.whiteboard);
      setScreenSharerId(data.screenSharer);
    };

    socket.on('room-data', handleRoomData);
    return () => socket.off('room-data', handleRoomData);
  }, [userRole]);

  useEffect(() => {
    const handleUserReconnected = (userId) => {
      // Re-establish peer connection if needed
      if (!pcMap.current[userId] && userRole === 'INSTRUCTOR') {
        createPeerConnection(userId, true);
      }
    };

    socket.on('user-reconnected', handleUserReconnected);
    return () => socket.off('user-reconnected', handleUserReconnected);
  }, [userRole]);

  useEffect(() => {
    const joinRoom = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
  
        // Rejoin with existing socket ID if available
        socket.io.opts.query = { previousId: socket.id };
        socket.connect();
        
        socket.emit('join-room', roomId, { role: userRole });
  
      } catch (error) {
        console.error('Media access error:', error);
      }
    };

    joinRoom();
  }, [roomId, userRole]);

  const createPeerConnection = (peerId, isOfferer) => {
    // Reuse or recreate connection with ICE restart
    if (pcMap.current[peerId]) {
      const existingPC = pcMap.current[peerId];
      if (['connected', 'connecting'].includes(existingPC.connectionState)) {
        return existingPC;
      }
      existingPC.close(); // Clean up failed connection
    }
  
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers for production
      ],
      iceTransportPolicy: 'all',
      iceCandidatePoolSize: 10
    });
  
    pcMap.current[peerId] = pc;
  
    // Track connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}: ${pc.connectionState}`);
      switch(pc.connectionState) {
        case 'connected':
          setPeers(prev => ({ ...prev, [peerId]: remoteStream }));
          break;
        case 'disconnected':
        case 'failed':
          setTimeout(() => {
            if (!['connected', 'connecting'].includes(pc.connectionState)) {
              createPeerConnection(peerId, isOfferer);
            }
          }, 2000);
          break;
        case 'closed':
          delete pcMap.current[peerId];
          break;
      }
    };
  
    // Handle ICE candidate events
    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', { 
          target: peerId, 
          candidate: {
            ...e.candidate.toJSON(),
            sdpMid: e.candidate.sdpMid,
            sdpMLineIndex: e.candidate.sdpMLineIndex
          }
        });
      }
    };
  
    // Track media streams
    const remoteStream = new MediaStream();
    pc.ontrack = ({ track, streams }) => {
      track.onunmute = () => {
        remoteStream.addTrack(track);
        setPeers(prev => ({ ...prev, [peerId]: remoteStream }));
      };
    };
  
    // Add local tracks
    const addLocalTracks = () => {
      localStreamRef.current.getTracks().forEach(track => {
        if (!pc.getSenders().some(s => s.track === track)) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    };
    addLocalTracks();
  
    // Negotiation handling
    if (isOfferer) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);
          socket.emit('offer', { 
            target: peerId, 
            sdp: pc.localDescription 
          });
        } catch (err) {
          console.error('Offer creation error:', err);
        }
      };
    }
  
    // ICE restart capability
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce();
      }
    };
  
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
    if (message.trim()) {
      socket.emit('send-message', message.trim());
      setMessage('');
    }
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