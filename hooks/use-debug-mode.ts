import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return new URLSearchParams(window.location.search).has("debug");
}

function getServerSnapshot() {
  return false;
}

/**
 * True when the page URL carries `?debug`. Same SSR-safe pattern as
 * `useMounted`/`useWebglSupport`: false on the server and first client
 * paint, real value right after — never flips mid-session (a static
 * per-load flag, not a live toggle), so a no-op `subscribe` is correct.
 * Gate for dev-only instrumentation that must never reach production users.
 */
export function useDebugMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
