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
  label = "Selecione uma opção",
  className = "",
  value,
  onChange,
  ...props
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
  };

  return (
    <select
      {...props}
      className={`w-full p-2 mb-2 border rounded text-primary dark:text-light bg-white dark:bg-gray-800 ${className}`}
      value={value}
      onChange={handleChange} // Use the modified handleChange function
    >
      <option value="" disabled hidden>
        {label}
      </option>
      {options.map((option: any, index: number) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
