import { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Phone,
  Hand,
  Upload,
  Clock
} from 'lucide-react';

export const MediaControls = ({
  role,
  onToggleVideo,
  onToggleAudio,
  onScreenShare,
  onEndCall,
  onToggleChat,
  onRaiseHand,
  onStartRecording,
  onStopRecording,
  isRecording,
  onWhiteboardToggle,
  onFileUpload
}) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        onClick={() => {
          setVideoEnabled(!videoEnabled);
          onToggleVideo();
        }}
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        {videoEnabled ? <Video size={20} /> : <VideoOff size={20} className="text-red-400" />}
      </button>

      <button
        onClick={() => {
          setAudioEnabled(!audioEnabled);
          onToggleAudio();
        }}
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        {audioEnabled ? <Mic size={20} /> : <MicOff size={20} className="text-red-400" />}
      </button>

      <button
        onClick={onScreenShare}
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <ScreenShare size={20} />
      </button>

      <button
        onClick={onEndCall}
        className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
      >
        <Phone size={20} />
      </button>

      {role === 'STUDENT' && (
        <button
          onClick={onRaiseHand}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <Hand size={20} />
        </button>
      )}

      <label className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer">
        <Upload size={20} />
        <input type="file" className="hidden" onChange={onFileUpload} />
      </label>

      {role === 'INSTRUCTOR' && (
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <Clock size={20} className={isRecording ? 'text-red-400' : ''} />
        </button>
      )}
    </div>
  );
};
