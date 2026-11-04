import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

type Snapshot = {
  triggers: number;
  canvases: number;
  progress: number;
  chapter: number;
  camera: [number, number, number] | null;
  target: [number, number, number] | null;
  render: { mode: string; lost: boolean };
};

const LAB = "/lab/scroll-3d";
const DEBUG = "/lab/scroll-3d?debug=1";

async function snapshot(page: Page): Promise<Snapshot | null> {
  return page.evaluate(() => window.__MOTION_KIT__?.snapshot ?? null);
}

/**
 * Scroll to a fraction of the scene's own scroll range and wait for the smoothed
 * progress and the damped camera to settle.
 */
async function scrollToProgress(page: Page, fraction: number): Promise<void> {
  await page.evaluate((f) => {
    const el = document.querySelector(".mk-scene");
    if (!el) throw new Error("scene not found");
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const range = Math.max(1, el.getBoundingClientRect().height - window.innerHeight);
    window.scrollTo(0, top + range * f);
  }, fraction);

  await page.waitForFunction(
    (f) => {
      const s = window.__MOTION_KIT__?.snapshot;
      return !!s && Math.abs(s.progress - f) < 0.04;
    },
    fraction,
    { timeout: 15_000 },
  );

  // damping is exponential; 900ms is ~99% at the rates we use
  await page.waitForTimeout(900);
}

