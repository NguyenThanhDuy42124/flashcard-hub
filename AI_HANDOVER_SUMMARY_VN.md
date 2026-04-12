# AI Handover Summary - Flashcard Hub

## 1) Muc tieu xuyen suot
- Du an: Flashcard Hub (FastAPI + React).
- Muc tieu uu tien: thao tac nhanh, UI tieng Viet, toi uu vong lap sua -> test/build -> commit -> push.
- Cach lam viec mong muon:
  - Sau khi sua code phai run/build de xac minh.
  - Neu co thay doi frontend, uu tien chay `npm run build`.
  - Uu tien tra loi va thao tac bang tieng Viet.

## 2) Lo trinh da trien khai (tong hop den hien tai)

### Giai doan A - Nen tang tinh nang hoc va quan ly card
- Bo sung quan ly card theo chuong + title (tim kiem, sap xep, loc).
- Mo rong API lay card voi query theo chapter/search/sort.
- Them luong tao card trong giao dien va cap nhat danh sach realtime.

### Giai doan B - On dinh route frontend (SPA)
- Khac phuc loi route client-side tra 404 khi truy cap truc tiep cac duong dan con.
- Ap dung huong catch-all route cho SPA de route React hoat dong on dinh.

### Giai doan C - Nang cap giao dien va dark mode
- Dong bo hoa theme tong the (palette, contrast, text readability).
- Toi uu trai nghiem dark mode nhieu vong (do tuong phan, mau nhan, card shell, glare).
- Them nut quay ve dau trang (hien thi theo vi tri cuon).

### Giai doan D - Luong tao Deck moi theo prompt
- Them khu vuc huong dan tao Deck moi ngay tren trang tao deck.
- Co nut bat/tat huong dan de giao dien gon.
- Chen san 2 link prompt Gemini de tao noi dung deck nhanh.

### Giai doan E - Don dep va toi uu log backend
- Doi format access log backend tu dai (user/ua/referer/forwarded...) sang gon:
  - `METHOD /api/path | ip=...`
- Da don nhom file tam khong can thiet trong lan lam viec truoc.

### Giai doan F - Build, commit, push gan nhat
- Build frontend thanh cong.
- Da tao va push 2 commit moi nhat:
  - `297160b` - `feat: add deck guide UI and simplify request logs`
  - `100f27f` - `chore: include updated frontend build assets`
- `origin/main` da dong bo den `100f27f`.

## 3) Nguyen tac van hanh de tiet kiem thoi gian
1. Bat dau bang doc nhanh git status + commit moi nhat.
2. Neu sua frontend -> chay build ngay sau khi sua.
3. Neu sua backend log/API -> test endpoint chinh lien quan.
4. Commit tach nho theo muc tieu (feature/chore/fix), message ro y.
5. Push ngay sau khi build xanh.

## 4) Template prompt cho AI khac / chat moi
Su dung nguyen van doan duoi de giu dung gu lam viec:

"Ban dang lam viec trong du an Flashcard Hub (FastAPI backend + React frontend). Hay thao tac bang tieng Viet. Uu tien toc do va tinh thuc dung. Moi thay doi code can duoc run/build de xac minh truoc khi ket luan. Neu sua frontend, bat buoc chay npm run build. Neu xong thi commit va push len main. UI uu tien tieng Viet. Khi bao cao, tom tat ngan gon: da sua gi, da run gi, ket qua gi, commit nao."

## 5) Lenh nhanh hay dung
- Kiem tra thay doi:
  - `git status --short`
- Build frontend:
  - `cd frontend && npm run build`
- Xem commit moi:
  - `git log --oneline -8`
- Push:
  - `git push origin main`

## 6) Trang thai hien tai can luu y
- Co thay doi local chua commit lien quan du lieu/tooling:
  - `flashcard_hub.db` (modified)
  - `.agents/` (untracked)
  - `Prombt.md` (untracked)
  - `skills-lock.json` (untracked)
- Khuyen nghi: chi commit cac file nay khi ban muon quan ly chung trong repo. Neu khong, bo qua trong commit thao tac tinh nang.

## 7) Neu dung Repomix cho AI khac
- Kiem tra:
  - `npx repomix --version`
