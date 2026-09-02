"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * LIGHT FOUNDATION 001 — a key light casts sombra sobre uma jornada de
 * ~150 unidades em Z (SURFACE z=62 até CORE z=-60). Uma shadow camera
 * ortográfica ESTÁTICA cobrindo esse alcance inteiro precisaria de um
 * frustum gigantesco — na prática, esmagaria a resolução do shadow map a
 * ponto de a sombra ficar serrilhada/inútil em qualquer ponto da jornada.
 *
 * Fix: luz + target são transladados RIGIDAMENTE junto da câmera principal
 * a cada frame — a DIREÇÃO da luz (`LIGHT_DIRECTION`) nunca muda (mudar
 * direção por estado é decisão de direção de arte, fora do escopo desta
 * sprint), só a posição do PAR luz/target desliza junto do ponto de
 * interesse. O frustum ortográfico (`SHADOW_EXTENT`, ver scene.tsx)
 * permanece pequeno e a resolução do shadow map fica consistente do
 * início ao fim da jornada. Nunca escreve na câmera principal — só lê
 * `camera.position`, então funciona idêntico em modo motion e
 * reduced-motion (ambos mutam a câmera real via seus próprios rigs).
 */
const LIGHT_DIRECTION = new THREE.Vector3(-4, 10, 14).normalize();
const LIGHT_DISTANCE = 30;
const SHADOW_EXTENT = 24;

function ShadowRig({
  keyRef,
  target,
}: {
  keyRef: RefObject<THREE.DirectionalLight | null>;
  target: THREE.Object3D;
}) {
  const focus = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const light = keyRef.current;
    if (!light) return;
    focus.current.copy(camera.position);
    target.position.copy(focus.current);
    light.position.copy(focus.current).addScaledVector(LIGHT_DIRECTION, LIGHT_DISTANCE);
  });

  return null;
}

export { LIGHT_DIRECTION, LIGHT_DISTANCE, SHADOW_EXTENT, ShadowRig };
