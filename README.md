# JARVIS — Trợ lý học tập cá nhân

Frontend cho đồ án **Xây dựng trợ lý AI đa phương thức JARVIS hỗ trợ hội thoại tiếng Việt và học tập cá nhân**.

Ứng dụng giúp tổ chức môn học, quản lý tài liệu, lưu hội thoại và luyện Quiz. Dự án hiện là bản thử nghiệm frontend: dữ liệu được lưu trên trình duyệt; AI Tutor trả lời mô phỏng và Quiz sử dụng ngân hàng câu hỏi mẫu.

## Chức năng hiện tại

| Khu vực | Chức năng |
| --- | --- |
| Trang giới thiệu | Giới thiệu sản phẩm, mở đăng nhập/đăng ký hoặc truy cập với tư cách khách |
| Tài khoản thử nghiệm | Đăng ký 3 bước, đăng nhập bằng email và mật khẩu, đăng xuất |
| Tổng quan | Danh sách môn học, điểm Quiz trung bình, chủ đề yếu và hội thoại gần đây |
| AI Tutor | Tạo, đổi tên, xóa và tiếp tục hội thoại; nhận diện môn sơ bộ bằng từ khóa |
| Đính kèm | Chọn ảnh/tài liệu, chụp ảnh bài tập, xem ảnh và tải tệp đã gửi |
| Nhập giọng nói | Chuyển lời nói tiếng Việt thành văn bản bằng Web Speech API, kiểm tra trước khi gửi |
| Môn học | Tạo môn, thêm mô tả, lưu nhiều tài liệu, xem trước, tải xuống và xóa tài liệu |
| Quiz | Chọn môn/chủ đề/số câu, luyện thích nghi, tạm dừng, tiếp tục và xem kết quả/giải thích |
| Cài đặt | Chọn giao diện sáng, tối hoặc theo thiết bị; xem hồ sơ học tập |

Quiz mẫu hiện hỗ trợ Học máy, Lý thuyết thông tin và Xử lý ngôn ngữ tự nhiên. Tài liệu xem trước hỗ trợ PDF, ảnh và văn bản; Word/PowerPoint/Excel cần tải xuống để mở.

## Công nghệ

- React 19, TypeScript.
- Vinext với App Router tương thích Next.js, Vite.
- Tailwind CSS 4, shadcn/ui và Radix UI.
- Lucide React, Zod, next-themes.
- localStorage, sessionStorage và IndexedDB.
- Cloudflare Workers/Wrangler và Drizzle có sẵn trong cấu hình dự án.

## Yêu cầu

- Node.js **22.13.0 trở lên**.
- pnpm; phiên bản khai báo trong `package.json` là **11.25.0**.
- Git để quản lý mã nguồn.
- Trình duyệt hiện đại; camera và xử lý mật khẩu cần **HTTPS hoặc localhost**.

## Cài đặt và chạy

Clone repository của bạn, sau đó mở terminal tại thư mục dự án:

```bash
pnpm install
pnpm dev
```

Mở **http://localhost:5173**.

Trên Windows PowerShell, nếu gặp lỗi chặn chạy `pnpm.ps1`, dùng `pnpm.cmd install` và `pnpm.cmd dev`.

### Các trang

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang giới thiệu |
| `/register` | Đăng ký tài khoản thử nghiệm |
| `/login` | Đăng nhập |
| `/workspace` | Không gian học tập |

Các mục Tổng quan, Tutor, Môn học, Quiz và Cài đặt được chuyển bên trong `/workspace`, chưa có URL riêng cho từng mục.

### Lệnh phát triển

```bash
# Kiểm tra kiểu TypeScript
pnpm exec tsc --noEmit

# Kiểm tra mã nguồn
pnpm lint

# Build production
pnpm build

# Chạy bản build bằng Wrangler local
pnpm start
```

`pnpm start` cần bản build tại `dist/server/wrangler.json`. Thư mục `build/` chứa mã plugin hỗ trợ build và cần được giữ trong repository.

## Cấu hình môi trường

