/**
 * Descarte persistente del aviso global de emergencia.
 *
 * Sigue el patrón de `useFavorites.ts`: lectura perezosa en el
 * inicializador de `useState` (nunca en un efecto, o el banner aparecería
 * después de la primera pintura), `try/catch` tragándose el error en
 * ambos sentidos, y listener de `storage` para varias pestañas.
 *
 * El valor guardado es `"<id>@<rev>"`. Subir la revisión del aviso lo
 * hace reaparecer a quien ya lo había descartado, que es lo que se quiere
 * cuando el mensaje cambia materialmente.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "visitchoco.alerta.v1";

function marca(id: string, rev: number): string {
  return `${id}@${rev}`;
}

function read(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Modo privado o almacenamiento no disponible. Un throw aquí lo
    // capturaría el ErrorBoundary y blanquearía la app entera.
    return null;
  }
}

function write(valor: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, valor);
  } catch {
    // Cuota excedida o no disponible — el banner simplemente reaparecerá.
  }
}

export function useDismissibleAlert(id: string, rev: number) {
  const [descartado, setDescartado] = useState<string | null>(() => read());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setDescartado(read());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const dismiss = useCallback(() => {
    const valor = marca(id, rev);
    write(valor);
    setDescartado(valor);
  }, [id, rev]);

  return {
    visible: descartado !== marca(id, rev),
    dismiss,
  };
}
