"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";

export type ScreenDraw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export interface DeviceScreenProps {
  /** World-space size of the screen plane. */
  width: number;
  height: number;
  /** Draws the UI. Authored at 1024px wide, receives actual pixel dimensions. */
  draw: ScreenDraw;
  /** Texture width in pixels. Capped to keep mobile memory sane. */
  resolution?: number;
  z?: number;
}

const MAX_TEXTURE_WIDTH = 1280;

/**
 * Canvas-drawn screen surface.
 *
 * Ownership: this component creates one CanvasTexture per draw and disposes the
 * previous one when the effect re-runs or the component unmounts. The plane
 * geometry is declarative, so R3F owns it.
 *
 * Waiting on `document.fonts.ready` costs one rebuild and buys a screen whose
 * type matches the site instead of a system-serif stand-in.
 */
export function DeviceScreen({
  width,
  height,
  draw,
  resolution = 1024,
  z = 0.012,
}: DeviceScreenProps) {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (!fonts?.ready) {
      setFontsReady(true);
      return;
    }
    fonts.ready
      .then(() => {
        if (!cancelled) setFontsReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const pxWidth = Math.min(MAX_TEXTURE_WIDTH, Math.max(256, Math.round(resolution)));
    canvas.width = pxWidth;
    canvas.height = Math.max(1, Math.round((pxWidth * height) / width));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(ctx, canvas.width, canvas.height);

    const next = new CanvasTexture(canvas);
    next.colorSpace = SRGBColorSpace;
    next.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    next.needsUpdate = true;
    setTexture(next);

    return () => {
      next.dispose();
    };
  }, [draw, resolution, width, height, gl, fontsReady]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
