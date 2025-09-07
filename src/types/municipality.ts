import type { Feature, MultiPolygon, Point } from "geojson";

export interface Municipality {
  id: number;
  name: string;
  cod_dane?: string;
  description?: string;
  emoji?: string;
  lat: number;
  lon: number;
  geom?: Feature<Point | MultiPolygon>;
  regionId?: number;
  history?: string;
  culture?: string;
  economy?: string;
  touristic_attractions?: string[];
  festivals?: string[];
  typical_food?: string[];
  how_to_get?: string;
  weather?: string;
  population?: number;
  area?: number;
  temperature?: string;
  altitude?: string;
}
