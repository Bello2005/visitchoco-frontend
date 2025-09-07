import React from "react";
import type { EthnicDistribution } from "../../services/ethnicDistribution.service";
import { ethnicDistributionService } from "../../services/ethnicDistribution.service";

interface EthnicDetailsProps {
  distributions: EthnicDistribution[];
  year: number;
}

export const EthnicDetails: React.FC<EthnicDetailsProps> = ({
  distributions,
  year,
}) => {
  // Agrupar por grupo étnico para mostrar los porcentajes
  const groupedData = distributions.reduce((acc, curr) => {
    if (curr.year === year) {
      acc[curr.race_code] = {
        count: curr.persons_count,
        percentage: curr.persons_percentage,
        label: ethnicDistributionService.getRaceLabel(curr.race_code),
        color: ethnicDistributionService.getRaceColor(curr.race_code),
      };
    }
    return acc;
  }, {} as Record<string, { count: number; percentage: number; label: string; color: string }>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Distribución Étnica ({year})
      </h3>

      <div className="space-y-3">
        {Object.entries(groupedData).map(([raceCode, data]) => (
          <div
            key={raceCode}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/60 transition-all hover:bg-white/90"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.color }}
                />
                <span className="font-medium text-gray-700">{data.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-600">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                  <div
                    style={{
                      width: `${data.percentage}%`,
                      backgroundColor: data.color,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.count.toLocaleString("es-CO")} personas
            </p>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-4 space-y-1">
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
