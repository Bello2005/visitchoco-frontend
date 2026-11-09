import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { applyReveal } from "../utils/applyReveal";

type Position = [number, number, number];
const COLORS = {
  red: "#c92132", yellow: "#ffd24a", blue: "#087eaf", green: "#168b65",
  cream: "#fff1c8", chrome: "#b8c9cf", dark: "#18252b", wood: "#95552e",
  glass: "#285260", light: "#fff2bd", amber: "#ff9e24",
};
type Paint = keyof typeof COLORS;

// Static details are merged by paint, keeping the body to eleven draw calls.
function buildBody() {
  const parts = new Map<Paint, THREE.BufferGeometry[]>();
  function add(paint: Paint, geometry: THREE.BufferGeometry, position: Position, rotation: Position = [0, 0, 0]) {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(1, 1, 1),
    ));
    const bucket = parts.get(paint) ?? [];
    bucket.push(geometry);
    parts.set(paint, bucket);
  }
  function box(paint: Paint, position: Position, size: Position, rotation?: Position) {
    add(paint, new THREE.BoxGeometry(...size), position, rotation);
  }
  // Floor, exposed frame and bonnet. Forward is local +Z.
  box("dark", [0, -0.23, 0], [1.45, 0.16, 3.05]);
  box("wood", [0, -0.02, -0.3], [1.55, 0.12, 2.5]);
  box("red", [0, 0.18, 1.17], [1.36, 0.43, 0.8]);
  box("yellow", [0, 0.42, 1.17], [1.4, 0.08, 0.84]);
  box("chrome", [0, -0.12, 1.64], [1.76, 0.18, 0.13]);
  box("chrome", [0, -0.12, -1.62], [1.76, 0.15, 0.13]);
  box("dark", [0, 0.15, 1.585], [0.81, 0.32, 0.035]);
  for (let i = 0; i < 6; i++) box("chrome", [0, 0.025 + i * 0.048, 1.61], [0.77, 0.017, 0.025]);
  box("chrome", [0, 0.16, 1.63], [0.055, 0.3, 0.025]);
  // Split windshield, pillars, dashboard and visor.
  box("glass", [0, 0.78, 0.74], [1.32, 0.56, 0.045], [-0.12, 0, 0]);
  box("cream", [0, 0.78, 0.78], [0.035, 0.6, 0.04]);
  box("dark", [0, 0.46, 0.6], [1.38, 0.1, 0.3]);
  for (const side of [-1, 1]) {
    box("red", [side * 0.71, 0.76, 0.71], [0.09, 0.67, 0.1]);
    box("dark", [side * 0.3, 0.67, 0.79], [0.025, 0.32, 0.025], [0, 0, -0.45]);
    box("chrome", [side * 0.86, 0.85, 0.62], [0.26, 0.025, 0.025]);
    box("dark", [side * 0.98, 0.86, 0.62], [0.06, 0.2, 0.15]);
    box("chrome", [side * 1.015, 0.86, 0.62], [0.012, 0.15, 0.11]);
    add("chrome", new THREE.CylinderGeometry(0.14, 0.14, 0.04, 20), [side * 0.55, 0.18, 1.61], [Math.PI / 2, 0, 0]);
    add("light", new THREE.CylinderGeometry(0.105, 0.105, 0.045, 20), [side * 0.55, 0.18, 1.64], [Math.PI / 2, 0, 0]);
    box("amber", [side * 0.62, 0.36, 1.61], [0.12, 0.055, 0.04]);
    // Side panels, painted bands and open window bays.
    box("blue", [side * 0.78, 0.23, -0.38], [0.08, 0.44, 2.25]);
    for (const [y, paint] of [[0.06, "yellow"], [0.21, "red"], [0.4, "cream"]] as [number, Paint][]) {
      box(paint, [side * 0.826, y, -0.38], [0.015, 0.045, 2.25]);
    }
    for (let i = 0; i < 5; i++) {
      const z = 0.66 - i * 0.54;
      box("green", [side * 0.77, 0.75, z], [0.075, 0.68, 0.075]);
      box("yellow", [side * 0.813, 0.74, z], [0.012, 0.05, 0.055], [Math.PI / 4, 0, 0]);
    }
    box("chrome", [side * 0.78, 0.62, -0.4], [0.035, 0.035, 2.2]);
    box("dark", [side * 0.86, -0.2, -0.12], [0.25, 0.07, 1.1]);
    box("chrome", [side * 0.97, -0.17, -0.12], [0.035, 0.04, 1.05]);
    // Decorative diamonds along each side panel.
    for (let i = 0; i < 8; i++) {
      box("yellow", [side * 0.835, 0.3, 0.54 - i * 0.26], [0.018, 0.09, 0.09], [Math.PI / 4, 0, 0]);
      box("red", [side * 0.847, 0.3, 0.54 - i * 0.26], [0.018, 0.045, 0.045], [Math.PI / 4, 0, 0]);
    }
    // Arched fenders clear the suspension and steering wheels.
    for (const z of [-1.2, 1.2]) {
      add("red", new THREE.TorusGeometry(0.43, 0.07, 6, 20, Math.PI), [side * 0.82, -0.45, z], [0, side * Math.PI / 2, 0]);
    }
    box("red", [side * 0.61, 0.12, -1.55], [0.16, 0.17, 0.05]);
    box("amber", [side * 0.61, 0.26, -1.55], [0.16, 0.06, 0.05]);
  }
  // Three passenger benches, with open aisle and visible wooden slats.
  for (const z of [0.25, -0.35, -0.95]) {
    box("wood", [0, 0.28, z], [1.34, 0.08, 0.28]);
    box("wood", [0, 0.48, z - 0.13], [1.34, 0.25, 0.055]);
    for (const side of [-1, 1]) box("dark", [side * 0.52, 0.12, z], [0.045, 0.25, 0.2]);
  }
  box("red", [0, 0.23, -1.52], [1.55, 0.43, 0.08]);
  box("yellow", [0, 0.07, -1.57], [1.6, 0.055, 0.025]);
  box("blue", [0, 0.4, -1.57], [1.6, 0.055, 0.025]);
  // Overhanging roof and luggage rack, with a rear access ladder.
  box("yellow", [0, 1.13, -0.31], [1.74, 0.13, 2.79]);
  box("red", [0, 1.07, -0.31], [1.78, 0.045, 2.82]);
  for (const side of [-1, 1]) {
    box("blue", [side * 0.78, 1.39, -0.34], [0.045, 0.045, 2.48]);
    box("green", [side * 0.78, 1.28, -0.34], [0.035, 0.035, 2.48]);
    for (const z of [-1.54, -0.94, -0.34, 0.26, 0.86]) box("blue", [side * 0.78, 1.29, z], [0.045, 0.24, 0.045]);
    box("blue", [0, 1.39, side * 1.2 - 0.34], [1.6, 0.045, 0.045]);
  }
  for (const x of [0.42, 0.7]) box("chrome", [x, 0.69, -1.64], [0.035, 1.3, 0.035]);
  for (let i = 0; i < 7; i++) box("chrome", [0.56, 0.12 + i * 0.18, -1.65], [0.3, 0.025, 0.035]);
  for (const x of [-0.55, 0, 0.55]) box("amber", [x, 1.21, 1.02], [0.1, 0.065, 0.08]);
  return [...parts].map(([paint, geometries]) => {
    const geometry = mergeGeometries(geometries);
    geometries.forEach(part => part.dispose());
    const material = new THREE.MeshStandardMaterial({ color: COLORS[paint], roughness: paint === "chrome" ? 0.27 : 0.65, metalness: paint === "chrome" ? 0.7 : 0.12 });
    applyReveal(material);
    return { paint, geometry, material };
  });
}

export default function Chiva() {
  const parts = useMemo(buildBody, []);
  useEffect(() => () => parts.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); }), [parts]);
  return <group>{parts.map(({ paint, geometry, material }) => <mesh key={paint} geometry={geometry} material={material} castShadow receiveShadow dispose={null} />)}</group>;
}
