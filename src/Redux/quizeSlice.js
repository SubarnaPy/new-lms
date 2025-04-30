import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helpers/axiosInstance';  // Use the axios instance

// ✅ Async Thunks
export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async ({ courseId, sectionId, quizData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/courses/createquizzes`,
        { courseId, sectionId, ...quizData }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchQuiz=createAsyncThunk(
    'quiz/fetchQuize',
    async ({ quizId }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(`/quizzes/${quizId}`);
            return data;
            } catch (error) {
                return rejectWithValue(error.response?.data || error.message);
                }
                }
                
)

export const updateQuiz = createAsyncThunk(
  'quiz/updateQuiz',
  async ({ quizId, updatedData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/quizzes/update/${quizId}`,
        updatedData
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async ({ quizId, courseId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/quizzes/delete/${quizId}`);
      return { quizId, courseId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quizzes.findIndex(
          (quiz) => quiz._id === action.payload._id
        );
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter(
          (quiz) => quiz._id !== action.payload.quizId
        );
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default quizSlice.reducer;
