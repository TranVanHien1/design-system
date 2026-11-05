# Figma: build designs as editable layers

Turn a designed flow (HTML screens from [html-flow.md](html-flow.md)), a document, a brief or a written spec into editable Figma frames. Scope can be the whole project, one feature group, one feature, or a single node. Output is editable text, auto-layout frames, components and variables, never a pasted screenshot.

Rules marked **(gate)** are checked by `scripts/figma/audit.js` and must pass before the work is reported done. They come from the 2026-11-05 Khóa Kín builds: v1 from HTML, then a direct-to-Figma glass-dark redesign. The audit of that redesign found 23 of 31 component sets without a description, 9 sets with icons that could not be swapped, 32 unbound paints, and a theme grid drawn as loose frames although a Theme tile component existed.

## Before any Figma call

- The Figma MCP server's rules apply:
  - Call `create_session` once with the file key and reuse its session id.
  - Load `figma-use` before every `use_figma` call, and `figma-generate-design` for composed screens.
  - Load `figma-generate-library` when creating tokens and components.
  - Read these skills through `get_figma_skill` (`skill://figma/<name>/SKILL.md`) when no Figma plugin is installed.
  - Pass `skillNames` on every `use_figma` call.
- **Destination.** Use a file URL from the user, or a new file (`figma-create-new-file` skill, then `create_new_file`). Writing to a file is outward-facing: confirm the file and page once before the first write. Parse `node-id=12-345` → `12:345`.
- **Plan limits.** Check the user's plan once (`whoami`) and plan for its limits:
  - Starter allows **3 pages per file** and **1 mode per variable collection**. Light and dark therefore cannot share one collection: give each theme its own collection named after it (e.g. "Glass Dark"), and keep a theme's icons and styles separate as well.
  - The MCP call budget is small. Count every Figma tool call and report the number.
  - Stop and report on any limit or rate error; never retry it in a loop.

## Source of truth

- **Default: the HTML flow.** It is the spec, and Figma output must match the renders in `shots/`.
- **Direct to Figma.** When the user says to skip HTML (e.g. "bỏ qua html, đến thẳng figma"), first write a spec to `figma-spec.md` in the project and build from it. The spec must cover:
  - **Tokens:**
    - every colour with its role
    - surfaces (fill, blur, stroke, shadow)
    - radius and spacing scales
    - type ramp and font
  - **Contrast:** check every text/background pair with `node <skill>/scripts/figma/contrast.mjs`. For glass, composite it with `--over <screen base>`. For gradients, pass **every stop**: the worst stop counts. Body text needs 4.5:1; large text and UI marks need 3:1.
    - A spec colour that fails is changed in the spec before the build; it is never "kept because it was specified".
    - Example from the glass build: white on gradient stop `#5B8CFF` = 3.16:1 ✗, `#4573FF` = 4.08:1 ✗, `#3A66F5` = 4.77:1 ✓.
  - **Components:** each with its variants, properties and states (see §Component rules).
  - **Screens and states:** the list to build, with the content source (HTML project, analysis doc or brief).
  - **Placeholders:** the images that will come later, with their final file names.

## Scopes

| Request | What to build | Where |
|---|---|---|
| Whole app / project | A Foundations + Components page, then a Screens page with one section per feature group, screens left→right in flow order | New pages (mind the 3-page Starter limit) |
| Redesign of an existing Figma build | New Components and Screens pages next to the old one, which stays untouched for comparison | Same file |
| Feature group | Its screens and states, reusing existing components and variables | A section on the named page |
| One feature / screen | That screen and its states | Next to related screens |
| One node ("sửa node này") | Update in place: read it (`get_metadata`, `get_screenshot`), change only what was asked, keep its components and bindings | The node itself |
| From a document | Run the inventory → screen list → direction steps of [html-flow.md](html-flow.md), or write `figma-spec.md`, then build | As above |

## Build order

1. **Inspect** (one read-only call): pages, collections, styles, component sets. Reuse before creating.
2. **Foundations:**
   - Variables with explicit scopes:
     - colour roles, bound to every fill and stroke
     - spacing 8/12/16/24 (the only steps)
     - radius
   - Text styles for the type ramp in the product font. Verify style names with `listAvailableFontsAsync`; never fall back to Inter silently.
   - Effect and paint styles for surfaces (glass card, elevated sheet, glows, gradients).
3. **Icons:** import the team set (Lucide, see [html-flow.md](html-flow.md) and `img/icons/`) as `icon/<name>` components with `createNodeFromSvg`. Each theme gets its own icon set whose stroke is **bound to that theme's `icon` colour variable**.
   - A set shared with another theme, or with a hard-coded colour, turns dark again on every instance swap. That happened in the glass build: 97 icons had to be recoloured by hand.
