import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  type?: "text" | "password" | "email";
  label?: string;
};

export function TextInput({
  type = "text",
  label,
  className = "",
  ...props
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all duration-200 outline-none shadow-soft hover:border-slate-300 dark:hover:border-slate-500 ${className}`}
          placeholder={label}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
