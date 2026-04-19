import React, { useEffect, useMemo, useRef } from "react";
import "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/components/scroll.css";
import "../../styles/components/markers.css";

import { AnimatePresence } from "framer-motion";
import { GeoJSON, MapContainer, useMapEvents } from "react-leaflet";
import union from "@turf/union";
import { featureCollection } from "@turf/helpers";
import type { Feature, MultiPolygon } from "geojson";

import { useMapState } from "../../hooks/useMapState";
import { useEthnicHeatmap } from "../../hooks/useEthnicHeatmap";
import { useFavorites } from "../../hooks/useFavorites";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useMapFlyTo } from "../../hooks/useMapFlyTo";
import type { Municipality } from "../../services/municipality.service";

import { GrayscaleTileLayer } from "../../components/map/GrayscaleTileLayer";
import MunicipalityBoundaries from "../../components/map/MunicipalityBoundaries";
import { IndigenousReserveBoundaries } from "../../components/map/IndigenousReserveBoundaries";
import { MunicipalityLabels } from "../../components/map/MunicipalityLabels";

import { UnifiedPanel } from "../../components/map/panel/UnifiedPanel";
import { PanelToggleButton } from "../../components/map/panel/PanelToggleButton";
import { MapControls } from "../../components/map/overlay/MapControls";
import { NearMeButton } from "../../components/map/overlay/NearMeButton";
import { MapLoadingScreen } from "../../components/map/MapLoadingScreen";

const CHOCO_CENTER: [number, number] = [5.6919, -76.6583];
const CHOCO_DEFAULT_ZOOM = 7.5;
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [2.5, -80.5],
  [10.5, -73.0],
];
const MAP_MIN_ZOOM = 7;
const MAP_MAX_ZOOM = 16;

const DerivedChocoOutline: React.FC<{ municipalities: Municipality[] }> = ({ municipalities }) => {
  const outline = useMemo(() => {
    const features = municipalities
      .filter((m) => m.geometry?.geometry?.type === "MultiPolygon")
      .map((m) => m.geometry as Feature<MultiPolygon>);

    if (features.length === 0) return null;

    return features.reduce<Feature<MultiPolygon> | null>((acc, feat) => {
      if (acc === null) return feat;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = union(featureCollection([acc, feat])) as Feature<MultiPolygon> | null;
      return result ?? acc;
    }, null);
  }, [municipalities]);

  if (!outline) return null;

  return (
    <GeoJSON
      key="choco-derived-outline"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data={outline as any}
      style={{ color: "#1a5c45", weight: 2.5, opacity: 0.9, fill: false }}
    />
  );
};

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: () => onMapClick() });
  return null;
}

const Map: React.FC = () => {
  const {
    municipalities,
    reserves,
    chocoGeoJson,
    isLoading,
    selectedMunicipality,
    selectedReserve,
    selectedSubregion,
    currentFilter,
    isPanelOpen,
    panelView,
    searchQuery,
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
  } = useMapState();

  const ethnicHeatmap = useEthnicHeatmap(ethnicOverlayEnabled);
  const {
    favorites,
    toggleMunicipality: toggleFavoriteMunicipality,
    toggleReserve: toggleFavoriteReserve,
  } = useFavorites();
  const { coords: geoCoords, status: geoStatus, request: requestLocation } = useGeolocation();
  const geoRequestedRef = useRef(false);

  useMapFlyTo({
    mapRef,
    selectedSubregion,
    panelView,
    municipalities,
    isMobile,
    isPanelOpen,
  });

  // When location becomes available, center map on user (first time only)
  useEffect(() => {
    if (geoCoords && !geoRequestedRef.current && mapRef.current) {
      geoRequestedRef.current = true;
      mapRef.current.flyTo([geoCoords.lat, geoCoords.lng], 10, { duration: 0.8 });
    }
  }, [geoCoords, mapRef]);

  const handleNearMe = () => {
    requestLocation();
    if (panelView !== "home") navigateHome();
  };

  const highlightedSubregion =
    currentFilter === "general" && panelView !== "home" ? selectedSubregion : null;

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden">
      <MapLoadingScreen visible={isLoading} />
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
          attribution='&copy; OpenStreetMap contributors'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          chocoGeoJson={chocoGeoJson as any}
        />

        <MunicipalityBoundaries
          municipalities={municipalities}
          selectedMunicipality={selectedMunicipality}
          highlightedSubregion={highlightedSubregion}
          onMunicipalityClick={(m) => { selectMunicipality(m); }}
          ethnicHeatmap={ethnicOverlayEnabled ? ethnicHeatmap : undefined}
          dimmed={currentFilter === "indigenous"}
        />

        {currentFilter === "indigenous" && (
          <IndigenousReserveBoundaries
            reserves={reserves}
            selectedReserve={selectedReserve}
            onReserveClick={selectReserve}
          />
        )}

        <MunicipalityLabels
          municipalities={municipalities}
          visible={currentFilter !== "indigenous"}
          highlightedSubregion={highlightedSubregion}
        />

        <DerivedChocoOutline municipalities={municipalities} />
        <MapClickHandler onMapClick={handleMapClick} />
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
              selectedSubregion={selectedSubregion}
              panelView={panelView}
              searchQuery={searchQuery}
              isMobile={isMobile}
              onSelectMunicipality={selectMunicipality}
              onSelectReserve={selectReserve}
              onSelectSubregion={selectSubregion}
              onFilterChange={setFilter}
              onSearchChange={setSearchQuery}
              onNavigateHome={navigateHome}
              onNavigateBack={navigateBack}
              onClose={togglePanel}
              favoriteMunicipalitySlugs={favorites.municipalities}
              favoriteReserveIds={favorites.reserves}
              onToggleFavoriteMunicipality={toggleFavoriteMunicipality}
              onToggleFavoriteReserve={toggleFavoriteReserve}
              geoCoords={geoCoords}
              geoStatus={geoStatus}
              onRequestLocation={requestLocation}
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

        {/* Near me FAB */}
        <div
          className="absolute right-4 pointer-events-auto"
          style={{ bottom: isMobile ? 16 : 320, zIndex: 1000 }}
        >
          <NearMeButton status={geoStatus} onClick={handleNearMe} />
        </div>

        {/* Controles del mapa */}
        <MapControls
          mapRef={mapRef}
          onReset={resetAll}
          ethnicOverlayEnabled={ethnicOverlayEnabled}
          onToggleEthnic={toggleEthnicOverlay}
          className="pointer-events-auto"
        />
      </div>
    </div>
  );
};

export default Map;
