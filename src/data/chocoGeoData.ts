import type { FeatureCollection, Polygon } from "geojson";

interface RegionProperties {
  name: string;
  description: string;
  population: string;
  attractions: string[];
}

export const chocoGeoData: FeatureCollection<Polygon, RegionProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Quibdó",
        description:
          "Capital del departamento del Chocó y centro cultural y económico de la región.",
        population: "130,000 habitantes aproximadamente",
        attractions: [
          "Catedral San Francisco de Asís",
          "Malecón del Atrato",
          "Museo de Cultura Negra",
        ],
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-76.7583, 5.7919],
            [-76.5583, 5.7919],
            [-76.5583, 5.5919],
            [-76.7583, 5.5919],
            [-76.7583, 5.7919],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Nuquí",
        description:
          "Paraíso costero conocido por el avistamiento de ballenas jorobadas y sus playas vírgenes.",
        population: "8,000 habitantes aproximadamente",
        attractions: [
          "Playa Olímpica",
          "Termales",
          "Avistamiento de ballenas (julio a octubre)",
        ],
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-77.3708, 5.8086],
            [-77.1708, 5.8086],
            [-77.1708, 5.6086],
            [-77.3708, 5.6086],
            [-77.3708, 5.8086],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Bahía Solano",
        description:
          "Importante destino turístico conocido por sus playas y actividades acuáticas.",
        population: "9,500 habitantes aproximadamente",
        attractions: [
          "Playa El Almejal",
          "Parque Nacional Natural Utría",
          "Pesca deportiva",
        ],
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-77.5074, 6.3222],
            [-77.3074, 6.3222],
            [-77.3074, 6.1222],
            [-77.5074, 6.1222],
            [-77.5074, 6.3222],
          ],
        ],
      },
    },
    // Nota: Estos son polígonos simplificados para ejemplo.
    // En una implementación real, necesitarías los datos GeoJSON precisos de los límites municipales del Chocó
  ],
};
