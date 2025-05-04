import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChevronLeft, FaBars, FaVideo, FaTasks, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';
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
      {/* Mobile Toggle Button */}
      <div className="fixed z-50 top-24 right-6 md:hidden">
        <Button
          variant="gradient"
          className="p-3 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <FaBars className="text-xl text-white dark:text-gray-300" />
        </Button>
      </div>

      {/* Sidebar Container */}
      <div
        className={`fixed h-screen z-40 top-0 left-0 bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:w-80 w-72`}
      >
        <div className="flex flex-col h-full border-r dark:border-gray-700">
          {/* Header Section */}
          <div className="p-6 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/dashboard/enrolled-courses')}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaChevronLeft className="text-xl text-gray-600 dark:text-gray-300" />
              </button>
              <Button
                variant="gradient"
                className="bg-gradient-to-r from-green-400 to-cyan-500 hover:shadow-lg dark:from-green-500 dark:to-cyan-600"
                onClick={handleReview}
              >
                Leave Review
              </Button>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Content</h2>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 transition-all duration-500 rounded-full bg-gradient-to-r from-green-400 to-cyan-500 dark:from-green-500 dark:to-cyan-600"
                    style={{ width: `${(completedLectures?.length / totalNoOfLectures) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  {completedLectures?.length}/{totalNoOfLectures}
                </span>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            {courseSectionData?.map((section, index) => (
              <details 
                key={index} 
                className="mb-4 overflow-hidden transition-all duration-300 rounded-lg group bg-gray-50 dark:bg-gray-800"
                open={activeStatus === section._id}
              >
                <summary className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                      <span className="font-medium text-gray-600 dark:text-gray-300">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100">{section.title}</h3>
                  </div>
                  <MdOutlineKeyboardArrowDown className="text-2xl text-gray-400 transition-transform group-open:rotate-180" />
                </summary>

                {/* Subsections */}
                <div className="pb-4 pl-4 pr-2 space-y-2">
                  {/* Videos */}
                  {section.subSection.map((subSection) => (
                    <div
                      key={subSection._id}
                      onClick={() => {
                        setShowSidebar(false);
                        navigate(`/courses/${courseId}/section/${section._id}/sub-section/${subSection._id}`);
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        subSection._id === videoActive 
                          ? 'bg-blue-50 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 shadow-md'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FaVideo className={`text-sm ${
                          subSection._id === videoActive 
                            ? 'text-blue-500 dark:text-white' 
                            : 'text-blue-400 dark:text-blue-300'
                        }`} />
                        <span className={`${
                          subSection._id === videoActive 
                            ? 'text-blue-600 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {subSection.title}
                        </span>
                      </div>
                      {completedLectures?.includes(subSection._id) && (
                        <FaCheckCircle className="text-green-500 dark:text-green-400" />
                      )}
                    </div>
                  ))}

                  {/* Assignments */}
                  {section.assignments?.map((assignment) => (
                    <div
                      key={assignment._id}
                      onClick={() => navigate(`/courses/${courseId}/section/${section._id}/assignment/${assignment._id}`)}
                      className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <FaTasks className="text-sm text-amber-500 dark:text-amber-400" />
                        <span className="text-gray-600 dark:text-gray-300">{assignment.title}</span>
                      </div>
                      {completedAssistants?.includes(assignment._id) && (
                        <FaCheckCircle className="text-green-500 dark:text-green-400" />
                      )}
                    </div>
                  ))}

                  {/* Quizzes */}
                  {section.quizzes?.map((quiz) => (
                    <div
                      key={quiz._id}
                      onClick={() => navigate(`/courses/${courseId}/section/${section._id}/quiz/${quiz._id}`)}
                      className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <FaQuestionCircle className="text-sm text-emerald-500 dark:text-emerald-400" />
                        <span className="text-gray-600 dark:text-gray-300">{quiz.title}</span>
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
