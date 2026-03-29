/** Resumen mostrado en columna «Proyecto» del footer */
export const FOOTER_FUENTE_LINEAS = [
  "Ministerio de Culturas",
  "Cámara de Comercio del Chocó",
  "DANE · IGAC · OpenWeather",
] as const;

export type DataSourceEntry = {
  id: string;
  name: string;
  uso: string;
  detalle: string;
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
    name: "Ministerio de Culturas",
    uso: "Patrimonio y cultura",
    detalle:
      "Marco institucional y referencias al patrimonio cultural inmaterial y políticas culturales que enriquecen la narrativa del territorio.",
  },
  {
    id: "camcomercio",
    name: "Cámara de Comercio del Chocó",
    uso: "Tejido productivo y turismo",
    detalle:
      "Contexto sobre prestadores, registro y dinámica empresarial del departamento cuando se enlaza con oferta turística.",
  },
];
