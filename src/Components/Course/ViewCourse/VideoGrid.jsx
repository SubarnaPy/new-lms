import React, { useEffect } from 'react';

export const VideoGrid = ({ participants, localStream, activeSpeaker, raisedHands }) => {
  const instructor = participants.find(p => p.role === 'INSTRUCTOR');
  const others = participants.filter(p => p.role !== 'INSTRUCTOR');

  
console.log(others)
  console.log(instructor)

  useEffect(() => {
    if (instructor && instructor.stream) {
      console.log('Instructor Stream:', instructor.stream);
    }
  }, [instructor]);

  return (
    <div className="flex flex-col h-full">
      {instructor && instructor.stream ? (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={ref => ref && (ref.srcObject = instructor.stream)}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {instructor.name}
                <span className="ml-2 text-blue-400 text-xs">(Host)</span>
              </span>
              <div className="flex space-x-2">
                {!instructor.audio && <span className="text-red-400">🎤</span>}
                {raisedHands?.has(instructor.id) && <span className="text-yellow-400">✋</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white text-center p-4">Instructor video is not available</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-auto flex-1">
        {others.map((participant) => (
          <div
            key={participant.id}
            className={`relative aspect-video bg-gray-800 rounded-lg overflow-hidden ${
              activeSpeaker === participant.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <video
              ref={ref => ref && (ref.srcObject = participant.stream)}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {participant.name}
                </span>
                <div className="flex space-x-2">
                  {!participant.audio && <span className="text-red-400">🎤</span>}
                  {raisedHands?.has(participant.id) && <span className="text-yellow-400">✋</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Local preview (bottom-right) */}
      <div className="fixed bottom-4 right-4 w-48 h-32 rounded-lg overflow-hidden border-2 border-white shadow-xl z-50">
        <video
          ref={ref => ref && (ref.srcObject = localStream)}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
