"use client";

import { useEffect, useState } from "react";
import { ScrollScene } from "@/motion-kit";
import { travelPreset } from "@/motion-kit/presets/travel";
import { seaTripStory } from "@/content/sea-trip";
import { SeaTripScene, TravelPoster } from "./SeaTripScene";

/**
 * Reads `?debug=1` on the client instead of in the server component, so the lab
 * page stays statically renderable and the poster is still in the HTML payload.
 */
export function Scroll3DDemo() {
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebug(params.get("debug") === "1");
  }, []);

  return (
    <ScrollScene story={seaTripStory} preset={travelPreset} debug={debug} poster={<TravelPoster />}>
      <SeaTripScene />
    </ScrollScene>
  );
}
