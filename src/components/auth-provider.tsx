"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isHydrated) {
      const timeout = setTimeout(() => setHydrated(), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isHydrated, setHydrated]);

  return <>{children}</>;
}
