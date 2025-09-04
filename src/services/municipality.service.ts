import { api } from "./api.service";
import { API_ROUTES } from "../config/api.config";
import type { Feature, Point, MultiPolygon } from "geojson";

interface Attraction {
  name: string;
  description?: string;
  type?: string;
  image_url?: string;
}

interface Transportation {
  type: string;
  description: string;
  schedule?: string;
  price?: string;
}

export interface Municipality {
  id: number;
  cod_dane: string;
  name: string;
  description: string | null;
  image_url: string | null;
  audio_url: string | null;
  lat: number;
  lon: number;
  slug: string;
  emoji: string | null;
  zone: string | null;
  main_activity: string | null;
  cod_dane?: string;
  attractions: Attraction[];
  transportation: Transportation[];
  weather: {
    current?: {
      temp: number;
      weather: string;
      humidity: number;
      obs_time: string;
      pressure: number;
      provider: string;
      feels_like: number;
      wind_speed: number;
    };
    temperature?: string;
    climate?: string;
    rainfall?: string;
  } | null;
  geometry?: Feature<Point | MultiPolygon>;
}

export const municipalityService = {
  getAllMunicipalities: async (): Promise<Municipality[]> => {
    const response = await api.get(API_ROUTES.municipalities);
    return response.data;
  },

  getMunicipalityBySlug: async (slug: string): Promise<Municipality> => {
    const response = await api.get(API_ROUTES.municipalityBySlug(slug));
    return response.data;
  },
};
