import { API_BASE_URL } from "../config/api.config";

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
  geometry?: any;
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
  // Obtener toda la distribución étnica
  async getAllEthnicDistribution(): Promise<EthnicDistribution[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ethnic`);
      if (!response.ok) {
        throw new Error("Error al obtener la distribución étnica");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Obtener distribución étnica por municipio
  async getEthnicDistributionByMunicipality(
    codDane: string
  ): Promise<EthnicDistribution[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ethnic/${codDane}`);
      if (!response.ok) {
        throw new Error(
          "Error al obtener la distribución étnica del municipio"
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Obtener el resumen étnico más reciente
  async getLatestEthnicSummary(): Promise<EthnicDistribution[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ethnic/latest`);
      if (!response.ok) {
        throw new Error("Error al obtener el resumen étnico");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Obtener resumen total por etnia
  async getTotalEthnicSummary(): Promise<EthnicSummary[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ethnic/summary/total`);
      if (!response.ok) {
        throw new Error("Error al obtener el resumen total por etnia");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Obtener distribución étnica por año
  async getEthnicDistributionByYear(): Promise<EthnicDistributionByYear[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ethnic/summary/by-year`);
      if (!response.ok) {
        throw new Error("Error al obtener la distribución étnica por año");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Obtener estadísticas generales de distribución étnica
  async getEthnicStats(): Promise<EthnicStats[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ethnic/stats`);
      if (!response.ok) {
        throw new Error("Error al obtener las estadísticas étnicas");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Método auxiliar para obtener el nombre del grupo étnico según el código
  getRaceLabel(raceCode: string): string {
    const raceLabels: { [key: string]: string } = {
      INDIGENA: "Indígena",
      AFRO: "Afrocolombiano",
      ROM: "ROM (Gitano)",
      RAIZAL: "Raizal",
      PALENQUERO: "Palenquero",
      NINGUNO: "Ninguna pertenencia étnica",
      NO_INFORMA: "No informa",
    };
    return raceLabels[raceCode] || raceCode;
  }

  // Método para obtener un color representativo para cada grupo étnico
  getRaceColor(raceCode: string): string {
    const raceColors: { [key: string]: string } = {
      INDIGENA: "#FF6B6B", // Rojo suave
      AFRO: "#4ECDC4", // Turquesa
      ROM: "#FFD93D", // Amarillo
      RAIZAL: "#95E1D3", // Verde agua
      PALENQUERO: "#A8E6CF", // Verde menta
      NINGUNO: "#CCCCCC", // Gris
      NO_INFORMA: "#F2F2F2", // Gris claro
    };
    return raceColors[raceCode] || "#000000";
  }
}

export const ethnicDistributionService = new EthnicDistributionService();
