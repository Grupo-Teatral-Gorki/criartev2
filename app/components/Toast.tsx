// components/Toast.tsx
"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  show: boolean;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
};

const toastStyles = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

export default function Toast({
  message,
  show,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`text-white px-4 py-2 rounded shadow-lg transition-all duration-300 ${toastStyles[type]}`}
      >
        {message}
      </div>
    </div>
  );
}
