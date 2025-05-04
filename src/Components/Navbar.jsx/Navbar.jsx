import { FiMenu, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
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
    <nav className="fixed z-[100] top-0 w-full bg-white/80 dark:bg-[#020817]/90 backdrop-blur-md shadow-sm px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo with animated gradient */}
        <motion.div
          onClick={handleHomeClick}
          className="flex items-center cursor-pointer group"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent bg-300% animate-gradient">
            EDUCATION SIGHT
          </span>
        </motion.div>

        {/* Desktop Search & Navigation */}
        <div className="flex-1 hidden max-w-2xl mx-8 lg:flex">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <motion.div 
              className="relative group"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.01 }}
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-6 py-3 rounded-full border-2 border-gray-200/50 dark:border-gray-700/30 bg-white/95 dark:bg-gray-800/90 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="Search courses..."
              />
              <button
                type="submit"
                className="absolute px-5 py-1.5 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full right-2 top-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex items-center gap-2"
              >
                <FiSearch className="w-4 h-4" />
                <span>Search</span>
              </button>
            </motion.div>
          </form>
        </div>

        {/* Desktop Links with hover animations */}
        <div className="items-center hidden space-x-6 lg:flex">
          <div className="flex space-x-6">
            {['Courses', 'About Us', 'Compiler'].map((item) => (
              <motion.div 
                key={item}
                className="relative"
                whileHover={{ y: -2 }}
              >
                <button
                  onClick={() => {
                    if (item === 'Courses') handleCoursesClick();
                    if (item === 'About Us') handleAboutUsClick();
                    if (item === 'Compiler') navigate('/compiler');
                  }}
                  className="px-3 py-2 font-medium text-gray-600 transition-colors dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative group"
                >
                  {item}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-[2px] bg-blue-500 w-0 group-hover:w-full"
                    transition={{ duration: 0.3 }}
                  />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Auth Section with improved interactions */}
          <div className="flex items-center ml-4 space-x-4">
            {isLoggedIn ? (
              <>
                {role === 'INSTRUCTOR' && (
                  <motion.button
                    onClick={handleCreateCourseClick}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create Course
                  </motion.button>
                )}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    onClick={handleProfileClick}
                    className="w-10 h-10 overflow-hidden border-2 border-blue-500/30 rounded-full cursor-pointer relative group"
                  >
                    <img 
                      src={profile?.avatar?.secure_url || '/default-avatar.png'} 
                      alt="Profile" 
                      className="object-cover w-full h-full transition-all duration-300 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.button
                  onClick={handleLoginClick}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-300"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={handleSignupClick}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Signup</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </>
            )}

            {/* Dark Mode Toggle with rotation effect */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              whileHover={{ rotate: 15 }}
              whileTap={{ rotate: -15 }}
            >
              {isDarkMode ? (
                <FiSun className="w-5 h-5 text-amber-400" />
              ) : (
                <FiMoon className="w-5 h-5 text-indigo-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Button with animated bars */}
        <motion.button
          onClick={toggleSidebar}
          className="p-2 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMenu className="w-7 h-7 text-gray-600 dark:text-gray-300" />
        </motion.button>

        {/* Enhanced Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={toggleSidebar}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 z-50 h-full bg-white/95 shadow-xl w-80 dark:bg-[#020817]/95 backdrop-blur-xl"
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