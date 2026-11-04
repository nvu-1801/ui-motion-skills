# INTEGRATION

Cách đưa `src/motion-kit` sang một website React/Next khác.

## 0. Yêu cầu

- React 19 (kit dùng `useSyncExternalStore` và R3F 9).
- `three >= 0.156`, `@react-three/fiber ^9`, `gsap ^3.13`.
- Nếu dùng Next: App Router, component dùng kit phải là client component.

```bash
npm i three@0.187.0 @react-three/fiber@9.8.2 gsap@3.15.0
npm i -D @types/three@0.187.0
```

## 1. Copy kit

Copy nguyên thư mục `src/motion-kit/` vào project đích. Kit không import gì từ `src/content` hay `src/app` — chỉ phụ thuộc `three`, `@react-three/fiber`, `gsap`, `react`.

## 2. Import CSS — đúng thứ tự

```tsx
// app/layout.tsx
import "@/motion-kit/styles.css"; // 1. kit trước
import "./globals.css";           // 2. theme của bạn sau
```

Kit khai báo token mặc định trên `.mk-scene` (Georgia / system-ui) để chạy độc lập. Nếu theme của bạn import trước, kit sẽ thắng và chữ sẽ rơi về Georgia — đúng lỗi đã gặp trong quá trình dựng demo (dấu tiếng Việt bị tách rời). Bản này đã tăng specificity của theme lên `.mk-scene.mk-scene` để chống lại, nhưng vẫn nên import đúng thứ tự.

## 3. Theme token

Override trên bất kỳ ancestor nào của `.mk-scene`:

```css
.mk-scene {
  --mk-bg: #0a0b0d;
  --mk-fg: #f4f1ea;
  --mk-muted: #a49e94;
  --mk-dim: #6e6960;
  --mk-accent: #ff6a1a;
  --mk-line: rgba(244, 241, 234, 0.13);
  --mk-line-soft: rgba(244, 241, 234, 0.06);
  --mk-font-display: var(--font-display), Georgia, serif;
  --mk-font-sans: var(--font-sans), system-ui, sans-serif;
  --mk-font-mono: ui-monospace, monospace;
  --mk-gutter: clamp(16px, 3vw, 48px);
  --mk-max-width: 1440px;
  --mk-stage-height: 100svh;
}
```

Nếu dùng `next/font`, `--font-display` / `--font-sans` là tên family đã hash — dùng đúng như trên.

## 4. Dùng tối thiểu

```tsx
"use client";

import { ScrollScene } from "@/motion-kit";
import { travelPreset } from "@/motion-kit/presets/travel";
import { DeviceScreen, LayerStack } from "@/motion-kit";

const story = {
  slug: "demo",
  eyebrow: "DEMO",
  title: "…",
  lede: "…",
  disclosure: "Dự án minh họa",
  chapters: [
    { id: "c1", index: "01", title: "…", body: "…" },
    { id: "c2", index: "02", title: "…", body: "…" },
    { id: "c3", index: "03", title: "…", body: "…" },
  ],
  cta: { label: "Liên hệ", href: "/lien-he" },
};

export function Hero() {
  return (
    <ScrollScene story={story} preset={travelPreset}>
      <ambientLight intensity={0.5} />
      <DeviceScreen width={2.32} height={1.45} draw={myDrawFn} />
      <LayerStack width={2.5} height={1.62} origin={[0, 0, -0.14]} />
    </ScrollScene>
  );
}
```

`children` của `ScrollScene` được render **bên trong** Canvas. Đừng đặt component HTML vào đó.

## 5. Props của `ScrollScene`

| Prop | Kiểu | Mặc định | Ghi chú |
|---|---|---|---|
| `story` | `Story` | bắt buộc | dữ liệu thuần |
| `preset` | `CameraPreset` | bắt buộc | xem mục 6 |
| `quality` | `Partial<QualitySettings>` | `DEFAULT_QUALITY` | DPR, antialias, breakpoint |
| `children` | `ReactNode` | bắt buộc | nội dung 3D |
| `poster` | `ReactNode` | `<SceneFallback story>` | poster tĩnh |
| `debug` | `boolean` | `false` | bật HUD |
| `forceReducedMotion` | `boolean` | — | ép giảm chuyển động |
| `className` | `string` | — | thêm class ngoài |

## 6. Thêm preset mới

