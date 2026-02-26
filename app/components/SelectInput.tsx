/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

type SelectProps = any & {
  options: { value: string; label: string }[];
  label?: string;
  value: string;
  onChange: (value: string) => void; // This will remain to get the value when the selection changes
};

export function SelectInput({
  options,
  label,
  className = "",
  placeholder = "Selecione uma opção",
  value,
  onChange,
  id,
  ...props
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
  };

  // Generate a unique ID if not provided
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all duration-200 outline-none shadow-soft hover:border-slate-300 dark:hover:border-slate-500 cursor-pointer ${className}`}
        value={value}
        onChange={handleChange}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option: any, index: number) => (
          <option key={index} value={option.value} className="py-2">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
