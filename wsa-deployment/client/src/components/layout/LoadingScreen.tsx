import React from 'react';
import loadingGif from "@assets/IMG_2944_1749106310066.gif";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'جاري التحميل...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="mb-6 flex flex-col items-center justify-center">
        <div className="font-bold text-3xl mb-2 text-black">Jaberco</div>
        <div className="text-red-600 animate-pulse">Amazon Return Pallets</div>
      </div>
      
      <div className="mb-6">
        <img 
          src={loadingGif} 
          alt="جاري التحميل..." 
          className="w-24 h-24 object-contain"
        />
      </div>
      
      <p className="text-gray-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingScreen;