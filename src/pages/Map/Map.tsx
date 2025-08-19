import React, { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Popup } from "react-leaflet";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import type { Map as LeafletMap } from "leaflet";

// Estilos
import "leaflet/dist/leaflet.css";
import "react-tooltip/dist/react-tooltip.css";
import "../../styles/components/scroll.css";

// Datos y tipos
import { chocoMunicipalities } from "../../data/chocoMunicipalities";
import type { Region } from "../../data/chocoRegions";

// Componentes
import { MainNav } from "../../components/landing/MainNav";
import EmojiMarker from "../../components/map/EmojiMarker";
import GeneralData from "../../components/map/GeneralData";
import InfoPanel from "../../components/map/InfoPanel";
import SimpleMunicipalitiesList from "../../components/map/SimpleMunicipalitiesList";

// Función para generar un ID único para cada región
const generateRegionId = (name: string, index: number) =>
  `region-${name.toLowerCase().replace(/\s+/g, "-")}-${index}`;

// Definir los municipios principales
const mainMunicipalities = [
  "Quibdó", // Capital
  "Istmina", // Centro comercial importante
  "Bahía Solano", // Principal destino turístico costero
  "Nuquí", // Destino turístico importante
  "Unguía", // Municipio fronterizo importante
];

export const Map: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<Region>(() => ({
    ...chocoMunicipalities[0],
    id: generateRegionId(chocoMunicipalities[0].name, 0),
  }));

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Estado para gestos táctiles y panel
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [visibleMarkers, setVisibleMarkers] =
    useState<string[]>(mainMunicipalities);
  const mapRef = useRef<LeafletMap | null>(null);

  // Generar IDs únicos para las regiones una sola vez
  const regionsWithIds = useMemo<Region[]>(
    () =>
      chocoMunicipalities.map((region, index) => ({
        ...region,
        id: generateRegionId(region.name, index),
      })),
    []
  );

  // Manejadores de eventos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && isPanelVisible) {
      setIsPanelVisible(false);
    } else if (isRightSwipe && !isPanelVisible) {
      setIsPanelVisible(true);
    }
  };

  // Manejadores de regiones
  const handleRegionClick = (region: Region) => {
    setSelectedRegion(region);

    if (!mainMunicipalities.includes(region.name)) {
      setVisibleMarkers((prev) => [...new Set([...prev, region.name])]);
    }

    const zoomLevels: { [key: string]: number } = {
      Quibdó: 12,
      Istmina: 11,
      "Bahía Solano": 11,
      Nuquí: 11,
      Unguía: 11,
      default: 10,
    };

    const zoom = zoomLevels[region.name] || zoomLevels.default;
    mapRef.current?.setView(region.coordinates, zoom);
  };

  const resetView = () => {
    mapRef.current?.setView([5.6919, -76.6583], 7.5);
    setVisibleMarkers(mainMunicipalities);
  };

  return (
    <>
      <MainNav active="mapa" onLogin={() => navigate("/login")} />
      <div
        className={`relative ${isMobile ? "h-[calc(100vh-64px)]" : "h-screen"}`}
      >
        {/* Tooltips */}
        <Tooltip id="panel-tooltip" />
        {regionsWithIds.map((region) => (
          <Tooltip
            key={`tooltip-${region.id}`}
            id={`region-tooltip-${region.id}`}
          />
        ))}

        {/* Mapa a pantalla completa */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
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
            {regionsWithIds
              .filter((region) => visibleMarkers.includes(region.name))
              .map((region) => (
                <EmojiMarker
                  key={`marker-${region.id}`}
                  position={region.coordinates}
                  emoji={region.emoji}
                  eventHandlers={{
                    mouseover: () => setSelectedRegion(region),
                    click: () => handleRegionClick(region),
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold text-lg">
                        {region.emoji} {region.name}
                      </h3>
                      <p className="text-sm">{region.description}</p>
                      {!mainMunicipalities.includes(region.name) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Este marcador desaparecerá al resetear la vista
                        </p>
                      )}
                    </div>
                  </Popup>
                </EmojiMarker>
              ))}
          </MapContainer>
        </motion.div>

        {/* Panel de Municipios (Izquierda) */}
        <motion.div
          className={`absolute ${
            isMobile ? "bottom-0 left-0 w-full" : "top-4 left-4 w-80"
          } 
                     z-[1000] bg-white rounded-2xl shadow-lg p-4 border border-gray-100`}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
          initial={{ opacity: 0, x: -100 }}
          animate={{
            opacity: 1,
            x: isPanelVisible ? 0 : isMobile ? 0 : -320,
            y: isMobile ? (isPanelVisible ? 0 : "100%") : 0,
          }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div
            className="h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Municipios del Chocó
              </h2>
              <motion.button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={resetView}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                data-tooltip-id="panel-tooltip"
                data-tooltip-content="Resetear vista"
              >
                🔄
              </motion.button>
            </div>

            <div className="h-[65vh]">
              <SimpleMunicipalitiesList
                regions={regionsWithIds}
                selectedRegion={selectedRegion}
                onSelectRegion={handleRegionClick}
              />
            </div>
          </div>
        </motion.div>

        {/* Panel de Información (Derecha) */}
        {!isMobile && (
          <motion.div
            className="absolute top-4 right-4 w-96 z-[1000] bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              maxHeight: "calc(100vh - 2rem)",
            }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
              <GeneralData region={selectedRegion} />
              <InfoPanel region={selectedRegion} />
            </div>
          </motion.div>
        )}

        {/* Panel de Información Móvil (Inferior) */}
        {isMobile && isPanelVisible && (
          <motion.div
            className="fixed bottom-16 left-0 right-0 mx-4 mb-4 bg-white rounded-2xl shadow-lg p-4 z-[999] border border-gray-100 max-h-[50vh]"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
              <GeneralData region={selectedRegion} />
              <InfoPanel region={selectedRegion} />
            </div>
          </motion.div>
        )}

        {/* Botón flotante para mostrar/ocultar panel en móviles */}
        {isMobile && (
          <motion.button
            className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg z-[1001]"
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPanelVisible ? "👇" : "👆"}
          </motion.button>
        )}
      </div>
    </>
  );
};

export default Map;
