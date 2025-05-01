import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:5001';
const ROOM_ID = 'classroom-101';

export default function LiveClassComponent({ userRole }) {
  const [socket, setSocket] = useState(null);
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
        const pc = createPeerConnection(userId, socketConnection);
        peersRef.current[userId] = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      });

      socketConnection.on('offer', async ({ sdp, caller }) => {
        const pc = createPeerConnection(caller, socketConnection);
        peersRef.current[caller] = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketConnection.emit('answer', {
          target: caller,
          sdp: answer,
        });
      });

      socketConnection.on('answer', async ({ sdp, responder }) => {
        await peersRef.current[responder]?.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socketConnection.on('ice-candidate', ({ candidate, sender }) => {
        peersRef.current[sender]?.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socketConnection.on('user-disconnected', (userId) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }

        const video = document.getElementById(userId);
        if (video) video.remove();
      });
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const createPeerConnection = (userId, socket) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

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
        remoteVideoContainerRef.current.appendChild(remoteVideo);
      }
      remoteVideo.srcObject = event.streams[0];
    };

    return pc;
  };

  return (
    <div>
      <h1>Multi-User Video Chat</h1>
      <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px' }} />
      <div ref={remoteVideoContainerRef} />
    </div>
  );
}

// export default App;
