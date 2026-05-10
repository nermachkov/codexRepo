import { artworks } from "./artworks.js";

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
};

renderGallery();

document.querySelector("#back-button").addEventListener("click", showGallery);
document.querySelector("#continue-button").addEventListener("click", showGallery);
document.querySelector("#replay-button").addEventListener("click", () => {
  completionView.hidden = true;
  resetCurrentArtwork();
});
document.querySelector("#reset-all-button").addEventListener("click", () => {
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
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
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
      return `
        <article class="art-card">
          <button type="button" data-artwork-id="${artwork.id}" aria-label="Open ${artwork.title}">
            <div class="thumb">${renderThumbnail(artwork)}</div>
            <div class="card-copy">
              <div class="card-meta">
                <span>${artwork.category}</span>
                <span>${artwork.difficulty}</span>
              </div>
              <div class="card-title">${artwork.title}</div>
              <p class="card-progress">${percent}% complete</p>
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
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;

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
        style: isFilled ? `fill:${paletteItem.color}` : undefined,
      });
      return `<${region.shape} ${attrs}></${region.shape}>`;
    })
    .join("");

  const numbers = artwork.regions
    .map((region) => {
      const center = getRegionCenter(region);
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

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function renderPalette() {
  const artwork = state.currentArtwork;
  const filled = getFilledSet(artwork.id);
  palette.innerHTML = artwork.palette
    .map((item) => {
      const remaining = artwork.regions.filter((region) => region.number === item.number && !filled.has(region.id)).length;
      return `
        <button class="swatch" type="button" data-number="${item.number}" data-selected="${state.selectedNumber === item.number}">
          <span class="swatch-dot" style="background:${item.color}"></span>
          <span>${item.number}</span>
          <span>${remaining}</span>
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
    return;
  }

  const filled = getFilledSet(artwork.id);
  if (filled.has(regionId)) return;

  filled.add(regionId);
  state.progress[artwork.id] = [...filled];
  saveProgress();
  renderStudio();

  if (filled.size === artwork.regions.length) {
    completionTitle.textContent = artwork.title;
    completionView.hidden = false;
  }
}

function getFilledSet(artworkId) {
  return new Set(state.progress[artworkId] || []);
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

function resetCurrentArtwork() {
  if (!state.currentArtwork) return;
  delete state.progress[state.currentArtwork.id];
  saveProgress();
  completionView.hidden = true;
  renderStudio();
}

function handleWheel(event) {
  event.preventDefault();
  const nextZoom = state.zoom + (event.deltaY > 0 ? -0.08 : 0.08);
  state.zoom = clamp(nextZoom, 0.75, 2.6);
  updateTransform();
}

function handlePointerDown(event) {
  if (event.target.classList.contains("region")) return;
  event.currentTarget.setPointerCapture(event.pointerId);
  state.drag = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    panX: state.panX,
    panY: state.panY,
  };
}

function handlePointerMove(event) {
  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  state.panX = state.drag.panX + event.clientX - state.drag.x;
  state.panY = state.drag.panY + event.clientY - state.drag.y;
  updateTransform();
}

function endDrag(event) {
  if (state.drag?.pointerId === event.pointerId) state.drag = null;
}

function updateTransform() {
  const layer = artboard.querySelector(".zoom-layer");
  if (!layer) return;
  layer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
