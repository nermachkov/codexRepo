# Content and Asset Pipeline

## Asset Categories

- UI icons.
- Backgrounds.
- Characters or objects.
- Effects.
- Audio SFX.
- Music.
- Fonts.
- Store graphics.
- Screenshots and promotional images.

## File Principles

- Use consistent names.
- Keep source files separate from optimized runtime files.
- Track licenses for every external asset.
- Avoid unlicensed copyrighted material.
- For coloring pages, follow the dedicated artwork production pipeline in `docs/13-artwork-production-pipeline.md`.

## Proposed Structure

```text
assets-source/
  art/
  audio/
  store/
public/assets/
  images/
  audio/
  fonts/
```

## Runtime Asset Rules

- Compress images.
- Use atlases if many sprites are used.
- Keep startup bundle small.
- Lazy-load later content.
- Provide fallback if an optional asset fails.

## Art Direction Placeholder

Current direction:

- Adult anti-stress color-by-number artwork.
- Premium calm with minimalist wellness influence.
- Mixed content approach: original, commissioned, public-domain-inspired, and carefully licensed/adapted sources.
- SVG-first production until performance or content scale requires a canvas fallback.

## Audio Direction Placeholder

Need decisions:

- Music mood.
- SFX style.
- Whether audio is essential to gameplay.
- Mute defaults.

## Store Assets

Google Play will need:

- App icon.
- Feature graphic.
- Phone screenshots.
- Optional tablet screenshots.

Store visuals must show real app screens or honest promotional composition. Do not ship screenshots from unfinished UI.

## Licensing Checklist

For every asset:

- Source.
- License.
- Author.
- Modification notes.
- Commercial use allowed.
- Attribution requirement.
- Derivative/adaptation rights.
- Store listing usage allowed.
- Proof or record path.

## Localization

Initial language:

- English.

Recommended:

- Build text through a localization table from the start.
- Avoid hardcoded text in gameplay code.
- Keep store listing copy separate from in-app copy.
