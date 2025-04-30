export const ParticipantList = ({ participants, raisedHands, onClose, isInstructor, onMuteParticipant }) => {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Participants</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            ×
          </button>
        </div>
        <ul className="space-y-2">
          {participants.map((participant) => (
            <li 
              key={participant.id}
              className="flex items-center justify-between p-2 bg-gray-700 rounded"
            >
              <div className="flex items-center space-x-2">
                <span>{participant.name}</span>
                {participant.role === 'INSTRUCTOR' && (
                  <span className="text-blue-400 text-xs">(Host)</span>
                )}
                {raisedHands?.has(participant.id) && (
                  <span className="text-yellow-400">✋</span>
                )}
              </div>
              {isInstructor && participant.role !== 'INSTRUCTOR' && (
                <button 
                  onClick={() => onMuteParticipant(participant.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Mute
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };