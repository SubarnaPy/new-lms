import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getFullDetailsOfCourse } from '../../../Redux/courseSlice';
// import LoadingSpinner from '../../Common/LoadingSpinner';
import LiveClassComponent from './VideoMeet';

const CourseAccessValidator = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  // Redux state
  const { role, _id: userId } = useSelector((state) => state.auth.data);
  const { FullDetailsOfCourse } = useSelector((state) => state.course);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        setLoading(true);
        const result = await dispatch(getFullDetailsOfCourse(courseId));
        
        if (result.error) {
          toast.error('Error verifying course access');
          navigate('/');
          return;
        }
        

        const course = result.payload;
        const isEnrolled = course.studentEnrolled.includes(userId);
        const isInstructor = course.instructor._id === userId;

        console.log(course)

        if (!isEnrolled && !isInstructor) {
          toast.error('You must enroll in this course to access the class');
          navigate(`/course/${courseId}`);
          return;
        }

        setAccessGranted(true);
      } catch (error) {
        console.error('Access verification error:', error);
        toast.error('Error verifying course access');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyAccess();
  }, [courseId, dispatch, navigate, userId]);

  if (loading) {
    return <p>Verifying course access...</p>;
  }

  if (!accessGranted) {
    return null; // Redirect handled in useEffect
  }

  return <LiveClassComponent />;
};

export default CourseAccessValidator;