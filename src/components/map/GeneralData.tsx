import React from "react";
import { motion } from "framer-motion";
import type { Municipality } from "../../services/municipality.service";

interface GeneralDataProps {
  municipality: Municipality;
}

export const GeneralData: React.FC<GeneralDataProps> = ({ municipality }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        {municipality.emoji || "📍"} {municipality.name}
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-semibold text-gray-700">Información General</h3>
          <p className="text-gray-600">{municipality.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default GeneralData;
