import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import rzplogo from "../Assetss/Images/rzp.png";
// config();
// import express from 'express';
// import{config} from 'dotenv';
import axiosInstance from "../Helpers/axiosInstance";
import { useDispatch } from "react-redux";

// import { loadScript } from "@paypal/paypal-js";

const initialState = {
  
    loading: false,
    success: false,
    url: null,
    error: null,
  key: "",
  subscription_id: "",
  isPaymentVerified: false,
  allPayments: {},
  finalMonths: {},
  monthlySalesRecord: [],
  subscription:"",
  cart: localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : [],
total: localStorage.getItem("total")
  ? JSON.parse(localStorage.getItem("total"))
  : 0,
totalItems: localStorage.getItem("totalItems")
  ? JSON.parse(localStorage.getItem("totalItems"))
  : 0,
};

// function to get the api key
// export const getRazorPayId = createAsyncThunk("/razorPayId/get", async () => {
//   try {
//     const res = await axiosInstance.post("/payments/razorpay-key");
//     console.log(res.data);
//     return res.data;
    
//   } catch (error) {
//     toast.error("Failed to load data");
//   }
// });
// function loadScript (src) {
//   return new Promise((resolve) => {
//     const script = document.createElement("script");
//     script.src = src;
//     script.onload = () => {
//       resolve(true);
//     };
//     script.onerror = () => {
//       resolve(false);
//     };
//     document.body.appendChild(script);
//   });
// }


// function to purchase the course bundle
// function to purchase the course bundle
// import { createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../utils/axiosInstance'; // Ensure you have axiosInstance configured
// import { toast } from 'react-toastify';
// import { resetCart } from './cartSlice'; // Ensure you have resetCart action

// Action to initiate course purchase
// export const buyCourse = createAsyncThunk(
//   "/purchaseCourse",
//   async ({ courses, user, navigate }, { rejectWithValue, dispatch }) => {
//     try {

//       console.log(courses,user);
//       const re = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
//       console.log("Purchase initiated:", [courses], user);

//       // Fetch Razorpay Key
//       const razorpayResponse = await dispatch(getRazorPayId()).unwrap();
//       console.log("Razorpay Key Fetched:", razorpayResponse.key);

//       // Capture payment details
//       const response = await axiosInstance.post("/payments/capturePayment", { courses });
//       const res = await response?.data?.paymentResponse;
//       console.log("Payment Details Fetched:", res);

//       // Razorpay options
//       const options = {
//         key: razorpayResponse.key,
//         currency: res.currency,
//         amount: res.amount, // Amount in paisa
//         order_id: res.id,
//         name: "Study Notion",
//         description: "Thank you for purchasing the course",
//         image: rzplogo,
//         prefill: {
//           name: user?.fullName,
//           email: user?.email,
//         },
//         handler: async function (response) {
//           console.log("Payment Success Response:", response);
//           await dispatch(verifyUserPayment( response, courses, navigate ));
//         },
//         theme: {
//           color: "#686CFD",
//         },
//       };

//       // Initialize Razorpay
//       const paymentObject = new window.Razorpay(options);
//       console.log(paymentObject)

//       // // Listen for modal closure
//       // paymentObject.on("modal.close", function (response) {
//       //   console.log("Payment modal closed by user:", response);
//       //   toast.info("Payment modal closed. Please complete the payment to enroll in the course.");
//       // });

//       paymentObject.open();
//       console.log("Razorpay modal opened");

//       // Handle payment failure
//       paymentObject.on("payment.failed", function (response) {
//         console.error("Payment Failed:", response.error.description);
//         toast.error(`Payment Failed: ${response.error.description}`);
//       });

//       console.log(options)

     
//     } catch (error) {
//       console.error("Payment Error:", error);
//       toast.error(error?.response?.data?.message || "Payment Error");
//       return rejectWithValue(error?.response?.data);
//     }
//   }
// );


// // Action to verify user payment
// export const verifyUserPayment = createAsyncThunk(
//   "/verifyPayment",
//   async ( response, courses, navigate , { dispatch, rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post("/payments/verify", {
//         razorpay_payment_id: response.razorpay_payment_id,
//         razorpay_order_id: response.razorpay_order_id,
//         razorpay_signature: response.razorpay_signature,
//         courses: courses.courses || courses,
//       });

//       if (res.data.success) {
//         toast.success("Payment Successful");
//         navigate("/dashboard/courses");
//         dispatch(resetCart());
//         console.log("Payment Verification Response:", res.data);
//         return res.data;
//       } else {
//         toast.error("Payment verification failed");
//         return rejectWithValue({ message: "Payment verification failed" });
//       }
//     } catch (error) {
//       console.error("Payment Verification Error:", error);
//       if (error.response?.data?.message === "User already enrolled") {
//         toast.error("You are already enrolled in this course.");
//       } else {
//         toast.error(error?.response?.data?.message || "Payment verification failed");
//       }
//       return rejectWithValue(error?.response?.data);
//     }
//   }
// );


// import { createAsyncThunk } from "@reduxjs/toolkit";

// import axiosInstance from "../axiosInstance";  // Assuming this is set up correctly

export const buyCourse = createAsyncThunk(
  'payment/buyCourse',
  async ({courses,user}, { rejectWithValue }) => {
    try {
      console.log(courses)
      const {data} = await axiosInstance.post(
        '/payments/capturePayment',
        { courses },
        { withCredentials: true }
      );

      console.log(data)
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate purchase');
    }
  }
);

