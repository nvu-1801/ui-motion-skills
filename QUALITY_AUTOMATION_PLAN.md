# Kế hoạch mở rộng kho skill: kiểm lỗi, review và CI/CD

Ngày: 2026-11-05. Trạng thái: bộ gói và công cụ đã triển khai, qua kiểm chứng local; tích hợp dịch vụ và phát hành remote chưa thực hiện.

## Mục tiêu và phạm vi

Mở rộng ui-motion-skills thành kho kỹ năng giúp coding agent kiểm tra bug, logic nghiệp vụ, UI, review code và xử lý vòng đời GitHub Actions/deploy trên nhiều project. Kho này phân phối hướng dẫn, template, script và bài học có bằng chứng; các project đích mới là nơi chạy công cụ và nhận bản sửa.

Giữ các skill UI/backend hiện có. Không gắn tên miền, dữ liệu, credential hay quy tắc nghiệp vụ của demo vào bộ lõi. Đã clone chọn lọc actionlint/reviewdog để đọc tham khảo; cache không phân phối. Chưa bật dịch vụ, push GitHub hoặc deploy. Bản ghi kiểm chứng và giới hạn ở docs/VERIFICATION.md.

## Hiện trạng tại lúc lập kế hoạch

- Có 10 skill UI/backend trong .agents/skills và installer PowerShell.
- Installer hiện chỉ đồng bộ SKILL.md bằng hash; chưa đóng gói references, scripts hoặc assets đi kèm.
- README và PLAN.md đang tập trung vào UI/motion, cần bổ sung tuyến chất lượng và tự động hóa.
- Git working tree sạch trước khi thêm tài liệu kế hoạch này.

## Bổ sung tối ưu token đã thực hiện

- CATALOG.md và scripts/select-skills.py chọn nhóm khởi đầu theo task mà không đọc body.
- quality-workflow định tuyến nhẹ; không bắt buộc mở khi task đã rõ.
- SKILL.md giữ ngắn; references, template và bài học chỉ đọc khi cần.
- JSON thay YAML cho cấu hình runner để project đích không cần dependency parser.
- Bước 5 hoàn tất ở mức adapter/template/reference; chưa xác nhận dịch vụ live. Bước 8 là fixture có kiểm chứng, không phải cam kết agent nào cũng chọn đúng.
- Bước 9: tài liệu và CI đã viết; chưa phát hành/tag/push hoặc chạy hosted CI.

## Kiến trúc đề xuất

1. Skill: quyết định đọc gì, kiểm gì, khi nào dùng công cụ và khi nào đủ bằng chứng kết luận.
2. Tool adapter và template: ánh xạ lệnh theo stack, cấu hình scanner, workflow và báo cáo.
3. Knowledge: lỗi đã tái hiện, nguyên nhân gốc, bản sửa, test chống tái phát, nguồn tham khảo.

Skill vẫn đọc được độc lập. Bộ điều phối chỉ nạp tài liệu và công cụ phù hợp với thay đổi; không bắt mọi project chạy mọi scanner. Ưu tiên test runner, package manager và pipeline sẵn có của project đích.

## Các gói skill

| Skill | Trách nhiệm và đầu ra |
| --- | --- |
| quality-workflow | Đọc AGENTS.md, stack, diff và acceptance criteria; lập bản đồ rủi ro, chọn kiểm tra và tổng hợp bằng chứng |
| bug-reproduction | Tái hiện lỗi, thu log an toàn, thu hẹp nguyên nhân gốc, sửa tối thiểu và thêm regression test phù hợp |
| business-logic-review | Kiểm invariants nghiệp vụ, boundary, phân quyền, state transition, race, idempotency và side effect theo hợp đồng project |
| code-review | Review diff và đường gọi liên quan; ghi vị trí, tác động, cách tái hiện, mức độ và độ tin cậy; xác minh phản hồi bot trước khi sửa |
| static-analysis | Dùng lint/typecheck, SonarQube hoặc Semgrep theo profile; phân biệt cảnh báo, lỗi xác nhận và false positive |
| github-actions | Tạo/đọc workflow, kiểm trigger, permission, cache, matrix, artifact, required check và debug run thất bại |
| release-deploy | Kiểm remote/branch/diff, push theo yêu cầu, theo dõi run đúng commit, preview/staging, smoke test và rollback theo nền tảng |
| agent-lessons | Chuyển lỗi đã xác minh thành case tổng quát, có điều kiện áp dụng, nguồn và kiểm thử |

