interface InputErrorProps {
  message?: string;
}

const InputError: React.FC<InputErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-red-100  rounded relative">
      <p className="py-2 text-md text-center text-red-700">{message}</p>
    </div>
  );
};

export default InputError;
