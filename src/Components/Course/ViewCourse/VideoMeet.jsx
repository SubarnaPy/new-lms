import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';

export default function LiveClassComponent({roomId, userRole }) {
  // const { roomId } = useParams();
  // now store objects with id & role
  const [usersInRoom, setUsersInRoom] = useState([]); 
  const localVideoRef = useRef();
  const remoteContainerRef = useRef();
  const peersRef = useRef({});
  const localStreamRef = useRef();

  useEffect(() => {
    if (!roomId) return;
    const socket = io(SERVER_URL);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;

        socket.emit('join-room', roomId, { role: userRole });

        // get everyone else (with roles)
        socket.on('all-users', users => {
          let toConnect;
          if (userRole === 'INSTRUCTOR') {
            toConnect = users; // all peers
          } else {
            // only connect to the instructor
            const instructor = users.find(u => u.role === 'INSTRUCTOR');
            toConnect = instructor ? [instructor] : [];
          }

          // save { id, role } list
          setUsersInRoom(toConnect);

          toConnect.forEach(({ userId, role }) => {
            const pc = createPeerConnection(userId, socket);
            peersRef.current[userId] = pc;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.createOffer().then(offer => {
              pc.setLocalDescription(offer);
              socket.emit('offer', { target: userId, sdp: offer });
            });
          });
        });

        // new peer joined
        socket.on('user-joined', ({ userId, role }) => {
          const shouldSee =
            userRole === 'INSTRUCTOR' || role === 'INSTRUCTOR';
          if (!shouldSee) return;

          setUsersInRoom(prev => [...prev, { userId, role }]);
          const pc = createPeerConnection(userId, socket);
          peersRef.current[userId] = pc;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });

        socket.on('offer', async ({ sdp, caller }) => {
          const pc =
            peersRef.current[caller] ||
            createPeerConnection(caller, socket);
          peersRef.current[caller] = pc;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { target: caller, sdp: answer });
        });

        socket.on('answer', async ({ sdp, responder }) => {
          const pc = peersRef.current[responder];
          if (pc && !pc.remoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          }
        });

        socket.on('ice-candidate', ({ candidate, sender }) => {
          const pc = peersRef.current[sender];
          if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on('user-disconnected', userId => {
          setUsersInRoom(u => u.filter(x => x.userId !== userId));
          if (peersRef.current[userId]) {
            peersRef.current[userId].close();
            delete peersRef.current[userId];
          }
          const vid = document.getElementById(userId);
          if (vid) vid.remove();
        });
      })
      .catch(console.error);

    return () => {
      socket.disconnect();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId, userRole]);

  const createPeerConnection = (userId, socket) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          target: userId,
          candidate: e.candidate
        });
      }
    };

    pc.ontrack = e => {
      let video = document.getElementById(userId);
      if (!video) {
        video = document.createElement('video');
        video.id = userId;
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = '300px';
        video.style.margin = '5px';
        remoteContainerRef.current.appendChild(video);
      }
      video.srcObject = e.streams[0];
    };

    return pc;
  };

  return (
    <div>
      <h1>Live Classroom: {roomId}</h1>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '300px' }}
      />
      <div
        ref={remoteContainerRef}
        style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}
      >
        {usersInRoom.map(({ userId, role }) => (
          <div key={userId} style={{ textAlign: 'center', margin: '10px' }}>
            {/* render the peer’s role */}
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {role}
            </div>
            <video
              id={userId}
              autoPlay
              playsInline
              style={{ width: '300px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
