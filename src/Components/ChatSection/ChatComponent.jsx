import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  FaPaperclip,
  FaPaperPlane,
  FaEllipsisV,
  FaDownload,
  FaTimes,
  FaReply,
  FaMicrophone,
  FaStopCircle,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Helpers/axiosInstance";

const ChatComponent = ({ courseId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch chat history and set up socket connection
  useEffect(() => {
    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    socketRef.current = io("https://new-mern-backend-cp5h.onrender.com", {
      auth: { token },
    });

    socketRef.current.emit("joinCourse", courseId);

    const fetchChatHistory = async () => {
      try {
        const response = await axiosInstance.get(
          `/chat/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching chat:", error);
        setError("Failed to fetch chat history.");
      }
    };

    fetchChatHistory();

    socketRef.current.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [courseId, token]);

  // Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Failed to start recording.");
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send message (text, file, or audio)
  const sendMessage = async () => {
    if (!message.trim() && !file && !audioBlob) return;

    setLoading(true);
    setError(null);

    try {
      let fileUrl = null;
      if (file || audioBlob) {
        const formData = new FormData();
        if (file) {
          formData.append("file", file);
        } else if (audioBlob) {
          formData.append("file", audioBlob, "audio.wav");
        }

        const uploadResponse = await axios.post(
          "http://localhost:5001/api/v1/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        fileUrl = uploadResponse.data.fileUrl;
      }

      const newMessage = {
        courseId,
        userId,
        message,
        fileUrl,
        replyTo: replyingTo ? replyingTo._id : null,
      };

      socketRef.current.emit("sendMessage", newMessage);

      setMessage("");
      setFile(null);
      setAudioBlob(null);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reply to a message
  const handleReply = (message) => {
    setReplyingTo(message);
  };

  // Scroll to a specific message
  const scrollToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Custom audio player component
  const VoiceMessagePlayer = ({ fileUrl, onReply }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlayPause = () => {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    };

    return (
      <div className="flex flex-row gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <audio
            ref={audioRef}
            src={fileUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
        <button
          onClick={onReply}
          className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FaReply className="inline-block mr-1" />
          Reply
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg h-[30rem] dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => {
          const isSender = msg?.sender?._id === userId || msg?.sender === userId;
          return (
            <div
              key={index}
              ref={(el) => (messageRefs.current[msg._id] = el)}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-xs px-4 py-2 shadow-lg rounded-lg ${
                  isSender
                    ? "bg-[#3d526d] text-white self-end"
                    : "bg-gray-200 dark:bg-gray-600 text-black dark:text-white self-start"
                }`}
              >
                {/* Display replied message */}
                {msg.replyTo && (
                  <div className="flex flex-row p-1 mb-1 bg-gray-100 rounded-lg dark:bg-gray-700">
                    <p
                      className="text-xs text-gray-300 cursor-pointer dark:text-gray-300 hover:underline"
                      onClick={() => scrollToMessage(msg.replyTo._id)}
                    >
                      Replying to: {msg.replyTo.message}
                    </p>
                    {/* Display image preview if the replied message has a fileUrl */}
                    {msg.replyTo.fileUrl && !msg.replyTo.fileUrl.endsWith(".pdf") && (
                      <img
                        src={msg.replyTo.fileUrl}
                        alt="Reply Preview"
                        className="object-cover w-6 h-6 rounded-lg"
                      />
                    )}
                  </div>
                )}

                <strong className="block text-xs text-gray-200 dark:text-gray-300">
                  {isSender ? "You" : msg?.senderName || "Unknown"}
                </strong>

                {/* Image/PDF Preview with Three-dot Menu */}
                {msg.fileUrl ? (
                  <div className="relative group">
                    {msg.fileUrl.endsWith(".pdf") ? (
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View PDF
                      </a>
                    ) : msg.fileUrl.endsWith(".webm") ? (
                      <VoiceMessagePlayer fileUrl={msg.fileUrl} onReply={() => handleReply(msg)} />
                    ) : (
                      <div className="relative">
                        <img
                          src={msg.fileUrl}
                          alt="Chat"
                          className="h-auto max-w-full transition-transform transform rounded-lg shadow-md cursor-pointer hover:scale-105 dark:border-2 dark:border-slate-200"
                          onClick={() => window.open(msg.fileUrl, "_blank")}
                        />

                        {/* Three-dot Menu (Only for Images) */}
                        <div className="absolute transition-opacity opacity-0 right-2 top-2 group-hover:opacity-100">
                          <button
                            onClick={() => setOpenMenu(openMenu === index ? null : index)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                          >
                            <FaEllipsisV className="text-gray-600 dark:text-gray-300" />
                          </button>

                          {openMenu === index && (
                            <div className="absolute right-0 w-32 mt-2 overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
                              <a
                                href={msg.fileUrl.replace("/upload/", "/upload/fl_attachment/")}
                                download
                                className="flex items-center px-4 py-2 text-sm text-gray-700 transition dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FaDownload className="mr-2" />
                                Download
                              </a>
                              <button
                                onClick={() => handleReply(msg)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FaReply className="mr-2" />
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-row gap-2">
                    <p className="text-sm" style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
                      {msg.message}
                    </p>
                    <button
                      onClick={() => handleReply(msg)}
                      className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <FaReply className="inline-block mr-1" />
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="p-2 bg-gray-100 border-t border-gray-300 dark:border-gray-600 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Replying to: {replyingTo.message}
            </p>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-gray-600 transition hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <FaTimes />
            </button>
          </div>
          {/* Display image preview if the replied message has a fileUrl */}
          {replyingTo.fileUrl && !replyingTo.fileUrl.endsWith(".pdf") && (
            <img
              src={replyingTo.fileUrl}
              alt="Reply Preview"
              className="object-cover w-12 h-12 mt-2 rounded-lg"
            />
          )}
        </div>
      )}

      {/* Chat Input */}
      <div className="flex items-center p-2 border-t border-gray-300 dark:border-gray-600">
        {/* Voice Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isRecording ? <FaStopCircle /> : <FaMicrophone />}
        </button>

        {/* File Upload */}
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="px-4 py-2 ml-2 text-white transition bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <FaPaperclip />
        </label>

        {/* Text Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 ml-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={loading}
        />

        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 ml-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <FaPaperPlane />
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="p-2 text-sm text-center text-red-500 bg-red-100">{error}</div>}
    </div>
  );
};

export default ChatComponent;