

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";
import { setCompletedLectures } from "./viewCourseSlice";
import { Navigate, useNavigate } from "react-router-dom";


const initialState = {
  coursesData: [],
  step: 1,
  loading: false,
  course: null,
  editCourse: false,
  paymentLoading: false,
  topCourses: [],
  announcements: [],
  FullDetailsOfCourse:[]
};

export const fetchTopCourses = createAsyncThunk(
  "courses/fetchTopCourses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/courses/top-courses");

      console.log(data)
      return data.courses;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Function to get all courses
export const getAllCourses = createAsyncThunk("/course", async () => {
  try {
    const res = axiosInstance.get("/courses/getAllCourses");
    toast.promise(res, {
      loading: "Loading courses data...",
      success: "Courses loaded successfully",
      error: "Failed to get courses",
    });
    // console.log(res);

    const response = await res;
    return response.data.courses;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});


//fetch all courses
export const fetchCourseCategories = createAsyncThunk(
  '/categories/get',
  async (data, { rejectWithValue }) => {
    try {
      // console.log("data", data);
      const res = await axiosInstance.get("/courses/showAllCategories");
      
     console.log("res-----------------------------------------------------------", res);
     // toast.promise("course is being created")
      //toast.success("Course created successfully");
      console.log("Course created successfully----------------------------------",res.data.data);
      return res.data?.data;
      
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to create course";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }

)

// Function to create a new course
export const addCourseDetails = createAsyncThunk(
  "/course/create",
  async (data, { rejectWithValue }) => {
    try {
      console.log("Data being sent:", data);
      
      // Make the API call
      let res = axiosInstance.post("/courses/createCourse", data);
      toast.promise(res, {
        loading: "in progress...",
        success: "Course created successfully!",
        error: "Failed to create account",
      })

      res=await res
       console.log(res)

      // Return course data
      return res.data?.data;
    } catch (error) {
      // Handle error and reject with a meaningful message
      const errorMsg =
        error?.response?.data?.message || "Failed to create course";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Function to delete a course
export const deleteCourse = createAsyncThunk("/course/delete", async (data, { rejectWithValue }) => {
  try {
    console.log(data);
    let res =axiosInstance.post("courses/deleteCourse",data);
    toast.promise(res, {
      loading: "in progress...",
      success: "Course deleated successfully!",
      error: "Failed to create account",
    })
    

    res=await res
    return await res.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    const errorMsg = error?.response?.data?.message || "Failed to create course";
    toast.error(errorMsg);
    return rejectWithValue(errorMsg);
  }
});


export const editCourseDetails = createAsyncThunk(
  'course/edit', 
  async (data, { rejectWithValue }) => {
    try {
      const res =  axiosInstance.post('/courses/editCourse', data);
      toast.promise(res, {
        loading: "in progress...",
        success: "Course editd successfully!",
        error: "Failed to create account",
      })  // Send formData to the backend
      console.log(res)
      const resp=await res
      return await resp.data?.data;  // Return the updated course data
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Failed to update course';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Function to create a new section
export const createSection = createAsyncThunk("/courses/addSection", async (data, { rejectWithValue }) => {
  try {
    let res = await axiosInstance.post("/courses/addSection", data);
  

    const response = await res;
    // getting response resolved here
    
    return response.data.course;
  } catch (error) {
    const errorMsg = error?.response?.data?.message || "Failed to create section";
    toast.error(errorMsg);
    return rejectWithValue(errorMsg);
  }
});

// Function to update an existing section
export const updateSection = createAsyncThunk("/section/update", async (data, { rejectWithValue }) => {
  try {
    let res =axiosInstance.post('/courses/updateSection', data);
    toast.promise(res, {
      loading: "in progress...",
      success: "Course created successfully!",
      error: "Failed to create account",
    })
    
    res=await res
    console.log(res.data?.data)
    return await res.data?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data?.message);
  }
});

// Function to search for courses by title or category
export const searchCourse = createAsyncThunk(
  'course/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/courses/course/search`, {
        params: { searchQuery: query },
      });

      toast.success("Courses found");
      return response.data.courses; // Assuming `data.courses` contains the courses
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while searching.");
      return rejectWithValue(error.response?.data?.message || "An error occurred while searching.");
    }
  }
);
// export const deleteSection = createAsyncThunk(
//   "/section/delete",
//   async (data, { rejectWithValue }) => {
//     try {
//       console.log(data)
//       const res = await axiosInstance.post("/courses/deleteSection", data);
//       console.log(res);
//       console.log(res.data);

//       // Assuming the backend sends the updated course in res.data
//       toast.success("Section deleted successfully");
//       return res.data?.data; // Adjust based on the actual structure
//     } catch (error) {
//       const errorMsg = error?.response?.data?.message || "Failed to delete section";
//       toast.error(errorMsg);
//       return rejectWithValue(errorMsg);
//     }
//   }
// );
export const deleteSection = createAsyncThunk("/Section/delete", async (data, { rejectWithValue }) => {
  try {
    console.log("Request Data:", data);
    const res = await axiosInstance.post("courses/deleteSection", data);
    console.log("API Response:", res);
    return res?.data?.data || {}; // Adjust based on API response
} catch (error) {
    const errorMsg = error?.response?.data?.message || "Failed to delete section";
    console.error("Error Response:", error?.response);
    toast.error(errorMsg);
    return rejectWithValue(errorMsg);
}

});
// Function to create a new sub-section
export const createSubSection = createAsyncThunk(
  "/subSections/create",
  async (data, { rejectWithValue }) => {
    console.log(...data)
    try {
      let res =  axiosInstance.post("/courses/addSubSection", data);
      toast.promise(res, {
         loading: "in progress...",
        success: "Course created successfully!",
        error: "Failed to create account",
      })
      res=await res
      console.log(res)
      
      return await res.data?.data;
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to create sub-section";
      toast.error(errorMsg);
      // return rejectWithValue(errorMsg);
    }
  }
);

// Function to delete a sub-section
export const deleteSubSection = createAsyncThunk("/subSection/delete", async (data, { rejectWithValue }) => {
  try {
    console.log("data", data);
    const res =await axiosInstance.post("courses/deleteSubSection",data);
    console.log("data", res);

  // toast.success("Subsection deleted successfully")
   console.log("data", res);

    
    return res.data?.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.message || "Failed to create sub-section";
    toast.error(errorMsg);
    return rejectWithValue(errorMsg);
  }
});
// Function to update an existing sub-section
export const updateSubSection = createAsyncThunk(
  "/subSections/update",
  async (data) => {
    console.log("formdata", [...data]);
    // console.log("data",data);
    try {
      const res = await axiosInstance.post("/courses/updateSubSection",data);
      console.log("success", res);

     

      const response=await res
      console.log("success", res);
      return response.data?.data;
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to update sub-section";
      toast.error(errorMsg);
      // return rejectWithValue(errorMsg);
    }
  }
);
//get instructor courses
export const fetchInstructorCourses = createAsyncThunk(
  "/courses/instructorCourses",
  async ( ) => {
    // console.log(instructorId)
    try {
      const res = await axiosInstance.get('/courses/instructorCourses');
    //   toast.promise(res, {
    //     loading: "in progress...",
    //    success: "Course created successfully!",
    //    error: "Failed to create account",
    //  })
     const response=await res
     console.log(response)
      return response.data; // Assuming `data.courses` contains the courses
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while fetching courses.");
      // return rejectWithValue(error.response?.data?.message || "An error occurred while fetching courses.");
    }
  }
);

// //get enrolled courses
// export const getUserEnrolledCourses = createAsyncThunk(
//   "/courses/instructorCourses",
//   async (instructorId, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get('/courses/instructorCourses', {
        
//       });

//       toast.success("Courses loaded successfully");
//       return response.data; // Assuming `data.courses` contains the courses
//     } catch (error) {
//       toast.error(error.response?.data?.message || "An error occurred while fetching courses.");
//       return rejectWithValue(error.response?.data?.message || "An error occurred while fetching courses.");
//     }
//   }
// );




//get fullcoursedetails slice

export const getFullDetailsOfCourse = createAsyncThunk(
  "/courses/fullCourseDetails",
  async (courseId, { rejectWithValue }) => {
    

    console.log("Request Body:", courseId );
    try {
      const response = await axiosInstance.post('/courses/fullCourseDetails',  {courseId} );
         console.log(response)
      console.log("course getFullDetailsOfCourse Response:", response.data.data.updatedCourse);

      toast.success("Course loaded successfully");
      return response.data?.data?.updatedCourse; // Return course details
    } catch (error) {
      console.error("Error status:", error.response?.status);
      
      // Handle unauthorized errors
      if (error.response?.status === 401 || error.response?.status === 402) {
        console.log("Navigating to login page due to unauthorized access");
        Navigate('/login'); // Redirect to the login page
      }

      toast.error(error.response?.data?.message || "An error occurred while fetching course details.");
      return rejectWithValue(error.response?.data?.message || "An error occurred while fetching course details.");
    }
  }
);

//markLectureAsComplete
export const markLectureAsComplete = createAsyncThunk(
  "/courses/markLectureAsComplete",
  async (data, { rejectWithValue,dispatch }) => {
    try {
      const res = await axiosInstance.post('/courses/updateCourseProgress', data);
      toast.success("Lecture marked as complete");
      console.log(res.data)
      console.log(res)
      // dispatch(setCompletedLectures(data)); 
      return res.data;
      
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to mark lecture as complete";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);


export const createRating = createAsyncThunk(
  "/courses/markLectureAsComplete",
  async (data, { rejectWithValue }) => {
    try {
      console.log("i am hare")
      const res = await axiosInstance.post('/courses/createRating', data);
      toast.success("Lecture marked as complete");
      console.log(res.data)
      console.log(res)
      // dispatch(setCompletedLectures(data)); 
      return res.data?.data;
      
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to mark lecture as complete";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const getallReating =createAsyncThunk(
  "/getallReating",
  async () => {
    try {
      console.log("i am hare")
      const res = await axiosInstance.get('/courses/getReviews');
      toast.success("Lecture marked as complete");
      console.log(res.data)
      console.log(res)
      // dispatch(setCompletedLectures(data)); 
      return res.data?.data;
      
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to mark lecture as complete";
      toast.error(errorMsg);
      
    }

  }
)

export const getAnnouncements = createAsyncThunk(
  "announcement/getAnnouncements",
  async ({ courseId }, { rejectWithValue }) => {
    try {
      console.log(courseId);
      const response = await axiosInstance.get(`/announcements/${courseId}`); // ✅ Pass as URL param
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching announcements");
    }
  }
);


// Create Announcement
export const createAnnouncement = createAsyncThunk(
  "announcement/createAnnouncement",
  async ({ message,username,courseId,isLive,roomId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/announcements", { message,username,courseId,isLive,roomId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
      






const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    setCourse: (state, action) => {
     // console.log("course getFullDetailsOfCourse Response:", action.payload.data);

      state.course = action.payload;
    },
    setEditCourse: (state, action) => {
      state.editCourse = action.payload;
    },
    setPaymentLoading: (state, action) => {
      state.paymentLoading = action.payload;
    },
    resetCourseState: (state) => {
      state.step = 1;
      state.course = null;
      state.editCourse = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllCourses.fulfilled, (state, action) => {
      if (action.payload) {
        console.log(action.payload)
        state.coursesData = [...action.payload];
      }
    });
    builder.addCase(getAllCourses.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getAllCourses.rejected, (state, action) => {
      state.loading = false
    });

    builder.addCase(searchCourse.fulfilled, (state, action) => {
      if (action.payload) {
        state.coursesData = [...action.payload];
      }
    });
    

    // Handle fulfilled state for createSection
    builder.addCase(createSection.fulfilled, (state, action) => {
      state.loading = false;
      });
      builder.addCase(createSection.pending, (state, action) => {
        state.loading = true;
        });
        builder.addCase(createSection.rejected, (state, action) => {
          state.loading = false;
          });

    // Handle fulfilled state for updateSection
    builder.addCase(updateSection.fulfilled, (state, action) => {
      state.loading = false;
    }) 
    builder.addCase(updateSection.pending, (state, action) => {
      state.loading = true;
    })  
    builder.addCase(updateSection.rejected, (state, action) => {
      state.loading = false;
    })  
     // Handle fulfilled state for deleteSection
    builder.addCase(deleteSection.fulfilled, (state, action) => {
      state.loading = false;
      console.log(action.payload)
      state.course=action.payload
      // Logic to remove the section from state after deletion
      // state.course.courseContent = state.course.courseContent.filter(section => section._id !== action.meta.arg);
    });
    builder.addCase(deleteSection.pending, (state, action) => {
      state.loading = true;
      // Logic to remove the section from state after deletion
      // console.log(action.payload)
    
    });
    builder.addCase(deleteSection.rejected, (state, action) => {
      state.loading = false;
      // Logic to remove the section from state after deletion
      // state.course.courseContent = state.course.courseContent.filter(section => section._id !== action.meta.arg);
    });
     // Handle fulfilled state for createSubSection
     builder.addCase(createSubSection.fulfilled, (state, action) => {
      // Find the section in which the sub-section needs to be added
     
    });

    // Handle fulfilled state for deleteSubSection
    builder.addCase(deleteSubSection.fulfilled, (state, action) => {
      // Logic to remove the sub-section from the state after deletion
     
    });
     // Handle fulfilled state for updateSubSection
     builder.addCase(updateSubSection.fulfilled, (state, action) => {
      state.loading = false;
      // Find the section and update the specific sub-section
    
    });
    builder.addCase(updateSubSection.pending, (state, action) => {
      state.loading = true;
      // Find the section and update the specific sub-section
    
    });
    builder.addCase(updateSubSection.rejected, (state, action) => {
      state.loading = false;
      // Find the section and update the specific sub-section
    
    });


    //builder for edit course details
    builder.addCase(editCourseDetails.fulfilled, (state, action) => {
      //tate.course = action.payload;
    });
    //builder for get instructor courses
    builder.addCase(fetchInstructorCourses.fulfilled, (state, action) => {
       state.loading = false;
      console.log(action.payload.courses);
      if (action.payload.courses.length>0) {
        state.coursesData = action.payload.courses;
      }
      //tate.course = action.payload;
    });
    builder.addCase(fetchInstructorCourses.pending, (state, action) => {
       state.loading = true;
    });
    builder.addCase(fetchTopCourses.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTopCourses.fulfilled, (state, action) => {
      console.log(action.payload);
      state.loading = false;
      state.topCourses = action.payload;
      console.log(state.topCourses)
    });
    builder.addCase(fetchTopCourses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(getAnnouncements.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAnnouncements.fulfilled, (state, action) => {
      state.loading = false;
      state.announcements = action.payload;
    });
    builder.addCase(getAnnouncements.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(createAnnouncement.fulfilled, (state, action) => {
      state.announcements.unshift(action.payload); // Add new announcement
    });
    builder.addCase(getFullDetailsOfCourse.rejected, (state, action) => {
      state.loading = false;
      });
      builder.addCase(getFullDetailsOfCourse.pending, (state) => {
        state.loading = true;
        });
        builder.addCase(getFullDetailsOfCourse.fulfilled, (state, action) => {
          state.loading = false;
          state.FullDetailsOfCourse = action.payload;
          });
  
  
  },
});

export const {
  setStep,
  setCourse,
  setEditCourse,
  setPaymentLoading,
  resetCourseState,
} = courseSlice.actions;

export default courseSlice.reducer;

