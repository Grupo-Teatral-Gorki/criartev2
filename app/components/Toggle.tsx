import React from "react";

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
          value ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
