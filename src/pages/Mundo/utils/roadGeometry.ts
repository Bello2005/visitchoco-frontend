import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const STEP = 0.5;
// Each 3.4-unit lane comfortably clears the chiva's 2-unit mirror span.
export const BRIDGE_HALF_WIDTH = 3.4;
const APPROACH_LENGTH = 36;
const DECK_CLEARANCE = 1.25;
const SIDEWALK_WIDTH = 0.65;
const SLAB_DEPTH = 0.24;
const UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, 1);

type Layer = "asphalt" | "white" | "yellow" | "concrete" | "rail" | "metal" | "light";
export interface Barrier {
  position: [number, number, number];
  rotation: [number, number, number];
  halfLength: number;
}
export interface RoadGeometry {
  layers: Partial<Record<Layer, THREE.BufferGeometry>>;
  surface: THREE.BufferGeometry;
  barriers: Barrier[];
}
interface RoadInput {
  startZ: number;
  endZ: number;
  centerX: (z: number) => number;
  ground: (x: number, z: number) => number;
  waterLevel: number;
}

/** Build the render surface and its collision mesh from the same vertices. */
export function planRoad({ startZ, endZ, centerX, ground, waterLevel }: RoadInput) {
  const points: THREE.Vector3[] = [];
  for (let z = startZ; z > endZ; z -= STEP) points.push(new THREE.Vector3(centerX(z), 0, z));
  points.push(new THREE.Vector3(centerX(endZ), 0, endZ));
  const count = points.length;
  // A wider ribbon needs gentler turns. Filter the original spine while
  // keeping the plaza connections fixed.
  const originalX = points.map(point => point.x);
  const radius = Math.ceil(5 / STEP);
  for (let i = 1; i < count - 1; i++) {
    const reach = Math.min(radius, i, count - 1 - i);
    let sum = 0;
    let weights = 0;
    for (let offset = -reach; offset <= reach; offset++) {
      const weight = reach + 1 - Math.abs(offset);
      sum += originalX[i + offset] * weight;
      weights += weight;
    }
    points[i].x = sum / weights;
  }
  function measureDistances() {
    const distances = [0];
    for (let i = 1; i < count; i++) {
      distances.push(distances[i - 1] + points[i].distanceTo(points[i - 1]));
    }
    return distances;
  }
  const originalDistances = measureDistances();
  const spans: { start: number; end: number }[] = [];
  for (let i = 0; i < count; i++) {
    if (ground(points[i].x, points[i].z) >= waterLevel + 0.12) continue;
    const previous = spans[spans.length - 1];
    if (previous && originalDistances[i] - previous.end < 8) previous.end = originalDistances[i];
    else spans.push({ start: originalDistances[i], end: originalDistances[i] });
  }
  const influence = originalDistances.map(distance => {
    let value = 0;
    for (const span of spans) {
      // Full-width abutments extend onto each riverbank before the taper.
      const gap = Math.max(span.start - 2 - distance, distance - span.end - 2, 0);
      value = Math.max(value, 1 - THREE.MathUtils.smoothstep(gap, 0, APPROACH_LENGTH));
    }
    return value;
  });
  // Match the tangent of the existing road at the outside of each approach
  // and the tangent of the bridge at the inside. Widen only on the chord.
  const straight = new Map<number, THREE.Vector3>();
  const widening = influence.map(() => 0);
  function joinApproach(outer: number, inner: number, bridgeSlope: number) {
    const direction = Math.sign(inner - outer);
    const outside = points[outer - direction];
    const from = points[outer];
    const to = points[inner];
    const length = to.z - from.z;
    if (!direction) return;
    const roadSlope = outside ? (from.x - outside.x) / (from.z - outside.z) : bridgeSlope;
    for (let i = outer + direction; i !== inner; i += direction) {
      const t = (points[i].z - from.z) / length;
      const t2 = t * t;
      const t3 = t2 * t;
      points[i].x = (2 * t3 - 3 * t2 + 1) * from.x
        + (t3 - 2 * t2 + t) * length * roadSlope
        + (3 * t2 - 2 * t3) * to.x
        + (t3 - t2) * length * bridgeSlope;
    }
  }
  for (let first = 0; first < count; first++) {
    if (influence[first] <= 0) continue;
    let last = first;
    while (last + 1 < count && influence[last + 1] > 0) last++;
    let start = first;
    let end = last;
    while (start < end && influence[start] < 0.45) start++;
    while (end > start && influence[end] < 0.45) end--;
    if (start < end) {
      const a = points[start].clone();
      const b = points[end].clone();
      const slope = (b.x - a.x) / (b.z - a.z);
      const side = new THREE.Vector3().crossVectors(UP, b.clone().sub(a)).normalize();
      const chordX = (z: number) => a.x + slope * (z - a.z);

      // The old route is only a locator. Find the banks again on the new
      // straight alignment, checking the edges as well as the center.
      let wetStart = end;
      let wetEnd = start;
      const halfDeck = BRIDGE_HALF_WIDTH + SIDEWALK_WIDTH;
      for (let i = first; i <= last; i++) {
        const { z } = points[i];
        const x = chordX(z);
        if ([-1, -0.5, 0, 0.5, 1].some(offset =>
          ground(x + side.x * offset * halfDeck, z + side.z * offset * halfDeck) < waterLevel + 0.12
        )) {
          wetStart = Math.min(wetStart, i);
          wetEnd = Math.max(wetEnd, i);
        }
      }
      const deckStart = wetStart <= wetEnd ? Math.max(first, wetStart - 3) : start;
      const deckEnd = wetStart <= wetEnd ? Math.min(last, wetEnd + 3) : end;
      const taperSamples = Math.ceil(4 / STEP);
      const alignedStart = Math.max(first, deckStart - taperSamples);
      const alignedEnd = Math.min(last, deckEnd + taperSamples);
      for (let i = alignedStart; i <= alignedEnd; i++) {
        points[i].x = chordX(points[i].z);
        const outsideDeck = Math.max(deckStart - i, i - deckEnd, 0);
        widening[i] = 1 - THREE.MathUtils.smoothstep(outsideDeck, 0, taperSamples);
        straight.set(i, side);
      }
      joinApproach(first, alignedStart, slope);
      joinApproach(last, alignedEnd, slope);
    }
    first = last;
  }

  const distances = measureDistances();
  const sides = points.map((_, i) => {
    const bridgeSide = straight.get(i);
    if (bridgeSide) return bridgeSide;
    const direction = points[Math.min(count - 1, i + 1)].clone()
      .sub(points[Math.max(0, i - 1)]);
    return new THREE.Vector3().crossVectors(UP, direction).normalize();
  });
  const groundHeights = points.map(p => ground(p.x, p.z));
  for (let i = 0; i < count; i++) {
    let height = groundHeights[i] + 0.05;
    if (influence[i] > 0) {
      height = Math.max(height, waterLevel + 0.39 + (DECK_CLEARANCE - 0.39) * influence[i]);
    }
    points[i].y = height;
  }
  // One elevation per straight span, including any clearance needed
  // over the banks. Only the approaches change grade.
  const spanHeights = new Map<THREE.Vector3, number>();
  for (const [i, span] of straight) {
    if (widening[i] !== 1) continue;
    spanHeights.set(span, Math.max(spanHeights.get(span) ?? -Infinity, points[i].y));
  }
  for (const [i, span] of straight) {
    if (widening[i] === 1) points[i].y = spanHeights.get(span)!;
  }

  // Lift adjacent samples to cap abrupt terrain transitions at a 20% grade.
  // This only raises the deck, so the navigable opening is never reduced.
  for (let i = 1; i < count; i++) points[i].y = Math.max(points[i].y, points[i - 1].y - (distances[i] - distances[i - 1]) * 0.2);
  for (let i = count - 2; i >= 0; i--) points[i].y = Math.max(points[i].y, points[i + 1].y - (distances[i + 1] - distances[i]) * 0.2);

  return { points, sides, distances, widening };
}

