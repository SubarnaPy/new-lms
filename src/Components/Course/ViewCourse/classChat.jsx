import React, { useState } from 'react';

export const ClassChat = ({ messages, files, onSend, onClose, onFileUpload, currentUser }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="font-semibold">Class Chat</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
          ×
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg ${
              msg.sender.id === currentUser.id ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {msg.sender.name}
                {msg.sender.role === 'INSTRUCTOR' && (
                  <span className="ml-2 text-blue-300 text-xs">(Host)</span>
                )}
              </span>
              <span className="text-gray-300 text-xs">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1 text-sm">{msg.data}</p>
          </div>
        ))}
        
        {files.map((file, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">{file.name}</span>
              <a 
                href={file.url} 
                download
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};