import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useFiestas } from "../../hooks/useFiestas";

const fiestasIcon = (esPrincipal: boolean) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:${esPrincipal ? 36 : 28}px;
        height:${esPrincipal ? 36 : 28}px;
        background:${esPrincipal
          ? "linear-gradient(135deg,#f59e0b,#d97706)"
          : "linear-gradient(135deg,#fbbf24,#f59e0b)"};
        border:2px solid white;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:${esPrincipal ? 18 : 14}px;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
      ">🎭</div>
    `,
    iconSize: [esPrincipal ? 36 : 28, esPrincipal ? 36 : 28],
    iconAnchor: [esPrincipal ? 18 : 14, esPrincipal ? 18 : 14],
  });

interface FiestaMarkersProps {
  visible: boolean;
}

export const FiestaMarkers: React.FC<FiestaMarkersProps> = ({ visible }) => {
  const { fiestas } = useFiestas();

  if (!visible) return null;

  const conCoords = fiestas.filter((f) => f.lat && f.lon);

  return (
    <>
      {conCoords.map((fiesta) => (
        <Marker
          key={fiesta.id}
          position={[fiesta.lat!, fiesta.lon!]}
          icon={fiestasIcon(fiesta.es_principal)}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: "#92400e" }}>
                {fiesta.nombre_fiesta}
              </p>
              <p style={{ fontSize: 12, color: "#b45309" }}>
                {fiesta.municipio_nombre}
                {fiesta.corregimiento ? ` · ${fiesta.corregimiento}` : ""}
              </p>
              <p style={{ fontSize: 11, marginTop: 4, color: "#78716c", fontStyle: "italic" }}>
                📅 {fiesta.fechas_texto}
              </p>
              {fiesta.es_principal && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    fontSize: 10,
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  ⭐ Fiesta principal
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};
