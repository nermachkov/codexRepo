# Artwork Production Pipeline

This document defines how Calm Color turns complex source art into safe, original-feeling, playable color-by-number SVG artwork.

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
4. Ship only the playable SVG and metadata.

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
- Treat output as a concept/reference layer.
- Redraw and simplify into our own production SVG.
- Keep prompt, generation date, tool, and transformation notes.

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

### Step 3: Redraw Into Clean Line Art

Goal: create artwork that is designed for coloring, not merely vectorized from a photo.

Rules:

- Simplify forms.
- Remove visual noise.
- Avoid tiny regions.
- Create closed shapes.
- Preserve calm adult composition.
- Make the result recognizable as our art direction.

Output:

- Source vector file.
- Exported SVG.
- Preview thumbnail.

### Step 4: Region Segmentation

Each playable region must have:

- Unique region ID.
- Color number.
- Closed shape.
- Reasonable tap area.
- Center point for number label.

Avoid:

- Hairline slivers.
- Overlapping shapes that block taps.
- Regions too small for mobile.
- Too many similar adjacent colors.

### Step 5: Palette Design

Palette should feel calming but not flat.

Rules:

- 4-8 colors for prototype art.
- 8-16 colors for production art.
- Enough contrast between adjacent regions.
- Avoid all-beige or all-green sets.
- Use warmer accent colors to prevent the app from feeling clinical.

### Step 6: Playability QA

Check:

- Can every region be tapped?
- Are all numbers readable?
- Is the selected color easy to find?
- Does the artwork still look appealing half-complete?
- Does completion feel satisfying?
- Does it work on phone-size screens?

### Step 7: Metadata and Validation

Each artwork should ship with:

- ID.
- Title.
- Category.
- Difficulty.
- Description.
- ViewBox.
- Palette.
- Regions.
- Source record reference.

Validation should catch:

- Duplicate region IDs.
- Missing palette numbers.
- Regions referencing nonexistent palette numbers.
- Empty region arrays.
- Missing metadata.
- Extremely tiny region bounding boxes if possible.

## Transformation Standard

The production output should not feel like a filter pass.

A source is considered meaningfully transformed for our product only when:

- Composition has been intentionally simplified or rebalanced.
- Shapes are redrawn into clean closed coloring regions.
- Palette is newly designed.
- Region count and difficulty are designed for gameplay.
- The final SVG matches Calm Color's visual tone.
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
      artwork.svg
      thumb.svg
      metadata.json
```

## MVP Content Strategy

For the first real starter pack, prioritize:

- 3 original mandalas/patterns.
- 3 botanical pieces.
- 2 cozy still-life pieces.
- 2 calm landscape or abstract pieces.

Prototype target:

- Replace the current rough test SVGs with 3 production-style samples.
- One easy mandala.
- One medium botanical.
- One medium cozy still life.

## Practical Tooling Plan

Phase 1:

- Continue with hand-authored SVG to validate gameplay.
- Improve the current 3 test pieces or replace them.

Phase 2:

- Add artwork schema validation.
- Add source records.
- Add export rules for thumbnails.

Phase 3:

- Test a semi-automated workflow:
  - source image
  - manual redraw or vector cleanup
  - region labeling
  - validation
  - app import

Later:

- Build an internal artwork editor if manual region labeling becomes the bottleneck.

## Immediate Next Step

Create one high-quality production-style sample:

- Category: Botanical.
- Difficulty: Medium.
- Region target: 60-90.
- Palette: 8-10 colors.
- Source: original project art or public domain botanical reference.
- Output: playable SVG plus metadata.

This sample becomes the quality bar for all future artwork.

## Official References

- Google Play Intellectual Property policy: https://support.google.com/googleplay/android-developer/answer/9888072
- U.S. Copyright Office derivative work guidance: https://www.copyright.gov/eco/help-limitation.html
- U.S. Copyright Office copyright basics: https://www.copyright.gov/what-is-copyright/
- Creative Commons Attribution overview: https://wiki.creativecommons.org/wiki/Creative_Commons_%20Attribution
- Europeana Public Domain Usage Guidelines: https://www.europeana.eu/en/rights/public-domain-usage-guidelines
