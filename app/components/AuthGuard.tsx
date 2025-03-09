"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import { getCookie } from "cookies-next";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      router.push("/");
    }
  }, []);

  return <>{children}</>;
}
