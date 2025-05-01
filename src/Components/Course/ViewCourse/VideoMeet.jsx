import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'https://new-mern-backend-cp5h.onrender.com';
const ROOM_ID = 'classroom-101';

export default function LiveClassComponent() {
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
    <div>
      <h1>Live Classroom</h1>
      <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px' }} />
      <div ref={remoteVideoContainerRef} style={{ display: 'flex', flexWrap: 'wrap' }}>
        {usersInRoom.map(userId => (
          <div key={userId} style={{ textAlign: 'center', margin: '10px' }}>
            <div>{userId}</div>
            <video id={userId} autoPlay playsInline style={{ width: '300px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
