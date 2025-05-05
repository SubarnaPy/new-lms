

import axios from "axios";

// const BASE_URL = "https://lms4-7d49.onrender.com/api/v1";

// const BASE_URL = "https://new-mern-backend-cp5h.onrender.com/api/v1";
const BASE_URL="https://code-execution-api-5llj.onrender.com/"
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Add request interceptor to include token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ensure token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