Bản demo lưu dữ liệu trên trình duyệt có thể chạy mà chưa kết nối backend. Khi tích hợp API, sao chép `.env.example` thành `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

HTTP client nằm tại `services/http-client.ts`. Các feature hiện dùng dữ liệu local; chỉ thiết lập biến môi trường chưa tự chuyển chúng sang API.

## Kiểm tra đăng ký và đăng nhập

1. Mở `/register`, nhập tên, email và mật khẩu từ 8 ký tự; nhập lại mật khẩu trùng khớp.
2. Nhập chuyên ngành/mục tiêu học tập hoặc bỏ trống, kiểm tra thông tin rồi hoàn tất đăng ký.
3. Mở `/login`, nhập sai mật khẩu: ứng dụng phải báo lỗi.
4. Nhập đúng email và mật khẩu: ứng dụng mở `/workspace`.
5. Tải lại trang: phiên đăng nhập vẫn được giữ trong tab.
6. Đăng xuất rồi mở `/workspace`: ứng dụng chuyển về đăng nhập; tài khoản vẫn tồn tại để đăng nhập lại.
7. Đăng ký lại email đã có mật khẩu: ứng dụng phải báo email trùng.

Hồ sơ demo cũ chưa có mật khẩu cần đăng ký lại cùng email để thiết lập mật khẩu thử nghiệm; ID hồ sơ được giữ lại.

## Lưu trữ dữ liệu

| Dữ liệu | Nơi lưu | Khóa/kho |
| --- | --- | --- |
| Hồ sơ và thông tin kiểm tra mật khẩu | localStorage | `jarvis.demo.users.v1` |
| Phiên đăng nhập/khách | sessionStorage | `jarvis.demo.session.v1` |
| Môn học | localStorage | `jarvis.subjects` |
| Hội thoại | localStorage | `jarvis.conversations.v1` |
| Quiz và kết quả | localStorage | `jarvis.quizzes.v1` |
| Giao diện sáng/tối | localStorage | `jarvis.theme` |
| Nội dung tài liệu và tệp đính kèm | IndexedDB | `jarvis.subject-documents` |

Có thể kiểm tra bằng **DevTools → Application → Storage**. Mật khẩu không được lưu dạng rõ; tài khoản lưu salt riêng và mã băm PBKDF2-SHA256.

Tài khoản này phục vụ thử nghiệm frontend, chưa có xác thực máy chủ. Các hồ sơ và khách vẫn dùng chung dữ liệu học tập trên cùng trình duyệt. Chỉ dùng mật khẩu dành riêng cho bản thử nghiệm.

Dữ liệu phụ thuộc trình duyệt và địa chỉ ứng dụng, chưa đồng bộ giữa thiết bị. Xóa dữ liệu trình duyệt sẽ làm mất dữ liệu đã lưu. Đăng xuất chỉ xóa phiên đăng nhập.

## Cấu trúc dự án

```text
DATN/
├── app/                  # Layout, CSS và các trang vào ứng dụng
├── components/
│   ├── layout/           # Header và menu
│   ├── shared/           # Component dùng chung
│   └── ui/               # UI primitives
├── config/               # Cấu hình điều hướng
├── features/
│   ├── auth/             # Form và service tài khoản thử nghiệm
│   ├── dashboard/        # Tổng quan học tập
│   ├── landing/          # Trang giới thiệu
│   ├── quiz/             # Ngân hàng câu hỏi, làm bài và chấm điểm
│   ├── settings/         # Giao diện và hồ sơ
│   ├── subjects/         # Môn học và tài liệu
│   ├── tutor/            # Hội thoại, camera và nhập giọng nói
│   └── workspace/        # Kết nối các feature
├── services/             # HTTP client
├── hooks/                # Hooks dùng chung
├── types/                # Kiểu dữ liệu dùng chung
├── public/               # Tài nguyên tĩnh
├── scripts/              # Script chạy và build
├── build/                # Plugin hỗ trợ build
├── db/                   # Cấu hình/schema dữ liệu
├── .openai/hosting.json  # Cấu hình hosting được Vite sử dụng
├── .env.example          # Biến môi trường mẫu
└── package.json
```

## Phạm vi chưa triển khai

- Kết nối backend xác thực và phân quyền dữ liệu theo tài khoản.
- AI thật, streaming phản hồi, OCR và hỏi đáp tài liệu bằng RAG.
- Trích dẫn tài liệu/số trang và sinh Quiz từ tài liệu hoặc hội thoại.
- Phát câu trả lời bằng giọng nói, wake word và hội thoại audio realtime.
- Cập nhật tiến độ hoàn thành môn học, lịch ôn tập và nhắc lịch.
- Đồng bộ dữ liệu giữa thiết bị, flashcard và chạy bài tập lập trình.

Mức nắm vững hiện tính từ tỷ lệ đúng của tối đa 20 câu đã nộp gần nhất cho mỗi chủ đề. Đây là kết quả luyện tập, chưa phải tiến độ hoàn thành chương trình học.

## Đưa README lên Git

Nếu dự án đã có repository và remote `origin`:

```bash
git status
git add README.md
git commit -m "docs: add JARVIS project README"
git push
```

Nếu chưa có repository:

```bash
git init
git add README.md
git commit -m "docs: add JARVIS project README"
git branch -M main
git remote add origin <URL_REPOSITORY_CUA_BAN>
git push -u origin main
```

Thay `<URL_REPOSITORY_CUA_BAN>` bằng URL repository bạn đã tạo. Các lệnh trên chỉ đưa README lên Git; để đưa toàn bộ dự án lên, chọn thêm các thư mục mã nguồn và file cấu hình cần commit. Kiểm tra danh sách file staged bằng `git diff --cached --name-only` trước khi commit. Giữ `.env.local`, `node_modules/`, dữ liệu runtime và file kiểm tra tạm ngoài repository.

Tài liệu định hướng đồ án nằm trong `Noi_dung_do_an.docx`.
