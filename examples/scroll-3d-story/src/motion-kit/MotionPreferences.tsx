"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Server snapshot is always false so SSR and hydration agree. */
function getServerSnapshot(): boolean {
  return false;
}

export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const ReducedMotionContext = createContext(false);

export function MotionPreferencesProvider({
  children,
  forceReducedMotion,
}: {
  children: ReactNode;
  /** Escape hatch for a site-level "reduce effects" toggle. */
  forceReducedMotion?: boolean;
}) {
  const system = useSystemReducedMotion();
  const value = useMemo(() => forceReducedMotion ?? system, [forceReducedMotion, system]);
  return <ReducedMotionContext.Provider value={value}>{children}</ReducedMotionContext.Provider>;
}

/**
 * True when the visitor wants less motion. Consumers should show the static
 * composition and normal document flow — not a slower animation.
 */
export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}
