import { Link } from "react-router-dom";
import HomeImage from "../../Assetss/Image/home.png";
import { motion } from "framer-motion";
import { useEffect, useState, useContext } from "react";
import { DarkModeContext } from "../../Layouts/DarkModeContext";

const Bubble = ({ size, left, top, delay, color, onHover, onClick }) => {
  const randomMovement = {
    y: [0, ...Array(4).fill().map(() => Math.random() * 100 - 50), 0],
    x: [0, ...Array(4).fill().map(() => Math.random() * 100 - 50), 0],
    scale: [1, 0.8, 1.2, 1],
    opacity: [0, 0.8, 0.5, 0.2, 0.8]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={randomMovement}
      transition={{
        duration: Math.random() * 10 + 5,
        delay: delay,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "anticipate"
      }}
      style={{
        width: size,
        height: size,
        left: left,
        top: top,
        backgroundColor: color,
      }}
      className="absolute rounded-full cursor-pointer blur-sm opacity-70 mix-blend-screen"
      whileHover={{ 
        scale: 1.5, 
        opacity: 1,
        transition: { duration: 0.3 } 
      }}
      onHoverStart={onHover}
      onClick={onClick}
      exit={{ 
        scale: 3, 
        opacity: 0,
        transition: { duration: 0.5 } 
      }}
    />
  );
};

const HeroSection1 = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [bubbles, setBubbles] = useState([]);

  const generateBubble = (index) => ({
    size: `${Math.random() * 40 + 10}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    color: `hsla(${Math.random() * 360}, 70%, 70%, ${Math.random() * 0.3 + 0.2})`,
    id: index,
  });

  useEffect(() => {
    setBubbles(Array.from({ length: 15 }, (_, i) => generateBubble(i)));
  }, []);

  const handleBubbleHover = (id) => {
    setBubbles(prev => prev.map(bubble => 
      bubble.id === id ? { 
        ...bubble, 
        color: `hsla(${Math.random() * 360}, 80%, 70%, 0.9)` 
      } : bubble
    ));
  };

  const handleBubbleClick = (id) => {
    setBubbles(prev => prev.filter(bubble => bubble.id !== id));
    setTimeout(() => {
      setBubbles(prev => [...prev, generateBubble(Date.now())]);
    }, 2000);
  };

  const containerBase = [
    "relative z-0 w-screen",
    "flex flex-col lg:flex-row",
    "items-center justify-between",
    "pt-20 px-4 md:px-16 py-12",
    "overflow-hidden min-h-screen",
  ].join(" ");
  
  const containerBg = isDarkMode
    ? "bg-gradient-to-br from-[#020817] via-[#0a1025] to-[#020817]"
    : "bg-gradient-to-br from-[#fefeff] via-[#f0f7ff] to-[#e6f0ff]";


    const headingBase = [
      "text-4xl",
      "font-bold",
      "leading-tight",
      "md:text-6xl",
      "font-poppins",
      "mb-6",
    ].join(" ");
    
    const headingColor = isDarkMode ? "text-gray-100" : "text-slate-900";  

  return (
    <div className={`${containerBase} ${containerBg}`}>
      {/* Dynamic Bubble Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            {...bubble}
            onHover={() => handleBubbleHover(bubble.id)}
            onClick={() => handleBubbleClick(bubble.id)}
          />
        ))}
      </div>

      {/* Animated Wave Section */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full overflow-hidden transform rotate-180"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <svg viewBox="0 0 1440 320" className="w-full h-24">
          <path
            fill={isDarkMode ? "#0a1025" : "#f0f7ff"}
            d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,218.7C960,224,1056,160,1152,128C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-50 flex flex-col items-center text-center lg:items-start lg:w-1/2 lg:text-left"
      >
         <motion.h1
    className={`${headingBase} ${headingColor}`}
    whileHover={{ y: -5 }}
  >
          Master{" "}
          <motion.span
            className="bg-gradient-to-r from-[#0070f3] to-[#00c6ff] bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            Future Skills
          </motion.span>{" "}
          <br />
          through Immersive Learning
        </motion.h1>

        <motion.p
          className={`max-w-xl mt-4 text-lg mb-8 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
          whileHover={{ scale: 1.02 }}
        >
          Dive into our cutting-edge curriculum featuring:
          <ul className="mt-2 space-y-1 text-left">
            {['AI-powered projects', 'Real-time collaboration', 'Expert mentorship', 'Interactive labs'].map((item, i) => (
              <motion.li
                key={item}
                className="flex items-center gap-2"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: i * 0.1 + 0.4 }}
              >
                <span className="text-blue-400">▹</span> {item}
              </motion.li>
            ))}
          </ul>
        </motion.p>

        <div className="flex flex-col gap-4 mt-6 sm:flex-row">
          <Link to="/signup">
            <motion.button
              className="relative px-8 py-4 overflow-hidden text-lg font-semibold text-white bg-gradient-to-r from-[#0070f3] to-[#00c6ff] rounded-xl hover:shadow-2xl"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 30px -10px rgba(0, 112, 243, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Journey
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
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
        <div className="relative group">
          <motion.div
            className={`absolute -inset-8 rounded-3xl blur-xl ${
              isDarkMode 
                ? "bg-gradient-to-br from-[#0070f3]/20 to-[#00c6ff]/10" 
                : "bg-gradient-to-br from-[#0070f3]/10 to-[#00c6ff]/05"
            }`}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.img
            src={HomeImage}
            alt="Interactive Learning Platform"
            className="relative z-50 w-full max-w-md transition-transform duration-300 transform lg:max-w-xl hover:scale-[1.02]"
            whileHover={{ rotate: -2 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection1;