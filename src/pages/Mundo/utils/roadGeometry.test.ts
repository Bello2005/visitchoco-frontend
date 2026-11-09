import { describe, expect, it } from "vitest";
import { BRIDGE_HALF_WIDTH, buildRoad } from "./roadGeometry";

function fixture(wet = true) {
  return buildRoad({ startZ: 55, endZ: -55, centerX: () => 0,
    ground: (_x, z) => wet && Math.abs(z) < 9 ? -0.5 : 0.34, waterLevel: 0 });
}
function dispose(road: ReturnType<typeof buildRoad>) {
  Object.values(road.layers).forEach(geometry => geometry.dispose());
  road.surface.dispose();
}

describe("two-lane river crossing", () => {
  it("has two chiva-width lanes and keeps the navigable opening clear", () => {
    const road = fixture();
    const vertices = road.layers.asphalt!.attributes.position;
    const center: number[] = [];
    for (let i = 0; i < vertices.count; i++) {
      if (Math.abs(vertices.getZ(i)) < 8) {
        center.push(Math.abs(vertices.getX(i)));
        expect(vertices.getY(i)).toBeCloseTo(1.25);
      }
    }
    expect(center.length).toBeGreaterThan(0);
    expect(Math.min(...center)).toBeCloseTo(BRIDGE_HALF_WIDTH);
    expect(BRIDGE_HALF_WIDTH).toBeGreaterThan(2.5);
    dispose(road);
  });

  it("joins dry road without steps and keeps collision triangles facing up", () => {
    const road = fixture();
    const positions = road.surface.attributes.position;
    for (let i = 0; i < positions.count; i += 3) {
      const ax = positions.getX(i + 1) - positions.getX(i);
      const az = positions.getZ(i + 1) - positions.getZ(i);
      const bx = positions.getX(i + 2) - positions.getX(i);
      const bz = positions.getZ(i + 2) - positions.getZ(i);
      expect(az * bx - ax * bz).toBeGreaterThanOrEqual(0);
    }
    const asphalt = road.layers.asphalt!.attributes.position;
    for (let i = 0; i < asphalt.count; i += 6) {
      const grade = Math.abs(asphalt.getY(i + 1) - asphalt.getY(i)) / Math.abs(asphalt.getZ(i + 1) - asphalt.getZ(i));
      expect(grade).toBeLessThanOrEqual(0.201);
    }
    expect(asphalt.getY(0)).toBeCloseTo(0.39);
    expect(asphalt.getY(asphalt.count - 1)).toBeCloseTo(0.39);
    expect(road.barriers.length).toBeGreaterThan(0);
    expect(road.barriers.every(barrier => Math.abs(barrier.position[0]) > 2.1)).toBe(true);
    dispose(road);
  });

  it("keeps both guardrails straight on a curved route", () => {
    const road = buildRoad({
      startZ: 40, endZ: -40, centerX: z => 5 * Math.cos(z / 10),
      ground: (_x, z) => Math.abs(z) < 9 ? -0.5 : 0.34, waterLevel: 0,
    });
    for (const side of [0, 1]) {
      const rail = road.barriers.filter((_, i) => i % 2 === side);
      expect(rail.length).toBeGreaterThan(2);
      const [ax, , az] = rail[0].position;
      const [bx, , bz] = rail[rail.length - 1].position;
      for (const { position: [x, , z] } of rail) {
        expect((bx - ax) * (z - az) - (bz - az) * (x - ax)).toBeCloseTo(0, 6);
      }
    }
    dispose(road);
  });

  it("keeps full-width guardrails past an oblique bank at the deck edge", () => {
    const road = buildRoad({
      startZ: 40, endZ: -40, centerX: () => 0,
      ground: (x, z) => (Math.abs(z) < 8 || (x > 2 && z > 0 && z < 15)) ? -0.5 : 0.34,
      waterLevel: 0,
    });
    const rails = road.barriers.filter(({ position }) => position[2] > 14 && position[2] < 15);
    expect(rails.length).toBeGreaterThanOrEqual(2);
    for (const { position } of rails) {
      expect(Math.abs(position[0])).toBeGreaterThan(BRIDGE_HALF_WIDTH);
    }
    dispose(road);
  });

  it("keeps the same lane width through the dry approaches and the bridge", () => {
    const road = fixture();
    const vertices = road.layers.asphalt!.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      expect(Math.abs(vertices.getX(i))).toBeCloseTo(BRIDGE_HALF_WIDTH);
    }
    dispose(road);
  });

  it("keeps dry stretches free of bridge structures", () => {
    const road = fixture(false);
    expect(road.barriers).toHaveLength(0);
    expect(road.layers.concrete).toBeUndefined();
    expect(road.layers.rail).toBeUndefined();
    dispose(road);
  });
});
