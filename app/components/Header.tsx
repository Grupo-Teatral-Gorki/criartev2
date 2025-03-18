"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, User, LogOut } from "lucide-react";
import Drawer from "./Drawer";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { findCityLabel } from "../utils/validators";
import { logoutUser } from "../utils/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-primary shadow-md relative">
        {/* Hamburger Menu */}
        <button onClick={() => setDrawerOpen(true)} className="p-2">
          <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Logo */}
        <div
          className="flex-grow flex justify-center cursor-pointer"
          onClick={() => router.push("/home")}
        >
          <Image
            src="https://styxx-public.s3.sa-east-1.amazonaws.com/logo-criarte.png"
            alt="Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/profile">
            <User className="w-6 h-6 cursor-pointer text-white" />
          </Link>
          <button
            onClick={() => {
              logoutUser();
              router.push("/");
            }}
          >
            <LogOut className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Drawer */}
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </header>
      <div className="w-full flex bg-white px-6 py-2 font-semibold dark:bg-navy dark:text-white">
        <p>Versão: 2.0</p>
        <p className="ml-4">
          Cidade: {findCityLabel(user?.idCidade ?? "")} (
          {user?.idCidade ?? "N/A"})
        </p>
      </div>
    </>
  );
}
