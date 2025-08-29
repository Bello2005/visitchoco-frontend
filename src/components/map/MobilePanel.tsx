import React from "react";
import { motion } from "framer-motion";
import type { Municipality } from "../../services/municipality.service";
import SimpleMunicipalitiesList from "../map/SimpleMunicipalitiesList";
import GeneralData from "../map/GeneralData";
import InfoPanel from "../map/InfoPanel";

interface MobilePanelProps {
  isPanelVisible: boolean;
  selectedMunicipality: Municipality | null;
  municipalities: Municipality[];
  onSelectMunicipality: (municipality: Municipality) => void;
  onTogglePanel: () => void;
}

export const MobilePanel: React.FC<MobilePanelProps> = ({
  isPanelVisible,
  selectedMunicipality,
  municipalities,
  onSelectMunicipality,
  onTogglePanel,
}) => {
  return (
    <>
      {/* Panel móvil */}
      {isPanelVisible && (
        <motion.div
          className="fixed bottom-16 left-0 right-0 mx-4 mb-4 bg-white rounded-2xl shadow-lg p-4 z-[999] border border-gray-100 max-h-[50vh]"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="max-h-[40vh] overflow-y-auto">
            {selectedMunicipality ? (
              <div className="space-y-4">
                <GeneralData municipality={selectedMunicipality} />
                <InfoPanel municipality={selectedMunicipality} />
              </div>
            ) : (
              <SimpleMunicipalitiesList
                municipalities={municipalities}
                selectedMunicipality={selectedMunicipality}
                onSelectMunicipality={onSelectMunicipality}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Botón móvil */}
      <motion.button
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg z-[1001]"
        onClick={onTogglePanel}
        whileTap={{ scale: 0.95 }}
      >
        {isPanelVisible ? "↓" : "↑"}
      </motion.button>
    </>
  );
};
