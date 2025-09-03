import React from "react";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: { value: string; label: string }[];
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SelectInput({
  options,
  label,
  placeholder = "Selecione uma opção",
  className = "",
  value,
  onChange,
  ...props
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all duration-200 outline-none shadow-soft hover:border-slate-300 dark:hover:border-slate-500 cursor-pointer ${className}`}
        value={value}
        onChange={handleChange}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value} className="py-2">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
