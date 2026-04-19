import { useEffect } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { SubregionKey } from "../utils/subregionFromMunicipio";
import type { Municipality } from "../services/municipality.service";
import type { PanelView } from "./useMapState";
import { computeSubregionBounds } from "./useSubregionBounds";

interface UseMapFlyToOpts {
  mapRef: React.RefObject<LeafletMap | null>;
  selectedSubregion: SubregionKey | null;
  panelView: PanelView;
  municipalities: Municipality[];
  isMobile: boolean;
  isPanelOpen: boolean;
}

export function useMapFlyTo({
  mapRef,
  selectedSubregion,
  panelView,
  municipalities,
  isMobile,
  isPanelOpen,
}: UseMapFlyToOpts) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSubregion || municipalities.length === 0) return;
    // Only fly-to when we are on the subregion overview — not when drilling into a municipality detail
    if (panelView !== "subregion") return;

    const bounds = computeSubregionBounds(municipalities, selectedSubregion);
    if (!bounds) return;

    const padding: [number, number] = isMobile ? [24, 24] : [80, 80];

    map.flyToBounds(bounds, {
      padding,
      duration: 0.8,
      maxZoom: 10.5,
    });

    if (!isMobile && isPanelOpen) {
      window.setTimeout(() => {
        map.panBy([-185, 0], { animate: false });
      }, 820);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubregion, panelView, municipalities]);
}
