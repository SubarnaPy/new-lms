import { Link } from "react-router-dom";
import HomeLayout from "../Layouts/HomeLayout";
import HighlightText from "../Components/HomePage/HighlightText";
import TimelineSection from "../Components/HomePage/TimelineSection";
import LearningLanguageSection from "../Components/HomePage/LearningLanguageSection";
import InstructorSection from "../Components/HomePage/InstructorSection";
import HeroSection2 from "../Components/HomePage/HeroSection2";
import HeroSection1 from "../Components/HomePage/HeroSection1";
import ReviewSlider from "../Components/HomePage/ReviewSlider";
import CourseCard from "../Components/Course/courseCard"; // Assuming you have a CourseCard component
import { FaArrowRight, FaRocket, FaUsers, FaChartLine, FaStar } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useState, useContext } from "react";
import TopCourses from "../Components/Course/TopCourses";
import { DarkModeContext } from "../Layouts/DarkModeContext";
import clsx from "clsx";
// import { DarkModeContext } from "../context/DarkModeContext"; // Import DarkModeContext

function HomePage() {
  const { isDarkMode } = useContext(DarkModeContext); // Access dark mode state

  // Dummy data for popular courses
  const popularCourses = [
    {
      _id: 1,
      title: "Web Development Bootcamp",
      description: "Learn full-stack web development from scratch.",
      price: 299,
      thumbnail: "https://via.placeholder.com/300",
      rating: 4.7,
      studentEnrolled: 1200,
    },
    {
      _id: 2,
      title: "Data Science Masterclass",
      description: "Master data science with Python and machine learning.",
      price: 399,
      thumbnail: "https://via.placeholder.com/300",
      rating: 4.8,
      studentEnrolled: 950,
    },
    {
      _id: 3,
      title: "Mobile App Development",
      description: "Build cross-platform mobile apps with Flutter.",
      price: 349,
      thumbnail: "https://via.placeholder.com/300",
      rating: 4.6,
      studentEnrolled: 800,
    },
  ];

  // Dummy data for moving blocks (features/testimonials)
  const movingBlocks = [
    {
      icon: <FaRocket className="text-4xl text-purple-600" />,
      title: "Fast Learning",
      description: "Accelerate your learning with our interactive courses.",
    },
    {
      icon: <FaUsers className="text-4xl text-blue-600" />,
      title: "Expert Instructors",
      description: "Learn from industry experts with real-world experience.",
    },
    {
      icon: <FaChartLine className="text-4xl text-green-600" />,
      title: "Career Growth",
      description: "Boost your career with in-demand skills.",
    },
  ];

  // Track scroll position
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]); // Adjust values for the desired effect

  return (
    <HomeLayout>
      {/* Hero Section */}
      <HeroSection1 />
      <HeroSection2 />

      {/* Popular Courses Section */}
      <TopCourses />

      {/* Moving Blocks Section */}
      <div className={clsx(
  "relative py-20 overflow-hidden",
  isDarkMode ? "bg-[#020817]" : "bg-[#f9f9f9]"
)}>
  <div className="max-w-7xl px-4 mx-auto relative z-10">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={clsx(
        "mb-16 text-4xl md:text-5xl font-bold text-center",
        isDarkMode ? "text-gray-100" : "text-gray-900"
      )}
    >
      Why Choose <HighlightText text={"EDUCATION SIGHT"} />
    </motion.h2>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {movingBlocks.map((block, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          whileHover={{ 
            y: -10,
            boxShadow: isDarkMode 
              ? "0 20px 40px -10px rgba(126, 34, 206, 0.3)" 
              : "0 20px 40px -10px rgba(99, 102, 241, 0.2)"
          }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            hover: { duration: 0.2 }
          }}
          className={clsx(
            "group p-8 text-center border rounded-2xl",
            "transform transition-all duration-300",
            "relative overflow-hidden",
            isDarkMode 
              ? "bg-gray-800/30 border-gray-700 backdrop-blur-sm hover:border-purple-500/50" 
              : "bg-white border-gray-200 hover:border-purple-300"
          )}
        >
          {/* Hover effect layer */}
          <div className={clsx(
            "absolute inset-0 opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300",
            isDarkMode 
              ? "bg-gradient-to-br from-purple-500/10 to-transparent" 
              : "bg-gradient-to-br from-purple-100/30 to-transparent"
          )} />

          {/* Animated icon */}
          <motion.div 
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.1 }}
          >
            {React.cloneElement(block.icon, {
              className: clsx(
                "w-16 h-16 p-4 rounded-2xl",
                isDarkMode 
                  ? "text-purple-400 bg-purple-900/30" 
                  : "text-purple-600 bg-purple-100"
              )
            })}
          </motion.div>

          <h3 className={clsx(
            "mb-4 text-2xl font-bold",
            isDarkMode ? "text-gray-100" : "text-gray-900"
          )}>
            {block.title}
          </h3>

          <p className={clsx(
            "text-lg leading-relaxed",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {block.description}
          </p>

          {/* Animated border */}
          <div className={clsx(
            "absolute inset-0 rounded-2xl pointer-events-none",
            "group-hover:border-[3px] transition-all duration-300",
            isDarkMode 
              ? "border-purple-500/30" 
              : "border-purple-300"
          )} />
        </motion.div>
      ))}
    </div>
  </div>

  {/* Background elements */}
  {isDarkMode && (
    <div className="absolute inset-0 z-0 opacity-10">
      <div className="absolute top-0 left-[10%] w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-[10%] w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
    </div>
  )}
