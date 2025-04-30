import React, { useEffect, useRef, useState } from 'react';

export const Whiteboard = ({ isInstructor, onClose, socket }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    // Socket listeners
    const handleDrawing = (data) => {
      drawOnCanvas(data);
    };

    if (socket) {
      socket.on('whiteboard-draw', handleDrawing);
    }

    return () => {
      if (socket) {
        socket.off('whiteboard-draw', handleDrawing);
      }
    };
  }, []);

  const startDrawing = (e) => {
    if (!isInstructor) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    draw({ offsetX, offsetY, color });
  };

  const draw = ({ offsetX, offsetY, color }) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (socket) {
      socket.emit('whiteboard-draw', { offsetX, offsetY, color });
    }
  };

  const drawOnCanvas = ({ offsetX, offsetY, color }) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  return (
    <div className="relative w-full h-full bg-white">
      <div className="absolute top-4 left-4 flex space-x-2">
        {isInstructor && (
          <>
            <input 
              type="color" 
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded"
            />
            <button 
              onClick={() => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Clear
            </button>
          </>
        )}
        <button 
          onClick={onClose}
          className="px-3 py-1 bg-gray-700 text-white rounded"
        >
          Close
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={() => setIsDrawing(false)}
        onMouseMove={(e) => isDrawing && startDrawing(e)}
        className="cursor-crosshair"
      />
    </div>
  );
};