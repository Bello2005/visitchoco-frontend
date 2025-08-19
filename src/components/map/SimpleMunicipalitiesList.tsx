import React from "react";
import type { Region } from "../../data/chocoRegions";
import { motion } from "framer-motion";
import { ZoneColors } from "../../data/chocoRegions";

interface SimpleMunicipalitiesListProps {
  regions: Region[];
  selectedRegion?: Region;
  onSelectRegion: (region: Region) => void;
}

export const SimpleMunicipalitiesList: React.FC<
  SimpleMunicipalitiesListProps
> = ({ regions, selectedRegion, onSelectRegion }) => {
  return (
    <div className="space-y-2 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
      {regions.map((region) => (
        <motion.button
          key={region.id}
          onClick={() => onSelectRegion(region)}
          className={`w-full text-left p-2 rounded-lg transition-all flex items-center gap-2 ${
            selectedRegion?.id === region.id
              ? "bg-blue-50 border border-blue-200"
              : "hover:bg-gray-50"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xl">{region.emoji}</span>
          <div className="flex-grow">
            <span className="block text-gray-800">{region.name}</span>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: ZoneColors[region.zone] }}
          />
        </motion.button>
      ))}
    </div>
  );
};

export default SimpleMunicipalitiesList;
