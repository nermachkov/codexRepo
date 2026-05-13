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
const minLineArea = Number(args.get("--min-line-area") ?? minLabelArea);
const targetRegions = Number(args.get("--target-regions") ?? 0);
const mergeSimilarColorDistance = Number(args.get("--merge-similar-colors") ?? 0);
const preserveSourceColors = args.get("--preserve-source-colors") === "true";
const lineSource = args.get("--line-source") ?? "region-boundary";
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

function isInkColor(rgb) {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  return luminance(rgb) < inkThreshold && max < 112 && chroma < 42;
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

function findRoot(parents, index) {
  let root = index;
  while (parents[root] !== root) root = parents[root];
  while (parents[index] !== index) {
    const next = parents[index];
    parents[index] = root;
    index = next;
  }
  return root;
}

const playable = new Uint8Array(pixelCount);
const sourceColors = new Array(pixelCount);
const darkCandidates = new Uint8Array(pixelCount);
const lineMask = new Uint8Array(pixelCount);
const samples = [];

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    const rgb = rgbAt(source, x, y);
    sourceColors[pos] = rgb;
    darkCandidates[pos] = isInkColor(rgb) ? 1 : 0;
  }
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    if (!darkCandidates[pos]) continue;

    let touchesNonDark = false;
    for (let oy = -2; oy <= 2 && !touchesNonDark; oy += 1) {
      for (let ox = -2; ox <= 2; ox += 1) {
        if (ox === 0 && oy === 0) continue;
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (!darkCandidates[ny * width + nx] && distanceSq(sourceColors[pos], sourceColors[ny * width + nx]) > 900) {
          touchesNonDark = true;
          break;
        }
      }
    }
    if (touchesNonDark) lineMask[pos] = 1;
  }
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    if (!lineMask[pos]) {
      playable[pos] = 1;
      if ((x + y) % 3 === 0) samples.push(sourceColors[pos]);
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

const colorParents = centers.map((_, index) => index);
if (mergeSimilarColorDistance > 0) {
  const thresholdSq = mergeSimilarColorDistance ** 2;
  for (let i = 0; i < centers.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      if (distanceSq(centers[i], centers[j]) <= thresholdSq) {
        colorParents[findRoot(colorParents, i)] = findRoot(colorParents, j);
        break;
      }
    }
  }
}
const colorRoots = centers.map((_, index) => findRoot(colorParents, index));
const rootNumbers = new Map();
const colorNumberByIndex = colorRoots.map((root) => {
  if (!rootNumbers.has(root)) rootNumbers.set(root, rootNumbers.size + 1);
  return rootNumbers.get(root);
});
const displayColorsByNumber = new Map();
for (let i = 0; i < centers.length; i += 1) {
  const number = colorNumberByIndex[i];
  if (!displayColorsByNumber.has(number)) displayColorsByNumber.set(number, centers[i]);
}

let assignments = new Int16Array(pixelCount).fill(-1);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    if (!playable[pos]) continue;
    const rgb = sourceColors[pos];
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

let filledInkGaps = true;
while (filledInkGaps) {
  filledInkGaps = false;
  const nextAssignments = new Int16Array(assignments);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pos = y * width + x;
      if (assignments[pos] >= 0) continue;

      const counts = new Array(centers.length).fill(0);
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const neighbor = assignments[ny * width + nx];
        if (neighbor >= 0) counts[neighbor] += 1;
      }

      let best = -1;
      let bestCount = 0;
      for (let i = 0; i < counts.length; i += 1) {
        if (counts[i] > bestCount) {
          best = i;
          bestCount = counts[i];
        }
      }
      if (best >= 0) {
        nextAssignments[pos] = best;
        filledInkGaps = true;
      }
    }
  }
  assignments = nextAssignments;
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    if (assignments[pos] >= 0) continue;
    const rgb = sourceColors[pos];
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

function createRegion({ colorIndex, pixels }) {
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;

  for (const pos of pixels) {
    const px = pos % width;
    const py = Math.floor(pos / width);
    sumX += px;
    sumY += py;
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  }

  return {
    colorIndex,
    pixels,
    minX,
    maxX,
    minY,
    maxY,
    sumX,
    sumY,
    active: true,
  };
}

