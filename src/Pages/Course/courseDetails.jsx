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
      <div className={`min-h-screen bg-[#020817] text-gray-100`}>
        {/* Course Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
          <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Course Title and Details */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-400">
                  <span className="text-sm font-medium text-indigo-300">Online Course</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl bg-gradient-to-r from-indigo-200 to-cyan-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                
                {/* Course Metadata */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FaUsers className="w-5 h-5 text-indigo-400" />
                    <span>{studentEnrolled.length} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReactStars
                      count={5}
                      value={GetAvgRating(ratingAndReviews)}
                      size={20}
                      edit={false}
                      activeColor="#818cf8"
                    />
                    <span>({ratingAndReviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdVerified className="w-5 h-5 text-emerald-400" />
                    <span>Certificate included</span>
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-4">
                    <img
                      src={instructor.avatar?.secure_url}
                      alt={instructor.fullName}
                      className="w-12 h-12 rounded-full border-2 border-indigo-400"
                    />
                    <div>
                      <h3 className="font-semibold text-indigo-200">Created by</h3>
                      <p className="text-lg font-medium">{instructor.fullName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Thumbnail and CTAs */}
              <div className="w-full lg:w-96 space-y-6">
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={thumbnail?.secure_url}
                    alt={title}
                    className="w-full h-60 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="px-4 py-2 rounded-full bg-indigo-600 backdrop-blur-sm flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="w-5 h-5" />
                      <span className="font-bold">${price}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {alreadyEnrolled ? (
                    <button 
                      onClick={() => navigate(`/course/${courseId}/lectures`)}
                      className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <FaPlayCircle className="w-5 h-5" />
                      Continue Learning
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleBuyCourse}
                        className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors font-semibold"
                      >
                        Enroll Now
                      </button>
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <FaCartPlus className="w-5 h-5" />
                        Add to Cart
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-indigo-300">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whatYouWillLearn.split('\n').map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                      <IoIosCheckmarkCircle className="flex-shrink-0 w-5 h-5 text-emerald-400 mt-1" />
                      <p className="text-gray-300">{point}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Course Curriculum */}
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-indigo-300">Course Content</h2>
                <div className="space-y-2">
                  {courseContent.map((section) => (
                    <div key={section._id} className="border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleActive(section._id)}
                        className="w-full px-5 py-4 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <MdOutlineArrowForwardIos
                            className={`transform transition-transform ${
                              isActive.includes(section._id) ? 'rotate-90' : ''
                            }`}
                          />
                          <h3 className="text-lg font-medium">{section.title}</h3>
                        </div>
                        <span className="text-sm text-gray-400">
                          {section.subSection.length} lectures
                        </span>
                      </button>
                      
                      {isActive.includes(section._id) && (
                        <div className="p-4 space-y-2 bg-black/20">
                          {section.subSection.map((subSection) => (
                            <div
                              key={subSection._id}
                              onClick={() => handleSubsectionClick(subSection)}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <BiVideo className="w-5 h-5 text-indigo-400" />
                                <span className="text-gray-300">{subSection.title}</span>
                              </div>
                              {subSection?.lecture?.isFree && (
                                <span className="px-2 py-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 rounded-full">
                                  Free Preview
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

              {/* Reviews Section */}
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-indigo-300">Student Reviews</h2>
                <div className="space-y-4">
                  {ratingAndReviews.map((review) => (
                    <div key={review._id} className="p-6 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className="font-medium">{review.user.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <ReactStars
                              count={5}
                              value={review.rating}
                              size={16}
                              edit={false}
                              activeColor="#818cf8"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300">{review.review}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Course Highlights */}
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-indigo-300">Course Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BiTime className="w-5 h-5 text-indigo-400" />
                    <span>Last updated: {formatDate(createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BiVideo className="w-5 h-5 text-indigo-400" />
                    <span>{totalNoOfLectures} lectures</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BsGlobe className="w-5 h-5 text-indigo-400" />
                    <span>English</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCertificate className="w-5 h-5 text-indigo-400" />
                    <span>Certificate of Completion</span>
                  </div>
                </div>
              </div>

              {/* Live Class Section */}
              {(alreadyEnrolled || role === 'INSTRUCTOR') && (
                <div className="p-6 bg-gradient-to-br from-indigo-600/30 to-cyan-500/20 rounded-xl border border-indigo-400/20">
                  <h3 className="text-lg font-semibold mb-4 text-cyan-300">Live Sessions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <BsCalendar className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="font-medium">Next Session</p>
                        <p className="text-sm text-gray-400">Coming soon</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/course/${courseId}/live`)}
                      className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <FaPlayCircle className="w-5 h-5" />
                      Join Live Class
                    </button>
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