import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { buyCourse, resetPaymentState } from '../../Redux/razorpaySlice';
import { getFullDetailsOfCourse } from '../../Redux/courseSlice';
import GetAvgRating from '../../utils/AvgRating';
import ConfirmationModal from '../../Components/Modal/ConfirmationModal';
import { formatDate } from '../../utils/formatDate';
import ReactStars from 'react-rating-stars-component';
import { IoIosCheckmarkCircle, IoIosInformationCircleOutline, IoIosStar } from 'react-icons/io';
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
    <HomeLayout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Course Header */}
        <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Course Title and Info */}
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-purple-900/50 text-purple-300' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {courseData?.category || 'Development'}
                  </span>
                  {courseData?.status === 'Published' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-green-900/30 text-green-300' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      Live
                    </span>
                  )}
                </div>
                
                <h1 className={`text-3xl font-bold tracking-tight mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <ReactStars
                      count={5}
                      value={GetAvgRating(ratingAndReviews)}
                      size={20}
                      edit={false}
                      activeColor={isDarkMode ? '#c4b5fd' : '#8b5cf6'}
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      ({ratingAndReviews.length} ratings)
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300/50" />
                  <div className={`flex items-center gap-1 text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <FaUsers className="w-4 h-4" />
                    <span>{studentEnrolled.length} students</span>
                  </div>
                </div>

                {/* Instructor Card */}
                <div className={`p-4 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                } border`}>
                  <div className="flex items-center gap-4">
                    <img
                      src={instructor.avatar?.secure_url}
                      alt={instructor.fullName}
                      className="w-12 h-12 rounded-full border-2 border-purple-500"
                    />
                    <div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Created by
                      </p>
                      <h3 className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {instructor.fullName}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrollment Card */}
              <div className="w-full lg:w-96">
                <div className={`sticky top-24 p-6 rounded-xl shadow-lg ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } border`}>
                  <div className="mb-6">
                    <div className="flex items-end gap-2 mb-2">
                      <span className={`text-3xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${price}
                      </span>
                    </div>
                  </div>

                  {alreadyEnrolled ? (
                    <button
                      onClick={() => navigate(`/course/${courseId}/lectures`)}
                      className="w-full py-3.5 px-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <FaPlayCircle className="w-5 h-5" />
                      Continue Learning
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleBuyCourse}
                        className="w-full py-3.5 px-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium mb-3 transition-all"
                      >
                        Enroll Now
                      </button>
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-3.5 px-6 rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50/20 font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <FaCartPlus className="w-5 h-5" />
                        Add to Cart
                      </button>
                    </>
                  )}

                  <div className="mt-6 space-y-3">
                    <div className={`flex items-center gap-3 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <MdVerified className="w-5 h-5 text-green-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <BiTime className="w-5 h-5 text-purple-500" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-3 space-y-12">
              {/* Course Content */}
              <section>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Course Content
                </h2>
                
                <div className="space-y-2">
                  {courseContent.map((section) => (
                    <div
                      key={section._id}
                      className={`rounded-lg overflow-hidden ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      } shadow-sm`}
                    >
                      <button
                        onClick={() => handleActive(section._id)}
                        className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <MdOutlineArrowForwardIos
                            className={`transform transition-transform ${
                              isActive.includes(section._id) ? 'rotate-90' : ''
                            } ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          />
                          <h3 className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {section.title}
                          </h3>
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {section.subSection.length} lectures • 30 min
                        </span>
                      </button>

                      {isActive.includes(section._id) && (
                        <div className={`border-t ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          {section.subSection.map((subSection) => (
                            <div
                              key={subSection._id}
                              onClick={() => handleSubsectionClick(subSection)}
                              className={`flex items-center justify-between px-5 py-3 cursor-pointer ${
                                isDarkMode 
                                  ? 'hover:bg-gray-700' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <BiVideo className={`w-5 h-5 ${
                                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                }`} />
                                <span className={`${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {subSection.title}
                                </span>
                              </div>
                              {subSection?.lecture?.isFree && (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  isDarkMode
                                    ? 'bg-green-900/30 text-green-300'
                                    : 'bg-green-100 text-green-700'
                                }`}>
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
              </section>

              {/* What You'll Learn */}
              <section>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  What You'll Learn
                </h2>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {whatYouWillLearn.split('\n').map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <IoIosCheckmarkCircle
                        className={`flex-shrink-0 mt-1 ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}
                      />
                      <p>{point}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Student Reviews
                </h2>
                <div className="space-y-6">
                  {ratingAndReviews.map((review) => (
                    <div
                      key={review._id}
                      className={`p-6 rounded-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      } shadow-sm`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {review.user.name}
                          </h4>
                          <ReactStars
                            count={5}
                            value={review.rating}
                            size={18}
                            edit={false}
                            activeColor={isDarkMode ? '#c4b5fd' : '#8b5cf6'}
                          />
                        </div>
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {review.review}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Highlights */}
              <div className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}>
                <h3 className={`font-medium mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  This Course Includes
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BiVideo className={`w-5 h-5 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {totalNoOfLectures} on-demand videos
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCertificate className={`w-5 h-5 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Downloadable resources
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BsGlobe className={`w-5 h-5 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      English subtitles
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress (for enrolled students) */}
              {alreadyEnrolled && (
                <div className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                  <h3 className={`font-medium mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Your Progress
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full"
                          style={{ width: '30%' }}
                        />
                      </div>
                      <span className="text-sm text-purple-600">30%</span>
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      15 of 50 lessons completed
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {videoModal.isOpen && (
          <VideoModal videoUrl={videoModal.videoUrl} onClose={closeVideoModal} />
        )}
      </div>
    </HomeLayout>
  );
};


export default CourseDetails;