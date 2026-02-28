import { api } from "./api.service";

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
  async getAllIndigenousReserves(): Promise<IndigenousReserve[]> {
    const { data } = await api.get<IndigenousReserve[]>("/api/indigenous");
    return data;
  }

  async getIndigenousReserveById(id: number): Promise<IndigenousReserve> {
    const { data } = await api.get<IndigenousReserve>(`/api/indigenous/${id}`);
    return data;
  }

  async getIndigenousReservesByMunicipality(codDane: string): Promise<IndigenousReserve[]> {
    const { data } = await api.get<IndigenousReserve[]>(`/api/indigenous/municipality/${codDane}`);
    return data;
  }
}

export default new IndigenousReserveService();
