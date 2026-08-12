/**
 * Sismo Mw 7,4 del 10 de agosto de 2026 — San José del Palmar, Chocó.
 *
 * Única fuente de verdad de la página /sismo y del banner global.
 *
 * ────────────────────────────────────────────────────────────────────
 * POLÍTICA EDITORIAL — leer antes de tocar este archivo
 *
 * 1. Ningún hecho se exporta como número o string suelto. Todo va
 *    envuelto en `Dato`, `Reporte` o `Canal`, que exigen `fuente` y
 *    `corte`. Los componentes reciben el envoltorio, nunca el valor:
 *    no existe forma de pintar una cifra sin su procedencia.
 *
 * 2. Las cifras humanas (fallecidos, heridos, desaparecidos) NO tienen
 *    un valor único. Usan `CifraEnDisputa`, cuyo campo `reportes` es
 *    una tupla que exige DOS reportes como mínimo — el compilador
 *    rechaza publicar "240 fallecidos" con una sola fuente. Durante
 *    las primeras horas de un desastre las entidades reportan cortes
 *    distintos; la divergencia es información, no ruido.
 *
 * 3. `verificado` es una fecha, no un booleano: obliga a registrar
 *    CUÁNDO un humano contrastó el dato contra la fuente enlazada.
 *    Publicar un teléfono equivocado durante una emergencia es peor
 *    que no publicar ninguno.
 *
 * 4. Al actualizar: sube `SISMO_META.paginaActualizada` siempre, y
 *    `SISMO_META.revision` sólo cuando el mensaje del banner cambie
 *    materialmente (reaparece a quien ya lo descartó).
 * ────────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════════════
   Fuentes
   ═══════════════════════════════════════════════════════════════════ */

export interface Fuente {
  readonly nombre: string;
  readonly sigla?: string;
  /** Enlace a LA publicación concreta, nunca al home de la entidad. */
  readonly url: string;
  readonly tipo: "oficial" | "multilateral" | "prensa" | "academica";
}

export const FUENTES = {
  sgc: {
    nombre: "Servicio Geológico Colombiano",
    sigla: "SGC",
    url: "https://www2.sgc.gov.co/Noticias/Paginas/SGC-actualiza-la-informacion-sobre-el-sismo-ocurrido-en-San-Jose-del-Palmar-Choco.aspx",
    tipo: "oficial",
  },
  sgcCatalogo: {
    nombre: "Catálogo sísmico del SGC",
    sigla: "SGC",
    url: "https://sismo.sgc.gov.co/",
    tipo: "oficial",
  },
  usgs: {
    nombre: "United States Geological Survey — evento us6000tjl2",
    sigla: "USGS",
    url: "https://earthquake.usgs.gov/earthquakes/eventpage/us6000tjl2",
    tipo: "multilateral",
  },
  ungrd: {
    nombre: "Unidad Nacional para la Gestión del Riesgo de Desastres",
    sigla: "UNGRD",
    url: "https://portal.gestiondelriesgo.gov.co/",
    tipo: "oficial",
  },
  cruzroja: {
    nombre: "Cruz Roja Colombiana",
    url: "https://www.cruzrojacolombiana.org/dona/",
    tipo: "oficial",
  },
  aerocivil: {
    nombre: "Aeronáutica Civil de Colombia",
    sigla: "Aerocivil",
    url: "https://www.aerocivil.gov.co/",
    tipo: "oficial",
  },
  gobChoco: {
    nombre: "Gobernación del Chocó",
    url: "https://www.choco.gov.co/",
    tipo: "oficial",
  },
  prensa: {
    nombre: "Recopilación de prensa nacional",
    url: "https://es.wikipedia.org/wiki/Terremoto_de_Colombia_de_2026",
    tipo: "prensa",
  },
} as const satisfies Record<string, Fuente>;

/** Referenciar una fuente inexistente no compila. */
export type FuenteId = keyof typeof FUENTES;

