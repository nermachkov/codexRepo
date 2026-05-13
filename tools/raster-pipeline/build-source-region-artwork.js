import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const inputPath = path.resolve(args.get("--input") ?? "tools/raster-pipeline/input/source-tea-garden.png");
const artworkId = args.get("--id") ?? "tea-garden-source";
const title = args.get("--title") ?? "Tea Garden Corner";
const outputDir = path.resolve(args.get("--output") ?? `public/assets/artworks/${artworkId}`);
const paletteSize = Number(args.get("--colors") ?? 96);
const inkThreshold = Number(args.get("--ink-threshold") ?? 128);
const minRegionArea = Number(args.get("--min-region-area") ?? 64);
const minLabelArea = Number(args.get("--min-label-area") ?? 900);
const lineDilate = Number(args.get("--line-dilate") ?? 1);

const source = PNG.sync.read(fs.readFileSync(inputPath));
const { width, height } = source;
const pixelCount = width * height;
const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function pixelOffset(x, y) {
  return (y * width + x) * 4;
}

function rgbAt(png, x, y) {
  const i = pixelOffset(x, y);
  const a = png.data[i + 3] / 255;
  return [
    Math.round(png.data[i] * a + 255 * (1 - a)),
    Math.round(png.data[i + 1] * a + 255 * (1 - a)),
    Math.round(png.data[i + 2] * a + 255 * (1 - a)),
  ];
}

function setRgb(png, x, y, [r, g, b], alpha = 255) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = pixelOffset(x, y);
  png.data[i] = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  png.data[i + 3] = alpha;
}

