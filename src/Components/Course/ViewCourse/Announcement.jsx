import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAnnouncements, createAnnouncement } from "../../../Redux/courseSlice";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid"; // ✅ Generate unique room ID
import { FaChalkboardTeacher, FaUserCircle } from "react-icons/fa"; // Icons for teacher and user
import { RiLiveLine } from "react-icons/ri"; // Icon for live class

function Announcements() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { announcements, loading } = useSelector((state) => state.course);
  const { data: user } = useSelector((state) => state.auth);
  const { courseId } = useParams();

  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isLive, setIsLive] = useState(false); // ✅ No need to track roomId separately

  useEffect(() => {
    dispatch(getAnnouncements({ courseId }));
  }, [courseId, dispatch]);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      toast.error("Announcement cannot be empty");
      return;
    }

    const liveRoomId = isLive ? uuidV4() : ""; // ✅ Generate roomId only when live class is enabled

    const result = await dispatch(
      createAnnouncement({
        message: newAnnouncement,
        username: user.fullName,
        courseId,
        isLive,
        roomId: liveRoomId, // ✅ Pass the generated roomId directly
      })
    );

    if (result.payload) {
      setNewAnnouncement("");
      setIsLive(false);
      toast.success("Announcement created!");
    } else {
      toast.error("Failed to create announcement.");
    }
  };

  return (
    <div className="max-w-6xl p-6 mx-auto transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-xl">
      <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-blue-800 dark:text-blue-300">
        <FaChalkboardTeacher className="text-2xl" />
        Announcements
      </h2>

      {/* Instructor - Create Announcement */}
      {user?.role === "INSTRUCTOR" && (
        <div className="p-6 mb-8 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700">
          <textarea
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
            placeholder="Write an announcement..."
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
          ></textarea>

          {/* Live Class Checkbox */}
          <label className="flex items-center mt-3 space-x-2">
            <input
              type="checkbox"
              checked={isLive}
              onChange={() => setIsLive(!isLive)} // ✅ No need for setRoomId
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Live Class</span>
          </label>

          <button
            onClick={handleCreateAnnouncement}
            className="px-4 py-2 mt-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Post Announcement
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <p className="text-gray-600 dark:text-gray-400">Loading announcements...</p>
      )}

      {/* Display Announcements in a Grid Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {announcements?.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="p-6 transition-all duration-300 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 hover:shadow-md"
            >
              {/* Teacher Image and Name */}
              <div className="flex items-center gap-3 mb-4">
                {announcement.authorImage ? (
                  <img
                    src={announcement.authorImage}
                    alt={announcement.authorName}
                    className="object-cover w-12 h-12 rounded-full shadow-sm"
                  />
                ) : (
                  <FaUserCircle className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {announcement.authorName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Announcement Message */}
              <p className="mb-4 text-gray-700 dark:text-gray-300">{announcement.message}</p>

              {/* Live Class Button */}
              {announcement.isLive && announcement.roomId && (
                <button
                  onClick={() => navigate(`/course/${courseId}/live/${announcement.roomId}`)}
                  className="flex items-center w-full gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  <RiLiveLine className="text-lg" />
                  Join Live Class
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400 col-span-full">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}

export default Announcements;