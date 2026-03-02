import React from "react";
import { GeoJSON } from "react-leaflet";
import type { Municipality } from "../../services/municipality.service";
import { ethnicDistributionService } from "../../services/ethnicDistribution.service";
import type { HeatmapEntry } from "../../hooks/useEthnicHeatmap";
import type { Feature, MultiPolygon, Point } from "geojson";

interface MunicipalityBoundariesProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onMunicipalityClick: (municipality: Municipality) => void;
  ethnicHeatmap?: Map<string, HeatmapEntry>;
}

const MUNICIPALITY_STYLES = {
  default: {
    color: "#0D9488",
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.08,
  },
  selected: {
    color: "#0F766E",
    weight: 2,
    opacity: 0.85,
    fillOpacity: 0.22,
  },
  hover: {
    color: "#115E59",
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.18,
  },
};

export const MunicipalityBoundaries: React.FC<MunicipalityBoundariesProps> = ({
  municipalities,
  selectedMunicipality,
  onMunicipalityClick,
  ethnicHeatmap,
}) => {
  const getStyle = (municipality: Municipality) => {
    const heatEntry = ethnicHeatmap?.get(municipality.cod_dane);
    // Protect against #000000 fallback from getRaceColor for unknown codes
    const rawColor = heatEntry
      ? ethnicDistributionService.getRaceColor(heatEntry.raceCode)
      : null;
    const ethnicColor = rawColor && rawColor !== "#000000" ? rawColor : null;

    if (selectedMunicipality?.id === municipality.id) {
      if (ethnicColor) {
        return {
          color: "rgba(255,255,255,0.9)",
          fillColor: ethnicColor,
          weight: 2,
          opacity: 1,
          fillOpacity: 0.75,
        };
      }
      return MUNICIPALITY_STYLES.selected;
    }
    if (ethnicColor) {
      // Choropleth: white border + ethnic fill (standard practice for heat maps)
      return {
        color: "rgba(255,255,255,0.6)",
        fillColor: ethnicColor,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.55,
      };
    }
    return MUNICIPALITY_STYLES.default;
  };

  // Key includes heatmap size so GeoJSON re-creates when data loads (empty Map → populated Map)
  const heatmapKey = ethnicHeatmap == null
    ? "plain"
    : ethnicHeatmap.size > 0
      ? `heat-${ethnicHeatmap.size}`
      : "loading";

  return (
    <>
      {municipalities.map((municipality) => {
        if (!municipality.geometry) return null;

        return (
          <GeoJSON
            key={`boundary-${municipality.id}-${heatmapKey}`}
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
