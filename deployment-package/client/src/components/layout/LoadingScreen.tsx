import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="w-64 h-64 mb-6">
        <img 
          src="https://res.cloudinary.com/dsviwqpmy/image/upload/v1746723682/jaberco/loading-logo.gif" 
          alt="Jaberco Loading" 
          className="w-full h-full object-contain"
        />
      </div>
      
      <p className="text-gray-700 font-medium text-lg">{message}</p>
    </div>
  );
};

export default LoadingScreen;