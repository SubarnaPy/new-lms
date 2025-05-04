import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import HomeImage from "../../Assetss/Image/home.png";
import { motion } from "framer-motion";
import clsx from "clsx";
import { DarkModeContext } from "../../Layouts/DarkModeContext";

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
    size: `${Math.random() * 30 + 8}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    color: `hsla(${Math.random() * 360}, 70%, 70%, ${Math.random() * 0.2 + 0.1})`
  }), []);

  useEffect(() => {
    const bubbleCount = window.innerWidth < 768 ? 10 : 15;
    setBubbles(Array.from({ length: bubbleCount }, (_, i) => generateBubble(i)));
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
    "pt-16 md:pt-20 px-4 md:px-16 py-8 md:py-12 overflow-hidden min-h-screen",
    "transition-colors duration-500 ease-in-out",
    isDarkMode
      ? "bg-gradient-to-br from-[#020817] via-[#0a0f1f] to-[#020817]"
      : "bg-gradient-to-br from-[#f8faff] via-[#e6f0ff] to-[#dde8ff]",
    "md:bg-none"
  );

  return (
    <div className={containerClasses}>
      {/* Mobile Background Image */}
      <div className="md:hidden absolute inset-0 z-0 opacity-40">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#020817]/90' : 'bg-white/90'}`} />
        <img
          src={HomeImage}
          alt="Background"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>

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
        
        <div className={clsx(
          "absolute inset-0 bg-[size:30px_30px] md:bg-[size:40px_40px] opacity-10",
          isDarkMode ? 'bg-grid-white/[0.03]' : 'bg-grid-blue-900/[0.02]'
        )} />

        <motion.div 
          className={clsx(
            "absolute -top-20 -right-20 w-[300px] h-[300px] md:-top-40 md:-right-40 md:w-[600px] md:h-[600px]",
            "rounded-full blur-xl md:blur-3xl opacity-20",
            isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-100 to-purple-100'
          )}
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Wave Section */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <svg viewBox="0 0 1440 320" className="w-full h-16 md:h-24">
          <path
            fill={isDarkMode ? "#0a0f1f" : "#e6f0ff"}
            d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,218.7C960,224,1056,160,1152,128C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-50 flex flex-col items-center text-center lg:items-start lg:w-1/2 lg:text-left"
      >
        <motion.h1
          className={clsx(
            "text-4xl font-bold leading-snug md:text-4xl lg:text-6xl font-poppins mb-4 md:mb-6 px-2",
            "md:leading-tight drop-shadow-md",
            isDarkMode ? "text-gray-100" : "text-slate-900"
          )}
          whileTap={{ scale: 0.98 }}
        >
          Master{' '}
          <motion.span
            className="bg-gradient-to-r from-[#0070f3] to-[#00c6ff] bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            Future Skills
          </motion.span>{' '}
          <br className="hidden md:block" />
          <span className="text-lg md:text-xl lg:text-2xl font-normal block mt-2 md:mt-0 md:inline">
            through Immersive Learning
          </span>
        </motion.h1>

        <motion.div
          className={clsx(
            "max-w-md md:max-w-xl text-base md:text-lg mb-6 md:mb-8 px-4",
            "backdrop-blur-sm rounded-xl p-4 md:backdrop-blur-none",
            isDarkMode ? "text-gray-300 bg-black/20" : "text-gray-700 bg-white/20"
          )}
          whileHover={{ scale: 1.01 }}
        >
          <p className="mb-3">Dive into our cutting-edge curriculum featuring:</p>
          <ul className="space-y-2 text-left">
            {['AI-powered projects', 'Real-time collaboration', 'Expert mentorship', 'Interactive labs'].map((item, i) => (
              <motion.li
                key={item}
                className="flex items-center gap-2 text-sm md:text-base"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.4 }}
                viewport={{ once: true, margin: "-20px" }}
              >
                <motion.span
                  className="text-blue-400 shrink-0"
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                >
                  ▹
                </motion.span> 
                <span className="flex-1">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <div className="flex flex-col gap-3 md:gap-4 w-full px-4 sm:flex-row">
          <Link to="/signup" className="flex-1">
            <motion.button
              className="relative w-full px-6 py-3 md:px-8 md:py-4 text-sm md:text-lg font-semibold text-white 
                bg-gradient-to-r from-[#0070f3] to-[#00c6ff] rounded-lg md:rounded-xl focus:outline-none 
                focus:ring-2 md:focus:ring-4 focus:ring-blue-300/50 shadow-lg"
              whileHover={{ scale: 1.02 }}
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

          <Link to="/courses" className="flex-1">
            <motion.button
              className={clsx(
                "w-full px-6 py-3 md:px-8 md:py-4 text-sm md:text-lg font-medium border",
                "rounded-lg md:rounded-xl backdrop-blur-sm transition-all duration-300",
                "focus:outline-none focus:ring-2 md:focus:ring-4 shadow-md",
                isDarkMode
                  ? "border-gray-600 text-gray-100 hover:bg-gray-800/30 focus:ring-gray-500/30"
                  : "border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-200/50"
              )}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Courses
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Image Section */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-50 flex justify-center mt-8 md:mt-12 lg:w-1/2 lg:mt-0"
      >
        <div className="relative group perspective-1000 w-full max-w-xs md:max-w-md lg:max-w-xl">
          {/* Floating elements */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute ${isDarkMode ? "bg-blue-400/20" : "bg-blue-600/20"} rounded-full blur-sm`}
              style={{
                width: `${Math.random() * 20 + 10}px`,
                height: `${Math.random() * 20 + 10}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}

          <motion.div
            className="relative z-50 overflow-hidden rounded-xl md:rounded-3xl shadow-lg md:shadow-2xl"
            animate={{
              y: window.innerWidth >= 768 ? [0, -10, 0] : 0,
              scale: window.innerWidth >= 768 ? [1, 1.02, 1] : 1
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              className={`absolute inset-0 rounded-xl md:rounded-3xl bg-gradient-to-br opacity-15 ${
                isDarkMode ? "from-[#0070f3] to-[#00c6ff]" : "from-[#0070f3] to-[#00c6ff]"
              }`}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            <motion.img
              src={HomeImage}
              alt="Interactive Learning Platform"
              className="w-full h-auto"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Star particles */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(window.innerWidth < 768 ? 15 : 30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: Math.random() * 4 + 2,
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