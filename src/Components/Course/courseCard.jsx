import { FaShoppingCart, FaStar, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GetAvgRating from "../../utils/AvgRating";
import { useContext } from "react";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
// import { DarkModeContext } from "../../context/DarkModeContext"; // Import DarkModeContext

const CourseCard = ({ data }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext); // Access dark mode state

  const handle = (e) => {
    e.stopPropagation();
    navigate(`/courses/${data._id}/description`);
  };

  return (
    <div
      onClick={() => navigate(`/courses/${data._id}/description`, { state: { ...data } })}
      className={`overflow-hidden hover:scale-[1.05] transition-all ease-in-out duration-300 
      w-[15rem] rounded-lg shadow-xl cursor-pointer group ${
        isDarkMode
          ? "bg-gray-800 border border-gray-700 hover:shadow-2xl"
          : "bg-white border border-gray-100 hover:shadow-2xl"
      } p-3`}
    >
      {/* Course Thumbnail */}
      <div className="overflow-hidden rounded-lg">
        <img
          className="h-40 w-full rounded-t-lg object-cover group-hover:scale-[1.1] transition-all ease-in-out duration-300"
          src={data?.thumbnail?.secure_url}
          alt="course thumbnail"
        />
      </div>

      {/* Course Details */}
      <div className="space-y-3">
        {/* Title and Rating */}
        <div className="flex items-center justify-between">
          <h2 className={`text-base font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          } line-clamp-2`}>
            {data?.title}
          </h2>
          <div className="flex items-center gap-1">
            <FaStar className="text-sm text-yellow-400" />
            <span className={`text-sm font-semibold ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              {GetAvgRating(data?.ratingAndReviews)} ({data?.ratingAndReviews?.length})
            </span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm ${
          isDarkMode ? "text-gray-300" : "text-gray-600"
        } line-clamp-2`}>
          {data?.description}
        </p>

        {/* Category and Total Students */}
        <div className={`flex items-center justify-between text-sm ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}>
          <p>
            <span className="font-semibold">Category:</span> {data?.category?.name}
          </p>
          <div className="flex items-center gap-1">
            <FaUsers className={`text-sm ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`} />
            <span>{data?.studentEnrolled?.length} Students</span>
          </div>
        </div>

        {/* Price and Add to Cart Button */}
        <div className="flex items-center justify-between mt-3">
          <span className={`text-lg font-bold ${
            isDarkMode ? "text-purple-300" : "text-purple-700"
          }`}>
            ${data.price}
          </span>
          <button
            onClick={handle}
            className={`flex items-center px-3 py-2 text-sm font-semibold text-white transition-all duration-300 ${
              isDarkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-purple-600 hover:bg-purple-700"
            } rounded-md`}
          >
            <FaShoppingCart className="mr-1 text-md" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;