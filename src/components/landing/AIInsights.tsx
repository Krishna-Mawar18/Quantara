"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, TrendingUp, Brain, Wand2, MessageSquare, Zap, Shield } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const insights = [
  {
    icon: Sparkles,
    title: "AI-generated insights",
    desc: "Natural language summaries of key trends and anomalies in your data.",
    example: "Revenue increased 23% MoM. Top driver: new customer acquisition in Q3.",
    features: ["Automatic trend detection", "Anomaly alerts", "Plain English summaries"],
  },
  {
    icon: Brain,
    title: "Predictive models",
    desc: "Automated ML models that forecast trends and identify patterns.",
    example: "Predicted churn rate: 12.4% next quarter. Confidence: 94%.",
    features: ["No ML expertise needed", "Auto model selection", "Confidence scoring"],
  },
  {
    icon: TrendingUp,
    title: "Smart recommendations",
    desc: "Actionable suggestions backed by data and statistical analysis.",
    example: "Increase marketing spend by 15% to maximize Q4 revenue potential.",
    features: ["Priority-ranked actions", "Scenario simulation", "ROI estimates"],
  },
  {
    icon: MessageSquare,
    title: "Natural language queries",
    desc: "Ask questions about your data in plain English and get instant answers.",
    example: "What were our top 3 revenue sources last quarter?",
    features: ["Conversational interface", "Instant answers", "No SQL required"],
  },
  {
    icon: Zap,
    title: "Automated reporting",
    desc: "Schedule and auto-generate reports with key metrics and insights.",
    example: "Weekly report sent every Monday at 9 AM with KPIs.",
    features: ["Scheduled delivery", "Custom templates", "Email & Slack integration"],
  },
  {
    icon: Shield,
    title: "Data quality checks",
    desc: "AI-powered validation ensures your data is clean, consistent, and reliable.",
    example: "Detected 23 anomalies in 12,450 rows. 3 schema violations fixed.",
    features: ["Auto validation", "Schema detection", "Anomaly correction"],
  },
];

function FeatureCard({ item }: { item: typeof insights[0] }) {
  return (
    <div className="flex-shrink-0 w-80 p-6 rounded-2xl border border-zinc-200/50 bg-white/90 backdrop-blur-md shadow-lg shadow-zinc-200/50 hover:shadow-xl hover:border-violet-200 hover:scale-[1.02] transition-all duration-300">
      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-violet-500/30">
        <item.icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">{item.title}</h3>
      <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
      <div className="mt-4 p-3.5 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100/50">
        <p className="text-xs text-zinc-700 font-medium">{item.example}</p>
      </div>
      <div className="mt-4 space-y-2.5">
        {item.features.map((f, j) => (
          <div key={j} className="flex items-center gap-2.5 text-sm text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

function CircularCardGallery() {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const cardWidth = 336;
  const gap = 24;
  const totalWidth = cardWidth + gap;
  const totalItemsWidth = insights.length * totalWidth;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setOffsetX((prev) => prev + e.deltaY * 0.5);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        velocityRef.current *= 0.95;
        setOffsetX((prev) => prev + velocityRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX - offsetX);
    lastXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX - startX;
    velocityRef.current = currentX - offsetX;
    setOffsetX(currentX);
    lastXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const normalizedOffset = ((offsetX % totalItemsWidth) + totalItemsWidth) % totalItemsWidth;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ height: "420px" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-0 flex items-center">
        <div
          className="flex gap-6 transition-transform duration-75"
          style={{
            transform: `translateX(${-normalizedOffset}px)`,
          }}
        >
          {[...insights, ...insights, ...insights].map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{
                transform: `translateY(${Math.sin((normalizedOffset + i * totalWidth) * 0.008) * 30}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <FeatureCard item={item} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-violet-50/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-fuchsia-50/80 to-transparent pointer-events-none" />
    </div>
  );
}

export function AIInsights() {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section className="relative py-32 min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-amber-50" />
      <div className="relative z-10 w-full">
        <div
          ref={headerRef}
          className={`text-center mb-16 px-20 transition-all duration-1000 ease-out ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-2">AI Features</p>
          <h2 className="text-3xl md:text-7xl font-semibold text-zinc-900 tracking-tight">
            Intelligence built in
          </h2>
          <p className="mt-4 text-zinc-500 max-w-lg mx-auto">
            AI agents that work alongside your team to surface insights, predict outcomes, and recommend
            actions.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex gap-6 w-full"
            style={{
              animation: "marquee 20s linear infinite",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {insights.map((item, i) => (
              <Card key={`a-${i}`} item={item} index={i} />
            ))}
            {insights.map((item, i) => (
              <Card key={`b-${i}`} item={item} index={i} />
            ))}
            {insights.map((item, i) => (
              <Card key={`c-${i}`} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
      `}</style>
    </section>
  );
}

function Card({ item, index }: { item: typeof insights[0]; index: number }) {
  return (
    <div
      className="flex-shrink-0 w-72 p-6 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:border-violet-200 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center mb-4">
        <item.icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900">{item.title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
      <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
        <p className="text-xs text-zinc-600 font-mono">{item.example}</p>
      </div>
      <div className="mt-4 space-y-2">
        {item.features.map((f, j) => (
          <div key={j} className="flex items-center gap-2 text-sm text-zinc-600">
            <Wand2 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
