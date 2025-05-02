import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helpers/axiosInstance';

// Async Thunks
export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async ({ courseId, sectionId, quizData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/courses/createquizzes', {
        courseId,
        sectionId,
        ...quizData
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchQuiz = createAsyncThunk(
  'quiz/fetchQuiz',
  async ({ courseId, sectionId, quizId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/courses/getQuizBySection', {
        courseId,
        sectionId,
        quizId
      });

      if (!data.success || !data.data) {
        return rejectWithValue('Failed to fetch quiz');
      }

      const foundQuiz = data.data.find(quiz => quiz._id === quizId);
      if (!foundQuiz) {
        return rejectWithValue('Quiz not found in response');
      }

      return foundQuiz;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quiz/updateQuiz',
  async ({ quizId, updatedData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/quizzes/update/${quizId}`, updatedData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    currentQuiz: null,
    loading: false,
    error: null
  },
  reducers: {
    clearQuizState: (state) => {
      state.currentQuiz = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Quiz
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Quiz
      .addCase(fetchQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const quiz = action.payload;
        
        // Update current quiz
        state.currentQuiz = quiz;
        
        // Update quizzes array
        const index = state.quizzes.findIndex(q => q._id === quiz._id);
        if (index !== -1) {
          state.quizzes[index] = quiz;
        } else {
          state.quizzes.push(quiz);
        }
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentQuiz = null;
      })

      // Update Quiz
      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const updatedQuiz = action.payload;
        
        // Update quizzes array
        const index = state.quizzes.findIndex(q => q._id === updatedQuiz._id);
        if (index !== -1) {
          state.quizzes[index] = updatedQuiz;
        }
        
        // Update current quiz if it's the updated one
        if (state.currentQuiz?._id === updatedQuiz._id) {
          state.currentQuiz = updatedQuiz;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const { quizId } = action.payload;
        
        // Remove from quizzes array
        state.quizzes = state.quizzes.filter(q => q._id !== quizId);
        
        // Clear current quiz if it's the deleted one
        if (state.currentQuiz?._id === quizId) {
          state.currentQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearQuizState } = quizSlice.actions;
export default quizSlice.reducer;