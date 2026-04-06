"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function Hero() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <img src="/hero.webp" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-pink-200/60 via-fuchsia-200/70 to-violet-300" />
      </div>
      <div className="max-w-8xl mx-auto px-10 relative z-10 text-center">
        <h1 className={`text-[56px] sm:text-[72px] md:text-[124px] font-semibold text-zinc-900 leading-[1.05] tracking-tight transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          Build Intelligent Data
          <br />
          with <span className="text-gradient bg-gradient-to-r from-orange-300 to-pink-500 bg-clip-text text-transparent">Smart Analytics</span>
        </h1>
        
        <p className={`mt-6 text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto transition-all duration-1000 delay-200 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          A modern data intelligence platform designed for teams. Upload, analyze, and ship data-driven decisions faster.
        </p>
        
        <div className={`mt-8 flex items-center justify-center gap-3 transition-all duration-1000 delay-400 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <Link href="/auth/register">
            <Button size="lg" className="rounded-xl px-8 py-3 text-sm font-medium bg-zinc-900 hover:bg-gradient-to-br from-[#FF6B6B] to-orange-300 text-white ">
              Start for free
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg" className="rounded-xl px-8 py-3 text-sm font-medium border-violet-300 text-zinc-700 hover:bg-violet-50 hover:border-[#E775A3] hover:text-[#FF6B6B]">
              View demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
