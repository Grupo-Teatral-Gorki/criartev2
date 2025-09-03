import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable search input component
 * Follows Single Responsibility Principle
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Buscar por nome ou email...",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white w-full sm:w-80"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Limpar busca"
        >
          ✕
        </button>
      )}
    </div>
  );
};
