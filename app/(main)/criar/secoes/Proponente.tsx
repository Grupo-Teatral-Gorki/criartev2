/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import { SelectInput } from "@/app/components/SelectInput";
import Tabs from "@/app/components/Tabs";
import { TextInput } from "@/app/components/TextInput";
import React, { useEffect, useState } from "react";

const Proponent = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const options = [
    { value: "option1", label: "Proponente 1" },
    { value: "option2", label: "Proponente 2" },
    { value: "option3", label: "Proponente 3" },
  ];

  const handleChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  useEffect(() => {
    console.log("selected", selectedValue);
  }, [selectedValue]);

  return (
    <>
      <div className="w-full mt-4">
        <div className="w-full flex justify-end mb-4">
          <Button
            label={"Novo Proponente"}
            size="medium"
            variant="default"
            onClick={() => setModalOpen(true)}
          />
        </div>
        <h2 className="mb-4 text-lg">Selecione um Proponente:</h2>
        <SelectInput
          options={options}
          value={selectedValue}
          onChange={(e: any) => handleChange(e)}
        />
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <NovoProponente />
      </Modal>
    </>
  );
};

export default Proponent;

const NovoProponente = () => {
  const tabs = [
    {
      label: "Pessoa Física",
      content: <PessoaFisica />,
    },
    {
      label: "Pessoa Jurídica",
      content: <PessoaJuridica />,
    },
  ];
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h2 className="text-2xl m-3">Cadastrar Proponente</h2>
      <Tabs tabs={tabs} />
    </div>
  );
};

const PessoaFisica = () => {
  type PfFormValue = Record<string, string>;
  const [pfData, setPfData] = useState<PfFormValue>({
    nomeCompleto: "",
    nomeSocial: "",
    CPF: "",
    rg: "",
    dob: "",
    email: "",
    celular: "",
    fixo: "",
    telefoneOutro: "",
    website: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  });

  const pessoaFisicaForm: {
    value: string;
    label: string;
    type: "email" | "text" | "password";
  }[] = [
    { value: "nomeCompleto", label: "Nome Completo", type: "text" },
    { value: "nomeSocial", label: "Nome Social", type: "text" },
    { value: "CPF", label: "CPF", type: "text" },
    { value: "rg", label: "RG", type: "text" },
    { value: "dob", label: "Data de Nascimento", type: "text" },
    { value: "email", label: "E-mail", type: "email" },
    { value: "celular", label: "Celular", type: "text" },
    { value: "fixo", label: "Telefone Fixo", type: "text" },
    { value: "telefoneOutro", label: "Telefone Outro", type: "text" },
    { value: "website", label: "Website", type: "text" },
    { value: "cep", label: "CEP", type: "text" },
    { value: "logradouro", label: "Logradouro", type: "text" },
    { value: "numero", label: "Número", type: "text" },
    { value: "complemento", label: "Complemento", type: "text" },
    { value: "bairro", label: "Bairro", type: "text" },
    { value: "cidade", label: "Cidade", type: "text" },
    { value: "uf", label: "UF", type: "text" },
  ];

  const handleChange = (
    key: keyof PfFormValue,
    event: string | React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = typeof event === "string" ? event : event.target.value;
    setPfData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("form", pfData);
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 ">
        {pessoaFisicaForm.map((item) => (
          <TextInput
            key={item.value}
            type={item.type}
            placeholder={item.label}
            value={pfData[item.value]}
            onChange={(e) => handleChange(item.value, e.target.value)}
          />
        ))}
      </div>
      <Button
        label={"Enviar"}
        variant="save"
        onClick={handleSubmit}
        size="medium"
      />
    </div>
  );
};

const PessoaJuridica = () => {
  type PjFormValue = Record<string, string>;

  const [pjData, setPjData] = useState<PjFormValue>({
    razaoSocial: "",
    cnpj: "",
    nomeFantasia: "",
    email: "",
    celular: "",
    fixo: "",
    telefoneOutro: "",
    website: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  });

  const pessoaJuridicaForm: {
    value: string;
    label: string;
    type: "email" | "text" | "password";
  }[] = [
    { value: "razaoSocial", label: "Razão Social", type: "text" },
    { value: "cnpj", label: "CNPJ", type: "text" },
    { value: "nomeFantasia", label: "Nome Fantasia", type: "text" },
    { value: "email", label: "E-mail", type: "email" },
    { value: "celular", label: "Celular", type: "text" },
    { value: "fixo", label: "Telefone Fixo", type: "text" },
    { value: "telefoneOutro", label: "Telefone Outro", type: "text" },
    { value: "website", label: "Website", type: "text" },
    { value: "cep", label: "CEP", type: "text" },
    { value: "logradouro", label: "Logradouro", type: "text" },
    { value: "numero", label: "Número", type: "text" },
    { value: "complemento", label: "Complemento", type: "text" },
    { value: "bairro", label: "Bairro", type: "text" },
    { value: "cidade", label: "Cidade", type: "text" },
    { value: "uf", label: "UF", type: "text" },
  ];

  const handleChange = (
    key: keyof PjFormValue,
    event: string | React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = typeof event === "string" ? event : event.target.value;
    setPjData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("form", pjData);
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 ">
        {pessoaJuridicaForm.map((item) => (
          <TextInput
            key={item.value}
            type={item.type}
            placeholder={item.label}
            value={pjData[item.value]}
            onChange={(e) => handleChange(item.value, e.target.value)}
          />
        ))}
      </div>
      <Button
        label={"Enviar"}
        variant="save"
        onClick={handleSubmit}
        size="medium"
      />
    </div>
  );
};
