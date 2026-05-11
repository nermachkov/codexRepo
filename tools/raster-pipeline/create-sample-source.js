import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const outputPath = path.resolve("tools/raster-pipeline/input/source.png");
const width = 768;
const height = 1024;
const png = new PNG({ width, height });

const colors = {
  paper: [250, 247, 239],
  ink: [27, 47, 43],
  lavender: [156, 131, 216],
  violet: [112, 78, 196],
  coral: [239, 132, 145],
  yellow: [246, 211, 86],
  teal: [54, 172, 165],
  green: [99, 167, 121],
  leaf: [62, 123, 91],
  pink: [239, 166, 198],
  peach: [246, 179, 132],
};

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const idx = (y * width + x) * 4;
  png.data[idx] = color[0];
  png.data[idx + 1] = color[1];
  png.data[idx + 2] = color[2];
  png.data[idx + 3] = 255;
}

function fill(color) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) setPixel(x, y, color);
  }
}

function ellipse(cx, cy, rx, ry, color, stroke = colors.ink, strokeWidth = 7) {
  const minX = Math.max(0, Math.floor(cx - rx - strokeWidth));
  const maxX = Math.min(width - 1, Math.ceil(cx + rx + strokeWidth));
  const minY = Math.max(0, Math.floor(cy - ry - strokeWidth));
  const maxY = Math.min(height - 1, Math.ceil(cy + ry + strokeWidth));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const d = ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2);
      const outer = ((x - cx) ** 2) / ((rx + strokeWidth) ** 2) + ((y - cy) ** 2) / ((ry + strokeWidth) ** 2);
      if (d <= 1) setPixel(x, y, color);
      else if (outer <= 1) setPixel(x, y, stroke);
    }
  }
}

function rect(x, y, w, h, color, stroke = colors.ink, strokeWidth = 7) {
  for (let yy = y - strokeWidth; yy < y + h + strokeWidth; yy += 1) {
    for (let xx = x - strokeWidth; xx < x + w + strokeWidth; xx += 1) {
      const inside = xx >= x && xx < x + w && yy >= y && yy < y + h;
      const border = xx >= x - strokeWidth && xx < x + w + strokeWidth && yy >= y - strokeWidth && yy < y + h + strokeWidth;
      if (inside) setPixel(xx, yy, color);
      else if (border) setPixel(xx, yy, stroke);
    }
  }
}

function stem(x0, y0, x1, y1, thickness, color = colors.teal) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    ellipse(x, y, thickness, thickness, color, colors.ink, 3);
  }
}

fill(colors.paper);
rect(105, 120, 558, 778, colors.paper, colors.ink, 7);

stem(384, 710, 384, 440, 8);
stem(384, 680, 270, 510, 7);
stem(384, 675, 500, 500, 7);
stem(384, 590, 300, 390, 6);
stem(384, 585, 470, 390, 6);

ellipse(268, 572, 82, 38, colors.green);
ellipse(502, 575, 90, 40, colors.leaf);
ellipse(300, 455, 74, 34, colors.teal);
ellipse(468, 455, 74, 34, colors.green);

ellipse(384, 342, 44, 140, colors.teal);
ellipse(278, 350, 88, 132, colors.violet);
ellipse(490, 350, 88, 132, colors.violet);
ellipse(242, 472, 96, 106, colors.lavender);
ellipse(526, 472, 96, 106, colors.lavender);
ellipse(384, 414, 42, 96, colors.teal);
ellipse(278, 350, 38, 60, colors.yellow);
ellipse(490, 350, 38, 60, colors.yellow);
ellipse(242, 472, 34, 52, colors.coral);
ellipse(526, 472, 34, 52, colors.coral);
ellipse(384, 414, 24, 58, colors.green);

for (const [cx, cy] of [[178, 690], [225, 735], [575, 690], [528, 735]]) {
  ellipse(cx, cy, 50, 74, colors.pink);
  ellipse(cx, cy + 70, 52, 72, colors.peach);
}
ellipse(203, 765, 54, 54, colors.yellow);
ellipse(552, 765, 54, 54, colors.yellow);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, PNG.sync.write(png));
console.log(`Wrote ${outputPath}`);
