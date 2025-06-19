import loadingGif from "@assets/IMG_2944_1749106310066.gif";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Loading({ size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <img 
        src={loadingGif} 
        alt="جاري التحميل..." 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loading size="lg" />
    </div>
  );
}

export function AdminPageLoading({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {children}
      <div className="flex-1 flex justify-center items-center">
        <Loading size="lg" />
      </div>
    </div>
  );
}