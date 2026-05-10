# Current Phase Tasks

Current phase: Phase 1 - Prototype Hardening.

Goal: turn the current playable prototype into a stable mobile-first web prototype.

## Phase 1 Definition of Done

Phase 1 is complete when:

- All 3 prototype artworks can be completed from start to finish.
- Progress survives page refresh.
- The app is usable on mobile-sized screens.
- Touch interactions feel predictable.
- There are no console errors during normal play.
- Gallery clearly shows completed artworks.
- The app has basic settings and privacy access.
- No debug UI or prototype-only rough edges block user testing.

## Task Board

Status key:

- Done: implemented and basic checks passed.
- In progress: implemented partly, still needs real-device/browser feel check.
- Open: not started.

### P0: Core Play Reliability

1. Verify completion flow for all 3 artworks.
   - Acceptance: every artwork reaches 100% and shows completion state.
   - Files: `src/app.js`, `src/artworks.js`.
   - Status: Open.

2. Add explicit reset artwork action.
   - Acceptance: user can reset the current artwork after confirmation.
   - Files: `src/app.js`, `src/styles.css`, `index.html`.
   - Status: Done.

3. Make progress saving more defensive.
   - Acceptance: corrupted saved data does not break the app, and invalid region IDs are ignored.
   - Files: `src/app.js`.
   - Status: Done.

4. Add completed state to gallery cards.
   - Acceptance: completed artworks are visibly marked in the gallery.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

### P0: Mobile Interaction

5. Improve touch zoom and pan.
   - Acceptance: one-finger tap colors regions; drag pans only when appropriate; pinch zoom works on touch devices.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: In progress.

6. Tune canvas layout for phones.
   - Acceptance: canvas, palette, and controls fit without awkward overlap on narrow screens.
   - Files: `src/styles.css`, `index.html`.
   - Status: In progress.

7. Make palette easier to use with one thumb.
   - Acceptance: selected color is obvious, buttons are large enough, and palette remains reachable on mobile.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

### P1: Feedback and Polish

8. Improve selected-color feedback.
   - Acceptance: selected palette color, matching unfilled regions, and progress state are visually clear.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

9. Add gentle wrong-tap feedback.
   - Acceptance: tapping a region with the wrong selected color gives a soft visual response without feeling punitive.
   - Files: `src/app.js`, `src/styles.css`.
   - Status: Done.

10. Polish completion overlay.
    - Acceptance: completion feels calm and premium, and user can return to gallery or replay/reset.
    - Files: `src/app.js`, `src/styles.css`.
    - Status: In progress.

11. Add basic loading and empty states.
    - Acceptance: missing artwork or unavailable data shows a graceful state instead of a broken screen.
    - Files: `src/app.js`, `src/styles.css`.
    - Status: Open.

### P1: Settings and Legal Stub

12. Add settings panel.
    - Acceptance: settings screen or modal exists with sound, vibration, and privacy link placeholders.
    - Files: `index.html`, `src/app.js`, `src/styles.css`.
    - Status: Open.

13. Add privacy link placeholder.
    - Acceptance: the app has an obvious privacy entry point, even if the final hosted policy URL is not ready yet.
    - Files: `index.html`, `src/app.js`.
    - Status: Open.

14. Store settings locally.
    - Acceptance: sound/vibration choices persist after refresh.
    - Files: `src/app.js`.
    - Status: Open.

### P2: Prototype QA

15. Define artwork production pipeline.
    - Acceptance: docs explain source rules, transformation standard, licensing records, and SVG production workflow.
    - Files: `docs/13-artwork-production-pipeline.md`, `docs/07-content-asset-pipeline.md`.
    - Status: Done.

16. Replace one rough test artwork with a production-style botanical sample.
    - Acceptance: one playable artwork uses the new pipeline standard, has a calmer adult visual style, and becomes the quality bar for future art.
    - Files: `src/artworks.js`, source record docs.
    - Status: Open.

17. Add smoke test checklist.
    - Acceptance: docs include a short manual QA pass for desktop and mobile.
    - Files: `docs/08-qa-testing.md`.
    - Status: Open.

18. Add lightweight artwork data validation script.
    - Acceptance: a local command verifies artwork IDs, palette IDs, and region color references.
    - Files: `package.json`, new validation script file.
    - Status: Open.

19. Verify responsive breakpoints.
    - Acceptance: layout is checked at small phone, large phone, tablet, and desktop widths.
    - Files: `src/styles.css`.
    - Status: Open.

## Recommended Execution Order

1. Complete P0 core play reliability tasks.
2. Complete P0 mobile interaction tasks.
3. Add P1 feedback and polish.
4. Add settings/legal stub.
5. Add QA checklist and validation script.

## Out of Scope for This Phase

- Android/Capacitor setup.
- Real production artwork pack.
- Monetization.
- Accounts.
- Cloud saves.
- Ads.
- In-app purchases.
- Full store listing.

## Phase 1 Risks

- SVG path interaction may feel slow on low-end Android if artwork complexity grows.
- Pinch zoom and tap detection can conflict if gesture handling is too clever.
- If we skip validation now, broken artwork data will become expensive to debug later.

## Next Phase Trigger

Move to Phase 2 - Artwork Format and Pipeline when the prototype is stable enough that new artwork quality becomes the biggest bottleneck.
