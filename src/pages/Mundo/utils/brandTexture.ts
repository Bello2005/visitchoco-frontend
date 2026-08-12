import * as THREE from "three";

// TIPOGRAFÍA DE MARCA EN 3D
//
// Los letreros del mundo (portal, plaza de la chirimía, malecón) se dibujan en
// un <canvas> y se suben como CanvasTexture: nítidos a cualquier distancia,
// sin depender de un atlas de troika ni de un .json de tipografía.
//
// Antes cada componente usaba Georgia "para no depender del @font-face del
// sitio". El costo era real: el wordmark del monumento NO era el de la marca.
// Fraunces es la fuente display de VisitChocó (OPERACION_ATRATO §2 →
// tailwind `font-display`), así que la servimos desde public/fonts y la
// registramos por FontFace API — disponible para canvas, no solo para CSS.
//
// El canvas se pinta DOS veces a propósito: una inmediata con el fallback
// (Georgia) para que nunca haya textura en blanco, y otra al resolver la
// fuente. Sin ese repintado el FOUT queda HORNEADO en la textura para siempre.

const FONT_FAMILY = "Fraunces Mundo";
const FONT_URL = "/fonts/Fraunces-Variable.woff2";

/** Cadena de familias lista para `ctx.font` (con el fallback del sistema). */
export const BRAND_SERIF = `"${FONT_FAMILY}", Georgia, "Times New Roman", serif`;

let fontPromise: Promise<void> | null = null;

/**
 * Registra Fraunces en document.fonts una sola vez por sesión. Nunca rechaza:
 * si la carga falla (red, 404), los letreros se quedan en Georgia — degradado
 * feo pero legible, jamás un monumento sin texto.
 */
export function ensureBrandFont(): Promise<void> {
  if (fontPromise) return fontPromise;

  if (typeof document === "undefined" || typeof FontFace === "undefined") {
    fontPromise = Promise.resolve();
    return fontPromise;
  }

  // Fraunces es variable en el eje wght (100..900): hay que declarar el rango
  // o el navegador solo entrega el peso por defecto.
  const face = new FontFace(FONT_FAMILY, `url(${FONT_URL}) format("woff2")`, {
    weight: "100 900",
    style: "normal",
    display: "block",
  });

  fontPromise = face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
    })
    .catch((err) => {
      console.warn("[brandTexture] Fraunces no cargó, se usa el fallback", err);
    });

  return fontPromise;
}

/**
 * Ajusta el tamaño de fuente hacia abajo hasta que el texto quepa en maxWidth.
 * Fraunces es bastante más ancha que Georgia con el mismo cuerpo, así que los
 * tamaños heredados se salían del canvas: en vez de re-tantear números a mano
 * por cada letrero, medimos.
 */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  maxWidth: number,
  family = BRAND_SERIF
): void {
  let px = size;
  for (let i = 0; i < 12; i++) {
    ctx.font = `${weight} ${px}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return;
    px *= 0.94;
  }
}

/** Inserta espacios finos entre letras — el "tracking" de los subtítulos. */
export function tracked(text: string): string {
  return text.split("").join(" ");
}

export interface PlaqueOptions {
  /** Línea principal del letrero (ej. "VisitChocó"). */
  title: string;
  /** Línea inferior en versalitas espaciadas (ej. "EL TERRITORIO"). */
  subtitle?: string;
  /** Color de la línea de acento superior. */
  accent: string;
  /** Color del título (crema de marca por defecto). */
  titleColor?: string;
  /** Color del subtítulo. */
  subtitleColor?: string;
  titleSize?: number;
  subtitleSize?: number;
  width?: number;
  height?: number;
}

function paintPlaque(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  o: PlaqueOptions
): void {
  const {
    title,
    subtitle,
    accent,
    titleColor = "#f6ecd6",
    subtitleColor = "#b9d9c4",
    titleSize = 148,
    subtitleSize = 34,
  } = o;

  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // línea de acento superior
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.175);
  ctx.lineTo(w * 0.7, h * 0.175);
  ctx.stroke();

  ctx.fillStyle = titleColor;
  fitText(ctx, title, 600, titleSize, w * 0.86);
  ctx.fillText(title, w / 2, h / 2 + h * 0.04);

  if (subtitle) {
    const spaced = tracked(subtitle);
    ctx.fillStyle = subtitleColor;
    fitText(ctx, spaced, 500, subtitleSize, w * 0.84);
    ctx.fillText(spaced, w / 2, h - h * 0.125);
  }
}

/**
 * Crea la textura de un letrero de marca. Se pinta ya (fallback) y se repinta
 * sola cuando Fraunces esté lista.
 *
 * El llamador es dueño de la textura: `dispose()` en el cleanup.
 */
export function makePlaqueTexture(o: PlaqueOptions): THREE.CanvasTexture {
  const w = o.width ?? 1024;
  const h = o.height ?? 320;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  paintPlaque(ctx, w, h, o);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  repaintWhenFontReady(tex, () => paintPlaque(ctx, w, h, o));

  return tex;
}

/**
 * Canvas a medida (el deck de la plaza, los pictogramas del varadero) con el
 * mismo contrato de repintado: `draw` se llama ahora y otra vez con Fraunces.
 */
export function makeBrandCanvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  draw(ctx, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  repaintWhenFontReady(tex, () => draw(ctx, w, h));

  return tex;
}

/**
 * Repinta tras cargar la fuente, salvo que la textura ya se haya liberado
 * (navegar fuera de /mundo mientras la fuente viaja es lo normal, no un error).
 */
function repaintWhenFontReady(tex: THREE.CanvasTexture, redraw: () => void): void {
  let disposed = false;
  tex.addEventListener("dispose", () => {
    disposed = true;
  });

  ensureBrandFont().then(() => {
    if (disposed) return;
    redraw();
    tex.needsUpdate = true;
  });
}
