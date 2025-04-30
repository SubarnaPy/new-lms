import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Grid, TextField, MenuItem, Paper, Typography, Avatar } from "@mui/material";
import { updateAdditionalDetails } from "../../Redux/profileSlice"; // Make sure the action is correct

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"];

export default function EditProfile() {
  const user = useSelector((state) => state.profile.data); // Assuming the user's data is in profile.data
  const { token } = useSelector((state) => state.auth); // For accessing the authentication token if needed
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // Set the default values of the form based on the current user data
  React.useEffect(() => {
    setValue("fullName", user.fullName);
    setValue("about", user?.additionalDetails?.about);
    setValue("dateOfBirth", user?.additionalDetails?.dateOfBirth);
    setValue("gender", user?.additionalDetails?.gender);
    setValue("email", user.email);
  }, [user, setValue]);

  const submitProfileForm = async (data) => {
    try {
      console.log(data);
      const res = await dispatch(updateAdditionalDetails(data));
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
      

      <form onSubmit={handleSubmit(submitProfileForm)}>
        <Grid container spacing={4}>
          {/* Profile Picture */}
         

          {/* Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              defaultValue={user.fullName}
              {...register("fullName", { required: "Name is required" })}
              error={!!errors.fullName}
              helperText={errors.fullName ? errors.fullName.message : ""}
              className="dark:bg-gray-700 dark:text-white"
              InputLabelProps={{ className: "dark:text-white" }}
              InputProps={{ className: "dark:text-white" }}
            />
          </Grid>

          {/* About */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="About"
              name="about"
              defaultValue={user.about}
              {...register("about")}
              multiline
              rows={4}
              className="dark:bg-gray-700 dark:text-white"
              InputLabelProps={{ className: "dark:text-white" }}
              InputProps={{ className: "dark:text-white" }}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              defaultValue={user.email}
              {...register("email")}
              disabled
              className="dark:bg-gray-700 dark:text-white"
              InputLabelProps={{ className: "dark:text-white" }}
              InputProps={{ className: "dark:text-white" }}
            />
          </Grid>

          {/* Date of Birth */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              defaultValue={user?.additionalDetails?.dateOfBirth}
              {...register("dateOfBirth")}
              InputLabelProps={{ shrink: true, className: "dark:text-white" }}
              className="dark:bg-gray-700 dark:text-white"
              InputProps={{ className: "dark:text-white" }}
            />
          </Grid>

          {/* Gender */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Gender"
              name="gender"
              defaultValue={user?.additionalDetails?.gender}
              {...register("gender")}
              className="dark:bg-gray-700 dark:text-white"
              InputLabelProps={{ className: "dark:text-white" }}
              InputProps={{ className: "dark:text-white" }}
            >
              {genders.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  className="dark:bg-gray-700 dark:text-white"
                >
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} className="flex justify-end gap-4">
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
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}