export type RoadPlan = ReturnType<typeof planRoad>;

// Find the nearest station on the actual road, including straight bridge
// segments. Z is monotonic, so only nearby segments need checking.
export function sampleRoad(plan: RoadPlan, x: number, z: number, reach: number) {
  const { points, widening } = plan;
  const start = points[0].z;
  if (z > start + reach || z < points[points.length - 1].z - reach) return;
  let best = reach * reach;
  let sample: { distance: number; height: number; bridge: number } | undefined;
  const first = Math.max(1, Math.floor((start - z - reach) / STEP));
  const last = Math.min(points.length - 1, Math.ceil((start - z + reach) / STEP) + 1);
  for (let i = first; i <= last; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const t = THREE.MathUtils.clamp(((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz), 0, 1);
    const distance = (x - a.x - t * dx) ** 2 + (z - a.z - t * dz) ** 2;
    if (distance >= best) continue;
    best = distance;
    sample = {
      distance: Math.sqrt(distance),
      height: THREE.MathUtils.lerp(a.y, b.y, t),
      bridge: THREE.MathUtils.lerp(widening[i - 1], widening[i], t),
    };
  }
  return sample;
}

export function buildRoad(input: RoadInput, plan = planRoad(input)): RoadGeometry {
  const { ground, waterLevel } = input;
  const { points, sides, distances, widening } = plan;
  const count = points.length;
  const pieces = new Map<Layer, THREE.BufferGeometry[]>();
  const surfacePositions: number[] = [];
  const barriers: Barrier[] = [];
  function add(layer: Layer, geometry: THREE.BufferGeometry) {
    geometry.deleteAttribute("uv");
    const bucket = pieces.get(layer) ?? [];
    bucket.push(geometry);
    pieces.set(layer, bucket);
  }
  function point(i: number, offset: number, height = 0) {
    const p = points[i].clone().addScaledVector(sides[i], offset);
    p.y += height;
    return p;
  }
  function quad(layer: Layer, corners: THREE.Vector3[], collidable = false) {
    const [a, b, c, d] = corners;
    const values = [a, c, b, b, c, d].flatMap(p => [p.x, p.y, p.z]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
    geometry.computeVertexNormals();
    add(layer, geometry);
    if (collidable) surfacePositions.push(...values);
  }
  function strip(layer: Layer, i: number, left0: number, right0: number, left1: number, right1: number, height = 0, collidable = false) {
    quad(layer, [point(i - 1, Math.min(left0, right0), height), point(i - 1, Math.max(left0, right0), height), point(i, Math.min(left1, right1), height), point(i, Math.max(left1, right1), height)], collidable);
  }
  function beam(layer: Layer, from: THREE.Vector3, to: THREE.Vector3, width: number, height: number) {
    const delta = to.clone().sub(from);
    const geometry = new THREE.BoxGeometry(width, height, delta.length());
    const rotation = new THREE.Quaternion().setFromUnitVectors(FORWARD, delta.normalize());
    geometry.applyMatrix4(new THREE.Matrix4().compose(from.clone().add(to).multiplyScalar(0.5), rotation, new THREE.Vector3(1, 1, 1)));
    add(layer, geometry.toNonIndexed());
    geometry.dispose();
  }
  function post(layer: Layer, center: THREE.Vector3, width: number, height: number, depth = width) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    geometry.translate(center.x, center.y, center.z);
    add(layer, geometry.toNonIndexed());
    geometry.dispose();
  }

  let lastPost = -Infinity;
  let lastPier = -Infinity;
  let lastLight = -Infinity;
  for (let i = 1; i < count; i++) {
    const w0 = BRIDGE_HALF_WIDTH;
    const w1 = BRIDGE_HALF_WIDTH;
    strip("asphalt", i, -w0, w0, -w1, w1, 0, true);
    for (const side of [-1, 1]) {
      strip("white", i, side * (w0 - 0.2) - 0.035, side * (w0 - 0.2) + 0.035,
        side * (w1 - 0.2) - 0.035, side * (w1 - 0.2) + 0.035, 0.015);
    }
    // Use the same dash pattern and phase on the road and bridge.
    if (distances[i] % 2.8 < 1.4) {
      strip("yellow", i, -0.045, 0.045, -0.045, 0.045, 0.015);
    }

    if (Math.max(widening[i - 1], widening[i]) === 0) continue;
    const sidewalk0 = SIDEWALK_WIDTH * widening[i - 1];
    const sidewalk1 = SIDEWALK_WIDTH * widening[i];
    const outer0 = w0 + sidewalk0;
    const outer1 = w1 + sidewalk1;
    // A continuous reinforced slab with visible fascia and soffit.
    strip("concrete", i, -outer0, outer0, -outer1, outer1, -SLAB_DEPTH);
    for (const side of [-1, 1]) {
      quad("concrete", [point(i - 1, side * outer0), point(i - 1, side * outer0, -SLAB_DEPTH), point(i, side * outer1), point(i, side * outer1, -SLAB_DEPTH)]);
      if (Math.min(widening[i - 1], widening[i]) < 1) {
        // Close the approach down to the bank, without filling the river span.
        const start = point(i - 1, side * outer0, -SLAB_DEPTH);
        const end = point(i, side * outer1, -SLAB_DEPTH);
        const foot = (p: THREE.Vector3) =>
          new THREE.Vector3(p.x, Math.min(p.y, ground(p.x, p.z) - 0.04), p.z);
        quad("concrete", [start, foot(start), end, foot(end)]);
      }
      // Flush sidewalks avoid a hard lip at the beginning of the approach.
      strip("concrete", i, side * w0, side * outer0, side * w1, side * outer1, 0.025, true);
      beam("concrete", point(i - 1, side * (w0 - 0.55), -0.36), point(i, side * (w1 - 0.55), -0.36), 0.28, 0.3);
      if (Math.min(widening[i - 1], widening[i]) < 1) continue;
      const from = point(i - 1, side * (outer0 - 0.06), 0.52);
      const to = point(i, side * (outer1 - 0.06), 0.52);
      beam("rail", from, to, 0.085, 0.09);
      beam("rail", from.clone().add(new THREE.Vector3(0, 0.42, 0)), to.clone().add(new THREE.Vector3(0, 0.42, 0)), 0.1, 0.1);
      beam("concrete", point(i - 1, side * outer0, 0.09), point(i, side * outer1, 0.09), 0.15, 0.18);
      // A continuous invisible barrier matches the guardrail envelope.
      const delta = to.clone().sub(from);
      const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(FORWARD, delta.clone().normalize()));
      const center = from.clone().add(to).multiplyScalar(0.5);
      barriers.push({ position: [center.x, center.y, center.z], rotation: [rotation.x, rotation.y, rotation.z], halfLength: delta.length() / 2 + 0.015 });
    }
    if (widening[i] === 1 && distances[i] - lastPost >= 1.5) {
      for (const side of [-1, 1]) {
        post("rail", point(i, side * (outer1 - 0.06), 0.52), 0.13, 1.04);
        post("white", point(i, side * (outer1 - 0.06), 0.8), 0.145, 0.1);
      }
      lastPost = distances[i];
    }
    if (widening[i] === 1 && distances[i] - lastPier >= 12) {
      // Paired edge columns leave the center of the river open for the panga.
      for (const side of [-1, 1]) {
        const top = point(i, side * (w1 - 0.45), -0.48);
        const foot = Math.min(ground(top.x, top.z), waterLevel - 0.6);
        const height = Math.max(0.1, top.y - foot);
        post("concrete", new THREE.Vector3(top.x, foot + height / 2, top.z), 0.65, height, 0.95);
        post("concrete", new THREE.Vector3(top.x, foot + 0.12, top.z), 1.05, 0.24, 1.35);
      }
      beam("concrete", point(i, -outer1, -0.4), point(i, outer1, -0.4), 0.65, 0.32);
      lastPier = distances[i];
    }
    if (widening[i] === 1 && distances[i] - lastLight >= 12) {
      for (const side of [-1, 1]) {
        const base = point(i, side * (outer1 - 0.14));
        post("metal", base.clone().add(new THREE.Vector3(0, 1.55, 0)), 0.065, 3.1);
        const lamp = point(i, side * (outer1 - 0.65), 3.07);
        beam("metal", base.clone().add(new THREE.Vector3(0, 3.05, 0)), lamp, 0.055, 0.055);
        post("metal", lamp, 0.26, 0.07, 0.45);
        post("light", lamp.clone().add(new THREE.Vector3(0, -0.045, 0)), 0.21, 0.025, 0.36);
      }
      lastLight = distances[i];
    }
  }
  const layers: RoadGeometry["layers"] = {};
  for (const [layer, geometries] of pieces) {
    layers[layer] = mergeGeometries(geometries);
    geometries.forEach(geometry => geometry.dispose());
  }
  const surface = new THREE.BufferGeometry();
  surface.setAttribute("position", new THREE.Float32BufferAttribute(surfacePositions, 3));
  surface.setIndex(Array.from({ length: surfacePositions.length / 3 }, (_, index) => index));
  return { layers, surface, barriers };
}
