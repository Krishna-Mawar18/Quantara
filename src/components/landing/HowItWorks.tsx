"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileSpreadsheet, BarChart3, TrendingUp, Brain, Sparkles } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload", desc: "Import your CSV or Excel files with drag and drop. We auto-detect formats, validate your data, and prepare it for analysis instantly.", features: ["Drag & drop upload", "Auto format detection", "Instant validation"] },
  { icon: FileSpreadsheet, title: "Process", desc: "Clean and structure your data automatically. Handle missing values, normalize formats, and fix inconsistencies without manual effort.", features: ["Missing value handling", "Format normalization", "Auto error correction"] },
  { icon: BarChart3, title: "Analyze", desc: "Generate deep insights with statistical analysis. Discover trends, correlations, and patterns in your data that would take hours to find manually.", features: ["Trend detection", "Correlation analysis", "Pattern recognition"] },
  { icon: TrendingUp, title: "Visualize", desc: "Create beautiful charts and dashboards. Choose from bar, line, pie, and scatter plots with full customization for your team's needs.", features: ["Multiple chart types", "Custom themes", "Export ready"] },
  { icon: Brain, title: "Predict", desc: "Build ML models without code. Forecast trends, predict outcomes, and get confidence scores automatically with our intelligent algorithms.", features: ["No-code ML", "Auto forecasting", "Confidence scoring"] },
  { icon: Sparkles, title: "Recommend", desc: "Get AI-powered suggestions for next steps. Actionable insights backed by data and statistical analysis to drive better decisions.", features: ["Smart suggestions", "Data-backed insights", "Action planning"] },
];

function Carousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const startTrigger = windowHeight * 0.25;
      const endTrigger = windowHeight * 0.75;

      const startTop = startTrigger;
      const endTop = endTrigger - rect.height;
      const total = startTop - endTop;

      if (total <= 0) {
        setScrollProgress(0);
        setActiveIndex(0);
        return;
      }

      const progress = (startTop - rect.top) / total;
      const clampedProgress = Math.max(0, Math.min(1, progress));
      setScrollProgress(clampedProgress);

      const index = Math.floor(clampedProgress * steps.length);
      setActiveIndex(Math.min(Math.max(index, 0), steps.length - 1));
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const activeStep = steps[activeIndex];

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-40 bg-gradient-to-br from-[#e8e8e4] via-[#ffe5d9] to-[#fae1dd] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-20">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight">From data to insight</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="relative w-72 h-72 md:w-120 md:h-120 bg-gradient-to-br from-[#fec89a] to-[#ffb5a7] rounded-2xl border border-white/40 p-8">
              {steps.map((step, i) => {
                const angle = (i / steps.length) * 360 + scrollProgress * 360;
                const radius = 110;
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;
                const isActive = i === activeIndex;
                return (
                  <div
                    key={step.title}
                    className="absolute left-1/2 top-1/2 transition-all duration-200 ease-out"
                    style={{
                      transform: `translate(calc(-50% + ${x.toFixed(4)}px), calc(-50% + ${y.toFixed(4)}px))`,
                      opacity: isActive ? 1 : 0.3,
                      zIndex: isActive ? 10 : 1,
                    }}
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? "bg-zinc-900 text-white scale-110 shadow-xl" : "bg-zinc-800/50 text-white/80"
                    }`}>
                      <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>
                );
              })}

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border border-[#fec89a] flex items-center justify-center shadow-lg">
                <span className="text-xl md:text-2xl font-semibold text-zinc-900">{activeIndex + 1}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-zinc-600 uppercase tracking-wider">Step {activeIndex + 1}</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            <h3 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-6">
              {activeStep.title}
            </h3>
            <p className="text-lg text-zinc-500 leading-relaxed mb-8">
              {activeStep.desc}
            </p>
            <div className="space-y-3">
              {activeStep.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <activeStep.icon className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm text-zinc-600">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needed to prevent hydration mismatch
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section id="how-it-works" className="relative py-40 bg-gradient-to-br from-[#e8e8e4] via-[#ffe5d9] to-[#fae1dd] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-20">
            <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight">From data to insight</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-12 md:gap-16">
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <div className="w-72 h-72 md:w-120 md:h-120 bg-gradient-to-br from-[#fec89a] to-[#ffb5a7] rounded-2xl border border-white/40" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="h-4 w-20 bg-white/50 rounded mb-4" />
              <div className="h-8 w-48 bg-white/50 rounded mb-6" />
              <div className="h-4 w-full bg-white/30 rounded mb-2" />
              <div className="h-4 w-3/4 bg-white/30 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <Carousel />;
}
