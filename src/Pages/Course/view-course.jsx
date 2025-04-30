import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from '../../Redux/viewCourseSlice';
import { getFullDetailsOfCourse } from '../../Redux/courseSlice';
import VideoDetailsSidebar from '../../Components/Course/ViewCourse/VideoDetailsSidebar';
import { Button } from '@material-tailwind/react';
import HomeLayout from "../../Layouts/HomeLayout";


const ViewCourse = () => {
  const [showSidebar, setShowSidebar] = useState(false); // Manage sidebar visibility
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const { courseSectionData, courseEntireData, completedLectures } = useSelector(
    (state) => state.viewCourse
  );

  // Reset course data on component unmount
  useEffect(() => {
    return () => {
      dispatch(setCourseSectionData([]));
      dispatch(setEntireCourseData([]));
      dispatch(setCompletedLectures([]));
    };
  }, [dispatch]);

  // Fetch course details on courseId change
  useEffect(() => {
    const setCourseSpecificDetails = async () => {
      const courseData = await dispatch(getFullDetailsOfCourse(courseId));
      if (courseData?.payload) {
        dispatch(setCourseSectionData(courseData.payload.courseContent));
        dispatch(setEntireCourseData(courseData.payload));
        dispatch(setCompletedLectures(courseData.payload.courseProgress || []));

        // Calculate total number of lectures
        let lectures = 0;
        courseData.payload.courseContent.forEach((sec) => {
          lectures += sec.subSection.length;
        });
        dispatch(setTotalNoOfLectures(lectures));
      }
    };

    setCourseSpecificDetails();
  }, [courseId, dispatch]);

  return (
    <HomeLayout>
    <div className="relative flex min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <VideoDetailsSidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      {/* Content */}
      <div className="flex-1 h-full overflow-auto">
        {/* Toggle Sidebar Button for Small Screens */}
        
        {/* Main Content */}
        <div className="sm:py-4 py-1 mt-0 px-6 sm:mt-8 md:ml-[1rem]">
          <Outlet />
        </div>
      </div>
    </div>
    </HomeLayout>
  );
};

export default ViewCourse;