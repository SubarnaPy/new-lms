import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RiEditBoxLine } from 'react-icons/ri';
import { formatDate } from '../../utils/formatDate';
import { Avatar, Typography, Grid, Paper, Divider } from '@mui/material';
import { Email, Phone, LocationOn, Male, Person, CalendarToday } from '@mui/icons-material';
import { Button } from '@material-tailwind/react';

const Profile = () => {
  const user = useSelector((state) => state.profile.data);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <Paper
        elevation={3}
        className="max-w-4xl p-8 mx-auto bg-white shadow-xl rounded-2xl dark:bg-gray-800"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Avatar
            src={user?.avatar?.secure_url}
            alt="Profile Picture"
            className="w-32 h-32 mb-4 border-4 border-white shadow-lg dark:border-gray-700"
          />
          <Typography variant="h4" className="font-bold text-black dark:text-white">
            {user?.fullName}
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-400">
            {user?.role}
          </Typography>
        </div>

        <Divider className="my-6 dark:bg-gray-600" />

        {/* Info Section */}
        <Grid container spacing={4} className="mb-6">
          <Grid item xs={12} sm={6}>
            <div className="flex items-center p-4 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Email className="text-blue-500 dark:text-blue-400" />
              <Typography variant="body1" className="text-black dark:text-white">
                {user?.email}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className="flex items-center p-4 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Phone className="text-blue-500 dark:text-blue-400" />
              <Typography variant="body1" className="text-black dark:text-white">
                {user?.additionalDetails?.contact || 'Add contact'}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className="flex items-center p-4 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Person className="text-blue-500 dark:text-blue-400" />
              <Typography variant="body1" className="text-black dark:text-white">
                {user?.additionalDetails?.gender || 'Add gender'}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className="flex items-center p-4 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <CalendarToday className="text-blue-500 dark:text-blue-400" />
              <Typography variant="body1" className="text-black dark:text-white">
                {user?.additionalDetails?.dateOfBirth
                  ? formatDate(user.additionalDetails.dateOfBirth)
                  : 'Add date of birth'}
              </Typography>
            </div>
          </Grid>
        </Grid>

        <Divider className="my-6 dark:bg-gray-600" />

        {/* About Section */}
        <div className="mb-6">
          <Typography variant="h6" className="mb-4 font-semibold text-black dark:text-white">
            About
          </Typography>
          <Typography variant="body1" className="text-gray-700 dark:text-gray-300">
            {user?.additionalDetails?.about || 'Add about section'}
          </Typography>
        </div>

        {/* Edit Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/dashboard/settings')}
            className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700"
          >
            <RiEditBoxLine className="text-lg" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default Profile;