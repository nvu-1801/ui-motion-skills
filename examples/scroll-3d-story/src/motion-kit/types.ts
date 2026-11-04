/**
 * Public types for the motion kit.
 *
 * Design rule: camera presets are *data*. They never reference a brand, a
 * project or copy. A story never references camera maths. Anything that can be
 * swapped without touching a component belongs in one of these types.
 */

/** A 3D point, immutable so presets stay literal-readable. */
export type Vec3 = readonly [number, number, number];

/**
 * One camera state on the scroll timeline.
 *
 * Framing is expressed with `fill` (how much of the viewport width the subject
 * should span) instead of absolute XYZ. Absolute positions look correct at the
 * aspect ratio they were authored at and break everywhere else; `fill` keeps
 * composition stable from a wide desktop stage to a narrow phone.
 */
export interface CameraKeyframe {
  /** Normalised scroll progress, 0..1, strictly ascending. */
  at: number;
  /** Fraction of viewport width covered by `subjectWidth`. >1 deliberately crops. */
  fill: number;
  /** Look-at point. */
  target: Vec3;
  /** Degrees around Y. 0 = straight on, positive = to the right. */
  azimuth: number;
  /** Degrees above the target. */
  elevation: number;
  /** Vertical field of view in degrees. */
  fov: number;
}

export interface CameraPreset {
  id: string;
  label: string;
  /** Physical width of the subject in world units; used to solve camera distance. */
  subjectWidth: number;
  /** Higher follows the scroll more tightly. 4–7 reads as "weighted". */
  damping: number;
  keyframes: readonly CameraKeyframe[];
  /** Optional simpler path for narrow viewports. Falls back to `keyframes`. */
  compact?: {
    damping?: number;
    keyframes: readonly CameraKeyframe[];
  };
}

export interface QualityTier {
  /** Clamped device pixel ratio range passed to the renderer. */
  dpr: readonly [number, number];
  antialias: boolean;
}

export interface QualitySettings {
  desktop: QualityTier;
  mobile: QualityTier;
  /** Viewport width (px) below which the mobile tier and compact preset apply. */
  mobileBreakpoint: number;
}

export interface StoryChapter {
  id: string;
  /** Display index, e.g. "01". */
  index: string;
  kicker?: string;
  title: string;
  body: string;
  points?: readonly string[];
}

export interface Story {
  slug: string;
  eyebrow: string;
  title: string;
  lede: string;
  /** Non-negotiable honesty field: shown as a visible badge in the demo. */
  disclosure: string;
  chapters: readonly StoryChapter[];
  cta?: { label: string; href: string };
}

/** Camera state after sampling + interpolation, before projection to XYZ. */
export interface SampledCamera {
  fill: number;
  fov: number;
  azimuth: number;
  elevation: number;
  target: [number, number, number];
}
