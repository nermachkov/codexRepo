# Raster Coloring Pipeline

This is the new target pipeline for production-quality color-by-number artwork.

## Goal

Create artwork that looks like competing color-by-number apps:

- Rich, polished illustration.
- Clean black or dark outlines.
- Flat readable color areas.
- Limited palette.
- Clear numbered regions.
- Gradual color reveal during play.

The current hand-built prototype artwork is not enough for this target. Production should use raster artwork, segmentation masks, and canvas rendering.

## Target Asset Set Per Artwork

Each artwork should compile into these runtime assets:

```text
public/assets/artworks/<artwork-id>/
  color_art.png
  line_art.png
  region_map.png
  thumbnail.png
  metadata.json
```

### color_art.png

The final fully colored image.

Purpose:

- Display completed artwork.
- Reveal colored pixels as the user fills regions.
- Generate thumbnails and store screenshots.

### line_art.png

The black-and-white or lightly tinted coloring-page image.

Purpose:

- Initial unfilled state.
- Shows outlines and numbers.
- Remains visible above or below revealed color depending on visual style.

### region_map.png

A technical image that is not shown to users.

Purpose:

- Every connected playable region has a unique encoded color.
- Runtime reads pixel color at tap coordinate.
- Pixel color maps to `regionId`.

### metadata.json

Structured data for the artwork.

Recommended fields:

- `id`
- `title`
- `category`
- `difficulty`
- `width`
- `height`
- `palette`
- `regions`
- `labels`
- `sourceRecord`

Each region should include:

- `regionId`
- `number`
- `mapColor`
- `paletteColor`
- `pixelArea`
- `bounds`
- `labelPositions`
- `hiddenLabel`

## Pipeline Overview

1. Generate or obtain source PNG.
2. Normalize image.
3. Quantize colors.
4. Segment connected regions.
5. Clean regions.
6. Generate region map.
7. Generate line art.
8. Generate labels.
9. Export metadata.
10. Verify in canvas prototype.

## Step 1: AI Source PNG

The prompt must force image-generation output toward segmentation-friendly art.

Prompt constraints:

- `coloring app illustration`
- `clean thick black outlines`
- `flat vector-like colors`
- `limited color palette`
- `large separated color areas`
- `white background`
- `no gradients`
- `no texture`
- `no tiny details`
- `no realistic shading`
- `no text`
- `no watermark`

Bad source images:

- Painterly images.
- Images with soft shadows everywhere.
- Photorealistic output.
- Noisy textures.
- Thin tangled linework.
- Many near-identical colors.
- Tiny decorative details.

## Step 2: Normalize

Before quantization:

- Resize to target working resolution.
- Remove alpha or flatten against white.
- Optionally sharpen outlines.
- Optionally increase contrast.
- Optional denoise pass.

Prototype target:

- `1024x1024` for square art.
- `768x1024` for portrait art.

## Step 3: Color Quantization

Quantize the source into a limited palette.

Initial targets:

- Prototype: 8-12 colors.
- MVP easy: 8-16 colors.
- MVP medium: 16-28 colors.
- MVP hard: 28-48 colors.

Important rule:

Color number is not the same as region. A color can appear in many disconnected regions.

Region identity is:

```text
quantized color + connected component
```

## Step 4: Connected Components

For every quantized color:

- Find connected pixel components.
- Assign each component a unique `regionId`.
- Store bounds and pixel area.

Connectivity:

- Use 4-connectivity first for clean separation.
- Consider 8-connectivity only if diagonal breaks become too noisy.

## Step 5: Region Cleanup

This step determines whether the artwork feels professional.

Rules:

- Remove tiny components.
- Merge tiny components into nearest compatible neighbor.
- Fill pinholes.
- Smooth jagged region edges.
- Reject regions below minimum tap area.
- Optionally mark very small decorative regions as non-playable color detail.

Suggested thresholds for first POC:

