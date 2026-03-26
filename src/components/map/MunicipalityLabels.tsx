import { useEffect, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { Municipality } from "../../services/municipality.service";

interface MunicipalityLabelsProps {
  municipalities: Municipality[];
}

const LABEL_ZOOM_THRESHOLD = 9;

export const MunicipalityLabels: React.FC<MunicipalityLabelsProps> = ({ municipalities }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [labelsLayer] = useState(() => L.layerGroup());

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  useEffect(() => {
    labelsLayer.addTo(map);
    return () => {
      labelsLayer.removeFrom(map);
    };
  }, [labelsLayer, map]);

  useEffect(() => {
    const isVisible = zoom >= LABEL_ZOOM_THRESHOLD;
    labelsLayer.clearLayers();

    municipalities.forEach((m) => {
      const icon = L.divIcon({
        html: `<div style="
          transform:translate(-50%, -50%);
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:2px 6px;
          border-radius:999px;
          background:rgba(255,255,255,0.85);
          backdrop-filter:blur(4px);
          color:#1a3a22;
          font-size:11px;
          font-weight:600;
          max-width:90px;
          text-align:center;
          white-space:normal;
          line-height:1.2;
          box-shadow:0 1px 4px rgba(0,0,0,0.14);
          opacity:${isVisible ? 1 : 0};
          transition:opacity 0.25s ease;
        ">${m.name}</div>`,
        className: "municipality-label-icon",
      });

      const marker = L.marker([m.lat, m.lon], {
        icon,
        interactive: false,
        keyboard: false,
      });

      labelsLayer.addLayer(marker);
    });
  }, [labelsLayer, municipalities, zoom]);

  return null;
};
