# Kế hoạch tái sử dụng UI và nâng chất lượng kho skill

Ngày: 2026-11-05. Trạng thái: đã triển khai 7 skill mới, helper/fixture/kiểm thử và build bản phân phối; chưa có benchmark agent A/B hoặc số đo tiết kiệm token. Nền hiện tại là 18 skill và bộ kiểm local đã ghi trong docs/VERIFICATION.md. Tài liệu này bổ sung cho QUALITY_AUTOMATION_PLAN.md, giữ nguyên trạng thái công việc trước đó.

## Mục tiêu và phạm vi

Giúp agent tìm và dùng đúng component, modal/module, typography, màu, spacing, layout, formatter và kiểu dữ liệu có sẵn trước khi tạo mới. Cùng vai trò và cùng design system phải dùng cùng nguồn chuẩn; thay đổi được thực hiện tại đúng lớp để tránh UI lệch, code lặp và nhiều vòng sửa tốn token.

Kho này phân phối skill, schema, template và công cụ dùng lại cho project khác. Registry và token thật thuộc project đích; không mặc định chép component của demo vào mọi project. Nếu nhiều project dùng chung một design system, ưu tiên package có phiên bản hoặc workspace library khi phù hợp; mỗi project vẫn có theme và lớp tích hợp riêng.

Đợt triển khai theo yêu cầu build/push gồm gói skill, helper và fixture cô lập. Giữ nguyên demo/app hiện có; push chỉ thực hiện sau kiểm tra. Không bật scanner SaaS hay deploy production.

## Phân chia skill

| Ưu tiên | Skill | Phần việc riêng, tránh chồng lấn |
| --- | --- | --- |
| P0 | ui-system-reuse — mới | Khám phá nguồn UI chuẩn, tra component/variant/token, chọn reuse/extend/create, cập nhật chỉ mục và phát hiện bản sao cần xác minh |
| P0 | skill-evaluation — mới | Đánh giá agent trên task thật: đúng skill, đúng hành vi, giữ nhất quán UI, tránh lặp code và chi phí thực tế |
| P0 | skill-authoring — mới | Tạo/cập nhật/tách/gộp skill, mô tả kích hoạt, tài nguyên đi kèm và tương thích gói |
| P0 | upstream-skill-audit — mới | Rà nguồn, giấy phép, script, quyền, tải/chạy code và chỉ dẫn ngoài phạm vi trước khi nhập skill/repo ngoài |
| P1 | dependency-security — mới | Dependency/lockfile, lỗ hổng và giấy phép; thay phiên bản cần xác minh tương thích |
| P1 | security-review — mới | Review trust boundary, authorization và luồng input nhạy cảm; chỉ áp dụng khi thay đổi có rủi ro liên quan |
| P2 | database-migrations — mới | Schema migration, backfill, tương thích các phiên bản app và phương án phục hồi |

Mở rộng skill hiện có:

- ui-workflow: tra nguồn chuẩn khi cần xây hoặc sửa UI; task đã rõ đi thẳng skill phù hợp, không nạp cả chuỗi.
- ui-components: import component có sẵn, dùng props/variants và composition; domain formatting giữ tại layer hiện có.
- ui-design: dùng token typography/màu/spacing hiện có; chỉ tạo role hoặc variant mới khi cần và có lý do.
- ui-visual-qa: đối chiếu vai trò/variant và computed style, thêm journey/error states, screenshot và accessibility khi liên quan.
- quality-workflow: chọn nhóm nhỏ theo task, theo dõi chọn thừa/chọn thiếu skill; giữ required checks của project.
- static-analysis: bổ sung adapter quét secret có redaction; không gộp mọi scan thành việc bắt buộc ở mọi task.
- agent-lessons: tìm case theo tag/precondition, phiên bản và trạng thái deprecated; không tự áp bài học chỉ vì triệu chứng giống nhau.

Không thêm skill riêng cho từng màu, font-size, button, modal hoặc từng thương hiệu. Các chi tiết đó thuộc registry, token và reference đọc theo nhu cầu.

## Quy tắc của ui-system-reuse

### Tìm nguồn chuẩn trước

Đọc luật repo, package/lockfile, cấu trúc component, theme/token và các điểm sử dụng liên quan. Xác định thư viện UI, file cấu hình và thứ tự ghi đè thực tế; không suy luận chỉ từ tên class. Nếu đã có Storybook, component docs hoặc registry thì tận dụng, không bắt thêm một framework để làm catalog.

Tra theo vai trò và điểm sử dụng: Button, Dialog/Modal, Input, Card, Heading, Body, Caption, status và layout. Mở entry đúng nhu cầu và component/token tương ứng; không đọc toàn bộ codebase/registry trong mỗi task.

### Chọn reuse → extend → create

