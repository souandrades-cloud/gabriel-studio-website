import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * True once hydrated on the client, false during SSR and the first client
 * paint. Use to gate values that must stay SSR/client-render identical
 * (e.g. scroll-linked motion) without triggering a hydration mismatch.
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
