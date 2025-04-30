import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../Redux/authSlice";
import { Button, Paper, TextField, Typography } from "@mui/material";

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitPasswordForm = async (data) => {
    try {
      const res = await dispatch(changePassword(data));
      if (res.payload.success) {
        navigate("/dashboard/my-profile");
      }
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
    }
  };

  return (
    <Paper
      elevation={3}
      className="max-w-[800px] mx-auto p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
    >
      <Typography
        variant="h5"
        className="mb-6 text-center text-gray-900 dark:text-gray-100"
      >
        Update Password
      </Typography>

      <form onSubmit={handleSubmit(submitPasswordForm)} className="space-y-6">
        {/* Current Password */}
        <div className="relative">
          <TextField
            fullWidth
            type={showOldPassword ? "text" : "password"}
            label="Current Password"
            name="oldPassword"
            id="oldPassword"
            placeholder="Enter Current Password"
            {...register("oldPassword", { required: true })}
            className="dark:bg-gray-700 dark:text-white"
            InputLabelProps={{ className: "dark:text-white" }}
            InputProps={{ className: "dark:text-white" }}
          />
          <span
            onClick={() => setShowOldPassword((prev) => !prev)}
            className="absolute right-3 top-[14px] z-[10] cursor-pointer dark:text-gray-300"
          >
            {showOldPassword ? (
              <AiOutlineEyeInvisible fontSize={24} />
            ) : (
              <AiOutlineEye fontSize={24} />
            )}
          </span>
          {errors.oldPassword && (
            <span className="text-sm text-red-500">
              Please enter your Current Password.
            </span>
          )}
        </div>

        {/* New Password */}
        <div className="relative">
          <TextField
            fullWidth
            type={showNewPassword ? "text" : "password"}
            label="New Password"
            name="newPassword"
            id="newPassword"
            placeholder="Enter New Password"
            {...register("newPassword", { required: true })}
            className="dark:bg-gray-700 dark:text-white"
            InputLabelProps={{ className: "dark:text-white" }}
            InputProps={{ className: "dark:text-white" }}
          />
          <span
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-3 top-[14px] z-[10] cursor-pointer dark:text-gray-300"
          >
            {showNewPassword ? (
              <AiOutlineEyeInvisible fontSize={24} />
            ) : (
              <AiOutlineEye fontSize={24} />
            )}
          </span>
          {errors.newPassword && (
            <span className="text-sm text-red-500">
              Please enter your New Password.
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/dashboard/my-profile")}
            className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            Update
          </Button>
        </div>
      </form>
    </Paper>
  );
}