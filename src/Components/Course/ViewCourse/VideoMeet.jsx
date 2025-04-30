import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getFullDetailsOfCourse } from '../../../Redux/courseSlice';
import { VideoGrid } from './VideoGrid';
import { MediaControls } from './MediaControl';
import { ClassChat } from './classChat';
import { Whiteboard } from './WhitBoard';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { ParticipantList } from './videoParicipents';
import { useMediaStream } from './useMediaStream';
import { useRecording } from './useRecording';
import { useActiveSpeaker } from './useActiveSpeaker';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';

export const VideoMeet = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const localVideoref = useRef(null);
  const peerConnections = useRef(new Map());

  const { role, _id: userId, name: userName } = useSelector((state) => state.auth.data);
  const { FullDetailsOfCourse } = useSelector((state) => state.course);

  const [participants, setParticipants] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [participantListOpen, setParticipantListOpen] = useState(false);
  const [classDuration, setClassDuration] = useState(0);
  const [networkQuality, setNetworkQuality] = useState('good');
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [raisedHands, setRaisedHands] = useState(new Set());

  const { localStream, toggleMedia, screenShare, endCall } = useMediaStream(role);
  const { startRecording, stopRecording, isRecording } = useRecording(localStream);
  const activeSpeaker = useActiveSpeaker(participants);

  useEffect(() => {
    const updatePeerConnections = () => {
      peerConnections.current.forEach(pc => {
        const senders = pc.getSenders();
        localStream?.getTracks().forEach(track => {
          if (!senders.some(s => s.track === track)) {
            pc.addTrack(track, localStream);
          }
        });
      });
    };

    if (localStream) {
      updatePeerConnections();
      const interval = setInterval(updatePeerConnections, 2000);
      return () => clearInterval(interval);
    }
  }, [localStream]);

  useEffect(() => {
    if (!courseId || !userId) return;
  
    socketRef.current =  io(SERVER_URL, {
        auth: {
          courseId,
          userId,  // Send user ID in handshake
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000
      });
    
      
    
      // Handle reconnection events
      socketRef.current.on("user-reconnected", ({ oldSocketId, newSocketId, userId }) => {
        console.log(oldSocketId, newSocketId, userId)
        // Update peer connections
        const oldPeer = peerConnections.current.get(oldSocketId);
        if (oldPeer) {
          oldPeer.close();
          peerConnections.current.delete(oldSocketId);
        }
    
        // Create new connection if needed
        if (!peerConnections.current.has(newSocketId)) {
          const pc = createPeerConnection(newSocketId);
          peerConnections.current.set(newSocketId, pc);
        }
    
        // Update participants list
        setParticipants(prev => prev.map(p => 
          p.userId === userId ? { ...p, id: newSocketId } : p
        ));
      });
  
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });
  
    socketRef.current.on('error', (error) => {
      toast.error(error.message || 'Connection error');
      if (error.message === 'Course access denied') {
        navigate(`/course/${courseId}`);
      }
    });
  
    socketRef.current.on('user-joined', (socketId, userData) => {
      console.log('User joined:', userData);
      setParticipants(prev => [...prev, {
        id: socketId,
        userId: userData.userId,
        name: userData.name,
        role: userData.role,
        stream: null
      }]);
      createPeerConnectionAndSendOffer(socketId);
    });
  
    socketRef.current.on('offer', async (fromId, offer) => {
      console.log(fromId, offer);
      const pc = createPeerConnection(fromId);
      peerConnections.current.set(fromId, pc);
  
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
  
        if (localStream) {
          localStream.getTracks().forEach(track => {
            if (!pc.getSenders().some(s => s.track === track)) {
              pc.addTrack(track, localStream);
            }
          });
        }
  
        socketRef.current.emit('answer', fromId, answer);
      } catch (err) {
        console.error('Offer handling error:', err);
      }
    });
  
    socketRef.current.on('answer', async (fromId, answer) => {
      const pc = peerConnections.current.get(fromId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
  
    socketRef.current.on('ice-candidate', (fromId, candidate) => {
      const pc = peerConnections.current.get(fromId);
      if (pc && candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  
    socketRef.current.on('user-left', (socketId) => {
      const pc = peerConnections.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(socketId);
      }
  
      setParticipants(prev => prev.filter(p => p.id !== socketId));
    });
  
    socketRef.current.on('chat-message', message => {
      setMessages(prev => [...prev, message]);
    });
  
    socketRef.current.on('file-shared', file => {
      setFiles(prev => [...prev, file]);
    });
  
    socketRef.current.on('raise-hand', (socketId, isRaised) => {
      setRaisedHands(prev => {
        const newSet = new Set(prev);
        isRaised ? newSet.add(socketId) : newSet.delete(socketId);
        return newSet;
      });
    });

    const shouldRenegotiate = (userId) => {
        const participant = participants.find(p => p.userId === userId);
        return participant?.role === 'INSTRUCTOR' || activeSpeaker === userId;
      };
  
    // ✅ Handle user reconnection with new socket ID
    socketRef.current.on("user-reconnected", ({ oldSocketId, newSocketId, userId }) => {
        console.log(`♻️ User ${userId} reconnected: ${oldSocketId} → ${newSocketId}`);
      
        // Cleanup old connection with state validation
        const cleanupOldConnection = () => {
          const oldPeer = peerConnections.current.get(oldSocketId);
          if (oldPeer) {
            console.log(`Closing old connection for ${oldSocketId}`);
            try {
              oldPeer.close();
            } catch (err) {
              console.error('Error closing old peer:', err);
            }
            peerConnections.current.delete(oldSocketId);
          }
        };
      
        // Create new connection with error handling
        const establishNewConnection = () => {
          try {
            const newPeer = createPeerConnection(newSocketId);
            peerConnections.current.set(newSocketId, newPeer);
            console.log(`🔄 Created new connection for ${newSocketId}`);
      
            // Update UI state atomically
            setParticipants(prev => prev.map(p => 
              p.userId === userId ? console.log("dfghjmnbvcxcvbnmbvcxvbn bvc xc") : p
            ));
      
            // Initiate renegotiation if needed
            if (shouldRenegotiate(userId)) {
              console.log(`⏳ Initiating renegotiation for ${newSocketId}`);
              createPeerConnectionAndSendOffer(newSocketId);
            }
          } catch (error) {
            console.error('Connection recovery failed:', error);
            toast.error('Failed to re-establish connection');
          }
        };
      
        // Sequence operations safely
        cleanupOldConnection();
        establishNewConnection();
      
        // Update media track subscriptions
        if (localStream) {
          localStream.getTracks().forEach(track => {
            peerConnections.current.get(newSocketId)?.addTrack(track, localStream);
          });
        }
      });

  
    return () => {
      socketRef.current.disconnect();
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
    };
  }, [courseId, userId, localStream]);
  

 

  useEffect(() => {
    if (localStream && localVideoref.current) {
      localVideoref.current.srcObject = localStream;
    }
  }, [localStream]);

  const createPeerConnection = (remoteSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
  
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
  
    console.log('Created peer connection for', remoteSocketId);
  
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit('ice-candidate', remoteSocketId, e.candidate);
      }
    };
  
    pc.onnegotiationneeded = async () => {
      try {
        // Step 1: Set the remote description (make sure this is coming from the signaling server)
        // Assuming you receive the remote description (offer or answer) via socket
        const remoteDescription = await getRemoteDescription(remoteSocketId);
  
        await pc.setRemoteDescription(remoteDescription);
  
        // Step 2: Create a new offer
        const offer = await pc.createOffer();
  
        // Step 3: Set the local description (the offer)
        await pc.setLocalDescription(offer);
  
        // Step 4: Send the offer to the remote peer
        socketRef.current.emit('offer', remoteSocketId, offer);
      } catch (err) {
        console.error('Negotiation error:', err);
      }
    };
  
    // Handling the 'ontrack' event to update participants' streams
    pc.ontrack = (e) => {
      if (e.streams.length > 0) {
        setParticipants(prev =>
          prev.map(p =>
            p.id === remoteSocketId ? { ...p, stream: e.streams[0] } : p
          )
        );
      }
    };
  
    peerConnections.current.set(remoteSocketId, pc);
    return pc;
  };
  
  
  // Helper function to get the remote description (SDP) for the given peer
  const getRemoteDescription = async (remoteSocketId) => {
    // Replace with your signaling code to get the remote SDP (e.g., via socket)
    // Here, we assume you're receiving it via socket or some other method
    return new Promise((resolve, reject) => {
      socketRef.current.emit('get-remote-description', remoteSocketId, (remoteDescription) => {
        if (remoteDescription) {
          resolve(remoteDescription);
        } else {
          reject('Failed to get remote description');
        }
      });
    });
  };
  
  

  const createPeerConnectionAndSendOffer = async (remoteSocketId) => {
    const pc = createPeerConnection(remoteSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current.emit('offer', remoteSocketId, offer);
  };

  const handleRaiseHand = () => {
    const isRaised = !raisedHands.has(socketRef.current.id);
    socketRef.current.emit('raise-hand', isRaised);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file.size > 50 * 1024 * 1024) return toast.error('File too large');

    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      sender: { id: userId, name: userName, role },
      timestamp: new Date(),
      url: URL.createObjectURL(file)
    };

    socketRef.current.emit('share-file', fileData);
    setFiles(prev => [...prev, fileData]);
  };

  const sendMessage = (message) => {
    if (!message.trim()) return;

    const messageData = {
      sender: { id: userId, name: userName, role },
      data: message,
      timestamp: new Date()
    };

    socketRef.current.emit('chat-message', messageData);
    setMessages(prev => [...prev, messageData]);
  };

  return (
    <div className="flex flex-col h-screen text-gray-100 bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{FullDetailsOfCourse?.courseName}</h2>
          <div className="flex items-center space-x-2">
            <NetworkStatusIndicator quality={networkQuality} />
            <span className="px-2 py-1 text-sm bg-gray-700 rounded">
              {new Date(classDuration * 1000).toISOString().substr(11, 8)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setParticipantListOpen(!participantListOpen)}
          className="px-4 py-2 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          Participants ({participants.length + 1})
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <VideoGrid
          participants={participants}
          localStream={localStream}
          activeSpeaker={activeSpeaker}
          raisedHands={raisedHands}
        />

        <div className="fixed w-48 h-32 overflow-hidden border-2 border-white rounded-lg shadow-xl bottom-4 right-4">
          <video className="object-cover w-full h-full" ref={localVideoref} autoPlay muted playsInline />
        </div>
      </div>


      {/* Controls */}
      <div className="flex items-center justify-center p-4 space-x-4 bg-gray-800 border-t border-gray-700">
        <MediaControls
          role={role}
          onToggleVideo={() => toggleMedia('video')}
          onToggleAudio={() => toggleMedia('audio')}
          onScreenShare={screenShare}
          onEndCall={() => {
            endCall();
            navigate(`/course/${courseId}`);
          }}
          onToggleChat={() => setChatOpen(!chatOpen)}
          onRaiseHand={handleRaiseHand}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          isRecording={isRecording}
          onWhiteboardToggle={() => setWhiteboardOpen(!whiteboardOpen)}
          onFileUpload={handleFileUpload}
        />
      </div>

      {/* Chat */}
      {chatOpen && (
        <div className="fixed bg-gray-800 rounded-lg shadow-xl bottom-24 right-4 w-80">
          <ClassChat
            messages={messages}
            files={files}
            onSend={sendMessage}
            onClose={() => setChatOpen(false)}
            onFileUpload={handleFileUpload}
            currentUser={{ id: userId, role }}
          />
        </div>
      )}

      {/* Participant List */}
      {participantListOpen && (
        <div className="fixed w-64 p-4 bg-gray-800 rounded-lg shadow-xl right-4 top-20">
          <ParticipantList
            participants={participants}
            raisedHands={raisedHands}
            onClose={() => setParticipantListOpen(false)}
            isInstructor={role === 'INSTRUCTOR'}
            onMuteParticipant={(socketId) => {
              // implement mute logic
            }}
          />
        </div>
      )}

      {/* Whiteboard */}
      {whiteboardOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
          <div className="w-full h-full max-w-6xl overflow-hidden bg-white rounded-lg">
            <Whiteboard
              isInstructor={role === 'INSTRUCTOR'}
              onClose={() => setWhiteboardOpen(false)}
              socket={socketRef.current}
            />
          </div>
        </div>
      )}
    </div>
  );
};