1. Có component và variant đáp ứng hợp đồng: import và dùng lại.
2. Có primitive phù hợp nhưng thiếu một trạng thái/variant có ý nghĩa: mở rộng ở nguồn chung, giữ default và API hiện có.
3. Chưa có primitive phù hợp: tạo tại layer được repo quy định, với API vừa đủ; nêu khoảng trống thực tế.

Tương đồng hình thức chưa đủ để gộp: cùng kiểu Card nhưng khác hành vi, dữ liệu hay accessibility có thể giữ riêng và dùng chung primitive bên dưới. Tránh base component chứa quá nhiều boolean và điều kiện theo từng màn hình. Không trích abstraction chỉ vì hai đoạn code trông gần giống nhau.

Trước khi đổi component/token chung, xác định consumer và phạm vi ảnh hưởng. Thay đổi riêng cho một màn hình dùng variant/composition phù hợp, không vô tình đổi default của mọi màn hình. Không copy toàn bộ JSX/CSS rồi đổi vài giá trị để tạo bản thứ hai.

### Giữ thống nhất typography, màu và trạng thái

- Font family, size, weight, line-height và letter-spacing đi qua semantic role hoặc token hiện có, như heading/body/caption.
- Màu đi qua role như surface/text/border/action/status, bao gồm light/dark và tương phản; không áp một palette chung lên các project khác thương hiệu.
- Spacing, radius, shadow, breakpoint và kích thước control dùng thang hiện có. Cùng role và cùng variant phải có cùng nguồn token; khác ngữ cảnh có thể khác variant có chủ đích.
- Copy và locale dùng nguồn i18n/content sẵn có khi cùng ý nghĩa. Không gộp mọi chuỗi giống chữ nếu khác ngữ cảnh dịch hoặc nghiệp vụ.
- Các trạng thái loading/disabled/error/focus thuộc contract của component; không chỉ chuẩn hóa giao diện ở trạng thái mặc định.
- Giá trị literal không tự động là bug: chart, artwork, asset hoặc kích thước đặc thù có thể cần ngoại lệ được giải thích.

### Xử lý chữ “model” theo loại tài nguyên

Với modal/module UI, tái sử dụng primitive, focus/keyboard và contract hiện có. Với data model/view-model/type, import từ lớp đang sở hữu hợp đồng, không tạo một type hoặc formatter gần giống ở từng component. Không chuyển ownership domain chỉ để dùng chung UI. Với model 3D/asset, tái sử dụng asset và loader khi task liên quan; không mặc định nạp web-3d-scenes cho task UI thường.

## Registry tại project đích

Dự kiến thêm schema/template trong assets của ui-system-reuse; registry sinh ra được đặt ở vị trí project lựa chọn, ví dụ docs/ui-system/registry.json.

| Nhóm dữ liệu | Thông tin tối thiểu |
| --- | --- |
| Component | id, vai trò, đường dẫn nguồn, import/export, props/variant chính, ví dụ sử dụng, trạng thái deprecated |
| Token | semantic role, đường dẫn định nghĩa, ánh xạ theme, phạm vi sử dụng |
| Model/formatter/content | loại, nguồn sở hữu, import/key và điều kiện áp dụng |
| Bằng chứng cập nhật | phiên bản schema, file fingerprint và nguồn kiểm kê; trạng thái đã xác minh hay chỉ là candidate |

Chỉ mục lưu đường dẫn và tóm tắt ngắn; source code là nguồn thật. Nếu dùng package ngoài, ghi package/version và export thay cho chép source. Kiểm file fingerprint khi truy hồi, cập nhật entry thay đổi hoặc quét lại phạm vi cần thiết khi chỉ mục lỗi thời. Không lưu line number như một định danh ổn định.

Khởi đầu bằng kiểm kê có chọn lọc và schema đơn giản. Với re-export, component động, generated code hoặc monorepo phức tạp, công cụ tìm kiếm chỉ đưa candidate để agent xác minh. Không tuyên bố một regex có thể hiểu hết kiến trúc UI hoặc tự xóa an toàn code trùng.

## Các bước triển khai

