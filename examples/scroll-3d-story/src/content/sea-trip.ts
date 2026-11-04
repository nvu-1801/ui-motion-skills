import { readFontStack } from "@/motion-kit/fonts";
import type { ScreenDraw } from "@/motion-kit/DeviceScreen";
import type { Story } from "@/motion-kit/types";

/**
 * HẢI TRÌNH demo content.
 *
 * This is an illustrative product story, not a delivered case study. Every
 * screen in the scene is drawn by us at runtime; there are no client screenshots,
 * no logos and no business metrics anywhere in this file.
 */
export const seaTripStory: Story = {
  slug: "sea-trip",
  eyebrow: "HẢI TRÌNH · DU LỊCH",
  title: "Từ một điểm đến trên màn hình đến một yêu cầu được xử lý.",
  lede:
    "Một màn hình sản phẩm đổi góc nhìn theo tiến độ cuộn: mở rộng để thấy bối cảnh, tiến sát để đọc thông tin tour, xoay ngang để thấy các lớp nội dung, rồi lùi lại để chốt hành động.",
  disclosure: "Dự án minh họa — giao diện trong cảnh được dựng cho demo, không phải ảnh chụp sản phẩm đã bàn giao.",
  chapters: [
    {
      id: "van-de",
      index: "01",
      kicker: "Vấn đề",
      title: "Khách không thiếu lựa chọn. Khách thiếu một mạch dẫn.",
      body:
        "Một website du lịch thường để khách tự nối điểm đến, lịch trình, điều kiện và form liên hệ. Mỗi bước nối thêm là một chỗ để rơi rụng.",
      points: ["Điểm chạm rời rạc", "Thông tin tour nằm rải rác", "Không rõ bước tiếp theo"],
    },
    {
      id: "kham-pha",
      index: "02",
      kicker: "Quyết định",
      title: "Camera tiến sát đúng lúc nội dung cần được đọc.",
      body:
        "Thay vì một lưới ảnh tĩnh, màn hình mở ra theo nhịp đọc: tổng quan trước, chi tiết sau. Chuyển động ở đây để chỉ hướng chú ý, không phải để trang trí.",
      points: ["Tổng quan trước, chi tiết sau", "Mỗi chương một tiêu điểm"],
    },
    {
      id: "hanh-trinh",
      index: "03",
      kicker: "Trải nghiệm",
      title: "Xoay ngang để thấy sản phẩm có nhiều lớp.",
      body:
        "Camera orbit cho thấy các lớp phía sau màn hình: nội dung điểm đến, lịch trình, và lớp xử lý yêu cầu. Cùng một cảnh, ba mức thông tin khác nhau.",
      points: ["Lớp điểm đến", "Lớp lịch trình", "Lớp vận hành"],
    },
    {
      id: "hanh-dong",
      index: "04",
      kicker: "Hành động",
      title: "Lùi lại, để lựa chọn cuối cùng rõ ràng.",
      body:
        "Kết thúc bằng một hành động duy nhất. Nội dung và nút bấm là HTML thật: đọc được, focus được và bấm được kể cả khi cảnh 3D không tải.",
      points: ["CTA nằm trong HTML", "Hoạt động khi tắt JS hoặc mất WebGL"],
    },
  ],
  cta: { label: "Xem bộ kit chuyển động", href: "#kit" },
};

const UI = {
  bg: "#0b0d10",
  panel: "#12151a",
  panelDeep: "#0e1116",
  line: "rgba(244,241,234,0.10)",
  lineSoft: "rgba(244,241,234,0.06)",
  fg: "#f4f1ea",
  muted: "#8f8a80",
  dim: "#5f5b54",
  accent: "#ff6a1a",
};

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function pill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  opts: { font: string; color: string; border?: string; fill?: string; padX?: number; h?: number },
): number {
  const h = opts.h ?? 26;
  const padX = opts.padX ?? 12;
  ctx.save();
  ctx.font = opts.font;
  const textWidth = ctx.measureText(label).width;
  const w = textWidth + padX * 2;
  if (opts.fill) {
    ctx.fillStyle = opts.fill;
    rr(ctx, x, y, w, h, h / 2);
    ctx.fill();
  } else if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = 1;
    rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, h / 2);
    ctx.stroke();
  }
  ctx.fillStyle = opts.color;
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + padX, y + h / 2 + 0.5);
  ctx.restore();
  return w;
}

