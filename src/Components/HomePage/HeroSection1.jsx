import { Link } from "react-router-dom";
import HomeImage from "../../Assetss/Image/home.png";
import HighlightText from "../../Components/HomePage/HighlightText";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState, useContext } from "react";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
// import { DarkModeContext } from "../../context/DarkModeContext"; // Import DarkModeContext

// Bubble Component
const Bubble = ({ size, left, top, delay, color, onHover, onClick }) => {
  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{
        y: [0, -100, 0, 100, 0], // Random vertical movement
        x: [0, 50, -50, 100, -100, 0], // Random horizontal movement
        opacity: [0, 1, 0.5, 1, 0], // Fade in and out
      }}
      transition={{
        duration: Math.random() * 6 + 4, // Random duration between 4 and 10 seconds
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: size,
        height: size,
        left: left,
        top: top,
        backgroundColor: color,
      }}
      className="absolute rounded-full cursor-pointer blur-sm opacity-70"
      whileHover={{ scale: 1.2, opacity: 1 }} // Scale up on hover
      onHoverStart={onHover} // Trigger hover behavior
      onClick={onClick} // Trigger click behavior
    ></motion.div>
  );
};

const HeroSection1 = () => {
  const { isDarkMode } = useContext(DarkModeContext); // Access dark mode state
  const [bubbles, setBubbles] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Generate random bubbles
  useEffect(() => {
    const newBubbles = Array.from({ length: 30 }).map((_, index) => ({
      size: `${Math.random() * 10 + 5}px`, // Random size between 5px and 15px
      left: `${Math.random() * 100}%`, // Random horizontal position
      top: `${Math.random() * 100}%`, // Random vertical position
      delay: Math.random() * 2, // Random delay between 0 and 2 seconds
      color: `hsla(${Math.random() * 360}, 70%, 70%, 0.7)`, // Random pastel color
      id: index, // Unique ID for each bubble
    }));
    setBubbles(newBubbles);
  }, []);

  // Track cursor position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle bubble hover
  const handleBubbleHover = (id) => {
    setBubbles((prevBubbles) =>
      prevBubbles.map((bubble) =>
        bubble.id === id
          ? { ...bubble, color: `hsla(${Math.random() * 360}, 70%, 70%, 0.9)` } // Change color on hover
          : bubble
      )
    );
  };

  // Handle bubble click
  const handleBubbleClick = (id) => {
    setBubbles((prevBubbles) =>
      prevBubbles.filter((bubble) => bubble.id !== id) // Remove bubble on click
    );
  };

  return (
    <div
      className={`relative z-0 border-y ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      } w-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-[#fefeff] to-[#e6f0ff]"
      } flex flex-col lg:flex-row items-center justify-between pt-20 px-4 md:px-16 py-12 overflow-hidden`}
    >
      {/* Floating Bubbles */}
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          size={bubble.size}
          left={bubble.left}
          top={bubble.top}
          delay={bubble.delay}
          color={bubble.color}
          onHover={() => handleBubbleHover(bubble.id)}
          onClick={() => handleBubbleClick(bubble.id)}
        />
      ))}

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden transform rotate-180">
        <svg
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-24"
        >
          <path
            fill={isDarkMode ? "#1f2937" : "#fefeff"} // Dark mode wave color
            fillOpacity="1"
            d="M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,192C672,203,768,181,864,160C960,139,1056,117,1152,112C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Text Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center lg:items-start lg:w-1/2 lg:text-left"
      >
        <h1
          className={`text-3xl font-bold leading-snug ${
            isDarkMode ? "text-white" : "text-slate-950"
          } md:text-5xl font-poppins`}
        >
          Join with us to learn{" "}
          <span className="bg-gradient-to-r from-[#0070f3] to-[#00c6ff] bg-clip-text text-transparent">
            future Skills
          </span>
        </h1>
        <p className={`max-w-lg mt-4 text-lg ${
          isDarkMode ? "text-gray-300" : "text-black"
        }`}>
          Learning is the process of acquiring new understanding, knowledge,
          behaviors, skills, values, attitudes, and preferences.
        </p>
        <div className="flex flex-col gap-4 mt-6 sm:flex-row">
          <Link to="/signup">
            <button className="px-6 py-3 bg-gradient-to-r from-[#0070f3] to-[#00c6ff] rounded-lg text-white font-medium transition-transform transform hover:scale-105 hover:shadow-lg shadow-md">
              Get Started
            </button>
          </Link>
          <Link to="/login">
            <button
              className={`px-6 py-3 bg-transparent border ${
                isDarkMode ? "border-gray-300" : "border-[#0070f3]"
              } rounded-lg ${
                isDarkMode ? "text-gray-300" : "text-[#0070f3]"
              } font-medium transition-transform transform hover:scale-105 ${
                isDarkMode
                  ? "hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800"
                  : "hover:bg-gradient-to-r hover:from-[#0070f3] hover:to-[#00c6ff]"
              } hover:text-white hover:shadow-lg shadow-md`}
            >
              Learn More
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Image Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-50 flex justify-center mt-8 lg:w-1/2 lg:mt-0"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className={`absolute z-0 w-96 h-96 ${
            isDarkMode
              ? "bg-gradient-radial from-gray-800 via-gray-700 to-transparent"
              : "bg-gradient-radial from-[#a32b93] via-[#b6b5c5] to-transparent"
          } opacity-20 blur-2xl rounded-full`}
        ></motion.div>
        <img
          src={HomeImage}
          alt="Learning"
          className="z-50 w-full max-w-md transition duration-300 transform lg:max-w-lg hover:scale-105"
        />
      </motion.div>
    </div>
  );
};

export default HeroSection1;