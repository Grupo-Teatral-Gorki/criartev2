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
    <div>
      <div className="w-full flex items-center justify-end p-4">
        <h2 className="text-2xl mr-4 text-white">
          Avaliação Final: {average ? average.toFixed(2) : ""}
        </h2>
      </div>

      <EvaluationTable
        headers={HEADERS}
        rows={ROWS}
        onScoresUpdate={handleScoresUpdate}
      />

      <div className="p-4">
        <h2 className="text-xl mb-4 text-white">Parecer Técnico</h2>
        <TextAreaInput
          value={techText}
          onChange={(e) => setTechText(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RenderEvaluationForm;
