import { useEffect, useRef, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { updatePfp } from '../../Redux/profileSlice';
import { Button } from '@material-tailwind/react';
import { Paper } from '@mui/material';

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.data);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      previewFile(file);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  const handleFileUpload = async () => {
    try {
      console.log('uploading...');
      setLoading(true);
      const formData = new FormData();
      formData.append('thumbnailImage', imageFile);
      console.log('formdata', ...formData);
      const res = await dispatch(updatePfp(formData)).then(() => {
        
        setLoading(false);
      });
      console.log(res);
    } catch (error) {
      console.log('ERROR MESSAGE - ', error.message);
    }
  };

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile);
    }
  }, [imageFile]);

  return (
    <Paper
      elevation={3}
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        
        borderRadius: "10px",
      }}
    >
    <div className="flex items-center justify-between p-8 bg-white border border-gray-200 rounded-lg shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-x-6">
        {/* Profile Picture */}
        <div className="relative">
          <img
            src={previewSource || user?.avatar?.secure_url}
            alt={`profile-${user?.firstName}`}
            className="object-cover w-20 h-20 rounded-full shadow-md"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <span className="text-sm text-white">Uploading...</span>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Change Profile Picture
          </p>
          <div className="flex items-center gap-x-4">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/gif, image/jpeg"
            />

            {/* Select Button */}
            <button
              onClick={handleClick}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Select
            </button>

            {/* Upload Button */}
            <Button
              onClick={handleFileUpload}
              disabled={!imageFile || loading}
              className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md shadow-sm gap-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <FiUpload className="text-lg" />
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </Paper>
  );
}