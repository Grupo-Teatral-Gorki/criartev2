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
        <label className="block mb-1 text-primary dark:text-light">
          {label}
        </label>
      )}
      <div className="relative w-full flex items-center justify-center">
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`w-full p-2 border rounded text-primary dark:text-light bg-white dark:bg-gray-800 ${className}`}
          placeholder={label}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
