#!/usr/bin/env node
// Generates a Jetpack Compose Material 3 theme (Color.kt, Theme.kt, Type.kt, Shape.kt) from a dealt
// direction or from seed colours, using Google's material-color-utilities (vendored, Apache 2.0).
// Six schemes: light/dark × standard/medium/high contrast (Android 14+ contrast setting), plus
// ExtendedColors (success, warning, data) through a CompositionLocal.
//
// Direction mode:  --direction "<style>+<palette>+<type>"  [--brand "#hex"]
// Seed mode:       --seed "#hex" [--secondary "#hex"] [--tertiary "#hex"] [--neutral "#hex"]
//                  [--variant fidelity|tonal-spot|content|vibrant|expressive|neutral|monochrome]
//                  [--type <type id>] [--shape square|crisp|standard|soft|round]
// Common:          --package <kotlin package> [--r-package <app namespace for R>] [--name AppTheme]
//                  [--fonts bundled|downloadable] [--out <dir>] [--dry-run] [--force]
import fs from 'node:fs';
import path from 'node:path';
import * as M from './vendor/material-color-utilities/index.js';
import { load } from './lib/common.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const die = (m) => { console.error(`theme.mjs: ${m}`); process.exit(2); };

const data = load();
const cssOut = opt('css');
const pkg = opt('package') || (cssOut && !opt('out') ? 'app.ui.theme' : die('--package is required (e.g. com.acme.app.ui.theme)'));
const rPkg = opt('r-package', pkg.replace(/\.ui\.theme$/, '').replace(/\.theme$/, ''));
const themeName = opt('name', 'AppTheme');
const fontsMode = opt('fonts', 'bundled');
const out = opt('out');
const dry = flag('dry-run');
if (!dry && !out && !cssOut) die('--out <dir> (Kotlin) and/or --css <file> (flow tokens) is required, or --dry-run');

// ---------------- resolve inputs ----------------
const hct = (hex) => M.Hct.fromInt(M.argbFromHex(hex));
const hex = (argb) => M.hexFromArgb(argb).toUpperCase();
let style, palette, face, shapeName, roles, trueBlack = false, extSeeds, label;

if (opt('direction')) {
  const [sId, pId, tId] = opt('direction').split('+');
  style = data.styles.find((s) => s.id === sId) || die(`unknown style ${sId}`);
  palette = data.palettes.find((p) => p.id === pId) || die(`unknown palette ${pId}`);
  face = data.type.find((t) => t.id === tId) || die(`unknown type ${tId}`);
  shapeName = opt('shape', style.android.shape);
  roles = style.android.roles;
  trueBlack = !!style.android.trueBlack;
  extSeeds = { success: style.tokens.positive, warning: style.tokens.warning };
  label = `${style.name} · ${palette.name} · ${face.name}`;
} else if (opt('seed')) {
  face = data.type.find((t) => t.id === opt('type', 'be-vietnam-pro')) || die(`unknown type ${opt('type')}`);
  shapeName = opt('shape', 'standard');
  extSeeds = { success: '#2E7D32', warning: '#8A5300' };
  label = `seed ${opt('seed')}`;
} else die('pass --direction "<style>+<palette>+<type>" (from deal.mjs) or --seed "#hex"');

const accent = opt('brand') || (palette ? palette.accent : opt('seed'));
const radii = data.shapes[shapeName] || die(`unknown shape ${shapeName}`);

// ---------------- palettes ----------------
const TP = M.TonalPalette;
const A = hct(accent);
const fromRole = (role) => {
  if (role === 'accent') return TP.fromInt(M.argbFromHex(accent));
  if (role === 'ink') return TP.fromHueAndChroma(hct(palette.ink).hue, Math.min(hct(palette.ink).chroma, 8));
  if (role === 'neutral') return TP.fromHueAndChroma(A.hue, 4);
  if (role === 'positive') return TP.fromInt(M.argbFromHex(style.tokens.positive));
  if (role.startsWith('rotate:')) return TP.fromHueAndChroma((A.hue + Number(role.slice(7))) % 360, Math.max(24, Math.min(A.chroma, 48)));
  throw new Error(`role ${role}`);
};
const neutralHue = () => {
  if (!roles) return A.hue;
  const src = roles.neutral === 'ground' ? palette.bg : roles.neutral === 'surface' ? palette.surface : accent;
  return hct(src).hue;
};
const neutralChroma = () => {
  if (!roles) return 4;
  if (roles.neutral === 'accent-tint') return 5;
  const src = roles.neutral === 'ground' ? palette.bg : palette.surface;
  return Math.min(hct(src).chroma, 6);
};

