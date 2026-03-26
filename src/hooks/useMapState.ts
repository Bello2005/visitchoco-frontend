import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import L, { Map as LeafletMapType } from "leaflet";
import { useMediaQuery } from "react-responsive";
import { municipalityService } from "../services/municipality.service";
import indigenousReserveService from "../services/indigenousReserve.service";
import type { Municipality } from "../services/municipality.service";
import type { IndigenousReserve } from "../services/indigenousReserve.service";
import type { FilterCategory } from "../types/filters";

const CHOCO_CENTER: [number, number] = [5.6919, -76.6583];
const CHOCO_DEFAULT_ZOOM = 7.5;
const MUNICIPALITY_ZOOM = 9;

type ChocoGeoJson = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
      type: "Polygon" | "MultiPolygon";
      coordinates: number[][][] | number[][][][];
    };
  }>;
} | null;

export type PanelView = "list" | "detail";

export interface MapState {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  chocoGeoJson: ChocoGeoJson;
  isLoading: boolean;

  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  currentFilter: FilterCategory;
  searchQuery: string;

  isPanelOpen: boolean;
  panelView: PanelView;
  isMobile: boolean;

  mapRef: React.RefObject<LeafletMapType | null>;

  selectMunicipality: (m: Municipality) => void;
  selectReserve: (r: IndigenousReserve) => void;
  setFilter: (f: FilterCategory) => void;
  setSearchQuery: (q: string) => void;
  navigateToList: () => void;
  togglePanel: () => void;
  resetAll: () => void;
  handleMapClick: () => void;
}

export function useMapState(): MapState {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const mapRef = useRef<LeafletMapType>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [reserves, setReserves] = useState<IndigenousReserve[]>([]);
  const [chocoGeoJson, setChocoGeoJson] = useState<ChocoGeoJson>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [selectedReserve, setSelectedReserve] = useState<IndigenousReserve | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>("general");
  const [searchQuery, setSearchQuery] = useState("");

  const [isPanelOpen, setIsPanelOpen] = useState(!isMobile);
  const [panelView, setPanelView] = useState<PanelView>("list");

  const fitBoundsWithPadding = useCallback(
    (geoJson: ChocoGeoJson, panelOpen: boolean) => {
      if (!mapRef.current) return;
      if (geoJson?.features?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer = L.geoJSON(geoJson as any);
        mapRef.current.fitBounds(layer.getBounds(), {
          padding: [80, 80],
          animate: false,
        });
        setTimeout(() => {
          mapRef.current?.eachLayer((layer) => {
            if (layer instanceof L.Rectangle) mapRef.current?.removeLayer(layer);
          });
        }, 50);
        if (panelOpen && !isMobile) {
          mapRef.current.panBy([-185, 0], { animate: false });
        }
      } else {
        mapRef.current.setView(CHOCO_CENTER, CHOCO_DEFAULT_ZOOM);
      }
    },
    [isMobile]
  );

  // Load data and apply URL deep-link params on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [municipalitiesData, reservesData, geoJsonRes] = await Promise.all([
          municipalityService.getAllMunicipalities(),
          indigenousReserveService.getAllIndigenousReserves(),
          fetch("/data/chocoRegion.geojson").then((r) => r.json()),
        ]);
        setMunicipalities(municipalitiesData);
        setReserves(reservesData);
        setChocoGeoJson(geoJsonRes);

        // Apply URL params after data is ready
        const mSlug = searchParams.get("m");
        const rId = searchParams.get("r");
        const filtroParam = searchParams.get("filtro") as FilterCategory | null;

        if (filtroParam) setCurrentFilter(filtroParam);

        if (mSlug) {
          const found = municipalitiesData.find((m) => m.slug === mSlug);
          if (found) {
            setSelectedMunicipality(found);
            setPanelView("detail");
            setIsPanelOpen(true);
          }
        } else if (rId) {
          const found = reservesData.find((r) => String(r.id) === rId);
          if (found) {
            setSelectedReserve(found);
            setPanelView("detail");
            setIsPanelOpen(true);
            setCurrentFilter("indigenous");
          }
        }
      } catch (error) {
        console.error("Error loading map data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
  }, []);

  // Fit bounds once GeoJSON is loaded
  useEffect(() => {
    if (chocoGeoJson && mapRef.current) {
      fitBoundsWithPadding(chocoGeoJson, isPanelOpen);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chocoGeoJson]);

  const selectMunicipality = useCallback(
    (m: Municipality) => {
      setSelectedMunicipality(m);
      setSelectedReserve(null);
      setPanelView("detail");
      setIsPanelOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("m", m.slug);
        next.delete("r");
        return next;
      });
      if (mapRef.current) {
        mapRef.current.setView([m.lat, m.lon], MUNICIPALITY_ZOOM);
      }
    },
    [setSearchParams]
  );

  const selectReserve = useCallback(
    (r: IndigenousReserve) => {
      setSelectedReserve(r);
      setSelectedMunicipality(null);
      setPanelView("detail");
      setIsPanelOpen(true);
      setCurrentFilter("indigenous");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("r", String(r.id));
        next.delete("m");
        return next;
      });
      if (mapRef.current && r.lat && r.lon) {
        mapRef.current.setView([r.lat, r.lon], MUNICIPALITY_ZOOM);
      }
    },
    [setSearchParams]
  );

  const setFilter = useCallback(
    (f: FilterCategory) => {
      setCurrentFilter(f);
      setSelectedMunicipality(null);
      setSelectedReserve(null);
      setPanelView("list");
      setSearchQuery("");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (f !== "general") {
          next.set("filtro", f);
        } else {
          next.delete("filtro");
        }
        next.delete("m");
        next.delete("r");
        return next;
      });
    },
    [setSearchParams]
  );

  const navigateToList = useCallback(() => {
    setPanelView("list");
    setSelectedMunicipality(null);
    setSelectedReserve(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("m");
      next.delete("r");
      return next;
    });
    fitBoundsWithPadding(chocoGeoJson, isPanelOpen);
  }, [chocoGeoJson, fitBoundsWithPadding, isPanelOpen, setSearchParams]);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedMunicipality(null);
    setSelectedReserve(null);
    setCurrentFilter("general");
    setPanelView("list");
    setSearchQuery("");
    setSearchParams({});
    fitBoundsWithPadding(chocoGeoJson, isPanelOpen);
  }, [chocoGeoJson, fitBoundsWithPadding, isPanelOpen, setSearchParams]);

  const handleMapClick = useCallback(() => {
    if (panelView === "detail") {
      setPanelView("list");
      setSelectedMunicipality(null);
      setSelectedReserve(null);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("m");
        next.delete("r");
        return next;
      });
    }
  }, [panelView, setSearchParams]);

  return {
    municipalities,
    reserves,
    chocoGeoJson,
    isLoading,
    selectedMunicipality,
    selectedReserve,
    currentFilter,
    searchQuery,
    isPanelOpen,
    panelView,
    isMobile,
    mapRef,
    selectMunicipality,
    selectReserve,
    setFilter,
    setSearchQuery,
    navigateToList,
    togglePanel,
    resetAll,
    handleMapClick,
  };
}
