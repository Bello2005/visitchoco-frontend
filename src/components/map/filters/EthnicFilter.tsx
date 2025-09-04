import React, { useEffect, useState } from "react";
import type {
  EthnicDistribution,
  EthnicStats,
} from "../../../services/ethnicDistribution.service";
import { ethnicDistributionService } from "../../../services/ethnicDistribution.service";
import { motion } from "framer-motion";

interface Municipality {
  cod_dane?: string;
  name: string;
}

interface EthnicFilterProps {
  selectedMunicipality?: Municipality;
}

export const EthnicFilter: React.FC<EthnicFilterProps> = ({
  selectedMunicipality,
}) => {
  const [ethnicStats, setEthnicStats] = useState<EthnicStats[]>([]);
  const [ethnicDistribution, setEthnicDistribution] = useState<
    EthnicDistribution[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEthnicData = async () => {
      try {
        if (selectedMunicipality?.cod_dane) {
          const data =
            await ethnicDistributionService.getEthnicDistributionByMunicipality(
              selectedMunicipality.cod_dane
            );
          setEthnicDistribution(data);
        } else {
          const stats = await ethnicDistributionService.getEthnicStats();
          setEthnicStats(stats);
        }
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos étnicos");
        setLoading(false);
      }
    };

    fetchEthnicData();
  }, [selectedMunicipality]);

  if (loading) return <div className="p-4">Cargando datos étnicos...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const renderGeneralStats = () => (
    <div className="space-y-4">
      {ethnicStats.map((stat) => (
        <motion.div
          key={stat.race_code}
          className="bg-white p-4 rounded-lg shadow"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-gray-800">
            {ethnicDistributionService.getRaceLabel(stat.race_code)}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              Población total: {stat.total_population.toLocaleString()}{" "}
              habitantes
            </p>
            <p className="text-sm text-gray-600">
              Promedio: {stat.avg_percentage}% de la población
            </p>
            <p className="text-sm text-gray-600">
              Presente en {stat.municipalities_count} municipios
            </p>
            <div className="mt-2">
              <div className="text-xs text-gray-500">Rango de distribución</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  {stat.min_percentage}%
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${stat.avg_percentage}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {stat.max_percentage}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderMunicipalityStats = () => (
    <div className="space-y-4">
      {ethnicDistribution.map((dist) => (
        <motion.div
          key={dist.race_code}
          className="bg-white p-4 rounded-lg shadow"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-gray-800">
            {ethnicDistributionService.getRaceLabel(dist.race_code)}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              Población: {dist.persons_count.toLocaleString()} habitantes
            </p>
            <p className="text-sm text-gray-600">
              {dist.persons_percentage}% de la población
            </p>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${dist.persons_percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {selectedMunicipality
          ? `Distribución Étnica en ${selectedMunicipality.name}`
          : "Distribución Étnica del Chocó"}
      </h2>
      {selectedMunicipality ? renderMunicipalityStats() : renderGeneralStats()}

      {/* Atribución DANE */}
      <div className="mt-6 text-xs text-gray-500 space-y-1 border-t pt-4">
        <p>* Datos basados en el censo poblacional</p>
        <p>
          Fuente:{" "}
          <a
            href="https://www.dane.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            Departamento Administrativo Nacional de Estadística (DANE)
          </a>
        </p>
      </div>
    </div>
  );
};
