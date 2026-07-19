import { useEffect, useRef, useState } from "react";

// Ambiente sonoro del territorio: música (Baguira, CC0 — folio-2025) +
// viento de selva en loop (MIT). Arranca con el "despertar" (el clic del
// intro ya es el gesto de usuario que el autoplay exige). Botón de mute
// discreto estilo panel de vidrio.
export default function MundoAudio() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const windRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const music = new Audio("/sounds/mundo/musica.mp3");
    music.loop = true;
    music.volume = 0.3;
    const wind = new Audio("/sounds/mundo/viento-selva.mp3");
    wind.loop = true;
    wind.volume = 0.35;
    musicRef.current = music;
    windRef.current = wind;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setStarted(true);
      music.play().catch(() => {});
      wind.play().catch(() => {});
    };

    // El despertar del territorio es el momento musical; con
    // prefers-reduced-motion no hay evento → primer gesto directo.
    window.addEventListener("mundo:reveal", start);
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    return () => {
      window.removeEventListener("mundo:reveal", start);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      music.pause();
      wind.pause();
      musicRef.current = null;
      windRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (musicRef.current) musicRef.current.muted = muted;
    if (windRef.current) windRef.current.muted = muted;
  }, [muted]);

  if (!started) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setMuted((v) => !v);
      }}
      aria-label={muted ? "Activar sonido" : "Silenciar"}
      className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center
                 rounded-full border border-white/15 text-white/80 shadow-lg
                 backdrop-blur-md transition-colors hover:text-white"
      style={{ background: "rgba(2, 13, 26, 0.55)" }}
    >
      {muted ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
