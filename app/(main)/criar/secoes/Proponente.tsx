/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import { SelectInput } from "@/app/components/SelectInput";
import Tabs from "@/app/components/Tabs";
import { TextInput } from "@/app/components/TextInput";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Proponent = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProponent, setSelectedProponent] = useState("");
  const [proponents, setProponents] = useState<any[]>([]);
  const { dbUser } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const getUserProponents = async () => {
    const q = query(
      collection(db, "proponents"),
      where("userId", "==", dbUser?.id)
    );

    const querySnapshot = await getDocs(q);
    const proponents = querySnapshot.docs.map((doc) => ({
      value: doc.id,
      label: doc.data().fullName || doc.data().corporateName,
    }));
    setProponents(proponents);
  };

  const handleProponentChange = async (proponentId: string) => {
    setSelectedProponent(proponentId);
    if (!projectId) return console.error("Projeto não encontrado");
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      proponentId,
      updatedAt: new Date(),
      updatedBy: dbUser?.id,
    });
  };

  const getDbProponent = async (projectId: string) => {
    if (!projectId) return;

    try {
      const projectQuery = query(
        collection(db, "projects"),
        where("projectId", "==", projectId)
      );

      const projectSnapshot = await getDocs(projectQuery);
      const projectDoc = projectSnapshot.docs[0];

      if (!projectDoc) {
        console.log("Project not found.");
        return null;
      }

      const { proponentId } = projectDoc.data();

      if (!proponentId) {
        console.log("No proponentId in project document.");
        return null;
      }

      const proponentSnap = await getDoc(doc(db, "proponents", proponentId));

      if (!proponentSnap.exists()) {
        console.log("Proponent not found.");
        return null;
      }

      const proponentData = proponentSnap.data();

      setSelectedProponent(proponentId); // or format however you want
      return proponentData;
    } catch (error) {
      console.error("Error fetching proponent:", error);
      return null;
    }
  };

  useEffect(() => {
    if (projectId) {
      getDbProponent(projectId);
    }

    getUserProponents();
  }, []);

  return (
    <>
      <div className="w-full mt-4">
        {
          /* proponents.length === 0 && */ <div className="w-full flex justify-end mb-4">
            <Button
              label={"Novo Proponente"}
              size="medium"
              variant="default"
              onClick={() => setModalOpen(true)}
            />
          </div>
        }
        <h2 className="mb-4 text-lg">Selecione um Proponente:</h2>
        <SelectInput
          options={proponents}
          value={selectedProponent}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleProponentChange(e.target.value)
          }
        />
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <NovoProponente onClose={() => setModalOpen(false)} />
      </Modal>
    </>
  );
};

export default Proponent;

