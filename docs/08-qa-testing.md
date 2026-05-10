# QA and Testing

## Testing Goals

- Prove the app starts reliably.
- Prove the core loop works.
- Prove performance is acceptable on Android.
- Prove the app survives pause, resume, rotation policy, and network changes.
- Prove Google Play review requirements are satisfied.

## Test Environments

- Desktop Chrome.
- Android Chrome.
- Android packaged debug build.
- Android packaged release build.
- At least one low or mid-range Android device.

## Manual Smoke Test

- App launches.
- Main menu is visible.
- Start action works.
- Core scene loads.
- Touch controls work.
- Pause works.
- Resume works.
- Settings persist.
- Audio toggle works.
- App survives background and foreground.
- No visible layout clipping on small phones.

## Performance Test

- Startup time.
- Average FPS.
- Memory growth over 10 minutes.
- Asset loading time.
- Battery and heat observation during longer play.

## Compatibility Test

- Different aspect ratios.
- Notch and safe area behavior.
- Android back button.
- Screen rotation policy.
- Offline mode.
- Slow network if network is used.

## Store Readiness Test

- Release build signed.
- Version code increased.
- Privacy policy link works.
- Store screenshots match app.
- Data Safety answers match app and SDKs.
- Content rating questionnaire reviewed.
- No debug logs or development buttons visible.

## Bug Severity

P0:

- Crash on launch.
- Cannot start core experience.
- Data loss.
- Policy-blocking issue.

P1:

- Major gameplay blocker.
- Broken save.
- Severe performance issue.

P2:

- Visual bug.
- Minor input issue.
- Non-blocking UI problem.

P3:

- Polish issue.
- Copy change.
- Small tuning.

## Test Log

| Date | Build | Device | Result | Notes |
| --- | --- | --- | --- | --- |
| 2026-05-10 | Docs only | Not applicable | Not tested | Implementation not started |
