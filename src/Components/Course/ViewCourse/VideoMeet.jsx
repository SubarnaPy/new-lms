// import React, { useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { getFullDetailsOfCourse } from '../../../Redux/courseSlice';
// import { VideoGrid } from './VideoGrid';
// import { MediaControls } from './MediaControl';
// import { ClassChat } from './classChat';
// import { Whiteboard } from './WhitBoard';
// import { NetworkStatusIndicator } from './NetworkStatusIndicator';
// import { ParticipantList } from './videoParicipents';
// import { useMediaStream } from './useMediaStream';
// import { useRecording } from './useRecording';
// import { useActiveSpeaker } from './useActiveSpeaker';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { VideoGrid } from './VideoGrid';
import { MediaControls } from './MediaControl';
import { ClassChat } from './classChat';
import { Whiteboard } from './Whiteboard';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { ParticipantList } from './ParticipantList';
import { useMediaStream } from './useMediaStream';
import { useRecording } from './useRecording';
import { useActiveSpeaker } from './useActiveSpeaker';

// const SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL;

const VideoMeet = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());
  const reconnectAttempts = useRef(0);

  const { role, _id: userId, name: userName } = useSelector((state) => state.auth.data);
  const [state, setState] = useState({
    participants: [],
    messages: [],
    files: [],
    raisedHands: new Set(),
    isChatOpen: false,
    isWhiteboardOpen: false,
    isParticipantListOpen: false,
    networkQuality: 'good',
    classDuration: 0,
  });

  const { 
    localStream, 
    toggleMedia, 
    retryMedia,
    isVideoOn, 
    isAudioOn, 
    screenShare, 
    endCall 
  } = useMediaStream(role, userId);
  
  const { startRecording, stopRecording, isRecording } = useRecording(localStream);
  const activeSpeaker = useActiveSpeaker(state.participants);

  // Socket.io connection management
  useEffect(() => {
    const connectToSocket = async () => {
      try {
        socketRef.current = io(SERVER_URL, {
          auth: {
            courseId,
            userId,
            token: localStorage.getItem('token'),
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
          transports: ['websocket'],
        });

        setupSocketListeners();
      } catch (error) {
        handleConnectionError(error);
      }
    };

    if (courseId && userId) connectToSocket();
    return () => cleanupConnection();
  }, [courseId, userId]);

  // Media stream handling
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      updatePeerConnections();
    }
  }, [localStream]);

  const setupSocketListeners = () => {
    const socket = socketRef.current;

    socket.on('connect', () => {
      reconnectAttempts.current = 0;
      toast.success('Connected to meeting');
    });

    socket.on('participants', handleParticipantsUpdate);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('chat-message', handleNewMessage);
    socket.on('file-shared', handleFileShared);
    socket.on('raise-hand', handleRaiseHand);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('connect_error', handleConnectionError);
  };

  const handleParticipantsUpdate = (participants) => {
    setState(prev => ({
      ...prev,
      participants: participants.map(user => ({
        userId: user.userId,
        name: user.name,
        role: user.role,
        stream: null,
      })),
    }));

    participants
      .filter(user => user.userId !== userId)
      .forEach(user => createPeerConnection(user.userId));
  };

  const handleUserJoined = (userData) => {
    setState(prev => ({
      ...prev,
      participants: [...prev.participants, {
        userId: userData.userId,
        name: userData.name,
        role: userData.role,
        stream: null,
      }],
    }));
    createPeerConnection(userData.userId);
  };

  const createPeerConnection = async (userId) => {
    if (peerConnections.current.has(userId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:your-turn-server.com:3478',
          username: 'your-username',
          credential: 'your-password'
        }
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit('ice-candidate', userId, e.candidate);
      }
    };

    pc.ontrack = (e) => {
      handleRemoteTrack(userId, e.streams[0]);
    };

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('offer', userId, offer);
      } catch (error) {
        console.error('Negotiation error:', error);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    peerConnections.current.set(userId, pc);
  };

  const handleRemoteTrack = (userId, stream) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.userId === userId ? { ...p, stream } : p
      ),
    }));
  };

  const handleOffer = async (fromUserId, offer) => {
    const pc = await createPeerConnection(fromUserId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current.emit('answer', fromUserId, answer);
  };

  const handleAnswer = async (fromUserId, answer) => {
    const pc = peerConnections.current.get(fromUserId);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = (fromUserId, candidate) => {
    const pc = peerConnections.current.get(fromUserId);
    if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleUserLeft = (leftUserId) => {
    const pc = peerConnections.current.get(leftUserId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(leftUserId);
    }
    setState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.userId !== leftUserId),
    }));
  };

  const updatePeerConnections = () => {
    peerConnections.current.forEach(pc => {
      const senders = pc.getSenders();
      localStream?.getTracks().forEach(track => {
        const sender = senders.find(s => s.track?.kind === track.kind);
        sender ? sender.replaceTrack(track) : pc.addTrack(track, localStream);
      });
    });
  };

  const handleRaiseHand = (userId, isRaised) => {
    setState(prev => ({
      ...prev,
      raisedHands: new Set(
        isRaised
          ? [...prev.raisedHands, userId]
          : [...prev.raisedHands].filter(id => id !== userId)
      )
    }));
  };

  const handleNewMessage = (message) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
  };

  const handleFileShared = (file) => {
    setState(prev => ({ ...prev, files: [...prev.files, file] }));
  };

  const handleSocketDisconnect = (reason) => {
    if (reason === 'io server disconnect') {
      socketRef.current.connect();
    }
    toast.error('Disconnected from server. Reconnecting...');
  };

  const handleConnectionError = (error) => {
    if (reconnectAttempts.current++ > 5) {
      toast.error('Failed to connect. Please check your network.');
      navigate(`/course/${courseId}`);
    }
  };

  const cleanupConnection = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  const sendMessage = (message) => {
    if (!message.trim()) return;

    const messageData = {
      sender: { userId, name: userName, role },
      content: message,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('chat-message', messageData);
  };

  const handleFileUpload = async (file) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit');
      return;
    }

    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      sender: { userId, name: userName, role },
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('share-file', fileData);
  };

  // Network quality monitoring
  useEffect(() => {
    const handleNetworkChange = () => {
      const connection = navigator.connection;
      if (connection) {
        const quality = connection.downlink > 1 ? 'good' : 
                       connection.downlink > 0.5 ? 'fair' : 'poor';
        setState(prev => ({ ...prev, networkQuality: quality }));
      }
    };

    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleNetworkChange);
    }
    return () => {
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleNetworkChange);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen text-gray-100 bg-gray-900">
      {/* Top Header */}
      <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">
            {courseId} - Video Meeting
          </h1>
          <NetworkStatusIndicator quality={state.networkQuality} />
          <span className="px-3 py-1 text-sm bg-gray-700 rounded-lg">
            Participants: {state.participants.length + 1}
          </span>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setState(prev => ({ ...prev, isParticipantListOpen: !prev.isParticipantListOpen }))}
            className="px-4 py-2 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Participants
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-hidden">
        <VideoGrid
          participants={state.participants}
          localStream={localStream}
          activeSpeaker={activeSpeaker}
          raisedHands={state.raisedHands}
        />

        {/* Local Video Preview */}
        <div className="fixed w-48 h-32 overflow-hidden border-2 border-white rounded-lg shadow-xl bottom-4 right-4">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="object-cover w-full h-full"
          />
        </div>
      </main>

      {/* Media Controls */}
      <footer className="p-4 bg-gray-800 border-t border-gray-700">
        <MediaControls
          isVideoOn={isVideoOn}
          isAudioOn={isAudioOn}
          isRecording={isRecording}
          showVideoRetry={!isVideoOn}
          showAudioRetry={!isAudioOn}
          onToggleVideo={() => toggleMedia('video')}
          onToggleAudio={() => toggleMedia('audio')}
          onRetryVideo={() => retryMedia('video')}
          onRetryAudio={() => retryMedia('audio')}
          onScreenShare={screenShare}
          onEndCall={() => {
            endCall();
            navigate(`/course/${courseId}`);
          }}
          onToggleChat={() => setState(prev => ({ ...prev, isChatOpen: !prev.isChatOpen }))}
          onRaiseHand={() => socketRef.current.emit('raise-hand', !state.raisedHands.has(userId))}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onWhiteboardToggle={() => setState(prev => ({ ...prev, isWhiteboardOpen: !prev.isWhiteboardOpen }))}
          onFileUpload={handleFileUpload}
        />
      </footer>

      {/* Overlay Components */}
      <ClassChat
        isOpen={state.isChatOpen}
        messages={state.messages}
        files={state.files}
        onClose={() => setState(prev => ({ ...prev, isChatOpen: false }))}
        onSend={sendMessage}
        onFileUpload={handleFileUpload}
      />

      <ParticipantList
        isOpen={state.isParticipantListOpen}
        participants={state.participants}
        raisedHands={state.raisedHands}
        onClose={() => setState(prev => ({ ...prev, isParticipantListOpen: false }))}
        isInstructor={role === 'INSTRUCTOR'}
      />

      <Whiteboard
        isOpen={state.isWhiteboardOpen}
        onClose={() => setState(prev => ({ ...prev, isWhiteboardOpen: false }))}
        isInstructor={role === 'INSTRUCTOR'}
        socket={socketRef.current}
      />
    </div>
  );
};

export default VideoMeet;