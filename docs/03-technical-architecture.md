# Technical Architecture

## Architecture Goal

Build a maintainable HTML5 project that runs well in modern browsers and can be packaged for Android without rewriting the core product.

## Recommended Stack

To be finalized after the game concept is chosen.

Candidate stacks:

- Vanilla TypeScript plus Canvas for maximum control and small builds.
- Phaser for 2D games with scenes, input, audio, physics, and asset loading.
- PixiJS for custom 2D rendering when game logic is mostly bespoke.

Initial recommendation: Phaser if the project is a 2D game with scenes and common game systems. Vanilla TypeScript if the project is more app-like or highly custom.

## High-Level Modules

- App bootstrap.
- Scene manager.
- Asset loader.
- Input manager.
- Audio manager.
- Save manager.
- Settings manager.
- Game state.
- UI layer.
- Analytics adapter.
- Platform adapter.
- Android wrapper adapter.

## Platform Adapter

The web core should not call Android-specific APIs directly. Use a platform adapter with methods such as:

- `getSafeAreaInsets`
- `saveData`
- `loadData`
- `openPrivacyPolicy`
- `purchaseProduct`
- `restorePurchases`
- `share`
- `vibrate`

For browser builds, these methods can be no-op or web equivalents. For Android builds, the wrapper can implement native behavior.

## Rendering

Baseline:

- 2D Canvas or WebGL through the selected engine.
- Fixed logical resolution with responsive scaling.
- Safe area support.
- Avoid DOM-heavy gameplay UI during active scenes.

## Asset Loading

Principles:

- Load only critical startup assets first.
- Show a lightweight loading screen.
- Lazy-load later worlds, levels, or cosmetic packs.
- Keep filenames stable and cache-friendly.

## Storage

Prototype:

- Local storage for simple settings.
- IndexedDB for larger save data if needed.

Production:

- Use a save abstraction.
- Prepare migration logic from version 1 onward.
- Never assume storage writes always succeed.

## Android Packaging Paths

### Trusted Web Activity

Best when:

- The app is hosted as a PWA.
- Native features are minimal.
- Offline behavior is handled through service worker.

Requires:

- Valid HTTPS hosting.
- Web app manifest.
- Service worker.
- Asset Links verification.

### Capacitor

Best when:

- Native plugins are needed.
- Play Billing may be added.
- Offline assets should ship with the APK/AAB.
- More control over Android lifecycle is needed.

Requires:

- Android project.
- Build signing.
- Native dependency maintenance.

### Custom WebView

Best only when:

- There are unusual native requirements.
- Existing wrappers are not enough.

Risk:

- More maintenance.
- More Android-specific bugs.

## Build Outputs

Expected outputs:

- Development browser build.
- Production web build.
- Android debug build.
- Android release AAB.

## Repository Structure Proposal

```text
docs/
src/
  app/
  game/
  platform/
  ui/
  assets/
public/
android/
tests/
tools/
```

## Technical Risks

- Mobile browser memory limits.
- Audio autoplay restrictions.
- Storage failures in some browser contexts.
- Android WebView differences.
- Large asset downloads.
- Google Play policy changes.

## Engineering Rules

- Keep game logic separate from rendering where reasonable.
- Keep platform APIs behind adapters.
- Version save data from day one.
- Add performance checks before content grows.
- Avoid third-party SDKs until their data and policy impact is understood.
