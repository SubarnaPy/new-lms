import React, { useEffect, useState, useContext, useCallback,useMemo  } from "react";
import { Link } from "react-router-dom";
import HomeImage from "../../Assetss/Image/home.png";
import { motion } from "framer-motion";
import clsx from "clsx";
import { DarkModeContext } from "../../Layouts/DarkModeContext";

// import React, { useMemo } from 'react';
// import { motion } from 'framer-motion';

// import React, { useMemo } from 'react';
// import { motion } from 'framer-motion';

const BubbleComponent = ({ size, left, top, delay, color, id, onHover, onClick }) => {
  const randomMovement = useMemo(() => ({
    y: [0, ...Array(4).fill(0).map(() => Math.random() * 100 - 50), 0],
    x: [0, ...Array(4).fill(0).map(() => Math.random() * 100 - 50), 0],
    scale: [1, 0.9, 1.1, 0.9, 1],
    opacity: [0, 0.8, 0.5, 0.8, 0]
  }), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={randomMovement}
      transition={{
        duration: Math.random() * 8 + 6,
        delay,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut"
      }}
      style={{ width: size, height: size, left, top, backgroundColor: color }}
      className="absolute rounded-full cursor-pointer blur-sm opacity-70 mix-blend-screen will-change-transform"
      whileHover={{ scale: 1.5, opacity: 1 }}
      onHoverStart={() => onHover(id)}
      onClick={() => onClick(id)}
      exit={{ scale: 3, opacity: 0 }}
    />
  );
};

const Bubble = React.memo(BubbleComponent);
Bubble.displayName = "Bubble";






export default function HeroSection1() {
  const { isDarkMode } = useContext(DarkModeContext);
  const [bubbles, setBubbles] = useState([]);

  const generateBubble = useCallback((id) => ({
    id,
    size: `${Math.random() * 40 + 10}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    color: `hsla(${Math.random() * 360}, 70%, 70%, ${Math.random() * 0.3 + 0.2})`
  }), []);

  useEffect(() => {
    setBubbles(Array.from({ length: 15 }, (_, i) => generateBubble(i)));
  }, [generateBubble]);

  const handleBubbleHover = useCallback((id) => {
    setBubbles(prev => prev.map(b => 
      b.id === id ? { ...b, color: `hsla(${Math.random() * 360}, 80%, 70%, 0.9)` } : b
    ));
  }, []);

  const handleBubbleClick = useCallback((id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setTimeout(() => setBubbles(prev => [...prev, generateBubble(Date.now())]), 2000);
  }, [generateBubble]);

  const containerClasses = clsx(
    "relative z-0 w-screen flex flex-col lg:flex-row items-center justify-between",
    "pt-20 px-4 md:px-16 py-12 overflow-hidden min-h-screen",
    "transition-colors duration-500 ease-in-out",
    isDarkMode
      ? "bg-gradient-to-br from-[#020817] via-[#0a0f1f] to-[#020817] shadow-[inset_0_-20px_100px_-30px_rgba(9,11,41,0.8)]"
      : "bg-gradient-to-br from-[#f8faff] via-[#e6f0ff] to-[#dde8ff] shadow-[inset_0_-20px_100px_-30px_rgba(214,228,255,0.4)]"
  );

  return (
    <div className={containerClasses}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map(bubble => (
          <Bubble
            key={bubble.id}
            {...bubble}
            onHover={handleBubbleHover}
            onClick={handleBubbleClick}
          />
        ))}
        
        {/* Dynamic grid overlay */}
        <div className={clsx(
          "absolute inset-0 bg-[size:40px_40px] opacity-10",
          isDarkMode ? 'bg-grid-white/[0.05]' : 'bg-grid-blue-900/[0.02]'
        )} />

        {/* Floating gradient blobs */}
        <motion.div 
          className={clsx(
            "absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-30",
            isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-100 to-purple-100'
          )}
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Animated Wave Section */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <svg viewBox="0 0 1440 320" className="w-full h-24" aria-hidden="true">
          <path
            fill={isDarkMode ? "#0a0f1f" : "#e6f0ff"}
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
          className={clsx(
            "text-4xl font-bold leading-tight md:text-6xl font-poppins mb-6",
            isDarkMode ? "text-gray-100" : "text-slate-900"
          )}
          whileHover={{ y: -5 }}
        >
          Master{' '}
          <motion.span
            className="bg-gradient-to-r from-[#0070f3] to-[#00c6ff] bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            Future Skills
          </motion.span>{' '}
          <br />
          through Immersive Learning
        </motion.h1>

        <motion.p
          className={clsx(
            "max-w-xl mt-4 text-lg mb-8",
            isDarkMode ? "text-gray-300" : "text-gray-700"
          )}
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
                <span className="text-blue-400" aria-hidden="true">▹</span> {item}
              </motion.li>
            ))}
          </ul>
        </motion.p>

        <div className="flex flex-col gap-4 mt-6 sm:flex-row">
          <Link to="/signup">
            <motion.button
              className="relative px-8 py-4 overflow-hidden text-lg font-semibold text-white bg-gradient-to-r from-[#0070f3] to-[#00c6ff] rounded-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300/50"
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
              className={clsx(
                "px-8 py-4 text-lg font-medium border rounded-xl backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4",
                isDarkMode
                  ? "border-gray-600 text-gray-100 hover:bg-gray-800/50 focus:ring-gray-500/30"
                  : "border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-200/50"
              )}
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
        <div className="relative group perspective-1000">
          {/* Floating elements */}
          <motion.div
            className={`absolute -top-8 -left-8 w-24 h-24 rounded-full ${
              isDarkMode ? "bg-[#0070f3]/20" : "bg-[#00c6ff]/20"
            }`}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-xl ${
              isDarkMode ? "bg-[#00c6ff]/15" : "bg-[#0070f3]/15"
            }`}
            animate={{
              y: [0, 40, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut"
            }}
          />

          {/* Image container */}
          <motion.div
            className="relative z-50 overflow-hidden rounded-3xl shadow-2xl will-change-transform"
            whileHover={{ 
              rotateY: 5,
              rotateX: 2,
              scale: 1.02 
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Gradient overlay */}
            <motion.div
              className={`absolute inset-0 rounded-3xl bg-gradient-to-br opacity-20 ${
                isDarkMode
                  ? "from-[#0070f3] to-[#00c6ff]"
                  : "from-[#0070f3] to-[#00c6ff]"
              }`}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
            />

            {/* Main image */}
            <motion.img
              src={HomeImage}
              alt="Interactive Learning Platform"
              className="relative z-50 w-full max-w-md transform lg:max-w-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Reflection effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-transparent"
            animate={{ y: ["-100%", "150%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* Star particles (dark mode only) */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}