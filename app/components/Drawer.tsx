"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeHelp,
  Bolt,
  ClipboardList,
  Home,
  LayoutDashboard,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const [visible, setVisible] = useState(isOpen);
  const { dbUser } = useAuth();
  const userRole = dbUser?.userRole || [];

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

  const links = [
    {
      href: "/home",
      label: "Home",
      icon: <Home className="w-5 h-5" />,
      rolesAllowed: ["user", "secretary", "reviewer", "staff", "admin"],
    },
    {
      href: "/admin",
      label: "Configurações",
      icon: <Bolt className="w-5 h-5" />,
      rolesAllowed: ["staff", "admin"],
    },
    {
      href: "/management",
      label: "Gestão",
      icon: <LayoutDashboard className="w-5 h-5" />,
      rolesAllowed: ["secretary", "staff", "admin"],
    },
    {
      href: "/admin/review",
      label: "Avaliar Projetos",
      icon: <ClipboardList className="w-5 h-5" />,
      rolesAllowed: ["reviewer", "admin"],
    },
    {
      href: "/help",
      label: "Ajuda",
      icon: <BadgeHelp className="w-5 h-5" />,
      rolesAllowed: ["user", "secretary", "reviewer", "staff", "admin"],
    },
  ];

  const filteredLinks = links.filter((link) =>
    link.rolesAllowed.some((role) => userRole.includes(role))
  );

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
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-navy transition-colors duration-200"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