Mở rộng ui-visual-qa sẵn có thay vì tạo skill trùng: responsive, screenshot diff, bàn phím, accessibility, trạng thái loading/empty/error/success và lỗi console/network trong hành trình chính.

## Nguồn tham khảo đã đối chiếu

| Nguồn chính thức | Dùng cho |
| --- | --- |
| https://github.com/SonarSource/sonarqube-scan-action | Adapter SonarQube và scan trên GitHub Actions; chỉ hoàn tất khi có kết quả quality gate tương ứng |
| https://docs.coderabbit.ai/getting-started/yaml-configuration | Template .coderabbit.yaml và hướng dẫn xử lý review; kiểm tra schema hiện hành khi triển khai |
| https://github.com/reviewdog/reviewdog | Đưa kết quả linter lên review PR khi project lựa chọn |
| https://github.com/semgrep/semgrep | Static analysis theo pattern và rule phù hợp ngôn ngữ |
| https://github.com/microsoft/playwright | E2E, trace và screenshot regression cho web |
| https://github.com/dequelabs/axe-core | Kiểm accessibility tự động, kết hợp kiểm bàn phím thủ công |
| https://github.com/rhysd/actionlint | Kiểm cú pháp và lỗi tĩnh của GitHub Actions |
| https://github.com/zizmorcore/zizmor | Kiểm cấu hình bảo mật GitHub Actions |

Không xem clone một repo là đã tích hợp công cụ. Không coi repo AI reviewer cũ hoặc fork là mã nguồn của dịch vụ CodeRabbit hiện tại. Không cần clone toàn bộ SonarQube để dùng scan action.

Khi cần đọc source sâu: clone chọn lọc vào .cache/upstreams/<owner>/<repo>, giữ ngoài gói phân phối; khóa commit SHA và không chạy script của nguồn vừa tải theo mặc định. Ghi URL, commit, ngày kiểm tra, LICENSE/NOTICE và cách sử dụng trong references/upstreams.md. Chỉ trích hoặc đóng gói lại nội dung khi giấy phép cho phép. Pull cập nhật là bước chủ động có diff và chạy lại kiểm tra, không tự lấy main mỗi lần agent hoạt động.

## Thứ tự thực hiện

- [x] 1. Chốt hợp đồng gói và profile project: trường stack, commands, luồng nghiệp vụ, required checks, tool tùy chọn và deploy target. Đặt cấu hình project trong quality.config.json; giữ schema trong kho skill.
- [x] 2. Nâng installer để cài cả cây file của skill, có manifest/hash từng file, dry-run, phát hiện chỉnh tay, kiểm đường dẫn và chuyển đổi marker cũ. Không ghi đè workflow hay config project khi chỉ cài skill; xuất template bằng lệnh riêng có preview.
- [x] 3. Viết quality-workflow, bug-reproduction, business-logic-review và code-review. Chuẩn hóa finding: id, loại, severity, confidence, file/line, bằng chứng, expected/actual, đề xuất và trạng thái xác minh.
- [x] 4. Mở rộng ui-visual-qa và thêm mẫu Playwright/axe. Baseline screenshot có môi trường, viewport, font và dữ liệu cố định; cập nhật baseline phải có lý do và review ảnh.
- [x] 5. Thêm static-analysis cùng adapter SonarQube, Semgrep và template CodeRabbit/reviewdog. Chọn bộ lõi lint/typecheck/test trước; không bắt cài mọi dịch vụ. Ghi điều kiện tài khoản, token, chi phí và hỗ trợ ngôn ngữ theo dịch vụ tại thời điểm tích hợp.
- [x] 6. Viết github-actions và release-deploy; xuất template CI, review và deploy tách biệt. Pin action bằng commit SHA, dùng quyền tối thiểu, tách job xử lý PR ngoài khỏi job có secrets và deploy.
- [x] 7. Tạo agent-lessons và knowledge/bug-patterns. Mỗi case gồm triệu chứng, môi trường, tái hiện, nguyên nhân, fix pattern, regression test, ngoại lệ và nguồn; bỏ dữ liệu riêng trước khi tái sử dụng.
- [x] 8. Kiểm chứng chuyển project trên ít nhất một web TypeScript và một backend khác stack. Dùng fixture cố ý lỗi, xác nhận phát hiện lỗi trước sửa và hết lỗi sau sửa; kiểm core không phụ thuộc dịch vụ trả phí.
- [ ] 9. Cập nhật README, PLAN, CHANGELOG, catalog và hướng dẫn cài. Chốt bản phát hành sau khi kiểm cài mới, cập nhật, xung đột và bằng chứng tích hợp. Push/tag/deploy khi có yêu cầu tương ứng.

