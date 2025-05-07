import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="w-32 h-32 mb-4">
        <img
          src="/loading-logo.gif"
          alt="Jaberco Loading"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-gray-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingScreen;