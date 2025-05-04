import Logo1 from "../../Assetss/TimeLineLogo/Logo1.svg";
import Logo2 from "../../Assetss/TimeLineLogo/Logo2.svg";
import Logo3 from "../../Assetss/TimeLineLogo/Logo3.svg";
import Logo4 from "../../Assetss/TimeLineLogo/Logo4.svg";
import timelineImage from "../../Assetss/Images/TimelineImage.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useContext } from "react";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
// import { DarkModeContext } from "../../context/DarkModeContext";
// import { motion, useScroll, useTransform } from "framer-motion";
// import { useRef, useContext } from "react";
import clsx from "clsx";
import { timeline } from "@material-tailwind/react";
// import { DarkModeContext } from "../../Layouts/DarkModeContext";

const TimelineSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const { isDarkMode } = useContext(DarkModeContext);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div
      className={clsx(
        "relative overflow-hidden py-20",
        isDarkMode ? "bg-[#020817]" : "bg-[#f9f9f9]"
      )}
      ref={ref}
    >
      <div className="container flex flex-col items-center gap-14 px-5 mx-auto lg:flex-row">
        {/* Timeline Items */}
        <div className="lg:w-[45%] flex flex-col gap-8">
          {timeline.map((element, index) => (
            <motion.div
              key={index}
              style={{ y }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={clsx(
                "flex gap-6 items-start p-6 rounded-2xl",
                "shadow-xl hover:shadow-2xl transition-all duration-300",
                "border backdrop-blur-sm",
                isDarkMode
                  ? "bg-gray-800/30 border-gray-700 hover:border-purple-500/50"
                  : "bg-white border-gray-200 hover:border-purple-300"
              )}
            >
              <div className={clsx(
                "min-w-[60px] h-[60px] flex items-center justify-center",
                "rounded-2xl shadow-lg",
                isDarkMode 
                  ? "bg-purple-900/30 border border-purple-500/20"
                  : "bg-purple-100"
              )}>
                <img 
                  src={element.Logo} 
                  alt={`Logo ${index + 1}`} 
                  className="w-8 h-8 filter brightness-125"
                />
              </div>
              <div className="space-y-2">
                <h2 className={clsx(
                  "text-xl font-bold",
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                )}>
                  {element.heading}
                </h2>
                <p className={clsx(
                  "text-base leading-relaxed",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  {element.Description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Image Section */}
        <div className="relative w-full lg:w-[50%] flex justify-center items-center">
          <motion.div 
            style={{ y }}
            className="relative overflow-hidden rounded-2xl shadow-2xl"
          >
            <img
              src={timelineImage}
              alt="Timeline Illustration"
              className="object-cover w-full h-full"
            />
            <div className={clsx(
              "absolute inset-0 mix-blend-overlay",
              isDarkMode 
                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                : "bg-gradient-to-r from-purple-100/40 to-blue-100/40"
            )} />
          </motion.div>

          {/* Floating Stats Card */}
          <motion.div
            style={{ y }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={clsx(
              "absolute bg-gradient-to-r from-purple-600 to-blue-600",
              "text-white uppercase py-5 px-8 rounded-2xl",
              "flex gap-8 items-center shadow-2xl",
              "backdrop-blur-lg border",
              isDarkMode 
                ? "border-purple-500/30 bg-purple-600/80" 
                : "border-white/20"
            )}
          >
            <div className="pr-6 border-r border-white/30">
              <p className="text-3xl font-black">10</p>
              <p className="text-sm font-medium">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-black">250+</p>
              <p className="text-sm font-medium">Courses</p>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          {isDarkMode && (
            <>
              <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]" />
            </>
          )}
        </div>
      </div>

      {/* Background Particles */}
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineSection;