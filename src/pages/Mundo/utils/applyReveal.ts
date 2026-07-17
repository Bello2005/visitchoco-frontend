import * as THREE from "three";
import { revealUniforms } from "./revealUniforms";

// Inyecta el efecto de revelado radial en un material de Three sin
// romper vertexColors, flatShading, transparencia ni desplazamiento de
// vértices por CPU (la posición mundial se calcula desde `transformed`).
export function applyReveal(material: THREE.Material): void {
  material.onBeforeCompile = (shader) => {
    // Referencias al singleton: la animación externa muta estos values
    shader.uniforms.uRevealCenter = revealUniforms.uRevealCenter;
    shader.uniforms.uRevealRadius = revealUniforms.uRevealRadius;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vRevealWorldPos;"
      )
      // No dependemos de worldPosition (solo existe con ciertos defines):
      // lo calculamos siempre desde `transformed`, que ya incluye el
      // desplazamiento de vértices del agua.
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
	vRevealWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vRevealWorldPos;
uniform vec3 uRevealCenter;
uniform float uRevealRadius;`
      )
      // Al FINAL del pipeline (tras tonemapping/encoding): oscurecer fuera
      // del radio y pintar el frente de onda ámbar. El 1.5 empuja el anillo
      // por encima del threshold 0.9 del Bloom (buffers HalfFloat).
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
	{
		float dReveal = distance(vRevealWorldPos, uRevealCenter);
		float revealLit = 1.0 - smoothstep(uRevealRadius - 3.0, uRevealRadius, dReveal);
		float revealDark = mix(0.35, 1.0, revealLit);
		float revealRing = smoothstep(1.5, 0.0, abs(dReveal - uRevealRadius)) * step(0.01, uRevealRadius);
		vec3 revealRingColor = vec3(1.0, 0.702, 0.278) * revealRing * 1.5;
		gl_FragColor.rgb = gl_FragColor.rgb * revealDark + revealRingColor;
	}`
      );
  };

  // Sin esto Three reutiliza programas cacheados de materiales con los
  // mismos defines pero SIN la inyección (p.ej. el casco de la panga
  // comparte defines con el agua) — o al revés.
  material.customProgramCacheKey = () => "reveal";
}
