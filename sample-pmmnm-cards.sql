-- Sample Data: Phần Mềm Mã Nguồn Mở (PMMNM) Flashcard Deck
-- This SQL adds a complete deck with chapter-organized cards
-- Run after running: alembic upgrade head

-- Insert the deck
INSERT INTO decks (title, description, owner_id, tag, is_public, created_at, updated_at)
VALUES (
  'Ôn Phần Mềm Mã Nguồn Mở',
  'Bộ Flashcard cấp nhật DẦY ĐỦ các Tên tổ chức và Thông số chuẩn phục vụ thi trắc nghiệm. Không cắt xén nội dung.',
  1,
  'PMMNM',
  1,
  datetime('now'),
  datetime('now')
);

-- Get the deck ID (assuming it's the last inserted)
-- Replace {deck_id} with actual ID after insert

-- CHAPTER 1: TỔNG QUAN PMMNM
INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Bản Quyền & Phân Loại',
  'Chương 1',
  'Thế nào là phần mềm Thương mại, Freeware, Shareware và PMMNM?',
  '- Phần mềm thương mại (Commercial): Thuộc quyền NSX, chỉ cung cấp dạng nhị phân, phải mua, không được phân phối lại.
- Phần mềm trả một phần (Shareware): Dùng thử một thời gian, sau đó phải trả phí để dùng tiếp. KHÔNG có mã nguồn.
- Phần mềm miễn phí (Freeware): Không mất tiền mua, nhưng KHÔNG được truy cập/sửa mã nguồn. (VD: CCleaner).
- Phần mềm mã nguồn mở (Open Source): Công bố rộng rãi mã nguồn, được phép xem/sửa đổi, được phép phân phối lại bản gốc lẫn bản sửa đổi (kể cả thu phí dịch vụ).',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Các Tổ Chức Định Chuẩn',
  'Chương 1',
  'Kê tên các tổ chức định chuẩn managedphần mềm (EIA, TIA, ANSI, ISO, IEEE)?',
  '- EIA (Electronic Industries Association): Hiệp hội các công ty điện tử Mỹ
- TIA (Telecommunications Industry Association): Hiệp hội công nghiệp viễn thông
- ANSI (American National Standards Institute): Tổ chức tiêu chuẩn quốc gia Mỹ
- ISO (International Organization for Standardization): Tổ chức tiêu chuẩn quốc tế
- IEEE (Institute of Electrical and Electronics Engineers): Viện Kỹ sư Điện tử và Điện',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Phân Loại Mạng theo Địa Lý & Chức Năng',
  'Chương 1',
  'Nêu các loại mạng theo khía cạnh địa lý và chức năng? (P2P vs Client-Server)?',
  '- Loại mạng theo địa lý: LAN, WAN, MAN
- Loại mạng theo chức năng:
  * P2P (Peer-to-Peer): Các máy ngang hàng, không máy chủ trung tâm, chia sẻ tài nguyên bình đẳng
  * Client-Server: Máy chủ cung cấp dịch vụ, máy khách kêu gọi dịch vụ, kiến trúc phân cấp
- P2P ưu điểm: Không cần máy chủ, chi phí thấp / nhược điểm: Bảo mật kém, quản lý khó
- Client-Server ưu điểm: Bảo mật tốt, quản lý tập trung / nhược điểm: Cần máy chủ đắt, phức tạp',
  datetime('now'),
  datetime('now')
);

-- CHAPTER 2: CÁC GIẤY PHÉP PMMNM
INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Giấy Phép GNU GPL',
  'Chương 2',
  'Đặc điểm chính của giấy phép GNU GPL (General Public License) là gì?',
  '- Là giấy phép "có tính lây lan" (Copyleft).
- Nếu bạn sử dụng mã nguồn GPL để viết phần mềm mới, phần mềm đó cũng phải mở mã nguồn dưới cùng giấy phép GPL.
- Cho phép tự do sao chép, sửa đổi và phân phối lại.
- Người dùng có quyền truy cập mã nguồn của bất kỳ phiên bản phân phối nào.
- Được sử dụng bởi: Linux Kernel, GNU tools, OpenOffice',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Giấy Phép MIT & Apache',
  'Chương 2',
  'Sự khác biệt cơ bản giữa giấy phép MIT và Apache là gì?',
  '- MIT: Rất lỏng lẻo, chỉ yêu cầu giữ lại thông báo bản quyền gốc. Cho phép đóng kín mã nguồn để làm thương mại.
- Apache 2.0: Tương tự MIT nhưng chặt chẽ hơn về mặt pháp lý.
- Apache bổ sung các điều khoản rõ ràng về quyền sở hữu bằng sáng chế (Patent rights).
- Cả hai đều được giới doanh nghiệp ưa chuộng vì tính "thông thoáng".
- Được sử dụng bởi: React (MIT), Apache HTTP Server, Android (Apache/MIT)',
  datetime('now'),
  datetime('now')
);

-- CHAPTER 3: SẢN PHẨM PMMNM
INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Apache Web Server',
  'Chương 3',
  'Apache Web Server là gì và có đặc điểm gì nổi bật?',
  '- Apache HTTP Server: Máy chủ web phổ biến nhất thế giới, chiếm ~30% thị phần
- Đặc điểm:
  * Mã nguồn mở, miễn phí
  * Hỗ trợ đa nền tảng (Linux, Windows, macOS)
  * Cấu hình linh hoạt thông qua file .htaccess
  * Hỗ trợ modules (mod_ssl, mod_rewrite, mod_php)
  * Hiệu năng ổn định cho môi trường production
- Được quản lý bởi: Apache Software Foundation
- Sử dụng trong: Các website quy mô vừa và nhỏ',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Eclipse IDE',
  'Chương 3',
  'Eclipse là gì và tại sao nó quan trọng với PMMNM?',
  '- Eclipse: Công cụ phát triển phần mềm (IDE) mã nguồn mở
- Đặc điểm:
  * Hỗ trợ Java, C++, Python, PHP...
  * Xây dựng trên kiến trúc plugin → có thể mở rộng
  * Miễn phí, hỗ trợ đa nền tảng
  * Tích hợp Git, Maven, CI/CD
  * Công ty bảo trợ: Eclipse Foundation
- Ý nghĩa với PMMNM: Ví dụ công cụ phát triển thành công mã nguồn mở',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'LibreOffice vs OpenOffice',
  'Chương 3',
  'Phân biệt LibreOffice và OpenOffice trong bối cảnh PMMNM?',
  '- OpenOffice: Bộ ứng dụng văn phòng mã nguồn mở, được Oracle quản lý (2011-sekarang)
- LibreOffice: Fork (nhân bản) từ OpenOffice được The Document Foundation duy trì
- Khác biệt:
  * LibreOffice: Phát triển hoạt động hơn, hỗ trợ tốt hơn, cộng đồng lớn
  * OpenOffice: Được hỗ trợ bởi Apache Software Foundation
- Ý nghĩa: Ví dụ về các fork sản phẩm PMMNM khi cộng đồng không hài lòng với quản lý',
  datetime('now'),
  datetime('now')
);

-- CHAPTER 4: MÔ HÌNH PHÁT TRIỂN
INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Mô Hình Cathedral trong Phát Triển PMMNM',
  'Chương 4',
  'Mô hình Cathedral là gì trong bối cảnh phát triển phần mềm mã nguồn mở?',
  '- Cathedral (Nhà Thờ): Mô hình phát triển tập trung, kín kít
- Đặc điểm:
  * Một nhóm nhỏ lập trình viên (trong công ty/dự án) phát triển
  * Quy trình kiểm soát chặt chẽ, phân cấp rõ ràng
  * Phát hành bản chính thức định kỳ (v1.0, v2.0...)
  * Cộng đồng chủ yếu báo cáo lỗi (bug report), không tham gia phát triển nhiều
- Ví dụ: GNU Emacs, X Window System (ban đầu)',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Mô Hình Bazaar trong Phát Triển PMMNM',
  'Chương 4',
  'Mô hình Bazaar là gì và khác gì với Cathedral?',
  '- Bazaar (Chợ): Mô hình phát triển phân tán, mở cửa
- Đặc điểm:
  * Nhiều lập trình viên độc lập, ranh giới mơ hồ (nhân viên vs cộng đồng)
  * Phát triển nhanh, linh hoạt, phản ứng nhanh với thay đổi
  * Phát hành liên tục (rolling release)
  * Cộng đồng tham gia sâu sắc vào phát triển
  * Kinh tế như chợ - mọi người bán hàng hơi khác nhau
- Ví dụ: Linux Kernel, Apache, Firefox
- Ưu điểm: Phát triển nhanh, sáng tạo cao, khắc phục lỗi nhanh
- Nhược điểm: Chất lượng không đều, khó quản lý',
  datetime('now'),
  datetime('now')
);

-- CHAPTER 5: HỆ ĐIỀU HÀNH LINUX
INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Kiến Trúc Kernel Linux',
  'Chương 5',
  'Nêu các thành phần chính của Kernel Linux?',
  '- Kernel: Trái tim của Linux, quản lý phần cứng
- Các thành phần:
  * Process Management: Quản lý tiến trình, lập lịch CPU
  * Memory Management: Quản lý RAM, Virtual Memory, Paging
  * File System: Tổ chức dữ liệu trên ổ cứng (ext4, XFS...)
  * Device Drivers: Quản lý kết nối với thiết bị ngoài
  * Networking Stack: Hỗ trợ TCP/IP, socket programming
  * Inter-Process Communication (IPC): Cho phép các tiến trình giao tiếp
- Loại kernel: Monolithic (Linux), Microkernel (Minix), Hybrid (Windows)',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Hệ Thống Tập Tin Linux (ISO)',
  'Chương 5',
  'Nêu các mục đích của thư mục chính trong Linux (ISO standard)?',
  '- / (Root): Thư mục gốc, chứa toàn bộ hệ thống
- /bin: Binary - chứa lệnh cơ bản (ls, cp, mv, cat...)
- /etc: Configuration - các file cấu hình hệ thống
- /home: Thư mục của người dùng
- /usr: User Software Resources - chứa ứng dụng, thư viện
- /lib: Libraries - thư viện dùng chung của hệ thống
- /tmp: Temporary - thư mục tạm thời
- /var: Variable Data - dữ liệu thay đổi (logs, cache)
- /dev: Devices - file đặc biệt để kết nối thiết bị
- /boot: Boot files - các file để khởi động hệ thống
- /sys: System - thông tin hệ thống
- /opt: Optional - ứng dụng tùy chọn',
  datetime('now'),
  datetime('now')
);

INSERT INTO cards (deck_id, title, chapter, front, back, created_at, updated_at)
VALUES (
  1,
  'Dòng Lệnh Linux Căn Bản',
  'Chương 5',
  'Nêu các lệnh dòng lệnh Linux phổ biến và mục đích?',
  '- ls: List files/directories
- cd: Change directory
- pwd: Print working directory
- mkdir: Make directory
- cp: Copy file/directory
- mv: Move/rename file
- rm: Remove file (rm -r: remove directory)
- cat: Display file content
- grep: Search text pattern
- chmod: Change file permissions
- chown: Change file owner
- sudo: Execute as superuser
- apt-get (Debian): Package manager install/update
- systemctl: Manage services
- ssh: Secure shell remote login
- tar: Archive files (backup)
- ps: List running processes
- kill: Terminate process
- man: Manual - show help documentation',
  datetime('now'),
  datetime('now')
);
