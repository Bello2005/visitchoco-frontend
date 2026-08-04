import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { qualityState, subscribeQuality } from "../utils/qualityState";

// Aplica los diales de calidad que dependen de three, sin estado de React.
// No renderiza nada: sólo escucha cambios de nivel y muta el renderer.
//
// Los diales FRÍOS (counts de vegetación, segmentos del agua) NO se tocan
// desde acá: cambiarlos re-dispararía los scatters (hasta 132.300 tests de
// punto-en-polígono) y reconstruiría geometrías. Se aplican al recargar.
export default function QualityRuntime() {
  const setDpr = useThree((s) => s.setDpr);

  useEffect(() => {
    const apply = () => {
      const p = qualityState.profile;
      // El rango [min,max] se resuelve contra el dpr real del dispositivo.
      const want = Math.min(p.dpr[1], Math.max(p.dpr[0], window.devicePixelRatio || 1));
      setDpr(want);
    };
    apply();
    return subscribeQuality(apply);
  }, [setDpr]);

  return null;
}
