import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { VscAdd } from 'react-icons/vsc';
import { fetchInstructorCourses } from '../../Redux/courseSlice';
import { Button } from '@material-tailwind/react';
import CoursesTable from './CoursesTable';

const MyCourses = () => {
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.course);
  const user = useSelector((state) => state.auth.data);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const result = await dispatch(fetchInstructorCourses());
      if (result.payload === undefined) {
        navigate('/login');
      }
      if (result.payload.success) setCourses(result.payload);
    };

    fetchCourses();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-richblack-900 dark:text-white">
          My Courses
        </h1>
        <Button
          onClick={() => navigate('/dashboard/add-course')}
          className="flex items-center gap-2 transition-all bg-yellow-500 dark:bg-yellow-600 text-richblack-900 dark:text-white hover:bg-yellow-600 dark:hover:bg-yellow-700"
        >
          <VscAdd className="text-lg" />
          <span>Add Course</span>
        </Button>
      </div>

      {/* Courses Table */}
      {courses && <CoursesTable courses={courses} setCourses={setCourses} />}
    </div>
  );
};

export default MyCourses;