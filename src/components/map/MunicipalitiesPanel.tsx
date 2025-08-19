import React from "react";
import type { Region } from "../../data/chocoRegions";
import { MainActivityIcons, ZoneColors } from "../../data/chocoRegions";
import { motion } from "framer-motion";

interface MunicipalitiesPanelProps {
  regions: Region[];
  onSelectRegion: (region: Region) => void;
  selectedRegion?: Region;
}

export const MunicipalitiesPanel: React.FC<MunicipalitiesPanelProps> = ({
  regions,
  onSelectRegion,
  selectedRegion,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Municipios del Chocó</h2>
      <div className="space-y-3">
        {regions.map((region) => (
          <motion.div
            key={region.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRegion(region)}
            className={`cursor-pointer p-3 rounded-lg transition-colors ${
              selectedRegion?.id === region.id
                ? "bg-blue-50 border-2 border-blue-500"
                : "bg-gray-50 hover:bg-gray-100"
            } shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{region.emoji}</span>
                <div>
                  <h3 className="font-medium">{region.name}</h3>
                  <p className="text-sm text-gray-600">{region.population}</p>
                </div>
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: ZoneColors[region.zone],
                  color: "white",
                }}
              >
                {region.zone}
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{MainActivityIcons[region.mainActivity]}</span>
                <span className="capitalize">{region.mainActivity}</span>
              </div>
            </div>

            {region.attractions && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {region.attractions.length} atracciones principales
                </p>
              </div>
            )}

            {region.transportation && (
              <div className="mt-2 flex flex-wrap gap-1">
                {region.transportation.map((transport, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-200 rounded-full"
                  >
                    {transport.type}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MunicipalitiesPanel;
