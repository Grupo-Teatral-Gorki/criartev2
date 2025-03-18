type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function TextAreaInput({
  className = "",
  label,
  value,
  onChange,
  ...props
}: TextareaProps) {
  return (
    <div className="relative w-full">
      {label && (
        <label
          className={`absolute left-3 text-gray-500 dark:text-gray-400 transition-all ${
            value ? "top-1 text-xs" : "top-3 text-sm"
          }`}
        >
          {label}
        </label>
      )}
      <textarea
        className={`w-full p-3 pt-6 mb-2 border rounded text-primary dark:text-light bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:outline-none ${className}`}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}
