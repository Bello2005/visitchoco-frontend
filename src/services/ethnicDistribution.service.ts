import { api } from "./api.service";

export interface EthnicDistribution {
  id: number;
  municipality_cod_dane: string;
  municipality_name: string;
  municipality_zone: string;
  year: number;
  source: string;
  race_code: string;
  persons_count: number;
  persons_percentage: number;
  lat?: number;
  lon?: number;
  geometry?: GeoJSON.Geometry;
}

export interface EthnicSummary {
  race_code: string;
  total_persons: number;
  average_percentage: number;
  municipalities_count: number;
}

export interface EthnicDistributionByYear {
  year: number;
  race_code: string;
  total_persons: number;
  average_percentage: number;
}

export interface EthnicStats {
  race_code: string;
  municipalities_count: number;
  min_percentage: number;
  max_percentage: number;
  avg_percentage: number;
  total_population: number;
  reference_year: number;
}

class EthnicDistributionService {
  async getAllEthnicDistribution(): Promise<EthnicDistribution[]> {
    const { data } = await api.get<EthnicDistribution[]>("/api/ethnic");
    return data;
  }

  async getEthnicDistributionByMunicipality(codDane: string): Promise<EthnicDistribution[]> {
    const { data } = await api.get<EthnicDistribution[]>(`/api/ethnic/${codDane}`);
    return data;
  }

  async getLatestEthnicSummary(): Promise<EthnicDistribution[]> {
    const { data } = await api.get<EthnicDistribution[]>("/api/ethnic/latest");
    return data;
  }

  async getTotalEthnicSummary(): Promise<EthnicSummary[]> {
    const { data } = await api.get<EthnicSummary[]>("/api/ethnic/summary/total");
    return data;
  }

  async getEthnicDistributionByYear(): Promise<EthnicDistributionByYear[]> {
    const { data } = await api.get<EthnicDistributionByYear[]>("/api/ethnic/summary/by-year");
    return data;
  }

  async getEthnicStats(): Promise<EthnicStats[]> {
    const { data } = await api.get<EthnicStats[]>("/api/ethnic/stats");
    return data;
  }

  getRaceLabel(raceCode: string): string {
    const raceLabels: Record<string, string> = {
      INDIGENA: "Indígena",
      AFRO: "Afrocolombiano",
      ROM: "ROM (Gitano)",
      RAIZAL: "Raizal",
      PALENQUERO: "Palenquero",
      NINGUNO: "Ninguna pertenencia étnica",
      NO_INFORMA: "No informa",
    };
    return raceLabels[raceCode] ?? raceCode;
  }

  getRaceColor(raceCode: string): string {
    const raceColors: Record<string, string> = {
      INDIGENA: "#FF6B6B",
      AFRO: "#4ECDC4",
      ROM: "#FFD93D",
      RAIZAL: "#95E1D3",
      PALENQUERO: "#A8E6CF",
      NINGUNO: "#CCCCCC",
      NO_INFORMA: "#F2F2F2",
    };
    return raceColors[raceCode] ?? "#000000";
  }
}

export const ethnicDistributionService = new EthnicDistributionService();
