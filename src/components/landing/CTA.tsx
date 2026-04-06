"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function CTA() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative py-32 bg-zinc-50 min-h-[500px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/back video pink.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 via-zinc-50/90 to-zinc-50/50" />
      </div>
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10 w-full">
        <div className={`relative rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-[#E290BE] via-rose-100 to-[#F499A1] p-12 md:p-16 shadow-2xl backdrop-blur-sm transition-all duration-700 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <h2 className="text-3xl md:text-5xl font-semibold text-zinc-900 tracking-tight">
            Build better products faster
          </h2>
          <p className="mt-4 text-zinc-600 max-w-md mx-auto">
            Start analyzing your data today. No credit card required.
          </p>
          <div className={`mt-8 flex items-center justify-center gap-4 transition-all duration-700 delay-200 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/auth/register">
              <Button size="lg" className="rounded-xl px-8 py-3 text-sm font-semibold bg-zinc-900 hover:bg-[#FFAAAA] text-white hover:text-black">
                Start free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="outline" size="lg" className="rounded-xl px-8 py-3 text-sm font-semibold border-zinc-400 bg-white text-zinc-700 hover:bg-[#FFAAAA] hover:border-[#FFAAAA] hover:text-[#FFFFFF]">
                Contact sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
