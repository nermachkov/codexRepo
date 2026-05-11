# Artwork Production Pipeline

This document defines how Calm Color turns complex source art into safe, original-feeling, playable color-by-number artwork.

The production format is raster-first: AI-assisted or original PNG artwork is converted into a quantized color image, a black-and-white line-art layer, a machine-readable region map, and metadata.

## Core Rule

Do not use random copyrighted images as raw material and assume that tracing, filtering, recoloring, or simplifying makes them ours.

For production artwork, every source must be one of:

- Original art created for this project.
- Commissioned art with written commercial rights.
- Public domain source material with source notes.
- Creative Commons or stock material that explicitly allows commercial derivative use.
- AI-assisted concept material generated under terms that allow commercial use, then substantially art-directed and redrawn by us.

## Why This Matters

Google Play can reject or suspend apps that infringe intellectual property. Google also notes that modifying copyrighted content can still be a violation, and developers may need evidence that they have rights to use the content.

For our app, the safe path is:

1. Clear the source.
2. Transform it through our own art direction.
3. Keep records.
4. Ship only processed app assets and metadata.

## Source Tiers

### Tier A: Original Project Art

Best for production.

Examples:

- Hand-drawn botanical illustration.
- Original mandala.
- Original cozy still life.
- Original abstract pattern.

Requirements:

- Store source file.
- Store author name.
- Store creation date.
- Store project ownership note.

### Tier B: Commissioned Art

Good for scaling later.

Requirements:

- Written agreement.
- Commercial app rights.
- Right to modify.
- Right to distribute in Google Play app and marketing assets.
- Permission to create derivative color-by-number versions.

### Tier C: Public Domain Source

Good for classic/fine-art-inspired packs.

Requirements:

- Source URL.
- Institution or archive name.
- Public domain status.
- Modification notes.
- No misleading claim that the institution endorses our version.

Recommended use:

- Treat the public domain image as reference.
- Redraw composition into simplified line art.
- Change palette, crop, region structure, and visual tone.
- Credit source in internal metadata, and optionally in an in-app credits screen later.

### Tier D: Creative Commons or Stock

Use carefully.

Allowed only if the license permits:

- Commercial use.
- Modification/adaptation.
- App distribution.
- Store screenshots/promotional use if needed.

Avoid:

- NonCommercial licenses.
- NoDerivatives licenses.
- Licenses with unclear attribution rules.
- Assets that include trademarks, celebrities, brands, sports logos, album covers, book covers, or recognizable copyrighted characters.

### Tier E: AI-Assisted Concept Art

Useful for ideation, not as a fully automated content pipeline.

Requirements:

- Use prompts that do not name living artists, brands, franchises, copyrighted characters, celebrities, or specific copyrighted works.
- Treat output as project source material that still needs processing and quality control.
- Simplify, quantize, segment, and clean it into our own color-by-number asset set.
- Keep prompt, generation date, tool, seed/settings if available, and transformation notes.

## Forbidden Sources

Do not use:

- Movie, game, comic, anime, cartoon, or TV screenshots.
- Book covers, album covers, posters, and promotional images.
- Professional celebrity or public figure photos.
- Social media photos without permission.
- Fan art that is too close to protected characters.
- Logos, team marks, brand marks, product packaging, or trademarked symbols.
- "Free wallpaper" sites with unclear rights.
- Pinterest as a source of rights.
- Search engine image results as proof of permission.

## Production Workflow

### Step 1: Source Intake

For each candidate image, create an asset record:

- Working title.
- Source type.
- Source URL or project file path.
- Author/creator.
- License.
- Commercial use allowed: yes/no.
- Derivatives allowed: yes/no.
- Attribution required: yes/no.
- Notes on risky elements.

Decision:

- Accept.
- Reject.
- Needs permission.
- Use only as loose mood reference.

### Step 2: Art Direction Pass

Before conversion, define:

- Category.
- Difficulty.
- Target region count.
- Mood.
- Palette size.
- Line density.
- Visual changes from source.

Recommended MVP difficulty:

- Easy: 20-60 regions.
- Medium: 60-160 regions.
- Hard: 160-400 regions.

### Step 3: Prepare Clean Source Art

Goal: create artwork that is designed for coloring, not merely filtered from a noisy image.

Rules:

- Simplify forms.
- Remove visual noise.
- Avoid tiny details that will become unplayable regions.
- Prefer strong silhouettes and readable shape boundaries.
- Preserve calm adult composition.
- Make the result recognizable as our art direction.

Output:

- Source PNG.
- Normalized square or portrait PNG.
- Preview thumbnail.
- Source record.

### Step 4: Color Quantization

The source image is reduced to a controlled palette before segmentation.

Rules:

- 6-12 colors for early prototype art.
- 12-24 colors for production adult art.
- Preserve major color families and visual appeal.
- Avoid dithering and noisy texture in the playable map.
- Merge near-identical colors before region extraction.

