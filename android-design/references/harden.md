# Harden

Screens that only work with perfect data aren't production-ready. `harden` makes a Compose screen or flow
survive the inputs, failures, languages, lifecycle events and device conditions real users bring: long and
empty data, errors, offline, process death, configuration changes, denied permissions, Vietnamese and German
text, RTL. Use it once the happy path works and before polish. It must not restyle the screen or change its
structure beyond what resilience needs; every new state uses the existing theme and components.

Read [craft-floor.md](craft-floor.md) before editing and [operate.md](operate.md) for how states look on a phone.

## Assess

List the screen's `UiState` variants and the ViewModel's failure paths, then probe:

1. **Extreme content**: 80-character names, one-character names, empty strings, emoji, mixed scripts,
   1 234 567 890 ₫, 0 items, 1 item, 5 000 items, 50 filter options.
2. **Failure**: offline, slow network, timeout, 400/401/403/404/409/429/500, validation errors, partial
   success, concurrent edits.
3. **Lifecycle**: rotation, dark mode toggle, font scale and locale change while on screen, split screen
   resize, fold/unfold, process death mid-flow, returning from another app after hours.
4. **Permissions**: denied once, denied permanently, revoked in Settings while the app is backgrounded, partial
   photo access (Android 14+).
5. **Languages**: Vietnamese, German, an RTL locale, pseudo-locales.

## Text overflow and wrapping

```kotlin
Row(verticalAlignment = Alignment.CenterVertically) {
    Text(
        text = title,
        modifier = Modifier.weight(1f),          // lets the text shrink instead of pushing the trailing slot off-screen
        maxLines = 2,
        overflow = TextOverflow.Ellipsis,
    )
    Spacer(Modifier.width(8.dp))
    Text(timestamp, style = MaterialTheme.typography.labelMedium)
}
```

- Never put a fixed `width` or `height` on a text container or a button; use `widthIn`/`heightIn(min = …)`.
- Truncate only secondary text. Titles and names that identify something wrap to 2 lines before ellipsis.
- Chips and tags that can multiply go in `FlowRow`, not a `Row` that clips.
- Long numbers: compact formatting (`CompactDecimalFormat` from `android.icu.text`) with the full value on
  the detail screen or in the TalkBack description.
- Test at font scale 2.0: text that was one line becomes three, and the layout must grow, not overlap.

## Internationalization

**Every user-facing string in `strings.xml`.** No concatenation of translated fragments; use placeholders
(`%1$s`) so translators can reorder.

**Plurals** through resources, never `if (count == 1)`:

```kotlin
Text(pluralStringResource(R.plurals.items_selected, count, count))
```

Vietnamese has one plural form (`other`), Russian and Polish have four, Arabic six; CLDR rules handle it only
if the string is a `<plurals>` resource.

**Vietnamese.** Stacked diacritics (Ệ, Ở, ỗ) are taller than Latin caps: tight `lineHeight` with no font padding
(`PlatformTextStyle(includeFontPadding = false)`, the Compose default since 1.6) clips them, so check headings and single-line chips in Vietnamese. Confirm the
brand face has the Vietnamese subset; a missing glyph falls back to another font mid-word and looks broken.
Vietnamese text is often longer than English (multi-syllable words written as separate syllables), so labels
wrap more. Currency has no decimals and uses dots for thousands: `1.250.000 ₫`.

**German.** Expect 30–40% longer strings and compounds with no break opportunity
("Benachrichtigungseinstellungen"). Enable hyphenation where long words appear in narrow slots:

```kotlin
style = MaterialTheme.typography.titleMedium.copy(hyphens = Hyphens.Auto, lineBreak = LineBreak.Paragraph)
```

Budget space for expansion in buttons, tabs, navigation bar labels (which truncate hard) and dialog actions
(which stack vertically when too long; let them).

**RTL.** Compose mirrors `start`/`end` automatically. Break it and you break Arabic and Hebrew users:

- never `absolutePadding`, `AbsoluteAlignment`, `Alignment.Left/Right`, or offsets computed from the left edge;
- directional icons from `Icons.AutoMirrored` (back, forward, send, reply); non-directional icons (search,
  check) stay unmirrored;
- mixed-direction content (an English product name in Arabic text, phone numbers) gets
  `TextDirection.Content` or explicit bidi handling;
- swipe-to-dismiss and carousels follow the layout direction;
- `android:supportsRtl="true"` in the manifest.

**Arabic-script specifics** (Arabic, Persian, Urdu): never strip the Zero-Width Non-Joiner (U+200C) in
sanitizers; treat Persian ی/ک and Arabic ي/ك as equivalent in search and validation while storing the
original; format digits with the locale (`NumberFormat.getInstance(locale)` yields ۱۲۳۴ for `fa-IR`); use the
calendar users expect (`android.icu.util.Calendar` with `@calendar=persian` or `islamic`).

**Dates, numbers, currency**: `DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)`,
`NumberFormat.getCurrencyInstance(locale)`, `DateFormat.is24HourFormat(context)`. Never hand-build
`"$day/$month"`.

**Test fast**: enable `isPseudoLocalesEnabled = true` on the debug build type, then switch to `en-XA`
(accented, ~30% longer) and `ar-XB` (RTL). Per-app locale on Android 13+:
`adb shell cmd locale set-app-locales <pkg> --locales vi-VN` (or `de-DE`).

