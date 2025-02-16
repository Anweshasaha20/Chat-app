// components/Loader.tsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      <span className="text-blue-500">Loading...</span>
    </div>
  );
};

export default Loader;