test.describe("scroll-3d vertical slice", () => {
  test("server HTML already contains the story, poster and CTA", async ({ request }) => {
    const res = await request.get(LAB);
    expect(res.status()).toBe(200);
    const html = await res.text();

    expect(html).toContain("mk-fallback");
    expect(html).toContain("Dự án minh họa");
    expect(html).toContain("Khách không thiếu lựa chọn");
    expect(html).toContain('href="#kit"');
    expect(html).toContain('lang="vi"');
  });

  test("content is readable and the CTA works with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(LAB);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Khách không thiếu lựa chọn")).toBeVisible();
    await expect(page.getByText("Lùi lại, để lựa chọn cuối cùng rõ ràng.")).toBeVisible();

    const cta = page.locator(".mk-button");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "#kit");

    await context.close();
  });

  test("renders the poster and keeps content when WebGL is unavailable", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (typeof type === "string" && type.toLowerCase().includes("webgl")) return null;
        return original.apply(this, [type, ...args] as Parameters<typeof original>);
      } as typeof original;
    });

    const page = await context.newPage();
    await page.goto(DEBUG);
    await page.waitForTimeout(1200);

    const s = await snapshot(page);
    expect(s).not.toBeNull();
    expect(s?.canvases).toBe(0);
    expect(s?.render.mode).toBe("fallback");

    await expect(page.locator(".mk-fallback__note")).toBeVisible();
    await expect(page.getByText("Khách không thiếu lựa chọn")).toBeVisible();
    await expect(page.locator(".mk-button")).toBeVisible();

    await context.close();
  });

  test("reduced motion drops the canvas and keeps every chapter readable", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(DEBUG);
    await page.waitForTimeout(1200);

    const scene = page.locator(".mk-scene");
    await expect(scene).toHaveAttribute("data-reduced", "true");
    await expect(page.locator(".mk-canvas canvas")).toHaveCount(0);
    await expect(page.locator(".mk-fallback__note")).toBeVisible();

    const chapters = page.locator("[data-mk-chapter]");
    await expect(chapters).toHaveCount(4);
    for (let i = 0; i < 4; i += 1) {
      await expect(chapters.nth(i)).toBeVisible();
    }

    const s = await snapshot(page);
    expect(s?.triggers ?? 0).toBe(0);

    await context.close();
  });

  test("camera really moves with scroll and returns to the same frame on reverse", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(DEBUG);
    await page.waitForFunction(() => (window.__MOTION_KIT__?.canvases ?? 0) === 1, null, { timeout: 20_000 });

    await scrollToProgress(page, 0);
    const at0 = await snapshot(page);
    await page.screenshot({ path: "test-results/shots/desktop-000.png" });

    await scrollToProgress(page, 0.33);
    const at33 = await snapshot(page);
    await page.screenshot({ path: "test-results/shots/desktop-033.png" });

    await scrollToProgress(page, 0.66);
    const at66 = await snapshot(page);
    await page.screenshot({ path: "test-results/shots/desktop-066.png" });

    await scrollToProgress(page, 1);
    const at100 = await snapshot(page);
    await page.screenshot({ path: "test-results/shots/desktop-100.png" });

    expect(at0?.camera).not.toBeNull();
    expect(at33?.camera).not.toBeNull();

    // Four distinct camera positions.
    const distance = (a: number[] | null, b: number[] | null) => {
      if (!a || !b) return Number.NaN;
      return Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!);
    };
    expect(distance(at0?.camera ?? null, at33?.camera ?? null)).toBeGreaterThan(0.5);
    expect(distance(at33?.camera ?? null, at66?.camera ?? null)).toBeGreaterThan(0.5);
    expect(distance(at66?.camera ?? null, at100?.camera ?? null)).toBeGreaterThan(0.5);

    // Chapter state follows the scroll, not just the camera.
    expect(at33?.chapter).toBe(1);
    expect(at100?.chapter).toBe(3);

    // Reverse: same progress must resolve to the same frame.
    await scrollToProgress(page, 0.33);
    const back33 = await snapshot(page);
    expect(distance(back33?.camera ?? null, at33?.camera ?? null)).toBeLessThan(0.05);
    expect(back33?.chapter).toBe(1);

    // Jump straight to the middle from the top also lands correctly.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await scrollToProgress(page, 0.66);
    const jump66 = await snapshot(page);
    expect(distance(jump66?.camera ?? null, at66?.camera ?? null)).toBeLessThan(0.05);
  });

  test("survives a context loss and falls back to the poster", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(DEBUG);
    await page.waitForFunction(() => (window.__MOTION_KIT__?.canvases ?? 0) === 1, null, { timeout: 20_000 });

    const lost = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(".mk-canvas canvas");
      if (!canvas) return "no-canvas";
      const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
      if (!gl) return "no-gl";
      const ext = gl.getExtension("WEBGL_lose_context");
      if (!ext) return "no-extension";
      ext.loseContext();
      return "lost";
    });

    test.skip(lost !== "lost", `WEBGL_lose_context unavailable: ${lost}`);

    await expect(page.locator(".mk-stage__notice")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".mk-fallback__note")).toBeVisible();
    await expect(page.getByText("Khách không thiếu lựa chọn")).toBeVisible();
  });

  test("no horizontal overflow at three viewports", async ({ page }) => {
    const sizes = [
      { width: 1440, height: 900, name: "desktop" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 390, height: 844, name: "mobile" },
    ];

    for (const size of sizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(DEBUG);
      await page.waitForTimeout(900);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${size.name} horizontal overflow`).toBeLessThanOrEqual(1);

      await page.screenshot({ path: `test-results/shots/${size.name}-top.png`, fullPage: false });
    }
  });

  test("mobile and tablet render a scene and reach the last chapter", async ({ page }) => {
    for (const size of [
      { width: 768, height: 1024, name: "tablet" },
      { width: 390, height: 844, name: "mobile" },
    ]) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(DEBUG);
      await page.waitForFunction(() => (window.__MOTION_KIT__?.canvases ?? 0) === 1, null, { timeout: 20_000 });

      await scrollToProgress(page, 0.5);
      const mid = await snapshot(page);
      expect(mid?.camera).not.toBeNull();
      await page.screenshot({ path: `test-results/shots/${size.name}-mid.png` });

      await scrollToProgress(page, 1);
      const end = await snapshot(page);
      expect(end?.chapter).toBe(3);
      await page.screenshot({ path: `test-results/shots/${size.name}-end.png` });
    }
  });

  test("kit-owned triggers and canvases return to baseline after 5 round trips", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    for (let i = 0; i < 5; i += 1) {
      await page.goto(DEBUG);
      await page.waitForFunction(() => (window.__MOTION_KIT__?.canvases ?? 0) === 1, null, { timeout: 20_000 });
      await page.waitForTimeout(400);

      const live = await snapshot(page);
      expect(live?.triggers, `cycle ${i}: triggers`).toBe(1);
      expect(live?.canvases, `cycle ${i}: canvases`).toBe(1);

      const canvases = await page.locator("canvas").count();
      expect(canvases, `cycle ${i}: DOM canvas count`).toBe(1);

      await page.goto("/");
      const afterLeave = await page.evaluate(() => window.__MOTION_KIT__?.snapshot ?? null);
      expect(afterLeave?.triggers ?? 0, `cycle ${i}: triggers after leaving`).toBe(0);
      expect(afterLeave?.canvases ?? 0, `cycle ${i}: canvases after leaving`).toBe(0);
    }
  });

  test("debug HUD is off by default and only appears with ?debug=1", async ({ page }) => {
    await page.goto(LAB);
    await page.waitForTimeout(800);
    await expect(page.locator(".mk-hud")).toHaveCount(0);

    await page.goto(DEBUG);
    await page.waitForTimeout(800);
    await expect(page.locator(".mk-hud")).toHaveCount(1);
    await expect(page.locator(".mk-hud")).toContainText("progress");
  });

  test("keyboard can reach the scene CTA", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB);

    const cta = page.locator(".mk-button");
    await cta.focus();
    const focused = await page.evaluate(() => document.activeElement?.className ?? "");
    expect(focused).toContain("mk-button");

    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    expect(page.url()).toContain("#kit");
  });
});
