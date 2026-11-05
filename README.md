# UI Motion Skills

Kho skill dùng lại cho coding agent: thiết kế UI, triển khai backend, kiểm bug/logic, review code và xử lý GitHub Actions/deploy trên project đích. Mỗi gói có SKILL.md ngắn và tài nguyên đọc khi cần. Demo chỉ là ví dụ; bộ kiểm chất lượng được phân phối để áp dụng cho các project khác.

## Tái sử dụng UI và phát triển skill

Kho hiện có **25 skill**. Phần mới tập trung vào tìm nguồn UI chuẩn trước khi viết thêm code, cùng công cụ kiểm chứng và đóng gói. Xem [kế hoạch và trạng thái](UI_REUSE_AND_SKILL_EVOLUTION_PLAN.md).

| Skill | Dùng khi |
| --- | --- |
| [ui-system-reuse](.agents/skills/ui-system-reuse/SKILL.md) | Tìm component/modal, variant, font-size/màu/spacing, model và formatter sẵn có; tránh UI lệch và code lặp |
| [skill-authoring](.agents/skills/skill-authoring/SKILL.md) | Tạo/cập nhật/tách/gộp skill có phạm vi và tài nguyên cài riêng rõ ràng |
| [skill-evaluation](.agents/skills/skill-evaluation/SKILL.md) | Đánh giá activation, kết quả công việc và chi phí từ dữ liệu thực tế |
| [upstream-skill-audit](.agents/skills/upstream-skill-audit/SKILL.md) | Rà nguồn, license và side effect trước khi nhập/chạy skill bên ngoài |
| [dependency-security](.agents/skills/dependency-security/SKILL.md) | Kiểm dependency/lockfile, advisory, giấy phép và thay đổi phiên bản |
| [security-review](.agents/skills/security-review/SKILL.md) | Review trust boundary, authorization và dữ liệu nhạy cảm có liên quan |
| [database-migrations](.agents/skills/database-migrations/SKILL.md) | Expand/backfill/contract, tương thích app cũ/mới và phục hồi |

Tại checkout kho skill, cài và xuất registry mẫu:

```powershell
./scripts/install.ps1 -Target 'D:/work/project' -Skill ui-system-reuse
./scripts/export-quality-config.ps1 -Target 'D:/work/project' -Feature UIRegistry -WhatIf
./scripts/export-quality-config.ps1 -Target 'D:/work/project' -Feature UIRegistry
```

Sửa docs/ui-system/sources.json theo đường dẫn/token thật của project. Sau đó chạy tại project đích:

```powershell
python .agents/skills/ui-system-reuse/scripts/registry.py build --project . --spec docs/ui-system/sources.json --output docs/ui-system/registry.json
python .agents/skills/ui-system-reuse/scripts/registry.py query --project . --registry docs/ui-system/registry.json --role Button --kind component --limit 3
```

Registry là chỉ mục có chọn lọc, không tự hiểu toàn bộ AST. Nó trả metadata và freshness; source thay đổi thì phải xác minh lại. Hướng dẫn chọn **reuse → extend variant → create khi thiếu**, giữ semantic token và kiểm các consumer trước khi đổi default. Component giống hình thức nhưng khác hành vi có thể giữ riêng, dùng chung primitive. Brand/domain của project khác vẫn độc lập.

> $ui-system-reuse Thêm nút xác nhận vào trang mới. Tìm Button và variant sẵn có, dùng token typography/màu hiện tại; tránh tạo bản sao và kiểm các màn hình đang dùng chung.

Bộ đánh giá có suite positive/negative/holdout và scorer không bịa telemetry. Template runs.json để trống: chưa có benchmark agent A/B hay tỷ lệ tiết kiệm token được đo. Fixtures/script test là bằng chứng về công cụ và hành vi UI, không thay thế benchmark agent độc lập.

## Chọn đúng skill, tiết kiệm token

Đọc [catalog ngắn](CATALOG.md), không đọc toàn bộ kho. Có thể lấy nhóm khởi đầu bằng lệnh không nạp nội dung skill:

```powershell
python scripts/select-skills.py ui-fix
# ui-visual-qa
python scripts/select-skills.py logic
# bug-reproduction,business-logic-review
python scripts/select-skills.py ci
# github-actions
```

