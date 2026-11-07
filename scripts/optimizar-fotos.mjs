// Prepara las fotos del sitio para la web sin tocar los originales.
//
//   public/images/hero/*.jpg, public/images/municipios/*.jpg   → originales, se quedan intactos
//   public/images/opt/<carpeta>/<foto>-<ancho>.{avif,webp,jpg}  → copias a la medida de cada pantalla
//   src/components/common/fotos.generadas.ts                    → qué tamaños existen de cada foto
//
// El componente <Foto> lee ese listado y arma un <picture>: el navegador elige solo el tamaño que su
// pantalla puede mostrar (un 4K recibe 3840 px, un teléfono el suyo). Nunca se agranda una foto: los
// anchos van hasta el del original.
//
// Las fotos del carrusel principal (hero) llevan además un recorte vertical del centro para teléfonos,
// que es justo la parte que se ve con object-fit: cover, a la resolución completa del original.
//
// Correr de nuevo al agregar o cambiar fotos:  pnpm fotos
// Solo rehace lo que falta o lo que es más viejo que su original.
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import sharp from 'sharp';

const PUBLICO = 'public';
const SALIDA = 'public/images/opt';
const LISTADO = 'src/components/common/fotos.generadas.ts';

const CARPETAS = {
  hero: { anchos: [640, 960, 1280, 1920, 2560, 3840], retrato: [720, 1080, 1440] },
  municipios: { anchos: [320, 480, 640, 960, 1280, 1920] },
};

// Calidad alta: a estos valores no se distinguen del original a tamaño de pantalla.
const CALIDAD = {
  avif: { quality: 62, effort: 6, chromaSubsampling: '4:4:4' },
  webp: { quality: 82, effort: 6, smartSubsample: true },
  jpg: { quality: 84, mozjpeg: true, progressive: true },
};

async function vieja(destino, origen) {
  try {
    return (await stat(destino)).mtimeMs < (await stat(origen)).mtimeMs;
  } catch {
    return true;
  }
}

async function guardar(imagen, destino, formato, origen) {
  if (!(await vieja(destino, origen))) return 0;
  const salida =
    formato === 'avif' ? imagen.clone().avif(CALIDAD.avif)
    : formato === 'webp' ? imagen.clone().webp(CALIDAD.webp)
    : imagen.clone().jpeg(CALIDAD.jpg);
  await salida.toFile(destino);
  return 1;
}

const listado = {};
let hechas = 0;

for (const [carpeta, conf] of Object.entries(CARPETAS)) {
  const dir = join(PUBLICO, 'images', carpeta);
  await mkdir(join(SALIDA, carpeta), { recursive: true });
  for (const archivo of (await readdir(dir)).filter((a) => /\.jpe?g$/i.test(a)).sort()) {
    const origen = join(dir, archivo);
    const nombre = basename(archivo).replace(/\.jpe?g$/i, '');
    // rotate() aplica la orientación EXIF de las fotos de teléfono antes de medir
    const base = sharp(origen).rotate();
    const { width: w0, height: h0, orientation } = await base.metadata();
    const [w, h] = orientation >= 5 ? [h0, w0] : [w0, h0];

    // Los anchos menores que el original; si el original cabe en la lista, también él completo
    const anchos = conf.anchos.filter((a) => a < w);
    if (w <= Math.max(...conf.anchos)) anchos.push(w);
    const entrada = { ancho: w, alto: h, anchos };

    for (const a of entrada.anchos) {
      const img = base.clone().resize({ width: a, withoutEnlargement: true });
      for (const f of ['avif', 'webp']) hechas += await guardar(img, join(SALIDA, carpeta, `${nombre}-${a}.${f}`), f, origen);
    }
    // Un solo JPG de respaldo, para navegadores muy viejos
    const respaldo = entrada.anchos.filter((a) => a <= 1280).pop() ?? entrada.anchos[0];
    hechas += await guardar(base.clone().resize({ width: respaldo }), join(SALIDA, carpeta, `${nombre}-${respaldo}.jpg`), 'jpg', origen);
    entrada.respaldo = respaldo;

    if (conf.retrato && w > h) {
      // Recorte 9:16 del centro, el mismo encuadre que muestra cover en un teléfono vertical
      const rw = Math.round((h * 9) / 16);
      const corte = { left: Math.round((w - rw) / 2), top: 0, width: rw, height: h };
      const anchosR = conf.retrato.filter((a) => a < rw);
      anchosR.push(rw);
      entrada.retrato = { ancho: rw, alto: h, anchos: anchosR };
      for (const a of anchosR) {
        const img = base.clone().extract(corte).resize({ width: a });
        for (const f of ['avif', 'webp']) hechas += await guardar(img, join(SALIDA, carpeta, `${nombre}-v${a}.${f}`), f, origen);
      }
    }
    listado[`/images/${carpeta}/${archivo}`] = entrada;
    console.log(`${carpeta}/${archivo}: ${w}×${h} → ${entrada.anchos.join(', ')}${entrada.retrato ? ` · vertical ${entrada.retrato.anchos.join(', ')}` : ''}`);
  }
}

const ts = `// Generado por scripts/optimizar-fotos.mjs (pnpm fotos). No editar a mano.
// Qué tamaños existen de cada foto en public/images/opt/.

export type FotoGenerada = {
  ancho: number;
  alto: number;
  anchos: number[];
  respaldo: number;
  retrato?: { ancho: number; alto: number; anchos: number[] };
};

export const FOTOS: Record<string, FotoGenerada> = ${JSON.stringify(listado, null, 2)};
`;
await writeFile(LISTADO, ts);
console.log(`listo: ${hechas} archivos nuevos o rehechos, listado en ${LISTADO}`);
