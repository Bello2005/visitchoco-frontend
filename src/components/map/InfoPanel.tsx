import React from "react";
import type { Region } from "../../data/chocoRegions";
import { ZoneColors } from "../../data/chocoRegions";
import { motion } from "framer-motion";

interface InfoPanelProps {
  region: Region;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ region }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100"
      style={{
        borderLeft: `4px solid ${ZoneColors[region.zone]}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {region.emoji} {region.name}
        </h2>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: ZoneColors[region.zone],
            color: "white",
          }}
        >
          {region.zone}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Atracciones Principales
          </h3>
          <div className="space-y-3">
            {region.attractions.map((attraction, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium">{attraction.name}</h4>
                <p className="text-sm text-gray-600">
                  {attraction.description}
                </p>
                {attraction.bestSeason && (
                  <p className="text-sm text-gray-500 mt-1">
                    Mejor temporada: {attraction.bestSeason}
                  </p>
                )}
                {attraction.accessibility && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">
                      Accesibilidad:
                    </p>
                    <ul className="text-sm text-gray-600">
                      {attraction.accessibility.wheelchairAccessible && (
                        <li>✓ Accesible en silla de ruedas</li>
                      )}
                      {attraction.accessibility.guidedToursAvailable && (
                        <li>✓ Tours guiados disponibles</li>
                      )}
                      {attraction.accessibility.parkingAvailable && (
                        <li>✓ Estacionamiento disponible</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {region.accessibility && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Accesibilidad General
            </h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <ul className="space-y-1 text-gray-600">
                {region.accessibility.wheelchairAccessible && (
                  <li>✓ Accesible en silla de ruedas</li>
                )}
                {region.accessibility.recommendedSeason && (
                  <li>
                    Temporada recomendada:{" "}
                    {region.accessibility.recommendedSeason}
                  </li>
                )}
                {region.accessibility.difficulty && (
                  <li>Dificultad: {region.accessibility.difficulty}</li>
                )}
                {region.accessibility.languages && (
                  <li>
                    Idiomas disponibles:{" "}
                    {region.accessibility.languages.join(", ")}
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {region.popularTimes && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Horarios Populares</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              {Object.entries(region.popularTimes).map(([day, hours]) => (
                <div key={day} className="mb-2">
                  <p className="font-medium">{day}</p>
                  <div className="h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.max(...hours)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InfoPanel;
