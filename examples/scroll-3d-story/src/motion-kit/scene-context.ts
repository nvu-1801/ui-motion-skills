"use client";

import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

export interface SceneControls {
  /** Raw, smoothed scroll progress in 0..1. Written outside React. */
  progressRef: MutableRefObject<number>;
  /** False while the stage is off-screen or the document is hidden. */
  activeRef: MutableRefObject<boolean>;
  /** Registered by CameraRig so non-React code can request a frame. */
  invalidateRef: MutableRefObject<() => void>;
}

export const SceneControlsContext = createContext<SceneControls | null>(null);

export function useSceneControls(): SceneControls {
  const value = useContext(SceneControlsContext);
  if (!value) {
    throw new Error("[motion-kit] useSceneControls must be used inside <ScrollScene>");
  }
  return value;
}
