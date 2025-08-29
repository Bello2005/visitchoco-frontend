import React from "react";
import { GeoJSON } from "react-leaflet";
import type { Municipality } from "../../services/municipality.service";
import type { Feature, MultiPolygon, Point } from "geojson";

interface MunicipalityBoundariesProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onMunicipalityClick: (municipality: Municipality) => void;
}

const MUNICIPALITY_STYLES = {
  default: {
    color: "#3B82F6",
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.1,
  },
  selected: {
    color: "#2563EB",
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.2,
  },
  hover: {
    color: "#1D4ED8",
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.3,
  },
};

export const MunicipalityBoundaries: React.FC<MunicipalityBoundariesProps> = ({
  municipalities,
  selectedMunicipality,
  onMunicipalityClick,
}) => {
  // Función para manejar el estilo de cada municipio
  const getStyle = (municipality: Municipality) => {
    if (selectedMunicipality?.id === municipality.id) {
      return MUNICIPALITY_STYLES.selected;
    }
    return MUNICIPALITY_STYLES.default;
  };

  return (
    <>
      {municipalities.map((municipality) => {
        if (!municipality.geometry) return null;

        return (
          <GeoJSON
            key={`boundary-${municipality.id}`}
            data={municipality.geometry as Feature<MultiPolygon | Point>}
            style={() => getStyle(municipality)}
            eventHandlers={{
              click: () => onMunicipalityClick(municipality),
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle(MUNICIPALITY_STYLES.hover);
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getStyle(municipality));
              },
            }}
          />
        );
      })}
    </>
  );
};

export default MunicipalityBoundaries;
