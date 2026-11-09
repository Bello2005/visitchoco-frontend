import { readFileSync } from "node:fs";
import { render, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ChocoTerrain, { GATEWAY_Z, NORTH_Z, getRoadPlan, roadCenterWorldX, worldGround } from "../components/ChocoTerrain";
import { buildRoad } from "./roadGeometry";

vi.mock("@react-three/rapier", () => ({ RigidBody: () => null }));

it("checks all asphalt triangles against the real map", async () => {
  vi.stubGlobal("fetch", async () => ({
    json: async () => JSON.parse(readFileSync("public/data/chocoRegion.geojson", "utf8")),
  }));
  const ready = vi.fn();
  render(<ChocoTerrain onReady={ready} />);
  await waitFor(() => expect(ready).toHaveBeenCalled());
  const road = buildRoad({ startZ: GATEWAY_Z + 0.5, endZ: NORTH_Z - 0.5, centerX: roadCenterWorldX, ground: worldGround, waterLevel: 0 }, getRoadPlan());
  const normals = road.layers.asphalt!.attributes.normal;
  const inverted = Array.from({ length: normals.count }, (_, i) => i).filter(i => normals.getY(i) <= 0);
  expect(inverted).toHaveLength(0);
});
