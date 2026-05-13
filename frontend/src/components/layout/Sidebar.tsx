const navItems = [
  { label: "Dashboard", hint: "ATS Overview" },
  { label: "Analysis", hint: "Skill Match" },
  { label: "Reports", hint: "PDF Exports" },
  { label: "Settings", hint: "Environment" }
];

export const Sidebar = () => {
  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-200 bg-white/90 p-6 lg:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">Resume AI</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Analyzer Console</h1>
      </div>

      <nav className="mt-10 space-y-3">
        {navItems.map((item, index) => (
          <div
            key={item.label}
            className={`rounded-xl border px-4 py-3 ${
              index === 0
                ? "border-sky-200 bg-sky-50"
                : "border-transparent bg-slate-50/70 hover:border-slate-200"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="text-xs text-slate-500">{item.hint}</p>
          </div>
        ))}
      </nav>
    </aside>
  );
};

