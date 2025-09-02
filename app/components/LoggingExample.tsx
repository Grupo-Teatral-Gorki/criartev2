"use client";
import React, { useState } from "react";
import { useLogging } from "../hooks/useLogging";
import Button from "./Button";

// Example component demonstrating logging usage
const LoggingExample: React.FC = () => {
  const loggingService = useLogging();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    await loggingService.logSearch(searchQuery, 10, { component: "LoggingExample" });
    console.log(`Searching for: ${searchQuery}`);
  };

  const handleDownload = async () => {
    await loggingService.logDownload("example-file.pdf", { 
      component: "LoggingExample",
      downloadType: "manual" 
    });
    console.log("Download initiated");
  };

  const handleModalOpen = async () => {
    await loggingService.logModalOpen("ExampleModal", { 
      component: "LoggingExample" 
    });
    console.log("Modal opened");
  };

  const handleEdit = async () => {
    await loggingService.logEdit("document", "doc-123", { 
      component: "LoggingExample",
      editType: "content" 
    });
    console.log("Edit action logged");
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Logging System Examples</h2>
      
      {/* Button clicks are automatically logged */}
      <div className="space-y-2">
        <Button 
          label="Download File" 
          onClick={handleDownload}
          logMetadata={{ section: "downloads" }}
        />
        
        <Button 
          label="Open Modal" 
          onClick={handleModalOpen}
          variant="outlined"
          logMetadata={{ modalType: "example" }}
        />
        
        <Button 
          label="Edit Document" 
          onClick={handleEdit}
          variant="save"
          logMetadata={{ documentId: "doc-123" }}
        />
      </div>

      {/* Search example */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search query..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <Button 
          label="Search" 
          onClick={handleSearch}
          size="medium"
          logMetadata={{ searchType: "manual" }}
        />
      </div>
    </div>
  );
};

export default LoggingExample;
