import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import type { FilterCategory } from "../../../types/filters";
import { MunicipalityDetail } from "../detail/MunicipalityDetail";
import { ReserveDetail } from "../detail/ReserveDetail";
import { EthnicDetail } from "../detail/EthnicDetail";

interface DetailSheetProps {
  currentFilter: FilterCategory;
  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  isMobile: boolean;
  onClose: () => void;
  className?: string;
}

const desktopVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 32, mass: 0.9 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

const mobileVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 30 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const DetailSheet: React.FC<DetailSheetProps> = ({
  currentFilter,
  selectedMunicipality,
  selectedReserve,
  isMobile,
  onClose,
  className = "",
}) => {
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [0, 200], [1, 0.5]);
  const sheetRef = useRef<HTMLDivElement>(null);

  const renderContent = () => {
    if (currentFilter === "ethnic") {
      return (
        <EthnicDetail
          codDane={selectedMunicipality?.cod_dane}
          municipalityName={selectedMunicipality?.name}
        />
      );
    }
    if (currentFilter === "indigenous" && selectedReserve) {
      return <ReserveDetail reserve={selectedReserve} />;
    }
    if (selectedMunicipality) {
      return <MunicipalityDetail municipality={selectedMunicipality} />;
    }
    return null;
  };

  const content = renderContent();
  if (!content) return null;

  if (isMobile) {
    return (
      <motion.div
        className={`fixed bottom-0 left-0 right-0 ${className}`}
        style={{ zIndex: 1600, height: "65vh", y: dragY, opacity }}
        variants={mobileVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        ref={sheetRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.1, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 400) {
            onClose();
          } else {
            dragY.set(0);
          }
        }}
      >
        <div
          className="flex flex-col h-full rounded-t-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.14)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          {/* Drag handle */}
          <div className="flex-none flex flex-col items-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-gray-300" />
          </div>
          {/* Close button */}
          <div className="absolute top-3 right-4">
            <CloseButton onClose={onClose} />
          </div>
          <div className="flex-1 overflow-hidden">{content}</div>
        </div>
      </motion.div>
    );
  }

  // Desktop: right panel
  return (
    <motion.div
      className={`absolute top-0 right-0 h-full w-[380px] ${className}`}
      style={{ zIndex: 1600 }}
      variants={desktopVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className="flex flex-col h-full relative"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <CloseButton onClose={onClose} />
        </div>
        <div className="flex-1 overflow-hidden">{content}</div>
      </div>
    </motion.div>
  );
};

const CloseButton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.button
    onClick={onClose}
    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors duration-150"
    whileTap={{ scale: 0.9 }}
    aria-label="Cerrar panel"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </motion.button>
);
