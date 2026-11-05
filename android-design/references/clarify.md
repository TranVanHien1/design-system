# Clarify

> **Additional context needed**: audience knowledge, emotional state at this moment, and shipped languages.

`clarify` rewrites unclear interface text so users understand what happened, what matters and what to do next.
Use it on labels, buttons, errors, empty states, dialogs, snackbars, permission rationales and notifications.
It preserves factual meaning, product terminology and brand voice, works in `strings.xml` (never literals in
composables), and never changes legal meaning or adds claims without asking.

## Audit the language

Read the whole interaction path on device, not isolated strings. Identify:

- ambiguous nouns, verbs and actions; internal jargon or assumed knowledge;
- vague outcomes and system states ("Something went wrong", "Done");
- missing consequence, recovery or timing;
- inconsistent terms (Xoá / Gỡ / Huỷ for the same act) and capitalization;
- redundant headings, intros, helper text and confirmations;
- text that truncates at realistic widths, at font scale 200%, or in translation;
- tone that ignores stress, risk, success or urgency.

```bash
rg -n 'Text\(\s*"' --glob '*.kt' <target>          # hardcoded strings
rg -n 'contentDescription\s*=\s*null' --glob '*.kt' <target>
```

Infer audience and task from PRODUCT.md and surrounding UI. Ask before changing factual claims, legal copy or a
domain term.

## Set the message hierarchy

For each state decide: the one fact the user needs now; the action available next; supporting context that
changes the decision; the tone for this moment. Say each idea once. If the top app bar title already names the
state, the body adds new information or disappears.

## Rewrite by function

### Actions and navigation

A button is a specific verb plus object when the outcome is not obvious: "Save draft", "Send invoice". Labels
describe the outcome, not the gesture. One concept, one noun and one verb across the app.

Destructive actions name the object and the consequence. Prefer undo over confirmation when recovery is safe: a
`Snackbar` with an "Undo" action after deleting beats an `AlertDialog` before it. When a dialog is necessary,
the confirm button repeats the action ("Delete 3 photos"), the dismiss button is "Cancel"; never "Yes / No",
"OK" or "Submit".

### Forms

`OutlinedTextField` and `TextField` take a persistent `label`; a `placeholder` is an example, not a label. Put
format and eligibility requirements in `supportingText` before submission. Explain why data is requested only
when it is not obvious. Mark optional fields, or required ones, consistently.

Validation says what needs attention and how to fix it, without blame: set `isError = true` and replace
`supportingText` with the fix ("Enter a phone number with 10 digits"). Announce it for TalkBack
(`Modifier.semantics { error("…") }` on the field, or `liveRegion = LiveRegionMode.Polite` on a form-level error message).

### Errors and permissions

An actionable error answers what failed, why (when known and useful), and how to recover. Map each failing
`UiState` to its own message; "No connection. Your changes are saved and will sync when you're back online"
beats a generic error. No internal codes as the primary message. Never promise a cause or fix the app cannot
know. Privacy, payment, deletion and blocked work get seriousness: warmth is welcome, jokes are not.

Runtime permissions: ask in context, at the moment the feature needs it, after a short in-app rationale that
names the benefit ("Allow notifications to know when your order ships"). If the user denied permanently, say
what will not work and offer a button to app settings; never loop the system dialog.

### Loading, empty and success

Loading text names the real operation when a wait is meaningful ("Uploading 3 of 12 photos"). Show determinate
progress when available; never invent progress. Empty states distinguish first use, no results, active
filters, no permission and failure, each with the next useful action (see [onboard.md](onboard.md)). Success
confirms the outcome briefly, usually in a snackbar, and mentions the next consequence only when it changes what
the user should do.

### Help, icons and notifications

Helper text answers an implicit question instead of restating the control. Every `IconButton` has a
`contentDescription` naming the action ("Search", not "Magnifier icon"); decorative images take `null`.
TalkBack names match visible labels. Notification titles carry the fact, the body the detail; no app name
prefix, the system shows it.

## Voice, accessibility and localization

Voice stays consistent; tone adapts. Plain language, without flattening terms the audience truly knows.

- All copy in `res/values/strings.xml`; read with `stringResource(R.string.x, arg)`.
- Whole translatable messages, never concatenated fragments. Placeholders positional (`%1$s`, `%2$d`) so
  translators can reorder.
- Counts use `<plurals>` and `pluralStringResource(R.plurals.photos, count, count)`; never "photo(s)".
- Numbers, money and dates through locale formatters (`NumberFormat.getCurrencyInstance(locale)`,
  `DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)`), never string math.
- Allow expansion instead of abbreviating early. Enable pseudolocales in debug (`en-XA` expands and accents,
  `ar-XB` mirrors) and look at every changed screen.
- Do not rely on punctuation, color or icons alone to carry the message.

Keep a short terminology glossary in DESIGN.md (or `docs/design/glossary.md`) when inconsistency spans the
product.

### Vietnamese

- **Address:** default to "bạn". Use "quý khách" only where the brand and domain demand formality (banking,
  insurance, government); never "mày/tao". Keep one form of address across the whole app.
- **Tone:** polite and direct. Soften requests with "vui lòng" sparingly; one per screen is plenty. Do not
  translate English idioms or jokes literally; write the Vietnamese sentence a person would say.
- **Length:** budget about 30% more width than English. Buttons, tabs, chips and bottom-nav labels break first;
  design with the Vietnamese string, not the English one.
- **No ALL CAPS:** capitals with stacked diacritics (Ặ, Ễ, Ữ) read poorly and collide; use sentence case for
  buttons and headings ("Lưu thay đổi", not "LƯU THAY ĐỔI"). See [typeset.md](typeset.md).
- **Verbs first on buttons:** "Thêm ảnh", "Gửi lại mã", "Xoá tài khoản". Avoid English loans mixed in ("Đã
  save") unless the product's voice and audience use them.
- **Plurals:** Vietnamese has no grammatical plural; Android's `vi` plural rule has only `other`. Still use
  `<plurals>` (other locales need it) and write the `vi` entry once: `<item quantity="other">%d ảnh</item>`.
- **Numbers and dates:** dot for thousands, comma for decimals (1.250.000 ₫), dd/MM/yyyy; let the locale
  formatter produce them rather than hardcoding.
- **Diacritics in data:** search and sort must work without accents ("ha noi" finds "Hà Nội"); normalize with
  `java.text.Normalizer` and treat "đ" separately, since it does not decompose.

## Verify

Read the flow in context, in every shipped language:

- understandable without hidden product knowledge; actionable at errors, empties and decisions;
- consistent terminology; factual accuracy unchanged;
- no truncation of primary labels at 412dp width and font scale 2.0, in Vietnamese and in a pseudolocale;
- long names, plurals and dynamic values render correctly;
- TalkBack reads accurate names and announces errors and state changes;
- tone fits the consequence and the emotional moment.

The final copy is as short as it can be without losing meaning or recovery. When the language reads cleanly,
hand off to `/android-design polish [target]`.
