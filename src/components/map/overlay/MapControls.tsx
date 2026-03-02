import React from "react";
import { motion } from "framer-motion";
import type { Map as LeafletMapType } from "leaflet";

interface MapControlsProps {
  mapRef: React.RefObject<LeafletMapType | null>;
  onReset: () => void;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  mapRef,
  onReset,
  className = "",
}) => {
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div
      className={`absolute bottom-8 right-4 flex flex-col gap-1.5 ${className}`}
      style={{ zIndex: 1000 }}
    >
      <ControlButton onClick={handleZoomIn} aria-label="Acercar">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
        </svg>
      </ControlButton>

      <ControlButton onClick={handleZoomOut} aria-label="Alejar">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
        </svg>
      </ControlButton>

      <div className="w-full h-px bg-gray-200/60 my-0.5" />

      <ControlButton onClick={onReset} aria-label="Restablecer vista" title="Restablecer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </ControlButton>
    </div>
  );
};

const ControlButton: React.FC<{
  onClick: () => void;
  "aria-label": string;
  title?: string;
  children: React.ReactNode;
}> = ({ onClick, children, ...props }) => (
  <motion.button
    onClick={onClick}
    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:text-teal-700 transition-colors duration-150"
    style={{
      background: "rgba(255,255,255,0.90)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.5)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.92 }}
    {...props}
  >
    {children}
  </motion.button>
);
