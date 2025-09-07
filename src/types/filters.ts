export type FilterCategory =
  | "general"
  | "indigenous"
  | "tourism"
  | "animals"
  | "festivals"
  | "ethnic";

export interface Filter {
  id: string;
  name: string;
  category: FilterCategory;
  icon: string;
  description?: string;
}

export interface IndigenousReserve {
  id: string;
  name: string;
  mainEthnicGroup: string;
  latitude: number;
  longitude: number;
  population?: number;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
}

export interface Animal {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  description?: string;
  habitat?: string;
  conservation_status?: string;
  imageUrl?: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  activities?: string[];
}

export interface Festival {
  id: string;
  name: string;
  date: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  type: string;
}
