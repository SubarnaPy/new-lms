import { FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../../Redux/profileSlice";
import { Paper, Typography, Button } from "@mui/material";

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleDeleteAccount() {
    try {
      dispatch(deleteAccount(token, navigate));
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
    }
  }

  return (
    <Paper
      elevation={3}
      className="p-8 my-10 rounded-lg shadow-lg bg-pink-50 dark:bg-gray-800"
    >
      <div className="flex flex-col items-center gap-6 md:flex-row">
        {/* Icon */}
        <div className="flex items-center justify-center bg-pink-600 rounded-full h-14 w-14 dark:bg-pink-700">
          <FiTrash2 className="text-3xl text-pink-100 dark:text-pink-200" />
        </div>

        {/* Content */}
        <div className="flex flex-col space-y-4">
          <Typography
            variant="h5"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Delete Account
          </Typography>
          <Typography
            variant="body1"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Would you like to delete your account?
          </Typography>
          <Typography
            variant="body2"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            This account may contain Paid Courses. Deleting your account is
            permanent and will remove all the content associated with it.
          </Typography>

          {/* Delete Button */}
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteAccount}
            className="text-pink-700 border-pink-700 w-fit dark:text-pink-300 dark:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900"
          >
            I want to delete my account.
          </Button>
        </div>
      </div>
    </Paper>
  );
}