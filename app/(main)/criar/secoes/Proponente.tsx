import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import { SelectInput } from "@/app/components/SelectInput";
import Tabs from "@/app/components/Tabs";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Toast from "@/app/components/Toast";

// Zod schemas
const pessoaFisicaSchema = z.object({
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  socialName: z.string().optional(),
  CPF: z.string()
    .min(1, "CPF é obrigatório")
    .refine((cpf) => {
      // Remove formatting and check if it has 11 digits
      const cleanCPF = cpf.replace(/\D/g, '');
      return cleanCPF.length === 11;
    }, "CPF deve ter 11 dígitos"),
  rg: z.string().optional(),
  dob: z.string().min(1, "Data de nascimento é obrigatória"),
  email: z.string().email("Email inválido"),
  cel: z.string().min(10, "Celular é obrigatório"),
  phone: z.string().optional(),
  otherPhone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  zip: z.string().optional(),
  streetName: z.string().optional(),
  number: z.string().optional(),
  extraInfo: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  uf: z.string().min(2, "UF é obrigatório").max(2, "UF deve ter 2 caracteres"),
});

const pessoaJuridicaSchema = z.object({
  corporateName: z.string().min(2, "Razão social é obrigatória"),
  taxId: z.string()
    .min(1, "CNPJ é obrigatório")
    .refine((cnpj) => {
      // Remove formatting and check if it has 14 digits
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      return cleanCNPJ.length === 14;
    }, "CNPJ deve ter 14 dígitos"),
  tradeName: z.string().min(1, "Nome fantasia é obrigatório"),
  email: z.string().email("Email inválido"),
  mobile: z.string().min(10, "Celular é obrigatório"),
  phone: z.string().optional(),
  otherPhone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  postalCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório").max(2, "Estado deve ter 2 caracteres"),
});

