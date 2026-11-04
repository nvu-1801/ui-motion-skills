# UI Motion Skills

Bộ skill Codex cho thiết kế và triển khai UI trong repo hiện có. Bắt đầu với `$ui-workflow` khi cần làm từ brief đến nghiệm thu.

## Cài vào project

Clone repo skill vào một thư mục riêng. Chạy từ thư mục skill bằng PowerShell.

```powershell
./scripts/install.ps1 -Target 'D:/work/project' -WhatIf
./scripts/install.ps1 -Target 'D:/work/project'
./scripts/install.ps1 -Target 'D:/work/project' -Skill ui-design,ui-visual-qa
```

Script cài các entrypoint SKILL.md hiện có vào .agents/skills của project. Bỏ -Skill để cài tất cả. Mở phiên Codex mới trong project đích và gọi skill theo tên.

> $ui-workflow Thiết kế lại trang tour. Giữ bộ lọc, locale, cách hiển thị giá và luồng gửi yêu cầu. Kiểm tra mobile và bàn phím.

Để cập nhật, chạy git pull trong repo skill rồi chạy lại lệnh cài. Script dùng hash để nhận diện bản đã cài và dừng trước khi ghi nếu có xung đột. Nếu một skill đích đã được chỉnh tay, đối chiếu và sao lưu phần chỉnh trước khi tự xử lý xung đột.

## Demo

- [Landing responsive](examples/responsive-landing/index.html) mở trực tiếp trong trình duyệt. Hero, thẻ nội dung và CTA lấy cảm hứng từ Sea Trip Travel. Hình minh họa dùng CSS.
- [Scroll 3D](examples/scroll-3d-story) dùng motion kit từ Portfolio 3D. Nội dung minh họa và màn hình thiết bị được vẽ bằng code. Xem [hướng dẫn tích hợp](examples/scroll-3d-story/INTEGRATION.md) và [các pattern](examples/scroll-3d-story/MOTION_PATTERNS.md).

```powershell
cd examples/scroll-3d-story
npm ci
npm run dev
```

Mở /lab/scroll-3d. Để kiểm tra bản production, chạy npm run typecheck, npm run build, npx playwright install chromium rồi npm run test:e2e.

## Mở rộng

Figma MCP và Blender MCP là các tích hợp dự kiến. Xem [kế hoạch](PLAN.md) để biết phạm vi từng tích hợp và quy tắc kiểm tra nghiệp vụ.
