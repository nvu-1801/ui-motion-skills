import type { CameraKeyframe, CameraPreset, SampledCamera } from "./types";

const DEG = Math.PI / 180;

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smootherstep: zero velocity at both ends, no corner at keyframes. */
export function smoother(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/**
 * Throws on ordering/normalisation mistakes at development time instead of
 * producing a camera that silently jumps. Called once per preset.
 */
export function validatePreset(preset: CameraPreset): void {
  const all = [preset.keyframes, preset.compact?.keyframes];
  all.forEach((list, group) => {
    if (!list || list.length < 2) {
      throw new Error(`[motion-kit] preset "${preset.id}" ${group ? "compact" : ""} needs at least 2 keyframes`);
    }
    for (let i = 0; i < list.length; i += 1) {
      const kf = list[i]!;
      if (!Number.isFinite(kf.at) || kf.at < 0 || kf.at > 1) {
        throw new Error(`[motion-kit] preset "${preset.id}" keyframe ${i} has invalid "at"`);
      }
      if (i > 0 && kf.at <= list[i - 1]!.at) {
        throw new Error(`[motion-kit] preset "${preset.id}" keyframes must be ascending`);
      }
      if (!(kf.fill > 0) || !Number.isFinite(kf.fov) || kf.fov <= 0) {
        throw new Error(`[motion-kit] preset "${preset.id}" keyframe ${i} has invalid fill/fov`);
      }
    }
  });
  if (!(preset.subjectWidth > 0)) {
    throw new Error(`[motion-kit] preset "${preset.id}" needs a positive subjectWidth`);
  }
}

function read(kf: CameraKeyframe, out: SampledCamera): SampledCamera {
  out.fill = kf.fill;
  out.fov = kf.fov;
  out.azimuth = kf.azimuth;
  out.elevation = kf.elevation;
  out.target[0] = kf.target[0];
  out.target[1] = kf.target[1];
  out.target[2] = kf.target[2];
  return out;
}

/**
 * Sample the timeline at `p`. Writes into `out` — no allocation per frame.
 * Exact at every `at` value, monotonic between them.
 */
export function sampleCamera(
  keyframes: readonly CameraKeyframe[],
  p: number,
  out: SampledCamera,
): SampledCamera {
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];
  if (!first || !last) return out;

  const progress = clamp01(p);
  if (progress <= first.at) return read(first, out);
  if (progress >= last.at) return read(last, out);

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const a = keyframes[i]!;
    const b = keyframes[i + 1]!;
    if (progress <= b.at) {
      const span = b.at - a.at;
      const t = span <= 0 ? 0 : smoother((progress - a.at) / span);
      out.fill = lerp(a.fill, b.fill, t);
      out.fov = lerp(a.fov, b.fov, t);
      out.azimuth = lerp(a.azimuth, b.azimuth, t);
      out.elevation = lerp(a.elevation, b.elevation, t);
      out.target[0] = lerp(a.target[0], b.target[0], t);
      out.target[1] = lerp(a.target[1], b.target[1], t);
      out.target[2] = lerp(a.target[2], b.target[2], t);
      return out;
    }
  }
  return read(last, out);
}

export interface ResolvedPosition {
  x: number;
  y: number;
  z: number;
  distance: number;
}

/**
 * Solve the camera position that makes `subjectWidth` cover `state.fill` of the
 * viewport width for a given aspect ratio.
 *
 * horizontal visible width = 2 * distance * tan(fov/2) * aspect
 */
export function resolveCameraPosition(
  state: SampledCamera,
  aspect: number,
  subjectWidth: number,
  out: ResolvedPosition,
): ResolvedPosition {
  const safeAspect = Number.isFinite(aspect) && aspect > 0.05 ? aspect : 1;
  const fill = state.fill > 0.01 ? state.fill : 0.01;
  const halfFov = (state.fov * DEG) / 2;
  const raw = subjectWidth / (fill * 2 * Math.tan(halfFov) * safeAspect);
  const distance = Math.min(48, Math.max(1.2, raw));

  const az = state.azimuth * DEG;
  const el = state.elevation * DEG;
  const horizontal = Math.cos(el) * distance;

  out.distance = distance;
  out.x = state.target[0] + Math.sin(az) * horizontal;
  out.y = state.target[1] + Math.sin(el) * distance;
  out.z = state.target[2] + Math.cos(az) * horizontal;
  return out;
}
