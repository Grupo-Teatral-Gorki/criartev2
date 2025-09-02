"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoggedLink from "./LoggedLink";
import {
  User,
  LogOut,
  ShieldCheck,
  Home,
  Newspaper,
  Bolt,
  LayoutDashboard,
  ClipboardList,
  ChevronDown,
  MapPin,
  FileText,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { findCityLabel } from "../utils/validators";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import { SelectInput } from "./SelectInput";
import Button from "./Button";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { useLogging } from "../hooks/useLogging";

type CityOption = {
  value: string;
  label: string;
};

type CityDoc = {
  cityId: string;
  name: string;
};

export default function Header() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [citiesOptions, setCitiesOptions] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { dbUser, updateCityId } = useAuth();
  const router = useRouter();
  const userRole = dbUser?.userRole || [];
  const loggingService = useLogging();

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    updateCityId(cityId);
  };

  const fetchAllCities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cities"));

      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as CityDoc),
      }));

      const options = docs.map((item) => ({
        value: item.cityId,
        label: item.name,
      }));
      setCitiesOptions(options);
      return docs;
    } catch (error) {
      console.error("Error fetching documents: ", error);
      return [];
    }
  };

  // Navigation links configuration
  const navigationLinks = [
    {
      href: "/home",
      label: "Home",
      icon: <Home className="w-4 h-4" />,
      rolesAllowed: ["user", "secretary", "reviewer", "staff", "admin"],
    },
    {
      href: "/meusprojetos",
      label: "Meus Projetos",
      icon: <Newspaper className="w-4 h-4" />,
      rolesAllowed: ["user", "secretary", "reviewer", "staff", "admin"],
    },
    {
      href: "/admin",
      label: "Configurações",
      icon: <Bolt className="w-4 h-4" />,
      rolesAllowed: ["staff", "admin"],
    },
    {
      href: "/management",
      label: "Gestão",
      icon: <LayoutDashboard className="w-4 h-4" />,
      rolesAllowed: ["secretary", "staff", "admin"],
    },
    {
      href: "/management/mapping",
      label: "Mapeamento",
      icon: <MapPin className="w-4 h-4" />,
      rolesAllowed: ["secretary", "staff", "admin"],
    },
    {
      href: "/admin/review",
      label: "Avaliar Projetos",
      icon: <ClipboardList className="w-4 h-4" />,
      rolesAllowed: ["reviewer", "admin"],
    },
    {
      href: "/admin/logs",
      label: "Logs do Sistema",
      icon: <FileText className="w-4 h-4" />,
      rolesAllowed: ["admin"],
    },
  ];

  const filteredLinks = navigationLinks.filter((link) =>
    link.rolesAllowed.some((role) => userRole.includes(role))
  );

  useEffect(() => {
    fetchAllCities();
  }, []);

  return (
    <>
      {/* Main Navigation Header */}
      <header className="bg-white dark:bg-slate-900 shadow-soft border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 p-2 z-40 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => router.push("/home")}
            >
              <div className="p-2 rounded-xl transition-all duration-200 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                <Image
                  src="https://styxx-public.s3.sa-east-1.amazonaws.com/logo-criarte.png"
                  alt="Logo"
                  width={100}
                  height={32}
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {filteredLinks.map((link) => (
                <LoggedLink
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 font-medium text-sm group"
                  logMetadata={{ linkLabel: link.label, userRole: userRole }}
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {link.icon}
                  </span>
                  {link.label}
                </LoggedLink>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LoggedLink 
                href="/profile"
                logMetadata={{ linkType: "profile_access" }}
              >
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-200 hover:scale-105">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400" />
                </div>
              </LoggedLink>
              <button
                onClick={async () => {
                  await loggingService.logLogout({ source: "header_button" });
                  router.push("/");
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-error-100 dark:hover:bg-error-900/30 transition-all duration-200 hover:scale-105"
              >
                <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-error-600 dark:hover:text-error-400" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-200"
              >
                <ChevronDown
                  className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
                    mobileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="py-4 space-y-2 border-t border-slate-200/50 dark:border-slate-700/50">
              {filteredLinks.map((link) => (
                <LoggedLink
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  logMetadata={{ linkLabel: link.label, userRole: userRole, source: "mobile_menu" }}
                >
                  {link.icon}
                  {link.label}
                </LoggedLink>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Info Bar */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300">
                <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse-soft"></span>
                <span className="font-medium">v2.0</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-medium">Cidade:</span>{" "}
                {findCityLabel(dbUser?.cityId ?? "")}
              </div>
              <div className="text-slate-500 dark:text-slate-500 text-xs font-mono">
                ID: {dbUser?.cityId}
              </div>
            </div>
            {["admin", "staff"].some((role) =>
              dbUser?.userRole?.includes(role)
            ) && (
              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 border border-primary-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-700"
                  onClick={() => setModalIsOpen(true)}
                >
                  Trocar Cidade
                </button>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-error-500 to-error-600 px-2.5 py-1 rounded-lg text-white shadow-soft">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-xs font-medium">Supervisor</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
        <div className="flex flex-col items-center justify-center p-14">
          <SelectInput
            label={"Selecione a cidade"}
            options={citiesOptions}
            value={selectedCity}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleCityChange(e.target.value)
            }
          />
          <div className="w-full flex justify-end mt-4">
            <Button
              label={"Selecionar"}
              size="medium"
              onClick={() => setModalIsOpen(false)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