Task rõ phạm vi đi thẳng vào skill tương ứng. Task chưa rõ dùng quality-workflow để định tuyến. Thường bắt đầu với 1–3 skill, thêm khi có phụ thuộc hoặc lỗi thực tế; số này là hướng dẫn, không phải giới hạn cứng. References, template, nguồn upstream và bài học lịch sử chỉ được đọc khi liên quan. Cài nhiều skill không có nghĩa agent phải dùng tất cả; hành vi nạp cuối cùng vẫn phụ thuộc công cụ agent. Chưa đo hay cam kết tỷ lệ token tiết kiệm.

## Kiểm lỗi và CI/CD cho project khác

| Skill | Dùng khi |
| --- | --- |
| [quality-workflow](.agents/skills/quality-workflow/SKILL.md) | Chọn skill và kiểm tra theo task/diff; báo trạng thái có bằng chứng |
| [bug-reproduction](.agents/skills/bug-reproduction/SKILL.md) | Tái hiện, tìm nguyên nhân gốc và xác minh bản sửa |
| [business-logic-review](.agents/skills/business-logic-review/SKILL.md) | Kiểm invariants nghiệp vụ, quyền, trạng thái và concurrency |
| [code-review](.agents/skills/code-review/SKILL.md) | Review diff và xác minh nhận xét bot trước khi sửa |
| [static-analysis](.agents/skills/static-analysis/SKILL.md) | Lint/typecheck, SonarQube, Semgrep, CodeRabbit hoặc reviewdog |
| [github-actions](.agents/skills/github-actions/SKILL.md) | Tạo/kiểm workflow và điều tra run thất bại |
| [release-deploy](.agents/skills/release-deploy/SKILL.md) | Push khi được yêu cầu, theo dõi CI đúng SHA, deploy và smoke test |
| [agent-lessons](.agents/skills/agent-lessons/SKILL.md) | Lưu và tra cứu bài học lỗi đã xác minh |

ui-visual-qa được mở rộng bằng hướng dẫn và starter Playwright/axe cho responsive, screenshot và accessibility. Chọn công cụ theo project, không bắt cài mọi scanner.

```powershell
# PowerShell 7+, Python 3.10+ cho helper chạy kiểm tra.
./scripts/install.ps1 -Target 'D:/work/project' -Skill quality-workflow,bug-reproduction,business-logic-review -WhatIf
./scripts/install.ps1 -Target 'D:/work/project' -Skill quality-workflow,bug-reproduction,business-logic-review

# Xuất cấu hình riêng, không tự bật dịch vụ hay chạy pipeline.
./scripts/export-quality-config.ps1 -Target 'D:/work/project' -Profile web -Feature Core,CI -WhatIf
./scripts/export-quality-config.ps1 -Target 'D:/work/project' -Profile web -Feature Core,CI
```

Các feature xuất: Core, CI, Sonar, CodeRabbit, Reviewdog, Semgrep, UI, UIRegistry, Secrets, Deploy. Profile gồm web và python. File có sẵn khác nội dung sẽ làm exporter dừng để merge thủ công; không có cờ ghi đè. Cần cài các skill liên quan riêng nếu muốn agent đọc hướng dẫn của chúng.

Chỉnh quality.config.json và workflow theo stack/lockfile/lệnh thật trước khi chạy. Starter web giả định script lint, typecheck, test:ci, build và npm; starter Python dùng unittest. Đây là mẫu cấu hình cần thích nghi, không phải phát hiện stack tự động. Helper dùng JSON để chạy bằng Python standard library, không cần YAML parser tại project đích.

Tại thư mục project đích:

```powershell
python .agents/skills/quality-workflow/scripts/check.py --validate-only
python .agents/skills/quality-workflow/scripts/check.py --check test
python .agents/skills/quality-workflow/scripts/check.py
```

Helper báo pass/fail/skipped/blocked, lưu .quality/report.json và không tự cài dependency. Nếu còn check bắt buộc bị bỏ qua, lần chạy tập trung trả mã 2 và báo chưa đủ điều kiện toàn bộ; mã 1 là có check thất bại, mã 0 là đạt các điều kiện đã cấu hình. Đọc cấu hình trước khi thực thi vì command là code được chạy. Không đưa token/mật khẩu vào argv. Thêm báo cáo sinh ra vào gitignore của project theo chính sách của nhóm.

SonarQube cần token/host/project và lấy kết quả quality gate thật. CodeRabbit cần cài/ủy quyền dịch vụ riêng. Reviewdog và Semgrep có adapter/reference riêng; không coi có file cấu hình là dịch vụ đã hoạt động. Deploy template là reusable workflow cho caller tin cậy, chưa gắn provider hay trigger tự động.

