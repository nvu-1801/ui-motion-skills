import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "UI Motion Lab — Website & web app",
  description:
    "Portfolio của UI Motion Lab: website, web app và bộ kit chuyển động scroll 3D có fallback đọc được.",
};

const cards = [
  {
    title: "Bộ kit chuyển động",
    body: "ScrollScene, CameraRig, DeviceScreen, LayerStack và preset camera tách khỏi nội dung. Có bản chạy thật trong lab.",
    tag: "Đã có bản chạy",
    accent: true,
  },
  {
    title: "Case study HẢI TRÌNH",
    body: "Demo minh họa bốn chương kể chuyện. Không phải dự án khách hàng, không có số liệu kinh doanh.",
    tag: "Dự án minh họa",
    accent: false,
  },
  {
    title: "Portfolio & dịch vụ",
    body: "Trang danh sách dự án, trang chi tiết và liên hệ. Chưa mở trong đợt này vì chưa có dữ liệu xác minh.",
    tag: "Bước tiếp theo",
    accent: false,
  },
];

const principles = [
  {
    n: "01",
    title: "Một chủ sở hữu cho mỗi thuộc tính",
    body: "GSAP đọc cuộn và ghi progress. Camera chỉ do một component cập nhật. Không có hai hệ cùng tranh một giá trị.",
  },
  {
    n: "02",
    title: "Fallback trước, hiệu ứng sau",
    body: "Nội dung, liên kết và CTA render từ server. Cảnh 3D là lớp nâng cấp: mất WebGL thì trang vẫn đọc được, không phải trang lỗi.",
  },
  {
    n: "03",
    title: "Chuyển động phải giải thích điều gì đó",
    body: "Camera tiến sát khi cần đọc, xoay ngang khi cần thấy các lớp. Nếu bỏ chuyển động đi mà câu chuyện vẫn y nguyên thì nó chỉ là trang trí.",
  },
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link className="brand" href="/">
            {site.name}
            <span>{site.role}</span>
          </Link>
          <nav className="nav" aria-label="Điều hướng chính">
            <Link href="/lab/scroll-3d">Lab</Link>
            <Link href="#principles">Nguyên tắc</Link>
            <Link href="#contact">Liên hệ</Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="shell hero">
          <p className="eyebrow">Web & web app · bản đang phát triển</p>
          <h1 className="display">
            Website có <em>chiều sâu</em>,<br />
            không chỉ có hiệu ứng.
          </h1>

          <div className="hero__body">
            <p className="lede">
              Tôi xây website và web app bằng React/Next.js: bố cục có chủ đích, chuyển động gắn với nội dung, và luôn
              có một đường đọc đầy đủ khi cảnh 3D không chạy.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" href="/lab/scroll-3d">
                Xem demo scroll 3D <span aria-hidden="true">→</span>
              </Link>
              <a className="btn btn--ghost" href="#principles">
                Cách tôi làm
              </a>
            </div>
          </div>

          <dl className="facts">
            <div className="fact">
              <dt>Đang làm</dt>
              <dd>Bộ kit scroll 3D tái sử dụng</dd>
            </div>
            <div className="fact">
              <dt>Stack</dt>
              <dd>Next.js · React · Three.js · GSAP</dd>
            </div>
            <div className="fact">
              <dt>Trạng thái</dt>
              <dd>{site.status}</dd>
            </div>
          </dl>
        </section>

        <section className="shell section" aria-labelledby="building-title">
          <div className="section__head">
            <h2 className="h2" id="building-title">
              Đang xây
            </h2>
            <p className="mono">Ba phần, làm theo thứ tự</p>
          </div>
          <div className="cards">
            {cards.map((card) => (
              <article className="card" key={card.title}>
                <div className="tags">
                  <span className={card.accent ? "tag tag--accent" : "tag"}>{card.tag}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shell section" id="principles" aria-labelledby="principles-title">
          <div className="section__head">
            <h2 className="h2" id="principles-title">
              Ba nguyên tắc kỹ thuật
            </h2>
            <p className="mono">Áp dụng trong kit</p>
          </div>
          <ol className="principles">
            {principles.map((item) => (
              <li className="principle" key={item.n}>
                <span className="principle__n">{item.n}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="shell section" id="contact" aria-labelledby="contact-title">
          <div className="section__head">
            <h2 className="h2" id="contact-title">
              Liên hệ
            </h2>
            <p className="mono">Chưa cấu hình</p>
          </div>
          <div className="card" style={{ maxWidth: "42rem" }}>
            <div className="tags">
              <span className="tag tag--accent">Bản local</span>
            </div>
            <p>
              Bản này chưa có thông tin liên hệ được xác nhận. Khi công bố, email và số điện thoại sẽ được đặt trong{" "}
              <code className="mono">src/content/site.ts</code> — không hiển thị địa chỉ giả.
            </p>
            <p>
              Trong lúc đó, phần đáng xem nhất là{" "}
              <Link href="/lab/scroll-3d">lab scroll 3D</Link>.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer shell">
        <span>
          © 2026 {site.name} · {site.role}
        </span>
        <span>{site.status}</span>
      </footer>
    </>
  );
}
