import { useRef, useState, useEffect } from "react";

export const useAudio = (audioUrl: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Crear elemento de audio
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    // Manejar eventos de carga
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setError("Error al cargar el audio");
    };

    // Eventos de reproducción
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    // Agregar listeners
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    // Comenzar a cargar el audio
    audio.load();

    // Cleanup
    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const toggleAudio = () => {
    if (!audioRef.current || isLoading || error) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        setError("Error al reproducir el audio");
      });
    }
  };

  return {
    isPlaying,
    isLoading,
    error,
    toggleAudio,
  };
};
