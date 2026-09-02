import * as THREE from "three";

/**
 * MATERIAL WORLD V3 INTEGRATION 001 — promovido/adaptado de
 * `x02-lab/material-world-v3/geometry.ts` (mesma lógica validada no
 * laboratório; o lab em si continua intocado e isolado). Vocabulário
 * formal compartilhado por THRESHOLD/DESCENT/CHAMBER: nenhuma geometria
 * HERO deve parecer um `new BoxGeometry(...)` cru.
 */

/**
 * Caixa com chanfro REAL (não cosmético) nas 12 arestas — Shape +
 * ExtrudeGeometry com `curveSegments=1` (facetado, não arredondado): a
 * aresta reta de 90° não pega luz rasante nenhuma; o facet do chanfro cria
 * a linha de highlight que vende volume/materialidade.
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
 * Coluna afunilada — nunca um cubo esticado por `mesh.scale` (é exatamente
 * essa escala não-uniforme por instância que quebra o normal-transform do
 * three.js e força o workaround `emissive` documentado em chamber.tsx/
 * interior.tsx). Aqui a proporção inteira (base/topo/altura) é assada na
 * PRÓPRIA geometria — a mesh final só precisa de position/rotation, nunca
 * scale — eliminando o defeito pela raiz para quem a usa.
 *
 * `CylinderGeometry` de 4 segmentos radiais = seção quadrada; por padrão
 * calcula normais suaves ao redor da "circunferência" (herança do
 * cilindro), lendo como um blob arredondado sob luz rasante.
 * `toNonIndexed()` desduplica vértices por triângulo — cada face deixa de
 * compartilhar vértice com a vizinha, então `computeVertexNormals()` não
 * tem o que suavizar e produz normal plana por face (hard-edges sem shader
 * customizado). `rotateY(PI/4)`: o cilindro nasce com o primeiro vértice em
 * +X (faces em diagonal); girar 45° alinha as 4 faces a +Z/+X/-Z/-X.
 *
 * `radius` de um polígono de 4 lados inscrito num círculo é a distância ao
 * VÉRTICE, não à face — a distância centro→face (apótema) é
 * `radius*cos(45°) = radius/√2`; por isso `radiusBottom = bottomWidth/√2`
 * (não `bottomWidth/2`), o valor que faz a largura face-a-face bater com o
 * parâmetro pedido.
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
 * Ruído procedural leve para `roughnessMap` — 96×96, canvas gerado uma vez
 * e compartilhado por todos os materiais "stone" da jornada (uma única
 * textura para o X02 inteiro, nunca duplicada por componente). Quebra a
 * leitura de "solid color object" com microvariação física, sem asset
 * externo nem peso de rede.
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
