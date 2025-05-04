import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BigPlayButton, Player } from 'video-react';
import 'video-react/dist/video-react.css';
import { Button } from '@material-tailwind/react';
import { markLectureAsComplete } from '../../../Redux/courseSlice';
import { updateCompletedLectures } from '../../../Redux/viewCourseSlice';
import { getProfile } from '../../../Redux/profileSlice';
import ChatComponent from '../../ChatSection/ChatComponent'; // Import the ChatComponent

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const playerRef = useRef();
  const { courseSectionData, courseEntireData } = useSelector((state) => state.viewCourse);
  const user = useSelector((state) => state.profile.data);
  const completedLectures = user.courseProgress.find((item) => item.courseID === courseId)?.completedVideos;

  const [previewSource, setPreviewSource] = useState('');
  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); // State for chat modal

  useEffect(() => {
    const setVideoSpecificDetails = () => {
      if (!courseSectionData.length) return;
      if (!courseId && !sectionId && !subSectionId) {
        navigate('/dashboard/enrolled-courses');
      } else {
        const filteredData = courseSectionData.filter((course) => course._id === sectionId);
        const filteredVideoData = filteredData?.[0]?.subSection.filter((data) => data._id === subSectionId);
        setVideoData(filteredVideoData[0]);
        setPreviewSource(courseEntireData.thumbnail.secure_url);
        setVideoEnded(false);
      }
    };
    setVideoSpecificDetails();
  }, [courseSectionData, courseEntireData, location.pathname]);

  const isFirstVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex((data) => data._id === subSectionId);
    return currentSectionIndex === 0 && currentSubSectionIndex === 0;
  };

  const isLastVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
    const noOfSubSections = courseSectionData[currentSectionIndex]?.subSection.length;
    const currentSubSectionIndex = courseSectionData[currentSectionIndex]?.subSection.findIndex((data) => data._id === subSectionId);
    return (courseSectionData[currentSectionIndex + 1]?.subSection.length === 0 && currentSubSectionIndex === noOfSubSections - 1) ||
      (currentSectionIndex === courseSectionData.length - 1 && currentSubSectionIndex === noOfSubSections - 1);
  };

  const goToNextVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;
    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex((data) => data._id === subSectionId);
    if (currentSubSectionIndex !== noOfSubSections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex + 1]._id;
      navigate(`/courses/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`);
    } else {
      const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
      const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
      navigate(`/courses/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`);
    }
  };

  const goToPrevVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;
    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex((data) => data._id === subSectionId);
    if (currentSubSectionIndex !== 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex - 1]._id;
      navigate(`/courses/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`);
    } else {
      const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
      const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
      const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id;
      navigate(`/courses/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`);
    }
  };

  const handleLectureCompletion = async (subSectionId, completedLectures) => {
    setLoading(true);
    const res = await dispatch(markLectureAsComplete({ courseId: courseId, subSectionId: subSectionId }));
    console.log(res);
    await dispatch(getProfile());
    if (res.payload.success) {
      dispatch(updateCompletedLectures(res.payload.completedVideos));
    }
    setLoading(false);
  };

  // Close modal when clicking outside (on the backdrop)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsChatModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-gray-800 dark:text-gray-100" onClick={handleBackdropClick} >
  {/* Video Player Section */}
  <div className="relative w-full max-w-4xl mx-auto overflow-hidden bg-gray-900 shadow-2xl aspect-video rounded-xl">
  {!videoData ? (
    <img 
      src={previewSource} 
      alt="Preview" 
      className="object-cover w-full h-full rounded-md" 
    />
  ) : (
    <Player 
      fluid={true} 
      ref={playerRef} 
      aspectRatio="16:9" 
      playsInline 
      onEnded={() => setVideoEnded(true)} 
      src={videoData?.lecture?.secure_url}
      className="bg-gray-900"
    >
        {videoEnded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              {!completedLectures?.includes(subSectionId) && (
                <Button
                  disabled={loading}
                  onClick={() => handleLectureCompletion(subSectionId, completedLectures)}
                  className="px-6 py-3 text-white transition-all bg-gradient-to-r from-green-500 to-cyan-600 hover:shadow-lg rounded-xl"
                >
                  🎯 Mark As Completed
                </Button>
              )}
              <Button
                disabled={loading}
                onClick={() => {
                  if (playerRef?.current) {
                    playerRef.current?.seek(0);
                    setVideoEnded(false);
                  }
                }}
                className="px-6 py-3 text-white transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg rounded-xl"
              >
                🔄 Rewatch Lecture
              </Button>
              <div className="flex gap-4 mt-4">
                {!isFirstVideo() && (
                  <Button 
                    disabled={loading} 
                    onClick={goToPrevVideo}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm rounded-xl"
                  >
                    ← Previous
                  </Button>
                )}
                {!isLastVideo() && (
                  <Button 
                    disabled={loading} 
                    onClick={goToNextVideo}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm rounded-xl"
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Player>
    )}
  </div>

  {/* Video Info Section */}
  <div className="flex flex-col gap-4 p-6 bg-white shadow-md dark:bg-gray-800 rounded-xl">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {videoData?.title}
      </h1>
      <Button
        onClick={() => setIsChatModalOpen(true)}
        className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg rounded-xl"
      >
        💬 Open Discussion
      </Button>
    </div>
    
    <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
      {videoData?.description}
    </p>
  </div>

  {/* Chat Modal */}
  {isChatModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div 
        className="flex flex-col w-full h-full max-w-2xl overflow-hidden bg-white shadow-2xl dark:bg-gray-800 rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            💬 Course Discussions
          </h2>
          <button
            onClick={() => setIsChatModalOpen(false)}
            className="p-2 text-gray-500 transition-colors rounded-full dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 p-4 overflow-y-auto"onClick={handleBackdropClick}>
          <ChatComponent 
            courseId={courseId} 
            userId={user._id} 
            className="mt-52"
          />
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default VideoDetails;