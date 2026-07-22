// Estado vivo del vehículo, mutado por Vehicle cada frame y leído por la UI
// HTML (minimapa) y por VehicleAudio sin pasar por React state — cero re-renders.
export const vehicleState = {
  x: 0,
  z: 0,
  /** rumbo en radianes (0 = norte/-Z, crece antihorario visto desde arriba) */
  yaw: 0,
  mode: "car" as "car" | "boat",
  /** rapidez horizontal actual (magnitud de la velocidad en XZ) */
  speed: 0,
  /** intención del acelerador: 1 adelante, -1 reversa, 0 sin gas */
  throttle: 0,
  /** true mientras se frena fuerte (para el chirrido de llantas) */
  braking: false,
  /** magnitud del último choque SIN consumir; VehicleAudio lo lee y lo pone en 0 */
  impact: 0,
};
