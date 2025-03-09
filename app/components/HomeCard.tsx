import React from "react";

interface CardProps {
  title: string;
  description: string;
  href: string;
}

const HomeCard: React.FC<CardProps> = ({ title, description, href }) => {
  return (
    <a
      href={href}
      className="block bg-white dark:bg-gray-800 text-left p-6 rounded-lg shadow-md dark:shadow-lg transition-all hover:shadow-xl dark:hover:shadow-2xl hover:scale-[1.02] focus:ring-2 focus:ring-[#1d4a5d] outline-none"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mt-2">{description}</p>
    </a>
  );
};

export default HomeCard;
