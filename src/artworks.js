const rounded = (value) => Math.round(value * 10) / 10;
const point = (x, y) => `${rounded(x)} ${rounded(y)}`;
const polar = (cx, cy, radius, angle) => ({
  x: cx + Math.cos(angle) * radius,
  y: cy + Math.sin(angle) * radius,
});

function petalPath(cx, cy, angle, length, width) {
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const perp = { x: -dir.y, y: dir.x };
  const tip = { x: cx + dir.x * length, y: cy + dir.y * length };
  const c1 = { x: cx + dir.x * length * 0.34 + perp.x * width, y: cy + dir.y * length * 0.34 + perp.y * width };
  const c2 = { x: tip.x - dir.x * length * 0.24 + perp.x * width * 0.76, y: tip.y - dir.y * length * 0.24 + perp.y * width * 0.76 };
  const c3 = { x: tip.x - dir.x * length * 0.24 - perp.x * width * 0.76, y: tip.y - dir.y * length * 0.24 - perp.y * width * 0.76 };
  const c4 = { x: cx + dir.x * length * 0.34 - perp.x * width, y: cy + dir.y * length * 0.34 - perp.y * width };

  return `M${point(cx, cy)} C${point(c1.x, c1.y)} ${point(c2.x, c2.y)} ${point(tip.x, tip.y)} C${point(c3.x, c3.y)} ${point(c4.x, c4.y)} ${point(cx, cy)}Z`;
}

function leafPath(cx, cy, angle, length, width) {
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const perp = { x: -dir.y, y: dir.x };
  const base = { x: cx - dir.x * length * 0.5, y: cy - dir.y * length * 0.5 };
  const tip = { x: cx + dir.x * length * 0.5, y: cy + dir.y * length * 0.5 };
  const c1 = { x: cx - dir.x * length * 0.18 + perp.x * width, y: cy - dir.y * length * 0.18 + perp.y * width };
  const c2 = { x: cx + dir.x * length * 0.24 + perp.x * width, y: cy + dir.y * length * 0.24 + perp.y * width };
  const c3 = { x: cx + dir.x * length * 0.24 - perp.x * width, y: cy + dir.y * length * 0.24 - perp.y * width };
  const c4 = { x: cx - dir.x * length * 0.18 - perp.x * width, y: cy - dir.y * length * 0.18 - perp.y * width };

  return `M${point(base.x, base.y)} C${point(c1.x, c1.y)} ${point(c2.x, c2.y)} ${point(tip.x, tip.y)} C${point(c3.x, c3.y)} ${point(c4.x, c4.y)} ${point(base.x, base.y)}Z`;
}

function flower(prefix, cx, cy, petals, radius, width, paletteNumbers, centerNumber) {
  const regions = [];
  for (let index = 0; index < petals; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / petals;
    regions.push({
      id: `${prefix}-p${index + 1}`,
      number: paletteNumbers[index % paletteNumbers.length],
      shape: "path",
      attrs: { d: petalPath(cx, cy, angle, radius, width) },
    });
  }
  regions.push({ id: `${prefix}-c`, number: centerNumber, shape: "circle", attrs: { cx, cy, r: Math.max(9, width * 0.72) } });
  return regions;
}

function stem(prefix, x1, y1, x2, y2, width, number) {
  return {
    id: prefix,
    number,
    shape: "path",
    attrs: { d: `M${x1 - width} ${y1} C${x1 + 8} ${(y1 + y2) / 2} ${x2 - 8} ${(y1 + y2) / 2} ${x2 - width} ${y2} L${x2 + width} ${y2} C${x2 + 8} ${(y1 + y2) / 2} ${x1 - 8} ${(y1 + y2) / 2} ${x1 + width} ${y1}Z` },
  };
}

function leaves(prefix, items, numbers) {
  return items.map((item, index) => ({
    id: `${prefix}-${index + 1}`,
    number: numbers[index % numbers.length],
    shape: "path",
    attrs: { d: leafPath(item.x, item.y, item.angle, item.length, item.width) },
  }));
}

function mandalaRegions() {
  const regions = [
    { id: "m-core", number: 1, shape: "circle", attrs: { cx: 160, cy: 160, r: 28 } },
    { id: "m-ring", number: 2, shape: "path", attrs: { d: "M160 18 A142 142 0 0 1 302 160 A142 142 0 0 1 160 302 A142 142 0 0 1 18 160 A142 142 0 0 1 160 18 M160 34 A126 126 0 1 0 160 286 A126 126 0 1 0 160 34Z" } },
  ];

  for (let index = 0; index < 12; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 12;
    const inner = polar(160, 160, 42, angle);
    const outer = polar(160, 160, 108, angle);
    regions.push({
      id: `m-petal-${index + 1}`,
      number: [3, 4, 5][index % 3],
      shape: "path",
      attrs: { d: petalPath(inner.x, inner.y, angle, 72, 18) },
    });
    regions.push({
      id: `m-dot-${index + 1}`,
      number: [1, 6][index % 2],
      shape: "circle",
      attrs: { cx: rounded(outer.x), cy: rounded(outer.y), r: 12 },
    });
  }

  for (let index = 0; index < 8; index += 1) {
    const angle = Math.PI / 8 + (Math.PI * 2 * index) / 8;
    const center = polar(160, 160, 82, angle);
    regions.push({
      id: `m-leaf-${index + 1}`,
      number: [2, 4][index % 2],
      shape: "path",
      attrs: { d: leafPath(center.x, center.y, angle, 56, 14) },
    });
  }

  return regions;
}