function addRegion({ colorIndex, pixels, minX, maxX, minY, maxY, sumX, sumY, hiddenLabel }) {
  const regionIndex = regions.length;
  for (const pos of pixels) regionMapIds[pos] = regionIndex;
  const labelPosition = chooseLabelPosition({ pixels, sumX, sumY });
  regions.push({
    regionId: `r_${String(regionIndex + 1).padStart(4, "0")}`,
    number: colorNumberByIndex[colorIndex],
    mapColor: hex(mapColorFor(regionIndex)),
    paletteColor: hex(centers[colorIndex]),
    pixelArea: pixels.length,
    bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    labelPositions: [labelPosition],
    hiddenLabel,
  });
}

function chooseLabelPosition({ pixels, sumX, sumY }) {
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

const workingRegions = [];
const workingMapIds = new Int32Array(pixelCount).fill(-1);

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const start = y * width + x;
    const colorIndex = assignments[start];
    if (colorIndex < 0 || visited[start]) continue;

    const queue = [start];
    const pixels = [];
    visited[start] = 1;

    for (let head = 0; head < queue.length; head += 1) {
      const pos = queue[head];
      const px = pos % width;
      const py = Math.floor(pos / width);
      pixels.push(pos);

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

    const regionIndex = workingRegions.length;
    for (const pos of pixels) workingMapIds[pos] = regionIndex;
    workingRegions.push(createRegion({ colorIndex, pixels }));
  }
}

function getNeighborRegionIds(region) {
  const neighborIds = new Set();
  for (const pos of region.pixels) {
    const px = pos % width;
    const py = Math.floor(pos / width);
    for (const [dx, dy] of directions) {
      const nx = px + dx;
      const ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const neighborId = workingMapIds[ny * width + nx];
      if (neighborId >= 0 && neighborId !== workingMapIds[pos] && workingRegions[neighborId]?.active) {
        neighborIds.add(neighborId);
      }
    }
  }
  return [...neighborIds];
}

function chooseMergeTarget(region) {
  const neighbors = getNeighborRegionIds(region);
  if (!neighbors.length) return -1;

  let bestId = neighbors[0];
  let bestScore = Infinity;
  for (const neighborId of neighbors) {
    const neighbor = workingRegions[neighborId];
    const score = distanceSq(centers[region.colorIndex], centers[neighbor.colorIndex]) - Math.min(neighbor.pixels.length, 50000) * 0.002;
    if (score < bestScore) {
      bestId = neighborId;
      bestScore = score;
    }
  }
  return bestId;
}

function mergeRegionInto(sourceId, targetId) {
  const source = workingRegions[sourceId];
  const target = workingRegions[targetId];
  if (!source?.active || !target?.active || sourceId === targetId) return false;

  for (const pos of source.pixels) {
    workingMapIds[pos] = targetId;
    target.pixels.push(pos);
  }
  target.sumX += source.sumX;
  target.sumY += source.sumY;
  target.minX = Math.min(target.minX, source.minX);
  target.maxX = Math.max(target.maxX, source.maxX);
  target.minY = Math.min(target.minY, source.minY);
  target.maxY = Math.max(target.maxY, source.maxY);
  source.active = false;
  source.pixels = [];
  return true;
}

function activeRegionCount() {
  return workingRegions.filter((region) => region.active).length;
}

function mergeRegions() {
  const minimumSize = targetRegions > 0 ? 1 : minPlayableArea;

  let changed = true;
  while (changed) {
    changed = false;
    const smallRegions = workingRegions
      .map((region, id) => ({ region, id }))
      .filter(({ region }) => region.active && region.pixels.length < minimumSize)
      .sort((a, b) => a.region.pixels.length - b.region.pixels.length);

    for (const { region, id } of smallRegions) {
      if (!region.active) continue;
      const targetId = chooseMergeTarget(region);
      if (targetId >= 0 && mergeRegionInto(id, targetId)) changed = true;
    }
  }

  if (targetRegions <= 0) return;

  while (activeRegionCount() > targetRegions) {
    const candidate = workingRegions
      .map((region, id) => ({ region, id }))
      .filter(({ region }) => region.active)
      .sort((a, b) => a.region.pixels.length - b.region.pixels.length)[0];
    if (!candidate) break;
    const targetId = chooseMergeTarget(candidate.region);
    if (targetId < 0 || !mergeRegionInto(candidate.id, targetId)) break;
  }
}

