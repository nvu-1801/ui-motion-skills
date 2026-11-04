# MOTION PATTERNS

Các pattern đã triển khai, lý do chọn, và cách tái dùng. Mỗi mục ghi rõ nó nằm ở file nào.

---

## 1. Sticky stage + cột chương cuộn

**File:** `src/motion-kit/styles.css`, `src/motion-kit/ScrollScene.tsx`

Desktop: grid hai cột. Cột trái là `.mk-stage` với `position: sticky; top: 0; height: 100svh`. Cột phải là danh sách chương, mỗi chương `min-height: 88vh`, quyết định tổng chiều cao cuộn.

**Vì sao không dùng GSAP `pin`:** `pin` tạo pin-spacer, dễ vỡ khi resize/đổi orientation, và jank trên mobile khi thanh địa chỉ đổi chiều cao. Sticky cho cùng kết quả thị giác, không có layout shift, và tự nhiên đúng khi tắt JS.

**Điều kiện để sticky hoạt động:** không có ancestor nào có `overflow: hidden`. Đây là cái bẫy phổ biến nhất khi nhúng kit — xem `docs/INTEGRATION.md`.

Mobile (< 900px): stage sticky ở đỉnh với `46svh`, chương trôi lên trên dưới dạng card nền đục. Cảnh không biến mất khi đang đọc.

---

## 2. Đường đi của tiến độ

```
scroll (native)
  → ScrollTrigger.onUpdate(self.progress)      // giá trị thô
  → gsap.quickTo(proxy, "value", duration .26) // làm mượt
  → progressRef.current                        // ref, không phải state
  → CameraRig.useFrame                         // đọc, không ghi ngược
```

**Quy tắc:** `self.progress` **không** được coi là đã mượt. Nó là *target*; tween proxy mới là giá trị đã mượt.

**Vì sao ref:** không `setState` trên đường chạy mỗi frame. React chỉ render lại khi đổi chương hoặc đổi trạng thái fallback.

**Tái dùng:** nếu cần điều khiển khác theo cuộn (ví dụ opacity của một lớp HTML), đọc cùng `progressRef` trong một `useEffect` + `rAF`, đừng thêm ScrollTrigger thứ hai.

---

## 3. Keyframe camera theo khung hình, không theo toạ độ tuyệt đối

**File:** `src/motion-kit/types.ts`, `src/motion-kit/camera.ts`, `src/motion-kit/presets/travel.ts`

Một keyframe gồm:

```ts
{ at, fill, target, azimuth, elevation, fov }
```

- `fill` = phần trăm chiều rộng khung hình mà chủ thể chiếm. `>1` là cố ý cắt.
- `azimuth` / `elevation` = hướng camera quanh target.
- Khoảng cách được **giải** từ `fill`, `fov` và aspect thật của canvas:

```
distance = subjectWidth / (fill * 2 * tan(fov/2) * aspect)
```

**Vì sao:** toạ độ XYZ tuyệt đối chỉ đúng ở đúng một tỉ lệ khung hình. Cùng một preset sẽ cắt mất thiết bị trên desktop hẹp hoặc thu nhỏ trên mobile. Cách này giữ bố cục ổn định từ 1440×900 đến 390×844 mà không cần preset thứ hai.

**Nội suy:** `smootherstep` theo từng đoạn, nên vận tốc bằng 0 tại mỗi keyframe — không có "góc" ở chỗ chuyển trạng thái. Giá trị tại `at` là chính xác.

**Tái dùng:** thêm preset mới = thêm một file dữ liệu. Không sửa component.

---

## 4. Damping phụ thuộc delta time

**File:** `src/motion-kit/CameraRig.tsx`

```ts
const k = 1 - Math.exp(-damping * Math.min(delta, 0.05));
cur.fill = lerp(cur.fill, target.fill, k);
```