function botanicalRegions() {
  return [
    { id: "bb-bg-1", number: 1, shape: "path", attrs: { d: "M24 26 H376 V344 H24Z" } },
    { id: "bb-table", number: 8, shape: "path", attrs: { d: "M30 296 H370 V344 H30Z" } },
    { id: "bb-vase", number: 6, shape: "path", attrs: { d: "M154 192 H246 C240 236 232 284 220 318 H180 C168 284 160 236 154 192Z" } },
    { id: "bb-vase-neck", number: 7, shape: "path", attrs: { d: "M176 156 H224 L216 204 H184Z" } },
    stem("bb-stem-1", 200, 204, 150, 82, 4, 5),
    stem("bb-stem-2", 200, 204, 238, 64, 4, 5),
    stem("bb-stem-3", 198, 204, 198, 52, 4, 5),
    stem("bb-stem-4", 196, 210, 118, 142, 4, 5),
    stem("bb-stem-5", 204, 208, 286, 140, 4, 5),
    ...leaves("bb-left-leaf", [
      { x: 154, y: 126, angle: -2.58, length: 54, width: 15 },
      { x: 172, y: 156, angle: -2.78, length: 46, width: 13 },
      { x: 139, y: 196, angle: -2.7, length: 52, width: 15 },
      { x: 226, y: 144, angle: -0.36, length: 50, width: 14 },
      { x: 248, y: 188, angle: -0.08, length: 54, width: 15 },
      { x: 208, y: 104, angle: -1.1, length: 48, width: 13 },
      { x: 184, y: 92, angle: -2.04, length: 46, width: 13 },
      { x: 228, y: 104, angle: 0.06, length: 42, width: 12 },
    ], [2, 3]),
    ...flower("bb-flower-a", 146, 78, 8, 38, 15, [9, 4, 10], 11),
    ...flower("bb-flower-b", 242, 62, 9, 34, 13, [4, 9, 12], 11),
    ...flower("bb-flower-c", 198, 54, 8, 30, 12, [10, 9], 11),
    ...flower("bb-flower-d", 116, 140, 7, 30, 12, [12, 4, 9], 11),
    ...flower("bb-flower-e", 288, 140, 7, 32, 12, [9, 10, 4], 11),
    { id: "bb-vase-light", number: 7, shape: "path", attrs: { d: "M178 218 C188 206 210 206 222 220 C218 246 212 278 206 304 H188 C184 276 180 244 178 218Z" } },
    { id: "bb-shadow", number: 8, shape: "path", attrs: { d: "M128 322 C162 308 238 308 272 322 C244 336 156 336 128 322Z" } },
  ];
}

function windowStillLifeRegions() {
  return [
    { id: "ws-wall", number: 1, shape: "rect", attrs: { x: 20, y: 18, width: 400, height: 288, rx: 18 } },
    { id: "ws-window-frame", number: 8, shape: "rect", attrs: { x: 54, y: 42, width: 178, height: 132, rx: 10 } },
    { id: "ws-window-a", number: 2, shape: "rect", attrs: { x: 68, y: 56, width: 66, height: 48, rx: 6 } },
    { id: "ws-window-b", number: 3, shape: "rect", attrs: { x: 146, y: 56, width: 72, height: 48, rx: 6 } },
    { id: "ws-window-c", number: 3, shape: "rect", attrs: { x: 68, y: 116, width: 66, height: 44, rx: 6 } },
    { id: "ws-window-d", number: 2, shape: "rect", attrs: { x: 146, y: 116, width: 72, height: 44, rx: 6 } },
    { id: "ws-sun", number: 4, shape: "circle", attrs: { cx: 190, cy: 84, r: 18 } },
    { id: "ws-sill", number: 9, shape: "rect", attrs: { x: 36, y: 176, width: 368, height: 38, rx: 10 } },
    { id: "ws-table", number: 10, shape: "path", attrs: { d: "M30 214 H410 V326 H30Z" } },
    { id: "ws-book-a", number: 6, shape: "path", attrs: { d: "M248 226 H374 L360 256 H238Z" } },
    { id: "ws-book-b", number: 7, shape: "path", attrs: { d: "M240 256 H356 L344 282 H228Z" } },
    { id: "ws-cup-body", number: 5, shape: "path", attrs: { d: "M292 152 H354 C352 188 340 208 310 208 C288 206 280 184 292 152Z" } },
    { id: "ws-cup-tea", number: 11, shape: "path", attrs: { d: "M294 154 H352 C344 166 304 166 294 154Z" } },
    { id: "ws-cup-handle", number: 5, shape: "path", attrs: { d: "M350 164 C384 164 384 198 350 198 V186 C366 186 366 176 350 176Z" } },
    { id: "ws-pot", number: 12, shape: "path", attrs: { d: "M88 170 H160 L148 238 H102Z" } },
    { id: "ws-pot-band", number: 7, shape: "path", attrs: { d: "M96 194 H154 L150 214 H100Z" } },
    stem("ws-stem-a", 124, 178, 84, 92, 3, 13),
    stem("ws-stem-b", 126, 178, 126, 72, 3, 13),
    stem("ws-stem-c", 130, 178, 176, 86, 3, 13),
    ...leaves("ws-leaf", [
      { x: 88, y: 104, angle: -2.6, length: 48, width: 13 },
      { x: 106, y: 118, angle: -2.9, length: 42, width: 12 },
      { x: 122, y: 94, angle: -1.66, length: 48, width: 13 },
      { x: 146, y: 112, angle: -0.45, length: 48, width: 13 },
      { x: 168, y: 92, angle: -0.2, length: 42, width: 12 },
      { x: 128, y: 136, angle: -0.02, length: 46, width: 12 },
      { x: 96, y: 146, angle: 2.9, length: 38, width: 11 },
      { x: 154, y: 152, angle: -0.22, length: 40, width: 11 },
    ], [13, 14, 15]),
    ...flower("ws-small-flower-a", 78, 88, 6, 22, 8, [4, 6], 11),
    ...flower("ws-small-flower-b", 180, 84, 6, 20, 8, [6, 4], 11),
    { id: "ws-shadow-1", number: 9, shape: "path", attrs: { d: "M70 244 C104 230 166 230 196 244 C170 258 96 258 70 244Z" } },
    { id: "ws-shadow-2", number: 9, shape: "path", attrs: { d: "M274 286 C302 274 354 274 382 286 C356 298 300 298 274 286Z" } },
  ];
}

