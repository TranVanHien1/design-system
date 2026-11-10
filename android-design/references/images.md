# Images: prompts by default, Codex generation only on request

Image generation costs the user's quota, so the skill never generates images on its own. By default it writes the prompts; it generates them through the Codex CLI only when the user asks.

## Default: write the prompts, don't generate

- Every design deliverable that needs art writes its prompts to `images.json` in the project (format below). This covers the base flow's app icon and 4 onboarding illustrations, empty-state art, banners and thumbnails.
- The flow keeps working without the images:
  - Use real data where it exists: the app's own assets, the user's data folders, or the decoded APK (`scripts/flow/vd2svg.mjs`).
  - Otherwise use a CSS composition or a named placeholder that reads the target file name (`img/ob-1.jpg`, `img/app-icon.png`).
- Generator code checks whether the file exists, so dropping the image in later needs no code change (e.g. `if (fs.existsSync('img/ob-1.jpg'))`).

## Generate only when the user asks

**Triggers.** The user explicitly asks the skill for images, e.g.:
- "tạo ảnh", "gen ảnh", "generate các image cần thiết"
- "dùng codex tạo icon / onboarding"
- `/android-design images`

"Make the UI", "redo the app" and "use real data" do not trigger generation.

**Before running:**
1. List what will be generated: id, purpose, size, and **N images = N generations**. Generate only the images the request covers that are still missing; never regenerate an existing image unless the user names it.
2. Check `codex login status`. When it is not logged in, stop and ask the user to run `codex login`. Generation needs a ChatGPT account with image generation, and the skill cannot log in for them.

**Run:**

```
node <skill>/scripts/images/codex-image.mjs --spec images.json [--only id,id] [--dry-run]
```

- One `codex exec` per image, and Codex is told to call its built-in `image_gen` exactly once with the prompt **verbatim**. Codex does not read skills or docs, runs no shell, makes no variants or retries, and does not rewrite the prompt. It runs at reasoning effort low in a read-only sandbox.
- The script finds the generated file in `$CODEX_HOME/generated_images/<thread>/` and crops it to `size` with ImageMagick. The original is kept as `<out>.src.png`.
- Every run is logged to `images.log.jsonl`. A prompt and output pair that already succeeded is skipped.
- On a quota, rate-limit or auth error the script stops the batch and reports. **Never retry in a loop**: tell the user the error and the reset time if Codex gives one.

**After running:**
1. Look at every image (Read the file) before using it:
   - no text or letters
   - no brand marks
   - no real people
   - the subject sits inside the safe area
   - the background matches the screen surface
   A bad image is reported with the reason. It is regenerated only if the user asks.
2. Rebuild the flow (`build-flow.mjs --shots`), check the renders, and record the images in `brief.md`.

## Writing prompts that work on the first call

The prompt is final when it leaves Codex nothing to decide. One prompt per image, written in English for the model; UI copy stays in the app's language. Each prompt states:

1. **Asset and use:** e.g. "Square Android app icon…" or "Onboarding illustration for <benefit>…".
2. **Subject and composition:** what is shown, where it sits, and the safe area.
   - Onboarding hero: 412×468 area (generate square, crop to 824×936). Keep the subject in the upper two thirds; the bottom 100dp fades into the text block.
   - App icon: generate square, deliver 432×432. Keep the mark inside the centre 66% (adaptive-icon safe zone), with a full-bleed background.
   - Banner: 343×193 area (686×386). Keep the left third calm for the title and CTA.
   - Empty-state art: square, subject centred, transparent or surface-coloured background.
3. **Style lock, shared across the whole set:** put it once in `images.json` `style`; the script appends it to every prompt.
   - illustration family (3D clay, flat vector, line, photo, pixel…)
   - background colour as hex, equal to the screen surface
   - palette as hex from the theme tokens
   - lighting
   - "one centred subject, generous empty space"
4. **Negatives:** "no text, no letters, no numbers, no logos, no brand marks, no real people". For an app built from a competitor (REA), the competitor's mascot, logo and colours are also off-limits.
5. **Consistency:** when the set must share a character or object, generate the key image first, then pass it to the others with `ref` (attached to the Codex call).

## images.json

```json
{
  "style": "Style: soft 3D clay illustration, warm cream background (#FDF9F0), palette ink (#291D18), cobalt (#3259B7)… Absolutely no text, no letters, no numbers, no logos, no brand marks, no real people.",
  "images": [
    { "id": "icon", "out": "img/app-icon.png", "size": "432x432", "prompt": "Square Android app icon for …" },
    { "id": "ob1",  "out": "img/ob-1.jpg",     "size": "824x936", "prompt": "Onboarding illustration for …; subject in the upper two thirds, empty bottom third." },
    { "id": "empty", "out": "img/empty-locked.png", "size": "480x480", "alpha": true, "prompt": "…" }
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | short key for `--only` |
| `out` | path relative to the spec |
| `size` | final pixel size; crop is centre-cover |
| `prompt` | the final prompt (style is appended) |
| `ref` | reference images for consistency (optional) |
| `alpha` | ask for a transparent background (optional) |
