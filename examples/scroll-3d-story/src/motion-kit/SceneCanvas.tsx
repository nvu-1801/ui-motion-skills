"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { CameraRig } from "./CameraRig";
import { setRender, trackCanvas } from "./registry";
import type { CameraPreset, QualityTier } from "./types";

interface BoundaryProps {
  onError: () => void;
  children: ReactNode;
}

class CanvasBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[motion-kit] scene crashed, falling back to the poster", error, info);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export interface SceneCanvasProps {
  preset: CameraPreset;
  quality: QualityTier;
  compact?: boolean;
  onLost?: (lost: boolean) => void;
  onFail?: () => void;
  children: ReactNode;
}

/**
 * Owns the single WebGL renderer for the stage.
 *
 * Scheduling: `frameloop="demand"`. Frames are requested by scroll progress and
 * by CameraRig until damping converges, so an idle page renders nothing. When the
 * stage leaves the viewport or the tab is hidden the loop stops entirely.
 */
export function SceneCanvas({ preset, quality, compact = false, onLost, onFail, children }: SceneCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const counted = useRef(false);
  const teardown = useRef<(() => void) | null>(null);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [failed, setFailed] = useState(false);

  const handleFail = useCallback(() => {
    setFailed(true);
    onFail?.();
  }, [onFail]);

  useEffect(() => {
    const node = hostRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const paused = !visible || !pageVisible || failed;

  useEffect(() => {
    setRender({ mode: paused ? (failed ? "fallback" : "paused") : "running" });
  }, [paused, failed]);

  useEffect(() => {
    return () => {
      teardown.current?.();
      teardown.current = null;
      if (counted.current) {
        counted.current = false;
        trackCanvas(-1);
      }
      setRender({ mode: "idle", lost: false });
    };
  }, []);

  const handleCreated = useCallback(
    ({ gl }: RootState) => {
      gl.setClearAlpha(0);
      counted.current = true;
      trackCanvas(1);

      const element = gl.domElement;
      const onContextLost = (event: Event) => {
        // Required: without preventDefault the context can never be restored.
        event.preventDefault();
        setRender({ lost: true });
        onLost?.(true);
      };
      const onContextRestored = () => {
        setRender({ lost: false });
        onLost?.(false);
      };

      element.addEventListener("webglcontextlost", onContextLost, false);
      element.addEventListener("webglcontextrestored", onContextRestored, false);

      teardown.current = () => {
        element.removeEventListener("webglcontextlost", onContextLost, false);
        element.removeEventListener("webglcontextrestored", onContextRestored, false);
        gl.dispose();
      };
    },
    [onLost],
  );

  const first = preset.keyframes[0]!;

  return (
    <div ref={hostRef} className="mk-canvas">
      <CanvasBoundary onError={handleFail}>
        <Canvas
          frameloop={paused ? "never" : "demand"}
          dpr={[quality.dpr[0], quality.dpr[1]]}
          gl={{ antialias: quality.antialias, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: first.fov, near: 0.1, far: 80, position: [0, 1.2, 8] }}
          fallback={null}
          onCreated={handleCreated}
          style={{ pointerEvents: "none" }}
        >
          <CameraRig preset={preset} compact={compact} />
          {children}
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
