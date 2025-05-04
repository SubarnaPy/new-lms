import { useDispatch, useSelector } from "react-redux";
import { getAllCourses } from "../../Redux/courseSlice";
import { useEffect, useState, useContext } from "react";
import HomeLayout from "../../Layouts/HomeLayout";
import CourseCard from "../../Components/Course/courseCard";
import { FaFilter, FaSortAmountDown, FaSortAmountUp, FaFire, FaClock } from 'react-icons/fa';
import { DarkModeContext } from "../../Layouts/DarkModeContext";
import { motion } from 'framer-motion';
import clsx from 'clsx';

function CourseList() {
  const dispatch = useDispatch();
  const { coursesData } = useSelector((state) => state.course);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [categories, setCategories] = useState([]); // Store categories
  const [selectedCategory, setSelectedCategory] = useState("All"); // Default category

  // Access dark mode state
  const { isDarkMode } = useContext(DarkModeContext);

  // Fetch courses
  async function loadCourses() {
    const res = await dispatch(getAllCourses());
    if (res.payload) {
      setFilteredCourses(res.payload);
      setLoading(false);

      // Extract unique categories from course data
      const uniqueCategories = ["All", ...new Set(res.payload.map(course => course.category.name))];
      setCategories(uniqueCategories);
    }
  }

  // Apply sorting
  const applySorting = (criteria) => {
    let sortedCourses = [...filteredCourses];
    switch (criteria) {
      case "priceHighToLow":
        sortedCourses.sort((a, b) => b.price - a.price);
        break;
      case "priceLowToHigh":
        sortedCourses.sort((a, b) => a.price - b.price);
        break;
      case "popularity":
        sortedCourses.sort((a, b) => b.studentEnrolled.length - a.studentEnrolled.length);
        break;
      case "latest":
        sortedCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        sortedCourses = coursesData;
    }
    setFilteredCourses(sortedCourses);
    setSortBy(criteria);
  };

  // Filter courses based on category selection
  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredCourses(coursesData);
    } else {
      const filtered = coursesData.filter(course => course.category.name === category);
      setFilteredCourses(filtered);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <HomeLayout>
      <div className={clsx(
        "min-h-[90vh] pt-12 pb-10 flex flex-col gap-10",
        "bg-gradient-to-br from-[#020817] to-[#0a1020]",
        isDarkMode ? "text-gray-100" : "bg-[#f9f9f9] text-gray-900"
      )}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 text-3xl font-bold text-center sm:px-10 sm:text-4xl"
        >
          Explore courses by{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Industry Experts
          </span>
        </motion.h1>

        {/* Main Content */}
        <div className="flex flex-col gap-8 px-4 sm:px-8 lg:flex-row">
          {/* Filter Sidebar */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={clsx(
              "w-full p-6 rounded-2xl shadow-2xl backdrop-blur-sm",
              "border border-gray-800/50",
              isDarkMode 
                ? "bg-gray-800/30 hover:border-purple-500/30" 
                : "bg-white border-gray-200",
              isMobile ? 'mb-4' : 'lg:w-1/4'
            )}
          >
            <h2 className="flex items-center gap-3 mb-6 text-xl font-bold">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaFilter className="text-purple-400 text-xl" />
              </motion.div>
              Filter & Sort
            </h2>

            {/* Category Filter */}
            <div className="mb-6">
              <label className={clsx(
                "block mb-3 text-sm font-semibold",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>
                Category
              </label>
              <div className="relative">
                <select
                  className={clsx(
                    "w-full p-3 rounded-xl appearance-none",
                    "focus:outline-none focus:ring-2",
                    isDarkMode
                      ? "bg-gray-700/50 border border-gray-600 text-white focus:ring-purple-500"
                      : "bg-white border border-gray-200 text-gray-900 focus:ring-purple-500"
                  )}
                  onChange={(e) => filterByCategory(e.target.value)}
                  value={selectedCategory}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sorting Buttons */}
            <div className="space-y-4">
              {[
                { label: "Price: High to Low", value: "priceHighToLow", icon: <FaSortAmountDown /> },
                { label: "Price: Low to High", value: "priceLowToHigh", icon: <FaSortAmountUp /> },
                { label: "Popularity", value: "popularity", icon: <FaFire /> },
                { label: "Latest", value: "latest", icon: <FaClock /> }
              ].map((btn, index) => (
                <motion.button
                  key={btn.value}
                  onClick={() => applySorting(btn.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl",
                    "transition-all duration-300 font-medium",
                    sortBy === btn.value
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : isDarkMode
                      ? "bg-gray-700/30 hover:bg-gray-700/50 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )}
                >
                  <span className="text-lg">{btn.icon}</span>
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Course Cards */}
          <div className="flex justify-center w-full lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={clsx(
                      "w-[18rem] rounded-xl shadow-lg overflow-hidden",
                      isDarkMode ? "bg-gray-800/30" : "bg-white"
                    )}
                  >
                    <div className={clsx(
                      "h-48 w-full animate-pulse",
                      isDarkMode ? "bg-gray-700/50" : "bg-gray-200"
                    )} />
                    <div className="p-4 space-y-4">
                      <div className={clsx(
                        "h-6 rounded-lg",
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-200"
                      )} />
                      <div className="flex gap-2">
                        <div className={clsx(
                          "h-4 w-1/3 rounded-lg",
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-200"
                        )} />
                        <div className={clsx(
                          "h-4 w-1/4 rounded-lg",
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-200"
                        )} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 gap-6 mx-auto w-fit md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((element) => (
                    <motion.div
                      key={element._id}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CourseCard 
                        data={element}
                        className={clsx(
                          "hover:scale-[1.02] hover:shadow-xl",
                          "transition-transform duration-300"
                        )}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={clsx(
                      "col-span-full p-8 text-center rounded-2xl",
                      "bg-gradient-to-r from-purple-500/10 to-blue-500/10",
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    )}
                  >
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-xl font-semibold">No courses found in this category</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default CourseList;