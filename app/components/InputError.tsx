interface InputErrorProps {
  message?: string;
}

const InputError: React.FC<InputErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-3">
      <p className="text-sm text-center text-error-700 dark:text-error-300 font-medium">{message}</p>
    </div>
  );
};

export default InputError;
