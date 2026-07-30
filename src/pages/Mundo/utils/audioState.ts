// Estado de audio compartido (mismo patrón que vehicleState): un singleton
// mutable que los componentes leen/escriben sin provocar re-renders.
export const audioState = {
  /** Silencio global (lo gobierna el botón de MundoAudio) */
  muted: false,
  /** La chirimía está sonando → el ambiente se agacha para dejarla pasar */
  chirimiaActive: false,
};
