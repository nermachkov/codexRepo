# Release Roadmap

This roadmap takes Calm Color: Paint by Number from the current web prototype to a first Google Play production release.

## Current State

Status: first playable web prototype.

Completed:

- Product direction is locked: adult anti-stress color by number.
- App language is English.
- Working title is Calm Color: Paint by Number.
- Visual tone is premium calm with minimalist wellness influence.
- First prototype uses 3 SVG artworks.
- Core web prototype exists with gallery, palette, tap-to-fill regions, progress saving, and completion state.

Not started:

- Production artwork pipeline.
- Android packaging.
- Play Console setup.
- Store assets.
- Real device QA.

## Release Principles

- Keep version 1.0 intentionally small and polished.
- Avoid accounts, ads, push notifications, and analytics in the first release unless there is a clear product reason.
- Prefer bundled starter content so the first app works offline.
- Treat content production as a core system, not as a late asset task.
- Use Play Console internal testing before any wider testing track.

## Phase 1: Prototype Hardening

Target: 1-2 weeks.

Goal: turn the current playable prototype into a stable mobile-first web prototype.

Deliverables:

- Mobile layout pass for small phones and tablets.
- Touch-first zoom and pan behavior.
- Better selected-color feedback.
- Gentle wrong-tap feedback.
- Reset artwork action.
- Completed artwork state in the gallery.
- Settings stub for sound, vibration, and privacy link.
- Basic loading and empty states.
- No visible debug UI.

Exit criteria:

- All 3 prototype artworks are playable from start to completion.
- Progress survives refresh.
- The app works in Chrome on Android.
- No console errors during normal play.
- UI text fits on mobile screens.

## Phase 2: Artwork Format and Pipeline

Target: 1-2 weeks.

Goal: make new coloring pages cheap and reliable to add.

Deliverables:

- Documented artwork JSON/SVG schema.
- Region ID convention.
- Palette convention.
- Difficulty definitions.
- Thumbnail convention.
- Validation tool for duplicate IDs, missing palette numbers, empty regions, and invalid artwork metadata.
- Licensing log for every non-test artwork source.
- First production content plan.

Exit criteria:

- A new artwork can be added without changing app code.
- Validation catches broken artwork before release.
- Every artwork has source/licensing notes.
- We can estimate time per new page.

## Phase 3: MVP Feature Build

Target: 2-4 weeks.

Goal: build the real first-release product loop.

Deliverables:

- Main gallery.
- Category filters.
- Artwork detail screen.
- Coloring canvas.
- Numbered palette.
- Zoom and pan.
- Progress autosave.
- Completion screen.
- Completed gallery.
- Settings screen.
- Privacy/legal screen.
- 10-20 bundled starter artworks.

Recommended starter content:

- 5 easy artworks.
- 10 medium artworks.
- 5 hard artworks.
- Categories: mandalas, botanical, calm landscapes, abstract patterns, cozy still life.

Exit criteria:

- A tester can open the app, choose art, color it, finish it, and find completed work without explanation.
- Session has a clear beginning, middle, and end.
- App feels calm, adult, and consistent.
- No P0 or P1 product bugs remain.

## Phase 4: Android Packaging

Target: 1-2 weeks.

Goal: create an installable Android app for testing.

Recommended path:

- Use Capacitor for the first Android build.
- Keep the app offline-first with bundled starter content.

Deliverables:

- Android project wrapper.
- Unique application ID.
- App icon.
- Splash behavior.
- Back button behavior.
- Android lifecycle handling.
- Release signing setup.
- Android App Bundle build.
- Version code and version name convention.
- Target SDK set to meet current Google Play requirements.

Exit criteria:

- Debug build installs on a real Android device.
- Release build can be uploaded to Play Console internal testing.
- App resumes correctly after backgrounding.
- Android back button never traps the user.
- No unnecessary Android permissions are requested.

## Phase 5: Compliance and Store Preparation

Target: 1-2 weeks.

Goal: prepare everything Google Play needs before review.

Deliverables:

- Public privacy policy URL.
- In-app privacy policy link.
- Data Safety form answers.
- Content rating questionnaire.
- Target audience declaration.
- Store title, short description, and full description.
- App icon.
- Feature graphic.
- Phone screenshots.
- Support email.
- Closed testing plan.

