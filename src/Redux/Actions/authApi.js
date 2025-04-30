import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance";
import toast from "react-hot-toast";

export const sendOtpApi = async(email)=>{ axiosInstance.post("/user/sendotp", { email })};
export const loginApi = async(data)=>{
    const res=  axiosInstance.post("/user/login", data )
    return res
};


    
    
