"use client";

import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
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
    <div className="flex flex-col w-full gap-6">
      <Link href={"/admin/city-config"}>City Config</Link>
      <Link href={"/admin/review-config"}>Review Config</Link>
    </div>
  );
};

export default AdminHome;