mergeRegions();

for (const region of workingRegions) {
  if (!region.active) continue;
  addRegion({
    colorIndex: region.colorIndex,
    pixels: region.pixels,
    minX: region.minX,
    maxX: region.maxX,
    minY: region.minY,
    maxY: region.maxY,
    sumX: region.sumX,
    sumY: region.sumY,
    hiddenLabel: region.pixels.length < minLabelArea,
  });
}

const usedNumbers = [...new Set(regions.map((region) => region.number))].sort((a, b) => a - b);
const finalNumberByOldNumber = new Map(usedNumbers.map((number, index) => [number, index + 1]));
const finalDisplayColorsByNumber = new Map();
for (const oldNumber of usedNumbers) {
  finalDisplayColorsByNumber.set(finalNumberByOldNumber.get(oldNumber), displayColorsByNumber.get(oldNumber));
}
for (const region of regions) {
  region.number = finalNumberByOldNumber.get(region.number);
  region.paletteColor = hex(finalDisplayColorsByNumber.get(region.number));
}

const colorArt = new PNG({ width, height });
const lineArt = new PNG({ width, height });
const regionMap = new PNG({ width, height });

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    const assigned = assignments[pos];
    const sourceColor = sourceColors[pos];
    const regionIndex = regionMapIds[pos];
    const region = regionIndex >= 0 ? regions[regionIndex] : null;
    setRgb(colorArt, x, y, region && preserveSourceColors ? sourceColor : region ? finalDisplayColorsByNumber.get(region.number) : assigned >= 0 ? centers[assigned] : sourceColor);
    setRgb(lineArt, x, y, [255, 253, 248]);

    setRgb(regionMap, x, y, regionIndex >= 0 ? mapColorFor(regionIndex) : [0, 0, 0]);
  }
}

if (lineSource === "source-ink" || lineSource === "both") {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pos = y * width + x;
      if (lineMask[pos]) setRgb(lineArt, x, y, [35, 48, 44]);
    }
  }
}

if (lineSource === "region-boundary" || lineSource === "both") {
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pos = y * width + x;
      let boundary = false;
      const current = regionMapIds[pos];
      const currentRegion = current >= 0 ? regions[current] : null;
      for (const [dx, dy] of directions) {
        const neighbor = regionMapIds[(y + dy) * width + x + dx];
        const neighborRegion = neighbor >= 0 ? regions[neighbor] : null;
        const hasVisibleCurrent = currentRegion && currentRegion.pixelArea >= minLineArea;
        const hasVisibleNeighbor = neighborRegion && neighborRegion.pixelArea >= minLineArea;
        if (current >= 0 && neighbor >= 0 && current < neighbor && (hasVisibleCurrent || hasVisibleNeighbor)) boundary = true;
        if (current >= 0 && neighbor < 0 && hasVisibleCurrent) boundary = true;
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

const palette = [...finalDisplayColorsByNumber.entries()].map(([number, color]) => ({
  number,
  color: hex(color),
  regionCount: regions.filter((region) => region.number === number).length,
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
  revealMode: preserveSourceColors ? "source-pixels" : "solid-color",
  lineSource,
  sourceRecord: "raster-poc-01",
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "color_art.png"), PNG.sync.write(colorArt));
fs.writeFileSync(path.join(outputDir, "line_art.png"), PNG.sync.write(lineArt));
fs.writeFileSync(path.join(outputDir, "region_map.png"), PNG.sync.write(regionMap));
fs.writeFileSync(path.join(outputDir, "thumbnail.png"), PNG.sync.write(thumbnail));
fs.writeFileSync(path.join(outputDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);

console.log(`Wrote ${regions.length} regions to ${outputDir}`);
