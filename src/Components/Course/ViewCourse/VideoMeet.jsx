import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import {
  Badge, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, List, ListItem,
  ListItemText, Typography
} from '@mui/material';
import {
  Videocam, VideocamOff, Mic, MicOff, Chat, CallEnd, Person, RaiseHand,
  RecordVoiceOver
} from '@mui/icons-material';
import styles from "../styles/videoComponent.module.css";
import server from '../environment';

const server_url = server;
const peerConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function LiveClassComponent({ userRole }) {
  const socketRef = useRef();
  const localVideoRef = useRef();
  const whiteboardCanvasRef = useRef();
  const [chatInput, setChatInput] = useState("");
  const [mediaState, setMediaState] = useState({
    video: true,
    audio: true
  });
  const [classState, setClassState] = useState({
    participants: [],
    raisedHands: [],
    messages: [],
    isRecording: false,
    whiteboardData: []
  });
  const [uiState, setUiState] = useState({
    showChat: false,
    newMessages: 0,
    isDrawing: false
  });
  const connections = useRef({});
  const [whiteboardColor, setWhiteboardColor] = useState('#000000');
  const [whiteboardSize, setWhiteboardSize] = useState(5);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: mediaState.video,
          audio: mediaState.audio
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setupSocketConnection(stream);
      } catch (error) {
        console.error('Media access error:', error);
      }
    };

    initMedia();
    return () => cleanup();
  }, []);

  const setupSocketConnection = (stream) => {
    socketRef.current = io(server_url, {
      auth: { token: localStorage.getItem('lmsToken') }
    });

    socketRef.current.on('connect', () => {
      if (userRole === 'teacher') {
        socketRef.current.emit('create-class', {
          subject: 'Live Class',
          teacherId: localStorage.getItem('userId')
        });
      } else {
        socketRef.current.emit('join-class', window.location.pathname.split('/').pop());
      }
    });

    socketRef.current.on('class-state', handleClassStateUpdate);
    socketRef.current.on('participant-update', updateParticipants);
    socketRef.current.on('whiteboard-update', updateWhiteboard);
    socketRef.current.on('chat-message', handleNewMessage);
    socketRef.current.on('hand-raised', handleRaisedHand);
    socketRef.current.on('recording-state', handleRecordingState);
    socketRef.current.on('force-mute', handleForceMute);
  };

  const handleClassStateUpdate = (data) => {
    setClassState(prev => ({ ...prev, ...data }));
  };

  const updateParticipants = (participants) => {
    setClassState(prev => ({ ...prev, participants }));
  };

  const updateWhiteboard = (dataUrl) => {
    const canvas = whiteboardCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => ctx.drawImage(img, 0, 0);
  };

  const handleNewMessage = (msg) => {
    setClassState(prev => ({
      ...prev,
      messages: [...prev.messages, msg]
    }));
    setUiState(prev => ({
      ...prev,
      newMessages: prev.showChat ? 0 : prev.newMessages + 1
    }));
  };

  const handleRaisedHand = (userId) => {
    setClassState(prev => ({
      ...prev,
      raisedHands: [...new Set([...prev.raisedHands, userId])]
    }));
  };

  const handleRecordingState = (state) => {
    setClassState(prev => ({ ...prev, isRecording: state }));
  };

  const handleForceMute = () => {
    setMediaState(prev => ({ ...prev, audio: false }));
    updateMediaTracks('audio');
  };

  const toggleMedia = (type) => {
    const newState = { ...mediaState, [type]: !mediaState[type] };
    setMediaState(newState);
    updateMediaTracks(type);
  };

  const updateMediaTracks = (type) => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => {
        if (track.kind === type) track.enabled = !track.enabled;
      });
    }
  };

  const raiseHand = () => {
    socketRef.current.emit('raise-hand');
  };

  const toggleRecording = () => {
    if (userRole === 'teacher') {
      socketRef.current.emit('toggle-recording');
    }
  };

  const endClass = () => {
    if (userRole === 'teacher') {
      socketRef.current.emit('end-class');
    }
    window.location.href = '/lms/dashboard';
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      socketRef.current.emit('chat-message', {
        sender: localStorage.getItem('userName'),
        content: chatInput.trim()
      });
      setChatInput('');
    }
  };

  const cleanup = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    Object.values(connections.current).forEach(pc => pc.close());
    socketRef.current?.disconnect();
  };

  useEffect(() => {
    if (userRole === 'teacher') {
      initWhiteboard();
    }
  }, [whiteboardColor, whiteboardSize]);

  const initWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    ctx.strokeStyle = whiteboardColor;
    ctx.lineWidth = whiteboardSize;
    ctx.lineCap = 'round';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const draw = (e) => {
      if (!isDrawing) return;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];

      const dataUrl = canvas.toDataURL();
      socketRef.current.emit('whiteboard-update', dataUrl);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
  };

  return (
    <div className={styles.liveClassContainer}>
      <div className={styles.videoGrid}>
        <video ref={localVideoRef} autoPlay muted className={styles.localVideo} />
        {classState.participants.map(p => (
          <video
            key={p.id}
            autoPlay
            ref={ref => {
              if (ref && p.stream) ref.srcObject = p.stream;
            }}
            className={styles.remoteVideo}
          />
        ))}
      </div>

      <div className={styles.controlBar}>
        <IconButton onClick={() => toggleMedia('video')}>
          {mediaState.video ? <Videocam /> : <VideocamOff />}
        </IconButton>
        <IconButton onClick={() => toggleMedia('audio')}>
          {mediaState.audio ? <Mic /> : <MicOff />}
        </IconButton>
        <IconButton onClick={raiseHand}>
          <RaiseHand />
        </IconButton>

        {userRole === 'teacher' && (
          <>
            <IconButton onClick={toggleRecording} color={classState.isRecording ? 'secondary' : 'default'}>
              <RecordVoiceOver />
            </IconButton>
            <Button variant="contained" color="error" onClick={endClass}>
              End Class
            </Button>
          </>
        )}

        <IconButton onClick={() => setUiState(prev => ({ ...prev, showChat: !prev.showChat, newMessages: 0 }))}>
          <Badge badgeContent={uiState.newMessages} color="secondary">
            <Chat />
          </Badge>
        </IconButton>
      </div>

      <div className={styles.sidebar}>
        <Typography variant="h6">Participants</Typography>
        <List>
          {classState.participants.map(p => (
            <ListItem key={p.id}>
              <Person />
              <ListItemText primary={p.name || 'Anonymous'} secondary={p.isTeacher ? 'Teacher' : 'Student'} />
              {classState.raisedHands.includes(p.id) && <RaiseHand color="action" />}
            </ListItem>
          ))}
        </List>

        {userRole === 'teacher' && (
          <div className={styles.whiteboardContainer}>
            <Typography variant="h6">Whiteboard</Typography>
            <canvas ref={whiteboardCanvasRef} />
            <div className={styles.whiteboardControls}>
              <input type="color" value={whiteboardColor} onChange={(e) => setWhiteboardColor(e.target.value)} />
              <input type="range" min="1" max="20" value={whiteboardSize}
                onChange={(e) => setWhiteboardSize(Number(e.target.value))} />
            </div>
          </div>
        )}
      </div>

      <Dialog open={uiState.showChat} onClose={() => setUiState(prev => ({ ...prev, showChat: false }))}>
        <DialogTitle>Class Chat</DialogTitle>
        <DialogContent>
          <div className={styles.chatMessages}>
            {classState.messages.map((msg, index) => (
              <div key={index} className={styles.chatMessage}>
                <Typography variant="subtitle2">{msg.sender}</Typography>
                <Typography variant="body1">{msg.content}</Typography>
              </div>
            ))}
          </div>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
