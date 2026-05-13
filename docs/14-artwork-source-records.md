# Artwork Source Records

This document tracks artwork sources and transformation notes for prototype and production coloring pages.

## raster-poc-01

- Title: To be assigned after first generated source image.
- Status: planned raster proof of concept.
- Source type: original or AI-assisted PNG created for this project.
- Source URL: not applicable for original/generated project art.
- Prompt/tool record: required before production use.
- License: must allow commercial app use.
- Commercial use: required.
- Derivatives/adaptations: required.
- Notes: first artwork must produce `color_art.png`, `line_art.png`, `region_map.png`, `thumbnail.png`, and `metadata.json`.

## ocean-24

- Title: Calm Ocean.
- Status: generated raster source for pipeline testing.
- Source type: AI-assisted PNG created for this project.
- Source file: `tools/raster-pipeline/input/source-ocean.png`.
- Runtime asset folder: `public/assets/artworks/ocean-24/`.
- Palette target: 24 colors.
- Generated regions: 684.
- Notes: coastal ocean scene with waves, rocks, sea plants, clouds, and sunset. Uses light-color playable regions, small no-label tap regions, and visible lines only for larger regions.

## mountain-window-24

- Title: Mountain Window.
- Status: generated raster source for pipeline testing.
- Source type: AI-assisted PNG created for this project.
- Source file: `tools/raster-pipeline/input/source-mountain-window.png`.
- Runtime asset folder: `public/assets/artworks/mountain-window-24/`.
- Palette target: 24 colors.
- Generated regions: 588.
- Notes: cozy interior window view toward mountains. Uses light-color playable regions, small no-label tap regions, and visible lines only for larger regions.

## cat-sofa-24

- Title: Cat on Sofa.
- Status: generated raster source for pipeline testing.
- Source type: AI-assisted PNG created for this project.
- Source file: `tools/raster-pipeline/input/source-cat-sofa.png`.
- Runtime asset folder: `public/assets/artworks/cat-sofa-24/`.
- Palette target: 24 colors.
- Generated regions: 981.
- Notes: cozy interior scene with sleeping cat, sofa, pillows, plants, lamp, rug, and table. Uses light-color playable regions, small no-label tap regions, and visible lines only for larger regions.

## tea-garden-50

- Title: Tea Garden Corner.
- Status: generated raster source for pipeline testing.
- Source type: AI-assisted PNG created for this project.
- Source file: `tools/raster-pipeline/input/source-tea-garden.png`.
- Runtime asset folder: `public/assets/artworks/tea-garden-50/`.
- Palette target: source-derived region colors.
- Generated regions: 170.
- Prompt summary: simplified patio still life with tea, teapot, broad-leaf plants, window, chair cushion, and large stone floor shapes.
- Notes: active source-first experiment. The final colored layer is the generated PNG itself, without quantization or posterization. Regions are connected components between detected source-ink contours (`regionMode: source-connected-components`). Palette entries are currently one per region using each region's average source color; filled regions reveal original source pixels 1:1.

## reading-nook-100

- Title: Reading Nook Afternoon.
- Status: generated raster source for pipeline testing.
- Source type: AI-assisted PNG created for this project.
- Source file: `tools/raster-pipeline/input/source-reading-nook.png`.
- Runtime asset folder: `public/assets/artworks/reading-nook-100/`.
- Palette target: 16 colors.
- Generated regions: 100.
- Prompt summary: cozy reading nook with armchair, blanket, bookshelf, plants, side table, mug, and window light.
- Notes: medium-density test image with exactly 100 mapped regions; every region is contiguous and reveals as one solid color.

## lantern-canal-200

- Title: Lantern Canal Evening.
- Status: generated raster source for pipeline testing.
- Source type: AI-assisted PNG created for this project.
- Source file: `tools/raster-pipeline/input/source-lantern-canal.png`.
- Runtime asset folder: `public/assets/artworks/lantern-canal-200/`.
- Palette target: 24 colors.
- Generated regions: 200.
- Prompt summary: serene canal-side evening with arched bridge, water reflections, lanterns, flowers, old town windows, and small boat.
- Notes: hard-density test image with exactly 200 mapped regions; every region is contiguous and reveals as one solid color.
