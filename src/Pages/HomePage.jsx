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
import { useEffect, useState, useContext } from "react";
import TopCourses from "../Components/Course/TopCourses";
import { DarkModeContext } from "../Layouts/DarkModeContext";
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

      {/* Popular Courses Section */}
      <TopCourses />

      {/* Moving Blocks Section */}
      <div className={`py-20 ${isDarkMode ? "bg-gray-900" : "bg-[#f9f9f9]"}`}>
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className={`mb-12 text-4xl font-bold text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Why Choose <HighlightText text={"EDUCATION SIGHT"} />?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {movingBlocks.map((block, index) => (
              <motion.div
                key={index}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`p-8 text-center transition-all duration-300 transform ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                } border shadow-lg rounded-xl hover:shadow-xl hover:border-purple-200`}
              >
                <div className="flex justify-center mb-6">{block.icon}</div>
                <h3 className={`mb-4 text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {block.title}
                </h3>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{block.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
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