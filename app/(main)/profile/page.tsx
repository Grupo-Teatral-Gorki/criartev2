"use client";
import { useAuth } from "@/app/context/AuthContext";
import { findCityLabel } from "@/app/utils/validators";
import Image from "next/image";
import React from "react";

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="flex items-center justify-center my-10 flex-col gap-4 ">
      <div className="bg-slate-300 flex flex-col items-center justify-center p-8 gap-4 rounded-2xl shadow-xl">
        <div className="w-40 h-40 rounded-full bg-primary dark:bg-navy flex items-center justify-center overflow-hidden shadow-lg">
          <Image
            src="https://robohash.org/placeholder.png"
            alt="profile"
            width={250}
            height={250}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-4 text-center text-navy text-2xl">
          <p>Usuário: {user?.usuario}</p>
          <p>Cidade: {findCityLabel(user?.idCidade ?? "")}</p>
          <p>Tipo de Usuário: {user?.tipoUsuario}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
