import React from "react";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";

interface ReserveDetailProps {
  reserve: IndigenousReserve;
}

export const ReserveDetail: React.FC<ReserveDetailProps> = ({ reserve }) => {
  const formatArea = (area: number | string | null | undefined): string => {
    if (area == null) return "No disponible";
    const n = typeof area === "string" ? parseFloat(area) : area;
    return isNaN(n) ? "No disponible" : `${n.toLocaleString("es-CO", { maximumFractionDigits: 2 })} ha`;
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "No disponible";
    try {
      return new Date(dateStr).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-5 pt-5 pb-4 border-b border-gray-100/60">
        <div className="flex items-start gap-3">
          <span className="text-4xl flex-shrink-0">🏺</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{reserve.name}</h2>
            {reserve.indigenous_people && (
              <p className="text-sm text-amber-700 font-medium mt-0.5">
                Pueblo {reserve.indigenous_people}
              </p>
            )}
          </div>
        </div>

        {/* Area badge */}
        {reserve.total_area != null && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl">
            <span className="text-lg">🗺️</span>
            <span className="text-sm font-semibold text-amber-800">
              {formatArea(reserve.total_area)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
        {/* Acto Administrativo */}
        {reserve.administrative_act_type && (
          <InfoBlock
            label="Acto Administrativo"
            icon="📋"
            value={`${reserve.administrative_act_type} ${reserve.administrative_act_number ?? ""} — ${formatDate(reserve.administrative_act_date)}`}
          />
        )}

        {/* Plan */}
        {reserve.plan_number && (
          <InfoBlock label="Número de Plan" icon="📄" value={reserve.plan_number} />
        )}

        {/* Ubicación */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span>📌</span>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ubicación</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Latitud</p>
              <p className="text-sm font-mono font-medium text-gray-800">
                {reserve.lat != null ? Number(reserve.lat).toFixed(6) : "–"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Longitud</p>
              <p className="text-sm font-mono font-medium text-gray-800">
                {reserve.lon != null ? Number(reserve.lon).toFixed(6) : "–"}
              </p>
            </div>
          </div>
        </div>

        {/* DANE */}
        {reserve.cod_dane && (
          <InfoBlock label="Código DANE" icon="🔢" value={reserve.cod_dane} />
        )}
      </div>
    </div>
  );
};

const InfoBlock: React.FC<{ label: string; icon: string; value: string }> = ({
  label,
  icon,
  value,
}) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1.5">
      <span>{icon}</span>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</h3>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
  </div>
);
