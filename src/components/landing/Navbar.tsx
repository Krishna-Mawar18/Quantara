"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl">
      <div className="bg-white/70 backdrop-blur-2xl border border-zinc-200/60 rounded-2xl px-5 py-2.5 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/Tech Logo - New Group.png" alt="Quantara" className="h-10 w-auto" />
          <span className="text-lg font-semibold text-zinc-900">Quantara</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-[13px] text-zinc-500">
          <Link href="#features" className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 hover:text-violet-600 transition-colors">Product</Link>
          <Link href="#how-it-works" className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 hover:text-violet-600 transition-colors">How it works</Link>
          <Link href="#pricing" className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 hover:text-violet-600 transition-colors">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-[13px] text-zinc-500 hover:text-violet-600 transition-colors">
            Login
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="rounded-lg text-[13px] h-8 px-4 bg-zinc-900 hover:bg-gradient-to-br from-[#FF6B6B] to-orange-300">Sign Up</Button>
          </Link>
        </div>

        <button
          className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-900"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-2 bg-white rounded-xl border border-zinc-200 shadow-lg p-3 flex flex-col gap-1">
          <Link href="#features" onClick={() => setMobileOpen(false)} className="text-sm text-zinc-600 px-3 py-2 rounded-lg hover:bg-zinc-50">Product</Link>
          <Link href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm text-zinc-600 px-3 py-2 rounded-lg hover:bg-zinc-50">How it works</Link>
          <Link href="#pricing" onClick={() => setMobileOpen(false)} className="text-sm text-zinc-600 px-3 py-2 rounded-lg hover:bg-zinc-50">Pricing</Link>
          <div className="h-px bg-zinc-100 my-1" />
          <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-sm text-zinc-600 px-3 py-2">Login</Link>
          <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
            <Button className="w-full rounded-lg text-sm">Sign Up</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
