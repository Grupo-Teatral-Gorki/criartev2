/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Button from "@/app/components/Button";
import { MultiSelectInput } from "@/app/components/MultiSelectInput";
import { SelectInput } from "@/app/components/SelectInput";

const ProjetosGestao = () => {
  interface CityConfig {
    cityName: string;
    cityCode: string;
    cityState: string;
    typesOfEdital: EditalType[];
  }

  interface EditalType {
    name: string;
    description: string;
    info: EditalField[];
    documents: {
      pf: DocumentInfo[];
      pj: DocumentInfo[];
    };
  }

  interface EditalField {
    name: string;
    type: string;
    options?: string[]; // Only if the type is select
  }

  interface DocumentInfo {
    name: string;
    label: string;
  }

  const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
  const [municipios, setMunicipios] = useState<{ id: number; nome: string }[]>(
    []
  );
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>();
  const [municipioSelecionado, setMunicipioSelecionado] = useState<string>("");
  const [tiposEditais, setTiposEditais] = useState<string[]>([]);
  const [configMunicipio, setConfigMunicipio] = useState<CityConfig[]>([]);
  const [dynamicFields, setDynamicFields] = useState<{
    [key: string]: EditalField[];
  }>({});

  const [newField, setNewField] = useState<EditalField>({
    name: "",
    type: "texto",
    options: [],
  });

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        ); // Replace with actual API URL
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!estadoSelecionado) return;

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`
        );
        const data = await response.json();
        setMunicipios(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchMunicipios();
  }, [estadoSelecionado]);

  const handleAddField = (editalName: string) => {
    if (newField.name.trim() === "") return; // Prevent adding empty fields

    setDynamicFields((prev) => {
      const updated = { ...prev };
      if (!updated[editalName]) {
        updated[editalName] = [];
      }
      updated[editalName].push(newField);
      return updated;
    });

    // Reset the newField state after adding
    setNewField({ name: "", type: "texto", options: [] });
  };

  const handleFieldChange = (field: string, value: any) => {
    setNewField((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderDynamicFieldsSummary = (editalName: string) => {
    return (
      <div>
        {dynamicFields[editalName]?.map((field, index) => (
          <div key={index} className="flex gap-2">
            <p>
              <strong>Name:</strong> {field.name} <strong>Type:</strong>{" "}
              {field.type}
              {field.options && field.options.length > 0 && (
                <span>
                  {" "}
                  <strong>Options:</strong> {field.options.join(", ")}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const handleClick = () => {
    const found = municipios.find(
      (item) => String(item.id) === municipioSelecionado
    );
    const newCityToBeAdded = {
      cityName: found?.nome || "",
      cityCode: municipioSelecionado,
      cityState: estadoSelecionado || "",
      typesOfEdital: tiposEditais.map((edital) => ({
        name: edital,
        description: "Description to be determined",
        info: [
          {
            name: "campo 1",
            type: "texto",
            options: [],
          },
        ],
        documents: {
          pf: [{ name: "doc1", label: "label doc 1" }],
          pj: [{ name: "doc1", label: "label doc 1" }],
        },
      })),
    };
    setConfigMunicipio((prev) => [...prev, newCityToBeAdded]);
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col gap-2 w-[60%] mt-12 p-8 bg-primary dark:bg-navy rounded shadow-md">
        <SelectInput
          label="Selecione um estado"
          value={estadoSelecionado}
          onChange={(e: any) => setEstadoSelecionado(e.target.value)}
          options={estados.map((uf) => ({ label: uf.nome, value: uf.sigla }))}
        />
        <SelectInput
          label="Selecione um município"
          value={municipioSelecionado}
          onChange={(e: any) => setMunicipioSelecionado(e.target.value)}
          options={municipios.map((mun) => ({
            label: mun.nome,
            value: mun.id.toString(),
          }))}
          disabled={!estadoSelecionado}
        />
        {municipioSelecionado && estadoSelecionado && (
          <MultiSelectInput
            options={[
              { value: "fomento", label: "Fomento" },
              { value: "culturaViva", label: "Cultura Viva" },
            ]}
            value={tiposEditais}
            onChange={(selected) => setTiposEditais(selected)}
          />
        )}

        {/* Add New Dynamic Field */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newField.name}
            placeholder="Field Name"
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className="p-2 border"
          />
          <select
            value={newField.type}
            onChange={(e) => handleFieldChange("type", e.target.value)}
            className="p-2 border"
          >
            <option value="texto">Texto</option>
            <option value="select">Select</option>
          </select>
          {newField.type === "select" && (
            <input
              type="text"
              value={newField.options?.join(", ")}
              onChange={(e) =>
                handleFieldChange(
                  "options",
                  e.target.value.split(",").map((option) => option.trim())
                )
              }
              placeholder="Options (comma separated)"
              className="p-2 border"
            />
          )}
          <button
            type="button"
            onClick={() => handleAddField(tiposEditais[0] || "default")}
            className="p-2 bg-green-500 text-white"
          >
            Add Field
          </button>
        </div>

        {tiposEditais.map((edital) => (
          <div key={edital}>
            <h3>{edital}</h3>
            {renderDynamicFieldsSummary(edital)}
          </div>
        ))}

        <div className="w-[10%]">
          <Button label={"Enviar"} size="medium" onClick={handleClick} />
        </div>
      </div>
    </div>
  );
};

export default ProjetosGestao;
