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
    isDarkMode ? "border-[#020817]" : "border-gray-200"
  } w-screen ${
    isDarkMode
      ? "bg-gradient-to-br from-[#020817] via-[#0a1120] to-[#020817]"
      : "bg-gradient-to-br from-[#fefeff] to-[#e6f0ff]"
  } flex flex-col lg:flex-row items-center justify-between pt-20 px-4 md:px-16 py-12 overflow-hidden min-h-screen`}
>
  {/* Animated Background Elements */}
  <div className="absolute inset-0 overflow-hidden">
    {bubbles.map((bubble) => (
      <motion.div
        key={bubble.id}
        className={`absolute rounded-full opacity-20 ${
          isDarkMode ? "mix-blend-lighten" : "mix-blend-multiply"
        }`}
        style={{
          width: bubble.size,
          height: bubble.size,
          left: bubble.left,
          top: bubble.top,
          background: `radial-gradient(circle at 30% 30%, ${bubble.color}, transparent)`,
        }}
        animate={{
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3 + bubble.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.5, opacity: 0.4 }}
        onClick={() => handleBubbleClick(bubble.id)}
      />
    ))}
  </div>

  {/* Animated Wave Divider */}
  <motion.div 
    className="absolute bottom-0 left-0 w-full overflow-hidden transform rotate-180"
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 5, repeat: Infinity }}
  >
    <svg
      viewBox="0 0 1440 320"
      className="w-full h-24"
    >
      <path
        fill={isDarkMode ? "#020817" : "#fefeff"}
        d="M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,192C672,203,768,181,864,160C960,139,1056,117,1152,112C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
  </motion.div>

  {/* Text Section with Enhanced Animations */}
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="relative z-50 flex flex-col items-center text-center lg:items-start lg:w-1/2 lg:text-left"
  >
    <h1
      className={`text-4xl font-bold leading-tight ${
        isDarkMode ? "text-gray-100" : "text-slate-950"
      } md:text-6xl font-poppins mb-6`}
    >
      Master{" "}
      <span className="relative inline-block">
        <span className="bg-gradient-to-r from-[#0070f3] to-[#00c6ff] bg-clip-text text-transparent">
          Future Skills
        </span>
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#0070f3] to-[#00c6ff]"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </span>
      <br />
      with Interactive Learning
    </h1>
    
    <motion.p
      className={`max-w-xl mt-4 text-lg ${
        isDarkMode ? "text-gray-300" : "text-gray-700"
      } mb-8`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      Immerse yourself in cutting-edge courses with hands-on projects,
      real-time feedback, and AI-powered mentorship.
    </motion.p>

    <div className="flex flex-col gap-4 mt-6 sm:flex-row">
      <Link to="/signup">
        <motion.button
          className="relative px-8 py-4 overflow-hidden text-lg font-medium text-white bg-gradient-to-r from-[#0070f3] to-[#00c6ff] rounded-xl hover:shadow-2xl transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">Start Learning Free</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00c6ff] to-[#0070f3] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </Link>

      <Link to="/courses">
        <motion.button
          className={`px-8 py-4 text-lg font-medium border rounded-xl backdrop-blur-sm transition-all duration-300 ${
            isDarkMode 
              ? "border-gray-600 text-gray-100 hover:bg-gray-800/50" 
              : "border-blue-500 text-blue-600 hover:bg-blue-50"
          }`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Courses
        </motion.button>
      </Link>
    </div>
  </motion.div>

  {/* Enhanced Image Section */}
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    className="relative z-50 flex justify-center mt-12 lg:w-1/2 lg:mt-0"
  >
    <div className="relative">
      <motion.div
        className={`absolute -inset-8 rounded-3xl ${
          isDarkMode
            ? "bg-gradient-to-br from-[#0070f3]/20 to-[#00c6ff]/10"
            : "bg-gradient-to-br from-[#0070f3]/10 to-[#00c6ff]/05"
        } blur-2xl`}
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />
      
      <motion.img
        src={HomeImage}
        alt="Interactive Learning"
        className="relative z-50 w-full max-w-md transition-transform duration-300 transform lg:max-w-xl hover:scale-[1.02]"
        whileHover={{ rotate: -1 }}
      />
      
      {/* Floating Elements */}
      <motion.div
        className={`absolute -top-8 -left-8 w-24 h-24 rounded-full ${
          isDarkMode ? "bg-[#0070f3]/20" : "bg-[#00c6ff]/20"
        }`}
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />
      <motion.div
        className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-xl ${
          isDarkMode ? "bg-[#00c6ff]/15" : "bg-[#0070f3]/15"
        }`}
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          delay: 1,
        }}
      />
    </div>
  </motion.div>
</div>
  );
};

export default HeroSection1;