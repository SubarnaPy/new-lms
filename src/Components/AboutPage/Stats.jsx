import React from 'react';

const Stats = [
  { count: "5K", label: "Active Students" },
  { count: "10+", label: "Mentors" },
  { count: "200+", label: "Courses" },
  { count: "50+", label: "Awards" },
];

const StatsComponent = () => {
  return (
    <section className='bg-richblack-700 dark:bg-richblack-900'>
      <div className='flex flex-col justify-between w-11/12 gap-10 mx-auto max-w-maxContent'>
        <div className='grid grid-cols-2 text-center md:grid-cols-4'>
          {Stats.map((data, index) => (
            <div key={index} className="flex flex-col py-10">
              <h1 className='text-[30px] font-bold text-richblack-5 dark:text-white'>
                {data.count}
              </h1>
              <h2 className='text-richblack-200 dark:text-richblack-400'>
                {data.label}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsComponent;