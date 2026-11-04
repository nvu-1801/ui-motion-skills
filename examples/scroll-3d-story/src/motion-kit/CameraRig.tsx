"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { lerp, resolveCameraPosition, sampleCamera } from "./camera";
import { useSceneControls } from "./scene-context";
import { setCamera } from "./registry";
import type { CameraPreset, SampledCamera } from "./types";

export interface CameraRigProps {
  preset: CameraPreset;
  /** Use `preset.compact` when true. */
  compact?: boolean;
}

const SETTLE_FILL = 1e-4;
const SETTLE_ANGLE = 1e-3;
const SETTLE_FOV = 1e-3;
const SETTLE_TARGET = 1e-4;

/**
 * The only writer of camera position, look-at and fov.
 *
 * GSAP writes scroll progress; this component reads it. Nothing else touches the
 * camera, which is why scrubbing, reversing and jumping all resolve to the same
 * frame for the same progress value.
 */
export function CameraRig({ preset, compact = false }: CameraRigProps) {
  const { progressRef, activeRef, invalidateRef } = useSceneControls();
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const keyframes = compact && preset.compact ? preset.compact.keyframes : preset.keyframes;
  const damping = (compact ? preset.compact?.damping ?? preset.damping : preset.damping) || 5;

  const scratch = useMemo<SampledCamera>(
    () => ({ fill: 1, fov: 42, azimuth: 0, elevation: 0, target: [0, 0, 0] }),
    [],
  );
  const current = useRef<SampledCamera | null>(null);
  const placed = useMemo(() => ({ x: 0, y: 0, z: 0, distance: 0 }), []);
  const posOut = useRef<[number, number, number]>([0, 0, 0]).current;
  const targetOut = useRef<[number, number, number]>([0, 0, 0]).current;

  if (current.current === null) {
    const first = keyframes[0]!;
    current.current = {
      fill: first.fill,
      fov: first.fov,
      azimuth: first.azimuth,
      elevation: first.elevation,
      target: [first.target[0], first.target[1], first.target[2]],
    };
  }

  useEffect(() => {
    invalidateRef.current = invalidate;
    return () => {
      invalidateRef.current = () => {};
    };
  }, [invalidate, invalidateRef]);

  useFrame((_, delta) => {
    const cur = current.current;
    if (!cur) return;

    sampleCamera(keyframes, progressRef.current, scratch);

    // Frame-rate independent damping: 1 - e^(-rate * dt).
    const dt = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-damping * dt);

    cur.fill = lerp(cur.fill, scratch.fill, k);
    cur.fov = lerp(cur.fov, scratch.fov, k);
    cur.azimuth = lerp(cur.azimuth, scratch.azimuth, k);
    cur.elevation = lerp(cur.elevation, scratch.elevation, k);
    cur.target[0] = lerp(cur.target[0], scratch.target[0], k);
    cur.target[1] = lerp(cur.target[1], scratch.target[1], k);
    cur.target[2] = lerp(cur.target[2], scratch.target[2], k);

    const aspect = size.height > 0 ? size.width / size.height : 1;
    resolveCameraPosition(cur, aspect, preset.subjectWidth, placed);

    camera.position.set(placed.x, placed.y, placed.z);
    if (Math.abs(camera.fov - cur.fov) > 0.01) {
      camera.fov = cur.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(cur.target[0], cur.target[1], cur.target[2]);

    posOut[0] = placed.x;
    posOut[1] = placed.y;
    posOut[2] = placed.z;
    targetOut[0] = cur.target[0];
    targetOut[1] = cur.target[1];
    targetOut[2] = cur.target[2];
    setCamera(posOut, targetOut);

    const settled =
      Math.abs(cur.fill - scratch.fill) < SETTLE_FILL &&
      Math.abs(cur.azimuth - scratch.azimuth) < SETTLE_ANGLE &&
      Math.abs(cur.elevation - scratch.elevation) < SETTLE_ANGLE &&
      Math.abs(cur.fov - scratch.fov) < SETTLE_FOV &&
      Math.abs(cur.target[0] - scratch.target[0]) < SETTLE_TARGET &&
      Math.abs(cur.target[1] - scratch.target[1]) < SETTLE_TARGET &&
      Math.abs(cur.target[2] - scratch.target[2]) < SETTLE_TARGET;

    // frameloop="demand" needs an explicit request until damping has converged,
    // otherwise the last fraction of a millimetre never renders.
    if (!settled && activeRef.current) invalidate();
  });

  return null;
}
