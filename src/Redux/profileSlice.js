import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";
import { setLoggedOut } from "./authSlice";
// import { console } from "inspector";

// Initial State
const initialState = {
  data: JSON.parse(localStorage.getItem("data")) || {},
  enrolledCourses: [],
};

// Function to add token to headers
const getAuthHeaders = (getState) => {
  const token = getState().auth.token; // Retrieve token from Redux store
  if (!token) throw new Error("No token found");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ** Get Profile **
export const getProfile = createAsyncThunk(
  "/profile/get",
  async (_, { rejectWithValue, getState,dispatch }) => {
    try {
      const res = axiosInstance.get("/profile/getUserDetails", getAuthHeaders(getState));

      toast.promise(res, {
        loading: "Loading profile...",
        success: "Profile loaded successfully",
        error: "Failed to fetch profile",
      });

      const response = await res;
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
      console.log(error)

      console.log(error.response?.status)
      if (error.response?.status === 402) {
        dispatch(setLoggedOut());
      }
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

// ** Get Enrolled Courses **
export const getUserEnrolledCourses = createAsyncThunk(
  "/courses/getEnrolled",
  async (_, { rejectWithValue, getState }) => {
    try {
      const res = axiosInstance.get("/profile/getEnrolledCourses", getAuthHeaders(getState));

      toast.promise(res, {
        loading: "Loading enrolled courses...",
        success: "Enrolled courses loaded successfully",
        error: "Failed to load enrolled courses",
      });

      const response = await res;
      return response.data.user;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      return rejectWithValue(error?.response?.data);
    }
  }
);

// ** Update Profile Details **
export const updateAdditionalDetails = createAsyncThunk(
  "profile/updateAdditionalDetails",
  async (data, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.put("/profile/updateProfile", data, getAuthHeaders(getState));

      toast.success("Profile updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

// ** Update Password **
export const updatePassword = createAsyncThunk(
  "profile/updatePassword",
  async (data, { rejectWithValue, getState }) => {
    try {
      const res = axiosInstance.put("/profile/updatePassword", data, getAuthHeaders(getState));

      toast.promise(res, {
        loading: "Updating password...",
        success: "Password updated successfully",
        error: "Failed to update password",
      });

      const response = await res;
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ** Update Profile Picture (Pfp) **
export const updatePfp = createAsyncThunk(
  "profile/updatePfp",
  async (formData, { rejectWithValue, getState }) => {
    try {
      console.log("Starting profile picture update...");

      const response = await toast.promise(
        axiosInstance.put("/profile/updateProfile", formData, getAuthHeaders(getState)),
        {
          loading: "Updating profile picture...",
          success: "Profile picture updated successfully",
          error: "Failed to update profile picture",
        }
      );

      console.log(response.data.newuser);

      return response.data;
    } catch (error) {
      console.error("Update failed:", error.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "An error occurred.");
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ** Delete Account **
export const deleteAccount = createAsyncThunk(
  "profile/deleteAccount",
  async (_, { rejectWithValue, getState }) => {
    try {
      const res = axiosInstance.delete("/profile/delete", getAuthHeaders(getState));

      toast.promise(res, {
        loading: "Deleting account...",
        success: "Account deleted successfully",
        error: "Failed to delete account",
      });

      const response = await res;
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ** Profile Slice **
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.fulfilled, (state, action) => {
        console.log(action);
        if (!action?.payload?.data) {
          localStorage.clear();
          state.isLoggedIn = false;
          state.data = {};
          state.role = "";
          state.token = null;
        }
        localStorage.setItem("data", JSON.stringify(action.payload.data));
        state.data = action?.payload?.data;
      })
      .addCase(getProfile.rejected, (state, action) => {
        // action.meta.arg.dispatch(setLoggedOut());
        console.log("Profile fetch failed:", action);
      
        // Clear local storage if the profile fetch fails
        localStorage.clear();
      
        // Reset state to indicate user is not logged in
        state.isLoggedIn = false;
        state.data = {};
        state.role = "";
        state.token = null;
        
        // Store error message in state for UI feedback
        state.error = action.payload || "Failed to fetch profile";
      })
      .addCase(updateAdditionalDetails.fulfilled, (state, action) => {
        localStorage.setItem("data", JSON.stringify(action?.payload.newuser));
        state.data = action?.payload.newuser;
      })
      .addCase(getUserEnrolledCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserEnrolledCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrolledCourses = action.payload;
      })
      .addCase(getUserEnrolledCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load courses";
      })
      .addCase(updatePfp.fulfilled, (state, action) => {
        
      })
  }
});

export default profileSlice.reducer;
