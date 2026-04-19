import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import type { FilterCategory } from "../../../types/filters";
import type { PanelView } from "../../../hooks/useMapState";
import type { SubregionKey } from "../../../utils/subregionFromMunicipio";
import type { GeoCoords, GeoStatus } from "../../../hooks/useGeolocation";
import { SUBREGION_META } from "../../../utils/subregionData";
import { PanelHeader } from "./PanelHeader";
import { SectionNav } from "./SectionNav";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem } from "./Breadcrumb";
import { HomeView } from "./HomeView";
import { SubregionView } from "./SubregionView";
import { DetailView } from "./DetailView";
import { SearchResultsPanel } from "./SearchResultsPanel";

interface UnifiedPanelProps {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  currentFilter: FilterCategory;
  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  selectedSubregion: SubregionKey | null;
  panelView: PanelView;
  searchQuery: string;
  isMobile: boolean;
  onSelectMunicipality: (m: Municipality) => void;
  onSelectReserve: (r: IndigenousReserve) => void;
  onSelectSubregion: (key: SubregionKey) => void;
  onFilterChange: (f: FilterCategory) => void;
  onSearchChange: (q: string) => void;
  onNavigateHome: () => void;
  onNavigateBack: () => void;
  onClose: () => void;
  favoriteMunicipalitySlugs: string[];
  favoriteReserveIds: string[];
  onToggleFavoriteMunicipality: (slug: string) => void;
  onToggleFavoriteReserve: (id: string) => void;
  geoCoords: GeoCoords | null;
  geoStatus: GeoStatus;
  onRequestLocation: () => void;
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
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  }),
};

const VIEW_DEPTH: Record<PanelView, number> = {
  home: 0,
  subregion: 1,
  detail: 2,
};

export const UnifiedPanel: React.FC<UnifiedPanelProps> = (props) => {
  const [prevDepth, setPrevDepth] = useState(VIEW_DEPTH[props.panelView]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentDepth = VIEW_DEPTH[props.panelView];
  const direction = currentDepth >= prevDepth ? 1 : -1;

  useEffect(() => {
    setPrevDepth(currentDepth);
  }, [currentDepth]);

  // ⌘K / Ctrl+K — focus inline input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    setIsSearchActive(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => {
      if (!props.searchQuery) setIsSearchActive(false);
    }, 150);
  }, [props.searchQuery]);

  // Called when a result is selected or Escape pressed
  const closeSearch = useCallback(() => {
    props.onSearchChange("");
    setIsSearchActive(false);
  }, [props.onSearchChange]);

  // The X button in PanelHeader: if search active → close search; else → close panel
  const handleHeaderClose = useCallback(() => {
    if (isSearchActive) {
      closeSearch();
    } else {
      props.onClose();
    }
  }, [isSearchActive, closeSearch, props.onClose]);

  const sharedProps = {
    ...props,
    direction,
    isSearchActive,
    searchInputRef,
    onSearchFocus: handleSearchFocus,
    onSearchBlur: handleSearchBlur,
    onSearchClose: closeSearch,
    onHeaderClose: handleHeaderClose,
  };

  return props.isMobile
    ? <MobilePanel {...sharedProps} />
    : <DesktopPanel {...sharedProps} />;
};

/* ═════════════════════════════════════════════════════════════════
   BREADCRUMB BUILDER
   ═════════════════════════════════════════════════════════════════ */

function buildBreadcrumb(props: UnifiedPanelProps): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Inicio", icon: "home", onClick: props.onNavigateHome, current: props.panelView === "home" },
  ];
  if (props.panelView === "subregion" && props.selectedSubregion) {
    items.push({ label: SUBREGION_META[props.selectedSubregion].label, current: true });
  }
  if (props.panelView === "detail") {
    if (props.selectedSubregion && props.currentFilter !== "indigenous") {
      items.push({ label: SUBREGION_META[props.selectedSubregion].label, onClick: props.onNavigateBack });
    }
    if (props.selectedMunicipality) {
      items.push({ label: props.selectedMunicipality.name, current: true });
    } else if (props.selectedReserve) {
      items.push({ label: props.selectedReserve.name, current: true });
    }
  }
  return items;
}

