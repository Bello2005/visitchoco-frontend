import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import type { Municipality } from "../../services/municipality.service";

interface ClusteredMarkersProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onMarkerClick: (municipality: Municipality) => void;
}

const DOT_SIZE = 10;
const DOT_SELECTED_SIZE = 16;

function createDotIcon(isSelected: boolean): L.DivIcon {
  const size = isSelected ? DOT_SELECTED_SIZE : DOT_SIZE;
  const bg = isSelected ? "#0F766E" : "#0D9488";
  const border = isSelected ? "#0D9488" : "#ffffff";
  const borderW = isSelected ? 3 : 2;
  const shadow = isSelected
    ? "0 0 0 4px rgba(13,148,136,0.18), 0 2px 6px rgba(0,0,0,0.15)"
    : "0 1px 4px rgba(0,0,0,0.18)";

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};border:${borderW}px solid ${border};
      border-radius:50%;box-shadow:${shadow};
      transition:all 0.2s ease;
    "></div>`,
    className: "clustered-dot-marker",
    iconSize: [size + borderW * 2, size + borderW * 2],
    iconAnchor: [(size + borderW * 2) / 2, (size + borderW * 2) / 2],
    popupAnchor: [0, -(size / 2 + borderW)],
  });
}

function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 32 : count < 20 ? 38 : 44;

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:#0D9488;
      border:2px solid #ffffff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:#ffffff;font-weight:700;font-size:13px;
      box-shadow:0 2px 6px rgba(0,0,0,0.2);
    ">${count}</div>`,
    className: "clustered-group-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const ClusteredMarkers: React.FC<ClusteredMarkersProps> = ({
  municipalities,
  selectedMunicipality,
  onMarkerClick,
}) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize cluster group once
  useEffect(() => {
    const group = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: false,
      disableClusteringAtZoom: 12,
      iconCreateFunction: createClusterIcon,
    });
    clusterGroupRef.current = group;
    map.addLayer(group);

    return () => {
      map.removeLayer(group);
      clusterGroupRef.current = null;
    };
  }, [map]);

  // Sync markers with municipalities data
  useEffect(() => {
    const group = clusterGroupRef.current;
    if (!group) return;

    group.clearLayers();
    const newMarkersMap = new Map<number, L.Marker>();

    municipalities.forEach((m) => {
      const isSelected = selectedMunicipality?.id === m.id;
      const marker = L.marker([m.lat, m.lon], {
        icon: createDotIcon(isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      marker.bindPopup(
        `<div class="text-center px-1">
          <p class="font-semibold text-sm">${m.emoji || "📍"} ${m.name}</p>
          ${m.description ? `<p class="text-xs text-gray-500 mt-0.5">${m.description}</p>` : ""}
        </div>`,
        { maxWidth: 200, className: "clean-popup" }
      );

      marker.on("click", () => onMarkerClick(m));
      newMarkersMap.set(m.id, marker);
      group.addLayer(marker);
    });

    markersMapRef.current = newMarkersMap;
  }, [municipalities, selectedMunicipality, onMarkerClick]);

  return null;
};
