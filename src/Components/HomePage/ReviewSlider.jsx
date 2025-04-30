import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "../../App.css";
import { FaStar } from "react-icons/fa";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import { useDispatch } from "react-redux";
import { getallReating } from "../../Redux/courseSlice";
import { motion } from "framer-motion";

function ReviewSlider() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const truncateWords = 5; // Increased truncation limit for better readability
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await dispatch(getallReating());
        if (res?.payload) {
          setReviews(res.payload);
        } else {
          console.error("Failed to fetch reviews:", res?.message);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [dispatch]);

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <div className="my-[50px] h-[300px] max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          slidesPerView={1} // Default for mobile
          spaceBetween={20}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2, // 2 slides for tablets
            },
            1024: {
              slidesPerView: 3, // 3 slides for laptops
            },
            1280: {
              slidesPerView: 4, // 4 slides for desktops
            },
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col h-full gap-3 p-6 transition-shadow duration-300 bg-white border-2 rounded-lg shadow-lg dark:border-cyan-500 dark:bg-gray-800 hover:shadow-xl"
              >
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={review?.user?.avatar?.secure_url}
                    alt={review?.user?.fullName}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                  <div className="flex flex-col">
                    <h1 className="font-semibold text-gray-900 dark:text-gray-100">
                      {review?.user?.fullName}
                    </h1>
                    <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {review?.course?.title}
                    </h2>
                  </div>
                </div>

                {/* Review Text */}
                <p className="pl-2 overflow-hidden italic text-gray-700 border-l-4 border-purple-500 dark:text-gray-300 dark:border-purple-400">
                  {review?.review.split(" ").length > truncateWords
                    ? `"${review?.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")} ..."`
                    : `"${review?.review}"`}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-yellow-500">
                    {review.rating.toFixed(1)}
                  </h3>
                  <ReactStars
                    count={5}
                    value={review.rating}
                    size={20}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ReviewSlider;