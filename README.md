# Frontend — Mu Online (Next.js)

Website Mu Online Season 1.0. Gọi Backend API qua Next.js API routes (`/api/*`).

## Cấu trúc thư mục

```
frontend/
├── public/                 # Ảnh, favicon, manifest (phục vụ tĩnh)
│   ├── favicon/
│   ├── icons/
│   └── manifest.json
│
├── src/
│   ├── app/                # App Router (trang + API routes)
│   │   ├── page.tsx        # Trang chủ
│   │   ├── layout.tsx      # Layout gốc
│   │   ├── globals.css
│   │   ├── login/          # Đăng nhập game
│   │   ├── register/       # Đăng ký
│   │   ├── dashboard/      # Tài khoản / nhân vật
│   │   ├── rankings/       # Bảng xếp hạng
│   │   ├── news/           # Tin tức
│   │   ├── admin/          # Admin website (proxy backend)
│   │   ├── download/       # Tải client
│   │   ├── donate/         # Donate
│   │   ├── info/           # Thông tin server
│   │   └── api/            # Next.js API (proxy → backend)
│   │       ├── login/
│   │       ├── register/
│   │       ├── characters/
│   │       ├── dashboard/
│   │       ├── rankings/
│   │       ├── admin/
│   │       ├── config/
│   │       └── remote/     # Proxy config/site từ backend
│   │
│   ├── components/         # UI dùng chung
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── RankingTable.tsx
│   │   ├── GuildRankingTable.tsx
│   │   └── admin/          # ConfigEditor, NewsEditor
│   │
│   ├── lib/                # Logic client + server helpers
│   │   ├── api-client.ts
│   │   ├── ranking-api.ts
│   │   ├── news-api.ts
│   │   ├── config-api.ts
│   │   ├── mu-classes.ts   # Tên class MU
│   │   └── guild-mark.ts   # Logo guild từ G_Mark
│   │
│   ├── config/             # Cấu hình site (fallback local)
│   ├── hooks/
│   ├── styles/
│   └── middleware.ts       # Bảo mật / redirect
│
├── .env.local              # Biến môi trường (không commit — tạo thủ công)
├── next.config.ts
├── package.json
├── tsconfig.json
├── vercel.json             # Deploy Vercel
└── netlify.toml            # Deploy Netlify
```

## Chạy local

```bash
npm install
npm run dev
```

Tạo file `.env.local` (không commit):

```env
BACKEND_API_URL=http://localhost:3001
```

Mở: **http://localhost:3000**

Chỉ dùng biến **server-only** `BACKEND_API_URL` (không dùng `NEXT_PUBLIC_…`) để IP/port backend không bị nhúng vào JS trình duyệt.

## Biến môi trường

| Biến | Mô tả |
|------|--------|
| `BACKEND_API_URL` | URL backend API (bắt buộc, chỉ server) |
| `NEXT_PUBLIC_SITE_URL` | Domain production (Vercel HTTPS) |

## Luồng dữ liệu

```
Trình duyệt → Next.js /api/* → Backend Express → SQL Server
```

Database **không** kết nối trực tiếp từ trình duyệt; chỉ qua backend.

## Admin

| Vị trí | URL |
|--------|-----|
| Admin website | `/admin` (Next.js) |
| Admin backend từ xa | `{BACKEND_URL}/admin` (HTML trên backend) |

Cùng tài khoản `ADMIN_USERNAME` / `ADMIN_PASSWORD` trên backend.
