import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "visitchoco.favorites.v1";

export interface FavoritesData {
  municipalities: string[];
  reserves: string[];
}

const EMPTY: FavoritesData = { municipalities: [], reserves: [] };

function read(): FavoritesData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      municipalities: Array.isArray(parsed?.municipalities) ? parsed.municipalities : [],
      reserves: Array.isArray(parsed?.reserves) ? parsed.reserves : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(data: FavoritesData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or unavailable — ignore
  }
}

export function useFavorites() {
  const [data, setData] = useState<FavoritesData>(() => read());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(read());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleMunicipality = useCallback((slug: string) => {
    setData((prev) => {
      const exists = prev.municipalities.includes(slug);
      const next = {
        ...prev,
        municipalities: exists
          ? prev.municipalities.filter((s) => s !== slug)
          : [...prev.municipalities, slug],
      };
      write(next);
      return next;
    });
  }, []);

  const toggleReserve = useCallback((id: string) => {
    setData((prev) => {
      const exists = prev.reserves.includes(id);
      const next = {
        ...prev,
        reserves: exists ? prev.reserves.filter((s) => s !== id) : [...prev.reserves, id],
      };
      write(next);
      return next;
    });
  }, []);

  const isMunicipalityFavorite = useCallback(
    (slug: string) => data.municipalities.includes(slug),
    [data.municipalities]
  );
  const isReserveFavorite = useCallback(
    (id: string) => data.reserves.includes(id),
    [data.reserves]
  );

  const total = data.municipalities.length + data.reserves.length;

  return {
    favorites: data,
    total,
    toggleMunicipality,
    toggleReserve,
    isMunicipalityFavorite,
    isReserveFavorite,
  };
}
