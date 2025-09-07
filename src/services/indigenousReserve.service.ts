import { API_BASE_URL } from "../config/api.config";

export interface IndigenousReserve {
  id: number;
  name: string;
  administrative_act_type: string;
  administrative_act_number: string;
  administrative_act_date: string;
  total_area: number;
  plan_number: string;
  indigenous_people: string;
  cod_dane: string;
  latitude: number;
  longitude: number;
  lng: number;
  municipality: string;
  territory_geom: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  };
  mainEthnicGroup?: string;
  population?: number;
  description?: string;
}

class IndigenousReserveService {
  // Obtener todas las reservas indígenas
  async getAllIndigenousReserves(): Promise<IndigenousReserve[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/indigenous`);
      if (!response.ok) {
        throw new Error("Error al obtener las reservas indígenas");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Obtener reserva indígena por ID
  async getIndigenousReserveById(id: number): Promise<IndigenousReserve> {
    try {
      const response = await fetch(`${API_BASE_URL}/indigenous/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener la reserva indígena");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Obtener reservas indígenas por municipio
  async getIndigenousReservesByMunicipality(
    codDane: string
  ): Promise<IndigenousReserve[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/indigenous/municipality/${codDane}`
      );
      if (!response.ok) {
        throw new Error(
          "Error al obtener las reservas indígenas del municipio"
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}

export default new IndigenousReserveService();
