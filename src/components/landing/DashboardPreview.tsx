export function DashboardPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 shadow-2xl shadow-zinc-200/50 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-200 bg-white">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1" />
              <div className="text-xs text-zinc-400 font-medium">Quantara Dashboard</div>
            </div>
            <div className="p-8 grid grid-cols-12 gap-5">
              <div className="col-span-3 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-white rounded-lg border border-zinc-200" />
                ))}
              </div>
              <div className="col-span-6 space-y-4">
                <div className="h-72 bg-white rounded-lg border border-zinc-200 p-6">
                  <div className="flex items-end gap-2 h-56">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-violet-100 rounded-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-white rounded-lg border border-zinc-200" />
                  ))}
                </div>
              </div>
              <div className="col-span-3 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-28 bg-white rounded-lg border border-zinc-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
