import { useSelector } from 'react-redux';
import RenderCartCourses from './RenderCartCourses';
import RenderTotalAmount from './RenderTotalAmount';

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-medium mb-14 text-richblack-5 dark:text-white">
        Cart
      </h1>
      <p className="pb-2 font-semibold border-b border-b-richblack-400 text-richblack-400 dark:text-gray-400">
        {totalItems} Courses in Cart
      </p>
      {totalItems > 0 ? (
        <div className="flex flex-col-reverse items-start mt-8 gap-x-10 gap-y-6 lg:flex-row">
          <RenderCartCourses />
          <RenderTotalAmount />
        </div>
      ) : (
        <p className="text-3xl text-center mt-14 text-richblack-100 dark:text-gray-300">
          Your cart is empty
        </p>
      )}
    </div>
  );
}