import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

/** Không hardcode IP/port. Production: set BACKEND_API_URL trong .env.local hoặc Vercel */
const DEFAULT_BACKEND_API_URL = "";

/**
 * Đọc BACKEND_API_URL trực tiếp từ file .env* trong project.
 * Lý do: nếu biến đã tồn tại trong shell/IDE (export ...), dotenv sẽ KHÔNG ghi đè
 * → .env.local đúng URL nhưng app vẫn dùng giá trị cũ trong shell.
 */
function parseEnvFileValue(content: string, key: string): string {
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(new RegExp(`^${key}=(.*)$`));
    if (!m) continue;
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v;
  }
  return "";
}

const BACKEND_ENV_KEYS = ["BACKEND_API_URL", "NEXT_PUBLIC_BACKEND_API_URL"];

function readBackendUrlFromEnvFiles(cwd: string): string {
  const names = [".env.local", ".env.production.local", ".env.development.local", ".env.production", ".env.development", ".env"];
  for (const name of names) {
    try {
      const p = path.join(cwd, name);
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, "utf8");
      for (const key of BACKEND_ENV_KEYS) {
        const v = parseEnvFileValue(content, key);
        if (v) return v;
      }
    } catch {
      /* bỏ qua */
    }
  }
  return "";
}

const resolvedBackendUrl = (
  readBackendUrlFromEnvFiles(process.cwd()).trim() ||
  (process.env.BACKEND_API_URL || "").trim() ||
  (process.env.NEXT_PUBLIC_BACKEND_API_URL || "").trim() ||
  DEFAULT_BACKEND_API_URL
).trim();

// Chỉ server đọc được (không có tiền tố NEXT_PUBLIC_, không khai báo trong `env`) → không bị nhúng vào JS trình duyệt
process.env.BACKEND_API_URL = resolvedBackendUrl;
delete process.env.NEXT_PUBLIC_BACKEND_API_URL;

const nextConfig: NextConfig = {
  images: {
    /** Cho phép ảnh trong public/ kèm ?v=... (cache bust). Không khai báo search → mọi query đều hợp lệ. */
    localPatterns: [{ pathname: '/**' }],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Cache control headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Logo & ảnh public — không cache lâu để đổi file không bị ảnh cũ
        source: '/NAME.PNG',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/MUHANOI1.PNG',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes không cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
