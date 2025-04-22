"use client";
import { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div className="w-full mx-auto p-4">
      {/* Tabs Navigation */}
      <div className="flex flex-col sm:flex-row overflow-x-auto gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`w-full sm:w-auto px-4 py-3 text-sm sm:text-base font-medium rounded-t-md transition-colors duration-200 
            ${
              activeTab === tab.label
                ? "bg-[#1d4a5d] text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-100  hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-b-md">
        {tabs.find((tab) => tab.label === activeTab)?.content}
      </div>
    </div>
  );
}
