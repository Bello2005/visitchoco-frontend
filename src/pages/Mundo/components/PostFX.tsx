import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import { QUALITY_PROFILES } from "../utils/qualityState";
import { useQualityLevel } from "../utils/useQualityLevel";

// Cadena de post-procesado, siguiendo folio-2025.
//
// Bruno monta MENOS de lo que teníamos, a propósito: sólo un Bloom muy suave
// (threshold 1, strength 0.25) y un DOF barato. Ni god rays, ni noise, ni
// vignette. Antes había 4 efectos y un Bloom 3× más agresivo (threshold 0.9,
// intensity 0.7), que ensuciaba la imagen y costaba caro — los GodRays con
// samples=60 eran el efecto más caro del pipeline.
//
// Vive en su PROPIO componente para que suscribirse al nivel de calidad no
// re-renderice Mundo (y, con él, toda la vegetación).
//
// `key={level}` es necesario: multisampling y la lista de efectos no son
// props reactivas del composer. De paso resuelve una trampa real de
// @react-three/postprocessing@3.0.4 — el composer sólo llama a setSize cuando
// cambia el tamaño CSS, no cuando cambia el dpr, así que sin remontarlo la
// imagen quedaría escalada y borrosa (no rota: pasa desapercibida).
export default function PostFX() {
  const level = useQualityLevel();
  const p = QUALITY_PROFILES[level];

  return (
    <EffectComposer key={level} multisampling={p.multisampling}>
      {[
        // Los hijos van como ARRAY con spread condicional: el tipo es
        // Element | Element[], así que `{cond && <X/>}` (false) o un
        // comentario JSX (undefined) NO compilan aquí dentro.
        ...(p.bloom
          ? [
              <Bloom
                key="bloom"
                luminanceThreshold={1}
                intensity={0.25}
                mipmapBlur
              />,
            ]
          : []),
        // SMAA sólo donde no hay MSAA del composer: el canvas va con
        // antialias:false porque su buffer nunca llega a la imagen final.
        ...(p.smaa ? [<SMAA key="smaa" />] : []),
      ]}
    </EffectComposer>
  );
}
