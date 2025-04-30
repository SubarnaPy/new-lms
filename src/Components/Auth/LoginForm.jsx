import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { login } from "../../Redux/authSlice"
import { getProfile } from "../../Redux/profileSlice"


function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    const res= await dispatch(login(formData, navigate))
    if(res?.payload?.success){
      console.log("i am here==================================")
      dispatch(getProfile())
      navigate('/')
    }
  }

  return (
    <form
      onSubmit={handleOnSubmit}
      className="flex flex-col w-full mt-6 gap-y-4"
    >
      <label className="w-full">
        <p className="mb-1 text-xl  leading-[1.375rem]">
          Email Address <sup className="text-black">*</sup>
        </p>
        <input
          required
          type="text"
          name="email"
          value={email}
          onChange={handleOnChange}
          placeholder="Enter email address"
          style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
          }}
          className="w-full border-black rounded-[0.5rem] bg-slate-600 p-[12px] text-white"
        />
      </label>
      <label className="relative">
        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-xl">
          Password <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={handleOnChange}
          placeholder="Enter Password"
          style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
          }}
          className="w-full rounded-[0.5rem] bg-slate-600 p-[12px] pr-12 text-white"
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] z-[10] cursor-pointer"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
          ) : (
            <AiOutlineEye fontSize={24} fill="#AFB2BF" />
          )}
        </span>
        <Link to="/forgot-password">
          <p className="mt-1 ml-auto text-slate-900 max-w-max">
            Forgot Password
          </p>
        </Link>
        <Link to="/signup">
          <p className="mt-1 ml-auto text-blue-600 max-w-max">
            Create Account
          </p>
        </Link>
        
      </label>
      
      <button 
        type="submit"
        className="mt-6 rounded-[8px] yellowButton py-[8px] px-[12px] font-medium text-richblack-900"
      >
        Sign In
      </button>
    </form>
  )
}

export default LoginForm