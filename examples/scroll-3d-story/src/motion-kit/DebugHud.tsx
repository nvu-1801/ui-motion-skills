"use client";

import { useEffect, useState } from "react";
import { getSnapshot } from "./registry";
import type { Story } from "./types";

const POLL_MS = 160;

/**
 * Debug HUD, mounted only when the page is opened with `?debug=1`.
 *
 * It polls instead of subscribing per frame: a debug panel must never be the
 * reason a scene drops frames.
 */
export function DebugHud({ story }: { story: Story }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), POLL_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  const s = getSnapshot();
  const chapter = story.chapters[s.chapter];
  const fmt = (v: number | null) => (v === null ? "—" : v.toFixed(2));
  const cam = s.camera;
  const tgt = s.target;

  return (
    <aside className="mk-hud" aria-hidden="true" data-tick={tick}>
      <div className="mk-hud__row">
        <span>progress</span>
        <b>{s.progress.toFixed(3)}</b>
      </div>
      <div className="mk-hud__row">
        <span>chapter</span>
        <b>{chapter ? `${chapter.index} ${chapter.kicker ?? ""}`.trim() : "—"}</b>
      </div>
      <div className="mk-hud__row">
        <span>camera</span>
        <b>
          {cam ? `${fmt(cam[0])} ${fmt(cam[1])} ${fmt(cam[2])}` : "—"}
        </b>
      </div>
      <div className="mk-hud__row">
        <span>target</span>
        <b>{tgt ? `${fmt(tgt[0])} ${fmt(tgt[1])} ${fmt(tgt[2])}` : "—"}</b>
      </div>
      <div className="mk-hud__row">
        <span>render</span>
        <b>
          {s.render.mode}
          {s.render.lost ? " · ctx lost" : ""}
        </b>
      </div>
      <div className="mk-hud__row">
        <span>owned</span>
        <b>
          {s.triggers} trigger · {s.canvases} canvas
        </b>
      </div>
    </aside>
  );
}
