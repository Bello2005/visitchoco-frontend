import { memo, useEffect, useRef } from "react";
import { WATER_LEVEL } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";
import { bakeTerrainDepthTexture } from "../utils/terrainDepthTexture";
import { qualityState } from "../utils/qualityState";

// Superficie única mar+río a Y=WATER_LEVEL, con el agua estilizada de
// folio-2025 (ver utils/waterUniforms.ts para la receta completa).
//
// ANTES: el oleaje se calculaba en CPU recorriendo 2401 vértices con 4802
// Math.sin y subiendo 28 KB al GPU CADA frame… para producir olas de 0.07 u
// sobre un plano de 200 u. Inclinación máxima de la superficie: 1.26°, o sea
// iluminación matemáticamente constante. Por eso parecía un PNG: no era que
// las olas fueran pequeñas, era que estábamos simulando lo que no había que
// simular.
//
// AHORA: el color sale de una LUT indexada por la profundidad del terreno, la
// espuma es un umbral sobre esa misma profundidad, y las "olas" son
// isocontornos del campo de profundidad que ruedan hacia la orilla. Todo en el
// fragment, cero coste de CPU. El desplazamiento vertical es analítico en el
// vertex y solo existe para que la panga tenga con qué cabecear.
function Water() {
  // Los segmentos ya NO gobiernan el look (el color viene del campo de
  // profundidad, no de la teselación); solo dan resolución al desplazamiento.
  const segments = useRef(
    Math.max(8, qualityState.profile.waterSegments)
  ).current;

  // La textura de profundidad se hornea una vez, cuando el terreno publica su
  // heightfield. Hasta entonces el shader lee null → three la sustituye por una
  // textura blanca (profundidad 1 = todo mar abierto), que es un degradado
  // aceptable durante los primeros frames del intro.
  useEffect(() => {
    void bakeTerrainDepthTexture();
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, WATER_LEVEL, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 200, segments, segments]} />
      <meshStandardMaterial
        transparent
        // El alpha lo decide el shader por profundidad (bajos translúcidos,
        // hondo casi opaco); esto es solo el punto de partida.
        opacity={1}
        color="#ffffff"
        roughness={1}
        metalness={0}
        depthWrite={false}
        ref={(m) => {
          if (m) applyReveal(m, { water: true });
        }}
      />
    </mesh>
  );
}

// memo: sin props — aislado del churn de estado de Mundo.
export default memo(Water);
