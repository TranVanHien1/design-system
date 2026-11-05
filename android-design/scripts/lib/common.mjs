import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function load() {
  const r = (f) => JSON.parse(fs.readFileSync(path.join(SKILL_DIR, 'data', f), 'utf8'));
  return { styles: r('styles.json'), palettes: r('palettes.json'), type: r('type.json'), kinds: r('kinds.json'), patterns: r('patterns.json'), shapes: r('shapes.json') };
}

export function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function pickWeighted(items, weight, rand) {
  if (!items.length) throw new Error('nothing to pick from');
  const w = items.map((x) => Math.max(0, weight(x)));
  let t = rand() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) { t -= w[i]; if (t <= 0) return items[i]; }
  return items[items.length - 1];
}

export const swatch = (hex) => `\`${hex}\``;
