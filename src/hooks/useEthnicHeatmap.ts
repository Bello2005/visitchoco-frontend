import { useEffect, useState } from "react";
import { ethnicDistributionService } from "../services/ethnicDistribution.service";
import type { EthnicDistribution } from "../services/ethnicDistribution.service";

export interface HeatmapEntry {
  raceCode: string;
  percentage: number;
}

/**
 * Fetches all ethnic distribution data and returns a map of
 * cod_dane → dominant ethnic group for each municipality.
 * Only fetches when `enabled` is true (e.g. when the "ethnic" filter is active).
 */
export function useEthnicHeatmap(enabled: boolean): Map<string, HeatmapEntry> {
  const [heatmap, setHeatmap] = useState<Map<string, HeatmapEntry>>(new Map());

  useEffect(() => {
    if (!enabled) return;
    ethnicDistributionService
      .getAllEthnicDistribution()
      .then((data: EthnicDistribution[]) => {
        // Group rows by municipality
        const byMunicipality = new Map<string, EthnicDistribution[]>();
        for (const row of data) {
          const existing = byMunicipality.get(row.municipality_cod_dane) ?? [];
          existing.push(row);
          byMunicipality.set(row.municipality_cod_dane, existing);
        }

        // Pick the group with the highest percentage per municipality
        const result = new Map<string, HeatmapEntry>();
        byMunicipality.forEach((rows, codDane) => {
          const dominant = rows.reduce((prev, curr) =>
            curr.persons_percentage > prev.persons_percentage ? curr : prev
          );
          result.set(codDane, {
            raceCode: dominant.race_code,
            percentage: dominant.persons_percentage,
          });
        });

        setHeatmap(result);
      })
      .catch(() => {
        // Fail silently — map renders without heatmap colors
      });
  }, [enabled]);

  return heatmap;
}
