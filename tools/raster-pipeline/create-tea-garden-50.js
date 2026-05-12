import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const width = 1000;
const height = 1000;
const artworkId = "tea-garden-50";
const outputDir = path.resolve(`public/assets/artworks/${artworkId}`);
const sourcePath = path.resolve("tools/raster-pipeline/input/source-tea-garden.png");

const palette = [
  { number: 1, color: "#f6e4c7" },
  { number: 2, color: "#deb98b" },
  { number: 3, color: "#c87453" },
  { number: 4, color: "#9c7a4d" },
  { number: 5, color: "#6c7a58" },
  { number: 6, color: "#9da36f" },
  { number: 7, color: "#c6b47c" },
  { number: 8, color: "#7f8c7c" },
  { number: 9, color: "#d99175" },
  { number: 10, color: "#56624f" },
  { number: 11, color: "#b58b63" },
  { number: 12, color: "#e8cf9e" },
];

const regionIds = new Int16Array(width * height).fill(0);
const regions = [
  { id: 1, number: 1, name: "wall", shape: rect(0, 0, width, height) },
  { id: 2, number: 2, name: "floor-left", shape: polygon([[0, 720], [390, 660], [500, 1000], [0, 1000]]) },
  { id: 3, number: 12, name: "floor-right", shape: polygon([[390, 660], [1000, 720], [1000, 1000], [500, 1000]]) },
  { id: 4, number: 8, name: "window-glass", shape: rect(645, 65, 280, 230) },
  { id: 5, number: 2, name: "window-frame-left", shape: rect(630, 50, 18, 265) },
  { id: 6, number: 2, name: "window-frame-mid", shape: rect(770, 50, 16, 265) },
  { id: 7, number: 2, name: "window-frame-right", shape: rect(925, 50, 18, 265) },
  { id: 8, number: 2, name: "window-sill", shape: polygon([[610, 315], [960, 315], [990, 360], [575, 360]]) },
  { id: 9, number: 11, name: "back-pot", shape: ellipse(790, 235, 72, 58) },
  { id: 10, number: 3, name: "back-pot-body", shape: polygon([[725, 235], [855, 235], [830, 335], [750, 335]]) },
  { id: 11, number: 6, name: "back-leaf-1", shape: ellipse(700, 170, 58, 34, -0.55) },
  { id: 12, number: 6, name: "back-leaf-2", shape: ellipse(765, 145, 65, 36, 0.15) },
  { id: 13, number: 5, name: "back-leaf-3", shape: ellipse(835, 160, 56, 34, 0.6) },
  { id: 14, number: 7, name: "back-leaf-4", shape: ellipse(735, 210, 54, 32, 0.3) },
  { id: 15, number: 6, name: "back-leaf-5", shape: ellipse(820, 220, 58, 32, -0.25) },
  { id: 16, number: 10, name: "window-trees-1", shape: ellipse(910, 140, 75, 96) },
  { id: 17, number: 5, name: "window-trees-2", shape: ellipse(865, 220, 85, 72) },
  { id: 18, number: 2, name: "table-top", shape: ellipse(545, 555, 265, 95) },
  { id: 19, number: 4, name: "table-edge", shape: polygon([[285, 555], [805, 555], [760, 610], [330, 610]]) },
  { id: 20, number: 10, name: "table-leg-left", shape: polygon([[430, 605], [455, 605], [410, 900], [385, 900]]) },
  { id: 21, number: 10, name: "table-leg-right", shape: polygon([[645, 605], [670, 605], [735, 900], [710, 900]]) },
  { id: 22, number: 8, name: "table-ring", shape: ellipse(555, 785, 110, 44) },
  { id: 23, number: 1, name: "cup-body", shape: polygon([[455, 468], [570, 468], [552, 560], [475, 560]]) },
  { id: 24, number: 12, name: "cup-tea", shape: ellipse(512, 470, 58, 18) },
  { id: 25, number: 3, name: "cup-band", shape: polygon([[470, 520], [558, 520], [552, 548], [477, 548]]) },
  { id: 26, number: 1, name: "cup-handle", shape: ellipse(575, 515, 34, 44) },
  { id: 27, number: 1, name: "saucer", shape: ellipse(515, 585, 112, 28) },
  { id: 28, number: 7, name: "saucer-shadow", shape: ellipse(515, 600, 78, 16) },
  { id: 29, number: 6, name: "teapot-body", shape: ellipse(685, 505, 96, 76) },
  { id: 30, number: 5, name: "teapot-lid", shape: ellipse(685, 430, 56, 25) },
  { id: 31, number: 6, name: "teapot-top", shape: rect(650, 438, 72, 55) },
  { id: 32, number: 6, name: "teapot-spout", shape: polygon([[605, 480], [560, 450], [575, 520], [615, 515]]) },
  { id: 33, number: 6, name: "teapot-handle", shape: ellipse(760, 505, 48, 62) },
  { id: 34, number: 11, name: "chair-back", shape: polygon([[815, 520], [965, 435], [965, 680], [835, 655]]) },
  { id: 35, number: 9, name: "chair-cushion", shape: polygon([[760, 720], [980, 675], [1000, 860], [800, 915]]) },
  { id: 36, number: 10, name: "chair-leg-1", shape: polygon([[835, 880], [860, 880], [835, 1000], [810, 1000]]) },
  { id: 37, number: 10, name: "chair-leg-2", shape: polygon([[945, 850], [970, 850], [1000, 985], [980, 1000]]) },
  { id: 38, number: 3, name: "front-pot", shape: polygon([[70, 560], [270, 560], [245, 850], [95, 850]]) },
  { id: 39, number: 4, name: "front-pot-soil", shape: ellipse(170, 555, 105, 35) },
  { id: 40, number: 4, name: "front-pot-rim", shape: polygon([[55, 525], [285, 525], [265, 575], [75, 575]]) },
  { id: 41, number: 5, name: "front-leaf-1", shape: ellipse(88, 340, 120, 48, -1.05) },
  { id: 42, number: 6, name: "front-leaf-2", shape: ellipse(180, 310, 120, 48, -0.25) },
  { id: 43, number: 5, name: "front-leaf-3", shape: ellipse(280, 350, 118, 46, 0.45) },
  { id: 44, number: 6, name: "front-leaf-4", shape: ellipse(140, 445, 115, 45, 0.2) },
  { id: 45, number: 7, name: "front-leaf-5", shape: ellipse(260, 455, 112, 44, -0.55) },
  { id: 46, number: 5, name: "front-leaf-6", shape: ellipse(120, 220, 130, 48, -0.75) },
  { id: 47, number: 6, name: "front-leaf-7", shape: ellipse(260, 210, 120, 45, 0.25) },
  { id: 48, number: 8, name: "floor-stone-1", shape: polygon([[300, 775], [430, 730], [505, 820], [390, 895]]) },
  { id: 49, number: 7, name: "floor-stone-2", shape: polygon([[525, 815], [650, 760], [735, 840], [640, 940], [530, 920]]) },
  { id: 50, number: 4, name: "floor-stone-3", shape: polygon([[165, 855], [300, 850], [350, 1000], [155, 1000]]) },
];

