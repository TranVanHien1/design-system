#!/usr/bin/env node
// android-design · codex-image — generate images through the Codex CLI's built-in `image_gen` tool, one direct call
// per image, so no image quota goes to planning, skill reading or retries. Use ONLY when the user explicitly asks the
// skill to generate images (references/images.md).
//
//   node codex-image.mjs --spec images.json [--only id,id] [--dry-run]
//   node codex-image.mjs --prompt "<final prompt>" --out img/x.png [--size 412x468] [--ref ref.png] [--alpha]
//
// images.json: { "style": "<shared style lock, appended to every prompt>", "images": [
//   { "id": "icon", "prompt": "…", "out": "img/app-icon.png", "size": "432x432", "ref": ["img/ref.png"], "alpha": false } ] }
// Each run writes <out> (resized/cropped with ImageMagick when --size is given, original kept as <out>.src.png) and
// appends the prompt, file and Codex thread to images.log.jsonl next to the spec, so nothing is generated twice.
// Needs: codex (logged in, feature image_generation on), ImageMagick `convert` for --size. Exit code 1 if any image failed.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const flag = (k) => argv.includes(`--${k}`);
const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');

let jobs = [], style = '', base = process.cwd(), logFile;
if (opt('spec')) {
  const spec = JSON.parse(fs.readFileSync(opt('spec'), 'utf8'));
  base = path.dirname(path.resolve(opt('spec')));
  style = spec.style || '';
  const only = opt('only') ? opt('only').split(',') : null;
  jobs = spec.images.filter((j) => !only || only.includes(j.id));
  logFile = path.join(base, 'images.log.jsonl');
} else if (opt('prompt') && opt('out')) {
  jobs = [{ id: path.basename(opt('out')), prompt: opt('prompt'), out: opt('out'), size: opt('size'), ref: opt('ref') ? [opt('ref')] : [], alpha: flag('alpha') }];
  logFile = path.join(base, 'images.log.jsonl');
} else {
  console.error('usage: codex-image.mjs --spec images.json [--only ids] [--dry-run] | --prompt "<p>" --out <file> [--size WxH] [--ref f] [--alpha]');
  process.exit(2);
}

if (!flag('dry-run')) { // preflight: an unauthenticated codex fails each job after a reconnect loop; stop before spending anything
  const st = spawnSync('codex', ['login', 'status'], { encoding: 'utf8' });
  if (st.error || !/logged in/i.test((st.stdout || '') + (st.stderr || '')) || /not logged in/i.test((st.stdout || '') + (st.stderr || ''))) {
    console.error('codex is not logged in: ask the user to run `codex login` (ChatGPT account with image generation), then rerun. Nothing was generated.');
    process.exit(3);
  }
}
const done = new Set(fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => { try { const r = JSON.parse(l); return r.ok ? r.prompt + '\u0000' + r.out : ''; } catch { return ''; } }) : []);

function instruction(prompt, alpha) {
  // The whole budget goes to one image_gen call: no skill files, no shell, no variants, no prompt rewriting.
  return [
    'Call the built-in image_gen tool exactly once with the prompt between the markers, verbatim.',
    'Do not read any files, skills or references. Do not run shell commands. Do not ask questions.',
    'Do not generate variants, retries or edits. Do not rewrite or expand the prompt.',
    alpha ? 'Ask image_gen for a transparent background.' : '',
    'After the tool returns, reply with exactly: DONE',
    '<<<PROMPT', prompt, 'PROMPT>>>',
  ].filter(Boolean).join('\n');
}

let failed = 0;
for (const j of jobs) {
  const prompt = [j.prompt, style].filter(Boolean).join(' ');
  const out = path.resolve(base, j.out);
  if (done.has(prompt + '\u0000' + j.out) && fs.existsSync(out)) { console.log(`skip ${j.id}: already generated (${j.out})`); continue; }
  if (flag('dry-run')) { console.log(`--- ${j.id} → ${j.out}${j.size ? ' @' + j.size : ''}\n${prompt}\n`); continue; }
  const args = ['exec', '--json', '--skip-git-repo-check', '-s', 'read-only', '-c', 'model_reasoning_effort="low"', '--disable', 'multi_agent', '-C', os.tmpdir()];
  for (const r of j.ref || []) args.push('-i', path.resolve(base, r));
  args.push(instruction(prompt, j.alpha));
  const t0 = Date.now();
  const res = spawnSync('codex', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 10 * 60 * 1000 });
  let thread = null, imageId = null, error = null;
  for (const line of (res.stdout || '').split('\n')) {
    if (!line.trim()) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    const s = JSON.stringify(e);
    thread = thread || e.thread_id || (e.msg && e.msg.thread_id) || (/"thread_id":"([^"]+)"/.exec(s) || [])[1] || null;
    const m = /"kind":"image_gen\.generation","id":"([^"]+)"/.exec(s) || /"id":"(exec-[0-9a-f-]+)"[^}]*"kind":"image_gen/.exec(s);
    if (m) imageId = m[1];
    if (/"type":"(error|turn\.failed)"/.test(s) || /RESOURCE_EXHAUSTED|rate limit|quota/i.test(s)) error = error || s.slice(0, 300);
  }
  // fallback: newest file written under generated_images during this run
  let src = null;
  if (thread && imageId) src = ['png', 'jpg', 'webp'].map((x) => path.join(CODEX_HOME, 'generated_images', thread, `${imageId}.${x}`)).find(fs.existsSync) || null;
  if (!src) {
    const root = path.join(CODEX_HOME, 'generated_images');
    const files = fs.existsSync(root) ? fs.readdirSync(root).flatMap((d) => { const p = path.join(root, d); return fs.statSync(p).isDirectory() ? fs.readdirSync(p).map((f) => path.join(p, f)) : []; }) : [];
    src = files.filter((f) => fs.statSync(f).mtimeMs >= t0).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] || null;
  }
  const rec = { at: new Date().toISOString(), id: j.id, out: j.out, prompt, thread, src, ok: false, seconds: Math.round((Date.now() - t0) / 1000) };
  if (!src) {
    rec.error = error || (res.stderr || '').slice(-300) || 'no image produced';
    failed++;
    console.error(`FAIL ${j.id}: ${rec.error}`);
  } else {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    if (j.size) {
      fs.copyFileSync(src, out.replace(/\.\w+$/, '') + '.src.png');
      const [w, h] = j.size.split('x');
      const r = spawnSync('convert', [src, '-resize', `${w}x${h}^`, '-gravity', 'center', '-extent', `${w}x${h}`, ...(j.alpha ? [] : ['-background', 'white', '-flatten']), out]);
      if (r.status !== 0) { fs.copyFileSync(src, out); rec.note = 'convert failed, copied original'; }
    } else fs.copyFileSync(src, out);
    rec.ok = true;
    console.log(`ok ${j.id} → ${j.out} (${rec.seconds}s)`);
  }
  fs.appendFileSync(logFile, JSON.stringify(rec) + '\n');
  if (error && /RESOURCE_EXHAUSTED|rate limit|quota/i.test(error)) { console.error('quota/rate limit reached: stopping (no retries)'); failed += jobs.length - jobs.indexOf(j) - 1; break; }
}
process.exit(failed ? 1 : 0);
