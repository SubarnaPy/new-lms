import Logo1 from "../../Assetss/TimeLineLogo/Logo1.svg";
import Logo2 from "../../Assetss/TimeLineLogo/Logo2.svg";
import Logo3 from "../../Assetss/TimeLineLogo/Logo3.svg";
import Logo4 from "../../Assetss/TimeLineLogo/Logo4.svg";
import timelineImage from "../../Assetss/Images/TimelineImage.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useContext } from "react";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
// import { DarkModeContext } from "../../context/DarkModeContext";

const timeline = [
  {
    Logo: Logo1,
    heading: "Leadership",
    Description: "Fully committed to the success company",
  },
  {
    Logo: Logo2,
    heading: "Vision",
    Description: "Creating a vision for the future",
  },
  {
    Logo: Logo3,
    heading: "Integrity",
    Description: "Maintaining high ethical standards",
  },
  {
    Logo: Logo4,
    heading: "Innovation",
    Description: "Embracing creativity and change",
  },
];

const TimelineSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const { isDarkMode } = useContext(DarkModeContext);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div
      className={`relative overflow-hidden py-20 ${
        isDarkMode ? "bg-gray-900" : "bg-[#f9f9f9]"
      }`}
      ref={ref}
    >
      <div className="container flex flex-col items-center gap-10 px-5 mx-auto lg:flex-row">
        {/* Timeline Section */}
        <div className="lg:w-[45%] flex flex-col gap-6">
          {timeline.map((element, index) => (
            <motion.div
              key={index}
              style={{ y }}
              className={`flex flex-row gap-4 items-start p-6 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <div
                className={`w-[50px] h-[50px] ${
                  isDarkMode ? "bg-gray-700" : "bg-white"
                } flex items-center justify-center shadow-lg rounded-full`}
              >
                <img src={element.Logo} alt={`Logo ${index + 1}`} />
              </div>
              <div>
                <h2
                  className={`font-semibold text-lg ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {element.heading}
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {element.Description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline Image Section */}
        <div className="relative w-full lg:w-[50%] flex justify-center items-center">
          <motion.div style={{ y }} className="relative">
            <img
              src={timelineImage}
              alt="Timeline Illustration"
              className="object-cover rounded-md shadow-lg"
            />
            <div
              className={`absolute inset-0 ${
                isDarkMode
                  ? "bg-gradient-to-r from-[#0070f3] to-[#00ffab] opacity-20"
                  : "bg-gradient-to-r from-[#0070f3] to-[#00ffab] opacity-10"
              } rounded-md`}
            ></div>
          </motion.div>

          {/* Floating Card */}
          <motion.div
            style={{ y }}
            className={`absolute bg-gradient-to-r from-[#0070f3] to-[#00ffab] text-white uppercase py-4 px-5 md:px-10 rounded-lg flex flex-row items-center gap-10 shadow-lg transform translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]`}
          >
            <div className="flex flex-row items-center gap-3 pr-5 border-r border-white">
              <p className="text-3xl font-bold">10</p>
              <p className="text-sm">Years of Experience</p>
            </div>
            <div className="flex items-center gap-3 pl-5">
              <p className="text-3xl font-bold">250</p>
              <p className="text-sm">Type of Courses</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;