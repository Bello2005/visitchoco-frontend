import L from "leaflet";
import { Marker } from "react-leaflet";
import React from "react";

interface EmojiMarkerProps {
  position: [number, number];
  emoji: string;
  children?: React.ReactNode;
  eventHandlers?: {
    mouseover?: () => void;
    click?: () => void;
  };
}

const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `
      <div style="
        font-size: 1.5rem; 
        background-color: rgba(255, 255, 255, 0.9);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid white;
        transition: transform 0.2s ease;
      "
      class="hover:scale-125"
      >
        ${emoji}
      </div>
    `,
    className: "emoji-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const EmojiMarker: React.FC<EmojiMarkerProps> = ({
  position,
  emoji,
  children,
  eventHandlers,
}) => {
  const icon = createEmojiIcon(emoji);

  return (
    <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
      {children}
    </Marker>
  );
};

export default EmojiMarker;
