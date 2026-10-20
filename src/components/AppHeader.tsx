export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600 px-5 pt-5 pb-5 shadow-lg">
      <div className="flex items-center gap-3.5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-white shadow-lg ring-4 ring-white/15">
          <img
            src="/image.png"
            alt="Logo Laço Animal"
            className="h-full w-full object-contain p-0.5"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-white">{title}</h1>
          {subtitle && <p className="text-sm leading-tight text-white/85">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
