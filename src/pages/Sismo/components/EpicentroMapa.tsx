/**
 * Mini mapa del epicentro. Clon del patrón de `Negocio/MiniMapa.tsx`.
 *
 * Dos detalles que no se pueden copiar sin más de allí:
 *
 * 1. `CircleMarker` en lugar del marker por defecto — los assets de icono
 *    de Leaflet están rotos bajo Vite.
 * 2. La atribución de OpenStreetMap SÍ se pinta. `MiniMapa` desactiva el
 *    control de atribución y no la repone; omitirla incumple la licencia
 *    ODbL, y en una página de interés público eso no es negociable.
 *
 * `Circle` mide su radio en METROS; `CircleMarker` en píxeles. El anillo
 * del radio sentido tiene que ser `Circle`.
 */

import "leaflet/dist/leaflet.css";
import { Circle, CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import { EPICENTRO, RADIO_SENTIDO_M } from "../../../content/sismoData";

export default function EpicentroMapa() {
  const centro: [number, number] = [EPICENTRO.lat, EPICENTRO.lon];

  return (
    <div>
      <div
        className="overflow-hidden rounded-2xl border border-white/[0.08]"
        // El canvas de Leaflet no es legible por un lector de pantalla; la
        // misma información está en texto justo encima.
        aria-hidden="true"
      >
        <MapContainer
          center={centro}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: 320, width: "100%", background: "#0c0d0f" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Radio aproximado dentro del que se sintió con fuerza. En metros. */}
          <Circle
            center={centro}
            radius={RADIO_SENTIDO_M}
            pathOptions={{
              color: "#e0563a",
              fillColor: "#e0563a",
              fillOpacity: 0.06,
              weight: 1,
              dashArray: "4 6",
            }}
          />

          {/* Epicentro. Radio en píxeles. */}
          <CircleMarker
            center={centro}
            radius={7}
            pathOptions={{
              color: "#e0563a",
              fillColor: "#e0563a",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        </MapContainer>
      </div>

      <p className="mt-2 text-micro text-white/55">
        Mapa ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/70 transition-colors"
        >
          colaboradores de OpenStreetMap
        </a>
        . El círculo punteado marca unos 400 km alrededor del epicentro.
      </p>
    </div>
  );
}
