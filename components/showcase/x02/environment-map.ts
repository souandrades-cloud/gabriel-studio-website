import * as THREE from "three";

/**
 * MATERIAL WORLD V3 INTEGRATION 001 — promovido/adaptado de
 * `x02-lab/material-world-v3/material-world-v3-scene.tsx`
 * (`applyProceduralEnvironment`). `MeshStandardMaterial` com `metalness`
 * alto e sem `scene.environment` renderiza quase preto — metais só
 * refletem, não têm albedo difuso; sem mapa de ambiente não sobra luz
 * nenhuma para refletir (achado do laboratório, confirmado no capitel/
 * sill em metal). Em vez de baixar `metalness` (perderia a resposta
 * especular pedida pelo briefing), gera um gradiente equiretangular de 3
 * cores PROCEDURAL (não uma cena 3D, não HDRI baixado) via
 * `PMREMGenerator` — o mesmo recurso nativo que `<Environment>` do drei
 * usa por baixo, sem adicionar a dependência.
 *
 * Uma única infraestrutura compartilhada (briefing, "Environment": "não
 * duplicar geração por componente") — chamada uma vez em `scene.tsx`
 * dentro de `onCreated` (callback puro do Canvas, não um valor de hook:
 * mutar `scene.environment` fora daqui viola a mesma regra de
 * imutabilidade do React Compiler já documentada no resto do projeto).
 */
export function applyProceduralEnvironment(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size * 2;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#4a5257");
  grad.addColorStop(0.55, "#1c1f22");
  grad.addColorStop(1, "#0a0c10");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size);
  const source = new THREE.CanvasTexture(canvas);
  source.mapping = THREE.EquirectangularReflectionMapping;
  source.colorSpace = THREE.SRGBColorSpace;
  const rt = pmrem.fromEquirectangular(source);
  scene.environment = rt.texture;
  scene.environmentIntensity = 0.85;
  source.dispose();
  pmrem.dispose();
}
