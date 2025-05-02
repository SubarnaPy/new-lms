import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helpers/axiosInstance';

// All Async Thunks
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
      const { data } = await axiosInstance.put(
        `/quizzes/${quizId}`,
        updatedData
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/quizzes/${quizId}`);
      return quizId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const markQuizeAsComplete = createAsyncThunk(
  'course/markAssignmentAsComplete',
  async ({ courseId, quizId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/courses/quize/complete`,
        { quizId, courseId }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const submitQuizAnswers = createAsyncThunk(
  'quiz/submit',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/courses/submitQuize`, {
        quizId,
        answers
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Submission failed');
    }
  }
);

// Slice with Complete State Management
const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    currentQuiz: null,
    loading: false,
    error: null,
    operationStatus: 'idle',
    submission: {
      status: 'idle',
      result: null,
      error: null
    }
  },
  reducers: {
    resetQuizState: (state) => {
      state.currentQuiz = null;
      state.error = null;
      state.operationStatus = 'idle';
    },
    resetSubmission: (state) => {
      state.submission = {
        status: 'idle',
        result: null,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Quiz
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.operationStatus = 'succeeded';
        state.quizzes.push(action.payload.data);
      })

      // Fetch Quiz
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

      // Update Quiz
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.operationStatus = 'succeeded';
        const updatedQuiz = action.payload.data;
        
        // Update quizzes array
        state.quizzes = state.quizzes.map(quiz => 
          quiz._id === updatedQuiz._id ? updatedQuiz : quiz
        );
        
        // Update current quiz if needed
        if (state.currentQuiz?._id === updatedQuiz._id) {
          state.currentQuiz = updatedQuiz;
        }
      })

      // Delete Quiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.operationStatus = 'succeeded';
        const deletedId = action.payload;
        
        // Remove from quizzes array
        state.quizzes = state.quizzes.filter(q => q._id !== deletedId);
        
        // Clear current quiz if deleted
        if (state.currentQuiz?._id === deletedId) {
          state.currentQuiz = null;
        }
      })

      // Submit Answers
      .addCase(submitQuizAnswers.pending, (state) => {
        state.submission.status = 'loading';
        state.submission.error = null;
      })
      .addCase(submitQuizAnswers.fulfilled, (state, action) => {
        state.submission.status = 'succeeded';
        state.submission.result = action.payload.data;
      });
  }
});

export const { resetQuizState, resetSubmission } = quizSlice.actions;
export default quizSlice.reducer;