import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api.config";
import { resolveMunicipio } from "../data/municipioSlugs";

/**
 * Item del listado público /api/establecimientos.
 * Varios campos son opcionales: el schema de producción aún no los expone
 * (descripcion, whatsapp, sitio_web, rango_precio, horario) — la UI los
 * renderiza solo si llegan.
 */
export interface Establecimiento {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  subcategoria?: string | null;
  descripcion?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  sitio_web?: string | null;
  direccion?: string | null;
  lat?: number | null;
  lng?: number | null;
  rango_precio?: string | null;
  especialidades?: string[] | null;
  horario?: Record<string, string> | null;
  rnt?: string | null;
  municipio_id?: number | null;
  municipio_nombre?: string | null;
  foto_url?: string | null;
  media?: MediaAsset[] | null;
}

export interface MediaAsset {
  id: string;
  url_publica: string;
  alt_text?: string | null;
  es_principal?: boolean;
}

export const PAGE_SIZE = 24;

interface Params {
  municipioSlug?: string;
  categoria?: string;
  q?: string;
  page?: number;
}

interface Result {
  items: Establecimiento[];
  total: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const BASE = API_BASE_URL || "http://localhost:8000";

export function useEstablecimientos({ municipioSlug, categoria, q, page = 0 }: Params): Result {
  const [items, setItems] = useState<Establecimiento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Debounce de 300ms solo para la búsqueda de texto
  const [debouncedQ, setDebouncedQ] = useState(q ?? "");
  const firstQ = useRef(true);
  useEffect(() => {
    if (firstQ.current) {
      firstQ.current = false;
      setDebouncedQ(q ?? "");
      return;
    }
    const t = setTimeout(() => setDebouncedQ(q ?? ""), 300);
    return () => clearTimeout(t);
  }, [q]);

  const municipioId = resolveMunicipio(municipioSlug)?.id;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (municipioId) params.set("municipio_id", String(municipioId));
    if (categoria) params.set("categoria", categoria);
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    fetch(`${BASE}/api/establecimientos?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { items?: Establecimiento[]; total?: number }) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === "number" ? data.total : 0);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setError("No pudimos cargar el directorio.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [municipioId, categoria, debouncedQ, page, tick]);

  return { items, total, loading, error, reload: () => setTick((t) => t + 1) };
}

/** Detalle por slug — /api/establecimientos/slug/:slug */
export function useEstablecimiento(slug: string | undefined) {
  const [negocio, setNegocio] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetch(`${BASE}/api/establecimientos/slug/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Establecimiento | null) => {
        if (data) {
          setNegocio(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setError("No pudimos cargar este negocio.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [slug, tick]);

  return { negocio, loading, notFound, error, reload: () => setTick((t) => t + 1) };
}