Google Play requirements to account for:

- New apps and updates submitted after 2025-08-31 must target Android 15, API level 35 or higher, except Wear OS, Android Automotive OS, and Android TV.
- All developers must complete the Data Safety form for published apps, even if the app does not collect user data.
- Apps should request only permissions needed for current user-facing features.
- Internal testing is the fastest first Play Console track; wider closed testing may be required before production depending on developer account status.

Exit criteria:

- Store listing is complete enough for internal testing.
- Data Safety answers match the actual app and SDK behavior.
- Privacy policy matches the actual app behavior.
- Screenshots show real app UI.
- No review-risk feature is half-implemented.

## Phase 6: Internal and Closed Testing

Target: 2-3 weeks.

Goal: verify the Android build on real devices and satisfy pre-release testing needs.

Deliverables:

- Internal testing release.
- Device test matrix.
- Tester feedback form.
- Crash and bug triage process.
- Closed testing release if needed.
- Performance checks on low-end Android devices.

Device matrix:

- Small Android phone.
- Mid-size Android phone.
- Large Android phone.
- Android tablet if tablet support is claimed.
- At least one lower-memory device.

Exit criteria:

- No launch crashes.
- No P0 or P1 bugs.
- Coloring input feels reliable on touchscreens.
- Long coloring sessions do not degrade badly.
- Store listing and policy declarations still match the build.

## Phase 7: Production Release

Target: 1 week after testing approval.

Goal: publish version 1.0 with controlled risk.

Deliverables:

- Production release candidate.
- Release notes.
- Staged rollout plan.
- Support response plan.
- Hotfix plan.
- Post-launch metrics checklist.

Recommended rollout:

- Start at a small staged rollout.
- Watch crashes, ANRs, install issues, and early reviews.
- Increase rollout only after stability is confirmed.

Exit criteria:

- Version 1.0 is live on Google Play.
- No critical review issue is open.
- Hotfix path is known.
- Next content update is planned.

## Release Blockers

These block release until fixed:

- App cannot complete an artwork.
- Progress can be lost during normal use.
- Android app crashes on launch or resume.
- Store declarations do not match actual app behavior.
- Privacy policy is missing or inaccurate.
- App requests unnecessary sensitive permissions.
- Production artwork has unclear usage rights.
- Screenshots do not match the submitted build.

## Version 1.0 Definition of Done

Version 1.0 is ready when:

- 10-20 artworks are bundled.
- Core coloring loop is polished.
- Android build passes real-device testing.
- App works offline for bundled content.
- Store listing is complete.
- Privacy policy and Data Safety answers are accurate.
- No accounts, ads, purchases, analytics, or push notifications are present unless intentionally added and documented.
- Support email is ready.

## Next Sprint

Recommended next sprint scope:

1. Improve the current prototype for mobile touch.
2. Add a completed-art gallery state.
3. Create the artwork validation tool.
4. Document the artwork schema.
5. Decide the Android packaging stack formally.
6. Create 2-3 more production-style SVG pages to test the pipeline.

## Backlog

Product:

- Finalize one-sentence store promise.
- Decide whether launch is fully free or free with future premium packs.
- Define retention system for version 1.1.
- Define content categories beyond the starter pack.
- Decide whether tablets are officially supported at launch.

Design:

- Final logo direction.
- App icon concepts.
- Store screenshot style.
- Completion screen visual direction.
- Sound and haptic tone.

Technical:

- Capacitor setup.
- Artwork schema validation.
- Save manager.
- Asset loader.
- Canvas performance fallback if SVG becomes slow.
- Automated smoke checks.
- Production build process.

Content:

- Starter pack artwork list.
- Licensing spreadsheet or log.
- SVG authoring guide.
- Thumbnail export process.
- Difficulty QA checklist.

Compliance:

- Privacy policy.
- Data Safety answers.
- Content rating.
- Target audience declaration.
- Play Console app access notes if required.

## Official References

- Google Play target API requirements: https://developer.android.com/google/play/requirements/target-sdk
- Google Play testing tracks: https://support.google.com/googleplay/android-developer/answer/9845334
- Google Play Data Safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play Developer Program Policy: https://support.google.com/googleplay/android-developer/answer/16313518
