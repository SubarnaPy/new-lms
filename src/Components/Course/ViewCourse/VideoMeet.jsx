import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const socket = io(SERVER_URL);

export default function LiveClassComponent({ roomId, userRole }) {
  const localVideoRef = useRef();
  const [peers, setPeers] = useState({});
  const [userList, setUserList] = useState([]);
  const localStreamRef = useRef();
  const pcMap = useRef({});

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

  console.log(userList)

  return (
    <div className="flex min-h-screen text-white bg-blue-900">
      {/* Left sidebar - students list */}
      <div className="w-1/5 p-2 space-y-4">
        {userList.map(({ id, role }) => (
          <div
            key={id}
            className="flex items-center justify-between p-2 text-black bg-white rounded-lg shadow-md"
          >
            <span>{role === 'INSTRUCTOR' ? 'Instructor' : `Student (${id.slice(0, 5)})`}</span>
            {userRole === 'INSTRUCTOR' && peers[id] && (
              <video
                ref={video => video && (video.srcObject = peers[id])}
                autoPlay
                playsInline
                muted
                className="w-20 h-16 rounded"
              />
            )}
          </div>
        ))}
      </div>

      {/* Center - main instructor video */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative">
          <video
            ref={userRole === 'INSTRUCTOR' ? localVideoRef : null}
            autoPlay
            playsInline
            muted={userRole !== 'INSTRUCTOR'}
            className="w-[640px] h-[360px] rounded-xl border"
          />
          {userRole !== 'INSTRUCTOR' &&
            Object.entries(peers).length > 0 && (
              <video
                ref={video => video && (video.srcObject = Object.values(peers)[0])}
                autoPlay
                playsInline
                className="absolute inset-0 object-cover w-full h-full rounded-xl"
              />
            )}
          <div className="absolute px-2 py-1 text-white bg-red-600 rounded top-2 left-2">LIVE</div>
        </div>
        <div className="mt-4 flex items-center space-x-2 w-[640px]">
          <input
            className="flex-1 px-4 py-2 text-black rounded-md"
            placeholder="Write comment..."
          />
          <button className="px-4 py-2 bg-green-600 rounded">Share</button>
        </div>
      </div>
    </div>
  );
}