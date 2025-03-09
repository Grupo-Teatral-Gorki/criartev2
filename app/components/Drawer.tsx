"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-64 bg-white dark:bg-primary dark:text-white h-full shadow-lg p-4 flex flex-col gap-4 absolute left-0 top-0 transition-transform duration-600 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="self-end p-2 dark:hover:text-red-500 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Drawer Links */}
        <nav className="flex flex-col gap-4">
          <Link
            href="/home"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy"
          >
            <Home className="w-5 h-5" /> Home
          </Link>
        </nav>
      </div>
    </div>
  );
}
