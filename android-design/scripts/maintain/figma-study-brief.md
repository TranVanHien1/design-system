# Deep Figma component study — shared brief

Goal: extract EXACT component specs and screen-layout rules from the team's reference Figma files, so an Android design
skill can rebuild the team's components 1:1 (HTML kit + Compose) and lay screens out the way the team does. Read-only:
never write to any Figma file.

## Access rules
- Load Figma tools with ToolSearch ("select:mcp__claude_ai_Figma__get_metadata,mcp__claude_ai_Figma__get_screenshot,mcp__claude_ai_Figma__get_design_context,mcp__claude_ai_Figma__get_figma_skill,mcp__claude_ai_Figma__get_variable_defs").
- Call create_session once for the study and pass its sessionId on every file-tool call.
- BEFORE the first get_design_context call, read the skill `skill://figma/figma-design-to-code/SKILL.md` with get_figma_skill and follow its rules for calling get_design_context (you are extracting specs, not writing app code).
- get_metadata(nodeId) returns XML with ids, types, names, x/y/width/height of every layer: the primary source for geometry (sizes, paddings = child offsets, gaps = sibling distances). Query frames/sections, not whole pages (pages are huge).
- get_design_context(nodeId) on a single component/frame returns styles (fills, fonts, sizes, line heights, radii, effects): the primary source for style values. Use it on ONE representative instance per component type per file, not on every screen.
- get_variable_defs(nodeId) may return the file's variables/styles (colours, type) — try it on a style-guide or screen frame.
- get_screenshot only to confirm what you measured (download the URL with curl into your scratch folder; view with Read). Budget ≈ 15–25 screenshots.
- Earlier study (overview level, for orientation): ~/.claude/skills/android-design/references/reference-patterns.md and data/topic-worlds.json. Do not repeat it; go deeper.

## Measure in the file's own frame size
Report values in the frame's units (base flow frames are 412×917; core screens are often 375×812 or 360×800) and state the frame size with each component. Do not rescale.

## Component type vocabulary (use these `type` values)
status-bar, top-bar, wordmark, premium-entry, bottom-nav, tabs, segmented, chip, search, section-header,
button-primary, button-secondary, button-text, icon-button, fab, progress-button, ad-unlock-button,
hero-banner, card, content-tile, feature-tile, list-row, settings-row, language-row, toggle, slider, radio, checkbox,
page-indicator, onboarding-cta, onboarding-illustration,
native-ad-big, native-ad-medium, native-ad-small, native-ad-item, native-ad-full, native-ad-collapsible, banner-ad,
paywall-hero, paywall-benefit, paywall-plan-card, paywall-cta, paywall-footer, countdown,
dialog-rating, dialog-update, dialog-confirm, dialog-reward, dialog-exit, permission-card, permission-dialog,
bottom-sheet, empty-state, skeleton, toast, success-screen, preview-actions, editor-toolbar, swatch, waveform, other.

## Output (write BOTH files into your assigned folder)
1. `components.json`:
```json
{
  "files": [{"fileKey": "...", "name": "...", "pagesStudied": [{"id": "1:7", "name": "..."}]}],
  "tokens": {
    "colors": [{"hex": "#FF321F", "name": "primary/brand", "usage": "CTA fill, active nav", "evidence": "nodeId"}],
    "typography": [{"family": "...", "weight": 700, "size": 18, "lineHeight": 24, "letterSpacing": 0, "usage": "OB title", "evidence": "nodeId"}],
    "radii": [{"value": 12, "usage": "cards"}], "effects": [{"type": "drop-shadow", "value": "0 4 12 #0000001A", "usage": "..."}],
    "spacing": [{"value": 16, "usage": "screen side margin"}]
  },
  "components": [{
    "type": "language-row", "name": "as named in Figma", "file": "fileKey", "nodeId": "1262:22180", "frame": "412x917",
    "box": {"w": 372, "h": 56}, "position": "x20, first at y123, gap 12",
    "anatomy": [{"part": "flag", "w": 28, "h": 28, "x": 16, "y": 14, "style": "circle"}, {"part": "label", "x": 56, "font": "Inter 500 16/24 #272538"}],
    "style": {"fill": "#F6F6F7", "radius": 12, "stroke": "none", "effects": "none", "padding": "0 16"},
    "states": [{"name": "selected", "diff": "stroke 1.5 #FF321F, radio filled"}],
    "variantsAcrossApps": "optional note if other files differ",
    "usedIn": ["language", "language-settings"], "notes": "..."
  }],
  "layouts": [{
    "screen": "home", "file": "...", "nodeId": "...", "frame": "375x812",
    "zones": [{"zone": "status bar", "y": 0, "h": 44}, {"zone": "top bar", "y": 44, "h": 56, "content": "wordmark left, crown right"}],
    "margins": {"left": 16, "right": 16}, "gutter": 12, "sectionGap": 24, "scroll": "content scrolls under fixed nav", "notes": "..."
  }],
  "observations": ["cross-component rules you saw: e.g. every CTA pill is 48 high with radius 24; nav active = filled icon + primary label"]
}
```
2. `report.md` (≤ 1200 words): the most important specs in tables, what is consistent across screens/files, what varies, and anything the current skill gets wrong (compare with reference-patterns.md and ~/.claude/skills/android-design/assets/flow/kit.css + assets/flow/base/*.html).

Be exact: measure from metadata, take styles from design context, cite nodeIds. Never invent a value you did not read; write "unmeasured" instead.
