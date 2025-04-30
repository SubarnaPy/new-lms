import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import HomeLayout from "../../../Layouts/HomeLayout";
import Announcements from "../../Course/ViewCourse/Announcement";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import CourseDetails from "../../../Pages/Course/courseDetails";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { getFullDetailsOfCourse } from "../../../Redux/courseSlice";

function BatchDetails() {
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const location = useLocation();
  const [courseData, setCourseData] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.data);
  const enrolledCourses = user?.courses || [];
console.log(user.role,enrolledCourses.some((course) => course._id === courseId))
  const isEnrolled = enrolledCourses.some((course) => course._id === courseId) || user.role=='INSTRUCTOR';
  console.log(isEnrolled);

  useEffect(() => {
    let isMounted = true;
    const getCourseFullDetails = async () => {
      try {
        const result = await dispatch(getFullDetailsOfCourse(courseId));
        if (result.payload && isMounted) setCourseData(result.payload);
      } catch (error) {
        toast.error("Could not fetch course details");
        console.error("Error:", error);
      }
    };
    getCourseFullDetails();
    return () => {
      isMounted = false;
    };
  }, [courseId, dispatch]);

  if (!courseData) {
    return <div>Loading...</div>;
  }

  const handleEnrollClick = () => {
    console.log("Redirect to enrollment process");
    setShowEnrollModal(false);
  };

  const handleClassesClick = (e) => {
    if (!isEnrolled) {
      e.preventDefault(); // Prevent navigation
      setShowEnrollModal(true);
    }
  };

  return (
    <HomeLayout>
      <div className="mx-auto font-sans p-7 max-full dark:bg-gray-900 dark:text-gray-200">
        {/* Enrollment Modal */}
        <Dialog open={showEnrollModal} onClose={() => setShowEnrollModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md p-6 bg-[#f9f9f9] dark:bg-gray-800 rounded-xl">
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-200">
                Course Enrollment Required
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600 dark:text-gray-400">
                You need to enroll in this course to access the classes.
              </Dialog.Description>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-gray-700 rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollClick}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Enroll Now
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        <div className="mb-5">
          <div className="flex items-start justify-between gap-4 mb-2 sm:flex-col md:flex-row">
            <div>
              <h1 className="mb-4 text-2xl font-bold text-blue-800 dark:text-blue-400 animate-fade-in-up">
                {courseData?.title || "Course Details"}
              </h1>
              <p className="mb-2 text-gray-600 dark:text-gray-400">
                {courseData?.createdAt ? new Date(courseData.createdAt).toLocaleDateString() : ""}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {courseData?.ratingAndReviews?.length ? `${courseData.ratingAndReviews.length}/5` : "No ratings"}
              </div>
              <button className="px-4 py-2 mt-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700">
                {isEnrolled ? "ENROLLED" : "ENROLL NOW"}
              </button>
            </div>
          </div>

          <nav className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-6">
              <NavLink
                to="description"
                className={({ isActive }) =>
                  `pb-3 px-1 text-sm font-medium ${
                    isActive
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                Description
              </NavLink>

              {isEnrolled ? (
                <NavLink
                  to={`/courses/${courseData._id}/section/${courseData.courseContent?.[0]?._id}/sub-section/${courseData.courseContent?.[0]?.subSection?.[0]?._id}`}
                  className={({ isActive }) =>
                    `pb-3 px-1 text-sm font-medium ${
                      isActive
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`
                  }
                >
                  All Classes
                </NavLink>
              ) : (
                <NavLink
                  to="#"
                  onClick={handleClassesClick}
                  className="px-1 pb-3 text-sm font-medium text-gray-500 cursor-pointer dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  All Classes
                </NavLink>
              )}

              <NavLink
                to="announcements"
                className={({ isActive }) =>
                  `pb-3 px-1 text-sm font-medium ${
                    isActive
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                Announcements
              </NavLink>
            </div>
          </nav>

          <Routes>
            <Route path="description" element={<Description />} />
            <Route
              path="classes/*"
              element={
                isEnrolled ? (
                  <AllClasses isEnrolled={isEnrolled} />
                ) : isLoggedIn ? (
                  <Navigate to={`/courses/${courseId}`} state={{ from: location }} replace />
                ) : (
                  <Navigate to="/login" state={{ from: location }} replace />
                )
              }
            />
            <Route path="announcements" element={<Announcements />} />
          </Routes>
        </div>

        {/* Batch Includes Section */}
        
      </div>
    </HomeLayout>
  );
}

function Description() {
  return <CourseDetails />;
}
function AllClasses() {
  return <div>Classes Component</div>;
}

export { Announcements, AllClasses, Description, BatchDetails };