## Errors

- **Screen-level failure with no data** → `UiState.Error` with the cause in plain words and a Retry button.
  "Can't load your orders. Check your connection and try again." Not "Error 503".
- **Failure with cached data** → keep showing the data, add an offline banner or snackbar with Retry, mark
  stale content.
- **Transient action failure** (send, like, save) → snackbar with action (`SnackbarHostState.showSnackbar(…,
  actionLabel = "Retry")`); restore optimistic UI.
- **Field validation** → inline on the field: `OutlinedTextField(isError = …, supportingText = { … })`,
  specific ("Phone number needs 10 digits"), shown after the user leaves the field or submits, input kept.
- **Status codes**: 400 field errors; 401 re-authenticate and return to the same place; 403 explain the
  permission and who grants it; 404 a not-found state with a way back; 409 show both versions or reload; 429
  say when to retry; 5xx generic message, Retry, support path.
- One failing section never blanks the whole screen.

## Lifecycle: process death and configuration change

- **Configuration changes** (rotation, dark mode, font scale, locale, window resize, fold) recreate the
  Activity. ViewModel state survives; plain `remember` does not. UI-only state that must survive (expanded
  card, selected tab, dialog open, text in a field not yet in the ViewModel) uses `rememberSaveable`.
- **Process death** kills the ViewModel too. Anything the user would be angry to lose (form input, current
  step, selected items, search query, scroll anchor for long lists) goes in `SavedStateHandle`:

  ```kotlin
  class CheckoutViewModel(private val savedState: SavedStateHandle) : ViewModel() {
      val address = savedState.getStateFlow("address", "")
      fun onAddressChange(value: String) { savedState["address"] = value }
  }
  ```

  Navigation arguments are restored automatically; anything fetched is reloaded from the repository.
- Don't lock orientation or add `configChanges` to dodge state bugs; fix the state.
- Test: background the app, then `adb shell am kill <pkg>` and reopen from Recents; or enable Developer
  options › Don't keep activities. The screen must return exactly as left.

## Permissions

- Ask in context, at the moment the feature needs it, after a one-line rationale in the UI.
- **Denied**: the feature degrades with an explanation and a way to grant (`shouldShowRequestPermissionRationale`).
- **Permanently denied**: explain and deep link to `Settings.ACTION_APPLICATION_DETAILS_SETTINGS`; never loop
  the system dialog.
- **Partial photo access** (Android 14+, `READ_MEDIA_VISUAL_USER_SELECTED`): show what was granted, offer to
  select more.
- **Notifications** (Android 13+, `POST_NOTIFICATIONS`): the app works fully without them.
- Re-check on resume; the user may have changed it in Settings. Test with
  `adb shell pm revoke <pkg> android.permission.CAMERA`.

## Empty, huge and concurrent data

- **Empty**: distinguish first run ("No invoices yet" + create action), filtered-to-nothing ("No results for
  'xyz'" + clear filters) and error. Never a bare blank list.
- **Loading**: skeleton matching Content layout for first load; `PullToRefreshBox` indicator for refresh; keep
  content visible while refreshing; say what is loading for anything over a few seconds.
- **Huge**: page with Paging 3 (`collectAsLazyPagingItems()`, `itemKey { it.id }`), handle its `LoadState`
  append errors in-list with Retry; search and filter for long lists; never load 10 000 rows into a `List`.
- **Concurrent**: disable Submit while `isSubmitting`, ignore double taps, cancel stale requests when the query
  changes (`flatMapLatest`), roll back optimistic updates on failure, resolve conflicts explicitly.
- **Interrupted gestures** in custom `pointerInput` handlers: a second finger mid-drag, a cancelled gesture
  (parent scroll steals it), release outside the control. Reset drag state in `onDragCancel` and `onDragEnd`;
  the next drag must work.

## Offline and slow network

Cache what the user last saw and show it; queue writes and sync later (WorkManager) where the product allows;
say clearly what works offline. Test with `adb shell cmd connectivity airplane-mode enable`, then
`disable`, and on a throttled emulator network profile.

## Accessibility resilience

New states are announced (`Modifier.semantics { liveRegion = LiveRegionMode.Polite }` on status text); errors
are read with the field; nothing relies on color alone; high contrast text and the system contrast setting
(Android 14+) keep text readable.

## Verify

- 80-character and one-character names, emoji, Vietnamese, German and `ar-XB` on every text slot;
- font scale 2.0 and Force RTL;
- airplane mode on first load, mid-scroll, mid-submit;
- process death on each step of the flow; rotation with a dialog open;
- each permission denied, permanently denied and revoked while backgrounded;
- 0, 1 and 5 000 items; Submit tapped ten times fast;
- forced 401, 404, 429 and 500 responses (fake repository or debug interceptor).

Say which device or emulator produced the evidence and what stayed untested. Add a unit test for each
reducer or ViewModel fix that the project's test setup can drive.

When edge cases are covered, hand off to `/android-design polish <target>` for the final pass.

**Avoid**: assuming English-length text; generic error messages; fixed widths on text; blocking the whole
screen when one part fails; trusting client-side validation alone; state that survives rotation but not
process death.
