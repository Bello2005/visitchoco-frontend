import { api } from "./api.service";
import { ensureArray } from "../utils/ensureArray";

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
  department_code: number;
  municipality_code: number;
  lat: number;
  lon: number;
  territory_geom: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  } | null;
}

class IndigenousReserveService {
  async getAllIndigenousReserves(): Promise<IndigenousReserve[]> {
    const { data } = await api.get<IndigenousReserve[]>("/api/indigenous");
    return ensureArray<IndigenousReserve>(data);
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