4. **Components** on the Components page, laid out as documentation: section title, the set, and a variant grid by state.
5. **Screens** from instances (see §Screen rules).
6. **Images:**
   - Upload real assets with `upload_assets` and set them as fills.
   - Missing illustrations become named placeholders, e.g. a component "App icon (placeholder)" or frames "OB image N", so one swap updates every use.
   - List the placeholders in the report.
7. **Audit and verify** (§Gates), fix, then report.

## Component rules (gate)

- **Description:** every component set and standalone component has a `description` (what it is, when to use it). Text on the canvas does not replace it.
- **Naming and variants:**
  - Variants are named `Prop=Value`, e.g. `Type=Primary, Size=L48, State=Pressed`.
  - Interactive parts include their states: Default / Pressed / Disabled, plus Focused / Error for inputs and Selected for choices.
- **Properties:**
  - Every visible label is a **TEXT** property.
  - Every icon slot is an **INSTANCE_SWAP** property, with preferred values from the icon set.
  - Optional parts (leading icon, badge, description, secondary button) are **BOOLEAN** properties.
  - Nested instances that users change (badge, switch, icon) are exposed.
- **Colours:** every paint is bound to a variable or uses a style. No raw hex inside components (switch thumb, badge text and app tiles were the misses).
- **Content slots** (sheet body, card body) are an INSTANCE_SWAP property pointing at `Content/<name>` components.
- **Layout:** auto layout everywhere. Spacing from the scale; radius from the scale or fully round.

## Screen rules (gate)

- **Frames:**
  - Fixed size: 360×800, or the team frames 412×917 (base) and 375×812 (core).
  - Named `<group>/<screen-id>`, states `<screen-id>--<state>`; states sit to the right of their screen.
  - Auto layout vertical, built top-down: status bar, app bar, content, bottom bar, gesture bar.
- **Instances first:** anything that exists as a component is used as an instance, never redrawn.
  - Repeated groups (theme tiles, app rows, settings rows, notification groups) are always instances.
  - A container a component already covers (e.g. the glass card around settings rows) is an instance of that component.
  - The audit flags frames named like a component (H8) and loose vectors (H6).
- **Styles:** text uses text styles (H2), colours use variables or styles (H4). Raw colours are allowed only in placeholders and data art (app-tile brand colours), and their layers must be named to say so.
- **Real content:** the product's language and copy, with real images where they exist.

## Gates: before reporting done

1. **Audit:**
   - Run `scripts/figma/audit.js` through `use_figma`: one call per page, in parallel. Set `PAGE_ID`, and fill `COMPONENT_NAMES` from the inspect call.
   - Hard findings (H1 missing font, H2 unstyled text, H3 contrast on opaque backgrounds, H4 hard-coded colour, H5 spacing off scale, H6 loose vectors, H7 shimmer left on, H8 drawn copy of a component) must be 0, or each one listed with its reason.
   - Component-set issues (no description, label or icon not exposed, unbound paints) must be 0.
2. **Visual check:** one `get_screenshot` per page section at a `maxDimension` that keeps text legible (≈ 3000–4096). It covers every frame in one call; a sample of a few frames is not a check.
   - Text on glass, images or gradients cannot be measured by the audit (S2). Judge it on these screenshots, and back it with `contrast.mjs` on the spec colours.
3. **Report:**
   - node ids of pages, sets and screens
   - component sets with their variant and property counts
   - audit totals before and after fixes
   - placeholders
   - the number of Figma calls
   - what differs from the source and what is unfinished

## Spending calls well

- Size each `use_figma` script to be safe to retry: one page section or one group of components per call.
- Give every build root a stable name and delete a same-named leftover at the start, so a failed run is cleaned up by the next one.
- **Syntax-check every script locally before sending it.** A half-written script wasted a call in the glass build. Check it with:

  ```
  node -e "new (Object.getPrototypeOf(async function(){}).constructor)(require('fs').readFileSync('s.js','utf8'))"
  ```
- Return created ids and counts from writes; that is the structural check, not extra reads.
- Fix in place with targeted scripts; never rebuild a page to fix a detail.
- Exporting icons one at a time from Figma costs one call per icon. When a set matches an open-source package (Lucide), take the SVGs from the package and record the Figma node ids, as [html-flow.md](html-flow.md) describes.

## Faster path when available

If the Figma MCP exposes `html_to_figma`, pass each screen's self-contained HTML to create editable layers directly. Inline tokens.css and kit.css, and use absolute image URLs or data URIs. Then replace repeated parts with component instances and bind colours to variables: the gates still apply.

A runnable prototype is `send_code_to_figma` (Code Layer); use it only when the user asks for a clickable prototype.

## Reading reference designs

To learn from existing Figma files:
- `get_metadata` without a node lists the pages.
- `get_screenshot` on pages or sections gives overviews; on frames it gives detail.
- Record findings in [reference-patterns.md](reference-patterns.md) and `data/topic-worlds.json`.

Read-only: never write to a reference file.

When the metadata of a big page exceeds the tool limit, it is saved to a file. Parse it with a script (jq or python) instead of re-requesting smaller nodes one by one.
