# Deploy lên Vercel

Ứng dụng Next.js nằm ở **thư mục gốc** repo (không có subfolder `frontend/`).

## Cấu hình Vercel

1. **Settings** → **General** → **Root Directory** = `.` (để trống / root)
2. **Build Command**: `npm run build` (mặc định)
3. **Environment**: thêm `BACKEND_API_URL` trỏ tới backend (không dùng tiền tố `NEXT_PUBLIC_`)

## Nếu gặp lỗi 404

1. Vào [Vercel Dashboard](https://vercel.com/dashboard) → chọn project.
2. **Root Directory** phải là **root** (không đặt `frontend`).
3. **Deployments** → **Redeploy** để build lại.

## Netlify

**Base directory** = root (file `netlify.toml` ở thư mục gốc).

## Tắt Vercel Toolbar

1. Vercel Dashboard → project → **Settings** → **General**
2. **Vercel Toolbar** → **Preview** và **Production** → **Off**
