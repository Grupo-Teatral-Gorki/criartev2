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
  homeLink?: string;
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
  const [homeLink, setHomeLink] = useState<string>("");
  const [savedHomeLink, setSavedHomeLink] = useState<string>("");
  const [isSavingHomeLink, setIsSavingHomeLink] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: number; failed: number } | null>(null);

  const db = getFirestore();
  const emailService = EmailService.getInstance();

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

  useEffect(() => {
    fetchCities();

    const handleConfigRefresh = () => {
      fetchCities();
    };

    window.addEventListener("city-config-updated", handleConfigRefresh);

    return () => {
      window.removeEventListener("city-config-updated", handleConfigRefresh);
    };
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
    const link = city?.homeLink || "";
    setHomeLink(link);
    setSavedHomeLink(link);
  }, [selectedCity, cities]);

  const handleSaveHomeLink = async () => {
    if (!selectedCity || homeLink === savedHomeLink) return;
    setIsSavingHomeLink(true);
    try {
      const cityRef = doc(db, "cities", selectedCity);
      await updateDoc(cityRef, { homeLink: homeLink.trim() });
      setSavedHomeLink(homeLink.trim());
      await fetchCities();
      window.dispatchEvent(new Event("city-config-updated"));
    } catch (error) {
      console.error("Error saving home link:", error);
    } finally {
      setIsSavingHomeLink(false);
    }
  };

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
      await fetchCities();

      window.dispatchEvent(new Event("city-config-updated"));

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
    <div className="text-slate-900 dark:text-slate-100">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
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
        <div className="mt-4 text-slate-900 dark:text-slate-100">
          <div className="mb-4">
            <label className="block mb-2 font-medium">Link da home (Ver Editais)</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={homeLink}
                onChange={(e) => setHomeLink(e.target.value)}
                placeholder="https://..."
                className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <Button
                label={isSavingHomeLink ? "Salvando..." : "Salvar link"}
                onClick={handleSaveHomeLink}
                disabled={homeLink === savedHomeLink || isSavingHomeLink}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              URL aberta ao clicar em &quot;Ver Editais&quot; na home.
            </p>
          </div>
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
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="font-medium text-slate-900 dark:text-slate-100">
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
