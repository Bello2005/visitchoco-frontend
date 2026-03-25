import { useState, useEffect } from "react";
import { api } from "../services/api.service";

export interface Fiesta {
  id: number;
  municipio_nombre: string;
  corregimiento: string | null;
  nombre_fiesta: string;
  mes: number;
  fechas_texto: string;
  fecha_inicio_dia: number;
  fecha_fin_dia: number;
  es_principal: boolean;
  lat?: number;
  lon?: number;
  slug?: string;
  image_url?: string;
}

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function useFiestas() {
  const [fiestas, setFiestas] = useState<Fiesta[]>([]);
  const [proximas, setProximas] = useState<Fiesta[]>([]);
  const [loading, setLoading] = useState(true);
  const mesActual = new Date().getMonth() + 1;

  useEffect(() => {
    Promise.all([
      api.get<Fiesta[]>("/api/fiestas").then((r) => r.data).catch(() => []),
      api.get<Fiesta[]>("/api/fiestas/proximas").then((r) => r.data).catch(() => []),
    ]).then(([todas, prox]) => {
      setFiestas(Array.isArray(todas) ? todas : []);
      setProximas(Array.isArray(prox) ? prox : []);
    }).finally(() => setLoading(false));
  }, []);

  const porMes = MESES.reduce((acc, _mes, i) => {
    acc[i + 1] = fiestas.filter((f) => f.mes === i + 1);
    return acc;
  }, {} as Record<number, Fiesta[]>);

  return { fiestas, proximas, porMes, loading, mesActual, MESES };
}
