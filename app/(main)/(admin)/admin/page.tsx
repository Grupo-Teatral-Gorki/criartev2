"use client";

import Button from "@/app/components/Button";
import { CardLink } from "@/app/components/CardLink";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import React from "react";

const AdminHome = () => {
  const { dbUser } = useAuth();
  const router = useRouter();

  if (!dbUser) return null;

  const isAdmin =
    Array.isArray(dbUser.userRole) && dbUser.userRole.includes("admin");

  if (!isAdmin) {
    router.push("/home");
    return null;
  }

  return (
    <div className="w-full overflow-y-auto flex flex-col sm:px-36">
      <div className="w-full flex gap-12 bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4 mb-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/home")}
          size="medium"
        />
        <h2 className="text-2xl font-bold">Configurações</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6">
        <CardLink
          title={"Configurar Municipio"}
          description={""}
          href={"/admin/city-config"}
          icon={"city"}
        />
        <CardLink
          title={"Atribuir Pareceristas"}
          description={""}
          href={"/admin/review-config"}
          icon={"reviewers"}
        />
      </div>
    </div>
  );
};

export default AdminHome;
