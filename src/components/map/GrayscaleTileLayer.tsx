import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import simplify from "@turf/simplify";
import type {
  FeatureCollection,
  Polygon,
  MultiPolygon,
} from "geojson";

interface GrayscaleTileLayerProps {
  url: string;
  attribution?: string;
  chocoGeoJson: FeatureCollection | null;
}

// Subdomains para OSM
const SUBDOMAINS = ["a", "b", "c"];

/**
 * Convierte lat/lng a coordenadas de pixel dentro de un tile específico.
 * Usa la proyección Web Mercator estándar.
 */
function latLngToTilePixel(
  lat: number,
  lng: number,
  tileX: number,
  tileY: number,
  zoom: number
): [number, number] {
  const n = Math.pow(2, zoom);
  const globalX = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const globalY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    n;

  const pixelX = (globalX - tileX) * 256;
  const pixelY = (globalY - tileY) * 256;
  return [pixelX, pixelY];
}

/**
 * Calcula el bounding box en lat/lng de un tile dado.
 */
function tileBounds(
  tileX: number,
  tileY: number,
  zoom: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const n = Math.pow(2, zoom);

  const minLng = (tileX / n) * 360 - 180;
  const maxLng = ((tileX + 1) / n) * 360 - 180;

  const minLatRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (tileY + 1)) / n)));
  const maxLatRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * tileY) / n)));
  const minLat = (minLatRad * 180) / Math.PI;
  const maxLat = (maxLatRad * 180) / Math.PI;

  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Verifica si dos bounding boxes se intersecan.
 */
function bboxIntersects(
  a: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  b: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): boolean {
  return (
    a.minLat <= b.maxLat &&
    a.maxLat >= b.minLat &&
    a.minLng <= b.maxLng &&
    a.maxLng >= b.minLng
  );
}

/**
 * Prepara los datos del Chocó: simplifica y extrae rings + bbox.
 */
function prepareChocoData(geoJson: FeatureCollection) {
  const simplified = simplify(
    geoJson as FeatureCollection<Polygon | MultiPolygon>,
    { tolerance: 0.003, highQuality: true }
  );

  const geometry = simplified.features[0].geometry as Polygon | MultiPolygon;

  // Extraer todos los outer rings
  const rings: number[][][] =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates.map((poly) => poly[0])
      : [geometry.coordinates[0]];

  // Calcular bbox
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;

  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }

  return { rings, bbox: { minLat, maxLat, minLng, maxLng } };
}

/**
 * Dibuja una imagen en el canvas aplicando grayscale píxel a píxel,
 * pero preservando los tonos azules del agua (OSM: #aad3df y similares).
 * Condición de "agua": canal B dominante, suficientemente claro y saturado en azul.
 */
function drawGrayscaleKeepWater(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) {
  ctx.filter = "none";
  ctx.drawImage(img, 0, 0, 256, 256);
  const imageData = ctx.getImageData(0, 0, 256, 256);
  const d = imageData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    // Agua en OSM: azul dominante, claro, con diferencia B-R significativa
    // Cubre: océano (#aad3df), ríos, lagos y variantes similares
    const isWater = b > r && b >= g && b >= 170 && b - r >= 25;

    if (!isWater) {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      d[i] = gray;
      d[i + 1] = gray;
      d[i + 2] = gray;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Crea un L.GridLayer custom que dibuja tiles en grayscale
 * (preservando cuerpos de agua en azul) excepto dentro del Chocó a color.
 */
function createGrayscaleGridLayer(
  url: string,
  attribution: string,
  chocoData: { rings: number[][][]; bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number } } | null
) {
  const GrayscaleLayer = L.GridLayer.extend({
    createTile(coords: L.Coords, done: L.DoneCallback) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;

      const img = new Image();
      img.crossOrigin = "anonymous";

      // Construir URL del tile (formato OSM estándar)
      const subdomain = SUBDOMAINS[Math.abs(coords.x + coords.y) % SUBDOMAINS.length];
      const tileUrl = url
        .replace("{s}", subdomain)
        .replace("{z}", String(coords.z))
        .replace("{x}", String(coords.x))
        .replace("{y}", String(coords.y));

      img.onload = () => {
        if (!chocoData) {
          // Sin datos del Chocó: grayscale preservando agua
          drawGrayscaleKeepWater(ctx, img);
          done(undefined, canvas);
          return;
        }

        const tb = tileBounds(coords.x, coords.y, coords.z);

        if (!bboxIntersects(tb, chocoData.bbox)) {
          // Tile completamente fuera del Chocó → grayscale + agua azul
          drawGrayscaleKeepWater(ctx, img);
        } else {
          // Tile dentro o en el borde del Chocó:
          // 1. Base en grayscale preservando agua
          drawGrayscaleKeepWater(ctx, img);
          // 2. Encima, la región del Chocó a color completo
          ctx.save();
          ctx.beginPath();
          this._drawChocoPath(ctx, coords);
          ctx.clip();
          ctx.filter = "none";
          ctx.drawImage(img, 0, 0, 256, 256);
          ctx.restore();
        }

        done(undefined, canvas);
      };

      img.onerror = () => {
        done(new Error("Tile load error"), canvas);
      };

      img.src = tileUrl;
      return canvas;
    },

    _drawChocoPath(
      ctx: CanvasRenderingContext2D,
      coords: L.Coords
    ) {
      if (!chocoData) return;

      for (const ring of chocoData.rings) {
        let first = true;
        for (const [lng, lat] of ring) {
          const [px, py] = latLngToTilePixel(
            lat,
            lng,
            coords.x,
            coords.y,
            coords.z
          );
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (GrayscaleLayer as any)({
    attribution,
    maxZoom: 19,
    tileSize: 256,
  });
}

export const GrayscaleTileLayer: React.FC<GrayscaleTileLayerProps> = ({
  url,
  attribution = "",
  chocoGeoJson,
}) => {
  const map = useMap();
  const layerRef = useRef<L.GridLayer | null>(null);

  useEffect(() => {
    const chocoData =
      chocoGeoJson?.features?.length ? prepareChocoData(chocoGeoJson) : null;

    const layer = createGrayscaleGridLayer(url, attribution, chocoData);
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, url, attribution, chocoGeoJson]);

  return null;
};
