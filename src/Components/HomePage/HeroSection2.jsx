import { motion } from "framer-motion";
import { useContext } from "react";
import { DarkModeContext } from "../../Layouts/DarkModeContext";
import clsx from "clsx";
import Pic1 from "../../Assetss/Image/ai-generated-8575440.png";
import Pic2 from "../../Assetss/Image/child-1073638.jpg";
import Pic3 from "../../Assetss/Image/ai-generated-8575440.png";

const HeroSection2 = () => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div className={clsx(
      "relative w-full overflow-hidden",
      isDarkMode ? "bg-[#020817]" : "bg-white"
    )}>
      {/* Statistics Section */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={clsx(
          "absolute top-[-50px] rounded-xl py-2 px-6 shadow-2xl text-center",
          "flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 lg:space-x-16",
          "bg-gradient-to-r from-[#0070f3] to-[#00ffab]",
          "transform hover:scale-105 transition-transform duration-300"
        )}
      >
        <div className="flex flex-col items-center">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold text-white"
            whileHover={{ scale: 1.05 }}
          >
            500,000+
          </motion.h3>
          <p className="text-sm md:text-lg font-medium text-white/90">Happy Users</p>
        </div>
        <div className="flex flex-col items-center">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold text-white"
            whileHover={{ scale: 1.05 }}
          >
            200+
          </motion.h3>
          <p className="text-sm md:text-lg font-medium text-white/90">Companies</p>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className={clsx(
        "py-16 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64",
        "transition-colors duration-300",
        isDarkMode ? "text-gray-100" : "text-gray-900"
      )}>
        <motion.h2 
          className="mb-6 text-3xl md:text-4xl lg:text-5xl font-bold text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Why Choose Us?
        </motion.h2>
        
        <motion.p 
          className={clsx(
            "max-w-3xl mx-auto mb-12 text-center text-lg md:text-xl",
            "transition-colors duration-300",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Our platform provides a comprehensive and innovative learning experience. 
          We offer a wide range of courses tailored to help you build skills that 
          matter for the future.
        </motion.p>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {[Pic1, Pic2, Pic3].map((pic, index) => (
            <motion.div
              key={index}
              className={clsx(
                "relative overflow-hidden rounded-2xl shadow-xl",
                "transform hover:scale-[1.03] transition-transform duration-300",
                isDarkMode ? "border border-gray-800" : "border border-gray-200"
              )}
              whileHover={{ rotate: index % 2 === 0 ? 2 : -2 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 + 0.6 }}
            >
              <img
                src={pic}
                alt={`Feature ${index + 1}`}
                className="object-cover w-full h-64 md:h-80 lg:h-96"
              />
              <div className={clsx(
                "absolute inset-0 flex items-center justify-center",
                "bg-gradient-to-t from-black/60 to-transparent",
                "opacity-0 hover:opacity-100 transition-opacity duration-300"
              )}>
                <p className={clsx(
                  "text-xl font-semibold text-white",
                  "translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                )}>
                  {`Feature ${index + 1}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Elements */}
      {!isDarkMode && (
        <div className="absolute inset-0 -z-10 opacity-10 bg-gradient-to-br from-[#0070f3] to-[#00ffab]" />
      )}
      {isDarkMode && (
        <div className="absolute inset-0 -z-10 opacity-5 bg-gradient-to-br from-white to-gray-400" />
      )}
    </div>
  );
};

export default HeroSection2;