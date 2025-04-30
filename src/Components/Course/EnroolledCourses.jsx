import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, getUserEnrolledCourses } from '../../Redux/profileSlice';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import CourseDuration from '../../utils/secToDurationFrontend';
import { FiClock, FiCalendar } from 'react-icons/fi';

const EnrolledCourses = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [enrolledCourses, setEnrolledCourses] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await dispatch(getUserEnrolledCourses());
        if (response.payload) {
          setEnrolledCourses(response.payload.courses);
          setProgressData(response.payload.courseProgress);
          await dispatch(getProfile());
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [dispatch]);

  const calculateProgress = (course) => {
    const progress = progressData?.find(p => p.courseID === course._id);
    const completed = progress?.completedVideos?.length || 0;
    const total = course.courseContent?.reduce((acc, section) => 
      acc + (section.subSection?.length || 0), 0) || 1;
    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total
    };
  };

  const CourseCard = ({ course }) => {
    const { percentage, completed, total } = calculateProgress(course);
    
    return (
      <div
        className="overflow-hidden bg-white shadow-lg cursor-pointer rounded-xl dark:bg-gray-800"
        onClick={() => navigate(`/courses/${course._id}/description`)}
      >
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          <img
            src={course.thumbnail?.secure_url}
            alt={course.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-0 right-0 m-4">
            <div className="relative flex items-center justify-center w-16 h-16 border-4 rounded-full bg-white/30 backdrop-blur-md dark:bg-gray-800/30">
              <span className="text-lg font-semibold text-black dark:text-white">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
            {course.title}
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300 line-clamp-3">
            {course.description}
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-purple-600 dark:text-purple-400">
                  {completed}/{total} lessons
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div 
                  className="h-2 transition-all duration-300 bg-purple-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FiCalendar className="flex-shrink-0" />
                <span>{formatDate(course.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="flex-shrink-0" />
                <CourseDuration course={course} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonLoading = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="overflow-hidden bg-white shadow-lg rounded-xl dark:bg-gray-800">
          <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-6">
            <div className="h-6 mb-2 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
            <div className="h-4 mb-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-1/4 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                  <div className="w-1/4 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                <div className="w-1/3 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                <div className="w-1/3 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-white md:text-4xl">
          My Learning Dashboard
        </h1>

        {isLoading ? (
          <SkeletonLoading />
        ) : enrolledCourses?.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No enrolled courses found.
          </p>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourses;