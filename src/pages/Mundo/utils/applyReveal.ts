import * as THREE from "three";
import { revealUniforms } from "./revealUniforms";
import { shadingUniforms } from "./shadingUniforms";

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
// ¿Este material debe recibir el sombreado estilizado?
//
// DOS exclusiones, ambas necesarias:
//
// 1. Materiales SIN iluminación. `meshbasic_frag` también contiene
//    `#include <opaque_fragment>`, pero no declara `normal`,
//    `directionalLights` ni getShadow: inyectar ahí no degrada, ROMPE la
//    compilación (pantalla negra). isMeshStandardMaterial cubre también
//    Physical, que hereda de Standard y comparte el fragment.
//
// 2. Materiales EMISIVOS de verdad (faroles, letreros, luces de caserío, el
//    aro del portal…). El mix hacia `albedo * uShadowColor` apagaría su brillo
//    justo en la cara opuesta al sol, que es donde más se los quiere ver, y el
//    Bloom dejaría de engancharlos. El umbral 0.5 separa las LUCES del
//    autoiluminado sutil que llevan la carrocería del carro (0.15) y la
//    cabina (0.12), que sí deben estilizarse.
//
// Se detecta en vez de marcar los ~10 sitios a mano: así ningún material
// emisivo futuro se cuela por olvido. Siempre se puede forzar con opts.stylize.
const EMISSIVE_GLOW_THRESHOLD = 0.5;

function shouldStylize(material: THREE.Material): boolean {
  const m = material as THREE.MeshStandardMaterial;
  if (m.isMeshStandardMaterial !== true) return false;
  const glows =
    m.emissiveIntensity >= EMISSIVE_GLOW_THRESHOLD &&
    m.emissive !== undefined &&
    (m.emissive.r > 0 || m.emissive.g > 0 || m.emissive.b > 0);
  return !glows;
}

