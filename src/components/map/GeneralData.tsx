import React from "react";
import type { Region } from "../../data/chocoRegions";
import { motion } from "framer-motion";

interface GeneralDataProps {
  region: Region;
}

export const GeneralData: React.FC<GeneralDataProps> = ({ region }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        {region.emoji} {region.name}
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-semibold text-gray-700">Información General</h3>
          <p className="text-gray-600">{region.description}</p>
          <p className="text-gray-600 mt-2">Población: {region.population}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-semibold text-gray-700">Clima</h3>
          <p className="text-gray-600">
            Temperatura promedio: {region.weather.averageTemp}
          </p>
          <p className="text-gray-600">
            Mejor época para visitar: {region.weather.bestTimeToVisit}
          </p>
          <div className="mt-2">
            <p className="text-gray-700 font-medium">Temporadas de lluvia:</p>
            <ul className="list-disc list-inside text-gray-600">
              {region.weather.rainySeasons.map((season, index) => (
                <li key={index}>{season}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-semibold text-gray-700">Transporte</h3>
          {region.transportation.map((transport, index) => (
            <div key={index} className="mb-2">
              <p className="text-gray-700">
                <span className="font-medium">{transport.type}: </span>
                {transport.description}
              </p>
              <p className="text-sm text-gray-500">
                Disponibilidad: {transport.availability}
              </p>
            </div>
          ))}
        </div>

        {region.contactInfo && (
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-semibold text-gray-700">Contacto</h3>
            {region.contactInfo.emergencyPhone && (
              <p className="text-gray-600">
                Emergencias: {region.contactInfo.emergencyPhone}
              </p>
            )}
            {region.contactInfo.touristOffice && (
              <p className="text-gray-600">
                Oficina de turismo: {region.contactInfo.touristOffice}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GeneralData;
