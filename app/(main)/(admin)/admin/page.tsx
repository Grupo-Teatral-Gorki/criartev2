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
    <div className="w-full overflow-y-auto flex flex-col px-4 sm:px-8 lg:px-36">
      <div className="w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-12 rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mt-4 mb-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/home")}
          size="medium"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Configurações</h2>
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
        <CardLink
          title={"Modelos de Tipo de Projeto"}
          description={""}
          href={"/admin/project-type-templates"}
          icon={"templates"}
        />
        <CardLink
          title={"Gerenciar Usuários"}
          description={""}
          href={"/admin/users"}
          icon={"users"}
        />
        <CardLink
          title={"Gerenciar Pareceres"}
          description={""}
          href={"/admin/feedback"}
          icon={"feedback"}
        />
      </div>
    </div>
  );
};

export default AdminHome;
