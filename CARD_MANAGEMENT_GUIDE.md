# 📚 Card Management System - Hướng Dẫn Sử Dụng

Flashcard Hub giờ hỗ trợ quản lý Card hoàn chỉnh với tính năng **Tổ chức theo Chương**, **Sắp xếp**, **Tìm kiếm**, và **Tạo Card trực tiếp trên webpage**.

## 🆕 Tính Năng Mới (v2.0)

### 1️⃣ **Tổ Chức theo Chương** (Chapter Organization)
Mỗi card có thể gắn với một chương/chủ đề để dễ dàng quản lý nội dung lớn.

**Ví dụ:**
- Chương 1: Tổng Quan PMMNM
- Chương 2: Các Giấy Phép
- Chương 3: Sản Phẩm PMMNM
- Chương 4: Mô Hình Phát Triển
- Chương 5: Hệ Điều Hành Linux

### 2️⃣ **Sắp Xếp Card** (Sorting)
Ở trang xem deck (`/deck/{id}/cards`), nhấn dropdown "Sắp xếp" để chọn:
- 📚 **Theo Chương** (mặc định) - Nhóm cards theo chương
- 📝 **Theo Tiêu đề** - Sắp xếp từ A→Z theo tên card
- 🕐 **Mới nhất trước** - Cards vừa tạo hiện trước

### 3️⃣ **Lọc theo Chương** (Filter by Chapter)
Click vào nút chương ở phía trên để chỉ xem cards thuộc chương đó:
- Tất cả (mặc định)
- Chương 1
- Chương 2
- ...

### 4️⃣ **Tìm Kiếm Card theo Tiêu Đề** (Search)
#### Trên Trang Chủ (Homepage)
Dùng thanh tìm kiếm để tìm **Deck** theo tên

#### Trong Deck (Chi tiết)
Mỗi card hiện thị **Tiêu đề** (title) trên card → dễ tìm câu hỏi cụ thể

### 5️⃣ **Tạo Card Trực Tiếp** (Create Card In-App)
#### Cách 1: Sử dụng Nút "+ Thêm Card"
1. Vào trang xem deck: `/deck/{deck_id}/cards`
2. Nhấn nút **"+ Thêm Card"** (góc trên bên phải)
3. Modal hiện lên

#### Modal Form:
```
📌 Tiêu Đề Câu Hỏi *
   [Nhập tiêu đề câu hỏi, VD: "Bản Quyền & Phân Loại"]

📌 Chương *
   [Chọn từ dropdown hoặc nhập chương mới]
   - Nếu chương chưa tồn tại, nó sẽ được tạo tự động

📌 Câu Hỏi (Mặt Trước) *
   [Nhập nội dung câu hỏi, hỗ trợ multiline]

📌 Câu Trả Lời (Mặt Sau) *
   [Nhập đáp án - hỗ trợ:
    - Văn bản bình thường
    - Dòng mới (Enter)
    - Chấm đầu dòng (-)
   ]
```

**Ví dụ điền:**
```
Tiêu Đề: Bản Quyền & Phân Loại

Chương: Chương 1

Câu Hỏi:
Thế nào là phần mềm Thương mại, Freeware, Shareware và PMMNM?

Câu Trả Lời:
- Phần mềm thương mại (Commercial): Thuộc quyền NSX, chỉ cung cấp dạng nhị phân
- Freeware: Không mất tiền mua, nhưng KHÔNG được truy cập/sửa mã nguồn
- Shareware: Dùng thử một thời gian, sau đó phải trả phí
- PMMNM: Công bố rộng rãi mã nguồn, được sửa đổi và phân phối lại
```

### 6️⃣ **Các Thay Đổi Hiển Thị trên Card**
✅ **Card Front (Mặt Trước):**
- Badge chương ở góc trên bên trái (VD: "Chương 1")
- Tiêu đề card ở giữa (nhỏ, xám)
- Câu hỏi vẫn hiện như trước

✅ **Card Back (Mặt Sau):**
- Vẫn giữ nguyên, hiện đáp án có format

## 📊 Quy Trình Sử Dụng Hoàn Chỉnh

### Workflow 1: Tạo Deck + Cards Mới
```
1. Trang chủ: Click "Tạo Deck Mới"
   ↓
2. Nhập tên deck (VD: "Ôn Phần Mềm Mã Nguồn Mở")
   ↓
3. Vào deck vừa tạo (click card)
   ↓
4. Nhấn "+ Thêm Card"
   ↓
5. Điền form (title, chapter, front, back)
   ↓
6. Lặp lại bước 4-5 cho các card khác
   ↓
7. Khi hoàn thành, dùng dropdown sắp xếp theo chương
   ↓
8. Bắt đầu học tập!
```

### Workflow 2: Import HTML + Thêm Các Card Bổ Sung
```
1. Trang chủ: Click "Tải Lên" → Upload HTML file hoặc Paste HTML
   ↓
2. Deck được tạo tự động từ HTML
   ↓
3. Vào deck, nhấn "+ Thêm Card"
   ↓
4. Thêm cards chiếu nhuần với nội dung HTML
   ↓
5. Dùng chương để tổ chức tất cả cards
```

