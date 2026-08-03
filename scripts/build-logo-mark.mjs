/**
 * 헤더용 로고 마크를 원본에서 다시 만든다.
 *
 *   node scripts/build-logo-mark.mjs
 *   public/images/logo.png (4MB, 2624x1632, 흰 배경) → public/images/logo-mark.png (7.5KB, 219x128, 투명)
 *
 * 원본을 그대로 헤더에 쓸 수 없는 이유가 둘 있다.
 *  1) 배경이 흰색(254,254,252)이라 헤더 바탕(#f2f2f3) 위에서 흰 사각형으로 보인다.
 *  2) 스캔 노이즈가 있어 배경만 투명하게 빼면 반투명 잡티가 남아 PNG가 6배로 커진다.
 * 그래서 화소를 브랜드 두 색으로 스냅한 뒤 축소한다. 축소 과정에서 가장자리가
 * 자연스럽게 안티앨리어싱되고, 색이 두 개뿐이라 PNG가 잘 압축된다.
 *
 * 사장님이 새 로고를 주시면 public/images/logo.png를 교체하고 이 스크립트를 다시 돌린다.
 * 색이 바뀌면 아래 GOLD/RED도 함께 고쳐야 한다.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';

const SRC = 'public/images/logo.png';
const OUT = 'public/images/logo-mark.png';
const TARGET_H = 128;

/** 원본 히스토그램에서 뽑은 브랜드 두 색 */
const GOLD = [196, 159, 81];
const RED = [195, 36, 39];
/** 이보다 밝으면 배경으로 본다 */
const WHITE_CUTOFF = 238;

const d2 = (r, g, b, c) => (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;

const img = sharp(SRC).ensureAlpha();
const { width: W, height: H } = await img.metadata();
const buf = await img.raw().toBuffer(); // RGBA

let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const r = buf[i], g = buf[i + 1], b = buf[i + 2];
    if (r > WHITE_CUTOFF && g > WHITE_CUTOFF && b > WHITE_CUTOFF) {
      buf[i] = buf[i + 1] = buf[i + 2] = buf[i + 3] = 0;
      continue;
    }
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    const c = d2(r, g, b, RED) < d2(r, g, b, GOLD) ? RED : GOLD;
    buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
  }
}

const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
const targetW = Math.round((bw / bh) * TARGET_H);

await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top: minY, width: bw, height: bh })
  .resize(targetW, TARGET_H, { kernel: 'lanczos3' })
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT);

console.log(
  `${OUT}  ${targetW}x${TARGET_H}  ${(statSync(OUT).size / 1024).toFixed(1)}KB` +
    `  (원본 여백 잘라냄: ${minX},${minY} ${bw}x${bh})`,
);
