import { IconButton, Tooltip, Badge } from '@mui/material';
import { 
  Videocam, VideocamOff, Mic, MicOff, 
  ScreenShare, StopScreenShare, Chat, 
  CallEnd, People, Schedule, PanTool,
  InsertDriveFile, Edit, CloudDownload
} from '@mui/icons-material';

export const VideoControls = ({ 
  role, 
  videoEnabled, 
  audioEnabled, 
  screenSharing,
  newMessages,
  recording,
  raisedHand,
  onToggleVideo,
  onToggleAudio,
  onScreenShare,
  onEndCall,
  onToggleChat,
  onRaiseHand,
  onStartRecording,
  onFileUpload
}) => (
  <div className="controls-bar">
    <div className="left-controls">
      {role === 'INSTRUCTOR' && (
        <>
          <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
            <IconButton className="control-btn" onClick={onToggleVideo}>
              {videoEnabled ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={audioEnabled ? "Mute microphone" : "Unmute microphone"}>
            <IconButton className="control-btn" onClick={onToggleAudio}>
              {audioEnabled ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={screenSharing ? "Stop sharing" : "Share screen"}>
            <IconButton className="control-btn" onClick={onScreenShare}>
              {screenSharing ? <StopScreenShare /> : <ScreenShare />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={recording ? "Stop recording" : "Start recording"}>
            <IconButton className="control-btn" onClick={onStartRecording}>
              <CloudDownload color={recording ? "error" : "inherit"} />
            </IconButton>
          </Tooltip>
        </>
      )}

      {role === 'STUDENT' && (
        <Tooltip title="Raise hand">
          <IconButton className="control-btn" onClick={onRaiseHand} color={raisedHand ? "warning" : "inherit"}>
            <PanTool />
          </IconButton>
        </Tooltip>
      )}
    </div>

    <div className="center-controls">
      <Tooltip title="End call">
        <IconButton className="end-call-btn" onClick={onEndCall}>
          <CallEnd fontSize="large" />
        </IconButton>
      </Tooltip>
    </div>

    <div className="right-controls">
      <input
        accept="*"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={onFileUpload}
      />
      <label htmlFor="file-upload">
        <Tooltip title="Share file">
          <IconButton component="span" className="control-btn">
            <InsertDriveFile />
          </IconButton>
        </Tooltip>
      </label>

      <Badge badgeContent={newMessages} color="error">
        <Tooltip title="Open chat">
          <IconButton className="control-btn" onClick={onToggleChat}>
            <Chat />
          </IconButton>
        </Tooltip>
      </Badge>

      <Tooltip title="Participants">
        <IconButton className="control-btn">
          <People />
        </IconButton>
      </Tooltip>

      <Tooltip title="Whiteboard">
        <IconButton className="control-btn">
          <Edit />
        </IconButton>
      </Tooltip>
    </div>
  </div>
);