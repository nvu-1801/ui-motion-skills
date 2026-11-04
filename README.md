# UI Motion Skills

Bộ hướng dẫn cho coding agent thiết kế giao diện, giữ đúng nghiệp vụ và triển khai backend trong repo hiện có. Mỗi skill là một file SKILL.md độc lập. Repo có hai demo web và script cài đặt PowerShell.

## Chọn skill

| Skill | Dùng khi |
| --- | --- |
| [ui-workflow](.agents/skills/ui-workflow/SKILL.md) | Đi từ brief, quy tắc repo và luồng nghiệp vụ đến UI đã kiểm tra |
| [ui-design](.agents/skills/ui-design/SKILL.md) | Chọn bố cục, typography, màu, tỷ lệ ảnh và hệ token |
| [ui-components](.agents/skills/ui-components/SKILL.md) | Dựng hero, navigation, card, gallery hoặc form theo component và dữ liệu hiện có |
| [landing-business-rules](.agents/skills/landing-business-rules/SKILL.md) | Giữ hành trình khách, CTA, giá, nội dung, locale, SEO và form của landing page |
| [scroll-storytelling](.agents/skills/scroll-storytelling/SKILL.md) | Làm sticky stage, reveal hoặc timeline đồng bộ với cuộn |
| [web-3d-scenes](.agents/skills/web-3d-scenes/SKILL.md) | Làm cảnh WebGL, camera theo cuộn và fallback |
| [ui-visual-qa](.agents/skills/ui-visual-qa/SKILL.md) | Kiểm tra layout, tương tác, bàn phím và các chế độ fallback |
| [backend-workflow](.agents/skills/backend-workflow/SKILL.md) | Thay đổi nghiệp vụ, phân quyền, lưu trữ, migration hoặc side effect ở bất kỳ stack nào |
| [backend-api-contracts](.agents/skills/backend-api-contracts/SKILL.md) | Thiết kế API HTTP, mã lỗi, giới hạn payload, rate limit và retry |
| [backend-nextjs](.agents/skills/backend-nextjs/SKILL.md) | Tích hợp backend trên Next.js App Router với Route Handler, Server Action và module server-only |

**Landing page** dùng ui-workflow, landing-business-rules và ui-visual-qa. Thêm ui-design hoặc ui-components khi cần thay thiết kế hay code. **Form có API** dùng thêm backend-workflow và backend-api-contracts. **Next.js App Router** thêm backend-nextjs. Với Express, FastAPI, Django, Rails, Spring hoặc ASP.NET Core, dùng hai skill backend chung và giữ controller, service, ORM, auth và test runner theo repo đích.

## Cài và cập nhật trên Codex

Dùng checkout local của repo này. Nếu nhóm đã có remote, clone URL của remote về một thư mục dùng chung. Từ checkout, chạy PowerShell:

```powershell
./scripts/install.ps1 -Target 'D:/work/project' -WhatIf
./scripts/install.ps1 -Target 'D:/work/project'
./scripts/install.ps1 -Target 'D:/work/project' -Skill ui-workflow,landing-business-rules,ui-visual-qa
./scripts/install.ps1 -Target 'D:/work/project' -Skill backend-workflow,backend-api-contracts,backend-nextjs
```

Script cài skill vào .agents/skills/ của project. Bỏ -Skill để cài tất cả. Mở phiên Codex mới trong project và gọi skill theo tên.

> $ui-workflow $landing-business-rules Thiết kế lại trang tour. Giữ bộ lọc, locale, giá và form yêu cầu tư vấn. Kiểm tra CTA trên mobile và bằng bàn phím.

> $backend-workflow $backend-api-contracts $backend-nextjs Sửa API nhận yêu cầu tư vấn. Giữ hợp đồng hiện tại, kiểm tra retry đồng thời và phản hồi khi dịch vụ gửi mail lỗi.

Để cập nhật, chạy git pull trong repo skill có remote rồi chạy lại lệnh cài. Script đối chiếu hash trước khi ghi và dừng khi gặp bản cài đã bị chỉnh tay hoặc thư mục skill do công cụ khác quản lý. Sao lưu và so sánh các thay đổi đó trước khi đồng bộ. Với nhóm cần cùng phiên bản, ghi lại tag hoặc commit nguồn.

