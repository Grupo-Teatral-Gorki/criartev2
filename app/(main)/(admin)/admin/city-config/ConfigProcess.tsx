import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { SelectInput } from "@/app/components/SelectInput";
import Button from "@/app/components/Button";
import EmailService from "@/app/services/emailService";

type City = {
  id: string;
  name: string;
  uf: string;
  processStage?: string;
};

const stages = [
  { label: "Inscrições Abertas", value: "open" },
  { label: "Inscrições Fechadas", value: "closed" },
  { label: "Habilitação", value: "habilitacao" },
  { label: "Recurso", value: "recurso" },
];

const ConfigProcess = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [savedStage, setSavedStage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: number; failed: number } | null>(null);

  const db = getFirestore();
  const emailService = EmailService.getInstance();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesCol = collection(db, "cities");
        const snapshot = await getDocs(citiesCol);
        const cityList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as City[];
        setCities(cityList);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, [db]);

  useEffect(() => {
    const city = cities.find((c) => c.id === selectedCity);
    if (city?.processStage) {
      setSelectedStage(city.processStage);
      setSavedStage(city.processStage);
    } else {
      setSelectedStage("");
      setSavedStage("");
    }
  }, [selectedCity, cities]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const handleStageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStage(e.target.value);
  };

  const fetchUsersByCity = async (cityId: string): Promise<string[]> => {
    try {
      const usersCol = collection(db, "users");
      const q = query(usersCol, where("cityId", "==", cityId));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => doc.data().email)
        .filter((email): email is string => !!email);
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const handleSave = async () => {
    if (!selectedCity || selectedStage === savedStage) return;
    
    setIsSending(true);
    setEmailStatus(null);
    
    try {
      const cityRef = doc(db, "cities", selectedCity);
      await updateDoc(cityRef, { processStage: selectedStage });
      setSavedStage(selectedStage);

      // Get city name for email
      const city = cities.find((c) => c.id === selectedCity);
      const cityName = city ? `${city.name} - ${city.uf}` : selectedCity;

      // Fetch all users from this city and send emails
      const userEmails = await fetchUsersByCity(selectedCity);
      
      if (userEmails.length > 0) {
        const result = await emailService.sendStageChangeEmailBatch(
          userEmails,
          cityName,
          selectedStage
        );
        setEmailStatus(result);
      } else {
        setEmailStatus({ success: 0, failed: 0 });
      }
    } catch (error) {
      console.error("Error saving process stage:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="text-navy">
      <h2 className="text-2xl font-bold mb-4 text-navy">
        Altere a etapa do município
      </h2>
      <SelectInput
        options={cities.map((city) => ({
          value: city.id,
          label: `${city.name} - ${city.uf}`,
        }))}
        value={selectedCity}
        onChange={handleSelectChange}
        label="Selecione o município"
      />

      {selectedCity && (
        <div className="mt-4 text-navy">
          <div className="mb-2 font-medium">Selecione a etapa:</div>
          <div className="flex flex-col gap-2 mb-4">
            {stages.map((stage) => (
              <label key={stage.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="processStage"
                  value={stage.value}
                  checked={selectedStage === stage.value}
                  onChange={handleStageChange}
                />
                {stage.label}
              </label>
            ))}
          </div>
          <Button
            label={isSending ? "Salvando e enviando emails..." : "Salvar"}
            onClick={handleSave}
            disabled={selectedStage === savedStage || isSending}
          />
          
          {emailStatus && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="font-medium text-navy dark:text-white">
                Emails enviados:
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Sucesso: {emailStatus.success}
              </p>
              {emailStatus.failed > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  ✗ Falha: {emailStatus.failed}
                </p>
              )}
              {emailStatus.success === 0 && emailStatus.failed === 0 && (
                <p className="text-sm text-slate-500">
                  Nenhum usuário cadastrado nesta cidade.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigProcess;
