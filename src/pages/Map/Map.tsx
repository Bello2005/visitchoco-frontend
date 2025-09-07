importReact, { useEffect, useRef, useState } from "react";
import "leaflet";
import { useMediaQuery } from "react-responsive";
import { MapContainer, TileLayer } from "react-leaflet";
import { Map as LeafletMapType } from "leaflet";
import type { Municipality } from "../../services/municipality.service";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import { municipalityService } from "../../services/municipality.service";

// Estilos
import "leaflet/dist/leaflet.css";
import "react-tooltip/dist/react-tooltip.css";
import "../../styles/components/scroll.css";

// Componentes
import { MainNav } from "../../components/landing/MainNav";
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

const Map: React.FC = () => {
  const [chocoGeoJson, setChocoGeoJson] = useState<{
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      geometry: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][];
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

  // Cargar el GeoJSON del Chocó
  useEffect(() => {
    fetch("/data/chocoRegion.geojson")
      .then((res) => res.json())
      .then((data) => setChocoGeoJson(data));
  }, []);

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

  // Efecto para agregar la máscara al mapa cuando el GeoJSON esté disponible
  useEffect(() => {
    if (!chocoGeoJson || !mapRef.current) return;

    const addMaskToMap = async () => {
      await import("leaflet-maskcanvas");
        if (typeof window.L?.maskCanvas === 'function') {
        const maskLayer = window.L.maskCanvas({
          radius: 1,
          color: "#4ade80",
          opacity: 1,
          noMask: true,
          useAbsoluteRadius: true,
          lineColor: "#059669",
        });
        const coordinates = chocoGeoJson.features[0].geometry.coordinates[0];
        maskLayer.setData(
          coordinates.map(([lng, lat]: number[]) => [lat, lng])
        );
        if (mapRef.current) {
          maskLayer.addTo(mapRef.current);
        }
      }
    };

    addMaskToMap().catch(console.error);
  }, [chocoGeoJson]);

  const resetMapView = () => {
    if (mapRef.current) {
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
          center={[5.6919, -76.6583]}
          zoom={7.5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
              selectedMunicipality={selectedMunicipality}
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
