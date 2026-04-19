import { useCallback, useEffect, useState } from "react";

interface UseSearchNavigationOpts {
  isActive: boolean;
  totalItems: number;
  onEnter: (index: number) => void;
  onEscape: () => void;
}

export function useSearchNavigation({
  isActive,
  totalItems,
  onEnter,
  onEscape,
}: UseSearchNavigationOpts) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset to top whenever search becomes active or item count changes
  useEffect(() => {
    setActiveIndex(0);
  }, [isActive, totalItems]);

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, totalItems - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (totalItems > 0) onEnter(activeIndex);
          break;
        case "Escape":
          e.preventDefault();
          onEscape();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, totalItems, activeIndex]);

  const handleSetActiveIndex = useCallback((i: number) => setActiveIndex(i), []);

  return { activeIndex, setActiveIndex: handleSetActiveIndex };
}