</div>

      {/* Skills Section */}
      <div className={clsx(
      "relative flex flex-col items-center justify-between gap-16",
      "max-w-7xl mx-auto px-4 py-24 md:py-32",
      "overflow-hidden"
    )}>
      {/* Animated background elements */}
      {isDarkMode && (
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        </div>
      )}

      <div className="flex flex-col gap-12 w-full">
        <div className="flex flex-col gap-12 md:flex-row md:items-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-6"
          >
            <h1 className={clsx(
              "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
              "bg-gradient-to-r bg-clip-text text-transparent",
              isDarkMode 
                ? "from-blue-400 to-purple-400" 
                : "from-blue-600 to-purple-600",
              "relative pb-4"
            )}>
              Get the Skills you need for a
              <span className="block mt-4">
                <HighlightText text="Job that is in demand" />
              </span>
              {/* Animated underline */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </h1>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 space-y-8"
          >
            <p className={clsx(
              "text-lg md:text-xl leading-relaxed",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>
              The modern StudyNotion dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
            </p>

            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  "relative overflow-hidden px-8 py-4 font-semibold",
                  "rounded-xl flex items-center gap-3",
                  "transform transition-all duration-300",
                  "shadow-lg hover:shadow-xl",
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                )}
              >
                <span>Learn more</span>
                <motion.div
                  animate={{ rotate: [0, 90, 180, 270, 360] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaArrowRight className="text-lg" />
                </motion.div>
                {/* Button hover effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Sections with animated entrance */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.2 }}
          className="space-y-20"
        >
          <TimelineSection />
          <LearningLanguageSection />
          <InstructorSection />
        </motion.div>
      </div>
    </div>

      {/* Review Slider */}
      <div className={clsx(
  "relative py-20 overflow-hidden",
  isDarkMode 
    ? "bg-[#020817] border-t border-gray-800" 
    : "bg-gradient-to-r from-purple-50 to-indigo-50"
)}>
  {/* Animated background elements */}
  {isDarkMode && (
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-1/4 left-[20%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-[20%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
    </div>
  )}

  <div className="max-w-7xl px-4 mx-auto relative z-10">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={clsx(
        "mb-16 text-4xl md:text-5xl font-bold text-center",
        isDarkMode ? "text-gray-100" : "text-gray-900"
      )}
    >
      What Our <HighlightText text={"Students Say"} />
    </motion.h2>

    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ staggerChildren: 0.2 }}
    >
      <ReviewSlider 
        cardClassName={clsx(
          "backdrop-blur-sm border",
          isDarkMode 
            ? "bg-gray-800/30 border-gray-700 hover:border-purple-500/50" 
            : "bg-white border-gray-200 hover:border-purple-300"
        )}
        textClassName={isDarkMode ? "text-gray-300" : "text-gray-600"}
      />
    </motion.div>

    {/* Floating particles */}
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
</div>
    </HomeLayout>
  );
}

export default HomePage;