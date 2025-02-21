import { useState } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  label?: string;
};

export function SelectInput({
  options,
  label = "Selecione uma opção",
  className = "",
  ...props
}: SelectProps) {
  const [selected, setSelected] = useState("");

  return (
    <select
      className={`w-full p-2 mb-2 border rounded text-primary dark:text-light bg-white dark:bg-gray-800 ${className}`}
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      {...props}
    >
      <option value="" disabled hidden>
        {label}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
