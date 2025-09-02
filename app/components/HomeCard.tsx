"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useLogging } from "../hooks/useLogging";

interface CardProps {
  title: string;
  description: string;
  href: string;
}

const HomeCard: React.FC<CardProps> = ({ title, description, href }) => {
  const router = useRouter();
  const loggingService = useLogging();

  const handleNavigation = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Log navigation
    await loggingService.logNavigation("/home", href, {
      cardTitle: title,
      cardDescription: description
    });
    
    // Navigate to the destination
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleNavigation}
      className="block bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 text-left p-6 rounded-2xl shadow-soft border border-slate-200/50 dark:border-slate-600/50 transition-all duration-300 hover:shadow-soft-lg hover:scale-[1.02] hover:border-primary-300/50 dark:hover:border-primary-600/50 focus:ring-2 focus:ring-primary-500 outline-none w-full group backdrop-blur-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mt-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200">{description}</p>
    </a>
  );
};

export default HomeCard;
