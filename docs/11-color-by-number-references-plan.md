# Color by Number References and Plan

## Market References

These references were checked on 2026-05-10.

### Happy Color

Reference: https://play.google.com/store/apps/details?id=com.pixel.art.coloring.color.number

Useful signals:

- Very large content library.
- Relaxation, stress relief, and art therapy positioning.
- Categories such as nature, animals, mandalas, branded/exclusive scenes, and original art.
- Search and discovery are important once the library grows.
- Uses ads and in-app purchases.
- User complaints mention ad interruptions and hint limits, which suggests an opportunity for a calmer first experience.

### Paint by Number: Coloring Game

Reference: https://play.google.com/store/apps/details?id=paint.by.number.pixel.art.coloring.drawing.puzzle

Useful signals:

- Very large library and broad appeal.
- Strong category breadth: fantasy, nature, animals, geometric patterns.
- Uses story-driven coloring and collection events as retention systems.
- Uses ads and in-app purchases.
- User reviews suggest price and ad frequency can become pain points.

### Coloring Book: Color by Number

Reference: https://play.google.com/store/apps/details?id=com.iceors.colorbook.release

Useful signals:

- Clear beginner promise: no drawing skill required.
- Uses light/gray numbered regions and corresponding numbered paint.
- Famous paintings are used as a content angle.
- Simple feature language is easy for store conversion.

### Artbook: Paint by Number

Reference: https://apps.apple.com/us/app/artbook-paint-by-number/id1424916256

Useful signals:

- Broad content categories: flowers, animals, mandalas, fantasy, portraits.
- Family-friendly positioning.
- Gesture expectations: swipe coloring, two-finger zoom.

### Color by Pixel

Reference: https://apps.apple.com/us/app/color-by-pixel-paint-by-number/id1464643592

Useful signals:

- Pixel-art variant with different interaction feel.
- Power-up ideas such as bombs or lightning.
- Multiplayer coloring exists in the market, but should not be MVP.

## Opportunity

The category is crowded, so a first release should not try to beat market leaders by content volume. It should compete on clarity, speed, calm UX, and a reliable content pipeline.

Potential positioning:

- A cleaner, less intrusive color by number app.
- Offline starter packs.
- Adult anti-stress themed collections.
- Polished touch feel and readable regions.
- No account, no forced social layer, no aggressive monetization in MVP.

## Locked Product Decisions

- Language: English first.
- Working title: Calm Color: Paint by Number.
- Style: adult anti-stress coloring.
- Visual tone: premium calm with minimalist wellness influence.
- Art approach: mixed, combining original art, public-domain-inspired sources, and generated or commissioned references where licensing is clear.
- First prototype: 3 test artworks using SVG-based coloring.

## ASO Positioning

### Chosen App Name

Calm Color: Paint by Number

Why this title:

- Fits Google Play's 30-character app name limit.
- Puts the distinct brand first: Calm Color.
- Includes the high-intent category phrase: Paint by Number.
- Avoids promotional terms such as Free or No Ads.
- Avoids misleading ranking claims or excessive keyword stuffing.

### Visual Tone

Premium calm with minimalist wellness influence.

This tone should feel:

- Quiet and adult.
- Soft but not childish.
- Clean enough for wellness positioning.
- Warm enough to avoid feeling clinical.
- More polished than loud casual-game coloring apps.

### Store Positioning Draft

Short pitch:

Relax with calm color-by-number art made for mindful adult coloring.

Core keywords to support naturally in copy:

- color by number
- paint by number
- adult coloring
- anti-stress coloring
- relaxing coloring
- coloring book

## MVP Product Shape

### First Release Promise

Pick a picture, follow the numbers, relax, and complete a beautiful artwork in a few minutes.

### MVP Feature Set

