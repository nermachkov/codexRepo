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
    { id: "bb-bg", number: 1, shape: "rect", attrs: { x: 28, y: 26, width: 344, height: 294, rx: 16 }, label: { x: 54, y: 52 } },
    { id: "bb-table", number: 8, shape: "rect", attrs: { x: 44, y: 286, width: 312, height: 34, rx: 4 }, label: { x: 68, y: 303 } },
    { id: "bb-shadow", number: 8, shape: "ellipse", attrs: { cx: 200, cy: 294, rx: 88, ry: 16 }, label: false },
    { id: "bb-vase-main", number: 6, shape: "path", attrs: { d: "M154 176 H246 C244 214 236 258 222 294 H178 C164 258 156 214 154 176Z" }, label: { x: 200, y: 236 } },
    { id: "bb-vase-light", number: 7, shape: "path", attrs: { d: "M180 192 C192 184 212 184 222 194 C218 222 214 252 206 276 H190 C186 250 182 220 180 192Z" }, label: { x: 201, y: 222 } },
    { id: "bb-vase-neck", number: 7, shape: "rect", attrs: { x: 176, y: 148, width: 48, height: 40, rx: 6 }, label: { x: 200, y: 168 } },
    { id: "bb-stem-left", number: 5, shape: "path", attrs: { d: "M192 178 C176 138 146 106 112 82 L120 76 C154 102 184 136 200 176Z" }, label: { x: 159, y: 126 } },
    { id: "bb-stem-center", number: 5, shape: "path", attrs: { d: "M198 178 C194 132 196 90 206 52 L216 54 C206 96 204 136 206 178Z" }, label: { x: 203, y: 117 } },
    { id: "bb-stem-right", number: 5, shape: "path", attrs: { d: "M206 178 C226 132 256 98 300 76 L306 84 C264 108 236 142 214 180Z" }, label: { x: 251, y: 126 } },
    { id: "bb-leaf-left-a", number: 2, shape: "path", attrs: { d: "M112 130 C74 118 58 86 78 56 C116 66 134 98 112 130Z" }, label: { x: 95, y: 94 } },
    { id: "bb-leaf-left-b", number: 3, shape: "path", attrs: { d: "M154 150 C112 156 82 136 74 98 C118 90 150 112 154 150Z" }, label: { x: 115, y: 124 } },
    { id: "bb-leaf-center-a", number: 2, shape: "path", attrs: { d: "M202 96 C170 70 166 36 194 14 C224 42 228 74 202 96Z" }, label: { x: 198, y: 57 } },
    { id: "bb-leaf-center-b", number: 3, shape: "path", attrs: { d: "M222 124 C248 84 286 76 318 104 C288 142 252 150 222 124Z" }, label: { x: 272, y: 112 } },
    { id: "bb-leaf-right-a", number: 2, shape: "path", attrs: { d: "M262 164 C300 144 334 152 352 188 C312 210 278 202 262 164Z" }, label: { x: 310, y: 178 } },
    { id: "bb-leaf-low-left", number: 3, shape: "path", attrs: { d: "M166 198 C124 204 92 184 80 146 C124 138 158 158 166 198Z" }, label: { x: 122, y: 172 } },
    { id: "bb-leaf-low-right", number: 2, shape: "path", attrs: { d: "M236 198 C276 184 310 198 326 236 C282 252 248 236 236 198Z" }, label: { x: 284, y: 222 } },
    { id: "bb-bloom-left", number: 9, shape: "circle", attrs: { cx: 94, cy: 64, r: 24 }, label: { x: 94, y: 64 } },
    { id: "bb-bloom-left-petal", number: 4, shape: "path", attrs: { d: "M94 38 C122 30 144 48 138 76 C108 84 84 68 94 38Z" }, label: { x: 118, y: 55 } },
    { id: "bb-bloom-center", number: 10, shape: "circle", attrs: { cx: 214, cy: 42, r: 24 }, label: { x: 214, y: 42 } },
    { id: "bb-bloom-center-petal", number: 12, shape: "path", attrs: { d: "M226 24 C256 24 274 48 262 76 C232 76 216 52 226 24Z" }, label: { x: 244, y: 50 } },
    { id: "bb-bloom-right", number: 4, shape: "circle", attrs: { cx: 314, cy: 82, r: 23 }, label: { x: 314, y: 82 } },
    { id: "bb-bloom-right-petal", number: 9, shape: "path", attrs: { d: "M306 58 C336 44 362 60 360 92 C330 104 306 88 306 58Z" }, label: { x: 338, y: 78 } },
    { id: "bb-bloom-low-left", number: 12, shape: "circle", attrs: { cx: 74, cy: 152, r: 22 }, label: { x: 74, y: 152 } },
    { id: "bb-bloom-low-right", number: 10, shape: "circle", attrs: { cx: 334, cy: 222, r: 22 }, label: { x: 334, y: 222 } },
    { id: "bb-seed-left", number: 11, shape: "circle", attrs: { cx: 94, cy: 64, r: 8 }, label: false },
    { id: "bb-seed-center", number: 11, shape: "circle", attrs: { cx: 214, cy: 42, r: 8 }, label: false },
    { id: "bb-seed-right", number: 11, shape: "circle", attrs: { cx: 314, cy: 82, r: 8 }, label: false },
  ];
}

