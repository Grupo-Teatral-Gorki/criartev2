import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { SelectInput } from "@/app/components/SelectInput";
import Button from "@/app/components/Button";

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

  const db = getFirestore();

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

  const handleSave = async () => {
    if (!selectedCity || selectedStage === savedStage) return;
    try {
      const cityRef = doc(db, "cities", selectedCity);
      await updateDoc(cityRef, { processStage: selectedStage });
      setSavedStage(selectedStage);
    } catch (error) {
      console.error("Error saving process stage:", error);
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
            label={"Salvar"}
            onClick={handleSave}
            disabled={selectedStage === savedStage}
          />
        </div>
      )}
    </div>
  );
};

export default ConfigProcess;