/* ═════════════════════════════════════════════════════════════════
   SHARED PANEL PROPS
   ═════════════════════════════════════════════════════════════════ */

interface PanelInternalProps extends UnifiedPanelProps {
  direction: number;
  isSearchActive: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onSearchClose: () => void;
  onHeaderClose: () => void;
}

/* ═════════════════════════════════════════════════════════════════
   CONTENT AREA — normal views OR inline search results
   ═════════════════════════════════════════════════════════════════ */

const ContentArea: React.FC<PanelInternalProps> = (props) => {
  if (props.isSearchActive) {
    return (
      <SearchResultsPanel
        query={props.searchQuery}
        municipalities={props.municipalities}
        onSelectMunicipality={(m) => { props.onSelectMunicipality(m); props.onSearchClose(); }}
        onSelectSubregion={(k) => { props.onSelectSubregion(k); props.onSearchClose(); }}
        onClose={props.onSearchClose}
      />
    );
  }

  return (
    <AnimatePresence mode="wait" custom={props.direction} initial={false}>
      {props.panelView === "home" && (
        <motion.div
          key="home"
          className="flex-1 min-h-0 flex flex-col"
          custom={props.direction}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <HomeView
            municipalities={props.municipalities}
            reserves={props.reserves}
            currentFilter={props.currentFilter}
            searchQuery={props.searchQuery}
            selectedReserve={props.selectedReserve}
            onSelectSubregion={props.onSelectSubregion}
            onSelectMunicipality={props.onSelectMunicipality}
            onSelectReserve={props.onSelectReserve}
            onFilterChange={props.onFilterChange}
            favoriteMunicipalitySlugs={props.favoriteMunicipalitySlugs}
            favoriteReserveIds={props.favoriteReserveIds}
            onToggleFavoriteMunicipality={props.onToggleFavoriteMunicipality}
            onToggleFavoriteReserve={props.onToggleFavoriteReserve}
            geoCoords={props.geoCoords}
            geoStatus={props.geoStatus}
            onRequestLocation={props.onRequestLocation}
          />
        </motion.div>
      )}
      {props.panelView === "subregion" && props.selectedSubregion && (
        <motion.div
          key={`subregion-${props.selectedSubregion}`}
          className="flex-1 min-h-0 flex flex-col"
          custom={props.direction}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <SubregionView
            subregionKey={props.selectedSubregion}
            municipalities={props.municipalities}
            selectedMunicipality={props.selectedMunicipality}
            searchQuery={props.searchQuery}
            favoriteMunicipalitySlugs={props.favoriteMunicipalitySlugs}
            onSelectMunicipality={props.onSelectMunicipality}
            onToggleFavoriteMunicipality={props.onToggleFavoriteMunicipality}
          />
        </motion.div>
      )}
      {props.panelView === "detail" && (
        <motion.div
          key="detail"
          className="flex-1 min-h-0 flex flex-col"
          custom={props.direction}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <DetailView
            currentFilter={props.currentFilter}
            selectedMunicipality={props.selectedMunicipality}
            selectedReserve={props.selectedReserve}
            onBack={props.onNavigateBack}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═════════════════════════════════════════════════════════════════
   DESKTOP PANEL
   ═════════════════════════════════════════════════════════════════ */

const DesktopPanel: React.FC<PanelInternalProps> = (props) => {
  const crumbs = buildBreadcrumb(props);
  const showBreadcrumb = props.panelView !== "home" && !props.isSearchActive;

  return (
    <motion.div
      className={`absolute top-0 left-0 h-full w-[380px] ${props.className ?? ""}`}
      style={{ zIndex: 1400 }}
      variants={desktopPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className="flex flex-col h-full"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderRight: "1px solid rgba(230,230,230,0.5)",
          boxShadow: "4px 0 30px rgba(0,0,0,0.06)",
        }}
      >
        <PanelHeader
          searchQuery={props.searchQuery}
          onSearchChange={props.onSearchChange}
          onSearchFocus={props.onSearchFocus}
          onSearchBlur={props.onSearchBlur}
          onClose={props.onHeaderClose}
          inputRef={props.searchInputRef}
          isSearchActive={props.isSearchActive}
        />

        {!props.isSearchActive && <SectionNav />}
        {!props.isSearchActive && <div className="border-t border-gray-100/60" />}

        {showBreadcrumb && (
          <div className="flex-none px-4 pt-2 pb-2">
            <Breadcrumb items={crumbs} />
          </div>
        )}

        <ContentArea {...props} />
      </div>
    </motion.div>
  );
};

/* ═════════════════════════════════════════════════════════════════
   MOBILE BOTTOM SHEET — 3 SNAP POINTS
   ═════════════════════════════════════════════════════════════════ */

type SnapIdx = 0 | 1 | 2;

const mobilePanelEntry = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 32 } },
  exit: { y: "100%", transition: { duration: 0.2 } },
};

