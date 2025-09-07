import React from "react";
import type { Municipality } from "../../services/municipality.service";
import { motion } from "framer-motion";

interface SimpleMunicipalitiesListProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onSelectMunicipality: (municipality: Municipality) => void;
}

const SimpleMunicipalitiesList: React.FC<SimpleMunicipalitiesListProps> = ({
  municipalities,
  selectedMunicipality,
  onSelectMunicipality,
}) => {
  return (
    <div className="space-y-2 overflow-y-auto px-0.5 -mx-1">
      {municipalities.map((municipality) => (
        <motion.button
          key={municipality.id}
          className={`group w-full p-3 rounded-xl text-left transition-all duration-200 
            ${
              selectedMunicipality?.id === municipality.id
                ? "bg-gradient-to-r from-blue-50 to-blue-50/50 shadow-sm"
                : "hover:bg-gray-50/80"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1`}
          onClick={() => onSelectMunicipality(municipality)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div
            className={`flex flex-col relative pl-3 ${
              selectedMunicipality?.id === municipality.id
                ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-500 before:rounded-full"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`font-medium transition-colors duration-200 ${
                  selectedMunicipality?.id === municipality.id
                    ? "text-blue-700"
                    : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {municipality.name}
              </h3>
              <motion.div
                animate={{
                  rotate: selectedMunicipality?.id === municipality.id ? 90 : 0,
                }}
                className={`transition-colors duration-200 ${
                  selectedMunicipality?.id === municipality.id
                    ? "text-blue-500"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}
              >
                →
              </motion.div>
            </div>
            {municipality.description && (
              <p
                className={`text-sm mt-1 line-clamp-2 transition-colors duration-200 ${
                  selectedMunicipality?.id === municipality.id
                    ? "text-blue-600/80"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              >
                {municipality.description}
              </p>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default SimpleMunicipalitiesList;
