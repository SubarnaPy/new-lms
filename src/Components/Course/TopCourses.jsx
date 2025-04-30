import { useEffect, useContext } from "react"; // Add useContext
import { useDispatch, useSelector } from "react-redux";
import { fetchTopCourses } from "../../Redux/courseSlice";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import CourseCard from "./CourseCard";
import HighlightText from "../HomePage/HighlightText";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
// import { DarkModeContext } from "../../context/DarkModeContext"; // Import DarkModeContext

const TopCourses = () => {
  const dispatch = useDispatch();
  const { topCourses, loading, error } = useSelector((state) => state.course ?? {});

  // Access dark mode state
  const { isDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    dispatch(fetchTopCourses());
  }, [dispatch]);

  console.log(topCourses);

  return (
    <div className={`relative overflow-hidden ${
      isDarkMode ? "bg-gray-900" : "bg-[#f9f9f9]"
    } py-9`}>
      <div className="relative z-20 max-w-6xl px-4 mx-auto">
        <h2 className={`mb-12 text-4xl font-bold text-center ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}>
          <HighlightText text={"Top 5 Courses"} />
        </h2>

        {loading ? (
          <p className={`text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Loading...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 gap-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center">
            {topCourses?.slice(0, 4).map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="cursor-pointer"
              >
                <CourseCard key={course._id} data={course} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/courses">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-3 mx-auto font-semibold text-white transition-transform transform rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Explore All Courses <FaArrowRight />
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopCourses;