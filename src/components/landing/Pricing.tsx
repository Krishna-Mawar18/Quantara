"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function AnimatedPrice({ value, isYearly }: { value: string; isYearly: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- animation effect
    setAnimating(true);
    const timer = setTimeout(() => {
      setDisplayValue(value);
      setTimeout(() => setAnimating(false), 150);
    }, 150);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span className={`inline-block transition-all duration-300 ease-out ${animating ? "opacity-0 scale-95 translate-y-2" : "opacity-100 scale-100 translate-y-0"}`}>
      {displayValue}
    </span>
  );
}

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const monthlyPlans = {
    pro: { price: "₹599", dollar: "$6", save: "" },
    proPlus: { price: "₹1,399", dollar: "$15", save: "" },
  };

  const yearlyPlans = {
    pro: { price: "₹5,559", dollar: "$59", save: "Save ₹1,629" },
    proPlus: { price: "₹13,900", dollar: "$150", save: "Save ₹2,888" },
  };

  const plans = isYearly ? yearlyPlans : monthlyPlans;

  return (
    <section id="pricing" ref={sectionRef} className="relative py-32 bg-gradient-to-t from-[#ffc2d1]/30 via-[#f8d9c6] to-orange-200/40 min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-6">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight">Choose your right plan!</h2>
          <p className="mt-4 text-zinc-500 max-w-lg mx-auto">Select from best plans, ensuring a perfect match for your data needs.</p>
        </div>

        <div className={`flex justify-center mb-16 transition-all duration-700 ease-out delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex bg-zinc-100 rounded-full p-1.5 relative">
            <div
              className={`absolute top-1.5 h-[calc(100%-10px)] rounded-full bg-gradient-to-r from-violet-600 to-[#E694C2] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isYearly ? "left-[calc(50%+2px)]" : "left-1.5"
              }`}
              style={{ width: "calc(50% - 4px)" }}
            />
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-10 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                !isYearly ? "text-white" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                isYearly ? "text-white" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className={`group flex flex-col p-8 rounded-3xl border border-violet-400 bg-gradient-to-br from-violet-200 via-violet-100/60 to-violet-200/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-violet-200/50 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`} style={{ transitionDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full">
                <Zap className="w-3.5 h-3.5" />
                Pro
              </span>
              {isYearly && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {plans.pro.save}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-800 leading-relaxed mb-8">Ideal for professionals seeking advanced analytics and insights for growing needs.</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-zinc-900">
                <AnimatedPrice value={plans.pro.price} isYearly={isYearly} />
              </span>
              <span className="text-zinc-600">({plans.pro.dollar})</span>
              <span className="text-zinc-600 text-sm">/month</span>
            </div>
            <div className="h-px bg-zinc-100 mb-6" />
            <div className="space-y-4 flex-1">
              {["5 datasets", "Advanced analytics", "Unlimited charts (3 types)", "Basic insights", "Email support", "API access"].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-violet-700" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/auth/register">
            <button className="group/btn w-full py-3.5 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-white hover:text-violet-600 hover:shadow-lg hover:shadow-violet-500 transition-all duration-300 mt-8 flex items-center justify-center gap-2">
              Get started
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            </Link>
          </div>

          <div className={`group flex flex-col p-8 rounded-3xl border-2 border-[#fcb0c6] bg-gradient-to-br from-violet-100/40 to-[#fdc3dc] backdrop-blur-sm hover:shadow-2xl hover:shadow-violet-300/50 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden relative ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`} style={{ transitionDelay: "400ms" }}>
            <div className="absolute top-0 right-0">
              <div className="bg-[#E694C2] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E694C2] text-white text-sm font-semibold rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Pro Plus
              </span>
              {isYearly && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {plans.proPlus.save}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-800 leading-relaxed mb-8">Ideal if you want to build or scale fast, with the strategy calls included.</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-zinc-900">
                <AnimatedPrice value={plans.proPlus.price} isYearly={isYearly} />
              </span>
              <span className="text-zinc-600">({plans.proPlus.dollar})</span>
              <span className="text-zinc-600 text-sm">/month</span>
            </div>
            <div className="h-px bg-zinc-100 mb-6" />
            <div className="space-y-4 flex-1">
              {["20 datasets", "Advanced analytics", "Unlimited charts (all types)", "Advanced insights & predictions", "ML models (customizable)", "Priority support", "Strategy calls"].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-5 h-5 rounded-full bg-[#E694C2] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/auth/register">
              <button className="group/btn w-full py-3.5 rounded-xl text-sm font-semibold bg-[#E694C2] text-white hover:bg-white hover:text-[#E694C2] hover:shadow-lg hover:shadow-[#E694C2] transition-all duration-300 mt-8 flex items-center justify-center gap-2">
                Get started
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
