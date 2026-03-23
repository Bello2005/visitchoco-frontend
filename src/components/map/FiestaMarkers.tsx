import React from "react";

interface FiestaMarkersProps {
  visible: boolean;
}

export const FiestaMarkers: React.FC<FiestaMarkersProps> = ({ visible }) => {
  if (!visible) return null;
  // TODO: implement festival markers
  return null;
};
