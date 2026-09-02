let cached: boolean | null = null;

/**
 * Feature-detect WebGL antes de montar o Canvas — evita criar um contexto
 * fadado a falhar e deixar a Hero com um buraco vazio. Nunca lança; qualquer
 * exceção (navegador travado, contexto bloqueado por política) já conta como
 * "sem suporte".
 *
 * Memoizado e libera o contexto de teste explicitamente (`WEBGL_lose_context`)
 * em vez de descartar o canvas e confiar em GC: esta função é o `getSnapshot`
 * de `useWebglSupport` (useSyncExternalStore chama `getSnapshot` a cada
 * render, não só na montagem), então sem memoização cada re-render criava um
 * contexto WebGL real e nunca o liberava — dezenas em segundos de scroll
 * normal. Isso esgotava o teto de contextos ativos do Chrome e derrubava o
 * contexto real da cena (falso negativo: "WebGL indisponível" com WebGL
 * plenamente disponível). Achado via diagnóstico instrumentado, WebGL Runtime
 * Diagnostic 001.
 */
export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cached = Boolean(gl);
    if (gl && "getExtension" in gl) {
      (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    }
    return cached;
  } catch {
    cached = false;
    return false;
  }
}
