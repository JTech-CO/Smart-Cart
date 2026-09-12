/** Optional, dependency-free static-package checks: node tests/validate.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const expected = ['math.js', 'geometry.js', 'cart-model.js', 'renderer.js', 'app.js'];
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
assert.equal(scripts.length, expected.length, 'Expected five ordered classic scripts.');
assert.equal(/<style\b/i.test(html), false, 'Styles must be external.');
assert.equal(/data:image\//i.test(html), false, 'Image assets must be external.');
assert.equal(fs.existsSync(path.join(root, '.nojekyll')), true, '.nojekyll is missing.');

for (const [index, match] of scripts.entries()) {
  const [, attrs, inline] = match;
  assert.match(attrs, /\bdefer\b/, 'Keep dependency-order-safe deferred loading.');
  assert.doesNotMatch(attrs, /\basync\b/, 'Do not use async: module order matters.');
  assert.equal(inline.trim(), '', 'Unexpected inline script.');
  const src = attrs.match(/\bsrc="([^"]+)"/)?.[1];
  assert.equal(src, `./js/${expected[index]}`, 'Unexpected script order or path.');
  new vm.Script(fs.readFileSync(path.join(root, src), 'utf8'), { filename: src });
}

// All HTML resource paths stay valid at both a domain root and a project subpath.
const references = [...html.matchAll(/\b(?:src|href)="([^"]+)"/gi)].map(m => m[1]);
let checked = 0;
for (const ref of references) {
  if (ref.startsWith('#')) continue;
  assert.ok(ref.startsWith('./'), `Use a project-relative asset path: ${ref}`);
  const file = path.resolve(root, ref.split(/[?#]/)[0]);
  assert.ok(file.startsWith(root + path.sep), `Path escapes project root: ${ref}`);
  assert.ok(fs.statSync(file).isFile(), `Missing local asset: ${ref}`);
  for (const base of ['https://example.com/', 'https://example.com/Smart-Cart-Studio/']) {
    assert.ok(new URL(ref, base).href.startsWith(base), `Invalid base resolution: ${ref}`);
  }
  checked++;
}

// Execute the actual procedural model without a browser or a WebGL mock.
const context = vm.createContext({ console });
vm.runInContext('globalThis.window = globalThis;', context);
for (const name of expected.slice(0, 4)) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', name), 'utf8'), context, { filename: name });
}
const model = vm.runInContext('CartLab.buildCart()', context);
assert.ok(model.vertices.length > 0 && model.vertices.length % 39 === 0, 'Invalid triangle buffer.');
assert.ok(model.vertices.every(Number.isFinite), 'Non-finite model data.');
for (const key of ['all', 'frame', 'drive', 'uwb', 'lidar', 'compute', 'power']) {
  assert.ok(model.components[key], `Missing component: ${key}`);
}
assert.equal(typeof context.CartLab.Renderer, 'function', 'Renderer definition is missing.');
console.log(JSON.stringify({
  result: 'PASS',
  scripts: scripts.length,
  resourceReferences: checked,
  vertices: model.vertices.length / 13,
  triangles: model.vertices.length / 39,
  primitives: model.primitives.length,
  note: 'Static paths, JavaScript syntax, and model generation only. This is not a browser/GPU rendering test.'
}, null, 2));
