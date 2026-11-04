/**
 * Small public registry used by tests and by the `?debug=1` HUD.
 *
 * It answers one question that is otherwise impossible to verify from the
 * outside: how many scroll triggers and WebGL canvases does *this kit* own right
 * now. Counting the whole app's triggers would be wrong on a page that has
 * unrelated animations.
 *
 * The snapshot object is intentionally mutated in place. It is read by polling
 * (HUD interval, Playwright evaluate), never compared by React, so allocating a
 * new object 60 times a second would be pure garbage.
 */

type Vec = [number, number, number] | null;

export interface KitSnapshot {
  triggers: number;
  canvases: number;
  progress: number;
  chapter: number;
  camera: Vec;
  target: Vec;
  render: {
    mode: "idle" | "running" | "paused" | "fallback";
    lost: boolean;
  };
}

const snapshot: KitSnapshot = {
  triggers: 0,
  canvases: 0,
  progress: 0,
  chapter: -1,
  camera: null,
  target: null,
  render: { mode: "idle", lost: false },
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getSnapshot(): KitSnapshot {
  return snapshot;
}

export function trackTrigger(): () => void {
  snapshot.triggers += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    snapshot.triggers = Math.max(0, snapshot.triggers - 1);
    emit();
  };
}

export function trackCanvas(delta: 1 | -1): void {
  snapshot.canvases = Math.max(0, snapshot.canvases + delta);
  emit();
}

export function setProgress(p: number): void {
  snapshot.progress = p;
}

export function setChapter(i: number): void {
  if (snapshot.chapter === i) return;
  snapshot.chapter = i;
  emit();
}

export function setCamera(position: [number, number, number], target: [number, number, number]): void {
  snapshot.camera = position;
  snapshot.target = target;
}

export function setRender(patch: Partial<KitSnapshot["render"]>): void {
  const changed = patch.mode !== undefined && patch.mode !== snapshot.render.mode;
  const lostChanged = patch.lost !== undefined && patch.lost !== snapshot.render.lost;
  if (changed) snapshot.render.mode = patch.mode!;
  if (lostChanged) snapshot.render.lost = patch.lost!;
  if (changed || lostChanged) emit();
}

let installed = false;

/** Idempotent. Exposes a frozen, read-only view for Playwright and the HUD. */
export function installDebugApi(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  Object.defineProperty(window, "__MOTION_KIT__", {
    configurable: true,
    value: Object.freeze({
      get snapshot(): KitSnapshot {
        return snapshot;
      },
      get triggers(): number {
        return snapshot.triggers;
      },
      get canvases(): number {
        return snapshot.canvases;
      },
    }),
  });
}

declare global {
  interface Window {
    __MOTION_KIT__?: { readonly snapshot: KitSnapshot; readonly triggers: number; readonly canvases: number };
  }
}
