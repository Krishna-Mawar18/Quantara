"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Sidebar />
      <div className="ml-[240px]">
        <Header />
        <main className="px-8 py-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
