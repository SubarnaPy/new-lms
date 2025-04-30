import React, { useState, useEffect } from "react";

function CourseDuration({ course }) {
  const [totalDuration, setTotalDuration] = useState("00:00:00");

  useEffect(() => {
    const calculateTotalDuration = () => {
      if (!course?.courseContent) return;

      try {
        // Extract and sum up all `timeDuration` values safely
        const totalDurationInSeconds = course.courseContent
          .flatMap(content => content.subSection || []) // Handle missing `subSection`
          .reduce((sum, subSection) => sum + (subSection.timeDuration || 0), 0); // Handle missing `timeDuration`

        setTotalDuration(convertSecondsToDuration(totalDurationInSeconds));
      } catch (error) {
        console.error("Error calculating total duration:", error);
        setTotalDuration("00:00:00"); // Fallback
      }
    };

    calculateTotalDuration();
  }, [course]);

  function convertSecondsToDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return (
    <div>
      <p>Total Duration: {totalDuration}</p>
    </div>
  );
}

export default CourseDuration;
