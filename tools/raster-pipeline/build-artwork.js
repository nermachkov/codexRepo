import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const inputPath = path.resolve(args.get("--input") ?? "tools/raster-pipeline/input/source.png");
const artworkId = args.get("--id") ?? "raster-poc-01";
const title = args.get("--title") ?? "Raster POC 01";
const outputDir = path.resolve(args.get("--output") ?? `public/assets/artworks/${artworkId}`);
const paletteSize = Number(args.get("--colors") ?? 12);
const minRegionArea = Number(args.get("--min-area") ?? 450);
const minPlayableArea = Number(args.get("--min-playable-area") ?? 80);
const minLabelArea = Number(args.get("--min-label-area") ?? minPlayableArea);
const lineStep = Number(args.get("--line-step") ?? 2);
const smoothPasses = Number(args.get("--smooth") ?? 3);
const inkThreshold = Number(args.get("--ink-threshold") ?? 58);

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

function distanceSq(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function hex(color) {
  return `#${color.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function mapColorFor(regionIndex) {
  const n = regionIndex + 1;
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255];
}

const playable = new Uint8Array(pixelCount);
const samples = [];

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    const rgb = rgbAt(source, x, y);
    const white = rgb[0] > 248 && rgb[1] > 248 && rgb[2] > 248;
    const ink = luminance(rgb) < inkThreshold;
    if (!white && !ink) {
      playable[pos] = 1;
      if ((x + y) % 3 === 0) samples.push(rgb);
    }
  }
}

if (!samples.length) throw new Error(`No playable pixels found in ${inputPath}`);

const buckets = new Map();
for (const rgb of samples) {
  const key = `${rgb[0] >> 4},${rgb[1] >> 4},${rgb[2] >> 4}`;
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

for (let iteration = 0; iteration < 8; iteration += 1) {
  const sums = centers.map(() => [0, 0, 0, 0]);
  for (const rgb of samples) {
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < centers.length; i += 1) {
      const d = distanceSq(rgb, centers[i]);
      if (d < bestDistance) {
        best = i;
        bestDistance = d;
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

let assignments = new Int16Array(pixelCount).fill(-1);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    if (!playable[pos]) continue;
    const rgb = rgbAt(source, x, y);
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < centers.length; i += 1) {
      const d = distanceSq(rgb, centers[i]);
      if (d < bestDistance) {
        best = i;
        bestDistance = d;
      }
    }
    assignments[pos] = best;
  }
}

for (let pass = 0; pass < smoothPasses; pass += 1) {
  const nextAssignments = new Int16Array(assignments);
  for (let y = 2; y < height - 2; y += 1) {
    for (let x = 2; x < width - 2; x += 1) {
      const pos = y * width + x;
      if (assignments[pos] < 0) continue;

      const counts = new Array(centers.length).fill(0);
      for (let oy = -2; oy <= 2; oy += 1) {
        for (let ox = -2; ox <= 2; ox += 1) {
          const neighbor = assignments[(y + oy) * width + x + ox];
          if (neighbor >= 0) counts[neighbor] += 1;
        }
      }

      let best = assignments[pos];
      let bestCount = counts[best];
      for (let i = 0; i < counts.length; i += 1) {
        if (counts[i] > bestCount) {
          best = i;
          bestCount = counts[i];
        }
      }
      if (bestCount >= 8) nextAssignments[pos] = best;
    }
  }
  assignments = nextAssignments;
}

const visited = new Uint8Array(pixelCount);
const regionMapIds = new Int32Array(pixelCount).fill(-1);
const regions = [];

function addRegion({ colorIndex, pixels, minX, maxX, minY, maxY, sumX, sumY, hiddenLabel }) {
  const regionIndex = regions.length;
  for (const pos of pixels) regionMapIds[pos] = regionIndex;
  regions.push({
    regionId: `r_${String(regionIndex + 1).padStart(4, "0")}`,
    number: colorIndex + 1,
    mapColor: hex(mapColorFor(regionIndex)),
    paletteColor: hex(centers[colorIndex]),
    pixelArea: pixels.length,
    bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    labelPositions: [{ x: Math.round(sumX / pixels.length), y: Math.round(sumY / pixels.length) }],
    hiddenLabel,
  });
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const start = y * width + x;
    const colorIndex = assignments[start];
    if (colorIndex < 0 || visited[start]) continue;

    const queue = [start];
    const pixels = [];
    visited[start] = 1;
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;
    let sumX = 0;
    let sumY = 0;

    for (let head = 0; head < queue.length; head += 1) {
      const pos = queue[head];
      const px = pos % width;
      const py = Math.floor(pos / width);
      pixels.push(pos);
      sumX += px;
      sumY += py;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);

      for (const [dx, dy] of directions) {
        const nx = px + dx;
        const ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (!visited[next] && assignments[next] === colorIndex) {
          visited[next] = 1;
          queue.push(next);
        }
      }
    }

    if (pixels.length < minPlayableArea) continue;

    addRegion({
      colorIndex,
      pixels,
      minX,
      maxX,
      minY,
      maxY,
      sumX,
      sumY,
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
    const assigned = assignments[pos];
    const sourceColor = rgbAt(source, x, y);
    setRgb(colorArt, x, y, assigned >= 0 ? centers[assigned] : sourceColor);
    setRgb(lineArt, x, y, [255, 253, 248]);

    const regionIndex = regionMapIds[pos];
    setRgb(regionMap, x, y, regionIndex >= 0 ? mapColorFor(regionIndex) : [0, 0, 0]);
  }
}

for (let y = 1; y < height - 1; y += 1) {
  for (let x = 1; x < width - 1; x += 1) {
    const pos = y * width + x;
    let boundary = false;
    const current = regionMapIds[pos];
    for (const [dx, dy] of directions) {
      const neighbor = regionMapIds[(y + dy) * width + x + dx];
      if (current >= 0 && neighbor >= 0 && current < neighbor) boundary = true;
      if (current >= 0 && neighbor < 0) boundary = true;
    }
    if (boundary) {
      for (let oy = -lineStep; oy <= lineStep; oy += 1) {
        for (let ox = -lineStep; ox <= lineStep; ox += 1) {
          if (Math.hypot(ox, oy) <= lineStep) setRgb(lineArt, x + ox, y + oy, [35, 48, 44]);
        }
      }
    }
  }
}

const thumbSize = 256;
const thumbnail = new PNG({ width: thumbSize, height: thumbSize });
for (let y = 0; y < thumbSize; y += 1) {
  for (let x = 0; x < thumbSize; x += 1) {
    const sx = Math.floor((x / thumbSize) * width);
    const sy = Math.floor((y / thumbSize) * height);
    const targetIndex = (y * thumbSize + x) * 4;
    const sourceIndex = pixelOffset(sx, sy);
    thumbnail.data[targetIndex] = colorArt.data[sourceIndex];
    thumbnail.data[targetIndex + 1] = colorArt.data[sourceIndex + 1];
    thumbnail.data[targetIndex + 2] = colorArt.data[sourceIndex + 2];
    thumbnail.data[targetIndex + 3] = 255;
  }
}

const palette = centers.map((color, index) => ({
  number: index + 1,
  color: hex(color),
  regionCount: regions.filter((region) => region.number === index + 1).length,
}));

const metadata = {
  id: artworkId,
  title,
  category: "botanical",
  difficulty: "poc",
  width,
  height,
  assets: {
    colorArt: "color_art.png",
    lineArt: "line_art.png",
    regionMap: "region_map.png",
    thumbnail: "thumbnail.png",
  },
  palette,
  regions,
  sourceRecord: "raster-poc-01",
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "color_art.png"), PNG.sync.write(colorArt));
fs.writeFileSync(path.join(outputDir, "line_art.png"), PNG.sync.write(lineArt));
fs.writeFileSync(path.join(outputDir, "region_map.png"), PNG.sync.write(regionMap));
fs.writeFileSync(path.join(outputDir, "thumbnail.png"), PNG.sync.write(thumbnail));
fs.writeFileSync(path.join(outputDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);

console.log(`Wrote ${regions.length} regions to ${outputDir}`);
