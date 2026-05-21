import React, { useEffect, useMemo, useRef } from "react";
import { GeoJSON, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Municipality } from "../../services/municipality.service";
import type { HeatmapEntry } from "../../hooks/useEthnicHeatmap";
import type { Feature, MultiPolygon, Point } from "geojson";
import type { SubregionKey } from "../../utils/subregionFromMunicipio";
import { municipioToSubregion } from "../../utils/subregionFromMunicipio";
import { ensureArray } from "../../utils/ensureArray";
import { SUBREGION_META } from "../../utils/subregionData";

const ETHNIC_SATURATED: Record<string, string> = {
  AFRO:        "#D97706",
  INDIGENA:    "#059669",
  MESTIZO:     "#4F46E5",
  ROM:         "#7C3AED",
  RAIZAL:      "#0891B2",
  PALENQUERO:  "#DC2626",
  NINGUNO:     "#6B7280",
  NO_INFORMA:  "#9CA3AF",
};

interface MunicipalityBoundariesProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  highlightedSubregion?: SubregionKey | null;
  onMunicipalityClick: (municipality: Municipality) => void;
  ethnicHeatmap?: Map<string, HeatmapEntry>;
  dimmed?: boolean;
}

const BASE_DEFAULT: L.PathOptions = {
  color: "rgba(255,255,255,0.6)",
  weight: 1,
  opacity: 1,
  fillColor: "transparent",
  fillOpacity: 0,
};

const BASE_HOVER: L.PathOptions = {
  color: "#ffffff",
  weight: 2,
  opacity: 1,
  fillColor: "#000000",
  fillOpacity: 0.12,
};

function computeStyle(args: {
  municipality: Municipality;
  selectedId: number | null;
  highlightedSubregion: SubregionKey | null;
  dimmed: boolean;
  ethnicHeatmap?: Map<string, HeatmapEntry>;
}): L.PathOptions {
  const { municipality, selectedId, highlightedSubregion, dimmed, ethnicHeatmap } = args;

  if (dimmed) {
    return {
      color: "rgba(255,255,255,0.25)",
      weight: 0.8,
      opacity: 0.5,
      fillColor: "transparent",
      fillOpacity: 0,
    };
  }

  const ownSub = municipioToSubregion(municipality.name);
  const isInHighlightedSub =
    highlightedSubregion !== null && ownSub === highlightedSubregion;
  const isOutsideHighlight =
    highlightedSubregion !== null && !isInHighlightedSub;

  if (selectedId === municipality.id) {
    const meta = SUBREGION_META[ownSub];
    return {
      color: meta.primaryHex,
      weight: 2.5,
      opacity: 1,
      fillColor: meta.primaryHex,
      fillOpacity: 0.32,
    };
  }

  if (isOutsideHighlight) {
    return {
      color: "rgba(255,255,255,0.18)",
      weight: 0.6,
      opacity: 0.35,
      fillColor: "#9CA3AF",
      fillOpacity: 0.08,
    };
  }

  if (isInHighlightedSub) {
    const meta = SUBREGION_META[ownSub];
    return {
      color: "rgba(255,255,255,0.75)",
      weight: 1.5,
      opacity: 1,
      fillColor: meta.primaryHex,
      fillOpacity: 0.2,
    };
  }

  const heatEntry = ethnicHeatmap?.get(municipality.cod_dane);
  const ethnicColor = heatEntry
    ? (ETHNIC_SATURATED[heatEntry.raceCode] ?? null)
    : null;

  if (ethnicColor) {
    return {
      color: "rgba(255,255,255,0.7)",
      fillColor: ethnicColor,
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.45,
    };
  }

  return { ...BASE_DEFAULT };
}

interface MunicipalityLayerProps {
  municipality: Municipality;
  style: L.PathOptions;
  interactive: boolean;
  showTooltip: boolean;
  onClick: () => void;
}

const MunicipalityLayer: React.FC<MunicipalityLayerProps> = React.memo(
  ({ municipality, style, interactive, showTooltip, onClick }) => {
    const layerRef = useRef<L.GeoJSON | null>(null);

    // Keep refs to latest style and handlers so our event listeners can stay
    // attached across renders without forcing a remount of the 31 heavy layers.
    const styleRef = useRef(style);
    const interactiveRef = useRef(interactive);
    const onClickRef = useRef(onClick);

    useEffect(() => {
      styleRef.current = style;
      interactiveRef.current = interactive;
      onClickRef.current = onClick;
      layerRef.current?.setStyle(style);
    }, [style, interactive, onClick]);

    return (
      <GeoJSON
        ref={layerRef}
        data={municipality.geometry as Feature<MultiPolygon | Point>}
        style={style}
        eventHandlers={{
          click: (e) => {
            if (!interactiveRef.current) return;
            L.DomEvent.stopPropagation(e);
            e.target.closeTooltip();
            onClickRef.current();
          },
          mouseover: (e) => {
            if (!interactiveRef.current) return;
            e.target.setStyle(BASE_HOVER);
          },
          mouseout: (e) => {
            if (!interactiveRef.current) return;
            const s = styleRef.current;
            e.target.setStyle({
              ...s,
              fillColor: s.fillOpacity === 0 ? "transparent" : s.fillColor,
            });
          },
        }}
      >
        {showTooltip && (
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
  }
);

export const MunicipalityBoundaries: React.FC<MunicipalityBoundariesProps> = ({
  municipalities,
  selectedMunicipality,
  highlightedSubregion = null,
  onMunicipalityClick,
  ethnicHeatmap,
  dimmed = false,
}) => {
  const selectedId = selectedMunicipality?.id ?? null;
  const municipalityList = ensureArray<Municipality>(municipalities);

  const styles = useMemo(() => {
    const map = new Map<number, L.PathOptions>();
    for (const m of municipalityList) {
      map.set(
        m.id,
        computeStyle({
          municipality: m,
          selectedId,
          highlightedSubregion,
          dimmed,
          ethnicHeatmap,
        })
      );
    }
    return map;
  }, [municipalityList, selectedId, highlightedSubregion, dimmed, ethnicHeatmap]);

  return (
    <>
      {municipalityList.map((municipality) => {
        if (!municipality.geometry) return null;

        const ownSub = municipioToSubregion(municipality.name);
        const isOutsideHighlight =
          highlightedSubregion !== null && ownSub !== highlightedSubregion;
        const interactive = !dimmed && !isOutsideHighlight;
        const style = styles.get(municipality.id)!;

        return (
          <MunicipalityLayer
            key={`boundary-${municipality.id}`}
            municipality={municipality}
            style={style}
            interactive={interactive}
            showTooltip={interactive}
            onClick={() => onMunicipalityClick(municipality)}
          />
        );
      })}
    </>
  );
};

export default MunicipalityBoundaries;
