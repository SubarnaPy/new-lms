import { Button } from '@material-tailwind/react';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { buyCourse } from '../../Redux/razorpaySlice';


const RenderTotalAmount = () => {
  const { total, cart } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const { url, error } = useSelector((state) => state.razorpay) || {};
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBuyCourse = async () => {
    const courses = cart.map((course) => course._id);
    await dispatch(buyCourse({ courses, user, navigate }));
  };
   useEffect(() => {
      if (url) {
        window.location.href = url;
      }
    }, [url]);

  return (
    <div className="min-w-[280px] rounded-md border-[1px] border-richblack-700 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-lg">
      {/* Total Label */}
      <p className="mb-1 text-sm font-medium text-richblack-700 dark:text-gray-300">
        Total:
      </p>

      {/* Total Amount */}
      <p className="mb-6 text-3xl font-medium text-richblack-900 dark:text-yellow-400">
        ₹ {total}
      </p>

      {/* Buy Now Button */}
      <Button
        onClick={handleBuyCourse}
        className="justify-center w-full transition-all bg-yellow-500 dark:bg-yellow-400 text-richblack-900 dark:text-gray-900 hover:bg-yellow-600 dark:hover:bg-yellow-500"
      >
        Buy Now
      </Button>
    </div>
  );
};

export default RenderTotalAmount;