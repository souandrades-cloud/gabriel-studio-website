import * as THREE from "three";

/**
 * MATERIAL WORLD V3 — vocabulário formal pequeno e reutilizável (briefing,
 * "Form Language V3"): nenhuma HERO geometry deve parecer um
 * `new BoxGeometry(...)` cru. Duas primitivas cobrem todo o laboratório.
 */

/**
 * Caixa com chanfro REAL (não cosmético) nas 12 arestas — mesma técnica de
 * `components/showcase/x02/structure.tsx` (Shape + ExtrudeGeometry), mas
 * com bevel proporcionalmente maior e `curveSegments=1` (facetado, não
 * arredondado): uma aresta de 90° perfeita não pega luz rasante — é
 * exatamente o que denuncia "primitiva de Three.js" (briefing, "Bevel/
 * Chamfer"). Um facet de chanfro cria a linha de highlight que vende volume
 * e materialidade.
 */
export function beveledBoxGeometry(
  width: number,
  height: number,
  depth: number,
  bevel: number,
): THREE.BufferGeometry {
  const b = Math.min(bevel, width / 2 - 0.001, height / 2 - 0.001, depth / 2 - 0.001);
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.lineTo(width / 2, height / 2);
  shape.lineTo(-width / 2, height / 2);
  shape.closePath();
  const flatDepth = Math.max(0.001, depth - b * 2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: flatDepth,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 1,
  });
  geo.translate(0, 0, -flatDepth / 2 - b);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Coluna afunilada (COLUMN V3, opção "taper" do briefing) — nunca um cubo
 * esticado. `CylinderGeometry` com 4 segmentos radiais já produz uma seção
 * quadrada (com `radiusTop !== radiusBottom` = afunilada de verdade, não
 * simulada por escala), mas por padrão calcula normais SUAVES ao redor da
 * "circunferência" (herança do cilindro real) — sob luz rasante isso lê
 * como um blob levemente arredondado, não como quatro faces retas
 * distintas. `toNonIndexed()` desduplica os vértices por triângulo; como
 * cada face passa a não compartilhar vértice com a vizinha,
 * `computeVertexNormals()` deixa de ter o que "suavizar" e produz a normal
 * plana por face — o mesmo truque usado para simular hard-edges sem um
 * shader customizado. `rotateY(PI/4)`: por padrão o primeiro vértice do
 * cilindro fica alinhado ao eixo +X, deixando as 4 faces em diagonal
 * (45°/135°/…); girar 45° alinha as faces a +Z/+X/-Z/-X (frente, lados,
 * fundo), a orientação que uma coluna arquitetônica precisa.
 *
 * `radius` de um polígono de 4 lados inscrito num círculo é a distância ao
 * VÉRTICE, não à face — a distância centro→face (apótema) é `radius *
 * cos(45°) = radius/√2`. Por isso `radiusBottom = bottomWidth/√2` (não
 * `bottomWidth/2`): é o valor que faz a largura face-a-face bater com o
 * parâmetro pedido. `topDepth/topWidth` precisa ser igual a
 * `bottomDepth/bottomWidth` (afunilamento uniforme nos dois eixos) — a
 * escala em Z é uma constante aplicada à coluna inteira, não pode divergir
 * entre topo e base.
 */
export function taperedColumnGeometry(
  bottomWidth: number,
  bottomDepth: number,
  topWidth: number,
  height: number,
): THREE.BufferGeometry {
  const radiusBottom = bottomWidth / Math.SQRT2;
  const radiusTop = topWidth / Math.SQRT2;
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 4, 1, false);
  geo.rotateY(Math.PI / 4);
  geo.scale(1, 1, bottomDepth / bottomWidth);
  const nonIndexed = geo.toNonIndexed();
  geo.dispose();
  nonIndexed.computeVertexNormals();
  nonIndexed.computeBoundingSphere();
  return nonIndexed;
}

/**
 * FRAME V3 · Variant B — header em arco (a "intervenção curva dominante",
 * briefing "Curves"/"Variants"). Reusa a técnica Shape+ExtrudeGeometry de
 * `beveledBoxGeometry`, mas com um FURO em arco (`shape.holes`) em vez de
 * jambas retas: o bloco externo continua um retângulo chanfrado (mesma
 * silhueta geral da Variant A, comparável lado a lado), só o VÃO passa a
 * ser um arco de verdade em vez de uma abertura reta — nenhum CSG/boolean
 * necessário, só um `Path` de furo dentro do `Shape` externo (recurso
 * nativo do three.js). Origem local em (0,0) = springline (linha de
 * nascença do arco, onde ele encontra o topo das jambas retas).
 */
export function archedHeaderGeometry(
  outerWidth: number,
  outerHeight: number,
  archRadius: number,
  thickness: number,
  bevel: number,
): THREE.BufferGeometry {
  const halfW = outerWidth / 2;
  const outer = new THREE.Shape();
  outer.moveTo(-halfW, 0);
  outer.lineTo(halfW, 0);
  outer.lineTo(halfW, outerHeight);
  outer.lineTo(-halfW, outerHeight);
  outer.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, archRadius, 0, Math.PI, false);
  outer.holes.push(hole);
  const b = Math.min(bevel, thickness / 2 - 0.001);
  const flatDepth = Math.max(0.001, thickness - b * 2);
  const geo = new THREE.ExtrudeGeometry(outer, {
    depth: flatDepth,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 14,
  });
  geo.translate(0, 0, -flatDepth / 2 - b);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Ruído procedural leve para `roughnessMap` (briefing, "Textures": só
 * depois de testar geometria+material+luz; se ainda faltar materialidade,
 * UMA textura leve, não pesada). 96×96, sem asset externo, gerada uma vez
 * e compartilhada por todos os materiais "stone" — quebra a leitura de
 * "solid color object" com microvariação física (briefing, "more alive" →
 * "microvariação física"), sem introduzir peso de rede.
 */
let sharedRoughnessNoise: THREE.CanvasTexture | null = null;
export function roughnessNoiseTexture(): THREE.CanvasTexture {
  if (sharedRoughnessNoise) return sharedRoughnessNoise;
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#8c8c8c";
  ctx.fillRect(0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const grain = 140 + Math.random() * 100;
    image.data[i] = grain;
    image.data[i + 1] = grain;
    image.data[i + 2] = grain;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  sharedRoughnessNoise = texture;
  return texture;
}
