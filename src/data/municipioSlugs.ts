/**
 * Mapa slug → { id, nombre } de los 31 municipios.
 * Los ids son los reales de la tabla `municipalities` (DB de producción).
 * DEF-02: las variantes con acento llegan URL-encoded desde deep-links
 * ("acandí" → "acand%C3%AD"); resolveMunicipioSlug() normaliza cualquier forma.
 */

export interface MunicipioRef {
  id: number;
  nombre: string;
  slug: string;
}

export const MUNICIPIOS: MunicipioRef[] = [
  { id: 5,  nombre: "Acandí",                  slug: "acandi" },
  { id: 24, nombre: "Alto Baudó",              slug: "alto-baudo" },
  { id: 27, nombre: "Atrato",                  slug: "atrato" },
  { id: 19, nombre: "Bagadó",                  slug: "bagado" },
  { id: 1,  nombre: "Bahía Solano",            slug: "bahia-solano" },
  { id: 18, nombre: "Bajo Baudó",              slug: "bajo-baudo" },
  { id: 2,  nombre: "Bojayá",                  slug: "bojaya" },
  { id: 17, nombre: "Cantón de San Pablo",     slug: "canton-de-san-pablo" },
  { id: 28, nombre: "Carmen del Darién",       slug: "carmen-del-darien" },
  { id: 16, nombre: "Cértegui",                slug: "certegui" },
  { id: 29, nombre: "Condoto",                 slug: "condoto" },
  { id: 23, nombre: "El Carmen de Atrato",     slug: "el-carmen-de-atrato" },
  { id: 7,  nombre: "El Litoral del San Juan", slug: "el-litoral-del-san-juan" },
  { id: 12, nombre: "Istmina",                 slug: "istmina" },
  { id: 3,  nombre: "Juradó",                  slug: "jurado" },
  { id: 21, nombre: "Lloró",                   slug: "lloro" },
  { id: 25, nombre: "Medio Atrato",            slug: "medio-atrato" },
  { id: 13, nombre: "Medio Baudó",             slug: "medio-baudo" },
  { id: 30, nombre: "Medio San Juan",          slug: "medio-san-juan" },
  { id: 36, nombre: "Nuevo Belén de Bajirá",   slug: "nuevo-belen-de-bajira" },
  { id: 9,  nombre: "Nóvita",                  slug: "novita" },
  { id: 22, nombre: "Nuquí",                   slug: "nuqui" },
  { id: 6,  nombre: "Quibdó",                  slug: "quibdo" },
  { id: 11, nombre: "Río Iró",                 slug: "rio-iro" },
  { id: 20, nombre: "Rio Quito",               slug: "rio-quito" },
  { id: 26, nombre: "Riosucio",                slug: "riosucio" },
  { id: 10, nombre: "San José del Palmar",     slug: "san-jose-del-palmar" },
  { id: 8,  nombre: "Sipí",                    slug: "sipi" },
  { id: 15, nombre: "Tadó",                    slug: "tado" },
  { id: 4,  nombre: "Unguía",                  slug: "unguia" },
  { id: 14, nombre: "Unión Panamericana",      slug: "union-panamericana" },
];

/** "Bahía Solano", "bahia%20solano", "bahía-solano" → "bahia-solano" */
export function normalizeMunicipioSlug(raw: string): string {
  let s = raw;
  try {
    s = decodeURIComponent(raw);
  } catch {
    /* raw ya venía decodificado o malformado — se usa tal cual */
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveMunicipio(raw: string | null | undefined): MunicipioRef | undefined {
  if (!raw) return undefined;
  const slug = normalizeMunicipioSlug(raw);
  return MUNICIPIOS.find((m) => m.slug === slug);
}

export function municipioById(id: number | null | undefined): MunicipioRef | undefined {
  if (id == null) return undefined;
  return MUNICIPIOS.find((m) => m.id === id);
}