### Workflow 3: Học Tập Theo Chương
```
1. Vào deck (VD: `/deck/1/cards`)
   ↓
2. Sắp xếp: Chọn "Theo Chương" (mặc định)
   ↓
3. Lọc: Click chương cụ thể (VD: "Chương 1")
   ↓
4. Học tập: Lật từng card
   ↓
5. Chuyển chương: Click tab chương khác
   ↓
6. Hoàn thành!
```

## 🔧 Dữ Liệu Sample (Testing)

File `sample-pmmnm-cards.sql` chứa 16 cards đầy đủ môn **Phần Mềm Mã Nguồn Mở** chia theo 5 chương.

### Cách Import:
**Trên Pterodactyl:**
```bash
cd /home/container
sqlite3 flashcard.db < sample-pmmnm-cards.sql
```

**Locally:**
```bash
sqlite3 backend/flashcard.db < sample-pmmnm-cards.sql
```

### Nội Dung:
- **Chương 1**: Tổng Quan (Bản Quyền, Tổ Chức, Mạng)
- **Chương 2**: Giấy Phép (GPL, MIT, Apache)
- **Chương 3**: Sản Phẩm (Apache, Eclipse, LibreOffice)
- **Chương 4**: Mô Hình (Cathedral, Bazaar)
- **Chương 5**: Linux (Kernel, Filesystem, CLI)

## 📋 API Endpoints (Developer Reference)

### GET:  Lấy Cards Với Sắp Xếp/Lọc
```bash
GET /api/decks/{deck_id}/cards?sort_by=chapter&chapter=Chương%201&search=bản
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `sort_by` | string | "chapter" (default), "title", "created" |
| `chapter` | string | Filter by chapter name (URL encoded) |
| `search` | string | Search by card title (URL encoded) |

**Example Response:**
```json
[
  {
    "id": 1,
    "deck_id": 1,
    "title": "Bản Quyền & Phân Loại",
    "chapter": "Chương 1",
    "front": "Thế nào là phần mềm Thương mại...",
    "back": "- Phần mềm thương mại:...",
    "created_at": "2026-03-31T10:00:00",
    "updated_at": "2026-03-31T10:00:00"
  }
]
```

### POST: Tạo Card Mới
```bash
POST /api/cards?deck_id=1
Content-Type: application/json

{
  "title": "Bản Quyền & Phân Loại",
  "chapter": "Chương 1",
  "front": "Thế nào là phần mềm Thương mại, Freeware, Shareware?",
  "back": "- Thương mại: ...\n- Freeware: ..."
}
```

**Response (201 Created):**
```json
{
  "id": 17,
  "deck_id": 1,
  "title": "...",
  "chapter": "...",
  "front": "...",
  "back": "...",
  "created_at": "2026-03-31T15:30:00",
  "updated_at": "2026-03-31T15:30:00"
}
```

## ✅ Checklist Testing

Sau khi deploy, hãy test các tính năng:

- [ ] **Create Card**: Tạo card mới với title + chapter
- [ ] **New Chapter**: Tạo card với chương chưa tồn tại
- [ ] **Sort by Chapter**: Cards nhóm theo chương
- [ ] **Sort by Title**: Sắp xếp A→Z theo title
- [ ] **Sort by Newest**: Cards mới nhất trước
- [ ] **Filter Chapter**: Click tab chương chỉ hiện cards đó
- [ ] **Chapter Badge**: Badge chương hiển thị trên card front
- [ ] **Card Title**: Title hiển thị dưới badge trên card front
- [ ] **Count Display**: Hiển thị "X/Y cards"
- [ ] **Search**: Tìm kiếm card theo tiêu đề
- [ ] **Modal Validation**: Form yêu cầu title, chapter, Q&A
- [ ] **Error Handling**: Xử lý lỗi nếu tạo card fail

## 🚀 Deployment Checklist

Trên Pterodactyl server:
1. ✅ Pull latest code (commit c252275)
2. ✅ Run migration: `alembic upgrade head`
3. ✅ Restart server
4. ✅ Open in browser: `/deck/{deck_id}/cards`
5. ✅ Test "+ Thêm Card" button
6. ✅ Test sorting dropdown
7. ✅ Test chapter filter

## 🐛 Troubleshooting

**Q: Card không hiện chương badge?**
A: Card phải có `chapter` field. Kiểm tra trong database xem card có chapter không.

**Q: Modal không hiện?**
A: Kiểm tra browser console (F12) xem có error không. Có thể do CreateCardModal component chưa import đúng.

**Q: Sắp xếp không hoạt động?**
A: Kiểm tra API response xem cards có theo thứ tự không, hoặc reload trang.

**Q: Error "Deck not found"?**
A: Kiểm tra URL `/deck/{deckId}/cards` - `deckId` phải tồn tại.

## 📞 Support & Docs

- **Repo**: https://github.com/NguyenThanhDuy42124/flashcard-hub
- **Commits**: c252275 (latest feature), 2be44d6 (SPA routing fix)
- **Docs**: `/memories/repo/card-management-system.md`