const MobilePanel: React.FC<PanelInternalProps> = (props) => {
  const crumbs = buildBreadcrumb(props);
  const showBreadcrumb = props.panelView !== "home" && !props.isSearchActive;

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportH, setViewportH] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fullH = Math.round(viewportH * 0.92);
  const halfH = Math.round(viewportH * 0.5);
  const peekH = 128;

  const snapOffsets = useMemo(() => {
    const full = 0;
    const half = fullH - halfH;
    const peek = fullH - peekH;
    return [peek, half, full];
  }, [fullH, halfH]);

  const initialSnap: SnapIdx = props.panelView === "home" ? 1 : 2;
  const [snapIdx, setSnapIdx] = useState<SnapIdx>(initialSnap);
  const y = useMotionValue(snapOffsets[initialSnap]);

  useEffect(() => {
    const target: SnapIdx = props.panelView === "home" ? 1 : 2;
    setSnapIdx(target);
    animate(y, snapOffsets[target], { type: "spring", stiffness: 300, damping: 32 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.panelView]);

  useEffect(() => {
    animate(y, snapOffsets[snapIdx], { duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapOffsets]);

  const snapTo = useCallback((idx: SnapIdx) => {
    setSnapIdx(idx);
    animate(y, snapOffsets[idx], { type: "spring", stiffness: 320, damping: 34 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapOffsets]);

  // Search active → snap to full
  useEffect(() => {
    if (props.isSearchActive) snapTo(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isSearchActive]);

  const handleDragEnd = (velocityY: number) => {
    const currentY = y.get();
    const sorted = snapOffsets
      .map((val, i) => ({ val, i: i as SnapIdx, dist: Math.abs(val - currentY) }))
      .sort((a, b) => a.dist - b.dist);
    let next = sorted[0].i;
    if (Math.abs(velocityY) > 500) {
      if (velocityY < 0) next = (Math.min(snapIdx + 1, 2) as SnapIdx);
      else next = (Math.max(snapIdx - 1, 0) as SnapIdx);
    }
    snapTo(next);
    if (currentY > snapOffsets[0] + 120 && velocityY > 400) {
      props.onClose();
    }
  };

  const handleCycle = () => {
    const next = ((snapIdx + 1) % 3) as SnapIdx;
    snapTo(next);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`fixed left-0 right-0 ${props.className ?? ""}`}
      style={{ zIndex: 1600, height: fullH, bottom: 0, y, touchAction: "none" }}
      variants={mobilePanelEntry}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="flex flex-col h-full rounded-t-[22px] overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(255,255,255,0.5)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => handleDragEnd(info.velocity.y)}
      >
        <button
          onClick={handleCycle}
          className="flex-none flex justify-center pt-2.5 pb-1 cursor-pointer"
          aria-label="Cambiar tamaño del panel"
        >
          <span className="w-9 h-1 rounded-full bg-gray-300" />
        </button>

        <PanelHeader
          searchQuery={props.searchQuery}
          onSearchChange={props.onSearchChange}
          onSearchFocus={props.onSearchFocus}
          onSearchBlur={props.onSearchBlur}
          onClose={props.onHeaderClose}
          inputRef={props.searchInputRef}
          isSearchActive={props.isSearchActive}
        />

        {!props.isSearchActive && <SectionNav />}
        {!props.isSearchActive && <div className="border-t border-gray-100/60" />}

        {showBreadcrumb && (
          <div className="flex-none px-4 pt-2 pb-2">
            <Breadcrumb items={crumbs} />
          </div>
        )}

        <ContentArea {...props} />
      </motion.div>
    </motion.div>
  );
};
