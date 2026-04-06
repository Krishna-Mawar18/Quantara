const customers = [
  { name: "Acme Corp", logo: "A" },
  { name: "TechFlow", logo: "T" },
  { name: "DataSync", logo: "D" },
  { name: "CloudBase", logo: "C" },
  { name: "MetricAI", logo: "M" },
  { name: "InsightLab", logo: "I" },
];

export function Customers() {
  return (
    <section id="customers" className="py-20 bg-white border-y border-zinc-200">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-sm text-zinc-500 mb-8">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-12">
          {customers.map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-zinc-400">
              <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-sm font-bold text-zinc-600">
                {c.logo}
              </div>
              <span className="text-sm font-medium text-zinc-600">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}