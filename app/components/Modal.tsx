import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  terms?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  terms = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4 py-6">
      <div
        className={`bg-white dark:bg-navy rounded-lg shadow-lg px-6 relative w-full ${
          terms ? "max-w-[30%]" : "max-w-[75%]"
        }  max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-primary dark:text-white dark:hover:text-red-500 hover:text-red-500"
        >
          <X size={24} />
        </button>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
