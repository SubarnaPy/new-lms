import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChevronLeft, FaBars, FaVideo, FaTasks, FaQuestionCircle } from 'react-icons/fa';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { Button } from '@material-tailwind/react';
import CourseReviewModal from './CourseReviewModal';

const VideoDetailsSidebar = ({ showSidebar, setShowSidebar }) => {
  const [reviewModal, setReviewModal] = useState(false);
  const [activeStatus, setActiveStatus] = useState('');
  const [videoActive, setVideoActive] = useState('');
  const { courseId, sectionId, subSectionId } = useParams();
  const { courseSectionData, totalNoOfLectures } = useSelector((state) => state.viewCourse);
  const user = useSelector((state) => state.profile.data);
  const navigate = useNavigate();
  const completedLectures = user.courseProgress.find((item) => item.courseID === courseId)?.completedVideos || [];
  const completedAssistants = user.courseProgress.find((item) => item.courseID === courseId)?.completedAssignments|| [];
  console.log(completedAssistants)
  console.log(user.courseProgress)

  useEffect(() => {
    if (!courseSectionData) return;
    const currentSectionIndex = courseSectionData.findIndex((section) => section._id === sectionId);
    const currentSubSectionIndex = courseSectionData[currentSectionIndex]?.subSection.findIndex(
      (subSection) => subSection?._id === subSectionId
    );
    if (currentSectionIndex === -1 || currentSubSectionIndex === -1) return;
    const activesubsectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex]._id;
    setActiveStatus(courseSectionData[currentSectionIndex]._id);
    setVideoActive(activesubsectionId);
  }, [courseSectionData, sectionId, subSectionId]);

  const handleReview = () => {
    setReviewModal(true);
  };

  return (
    <>
      {/* Toggle Sidebar Button for Mobile */}
      <div className="fixed z-50 top-16 right-10 md:hidden">
        <Button
          className="p-2 text-black bg-blue-500 hover:bg-blue-600 transition duration-300"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <FaBars className="text-xl" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed h-screen z-40 top-0 left-0 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:w-1/4 w-72`}
      >
        <div className="flex flex-col h-full border-r dark:border-gray-700">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 py-5 px-5 bg-blue-100 dark:bg-gray-800 border-b">
            <div className="flex items-center justify-between w-full">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:scale-95 transition duration-300 cursor-pointer"
                onClick={() => navigate('/dashboard/enrolled-courses')}
              >
                <FaChevronLeft className="text-lg" />
              </div>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white transition duration-300"
                onClick={handleReview}
              >
                Reviews
              </Button>
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300">My Courses</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedLectures?.length} of {totalNoOfLectures} Lectures Completed
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="h-full gap-2 px-4 overflow-y-auto">
            {courseSectionData?.map((section, index) => (
              <details key={index} className="group gap- transition-all duration-300">
                <summary className="flex justify-between my-1 items-center cursor-pointer px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{section?.title}</div>
                  <MdOutlineKeyboardArrowDown className="text-2xl transition-transform duration-300 group-open:rotate-180" />
                </summary>

                {/* Videos */}
                <div className="transition-all duration-300">
                  {section?.subSection.map((subSection) => (
                    <div key={subSection?._id} className="pl-4 border-l-4 border-blue-500">
                      <div
                        onClick={() => {
                          setShowSidebar(false);
                          navigate(`/courses/${courseId}/section/${section?._id}/sub-section/${subSection?._id}`);
                        }}
                        className={`flex items-center justify-between p-3 rounded-lg mt-2 cursor-pointer transition-colors ${
                          subSection?._id === videoActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FaVideo className="text-lg" />
                          <p>{subSection?.title}</p>
                        </div>
                        <input
                          readOnly
                          checked={completedLectures?.includes(subSection?._id)}
                          type="checkbox"
                          className="accent-green-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assignments */}
                <div className="pl-4 border-l-4 border-yellow-500 transition-all duration-300">
                  {section?.assignments?.map((assignment) => (
                    <div
                      key={assignment?._id}
                      onClick={() => navigate(`/courses/${courseId}/section/${section._id}/assignment/${assignment._id}`)}
                      className="flex justify-between items-center p-3 mt-2 rounded-lg cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FaTasks className="text-lg" />
                        <p>{assignment.title}</p>
                      </div>
                      <input
                        readOnly
                        checked={completedAssistants?.includes(assignment?._id)}
                        type="checkbox"
                        className="accent-yellow-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Quizzes */}
                <div className="pl-4 border-l-4 border-green-500 transition-all duration-300">
                  {section?.quizzes?.map((quiz, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(`/courses/${courseId}/section/${section._id}/quiz/${quiz._id}`)}
                      className="flex justify-between items-center p-3 mt-2 rounded-lg cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FaQuestionCircle className="text-lg" />
                        <p>{quiz.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  );
};

export default VideoDetailsSidebar;