function rect(x, y, w, h) {
  return (px, py) => px >= x && px < x + w && py >= y && py < y + h;
}

function ellipse(cx, cy, rx, ry, rotation = 0) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return (px, py) => {
    const dx = px - cx;
    const dy = py - cy;
    const x = dx * cos + dy * sin;
    const y = -dx * sin + dy * cos;
    return (x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1;
  };
}

function polygon(points) {
  return (px, py) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i];
      const [xj, yj] = points[j];
      const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };
}

function hexToRgb(value) {
  const hex = value.replace("#", "");
  return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)];
}

function mapColorFor(regionIndex) {
  const n = regionIndex + 1;
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255];
}

function setRgb(png, x, y, [r, g, b], alpha = 255) {
  const i = (y * width + x) * 4;
  png.data[i] = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  png.data[i + 3] = alpha;
}

for (const region of [...regions].reverse()) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pos = y * width + x;
      if (!regionIds[pos] && region.shape(x, y)) regionIds[pos] = region.id;
    }
  }
}

for (let i = 0; i < regionIds.length; i += 1) {
  if (!regionIds[i]) regionIds[i] = 1;
}

cleanupDisconnectedFragments();

function cleanupDisconnectedFragments() {
  let changed = true;
  while (changed) {
    changed = false;
    for (const region of regions) {
      const components = getComponentsForRegion(region.id);
      if (components.length <= 1) continue;

      components.sort((a, b) => b.length - a.length);
      for (const fragment of components.slice(1)) {
        const targetId = chooseNeighborForFragment(fragment, region.id);
        if (!targetId) continue;
        for (const pos of fragment) regionIds[pos] = targetId;
        changed = true;
      }
    }
  }
}

