type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaInput({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full p-2 mb-2 border rounded text-primary dark:text-light bg-white dark:bg-gray-800 ${className}`}
      {...props}
    />
  );
}
