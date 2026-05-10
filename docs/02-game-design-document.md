# Game Design Document

## Design Status

The final concept is not locked. This document defines the structure that the game design must fill before production implementation starts.

## Concept Options

### Option A: Skill Arcade

Short sessions, direct touch control, escalating challenge, score chasing.

Strengths:

- Easy to prototype.
- Good fit for HTML5.
- Works offline.
- Simple Google Play compliance if no accounts or ads.

Risks:

- Needs strong polish to stand out.
- Retention may be weak without progression.

### Option B: Puzzle Progression

Level-based puzzle game with handcrafted stages, stars, hints, and unlocks.

Strengths:

- Better long-term structure.
- Easier to test and balance.
- Friendly to mobile sessions.

Risks:

- Requires a lot of content.
- Needs level editor or efficient content pipeline.

### Option C: Management Lite

A lightweight sim or idle-management game with upgrades and events.

Strengths:

- Strong progression.
- Can be expanded over time.

Risks:

- Economy design can become complex.
- Monetization and balance can create review and UX risks.

## Recommended First Direction

Start with either Skill Arcade plus progression, or Puzzle Progression. Both are safer for an HTML5-first Android launch than multiplayer, 3D action, or backend-heavy systems.

## Core Design Pillars

- Immediate: the player understands the first action instantly.
- Tactile: every action produces clear visual and audio feedback.
- Fair: failure should feel readable, not random.
- Expandable: new content can be added without rewriting the engine.
- Mobile-native: no tiny controls or desktop assumptions.

## Session Structure

- Entry: menu or continue button.
- Warm-up: first few seconds are readable.
- Escalation: challenge grows.
- Payoff: success, reward, score, or unlock.
- Return: clear next action.

## Progression Ideas

- Level unlocks.
- Cosmetic unlocks.
- Score milestones.
- Daily challenges without requiring server time.
- Skill badges.
- Optional difficulty modes.

## Economy Guidelines

- Avoid hard currency until the core loop is fun.
- Keep early rewards generous.
- Do not design around frustration.
- If purchases are added later, they must be optional and use Google Play Billing.

## Input Guidelines

- Single-thumb play preferred.
- Avoid multi-touch requirements unless central to the design.
- Support pause on app backgrounding.
- Never require precision smaller than a comfortable finger target.

## Audio Guidelines

- Music and SFX separate toggles.
- Muted by default is not required, but the mute control must be easy to find.
- No audio should block gameplay understanding.

## Save System

Initial save scope:

- Settings.
- Best scores.
- Level progress.
- Unlocked content.

Initial storage:

- Browser local storage or IndexedDB for web prototype.
- Android wrapper storage strategy to be decided later.

## Design Deliverables Needed Next

- Final genre.
- Theme.
- Main character/object/fantasy.
- Core mechanic.
- Win and fail conditions.
- First 10 minutes of content.
- MVP content list.
