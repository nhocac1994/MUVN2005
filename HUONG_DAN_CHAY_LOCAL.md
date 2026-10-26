# Hướng Dẫn Chạy Local Development

## 🚀 Chạy Backend (Localhost)

### 1. Vào thư mục backend
```bash
cd backend
```

### 2. Cài đặt dependencies (nếu chưa có)
```bash
npm install
```

### 3. Build backend (nếu chưa build)
```bash
npm run build
```

### 4. Chạy backend
```bash
# Development mode (tự động reload)
npm run dev

# Hoặc Production mode
npm start
```

Backend sẽ chạy trên: **http://localhost:3001**

### 5. Kiểm tra backend đang chạy
Mở browser và truy cập:
```
http://localhost:3001/health
```

Hoặc test API config:
```
http://localhost:3001/api/config
```

## 🎨 Chạy Frontend (Localhost)

### 1. Vào thư mục frontend
```bash
cd frontend
```

### 2. Tạo file .env.local (nếu chưa có)
```bash
echo "BACKEND_API_URL=http://localhost:3001" > .env.local
```

### 3. Chạy frontend
```bash
npm run dev
```

Frontend sẽ chạy trên: **http://localhost:3000**

### 4. Kiểm tra kết nối
1. Mở browser: http://localhost:3000
2. Mở Console (F12)
3. Xem logs:
   - `🔄 Đang load config từ backend...`
   - `🌐 Gọi API: http://localhost:3001/api/config`
   - `✅ Load config thành công từ backend`

## 🔧 Cấu Hình

### Backend Port
Mặc định: **3001**
- Có thể thay đổi trong `backend/.env`:
  ```
  PORT=3001
  ```

### Frontend Port
Mặc định: **3000**
- Next.js tự động chọn port khác nếu 3000 đã được dùng

### CORS
Backend đã cấu hình CORS để cho phép:
- Tất cả origins trong development mode
- Localhost:3000 (frontend)

## ✅ Checklist

- [ ] Backend đang chạy trên http://localhost:3001
- [ ] File `backend/config/site-config.json` tồn tại
- [ ] Frontend có file `.env.local` với `BACKEND_API_URL=http://localhost:3001`
- [ ] Frontend đang chạy trên http://localhost:3000
- [ ] Browser console hiển thị `✅ Load config thành công`
- [ ] API `/api/config` trả về dữ liệu khi test trực tiếp

## 🐛 Troubleshooting

### Lỗi: Cannot connect to backend
**Nguyên nhân:** Backend chưa chạy hoặc port sai
**Giải pháp:**
1. Kiểm tra backend có đang chạy: `curl http://localhost:3001/health`
2. Kiểm tra port trong `.env.local` có đúng không
3. Kiểm tra backend có lỗi không (xem terminal chạy backend)

### Lỗi: CORS error
**Nguyên nhân:** CORS chưa được cấu hình đúng
**Giải pháp:**
- Backend đã tự động cho phép localhost trong development
- Kiểm tra `backend/src/middleware/cors.ts`

### Lỗi: Config file not found
**Nguyên nhân:** File config không tồn tại
**Giải pháp:**
- Đảm bảo file `backend/config/site-config.json` tồn tại
- Kiểm tra path trong `backend/src/routes/config.ts`

### Frontend vẫn load config tĩnh
**Nguyên nhân:** API call thất bại, fallback về static config
**Giải pháp:**
1. Mở Browser Console (F12)
2. Xem Network tab - kiểm tra request đến `/api/config`
3. Xem Console tab - kiểm tra error logs
4. Đảm bảo backend đang chạy

## 📝 Ghi Chú

- File `.env.local` đã được gitignore, không commit lên git
- Khi deploy lên VPS, cập nhật `BACKEND_API_URL` thành URL backend (không commit IP vào code)
- Backend và Frontend có thể chạy trên các port khác nhau
- CORS chỉ cho phép localhost trong development mode
