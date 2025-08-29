import React, { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { MapContainer, TileLayer } from "react-leaflet";
import { Map as LeafletMapType } from "leaflet";
import type { Municipality } from "../../services/municipality.service";
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

// Coordenadas centrales del Chocó y configuración del mapa
const CHOCO_CENTER: [number, number] = [5.6919, -76.6583];
const CHOCO_DEFAULT_ZOOM = 7.5;
const MUNICIPALITY_ZOOM = 9;

const Map: React.FC = () => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<Municipality | null>(null);
  const [visibleMarkers, setVisibleMarkers] = useState<string[]>([]);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const mapRef = useRef<LeafletMapType>(null);

  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const data = await municipalityService.getAllMunicipalities();
        setMunicipalities(data);
        // Inicialmente no mostrar ningún marcador
        setVisibleMarkers([]);
      } catch (error) {
        console.error("Error fetching municipalities:", error);
      }
    };

    fetchMunicipalities();
  }, []);

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
    // Mostrar solo el marcador del municipio seleccionado
    setVisibleMarkers([municipality.name]);

    // Ajustar la vista del mapa con zoom
    mapRef.current?.setView(
      [municipality.lat, municipality.lon],
      9 // Zoom más cercano para ver mejor el municipio
    );
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

          {/* Límites municipales */}
          <MunicipalityBoundaries
            municipalities={municipalities}
            selectedMunicipality={selectedMunicipality}
            onMunicipalityClick={handleRegionClick}
          />

          {/* Marcadores de municipios */}
          <MapMarkers
            municipalities={municipalities}
            visibleMarkers={visibleMarkers}
            selectedMunicipality={selectedMunicipality}
            onMarkerClick={handleRegionClick}
            onMarkerHover={setSelectedMunicipality}
          />
        </MapContainer>

        {/* Paneles de escritorio */}
        {!isMobile && (
          <DesktopPanels
            municipalities={municipalities}
            selectedMunicipality={selectedMunicipality}
            onSelectMunicipality={handleRegionClick}
            onReset={resetMapView}
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
