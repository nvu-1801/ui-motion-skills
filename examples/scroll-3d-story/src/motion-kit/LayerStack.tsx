"use client";

import { useEffect, useMemo } from "react";
import { EdgesGeometry, ShapeGeometry } from "three";
import { roundedRectShape } from "./geometry";
import type { Vec3 } from "./types";

export interface LayerStackProps {
  /** Number of panels behind the subject. Three reads as depth, not clutter. */
  count?: number;
  width: number;
  height: number;
  /** Gap on Z between panels. */
  spacing?: number;
  origin?: Vec3;
  color?: string;
  accent?: string;
  radius?: number;
}

/**
 * Offset UI panels behind the subject.
 *
 * They exist to make the orbit legible: without real geometry behind the screen,
 * a sideways camera move reads as a flat image sliding, not as a scene.
 */
export function LayerStack({
  count = 3,
  width,
  height,
  spacing = 0.62,
  origin = [0, 0, 0],
  color = "#f4f1ea",
  accent = "#ff6a1a",
  radius = 0.12,
}: LayerStackProps) {
  const { geometry, edges } = useMemo(() => {
    const shape = new ShapeGeometry(roundedRectShape(width, height, radius), 10);
    const edge = new EdgesGeometry(shape, 24);
    return { geometry: shape, edges: edge };
  }, [width, height, radius]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      edges.dispose();
    };
  }, [geometry, edges]);

  return (
    <group position={[origin[0], origin[1], origin[2]]}>
      {Array.from({ length: count }, (_, i) => {
        const depth = -(i + 1) * spacing;
        const scale = 1 + i * 0.07;
        const tilt = (i % 2 === 0 ? 1 : -1) * 0.008 * (i + 1);
        const shade = Math.max(0.045, 0.055 - i * 0.012);
        const line = Math.max(0.07, 0.26 - i * 0.07);
        const isLast = i === count - 1;
        return (
          <group
            key={i}
            position={[i % 2 === 0 ? 0.03 * i : -0.03 * i, 0.02 * i, depth]}
            rotation={[0, 0, tilt]}
            scale={scale}
          >
            <mesh geometry={geometry}>
              <meshBasicMaterial
                color={isLast ? accent : color}
                transparent
                opacity={shade}
                depthWrite={false}
              />
            </mesh>
            <lineSegments geometry={edges}>
              <lineBasicMaterial
                color={isLast ? accent : color}
                transparent
                opacity={line}
                depthWrite={false}
              />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}
