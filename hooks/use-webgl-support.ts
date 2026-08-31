import { useSyncExternalStore } from "react";

import { hasWebGL } from "@/components/three/webgl-support";

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

/**
 * Suporte a WebGL, lido de forma segura para hidratação (mesmo padrão de
 * `useMounted`/`usePointerFine`): false no servidor e no primeiro paint do
 * cliente, valor real logo em seguida — nunca dispara setState dentro de um
 * efeito.
 */
export function useWebglSupport() {
  return useSyncExternalStore(subscribe, hasWebGL, getServerSnapshot);
}
