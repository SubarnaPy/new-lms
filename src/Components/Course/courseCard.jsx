import { motion } from "framer-motion";
import { FaShoppingCart, FaStar, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GetAvgRating from "../../utils/AvgRating";
import { useContext } from "react";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
import clsx from "clsx";

const CourseCard = ({ data }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  const handleNavigate = (e) => {
    e.stopPropagation();
    navigate(`/courses/${data._id}/description`, { state: { ...data } });
  };

  return (
    <motion.div
      onClick={handleNavigate}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "relative overflow-hidden w-[18rem] rounded-xl cursor-pointer group",
        "border shadow-lg hover:shadow-xl transition-shadow duration-300",
        isDarkMode 
          ? "bg-[#020817] border-gray-800 hover:border-purple-600/50" 
          : "bg-white border-gray-100 hover:border-purple-300"
      )}
    >
      {/* Thumbnail Container */}
      <div className="relative overflow-hidden h-48">
        <motion.img
          className="w-full h-full object-cover"
          src={data?.thumbnail?.secure_url}
          alt="course thumbnail"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Price Badge */}
        <motion.div
          className={clsx(
            "absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold",
            "backdrop-blur-sm flex items-center gap-1",
            isDarkMode 
              ? "bg-purple-600/30 text-purple-100" 
              : "bg-purple-100/90 text-purple-700"
          )}
          whileHover={{ scale: 1.05 }}
        >
          ${data.price}
        </motion.div>
      </div>

      {/* Course Details */}
      <div className="p-4 space-y-3">
        {/* Title and Rating */}
        <div className="flex items-start justify-between">
          <h3 className={clsx(
            "text-lg font-bold line-clamp-2",
            isDarkMode ? "text-gray-100" : "text-gray-900"
          )}>
            {data?.title}
          </h3>
          <div className="flex items-center gap-1.5 pl-2">
            <FaStar className="text-yellow-400 text-sm" />
            <span className={clsx(
              "text-sm font-medium",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              {GetAvgRating(data?.ratingAndReviews)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className={clsx(
          "text-sm line-clamp-2",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          {data?.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={clsx(
              "px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1",
              isDarkMode 
                ? "bg-gray-800/50 text-purple-300" 
                : "bg-purple-100 text-purple-700"
            )}>
              <FaUsers className="text-xs" />
              <span>{data?.studentEnrolled?.length}</span>
            </div>
            <span className={clsx(
              "text-xs px-2 py-1 rounded-md",
              isDarkMode 
                ? "bg-gray-800/50 text-gray-300" 
                : "bg-gray-100 text-gray-700"
            )}>
              {data?.category?.name}
            </span>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleNavigate}
            className={clsx(
              "flex items-center px-3 py-2 text-sm font-semibold rounded-lg",
              "transition-colors duration-200",
              isDarkMode
                ? "bg-purple-700/80 hover:bg-purple-600 text-gray-100"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            )}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShoppingCart className="mr-2" />
            Enroll
          </motion.button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isDarkMode && (
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
      )}
    </motion.div>
  );
};

export default CourseCard;