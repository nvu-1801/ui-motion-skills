"use client";

import { useEffect, useMemo } from "react";
import { DeviceScreen, LayerStack } from "@/motion-kit";
import { SceneFallback } from "@/motion-kit/SceneFallback";
import { roundedBoxGeometry } from "@/motion-kit/geometry";
import { drawSeaTripScreen, seaTripStory } from "@/content/sea-trip";

const BODY = { width: 2.62, height: 1.72, depth: 0.16, radius: 0.13 };
const SCREEN = { width: 2.32, height: 1.45 };

/**
 * HẢI TRÌNH scene: one device, three depth panels, a restrained grid.
 *
 * Everything here is geometry and a canvas-drawn texture — no downloaded asset,
 * no client screenshot, nothing that can 404 or arrive with unclear rights.
 */
export function SeaTripScene() {
  const body = useMemo(() => roundedBoxGeometry(BODY.width, BODY.height, BODY.depth, BODY.radius), []);

  useEffect(() => {
    return () => body.dispose();
  }, [body]);

  return (
    <>
      <fog attach="fog" args={["#0a0b0d", 10, 30]} />

      <ambientLight intensity={0.38} />
      <hemisphereLight args={["#2a3340", "#0a0b0d", 0.55]} />
      <directionalLight position={[5, 7, 6]} intensity={1.45} color="#fff3e6" />
      <directionalLight position={[-6, 2.5, -2]} intensity={0.7} color="#ff6a1a" />
      <pointLight position={[0, 1.2, 2.6]} intensity={1.6} distance={9} color="#ffb27a" />

      <group position={[0, 0.94, 0]}>
        <mesh geometry={body}>
          <meshStandardMaterial color="#171a20" metalness={0.45} roughness={0.38} />
        </mesh>

        <DeviceScreen
          width={SCREEN.width}
          height={SCREEN.height}
          draw={drawSeaTripScreen}
          resolution={1024}
          z={0.094}
        />

        <LayerStack
          count={3}
          width={2.5}
          height={1.62}
          spacing={0.52}
          origin={[0, 0, -0.14]}
          radius={0.13}
        />
      </group>

      <group>
        {/* Wide enough that the plane's far edge sits past the fog, otherwise the
            floor ends in a hard horizon line across the stage. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#07080a" roughness={1} metalness={0} />
        </mesh>
        <gridHelper args={[90, 90, "#242931", "#12151a"]} position={[0, 0.002, 0]} />
      </group>
    </>
  );
}

/** Static stand-in used when WebGL is unavailable, reduced motion is requested, or the tab is not painting. */
export function TravelPoster() {
  return (
    <SceneFallback
      story={seaTripStory}
      note="Xem trước tĩnh · dự án minh họa"
      screen={
        <div className="tp">
          <div className="tp__bar">
            <b>HẢI TRÌNH</b>
            <span>Tư vấn</span>
          </div>
          <div className="tp__body">
            <div className="tp__left">
              <p className="tp__eyebrow">TUYẾN ĐIỂN HÌNH</p>
              <p className="tp__title">Vịnh Hạ Long</p>
              <p className="tp__sub">3 ngày 2 đêm</p>
              <span className="tp__cta">Gửi yêu cầu</span>
            </div>
            <div className="tp__art" aria-hidden="true" />
          </div>
          <div className="tp__cards" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      }
    />
  );
}
