"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MotionPreferencesProvider, useReducedMotion } from "./MotionPreferences";
import { SceneCanvas } from "./SceneCanvas";
import { SceneFallback } from "./SceneFallback";
import { StoryChapter } from "./StoryChapter";
import { DebugHud } from "./DebugHud";
import { SceneControlsContext } from "./scene-context";
import type { SceneControls } from "./scene-context";
import { installDebugApi, setChapter as publishChapter, setProgress, setRender, trackTrigger } from "./registry";
import { validatePreset } from "./camera";
import type { CameraPreset, QualitySettings, Story } from "./types";

export const DEFAULT_QUALITY: QualitySettings = {
  desktop: { dpr: [1, 2], antialias: true },
  mobile: { dpr: [1, 1.5], antialias: false },
  mobileBreakpoint: 900,
};

export interface ScrollSceneProps {
  story: Story;
  preset: CameraPreset;
  quality?: Partial<QualitySettings>;
  /** 3D content rendered inside the shared Canvas. */
  children: ReactNode;
  /** Static screen used by the poster. Defaults to a generic composition. */
  poster?: ReactNode;
  className?: string;
  debug?: boolean;
  forceReducedMotion?: boolean;
}

function useIsCompact(breakpoint: number): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return compact;
}

export function ScrollScene(props: ScrollSceneProps) {
  return (
    <MotionPreferencesProvider forceReducedMotion={props.forceReducedMotion}>
      <ScrollSceneInner {...props} />
    </MotionPreferencesProvider>
  );
}

function ScrollSceneInner({
  story,
  preset,
  quality: qualityOverride,
  children,
  poster,
  className,
  debug = false,
}: ScrollSceneProps) {
  const reduced = useReducedMotion();
  const compact = useIsCompact(qualityOverride?.mobileBreakpoint ?? DEFAULT_QUALITY.mobileBreakpoint);

  const quality = useMemo<QualitySettings>(
    () => ({
      ...DEFAULT_QUALITY,
      ...qualityOverride,
      desktop: { ...DEFAULT_QUALITY.desktop, ...qualityOverride?.desktop },
      mobile: { ...DEFAULT_QUALITY.mobile, ...qualityOverride?.mobile },
    }),
    [qualityOverride],
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const activeRef = useRef(true);
  const invalidateRef = useRef<() => void>(() => {});

  const controls = useMemo<SceneControls>(
    () => ({ progressRef, activeRef, invalidateRef }),
    [],
  );

  const [activeChapter, setActiveChapter] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [lost, setLost] = useState(false);
  const [failed, setFailed] = useState(false);

  // Fallback state is owned here, not by the canvas: when WebGL fails the canvas
  // unmounts, and its own cleanup would otherwise overwrite this with "idle".
  useEffect(() => {
    if (failed || lost) {
      setRender({ mode: "fallback", lost });
    } else if (enhanced) {
      setRender({ mode: "running", lost: false });
    }
  }, [failed, lost, enhanced]);

  useEffect(() => {
    installDebugApi();
    validatePreset(preset);
  }, [preset]);

  // Chapter tracking: one state change per chapter boundary, never per frame.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-mk-chapter]"));
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((entry) => entry.isIntersecting);
        if (hits.length === 0) return;
        hits.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const raw = hits[0]?.target.getAttribute("data-mk-index");
        if (raw === null) return;
        const index = Number(raw);
        if (Number.isNaN(index)) return;
        setActiveChapter(index);
        publishChapter(index);
      },
      { rootMargin: "-52% 0px -12% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [story.chapters.length]);

  // Render gate: stop requesting frames when the stage is off-screen or the tab is hidden.
  useEffect(() => {
    const stage = stageRef.current;
    let io: IntersectionObserver | null = null;

    if (stage && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          activeRef.current = entry.isIntersecting;
          if (entry.isIntersecting) invalidateRef.current();
        },
        { threshold: 0, rootMargin: "8% 0px 8% 0px" },
      );
      io.observe(stage);
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") invalidateRef.current();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Upgrade to WebGL only on the client, one frame after the poster has painted.
  useEffect(() => {
    if (reduced) {
      setEnhanced(false);
      return;
    }
    let cancelled = false;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        if (!cancelled) setEnhanced(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [reduced]);

  // Scroll → progress. GSAP owns the scroll read; CameraRig owns the camera.
  useEffect(() => {
    if (reduced) {
      progressRef.current = 0;
      setProgress(0);
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let release: (() => void) | null = null;
    let stop: (() => void) | null = null;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // Our own proxy: ScrollTrigger reports raw progress, a short tween smooths it.
      // self.progress is never treated as already smoothed.
      const proxy = { value: progressRef.current };
      const publish = () => {
        progressRef.current = proxy.value;
        setProgress(proxy.value);
        invalidateRef.current();
      };

      const follow = gsap.quickTo(proxy, "value", {
        duration: 0.26,
        ease: "power2.out",
        onUpdate: publish,
      });

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (activeRef.current) {
            follow(self.progress);
          } else {
            gsap.killTweensOf(proxy);
            proxy.value = self.progress;
            publish();
          }
        },
        onRefresh: (self) => {
          gsap.killTweensOf(proxy);
          proxy.value = self.progress;
          publish();
        },
      });

      release = trackTrigger();

      stop = () => {
        trigger.kill();
        gsap.killTweensOf(proxy);
      };
    })();

    return () => {
      cancelled = true;
      release?.();
      stop?.();
      progressRef.current = 0;
      setProgress(0);
    };
  }, [reduced]);

  const total = story.chapters.length;
  const live = enhanced && !failed;
  const posterVisible = !live || lost;

  return (
    <div
      ref={rootRef}
      className={["mk-scene", className].filter(Boolean).join(" ")}
      data-live={live && !lost}
      data-reduced={reduced}
      data-lost={lost}
      data-failed={failed}
      data-compact={compact}
    >
      <div className="mk-scene__grid">
        <div className="mk-scene__media">
          <div ref={stageRef} className="mk-stage">
            <div className="mk-poster" aria-hidden={!posterVisible}>
              {poster ?? <SceneFallback story={story} />}
            </div>

            {live ? (
              <SceneControlsContext.Provider value={controls}>
                <SceneCanvas
                  preset={preset}
                  quality={compact ? quality.mobile : quality.desktop}
                  compact={compact}
                  onLost={setLost}
                  onFail={() => setFailed(true)}
                >
                  {children}
                </SceneCanvas>
              </SceneControlsContext.Provider>
            ) : null}

            <div className="mk-stage__frame" aria-hidden="true" />

            {lost || failed ? (
              <p className="mk-stage__notice" role="status">
                Cảnh 3D tạm dừng. Nội dung và liên kết bên cạnh vẫn đầy đủ.
              </p>
            ) : null}

            {debug ? <DebugHud story={story} /> : null}
          </div>
        </div>

        <div className="mk-scene__story">
          <ol className="mk-chapters">
            {story.chapters.map((chapter, index) => (
              <li key={chapter.id} className="mk-chapters__item">
                <StoryChapter
                  chapter={{ ...chapter, id: `${story.slug}-${chapter.id}` }}
                  index={index}
                  total={total}
                  active={index === activeChapter}
                />
              </li>
            ))}
          </ol>

          {story.cta ? (
            <div className="mk-scene__cta">
              <a className="mk-button" href={story.cta.href}>
                <span>{story.cta.label}</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
