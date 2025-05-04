import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { buyCourse, resetPaymentState } from '../../Redux/razorpaySlice';
import { getFullDetailsOfCourse } from '../../Redux/courseSlice';
import GetAvgRating from '../../utils/AvgRating';
import ConfirmationModal from '../../Components/Modal/ConfirmationModal';
import { formatDate } from '../../utils/formatDate';
import ReactStars from 'react-rating-stars-component';
import { IoIosInformationCircleOutline, IoIosStar } from 'react-icons/io';
import { BiVideo, BiTime } from 'react-icons/bi';
import { MdOutlineArrowForwardIos, MdVerified } from 'react-icons/md';
import CourseDetailsCard from '../../Components/Course/courseCart';
import { toast } from 'react-hot-toast';
import { ACCOUNT_TYPE } from '../../utils/AccountType';
import { addToCart } from '../../Redux/cartSlice';
import { FaUsers, FaPlayCircle, FaCartPlus, FaCertificate } from 'react-icons/fa';
import CourseReviewCard from '../../Components/Course/CourseReviewCard';
import ChatComponent from '../../Components/ChatSection/ChatComponent';
import { TextField, IconButton } from '@mui/material';
import { RiMoneyDollarCircleLine, RiShareLine, RiBookmarkLine } from 'react-icons/ri';
import { GiTeacher } from 'react-icons/gi';
import { BsGlobe, BsCalendar } from 'react-icons/bs';
import HomeLayout from "../../Layouts/HomeLayout";
import { DarkModeContext } from '../../Layouts/DarkModeContext';

