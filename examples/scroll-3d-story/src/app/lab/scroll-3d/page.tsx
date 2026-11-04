import type { Metadata } from "next";
import Link from "next/link";
import { Scroll3DDemo } from "./Scroll3DDemo";
import { seaTripStory } from "@/content/sea-trip";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Lab — Scroll 3D",
  description:
    "Vertical slice: một thiết bị 3D, bốn trạng thái camera theo tiến độ cuộn, fallback tĩnh và điều hướng bàn phím.",
};

const modules = [
  ["types.ts", "Preset camera, story, quality — dữ liệu thuần"],
  ["ScrollScene.tsx", "Bố cục sticky, ScrollTrigger, chương HTML"],
  ["SceneCanvas.tsx", "Một Canvas, ngân sách DPR, gate render, context loss"],
  ["CameraRig.tsx", "Chủ sở hữu duy nhất của camera"],
  ["DeviceScreen.tsx", "Texture vẽ bằng Canvas 2D, có dispose"],
  ["LayerStack.tsx", "Các lớp chiều sâu phía sau thiết bị"],
  ["StoryChapter.tsx", "HTML semantic, không phụ thuộc canvas"],
  ["MotionPreferences.tsx", "prefers-reduced-motion, không hydration mismatch"],
  ["SceneFallback.tsx", "Poster render từ server"],
  ["presets/travel.ts", "Bốn keyframe: wide → close → orbit → pull-back"],
];

const steps = [
  {
    n: "01",
    title: "Cuộn ghi vào ref, không ghi vào state",
    body: "ScrollTrigger đọc tiến độ, một tween ngắn làm mượt, rồi ghi vào ref. Không có setState nào trên đường chạy mỗi frame — React chỉ render lại khi đổi chương.",
  },
  {
    n: "02",
    title: "Camera chỉ có một người viết",
    body: "CameraRig đọc tiến độ trong useFrame và damp theo delta time. GSAP không bao giờ chạm camera, nên cuộn ngược hay nhảy giữa trang đều ra cùng một khung hình.",
  },
  {
    n: "03",
    title: "Cảnh 3D là lớp nâng cấp",
    body: "Poster và toàn bộ nội dung có trong HTML từ server. WebGL lỗi, mất context hoặc người dùng giảm chuyển động thì poster ở lại và mọi liên kết vẫn dùng được.",
  },
];

export default function LabPage() {
  return (
    <>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link className="brand" href="/">
            {site.name}
            <span>{site.role}</span>
          </Link>
          <nav className="nav" aria-label="Điều hướng chính">
            <Link href="/">Trang chủ</Link>
            <Link href="#kit">Bộ kit</Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="shell lab-head">
          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> Trang chủ
          </Link>
          <h1 className="lab-title">Một màn hình, bốn trạng thái.</h1>
          <p className="lede" style={{ marginTop: "1.25rem" }}>
            {seaTripStory.lede}
          </p>
          <div className="lab-meta">
            <span className="tag tag--accent">WebGL thật</span>
            <span className="tag">Next.js 16</span>
            <span className="tag">React Three Fiber</span>
            <span className="tag">GSAP ScrollTrigger</span>
            <span className="tag">Dự án minh họa</span>
          </div>
          <p className="disclosure">
            <strong>Dự án minh họa.</strong> {seaTripStory.disclosure} Không có khách hàng, doanh thu, tỷ lệ chuyển đổi
            hay testimonial nào được mô tả ở đây.
          </p>
        </section>

        <Scroll3DDemo />

        <section className="shell section" id="kit" aria-labelledby="kit-title">
          <div className="section__head">
            <h2 className="h2" id="kit-title">
              Bộ kit
            </h2>
            <p className="mono">src/motion-kit</p>
          </div>
          <ul className="kit-list">
            {modules.map(([file, description]) => (
              <li key={file}>
                <code>{file}</code>
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="shell section" aria-labelledby="how-title">
          <div className="section__head">
            <h2 className="h2" id="how-title">
              Cách hoạt động
            </h2>
            <p className="mono">Chi tiết trong MOTION_PATTERNS.md</p>
          </div>
          <ol className="principles">
            {steps.map((step) => (
              <li className="principle" key={step.n}>
                <span className="principle__n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="shell section" aria-labelledby="debug-title">
          <div className="section__head">
            <h2 className="h2" id="debug-title">
              Kiểm tra cảnh
            </h2>
          </div>
          <p className="lede">
            Thêm <code className="mono">?debug=1</code> vào URL để xem tiến độ cuộn, chương đang đọc, toạ độ camera và
            số trigger/canvas do kit sở hữu. HUD chỉ xuất hiện khi được yêu cầu.
          </p>
        </section>
      </main>

      <footer className="site-footer shell">
        <span>
          © 2026 {site.name} · {site.role}
        </span>
        <Link href="/">Về trang chủ</Link>
      </footer>
    </>
  );
}