type TrackedContext = CanvasRenderingContext2D & { letterSpacing?: string };

function tracking(ctx: CanvasRenderingContext2D, value: string): void {
  (ctx as TrackedContext).letterSpacing = value;
}

/**
 * The HẢI TRÌNH screen, authored at 1024×640 and scaled to whatever texture the
 * renderer asks for. Pure canvas: no external images, no network, no CORS.
 */
export const drawSeaTripScreen: ScreenDraw = (ctx, width, height) => {
  const scale = width / 1024;
  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";

  const display = readFontStack("--font-display", "Georgia, serif");
  const sans = readFontStack("--font-sans", "system-ui, sans-serif");
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

  const W = 1024;
  const H = 640;

  // base
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#0d0f13");
  bgGrad.addColorStop(1, UI.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ---------------------------------------------------------------- top bar
  ctx.fillStyle = UI.fg;
  ctx.font = `600 21px ${display}`;
  tracking(ctx, "1px");
  ctx.fillText("HẢI TRÌNH", 44, 52);
  tracking(ctx, "0px");

  ctx.font = `500 12px ${sans}`;
  ctx.fillStyle = UI.muted;
  ctx.fillText("Điểm đến", 610, 50);
  ctx.fillText("Tour", 692, 50);
  ctx.fillText("Lịch trình", 742, 50);

  pill(ctx, 850, 30, "Tư vấn", {
    font: `600 12px ${sans}`,
    color: UI.fg,
    border: "rgba(244,241,234,0.22)",
    padX: 14,
    h: 28,
  });

  ctx.strokeStyle = UI.lineSoft;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(44, 82.5);
  ctx.lineTo(980, 82.5);
  ctx.stroke();

  // ------------------------------------------------------------- left column
  ctx.font = `500 10.5px ${mono}`;
  ctx.fillStyle = UI.accent;
  tracking(ctx, "1.6px");
  ctx.fillText("TUYẾN ĐIỂN HÌNH · MIỀN BẮC", 44, 132);

  ctx.fillStyle = UI.fg;
  ctx.font = `500 54px ${display}`;
  tracking(ctx, "-1px");
  ctx.fillText("Vịnh Hạ Long", 44, 200);
  ctx.fillStyle = UI.muted;
  ctx.fillText("3 ngày 2 đêm", 44, 258);
  tracking(ctx, "0px");

  ctx.font = `400 13.5px ${sans}`;
  ctx.fillStyle = UI.dim;
  ctx.fillText("Tàu qua đêm · hang động · chèo kayak", 44, 292);

  let tagX = 44;
  const tagY = 312;
  tagX += pill(ctx, tagX, tagY, "3N2Đ", {
    font: `500 11.5px ${sans}`,
    color: UI.muted,
    border: "rgba(244,241,234,0.16)",
  }) + 8;
  tagX += pill(ctx, tagX, tagY, "Tối đa 12 khách", {
    font: `500 11.5px ${sans}`,
    color: UI.muted,
    border: "rgba(244,241,234,0.16)",
  }) + 8;
  pill(ctx, tagX, tagY, "Khởi hành T5", {
    font: `500 11.5px ${sans}`,
    color: UI.muted,
    border: "rgba(244,241,234,0.16)",
  });

  // CTA
  const ctaY = 372;
  ctx.fillStyle = UI.accent;
  rr(ctx, 44, ctaY, 190, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#0a0b0d";
  ctx.font = `600 13px ${sans}`;
  ctx.textBaseline = "middle";
  ctx.fillText("Gửi yêu cầu tư vấn", 66, ctaY + 22.5);
  ctx.textBaseline = "alphabetic";

  ctx.font = `400 11.5px ${sans}`;
  ctx.fillStyle = UI.dim;
  ctx.fillText("Phản hồi trong 24 giờ làm việc", 252, ctaY + 26);

  // ------------------------------------------------------------- photo block
  const px = 618;
  const py = 108;
  const pw = 362;
  const ph = 318;

  ctx.save();
  rr(ctx, px, py, pw, ph, 18);
  ctx.clip();

  const sea = ctx.createLinearGradient(px, py, px + pw, py + ph);
  sea.addColorStop(0, "#12323d");
  sea.addColorStop(0.55, "#0d2029");
  sea.addColorStop(1, "#09141a");
  ctx.fillStyle = sea;
  ctx.fillRect(px, py, pw, ph);

  // sun
  const sun = ctx.createRadialGradient(px + 250, py + 104, 4, px + 250, py + 104, 92);
  sun.addColorStop(0, "rgba(255,106,26,0.95)");
  sun.addColorStop(0.35, "rgba(255,106,26,0.45)");
  sun.addColorStop(1, "rgba(255,106,26,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(px, py, pw, ph);

  ctx.fillStyle = "rgba(255,140,74,0.9)";
  ctx.beginPath();
  ctx.arc(px + 250, py + 104, 26, 0, Math.PI * 2);
  ctx.fill();

  // karst silhouettes
  const ridge = (offset: number, alpha: number, lift: number) => {
    ctx.beginPath();
    ctx.moveTo(px, py + ph);
    ctx.lineTo(px, py + ph - 96 + lift);
    for (let i = 0; i <= 8; i += 1) {
      const x = px + (pw / 8) * i;
      const h = py + ph - 86 + lift + Math.sin(i * 1.7 + offset) * 26 - (i % 3) * 16;
      ctx.lineTo(x, h);
    }
    ctx.lineTo(px + pw, py + ph);
    ctx.closePath();
    ctx.fillStyle = `rgba(10,17,22,${alpha})`;
    ctx.fill();
  };
  ridge(0.4, 0.55, 26);
  ridge(2.1, 0.82, 0);

  // water reflection
  ctx.fillStyle = "rgba(255,106,26,0.05)";
  ctx.fillRect(px, py + ph - 40, pw, 40);

  // label
  ctx.fillStyle = "rgba(244,241,234,0.92)";
  ctx.font = `500 12px ${sans}`;
  ctx.fillText("Hạ Long · Quảng Ninh", px + 20, py + ph - 20);
  ctx.restore();

  ctx.strokeStyle = "rgba(244,241,234,0.12)";
  ctx.lineWidth = 1;
  rr(ctx, px + 0.5, py + 0.5, pw - 1, ph - 1, 18);
  ctx.stroke();

  // --------------------------------------------------------------- cards row
  const cards = [
    { name: "Hòn Mun", meta: "Lặn ngắm san hô", len: "2N1Đ" },
    { name: "Bản Giốc", meta: "Thác & thung lũng", len: "3N2Đ" },
    { name: "Cát Bà", meta: "Đảo & vịnh", len: "2N1Đ" },
  ];

  const cardY = 452;
  const cardH = 112;
  const cardGap = 14;
  const cardW = (936 - cardGap * 2) / 3;

  cards.forEach((card, i) => {
    const x = 44 + i * (cardW + cardGap);
    ctx.fillStyle = UI.panel;
    rr(ctx, x, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.strokeStyle = i === 0 ? "rgba(255,106,26,0.36)" : UI.lineSoft;
    ctx.lineWidth = 1;
    rr(ctx, x + 0.5, cardY + 0.5, cardW - 1, cardH - 1, 14);
    ctx.stroke();

    ctx.fillStyle = UI.accent;
    ctx.fillRect(x + 16, cardY + 20, 16, 2);

    ctx.fillStyle = UI.fg;
    ctx.font = `500 16px ${display}`;
    ctx.fillText(card.name, x + 16, cardY + 48);

    ctx.fillStyle = UI.muted;
    ctx.font = `400 11.5px ${sans}`;
    ctx.fillText(card.meta, x + 16, cardY + 70);

    ctx.fillStyle = UI.dim;
    ctx.font = `500 10px ${mono}`;
    ctx.fillText(card.len, x + 16, cardY + 92);
  });

  ctx.restore();
};
