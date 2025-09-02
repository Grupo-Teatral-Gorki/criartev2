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
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all duration-200 outline-none shadow-soft hover:border-slate-300 dark:hover:border-slate-500 resize-y min-h-[120px] ${className}`}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}
