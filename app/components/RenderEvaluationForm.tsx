"use client";

import { useEffect, useState } from "react";
import { TextAreaInput } from "@/app/components/TextAreaInput";
import EvaluationTable from "@/app/components/EvaluationTable";

export interface Criteria {
  id: string;
  description: string;
  score: number;
}

export interface Evaluation {
  evaluated: boolean;
  scores: Criteria[];
  average: number;
  techText: string;
}

interface RenderEvaluationFormProps {
  setEvaluationToSend: (evaluation: Evaluation) => void;
  evaluationFromDb?: Evaluation | null;
}

const RenderEvaluationForm: React.FC<RenderEvaluationFormProps> = ({
  setEvaluationToSend,
  evaluationFromDb,
}) => {
  const [scores, setScores] = useState<Criteria[]>(
    evaluationFromDb?.scores || []
  );
  const [average, setAverage] = useState<number>(
    evaluationFromDb?.average || 0
  );
  const [techText, setTechText] = useState(evaluationFromDb?.techText || "");

  // Table headers and rows
  const HEADERS = ["Critério", "Descrição do Critério", "Pontuação"];
  const ROWS: [string, string, string][] = [
    ["A", "Interesse público do projeto", ""],
    [
      "B",
      "Relevância, atendimento à diversidade cultural e criatividade do projeto",
      "",
    ],
    ["C", "Acessibilidade e inclusão", ""],
    ["D", "Viabilidade de realização do projeto", ""],
    [
      "E",
      "Comprovação da experiência do proponente e dos integrantes envolvidos no projeto",
      "",
    ],
  ];

  const calculateAverage = (scores: Criteria[]): number => {
    if (!scores.length) return 0;
    const total = scores.reduce((sum, item) => sum + (item.score || 0), 0);
    return total / scores.length;
  };

  const handleScoresUpdate = (updatedScores: Criteria[]) => {
    const avg = calculateAverage(updatedScores);
    setScores(updatedScores);
    setAverage(avg);

    const evaluation: Evaluation = {
      evaluated: true,
      scores: updatedScores,
      average: avg,
      techText,
    };

    setEvaluationToSend(evaluation);
  };

  // If evaluationFromDb changes (e.g. after fetch), update state
  useEffect(() => {
    if (evaluationFromDb) {
      setScores(evaluationFromDb.scores || []);
      setAverage(evaluationFromDb.average || 0);
      setTechText(evaluationFromDb.techText || "");
    }
  }, [evaluationFromDb]);

  useEffect(() => {
    if (!scores.length) return;
    const evaluation: Evaluation = {
      evaluated: true,
      scores,
      average,
      techText,
    };
    setEvaluationToSend(evaluation);
  }, [techText, scores, average, setEvaluationToSend]);

  return (
    <div className="p-4">
      {/* Legend */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Legenda:</strong> Cada critério deve receber uma nota de <strong>0 a 10</strong>. 
          A média final será calculada automaticamente.
        </p>
      </div>

      <EvaluationTable
        headers={HEADERS}
        rows={ROWS}
        onScoresUpdate={handleScoresUpdate}
      />

      {/* Average Display */}
      <div className="mt-6 p-6 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Média Final</p>
            <p className="text-white text-xs mt-1">Calculada automaticamente</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-white">
              {average ? average.toFixed(2) : "0.00"}
            </p>
            <p className="text-white/70 text-sm">de 10.00</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl mb-4 font-semibold text-slate-900 dark:text-slate-100">Parecer Técnico</h2>
        <TextAreaInput
          value={techText}
          onChange={(e) => setTechText(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RenderEvaluationForm;
