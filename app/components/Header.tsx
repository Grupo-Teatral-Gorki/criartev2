"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 text-primary dark:text-light shadow-md p-4 flex justify-between items-center">
      <Link href="/home" className="text-xl font-bold">
        MyApp
      </Link>

      <nav className="hidden md:flex space-x-4">
        <Link href="/features" className="hover:underline">
          Features
        </Link>
        <Link href="/pricing" className="hover:underline">
          Pricing
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {user ? (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Login
          </Link>
        )}
      </div>

      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg md:hidden">
          <nav className="flex flex-col space-y-2">
            <Link href="/features" className="hover:underline">
              Features
            </Link>
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
            <Link href="/about" className="hover:underline">
              About
            </Link>
            {user ? (
              <button onClick={logout} className="text-red-500">
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-blue-500">
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
