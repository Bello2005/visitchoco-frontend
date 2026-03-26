import React from "react";
import { GeoJSON, Tooltip } from "react-leaflet";
import L from "leaflet";
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
                L.DomEvent.stopPropagation(e);
                e.target.closeTooltip();
                onMunicipalityClick(municipality);
              },
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle(MUNICIPALITY_STYLES.hover);
              },
              mouseout: (e) => {
                const layer = e.target;
                const style = getStyle(municipality);
                layer.setStyle({
                  ...style,
                  fillColor: style.fillOpacity === 0 ? "transparent" : style.fillColor,
                });
              },
            }}
          >
            <Tooltip
              sticky
              direction="top"
              offset={[0, -8]}
              opacity={1}
              className="municipality-tooltip"
            >
              {municipality.name}
            </Tooltip>
          </GeoJSON>
        );
      })}
    </>
  );
};

export default MunicipalityBoundaries;
