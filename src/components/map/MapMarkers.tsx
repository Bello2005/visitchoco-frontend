import React from "react";
import { Circle, Popup } from "react-leaflet";
import type { Municipality } from "../../services/municipality.service";
import EmojiMarker from "./EmojiMarker";

interface MapMarkersProps {
  municipalities: Municipality[];
  visibleMarkers: string[];
  selectedMunicipality: Municipality | null;
  onMarkerClick: (municipality: Municipality) => void;
  onMarkerHover: (municipality: Municipality) => void;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  municipalities,
  visibleMarkers,
  selectedMunicipality,
  onMarkerClick,
  onMarkerHover,
}) => {
  return (
    <>
      {municipalities
        .filter((m) => visibleMarkers.includes(m.name))
        .map((municipality) => (
          <EmojiMarker
            key={`marker-${municipality.id}`}
            position={[municipality.lat, municipality.lon]}
            emoji={municipality.emoji || "📍"}
            eventHandlers={{
              mouseover: () => onMarkerHover(municipality),
              click: () => onMarkerClick(municipality),
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg">
                  {municipality.emoji || "📍"} {municipality.name}
                </h3>
                <p className="text-sm">{municipality.description}</p>
              </div>
            </Popup>
          </EmojiMarker>
        ))}

      {selectedMunicipality && (
        <Circle
          center={[selectedMunicipality.lat, selectedMunicipality.lon]}
          radius={5000}
          pathOptions={{
            color: "#2196F3",
            weight: 2,
            opacity: 0.7,
            fillColor: "#2196F3",
            fillOpacity: 0.1,
          }}
        />
      )}
    </>
  );
};
