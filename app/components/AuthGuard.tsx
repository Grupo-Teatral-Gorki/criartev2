"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

const PUBLIC_PATHS = ["/politica-dados"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <Spinner />;
  }

  return <>{children}</>;
}
