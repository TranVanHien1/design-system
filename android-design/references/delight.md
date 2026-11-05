# Delight

> **Additional context needed**: the brand's emotional range.

`delight` makes the app memorable at moments that earn it. Use it for first use, completion, recovery and
mastery moments, once the screens already work. Delight is product character revealed through a useful
interaction, a humane response or an unexpectedly considered detail, not a layer of generic whimsy. It must
never slow the primary task, override platform conventions or accessibility, play sound unasked, or fire on
routine taps.

On Operate screens concentrate delight at meaningful moments; reliability carries everything else. An
onboarding or celebratory screen may let personality run through composition, motion and copy.

## Find the opportunity

Inspect the target, DESIGN.md, the product voice, how often each interaction repeats, and its emotional
context. Look for:

- effort worth acknowledging (a first transaction, a finished streak, an import of 2,000 photos);
- waiting that can become informative;
- an empty or first-use state that can orient;
- an error or recovery moment that needs empathy;
- an interaction whose physical response (haptic, motion) could express the brand;
- a useful capability people might enjoy discovering.

Do not manufacture a celebration for an ordinary tap. Ask only when the brand's range or the stakes cannot be
inferred.

## Define one delight thesis

State in one sentence what the user should feel and why that feeling belongs to this product. Then choose the
smallest system that delivers it:

- a distinctive response to a meaningful action;
- product-specific language that clarifies while carrying voice;
- a transition with a recognizable material behavior;
- an illustration, haptic or sound grounded in the product world;
- a discovery that reveals real utility.

Derive the treatment from the product's mechanism and world, not a stock catalog. Generic confetti is worse than
neutral clarity.

## Android means

**Haptics.** The cheapest, most physical delight, and the easiest to overdo. Use semantic feedback through
Compose, which respects the user's touch-feedback setting:

```kotlin
val haptics = LocalHapticFeedback.current
haptics.performHapticFeedback(HapticFeedbackType.Confirm)   // success of a meaningful action
haptics.performHapticFeedback(HapticFeedbackType.Reject)    // a refused drop, an invalid gesture
```

`Confirm`, `Reject`, `ToggleOn/Off`, `SegmentTick` and `GestureThresholdActivate` need Compose UI 1.8+ (BOM
2025.04+); before that, use `LocalView.current.performHapticFeedback(HapticFeedbackConstants.CONFIRM)` (API
30+) or `LongPress`/`TextHandleMove`. Map one haptic to one meaning across the app; drag thresholds, snapping
sliders and a confirmed payment are the classic places. Never call `Vibrator` directly for UI feedback, and
never buzz on every tap.

**Illustrated motion.** For a completion or empty-state moment:

- **AnimatedVectorDrawable** for icon-scale moments (a check drawing itself, a bookmark filling):
  `rememberAnimatedVectorPainter(AnimatedImageVector.animatedVectorResource(R.drawable.avd_done), atEnd)`
  (`animation-graphics`, experimental API). Tiny, tintable with theme roles, no dependency.
- **Lottie** (`com.airbnb.android:lottie-compose`) for richer, designer-authored sequences:
  `LottieAnimation(composition, iterations = 1)`. Keep files small, recolor through dynamic properties so dark
  theme works, and play once.
- **Custom Canvas** (`Canvas`, `drawWithCache`) when the moment comes from the product's own data: a chart line
  drawing to today's value, a progress ring that closes.

**Shape.** On material3 1.4+ (expressive), `MaterialShapes` and shape morphing (`graphics-shapes` `Morph`) can
turn a button into a check or a loading indicator into a done state; on 1.3, morph a `RoundedCornerShape`
percentage with `animateIntAsState`. One morph, at one moment.

**Launch.** The SplashScreen API can animate the icon (an AVD up to about 1000ms) on cold start. Keep it short;
never extend the splash to show it off.

**Copy.** The product's own words at the right moment ("Đã gửi. Nam sẽ nhận được trong vài phút.") beat a
mascot. See [clarify.md](clarify.md).

**Sound.** Off by default, opt-in in settings, and silent when the ringer is silent or vibrate.

## Build for the emotional moment

- **Success:** match the response to effort and consequence. A first milestone can expand (an authored
  animation plus `Confirm` haptic); a routine save is a snackbar and nothing more.
- **Waiting:** truthful progress, useful context, product-specific activity. Never fake work or delay completion
  to stage a flourish.
- **Empty and first use:** make the next action clear before adding personality (see [onboard.md](onboard.md)).
- **Error and recovery:** lead with the problem and the fix. Warmth may reduce stress; jokes must not trivialize
  loss, money, privacy or blocked work.
- **Repeated interaction:** satisfying on the hundredth use. Variation only when it stays predictable enough to
  trust.
- **Discovery:** reward curiosity without hiding required functionality.

## Protect the experience

Delight must not:

- delay, block or obscure the primary task, or hold the user on a celebration screen;
- override M3 behavior, Back, or TalkBack (give animated illustrations a `contentDescription` or mark them
  decorative; announce the outcome as text);
- add unrequested factual claims;
- ignore Remove animations: show the end frame, keep the haptic and the text (see [animate.md](animate.md));
- become unskippable or exhausting on repeat;
- cost more APK size or startup time than the moment is worth.

Nonessential loops stop when off screen. Celebration intensity is proportional to frequency and consequence.

## Verify

On a real device (haptics do not exist on most emulators), per [verify.md](verify.md):

- The moment is specific enough that a neighboring app could not use it unchanged.
- It improves comprehension, confidence, motivation or recovery.
- The app stays fast and obvious without the flourish; startup and scroll are not slower.
- Repetition does not turn charm into friction (do the action ten times).
- With Remove animations on, touch feedback off, TalkBack on and in Vietnamese, the moment still reads.

When the personality feels earned, hand off to `/android-design polish [target]`.
