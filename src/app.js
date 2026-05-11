import { artworks } from "./artworks.js?v=20260511-clean-regions";

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

const storageKey = "calmColorProgress";
const state = {
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
};

renderGallery();

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

function loadProgress() {
  try {
    return normalizeProgress(JSON.parse(localStorage.getItem(storageKey) || "{}"));
  } catch {
    return {};
  }
}

function normalizeProgress(savedProgress) {
  if (!savedProgress || typeof savedProgress !== "object" || Array.isArray(savedProgress)) return {};

  return artworks.reduce((cleanProgress, artwork) => {
    const savedIds = Array.isArray(savedProgress[artwork.id]) ? savedProgress[artwork.id] : [];
    const validIds = new Set(artwork.regions.map((region) => region.id));
    const cleanIds = [...new Set(savedIds)].filter((regionId) => validIds.has(regionId));

    if (cleanIds.length > 0) cleanProgress[artwork.id] = cleanIds;
    return cleanProgress;
  }, {});
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state.progress));
  } catch {
    // Storage can be blocked in some browser contexts; the prototype remains playable.
  }
}

function renderGallery() {
  galleryGrid.innerHTML = artworks
    .map((artwork) => {
      const filled = getFilledSet(artwork.id).size;
      const total = artwork.regions.length;
      const percent = Math.round((filled / total) * 100);
      const complete = filled === total;
      return `
        <article class="art-card" data-complete="${complete}">
          <button type="button" data-artwork-id="${artwork.id}" aria-label="Open ${artwork.title}">
            <div class="thumb">${renderThumbnail(artwork)}</div>
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

function renderThumbnail(artwork) {
  const sampleFilled = new Set(artwork.regions.slice(0, Math.ceil(artwork.regions.length / 2)).map((region) => region.id));
  return renderSvg(artwork, sampleFilled, false);
}

function openArtwork(artworkId) {
  const artwork = artworks.find((item) => item.id === artworkId);
  if (!artwork) return;

  state.currentArtwork = artwork;
  state.selectedNumber = artwork.palette[0].number;
  state.wrongRegionId = null;
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  state.pointers.clear();
  state.pinch = null;

  artworkTitle.textContent = artwork.title;
  artworkCategory.textContent = `${artwork.category} / ${artwork.difficulty}`;
  galleryView.hidden = true;
  studioView.hidden = false;
  completionView.hidden = true;

  renderStudio();
}

function showGallery() {
  completionView.hidden = true;
  studioView.hidden = true;
  galleryView.hidden = false;
  renderGallery();
}

function renderStudio() {
  const artwork = state.currentArtwork;
  const filled = getFilledSet(artwork.id);
  const selectedColor = artwork.palette.find((item) => item.number === state.selectedNumber)?.color;
  artboard.style.setProperty("--selected-color", selectedColor || "var(--accent)");
  artboard.innerHTML = renderSvg(artwork, filled, true);
  renderPalette();
  updateProgress();
  updateTransform();

  artboard.querySelectorAll(".region").forEach((region) => {
    region.addEventListener("click", () => fillRegion(region.dataset.regionId));
  });

  const svg = artboard.querySelector(".coloring-svg");
  svg.addEventListener("wheel", handleWheel, { passive: false });
  svg.addEventListener("pointerdown", handlePointerDown);
  svg.addEventListener("pointermove", handlePointerMove);
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("pointerleave", endDrag);
}

function renderSvg(artwork, filled, interactive) {
  const regions = artwork.regions
    .map((region) => {
      const paletteItem = artwork.palette.find((item) => item.number === region.number);
      const isFilled = filled.has(region.id);
      const isActive = region.number === state.selectedNumber;
      const isWrong = region.id === state.wrongRegionId;
      const attrs = attrsToString({
        ...region.attrs,
        class: "region",
        tabindex: interactive ? 0 : undefined,
        role: interactive ? "button" : undefined,
        "aria-label": interactive ? `Area ${region.number}` : undefined,
        "data-region-id": region.id,
        "data-number": region.number,
        "data-filled": String(isFilled),
        "data-active": String(isActive),
        "data-wrong": String(isWrong),
        style: isFilled ? `fill:${paletteItem.color}` : undefined,
      });
      return `<${region.shape} ${attrs}></${region.shape}>`;
    })
    .join("");

  const numbers = artwork.regions
    .map((region) => {
      if (region.label === false) return "";
      const center = getRegionLabelPosition(region);
      const isFilled = filled.has(region.id);
      return `<text class="region-number" data-hidden="${isFilled}" x="${center.x}" y="${center.y}">${region.number}</text>`;
    })
    .join("");

  return `
    <svg class="coloring-svg" viewBox="${artwork.viewBox}" aria-label="${artwork.title}" xmlns="http://www.w3.org/2000/svg">
      <g class="zoom-layer">
        <rect x="0" y="0" width="100%" height="100%" fill="#fffaf3"></rect>
        ${regions}
        ${interactive ? numbers : ""}
      </g>
    </svg>
  `;
}

function attrsToString(attrs) {
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(" ");
}

function getRegionCenter(region) {
  if (region.shape === "circle") return { x: region.attrs.cx, y: region.attrs.cy };
  if (region.shape === "ellipse") return { x: region.attrs.cx, y: region.attrs.cy };
  if (region.shape === "rect") {
    return {
      x: Number(region.attrs.x) + Number(region.attrs.width) / 2,
      y: Number(region.attrs.y) + Number(region.attrs.height) / 2,
    };
  }
  const numbers = String(region.attrs.d).match(/-?\d+(\.\d+)?/g)?.map(Number) || [160, 160];
  const xs = numbers.filter((_, index) => index % 2 === 0);
  const ys = numbers.filter((_, index) => index % 2 === 1);
  return {
    x: average(xs),
    y: average(ys),
  };
}

function getRegionLabelPosition(region) {
  if (region.label && typeof region.label.x === "number" && typeof region.label.y === "number") {
    return region.label;
  }
  return getRegionCenter(region);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function renderPalette() {
  const artwork = state.currentArtwork;
  const filled = getFilledSet(artwork.id);
  const selectedColor = artwork.palette.find((item) => item.number === state.selectedNumber)?.color;
  palette.style.setProperty("--selected-color", selectedColor || "var(--accent)");
  palette.innerHTML = artwork.palette
    .map((item) => {
      const remaining = artwork.regions.filter((region) => region.number === item.number && !filled.has(region.id)).length;
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
      renderStudio();
    });
  });
}

function fillRegion(regionId) {
  const artwork = state.currentArtwork;
  const region = artwork.regions.find((item) => item.id === regionId);
  if (!region) return;

  if (region.number !== state.selectedNumber) {
    paletteHint.textContent = `That area belongs to number ${region.number}.`;
    showWrongTap(region.id);
    return;
  }

  const filled = getFilledSet(artwork.id);
  if (filled.has(regionId)) return;

  filled.add(regionId);
  state.progress[artwork.id] = [...filled];
  state.wrongRegionId = null;
  saveProgress();
  renderStudio();

  if (filled.size === artwork.regions.length) {
    completionTitle.textContent = artwork.title;
    completionView.hidden = false;
  }
}

function getFilledSet(artworkId) {
  const artwork = artworks.find((item) => item.id === artworkId);
  const savedIds = Array.isArray(state.progress[artworkId]) ? state.progress[artworkId] : [];
  if (!artwork) return new Set(savedIds);

  const validIds = new Set(artwork.regions.map((region) => region.id));
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
  renderStudio();
}

function showWrongTap(regionId) {
  state.wrongRegionId = regionId;
  renderStudio();

  window.setTimeout(() => {
    if (state.wrongRegionId !== regionId) return;
    state.wrongRegionId = null;
    renderStudio();
  }, 420);
}

function handleWheel(event) {
  event.preventDefault();
  const nextZoom = state.zoom + (event.deltaY > 0 ? -0.08 : 0.08);
  state.zoom = clamp(nextZoom, 0.75, 2.6);
  updateTransform();
}

function handlePointerDown(event) {
  state.pointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY,
  });

  event.currentTarget.setPointerCapture(event.pointerId);

  if (state.pointers.size >= 2) {
    state.drag = null;
    state.pinch = getPinchState();
    return;
  }

  if (event.target.classList.contains("region")) return;

  state.drag = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    panX: state.panX,
    panY: state.panY,
  };
}

function handlePointerMove(event) {
  if (state.pointers.has(event.pointerId)) {
    state.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
  }

  if (state.pinch && state.pointers.size >= 2) {
    const nextPinch = getPinchState();
    state.zoom = clamp(state.pinch.zoom * (nextPinch.distance / state.pinch.distance), 0.75, 2.8);
    state.panX = state.pinch.panX + nextPinch.centerX - state.pinch.centerX;
    state.panY = state.pinch.panY + nextPinch.centerY - state.pinch.centerY;
    updateTransform();
    return;
  }

  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  state.panX = state.drag.panX + event.clientX - state.drag.x;
  state.panY = state.drag.panY + event.clientY - state.drag.y;
  updateTransform();
}

function endDrag(event) {
  state.pointers.delete(event.pointerId);
  if (state.pointers.size < 2) state.pinch = null;
  if (state.drag?.pointerId === event.pointerId) state.drag = null;
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
  const layer = artboard.querySelector(".zoom-layer");
  if (!layer) return;
  layer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
