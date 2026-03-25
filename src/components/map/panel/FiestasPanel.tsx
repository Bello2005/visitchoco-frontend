import React from "react";
import { useFiestas } from "../../../hooks/useFiestas";

const COLORES_MES: Record<number, string> = {
  1: "bg-blue-50 border-blue-100",
  2: "bg-pink-50 border-pink-100",
  3: "bg-green-50 border-green-100",
  4: "bg-purple-50 border-purple-100",
  5: "bg-red-50 border-red-100",
  6: "bg-yellow-50 border-yellow-100",
  7: "bg-orange-50 border-orange-100",
  8: "bg-amber-50 border-amber-100",
  9: "bg-teal-50 border-teal-100",
  10: "bg-rose-50 border-rose-100",
  11: "bg-indigo-50 border-indigo-100",
  12: "bg-emerald-50 border-emerald-100",
};

export const FiestasPanel: React.FC = () => {
  const { proximas, porMes, loading, mesActual, MESES } = useFiestas();

  if (loading)
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );

  const mesesOrdenados = Array.from({ length: 12 }, (_, i) => ((mesActual - 1 + i) % 12) + 1).filter(
    (m) => (porMes[m] || []).length > 0
  );

  return (
    <div className="flex flex-col h-full">
      {/* Próximas fiestas */}
      {proximas.length > 0 && (
        <div className="flex-none px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Próximas fiestas
          </p>
          <div className="space-y-2">
            {proximas.slice(0, 3).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-2.5 bg-amber-50 border border-amber-100 rounded-2xl"
              >
                <span className="text-xl flex-shrink-0">🎭</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900 truncate">
                    {f.nombre_fiesta}
                  </p>
                  <p className="text-xs text-amber-600 truncate">
                    {f.municipio_nombre} · {f.fechas_texto}
                  </p>
                </div>
                {f.es_principal && (
                  <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    ⭐
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="h-px bg-gray-100 mt-3" />
        </div>
      )}

      {/* Calendario completo */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar space-y-4 pt-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Calendario completo
        </p>
        {mesesOrdenados.map((mes) => (
          <div key={mes}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold text-gray-700">{MESES[mes - 1]}</p>
              {mes === mesActual && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  Este mes
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {(porMes[mes] || []).map((fiesta) => (
                <div
                  key={fiesta.id}
                  className={`p-3 border rounded-xl ${COLORES_MES[mes] ?? "bg-gray-50 border-gray-100"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">
                        {fiesta.nombre_fiesta}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fiesta.municipio_nombre}
                        {fiesta.corregimiento ? ` · ${fiesta.corregimiento}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-gray-600">{fiesta.fechas_texto}</p>
                      {fiesta.es_principal && (
                        <span className="text-xs text-amber-600 font-semibold">⭐ Principal</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
