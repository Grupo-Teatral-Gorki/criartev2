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
        <div className="p-6 flex-1 bg-white shadow-lg rounded-lg">
          <ConfigProcess />
        </div>
        <div className="p-6 flex-1 bg-white shadow-lg rounded-lg">
          <ConfigNewCity />
        </div>
      </div>
      
      {/* Bottom row: Edit Projects (full width) */}
      <div className="p-6 w-full max-w-6xl bg-white shadow-lg rounded-lg max-h-[700px] overflow-y-auto">
        <EditCityProjects />
      </div>
    </div>
  );
};

export default CityConfigPage;