> $bug-reproduction $business-logic-review Sửa lỗi tính tổng đơn hàng. Tái hiện theo hợp đồng nghiệp vụ, thêm regression test phù hợp và báo kết quả thực tế.

> $github-actions Điều tra run thất bại của commit này. Xác minh nguyên nhân và chạy lại kiểm tra liên quan, giữ các required checks.

Tra [bài học theo tag](knowledge/INDEX.md) khi liên quan. Đây là hướng dẫn truy hồi tri thức cho agent, không phải tự huấn luyện model. Xem [nguồn và commit tham khảo](references/upstreams.md), [kế hoạch](QUALITY_AUTOMATION_PLAN.md) và [kết quả kiểm chứng, giới hạn](docs/VERIFICATION.md).

## Skill UI/backend hiện có

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

Script cài đầy đủ gói vào .agents/skills/ của project: SKILL.md cùng references/scripts/assets khi có. Khuyến nghị chọn -Skill theo task; bỏ -Skill để cài tất cả nhưng không yêu cầu nạp toàn bộ. Mở phiên Codex mới trong project và gọi skill theo tên.

> $ui-workflow $landing-business-rules Thiết kế lại trang tour. Giữ bộ lọc, locale, giá và form yêu cầu tư vấn. Kiểm tra CTA trên mobile và bằng bàn phím.

> $backend-workflow $backend-api-contracts $backend-nextjs Sửa API nhận yêu cầu tư vấn. Giữ hợp đồng hiện tại, kiểm tra retry đồng thời và phản hồi khi dịch vụ gửi mail lỗi.

Để cập nhật, chạy git pull trong repo skill có remote rồi chạy lại lệnh cài. Script đối chiếu manifest SHA256 từng file trước khi ghi, kiểm tất cả gói đã chọn trước lần ghi đầu và dừng khi gặp file bị sửa/xóa hoặc thư mục do công cụ khác quản lý. Marker SKILL.md cũ được chuyển sang manifest v2. File riêng ngoài manifest được giữ lại; file do gói quản lý đã bị loại ở phiên bản mới chỉ được xóa sau khi xác minh hash. Symlink/junction bị từ chối, cache runtime không được đóng gói. Lỗi I/O giữa lúc ghi vẫn có thể để lại cập nhật một phần; giữ bản sao và kiểm diff nếu gặp lỗi đó. Sao lưu và so sánh các thay đổi đó trước khi đồng bộ. Với nhóm cần cùng phiên bản, ghi lại tag hoặc commit nguồn.

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

Tạo thư mục .agents/skills/<ten-skill>/ với SKILL.md có frontmatter name và description. Dùng tên chữ thường và dấu gạch nối. Viết rõ tình huống kích hoạt, quyết định cần hướng dẫn, bước xác minh và các giả định theo stack. Cập nhật bảng skill và CHANGELOG khi bổ sung. Installer đồng bộ cả cây tài nguyên; dùng đường dẫn tương đối bên trong từng gói để cài riêng vẫn hoạt động. Giữ entrypoint ngắn và liên kết reference theo tình huống cần đọc. Chạy python scripts/validate.py, bộ unittest và tests/test-installer.ps1 khi sửa cơ chế gói; xem docs/VERIFICATION.md để tái hiện kiểm chứng hai stack/UI.

Figma MCP và Blender MCP là các tích hợp dự kiến cho đối chiếu thiết kế và chuẩn bị asset 3D. Xem [kế hoạch](PLAN.md).

## Kiểm tra và build bản phân phối

```powershell
python -m pip install -r tests/requirements.txt
python scripts/validate.py
python -m unittest discover -s tests -p 'test_*.py'
pwsh -NoProfile -File tests/test-installer.ps1
python scripts/build.py
```

Build tạo .cache/dist/ui-motion-skills.zip cùng MANIFEST.json chứa SHA256 từng file nguồn. Archive loại cache, node_modules và output chạy thử; có thể tái lập khi byte nguồn không đổi. CI kiểm package trên Windows/Linux và chạy fixture logic/UI riêng. Repo skill không có một app production mặc định để deploy.

Để chạy kiểm chứng trình duyệt mới: python tests/run-ui-reuse.py --ui sau khi chuẩn bị dependency/browser theo fixture. Thêm --offline-deps khi npm cache đã đủ. Fixture kiểm token light/dark, variant một màn hình, modal/focus, model/formatter và phát hiện stale index; không tuyên bố tương thích mọi framework. Xem docs/VERIFICATION.md cho kết quả và giới hạn.
