import { useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTopCourses } from "../../Redux/courseSlice";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import CourseCard from "./courseCard";
import HighlightText from "../HomePage/HighlightText";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
import clsx from "clsx";

const TopCourses = () => {
  const dispatch = useDispatch();
  const { topCourses, loading, error } = useSelector((state) => state.course ?? {});
  const { isDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    dispatch(fetchTopCourses());
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className={clsx(
      "relative overflow-hidden py-16 md:py-24",
      isDarkMode ? "bg-[#020817]" : "bg-[#f9f9f9]"
    )}>
      {/* Animated background elements */}
      {isDarkMode && (
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen blur-[100px] opacity-30" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen blur-[100px] opacity-30" />
        </motion.div>
      )}

      <div className="relative z-20 max-w-7xl px-4 mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={clsx(
            "mb-12 text-4xl md:text-5xl font-bold text-center",
            isDarkMode ? "text-gray-100" : "text-gray-900"
          )}
        >
          <HighlightText text={"Top 5 Courses"} />
        </motion.h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={clsx(
                  "h-80 rounded-xl shadow-lg",
                  isDarkMode ? "bg-gray-800/50" : "bg-white"
                )}
              >
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-700/50 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700/50 rounded w-3/4" />
                    <div className="h-4 bg-gray-700/50 rounded w-1/2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="text-6xl text-red-500">⚠️</div>
            <p className="mt-4 text-xl text-red-400">{error}</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {topCourses?.slice(0, 3).map((course, index) => (
              <motion.div
                key={course._id}
                variants={cardVariants}
                className="relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 z-10 transition-opacity opacity-0 bg-gradient-to-t from-black/60 via-transparent group-hover:opacity-100" />
                <CourseCard data={course} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link to="/courses">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "flex items-center gap-3 px-8 py-4 mx-auto font-semibold transition-all rounded-xl",
                "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
                "shadow-lg hover:shadow-xl",
                isDarkMode ? "text-gray-100" : "text-white"
              )}
            >
              <span>Explore All Courses</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaArrowRight className="text-lg" />
              </motion.div>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default TopCourses;