## Luồng vận hành tại project đích

Đọc luật repo và yêu cầu → phân loại rủi ro → tái hiện/định nghĩa acceptance criteria → sửa → chạy kiểm tra liên quan → review diff → push nếu được yêu cầu → theo dõi CI của đúng SHA → lấy kết quả scan và review → sửa lỗi xác nhận, chạy lại → deploy theo quy trình project → smoke test → ghi bài học có bằng chứng.

Luôn phân biệt pass, fail, skipped và blocked. Không báo toàn bộ đạt khi scanner thiếu credential, quality gate đang chờ hoặc check bắt buộc bị bỏ qua. Bot review không thay thế test nghiệp vụ. Lệnh push thành công không đồng nghĩa GitHub Actions hay deploy thành công.

Khi được yêu cầu theo dõi run, theo dõi trong phiên làm việc đến kết quả hoặc nêu blocker; không hứa giám sát sau khi chat kết thúc. Retry có giới hạn, phân biệt lỗi code với hạ tầng; không tắt kiểm tra hoặc cập nhật snapshot hàng loạt chỉ để CI xanh.

## Chính sách chất lượng

- Mỗi finding phải có căn cứ; trường hợp nghi ngờ ghi là cần xác minh, không tự nhận đã tìm được bug.
- Lỗi hồi quy có test phù hợp hoặc bước tái hiện kiểm chứng được; test logic lấy expected từ hợp đồng nghiệp vụ, không sao chép implementation.
- Gate chất lượng được project cấu hình theo mức độ rủi ro và baseline. Mặc định đề xuất chặn lỗi nghiêm trọng mới đã xác minh, test/build bắt buộc thất bại và lỗ hổng đạt ngưỡng project.
- Coverage và screenshot threshold cần hiệu chỉnh theo project; không áp một con số cố định lên mọi stack.
- Production deploy dùng môi trường và chính sách của project; ghi revision/artifact, health check và phương án rollback. Không tự phát sinh quyền push, merge hoặc deploy từ việc cài skill.
- Bài học có trạng thái draft/verified/deprecated; chỉ đưa case đã xác minh vào hướng dẫn mặc định. Agent đọc lại tri thức đã lưu, không có tuyên bố tự huấn luyện model.

## Cấu trúc bổ sung dự kiến

```text
.agents/skills/<skill>/
  SKILL.md
  references/
  scripts/                 # chỉ khi cần
  assets/templates/        # cài cùng skill và dùng được độc lập
schemas/
  quality-config.schema.json
  finding.schema.json
knowledge/bug-patterns/
references/upstreams.md
tests/fixtures/
scripts/install.ps1
scripts/export-quality-config.ps1
scripts/select-skills.py
```

Không tạo tham chiếu hỏng tới knowledge trung tâm khi cài riêng skill; tài liệu cần thiết phải đi kèm gói hoặc có đường dẫn nguồn truy cập rõ ràng. CI của chính kho này chỉ xác minh chất lượng gói/installer/template; không thay cho pipeline được cài vào project đích.

## Tiêu chí nghiệm thu

- Cài được từng skill và cả bộ trên project khác; cài lại không thay file, cập nhật không ghi đè sửa tay, đường dẫn không thoát target.
- Core chạy được khi không bật SonarQube/CodeRabbit; dịch vụ tùy chọn thiếu cấu hình được báo rõ.
- Có bằng chứng trên hai stack: lỗi logic, lỗi UI và workflow sai bị phát hiện; sửa xong kiểm tra tương ứng đạt, không làm hỏng baseline sạch.
- Agent đọc được case đã lưu ở phiên mới và áp dụng đúng điều kiện; case không phù hợp không bị áp đặt lên project khác.
- CI/deploy report gắn đúng SHA, URL run và trạng thái thật; thực thi production không nằm trong kiểm thử mặc định của kho skill.

Ưu tiên MVP: bước 1–4 và CI cơ bản của bước 6. Tiếp theo hoàn thiện dịch vụ review/scanner, deploy adapter và kho bài học. Không gắn lịch hoàn thành trước khi kiểm kê môi trường và quyền truy cập của project thử nghiệm.