- [x] 1. Xây fixture về UI có nguồn chuẩn và đối chứng: Button/Text/Dialog, hai màn hình cùng vai trò, token light/dark, formatter và type chung; thêm trường hợp giống hình thức nhưng khác hành vi để kiểm không gộp sai.
- [x] 2. Viết skill-authoring với quy tắc kích hoạt, ranh giới trách nhiệm, compatibility và kiểm package. Dùng nó để chuẩn hóa các skill tiếp theo; giữ tài nguyên cần thiết trong từng gói cài riêng.
- [x] 3. Tạo ui-system-reuse/SKILL.md và các reference cho component, token, model/content. Thêm registry schema/template và helper tra cứu chỉ trả candidate liên quan; đầu tiên hỗ trợ cấu trúc fixture, mở rộng theo bằng chứng.
- [x] 4. Tích hợp reuse vào ui-workflow/ui-components/ui-design và QA hiện có; thêm route ui-reuse/ui-consistency trong selector, cập nhật CATALOG. Chỉ mở reference theo loại tài nguyên đang xử lý.
- [x] 5. Viết skill-evaluation và bộ task có positive/negative/holdout case. Đánh giá baseline so với dùng skill trong workspace cô lập, cùng model/cấu hình/đầu vào; không đưa đáp án vào prompt thực thi.
- [x] 6. Viết upstream-skill-audit và quy trình nhập nguồn: khóa revision, rà license/NOTICE, đọc script và luồng quyền trước khi chạy; đầu ra accept/adapt/reject kèm phạm vi kiểm. Không quảng cáo static audit là bảo đảm an toàn tuyệt đối.
- [x] 7. Thêm dependency-security, security-review và adapter quét secret; phân tách dependency risk với lỗi logic/authorization. Mỗi phần có fixture phù hợp, báo rõ thiếu tool/credential và giữ output được che thông tin nhạy cảm.
- [x] 8. Mở rộng agent-lessons và quality-workflow: chỉ mục tag/version, case deprecated, finding có bằng chứng, lý do chọn skill và số liệu chi phí khi host có cung cấp; không lưu prompt/source riêng của project vào kho chung theo mặc định.
- [x] 9. Bổ sung database-migrations ở pha sau bằng fixture có dữ liệu cũ/backfill và nhiều app version; mô tả rollback forward-fix/restore thực tế thay vì mặc định mọi migration đều đảo ngược được.
- [x] 10. Kiểm cài mới/cập nhật/cài riêng, cross-stack, routing và tiêu chí UI; chạy các check bắt buộc của repo, cập nhật README/CHANGELOG và ghi kết quả thực tế. Chuẩn bị bản phát hành sau khi review diff; không tự push/deploy từ việc hoàn thành gói local.

## Đánh giá hiệu quả và tiêu chí nghiệm thu

| Tình huống | Kết quả cần chứng minh |
| --- | --- |
| Thêm nút cùng loại vào màn hình mới | Import Button và variant sẵn có; không xuất hiện Button2 hoặc CSS sao chép |
| Thêm modal xác nhận | Dùng Dialog/Modal chung, giữ focus/keyboard và có hành động thực |
| Chỉnh cỡ chữ/màu của cùng semantic role | Sửa đúng token/variant, kiểm consumer liên quan; không sửa rải rác từng trang |
| Yêu cầu chỉ đổi một màn hình | Không làm đổi default của consumer khác |
| Lỗi fixed font/color riêng một trang | Chỉ ra nguồn sai khác và sửa đúng lớp; không cập nhật screenshot để che lỗi |
| Hai component trông giống nhưng khác hành vi | Dùng chung primitive nếu hợp lý, không ép gộp contract |
| Registry cũ hoặc re-export chưa nhận diện | Phát hiện cần xác minh và mở source, không dùng index như sự thật tuyệt đối |
| Hai project khác stack/theme | Dùng lại phương pháp và tài nguyên skill; giữ implementation, thương hiệu và domain contract của từng project |
| Task API/CI không liên quan UI | Không nạp ui-system-reuse, font/color reference hoặc asset registry |
| Cài riêng một skill | References/helper/schema không có đường dẫn phụ thuộc vào checkout kho skill |

Đo correctness, trigger precision/recall, số lần sửa lại, số tool call, thời gian và token đầu vào/đầu ra khi có telemetry. Phân tách chi phí kiểm kê một lần với chi phí task lặp lại; tính cả cập nhật index. Nếu host không có số token thì ghi unavailable, chỉ dùng bytes/word count như ước lượng riêng và không gọi đó là token đo được.

So sánh qua nhiều lần chạy và các task chưa dùng để chỉnh skill; ghi model/version/cấu hình. Chấp nhận tiết kiệm chỉ khi hành vi và kiểm tra chất lượng vẫn đạt, không dựa vào việc giảm test hoặc bỏ kiểm tra accessibility. Tooling/routing test hiện có không thay thế đánh giá hành vi agent thật.

## Thứ tự ưu tiên

MVP: fixture + skill-authoring + ui-system-reuse + tích hợp skill UI và đánh giá hành vi. Sau đó upstream-skill-audit và dependency/security. Database-migrations triển khai khi có nhu cầu backend phù hợp. Tất cả vẫn được chọn theo task; không yêu cầu agent dùng toàn bộ skill trong một lần làm việc.

## Bằng chứng và phần chưa đo

Xem docs/VERIFICATION.md. Bước 5 hoàn tất ở mức skill, suite có nhãn riêng, scorer và kiểm thử cách tổng hợp dữ liệu; chạy agent A/B độc lập với nhiều lần lặp và đo token vẫn chưa thực hiện. Không ghi nhận fixture/script như benchmark agent. Bước 9 chỉ kiểm SQLite nhỏ, không suy rộng online DDL/hiệu năng production. Các kết quả hosted CI được xác định trên GitHub Actions cho commit đã push.
