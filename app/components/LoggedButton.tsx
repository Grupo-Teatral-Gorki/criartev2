"use client";
import React from "react";
import { useLogging } from "../hooks/useLogging";

interface LoggedButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "default" | "red" | "outlined" | "danger" | "inverted" | "save";
  size?: "small" | "medium" | "full";
  disabled?: boolean;
  submit?: boolean;
  className?: string;
  logMetadata?: Record<string, any>;
}

const LoggedButton: React.FC<LoggedButtonProps> = ({
  label,
  onClick,
  variant = "default",
  size = "full",
  disabled = false,
  submit = false,
  className = "",
  logMetadata = {},
}) => {
  const loggingService = useLogging();

  const handleClick = async () => {
    // Log the button click
    await loggingService.logButtonClick(label, {
      variant,
      size,
      disabled,
      submit,
      ...logMetadata
    });

    // Execute the original onClick handler
    if (onClick) {
      onClick();
    }
  };

  const baseStyles =
    "inline-block rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 outline-none text-center font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm";

  const variants = {
    default: "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white focus:ring-primary-500 border border-primary-500/20",
    red: "bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white focus:ring-error-500 border border-error-400/20",
    outlined:
      "border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:ring-slate-500 hover:border-slate-400 dark:hover:border-slate-500",
    danger:
      "border-2 border-error-300 dark:border-error-600 text-error-600 dark:text-error-400 bg-error-50/50 dark:bg-error-900/20 hover:bg-error-100 dark:hover:bg-error-900/40 focus:ring-error-500 hover:border-error-400 dark:hover:border-error-500",
    inverted:
      "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
    save: "bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white focus:ring-success-500 border border-success-400/20",
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    full: "w-full px-8 py-4 text-base",
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      type={submit ? "submit" : "button"}
    >
      {label}
    </button>
  );
};

export default LoggedButton;
