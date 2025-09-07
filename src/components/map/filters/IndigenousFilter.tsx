import React, { useEffect, useState } from "react";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import indigenousReserveService from "../../../services/indigenousReserve.service";
import { motion } from "framer-motion";

interface Municipality {
  cod_dane: string;
  name: string;
}

interface IndigenousFilterProps {
  onSelect: (reserve: IndigenousReserve) => void;
  selectedMunicipality?: Municipality;
}

export const IndigenousFilter: React.FC<IndigenousFilterProps> = ({
  onSelect,
  selectedMunicipality,
}) => {
  const [reserves, setReserves] = useState<IndigenousReserve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReserves = async () => {
      try {
        // Si tenemos un municipio seleccionado, buscamos sus reservas
        if (selectedMunicipality?.cod_dane) {
          const data =
            await indigenousReserveService.getIndigenousReservesByMunicipality(
              selectedMunicipality.cod_dane
            );
          setReserves(data);
        } else {
          // Si no hay municipio seleccionado, mostramos todas las reservas
          const data =
            await indigenousReserveService.getAllIndigenousReserves();
          setReserves(data);
        }
        setLoading(false);
      } catch (err) {
        setError("Error al cargar las reservas indígenas");
        setLoading(false);
      }
    };

    fetchReserves();
  }, [selectedMunicipality]);

  if (loading) return <div className="p-4">Cargando reservas indígenas...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Reservas Indígenas</h2>
      <div className="space-y-4">
        {reserves.length === 0 ? (
          <p className="text-gray-500">
            {selectedMunicipality
              ? `No hay reservas indígenas registradas en ${selectedMunicipality.name}.`
              : "No hay reservas indígenas registradas."}
          </p>
        ) : (
          reserves.map((reserve) => (
            <motion.div
              key={reserve.id}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
              onClick={() => onSelect(reserve)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="font-semibold">{reserve.name}</h3>
              <p className="text-sm text-gray-600">
                Pueblo: {reserve.indigenous_people}
              </p>
              <p className="text-sm text-gray-600">
                Área total: {reserve.total_area?.toFixed(2)} hectáreas
              </p>
              {reserve.administrative_act_number && (
                <p className="text-xs text-gray-500">
                  Acto administrativo: {reserve.administrative_act_type}{" "}
                  {reserve.administrative_act_number}
                  {reserve.administrative_act_date &&
                    ` (${new Date(
                      reserve.administrative_act_date
                    ).toLocaleDateString()})`}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
