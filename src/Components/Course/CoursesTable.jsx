import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import { HiClock } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { deleteCourse, setCourse, fetchInstructorCourses } from '../../Redux/courseSlice';
import { COURSE_STATUS } from '../../utils/constants';
import ConfirmationModal from '../Modal/ConfirmationModal';
import { formatDate } from '../../utils/formatDate';
import { Button } from '@material-tailwind/react';
import CourseDuration from '../../utils/secToDurationFrontend';
import { Skeleton } from 'antd'; // For skeleton loader

const CoursesTable = ({ courses, setCourses }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.course);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const TRUNCATE_LENGTH = 30;

  // Ensure `courses` is an array
  const courseList = useMemo(() => {
    return Array.isArray(courses?.courses) ? courses.courses : [];
  }, [courses]);

  const handleCourseDelete = async (courseId) => {
    await dispatch(deleteCourse({ courseId: courseId }));
    const result = await dispatch(fetchInstructorCourses());
    if (result?.payload) {
      setCourses(result.payload);
    }
    setConfirmationModal(null);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      const result = await dispatch(fetchInstructorCourses());
      if (result.payload.success) setCourses(result.payload);
    };
    fetchCourses();
  }, [dispatch, setCourses]);

  const handleSetCourse = async (course) => {
    dispatch(setCourse(course));
  };

  return (
    <>
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} active paragraph={{ rows: 4 }} />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <table className="min-w-full">
              <thead className="bg-richblack-800 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-left text-white uppercase">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-left text-white uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-left text-white uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-left text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-richblack-200 dark:divide-gray-700">
                {courseList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-lg font-medium text-center text-richblack-500 dark:text-gray-400">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  courseList.map((course) => (
                    <tr
                      key={course._id}
                      className="transition-all duration-200 hover:bg-richblack-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={course?.thumbnail?.secure_url}
                            alt={course?.title}
                            className="object-cover h-24 rounded-lg shadow-md w-36"
                          />
                          <div className="flex flex-col gap-1">
                            <p className="text-lg font-semibold text-richblack-900 dark:text-white">
                              {course.title}
                            </p>
                            <p className="text-sm text-richblack-600 dark:text-gray-400">
                              {course.description.split(' ').length > TRUNCATE_LENGTH
                                ? course.description.split(' ').slice(0, TRUNCATE_LENGTH).join(' ') + '...'
                                : course.description}
                            </p>
                            <p className="text-xs text-richblack-400 dark:text-gray-500">
                              Created: {formatDate(course.createdAt)}
                            </p>
                            {course.status === COURSE_STATUS.DRAFT ? (
                              <div className="flex items-center gap-2 text-sm font-medium text-pink-600 dark:text-pink-400">
                                <HiClock size={14} />
                                Drafted
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                <FaCheck size={14} />
                                Published
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-richblack-900 dark:text-white">
                        <CourseDuration course={course} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-richblack-900 dark:text-white">
                        ₹{course.price}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-richblack-900 dark:text-white">
                        <div className="flex gap-4">
                          <button
                            onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600"
                          >
                            <FiEdit2 size={20} />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmationModal({
                                text1: 'Do you want to delete this course?',
                                text2: 'All the data related to this course will be deleted',
                                btn1Text: 'Delete',
                                btn2Text: 'Cancel',
                                btn1Handler: () => handleCourseDelete(course._id),
                                btn2Handler: () => setConfirmationModal(null),
                              })
                            }
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600"
                          >
                            <RiDeleteBin6Line size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
        </>
      )}
    </>
  );
};

export default CoursesTable;