import { useState, useEffect } from "react";

interface UseFeatureRotationProps {
  featuresLength: number;
  interval?: number;
}

export const useFeatureRotation = ({
  featuresLength,
  interval = 5000,
}: UseFeatureRotationProps) => {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setActiveFeature((current) => (current + 1) % featuresLength);
    }, interval);
    return () => clearInterval(rotationInterval);
  }, [featuresLength, interval]);

  return activeFeature;
};
