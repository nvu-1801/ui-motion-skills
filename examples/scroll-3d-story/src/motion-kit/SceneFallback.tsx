"use client";

import type { ReactNode } from "react";
import type { Story } from "./types";

export interface SceneFallbackProps {
  story: Story;
  /** Optional brand-specific static screen. */
  screen?: ReactNode;
  note?: string;
}

/**
 * The poster layer.
 *
 * It is rendered on the server, so it is present before hydration, with
 * JavaScript disabled, when WebGL is unavailable and after a context loss. When
 * the live canvas is healthy it fades out but stays in the accessibility tree
 * only if it is still the visible layer.
 */
export function SceneFallback({ story, screen, note = "Bản xem trước tĩnh" }: SceneFallbackProps) {
  return (
    <div className="mk-fallback">
      <div className="mk-fallback__device">
        <div className="mk-fallback__screen">
          {screen ?? (
            <div className="mk-fallback__generic">
              <span className="mk-fallback__eyebrow">{story.eyebrow}</span>
              <p className="mk-fallback__title">{story.title}</p>
              <div className="mk-fallback__lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>
        <span className="mk-fallback__notch" aria-hidden="true" />
      </div>
      <p className="mk-fallback__note">{note}</p>
    </div>
  );
}
