import type { ImgHTMLAttributes } from "react";
import { FOTOS } from "./fotos.generadas";

/**
 * Una foto que pesa lo que la pantalla necesita.
 *
 * Recibe la dirección del original (por ejemplo "/images/municipios/quibdo.jpg") y arma un <picture>
 * con las copias de public/images/opt/ (AVIF, luego WebP, luego JPG). El navegador elige el tamaño
 * según `sizes` y la densidad de la pantalla: un 4K recibe la de 3840 px, un teléfono la suya. El
 * original sigue en el servidor, intacto; aquí solo no se manda lo que la pantalla no puede mostrar.
 *
 * Se usa igual que un <img>: className, style, alt y demás pasan directo a la imagen. Si una foto no
 * está en el listado (no se corrió `pnpm fotos`), se muestra el original tal cual.
 */
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  alt: string;
  /** Qué tan ancha se ve la foto, como en <img sizes>. Por defecto, todo el ancho. */
  sizes?: string;
  /** La foto principal de la página: se pide primero y sin esperar a que se vea. */
  prioridad?: boolean;
};

const OPT = "/images/opt";
const rutaOpt = (src: string) => src.replace(/^\/images\//, `${OPT}/`).replace(/\.jpe?g$/i, "");
const lista = (base: string, anchos: number[], ext: string, prefijo = "") =>
  anchos.map((a) => `${base}-${prefijo}${a}.${ext} ${a}w`).join(", ");

/** Pantallas más altas que anchas: ahí se usa el recorte vertical, si la foto lo tiene. */
const MEDIA_VERTICAL = "(max-aspect-ratio: 3/4)";

/** Las listas de archivos de una foto, tal como las usa el <picture>. */
function fuentesFoto(src: string, sizes = "100vw") {
  const foto = FOTOS[src];
  if (!foto) return null;
  const base = rutaOpt(src);
  return {
    avif: lista(base, foto.anchos, "avif"),
    webp: lista(base, foto.anchos, "webp"),
    verticalAvif: foto.retrato ? lista(base, foto.retrato.anchos, "avif", "v") : undefined,
    verticalWebp: foto.retrato ? lista(base, foto.retrato.anchos, "webp", "v") : undefined,
    respaldo: `${base}-${foto.respaldo}.jpg`,
    sizes,
    ancho: foto.ancho,
    alto: foto.alto,
  };
}

export function Foto({ src, alt, sizes = "100vw", prioridad = false, loading, decoding, ...resto }: Props) {
  const f = fuentesFoto(src, sizes);
  const carga = {
    loading: loading ?? (prioridad ? "eager" : "lazy"),
    decoding: decoding ?? (prioridad ? "sync" : "async"),
    fetchPriority: prioridad ? ("high" as const) : undefined,
  };
  if (!f) return <img src={src} alt={alt} {...carga} {...resto} />;

  return (
    <picture>
      {f.verticalAvif && <source media={MEDIA_VERTICAL} type="image/avif" srcSet={f.verticalAvif} sizes="100vw" />}
      {f.verticalWebp && <source media={MEDIA_VERTICAL} type="image/webp" srcSet={f.verticalWebp} sizes="100vw" />}
      <source type="image/avif" srcSet={f.avif} sizes={sizes} />
      <source type="image/webp" srcSet={f.webp} sizes={sizes} />
      <img src={f.respaldo} alt={alt} width={f.ancho} height={f.alto} {...carga} {...resto} />
    </picture>
  );
}