type PessoaFisicaFormData = z.infer<typeof pessoaFisicaSchema>;
type PessoaJuridicaFormData = z.infer<typeof pessoaJuridicaSchema>;

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
        return null;
      }

      const { proponentId } = projectDoc.data();

      if (!proponentId) {
        return null;
      }

      const proponentSnap = await getDoc(doc(db, "proponents", proponentId));

      if (!proponentSnap.exists()) {
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
  const { dbUser } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PessoaFisicaFormData>({
    resolver: zodResolver(pessoaFisicaSchema),
  });

  const pessoaFisicaFields = [
    { name: "fullName" as const, label: "Nome Completo *", type: "text" as const, required: true },
    { name: "socialName" as const, label: "Nome Social", type: "text" as const },
    { name: "CPF" as const, label: "CPF *", type: "text" as const, required: true },
    { name: "rg" as const, label: "RG", type: "text" as const },
    { name: "dob" as const, label: "Data de Nascimento *", type: "date" as const, required: true },
    { name: "email" as const, label: "E-mail *", type: "email" as const, required: true },
    { name: "cel" as const, label: "Celular *", type: "tel" as const, required: true },
    { name: "phone" as const, label: "Telefone Fixo", type: "tel" as const },
    { name: "otherPhone" as const, label: "Telefone Outro", type: "tel" as const },
    { name: "website" as const, label: "Website", type: "url" as const },
    { name: "zip" as const, label: "CEP", type: "text" as const },
    { name: "streetName" as const, label: "Logradouro", type: "text" as const },
    { name: "number" as const, label: "Número", type: "text" as const },
    { name: "extraInfo" as const, label: "Complemento", type: "text" as const },
    { name: "neighborhood" as const, label: "Bairro", type: "text" as const },
    { name: "city" as const, label: "Cidade *", type: "text" as const, required: true },
    { name: "uf" as const, label: "UF *", type: "text" as const, required: true },
  ];

  const addNewProponent = async (data: PessoaFisicaFormData) => {
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "proponents"), {
        ...data,
        userId: dbUser?.id,
        proponentType: "PF",
        createdAt: new Date(),
      });

      await updateDoc(doc(db, "proponents", docRef.id), {
        proponentId: docRef.id,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });
      
      setToastMessage("Proponente pessoa física adicionado com sucesso!");
      setToastType("success");
      setShowToast(true);
      reset();
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Error adding proponent:", error);
      setToastMessage("Erro ao adicionar proponente. Tente novamente.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: PessoaFisicaFormData) => {
    addNewProponent(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Dados Pessoais</h3>
          <p className="text-sm text-gray-600">Campos marcados com * são obrigatórios</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pessoaFisicaFields.slice(0, 6).map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  {...register(field.name)}
                  type={field.type}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={field.label.replace(' *', '')}
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-600">{errors[field.name]?.message}</p>
                )}
              </div>
            ))}
          </div>

          {/* Contact Information Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Informações de Contato</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pessoaFisicaFields.slice(6, 10).map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    {...register(field.name)}
                    type={field.type}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={field.label.replace(' *', '')}
                  />
                  {errors[field.name] && (
                    <p className="text-sm text-red-600">{errors[field.name]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Address Information Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Endereço</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pessoaFisicaFields.slice(10).map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    {...register(field.name)}
                    type={field.type}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={field.label.replace(' *', '')}
                  />
                  {errors[field.name] && (
                    <p className="text-sm text-red-600">{errors[field.name]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Salvando..." : "Salvar Proponente"}
            </button>
          </div>
        </form>
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

const PessoaJuridica = ({ onClose }: { onClose: () => void }) => {
  const { dbUser } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PessoaJuridicaFormData>({
    resolver: zodResolver(pessoaJuridicaSchema),
  });

  const pessoaJuridicaFields = [
    { name: "corporateName" as const, label: "Razão Social *", type: "text" as const, required: true },
    { name: "taxId" as const, label: "CNPJ *", type: "text" as const, required: true },
    { name: "tradeName" as const, label: "Nome Fantasia *", type: "text" as const, required: true },
    { name: "email" as const, label: "E-mail *", type: "email" as const, required: true },
    { name: "mobile" as const, label: "Celular *", type: "tel" as const, required: true },
    { name: "phone" as const, label: "Telefone Fixo", type: "tel" as const },
    { name: "otherPhone" as const, label: "Telefone Outro", type: "tel" as const },
    { name: "website" as const, label: "Website", type: "url" as const },
    { name: "postalCode" as const, label: "CEP", type: "text" as const },
    { name: "street" as const, label: "Logradouro", type: "text" as const },
    { name: "number" as const, label: "Número", type: "text" as const },
    { name: "complement" as const, label: "Complemento", type: "text" as const },
    { name: "neighborhood" as const, label: "Bairro", type: "text" as const },
    { name: "city" as const, label: "Cidade *", type: "text" as const, required: true },
    { name: "state" as const, label: "Estado *", type: "text" as const, required: true },
  ];

  const addNewProponent = async (data: PessoaJuridicaFormData) => {
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "proponents"), {
        ...data,
        userId: dbUser?.id,
        proponentType: "PJ",
        createdAt: new Date(),
      });

      await updateDoc(doc(db, "proponents", docRef.id), {
        proponentId: docRef.id,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });
      
      setToastMessage("Proponente pessoa jurídica adicionado com sucesso!");
      setToastType("success");
      setShowToast(true);
      reset();
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Error adding proponent:", error);
      setToastMessage("Erro ao adicionar proponente. Tente novamente.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: PessoaJuridicaFormData) => {
    addNewProponent(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Dados da Empresa</h3>
          <p className="text-sm text-gray-600">Campos marcados com * são obrigatórios</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pessoaJuridicaFields.slice(0, 5).map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  {...register(field.name)}
                  type={field.type}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={field.label.replace(' *', '')}
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-600">{errors[field.name]?.message}</p>
                )}
              </div>
            ))}
          </div>

          {/* Contact Information Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Informações de Contato</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pessoaJuridicaFields.slice(5, 8).map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    {...register(field.name)}
                    type={field.type}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={field.label.replace(' *', '')}
                  />
                  {errors[field.name] && (
                    <p className="text-sm text-red-600">{errors[field.name]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Address Information Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Endereço</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pessoaJuridicaFields.slice(8).map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    {...register(field.name)}
                    type={field.type}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={field.label.replace(' *', '')}
                  />
                  {errors[field.name] && (
                    <p className="text-sm text-red-600">{errors[field.name]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Salvando..." : "Salvar Proponente"}
            </button>
          </div>
        </form>
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
