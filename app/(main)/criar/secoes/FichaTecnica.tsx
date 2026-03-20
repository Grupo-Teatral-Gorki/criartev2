import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { applyCPFMask } from "@/app/utils/masks";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type FichaTecnicaItem = {
  nome: string;
  cargo: string;
  cpf: string;
};

const EMPTY_ROW: FichaTecnicaItem = {
  nome: "",
  cargo: "",
  cpf: "",
};

const FichaTecnica = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { dbUser } = useAuth();

  const [rows, setRows] = useState<FichaTecnicaItem[]>([{ ...EMPTY_ROW }]);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    const loadFichaTecnica = async () => {
      if (!projectId) return;

      try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) return;

        const data = projectSnap.data();
        const savedRows = Array.isArray(data.fichaTecnica)
          ? (data.fichaTecnica as FichaTecnicaItem[])
          : [];

        if (savedRows.length > 0) {
          setRows(savedRows);
        }
      } catch (error) {
        console.error("Erro ao carregar ficha técnica:", error);
      }
    };

    loadFichaTecnica();
  }, [projectId]);

  const updateRow = (index: number, field: keyof FichaTecnicaItem, value: string) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleSave = async () => {
    if (!projectId) {
      setToastType("error");
      setToastMessage("Projeto não identificado.");
      setShowToast(true);
      return;
    }

    setSaving(true);

    try {
      const filteredRows = rows.filter(
        (row) => row.nome.trim() || row.cargo.trim() || row.cpf.trim()
      );

      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        fichaTecnica: filteredRows,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });

      setToastType("success");
      setToastMessage("Ficha técnica salva com sucesso!");
      setShowToast(true);
    } catch (error) {
      console.error("Erro ao salvar ficha técnica:", error);
      setToastType("error");
      setToastMessage("Não foi possível salvar a ficha técnica.");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ficha Técnica</h3>
        <Button label="Adicionar linha" size="small" onClick={addRow} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full bg-white dark:bg-slate-900">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="text-left text-sm font-medium p-3">Nome</th>
              <th className="text-left text-sm font-medium p-3">Cargo</th>
              <th className="text-left text-sm font-medium p-3">CPF</th>
              <th className="text-left text-sm font-medium p-3 w-24">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-2">
                  <input
                    type="text"
                    value={row.nome}
                    onChange={(e) => updateRow(index, "nome", e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-navy"
                    placeholder="Nome completo"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.cargo}
                    onChange={(e) => updateRow(index, "cargo", e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-navy"
                    placeholder="Cargo"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.cpf}
                    onChange={(e) => updateRow(index, "cpf", applyCPFMask(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-navy"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => removeRow(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                    disabled={rows.length === 1}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button
          label={saving ? "Salvando..." : "Salvar Ficha Técnica"}
          onClick={handleSave}
          disabled={saving}
          size="medium"
        />
      </div>

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default FichaTecnica;
