// PNG sans dépendance (zlib de Node) : décodage 8 bits (gris, RGB, RGBA, gris+alpha, palette), encodage RGB,
// réduction d'échelle et planche-contact (grille d'images annotée par un index).
import { readFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

/** Décode un PNG → { width, height, rgb: Buffer (3 octets/pixel) }. */
export function decodePng(path) {
  const buf = readFileSync(path);
  if (!buf.subarray(0, 8).equals(SIG)) throw Object.assign(new Error(`Pas un PNG : ${path}`), { code: 'BAD_PNG' });
  let pos = 8, width = 0, height = 0, depth = 0, colorType = 0, interlace = 0, palette = null;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); depth = data[8]; colorType = data[9]; interlace = data[12]; }
    else if (type === 'PLTE') palette = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (depth !== 8) throw Object.assign(new Error(`PNG ${depth} bits non géré (8 bits attendu)`), { code: 'BAD_PNG' });
  if (interlace) throw Object.assign(new Error('PNG entrelacé non géré'), { code: 'BAD_PNG' });
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels, rgb = Buffer.alloc(width * height * 3);
  let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride), p = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    raw.copy(cur, 0, p, p + stride); p += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0, b = prev[i], c = i >= channels ? prev[i - channels] : 0;
      let v = cur[i];
      if (filter === 1) v += a; else if (filter === 2) v += b; else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 0xff;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 3, s = x * channels;
      if (colorType === 3) { const pi = cur[s] * 3; rgb[o] = palette[pi]; rgb[o + 1] = palette[pi + 1]; rgb[o + 2] = palette[pi + 2]; }
      else if (channels === 1 || channels === 2) { rgb[o] = rgb[o + 1] = rgb[o + 2] = cur[s]; }
      else { rgb[o] = cur[s]; rgb[o + 1] = cur[s + 1]; rgb[o + 2] = cur[s + 2]; }
    }
    [prev, cur] = [cur, prev];
  }
  return { width, height, rgb };
}

/** Encode une image RGB (Buffer 3 octets/pixel) en PNG. */
export function encodePng({ width, height, rgb }) {
  const stride = width * 3, raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (stride + 1)] = 0; rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); }
  const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

/** Réduit une image RGB à la largeur w (moyenne par boîte). */
export function resize(img, w) {
  const h = Math.max(1, Math.round(img.height * w / img.width)), out = Buffer.alloc(w * h * 3);
  const sx = img.width / w, sy = img.height / h;
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * sy), y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx));
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const o = (yy * img.width + xx) * 3; r += img.rgb[o]; g += img.rgb[o + 1]; b += img.rgb[o + 2]; n++; }
      const o = (y * w + x) * 3; out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
    }
  }
  return { width: w, height: h, rgb: out };
}

// Chiffres 3x5 pour annoter chaque vignette (index), dessinés en blanc sur fond noir.
const DIGITS = { '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'], '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'], '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '001', '001', '001'], '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'], ':': ['000', '010', '000', '010', '000'], '.': ['000', '000', '000', '000', '010'] };
function drawLabel(img, x0, y0, label, scale = 2) {
  const w = label.length * 4 * scale + 2, h = 5 * scale + 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = ((y0 + y) * img.width + x0 + x) * 3; if (o >= 0 && o + 2 < img.rgb.length) img.rgb[o] = img.rgb[o + 1] = img.rgb[o + 2] = 0; }
  [...label].forEach((ch, i) => {
    const g = DIGITS[ch]; if (!g) return;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '1') for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const o = ((y0 + 1 + r * scale + dy) * img.width + x0 + 1 + i * 4 * scale + c * scale + dx) * 3;
      if (o >= 0 && o + 2 < img.rgb.length) img.rgb[o] = img.rgb[o + 1] = img.rgb[o + 2] = 255;
    }
  });
}

/** Planche-contact : frames[{path, label?}] → PNG (Buffer) avec `cols` colonnes, vignettes de `thumbWidth` px. */
export function contactSheet(frames, { cols = 5, thumbWidth = 320, labels = true } = {}) {
  const thumbs = frames.map((f) => resize(decodePng(f.path), thumbWidth));
  const th = Math.max(...thumbs.map((t) => t.height)), rows = Math.ceil(thumbs.length / cols), gap = 4;
  const W = cols * (thumbWidth + gap) + gap, H = rows * (th + gap) + gap;
  const sheet = { width: W, height: H, rgb: Buffer.alloc(W * H * 3, 24) };
  thumbs.forEach((t, i) => {
    const x0 = gap + (i % cols) * (thumbWidth + gap), y0 = gap + Math.floor(i / cols) * (th + gap);
    for (let y = 0; y < t.height; y++) t.rgb.copy(sheet.rgb, ((y0 + y) * W + x0) * 3, y * t.width * 3, (y + 1) * t.width * 3);
    if (labels) drawLabel(sheet, x0 + 2, y0 + 2, String(frames[i].label ?? i));
  });
  return { png: encodePng(sheet), width: W, height: H, rows, cols, thumbWidth, thumbHeight: th };
}
