import * as THREE from "three";

// Sombreado estilizado portado de folio-2025 (MeshDefaultMaterial.js de Bruno
// Simon, MIT — ver public/models/folio/LICENSE.md).
//
// La idea central: su look NO viene de más efectos de post-procesado, viene de
// reescribir el sombreado. Tres piezas, todas inyectadas por applyReveal:
//
//   1. CORE SHADOW de dos tonos — el terminador es un smoothstep duro sobre
//      dot(normal, luz), no el falloff suave de Lambert. Es lo que hace que
//      lea como ilustración y no como "3D genérico".
//   2. SOMBRA TEÑIDA — la sombra NO baja el brillo: multiplica el albedo por
//      un violeta. Bruno usa #6d3fff de día (#2f00db de noche, #4e009c al
//      ocaso, por si algún día se hace ciclo día/noche).
//   3. LIGHT BOUNCE — las caras que miran hacia abajo recogen color del suelo,
//      atenuado por la altura al cuadrado. Es lo que asienta los objetos y
//      evita que parezcan pegados encima del terreno.
//
// Todos son UNIFORMES, nunca #define: cambiar un define cambiaría la clave de
// caché del programa y obligaría a recompilar los ~53 materiales de la escena
// (congelamiento de segundos). Así, cambiar de nivel de calidad son tres
// escrituras a .value y surte efecto en el frame siguiente.

export const shadingUniforms = {
  /** Tinte de la sombra.
   *  Bruno usa #6d3fff, un violeta MUY saturado. Sobre su paleta funciona,
   *  pero acá hay superficies casi blancas (los arcos del malecón, el
   *  wordmark) y multiplicarlas por ese violeta las volvía MORADAS. Este
   *  violeta-azul apagado tiñe la sombra sin gritar. */
  uShadowColor: { value: new THREE.Color("#6a6fae") },
  /** Bordes del terminador de dos tonos (Bruno: low -0.25, high 1.0) */
  uCoreLow: { value: -0.25 },
  uCoreHigh: { value: 1.0 },
  /** Cuánto tiñe la sombra. Dial de calidad, pero NUNCA 0: es gratis y es la
   *  identidad visual.
   *  Calibrado a ojo contra la escena real: Bruno usa el tinte casi a tope,
   *  pero su paleta base es más apagada. Con los verdes saturados de esta
   *  vegetación, por encima de ~0.6 los árboles pierden el verde y leen
   *  AZULES. 0.5 tiñe la sombra sin comerse la dirección de arte. */
  uShadowMix: { value: 0.38 },
  /** Mezcla de la sombra proyectada del shadow map. En 0 se salta la lectura PCF entera. */
  uDropShadowMix: { value: 1.0 },
  /** Color del rebote del suelo (verde selva del Chocó) */
  uBounceColor: { value: new THREE.Color("#3f7a3a") },
  uBounceStrength: { value: 0.12 },
  /** Altura sobre el suelo a la que el rebote ya no llega */
  uBounceDistance: { value: 2.2 },

  // ---- línea de flotación (folio-2025, MeshDefaultMaterial.js) ----
  // Toda malla cuyo Y de mundo caiga dentro de esta banda alrededor del nivel
  // del agua se pinta de blanco. Bruno usa ±0.013 sobre un mundo de escala
  // distinta; acá la banda es algo más ancha para que se vea a nuestra cámara.
  // Es, con diferencia, lo que más vende el efecto de "cosa metida en agua".
  uWaterlineWidth: { value: 0.035 },
  uWaterlineColor: { value: new THREE.Color("#eaf7ff") },
};
