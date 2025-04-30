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
  const [previewSource, setPreviewSource] = useState('');
  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); // State for chat modal
  const completedLectures = user.courseProgress.find((item) => item.courseID === courseId)?.completedVideos;

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
    <div className="flex flex-col gap-5 text-black dark:text-white">
      {!videoData ? (
        <img src={previewSource} alt="Preview" className="object-cover w-full rounded-md" />
      ) : (
        <Player fluid={true} ref={playerRef} aspectRatio="16:9" playsInline onEnded={() => setVideoEnded(true)} src={videoData?.lecture?.secure_url}>
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  'linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)',
              }}
              className="absolute inset-0 z-30 flex flex-col gap-2 full place-content-center"
            >
              {!completedLectures?.includes(subSectionId) && (
                <Button
                  disabled={loading}
                  onClick={() => handleLectureCompletion(subSectionId, completedLectures)}
                  className="px-2 mx-auto text-sm text-yellow-400 bg-slate-400 "
                >
                  Mark As Completed
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
                className="px-2 mx-auto text-sm text-yellow-400 bg-slate-400"
              >
                Rewatch
              </Button>
              <div className="mt-4 flex min-w-[250px] justify-center gap-x-4 text-sm">
                {!isFirstVideo() && (
                  <Button disabled={loading} onClick={goToPrevVideo} className="text-yellow-400 bg-slate-400">
                    Prev
                  </Button>
                )}
                {!isLastVideo() && (
                  <Button disabled={loading} onClick={goToNextVideo} className="text-yellow-400 bg-slate-100">
                    Next
                  </Button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}
      <div className="flex items-center justify-between">
        <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
        <Button
          onClick={() => setIsChatModalOpen(true)}
          className="text-black dark:text-white bg-slate-400 dark:bg-gray-600"
        >
          Open Chat
        </Button>
      </div>
      <p className="pt-2 pb-6">{videoData?.description}</p>

      {/* Chat Modal with Blurred Background */}
      {isChatModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleBackdropClick} // Close modal when clicking outside
        >
          <div className="w-11/12 p-2 bg-[#f9f9f9] rounded-lg dark:bg-gray-800 md:w-1/2 lg:w-1/3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black dark:text-white">Course Chat</h2>
              <button
                onClick={() => setIsChatModalOpen(false)}
                className="text-3xl text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            {/* Render the ChatComponent inside the modal */}
            <ChatComponent courseId={courseId} userId={user._id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetails;