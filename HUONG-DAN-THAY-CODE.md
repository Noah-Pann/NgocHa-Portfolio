# Bàn giao portfolio — 11/10/2026

Đây là gói cập nhật cho thư mục portfolio GitHub hiện có của Phan Ngoc Ha.
Gồm code của Home, Profile, Selected Works, Visual Playground, Contact và trang chi tiết của 8 project; ảnh poster mới; ảnh girl-left.webp đã cập nhật.

## Cách thay code

1. Trong GitHub Desktop, chọn repository portfolio của bạn rồi mở Repository → Show in Explorer.
2. Sao lưu thư mục portfolio hiện tại sang một thư mục khác nếu muốn giữ bản cũ để so sánh.
3. Giải nén gói ZIP. Mở thư mục vừa giải nén: bạn sẽ thấy index.html, profile.html, các file CSS/JS, selected works và visual-playground.
4. Chép TOÀN BỘ NỘI DUNG của thư mục vừa giải nén vào thư mục repository đang có index.html. Chọn Replace/ghi đè khi được hỏi.
5. Giữ các thư mục ảnh/video gốc: About me, assets-all, contact, home page, selected works và visual-playground. Chỉ gộp/ghi đè các file đi kèm; không xoá rồi thay nguyên thư mục ảnh/video.
6. Mở GitHub Desktop để xem các file thay đổi, nhập nội dung commit, chọn Commit rồi Push origin như thường.

Không chép cả thư mục ZIP thành một thư mục con trong repository. index.html mới phải thay đúng index.html hiện tại.
Gói không có .git, không đổi cấu hình GitHub Pages và chưa được push lên GitHub.

## Nội dung và đường dẫn

- Giữ nguyên tên thư mục có dấu cách, tên file và cấu trúc đường dẫn.
- Gói cập nhật không chứa lại toàn bộ ảnh/video gốc. Nó dùng các assets đã có trong repository của bạn.
- visual-playground.html là trang chính đã chốt; visual-playground-scrapbook.html chuyển về trang chính để các link preview cũ vẫn dùng được.
- Các file CSS/JS cũ vẫn đi kèm để giữ những phụ thuộc đang dùng. Không cần tự xoá file cũ.
- FILE-MANIFEST.json liệt kê các file trong gói và mã kiểm tra nội dung.

## Những file dễ chỉnh về sau

| Phần | File |
| --- | --- |
| Bố cục và thông tin Home | index.html, home-editorial.css |
| Sao băng, ngôi sao, hover Home | home-editorial.css |
| Căn Home vừa màn hình | home-editorial.js |
| Profile | profile.html, profile-editorial.css |
| Contact | contact.html, contact-editorial.css |
| Kiểu chung của các trang bên trong | editorial-shell.css |
| Nhịp animation và artwork hiện khi cuộn | portfolio-motion.js |
| Selected Works | selected-works.html, selected-works-archive.css, selected-works-archive.js |
| Visual Playground và nội dung gallery | visual-playground.html, scrapbook.css, scrapbook.js |
| Chi tiết project | project.html, project.js, project-editorial.css, project-editorial.js |

Home giữ bố cục và hover phong thư, nền đen, sao băng, không footer và không cuộn.
Profile giữ collage, đổi nghề và dấu ngoặc kép xanh.
Contact giữ thông tin liên hệ, không còn hình tay cầm bút.
Gallery và project hiện dần khi cuộn; có hỗ trợ bàn phím và giảm chuyển động.