function luminance([r, g, b]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isInkColor([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  return luminance([r, g, b]) < inkThreshold && max < 150 && chroma < 80;
}

function hex(color) {
  return `#${color.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function distanceSq(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function mapColorFor(regionIndex) {
  const n = regionIndex + 1;
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255];
}

const sourceColors = new Array(pixelCount);
const darkCandidates = new Uint8Array(pixelCount);
const inkMask = new Uint8Array(pixelCount);

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    const rgb = rgbAt(source, x, y);
    sourceColors[pos] = rgb;
    if (isInkColor(rgb)) darkCandidates[pos] = 1;
  }
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    if (!darkCandidates[pos]) continue;

    let darkNeighborCount = 0;
    let touchesContrastingColor = false;
    for (let oy = -2; oy <= 2; oy += 1) {
      for (let ox = -2; ox <= 2; ox += 1) {
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const neighbor = ny * width + nx;
        if (darkCandidates[neighbor]) darkNeighborCount += 1;
        if (!darkCandidates[neighbor]) {
          const [r1, g1, b1] = sourceColors[pos];
          const [r2, g2, b2] = sourceColors[neighbor];
          const distance = (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
          if (distance > 1200) touchesContrastingColor = true;
        }
      }
    }

    if (touchesContrastingColor && darkNeighborCount <= 18) inkMask[pos] = 1;
  }
}

if (lineDilate > 0) {
  const dilated = new Uint8Array(inkMask);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pos = y * width + x;
      if (!inkMask[pos]) continue;
      for (let oy = -lineDilate; oy <= lineDilate; oy += 1) {
        for (let ox = -lineDilate; ox <= lineDilate; ox += 1) {
          if (Math.hypot(ox, oy) <= lineDilate) {
            const nx = x + ox;
            const ny = y + oy;
            if (nx >= 0 && ny >= 0 && nx < width && ny < height) dilated[ny * width + nx] = 1;
          }
        }
      }
    }
  }
  inkMask.set(dilated);
}

const samples = [];
for (let pos = 0; pos < pixelCount; pos += 1) {
  if (!inkMask[pos] && pos % 3 === 0) samples.push(sourceColors[pos]);
}
if (!samples.length) throw new Error(`No non-ink pixels found in ${inputPath}`);

const buckets = new Map();
for (const rgb of samples) {
  const key = `${rgb[0] >> 3},${rgb[1] >> 3},${rgb[2] >> 3}`;
  const bucket = buckets.get(key) ?? { count: 0, sum: [0, 0, 0] };
  bucket.count += 1;
  bucket.sum[0] += rgb[0];
  bucket.sum[1] += rgb[1];
  bucket.sum[2] += rgb[2];
  buckets.set(key, bucket);
}

let centers = [...buckets.values()]
  .sort((a, b) => b.count - a.count)
  .slice(0, paletteSize)
  .map((bucket) => bucket.sum.map((value) => Math.round(value / bucket.count)));

while (centers.length < paletteSize) centers.push(samples[centers.length % samples.length]);

for (let iteration = 0; iteration < 10; iteration += 1) {
  const sums = centers.map(() => [0, 0, 0, 0]);
  for (const rgb of samples) {
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < centers.length; i += 1) {
      const distance = distanceSq(rgb, centers[i]);
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    }
    sums[best][0] += rgb[0];
    sums[best][1] += rgb[1];
    sums[best][2] += rgb[2];
    sums[best][3] += 1;
  }
  centers = centers.map((center, i) => {
    const count = sums[i][3];
    if (!count) return center;
    return [Math.round(sums[i][0] / count), Math.round(sums[i][1] / count), Math.round(sums[i][2] / count)];
  });
}

const assignments = new Int16Array(pixelCount).fill(-1);
for (let pos = 0; pos < pixelCount; pos += 1) {
  if (inkMask[pos]) continue;
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < centers.length; i += 1) {
    const distance = distanceSq(sourceColors[pos], centers[i]);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  assignments[pos] = best;
}

const visited = new Uint8Array(pixelCount);
const regionMapIds = new Int32Array(pixelCount).fill(-1);
const regions = [];

function chooseLabelPosition(pixels, sumX, sumY) {
  const targetX = sumX / pixels.length;
  const targetY = sumY / pixels.length;
  let best = pixels[0];
  let bestDistance = Infinity;

  for (const pos of pixels) {
    const px = pos % width;
    const py = Math.floor(pos / width);
    const distance = (px - targetX) ** 2 + (py - targetY) ** 2;
    if (distance < bestDistance) {
      best = pos;
      bestDistance = distance;
    }
  }

  return { x: best % width, y: Math.floor(best / width) };
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const start = y * width + x;
    const startColor = assignments[start];
    if (startColor < 0 || visited[start]) continue;

    const queue = [start];
    const pixels = [];
    visited[start] = 1;

    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;
    let sumX = 0;
    let sumY = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    for (let head = 0; head < queue.length; head += 1) {
      const pos = queue[head];
      const px = pos % width;
      const py = Math.floor(pos / width);

      pixels.push(pos);
      sumX += px;
      sumY += py;
      sumR += centers[startColor][0];
      sumG += centers[startColor][1];
      sumB += centers[startColor][2];
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);

      for (const [dx, dy] of directions) {
        const nx = px + dx;
        const ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (!visited[next] && assignments[next] === startColor) {
          visited[next] = 1;
          queue.push(next);
        }
      }
    }

    if (pixels.length < minRegionArea) {
      for (const pos of pixels) visited[pos] = 1;
      continue;
    }

    const regionIndex = regions.length;
    const averageColor = [
      Math.round(sumR / pixels.length),
      Math.round(sumG / pixels.length),
      Math.round(sumB / pixels.length),
    ];
    for (const pos of pixels) regionMapIds[pos] = regionIndex;
    regions.push({
      regionId: `r_${String(regionIndex + 1).padStart(4, "0")}`,
      number: startColor + 1,
      mapColor: hex(mapColorFor(regionIndex)),
      paletteColor: hex(averageColor),
      pixelArea: pixels.length,
      bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
      labelPositions: [chooseLabelPosition(pixels, sumX, sumY)],
      hiddenLabel: pixels.length < minLabelArea,
    });
  }
}

const colorArt = new PNG({ width, height });
const lineArt = new PNG({ width, height });
const regionMap = new PNG({ width, height });

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    const regionIndex = regionMapIds[pos];
    const region = regionIndex >= 0 ? regions[regionIndex] : null;
    setRgb(colorArt, x, y, region ? centers[region.number - 1] : sourceColors[pos]);
    setRgb(lineArt, x, y, inkMask[pos] ? [28, 42, 36] : [255, 253, 248]);
    setRgb(regionMap, x, y, regionIndex >= 0 ? mapColorFor(regionIndex) : [0, 0, 0]);
  }
}

const thumbSize = 256;
const thumbnail = new PNG({ width: thumbSize, height: thumbSize });
for (let y = 0; y < thumbSize; y += 1) {
  for (let x = 0; x < thumbSize; x += 1) {
    const sx = Math.floor((x / thumbSize) * width);
    const sy = Math.floor((y / thumbSize) * height);
    const sourceIndex = pixelOffset(sx, sy);
    const targetIndex = (y * thumbSize + x) * 4;
    thumbnail.data[targetIndex] = colorArt.data[sourceIndex];
    thumbnail.data[targetIndex + 1] = colorArt.data[sourceIndex + 1];
    thumbnail.data[targetIndex + 2] = colorArt.data[sourceIndex + 2];
    thumbnail.data[targetIndex + 3] = 255;
  }
}

const usedNumbers = [...new Set(regions.map((region) => region.number))].sort((a, b) => a - b);
const finalNumberByOldNumber = new Map(usedNumbers.map((number, index) => [number, index + 1]));
for (const region of regions) {
  region.number = finalNumberByOldNumber.get(region.number);
  region.paletteColor = hex(centers[usedNumbers[region.number - 1] - 1]);
}

const palette = usedNumbers.map((oldNumber, index) => {
  const number = index + 1;
  return {
    number,
    color: hex(centers[oldNumber - 1]),
    regionCount: regions.filter((region) => region.number === number).length,
  };
});

const metadata = {
  id: artworkId,
  title,
  category: "garden",
  difficulty: "source",
  width,
  height,
  assets: {
    colorArt: "color_art.png",
    lineArt: "line_art.png",
    regionMap: "region_map.png",
    thumbnail: "thumbnail.png",
  },
  palette,
  regions: regions.map(({ pixels, ...region }) => region),
  revealMode: "solid-color",
  regionMode: "source-ink-color-components",
  lineSource: "source-ink",
  sourceColorMode: "quantized-source",
  sourceRecord: "tea-garden-50",
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "color_art.png"), PNG.sync.write(colorArt));
fs.writeFileSync(path.join(outputDir, "line_art.png"), PNG.sync.write(lineArt));
fs.writeFileSync(path.join(outputDir, "region_map.png"), PNG.sync.write(regionMap));
fs.writeFileSync(path.join(outputDir, "thumbnail.png"), PNG.sync.write(thumbnail));
fs.writeFileSync(path.join(outputDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);

console.log(`Wrote ${regions.length} source regions to ${outputDir}`);
