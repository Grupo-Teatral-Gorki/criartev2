"use client";

import React from "react";
import MappingTab from "../components/MappingTab";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";

export default function MappingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 px-32 w-full">
      <div className="flex gap-4 py-4 w-full items-center justify-between">
        <div className="flex gap-4 justify-evenly items-center">
          <Button
            label="Voltar"
            size="medium"
            variant="inverted"
            onClick={() => router.back()}
          />
        </div>
      </div>
      <MappingTab />
    </div>
  );
}
