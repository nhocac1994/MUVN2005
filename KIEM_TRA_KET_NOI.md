# Hướng Dẫn Kiểm Tra Kết Nối Frontend - Backend

## 🔍 Kiểm Tra Kết Nối

### 1. Kiểm tra Backend có đang chạy không

```bash
cd backend
npm run dev
# Hoặc
npm start
```

Backend sẽ chạy trên port mặc định (thường là 3001 hoặc port trong `.env`).

### 2. Kiểm tra Backend URL trong Frontend

File: `src/config/backend.config.ts`

Dev local mặc định: `http://localhost:3001`

**Tạo file `.env.local` ở thư mục gốc project:**

```bash
echo "BACKEND_API_URL=http://localhost:3001" > .env.local
```

Production/VPS: thay bằng URL backend thật (không commit file này).

### 3. Kiểm tra API Config có hoạt động không

Mở browser console và kiểm tra logs:
- `🔄 Đang load config từ backend...`
- `🌐 Gọi API: http://...`
- `📡 Response status: 200 OK`
- `✅ Load config thành công từ backend`

### 4. Test API trực tiếp

Mở browser và truy cập (thay URL theo `.env.local`):

```
http://localhost:3001/api/config
```

Kết quả mong đợi:

```json
{
  "success": true,
  "data": {
    "events": [...],
    "downloadLinks": {...},
    "socialMedia": {...},
    "bankTransfer": {...},
    "serverInfo": {...}
  }
}
```

### 5. Kiểm tra CORS

Nếu thấy lỗi CORS trong console:
- Kiểm tra file `backend/src/middleware/cors.ts`
- Đảm bảo frontend URL được thêm vào `allowedOrigins`

### 6. Kiểm tra File Config

File config phải tồn tại tại:

```
backend/config/site-config.json
```

### 7. Debug Steps

1. **Mở Browser Console** (F12)
2. **Xem Network tab** — kiểm tra request đến `/api/config`
3. **Xem Console tab** — kiểm tra logs:
   - Nếu thấy `❌` → có lỗi
   - Nếu thấy `⚠️` → warning, vẫn dùng fallback
   - Nếu thấy `✅` → thành công

### 8. Common Issues

**Issue 1: Backend chưa chạy**
- Solution: Chạy `npm run dev` trong thư mục `backend/`

**Issue 2: URL sai**
- Solution: Tạo `.env.local` với `BACKEND_API_URL=http://localhost:PORT`

**Issue 3: CORS error**
- Solution: Kiểm tra CORS config trong backend

**Issue 4: File config không tồn tại**
- Solution: Đảm bảo file `backend/config/site-config.json` tồn tại

**Issue 5: Port conflict**
- Solution: Kiểm tra port backend đang dùng và cập nhật URL trong frontend

## ✅ Checklist

- [ ] Backend đang chạy
- [ ] File `backend/config/site-config.json` tồn tại
- [ ] Frontend có file `.env.local` với `BACKEND_API_URL` đúng
- [ ] CORS được cấu hình đúng
- [ ] API `/api/config` trả về dữ liệu khi test trực tiếp
- [ ] Browser console không có lỗi CORS
- [ ] Browser console hiển thị logs `✅ Load config thành công`
