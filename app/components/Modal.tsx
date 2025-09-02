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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-4 py-6 animate-fade-in-up">
      <div
        className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/20 dark:border-slate-700/50 px-8 py-6 relative w-full ${
          terms ? "max-w-md" : "max-w-2xl"
        } max-h-[90vh] overflow-hidden animate-bounce-in`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-error-500 dark:hover:text-error-400 transition-all duration-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)] pr-2 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
