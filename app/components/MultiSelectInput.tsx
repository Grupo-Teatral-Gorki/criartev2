import React, { useState } from "react";
import { Check } from "lucide-react"; // Import the check icon

type MultiSelectProps = {
  options: { value: string; label: string }[];
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
};

export function MultiSelectInput({
  options,
  label = "Selecione opções",
  className = "",
  value,
  onChange,
  disabled = false,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleChange = (optionValue: string) => {
    const updatedValues = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(updatedValues);
  };

  return (
    <div className="relative">
      <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div
        {...props}
        className={`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 cursor-pointer transition-all duration-200 shadow-soft hover:border-slate-300 dark:hover:border-slate-500 ${className}`}
        onClick={toggleDropdown}
        aria-label={label}
      >
        <div className="flex justify-between items-center">
          <span>
            {value.length > 0
              ? options
                  .filter((option) => value.includes(option.value))
                  .map((option) => option.label)
                  .join(", ")
              : "Selecione opções"}
          </span>
          <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg z-10">
          <ul className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <li className="p-2 text-gray-500">Nenhuma opção disponível</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleChange(option.value)}
                >
                  {value.includes(option.value) && (
                    <Check className="mr-2 text-green-500" />
                  )}
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
