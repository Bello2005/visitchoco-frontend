import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import L, { Map as LeafletMapType } from "leaflet";
import { useMediaQuery } from "react-responsive";
import { municipalityService } from "../services/municipality.service";
import indigenousReserveService from "../services/indigenousReserve.service";
import type { Municipality } from "../services/municipality.service";
import type { IndigenousReserve } from "../services/indigenousReserve.service";
import type { FilterCategory } from "../types/filters";
import type { SubregionKey } from "../utils/subregionFromMunicipio";
import { municipioToSubregion } from "../utils/subregionFromMunicipio";
import { ensureArray } from "../utils/ensureArray";

const CHOCO_CENTER: [number, number] = [5.6919, -76.6583];
const CHOCO_DEFAULT_ZOOM = 7.5;
const MUNICIPALITY_ZOOM = 9;

const VALID_SUBREGIONS: SubregionKey[] = [
  "atrato",
  "san_juan",
  "baudo",
  "pacifico_norte",
  "darien",
];

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

export type PanelView = "home" | "subregion" | "detail";

export interface MapState {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  chocoGeoJson: ChocoGeoJson;
  isLoading: boolean;

  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  selectedSubregion: SubregionKey | null;
  currentFilter: FilterCategory;
  searchQuery: string;

  isPanelOpen: boolean;
  panelView: PanelView;
  isMobile: boolean;

  ethnicOverlayEnabled: boolean;

  mapRef: React.RefObject<LeafletMapType | null>;

  selectMunicipality: (m: Municipality) => void;
  selectReserve: (r: IndigenousReserve) => void;
  selectSubregion: (key: SubregionKey) => void;
  setFilter: (f: FilterCategory) => void;
  setSearchQuery: (q: string) => void;
  navigateHome: () => void;
  navigateBack: () => void;
  togglePanel: () => void;
  toggleEthnicOverlay: () => void;
  resetAll: () => void;
  handleMapClick: () => void;
}

export function useMapState(): MapState {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const mapRef = useRef<LeafletMapType>(null);
  const dataLoadedRef = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [reserves, setReserves] = useState<IndigenousReserve[]>([]);
  const [chocoGeoJson, setChocoGeoJson] = useState<ChocoGeoJson>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [selectedReserve, setSelectedReserve] = useState<IndigenousReserve | null>(null);
  const [selectedSubregion, setSelectedSubregion] = useState<SubregionKey | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>("general");
  const [searchQuery, setSearchQuery] = useState("");

  const [isPanelOpen, setIsPanelOpen] = useState(!isMobile);
  const [panelView, setPanelView] = useState<PanelView>("home");
  const [ethnicOverlayEnabled, setEthnicOverlayEnabled] = useState(false);

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

  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;
    const load = async () => {
      try {
        const [municipalitiesData, reservesData, geoJsonRes] = await Promise.all([
          municipalityService.getAllMunicipalities(),
          indigenousReserveService.getAllIndigenousReserves(),
          fetch("/data/chocoRegion.geojson").then((r) => r.json()),
        ]);
        setMunicipalities(ensureArray<Municipality>(municipalitiesData));
        setReserves(ensureArray<IndigenousReserve>(reservesData));
        setChocoGeoJson(geoJsonRes);

        const mSlug = searchParams.get("m");
        const rId = searchParams.get("r");
        const subParam = searchParams.get("sub") as SubregionKey | null;
        const filtroParam = searchParams.get("filtro") as FilterCategory | null;
        const VALID_FILTERS: FilterCategory[] = ["indigenous"];

        if (filtroParam && VALID_FILTERS.includes(filtroParam)) {
          setCurrentFilter(filtroParam);
        }

        if (mSlug) {
          const found = municipalitiesData.find((m) => m.slug === mSlug);
          if (found) {
            setSelectedMunicipality(found);
            setSelectedSubregion(municipioToSubregion(found.name));
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
        } else if (subParam && VALID_SUBREGIONS.includes(subParam)) {
          setSelectedSubregion(subParam);
          setPanelView("subregion");
          setIsPanelOpen(true);
        }
      } catch (error) {
        console.error("Error loading map data:", error);
        dataLoadedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
  }, []);

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
      setSelectedSubregion(municipioToSubregion(m.name));
      setPanelView("detail");
      setIsPanelOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("m", m.slug);
        next.delete("r");
        next.delete("sub");
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
        next.delete("sub");
        return next;
      });
      if (mapRef.current && r.lat && r.lon) {
        mapRef.current.setView([r.lat, r.lon], MUNICIPALITY_ZOOM);
      }
    },
    [setSearchParams]
  );

  const selectSubregion = useCallback(
    (key: SubregionKey) => {
      setSelectedSubregion(key);
      setSelectedMunicipality(null);
      setSelectedReserve(null);
      setPanelView("subregion");
      setIsPanelOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("sub", key);
        next.delete("m");
        next.delete("r");
        return next;
      });
    },
    [setSearchParams]
  );

  const setFilter = useCallback(
    (f: FilterCategory) => {
      setCurrentFilter(f);
      setSelectedMunicipality(null);
      setSelectedReserve(null);
      setSelectedSubregion(null);
      setPanelView("home");
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
        next.delete("sub");
        return next;
      });
    },
    [setSearchParams]
  );

  const navigateHome = useCallback(() => {
    setPanelView("home");
    setSelectedSubregion(null);
    setSelectedMunicipality(null);
    setSelectedReserve(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("m");
      next.delete("r");
      next.delete("sub");
      return next;
    });
    fitBoundsWithPadding(chocoGeoJson, isPanelOpen);
  }, [chocoGeoJson, fitBoundsWithPadding, isPanelOpen, setSearchParams]);

  const navigateBack = useCallback(() => {
    if (panelView === "detail") {
      if (selectedSubregion && currentFilter !== "indigenous") {
        setPanelView("subregion");
        setSelectedMunicipality(null);
        setSelectedReserve(null);
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("sub", selectedSubregion);
          next.delete("m");
          next.delete("r");
          return next;
        });
      } else {
        navigateHome();
      }
    } else if (panelView === "subregion") {
      navigateHome();
    }
  }, [panelView, selectedSubregion, currentFilter, navigateHome, setSearchParams]);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const toggleEthnicOverlay = useCallback(() => {
    setEthnicOverlayEnabled((prev) => !prev);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedMunicipality(null);
    setSelectedReserve(null);
    setSelectedSubregion(null);
    setCurrentFilter("general");
    setPanelView("home");
    setSearchQuery("");
    setSearchParams({});
    fitBoundsWithPadding(chocoGeoJson, isPanelOpen);
  }, [chocoGeoJson, fitBoundsWithPadding, isPanelOpen, setSearchParams]);

  const handleMapClick = useCallback(() => {
    if (panelView === "detail") {
      navigateBack();
    }
  }, [panelView, navigateBack]);

  return {
    municipalities,
    reserves,
    chocoGeoJson,
    isLoading,
    selectedMunicipality,
    selectedReserve,
    selectedSubregion,
    currentFilter,
    searchQuery,
    isPanelOpen,
    panelView,
    isMobile,
    ethnicOverlayEnabled,
    mapRef,
    selectMunicipality,
    selectReserve,
    selectSubregion,
    setFilter,
    setSearchQuery,
    navigateHome,
    navigateBack,
    togglePanel,
    toggleEthnicOverlay,
    resetAll,
    handleMapClick,
  };
}
