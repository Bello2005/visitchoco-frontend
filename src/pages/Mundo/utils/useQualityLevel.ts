import { useSyncExternalStore } from "react";
import {
  getChoiceSnapshot,
  getQualitySnapshot,
  subscribeQuality,
} from "./qualityState";

// Reactividad puntual al nivel de calidad. Lo usan SOLO el botón de ajustes y
// PostFX: todo lo demás lee qualityState.profile directamente desde useFrame,
// sin pasar por React.
export function useQualityLevel() {
  return useSyncExternalStore(
    subscribeQuality,
    getQualitySnapshot,
    getQualitySnapshot
  );
}

export function useQualityChoice() {
  return useSyncExternalStore(
    subscribeQuality,
    getChoiceSnapshot,
    getChoiceSnapshot
  );
}