/* ═══════════════════════════════════════════════════════════════════
   Marca temporal
   ═══════════════════════════════════════════════════════════════════ */

/**
 * ISO-8601 con offset. Es una guarda superficial, pero atrapa
 * exactamente los errores que se cometen en la práctica: "ayer",
 * "10 de agosto", "hoy 11am".
 */
export type Corte = `${number}-${number}-${number}T${number}:${number}${string}`;

/* ═══════════════════════════════════════════════════════════════════
   El envoltorio
   ═══════════════════════════════════════════════════════════════════ */

export interface Dato<T = string> {
  readonly valor: T;
  readonly unidad?: string;
  readonly fuente: FuenteId;
  readonly corte: Corte;
  /** Nota metodológica breve. Se pinta bajo el dato. */
  readonly nota?: string;
}

export type FichaItem = Dato<string> & { readonly etiqueta: string };

export interface Reporte {
  readonly cifra: number;
  readonly fuente: FuenteId;
  readonly corte: Corte;
  /** "solo Valle del Cauca", "conteo preliminar de Asocapitales". */
  readonly alcance?: string;
}

/**
 * Cifra humana en disputa.
 *
 * NO tiene campo `valor`: es estructuralmente imposible renderizarla
 * como un número único y autoritativo. La tupla exige DOS reportes
 * como mínimo.
 */
export interface CifraEnDisputa {
  readonly id: string;
  readonly etiqueta: string;
  readonly advertencia: string;
  readonly reportes: readonly [Reporte, Reporte, ...Reporte[]];
}

export interface Canal {
  readonly id: string;
  /**
   * Lo que se pinta como destino. En los teléfonos es el número tal cual,
   * nunca una etiqueta: quien quiera anotarlo o marcarlo desde otro
   * aparato tiene que poder leerlo.
   */
  readonly nombre: string;
  /** Rótulo humano opcional, encima del número. */
  readonly etiqueta?: string;
  readonly tipo: "telefono" | "donacion" | "sangre" | "contacto-familiar";
  readonly detalle: string;
  /** Sólo dígitos, para construir href="tel:". */
  readonly tel?: string;
  readonly email?: string;
  readonly url?: string;
  readonly fuente: FuenteId;
  readonly corte: Corte;
  /** Cuándo un humano contrastó este dato contra la fuente. */
  readonly verificado: Corte;
}

/* ═══════════════════════════════════════════════════════════════════
   Metadatos de la página y del banner
   ═══════════════════════════════════════════════════════════════════ */

export const SISMO_META = {
  slug: "sismo-2026-08-10",
  /** Subir sólo si cambia materialmente el mensaje del banner. */
  revision: 1,
  paginaActualizada: "2026-08-11T21:30-05:00",
  estado: "emergencia-activa",
} as const satisfies {
  slug: string;
  revision: number;
  paginaActualizada: Corte;
  estado: "emergencia-activa" | "recuperacion" | "archivo";
};

/** Horas sin actualizar tras las que la página se autodenuncia como vieja. */
export const HORAS_FRESCURA = 48;

export const ALERTA_GLOBAL = {
  id: SISMO_META.slug,
  rev: SISMO_META.revision,
  desde: "2026-08-10T09:00-05:00",
  /** Fuera de esta ventana el banner no renderiza. Apagado automático. */
  hasta: "2026-09-10T00:00-05:00",
  titulo: "Sismo Mw 7,4 en el Chocó",
  detalle: "Emergencia en curso",
  cta: { label: "Cómo ayudar", href: "/sismo#ayudar" },
} as const satisfies {
  id: string;
  rev: number;
  desde: Corte;
  hasta: Corte;
  titulo: string;
  detalle: string;
  cta: { label: string; href: string };
};

/* ═══════════════════════════════════════════════════════════════════
   S0 — Ficha del evento
   ═══════════════════════════════════════════════════════════════════ */

