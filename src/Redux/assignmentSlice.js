import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../../utils/axiosInstance';  // Import the axios instance
import axiosInstance from '../Helpers/axiosInstance'; 
// ✅ Create Assignment
export const createAssignment = createAsyncThunk(
  'assignment/createAssignment',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/courses/createAssignment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const fetchSubmissions = createAsyncThunk(
  "assignments/fetchSubmissions",
  async ({ assignmentId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/courses/assignments/${assignmentId}/submissions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return rejectWithValue(error.response?.data || "Failed to fetch submissions");
    }
  }
);

// Submit an assignment
export const submitAssignment = createAsyncThunk(
  "assignments/submitAssignment",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/courses/sections/assignments/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Grade an assignment (for teachers)
export const gradeAssignment = createAsyncThunk(
  "assignment/gradeAssignment",
  async ({ assignmentId, submissionId, grade, feedback,verified }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/courses/grade/gradeAssignment`, {
        assignmentId,
        submissionId,
        grade,
        feedback,
        verified,
      });
      return response.data;
    } catch (error) {
      console.error("Error grading assignment:", error);
      return rejectWithValue(error.response?.data || { message: "Something went wrong" });
    }
  }
);

// ✅ Fetch Assignments by Course ID
export const fetchAssignments = createAsyncThunk(
  'assignment/fetchAssignments',
  async ({ courseId, sectionId, assignmentId }, { rejectWithValue }) => {
    console.log("76543456789===============================================================",courseId, sectionId, assignmentId )
    try {
      const response = await axiosInstance.post('/courses/fetchAssignments',{ courseId, sectionId, assignmentId });
    const rs =await response
      console.log(rs)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Update Assignment
export const updateAssignment = createAsyncThunk(
  'assignment/updateAssignment',
  async ( formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/courses/updateAssignment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Delete Assignment
export const deleteAssignment = createAsyncThunk(
  'assignment/deleteAssignment',
  async ({assignmentId,sectionId,courseId}, { rejectWithValue }) => {

    console.log(assignmentId, sectionId)
    try {
      // const result =await axiosInstance.delete('/courses/deleteAssignment',(assignmentId,sectionId));
      const result =await axiosInstance.post('/courses/deleteAssignment',{assignmentId, sectionId,courseId});
      // const res =   await axiosInstance.post('/courses/updateCourseProgress', data);

      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAssignmentAsComplete = createAsyncThunk(
  "assignments/markAssignmentAsComplete",
  async ({ courseId, assignmentId, studentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");  // Retrieve token from localStorage

      const response = await axiosInstance.post(
        "/courses/assignments/complete",
        { courseId, assignmentId, studentId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,  // ✅ Properly send the token
          },
        }
      );
      // const res =      await axiosInstance.post('/courses/updateCourseProgress', data);
      return response.data;
    } catch (error) {
      console.error("Error marking assignment as complete:", error);
      return rejectWithValue(error.response.data);
    }
  }
);

// 🛠️ Slice Definition
const assignmentSlice = createSlice({
  name: 'assignment',
  initialState: {
    submissions: [],
    assignments: [],
    completedAssignments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        console.log(action.payload)
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Assignment
      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assignments.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = state.assignments.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
     })
     .addCase(markAssignmentAsComplete.pending, (state) => {
      state.loading = true;
    })
    .addCase(markAssignmentAsComplete.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.success) {
        state.completedAssignments.push(action.payload.assignmentId);
      }
    })
    .addCase(markAssignmentAsComplete.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default assignmentSlice.reducer;
