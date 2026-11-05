# Kế hoạch xây dựng UI Motion Skills

## Tái sử dụng UI và phát triển skill

Đã bổ sung 7 skill, registry UI tra cứu theo nhu cầu, fixture và build phân phối. Xem [kế hoạch và trạng thái](UI_REUSE_AND_SKILL_EVOLUTION_PLAN.md). Benchmark agent A/B và tiết kiệm token chưa được đo.

## Mở rộng chất lượng và tự động hóa

Đã triển khai bộ skill dùng lại, định tuyến tiết kiệm token, installer nhiều file, template và kiểm chứng local. Xem [kế hoạch mở rộng](QUALITY_AUTOMATION_PLAN.md) và [kết quả thực tế](docs/VERIFICATION.md). Pipeline của project đích được cài/xuất riêng; kho này không tự deploy demo.

## Mục tiêu

Một repo GitHub độc lập chứa skill hướng dẫn agent thiết kế và triển khai UI ngay trong codebase. Đầu ra cần có bố cục, typography, hình ảnh và chuyển động phù hợp với thương hiệu, đồng thời giữ đúng nghiệp vụ của từng dự án. Bộ skill dùng được qua repo GitHub hoặc bản clone local.

## Cấu trúc đích

```text
ui-motion-skills/
  README.md
  PLAN.md
  CHANGELOG.md
  .agents/skills/
    ui-workflow/SKILL.md
    ui-design/SKILL.md
    ui-components/SKILL.md
    scroll-storytelling/SKILL.md
    web-3d-scenes/SKILL.md
    ui-visual-qa/SKILL.md
  examples/
    responsive-landing/
    scroll-3d-story/
  scripts/
    install.ps1
```

Mỗi skill ghi rõ tín hiệu kích hoạt, đầu vào cần đọc, bước thực hiện, đầu ra và cách kiểm tra. Tài liệu tham chiếu đặt trong thư mục skill tương ứng để vẫn dùng được khi cài riêng. Ví dụ chạy được giữ trong examples.

## Các pha

1. **Kiểm kê hai project nguồn.** Lấy design token, hero, card, gallery và kịch bản verify:ui từ Sea Trip Travel. Lấy sticky stage, scroll progress, camera keyframe, reduced motion, WebGL fallback và Playwright từ Portfolio 3D. Lập bảng nguồn và điều kiện tái sử dụng. Dùng nội dung mẫu trung tính và chỉ đưa vào tài sản có quyền tái phân phối.
2. **Viết luồng làm UI và bộ skill nền.** ui-workflow hướng dẫn agent đọc AGENTS.md, stack, component, token, route và kiểm thử của repo đích. ui-design giúp chọn typography, hệ màu, tỷ lệ ảnh, nhịp bố cục và CTA. ui-components hướng dẫn tái dùng component hiện có và triển khai các trạng thái. ui-visual-qa cung cấp checklist và mẫu xác minh.
3. **Bổ sung scroll và 3D.** scroll-storytelling có mẫu sticky/reveal nhẹ và mẫu GSAP cho timeline nhiều chương. web-3d-scenes có mẫu React Three Fiber cho camera theo tiến độ cuộn, tải canvas theo nhu cầu và fallback tĩnh. Xác định tương thích từ package và lockfile của repo đích trước khi thêm thư viện.
4. **Làm cài đặt và kiểm thử chuyển repo.** Script PowerShell nhận đường dẫn repo đích và danh sách skill, có chế độ xem trước và báo xung đột trước khi ghi. Chạy lại cùng phiên bản phải cho cùng kết quả. Cài thử UI trên repo web cơ bản và cài toàn bộ trên repo Next.js sạch, mở lại phiên Codex và kiểm tra skill được nhận diện. Chụp màn hình desktop, tablet, mobile, kiểm tra bàn phím, nội dung dài, reduced motion và WebGL fallback. Chạy build, typecheck và kiểm thử theo stack của demo.
5. **Phát hành GitHub.** Khởi tạo Git trong folder này, viết README với luồng cài, cập nhật và gọi skill, rà diff và quyền sử dụng ví dụ, commit, push lên repo GitHub đã chọn rồi gắn tag v0.1.0. Chạy lại luồng cài đặt từ bản clone mới của tag.

## Quy tắc nghiệp vụ áp dụng ở mọi repo

- Trước khi sửa, ghi lại luồng người dùng và các hành vi cần giữ. Với trang tour, đối chiếu lọc tour, giá và đơn vị tiền tệ, locale, CTA, form liên hệ và điều hướng.
- Dựa vào dữ liệu thật, token và component của repo đích. Kiểm tra trạng thái loading, empty, error, success và nội dung dài khi luồng có các trạng thái đó.
- Với thay đổi thuần UI, giữ hợp đồng dữ liệu, validation và phân quyền. Khi yêu cầu thiết kế đòi hỏi đổi nghiệp vụ, ghi rõ phần cần đổi và tiêu chí nghiệm thu.
- Kiểm tra thao tác chính bằng bàn phím và trên mobile. Khi tắt motion hoặc WebGL lỗi, nội dung và CTA vẫn sử dụng được.
- Ghi kết quả kiểm tra thực tế trong PR, kèm ảnh ở các kích thước và trạng thái liên quan.

## Cài, cập nhật và mở rộng

- **Lần đầu** clone repo skill ở một thư mục dùng chung rồi chạy script để cài các skill đã chọn vào .agents/skills của repo đích. Mở lại phiên Codex nếu cần, gọi $ui-workflow và mô tả màn hình cùng các ràng buộc nghiệp vụ.
- **Khi cập nhật** pull repo skill rồi chạy lại script trên repo đích. Bản sao đã cài chỉ được cập nhật ở bước chạy script. Nếu nhóm cần cùng phiên bản, ghi tag hoặc commit nguồn trong repo đích.
- **Figma MCP** thêm skill ui-figma-handoff để đọc frame, component và token, ánh xạ sang component của repo, rồi đối chiếu bản render với thiết kế. Ghi điều kiện truy cập và luồng thay thế bằng ảnh hoặc spec khi connector vắng mặt.
- **Blender MCP** thêm skill ui-blender-assets để tạo hoặc chỉnh asset 3D, chuẩn hóa scale và trục, xuất GLB, kiểm tra kích thước và chuẩn bị poster fallback. Skill 3D trên web phụ trách tích hợp asset và kiểm tra trải nghiệm người dùng.
- Hai skill MCP là phần mở rộng của luồng UI. README ghi cách bật kết nối cho từng môi trường. Repo chia sẻ chỉ lưu hướng dẫn và cấu hình mẫu, thông tin đăng nhập được quản lý tại môi trường sử dụng.

## Tiêu chí chốt v0.1.0

- Sáu skill có hướng dẫn sử dụng riêng và một luồng đi từ brief đến QA.
- Hai demo có thể chạy từ bản clone mới và có kết quả kiểm tra ghi lại.
- Repo đích cài được từng skill, gọi được từ Codex và cập nhật được theo tag.
