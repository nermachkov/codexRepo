# HTML5 Google Play Project

This repository is being restarted as a larger HTML5-first project intended for Android distribution through Google Play.

The old prototype game has been removed. Current work starts with planning and documentation before implementation.

## Documentation

- [Project Brief](docs/00-project-brief.md)
- [Product Requirements](docs/01-product-requirements.md)
- [Game Design Document](docs/02-game-design-document.md)
- [Technical Architecture](docs/03-technical-architecture.md)
- [Google Play Release Plan](docs/04-google-play-release-plan.md)
- [Privacy, Data, and Compliance](docs/05-privacy-data-compliance.md)
- [Monetization](docs/06-monetization.md)
- [Content and Asset Pipeline](docs/07-content-asset-pipeline.md)
- [QA and Testing](docs/08-qa-testing.md)
- [Roadmap and Backlog](docs/09-roadmap-backlog.md)
- [Open Questions](docs/10-open-questions.md)
- [Color by Number References and Plan](docs/11-color-by-number-references-plan.md)
- [Current Phase Tasks](docs/12-current-phase-tasks.md)
- [Artwork Production Pipeline](docs/13-artwork-production-pipeline.md)

## Current Status

Phase: Phase 1 - Prototype Hardening.

## Prototype

Run a local static server and open the prototype:

```text
npm run serve
```

Then open `http://localhost:4173`.

Current prototype includes:

- Gallery with 3 test artworks.
- SVG-based color by number canvas.
- Numbered palette.
- Tap-to-fill matching regions.
- Progress autosave.
- Completion state.
