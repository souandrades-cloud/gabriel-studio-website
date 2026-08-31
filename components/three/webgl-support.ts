/**
 * Feature-detect WebGL antes de montar o Canvas — evita criar um contexto
 * fadado a falhar e deixar a Hero com um buraco vazio. Nunca lança; qualquer
 * exceção (navegador travado, contexto bloqueado por política) já conta como
 * "sem suporte".
 */
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}
