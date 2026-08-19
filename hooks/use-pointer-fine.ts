import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(pointer: fine)").matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * True only on devices with a precise pointer (mouse/trackpad). Gates
 * cursor-driven effects (spotlight, tilt) that should never run on touch.
 */
export function usePointerFine() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