```ts
// src/motion-kit/presets/enterprise.ts
import type { CameraPreset } from "../types";

export const enterprisePreset: CameraPreset = {
  id: "enterprise",
  label: "Doanh nghiệp — giải pháp tới vận hành",
  subjectWidth: 2.76,
  damping: 5.2,
  keyframes: [
    { at: 0,    fill: 0.62, target: [0, 0.94, 0], azimuth: 0,  elevation: 3,  fov: 42 },
    { at: 0.33, fill: 0.9,  target: [0, 0.98, 0], azimuth: 0,  elevation: 0,  fov: 40 },
    { at: 0.66, fill: 0.74, target: [0, 0.96, 0], azimuth: -30, elevation: 6, fov: 42 },
    { at: 1,    fill: 0.56, target: [0, 1.02, 0], azimuth: 0,  elevation: 13, fov: 44 },
  ],
  compact: {
    keyframes: [ /* 4 keyframe cho màn hẹp, hoặc bỏ hẳn để dùng keyframes */ ],
  },
};
```

Quy tắc:

- `at` tăng dần, trong `[0, 1]`, ít nhất 2 keyframe.
- `fill` là phần chiều rộng khung hình; `1.0` = chạm hai mép, `>1` = cắt có chủ ý.
- `subjectWidth` là bề rộng thật của chủ thể trong world unit. Sai số ở đây làm mọi keyframe lệch theo.
- `validatePreset()` chạy khi mount và ném lỗi nếu dữ liệu sai.

## 7. Thêm một project mới

1. Tạo `src/content/<slug>.ts` chứa `Story` và (nếu cần) hàm vẽ màn hình.
2. Chọn hoặc tạo preset.
3. Tạo một client component ghép `ScrollScene` + nội dung 3D.
4. Thêm route.

Không cần sửa `src/motion-kit/`. Nếu phải sửa kit để thêm project, đó là dấu hiệu API đang sai.

## 8. Quality

```tsx
<ScrollScene
  quality={{
    desktop: { dpr: [1, 2], antialias: true },
    mobile: { dpr: [1, 1.5], antialias: false },
    mobileBreakpoint: 900,
  }}
/>
```

Trên máy yếu, hạ `dpr` trước khi hạ chất lượng hình. Antialias tắt trên mobile vì DPR đã đủ và tiết kiệm fill rate.

## 9. Debug

Mở `?debug=1`. HUD hiện: progress, chương, toạ độ camera đã giải, target, render mode, số trigger/canvas do kit sở hữu.

Ngoài HUD, `window.__MOTION_KIT__` cho phép test đọc cùng dữ liệu:

```js
window.__MOTION_KIT__.snapshot;  // { progress, chapter, camera, target, render, triggers, canvases }
window.__MOTION_KIT__.triggers;  // số ScrollTrigger do kit tạo
window.__MOTION_KIT__.canvases;  // số canvas đang sống
```

## 10. Cái bẫy

| Triệu chứng | Nguyên nhân |
|---|---|
| Stage không dính | Một ancestor có `overflow: hidden` / `overflow-x: hidden` (dùng `clip` nếu buộc phải cắt) |
| Chữ tiếng Việt bị tách dấu | Import CSS sai thứ tự, hoặc quên map `--mk-font-display` |
| Hai cảnh tranh nhau | Nhiều `ScrollScene` cùng lúc trên một trang — chỉ mount cảnh gần viewport |
| Cuộn bị giật trên iOS | `100vh` thay vì `100svh`; kit đã dùng `svh` |
| Camera đứng yên | `invalidateRef` chưa được `CameraRig` đăng ký, hoặc `frameloop` bị `never` |
| Nội dung không có khi tắt JS | Trang dùng `dynamic(..., { ssr: false })` cho cả `ScrollScene`; chỉ Canvas mới được client-only |

## 11. Checklist sau khi nhúng

- [ ] Tắt JS: chương và CTA vẫn đọc/bấm được.
- [ ] Chặn `webgl`/`webgl2`: poster hiện, không có lỗi console.
- [ ] `prefers-reduced-motion: reduce`: không có canvas, không có trigger.
- [ ] Điều hướng rời trang rồi quay lại 5 lần: `__MOTION_KIT__.triggers` và `.canvases` trở lại đúng.
- [ ] Resize và đổi orientation: không tràn ngang, camera reframe đúng.
- [ ] `Tab` tới được CTA, focus ring rõ.
