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

type ProjectType = {
  name: string;
  label: string;
  available?: boolean;
};

type City = {
  id: string;
  name: string;
  uf: string;
  processStage?: string;
  homeLink?: string;
  typesOfProjects?: ProjectType[];
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
  const [editalAvailability, setEditalAvailability] = useState<Record<string, boolean>>({});
  const [savedEditalAvailability, setSavedEditalAvailability] = useState<Record<string, boolean>>({});
  const [isSavingEditals, setIsSavingEditals] = useState(false);

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

    const availability: Record<string, boolean> = {};
    (city?.typesOfProjects || []).forEach((project) => {
      availability[project.name] = project.available !== false;
    });
    setEditalAvailability(availability);
    setSavedEditalAvailability(availability);
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

  const handleEditalAvailabilityChange = (projectName: string, open: boolean) => {
    setEditalAvailability((prev) => ({ ...prev, [projectName]: open }));
  };

  const editalAvailabilityChanged = () => {
    const keys = new Set([
      ...Object.keys(editalAvailability),
      ...Object.keys(savedEditalAvailability),
    ]);
    for (const key of keys) {
      if (editalAvailability[key] !== savedEditalAvailability[key]) {
        return true;
      }
    }
    return false;
  };

  const handleSaveEditalAvailability = async () => {
    if (!selectedCity || !editalAvailabilityChanged()) return;

    setIsSavingEditals(true);
    try {
      const city = cities.find((c) => c.id === selectedCity);
      const updatedTypes = (city?.typesOfProjects || []).map((project) => ({
        ...project,
        available: editalAvailability[project.name] !== false,
      }));

      const cityRef = doc(db, "cities", selectedCity);
      await updateDoc(cityRef, { typesOfProjects: updatedTypes });
      setSavedEditalAvailability({ ...editalAvailability });
      await fetchCities();
      window.dispatchEvent(new Event("city-config-updated"));
    } catch (error) {
      console.error("Error saving edital availability:", error);
    } finally {
      setIsSavingEditals(false);
    }
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

          {(cities.find((c) => c.id === selectedCity)?.typesOfProjects || []).length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-2">Inscrições por edital</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Feche inscrições de editais específicos sem alterar a etapa geral do município.
                O município precisa estar em &quot;Inscrições Abertas&quot; para que editais abertos aceitem novas inscrições.
              </p>
              <div className="flex flex-col gap-3 mb-4">
                {(cities.find((c) => c.id === selectedCity)?.typesOfProjects || []).map(
                  (project) => (
                    <div
                      key={project.name}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <span className="font-medium">{project.label}</span>
                        <span className="ml-2 text-xs text-slate-500">({project.name})</span>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`edital-${project.name}`}
                            checked={editalAvailability[project.name] !== false}
                            onChange={() => handleEditalAvailabilityChange(project.name, true)}
                          />
                          Abertas
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`edital-${project.name}`}
                            checked={editalAvailability[project.name] === false}
                            onChange={() => handleEditalAvailabilityChange(project.name, false)}
                          />
                          Fechadas
                        </label>
                      </div>
                    </div>
                  )
                )}
              </div>
              <Button
                label={isSavingEditals ? "Salvando..." : "Salvar inscrições por edital"}
                onClick={handleSaveEditalAvailability}
                disabled={!editalAvailabilityChanged() || isSavingEditals}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigProcess;
