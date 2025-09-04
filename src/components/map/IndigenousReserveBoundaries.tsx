import React from "react";
import { GeoJSON } from "react-leaflet";
import type { IndigenousReserve } from "../../services/indigenousReserve.service";
import type { Feature, MultiPolygon } from "geojson";

interface IndigenousReserveBoundariesProps {
  reserves: IndigenousReserve[];
  selectedReserve: IndigenousReserve | null;
  onReserveClick: (reserve: IndigenousReserve) => void;
}

const RESERVE_STYLES = {
  default: {
    color: "#10B981", // Verde esmeralda
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.1,
  },
  selected: {
    color: "#059669", // Verde esmeralda más oscuro
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.2,
  },
  hover: {
    color: "#047857", // Verde esmeralda aún más oscuro
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.3,
  },
};

export const IndigenousReserveBoundaries: React.FC<
  IndigenousReserveBoundariesProps
> = ({ reserves, selectedReserve, onReserveClick }) => {
  // Función para manejar el estilo de cada reserva
  const getStyle = (reserve: IndigenousReserve) => {
    if (selectedReserve?.id === reserve.id) {
      return RESERVE_STYLES.selected;
    }
    return RESERVE_STYLES.default;
  };

  return (
    <>
      {reserves.map((reserve) => {
        if (!reserve.territory_geom) return null;

        // Asegurarse de que la geometría tenga el formato GeoJSON correcto
        const geoJsonFeature: Feature<MultiPolygon> = {
          type: "Feature",
          geometry: {
            type: "MultiPolygon",
            coordinates: reserve.territory_geom.coordinates || [],
          },
          properties: {
            id: reserve.id,
            name: reserve.name,
            indigenous_people: reserve.indigenous_people,
          },
        };

        return (
          <GeoJSON
            key={reserve.id}
            data={geoJsonFeature}
            style={() => getStyle(reserve)}
            eventHandlers={{
              click: () => onReserveClick(reserve),
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle(RESERVE_STYLES.hover);
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getStyle(reserve));
              },
            }}
          />
        );
      })}
    </>
  );
};
