import { artworkManifests } from "./artworks.js?v=20260511-raster-canvas";

const galleryView = document.querySelector("#gallery-view");
const studioView = document.querySelector("#studio-view");
const completionView = document.querySelector("#completion-view");
const galleryGrid = document.querySelector("#gallery-grid");
const artboard = document.querySelector("#artboard");
const palette = document.querySelector("#palette");
const artworkTitle = document.querySelector("#artwork-title");
const artworkCategory = document.querySelector("#artwork-category");
const progressText = document.querySelector("#progress-text");
const remainingText = document.querySelector("#remaining-text");
const progressBar = document.querySelector("#progress-bar");
const paletteHint = document.querySelector("#palette-hint");
const completionTitle = document.querySelector("#completion-title");

const storageKey = "calmColorProgressRaster";
const mapColorToRegion = new Map();
const state = {
  artworks: [],
  currentArtwork: null,
  selectedNumber: null,
  progress: loadProgress(),
  zoom: 1,
  panX: 0,
  panY: 0,
  drag: null,
  pointers: new Map(),
  pinch: null,
  wrongRegionId: null,
  assets: null,
};

document.querySelector("#back-button").addEventListener("click", showGallery);
document.querySelector("#continue-button").addEventListener("click", showGallery);
document.querySelector("#replay-button").addEventListener("click", () => {
  completionView.hidden = true;
  resetCurrentArtwork(false);
});
document.querySelector("#reset-all-button").addEventListener("click", () => {
  if (!confirm("Reset progress for all artworks?")) return;
  state.progress = {};
  saveProgress();
  renderGallery();
});
document.querySelector("#reset-artwork-button").addEventListener("click", resetCurrentArtwork);
document.querySelector("#zoom-reset-button").addEventListener("click", () => {
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  updateTransform();
});

init();

async function init() {
  state.artworks = await Promise.all(artworkManifests.map(loadArtwork));
  state.progress = normalizeProgress(state.progress);
  renderGallery();
}

async function loadArtwork(manifest) {
  const response = await fetch(`${manifest.basePath}/metadata.json`);
  if (!response.ok) throw new Error(`Cannot load ${manifest.id}`);
  const metadata = await response.json();
  return {
    ...manifest,
    ...metadata,
    title: manifest.title,
    category: manifest.category,
    difficulty: manifest.difficulty,
    thumbnail: `${manifest.basePath}/${metadata.assets.thumbnail}`,
    colorArt: `${manifest.basePath}/${metadata.assets.colorArt}`,
    lineArt: `${manifest.basePath}/${metadata.assets.lineArt}`,
    regionMap: `${manifest.basePath}/${metadata.assets.regionMap}`,
  };
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function normalizeProgress(savedProgress) {
  if (!savedProgress || typeof savedProgress !== "object" || Array.isArray(savedProgress)) return {};

  return state.artworks.reduce((cleanProgress, artwork) => {
    const savedIds = Array.isArray(savedProgress[artwork.id]) ? savedProgress[artwork.id] : [];
    const validIds = new Set(artwork.regions.map((region) => region.regionId));
    const cleanIds = [...new Set(savedIds)].filter((regionId) => validIds.has(regionId));
    if (cleanIds.length > 0) cleanProgress[artwork.id] = cleanIds;
    return cleanProgress;
  }, {});
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state.progress));
  } catch {
    // Storage can be blocked; the session remains playable.
  }
}

function renderGallery() {
  galleryGrid.innerHTML = state.artworks
    .map((artwork) => {
      const filled = getFilledSet(artwork.id).size;
      const total = artwork.regions.length;
      const percent = Math.round((filled / total) * 100);
      const complete = filled === total;
      return `
        <article class="art-card" data-complete="${complete}">
          <button type="button" data-artwork-id="${artwork.id}" aria-label="Open ${artwork.title}">
            <div class="thumb"><img src="${artwork.thumbnail}" alt=""></div>
            <div class="card-copy">
              <div class="card-meta">
                <span>${artwork.category}</span>
                <span>${artwork.difficulty}</span>
              </div>
              <div class="card-title">${artwork.title}</div>
              <p class="card-progress">${complete ? "Complete" : `${percent}% complete`}</p>
            </div>
          </button>
        </article>
      `;
    })
    .join("");

  galleryGrid.querySelectorAll("[data-artwork-id]").forEach((button) => {
    button.addEventListener("click", () => openArtwork(button.dataset.artworkId));
  });
}

