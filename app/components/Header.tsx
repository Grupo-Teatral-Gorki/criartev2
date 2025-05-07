"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, User, LogOut, ShieldCheck } from "lucide-react";
import Drawer from "./Drawer";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { findCityLabel } from "../utils/validators";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import { SelectInput } from "./SelectInput";
import Button from "./Button";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseconfig";

type CityOption = {
  value: string;
  label: string;
};

type CityDoc = {
  idCidade: string;
  name: string;
};

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [citiesOptions, setCitiesOptions] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const { dbUser, updateCityId } = useAuth();
  const router = useRouter();

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    updateCityId(cityId);
  };

  const fetchAllCities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cities"));

      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as CityDoc),
      }));

      const options = docs.map((item) => ({
        value: item.idCidade,
        label: item.name,
      }));
      setCitiesOptions(options);
      return docs;
    } catch (error) {
      console.error("Error fetching documents: ", error);
      return [];
    }
  };

  useEffect(() => {
    fetchAllCities();
  }, []);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-primary shadow-md relative">
        {/* Hamburger Menu */}
        <button onClick={() => setDrawerOpen(true)} className="p-2">
          <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Logo */}
        <div
          className="flex-grow flex justify-center cursor-pointer"
          onClick={() => router.push("/home")}
        >
          <Image
            src="https://styxx-public.s3.sa-east-1.amazonaws.com/logo-criarte.png"
            alt="Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/profile">
            <User className="w-6 h-6 cursor-pointer text-white" />
          </Link>
          <button
            onClick={() => {
              router.push("/");
            }}
          >
            <LogOut className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Drawer */}
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </header>
      <div className="w-full flex items-center justify-between bg-white px-6 py-2 font-semibold dark:bg-navy dark:text-white">
        <div className="flex flex-row items-center gap-4">
          <p>Versão: 2.0</p>
          <p className="ml-4">Cidade: {findCityLabel(dbUser?.cityId ?? "")}</p>
          <p className="ml-4">ID: {dbUser?.cityId}</p>
        </div>
        {dbUser?.userRole === "admin" && (
          <div
            className="flex flex-row items-center gap-4 cursor-pointer"
            onClick={() => setModalIsOpen(true)}
          >
            <p>Trocar Cidade</p>
            <div className="flex flex-row items-center gap-2 bg-red-600 p-1 rounded-md text-white">
              <ShieldCheck />
              <p>Supervisor</p>
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
        <div className="flex flex-col items-center justify-center p-14">
          <SelectInput
            label={"Selecione a cidade"}
            options={citiesOptions}
            value={selectedCity}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleCityChange(e.target.value)
            }
          />
          <div className="w-full flex justify-end mt-4">
            <Button
              label={"Selecionar"}
              size="medium"
              onClick={() => setModalIsOpen(false)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
