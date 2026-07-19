import * as THREE from "three";
import { revealUniforms } from "./revealUniforms";

// Materialización estilo folio-2025 (Bruno Simon, MIT — ver
// public/models/folio/LICENSE.md): más allá del radio de revelado el fragmento
// se DESCARTA (el mundo aparece desde el centro hacia afuera), con un frente de
// onda brillante en el borde. Distancia HORIZONTAL (xz) como en el original.
// Compatible con vertexColors, flatShading, transparencia, desplazamiento de
// vértices por CPU (agua) e INSTANCING (árboles).
//
// opts.groundDetail: además inyecta moteado de ruido en espacio de mundo sobre
// el albedo (2 octavas + grano fino). Sin esto los vertex colors interpolados
// se ven planos como un PNG — con esto el suelo tiene "textura" sin texturas.
export function applyReveal(
  material: THREE.Material,
  opts?: { groundDetail?: boolean }
): void {
  const groundDetail = opts?.groundDetail === true;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRevealCenter = revealUniforms.uRevealCenter;
    shader.uniforms.uRevealRadius = revealUniforms.uRevealRadius;
    shader.uniforms.uRevealThickness = revealUniforms.uRevealThickness;
    shader.uniforms.uRevealColor = revealUniforms.uRevealColor;
    shader.uniforms.uRevealIntensity = revealUniforms.uRevealIntensity;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vRevealWorldPos;"
      )
      // Posición mundial desde `transformed` (incluye el oleaje del agua) y, si
      // el mesh es instanciado (árboles), la matriz de instancia.
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
	{
		vec4 revealWP = vec4(transformed, 1.0);
		#ifdef USE_INSTANCING
			revealWP = instanceMatrix * revealWP;
		#endif
		revealWP = modelMatrix * revealWP;
		vRevealWorldPos = revealWP.xyz;
	}`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vRevealWorldPos;
uniform vec3 uRevealCenter;
uniform float uRevealRadius;
uniform float uRevealThickness;
uniform vec3 uRevealColor;
uniform float uRevealIntensity;`
      )
      // Al FINAL del pipeline (tras tonemapping/encoding): descartar fuera del
      // radio y pintar el frente de onda. El *intensity (>1) empuja el anillo
      // por encima del threshold 0.9 del Bloom (buffers HalfFloat) → brilla.
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
	{
		float dReveal = distance(vRevealWorldPos.xz, uRevealCenter.xz);
		if (dReveal > uRevealRadius) discard;
		float ring = smoothstep(uRevealRadius - uRevealThickness, uRevealRadius, dReveal);
		gl_FragColor.rgb = mix(gl_FragColor.rgb, uRevealColor * uRevealIntensity, ring);
	}`
      );

    if (groundDetail) {
      // Moteado de suelo: value-noise 2 octavas + grano fino, modulando el
      // albedo ANTES de la iluminación (color_fragment). Espacio de mundo →
      // no nada con la cámara y respeta el flat shading.
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "varying vec3 vRevealWorldPos;",
          `varying vec3 vRevealWorldPos;
float mundoHash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float mundoNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(mundoHash(i), mundoHash(i + vec2(1.0, 0.0)), u.x),
		mix(mundoHash(i + vec2(0.0, 1.0)), mundoHash(i + vec2(1.0, 1.0)), u.x),
		u.y
	);
}`
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
	{
		vec2 wp = vRevealWorldPos.xz;
		float mottle = mundoNoise(wp * 2.2) * 0.55 + mundoNoise(wp * 7.0) * 0.45;
		float grain = mundoHash(floor(wp * 40.0)) - 0.5;
		diffuseColor.rgb *= 0.945 + 0.09 * mottle + 0.045 * grain;
	}`
        );
    }
  };

  // Sin esto Three reutiliza programas cacheados de materiales con los mismos
  // defines pero SIN la inyección (p.ej. casco de la panga vs agua).
  material.customProgramCacheKey = () =>
    groundDetail ? "reveal-detail" : "reveal";
}