- Dong goi full repo dang markdown:
  - `npx repomix --style markdown -o repomix-context.md`
- Dong goi tap trung code + docs:
  - `npx repomix --include "backend/**,frontend/src/**,*.md" --style markdown -o repomix-focused.md`

## 8) Ca nhan hoa bat buoc
- Yeu cau mac dinh cho moi AI session:
  - Sau khi sua code, phai auto run de verify (it nhat build/test lien quan).
  - Neu co thay doi frontend, bat buoc chay `npm run build`.
  - Sau khi run/build xanh, phai commit roi push luon len `origin/main` (tru khi user yeu cau khac).
- Mau cau nhac nhanh de chen vao prompt dau phien:
  - "Sau moi thay doi, hay auto run verify, neu lien quan frontend thi build, sau do commit va push luon."

## 9) Log cap nhat phien gan nhat (Quiz + Xem nhanh)
- Da bo sung Quiz Mode cho Deck:
  - Them API `GET /api/quiz` (loc theo deck/chapter, lay so luong cau theo `limit`, random cau hoi).
  - Them man hinh cau hinh quiz (so cau, chapter), luong lam bai tung cau, cham diem, ket qua cuoi va lam lai.
- Da bo sung che do "Xem nhanh" cho flashcard:
  - Cau hinh so the/chapter truoc khi bat dau.
  - Hien thi tung the (front/back) va nut "Cau hoi tiep theo" khong can chon dap an.
  - Co progress va man hinh hoan tat.
- Da verify ky thuat:
  - Da test endpoint `/api/quiz` bang HTTP thuc te, tra payload dung schema.
  - Da run build frontend thanh cong.
- Commit da tao va da push:
  - `66257ab` - `feat: add quiz mode for deck and quick flashcard review`

## 10) Log cap nhat moi nhat (Chuyen doi MySQL + file env mau)
- Da cap nhat he thong ket noi DB de uu tien MySQL qua file env rieng:
  - Chinh sua `backend/database.py`:
    - Tu dong nap cac file env (`.env`, `.env.mysql`, `backend/.env`, `backend/.env.mysql`).
    - Ho tro ghep `DATABASE_URL` tu bo bien tach roi:
      - `MYSQL_ENDPOINT` (hoac `MYSQL_HOST` + `MYSQL_PORT`)
      - `MYSQL_DATABASE`
      - `MYSQL_USER`
      - `MYSQL_PASSWORD`
      - `MYSQL_CHARSET` (mac dinh `utf8mb4`)
    - Uu tien MySQL split env vars truoc `DATABASE_URL` co san, tranh bi `.env` SQLite de.
- Da them file mau de nguoi dung tu dien thong tin ket noi:
  - `backend/.env.mysql.example`
  - Mau co san endpoint/user/password/database de copy nhanh.
- Da bo sung dependency MySQL driver:
  - `requirements.txt`: them `PyMySQL==1.1.1`
  - `requirements-prod.txt`: them `PyMySQL>=1.1.1`
  - `backend/requirements-prod.txt`: them `PyMySQL==1.1.1`
- Da cap nhat tai lieu huong dan su dung MySQL:
  - `README.md`
  - `DEVELOPMENT.md`
  - `backend/README.md`
- Da cap nhat bo qua file bi mat local:
  - `.gitignore`: them `.env.mysql`, `.env.mysql.local`
- Da verify ky thuat sau khi sua:
  - Tao file local `backend/.env.mysql` de test ket noi that.
  - Run snippet Python import `backend/database.py`:
    - Ket qua `DATABASE_URL` da la `mysql+pymysql://...@103.228.36.238:3307/s167486_Flashcard?charset=utf8mb4`
    - `IS_MYSQL=True`
  - Build frontend thanh cong: `cd frontend && npm run build`
  - Check loi workspace: khong co loi (`No errors found`).

## 11) Ghi chu van hanh tiep theo
- Neu chay local theo MySQL:
  1. Copy `backend/.env.mysql.example` thanh `backend/.env.mysql`
  2. Dien thong tin ket noi that
  3. Chay backend nhu cu (`python app.py` / `uvicorn main:app --reload`)
- Luu y bao mat:
  - Khong commit `backend/.env.mysql` len git.
  - Neu can chia se config, chi chia se file `.example` va an password.
