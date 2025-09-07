import { LatLng } from "leaflet";

export function createCircularPolygon(
  center: [number, number],
  radiusKm: number = 5,
  points: number = 32
): number[][] {
  const coordinates: number[][] = [];
  const centerLatLng = new LatLng(center[0], center[1]);

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 360;
    const point = centerLatLng.destinationPoint(radiusKm * 1000, angle);
    coordinates.push([point.lng, point.lat]);
  }

  // Cerrar el polígono repitiendo el primer punto
  coordinates.push(coordinates[0]);

  return coordinates;
}

// Extensión del prototipo LatLng para calcular puntos destino
declare module "leaflet" {
  interface LatLng {
    destinationPoint(distance: number, bearing: number): LatLng;
  }
}

LatLng.prototype.destinationPoint = function (
  distance: number,
  bearing: number
): LatLng {
  const R = 6371000; // Radio de la Tierra en metros
  const d = distance / R;
  const lat1 = (this.lat * Math.PI) / 180;
  const lon1 = (this.lng * Math.PI) / 180;
  const brng = (bearing * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return new LatLng(
    (lat2 * 180) / Math.PI,
    (((lon2 * 180) / Math.PI + 540) % 360) - 180
  );
};