function windowStillLifeRegions() {
  return [
    { id: "ws-wall", number: 1, shape: "rect", attrs: { x: 20, y: 18, width: 400, height: 288, rx: 18 }, label: { x: 390, y: 46 } },
    { id: "ws-window-frame", number: 8, shape: "rect", attrs: { x: 54, y: 42, width: 178, height: 132, rx: 10 }, label: { x: 74, y: 156 } },
    { id: "ws-window-a", number: 2, shape: "rect", attrs: { x: 70, y: 58, width: 62, height: 46, rx: 6 }, label: { x: 101, y: 81 } },
    { id: "ws-window-b", number: 3, shape: "rect", attrs: { x: 150, y: 58, width: 66, height: 46, rx: 6 }, label: { x: 183, y: 81 } },
    { id: "ws-window-c", number: 3, shape: "rect", attrs: { x: 70, y: 118, width: 62, height: 42, rx: 6 }, label: { x: 101, y: 139 } },
    { id: "ws-window-d", number: 2, shape: "rect", attrs: { x: 150, y: 118, width: 66, height: 42, rx: 6 }, label: { x: 183, y: 139 } },
    { id: "ws-sun", number: 4, shape: "circle", attrs: { cx: 192, cy: 86, r: 18 }, label: { x: 192, y: 86 } },
    { id: "ws-sill", number: 9, shape: "rect", attrs: { x: 36, y: 176, width: 368, height: 38, rx: 10 }, label: { x: 376, y: 195 } },
    { id: "ws-table", number: 10, shape: "rect", attrs: { x: 30, y: 214, width: 380, height: 112 }, label: { x: 386, y: 304 } },
    { id: "ws-book-a", number: 6, shape: "path", attrs: { d: "M244 228 H374 L360 256 H234Z" }, label: { x: 306, y: 241 } },
    { id: "ws-book-b", number: 7, shape: "path", attrs: { d: "M236 258 H356 L344 284 H224Z" }, label: { x: 290, y: 270 } },
    { id: "ws-cup-body", number: 5, shape: "path", attrs: { d: "M292 152 H354 C352 188 340 208 310 208 C288 206 280 184 292 152Z" }, label: { x: 318, y: 181 } },
    { id: "ws-cup-tea", number: 11, shape: "path", attrs: { d: "M294 154 H352 C344 166 304 166 294 154Z" }, label: false },
    { id: "ws-cup-handle", number: 5, shape: "path", attrs: { d: "M350 164 C384 164 384 198 350 198 V186 C366 186 366 176 350 176Z" }, label: { x: 368, y: 181 } },
    { id: "ws-pot", number: 12, shape: "path", attrs: { d: "M88 170 H160 L148 238 H102Z" }, label: { x: 124, y: 207 } },
    { id: "ws-pot-band", number: 7, shape: "path", attrs: { d: "M96 194 H154 L150 214 H100Z" }, label: false },
    { id: "ws-plant-left", number: 13, shape: "path", attrs: { d: "M92 116 C62 108 50 80 68 56 C102 66 116 92 92 116Z" }, label: { x: 82, y: 88 } },
    { id: "ws-plant-mid", number: 14, shape: "path", attrs: { d: "M126 126 C100 98 104 66 134 42 C160 72 158 104 126 126Z" }, label: { x: 129, y: 84 } },
    { id: "ws-plant-right", number: 15, shape: "path", attrs: { d: "M154 124 C184 94 218 94 240 124 C210 154 178 154 154 124Z" }, label: { x: 198, y: 124 } },
    { id: "ws-plant-low-left", number: 14, shape: "path", attrs: { d: "M104 162 C72 166 48 146 44 116 C78 110 104 132 104 162Z" }, label: { x: 72, y: 139 } },
    { id: "ws-plant-low-right", number: 13, shape: "path", attrs: { d: "M146 164 C174 146 204 154 218 184 C184 202 156 192 146 164Z" }, label: { x: 184, y: 176 } },
    { id: "ws-stem-a", number: 13, shape: "path", attrs: { d: "M120 172 C110 144 96 122 82 100 L88 96 C106 120 120 144 128 172Z" }, label: false },
    { id: "ws-stem-b", number: 13, shape: "path", attrs: { d: "M126 172 C122 128 124 92 132 58 L138 60 C132 96 132 132 134 172Z" }, label: false },
    { id: "ws-stem-c", number: 13, shape: "path", attrs: { d: "M134 172 C152 136 174 112 204 98 L208 104 C180 120 158 144 142 174Z" }, label: false },
    { id: "ws-flower-a", number: 6, shape: "circle", attrs: { cx: 68, cy: 60, r: 16 }, label: { x: 68, y: 60 } },
    { id: "ws-flower-b", number: 4, shape: "circle", attrs: { cx: 218, cy: 116, r: 15 }, label: { x: 218, y: 116 } },
    { id: "ws-shadow-1", number: 9, shape: "ellipse", attrs: { cx: 128, cy: 244, rx: 62, ry: 14 }, label: false },
    { id: "ws-shadow-2", number: 9, shape: "ellipse", attrs: { cx: 328, cy: 292, rx: 58, ry: 12 }, label: false },
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