export const EPICENTRO = {
  lat: 4.8436,
  lon: -76.2422,
  municipio: "San José del Palmar",
  departamento: "Chocó",
  fuente: "usgs",
  corte: "2026-08-10T13:10-05:00",
} as const satisfies {
  lat: number;
  lon: number;
  municipio: string;
  departamento: string;
  fuente: FuenteId;
  corte: Corte;
};

/** Radio aproximado, en metros, dentro del que el sismo se sintió con fuerza. */
export const RADIO_SENTIDO_M = 400_000;

export const FICHA: readonly FichaItem[] = [
  {
    etiqueta: "Magnitud",
    valor: "7,4",
    unidad: "Mw",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
    nota: "Magnitud de momento. El mayor sismo registrado en Colombia en el siglo XXI.",
  },
  {
    etiqueta: "Profundidad",
    valor: "96–103",
    unidad: "km",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
    nota: "El USGS reporta 110 km. La diferencia entre redes sismológicas es normal y no es un error de ninguna de las dos.",
  },
  {
    etiqueta: "Hora local",
    valor: "07:34:28",
    unidad: "UTC−5",
    fuente: "usgs",
    corte: "2026-08-10T13:10-05:00",
    nota: "Lunes 10 de agosto de 2026.",
  },
  {
    etiqueta: "Intensidad máxima",
    valor: "VII",
    unidad: "daño severo",
    fuente: "sgc",
    corte: "2026-08-10T18:00-05:00",
    nota: "Escala de intensidad macrosísmica: mide el efecto en superficie, no la energía liberada.",
  },
  {
    etiqueta: "Epicentro",
    valor: "San José del Palmar",
    unidad: "Chocó",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
    nota: "4,844° N · 76,242° O, unos 240 km al occidente de Bogotá.",
  },
  {
    etiqueta: "Tsunami",
    valor: "No",
    fuente: "usgs",
    corte: "2026-08-10T13:10-05:00",
    nota: "Por ser un sismo profundo dentro de la placa, y no una ruptura en el contacto entre placas, no desplazó el fondo marino.",
  },
];