- Gallery screen.
- 10-20 bundled starter artworks.
- Category filters.
- Artwork detail screen.
- Coloring canvas.
- Numbered palette.
- Tap-to-fill matching regions.
- Zoom and pan.
- Progress autosave.
- Completed artwork gallery.
- Completion celebration.
- Settings: music, SFX, vibration, language.
- Privacy policy link.

### Stretch Features

- Daily picture.
- Hints.
- Collection badges.
- Simple streak.
- Time-lapse replay.
- Share completed image.
- New downloadable packs.

### Explicit Non-MVP

- User accounts.
- Cloud saves.
- Ads.
- In-app purchases.
- Multiplayer.
- User-generated imports.
- AI-generated in-app artwork.

## Core Screens

1. Splash / loading.
2. Main gallery.
3. Category view.
4. Artwork detail.
5. Coloring canvas.
6. Completion screen.
7. Completed gallery.
8. Settings.
9. Privacy / legal.

## Coloring Canvas Requirements

- Clear numbered regions.
- Selected color is obvious.
- Matching unfilled regions can be subtly highlighted.
- Filled regions should feel satisfying without being visually noisy.
- Wrong taps should be gentle, not punitive.
- Pinch zoom and pan must feel smooth.
- The palette should be reachable with one thumb.
- Progress should save frequently.

## Artwork Pipeline

The hardest production problem is turning art into playable numbered regions.

Pipeline options:

1. Manual vector authoring.
2. Convert vector art into numbered SVG regions.
3. Use raster segmentation tooling, then clean manually.
4. Build an internal editor later.

Recommended path:

- MVP uses manually prepared vector/SVG artwork.
- Each region has an ID and color number.
- A small validation tool checks missing numbers, duplicate IDs, tiny regions, and palette consistency.
- Later, build a content editor if the project needs scale.

## Technical Plan

### Prototype

- TypeScript.
- SVG-first coloring page for fastest validation.
- Local JSON metadata for artwork.
- Local storage or IndexedDB for progress.
- Browser build first.

### Performance Upgrade Path

If SVG is too slow on Android:

- Compile paths into canvas draw commands.
- Use an offscreen color-coded hit map for region lookup.
- Keep SVG only as source format.

### Android Packaging

Initial recommendation:

- Capacitor if assets are bundled and offline-first.
- Trusted Web Activity only if we commit to hosted PWA infrastructure.

For this project, Capacitor is likely safer because a coloring app benefits from bundled starter content and more predictable offline behavior.

## Content Plan

MVP starter categories:

- Mandalas and symmetric patterns.
- Botanical line art.
- Calm landscapes.
- Abstract anti-stress patterns.
- Cozy interiors and still life.

Difficulty tiers:

- Easy: 20-60 regions.
- Medium: 60-160 regions.
- Hard: 160-400 regions.

MVP target:

- 5 easy artworks.
- 10 medium artworks.
- 5 hard artworks.

## Monetization Plan

Prototype:

- No monetization.

First production candidate:

- Free app with free starter pack.
- No ads at launch unless retention and content volume justify it.

Later:

- Premium themed packs through Google Play Billing.
- Optional one-time remove-ads only if ads are added.
- Avoid subscription until the app has frequent content updates.

## Compliance Plan

First release should avoid:

- Account creation.
- Personal data collection.
- Location.
- Advertising ID.
- Push notifications.
- Third-party ad SDKs.

This keeps Data Safety and privacy policy simpler.

## Next Build Milestone

Build a vertical prototype with:

- One gallery screen.
- Three sample artworks.
- One SVG-based coloring canvas.
- Palette selection.
- Tap-to-fill regions.
- Progress save.
- Completion detection.

Recommended prototype artworks:

1. Simple mandala, easy difficulty.
2. Botanical branch or flower arrangement, medium difficulty.
3. Calm landscape or cozy still life, medium difficulty.

## Questions To Decide

1. Should the first release be fully free, paid, or free with future premium packs?
2. Should we use Capacitor as the Android path from the beginning?
3. Do you want the repository to stay public while the product idea forms?
