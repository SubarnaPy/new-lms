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
      <div className={`flex flex-col items-center justify-between max-w-6xl gap-12 mx-auto mt-20 ${
        isDarkMode ? "bg-gray-900" : "bg-[#f9f9f9]"
      }`}>
        <div className="flex flex-col gap-8 mb-12 md:flex-row">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full text-3xl font-semibold md:text-4xl lg:text-5xl md:w-1/2"
          >
            <span className={isDarkMode ? "text-white" : "text-gray-900"}>
              Get the Skills you need for a
              <HighlightText text={"Job that is in demand"} />
            </span>
          </motion.div>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-6 md:w-1/2"
          >
            <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"} md:text-xl`}>
              The modern StudyNotion dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
            </p>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 font-semibold text-white transition-transform transform rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Learn more
              </motion.button>
            </Link>
          </motion.div>
        </div>
        <TimelineSection />
        <LearningLanguageSection />
        <InstructorSection />
      </div>

      {/* Review Slider */}
      <div className={`py-20 ${
        isDarkMode ? "bg-gradient-to-r from-gray-900 to-gray-900" : "bg-gradient-to-r from-purple-50 to-indigo-50"
      }`}>
        <div className="px-4 mx-auto ">
          <h2 className={`mb-12 text-4xl font-bold text-center ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            What Our <HighlightText text={"Students Say"} />
          </h2>
          <ReviewSlider />
          
        </div>
        
      </div>
    </HomeLayout>
  );
}

export default HomePage;