// Async thunk for verifying payment
export const verifyUserPayment = createAsyncThunk(
  'payment/verifyPayment',
  async (sessionId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        '/payments/verify',
        { session_id: sessionId },
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);



// function to verify the user payment
// export const verifyUserPayment = createAsyncThunk(
//   "/verifyPayment",
//   async ({response,courses,navigate},dispatch) => {
//     console.log(response,courses)
//     try {
//       const res = await axiosInstance.post("/payments/verify", 
//       //   {
//       //   razorpay_payment_id: paymentDetail.razorpay_payment_id,
//       //   razorpay_subscription_id: paymentDetail.razorpay_subscription_id,
//       //   razorpay_signature: paymentDetail.razorpay_signature,
//       // }
//       {
//         razorpay_payment_id: response.razorpay_payment_id,
//         razorpay_order_id: response.razorpay_order_id,
//         razorpay_signature: response.razorpay_signature,
//         courses:courses.courses || courses,
//     }
//       );

//       toast.success("Payment Successfull");
//       navigate("/dashboard/enrolled-courses");
//       dispatch(resetCart());

      
//       console.log(res);
//       return res?.data;

//     } catch (error) {
//       toast.error("error?.response?.data?.message");
//     }
//   }
// );

// function to get all the payment record
export const getPaymentRecord = createAsyncThunk("paymentrecord", async () => {
  try {
    const res = axiosInstance.get("/payments?count=100");
    toast.promise(res, {
      loading: "Getting the payments record...",
      success: (data) => {
        return data?.data?.message;
      },
      error: "Failed to get payment records",
    });

    const response = await res;
    console.log(response)
    return response.data;
  } catch (error) {
    toast.error("Operation failed:",error);
  }
});

// function to cancel the course bundle subscription
export const cancelCourseBundle = createAsyncThunk(
  "/cancelCourse",
  async () => {
    try {
      const res = axiosInstance.post("/payments/unsubscribe");
      toast.promise(res, {
        loading: "Unsubscribing the bundle...",
        success: "Bundle unsubscibed successfully",
        error: "Failed to unsubscibe the bundle",
      });
      const response = await res;
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }
);

const razorpaySlice = createSlice({
  name: "razorpay",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.success = false;
      state.url = null;
      state.error = null;
    },
    addToCart: (state, action) => {
      const course = action.payload
      const index = state.cart.findIndex((item) => item._id === course._id)

      if (index >= 0) {
        // If the course is already in the cart, do not modify the quantity
        toast.error("Course already in cart")
        return
      }
      // If the course is not in the cart, add it to the cart
      state.cart.push(course)
      // Update the total quantity and price
      state.totalItems++
      state.total += course.price
      // Update to localstorage
      localStorage.setItem("cart", JSON.stringify(state.cart))
      localStorage.setItem("total", JSON.stringify(state.total))
      localStorage.setItem("totalItems", JSON.stringify(state.totalItems))
      // show toast
      toast.success("Course added to cart")
    },
    removeFromCart: (state, action) => {
      const courseId = action.payload
      const index = state.cart.findIndex((item) => item._id === courseId)

      if (index >= 0) {
        // If the course is found in the cart, remove it
        state.totalItems--
        state.total -= state.cart[index].price
        state.cart.splice(index, 1)
        // Update to localstorage
        localStorage.setItem("cart", JSON.stringify(state.cart))
        localStorage.setItem("total", JSON.stringify(state.total))
        localStorage.setItem("totalItems", JSON.stringify(state.totalItems))
        // show toast
        toast.success("Course removed from cart")
      }
    },
    resetCart: (state) => {
      state.cart = []
      state.total = 0
      state.totalItems = 0
      // Update to localstorage
      localStorage.removeItem("cart")
      localStorage.removeItem("total")
      localStorage.removeItem("totalItems")
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(getRazorPayId.rejected, () => {
      //   toast.error("Failed to get razor pay id");
      // })
      // .addCase(getRazorPayId.fulfilled, (state, action) => {
      //   state.key = action?.payload?.key;
      // })
      .addCase(buyCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(buyCourse.fulfilled, (state, action) => {
             
           console.log(action.payload);

        state.loading = false;
        state.url = action.payload.url;

        // state.subs/cription_id = action?.payload?.subscription_id;
      })
      .addCase(verifyUserPayment.fulfilled, (state, action) => {
        // state.data=action.payload
        state.loading = false;
        state.success = true;
        console.log(action.payload.updatedUser);
        toast.success(action?.payload?.message);
        state.isPaymentVerified = action?.payload?.success;
        console.log(state.isPaymentVerified);
       
      })
      .addCase(verifyUserPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUserPayment.rejected, (state, action) => {
        toast.success("User already enrolled");
        console.log(action.payload)
        state.razorpay.isPaymentVerified = action?.payload?.success;
        console.log(state.razorpay.isPaymentVerified);
      })
      .addCase(getPaymentRecord.fulfilled, (state, action) => {
        state.allPayments = action?.payload?.allPayments;
        state.finalMonths = action?.payload?.finalMonths;
        state.monthlySalesRecord = action?.payload?.monthlySalesRecord;


        
      });
  },
});

export const {addToCart,resetPaymentState, removeFromCart, resetCart} = razorpaySlice.actions;
export default razorpaySlice.reducer;
