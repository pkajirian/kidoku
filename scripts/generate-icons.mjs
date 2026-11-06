// Generates the Kidoku PWA icons (PNG) from scratch using only Node built-ins.
// No native dependencies, no font files: the bolt + Sudoku grid are drawn
// procedurally. Run via `npm run predev` / `npm run prebuild`, or directly:
//   node scripts/generate-icons.mjs
// Output goes to public/icons/ (gitignored — generated at build time).
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

// ---- PNG encoding (truecolor RGBA, no filters) -----------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: none
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Tiny software rasterizer ----------------------------------------------

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

class Canvas {
  constructor(size) {
    this.size = size;
    this.buf = Buffer.alloc(size * size * 4);
  }
  set(x, y, [r, g, b, a = 255]) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    const i = (y * this.size + x) * 4;
    if (a === 255) {
      this.buf[i] = r; this.buf[i + 1] = g; this.buf[i + 2] = b; this.buf[i + 3] = 255;
    } else {
      // simple source-over blend onto existing pixel
      const sa = a / 255;
      this.buf[i] = Math.round(r * sa + this.buf[i] * (1 - sa));
      this.buf[i + 1] = Math.round(g * sa + this.buf[i + 1] * (1 - sa));
      this.buf[i + 2] = Math.round(b * sa + this.buf[i + 2] * (1 - sa));
      this.buf[i + 3] = 255;
    }
  }
  fillVerticalGradient(topHex, bottomHex) {
    const top = hexRgb(topHex);
    const bottom = hexRgb(bottomHex);
    for (let y = 0; y < this.size; y++) {
      const t = y / (this.size - 1);
      const c = top.map((v, i) => Math.round(v + (bottom[i] - v) * t));
      for (let x = 0; x < this.size; x++) this.set(x, y, c);
    }
  }
  fillRect(x, y, w, h, color) {
    const [r, g, b, a = 255] = [...hexRgb(color), 255];
    for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(this.size, Math.ceil(y + h)); yy++) {
      for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(this.size, Math.ceil(x + w)); xx++) {
        this.set(xx, yy, [r, g, b, a]);
      }
    }
  }
  fillRoundedRect(x, y, w, h, radius, color) {
    const [r, g, b] = hexRgb(color);
    const r2 = radius * radius;
    for (let yy = Math.floor(y); yy < Math.ceil(y + h); yy++) {
      for (let xx = Math.floor(x); xx < Math.ceil(x + w); xx++) {
        const cx = Math.min(Math.max(xx, x + radius), x + w - radius);
        const cy = Math.min(Math.max(yy, y + radius), y + h - radius);
        const dx = xx - cx;
        const dy = yy - cy;
        if (dx * dx + dy * dy <= r2) this.set(xx, yy, [r, g, b]);
      }
    }
  }
  fillPolygon(points, color) {
    const [r, g, b] = hexRgb(color);
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [, py] of points) {
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) {
          this.set(x, y, [r, g, b]);
        }
      }
    }
  }
}

// ---- Kidoku icon art --------------------------------------------------------
// Deep-violet board, neon-cyan 3x3 grid, lightning bolt in the middle.
// `boardScale` is the board's side as a fraction of the canvas: 0.74 for
// regular icons, 0.62 for the maskable icon (inside the 80% safe zone).
function drawIcon(size, boardScale) {
  const c = new Canvas(size);
  const s = size / 512; // scale factor vs. the 512 master
  c.fillVerticalGradient('#1a0b2e', '#03000a');

  const board = Math.round(size * boardScale);
  const bx = Math.round((size - board) / 2);
  const by = bx;
  const radius = Math.round(36 * s);
  const border = Math.max(4, Math.round(12 * s));

  // Board: cyan border, violet face.
  c.fillRoundedRect(bx, by, board, board, radius, '#00ffcc');
  c.fillRoundedRect(bx + border, by + border, board - border * 2, board - border * 2, Math.max(4, radius - border), '#170a33');

  // Inner grid lines (2 vertical, 2 horizontal).
  const inner = board - border * 2;
  const cell = inner / 3;
  const line = Math.max(3, Math.round(6 * s));
  for (let i = 1; i < 3; i++) {
    const vx = bx + border + cell * i - line / 2;
    c.fillRect(vx, by + border, line, inner, '#00ffcc');
    const hy = by + border + cell * i - line / 2;
    c.fillRect(bx + border, hy, inner, line, '#00ffcc');
  }

  // Lightning bolt, centered on the board.
  const boltBox = board * 0.6;
  const ox = bx + (board - boltBox) / 2;
  const oy = by + (board - boltBox) / 2;
  const bolt = [
    [0.58, 0.02], [0.3, 0.56], [0.46, 0.56],
    [0.38, 0.98], [0.7, 0.44], [0.54, 0.44],
  ].map(([px, py]) => [ox + px * boltBox, oy + py * boltBox]);
  c.fillPolygon(bolt, '#00ffcc');

  return encodePng(size, size, c.buf);
}

mkdirSync(OUT_DIR, { recursive: true });
const jobs = [
  ['icon-192.png', drawIcon(192, 0.74)],
  ['icon-512.png', drawIcon(512, 0.74)],
  ['icon-maskable-512.png', drawIcon(512, 0.62)],
  ['apple-touch-icon.png', drawIcon(180, 0.74)],
];
for (const [name, png] of jobs) {
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`wrote public/icons/${name} (${png.length} bytes)`);
}
