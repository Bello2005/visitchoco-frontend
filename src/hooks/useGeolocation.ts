import { useCallback, useState } from "react";

export interface GeoCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

export type GeoStatus = "idle" | "prompt" | "granted" | "denied" | "error" | "unsupported";

const toRad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function useGeolocation() {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      setError("Geolocalización no disponible");
      return;
    }
    setStatus("prompt");
    setError(null);

    const onSuccess = (pos: GeolocationPosition) => {
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setStatus("granted");
    };

    const onError = (err: GeolocationPositionError) => {
      setCoords(null);
      setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      setError(err.message);
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 5 * 60_000 }
    );
  }, []);

  const reset = useCallback(() => {
    setCoords(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { coords, status, error, request, reset };
}