## Dùng với agent khác

Với agent hỗ trợ SKILL.md, sao chép thư mục của từng skill sang vị trí mà agent đó đọc. Kiểm tra cơ chế nhận diện và cú pháp gọi trong công cụ đang dùng. Với agent chỉ nhận prompt, đưa file SKILL.md đã chọn vào ngữ cảnh và ghi rõ yêu cầu áp dụng. Có thể dùng prompt sau:

> Đọc hướng dẫn repo và các file SKILL.md tôi đính kèm. Xác định các luồng và hợp đồng cần giữ, thực hiện thay đổi theo stack hiện có, rồi ghi lệnh kiểm tra cùng kết quả thực tế.

Script cài đặt nhắm tới .agents/skills/. Các skill không yêu cầu MCP hoặc plugin cụ thể. Việc nạp skill trên từng agent phụ thuộc cấu hình của agent đó.

## Quy tắc rút từ Sea Trip Travel

| Quy tắc đã áp dụng | Bằng chứng trong project nguồn |
| --- | --- |
| Đi từ khám phá, quan tâm, xem tour đến gửi yêu cầu | src/app/[locale]/page.tsx và các section trong src/features/home |
| Menu và CTA đi tới danh mục, chi tiết hoặc tư vấn thật. Giá chưa công bố hiển thị lời mời tư vấn. | docs/acceptance-checklist.md, nhóm điều hướng, CTA và dữ liệu còn thiếu |
| Bản dịch chưa đạt tiêu chí có thông báo và được xử lý riêng khi lập chỉ mục | src/app/[locale]/page.tsx và docs/I18N_GUIDE.md |
| Form giữ dữ liệu khi lỗi và dùng hợp đồng API để hiển thị kết quả tiếp nhận | docs/lead-flow.md, src/app/api/leads/route.ts và src/server/leads/service.ts |

Tên trường, ngưỡng giới hạn, trạng thái dịch và chính sách giá của Sea Trip là ví dụ theo dự án. Khi áp dụng ở repo khác, lấy giá trị từ nguồn và quy tắc của repo đó. Backend workflow cũng hướng dẫn chống race khi chạy nhiều instance. Đây là yêu cầu thiết kế cho hệ thống đích, chưa phải kết luận rằng cơ chế idempotency của Sea Trip đã qua kiểm thử đồng thời.

Các skill backend được viết theo hướng dùng lại giữa các stack, có đối chiếu hai skill local backend-dev-guidelines và api-design-principles. Phần Next.js được tách riêng để hướng dẫn framework không áp đặt lên các repo khác.

## Chạy demo

- [Landing responsive](examples/responsive-landing/index.html) mở trực tiếp trong trình duyệt. Hero, thẻ nội dung và CTA lấy cảm hứng từ Sea Trip Travel. Dữ liệu và hình minh họa là mẫu. Demo minh họa CTA tới danh sách, còn locale, form và SEO được mô tả trong skill nghiệp vụ.
- [Scroll 3D](examples/scroll-3d-story) dùng motion kit từ Portfolio 3D. Xem [tích hợp](examples/scroll-3d-story/INTEGRATION.md) và [pattern](examples/scroll-3d-story/MOTION_PATTERNS.md).

```powershell
cd examples/scroll-3d-story
npm ci
npm run dev
```

Mở /lab/scroll-3d. Để kiểm tra bản production, chạy npm run typecheck, npm run build, npx playwright install chromium và npm run test:e2e.

## Đóng góp và mở rộng

Tạo thư mục .agents/skills/<ten-skill>/ với SKILL.md có frontmatter name và description. Dùng tên chữ thường và dấu gạch nối. Viết rõ tình huống kích hoạt, quyết định cần hướng dẫn, bước xác minh và các giả định theo stack. Cập nhật bảng skill và CHANGELOG khi bổ sung. Installer hiện đồng bộ entrypoint SKILL.md, nên cần mở rộng installer nếu skill sau này dựa vào file tham chiếu đi kèm.

Figma MCP và Blender MCP là các tích hợp dự kiến cho đối chiếu thiết kế và chuẩn bị asset 3D. Xem [kế hoạch](PLAN.md).
