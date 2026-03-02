import L from "leaflet";
import { Marker } from "react-leaflet";
import React from "react";

interface EmojiMarkerProps {
  position: [number, number];
  emoji: string;
  isSelected?: boolean;
  children?: React.ReactNode;
  eventHandlers?: {
    mouseover?: () => void;
    click?: () => void;
  };
}

const createEmojiIcon = (emoji: string, isSelected: boolean) => {
  const size = isSelected ? 44 : 32;
  const border = isSelected ? "3px solid #0D9488" : "2px solid white";
  const shadow = isSelected
    ? "0 4px 12px rgba(13,148,136,0.4)"
    : "0 2px 4px rgba(0,0,0,0.2)";
  const ring = isSelected
    ? `<div style="
        position:absolute;inset:-6px;border-radius:50%;
        border:2px solid rgba(13,148,136,0.4);
        animation:ping 2.5s cubic-bezier(0,0,0.2,1) infinite;
      "></div>`
    : "";

  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${ring}
        <div style="
          font-size:${isSelected ? "1.4rem" : "1.1rem"};
          background-color:rgba(255,255,255,0.95);
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:${shadow};
          border:${border};
          transition:transform 0.2s ease;
          position:relative;
        ">
          ${emoji}
        </div>
      </div>
    `,
    className: "emoji-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
};

const EmojiMarker: React.FC<EmojiMarkerProps> = ({
  position,
  emoji,
  isSelected = false,
  children,
  eventHandlers,
}) => {
  const icon = createEmojiIcon(emoji, isSelected);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={eventHandlers}
      zIndexOffset={isSelected ? 1000 : 0}
    >
      {children}
    </Marker>
  );
};

export default EmojiMarker;
