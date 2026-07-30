import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";

/**
 * Mini mapa de ubicación del negocio. CircleMarker (SVG) en lugar del
 * marker por defecto de Leaflet — evita los assets de icono rotos bajo Vite.
 */
export default function MiniMapa({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: 240, width: "100%", background: "#0b1826" }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker
          center={[lat, lng]}
          radius={9}
          pathOptions={{ color: "#0ea5e9", fillColor: "#0ea5e9", fillOpacity: 0.75, weight: 2 }}
        />
      </MapContainer>
    </div>
  );
}
