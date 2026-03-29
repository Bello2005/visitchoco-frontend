import React from "react";
import { motion } from "framer-motion";
import type { Map as LeafletMapType } from "leaflet";

interface MapControlsProps {
  mapRef: React.RefObject<LeafletMapType | null>;
  onReset: () => void;
  ethnicOverlayEnabled: boolean;
  onToggleEthnic: () => void;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  mapRef,
  onReset,
  ethnicOverlayEnabled,
  onToggleEthnic,
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

      <ControlButton
        onClick={onToggleEthnic}
        aria-label="Distribución étnica"
        title="Distribución étnica"
        active={ethnicOverlayEnabled}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m8-4a4 4 0 11-8 0 4 4 0 018 0M6 8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      </ControlButton>

      {ethnicOverlayEnabled && (
        <div className="w-10 mt-1 space-y-0.5">
          {[
            { label: "Afro", color: "#D97706" },
            { label: "Indíg.", color: "#059669" },
            { label: "Mestizo", color: "#4F46E5" },
            { label: "Otro", color: "#94A3B8" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[9px] text-gray-500 truncate">{label}</span>
            </div>
          ))}
        </div>
      )}

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
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, active = false, children, ...props }) => (
  <motion.button
    onClick={onClick}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150 ${
      active
        ? "text-teal-600 border border-teal-300"
        : "text-gray-600 hover:text-teal-700 border border-transparent"
    }`}
    style={{
      background: active ? "rgba(20,184,166,0.10)" : "rgba(255,255,255,0.90)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderColor: active ? undefined : "rgba(255,255,255,0.5)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.92 }}
    {...props}
  >
    {children}
  </motion.button>
);
