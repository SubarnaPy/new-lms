import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export const useMediaStream = (role, userId) => {
  const [localStream, setLocalStream] = useState(null);
  const [mediaState, setMediaState] = useState({ video: true, audio: true });
  const mediaStateRef = useRef(mediaState);

  useEffect(() => {
    mediaStateRef.current = mediaState;
  }, [mediaState]);

  const getMedia = async (constraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return true;
    } catch (error) {
      console.error('Media access error:', error);
      toast.error(`Media access denied: ${error.message}`);
      return false;
    }
  };

  const initializeMedia = async () => {
    const success = await getMedia({
      video: mediaState.video,
      audio: mediaState.audio,
    });
    
    if (!success) {
      setMediaState({ video: false, audio: false });
    }
  };

  const toggleMedia = async (type) => {
    if (role !== 'INSTRUCTOR') return;

    const newState = { ...mediaStateRef.current, [type]: !mediaStateRef.current[type] };
    
    if (localStream) {
      const track = localStream.getTracks().find(t => t.kind === type);
      if (track) track.enabled = newState[type];
    } else {
      const success = await getMedia(newState);
      if (success) setMediaState(newState);
    }
  };

  const retryMedia = async (type) => {
    const constraints = { 
      [type]: true,
      ...(type === 'video' ? { audio: mediaState.audio } : { video: mediaState.video })
    };
    
    const success = await getMedia(constraints);
    if (success) setMediaState(prev => ({ ...prev, [type]: true }));
  };

  const screenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const audioTracks = localStream?.getAudioTracks() || [];
      const newStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioTracks
      ]);

      setLocalStream(newStream);
    } catch (error) {
      toast.error('Screen sharing cancelled');
    }
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setMediaState({ video: false, audio: false });
  };

  useEffect(() => {
    initializeMedia();
    return endCall;
  }, []);

  return {
    localStream,
    toggleMedia,
    retryMedia,
    isVideoOn: mediaState.video,
    isAudioOn: mediaState.audio,
    screenShare,
    endCall
  };
};