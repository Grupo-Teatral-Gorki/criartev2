"use client";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const AdminHome = () => {
  const { dbUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!dbUser) return;

    if (dbUser.userRole !== "admin") {
      router.push("/home");
    }
  }, [dbUser]);

  return (
    <div className="flex flex-col w-full gap-6">
      <Link href={"/admin/city-config"}>City Config</Link>
      <Link href={"/admin/review-config"}>Review Config</Link>
    </div>
  );
};

export default AdminHome;
