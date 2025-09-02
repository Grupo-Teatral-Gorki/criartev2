/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Criteria } from "./RenderEvaluationForm";

type EvaluationTableProps = {
  headers: string[];
  rows: (string | number)[][];
  onScoresUpdate: (updatedScores: any[]) => void; // Callback to send scores to parent
};

const EvaluationTable: React.FC<EvaluationTableProps> = ({
  headers,
  rows,
  onScoresUpdate,
}) => {
  const [tableData, setTableData] = useState(rows);

  const handleChange = (value: string, rowIndex: number, cellIndex: number) => {
    const updatedRows = [...tableData];
    updatedRows[rowIndex][cellIndex] = value ? parseFloat(value) : 0;

    setTableData(updatedRows);
    const criteriaArray: Criteria[] = updatedRows.map((row) => ({
      id: row[0] as string,
      description: row[1] as string,
      score: typeof row[2] === "number" ? row[2] : 0,
    }));
    onScoresUpdate(criteriaArray);
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full border-collapse rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            {headers.map((header, index) => (
              <th key={index} className="p-3 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="odd:bg-gray-100 even:bg-white text-black"
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3 border">
                  {cellIndex === row.length - 1 ? (
                    <input
                      type="number"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#1d4f5d]"
                      value={typeof cell === "number" ? cell : ""}
                      onChange={(e) =>
                        handleChange(e.target.value, rowIndex, cellIndex)
                      }
                    />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluationTable;
