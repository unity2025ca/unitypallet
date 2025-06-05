import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="mb-6 flex flex-col items-center justify-center">
        <div className="font-bold text-3xl mb-2 text-black">Jaberco</div>
        <div className="text-red-600 animate-pulse">Amazon Return Pallets</div>
      </div>
      
      <div className="mb-6">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
      
      <p className="text-gray-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingScreen;