/** Resumen mostrado en columna «Proyecto» del footer */
export const FOOTER_FUENTE_LINEAS = [
  "Ministerio de las Culturas, las Artes y los Saberes",
  "Cámara de Comercio del Chocó",
  "DANE · IGAC · OpenWeather",
] as const;

export type DataSourceEntry = {
  id: string;
  name: string;
  uso: string;
  detalle: string;
  /** Texto de cita literal exigido por la entidad */
  atribucion?: string;
  /** URL de la entidad citada en atribucion; si está presente se renderiza como enlace */
  atribucionUrl?: string;
  /** Referencia del oficio que impone la atribución */
  radicado?: string;
};

/** Fuentes detalladas — página /fuentes */
export const DATA_SOURCES: DataSourceEntry[] = [
  {
    id: "dane",
    name: "DANE",
    uso: "Demografía y estadísticas oficiales",
    detalle:
      "Códigos DANE por municipio, bases para visualizar composición étnica y otros indicadores socioeconómicos cuando la aplicación los incorpora.",
  },
  {
    id: "igac",
    name: "IGAC",
    uso: "Límites y cartografía",
    detalle:
      "Referencia para límites municipales y capas territoriales que contextualizan el mapa interactivo del departamento.",
  },
  {
    id: "openweather",
    name: "OpenWeather",
    uso: "Clima en tiempo real",
    detalle:
      "Datos meteorológicos asociados a la visualización por municipio en el mapa, como apoyo a visitantes y ciudadanía.",
  },
  {
    id: "minculturas",
    name: "Ministerio de las Culturas, las Artes y los Saberes",
    uso: "Patrimonio cultural inmaterial",
    detalle:
      "Planes Especiales de Salvaguardia (PES) de las tres manifestaciones " +
      "chocoanas inscritas en la Lista Representativa de Patrimonio Cultural " +
      "Inmaterial del ámbito nacional: Gualíes, alabaos y levantamientos de " +
      "tumba del Medio San Juan; Saberes asociados a la partería afro del " +
      "Pacífico; y Fiestas de San Francisco de Asís (San Pacho) en Quibdó. " +
      "Documentos remitidos por el Grupo de Patrimonio Cultural Inmaterial. " +
      "Los Bienes de Interés Cultural del ámbito nacional se consultan en el " +
      "portal público SIPA.",
    atribucion: "Tomada de www.mincultura.gov.co",
    atribucionUrl: "https://www.mincultura.gov.co",
    radicado: "Radicado MC44124E2025 · Respuesta del 6 de octubre de 2025",
  },
  {
    id: "camcomercio",
    name: "Cámara de Comercio del Chocó",
    uso: "Tejido productivo y turismo",
    detalle:
      "Contexto sobre prestadores, registro y dinámica empresarial del departamento cuando se enlaza con oferta turística.",
  },
];
