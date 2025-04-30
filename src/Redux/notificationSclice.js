// notificationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../Helpers/axiosInstance';

//const ENDPOINT = process.env.NEXT_PUBLIC_API_URI || '';

// Async thunk to fetch all notifications
export const getAllNotifications = createAsyncThunk(
  'notifications/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/notifications`);
      return response.data; // assuming the response has a `data` property with the notifications
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to update the notification status
export const updateNotificationStatus = createAsyncThunk(
  'notifications/updateStatus',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/notifications/${notificationId}', {
        status: 'read',
      });
      return response.data; // assuming the updated notification data is returned
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  notifications: [],
  status: 'idle',
  error: null,
};

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload.notifications; // assuming payload contains a `notifications` array
      })
      .addCase(getAllNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateNotificationStatus.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        state.notifications = state.notifications.map((notification) =>
          notification._id === updatedNotification._id ? updatedNotification : notification
        );
      });
  },
});

export default notificationsSlice.reducer;
