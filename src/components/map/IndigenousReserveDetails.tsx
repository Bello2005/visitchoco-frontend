import React from 'react';
import type { IndigenousReserve } from '../../services/indigenousReserve.service';

interface IndigenousReserveDetailsProps {
  reserve: IndigenousReserve;
}

export const IndigenousReserveDetails: React.FC<IndigenousReserveDetailsProps> = ({ reserve }) => {
  const formatArea = (area: number | string | null | undefined): string => {
    if (area === null || area === undefined) return 'No disponible';
    const numArea = typeof area === 'string' ? parseFloat(area) : area;
    return isNaN(numArea) ? 'No disponible' : `${numArea.toFixed(2)} hectáreas`;
  };

  const formatCoordinate = (coord: number | string | null | undefined): string => {
    if (coord === null || coord === undefined) return 'No disponible';
    const numCoord = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(numCoord) ? 'No disponible' : numCoord.toFixed(6);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{reserve.name}</h2>
      
      {reserve.indigenous_people && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Pueblo Indígena</h3>
          <p className="text-lg text-gray-800">{reserve.indigenous_people}</p>
        </div>
      )}

      {reserve.total_area !== undefined && reserve.total_area !== null && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Área Total</h3>
          <p className="text-lg text-gray-800">{formatArea(reserve.total_area)}</p>
        </div>
      )}

      {reserve.administrative_act_type && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Acto Administrativo</h3>
          <p className="text-lg text-gray-800">
            {reserve.administrative_act_type} {reserve.administrative_act_number}
            {reserve.administrative_act_date && 
              ` (${new Date(reserve.administrative_act_date).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })})`
            }
          </p>
        </div>
      )}

      {reserve.plan_number && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Número de Plan</h3>
          <p className="text-lg text-gray-800">{reserve.plan_number}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-600">Ubicación</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {(reserve.lat !== undefined || reserve.latitude !== undefined) && (
            <div>
              <p className="text-sm text-gray-600">Latitud</p>
              <p className="text-lg text-gray-800">
                {formatCoordinate(reserve.lat ?? reserve.latitude)}
              </p>
            </div>
          )}
          {(reserve.lng !== undefined || reserve.longitude !== undefined) && (
            <div>
              <p className="text-sm text-gray-600">Longitud</p>
              <p className="text-lg text-gray-800">
                {formatCoordinate(reserve.lng ?? reserve.longitude)}
              </p>
            </div>
          )}
        </div>
      </div>

      {reserve.municipality && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Municipio</h3>
          <p className="text-lg text-gray-800">{reserve.municipality}</p>
        </div>
      )}
    </div>
  );
};
