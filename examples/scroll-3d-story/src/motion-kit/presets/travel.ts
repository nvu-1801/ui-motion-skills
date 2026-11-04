import type { CameraPreset } from "../types";

/**
 * Travel narrative: overview → read the detail → see the layers → step back.
 *
 * `fill` is a fraction of viewport width, so these four states hold their
 * composition on a 1440px desktop stage and on a 390px phone without a second
 * hand-tuned preset. `compact` only re-frames the tightest shots.
 */
export const travelPreset: CameraPreset = {
  id: "travel",
  label: "Du lịch — khám phá tới yêu cầu",
  subjectWidth: 2.76,
  damping: 5.2,
  keyframes: [
    {
      // 0 — wide: the device sits in space, the layer stack is barely implied
      at: 0,
      fill: 0.62,
      target: [0, 0.94, 0],
      azimuth: 0,
      elevation: 3,
      fov: 42,
    },
    {
      // 0.33 — close-up: read the tour, crop slightly for intimacy
      at: 0.33,
      fill: 0.9,
      target: [0, 0.98, 0],
      azimuth: 0,
      elevation: 0,
      fov: 40,
    },
    {
      // 0.66 — orbit: depth becomes visible
      at: 0.66,
      fill: 0.74,
      target: [-0.06, 0.96, 0],
      azimuth: 33,
      elevation: 6,
      fov: 42,
    },
    {
      // 1 — pull back: the whole composition, room for the CTA
      at: 1,
      fill: 0.56,
      target: [0, 1.02, 0],
      azimuth: 0,
      elevation: 13,
      fov: 44,
    },
  ],
  compact: {
    damping: 5.6,
    keyframes: [
      { at: 0, fill: 0.68, target: [0, 0.94, 0], azimuth: 0, elevation: 3, fov: 42 },
      { at: 0.33, fill: 0.9, target: [0, 0.98, 0], azimuth: 0, elevation: 0, fov: 40 },
      { at: 0.66, fill: 0.86, target: [-0.05, 0.96, 0], azimuth: 28, elevation: 6, fov: 42 },
      { at: 1, fill: 0.6, target: [0, 1.02, 0], azimuth: 0, elevation: 12, fov: 44 },
    ],
  },
};