- Minimum playable region: `300-800 px` at 1024 resolution.
- Minimum label region: larger than playable minimum and enough empty interior for a number.
- Maximum tiny-region count after cleanup: low enough that the player is not chasing dust.

## Step 6: Region Map

Create `region_map.png` where:

- Each playable region has a unique RGB color.
- Background/non-playable pixels use black or transparent.
- Map colors must not be anti-aliased.

Runtime lookup:

1. Convert screen coordinate to artwork pixel coordinate.
2. Read RGB from hidden region map canvas.
3. Map RGB to `regionId`.
4. Check if `region.number === selectedNumber`.

## Step 7: Line Art

Line art can be generated from:

- AI output outlines.
- Edge detection.
- Quantized region boundaries.
- A blend of original dark lines plus region boundaries.

For the POC, use:

- Quantized boundary extraction.
- Dark outline stroke.
- White or light background.

The line art should include visible unfilled regions without looking like a technical segmentation map.

## Step 8: Labels

Labels should be generated but reviewable.

Automatic label placement:

- Compute distance transform inside each region.
- Place number at the largest inscribed empty spot.
- If no spot fits, hide label until zoom or skip label.
- Allow multiple labels for very large regions.

Metadata should store final label positions:

```json
{
  "regionId": "r_001",
  "number": 4,
  "labelPositions": [{ "x": 492, "y": 318 }]
}
```

## Runtime Rendering

Use canvas.

Visible layers:

1. Base `line_art.png`.
2. Revealed color pixels for completed regions.
3. Optional outline overlay.
4. Labels for unfilled regions.
5. Interaction highlight.

Hidden layers:

- `region_map.png` in an offscreen canvas.
- Optional mask canvas for currently revealed regions.

On fill:

1. Add region ID to completed set.
2. Redraw reveal mask.
3. Clip/copy pixels from `color_art.png` for completed regions.
4. Persist progress.

## Why Canvas For Runtime

Canvas is better for this pipeline because:

- Region hit detection is O(1) by pixel lookup.
- Thousands of regions do not create thousands of DOM nodes.
- Revealing raster art is natural.
- Mobile performance is more predictable.
- It matches image-processing output.

## POC Plan

The first proof of concept should not try to solve everything.

### POC Input

Use one generated or sample PNG with:

- Flat colors.
- Clear outlines.
- 8-12 colors.
- Simple subject: butterfly and flower, mandala, or cozy still life.

### POC Output

Generate:

- `color_art.png`
- `line_art.png`
- `region_map.png`
- `metadata.json`

### POC Runtime

Add one canvas-based artwork mode that:

- Shows line art.
- Shows palette numbers.
- Uses region map hit detection.
- Reveals selected regions from color art.
- Saves progress.

### POC Success Criteria

The POC is successful if:

- The unfilled image looks like a real coloring page.
- Tapping a region selects the correct region reliably.
- Filled regions reveal the original color cleanly.
- Labels are readable.
- Tiny noise regions do not dominate the experience.
- The implementation runs on GitHub Pages.

## Risks

- AI images may generate too many gradients and near-colors.
- Quantization may create ugly boundaries.
- Region cleanup may need manual review.
- Label placement may fail in thin regions.
- A fully automatic pipeline may not be good enough without an editor.

## Expected Need For An Editor

For production quality, expect a semi-automatic internal editor later.

Editor tasks:

- Merge regions.
- Delete tiny regions.
- Reassign color numbers.
- Move labels.
- Hide labels.
- Preview mobile zoom.
- Export final runtime assets.

## Immediate Next Step

Build a local pipeline script that accepts one PNG and outputs:

```text
tools/raster-pipeline/input/source.png
tools/raster-pipeline/output/color_art.png
tools/raster-pipeline/output/line_art.png
tools/raster-pipeline/output/region_map.png
tools/raster-pipeline/output/metadata.json
```

Then wire that output into a separate canvas prototype screen.