let base;
if (roles) {
  base = {
    variant: M.Variant.TONAL_SPOT,
    primaryPalette: roles.primary === 'ink' ? fromRole('ink') : fromRole('accent'),
    secondaryPalette: roles.secondary === 'accent' ? TP.fromHueAndChroma(A.hue, Math.min(A.chroma / 3, 16)) : fromRole(roles.secondary),
    tertiaryPalette: fromRole(roles.tertiary),
    neutralPalette: TP.fromHueAndChroma(neutralHue(), neutralChroma()),
    neutralVariantPalette: TP.fromHueAndChroma(neutralHue(), Math.min(neutralChroma() + 4, 10)),
  };
} else {
  const variants = { fidelity: M.Variant.FIDELITY, 'tonal-spot': M.Variant.TONAL_SPOT, content: M.Variant.CONTENT, vibrant: M.Variant.VIBRANT, expressive: M.Variant.EXPRESSIVE, neutral: M.Variant.NEUTRAL, monochrome: M.Variant.MONOCHROME };
  const v = variants[opt('variant', 'fidelity')] ?? die(`unknown variant ${opt('variant')}`);
  const classes = { [M.Variant.FIDELITY]: M.SchemeFidelity, [M.Variant.TONAL_SPOT]: M.SchemeTonalSpot, [M.Variant.CONTENT]: M.SchemeContent, [M.Variant.VIBRANT]: M.SchemeVibrant, [M.Variant.EXPRESSIVE]: M.SchemeExpressive, [M.Variant.NEUTRAL]: M.SchemeNeutral, [M.Variant.MONOCHROME]: M.SchemeMonochrome };
  const ref = new classes[v](A, false, 0);
  base = {
    variant: v,
    primaryPalette: ref.primaryPalette,
    secondaryPalette: opt('secondary') ? TP.fromInt(M.argbFromHex(opt('secondary'))) : ref.secondaryPalette,
    tertiaryPalette: opt('tertiary') ? TP.fromInt(M.argbFromHex(opt('tertiary'))) : ref.tertiaryPalette,
    neutralPalette: opt('neutral') ? TP.fromHueAndChroma(hct(opt('neutral')).hue, Math.min(hct(opt('neutral')).chroma, 8)) : ref.neutralPalette,
    neutralVariantPalette: opt('neutral') ? TP.fromHueAndChroma(hct(opt('neutral')).hue, Math.min(hct(opt('neutral')).chroma + 4, 12)) : ref.neutralVariantPalette,
  };
}

// ---------------- schemes ----------------
const ROLES = ['primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer', 'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer', 'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer', 'error', 'onError', 'errorContainer', 'onErrorContainer', 'background', 'onBackground', 'surface', 'onSurface', 'surfaceVariant', 'onSurfaceVariant', 'outline', 'outlineVariant', 'scrim', 'inverseSurface', 'inverseOnSurface', 'inversePrimary', 'surfaceDim', 'surfaceBright', 'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest'];
const mdc = new M.MaterialDynamicColors();
const contrasts = { '': 0, MediumContrast: 0.5, HighContrast: 1 };
const schemes = {};
for (const dark of [false, true]) for (const [cName, level] of Object.entries(contrasts)) {
  const s = new M.DynamicScheme({ sourceColorHct: A, contrastLevel: level, isDark: dark, ...base });
  const c = Object.fromEntries(ROLES.map((r) => [r, mdc[r]().getArgb(s)]));
  c.surfaceTint = mdc.surfaceTint().getArgb(s);
  const P = base.primaryPalette, N = base.neutralPalette;
  if (roles && roles.primary === 'ink') { // near-black primary in light, inverted near-white in dark
    const hi = level >= 1;
    Object.assign(c, dark
      ? { primary: P.tone(hi ? 98 : 92), onPrimary: P.tone(8), primaryContainer: P.tone(hi ? 85 : 30), onPrimaryContainer: P.tone(hi ? 5 : 92), inversePrimary: P.tone(15), surfaceTint: P.tone(92) }
      : { primary: P.tone(hi ? 5 : 12), onPrimary: P.tone(100), primaryContainer: P.tone(hi ? 25 : 90), onPrimaryContainer: P.tone(hi ? 100 : 10), inversePrimary: P.tone(90), surfaceTint: P.tone(12) });
  }
  if (trueBlack && dark) Object.assign(c, { background: N.tone(0), surface: N.tone(0), surfaceDim: N.tone(0), surfaceContainerLowest: N.tone(0), surfaceContainerLow: N.tone(4), surfaceContainer: N.tone(7), surfaceContainerHigh: N.tone(11), surfaceContainerHighest: N.tone(17), surfaceBright: N.tone(22) });
  schemes[`${dark ? 'dark' : 'light'}${cName}`] = c;
}

