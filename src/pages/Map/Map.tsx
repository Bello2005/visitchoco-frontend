import { useEffect, useRef, useState } from "react";
import "leaflet";
import { useMediaQuery } from "react-responsive";
import { MapContainer } from "react-leaflet";
import L, { Map as LeafletMapType } from "leaflet";
import type { Municipality } from "../../services/municipality.service";

import { municipalityService } from "../../services/municipality.service";

// Estilos
import "leaflet/dist/leaflet.css";
import "react-tooltip/dist/react-tooltip.css";
import "../../styles/components/scroll.css";
// Componentes
import { MainNav } from "../../components/landing/MainNav";
import { GrayscaleTileLayer } from "../../components/map/GrayscaleTileLayer";
import { DesktopPanels } from "../../components/map/DesktopPanels";
import { MobilePanel } from "../../components/map/MobilePanel";
import { MapMarkers } from "../../components/map/MapMarkers";
import MunicipalityBoundaries from "../../components/map/MunicipalityBoundaries";
import { IndigenousReserveBoundaries } from "../../components/map/IndigenousReserveBoundaries";
import type { FilterCategory } from "../../types/filters";
import type { IndigenousReserve } from "../../services/indigenousReserve.service";
import indigenousReserveService from "../../services/indigenousReserve.service";

// Coordenadas centrales del Chocó y configuración del mapa
const CHOCO_CENTER: [number, number] = [5.6919, -76.6583];
const CHOCO_DEFAULT_ZOOM = 7.5;
const MUNICIPALITY_ZOOM = 9;

// Límites del mapa: bbox del Chocó con margen generoso
// SW: [lat_sur, lng_oeste]  NE: [lat_norte, lng_este]
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [2.5, -80.5],   // SW — margen sur y oeste
  [10.5, -73.0],  // NE — margen norte y este
];
const MAP_MIN_ZOOM = 7;
const MAP_MAX_ZOOM = 16;

const Map: React.FC = () => {
  const [chocoGeoJson, setChocoGeoJson] = useState<{
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      properties: Record<string, unknown>;
      geometry: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][] | number[][][][];
      };
    }>;
  } | null>(null);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<Municipality | null>(null);
  const [reserves, setReserves] = useState<IndigenousReserve[]>([]);
  const [selectedReserve, setSelectedReserve] =
    useState<IndigenousReserve | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>("general");
  const [visibleMarkers, setVisibleMarkers] = useState<string[]>([]);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const mapRef = useRef<LeafletMapType>(null);

  // Cargar el GeoJSON del Chocó y centrar el mapa con fitBounds
  useEffect(() => {
    fetch("/data/chocoRegion.geojson")
      .then((res) => res.json())
      .then((data) => {
        setChocoGeoJson(data);

        if (mapRef.current && data?.features?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const layer = L.geoJSON(data as any);
          const bounds = layer.getBounds();
          // Padding: left compensa el panel lateral (~320px), resto con margen
          mapRef.current.fitBounds(bounds, {
            paddingTopLeft: [isMobile ? 20 : 340, 20],
            paddingBottomRight: [20, 20],
          });
        }
      });
  }, [isMobile]);

  // Cargar datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const municipalitiesData =
          await municipalityService.getAllMunicipalities();
        setMunicipalities(municipalitiesData);

        const reservesData =
          await indigenousReserveService.getAllIndigenousReserves();
        setReserves(reservesData);

        setVisibleMarkers([]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const resetMapView = () => {
    if (mapRef.current && chocoGeoJson?.features?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layer = L.geoJSON(chocoGeoJson as any);
      mapRef.current.fitBounds(layer.getBounds(), {
        paddingTopLeft: [isMobile ? 20 : 340, 20],
        paddingBottomRight: [20, 20],
      });
    } else if (mapRef.current) {
      mapRef.current.setView(CHOCO_CENTER, CHOCO_DEFAULT_ZOOM);
    }
    setSelectedMunicipality(null);
    setVisibleMarkers([]);
  };

  const handleRegionClick = (municipality: Municipality) => {
    if (mapRef.current) {
      mapRef.current.setView(
        [municipality.lat, municipality.lon],
        MUNICIPALITY_ZOOM
      );
    }
    setSelectedMunicipality(municipality);
    setVisibleMarkers([municipality.name]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* NavBar fijo */}
      <div className="flex-none w-full bg-white shadow-md z-[2000]">
        <MainNav active="mapa" />
      </div>

      {/* Contenedor del mapa y paneles */}
      <div className="flex-1 relative">
        {/* Mapa */}
        <MapContainer
          center={CHOCO_CENTER}
          zoom={CHOCO_DEFAULT_ZOOM}
          minZoom={MAP_MIN_ZOOM}
          maxZoom={MAP_MAX_ZOOM}
          maxBounds={MAP_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          ref={mapRef}
        >
          <GrayscaleTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            chocoGeoJson={chocoGeoJson}
          />

          {/* Límites según el filtro */}
          {currentFilter === "indigenous" ? (
            <IndigenousReserveBoundaries
              reserves={reserves}
              selectedReserve={selectedReserve}
              onReserveClick={(reserve) => {
                setSelectedReserve(reserve);
                if (mapRef.current && reserve.latitude && reserve.longitude) {
                  mapRef.current.setView(
                    [reserve.latitude, reserve.longitude],
                    MUNICIPALITY_ZOOM
                  );
                }
              }}
            />
          ) : (
            <MunicipalityBoundaries
              municipalities={municipalities}
              selectedMunicipality={selectedMunicipality}
              onMunicipalityClick={handleRegionClick}
            />
          )}

          {/* Marcadores de municipios (solo mostrar si no estamos en vista de reservas) */}
          {currentFilter !== "indigenous" && (
            <MapMarkers
              municipalities={municipalities}
              visibleMarkers={visibleMarkers}
              onMarkerClick={handleRegionClick}
              onMarkerHover={setSelectedMunicipality}
            />
          )}
        </MapContainer>

        {/* Paneles de escritorio */}
        {!isMobile && (
          <DesktopPanels
            municipalities={municipalities}
            selectedMunicipality={selectedMunicipality}
            onSelectMunicipality={handleRegionClick}
            onReset={resetMapView}
            onFilterChange={setCurrentFilter}
            currentFilter={currentFilter}
            reserves={reserves}
            selectedReserve={selectedReserve}
            onSelectReserve={(reserve) => {
              setSelectedReserve(reserve);
              if (mapRef.current && reserve.latitude && reserve.longitude) {
                mapRef.current.setView(
                  [reserve.latitude, reserve.longitude],
                  MUNICIPALITY_ZOOM
                );
              }
            }}
          />
        )}

        {/* Panel y botón móvil */}
        {isMobile && (
          <MobilePanel
            isPanelVisible={isPanelVisible}
            selectedMunicipality={selectedMunicipality}
            municipalities={municipalities}
            onSelectMunicipality={handleRegionClick}
            onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
          />
        )}
      </div>
    </div>
  );
};

export default Map;
