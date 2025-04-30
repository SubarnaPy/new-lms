import React from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { RiChatQuoteFill } from 'react-icons/ri';

const CourseReviewCard = ({ reviews }) => {
  // Sort reviews by creation date (assuming `createdAt` is in ISO format or a timestamp)
  const sortedReviews = [...reviews] // Create a new array copy
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-8 transition-all duration-300 shadow-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl hover:shadow-3xl">
      <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-purple-800 dark:text-purple-300">
        <RiChatQuoteFill className="text-3xl text-purple-600 dark:text-purple-400" />
        Latest Reviews
      </h2>
      <div className="space-y-6">
        {sortedReviews.map((review, index) => (
          <div
            key={index}
            className="p-6 transition-all duration-300 bg-white rounded-lg shadow-md dark:bg-gray-700 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {review.user.avatar?.secure_url ? (
                  <img
                    src={review.user.avatar.secure_url}
                    alt={review.user.fullName}
                    className="object-cover w-12 h-12 mr-3 rounded-full shadow-sm"
                  />
                ) : (
                  <FaUserCircle className="w-12 h-12 mr-3 text-purple-500 dark:text-purple-400" />
                )}
                <div>
                  <span className="font-semibold text-purple-800 dark:text-purple-200">
                    {review.user.fullName}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-xl ${
                        i < review.rating
                          ? 'text-yellow-400 dark:text-yellow-500'
                          : 'text-gray-300 dark:text-gray-500'
                      }`}
                    />
                  ))}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({review.rating}/5)
                </span>
              </div>
            </div>
            <p className="pl-2 italic text-gray-700 border-l-4 border-purple-500 dark:text-gray-300 dark:border-purple-400">
              "{review.review}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseReviewCard;