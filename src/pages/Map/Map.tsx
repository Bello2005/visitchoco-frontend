import React from "react";
import "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/components/scroll.css";
import "../../styles/components/markers.css";

import { AnimatePresence } from "framer-motion";
import { MapContainer } from "react-leaflet";

import { useMapState } from "../../hooks/useMapState";
import { useEthnicHeatmap } from "../../hooks/useEthnicHeatmap";

import { GrayscaleTileLayer } from "../../components/map/GrayscaleTileLayer";
import MunicipalityBoundaries from "../../components/map/MunicipalityBoundaries";
import { IndigenousReserveBoundaries } from "../../components/map/IndigenousReserveBoundaries";
import { ClusteredMarkers } from "../../components/map/ClusteredMarkers";

import { UnifiedPanel } from "../../components/map/panel/UnifiedPanel";
import { PanelToggleButton } from "../../components/map/panel/PanelToggleButton";
import { MapControls } from "../../components/map/overlay/MapControls";

const CHOCO_CENTER: [number, number] = [5.6919, -76.6583];
const CHOCO_DEFAULT_ZOOM = 7.5;
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [2.5, -80.5],
  [10.5, -73.0],
];
const MAP_MIN_ZOOM = 7;
const MAP_MAX_ZOOM = 16;

const Map: React.FC = () => {
  const {
    municipalities,
    reserves,
    chocoGeoJson,
    selectedMunicipality,
    selectedReserve,
    currentFilter,
    isPanelOpen,
    panelView,
    searchQuery,
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
  } = useMapState();

  const ethnicHeatmap = useEthnicHeatmap(currentFilter === "ethnic");

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden">
      {/* MAPA */}
      <MapContainer
        center={CHOCO_CENTER}
        zoom={CHOCO_DEFAULT_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        maxBounds={MAP_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        ref={mapRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ position: "absolute", inset: 0, zIndex: 0 } as any}
      >
        <GrayscaleTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          chocoGeoJson={chocoGeoJson as any}
        />

        {currentFilter === "indigenous" ? (
          <IndigenousReserveBoundaries
            reserves={reserves}
            selectedReserve={selectedReserve}
            onReserveClick={selectReserve}
          />
        ) : (
          <MunicipalityBoundaries
            municipalities={municipalities}
            selectedMunicipality={selectedMunicipality}
            onMunicipalityClick={(m) => {
              selectMunicipality(m);
              handleMapClick();
            }}
            ethnicHeatmap={currentFilter === "ethnic" ? ethnicHeatmap : undefined}
          />
        )}

        {currentFilter !== "indigenous" && (
          <ClusteredMarkers
            municipalities={municipalities}
            selectedMunicipality={selectedMunicipality}
            onMarkerClick={selectMunicipality}
          />
        )}
      </MapContainer>

      {/* OVERLAYS */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1000 }}
      >
        {/* Panel unificado */}
        <AnimatePresence>
          {isPanelOpen && (
            <UnifiedPanel
              municipalities={municipalities}
              reserves={reserves}
              currentFilter={currentFilter}
              selectedMunicipality={selectedMunicipality}
              selectedReserve={selectedReserve}
              panelView={panelView}
              searchQuery={searchQuery}
              isMobile={isMobile}
              onSelectMunicipality={selectMunicipality}
              onSelectReserve={selectReserve}
              onFilterChange={setFilter}
              onSearchChange={setSearchQuery}
              onNavigateToList={navigateToList}
              onClose={togglePanel}
              className="pointer-events-auto"
            />
          )}
        </AnimatePresence>

        {/* Botón para reabrir panel */}
        <AnimatePresence>
          {!isPanelOpen && (
            <PanelToggleButton
              onClick={togglePanel}
              className="pointer-events-auto"
            />
          )}
        </AnimatePresence>

        {/* Controles del mapa */}
        <MapControls
          mapRef={mapRef}
          onReset={resetAll}
          className="pointer-events-auto"
        />
      </div>
    </div>
  );
};

export default Map;
