import React, { useContext } from 'react';
// import { DarkModeContext } from '../context/DarkModeContext'; // Import DarkModeContext
import Navbar from '../Components/Navbar.jsx/Navbar';
import Footer from '../Components/Footer/footer';
import { DarkModeContext } from './DarkModeContext';

const Layout = ({ children }) => {
  // const { isDarkMode } = useContext(DarkModeContext); // Access dark mode state
  const isDarkMode =false

  return (
    <div className={`overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Apply dark mode to the entire layout */}
      <div className=" text-gray-900 bg-[#f9f9f9] dark:bg-gray-900 dark:text-white">
        <Navbar />
        <main className="mt-16">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;