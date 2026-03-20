"use client";

import React from "react";
import ConfigProcess from "./ConfigProcess";
import EditCityProjects from "./EditCityProjects";
import ConfigNewCity from "./ConfigNewCity";

const CityConfigPage = () => {
  return (
    <div className="flex items-center flex-col justify-center gap-6 px-4 py-8">
      {/* Top row: Process Stage and New City */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        <div className="p-6 flex-1 rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft-lg">
          <ConfigProcess />
        </div>
        <div className="p-6 flex-1 rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft-lg">
          <ConfigNewCity />
        </div>
      </div>
      
      {/* Bottom row: Edit Projects (full width) */}
      <div className="p-6 w-full max-w-6xl rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft-lg max-h-[700px] overflow-y-auto">
        <EditCityProjects />
      </div>
    </div>
  );
};

export default CityConfigPage;
