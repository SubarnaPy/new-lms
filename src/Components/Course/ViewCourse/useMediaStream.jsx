import { useState, useEffect, useRef } from 'react';

export const useMediaStream = (role) => {
  const [localStream, setLocalStream] = useState(null);
  const [mediaState, setMediaState] = useState({ video: true, audio: true });
  const mediaStateRef = useRef(mediaState); // Prevent stale closure

  // Update ref whenever mediaState changes
  useEffect(() => {
    mediaStateRef.current = mediaState;
  }, [mediaState]);

  // Request media stream based on current state
  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mediaStateRef.current.video,
        audio: mediaStateRef.current.audio,
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      if (error.name === 'NotAllowedError') {
        alert('Permission denied. Please allow access to your camera and microphone.');
      } else if (error.name === 'NotFoundError') {
        alert('No media devices found.');
      } else {
        alert('An unknown error occurred while accessing media devices.');
      }
    }
  };

  // Toggle video or audio track
  const toggleMedia = (type) => {
    if (role !== 'INSTRUCTOR') return;

    setMediaState(prev => {
      const newState = { ...prev, [type]: !prev[type] };

      // Update tracks live without restarting the stream
      if (localStream) {
        const track = type === 'video'
          ? localStream.getVideoTracks()[0]
          : localStream.getAudioTracks()[0];

        if (track) {
          track.enabled = newState[type]; // Toggle track enabled state
        }
      }

      return newState;
    });
  };

  // Start screen sharing
  const screenShare = async () => {
    if (role !== 'INSTRUCTOR') return;

    // Stop any active video track before switching to screen share
    localStream?.getVideoTracks().forEach(track => track.stop());

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setLocalStream(screenStream);  // Update stream with screen share stream
    } catch (error) {
      console.error('Error sharing screen:', error);
      alert('Failed to share screen.');
    }
  };

  // Log local stream (for debugging purposes)
  console.log(localStream);

  // Initial media fetch on mount
  useEffect(() => {
    getMedia();

    return () => {
      // Clean up all tracks when the component unmounts or stream changes
      localStream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { localStream, toggleMedia, screenShare };
};
