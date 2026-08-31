import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 1023px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * True abaixo do breakpoint `lg` (1024px) — mesmo corte usado no CSS do
 * site. Usado para reduzir complexidade de cenas pesadas (ex.: geometria 3D)
 * em vez de depender só de `lg:hidden` no CSS, quando o próprio JS precisa
 * saber antes de montar algo caro.
 */
export function useIsMobileViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
