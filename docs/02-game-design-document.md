# Game Design Document

## Design Status

The project direction is locked as an English-first adult anti-stress color by number / paint by number app. The exact title, brand identity, and monetization model still need decisions.

## Core Concept

A relaxing mobile coloring app where each illustration is divided into numbered regions. The player selects a color number, taps matching regions, watches the picture fill in, and completes themed collections over time.

## Product Decisions

- Language: English first.
- Style: adult anti-stress coloring.
- Art approach: mixed, combining original art, public-domain-inspired sources, and generated or commissioned references where licensing is clear.
- First prototype: 3 test artworks using SVG-based coloring.

## Core Design Pillars

- Calm: the app should feel relaxing, not demanding.
- Immediate: the player understands the first action instantly.
- Tactile: every tap produces clear visual feedback.
- Readable: numbered regions, selected color, and remaining areas are always clear.
- Expandable: new artwork packs can be added without rewriting the engine.
- Mobile-native: zoom, pan, palette, and touch targets are designed for phones first.

## Session Structure

- Entry: gallery, continue last artwork, or daily picture.
- Selection: choose an artwork by category, difficulty, or collection.
- Coloring: select color number, tap highlighted matching regions.
- Completion: final reveal, small celebration, save to completed gallery.
- Return: choose another picture, continue collection, or replay.

## Core Loop

1. Pick an artwork.
2. Select a numbered color.
3. Find and fill matching regions.
4. Watch progress increase.
5. Complete the artwork.
6. Unlock progress, collection completion, or another picture.

## MVP Feature Set

- Gallery screen.
- 10-20 bundled starter artworks.
- Category filters.
- Artwork detail screen.
- Coloring canvas.
- Numbered palette.
- Tap-to-fill matching regions.
- Smooth zoom and pan.
- Progress autosave.
- Completed artwork gallery.
- Completion celebration.
- Settings: music, SFX, vibration, language.
- Privacy policy link.

## Stretch Features

- Daily picture.
- Hints.
- Collection badges.
- Simple streak.
- Time-lapse replay.
- Share completed image.
- New downloadable packs.

## Explicit Non-MVP

- User accounts.
- Cloud saves.
- Ads.
- In-app purchases.
- Multiplayer.
- User-generated imports.
- AI-generated in-app artwork.

## Progression Ideas

- Completed collections.
- Daily picture streak.
- Difficulty tiers by region count.
- Cosmetic frames for completed art.
- Themed packs.
- Milestone badges.

## Input Guidelines

- Tap to fill selected-number regions.
- Pinch zoom and two-finger pan should be supported.
- One-finger pan mode may be needed when zoomed.
- Wrong taps should be gentle: subtle shake, small sound, or no-op.
- The palette should be reachable with one thumb.
- The selected color and remaining region count should be obvious.

## Save System

Initial save scope:

- Settings.
- Per-artwork progress.
- Completed artworks.
- Unlocked packs or categories.
- Hint count if hints are limited.

Initial storage:

- Browser local storage for simple prototype.
- IndexedDB for larger artwork progress if needed.
- Android wrapper storage strategy to be decided later.

## First Artwork Categories

Suggested MVP categories:

- Mandalas and symmetric patterns.
- Botanical line art.
- Calm landscapes.
- Abstract anti-stress patterns.
- Cozy interiors and still life.

Suggested difficulty tiers:

- Easy: 20-60 regions.
- Medium: 60-160 regions.
- Hard: 160-400 regions.

## Design Deliverables Needed Next

- Working title.
- Brand identity.
- MVP artwork count.
- Region generation pipeline.
- Hint behavior.
- Monetization stance.
