import { useCallback, useSyncExternalStore } from "react";

/**
 * True enquanto a media query casa. No SSR (e no primeiro paint do cliente)
 * retorna `false` — use para decisões de JS que só valem após a hidratação.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