export function applyReveal(
  material: THREE.Material,
  opts?: {
    groundDetail?: boolean;
    sway?: boolean;
    /** amplitud del vaivén (fracción de la altura del vértice). def 0.06 */
    swayAmp?: number;
    glitter?: boolean;
    /** reflejo por ángulo de vista (agua). SOLO para materiales con
     *  iluminación (standard/physical): reusa `vViewPosition` y `normal`,
     *  que MeshBasicMaterial no declara. */
    fresnel?: boolean;
    /** color del realce en el borde rasante. def "#eaffff" */
    fresnelColor?: string;
    /** exponente de la curva: más alto = realce más ceñido al borde. def 2.5 */
    fresnelPower?: number;
    /** Sombreado estilizado (core shadow + sombra teñida + light bounce).
     *  Por defecto se activa solo en materiales Standard/Physical, que son los
     *  únicos cuyo fragment declara `normal`, `directionalLights` y getShadow.
     *  Pasar `false` en materiales emisivos: el mix hacia el color de sombra
     *  se comería la emisión en la cara opuesta al sol. */
    stylize?: boolean;
  }
): void {
  const groundDetail = opts?.groundDetail === true;
  const sway = opts?.sway === true;
  const swayAmp = opts?.swayAmp ?? 0.06;
  const glitter = opts?.glitter === true;
  const fresnel = opts?.fresnel === true;
  const fresnelColor = opts?.fresnelColor ?? "#eaffff";
  const fresnelPower = opts?.fresnelPower ?? 2.5;
  const fresnelColorValue = new THREE.Color(fresnelColor);
  const stylize = opts?.stylize ?? shouldStylize(material);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRevealCenter = revealUniforms.uRevealCenter;
    shader.uniforms.uRevealRadius = revealUniforms.uRevealRadius;
    shader.uniforms.uRevealThickness = revealUniforms.uRevealThickness;
    shader.uniforms.uRevealColor = revealUniforms.uRevealColor;
    shader.uniforms.uRevealIntensity = revealUniforms.uRevealIntensity;
    shader.uniforms.uMundoTime = revealUniforms.uMundoTime;
    if (fresnel) shader.uniforms.uFresnelColor = { value: fresnelColorValue };
    if (stylize) {
      shader.uniforms.uShadowColor = shadingUniforms.uShadowColor;
      shader.uniforms.uCoreLow = shadingUniforms.uCoreLow;
      shader.uniforms.uCoreHigh = shadingUniforms.uCoreHigh;
      shader.uniforms.uShadowMix = shadingUniforms.uShadowMix;
      shader.uniforms.uDropShadowMix = shadingUniforms.uDropShadowMix;
      shader.uniforms.uBounceColor = shadingUniforms.uBounceColor;
      shader.uniforms.uBounceStrength = shadingUniforms.uBounceStrength;
      shader.uniforms.uBounceDistance = shadingUniforms.uBounceDistance;
    }

    if (sway) {
      // BRISA (como las hojas de folio-2025): el vaivén es PROPORCIONAL a la
      // altura local del vértice → tras la escala de instancia queda
      // proporcional a la altura REAL en el mundo (visible, no se achica con el
      // árbol). El pie no se mueve; la copa se mece. Fase por instancia para que
      // el bosque no baile en bloque, ráfagas lentas que "respiran" y un aleteo
      // fino de hoja encima.
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uMundoTime;"
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
	{
		#ifdef USE_INSTANCING
			vec3 swayPhase = vec3(instanceMatrix[3]);
		#else
			vec3 swayPhase = vec3(0.0);
		#endif
		float swayH = max(transformed.y, 0.0);
		float swayPh = swayPhase.x * 0.7 + swayPhase.z * 0.9;
		float swayGust = 0.62 + 0.38 * sin(uMundoTime * 0.35 + swayPh * 0.5);
		float swayA = ${swayAmp.toFixed(4)} * swayGust;
		transformed.x += sin(uMundoTime * 1.5 + swayPh) * swayA * swayH;
		transformed.z += cos(uMundoTime * 1.15 + swayPh * 1.3) * swayA * 0.8 * swayH;
		transformed.x += sin(uMundoTime * 5.0 + swayH * 3.0 + swayPh) * ${swayAmp.toFixed(4)} * 0.14 * swayH;
	}`
        );
    }

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
uniform float uRevealIntensity;${fresnel ? "\nuniform vec3 uFresnelColor;" : ""}${
          stylize
            ? `
uniform vec3 uShadowColor;
uniform float uCoreLow;
uniform float uCoreHigh;
uniform float uShadowMix;
uniform float uDropShadowMix;
uniform vec3 uBounceColor;
uniform float uBounceStrength;
uniform float uBounceDistance;`
            : ""
        }`
      )
      // Al FINAL del pipeline (tras tonemapping/encoding): descartar fuera del
      // radio y pintar el frente de onda. El *intensity (>1) empuja el anillo
      // por encima del threshold 0.9 del Bloom (buffers HalfFloat) → brilla.
      // SOMBREADO ESTILIZADO (folio-2025). Va PREPEND a <opaque_fragment>:
      // ahí `outgoingLight` todavía es lineal y no ha pasado por el
      // tonemapping, que es exactamente donde Bruno opera. Si fuera APPEND
      // modificaríamos outgoingLight DESPUÉS de construir gl_FragColor y no
      // pasaría nada.
      .replace(
        "#include <opaque_fragment>",
        `${
          stylize
            ? `#if NUM_DIR_LIGHTS > 0
	{
		// 'direction' ya viene normalizada y en espacio de VISTA (lo hace
		// WebGLLights); 'normal' también, así que el dot es directo. Índice 0 porque
		// la escena tiene UNA sola luz direccional.
		float stzNdotL = dot( normal, directionalLights[ 0 ].direction );

		// 1) CORE SHADOW de dos tonos.
		// Bruno escribe smoothstep(high, low, x) con high > low, que en GLSL es
		// comportamiento INDEFINIDO (exige edge0 < edge1). Se escribe invertido:
		// 1 - smoothstep(low, high, x) es idéntico y sí está definido.
		float stzCore = 1.0 - smoothstep( uCoreLow, uCoreHigh, stzNdotL );

		// 2) DROP SHADOW del shadow map. La rama es sobre un UNIFORME → control
		// de flujo uniforme: con el dial en 0 el compilador elimina las taps de
		// PCF enteras.
		float stzDrop = 0.0;
		#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
			if ( uDropShadowMix > 0.001 && receiveShadow ) {
				DirectionalLightShadow stzSh = directionalLightShadows[ 0 ];
				float stzS = getShadow(
					directionalShadowMap[ 0 ],
					stzSh.shadowMapSize,
					stzSh.shadowIntensity,
					stzSh.shadowBias,
					stzSh.shadowRadius,
					vDirectionalShadowCoord[ 0 ]
				);
				stzDrop = ( 1.0 - stzS ) * uDropShadowMix;
			}
		#endif

		// 3) SOMBRA TEÑIDA: la sombra no es "menos luz", es el albedo
		// multiplicado por el color de sombra. Como diffuseColor ya pasó por
		// <color_fragment>, el moteado del suelo y el glitter quedan DENTRO del
		// tinte en vez de aplanarse.
		float stzShade = max( stzCore, stzDrop ) * uShadowMix;
		outgoingLight = mix( outgoingLight, diffuseColor.rgb * uShadowColor, stzShade );

		// 4) LIGHT BOUNCE del suelo hacia las caras que miran abajo.
		if ( uBounceStrength > 0.001 ) {
			// Normal a espacio de mundo sin varying extra: la parte rotacional
			// de viewMatrix es ortonormal, así que n * mat3(viewMatrix) equivale
			// a transpose(R) * n. Con flatShading 'normal' sale de derivadas, así
			// que el rebote sigue las facetas.
			vec3 stzWorldN = normalize( normal * mat3( viewMatrix ) );
			float stzDown = smoothstep( 0.0, 1.0, dot( stzWorldN, vec3( 0.0, -1.0, 0.0 ) ) );
			float stzH = clamp(
				( uBounceDistance - max( 0.0, vRevealWorldPos.y ) ) / uBounceDistance,
				0.0, 1.0
			);
			outgoingLight = mix(
				outgoingLight,
				diffuseColor.rgb * uBounceColor,
				stzDown * stzH * stzH * uBounceStrength
			);
		}
	}
#endif
`
            : ""
        }#include <opaque_fragment>`
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>${
          fresnel
            ? `
	{
		// Fresnel: rasante = reflejo, de frente = transparente. Reusa
		// \`vViewPosition\` (fragmento→cámara) y \`normal\`, ambos declarados por
		// los chunks estándar y vivos en main() hasta acá — redeclararlos
		// rompería la compilación. Con flatShading la normal sale de las
		// derivadas de vViewPosition, así que el efecto sigue las facetas.
		float fresnelTerm = pow(
			1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0),
			${fresnelPower.toFixed(4)}
		);
		gl_FragColor.rgb = mix(gl_FragColor.rgb, uFresnelColor, fresnelTerm * 0.6);
	}`
            : ""
        }
	{
		float dReveal = distance(vRevealWorldPos.xz, uRevealCenter.xz);
		if (dReveal > uRevealRadius) discard;
		float ring = smoothstep(uRevealRadius - uRevealThickness, uRevealRadius, dReveal);
		gl_FragColor.rgb = mix(gl_FragColor.rgb, uRevealColor * uRevealIntensity, ring);
	}`
      );

    if (groundDetail || glitter) {
      // Helpers de ruido compartidos por moteado y glitter
      shader.fragmentShader = shader.fragmentShader.replace(
        "varying vec3 vRevealWorldPos;",
        `varying vec3 vRevealWorldPos;
uniform float uMundoTime;
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
      );
    }

    if (groundDetail) {
      // Moteado de suelo: value-noise 2 octavas + grano fino, modulando el
      // albedo ANTES de la iluminación (color_fragment). Espacio de mundo →
      // no nada con la cámara y respeta el flat shading.
      shader.fragmentShader = shader.fragmentShader.replace(
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

    if (glitter) {
      // El "glitter" del asfalto de folio-2025 (Scenery.js/setRoad): destellos
      // escasos que titilan sobre la calzada — la vía brilla viva de noche/día.
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
	{
		vec2 gp = floor(vRevealWorldPos.xz * 9.0);
		float gh = mundoHash(gp);
		if (gh > 0.962) {
			float tw = 0.5 + 0.5 * sin(uMundoTime * 2.6 + gh * 251.0);
			diffuseColor.rgb += vec3(0.55, 0.5, 0.4) * tw * 0.55;
		}
	}`
      );
    }
  };

  // Sin esto Three reutiliza programas cacheados de materiales con los mismos
  // defines pero SIN la inyección (p.ej. casco de la panga vs agua).
  material.customProgramCacheKey = () =>
    `reveal${groundDetail ? "-detail" : ""}${sway ? `-sway${swayAmp}` : ""}${glitter ? "-glitter" : ""}${fresnel ? `-fresnel${fresnelPower}` : ""}${stylize ? "-stz" : ""}`;
}
