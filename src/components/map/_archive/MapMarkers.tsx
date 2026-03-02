import React from "react";
import { Popup } from "react-leaflet";
import type { Municipality } from "../../services/municipality.service";
import EmojiMarker from "./EmojiMarker";

interface MapMarkersProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onMarkerClick: (municipality: Municipality) => void;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  municipalities,
  selectedMunicipality,
  onMarkerClick,
}) => {
  return (
    <>
      {municipalities.map((municipality) => (
        <EmojiMarker
          key={`marker-${municipality.id}`}
          position={[municipality.lat, municipality.lon]}
          emoji={municipality.emoji || "📍"}
          isSelected={selectedMunicipality?.id === municipality.id}
          eventHandlers={{
            click: () => onMarkerClick(municipality),
          }}
        >
          <Popup>
            <div className="text-center px-1">
              <h3 className="font-bold text-base">
                {municipality.emoji || "📍"} {municipality.name}
              </h3>
              {municipality.description && (
                <p className="text-xs text-gray-500 mt-0.5 max-w-[180px]">
                  {municipality.description}
                </p>
              )}
            </div>
          </Popup>
        </EmojiMarker>
      ))}
    </>
  );
};
