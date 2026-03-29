import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import simplify from "@turf/simplify";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

interface GrayscaleTileLayerProps {
  url: string;
  attribution?: string;
  chocoGeoJson: FeatureCollection | null;
}

const SUBDOMAINS = ["a", "b", "c"];

function latLngToTilePixel(
  lat: number, lng: number,
  tileX: number, tileY: number, zoom: number
): [number, number] {
  const n = Math.pow(2, zoom);
  const globalX = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const globalY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return [(globalX - tileX) * 256, (globalY - tileY) * 256];
}

function tileBounds(tileX: number, tileY: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const minLng = (tileX / n) * 360 - 180;
  const maxLng = ((tileX + 1) / n) * 360 - 180;
  const minLat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (tileY + 1)) / n))) * 180) / Math.PI;
  const maxLat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * tileY) / n))) * 180) / Math.PI;
  return { minLat, maxLat, minLng, maxLng };
}

function bboxIntersects(
  a: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  b: { minLat: number; maxLat: number; minLng: number; maxLng: number }
) {
  return a.minLat <= b.maxLat && a.maxLat >= b.minLat &&
         a.minLng <= b.maxLng && a.maxLng >= b.minLng;
}

function prepareChocoData(geoJson: FeatureCollection) {
  const simplified = simplify(
    geoJson as FeatureCollection<Polygon | MultiPolygon>,
    { tolerance: 0.0005, highQuality: true }
  );
  const geometry = simplified.features[0].geometry as Polygon | MultiPolygon;
  const rings: number[][][] =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates.map((poly) => poly[0])
      : [geometry.coordinates[0]];
  let minLat = Infinity, maxLat = -Infinity,
      minLng = Infinity, maxLng = -Infinity;
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

function drawGrayscaleKeepWater(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) {
  ctx.filter = "none";
  ctx.drawImage(img, 0, 0, 256, 256);
  try {
    const imageData = ctx.getImageData(0, 0, 256, 256);
    const d = imageData.data;
    const BLEND = 0.75;
    const BLEND_WATER = 0.82;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const isWater = b > r && b >= g && b >= 170 && b - r >= 25;
      if (!isWater) {
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const white = Math.min(255, Math.round(gray + (255 - gray) * BLEND));
        d[i] = white; d[i + 1] = white; d[i + 2] = white;
      } else {
        d[i]   = Math.min(255, Math.round(d[i]   + (255 - d[i])   * BLEND_WATER));
        d[i+1] = Math.min(255, Math.round(d[i+1] + (255 - d[i+1]) * BLEND_WATER));
        d[i+2] = Math.min(255, Math.round(d[i+2] + (255 - d[i+2]) * BLEND_WATER));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  } catch {
    // getImageData bloqueado por CORS o canvas tainted —
    // el tile ya está dibujado sin efecto, que se muestre así
  }
}

function createGrayscaleGridLayer(
  url: string, attribution: string,
  chocoData: { rings: number[][][]; bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number } } | null
) {
  const GrayscaleLayer = L.GridLayer.extend({
    createTile(coords: L.Coords, done: L.DoneCallback) {
      const canvas = document.createElement("canvas");
      canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.crossOrigin = "anonymous";
      const subdomain = SUBDOMAINS[Math.abs(coords.x + coords.y) % SUBDOMAINS.length];
      img.src = url
        .replace("{s}", subdomain)
        .replace("{z}", String(coords.z))
        .replace("{x}", String(coords.x))
        .replace("{y}", String(coords.y));
      img.onload = () => {
        try {
          if (!chocoData) {
            drawGrayscaleKeepWater(ctx, img);
          } else {
            const tb = tileBounds(coords.x, coords.y, coords.z);
            if (!bboxIntersects(tb, chocoData.bbox)) {
              drawGrayscaleKeepWater(ctx, img);
            } else {
              drawGrayscaleKeepWater(ctx, img);
              ctx.save(); ctx.beginPath();
              this._drawChocoPath(ctx, coords);
              ctx.clip(); ctx.filter = "none";
              ctx.drawImage(img, 0, 0, 256, 256);
              ctx.restore();
            }
          }
        } catch {
          ctx.drawImage(img, 0, 0, 256, 256);
        }
        done(undefined, canvas);
      };
      img.onerror = () => {
        done(new Error("Tile load error"), canvas);
      };
      return canvas;
    },
    _drawChocoPath(ctx: CanvasRenderingContext2D, coords: L.Coords) {
      if (!chocoData) return;
      for (const ring of chocoData.rings) {
        let first = true;
        for (const [lng, lat] of ring) {
          const [px, py] = latLngToTilePixel(lat, lng, coords.x, coords.y, coords.z);
          if (first) { ctx.moveTo(px, py); first = false; }
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      }
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (GrayscaleLayer as any)({ attribution, maxZoom: 19, tileSize: 256 });
}

export const GrayscaleTileLayer: React.FC<GrayscaleTileLayerProps> = ({
  url, attribution = "", chocoGeoJson,
}) => {
  const map = useMap();
  const layerRef = useRef<L.GridLayer | null>(null);
  useEffect(() => {
    const chocoData = chocoGeoJson?.features?.length
      ? prepareChocoData(chocoGeoJson) : null;
    const layer = createGrayscaleGridLayer(url, attribution, chocoData);
    layer.addTo(map);
    layerRef.current = layer;
    return () => {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    };
  }, [map, url, attribution, chocoGeoJson]);
  return null;
};
