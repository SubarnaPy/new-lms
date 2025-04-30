import { Suspense, useEffect,lazy } from 'react';
import  './App.css'
import {Routes, Route, useNavigate, } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
// import Footer from './Components/Footer/footer'
// import Layout from './Layouts/HomeLayout';
import HomePage from './Pages/HomePage';
import AboutUs from './Pages/AboutUSPage';
// import OpenRoute from './Components/Auth/OpenRoute';
// import LoginForm from './Components/Auth/LoginForm';
import Login from './Pages/authintigation/Login';
import Signup from './Pages/authintigation/Signup';
import VerifyOtp from './Pages/authintigation/VerifyOtp';

// import Logout from './Redux/authSlice'
import CourseList from './Pages/Course/view-all-courses';
import Dashboard from './Pages/Dashboard';
import PrivateRoute from './Pages/authintigation/PrivateRout';
import Profile from './Components/Profile/Profile';
import Settings from './Components/Settings/Setting';
import Cart from './Components/Cart/Cart';
import EnrolledCourses from './Components/Course/EnroolledCourses';
import AddCourse from './Components/Course/CreateCourse/CreateCourse';
// import MyCourses from './Components/Course/InstructorCourses';
const MyCourses = lazy(() => import("./Components/Course/InstructorCourses"));
import EditCourse from './Components/Course/EditCourse/EditCourse';
import { ACCOUNT_TYPE } from './utils/AccountType';
import CourseDetails from './Pages/Course/courseDetails';
import ViewCourse from './Pages/Course/view-course';
import VideoDetails from './Components/Course/ViewCourse/VideoDetails';
import ResetPassword from './Pages/authintigation/Forgot_password';
import AdminDashboard from './Components/Dashboard/Dashboard';
import PaymentReturnPage from './Components/Cart/paymentReturnPage';
// import LiveClass from './Components/Course/ViewCourse/LiveClass';
import VideoMeetComponent from './Components/Course/ViewCourse/LiveClass';
import { AllClasses, Announcements, BatchDetails, Description } from './Components/Course/ViewCourse/CoursePlanner';
import { getProfile } from './Redux/profileSlice';
import AssignmentPage from './Components/Course/ViewCourse/AssignmentPage';
import QuizPage from './Components/Course/ViewCourse/QuizePage';



const App = () => {

  window.global = window;

 // const {token} = useSelector(state => state.auth);
 const { data } = useSelector((state) => state.auth)
 console.log("i am a ",data.role,)
 console.log(data?.role === ACCOUNT_TYPE.STUDENT)

 const dispatch = useDispatch();
 const navigate = useNavigate(); // Make sure to initialize navigate
 const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Declare before using it in useEffect

//  useEffect(() => {
//    dispatch(getProfile());
//  }, [dispatch]);

//  useEffect(() => {
//    if (!isLoggedIn) {
//      navigate("/login");
//    }
//  }, [isLoggedIn, navigate]); 
// console.log(data, ACCOUNT_TYPE.STUDENT)

  return (
    <>
    
    <Suspense fallback={<div>Loading...</div>}>
    <Routes>
        <Route path="/" element={<HomePage />} />

        {/* <Route path="/catalog/:catalog" element={<Catalog />} /> */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={
          <Signup />
          }
        />
        <Route
          path="/forgot-password"
          element={
          <ResetPassword />
          }
        />

         {/* <Route path="/logout" element={<Logout />} />  */}


{/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

{/* <Route path="/update-password/:id" element={<ResetPassword />} /> */}
<Route path="/payment-return" element={<PaymentReturnPage />} />

<Route path="/verify-otp" element={<VerifyOtp />} />

<Route path="about-us" element={<AboutUs />} />

<Route path="/courses" element={<CourseList />}></Route>
{/* <Route path="courses/:courseId" element={<CourseDetails/>}/> */}





{/* <Route path="/course/:courseId/live" element={<LiveClass />} /> */}
{
              (data?.role === ACCOUNT_TYPE.STUDENT|| ACCOUNT_TYPE.INSTRUCTOR) && (
                <>
                <Route path="/course/:courseId/live/:roomId" element={<VideoMeetComponent />} />
                
                </>
              )
            }




<Route 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="dashboard/my-profile" element={<Profile />} />
            <Route path="dashboard/Settings" element={<Settings />} />
            
            <Route path="/dashboard/instructor" element={<AdminDashboard />} />
            {/* <Route path='/course/:courseId/live' element={<VideoMeetComponent />} /> */}


            {/* <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} /> */}

            
            

            {
              data?.role === ACCOUNT_TYPE.STUDENT && (
                <>
                <Route path="dashboard/cart" element={<Cart />} />
                <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
                </>
              )
            }

            {
              data?.role === (ACCOUNT_TYPE.INSTRUCTOR )  && (
                <>
                {/* <Route path="dashboard/instructor" element={<Instructor />} /> */}
                <Route path="dashboard/add-course" element={<AddCourse />} />
                <Route path="dashboard/my-courses" element={<MyCourses />} />
                <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
                </>
              )
            }

          </Route>

          <Route element={
            <PrivateRoute>
              <ViewCourse/>
            </PrivateRoute>
          }>

            {
              (data?.role === ACCOUNT_TYPE.STUDENT|| ACCOUNT_TYPE.INSTRUCTOR) && (
                <>
                  <Route
                    path="courses/:courseId/section/:sectionId/sub-section/:subSectionId"
                    element={<VideoDetails/>}
                  />
                  <Route path="/courses/:courseId/section/:sectionId/assignment/:assignmentId" element={<AssignmentPage />} />
            <Route path="/courses/:courseId/section/:sectionId/quiz/:quizId" element={<QuizPage />} />
          
                </>
              )
            }
          </Route> 
{/* 
        

        <Route path="/contact" element={<ContactUs />} />

        <Route path="/courses/:courseId" element={<CourseDetails />} />

        <Route path="/search/:searchQuery" element={<SearchCourse />} />

        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/settings" element={<Setting />} />
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route path="dashboard/cart" element={<Cart />} />
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrollledCourses />}
              />
              <Route
                path="dashboard/purchase-history"
                element={<PurchaseHistory />}
              />
            </>
          )}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
              <Route
                path="dashboard/instructor"
                element={<InstructorDashboard />}
              />
            </>
          )}
          {user?.accountType === ACCOUNT_TYPE.ADMIN && (
            <>
              <Route path="dashboard/admin-panel" element={<AdminPannel />} />
            </>
          )}
        </Route>

        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="/dashboard/enrolled-courses/view-course/:courseId/section/:sectionId/sub-section/:subsectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route> */}

        <Route path="*" element={<HomePage />} />

        
                <Route path="courses/:courseId/" element={<BatchDetails />}>
                  <Route path="description" element={<Description />} />
                  <Route path="section/:sectionId/sub-section/:subSectionId" element={<AllClasses />} />
                  <Route path="announcements" element={<Announcements />} />
                </Route>
              
      </Routes>
      </Suspense>
     
    </>
  );
};

export default App;
