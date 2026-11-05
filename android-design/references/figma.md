# Figma: build designs as editable layers

Turn a designed flow (HTML screens from [html-flow.md](html-flow.md)), a document, or a brief into editable Figma frames. Scope can be the whole project, one feature group, one feature, or a single node the user names. The HTML screens are the spec: Figma output must match them, built as editable text, auto-layout frames, components and variables, never as a pasted screenshot.

## Before any Figma call

- The Figma MCP server's own rules apply: call `create_session` with the file key and the task first and reuse its session id; load the `figma-use` skill before every `use_figma` call and `figma-generate-design` for composed screens (read them through `get_figma_skill` if no Figma plugin skills are installed: `skill://figma/figma-use/SKILL.md`, `skill://figma/figma-generate-design/SKILL.md`). Load `figma-generate-library` when creating the token variables and components.
- Get the destination: a file URL from the user, or a new file (`figma-create-new-file` skill, then `create_new_file` with the plan the user picks). Writing to a file is outward-facing: confirm the file and page with the user once before the first write.
- Parse node URLs: `node-id=12-345` → `12:345`.

## Scopes

| Request | What to build | Where |
|---|---|---|
| Whole app / project | Foundations page (variables, text styles, components), then one section per feature group with its screens left→right in flow order, plus a "Flow" page with the arrows if asked | New pages in the target file |
| Feature group (e.g. "onboarding", "apply theme") | Its screens + their states, reusing existing components and variables | A section on the page the user names |
| One feature / screen | That screen and its states | Next to related screens |
| One node ("sửa node này") | Update the node in place: read it (`get_metadata`, `get_screenshot`), change only what was asked, keep its components and bindings | The node itself |
| From a document (PRD/spec) | Run the inventory → screen list → direction steps of [html-flow.md](html-flow.md) first (HTML may be skipped only if the user says so), then build | As above |

## Build order

1. **Foundations once per file.** Variables from `tokens.css` (`--md-*` roles as a "Color" collection with Light/Dark modes, `--x-*` extended colours, radii, spacing 4/8/12/16/24/32), text styles for the 15 M3 type roles with the direction's fonts, effect styles only for floating elements. Search the file and its libraries first; reuse before creating.
2. **Components** for everything the kit repeats: status bar, gesture bar, app bar, navigation bar (with item variants), list item (1/2/3-line), buttons (filled/tonal/outlined/text × sizes), chips, switch, radio, search bar, card, native ad (medium/small/full), banner ad, dialog, bottom sheet, page dots, snackbar. Variants for states (selected, disabled).
3. **Screens** as 360×800 frames named `<group>/<screen-id>` (states `<screen-id>--<state>`), auto-layout vertical, built from component instances and variables, text as real text in the product fonts. Icons: import SVGs (Material Symbols Rounded) with `createNodeFromSvg`, never redraw them from primitives.
4. **Images:** upload the flow's `img/` assets with `upload_assets` (raster) and set them as fills on the intended frames; a flattened screenshot of a whole screen is never part of the deliverable. Missing illustrations stay as named placeholder frames listed for the user.
5. **Validate:** read back counts (text, instances, image fills) per screen; one screenshot per group compared with the HTML render in `shots/`; fix differences in place. Check fonts are the product fonts, not Inter by default.

## Faster path when available

If the Figma MCP exposes `html_to_figma`, pass each screen's self-contained HTML (inline tokens.css and kit.css, absolute image URLs or data URIs) to create editable layers directly, then replace repeated parts with components and bind colours to variables. A runnable prototype instead of layers is `send_code_to_figma` (Code Layer); use it only when the user asks for a clickable prototype.

## Reading reference designs

To learn from existing Figma files (the user's references), use `get_metadata` without a node to list pages, `get_screenshot` on pages/sections for overviews and on frames for detail, and record findings in [reference-patterns.md](reference-patterns.md) / `data/topic-worlds.json`. Read-only: never write to a reference file.
