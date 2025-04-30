import React from 'react';
import RenderSteps from './RenderSteps';

export default function AddCourse() {
  return (
    <>
      <div className="flex flex-col w-full py-6 lg:flex-row gap-y-6 lg:gap-x-6">
        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <div className="px-4 lg:px-6 ">
            <RenderSteps />
          </div>
        </div>

        {/* Course Upload Tips */}
        <div className="sticky top-10 hidden md:hidden xl:block max-w-[400px] shadow-xl rounded-md border border-black dark:border-gray-600 bg-[#ffffff] dark:bg-gray-800 p-6">
          <p className="mb-8 text-lg text-richblack-5 dark:text-gray-100">⚡ Course Upload Tips</p>
          <ul className="ml-5 space-y-4 text-sm list-disc text-richblack-5 dark:text-gray-300">
            <li>Set the Course Price option or make it free.</li>
            <li>Standard size for the course thumbnail is 1024x576.</li>
            <li>Video section controls the course overview video.</li>
            <li>Course Builder is where you create & organize a course.</li>
            <li>
              Add Topics in the Course Builder section to create lessons,
              quizzes, and assignments.
            </li>
            <li>
              Information from the Additional Data section shows up on the
              course single page.
            </li>
            <li>Make Announcements to notify any important</li>
            <li>Notes to all enrolled students at once.</li>
          </ul>
        </div>

        {/* Mobile Tips */}
        <div className="block lg:hidden w-full shadow-lg rounded-md border border-richblack-700 dark:border-gray-600 bg-[#ffffff] dark:bg-gray-800 p-4">
          <p className="mb-4 text-lg text-richblack-5 dark:text-gray-100">⚡ Course Upload Tips</p>
          <ul className="ml-5 space-y-3 text-xs list-disc text-richblack-5 dark:text-gray-300">
            <li>Set the Course Price option or make it free.</li>
            <li>Standard size for the course thumbnail is 1024x576.</li>
            <li>Video section controls the course overview video.</li>
            <li>Course Builder is where you create & organize a course.</li>
            <li>
              Add Topics in the Course Builder section to create lessons,
              quizzes, and assignments.
            </li>
            <li>
              Information from the Additional Data section shows up on the
              course single page.
            </li>
            <li>Make Announcements to notify any important</li>
            <li>Notes to all enrolled students at once.</li>
          </ul>
        </div>
      </div>
    </>
  );
}