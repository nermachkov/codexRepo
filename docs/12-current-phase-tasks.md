# Current Phase Tasks

Current phase: Phase 1 - Raster Prototype Pivot.

Goal: build a raster-based color-by-number proof of concept that can scale to adult anti-stress artwork.

## Phase 1 Definition of Done

Phase 1 is complete when:

- At least 1 raster pipeline artwork can be completed from start to finish.
- The app can load `color_art.png`, `line_art.png`, `region_map.png`, and `metadata.json`.
- Tapping uses the hidden region map.
- Progress survives page refresh.
- The app is usable on mobile-sized screens.
- Touch interactions feel predictable.
- There are no console errors during normal play.
- The uncolored image looks like a real color-by-number page.

## Task Board

Status key:

- Done: implemented and basic checks passed.
- In progress: implemented partly, still needs real-device/browser feel check.
- Open: not started.

### P0: Core Play Reliability

1. Document the raster coloring pipeline.
   - Acceptance: docs explain AI/source PNG intake, quantization, region maps, line art, metadata, and Canvas runtime.
   - Files: `docs/03-technical-architecture.md`, `docs/07-content-asset-pipeline.md`, `docs/13-artwork-production-pipeline.md`, `docs/15-raster-coloring-pipeline.md`.
   - Status: Done.

2. Build local raster pipeline script.
   - Acceptance: a local command accepts one PNG and outputs `color_art.png`, `line_art.png`, `region_map.png`, `thumbnail.png`, and `metadata.json`.
   - Files: `package.json`, new tool script, `public/assets/artworks/<id>/`.
   - Status: Done.

3. Generate first raster POC artwork.
   - Acceptance: one botanical or butterfly/flower sample has a clean palette, readable line art, usable regions, and generated metadata.
   - Files: `public/assets/artworks/<id>/`, `docs/14-artwork-source-records.md`.
   - Status: Done for technical POC; still needs real AI/source artwork quality pass.

4. Add Canvas runtime for raster artwork.
   - Acceptance: the app reveals colored pixels progressively using `region_map.png` hit detection.
   - Files: `src/app.js`, `src/artworks.js`, `src/styles.css`.
   - Status: Open.

5. Validate the first raster coloring loop.
   - Acceptance: select color, tap matching regions, reveal color, save progress, reset, and complete artwork.
   - Files: `src/app.js`, generated artwork assets.
   - Status: Open.

### P1: Existing Prototype Reliability

6. Verify completion flow for current test artworks.
   - Acceptance: every artwork reaches 100% and shows completion state.
   - Files: `src/app.js`, `src/artworks.js`.
   - Status: Open.

7. Add explicit reset artwork action.
   - Acceptance: user can reset the current artwork after confirmation.
   - Files: `src/app.js`, `src/styles.css`, `index.html`.
   - Status: Done.

8. Make progress saving more defensive.
   - Acceptance: corrupted saved data does not break the app, and invalid region IDs are ignored.
   - Files: `src/app.js`.
   - Status: Done.

9. Add completed state to gallery cards.
   - Acceptance: completed artworks are visibly marked in the gallery.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

### P1: Mobile Interaction

10. Improve touch zoom and pan.
   - Acceptance: one-finger tap colors regions; drag pans only when appropriate; pinch zoom works on touch devices.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: In progress.

11. Tune canvas layout for phones.
   - Acceptance: canvas, palette, and controls fit without awkward overlap on narrow screens.
   - Files: `src/styles.css`, `index.html`.
   - Status: In progress.

12. Make palette easier to use with one thumb.
   - Acceptance: selected color is obvious, buttons are large enough, and palette remains reachable on mobile.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

### P2: Feedback and Polish

13. Improve selected-color feedback.
   - Acceptance: selected palette color, matching unfilled regions, and progress state are visually clear.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

14. Add gentle wrong-tap feedback.
   - Acceptance: tapping a region with the wrong selected color gives a soft visual response without feeling punitive.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

15. Polish completion overlay.
    - Acceptance: completion feels calm and premium, and user can return to gallery or replay/reset.
    - Files: `src/app.js`, `src/styles.css`.
    - Status: In progress.

16. Add basic loading and empty states.
    - Acceptance: missing artwork or unavailable data shows a graceful state instead of a broken screen.
    - Files: `src/app.js`, `src/styles.css`.
    - Status: Open.

### P2: Settings and Legal Stub

17. Add settings panel.
    - Acceptance: settings screen or modal exists with sound, vibration, and privacy link placeholders.
    - Files: `index.html`, `src/app.js`, `src/styles.css`.
    - Status: Open.

18. Add privacy link placeholder.
    - Acceptance: the app has an obvious privacy entry point, even if the final hosted policy URL is not ready yet.
    - Files: `index.html`, `src/app.js`.
    - Status: Open.

19. Store settings locally.
    - Acceptance: sound/vibration choices persist after refresh.
    - Files: `src/app.js`.
    - Status: Open.

### P2: Prototype QA

20. Add smoke test checklist.
    - Acceptance: docs include a short manual QA pass for desktop and mobile.
    - Files: `docs/08-qa-testing.md`.
    - Status: Open.

21. Add lightweight artwork data validation script.
    - Acceptance: a local command verifies artwork IDs, palette IDs, and region color references.
    - Files: `package.json`, new validation script file.
    - Status: Open.

22. Verify responsive breakpoints.
    - Acceptance: layout is checked at small phone, large phone, tablet, and desktop widths.
    - Files: `src/styles.css`.
    - Status: Open.

## Recommended Execution Order

1. Build the raster pipeline script.
2. Generate one real raster artwork asset set.
3. Add Canvas runtime support for raster artwork.
4. Verify the full coloring loop on GitHub Pages.
5. Return to mobile polish, settings, legal stub, QA checklist, and validation.

## Out of Scope for This Phase

- Android/Capacitor setup.
- Full production artwork pack.
- Monetization.
- Accounts.
- Cloud saves.
- Ads.
- In-app purchases.
- Full store listing.

## Phase 1 Risks

- Poor segmentation can create tiny unplayable regions if cleanup thresholds are weak.
- Line-art generation can become visually noisy if source art has too much texture.
- Pinch zoom and tap detection can conflict if gesture handling is too clever.
- If we skip validation now, broken artwork data will become expensive to debug later.

## Next Phase Trigger

Move to Phase 2 - Artwork Scale-Up when the raster POC produces one convincing artwork and the app can play it reliably.
