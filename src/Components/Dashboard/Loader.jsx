import React from 'react';

const Loader = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin dark:border-blue-400"></div>
    </div>
  );
};

export default Loader;