async function openArtwork(artworkId) {
  const artwork = state.artworks.find((item) => item.id === artworkId);
  if (!artwork) return;

  state.currentArtwork = artwork;
  state.selectedNumber = artwork.palette.find((item) => item.regionCount > 0)?.number ?? artwork.palette[0].number;
  state.wrongRegionId = null;
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  state.pointers.clear();
  state.pinch = null;
  state.assets = null;

  artworkTitle.textContent = artwork.title;
  artworkCategory.textContent = `${artwork.category} / ${artwork.difficulty}`;
  galleryView.hidden = true;
  studioView.hidden = false;
  completionView.hidden = true;
  artboard.innerHTML = `<div class="loading-state">Loading artwork...</div>`;

  state.assets = await loadRuntimeAssets(artwork);
  renderStudio();
}

function showGallery() {
  completionView.hidden = true;
  studioView.hidden = true;
  galleryView.hidden = false;
  renderGallery();
}

async function loadRuntimeAssets(artwork) {
  const [colorImage, lineImage, regionImage] = await Promise.all([
    loadImage(artwork.colorArt),
    loadImage(artwork.lineArt),
    loadImage(artwork.regionMap),
  ]);

  const mapCanvas = document.createElement("canvas");
  mapCanvas.width = artwork.width;
  mapCanvas.height = artwork.height;
  const mapContext = mapCanvas.getContext("2d", { willReadFrequently: true });
  mapContext.drawImage(regionImage, 0, 0);
  const mapData = mapContext.getImageData(0, 0, artwork.width, artwork.height);

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = artwork.width;
  colorCanvas.height = artwork.height;
  const colorContext = colorCanvas.getContext("2d", { willReadFrequently: true });
  colorContext.drawImage(colorImage, 0, 0);
  const colorData = colorContext.getImageData(0, 0, artwork.width, artwork.height);

  const revealCanvas = document.createElement("canvas");
  revealCanvas.width = artwork.width;
  revealCanvas.height = artwork.height;

  mapColorToRegion.clear();
  artwork.regions.forEach((region) => {
    mapColorToRegion.set(normalizeHex(region.mapColor), region);
  });

  return {
    colorImage,
    lineImage,
    mapData,
    colorData,
    revealCanvas,
    revealContext: revealCanvas.getContext("2d"),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Cannot load ${src}`));
    image.src = src;
  });
}

function renderStudio() {
  const artwork = state.currentArtwork;
  const assets = state.assets;
  if (!artwork || !assets) return;

  const filled = getFilledSet(artwork.id);
  const selectedColor = artwork.palette.find((item) => item.number === state.selectedNumber)?.color;
  artboard.style.setProperty("--selected-color", selectedColor || "var(--accent)");
  artboard.innerHTML = `
    <div class="canvas-stage">
      <canvas class="coloring-canvas" width="${artwork.width}" height="${artwork.height}" aria-label="${artwork.title}"></canvas>
    </div>
  `;

  rebuildRevealCanvas();
  drawArtwork();
  renderPalette();
  updateProgress();
  updateTransform();
  bindCanvasInput();
}

function bindCanvasInput() {
  const canvas = artboard.querySelector(".coloring-canvas");
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", endDrag);
}

function rebuildRevealCanvas() {
  const artwork = state.currentArtwork;
  const assets = state.assets;
  assets.revealContext.clearRect(0, 0, artwork.width, artwork.height);
  for (const regionId of getFilledSet(artwork.id)) revealRegion(regionId);
}

function revealRegion(regionId) {
  const artwork = state.currentArtwork;
  const assets = state.assets;
  const region = artwork.regions.find((item) => item.regionId === regionId);
  if (!region) return;

  const target = hexToRgb(region.mapColor);
  const { x, y, width, height } = region.bounds;
  const revealData = assets.revealContext.getImageData(x, y, width, height);

  for (let yy = 0; yy < height; yy += 1) {
    for (let xx = 0; xx < width; xx += 1) {
      const sourceX = x + xx;
      const sourceY = y + yy;
      const sourceIndex = (sourceY * artwork.width + sourceX) * 4;
      const revealIndex = (yy * width + xx) * 4;
      if (
        assets.mapData.data[sourceIndex] === target.r &&
        assets.mapData.data[sourceIndex + 1] === target.g &&
        assets.mapData.data[sourceIndex + 2] === target.b
      ) {
        revealData.data[revealIndex] = assets.colorData.data[sourceIndex];
        revealData.data[revealIndex + 1] = assets.colorData.data[sourceIndex + 1];
        revealData.data[revealIndex + 2] = assets.colorData.data[sourceIndex + 2];
        revealData.data[revealIndex + 3] = 255;
      }
    }
  }

  assets.revealContext.putImageData(revealData, x, y);
}

function drawArtwork() {
  const artwork = state.currentArtwork;
  const assets = state.assets;
  const canvas = artboard.querySelector(".coloring-canvas");
  const context = canvas.getContext("2d");
  const filled = getFilledSet(artwork.id);

  context.clearRect(0, 0, artwork.width, artwork.height);
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, artwork.width, artwork.height);
  context.drawImage(assets.revealCanvas, 0, 0);
  context.drawImage(assets.lineImage, 0, 0, artwork.width, artwork.height);
  drawLabels(context, filled);
}

function drawLabels(context, filled) {
  const artwork = state.currentArtwork;
  const selected = state.selectedNumber;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (const region of artwork.regions) {
    if (filled.has(region.regionId) || region.hiddenLabel) continue;
    const label = region.labelPositions?.[0];
    if (!label) continue;
    const fontSize = clamp(Math.round(Math.min(region.bounds.width, region.bounds.height) * 0.32), 14, 34);
    context.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
    context.lineWidth = Math.max(4, Math.round(fontSize * 0.24));
    context.strokeStyle = "rgba(255, 253, 248, 0.92)";
    context.fillStyle = region.number === selected ? "#1f332d" : "#665f58";
    context.strokeText(String(region.number), label.x, label.y);
    context.fillText(String(region.number), label.x, label.y);
  }
}

function renderPalette() {
  const artwork = state.currentArtwork;
  const filled = getFilledSet(artwork.id);
  const selectedColor = artwork.palette.find((item) => item.number === state.selectedNumber)?.color;
  palette.style.setProperty("--selected-color", selectedColor || "var(--accent)");
  palette.innerHTML = artwork.palette
    .filter((item) => item.regionCount > 0)
    .map((item) => {
      const remaining = artwork.regions.filter((region) => region.number === item.number && !filled.has(region.regionId)).length;
      const selected = state.selectedNumber === item.number;
      return `
        <button class="swatch" type="button" data-number="${item.number}" data-selected="${selected}" aria-pressed="${selected}">
          <span class="swatch-dot" style="background:${item.color}"></span>
          <span class="swatch-number">${item.number}</span>
          <span class="swatch-count">${remaining}</span>
        </button>
      `;
    })
    .join("");

  palette.querySelectorAll("[data-number]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedNumber = Number(button.dataset.number);
      paletteHint.textContent = `Number ${state.selectedNumber} selected. Tap matching areas.`;
      renderPalette();
      drawArtwork();
    });
  });
}

function fillRegion(regionId) {
  const artwork = state.currentArtwork;
  const region = artwork.regions.find((item) => item.regionId === regionId);
  if (!region) return;

  if (region.number !== state.selectedNumber) {
    paletteHint.textContent = `That area belongs to number ${region.number}.`;
    state.wrongRegionId = region.regionId;
    drawArtwork();
    window.setTimeout(() => {
      if (state.wrongRegionId !== region.regionId) return;
      state.wrongRegionId = null;
      drawArtwork();
    }, 420);
    return;
  }

  const filled = getFilledSet(artwork.id);
  if (filled.has(regionId)) return;

  filled.add(regionId);
  state.progress[artwork.id] = [...filled];
  state.wrongRegionId = null;
  revealRegion(regionId);
  saveProgress();
  drawArtwork();
  renderPalette();
  updateProgress();

  if (filled.size === artwork.regions.length) {
    completionTitle.textContent = artwork.title;
    completionView.hidden = false;
  }
}

function getFilledSet(artworkId) {
  const artwork = state.artworks.find((item) => item.id === artworkId);
  const savedIds = Array.isArray(state.progress[artworkId]) ? state.progress[artworkId] : [];
  if (!artwork) return new Set(savedIds);

  const validIds = new Set(artwork.regions.map((region) => region.regionId));
  return new Set(savedIds.filter((regionId) => validIds.has(regionId)));
}

function updateProgress() {
  const artwork = state.currentArtwork;
  const filled = getFilledSet(artwork.id).size;
  const total = artwork.regions.length;
  const percent = Math.round((filled / total) * 100);
  progressText.textContent = `${percent}% complete`;
  remainingText.textContent = `${total - filled} areas left`;
  progressBar.style.width = `${percent}%`;
}

function resetCurrentArtwork(confirmReset = true) {
  if (!state.currentArtwork) return;
  if (confirmReset && !confirm(`Reset ${state.currentArtwork.title}?`)) return;
  delete state.progress[state.currentArtwork.id];
  state.wrongRegionId = null;
  saveProgress();
  completionView.hidden = true;
  rebuildRevealCanvas();
  drawArtwork();
  renderPalette();
  updateProgress();
}

function handleWheel(event) {
  event.preventDefault();
  const nextZoom = state.zoom + (event.deltaY > 0 ? -0.08 : 0.08);
  state.zoom = clamp(nextZoom, 0.42, 3.2);
  updateTransform();
}

function handlePointerDown(event) {
  state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  event.currentTarget.setPointerCapture(event.pointerId);

  if (state.pointers.size >= 2) {
    state.drag = null;
    state.pinch = getPinchState();
    return;
  }

  state.drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    x: event.clientX,
    y: event.clientY,
    panX: state.panX,
    panY: state.panY,
    moved: false,
  };
}

function handlePointerMove(event) {
  if (state.pointers.has(event.pointerId)) {
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  if (state.pinch && state.pointers.size >= 2) {
    const nextPinch = getPinchState();
    state.zoom = clamp(state.pinch.zoom * (nextPinch.distance / state.pinch.distance), 0.42, 3.4);
    state.panX = state.pinch.panX + nextPinch.centerX - state.pinch.centerX;
    state.panY = state.pinch.panY + nextPinch.centerY - state.pinch.centerY;
    updateTransform();
    return;
  }

  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  const dx = event.clientX - state.drag.startX;
  const dy = event.clientY - state.drag.startY;
  state.drag.moved = Math.hypot(dx, dy) > 8;
  if (state.drag.moved) {
    state.panX = state.drag.panX + dx;
    state.panY = state.drag.panY + dy;
    updateTransform();
  }
}

function handlePointerUp(event) {
  const drag = state.drag;
  if (drag?.pointerId === event.pointerId && !drag.moved) {
    const region = getRegionAtClientPoint(event.clientX, event.clientY);
    if (region) fillRegion(region.regionId);
  }
  endDrag(event);
}

function endDrag(event) {
  state.pointers.delete(event.pointerId);
  if (state.pointers.size < 2) state.pinch = null;
  if (state.drag?.pointerId === event.pointerId) state.drag = null;
}

function getRegionAtClientPoint(clientX, clientY) {
  const artwork = state.currentArtwork;
  const assets = state.assets;
  const canvas = artboard.querySelector(".coloring-canvas");
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - rect.left) / rect.width) * artwork.width);
  const y = Math.floor(((clientY - rect.top) / rect.height) * artwork.height);
  if (x < 0 || y < 0 || x >= artwork.width || y >= artwork.height) return null;

  const index = (y * artwork.width + x) * 4;
  const key = rgbToHex(assets.mapData.data[index], assets.mapData.data[index + 1], assets.mapData.data[index + 2]);
  return mapColorToRegion.get(key) ?? null;
}

function getPinchState() {
  const [first, second] = [...state.pointers.values()];
  const dx = second.x - first.x;
  const dy = second.y - first.y;

  return {
    centerX: (first.x + second.x) / 2,
    centerY: (first.y + second.y) / 2,
    distance: Math.max(1, Math.hypot(dx, dy)),
    zoom: state.zoom,
    panX: state.panX,
    panY: state.panY,
  };
}

function updateTransform() {
  const stage = artboard.querySelector(".canvas-stage");
  if (!stage) return;
  stage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

function normalizeHex(value) {
  return value.toLowerCase();
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(value) {
  const hex = value.replace("#", "");
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