export const artworks = [
  {
    id: "quiet-mandala",
    title: "Quiet Mandala",
    category: "Mandalas",
    difficulty: "Easy",
    description: "A calm symmetric pattern with layered petals, dots, and leaves.",
    viewBox: "0 0 320 320",
    palette: [
      { number: 1, color: "#87ad9d", name: "Sage" },
      { number: 2, color: "#dfc48f", name: "Honey oat" },
      { number: 3, color: "#d9a88f", name: "Clay" },
      { number: 4, color: "#9aa7c8", name: "Mist blue" },
      { number: 5, color: "#c9898c", name: "Rose clay" },
      { number: 6, color: "#efe2bd", name: "Warm cream" },
    ],
    regions: mandalaRegions(),
  },
  {
    id: "moonlit-botanica",
    title: "Moonlit Botanica",
    category: "Botanical",
    difficulty: "Medium",
    description: "A polished botanical vase designed as the prototype quality bar.",
    viewBox: "0 0 400 350",
    palette: [
      { number: 1, color: "#f6ead8", name: "Linen" },
      { number: 2, color: "#7fa68b", name: "Sage leaf" },
      { number: 3, color: "#adc79e", name: "Meadow green" },
      { number: 4, color: "#d99aa4", name: "Dusty rose" },
      { number: 5, color: "#9a735f", name: "Stem umber" },
      { number: 6, color: "#8fa9b3", name: "Moon ceramic" },
      { number: 7, color: "#bfd3d7", name: "Ceramic light" },
      { number: 8, color: "#d8b07f", name: "Warm wood" },
      { number: 9, color: "#c77f86", name: "Berry rose" },
      { number: 10, color: "#e6c26f", name: "Pollen gold" },
      { number: 11, color: "#7b6658", name: "Seed" },
      { number: 12, color: "#b9a7ca", name: "Lavender" },
    ],
    regions: botanicalRegions(),
  },
  {
    id: "quiet-window",
    title: "Quiet Window",
    category: "Still Life",
    difficulty: "Medium",
    description: "A cozy windowsill scene with tea, books, and a small plant.",
    viewBox: "0 0 440 340",
    palette: [
      { number: 1, color: "#f0dfc9", name: "Warm wall" },
      { number: 2, color: "#b9c9d9", name: "Morning blue" },
      { number: 3, color: "#d9e3e2", name: "Window mist" },
      { number: 4, color: "#e4bc73", name: "Soft sun" },
      { number: 5, color: "#c98267", name: "Tea clay" },
      { number: 6, color: "#d4959e", name: "Muted rose" },
      { number: 7, color: "#8fa9a0", name: "Quiet teal" },
      { number: 8, color: "#8b7566", name: "Frame umber" },
      { number: 9, color: "#d2ac78", name: "Wood light" },
      { number: 10, color: "#b9845f", name: "Wood deep" },
      { number: 11, color: "#7b5d48", name: "Tea shadow" },
      { number: 12, color: "#a7b8a1", name: "Planter" },
      { number: 13, color: "#6f946f", name: "Leaf deep" },
      { number: 14, color: "#83ab7a", name: "Leaf soft" },
      { number: 15, color: "#b7c78f", name: "Leaf light" },
    ],
    regions: windowStillLifeRegions(),
  },
];
