import { useState } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sendOtp } from "../../Redux/authSlice"
import {  SetSignupData } from "../../Redux/authSlice"
import { ACCOUNT_TYPE } from "../../utils/AccountType"
import Tab from "../../utils/Tab"
//import {setProgress} from "../../../slices/loadingBarSlice"

function SignupForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // student or instructor
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)

  const [formData, setFormData] = useState({
    fullName:"",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { fullName, email, password, confirmPassword } = formData

  // Handle input fields, when some value changes
  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  // Handle Form Submission
  const handleOnSubmit = async(e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match")
      return
    }
    const signupData = {
      ...formData,
      accountType,
    }
    console.log(signupData)

    // Setting signup data to state
    // To be used after otp verification
    await dispatch(SetSignupData(signupData))
    console.log(signupData)
    // Send OTP to user for verification
    const res = await dispatch(sendOtp(formData.email, navigate))
    if (res) {
      navigate("/verify-otp")
    }


    // Reset
    setFormData({
      fullName:"",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setAccountType(ACCOUNT_TYPE.STUDENT)
  }

  // data to pass to Tab component
  const tabData = [
    {
      id: 1,
      tabName: "Student",
      type: ACCOUNT_TYPE.STUDENT,
    },
    {
      id: 2,
      tabName: "Instructor",
      type: ACCOUNT_TYPE.INSTRUCTOR,
    },
  ]

  return (
    <div>
      {/* Tab */}
      <Tab tabData={tabData} field={accountType} setField={setAccountType} />
      {/* Form */}
      <form onSubmit={handleOnSubmit} className="flex flex-col w-full gap-y-4">
      
        <label className="w-full">
          <p className="mb-1 text-sm text-gray-700">
            FullName <sup className="text-red-500">*</sup>
          </p>
          <input
            required
            type="text"
            name="fullName"
            value={fullName}
            onChange={handleOnChange}
            placeholder="Enter email address"
            className="w-full p-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-blue-500"
          />
        </label>
        
        <label className="w-full">
          <p className="mb-1 text-sm text-gray-700">
            Email Address <sup className="text-red-500">*</sup>
          </p>
          <input
            required
            type="text"
            name="email"
            value={email}
            onChange={handleOnChange}
            placeholder="Enter email address"
            className="w-full p-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-blue-500"
          />
        </label>
        <div className="flex gap-x-4">
          <label className="relative">
            <p className="mb-1 text-sm text-gray-700">
              Create Password <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleOnChange}
              placeholder="Enter Password"
              className="w-full p-3 pr-10 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-blue-500"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={24} />
              ) : (
                <AiOutlineEye fontSize={24} />
              )}
            </span>
          </label>
          <label className="relative">
            <p className="mb-1 text-sm text-gray-700">
              Confirm Password <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleOnChange}
              placeholder="Confirm Password"
              className="w-full p-3 pr-10 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-blue-500"
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible fontSize={24} />
              ) : (
                <AiOutlineEye fontSize={24} />
              )}
            </span>
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 mt-6 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}  

export default SignupForm