// Estado vivo del vehículo, mutado por Vehicle cada frame y leído por la UI
// HTML (minimapa) sin pasar por React state — cero re-renders.
export const vehicleState = {
  x: 0,
  z: 0,
  /** rumbo en radianes (0 = norte/-Z, crece antihorario visto desde arriba) */
  yaw: 0,
  mode: "car" as "car" | "boat",
};
