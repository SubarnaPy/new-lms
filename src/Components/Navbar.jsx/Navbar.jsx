import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useContext } from 'react';
import { Logout } from '../../Redux/authSlice';
import { getProfile } from '../../Redux/profileSlice';
import { searchCourse } from '../../Redux/courseSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkModeContext } from '../../Layouts/DarkModeContext';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isLoggedIn, role, user } = useSelector((state) => state.auth);
  const { data } = useSelector((state) => state.profile);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  // Handler functions (keep existing handlers)
  const handleHomeClick = () => navigate('/');
  const handleCoursesClick = () => navigate('/courses');
  const handleAboutUsClick = () => navigate('/about-us');
  const handleLoginClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/signup');
  const handleProfileClick = async () => {
    const res = await dispatch(getProfile());
    if (res?.payload.success) {
      navigate('/dashboard/my-profile');
    }
  };
  const handleCreateCourseClick = () => navigate('/create-course');
  const handleAdminDashboardClick = () => navigate('/admin-dashboard');
  const handleLogout = async () => {
    await dispatch(Logout());
    navigate("/");
  };
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(searchCourse(searchQuery));
  };

  const profile = data;

  return (
    <nav className="fixed  z-[100] top-0 w-full bg-white dark:bg-gray-900 shadow-md px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo */}
        <motion.div
          onClick={handleHomeClick}
          className="flex items-center cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            EDUCATION SIGHT
          </span>
        </motion.div>

        {/* Desktop Search & Navigation */}
        <div className="flex-1 hidden max-w-2xl mx-8 lg:flex">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <motion.div className="relative" whileHover={{ scale: 1.01 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search courses..."
              />
              <button
                type="submit"
                className="absolute px-4 py-1 text-white transition-colors bg-blue-600 rounded-full right-2 top-2 hover:bg-blue-700"
              >
                Search
              </button>
            </motion.div>
          </form>
        </div>

        {/* Desktop Links */}
        <div className="items-center hidden space-x-6 lg:flex">
          <div className="flex space-x-6">
          
{['Courses', 'About Us', 'Compiler'].map((item) => (
  <motion.button
    key={item}
    onClick={() => {
      if (item === 'Courses') handleCoursesClick();
      if (item === 'About Us') handleAboutUsClick();
      if (item === 'Compiler') navigate('/compiler');
    }}
    className="font-medium text-gray-600 transition-colors dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
    whileHover={{ y: -2 }}
  >
    {item}
  </motion.button>
))}
          </div>

          <div className="flex items-center ml-4 space-x-4">
            {isLoggedIn ? (
              <>
                {role === 'INSTRUCTOR' && (
                  <>
                   
                  </>
                )}
                {profile?.avatar?.secure_url ? (
                  <motion.div
                    onClick={handleProfileClick}
                    className="w-10 h-10 overflow-hidden border-2 border-blue-500 rounded-full cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                  >
                    <img src={profile.avatar.secure_url} alt="Profile" className="object-cover w-full h-full" />
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={handleProfileClick}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    whileHover={{ scale: 1.05 }}
                  >
                    Profile
                  </motion.button>
                )}
                <motion.button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-700 dark:hover:text-red-500"
                  whileHover={{ scale: 1.05 }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  whileHover={{ scale: 1.05 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={handleSignupClick}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Signup
                </motion.button>
              </>
            )}

            <motion.button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.1 }}
            >
              {isDarkMode ? (
                <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={toggleSidebar}
          className="p-2 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
          whileHover={{ scale: 1.1 }}
        >
          <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </motion.button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50"
                onClick={toggleSidebar}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween' }}
                className="fixed top-0 right-0 z-50 h-full bg-white shadow-xl w-80 dark:bg-gray-900"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xl font-bold">Menu</span>
                    <button
                      onClick={toggleSidebar}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <AiFillCloseCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearchSubmit} className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search courses..."
                      />
                      <button
                        type="submit"
                        className="absolute px-4 py-1 text-white bg-blue-600 rounded-full right-2 top-2 hover:bg-blue-700"
                      >
                        Go
                      </button>
                    </div>
                  </form>

                  {/* Mobile Navigation Links */}
                  <div className="space-y-3">
                  
{['Home', 'Courses', 'About Us', 'Compiler'].map((item) => (
  <motion.button
    key={item}
    onClick={() => {
      if (item === 'Home') handleHomeClick();
      if (item === 'Courses') handleCoursesClick();
      if (item === 'About Us') handleAboutUsClick();
      if (item === 'Compiler') navigate('/compiler');
      toggleSidebar();
    }}
    className="w-full px-4 py-3 text-left text-gray-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 dark:text-gray-300"
    whileHover={{ x: 5 }}
  >
    {item}
  </motion.button>
))}

                    {isLoggedIn && (
                      <>
                        {role === 'INSTRUCTOR' && (
                          <>
                            <motion.button
                              onClick={() => {
                                handleCreateCourseClick();
                                toggleSidebar();
                              }}
                              className="w-full px-4 py-3 text-left text-gray-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 dark:text-gray-300"
                              whileHover={{ x: 5 }}
                            >
                              Create Course
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                handleAdminDashboardClick();
                                toggleSidebar();
                              }}
                              className="w-full px-4 py-3 text-left text-gray-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 dark:text-gray-300"
                              whileHover={{ x: 5 }}
                            >
                              Dashboard
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          onClick={() => {
                            handleProfileClick();
                            toggleSidebar();
                          }}
                          className="w-full px-4 py-3 text-left text-gray-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 dark:text-gray-300"
                          whileHover={{ x: 5 }}
                        >
                          Profile
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            handleLogout();
                            toggleSidebar();
                          }}
                          className="w-full px-4 py-3 text-left text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          whileHover={{ x: 5 }}
                        >
                          Logout
                        </motion.button>
                      </>
                    )}

                    {!isLoggedIn && (
                      <div className="pt-4 space-y-3">
                        <motion.button
                          onClick={() => {
                            handleLoginClick();
                            toggleSidebar();
                          }}
                          className="w-full px-4 py-3 text-center text-white bg-blue-600 rounded-full hover:bg-blue-700"
                          whileHover={{ scale: 1.02 }}
                        >
                          Login
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            handleSignupClick();
                            toggleSidebar();
                          }}
                          className="w-full px-4 py-3 text-center text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-50"
                          whileHover={{ scale: 1.02 }}
                        >
                          Signup
                        </motion.button>
                      </div>
                    )}

                    <div className="pt-4">
                      <motion.button
                        onClick={toggleDarkMode}
                        className="flex items-center w-full px-4 py-3 space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        whileHover={{ x: 5 }}
                      >
                        {isDarkMode ? (
                          <>
                            <FiSun className="w-5 h-5" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <FiMoon className="w-5 h-5" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;