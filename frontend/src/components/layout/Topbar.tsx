interface TopbarProps {
  title: string;
  subtitle: string;
}

export const Topbar = ({ title, subtitle }: TopbarProps) => {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI Resume Analyzer</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </header>
  );
};

