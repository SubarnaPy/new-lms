import React, { useState } from 'react';
import { motion } from 'framer-motion';
import HighlightText from '../Components/HomePage/HighlightText';
import BannerImage1 from "../Assetss/Images/aboutus1.webp";
import BannerImage2 from "../Assetss/Images/aboutus2.webp";
import BannerImage3 from "../Assetss/Images/aboutus3.webp";
import Quote from "../Components/AboutPage/Quote";
import FoundingStory from "../Assetss/Images/FoundingStory.png";
import StatsComponent from '../Components/AboutPage/Stats';
import LearningGrid from '../Components/AboutPage/LearningGrid';
import ContactFormSection from '../Components/AboutPage/ContactFormSection';
import HomeLayout from "../Layouts/HomeLayout";
import ReviewSlider from '../Components/HomePage/ReviewSlider';

// Bubble Component
const Bubble = ({ size, left, top, delay, color }) => {
  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{
        y: [0, -100, 0, 100, 0],
        x: [0, 50, -50, 100, -100, 0],
        opacity: [0, 1, 0.5, 1, 0],
      }}
      transition={{
        duration: Math.random() * 6 + 4,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: size,
        height: size,
        left: left,
        top: top,
        backgroundColor: color,
      }}
      className="absolute rounded-full opacity-50 blur-sm"
    ></motion.div>
  );
};

const AboutUs = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  
  return (
    <HomeLayout>
      <div className={`relative min-h-screen dark:bg-teal-950 dark:text-white  bg-[#f9f9f9] text-black`}>
        {/* Dark Mode Toggle Button */}
        <div className="inset-0 overflow-hidden ">
          {Array.from({ length: 100 }).map((_, index) => (
            <Bubble
              key={index}
              size={`${Math.random() * 30 + 10}px`} // Smaller bubbles
              left={`${Math.random() * 100}%`}
              top={`${Math.random() * 100}%`}
              delay={Math.random() * 2}
              color={`hsl(${Math.random() * 360}, 70%, 70%)`} // Colorful bubbles
            />
          ))}
        </div>
       
        {/* Moving Bubbles Background */}
        

        {/* Content */}
        <div className="relative z-10">
          
          {/* Section 1 */}
          <section className={`relative dark:bg-richblack-700 bg-gray-100}`}>
            <div className="relative flex flex-col justify-between w-11/12 gap-10 mx-auto text-center max-w-maxContent">
            
              <header className="mx-auto py-20 text-4xl font-semibold lg:w-[70%]">
                Driving Innovation in Online Education for a
                <HighlightText text={"Brighter Future"} />
                <p className={`mx-auto mt-3 text-center text-base font-medium dark:text-richblack-300 text-gray-600 lg:w-[95%]`}>
                  Studynotion is at the forefront of driving innovation in online education. We are passionate about creating a brighter future by offering cutting-edge courses, leveraging emerging technologies, and nurturing a vibrant learning community.
                </p>
              </header>
              <div className="sm:h-[70px] lg:h-[150px]"></div>
              <div className="absolute bottom-0 left-[50%] grid w-[100%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-3 lg:gap-5">
                <img src={BannerImage1} alt="Banner 1" className="rounded-lg shadow-lg" />
                <img src={BannerImage2} alt="Banner 2" className="rounded-lg shadow-lg" />
                <img src={BannerImage3} alt="Banner 3" className="rounded-lg shadow-lg" />
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className={`border-b dark:border-richblack-700 border-gray-200`}>
            <div className="flex flex-col justify-between w-11/12 gap-10 mx-auto max-w-maxContent">
              <div className="h-[100px]"></div>
              <Quote />
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex flex-col justify-between w-11/12 gap-10 mx-auto max-w-maxContent">
              <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
                <div className="my-24 flex lg:w-[50%] flex-col gap-10">
                  <h1 className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]">
                    Our Founding Story
                  </h1>
                  <p className={`text-base font-medium dark:text-richblack-300 text-gray-600  lg:w-[95%]`}>
                    Our e-learning platform was born out of a shared vision and passion for transforming education. It all began with a group of educators, technologists, and lifelong learners who recognized the need for accessible, flexible, and high-quality learning opportunities in a rapidly evolving digital world.
                  </p>
                  <p className={`text-base font-medium dark:text-richblack-300 text-gray-600  lg:w-[95%]`}>
                    As experienced educators ourselves, we witnessed firsthand the limitations and challenges of traditional education systems. We believed that education should not be confined to the walls of a classroom or restricted by geographical boundaries. We envisioned a platform that could bridge these gaps and empower individuals from all walks of life to unlock their full potential.
                  </p>
                </div>
                <div>
                  <img className="shadow-[0_0_20px_0] shadow-[#FC6767] rounded-lg" src={FoundingStory} alt="Founding Story" />
                </div>
              </div>

              <div className="flex flex-col items-center justify-between lg:gap-10 lg:flex-row">
                <div className="my-24 flex lg:w-[40%] flex-col gap-10">
                  <h1 className="bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]">
                    Our Vision
                  </h1>
                  <p className={`text-base font-medium dark:text-richblack-300 text-gray-600  lg:w-[95%]`}>
                    With this vision in mind, we set out on a journey to create an e-learning platform that would revolutionize the way people learn. Our team of dedicated experts worked tirelessly to develop a robust and intuitive platform that combines cutting-edge technology with engaging content, fostering a dynamic and interactive learning experience.
                  </p>
                </div>

                <div className="my-24 flex lg:w-[40%] flex-col gap-10">
                  <h1 className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text text-4xl font-semibold lg:w-[70%]">
                    Our Mission
                  </h1>
                  <p className={`text-base font-medium dark:text-richblack-300 text-gray-600'} lg:w-[95%]`}>
                    Our mission goes beyond just delivering courses online. We wanted to create a vibrant community of learners, where individuals can connect, collaborate, and learn from one another. We believe that knowledge thrives in an environment of sharing and dialogue, and we foster this spirit of collaboration through forums, live sessions, and networking opportunities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <StatsComponent />

          {/* Section 5 */}
          <section className="mx-auto p-2 flex flex-col items-center justify-between gap-5 mb-[140px]">
            <LearningGrid />
            <ContactFormSection />
          </section>

          {/* Reviews Section */}
          <section>
            <div className="w-screen px-4 mt-3">
              <h2 className={`mt-8 text-4xl font-semibold text-center dark:text-richblack-5 text-gray-800'}`}>
                Reviews from other learners
              </h2>
              <ReviewSlider />
            </div>
          </section>
        </div>
      </div>
    </HomeLayout>
  );
};

export default AboutUs;