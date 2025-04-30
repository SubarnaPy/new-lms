import { useDispatch, useSelector } from "react-redux";
import { getAllCourses } from "../../Redux/courseSlice";
import { useEffect, useState, useContext } from "react";
import HomeLayout from "../../Layouts/HomeLayout";
import CourseCard from "../../Components/Course/courseCard";
import { FaFilter, FaSortAmountDown, FaSortAmountUp, FaFire, FaClock } from 'react-icons/fa';
import { DarkModeContext } from "../../Layouts/DarkModeContext";

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
      <div className={`min-h-[90vh] pt-12 flex flex-col pb-10 flex-wrap gap-10 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-[#f9f9f9] text-gray-900"
      }`}>
        <h1 className="px-4 text-2xl font-semibold text-center sm:px-10 sm:text-3xl sm:text-left">
          Explore the courses made by{" "}
          <span className="font-bold text-yellow-500">Industry Experts</span>
        </h1>

        {/* Main Content */}
        <div className="flex flex-col gap-8 px-4 sm:px-8 lg:flex-row">
          {/* Sidebar for Filters */}
          <div className={`w-full p-4 sm:p-6 rounded-lg shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } ${isMobile ? 'mb-4' : 'lg:w-1/4'}`}>
            <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
              <FaFilter className="text-purple-600" />
              Filters
            </h2>
            {/* Category Filter */}
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}>Select Category</label>
              <select
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-purple-500"
                }`}
                onChange={(e) => filterByCategory(e.target.value)}
                value={selectedCategory}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => applySorting("priceHighToLow")}
                className={`w-full flex items-center gap-2 p-3 rounded-lg ${
                  sortBy === "priceHighToLow"
                    ? "bg-purple-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } transition-all duration-300`}
              >
                <FaSortAmountDown />
                Price: High to Low
              </button>
              <button
                onClick={() => applySorting("priceLowToHigh")}
                className={`w-full flex items-center gap-2 p-3 rounded-lg ${
                  sortBy === "priceLowToHigh"
                    ? "bg-purple-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } transition-all duration-300`}
              >
                <FaSortAmountUp />
                Price: Low to High
              </button>
              <button
                onClick={() => applySorting("popularity")}
                className={`w-full flex items-center gap-2 p-3 rounded-lg ${
                  sortBy === "popularity"
                    ? "bg-purple-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } transition-all duration-300`}
              >
                <FaFire />
                Popularity
              </button>
              <button
                onClick={() => applySorting("latest")}
                className={`w-full flex items-center gap-2 p-3 rounded-lg ${
                  sortBy === "latest"
                    ? "bg-purple-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } transition-all duration-300`}
              >
                <FaClock />
                Latest
              </button>
            </div>
          </div>

          {/* Course Cards */}
          <div className="flex justify-center w-full lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-[15rem] rounded-lg shadow-lg ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } p-3`}
                  >
                    {/* Skeleton for Thumbnail */}
                    <div className={`h-40 w-full rounded-t-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}></div>

                    {/* Skeleton for Title */}
                    <div className={`h-6 w-3/4 mt-4 rounded ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}></div>

                    {/* Skeleton for Description */}
                    <div className={`h-4 w-full mt-2 rounded ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}></div>
                    <div className={`h-4 w-2/3 mt-2 rounded ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}></div>

                    {/* Skeleton for Category and Students */}
                    <div className="flex items-center justify-between mt-4">
                      <div className={`h-4 w-1/2 rounded ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } animate-pulse`}></div>
                      <div className={`h-4 w-1/4 rounded ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } animate-pulse`}></div>
                    </div>

                    {/* Skeleton for Price and Button */}
                    <div className="flex items-center justify-between mt-4">
                      <div className={`h-6 w-1/4 rounded ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } animate-pulse`}></div>
                      <div className={`h-10 w-1/3 rounded ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } animate-pulse`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 mx-auto w-fit md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((element) => (
                    <CourseCard key={element._id} data={element} />
                  ))
                ) : (
                  <p className={`text-lg font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>No courses found in this category.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default CourseList;