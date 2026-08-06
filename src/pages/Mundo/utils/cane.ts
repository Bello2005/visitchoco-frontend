import * as THREE from "three";

// Tiende una CAÑA DE GUADUA entre dos puntos: la orienta y la escala a su
// largo. Sirve igual para pilotes verticales, pasamanos, crucetas y vigas.
//
// El truco: todas las cañas son instancias de un MISMO cilindro unitario
// (r=1, h=1); la matriz hace el resto. Así un puente o un muelle entero cabe
// en UN draw call.
//
// ⚠️ NO ES REENTRANTE: usa vectores scratch de módulo y `_dir` se muta con
// divideScalar. Hay que llamarla en serie, nunca desde dos bucles entrelazados.
//
// Extraída de RoadRibbon.tsx (patrón de Scenery.js de folio-2025) para que los
// muelles la compartan en vez de duplicarla.

const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scl = new THREE.Vector3();
const _UP = new THREE.Vector3(0, 1, 0);

export function cane(
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  out: THREE.Matrix4[]
): void {
  _dir.subVectors(b, a);
  const len = _dir.length();
  if (len < 1e-4) return;
  _mid.addVectors(a, b).multiplyScalar(0.5);
  _quat.setFromUnitVectors(_UP, _dir.divideScalar(len));
  _scl.set(r, len, r);
  out.push(new THREE.Matrix4().compose(_mid, _quat, _scl));
}

/** Geometría compartida por todo lo hecho de cañas: cilindro UNITARIO. */
export function makeCaneGeometry(): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(1, 1, 1, 6);
}
