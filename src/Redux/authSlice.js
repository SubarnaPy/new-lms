import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";
import { loginApi, sendOtpApi } from "./Actions/authApi";
import { Await, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProfile } from "./profileSlice";

// Initial state
const initialState = {
  isLoggedIn: localStorage.getItem("isLoggedIn") || false,
  data: JSON.parse(localStorage.getItem("data")) || {},
  role: localStorage.getItem("role") || "",
  token: localStorage.getItem("token") || null,
  signupData: null,
  loading: false,
  error: null,
  success: false,
};

// Function to handle sending OTP
export const sendOtp = createAsyncThunk("auth/sendOtp", async (email, { rejectWithValue }) => {
  try {
     
    const res = sendOtpApi(email);
    toast.promise(res, {
      loading: "Sending OTP...",
      success: "OTP sent successfully!",
      error: "Failed to send OTP",
    })
   
    return res.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data);
  }
});

// Function to handle signup
// Function to handle signup
export const createAccount = createAsyncThunk("auth/signup", async (data, { rejectWithValue }) => {
  try {
    console.log(data)
    const res =  axiosInstance.post("/user/register", data);
    toast.promise(res, {
      loading: "Signing up...",
      success: "Account created successfully!",
      error: "Failed to create account",
    })
    return res;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error.response?.data?.message || error.message);

  }
});


// Function to handle login
// Function to handle login

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  const dispatch=useDispatch
  try {
    const resp = await axiosInstance.post("/user/login", data);

    toast.success("Logged in successfully!");
    
    return resp.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Login failed!");
    return rejectWithValue(error?.response?.data?.message || error.message);
  }
});



// Function to handle logout
// Function to handle logout
export const Logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
   

    // Directly pass the axios promise to toast.promise
    const res=  axiosInstance.post("/user/logout") // Pass the promise here
    toast.promise(res, {
      loading: "logging out...",
      success: "Account created successfully!",
      error: "Failed to create account",
    })
   

    return res.data; // Return the data after successful logout
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to log out");
    return rejectWithValue(error.response?.data); // Return error for reducer handling
  }
});



// Function to fetch user data
export const getUserData = createAsyncThunk("/user/details", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/user/me");
    console.log("response", res.data.user);
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    return rejectWithValue(error?.response?.data);
  }
});

// Function to handle forgot password
// Function to handle forgot password
export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/user/reset", { email });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});


// Function to handle password reset
// Function to handle password reset
export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ password, confirmPassword, resetToken }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/user/reset-password', {
      password,
      confirmPassword,
      resetToken,
    });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const changePassword = createAsyncThunk(
  "/auth/changePassword",
  async (userPassword) => {
    try {
      let res = axiosInstance.post("/user/change-password", userPassword);

      await toast.promise(res, {
        loading: "Loading...",
        success: (data) => {
          return data?.data?.message;
        },
        error: "Failed to change password",
      });

      // getting response resolved here
      res = await res;
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }
);




// Slice definition
// Slice definition
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    
      setLoggedOut: (state) => {
        localStorage.clear();
        state.isLoggedIn = false;
        state.data = {};
        state.role = "";
        state.token = null;
      toast.success("please log in again");
      },
    
    SetSignupData(state, action) {
      // console.log("SetSignupData", state, action.payload);
      state.signupData= action.payload;
      // console.log("SetSignupData", action.payload);

    },
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setUserData(state, action) {
      console.log("SetUserData", state, action.payload);
      state.data = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
      
        state.loading = false;
        console.log(action?.payload)
        state.isLoggedIn = true;
        state.role = action?.payload?.user?.role;
        // Update localStorage
        localStorage.setItem("data",JSON.stringify( action?.payload?.user));
       
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", action.payload.user.role);
        localStorage.setItem("token", action.payload.token);
        state.isLoggedIn = true;
        state.role = action?.payload?.user?.role;
        
        state.token = action.payload.token;
        state.data = action?.payload?.user;
         


      
      })
      .addCase(login.rejected, (state, action) => {
        console.log(action.payload)
        state.loading = false;
        state.error = action.payload || "Login failed";
        
        // Show error toast
        // toast.error(state.error);
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        console.log("Action payload:", action.payload);
        localStorage.setItem("data",JSON.stringify( action.payload.user));
        state.loading = false;
         localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", action.payload.user.role);
        // Show success toast
        toast.success(action.payload.message || "Login successful");
      })

      // Handle create account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Show success toast
        // toast.success(action.payload.message || "Account created successfully");
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create account";

        // Show error toast
        toast.error(state.error);
      })

      // Handle forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Show success toast
        toast.success(action.payload.message || "Reset link sent successfully");
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send reset link";

        // Show error toast
        toast.error(state.error);
      })

      // Handle reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;

        // Show success toast
        toast.success("Password reset successful");
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to reset password";

        // Show error toast
        toast.error(state.error);
      })

      // Handle logout
      // Handle user logout
    .addCase(Logout.fulfilled, (state) => {
    console.log("i am aaaaaaaaaaaa")
      localStorage.clear();
      state.isLoggedIn = false;
      state.data = {};
      state.role = "";
      state.token = null;
      toast.success("Logged out successfully");
      
     
    })
    .addCase(Logout.rejected, (state, action) => {
      toast.error("Failed to log out");
    })
  },
});

// Export actions and reducer
export const { SetSignupData, resetAuthState,setLoggedOut } = authSlice.actions;
export default authSlice.reducer;