const NovoProponente = ({ onClose }: { onClose: () => void }) => {
  const tabs = [
    {
      label: "Pessoa Física",
      content: <PessoaFisica onClose={onClose} />,
    },
    {
      label: "Pessoa Jurídica",
      content: <PessoaJuridica onClose={onClose} />,
    },
  ];
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h2 className="text-2xl m-3">Cadastrar Proponente</h2>
      <Tabs tabs={tabs} />
    </div>
  );
};
const PessoaFisica = ({ onClose }: { onClose: () => void }) => {
  type PfFormValue = Record<string, string>;
  const [pfData, setPfData] = useState<PfFormValue>({
    fullName: "",
    socialName: "",
    CPF: "",
    rg: "",
    dob: "",
    email: "",
    cel: "",
    phone: "",
    otherPhone: "",
    website: "",
    zip: "",
    streetName: "",
    number: "",
    extraInfo: "",
    neighborhood: "",
    city: "",
    uf: "",
  });

  const pessoaFisicaForm: {
    value: string;
    label: string;
    type: "email" | "text" | "password";
  }[] = [
    { value: "fullName", label: "Nome Completo", type: "text" },
    { value: "socialName", label: "Nome Social", type: "text" },
    { value: "CPF", label: "CPF", type: "text" },
    { value: "rg", label: "RG", type: "text" },
    { value: "dob", label: "Data de Nascimento", type: "text" },
    { value: "email", label: "E-mail", type: "email" },
    { value: "cel", label: "Celular", type: "text" },
    { value: "phone", label: "Telefone Fixo", type: "text" },
    { value: "otherPhone", label: "Telefone Outro", type: "text" },
    { value: "website", label: "Website", type: "text" },
    { value: "zip", label: "CEP", type: "text" },
    { value: "streetName", label: "Logradouro", type: "text" },
    { value: "number", label: "Número", type: "text" },
    { value: "extraInfo", label: "Complemento", type: "text" },
    { value: "neighborhood", label: "Bairro", type: "text" },
    { value: "city", label: "Cidade", type: "text" },
    { value: "uf", label: "UF", type: "text" },
  ];

  const { dbUser } = useAuth();

  const handleChange = (
    key: keyof PfFormValue,
    event: string | React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = typeof event === "string" ? event : event.target.value;
    setPfData((prev) => ({ ...prev, [key]: value }));
  };

  const addNewProponent = async (pfData: Record<string, string>) => {
    try {
      const docRef = await addDoc(collection(db, "proponents"), {
        ...pfData,
        userId: dbUser?.id,
        proponentType: "PF",
      });

      await updateDoc(doc(db, "proponents", docRef.id), {
        proponentId: docRef.id,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });
      alert("Proponente adicionado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Error adding proponent:", error);
    }
  };

  const handleSubmit = () => {
    const fieldLabels: Record<string, string> = {
      fullName: "Nome completo",
      CPF: "CPF",
      dob: "Data de nascimento",
      email: "E-mail",
      cel: "Telefone",
      city: "Cidade",
      uf: "Estado (UF)",
    };

    const requiredFields = [
      "fullName",
      "CPF",
      "dob",
      "email",
      "cel",
      "city",
      "uf",
    ];

    const missingFields = requiredFields.filter((field) => !pfData[field]);
    const errorMessages = missingFields.map((field) => fieldLabels[field]);
    if (missingFields.length > 0) {
      alert(
        `Os seguintes campos são obrigatórios: ${errorMessages.join(", ")}`
      );
      return; // Não envia se algum campo estiver vazio
    }
    addNewProponent(pfData);
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

const PessoaJuridica = ({ onClose }: { onClose: () => void }) => {
  type PjFormValue = Record<string, string>;

  const [pjData, setPjData] = useState<PjFormValue>({
    corporateName: "", // (Razão Social)
    taxId: "", // (CNPJ)
    tradeName: "", // (Nome Fantasia)
    email: "",
    mobile: "",
    phone: "",
    otherPhone: "",
    website: "",
    postalCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "", // (UF)
  });

  const pessoaJuridicaForm: {
    value: string;
    label: string;
    type: "email" | "text" | "password";
  }[] = [
    { value: "corporateName", label: "Razão Social", type: "text" },
    { value: "taxId", label: "CNPJ", type: "text" },
    { value: "tradeName", label: "Nome Fantasia", type: "text" },
    { value: "email", label: "E-mail", type: "email" },
    { value: "mobile", label: "Celular", type: "text" },
    { value: "phone", label: "Telefone Fixo", type: "text" },
    { value: "otherPhone", label: "Telefone Outro", type: "text" },
    { value: "website", label: "Website", type: "text" },
    { value: "postalCode", label: "CEP", type: "text" },
    { value: "street", label: "Logradouro", type: "text" },
    { value: "number", label: "Número", type: "text" },
    { value: "complement", label: "Complemento", type: "text" },
    { value: "neighborhood", label: "Bairro", type: "text" },
    { value: "city", label: "Cidade", type: "text" },
    { value: "state", label: "UF", type: "text" },
  ];

  const { dbUser } = useAuth();

  const handleChange = (
    key: keyof PjFormValue,
    event: string | React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = typeof event === "string" ? event : event.target.value;
    setPjData((prev) => ({ ...prev, [key]: value }));
  };

  const addNewProponent = async (pfData: Record<string, string>) => {
    try {
      const docRef = await addDoc(collection(db, "proponents"), {
        ...pfData,
        userId: dbUser?.id,
        proponentType: "PJ",
      });

      await updateDoc(doc(db, "proponents", docRef.id), {
        proponentId: docRef.id,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });
      alert("Proponente adicionado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Error adding proponent:", error);
    }
  };

  const handleSubmit = () => {
    const fieldLabels: Record<string, string> = {
      corporateName: "Razão social",
      taxId: "CNPJ",
      tradeName: "Nome fantasia",
      email: "E-mail",
      mobile: "Telefone",
      city: "Cidade",
      state: "Estado (UF)",
    };
    const requiredFields = [
      "corporateName",
      "taxId",
      "tradeName",
      "email",
      "mobile",
      "city",
      "state",
    ];
    const missingFields = requiredFields.filter((field) => !pjData[field]);
    const errorMessages = missingFields.map((field) => fieldLabels[field]);
    if (missingFields.length > 0) {
      alert(
        `Os seguintes campos são obrigatórios: ${errorMessages.join(", ")}`
      );
      return; // Não envia se algum campo estiver vazio
    }
    addNewProponent(pjData);
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
