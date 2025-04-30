import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { toast } from 'react-hot-toast';
import { ACCOUNT_TYPE } from '../../utils/AccountType';
import { addToCart } from '../../Redux/cartSlice';
import { BiSolidRightArrow, BiShareAlt } from 'react-icons/bi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { FaCartPlus, FaPlayCircle } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

const CourseDetailsCard = ({ course, setConfirmationModal, handleBuyCourse }) => {
  const { cart } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.profile.data);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { thumbnail: ThumbnailImage, price: CurrentPrice } = course;

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error('Instructors cannot purchase courses.');
      return;
    }
    if (token) {
      dispatch(addToCart(course));
      toast.success('Course added to cart!');
      return;
    }
    setConfirmationModal({
      text1: 'You are not logged in',
      text2: 'Please log in to add this course to your cart.',
      btn1Text: 'Log In',
      btn2Text: 'Cancel',
      btn1Handler: () => navigate('/login'),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleShare = () => {
    copy(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="flex w-[300px] left-0 flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-3xl transform hover:-translate-y-2">
      {/* Course Thumbnail */}
      <div className="relative">
        <img
          src={course?.thumbnail?.secure_url}
          alt="Course Thumbnail"
          className="object-cover w-full h-48 rounded-lg shadow-md"
        />
        {/* Verified Badge */}
        {course?.status === 'Published' && (
          <div className="absolute flex items-center gap-1 px-2 py-1 text-sm text-white bg-green-500 rounded-full top-2 right-2">
            <MdVerified className="text-white" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Course Price */}
      <div className="flex items-center gap-2 text-3xl font-bold text-richblack-800 dark:text-white">
        <RiMoneyDollarCircleLine className="text-4xl text-yellow-500" />
        <span>Rs. {CurrentPrice}</span>
      </div>

      {/* Buy Now / Go to Course Button */}
      <button
        className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${
          user && course?.studentEnrolled.includes(user?._id)
            ? 'bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
        } transition-all duration-300 transform hover:scale-105`}
        onClick={
          user && course?.studentEnrolled.includes(user?._id)
            ? () => navigate('/dashboard/enrolled-courses')
            : handleBuyCourse
        }
      >
        <FaPlayCircle className="text-xl" />
        {user && course?.studentEnrolled.includes(user?._id)
          ? 'Go to Course'
          : 'Buy Now'}
      </button>

      {/* Add to Cart Button (if not enrolled) */}
      {!course?.studentEnrolled.includes(user?._id) && (
        <button
          className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all duration-300 transform rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 hover:scale-105"
          onClick={handleAddToCart}
        >
          <FaCartPlus className="text-xl" />
          Add to Cart
        </button>
      )}

      {/* Money-Back Guarantee */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <RiMoneyDollarCircleLine className="text-green-500" />
        <span>30-Day Money-Back Guarantee</span>
      </div>

      {/* Course Includes Section */}
      <div>
        <p className="flex items-center gap-2 mb-4 text-xl font-semibold text-richblack-800 dark:text-white">
          <BiSolidRightArrow className="text-yellow-500" />
          <span>This Course Includes:</span>
        </p>
        <div className="flex flex-col gap-3">
          {JSON.parse(course?.instructions).map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <BiSolidRightArrow className="text-yellow-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share Button */}
      <div className="text-center">
        <button
          className="flex items-center gap-2 mx-auto text-yellow-500 transition-all duration-300 hover:text-yellow-600"
          onClick={handleShare}
        >
          <BiShareAlt className="text-xl" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default CourseDetailsCard;