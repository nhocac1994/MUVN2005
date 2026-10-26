import { deflateSync } from 'zlib';

/** Bảng màu guild mark chuẩn MU Online (muweb / SYlogo) */
const MU_GUILD_COLORS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 0, 0, 0], // 0 — trong suốt
  [0, 0, 0, 255], // 1 #000000
  [140, 138, 141, 255], // 2 #8c8a8d
  [255, 255, 255, 255], // 3 #ffffff
  [254, 0, 0, 255], // 4 #fe0000
  [255, 138, 0, 255], // 5 #ff8a00
  [255, 255, 0, 255], // 6 #ffff00
  [140, 255, 1, 255], // 7 #8cff01
  [0, 255, 0, 255], // 8 #00ff00
  [1, 255, 141, 255], // 9 #01ff8d
  [0, 255, 255, 255], // a #00ffff
  [0, 138, 255, 255], // b #008aff
  [0, 0, 254, 255], // c #0000fe
  [140, 0, 255, 255], // d #8c00ff
  [255, 0, 254, 255], // e #ff00fe
  [255, 0, 140, 255], // f #ff008c
];

const MARK_SIZE = 8;

function bytesToColorIndices(bytes: number[]): number[] {
  const indices: number[] = [];
  for (let i = 0; i < Math.min(bytes.length, 32); i++) {
    const b = bytes[i] & 0xff;
    indices.push((b >> 4) & 0x0f, b & 0x0f);
  }
  while (indices.length < 64) indices.push(0);
  return indices.slice(0, 64);
}

export function parseGuildMarkInput(mark: unknown): number[] | null {
  if (mark == null) return null;

  if (typeof mark === 'string') {
    if (mark.startsWith('data:image')) return null;
    const hex = mark.replace(/[^0-9a-f]/gi, '');
    if (hex.length < 64) return null;
    const indices: number[] = [];
    for (let i = 0; i < 64; i++) {
      const n = parseInt(hex[i], 16);
      if (Number.isNaN(n)) return null;
      indices.push(n);
    }
    return indices;
  }

  if (typeof mark === 'object') {
    const obj = mark as { type?: string; data?: number[] };
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return bytesToColorIndices(obj.data);
    }
    if (Array.isArray(mark)) {
      return bytesToColorIndices(mark as number[]);
    }
  }

  return null;
}

function colorIndexToRgba(index: number): readonly [number, number, number, number] {
  return MU_GUILD_COLORS[index & 0x0f] ?? MU_GUILD_COLORS[0];
}

function buildRgba(indices: number[], scale: number): Uint8Array {
  const size = MARK_SIZE * scale;
  const rgba = new Uint8Array(size * size * 4);

  for (let y = 0; y < MARK_SIZE; y++) {
    for (let x = 0; x < MARK_SIZE; x++) {
      const [r, g, b, a] = colorIndexToRgba(indices[y * MARK_SIZE + x]);
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = (y * scale + sy) * size + (x * scale + sx);
          const i = px * 4;
          rgba[i] = r;
          rgba[i + 1] = g;
          rgba[i + 2] = b;
          rgba[i + 3] = a;
        }
      }
    }
  }

  return rgba;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width: number, height: number, rgba: Uint8Array): Buffer {
  const rowBytes = width * 4;
  const raw = Buffer.alloc((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowBytes + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < rowBytes; x++) {
      raw[rowStart + 1 + x] = rgba[y * rowBytes + x];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw, { level: 6 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Chuyển G_Mark (Buffer JSON / hex / bytes) thành data URL PNG để hiển thị <img>. */
export function guildMarkToDataUrl(mark: unknown, scale = 4): string | null {
  if (typeof mark === 'string' && mark.startsWith('data:image')) {
    return mark;
  }

  const indices = parseGuildMarkInput(mark);
  if (!indices || indices.every((v) => v === 0)) return null;

  const rgba = buildRgba(indices, scale);
  const png = encodePng(MARK_SIZE * scale, MARK_SIZE * scale, rgba);
  return `data:image/png;base64,${png.toString('base64')}`;
}
