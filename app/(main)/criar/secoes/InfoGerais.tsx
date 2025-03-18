/* eslint-disable @typescript-eslint/no-explicit-any */
import { SelectInput } from "@/app/components/SelectInput";
import { TextAreaInput } from "@/app/components/TextAreaInput";
import React, { useState } from "react";

const detalhesProjeto = [
  { value: "resumo_projeto", label: "Resumo do projeto" },
  { value: "relevancia_pertinencia", label: "Relevância e pertinência" },
  {
    value: "perfil_publico_alvo",
    label: "Perfil do público-alvo e classificação indicativa",
  },
  {
    value: "quantidade_publico",
    label: "Expectativa da quantidade de público alcançado com o projeto",
  },
  { value: "plano_divulgacao", label: "Plano de divulgação" },
  {
    value: "plano_acessibilidade",
    label: "Plano de acessibilidade e democratização do acesso",
  },
  {
    value: "acoes_afirmativas",
    label:
      "Plano de ações afirmativas, em atenção ao item 5 deste edital, a fim de cumprir o art. 18 da IN nº 10 do MinC",
  },
  {
    value: "detalhamento_contrapartida",
    label: "Detalhamento da proposta de contrapartida",
  },
];

const opcoesCategoria = [
  { value: "musica_bandas_grupos", label: "Música - Bandas Ou Grupos" },
  { value: "musica_duplas_trios", label: "Música - Duplas Ou Trios" },
  {
    value: "musica_artista_solo",
    label: "Música - Artista Vocal E/Ou Instrumental Solo",
  },
  { value: "artes_plasticas", label: "Artes Plásticas" },
  { value: "fotografia", label: "Fotografia" },
  { value: "artesanato", label: "Artesanato" },
  { value: "teatro", label: "Teatro" },
  { value: "danca", label: "Dança" },
  {
    value: "cultura_afro_brasileira",
    label: "Cultura Afro-Brasileira E Tradição",
  },
  { value: "literatura", label: "Literatura" },
  { value: "eventos_mostra", label: "Eventos Culturais - Mostra" },
  { value: "eventos_festival", label: "Eventos Culturais - Festival" },
  { value: "contacao_historias", label: "Contação De Histórias" },
];

const modalidade = [
  { value: "1", label: "Módulo 1" },
  { value: "2", label: "Módulo 2" },
];

type FormValues = Record<string, string>;

const InfoGerais = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    categoria: "",
    modalidade: "",
    ...Object.fromEntries(detalhesProjeto.map((field) => [field.value, ""])),
  });

  const handleChange = (
    key: keyof FormValues,
    event: string | React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = typeof event === "string" ? event : event.target.value;
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const camposSelect = [
    { key: "modalidade", label: "Modalidade do Projeto", options: modalidade },
    {
      key: "categoria",
      label: "Categoria do Projeto",
      options: opcoesCategoria,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 mt-8 gap-5">
      {detalhesProjeto.map((field) => (
        <TextAreaInput
          key={field.value}
          label={field.label}
          value={formValues[field.value]}
          onChange={(e) => handleChange(field.value, e.target.value)}
        />
      ))}
      {camposSelect.map((field) => (
        <SelectInput
          key={field.key}
          label={field.label}
          options={field.options}
          value={formValues[field.key] || ""}
          onChange={(e: any) => handleChange(field.key, e)}
        />
      ))}
    </div>
  );
};

export default InfoGerais;
