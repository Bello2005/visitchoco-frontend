import React, { useEffect, useState } from "react";
import { Users, Map } from "lucide-react";
import { motion } from "framer-motion";
import type {
  EthnicDistribution,
  EthnicStats,
} from "../../../services/ethnicDistribution.service";
import { ethnicDistributionService } from "../../../services/ethnicDistribution.service";

interface EthnicDetailProps {
  codDane?: string;
  municipalityName?: string;
}

export const EthnicDetail: React.FC<EthnicDetailProps> = ({
  codDane,
  municipalityName,
}) => {
  const [stats, setStats] = useState<EthnicStats[]>([]);
  const [distribution, setDistribution] = useState<EthnicDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetch = codDane
      ? ethnicDistributionService.getEthnicDistributionByMunicipality(codDane)
      : ethnicDistributionService.getEthnicStats();

    fetch
      .then((data) => {
        if (codDane) {
          setDistribution(data as EthnicDistribution[]);
          setStats([]);
        } else {
          setStats(data as EthnicStats[]);
          setDistribution([]);
        }
      })
      .catch(() => setError("Error al cargar los datos étnicos"))
      .finally(() => setLoading(false));
  }, [codDane]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-none px-5 pt-5 pb-4 border-b border-gray-100/60">
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        </div>
        <div className="flex-1 px-5 py-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 px-5 text-sm">
        {error}
      </div>
    );
  }

  const items = codDane ? distribution : stats;
  const title = municipalityName
    ? `Distribución Étnica en ${municipalityName}`
    : "Distribución Étnica del Chocó";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-5 pt-5 pb-4 border-b border-gray-100/60">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
            <Users size={14} className="text-teal-500" />
          </div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
        <p className="text-xs text-gray-500">Fuente: DANE — Censo poblacional</p>
        {!codDane && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-600">
            <Map size={12} />
            <span>El mapa muestra el grupo dominante por municipio</span>
          </div>
        )}
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No hay datos disponibles</p>
          </div>
        ) : codDane ? (
          (distribution as EthnicDistribution[]).map((dist) => (
            <EthnicBar
              key={dist.race_code}
              label={ethnicDistributionService.getRaceLabel(dist.race_code)}
              color={ethnicDistributionService.getRaceColor(dist.race_code)}
              percentage={dist.persons_percentage}
              count={dist.persons_count}
            />
          ))
        ) : (
          (stats as EthnicStats[]).map((stat) => (
            <EthnicBar
              key={stat.race_code}
              label={ethnicDistributionService.getRaceLabel(stat.race_code)}
              color={ethnicDistributionService.getRaceColor(stat.race_code)}
              percentage={stat.avg_percentage}
              count={stat.total_population}
              subtitle={`${stat.municipalities_count} municipios · ${stat.min_percentage}–${stat.max_percentage}%`}
            />
          ))
        )}

        {/* DANE attribution */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
          <p>* Datos basados en el censo poblacional</p>
          <p>
            Fuente:{" "}
            <a
              href="https://www.dane.gov.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 underline underline-offset-2"
            >
              DANE
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const EthnicBar: React.FC<{
  label: string;
  color: string;
  percentage: number;
  count: number;
  subtitle?: string;
}> = ({ label, color, percentage, count, subtitle }) => (
  <div className="p-3 bg-gray-50/80 rounded-xl">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-700">{percentage}%</span>
    </div>
    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percentage, 100)}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
    <div className="flex items-center justify-between mt-1.5">
      <p className="text-xs text-gray-500">{count.toLocaleString("es-CO")} personas</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);
