import React from "react";
import { GeoJSON, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Municipality } from "../../services/municipality.service";
import type { HeatmapEntry } from "../../hooks/useEthnicHeatmap";
import type { Feature, MultiPolygon, Point } from "geojson";

const ETHNIC_SATURATED: Record<string, string> = {
  AFRO:        "#D97706", // amber-600
  INDIGENA:    "#059669", // emerald-600
  MESTIZO:     "#4F46E5", // indigo-600
  ROM:         "#7C3AED", // violet-600
  RAIZAL:      "#0891B2", // cyan-600
  PALENQUERO:  "#DC2626", // red-600
  NINGUNO:     "#6B7280", // gray-500
  NO_INFORMA:  "#9CA3AF", // gray-400
};

interface MunicipalityBoundariesProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onMunicipalityClick: (municipality: Municipality) => void;
  ethnicHeatmap?: Map<string, HeatmapEntry>;
  dimmed?: boolean;
}

const MUNICIPALITY_STYLES = {
  default: {
    color: "rgba(255,255,255,0.6)",
    weight: 1,
    opacity: 1,
    fillColor: "transparent",
    fillOpacity: 0,
  },
  hover: {
    color: "#ffffff",
    weight: 2,
    opacity: 1,
    fillColor: "#000000",
    fillOpacity: 0.12,
  },
  selected: {
    color: "#0D9488",
    weight: 2.5,
    opacity: 1,
    fillColor: "#0D9488",
    fillOpacity: 0.28,
  },
};

export const MunicipalityBoundaries: React.FC<MunicipalityBoundariesProps> = ({
  municipalities,
  selectedMunicipality,
  onMunicipalityClick,
  ethnicHeatmap,
  dimmed = false,
}) => {
  const getStyle = (municipality: Municipality) => {
    if (dimmed) {
      return {
        color: "rgba(255,255,255,0.25)",
        weight: 0.8,
        opacity: 0.5,
        fillColor: "transparent",
        fillOpacity: 0,
      };
    }
    const heatEntry = ethnicHeatmap?.get(municipality.cod_dane);
    const ethnicColor = heatEntry
      ? (ETHNIC_SATURATED[heatEntry.raceCode] ?? null)
      : null;

    if (selectedMunicipality?.id === municipality.id) {
      return MUNICIPALITY_STYLES.selected;
    }
    if (ethnicColor) {
      return {
        color: "rgba(255,255,255,0.7)",
        fillColor: ethnicColor,
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.45,
      };
    }
    return {
      ...MUNICIPALITY_STYLES.default,
      fillColor: "transparent",
      fillOpacity: 0,
    };
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
              click: (e) => {
                if (dimmed) return;
                L.DomEvent.stopPropagation(e);
                e.target.closeTooltip();
                onMunicipalityClick(municipality);
              },
              mouseover: (e) => {
                if (dimmed) return;
                const layer = e.target;
                layer.setStyle(MUNICIPALITY_STYLES.hover);
              },
              mouseout: (e) => {
                if (dimmed) return;
                const layer = e.target;
                const style = getStyle(municipality);
                layer.setStyle({
                  ...style,
                  fillColor: style.fillOpacity === 0 ? "transparent" : style.fillColor,
                });
              },
            }}
          >
            {!dimmed && (
              <Tooltip
                sticky
                direction="top"
                offset={[0, -8]}
                opacity={1}
                className="municipality-tooltip"
              >
                {municipality.name}
              </Tooltip>
            )}
          </GeoJSON>
        );
      })}
    </>
  );
};

export default MunicipalityBoundaries;
