import { Loader } from "lucide-react";

const CustomLoader = () => {
  return (
    <div className="flex items-center justify-center ">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-t-transparent animate-spin 
          border-primary dark:border-white"
      >
        <Loader className="w-8 h-8 animate-pulse text-primary-600 dark:text-primary-400" />
      </div>
    </div>
  );
};

export default CustomLoader;
