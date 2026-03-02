import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import type { FilterCategory } from "../../../types/filters";
import type { PanelView } from "../../../hooks/useMapState";
import { PanelHeader } from "./PanelHeader";
import { SectionNav } from "./SectionNav";
import { FilterChips } from "./FilterChips";
import { ItemList } from "./ItemList";
import { DetailView } from "./DetailView";

interface UnifiedPanelProps {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  currentFilter: FilterCategory;
  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  panelView: PanelView;
  searchQuery: string;
  isMobile: boolean;
  onSelectMunicipality: (m: Municipality) => void;
  onSelectReserve: (r: IndigenousReserve) => void;
  onFilterChange: (f: FilterCategory) => void;
  onSearchChange: (q: string) => void;
  onNavigateToList: () => void;
  onClose: () => void;
  className?: string;
}

const desktopPanelVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const contentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  }),
};

export const UnifiedPanel: React.FC<UnifiedPanelProps> = ({
  municipalities,
  reserves,
  currentFilter,
  selectedMunicipality,
  selectedReserve,
  panelView,
  searchQuery,
  isMobile,
  onSelectMunicipality,
  onSelectReserve,
  onFilterChange,
  onSearchChange,
  onNavigateToList,
  onClose,
  className = "",
}) => {
  // Direction: 1 = forward (list→detail), -1 = backward (detail→list)
  const direction = panelView === "detail" ? 1 : -1;

  if (isMobile) {
    return (
      <MobilePanel
        municipalities={municipalities}
        reserves={reserves}
        currentFilter={currentFilter}
        selectedMunicipality={selectedMunicipality}
        selectedReserve={selectedReserve}
        panelView={panelView}
        searchQuery={searchQuery}
        direction={direction}
        onSelectMunicipality={onSelectMunicipality}
        onSelectReserve={onSelectReserve}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
        onNavigateToList={onNavigateToList}
        onClose={onClose}
        className={className}
      />
    );
  }

  return (
    <motion.div
      className={`absolute top-0 left-0 h-full w-[380px] ${className}`}
      style={{ zIndex: 1400 }}
      variants={desktopPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className="flex flex-col h-full"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(230,230,230,0.5)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        <PanelHeader searchQuery={searchQuery} onSearchChange={onSearchChange} onClose={onClose} />

        <SectionNav />

        <div className="border-t border-gray-100/60" />

        <FilterChips currentFilter={currentFilter} onFilterChange={onFilterChange} />

        {/* Dynamic content area */}
        <AnimatePresence mode="wait" custom={direction}>
          {panelView === "list" ? (
            <motion.div
              key="list"
              className="flex-1 min-h-0 flex flex-col"
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <ItemList
                municipalities={municipalities}
                reserves={reserves}
                currentFilter={currentFilter}
                selectedMunicipality={selectedMunicipality}
                selectedReserve={selectedReserve}
                searchQuery={searchQuery}
                onSelectMunicipality={onSelectMunicipality}
                onSelectReserve={onSelectReserve}
              />
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              className="flex-1 min-h-0 flex flex-col"
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <DetailView
                currentFilter={currentFilter}
                selectedMunicipality={selectedMunicipality}
                selectedReserve={selectedReserve}
                onBack={onNavigateToList}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ── Mobile Bottom Sheet ──────────────────────────────────────────── */

const mobilePanelVariants = {
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

interface MobilePanelProps extends Omit<UnifiedPanelProps, "isMobile"> {
  direction: number;
}

const MobilePanel: React.FC<MobilePanelProps> = ({
  municipalities,
  reserves,
  currentFilter,
  selectedMunicipality,
  selectedReserve,
  panelView,
  searchQuery,
  direction,
  onSelectMunicipality,
  onSelectReserve,
  onFilterChange,
  onSearchChange,
  onNavigateToList,
  onClose,
  className = "",
}) => {
  const height = panelView === "detail" ? "75vh" : "50vh";

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 ${className}`}
      style={{ zIndex: 1600, height }}
      variants={mobilePanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.1, bottom: 0.5 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100 || info.velocity.y > 400) {
          onClose();
        }
      }}
    >
      <div
        className="flex flex-col h-full rounded-t-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
      >
        {/* Drag handle */}
        <div className="flex-none flex justify-center pt-2.5 pb-1">
          <div className="w-8 h-1 rounded-full bg-gray-300" />
        </div>

        <PanelHeader searchQuery={searchQuery} onSearchChange={onSearchChange} onClose={onClose} />

        <SectionNav />

        <div className="border-t border-gray-100/60" />

        <FilterChips currentFilter={currentFilter} onFilterChange={onFilterChange} />

        <AnimatePresence mode="wait" custom={direction}>
          {panelView === "list" ? (
            <motion.div
              key="list"
              className="flex-1 min-h-0 flex flex-col"
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <ItemList
                municipalities={municipalities}
                reserves={reserves}
                currentFilter={currentFilter}
                selectedMunicipality={selectedMunicipality}
                selectedReserve={selectedReserve}
                searchQuery={searchQuery}
                onSelectMunicipality={onSelectMunicipality}
                onSelectReserve={onSelectReserve}
              />
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              className="flex-1 min-h-0 flex flex-col"
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <DetailView
                currentFilter={currentFilter}
                selectedMunicipality={selectedMunicipality}
                selectedReserve={selectedReserve}
                onBack={onNavigateToList}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
