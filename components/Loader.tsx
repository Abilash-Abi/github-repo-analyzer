import React from 'react';

interface LoaderProps {
    title?: string;
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
    title = "Analyzing Repository...", 
    message = "Fetching commits and generating insights. This may take a moment." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <svg className="animate-spin h-12 w-12 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h3 className="text-xl font-semibold text-gray-300">{title}</h3>
      <p className="text-gray-500 mt-2">{message}</p>
    </div>
  );
};

export default Loader;
