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


export default function LiveClassComponent({ roomId, userRole }) {
  const ROOM_ID = roomId;

  const [socket, setSocket] = useState(null);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const localVideoRef = useRef();
  const remoteVideoContainerRef = useRef();
  const peersRef = useRef({});
  const localStreamRef = useRef();

  useEffect(() => {
    const socketConnection = io(SERVER_URL);
    setSocket(socketConnection);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;

      socketConnection.emit('join-room', ROOM_ID);

      socketConnection.on('all-users', (users) => {
        console.log(`Users in room ${ROOM_ID}:`, users); // Log all users in the room
        setUsersInRoom(users); // Set users in room state

        users.forEach(userId => {
          const pc = createPeerConnection(userId, socketConnection);
          peersRef.current[userId] = pc;

          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            socketConnection.emit('offer', {
              target: userId,
              sdp: offer,
            });
          });
        });
      });

      socketConnection.on('user-joined', (userId) => {
        console.log(`User joined: ${userId}`); // Log when a new user joins
        setUsersInRoom(prevUsers => [...prevUsers, userId]); // Add new user to the list
        const pc = createPeerConnection(userId, socketConnection);
        peersRef.current[userId] = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      });

      socketConnection.on('offer', async ({ sdp, caller }) => {
        let pc = peersRef.current[caller];
        if (!pc) {
          pc = createPeerConnection(caller, socketConnection);
          peersRef.current[caller] = pc;

          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }

        if (pc.signalingState !== 'stable') return;

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketConnection.emit('answer', {
          target: caller,
          sdp: answer,
        });
      });

      socketConnection.on('answer', async ({ sdp, responder }) => {
        const pc = peersRef.current[responder];
        if (pc && pc.remoteDescription === null) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      });

      socketConnection.on('ice-candidate', ({ candidate, sender }) => {
        const pc = peersRef.current[sender];
        if (pc) {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
        }
      });

      socketConnection.on('user-disconnected', (userId) => {
        console.log(`User disconnected: ${userId}`); // Log when a user disconnects
        setUsersInRoom(prevUsers => prevUsers.filter(user => user !== userId)); // Remove user from the list
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }

        const video = document.getElementById(userId);
        if (video) video.remove();

        // Log the remaining users in the room
        console.log(`Users in room ${ROOM_ID} after disconnection:`, Object.keys(peersRef.current));
      });
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const createPeerConnection = (userId, socket) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // Google's public STUN server
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      let remoteVideo = document.getElementById(userId);
      if (!remoteVideo) {
        remoteVideo = document.createElement('video');
        remoteVideo.id = userId;
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.style.width = '300px';
        remoteVideo.style.margin = '5px';
        remoteVideoContainerRef.current.appendChild(remoteVideo);
      }
      remoteVideo.srcObject = event.streams[0];
    };

    return pc;
  };

  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Classroom Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
          <div className="flex items-center space-x-4">
            <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Live Classroom - {roomId}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full ${userRole === 'teacher' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
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
              Participants
            </h2>
            <ul className="space-y-2">
              {usersInRoom.map(userId => (
                <li key={userId} className="flex items-center text-sm">
                  <span className="truncate">{userId}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-2 text-lg font-semibold">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Materials
            </h2>
            {userRole === 'teacher' && (
              <button className="flex items-center justify-center w-full p-2 mb-3 text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Upload File
              </button>
            )}
            <div className="space-y-2">
              {/* Sample materials */}
              <div className="p-2 text-sm rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                Lecture Notes.pdf
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 gap-6">
          {/* Video Section */}
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center text-lg font-semibold">
                <VideoCameraIcon className="w-5 h-5 mr-2" />
                Live Class
              </h2>
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <SpeakerWaveIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Teacher Video - Larger if teacher */}
              <div className={`${userRole === 'teacher' ? 'col-span-2 row-span-2' : ''}`}>
                <div className="relative overflow-hidden bg-gray-800 rounded-lg aspect-video">
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="object-cover w-full h-full"
                  />
                  <span className="absolute px-2 py-1 text-sm text-white rounded bottom-2 left-2 bg-black/50">
                    {userRole === 'teacher' ? 'You (Teacher)' : 'Teacher'}
                  </span>
                </div>
              </div>

              {/* Students Videos */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {usersInRoom.map(userId => (
                  userRole === 'student' && (
                    <div key={userId} className="relative overflow-hidden bg-gray-800 rounded-lg aspect-video">
                      <video 
                        id={userId}
                        autoPlay 
                        playsInline 
                        className="object-cover w-full h-full"
                      />
                      <span className="absolute px-2 py-1 text-sm text-white rounded bottom-2 left-2 bg-black/50">
                        {userId}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-4 text-lg font-semibold">
              <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
              Class Chat
            </h2>
            <div className="h-48 mb-4 space-y-3 overflow-y-auto">
              {/* Sample messages */}
              <div className="flex justify-end">
                <div className="bg-indigo-100 p-3 rounded-lg max-w-[70%]">
                  <p className="text-sm">Hello everyone!</p>
                  <span className="text-xs text-gray-500">10:30 AM</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