// ---------------- extended colours ----------------
const primaryArgb = base.primaryPalette.keyColor.toInt();
const family = (seedHex, dark, level) => {
  const p = TP.fromInt(M.Blend.harmonize(M.argbFromHex(seedHex), primaryArgb));
  const t = dark ? [80, 20, 30, 90] : [40, 100, 90, 10];
  const hi = level >= 1 ? (dark ? [90, 10, 80, 0] : [25, 100, 35, 100]) : level >= 0.5 ? (dark ? [85, 15, 60, 0] : [30, 100, 45, 100]) : t;
  return hi.map((x) => p.tone(x));
};
const ext = {};
for (const key of Object.keys(schemes)) {
  const dark = key.startsWith('dark'), level = key.includes('High') ? 1 : key.includes('Medium') ? 0.5 : 0;
  ext[key] = { success: family(extSeeds.success, dark, level), warning: family(extSeeds.warning, dark, level) };
  // "data": the one hue for the main data element. Exact accent when it holds 3:1 on surface, else nearest tone that does.
  const surf = schemes[key].surface;
  const ap = TP.fromInt(M.argbFromHex(accent));
  let dataArgb = M.argbFromHex(accent);
  if (ratio(dataArgb, surf) < (level >= 1 ? 4.5 : 3)) { for (const t of dark ? [70, 75, 80, 85, 90] : [45, 40, 35, 30, 25]) { dataArgb = ap.tone(t); if (ratio(dataArgb, surf) >= (level >= 1 ? 4.5 : 3)) break; } }
  ext[key].data = dataArgb;
}
function lumOf(argb) { const c = [(argb >> 16) & 255, (argb >> 8) & 255, argb & 255].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function ratio(a, b) { const [x, y] = [lumOf(a), lumOf(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }

// ---------------- type ----------------
const weightName = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Normal', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };
const parseWeight = (f) => { const m = /weight (\d{3})/.exec(f.settings || ''); const w = m ? Number(m[1]) : Math.max(...f.weights); return Math.round(w / 100) * 100; };
const parseTracking = (f) => { const m = /tracking (-?[\d.]+)em/.exec(f.settings || ''); return m ? Number(m[1]) : 0; };
const isMono = face.class === 'mono-data';
const displayFace = isMono ? face.text : face.display;
const textFace = face.text;
const slug = (f) => (f.slug || f.family).toLowerCase().replace(/[^a-z0-9]+/g, '_');
const dW = parseWeight(displayFace);
const textW = textFace.weights.includes(400) ? 400 : Math.min(...textFace.weights);
const textM = textFace.weights.includes(500) ? 500 : textFace.weights.includes(600) ? 600 : textW;
const neededWeights = (f, ws) => [...new Set(ws.filter((w) => f.weights.includes(w) || f.source === 'google'))].sort((a, b) => a - b);
const sameFamily = displayFace.family === textFace.family;
const families = [
  { val: 'DisplayFamily', f: sameFamily ? { ...displayFace, weights: [...new Set([...displayFace.weights, ...textFace.weights])] } : displayFace, weights: neededWeights(sameFamily ? { ...displayFace, weights: [...new Set([...displayFace.weights, ...textFace.weights])] } : displayFace, [dW, ...(sameFamily ? [textW, textM] : [])]) },
  ...(sameFamily ? [] : [{ val: 'TextFamily', f: textFace, weights: neededWeights(textFace, [textW, textM]) }]),
  ...(isMono ? [{ val: 'FigureFamily', f: face.display, weights: neededWeights(face.display, [parseWeight(face.display)]) }] : []),
];
const fontFiles = [];
const famKt = families.map(({ val, f, weights }) => {
  const bundle = fontsMode === 'bundled' || f.source !== 'google';
  if (bundle) {
    const items = weights.map((w) => { const res = `${slug(f)}_${w}`; fontFiles.push({ res: `res/font/${res}.ttf`, family: f.family, weight: w, source: f.source }); return `    Font(R.font.${res}, FontWeight.${weightName[w]})`; });
    return `val ${val} = FontFamily(\n${items.join(',\n')},\n)`;
  }
  const items = weights.map((w) => `    GoogleFontFace(googleFont = GoogleFont("${f.family}"), fontProvider = provider, weight = FontWeight.${weightName[w]})`);
  return `val ${val} = FontFamily(\n${items.join(',\n')},\n)`;
}).join('\n\n');
const textVal = sameFamily ? 'DisplayFamily' : 'TextFamily';
const track = Math.max(parseTracking(displayFace), -0.03);
const roleLine = (role, fam, w, ls) => `    ${role} = baseline.${role}.copy(fontFamily = ${fam}${w ? `, fontWeight = FontWeight.${weightName[w]}` : ''}${ls != null ? `, letterSpacing = (${ls.toFixed(3)}).em` : ''}),`;
const typeRoles = [
  ...['displayLarge', 'displayMedium', 'displaySmall'].map((r) => roleLine(r, 'DisplayFamily', dW, track)),
  ...['headlineLarge', 'headlineMedium', 'headlineSmall'].map((r) => roleLine(r, 'DisplayFamily', dW, track / 2)),
  roleLine('titleLarge', 'DisplayFamily', dW, null),
  roleLine('titleMedium', textVal, textM, null), roleLine('titleSmall', textVal, textM, null),
  ...['bodyLarge', 'bodyMedium', 'bodySmall'].map((r) => roleLine(r, textVal, textW, null)),
  ...['labelLarge', 'labelMedium', 'labelSmall'].map((r) => roleLine(r, textVal, textM, null)),
];
const usesGoogle = fontsMode === 'downloadable' && families.some(({ f }) => f.source === 'google');

// ---------------- emit Kotlin ----------------
const colorVal = (argb) => `Color(0xFF${hex(argb).slice(1)})`;
const header = (imports) => `// Generated by android-design/scripts/theme.mjs — ${label}\n// Regenerate instead of hand-editing colour values; tune roles in DESIGN.md.\npackage ${pkg}\n\n${imports.join('\n')}\n`;

const colorKt = [header(['import androidx.compose.ui.graphics.Color']), ...Object.entries(schemes).map(([k, c]) => `// ${k}\n${ROLES.concat('surfaceTint').map((r) => `val ${r}${cap(k)} = ${colorVal(c[r])}`).join('\n')}\n`),
  ...Object.entries(ext).map(([k, e]) => `// extended ${k}\n${['success', 'warning'].map((n) => ['', 'on', '', 'on'].map((pre, i) => `val ${pre ? `on${cap(n)}` : n}${i >= 2 ? 'Container' : ''}${cap(k)} = ${colorVal(e[n][i])}`).join('\n')).join('\n')}\nval data${cap(k)} = ${colorVal(e.data)}\n`)].join('\n');
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const schemeKt = (k) => `private val ${k}Scheme = ${k.startsWith('dark') ? 'darkColorScheme' : 'lightColorScheme'}(\n${ROLES.concat('surfaceTint').map((r) => `    ${r} = ${r}${cap(k)},`).join('\n')}\n)`;
const extKt = (k) => `private val extended${cap(k)} = ExtendedColors(\n    success = ColorFamily(success${cap(k)}, onSuccess${cap(k)}, successContainer${cap(k)}, onSuccessContainer${cap(k)}),\n    warning = ColorFamily(warning${cap(k)}, onWarning${cap(k)}, warningContainer${cap(k)}, onWarningContainer${cap(k)}),\n    data = data${cap(k)},\n)`;
const darkFirst = style && style.theme === 'dark';
const themeKt = `${header([
  'import android.app.UiModeManager', 'import android.content.Context', 'import android.os.Build', 'import androidx.compose.foundation.isSystemInDarkTheme',
  'import androidx.compose.material3.ColorScheme', 'import androidx.compose.material3.MaterialTheme', 'import androidx.compose.material3.darkColorScheme', 'import androidx.compose.material3.dynamicDarkColorScheme',
  'import androidx.compose.material3.dynamicLightColorScheme', 'import androidx.compose.material3.lightColorScheme', 'import androidx.compose.runtime.Composable', 'import androidx.compose.runtime.CompositionLocalProvider',
  'import androidx.compose.runtime.Immutable', 'import androidx.compose.runtime.ReadOnlyComposable', 'import androidx.compose.runtime.staticCompositionLocalOf', 'import androidx.compose.ui.graphics.Color', 'import androidx.compose.ui.platform.LocalContext'])}
${Object.keys(schemes).map(schemeKt).join('\n\n')}

@Immutable
data class ColorFamily(val color: Color, val onColor: Color, val colorContainer: Color, val onColorContainer: Color)

/** Semantic colours Material 3 has no role for. \`data\` is the one hue for the screen's main data element. */
@Immutable
data class ExtendedColors(val success: ColorFamily, val warning: ColorFamily, val data: Color)

${Object.keys(ext).map(extKt).join('\n\n')}

val LocalExtendedColors = staticCompositionLocalOf { extendedLight }

/** Usage: \`MaterialTheme.extendedColors.success.color\` */
val MaterialTheme.extendedColors: ExtendedColors
    @Composable @ReadOnlyComposable get() = LocalExtendedColors.current

private enum class Contrast { Standard, Medium, High }

private fun Context.systemContrast(): Contrast {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return Contrast.Standard
    val level = getSystemService(UiModeManager::class.java)?.contrast ?: 0f
    return when {
        level >= 2f / 3f -> Contrast.High
        level >= 1f / 3f -> Contrast.Medium
        else -> Contrast.Standard
    }
}

/**
 * ${label}.${darkFirst ? '\n * This direction is dark-first: default the app\'s theme setting to Dark, or pass darkTheme = true on viewer/editor screens.' : ''}
 * dynamicColor is opt-in: the branded scheme is the product's identity; offer wallpaper colours as a user setting.
 */
@Composable
fun ${themeName}(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val context = LocalContext.current
    val contrast = context.systemContrast()
    val colorScheme: ColorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        darkTheme -> when (contrast) { Contrast.High -> darkHighContrastScheme; Contrast.Medium -> darkMediumContrastScheme; Contrast.Standard -> darkScheme }
        else -> when (contrast) { Contrast.High -> lightHighContrastScheme; Contrast.Medium -> lightMediumContrastScheme; Contrast.Standard -> lightScheme }
    }
    val extended = when {
        darkTheme -> when (contrast) { Contrast.High -> extendedDarkHighContrast; Contrast.Medium -> extendedDarkMediumContrast; Contrast.Standard -> extendedDark }
        else -> when (contrast) { Contrast.High -> extendedLightHighContrast; Contrast.Medium -> extendedLightMediumContrast; Contrast.Standard -> extendedLight }
    }
    CompositionLocalProvider(LocalExtendedColors provides extended) {
        MaterialTheme(colorScheme = colorScheme, typography = AppTypography, shapes = AppShapes, content = content)
    }
}
`;

const typeKt = `${header([
  'import androidx.compose.material3.Typography', 'import androidx.compose.ui.text.font.Font', 'import androidx.compose.ui.text.font.FontFamily', 'import androidx.compose.ui.text.font.FontWeight', 'import androidx.compose.ui.unit.em',
  ...(usesGoogle ? ['import androidx.compose.ui.text.googlefonts.Font as GoogleFontFace', 'import androidx.compose.ui.text.googlefonts.GoogleFont'] : []),
  ...((fontsMode === 'bundled' || families.some(({ f }) => f.source !== 'google') || usesGoogle) ? [`import ${rPkg}.R`] : [])])}
// ${face.name} [${face.class}]: ${face.note}
${usesGoogle ? `
// Downloadable fonts need androidx.compose.ui:ui-text-google-fonts and res/values/font_certs.xml
// (Android Studio › Resource Manager › Font › More fonts generates it). Devices without Google Play
// services fall back to the default face: bundle the fonts for markets where that matters.
private val provider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs,
)
` : ''}
${famKt}

private val baseline = Typography()

val AppTypography = Typography(
${typeRoles.join('\n')}
)
`;

const shapeKt = `${header(['import androidx.compose.foundation.shape.RoundedCornerShape', 'import androidx.compose.material3.Shapes', 'import androidx.compose.ui.unit.dp'])}
// Shape preset "${shapeName}". Full pills: use CircleShape / RoundedCornerShape(50) explicitly.
val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(${radii[0]}.dp),
    small = RoundedCornerShape(${radii[1]}.dp),
    medium = RoundedCornerShape(${radii[2]}.dp),
    large = RoundedCornerShape(${radii[3]}.dp),
    extraLarge = RoundedCornerShape(${radii[4]}.dp),
)
`;

// ---------------- write + report ----------------
const files = { 'Color.kt': colorKt, 'Theme.kt': themeKt, 'Type.kt': typeKt, 'Shape.kt': shapeKt };

// ---------------- CSS tokens for HTML flows (same source of truth as the Kotlin theme) ----------------
const kebab = (r) => r.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const cssVars = (k) => [...ROLES, 'surfaceTint'].map((r) => `  --md-${kebab(r)}: ${hex(schemes[k][r])};`).concat(
  ['success', 'warning'].flatMap((n) => [`  --x-${n}: ${hex(ext[k][n][0])};`, `  --x-on-${n}: ${hex(ext[k][n][1])};`, `  --x-${n}-container: ${hex(ext[k][n][2])};`, `  --x-on-${n}-container: ${hex(ext[k][n][3])};`]),
  [`  --x-data: ${hex(ext[k].data)};`]).join('\n');
const inkFor = (h) => (lumOf(M.argbFromHex(h)) > 0.4 ? '#111111' : '#FFFFFF');
const brandCss = [`  --x-brand: ${accent.toUpperCase()};`, `  --x-on-brand: ${(palette && palette.accentInk) || inkFor(accent)};`,
  ...((palette && palette.fields) || []).flatMap((f, i) => [`  --x-field-${i + 1}: ${f.bg};`, `  --x-on-field-${i + 1}: ${f.ink};`])].join('\n');
const fontImport = (f, ws) => f.source === 'google'
  ? `@import url('https://fonts.googleapis.com/css2?family=${f.family.replace(/ /g, '+')}:wght@${[...new Set(ws)].sort((a, b) => a - b).join(';')}&display=swap');`
  : `@import url('https://api.fontshare.com/v2/css?f[]=${f.slug}@${[...new Set(ws)].sort((a, b) => a - b).join(',')}&display=swap');`;
const cssFamily = (f) => `'${f.family}', 'Roboto', system-ui, sans-serif`;
const tokensCss = `/* Generated by android-design/scripts/theme.mjs — ${label}. Regenerate; do not hand-edit. */
${families.map(({ f, weights }) => fontImport(f, [...weights, ...(f.weights || [])])).join('\n')}
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block');
:root {
${cssVars('light')}
${brandCss}
  --font-display: ${cssFamily(families[0].f)};
  --font-text: ${cssFamily(sameFamily ? families[0].f : families[1].f)};
${isMono ? `  --font-figure: ${cssFamily(face.display)};\n` : ''}  --w-display: ${dW}; --w-body: ${textW}; --w-medium: ${textM};
  --ls-display: ${track.toFixed(3)}em; --ls-headline: ${(track / 2).toFixed(3)}em;
  --r-xs: ${radii[0]}px; --r-s: ${radii[1]}px; --r-m: ${radii[2]}px; --r-l: ${radii[3]}px; --r-xl: ${radii[4]}px;
  color-scheme: light;
}
:root[data-theme="dark"] {
${cssVars('dark')}
  color-scheme: dark;
}
:root[data-contrast="high"] {
${cssVars('lightHighContrast')}
}
:root[data-theme="dark"][data-contrast="high"] {
${cssVars('darkHighContrast')}
}
`;
if (!dry && cssOut) { fs.mkdirSync(path.dirname(path.resolve(cssOut)), { recursive: true }); fs.writeFileSync(cssOut, tokensCss); }
if (!dry && out) {
  fs.mkdirSync(out, { recursive: true });
  const clash = Object.keys(files).filter((f) => fs.existsSync(path.join(out, f)));
  if (clash.length && !flag('force')) die(`${clash.join(', ')} already exist in ${out}; review them, then rerun with --force to overwrite`);
  for (const [f, s] of Object.entries(files)) fs.writeFileSync(path.join(out, f), s);
}

const L = [];
const p = (s = '') => L.push(s);
p(`# Theme: ${label}`);
p(dry ? '(dry run: nothing written)' : [out ? `Wrote ${Object.keys(files).join(', ')} to ${out}` : '', cssOut ? `Wrote flow tokens to ${cssOut}` : ''].filter(Boolean).join(' · '));
p();
p('## Key colours (standard contrast)');
p('| role | light | dark |'); p('|---|---|---|');
for (const r of ['primary', 'onPrimary', 'primaryContainer', 'secondaryContainer', 'tertiary', 'surface', 'surfaceContainerLow', 'onSurface', 'onSurfaceVariant', 'outlineVariant', 'error']) p(`| ${r} | ${hex(schemes.light[r])} | ${hex(schemes.dark[r])} |`);
p(`| ext.success | ${hex(ext.light.success[0])} | ${hex(ext.dark.success[0])} |`);
p(`| ext.warning | ${hex(ext.light.warning[0])} | ${hex(ext.dark.warning[0])} |`);
p(`| ext.data | ${hex(ext.light.data)} | ${hex(ext.dark.data)} |`);
p();
p('## Contrast checks (WCAG)');
const checks = [['onSurface / surface', 'onSurface', 'surface', 4.5], ['onSurfaceVariant / surface', 'onSurfaceVariant', 'surface', 4.5], ['onPrimary / primary', 'onPrimary', 'primary', 4.5], ['onPrimaryContainer / primaryContainer', 'onPrimaryContainer', 'primaryContainer', 4.5], ['primary / surface (UI)', 'primary', 'surface', 3], ['outline / surface (UI)', 'outline', 'surface', 3]];
let fail = 0;
for (const k of ['light', 'dark', 'lightHighContrast', 'darkHighContrast']) for (const [n, a, b, min] of checks) {
  const r = ratio(schemes[k][a], schemes[k][b]);
  if (r < min || k === 'light' || k === 'dark') p(`- ${k}: ${n} = ${r.toFixed(2)}:1 ${r >= min ? '✓' : `✗ (needs ${min})`}`);
  if (r < min) fail++;
}
p();
if (fontFiles.length) {
  p('## Font files to add');
  for (const f of fontFiles) p(`- \`${f.res}\` ← ${f.family} ${f.weight} (${f.source === 'google' ? `fonts.google.com/specimen/${f.family.replace(/ /g, '+')} — use the static TTF of this weight` : `fontshare.com/fonts/${f.res.split('/').pop().replace(/_\d+\.ttf$/, '').replace(/_/g, '-')} — check the licence allows embedding in an app`})`);
  p('Check each file renders Vietnamese: "Ứng dụng Ặ Ỡ Ữ Ẩ ệ ỹ" at bodySmall and displayLarge.');
  p();
}
p('## Next');
p(`- Wrap the app: \`${themeName} { … }\` in MainActivity after enableEdgeToEdge().`);
p('- Record the decision in DESIGN.md (style, palette, type, shape, role usage rules from the direction).');
p('- Verify on device in light, dark and high contrast (references/verify.md).');
console.log(L.join('\n'));
