"use client";

import { Sparkles, Zap, BarChart3 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Sparkles,
    title: "AI-powered collaboration",
    desc: "Workflows shared between humans and AI. Get automated insights, predictions, and recommendations.",
    color: "bg-violet-100 text-violet-600",
    images: ["/ai.webp"],
  },
  {
    icon: BarChart3,
    title: "Rich visualizations",
    desc: "Turn raw data into compelling charts and dashboards. Multiple chart types with full customization.",
    color: "bg-violet-100 text-violet-600",
    images: ["/visual.webp"],
  },
  {
    icon: Zap,
    title: "High-speed performance",
    desc: "Minimal friction to help teams ship faster. Process millions of rows in seconds with optimized pipelines.",
    color: "bg-violet-100 text-violet-600",
    images: ["/high.webp"],
  },
];

export function Features() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section id="features" className="relative py-32 min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-200 via-fuchsia-100 to-orange-100" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#FDECF7,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#D8F0FD,transparent_50%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div ref={headerRef} className={`text-center transition-all duration-1000 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <p className="text-sm font-semibold text-violet-900 uppercase tracking-wider mb-2">Product</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">Built for modern data teams</h2>
        </div>

        <div className="">
          {features.map((f, i) => (
            <FeatureItem key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const isLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`flex flex-col md:flex-row items-center gap-10 transition-all duration-700 ease-out ${
        isLeft ? "" : "md:flex-row-reverse"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="w-full md:w-10/12">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${feature.color}`}>
            <feature.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-900">{feature.title}</h3>
            <p className="mt-2 text-base text-zinc-500 leading-relaxed">{feature.desc}</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2">{feature.images[0] ? (
            <img src={feature.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <p className="text-sm text-violet-400">Image placeholder</p>
          )}
      </div>
    </div>
  );
}