- Độc lập frame rate: 30fps và 120fps cho cùng cảm giác.
- `Math.min(delta, 0.05)` chặn bước nhảy khi tab bị treo rồi quay lại.
- **Chỉ một component ghi camera.** Không GSAP tween nào chạm `camera.position`.

---

## 5. `frameloop="demand"` với vòng tự hội tụ

**File:** `src/motion-kit/SceneCanvas.tsx`, `CameraRig.tsx`

- Canvas chạy `frameloop="demand"`.
- Scroll gọi `invalidate()` mỗi khi progress đổi.
- Trong `useFrame`, nếu damping **chưa hội tụ**, gọi `invalidate()` tiếp. Vòng lặp tự dừng khi sai số dưới ngưỡng.

Nếu chỉ dựa vào invalidate từ scroll, phần đuôi của damping sẽ không bao giờ render và camera dừng ở giá trị lệch.

Khi stage ra khỏi viewport hoặc tab bị ẩn → `frameloop="never"`, không render gì.

---

## 6. Chương active bằng IntersectionObserver

**File:** `src/motion-kit/ScrollScene.tsx`

Một observer với `rootMargin: "-52% 0px -12% 0px"` tạo một dải mỏng; chương nằm trong dải là chương đang đọc. Chỉ `setState` khi chỉ số **đổi**.

Không dùng ScrollTrigger cho việc này: hai hệ cùng theo dõi cuộn sẽ dễ lệch pha, và đây là tín hiệu rời rạc chứ không phải liên tục.

---

## 7. Fallback-first

**File:** `src/motion-kit/SceneFallback.tsx`, `ScrollScene.tsx`

Thứ tự triển khai:

1. Server render poster + toàn bộ chương + CTA.
2. Client, sau hai `requestAnimationFrame`, mới mount Canvas.
3. Canvas trong suốt, nằm trên poster.
4. WebGL lỗi / mất context → canvas unmount hoặc dừng, poster hiện lại, thông báo `role="status"`.

Không có nhánh nào khiến nội dung biến mất.

---

## 8. Texture vẽ tại runtime

**File:** `src/motion-kit/DeviceScreen.tsx`, `src/content/sea-trip.ts`

- `CanvasTexture` tạo trong `useEffect`, dispose trong cleanup.
- Chờ `document.fonts.ready` rồi vẽ lại một lần để chữ trên màn hình khớp font site.
- Font đọc từ CSS variable bằng `readFontStack()` — next/font đặt tên family có hash, canvas cần danh sách family thật.
- `colorSpace = SRGBColorSpace`, `anisotropy = min(8, max)`.
- Trần texture 1280px.

**Không tuyên bố "luôn nét".** Đã kiểm tra trên ảnh chụp 1440×900 và 390×844; chưa đo trên thiết bị thật.

---

## 9. LayerStack — chiều sâu có thật

**File:** `src/motion-kit/LayerStack.tsx`

Ba panel dạng rounded-rect nằm sau chủ thể, lệch Z và scale tăng dần, opacity giảm dần.

**Vì sao cần:** nếu không có geometry phía sau, cú orbit chỉ là một ảnh phẳng trượt ngang. Các panel biến chuyển động camera thành thông tin ("sản phẩm có nhiều lớp").

---

## Pattern đã cân nhắc và **loại**

| Pattern | Lý do loại |
|---|---|
| GSAP tween trực tiếp `camera.position` | Tranh quyền với `useFrame`, khó đảo ngược chính xác |
| GSAP `pin` + `scrub` cho cả section | Pin-spacer vỡ layout, jank mobile |
| Lenis smooth scroll | Hai hệ điều khiển cuộn, hỏng anchor và back/forward |
| Scroll-jacking (khoá cuộn theo bước) | Phá điều hướng bàn phím và deep link |
| Parallax CSS cho mọi section | Không giải thích thêm thông tin gì; đúng loại "trang trí" cần tránh |
| Một Canvas cho mỗi card dự án | Nhiều WebGL context, tụt hiệu năng |
