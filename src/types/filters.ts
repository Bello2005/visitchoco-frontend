export type FilterType = "general" | "indigenous" | "tourism";

export interface IndigenousReserve {
  id: string;
  name: string;
  mainEthnicGroup?: string;
  population?: number;
  description?: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  imageUrl?: string;
}