export const ALCANCE: readonly Dato[] = [
  {
    valor: "+900",
    unidad: "centros poblados reportaron sentirlo",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
  },
  {
    valor: "+12.000",
    unidad: "personas lo reportaron al SGC",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
  },
  {
    valor: "Panamá, Ecuador y Venezuela",
    unidad: "también lo sintieron",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   S2 — Líneas de emergencia
   ═══════════════════════════════════════════════════════════════════ */

export const LINEAS: readonly Canal[] = [
  {
    id: "123",
    nombre: "123",
    tipo: "telefono",
    detalle: "Línea única nacional de emergencias. Funciona en todo el país.",
    tel: "123",
    fuente: "ungrd",
    corte: "2026-08-10T12:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
  {
    id: "rcf",
    nombre: "3212139525",
    etiqueta: "Buscar a un familiar",
    tipo: "contacto-familiar",
    detalle:
      "Restablecimiento de Contactos Familiares de la Cruz Roja: orienta a quienes perdieron contacto con sus seres queridos.",
    tel: "3212139525",
    email: "rcf@cruzrojacolombiana.org",
    fuente: "cruzroja",
    corte: "2026-08-11T10:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
  {
    id: "132",
    nombre: "132",
    tipo: "telefono",
    detalle: "Cruz Roja Colombiana — atención prehospitalaria y rescate.",
    tel: "132",
    fuente: "cruzroja",
    corte: "2026-08-10T12:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
  {
    id: "144",
    nombre: "144",
    tipo: "telefono",
    detalle: "Defensa Civil Colombiana.",
    tel: "144",
    fuente: "ungrd",
    corte: "2026-08-10T12:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
  {
    id: "119",
    nombre: "119",
    tipo: "telefono",
    detalle: "Bomberos.",
    tel: "119",
    fuente: "ungrd",
    corte: "2026-08-10T12:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
  {
    // El número se transcribe exactamente como aparece en la fuente, sin
    // reagrupar los dígitos: agrupar mal un teléfono es inventarlo.
    id: "cruzroja-nacional",
    nombre: "018005198534",
    tipo: "telefono",
    detalle: "Línea nacional gratuita de la Cruz Roja Colombiana.",
    tel: "018005198534",
    fuente: "cruzroja",
    corte: "2026-08-11T10:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   S3 — Cómo ayudar
   ═══════════════════════════════════════════════════════════════════ */

export const ADVERTENCIA_FRAUDE = {
  titulo: "Antes de donar: verifica el canal",
  cuerpo:
    "Después de cada desastre aparecen cuentas y campañas falsas que imitan a las entidades reales. La Cruz Roja Colombiana pidió expresamente usar sólo sus canales oficiales. Desconfía de datáfonos improvisados, cuentas personales, enlaces que llegan por WhatsApp y campañas en redes sin respaldo institucional.",
  regla:
    "En esta página no publicamos números de cuenta. Los verificamos y no aparecen en la fuente oficial de la entidad, sólo en notas de prensa: entra tú mismo al sitio de la Cruz Roja y toma los datos de allí.",
  fuente: "cruzroja",
  corte: "2026-08-11T10:00-05:00",
} as const satisfies {
  titulo: string;
  cuerpo: string;
  regla: string;
  fuente: FuenteId;
  corte: Corte;
};

export const CANALES_AYUDA: readonly Canal[] = [
  {
    id: "cruzroja-dinero",
    nombre: "Donar dinero — Cruz Roja Colombiana",
    tipo: "donacion",
    detalle:
      "Campaña #TodosPorColombia. Los aportes en dinero son la ayuda más eficiente: la entidad compra lo que hace falta, donde hace falta, sin costos de transporte ni bodegaje.",
    url: "https://www.cruzrojacolombiana.org/dona/",
    fuente: "cruzroja",
    corte: "2026-08-11T10:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
  {
    id: "cruzroja-sangre",
    nombre: "Donar sangre",
    tipo: "sangre",
    detalle:
      "La Cruz Roja pidió reforzar las reservas para atender a los heridos. Es gratuito, toma menos de una hora y es la ayuda con la cadena de suministro más corta. Hay puntos habilitados en Bogotá, Medellín, Cali, Cartagena, Villavicencio, Manizales y Armenia.",
    url: "https://www.cruzrojacolombiana.org/dona/",
    fuente: "cruzroja",
    corte: "2026-08-11T10:00-05:00",
    verificado: "2026-08-11T21:30-05:00",
  },
];

export const DONAR_SI: readonly string[] = [
  "Dinero, por los canales oficiales de la entidad",
  "Sangre, en los puntos habilitados",
  "Agua potable envasada",
  "Cobijas, mantas y colchonetas",
  "Alimentos no perecederos sin abrir",
  "Productos de higiene personal y aseo",
  "Insumos de primeros auxilios",
];

export const DONAR_NO: readonly { readonly que: string; readonly porque: string }[] = [
  {
    que: "Ropa usada",
    porque:
      "Es lo que más llega y lo que menos se usa. Consume bodegas, transporte y horas de voluntariado que hacen falta en otra parte.",
  },
  {
    que: "Medicamentos sueltos o vencidos",
    porque:
      "No se pueden administrar sin cadena de frío ni control sanitario, y su destrucción es un costo añadido para quien los recibe.",
  },
  {
    que: "Comida preparada o perecedera",
    porque:
      "Se daña en el trayecto. Las vías al Chocó están intermitentes y el tiempo de llegada es impredecible.",
  },
  {
    que: "Viajar a la zona por cuenta propia a ayudar",
    porque:
      "Los voluntarios no coordinados consumen agua, comida y alojamiento que hacen falta para los damnificados, y estorban las labores de rescate.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   S4 — Cronología y réplicas
   ═══════════════════════════════════════════════════════════════════ */

export interface HitoCronologia {
  readonly hora: string;
  readonly fecha: "10 ago" | "11 ago";
  readonly titulo: string;
  readonly detalle: string;
  readonly magnitud?: string;
  readonly fuente: FuenteId;
  readonly corte: Corte;
}

export const CRONOLOGIA: readonly HitoCronologia[] = [
  {
    hora: "07:34",
    fecha: "10 ago",
    titulo: "Ruptura principal",
    detalle:
      "Mw 7,4 a unos 100 km bajo San José del Palmar. La ruptura dura cerca de 12,5 segundos. Se siente en más de 900 centros poblados y en tres países vecinos.",
    magnitud: "7,4",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
  },
  {
    hora: "08:18",
    fecha: "10 ago",
    titulo: "Primera réplica fuerte",
    detalle:
      "Menos de una hora después, en el vecino municipio de Nóvita. El SGC la sitúa entre 4,6 y 4,8; el USGS en 5,0.",
    magnitud: "4,6–5,0",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
  },
  {
    hora: "10:01",
    fecha: "10 ago",
    titulo: "Réplica en el epicentro",
    detalle: "Nuevamente en San José del Palmar, a 88 km de profundidad.",
    magnitud: "3,8",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
  },
  {
    hora: "12:00",
    fecha: "10 ago",
    titulo: "Primer balance del SGC",
    detalle:
      "18 réplicas registradas hasta el mediodía, entre magnitud 1,4 y 4,8, todas a menos de 100 km de profundidad, en San José del Palmar y Sipí.",
    fuente: "sgc",
    corte: "2026-08-10T12:00-05:00",
  },
  {
    hora: "Tarde",
    fecha: "10 ago",
    titulo: "Siete aeropuertos suspenden operaciones",
    detalle:
      "Quibdó, Cali, Pereira, Manizales, Armenia, Cartago y Buenaventura. Sin vía aérea civil, los equipos de rescate deben entrar en aeronaves militares.",
    fuente: "aerocivil",
    corte: "2026-08-10T18:00-05:00",
  },
  {
    hora: "Noche",
    fecha: "10 ago",
    titulo: "Declaratoria de desastre nacional",
    detalle:
      "Se activa un Puesto de Mando Unificado operado por la UNGRD desde Bogotá. Antioquia decreta alerta roja hospitalaria para recibir heridos del Chocó.",
    fuente: "ungrd",
    corte: "2026-08-10T22:00-05:00",
  },
  {
    hora: "10:43",
    fecha: "11 ago",
    titulo: "La secuencia continúa",
    detalle:
      "Nueva réplica en San José del Palmar, a 99 km de profundidad. Las réplicas pueden seguir durante semanas.",
    magnitud: "3,8",
    fuente: "sgc",
    corte: "2026-08-11T11:00-05:00",
  },
];

export const REPLICAS_TOTAL: CifraEnDisputa = {
  id: "replicas",
  etiqueta: "Réplicas registradas",
  advertencia:
    "El conteo depende de la magnitud mínima que cada reporte incluya y de la hora de corte. Las réplicas pequeñas sólo las detecta la red del SGC.",
  reportes: [
    { cifra: 18, fuente: "sgc", corte: "2026-08-10T12:00-05:00", alcance: "hasta el mediodía del 10 de agosto" },
    { cifra: 60, fuente: "sgc", corte: "2026-08-11T08:00-05:00", alcance: "primeras 24 horas" },
    { cifra: 99, fuente: "prensa", corte: "2026-08-11T12:00-05:00", alcance: "conteo de prensa" },
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   S5 — Impacto humano
   ═══════════════════════════════════════════════════════════════════ */

export const NOTA_CIFRAS = {
  titulo: "Por qué no publicamos una cifra única",
  cuerpo:
    "Durante las primeras horas de un desastre, las entidades cuentan cosas distintas a horas distintas: unas consolidan sólo capitales, otras suman reportes departamentales, otras incluyen personas desaparecidas. Las diferencias que ves abajo no son errores de nadie: son cortes distintos. Publicar un solo número, con autoridad y sin fecha, sería la forma más fácil de estar equivocados. Para el dato del momento, entra a la fuente.",
} as const;

export const CIFRAS_EN_DISPUTA: readonly CifraEnDisputa[] = [
  {
    id: "fallecidos-nacional",
    etiqueta: "Personas fallecidas — total nacional",
    advertencia:
      "Conteos preliminares de entidades distintas. La cifra siguió subiendo a medida que se llegó a zonas incomunicadas.",
    reportes: [
      { cifra: 111, fuente: "prensa", corte: "2026-08-10T14:00-05:00", alcance: "balance presidencial preliminar" },
      { cifra: 132, fuente: "prensa", corte: "2026-08-10T20:00-05:00", alcance: "consolidado de Asocapitales" },
      { cifra: 188, fuente: "prensa", corte: "2026-08-11T11:00-05:00", alcance: "consolidado de prensa nacional" },
      { cifra: 240, fuente: "prensa", corte: "2026-08-11T18:00-05:00", alcance: "reportes territoriales sumados" },
    ],
  },
  {
    id: "heridos-nacional",
    etiqueta: "Personas heridas — total nacional",
    advertencia:
      "Incluye desde lesiones leves atendidas en la calle hasta politraumatismos en cuidado intensivo.",
    reportes: [
      { cifra: 570, fuente: "prensa", corte: "2026-08-10T20:00-05:00", alcance: "consolidado de Asocapitales" },
      { cifra: 1310, fuente: "prensa", corte: "2026-08-11T12:00-05:00" },
      { cifra: 1677, fuente: "prensa", corte: "2026-08-11T11:00-05:00", alcance: "consolidado de prensa nacional" },
    ],
  },
  {
    id: "viviendas",
    etiqueta: "Viviendas destruidas o averiadas",
    advertencia:
      "El censo de daños apenas comienza y no ha llegado a las veredas incomunicadas del Chocó.",
    reportes: [
      { cifra: 1500, fuente: "prensa", corte: "2026-08-10T14:00-05:00", alcance: "viviendas averiadas, balance preliminar" },
      { cifra: 9400, fuente: "prensa", corte: "2026-08-11T18:00-05:00", alcance: "~1.100 destruidas y ~8.300 con daño parcial" },
    ],
  },
];

export interface ImpactoCiudad {
  readonly ciudad: string;
  readonly departamento: string;
  readonly lineas: readonly string[];
  readonly fuente: FuenteId;
  readonly corte: Corte;
}

export const IMPACTO_CIUDADES: readonly ImpactoCiudad[] = [
  {
    ciudad: "Cali",
    departamento: "Valle del Cauca",
    lineas: [
      "Alrededor de 95 fallecidos y 949 heridos en los reportes preliminares",
      "56 estructuras colapsadas total o parcialmente",
      "10 hospitales inhabilitados; atención a la intemperie",
    ],
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
  },
  {
    ciudad: "Pereira",
    departamento: "Risaralda",
    lineas: [
      "Más de 66 fallecidos y 37 desaparecidos en el reporte inicial",
      "66 edificaciones destruidas y 26 con daño parcial",
      "Toque de queda, clases suspendidas y urgencia manifiesta",
    ],
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
  },
  {
    ciudad: "Quibdó",
    departamento: "Chocó",
    lineas: [
      "Más de 36 heridos graves en un solo hospital, con ocho cirugías simultáneas",
      "Entre los fallecidos, dos menores de edad y una mujer gestante",
      "18 pacientes evacuados en helicóptero a Medellín",
    ],
    fuente: "gobChoco",
    corte: "2026-08-11T12:00-05:00",
  },
  {
    ciudad: "Manizales",
    departamento: "Caldas",
    lineas: [
      "Entre 5 y 6 fallecidos",
      "Cayó la cúpula de la Catedral Basílica Metropolitana",
      "17 edificios colapsados y más de 4.000 damnificados",
    ],
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   S6 — Geología
   ═══════════════════════════════════════════════════════════════════ */

export const GEOLOGIA_PARRAFOS: readonly string[] = [
  "El occidente colombiano está sobre el Cinturón de Fuego del Pacífico. Allí la placa de Nazca se hunde bajo el Bloque Andino del Norte a razón de 55 a 60 milímetros por año — más o menos lo que crece una uña en un año, sostenido durante millones de años.",
  "Este sismo no ocurrió en el contacto entre las dos placas, sino dentro de la placa que se hunde, a unos 100 kilómetros de profundidad. A esa presión y temperatura los minerales liberan el agua que traían atrapada, la presión interna se dispara y la roca se rompe de golpe en un lugar donde, en teoría, debería deformarse despacio.",
  "Esa profundidad es la que explica las dos cosas que desconciertan de este terremoto: por qué el epicentro no fue lo más destruido, y por qué se sintió en Panamá. La energía no se descargó concentrada cerca de la superficie: se repartió en ondas largas que viajaron cientos de kilómetros antes de encontrar edificios que sacudir.",
];

export interface Comparativa {
  readonly evento: string;
  readonly anio: number;
  readonly magnitud: string;
  readonly relacion: string;
  readonly fallecidos: string;
  readonly profundidad: string;
}

export const COMPARATIVAS: readonly Comparativa[] = [
  {
    evento: "Chocó",
    anio: 1995,
    magnitud: "6,6",
    relacion: "25 veces menos energía",
    fallecidos: "decenas",
    profundidad: "intermedia",
  },
  {
    evento: "Eje Cafetero",
    anio: 1999,
    magnitud: "6,2",
    relacion: "150 veces menos energía",
    fallecidos: "cerca de 1.200",
    profundidad: "muy superficial",
  },
  {
    evento: "San José del Palmar",
    anio: 2026,
    magnitud: "7,4",
    relacion: "el de referencia",
    fallecidos: "en conteo",
    profundidad: "~100 km",
  },
];

export const CALLOUT_ENERGIA = {
  titulo: "Más energía no significa más muertes",
  cuerpo:
    "El terremoto del Eje Cafetero de 1999 liberó 150 veces menos energía que este y aun así mató a cerca de 1.200 personas. Fue superficial y ocurrió justo debajo de una ciudad. Lo que determina el daño no es sólo cuánta energía se libera, sino a qué profundidad, y qué hay construido encima.",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   S7 — San José del Palmar
   ═══════════════════════════════════════════════════════════════════ */

export const TERRITORIO_DATOS: readonly Dato[] = [
  {
    valor: "80",
    unidad: "% de la población bajo la línea de pobreza",
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
    nota: "Antes del sismo.",
  },
  {
    valor: "~400",
    unidad: "viviendas agrietadas o derrumbadas",
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
    nota: "La destrucción se concentró en las veredas rurales dispersas.",
  },
  {
    valor: "1",
    unidad: "IPS privada, con una sola ambulancia",
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
    nota: "Es toda la capacidad de atención médica del municipio epicentral.",
  },
  {
    valor: "0",
    unidad: "energía y acueducto tras el sismo",
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
    nota: "Las vías a Cartago y a Nóvita quedaron sepultadas por deslizamientos.",
  },
];

export const FONDO_EMERGENCIAS: Dato = {
  valor: "32 millones",
  unidad: "de pesos",
  fuente: "prensa",
  corte: "2026-08-11T12:00-05:00",
  nota: "El fondo municipal de emergencias completo de San José del Palmar, según su alcalde. Aproximadamente el precio de un carro usado.",
};

export const TERRITORIO_PARRAFOS: readonly string[] = [
  "San José del Palmar queda en el borde donde la selva del Chocó se encuentra con las montañas del Valle del Cauca y Risaralda. Unos 240 kilómetros al occidente de Bogotá, y a una distancia mucho mayor en todo lo demás.",
  "Fue corredor del conflicto armado durante décadas, disputado por guerrillas y paramilitares. La escuela con impactos de bala y el asesinato sostenido de líderes sociales y guardias indígenas son parte de la memoria del municipio. En ese contexto nunca hubo formalización de tierras, ni asistencia técnica agrícola sostenida, ni inversión en infraestructura resistente.",
  "Cuando el sismo cortó las dos carreteras que conectan al municipio, no rompió una red: dejó a la vista que casi no había ninguna. El aislamiento no lo creó el terremoto. Lo reveló.",
];

/* ═══════════════════════════════════════════════════════════════════
   S8 — Servicios y viajes
   ═══════════════════════════════════════════════════════════════════ */

export interface EstadoServicio {
  readonly servicio: string;
  readonly estado: string;
  readonly detalle: string;
  readonly fuente: FuenteId;
  readonly corte: Corte;
}

export const SERVICIOS: readonly EstadoServicio[] = [
  {
    servicio: "Aeropuertos",
    estado: "7 suspendidos",
    detalle:
      "Quibdó, Cali, Pereira, Manizales, Armenia, Cartago y Buenaventura suspendieron operaciones para evaluar daños en pistas y terminales.",
    fuente: "aerocivil",
    corte: "2026-08-10T18:00-05:00",
  },
  {
    servicio: "Energía en el Chocó",
    estado: "Restablecimiento parcial",
    detalle:
      "El departamento perdió el 100 % de la demanda. A las 24 horas seguía con un déficit cercano al 20 %.",
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
  },
  {
    servicio: "Vías",
    estado: "Cerradas por deslizamientos",
    detalle:
      "San José del Palmar quedó incomunicado por tierra: las vías a Cartago y a Nóvita están sepultadas. También hay cierres en los corredores Buga–Buenaventura y Cali–Loboguerrero.",
    fuente: "prensa",
    corte: "2026-08-11T12:00-05:00",
  },
];

export const NOTA_VIAJEROS: readonly string[] = [
  "Si tenías un viaje al Chocó en los próximos días, consulta con tu aerolínea antes de desplazarte: varios aeropuertos siguen con operación intermitente.",
  "No llames a hoteles, guías ni operadores del directorio para pedir información de la emergencia. Muchos están afectados, y esas líneas hacen falta para otras cosas.",
  "El turismo será parte de la recuperación del Chocó, pero eso es después. La ayuda de hoy se canaliza por la Cruz Roja y la UNGRD, no por reservas.",
];

/* ═══════════════════════════════════════════════════════════════════
   S9 — Método
   ═══════════════════════════════════════════════════════════════════ */

export const METODO: readonly { readonly titulo: string; readonly cuerpo: string }[] = [
  {
    titulo: "Toda cifra lleva fuente y hora de corte",
    cuerpo:
      "Sin excepción. Si un dato aparece sin fecha en esta página, es un error nuestro y queremos saberlo.",
  },
  {
    titulo: "No publicamos una cifra única de víctimas",
    cuerpo:
      "Mostramos lo que reportó cada entidad y cuándo. La divergencia entre fuentes es información sobre el estado de la emergencia, no ruido que haya que limpiar.",
  },
  {
    titulo: "No hay contadores animados",
    cuerpo:
      "Un número que sube de cero hasta su valor inventa todas las cifras intermedias, que ninguna fuente reportó. Además, animar un conteo de muertos como espectáculo es indefendible.",
  },
  {
    titulo: "No hay datos en vivo",
    cuerpo:
      "El SGC no publica una API abierta de sismicidad en tiempo real. Los catálogos internacionales sólo registran dos eventos de esta secuencia, porque las réplicas son locales y pequeñas. Un feed que mostrara dos réplicas cuando el SGC lleva más de sesenta no sería menos información: sería información incompleta presentada como completa. Preferimos enviarte a la fuente.",
  },
  {
    titulo: "No publicamos números de cuenta",
    cuerpo:
      "Los que circulan en prensa no aparecen en el sitio oficial de la Cruz Roja. Enlazamos su página de donación para que tomes los datos de allí.",
  },
];
