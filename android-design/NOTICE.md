# Notices

android-design is a derivative work. It adapts material from the projects below to native Android
(Jetpack Compose + Material 3). Their licence texts are in `licenses/`.

## Impeccable

- Source: https://github.com/pbakaus/impeccable (skill v4.8.0, engine 0.1.18, retrieved 2026-11-04)
- Licence: Apache License 2.0 (`licenses/impeccable-APACHE-2.0.txt`); upstream notices in `licenses/impeccable-NOTICE.md`
  (Impeccable's Android platform rules are in turn distilled from ehmo's `platform-design-skills`, MIT).
- Used: the workflow (context → playbook → craft floor), modes, command set and playbooks, craft floor, native
  audit and adapt references, Android platform rules, critique rubric and personas.
- Changed: every reference rewritten for Compose/Material 3; the Rust engine, CLI verbs, browser overlay,
  live/generate modes, design hook, detector, image-comp pipeline, decision server and `.impeccable/`
  storage removed; context discovery reimplemented as instructions (`references/context.md`); reports stored
  as markdown under `docs/design/`; the concept roll replaced by `scripts/deal.mjs`; Persuade/Read/Experience
  modes reduced to notes; new Android-specific rules added (insets, predictive back, font scale, contrast
  levels, Vietnamese typography and copy).

## Taste Skill

- Source: https://github.com/Leonxlnx/taste-skill (v2.1.5, retrieved 2026-11-04)
- Licence: MIT (`licenses/taste-skill-MIT.txt`)
- Used: the direction-dealing method; the palette, type and app-style library (`library/palettes.json`,
  `type.json`, `app.json`); the tells registry; findings of its study of product screens.
- Changed: library trimmed and re-shaped into `data/` by `scripts/maintain/build-data.mjs`; Material 3
  mappings, three Android styles, Android product kinds with Vietnamese keywords and phone patterns added;
  Vietnamese glyph coverage added from Google Fonts and Fontshare metadata; web inspector, lint and HTML
  scaffolding removed; findings restated for phone screens.

## material-color-utilities

- Source: https://github.com/material-foundation/material-color-utilities, npm `@material/material-color-utilities` 0.4.0
- Licence: Apache License 2.0 (`scripts/vendor/material-color-utilities/LICENSE`)
- Changed: only the compiled `.js` files are vendored; extensionless relative imports in 10 files were given a
  `.js` suffix so Node's ESM loader resolves them. No logic changes.

## Fonts

No font files are distributed. `data/type.json` names typefaces from Google Fonts (SIL OFL) and Fontshare
(ITF Free Font License, one under SIL OFL); check each licence before embedding a font in an app.
