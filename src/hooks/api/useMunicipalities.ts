import { useQuery } from "@tanstack/react-query";
import { municipalityService, type Municipality } from "../../services/municipality.service";

export function useMunicipalities() {
  return useQuery<Municipality[]>({
    queryKey: ["municipalities"],
    queryFn: municipalityService.getAllMunicipalities,
    staleTime: 5 * 60 * 1000, // 5 minutos de caché
  });
}

export function useMunicipalityBySlug(slug: string | null) {
  return useQuery<Municipality>({
    queryKey: ["municipality", slug],
    queryFn: () => municipalityService.getMunicipalityBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
