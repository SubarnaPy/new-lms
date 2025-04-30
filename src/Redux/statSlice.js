import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
  allUserCount: 0,  // Default count of all users
    totalRevenue: 0,   // Default total revenue
    totalUniqueStudents: 0, 
    loading: false, // Default unique student count
    courses: [],
};

// function to get the stats data from backend
export const getStatsData = createAsyncThunk("getstat", async () => {
  try {
    const res = axiosInstance.get("/miscellaneous/admin/stats/users");
    toast.promise(res, {
      loading: "Getting the stats...",
      success: "sat get",
      error: "Failed to load stats",
    });

   

    const response = await res;
    // console.log(res);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

const statSlice = createSlice({
  name: "stat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getStatsData.fulfilled, (state, action) => {
      console.log(action.payload)
      state.allUserCount = action?.payload?.data?.allUserCount;
      state.totalRevenue= action?.payload?.data?.totalRevenue
      state.totalUniqueStudents = action?.payload?.data?.totalUniqueStudents;
      state.courses= action?.payload?.data?.courses
    });
  },
});


        

export const {} = statSlice.actions;
export default statSlice.reducer;
