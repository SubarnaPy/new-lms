import { useState, useEffect } from 'react';

export const useActiveSpeaker = (participants) => {
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  useEffect(() => {
    // Implement audio analysis logic here
    // This is a placeholder implementation
    const interval = setInterval(() => {
      if (participants.length > 0) {
        const randomSpeaker = participants[Math.floor(Math.random() * participants.length)].id;
        setActiveSpeaker(randomSpeaker);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [participants]);

  return activeSpeaker;
};