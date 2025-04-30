import { configureStore } from "@reduxjs/toolkit";
 import authSliceReducer from "./authSlice";
 import courseSliceReducer from "./courseSlice";
import lectureSliceReducer from "./lectureSlice";
import razorpaySliceReducer from "./razorpaySlice";
import statSliceReducer from "./statSlice";
import profileSliceReducer from "./profileSlice";
 import cartSliceReducer from "./cartSlice";
// import ViewCourse from "../Pages/courses/ViewCourse";
import viewCourseSlice from "./viewCourseSlice"
import liveClassSlice from './liveClassSlice'
import assignmentSliceReducer from './assignmentSlice'

// No need to import redux-thunk separately because it's included in the default middleware of @reduxjs/toolkit

const store = configureStore({
  reducer: {
     auth: authSliceReducer,
    viewCourse:viewCourseSlice,
     course: courseSliceReducer,
    lecture: lectureSliceReducer,
    razorpay: razorpaySliceReducer,
    stat: statSliceReducer,
    profile: profileSliceReducer,
    cart:cartSliceReducer,
    liveClass:liveClassSlice,
    assignment:assignmentSliceReducer
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Optional: Disable serializable checks if needed
    }),
});

export default store;
