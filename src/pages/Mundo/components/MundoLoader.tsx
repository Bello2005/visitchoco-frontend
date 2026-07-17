interface MundoLoaderProps {
  fading: boolean;
}

// Loader de marca para /mundo. HTML puro — sin imports de three/rapier,
// para poder usarse como fallback del lazy() en App.tsx sin engordar el
// bundle inicial. La barra es indeterminada a propósito: no hay señal
// real de progreso que mostrar (chunk + wasm + geojson).
export default function MundoLoader({ fading }: MundoLoaderProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 transition-opacity duration-[600ms] ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "#020d1a" }}
    >
      <span className="font-serif text-3xl text-white md:text-4xl">
        VisitChocó
      </span>
      <div className="h-0.5 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full w-16 rounded-full animate-[mundo-loader_1.2s_ease-in-out_infinite]"
          style={{ background: "#ffb347" }}
        />
      </div>
      <p className="text-sm text-white/50">Cargando el territorio…</p>
      <style>{`@keyframes mundo-loader { 0% { transform: translateX(-4rem); } 100% { transform: translateX(12rem); } }`}</style>
    </div>
  );
}