Output:

- `color_art.png`: the final colored image shown as the completed result.
- Palette list in metadata.

### Step 5: Region Segmentation

Regions are connected areas of the same quantized color.

Each playable region must have:

- Unique region ID.
- Color number.
- Region-map color.
- Pixel area.
- Label position.
- Bounding box.

Avoid:

- Hairline slivers.
- Tiny islands that cannot be tapped.
- Region noise from texture or antialiasing.
- Too many neighboring regions with visually identical colors.

Output:

- `region_map.png`: hidden technical image where each region has a unique flat RGB color.
- `metadata.json`: palette, region IDs, labels, area, and map colors.

### Step 6: Line Art Generation

The black-and-white coloring page is generated from region boundaries, then cleaned for readability.

Rules:

- Line art must show clear closed areas.
- Lines should be dark enough for mobile.
- Labels should sit inside regions when possible.
- Large background areas may have fewer labels to avoid visual clutter.
- The uncolored page should feel calm and intentional.

Output:

- `line_art.png`: visible black-and-white coloring page.
- Preview thumbnail.

### Step 7: Palette Design

Palette should feel calming but not flat.

Rules:

- 6-12 colors for prototype art.
- 12-24 colors for production art.
- Enough contrast between adjacent regions.
- Avoid all-beige or all-green sets.
- Use warmer accent colors to prevent the app from feeling clinical.

### Step 8: Playability QA

Check:

- Can every region be tapped?
- Are all numbers readable?
- Is the selected color easy to find?
- Does the artwork still look appealing half-complete?
- Does completion feel satisfying?
- Does it work on phone-size screens?

### Step 9: Metadata and Validation

Each artwork should ship with:

- ID.
- Title.
- Category.
- Difficulty.
- Description.
- Dimensions.
- Palette.
- Regions.
- Runtime asset paths.
- Source record reference.

Validation should catch:

- Duplicate region IDs.
- Missing palette numbers.
- Regions referencing nonexistent palette numbers.
- Empty region arrays.
- Missing metadata.
- Missing or mismatched runtime images.
- Tiny regions below the current playability threshold.

## Transformation Standard

The production output should not feel like a filter pass.

A source is considered meaningfully transformed for our product only when:

- Composition has been intentionally simplified or rebalanced.
- Shapes are converted into clean, tappable coloring regions.
- Palette is newly designed.
- Region count and difficulty are designed for gameplay.
- The final asset set matches Calm Color's visual tone.
- We can explain what changed in the asset record.

This does not override licensing. If the source is copyrighted and we do not have permission, transformation is not enough.

## File Structure

Recommended structure:

```text
assets-source/
  artwork/
    accepted/
    rejected/
    references/
    source-records/
public/assets/
  artworks/
    calm-botanical-01/
      color_art.png
      line_art.png
      region_map.png
      thumbnail.png
      metadata.json
```

## MVP Content Strategy

For the first real starter pack, prioritize:

- 3 original mandalas/patterns.
- 3 botanical pieces.
- 2 cozy still-life pieces.
- 2 calm landscape or abstract pieces.

Prototype target:

- Replace the current rough test artworks with 3 raster pipeline samples.
- One easy mandala.
- One medium botanical.
- One medium cozy still life.

## Practical Tooling Plan

Phase 1:

- Build a local raster pipeline proof of concept.
- Input: one PNG source image.
- Output: `color_art.png`, `line_art.png`, `region_map.png`, `thumbnail.png`, and `metadata.json`.

Phase 2:

- Add artwork schema validation for raster assets.
- Add source records.
- Add export rules for thumbnails.

Phase 3:

- Improve the semi-automated workflow:
  - source PNG
  - color quantization
  - connected-region extraction
  - region cleanup
  - label placement
  - validation
  - canvas app import

Later:

- Build an internal artwork editor if cleanup and label placement become the bottleneck.

## Immediate Next Step

Create one raster pipeline proof-of-concept sample:

- Category: Botanical.
- Difficulty: Medium.
- Region target: 80-180 after cleanup.
- Palette: 8-16 colors.
- Source: original or AI-assisted PNG created for this project.
- Output: `color_art.png`, `line_art.png`, `region_map.png`, `thumbnail.png`, and `metadata.json`.

This sample becomes the quality bar for all future artwork.

Detailed technical plan: see `docs/15-raster-coloring-pipeline.md`.

## Official References

- Google Play Intellectual Property policy: https://support.google.com/googleplay/android-developer/answer/9888072
- U.S. Copyright Office derivative work guidance: https://www.copyright.gov/eco/help-limitation.html
- U.S. Copyright Office copyright basics: https://www.copyright.gov/what-is-copyright/
- Creative Commons Attribution overview: https://wiki.creativecommons.org/wiki/Creative_Commons_%20Attribution
- Europeana Public Domain Usage Guidelines: https://www.europeana.eu/en/rights/public-domain-usage-guidelines