function getComponentsForRegion(regionId) {
  const seen = new Uint8Array(width * height);
  const components = [];

  for (let start = 0; start < regionIds.length; start += 1) {
    if (seen[start] || regionIds[start] !== regionId) continue;
    const stack = [start];
    const component = [];
    seen[start] = 1;

    for (let head = 0; head < stack.length; head += 1) {
      const pos = stack[head];
      const x = pos % width;
      const y = Math.floor(pos / width);
      component.push(pos);

      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        const next = ny * width + nx;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height || seen[next] || regionIds[next] !== regionId) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }

    components.push(component);
  }

  return components;
}

function chooseNeighborForFragment(fragment, sourceId) {
  const contacts = new Map();
  for (const pos of fragment) {
    const x = pos % width;
    const y = Math.floor(pos / width);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const neighborId = regionIds[ny * width + nx];
      if (!neighborId || neighborId === sourceId) continue;
      contacts.set(neighborId, (contacts.get(neighborId) ?? 0) + 1);
    }
  }

  return [...contacts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
}

const colorArt = new PNG({ width, height });
const lineArt = new PNG({ width, height });
const regionMap = new PNG({ width, height });
const source = new PNG({ width, height });
const paletteByNumber = new Map(palette.map((item) => [item.number, hexToRgb(item.color)]));
const regionRecords = [];

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const region = regions[regionIds[y * width + x] - 1];
    const color = paletteByNumber.get(region.number);
    setRgb(colorArt, x, y, color);
    setRgb(source, x, y, color);
    setRgb(lineArt, x, y, [255, 253, 248]);
    setRgb(regionMap, x, y, mapColorFor(region.id - 1));
  }
}

for (let y = 1; y < height - 1; y += 1) {
  for (let x = 1; x < width - 1; x += 1) {
    const id = regionIds[y * width + x];
    const boundary = regionIds[y * width + x - 1] !== id || regionIds[y * width + x + 1] !== id || regionIds[(y - 1) * width + x] !== id || regionIds[(y + 1) * width + x] !== id;
    if (boundary) {
      setRgb(lineArt, x, y, [35, 48, 44]);
      setRgb(source, x, y, [35, 48, 44]);
    }
  }
}

for (const region of regions) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (regionIds[y * width + x] !== region.id) continue;
      count += 1;
      sumX += x;
      sumY += y;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  const label = chooseLabel(region.id, sumX / count, sumY / count);
  regionRecords.push({
    regionId: `r_${String(region.id).padStart(4, "0")}`,
    number: region.number,
    mapColor: rgbToHex(mapColorFor(region.id - 1)),
    paletteColor: palette.find((item) => item.number === region.number).color,
    pixelArea: count,
    bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    labelPositions: [label],
    hiddenLabel: count < 900,
  });
}

function chooseLabel(regionId, targetX, targetY) {
  let best = { x: 0, y: 0 };
  let bestDistance = Infinity;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (regionIds[y * width + x] !== regionId) continue;
      const distance = (x - targetX) ** 2 + (y - targetY) ** 2;
      if (distance < bestDistance) {
        best = { x, y };
        bestDistance = distance;
      }
    }
  }
  return best;
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

const thumbSize = 256;
const thumbnail = new PNG({ width: thumbSize, height: thumbSize });
for (let y = 0; y < thumbSize; y += 1) {
  for (let x = 0; x < thumbSize; x += 1) {
    const sx = Math.floor((x / thumbSize) * width);
    const sy = Math.floor((y / thumbSize) * height);
    const sourceIndex = (sy * width + sx) * 4;
    const targetIndex = (y * thumbSize + x) * 4;
    thumbnail.data[targetIndex] = colorArt.data[sourceIndex];
    thumbnail.data[targetIndex + 1] = colorArt.data[sourceIndex + 1];
    thumbnail.data[targetIndex + 2] = colorArt.data[sourceIndex + 2];
    thumbnail.data[targetIndex + 3] = 255;
  }
}

const metadata = {
  id: artworkId,
  title: "Tea Garden Corner",
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
  palette: palette.map((item) => ({
    ...item,
    regionCount: regionRecords.filter((region) => region.number === item.number).length,
  })),
  regions: regionRecords,
  sourceRecord: "tea-garden-50",
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "color_art.png"), PNG.sync.write(colorArt));
fs.writeFileSync(path.join(outputDir, "line_art.png"), PNG.sync.write(lineArt));
fs.writeFileSync(path.join(outputDir, "region_map.png"), PNG.sync.write(regionMap));
fs.writeFileSync(path.join(outputDir, "thumbnail.png"), PNG.sync.write(thumbnail));
fs.writeFileSync(path.join(outputDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
fs.writeFileSync(sourcePath, PNG.sync.write(source));
console.log(`Wrote ${regionRecords.length} simple regions to ${outputDir}`);
