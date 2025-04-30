import React from 'react';
import HighlightText from '../HomePage/HighlightText';
import { Link } from 'react-router-dom';

const LearningGridArray = [
  {
    order: -1,
    heading: "World-Class Learning for",
    highlightText: "Anyone, Anywhere",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide.",
    BtnText: "Learn More",
    BtnLink: "/",
  },
  {
    order: 1,
    heading: "Curriculum Based on Industry Needs",
    description:
      "Save time and money! The Belajar curriculum is made to be easier to understand and in line with industry needs.",
  },
  {
    order: 2,
    heading: "Our Learning Methods",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
  {
    order: 3,
    heading: "Certification",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
  {
    order: 4,
    heading: `Rating "Auto-grading"`,
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
  {
    order: 5,
    heading: "Ready to Work",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
];

const LearningGrid = () => {
  return (
    <div className='grid p-5 mb-10 text-left bg-gray-50 dark:bg-teal-950 grid-col-1 lg:grid-cols-4 lg:w-fit'>
      {LearningGridArray.map((card, index) => (
        <div
          key={index}
          className={`${index === 0 && "lg:col-span-2 lg:h-[280px] p-5 bg-gray-50 dark:bg-teal-950"}
            ${
              card.order % 2 === 1
                ? "bg-gray-100 dark:bg-gray-700 lg:h-[280px] p-5"
                : "bg-white dark:bg-gray-800 lg:h-[280px] p-5"
            }
            ${card.order === 3 && "lg:col-start-2"}
            ${card.order < 0 && "bg-gray-50 dark:bg-gray-800"}
          `}
        >
          {card.order < 0 ? (
            <div className='lg:w-[90%] flex flex-col pb-5 gap-3'>
              <div className='text-4xl font-semibold text-gray-900 dark:text-white'>
                {card.heading}
                <HighlightText text={card.highlightText} />
              </div>
              <p className='font-medium text-gray-600 dark:text-gray-300'>
                {card.description}
              </p>
              <div className='mt-4 w-fit'>
                <Link to={card.BtnLink}>
                  <button className="px-8 py-2 font-light text-white transition-transform transform bg-blue-600 rounded-md shadow-lg hover:scale-105 hover:bg-blue-700">
                    {card.BtnText}
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-8 p-7'>
              <h1 className='text-lg text-gray-900 dark:text-white'>
                {card.heading}
              </h1>
              <p className='font-medium text-gray-600 dark:text-gray-300'>
                {card.description}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LearningGrid;