// Video Modal Component
const VideoModal = ({ videoUrl, onClose }) => {
  console.log("Video Modal", videoUrl);
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-4xl overflow-hidden bg-black rounded-lg">
        <button
          onClick={onClose}
          className="absolute z-10 text-2xl text-white top-4 right-4"
        >
          &times;
        </button>
        <video controls autoPlay className="w-full h-full">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

const CourseDetails = () => {
  const { token } = useSelector((state) => state.auth);
  const { role } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.data);
  const { cart } = useSelector((state) => state.cart);
  const { url, error } = useSelector((state) => state.razorpay) || {};
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [courseData, setCourseData] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);
  const [meetingCode, setMeetingCode] = useState('');
  const [isActive, setIsActive] = useState([]);
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoUrl: '' }); // State for video modal

  // Access dark mode state
  const { isDarkMode } = useContext(DarkModeContext);

  // Open video modal
  const handleSubsectionClick = (subsection) => {
    console.log("click handleSubsectionClick",subsection?.lecture?.isFree,subsection?.lecture?.secure_url)
    if (subsection?.lecture?.isFree) {
      setVideoModal({ isOpen: true, videoUrl: subsection?.lecture?.secure_url });
    }
  };

  // Close video modal
  const closeVideoModal = () => {
    setVideoModal({ isOpen: false, videoUrl: '' });
  };

  useEffect(() => {
    if (url) {
      window.location.href = url;
    }
  }, [url]);

  useEffect(() => {
    const getCourseFullDetails = async () => {
      try {
        const result = await dispatch(getFullDetailsOfCourse(courseId));
        if (result.payload) {
          setCourseData(result.payload);
        }
      } catch (error) {
        toast.error('Could not fetch course details');
        console.error('Error fetching course details:', error);
      }
    };
    getCourseFullDetails();
  }, [courseId]);

  useEffect(() => {
    if (courseData) {
      const enrolled = courseData.studentEnrolled?.find((student) => student === user?._id);
      if (enrolled) setAlreadyEnrolled(true);
    }
  }, [courseData, user?._id]);

  useEffect(() => {
    let lectures = 0;
    courseData?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0;
    });
    setTotalNoOfLectures(lectures);
  }, [courseData]);

  const handleActive = (id) => {
    setIsActive(!isActive.includes(id) ? isActive.concat(id) : isActive.filter((e) => e !== id));
  };

  const handleAddToCart = () => {
    if (token) {
      dispatch(addToCart(courseData));
      toast.success('Course added to cart!');
    } else {
      navigate('/login');
    }
  };

  const handleBuyCourse = async () => {
    if (token) {
      await dispatch(buyCourse({ courses: [courseId], user, navigate }));
      return;
    }
    setConfirmationModal({
      text1: 'You are not logged in',
      text2: 'Please log in to purchase the course.',
      btn1Text: 'Log In',
      btn2Text: 'Cancel',
      btn1Handler: () => navigate('/login'),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleJoinVideoCall = () => {
    navigate(`/${meetingCode}`);
  };

  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  if (!courseData) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-[#f9f9f9]"
      }`}>
        <div className="custom-loader"></div>
      </div>
    );
  }

  const {
    _id: course_id,
    title,
    description,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentEnrolled,
    createdAt,
  } = courseData;

  return (
    <>
      <div className={`flex flex-col-reverse lg:flex-row gap-8 px-4 pt-8 md:pt-12 pb-4 md:pb-8 max-w-[1200px] mx-auto ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-[#f9f9f9] text-gray-900"
      }`}>
        {/* Left Section (2/3 width) */}
        <div className="justify-center w-full lg:w-2/3">
          <h1 className={`mb-4 text-2xl font-bold md:text-3xl lg:text-4xl ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>{title}</h1>
          
          {/* Course Stats */}
          <div className={`flex flex-wrap items-center gap-3 mb-4 text-sm md:text-base ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            <div className="flex items-center gap-1">
              <FaUsers className="text-lg text-purple-600" />
              <span>{studentEnrolled.length} Students</span>
            </div>
            <div className="flex items-center gap-1">
              <ReactStars
                count={5}
                value={GetAvgRating(ratingAndReviews)}
                size={20}
                edit={false}
                activeColor="#ffd700"
              />
              <span>({ratingAndReviews.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <BiTime className="text-lg" />
              <span>{formatDate(createdAt)}</span>
            </div>
            
            <div className={`p-4 mb-6 shadow-sm md:p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <h2 className={`flex items-center gap-2 mb-4 text-xl font-bold md:text-2xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                <RiBookmarkLine className="text-purple-600" />
                What You Will Learn
              </h2>
              <div className={`text-sm md:text-base ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`} dangerouslySetInnerHTML={{ __html: whatYouWillLearn }} />
            </div>
          </div>

          {/* Mobile Instructor Card */}
          {/* Mobile Purchase Buttons - Fixed at bottom */}
          <div
        className={`
          fixed inset-x-0 bottom-0 z-50 p-4 border-t 
          ${isDarkMode ? "bg-[#020817]/90 border-gray-800" : "bg-white/90 border-gray-200"}
          block lg:hidden
        `}
      >
        <div className="flex gap-3 max-w-[1200px] mx-auto">
          <button
            onClick={handleAddToCart}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaCartPlus className="inline mr-2" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyCourse}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <RiMoneyDollarCircleLine className="inline mr-2" />
            Buy Now
          </button>
        </div>
      </div>
        </div>

        {/* Right Section (1/3 width) */}
        <div className="flex flex-col w-full gap-8 lg:w-1/3">
          {/* Mobile Thumbnail */}
          <div className="lg:hidden">
            <img
              src={thumbnail?.secure_url}
              alt={title}
              className="object-cover w-full h-48 rounded-lg shadow-md md:h-56"
            />
          </div>

          {/* Desktop Course Card */}
          <div className="hidden lg:block">
            <CourseDetailsCard
              course={courseData}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>

      {/* Main Content with tight spacing */}
      <div className={`px-4 lg:px-8 max-w-[1200px] mx-auto ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-[#f9f9f9] text-gray-900"
      }`}>
        {/* Course Content Section */}
        <div className={`p-4 mb-6 shadow-sm md:p-6 rounded-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`flex items-center gap-2 mb-4 text-xl font-bold md:text-2xl ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            <BiVideo className="text-purple-600" />
            Course Content
          </h2>

          <div className="space-y-3">
            {courseContent.map((section) => (
              <div
                key={section._id}
                className={`overflow-hidden border rounded-lg ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div
                  onClick={() => handleActive(section._id)}
                  className={`flex items-center justify-between p-3 cursor-pointer md:p-4 ${
                    isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MdOutlineArrowForwardIos
                      className={`transform transition-transform text-sm ${
                        isActive.includes(section._id) ? "rotate-90" : ""
                      } ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    />
                    <h3 className={`text-sm font-medium md:text-base ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>{section.title}</h3>
                  </div>
                  <span className={`text-xs md:text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {section.subSection.length} Lectures
                  </span>
                </div>

                {isActive.includes(section._id) && (
                  <div className={`border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}>
                   {section.subSection.map((subSection) => (
  <div
    key={subSection._id}
    onClick={() => handleSubsectionClick(subSection)}
    className={`flex items-center gap-2 p-2 md:p-3 cursor-pointer ${
      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
    }`}
  >
    <BiVideo className="text-purple-600 min-w-[16px]" />
    <p className={`text-xs md:text-sm ${
      isDarkMode ? "text-white" : "text-gray-900"
    }`}>{subSection.title}</p>
    {/* Add Free Badge if the video is free */}
    {subSection?.lecture?.isFree && (
      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
        Free
      </span>
    )}
  </div>
))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Section */}
        <div className={`p-4 mb-6 shadow-sm md:p-6 rounded-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`flex items-center gap-2 mb-4 text-xl font-bold md:text-2xl ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            <GiTeacher className="text-purple-600" />
            About the Instructor
          </h2>
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <img
              src={instructor.avatar?.secure_url}
              alt={instructor.fullName}
              className="object-cover w-16 h-16 rounded-full md:w-24 md:h-24"
            />
            <div className="text-center md:text-left">
              <h3 className={`text-lg font-semibold md:text-xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>{instructor.fullName}</h3>
              <p className={`mt-2 text-sm md:text-base ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {instructor.additionalDetails?.about}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={`p-4 mb-6 shadow-sm md:p-6 rounded-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`flex items-center gap-2 mb-4 text-xl font-bold md:text-2xl ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            <IoIosStar className="text-purple-600" />
            Student Reviews
          </h2>
          <CourseReviewCard reviews={ratingAndReviews} />
        </div>

        {/* Live Class Section */}
        {(alreadyEnrolled || role === 'INSTRUCTOR') && (
          <div className={`p-4 mb-6 shadow-sm md:p-6 rounded-xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <button
              onClick={() => navigate(`/course/${courseId}/live`)}
              className="w-full px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg md:w-auto md:px-6 md:py-3 md:text-base hover:bg-green-700"
            >
              <FaPlayCircle className="inline mr-2" />
              Join Live Class
            </button>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {videoModal.isOpen && (
        <VideoModal videoUrl={videoModal.videoUrl} onClose={closeVideoModal} />
      )}

      {/* <ChatComponent courseId={courseId} userId={user?._id} /> */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
};

export default CourseDetails;