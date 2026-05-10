# Project Brief

## Working Name

To be decided.

## Goal

Create a substantial HTML5-based interactive project that can run in a browser and be packaged for Android distribution through Google Play.

## Product Direction

The project should be designed as a mobile-first experience, not as a desktop game squeezed into a phone screen. The first implementation target is a polished vertical slice that proves the core loop, performance, input model, visual style, and Android packaging path.

## Target Platforms

- Primary: Android phones through Google Play.
- Secondary: desktop browser for development and demos.
- Optional later: tablets, PWA install, iOS web build.

## Distribution Strategy

The HTML5 project will live as a web app, then be packaged for Android. Candidate packaging paths:

- Trusted Web Activity if the app is hosted and behaves like a high-quality PWA.
- Capacitor if native plugins, offline assets, Android lifecycle hooks, or Play Billing integration are needed.
- Custom Android WebView shell only if the project needs low-level native control.

Initial recommendation: start as a clean web app, keep the Android wrapper decision open until monetization, offline mode, notifications, and native APIs are defined.

## Success Criteria

- Starts in under 3 seconds on mid-range Android devices.
- Maintains stable 60 FPS during normal gameplay or interaction.
- Works with touch input as the primary control scheme.
- Has a complete first-session experience: launch, onboarding, core loop, pause, settings, return flow.
- Has a documented Google Play submission path before production coding begins.
- Avoids unnecessary sensitive permissions and risky SDKs.

## Non-Goals For The First Milestone

- Multiplayer.
- Real-money economy.
- Account system.
- Heavy native Android features.
- Complex backend.
- Ads or purchases until the core loop is validated.

## Decision Principle

If a feature makes the Google Play review, privacy disclosure, performance budget, or mobile UX significantly harder, it should earn its place through clear product value.
