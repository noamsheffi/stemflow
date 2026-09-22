import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
// Include this loader once in each deck template; refresh a content-based version on build.
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { await visit(path); continue; }
    if (!path.endsWith('.html')) continue;
    const html = await readFile(path, 'utf8');
    if (!/class="[^"]*\bdeck\b/.test(html)) continue;
    const match = path.match(/(?:course|courses)\/([^/]+)\/(lesson-\d+)/);
    if (!match) continue;
    let next = html.replace(/ data-deck-version="[^"]*"/g, '');
    next = next.replace(/<body\b([^>]*)>/, (tag, attrs) => `<body${attrs}${attrs.includes('data-course-id=') ? '' : ` data-course-id="${match[1]}"`}${attrs.includes('data-lesson-id=') ? '' : ` data-lesson-id="${match[2]}"`}>`);
    if (!next.includes('src="/lesson-metadata.js"')) next = next.replace('</head>', '  <script defer src="/lesson-metadata.js"></script>\n</head>');
    if (!next.includes('src="/slide-feedback.js"')) next = next.replace('</head>', '  <script defer src="/slide-feedback.js"></script>\n</head>');
    const version = createHash('sha256').update(next).digest('hex').slice(0, 16);
    next = next.replace('<body', `<body data-deck-version="${version}"`);
    if (next !== html) await writeFile(path, next);
  }
}
await visit('public');
