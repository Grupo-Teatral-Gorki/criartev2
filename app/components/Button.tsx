import React from "react";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "default" | "red" | "outlined" | "danger" | "inverted" | "save";
  size?: "small" | "medium" | "full";
  disabled?: boolean;
  submit?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "default",
  size = "full",
  disabled = false,
  submit = false,
  className = "",
}) => {
  const baseStyles =
    "inline-block rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-[1.02] focus:ring-2 outline-none text-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default: "bg-primary text-white focus:ring-primary",
    red: "bg-red-600 text-white dark:bg-red-700 dark:text-gray-200 focus:ring-red-700 dark:focus:ring-red-800",
    outlined:
      "border border-gray-400 text-gray-800 dark:border-gray-300 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400",
    danger:
      "border border-red-600 text-red-600 dark:border-red-400 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900 focus:ring-red-600",
    inverted:
      "bg-white text-gray-900 dark:bg-navy dark:text-white focus:ring-primary",
    save: "bg-green-600 text-white dark:bg-green-600 dark:text-white focus:ring-primary",
  };

  const sizes = {
    small: "px-3 py-1 text-sm",
    medium: "px-5 py-2 text-base",
    full: "w-full px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      type={submit ? "submit" : "button"}
    >
      {label}
    </button>
  );
};

export default Button;
