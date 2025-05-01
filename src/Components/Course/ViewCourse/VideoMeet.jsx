import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  ArrowUpTrayIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
];

export default function LiveClassComponent({ roomId, userRole }) {
  const [socket, setSocket] = useState(null);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [currentUserId, setCurrentUserId] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const localVideoRef = useRef();
  const peersRef = useRef({});
  const chatContainerRef = useRef();

  const getPeerConfiguration = () => ({
    iceServers: ICE_SERVERS,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  });

  // Initialize local media
  useEffect(() => {
    const initializeMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Failed to access camera and microphone. Please check permissions.');
      }
    };

    initializeMediaStream();
  }, []);

  // Setup Socket.IO and WebRTC signaling
  useEffect(() => {
    if (!localStream) return;

    const socketConnection = io(SERVER_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      setCurrentUserId(socketConnection.id);
      socketConnection.emit('join-room', roomId);
    });

    socketConnection.on('all-users', handleUsersInRoom);
    socketConnection.on('user-joined', handleUserJoined);
    socketConnection.on('user-disconnected', handleUserDisconnected);
    socketConnection.on('offer', handleOffer);
    socketConnection.on('answer', handleAnswer);
    socketConnection.on('ice-candidate', handleICECandidate);
    socketConnection.on('chat-message', handleChatMessage);

    return () => {
      socketConnection.disconnect();
      localStream.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, [localStream]);

  const handleUsersInRoom = (users) => {
    setUsersInRoom(users.filter(id => id !== currentUserId));
    users.forEach(userId => {
      if (userId !== currentUserId && !peersRef.current[userId]) {
        createPeerConnection(userId);
      }
    });
  };

  const handleUserJoined = (userId) => {
    if (userId === currentUserId) return;
    setUsersInRoom(prev => [...prev, userId]);
    createPeerConnection(userId);
  };

  const handleUserDisconnected = (userId) => {
    setUsersInRoom(prev => prev.filter(id => id !== userId));
    if (peersRef.current[userId]) {
      peersRef.current[userId].close();
      delete peersRef.current[userId];
    }
    setRemoteStreams(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection(getPeerConfiguration());
    peersRef.current[userId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { target: userId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [userId]: event.streams[0] }));
    };

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    if (userRole === 'INSTRUCTOR') {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit('offer', { target: userId, sdp: pc.localDescription });
        });
    }

    return pc;
  };

  const handleOffer = async ({ sdp, caller }) => {
    const pc = peersRef.current[caller] || createPeerConnection(caller);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', { target: caller, sdp: pc.localDescription });
  };

  const handleAnswer = async ({ sdp, responder }) => {
    const pc = peersRef.current[responder];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleICECandidate = ({ candidate, sender }) => {
    const pc = peersRef.current[sender];
    if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleChatMessage = (message) => {
    setChatMessages(prev => [...prev, message]);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const message = { text: newMessage, sender: currentUserId, timestamp: new Date().toISOString() };
    socket.emit('chat-message', message);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
          <div className="flex items-center space-x-4">
            <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {userRole === 'INSTRUCTOR' ? 'Teaching' : 'Attending'} - Room {roomId}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full ${
              userRole === 'teacher' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
            }`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
        </div>
      </header>

      <div className="flex gap-6 px-4 py-6 mx-auto max-w-7xl">
        {/* Sidebar */}
        <div className="flex flex-col w-64 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-2 text-lg font-semibold">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Participants ({usersInRoom.length + 1})
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center text-sm font-medium">
                <span className="truncate">{currentUserId} (You)</span>
              </li>
              {usersInRoom.map(id => (
                <li key={id} className="flex items-center text-sm">
                  <span className="truncate">{id}</span>
                </li>
              ))}
            </ul>
          </div>

          {userRole === 'INSTRUCTOR' && (
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-2 text-lg font-semibold">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Class Materials
              </h2>
              <button className="flex items-center justify-center w-full p-2 mb-3 text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Upload File
              </button>
              <div className="space-y-2">
                {/* List uploaded files here */}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 gap-6">
          {/* Video Grid */}
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center text-lg font-semibold">
                <VideoCameraIcon className="w-5 h-5 mr-2" /> Live Stream
              </h2>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <SpeakerWaveIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Local Video */}
              <div className={`relative overflow-hidden bg-gray-800 rounded-lg aspect-video ${
                userRole === 'INSTRUCTOR' ? 'md:col-span-2 md:row-span-2' : ''
              }`}>
                <video ref={localVideoRef} autoPlay muted playsInline className="object-cover w-full h-full" />
                <span className="absolute px-2 py-1 text-sm text-white rounded bottom-2 left-2 bg-black/50">
                  {userRole === 'INSTRUCTOR' ? 'Your Broadcast' : 'Main Stream'}
                </span>
              </div>

              {/* Remote Videos */}
              <div id="remote-videos-container" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                {Object.entries(remoteStreams).map(([id, stream]) => (
                  <div key={id} className="relative overflow-hidden bg-gray-800 rounded-lg aspect-video">
                    <video
                      autoPlay
                      playsInline
                      ref={el => { if (el) el.srcObject = stream; }}
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute px-2 py-1 text-sm text-white rounded bottom-2 left-2 bg-black/50">
                      {id === currentUserId ? 'You' : id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-4 text-lg font-semibold">
              <ChatBubbleLeftIcon className="w-5 h-5 mr-2" /> Class Chat
            </h2>
            <div ref={chatContainerRef} className="h-48 mb-4 space-y-3 overflow-y-auto">
              {chatMessages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 rounded-lg max-w-[75%] ${
                    message.sender === currentUserId ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
