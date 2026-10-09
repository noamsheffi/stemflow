const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.resolve(__dirname, "..");
const componentPath = path.join(root, "src/components/lesson-05-player.tsx");
const cssIdentity = new Proxy({}, { get: (_target, key) => key === "__esModule" ? false : String(key) });
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.endsWith(".module.css")) return cssIdentity;
  if (request === "next/link") return ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children);
  if (request === "../lib/course-data") return { concepts: [] };
  return originalLoad.call(this, request, parent, isMain);
};
require.extensions[".tsx"] = (mod, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  mod._compile(output, filename);
};

const { lesson05Slides } = require(componentPath);
const cssPaths = [
  "src/app/globals.css",
  "src/app/lesson-04-deck.css",
  "src/components/lesson-04-player.module.css",
  "src/components/lesson-05-player.module.css",
];
const css = cssPaths.map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n")
  .replace(/:global\(([^)]+)\)/g, "$1");
// KaTeX emits both a visual HTML tree and a MathML tree. Include its layout
// rules in the standalone export so MathML stays accessible but is not painted
// as duplicate plain text when this file is opened outside the React app.
const katexCss = fs.readFileSync(path.join(root, "node_modules/katex/dist/katex.min.css"), "utf8")
  .replace(/@font-face\{[^}]+\}/g, "");

const slides = lesson05Slides.map((slide, index) => {
  const content = renderToStaticMarkup(slide.content);
  const id = `lesson-05-slide-${String(index + 1).padStart(2, "0")}`;
  const slideClass = slide.className ? ` ${escapeHtml(slide.className)}` : "";
  return `<section class="slide-page${index === 0 ? " is-active" : ""}" id="${id}" aria-label="שקף ${index + 1}: ${escapeHtml(slide.title)}" aria-hidden="${index === 0 ? "false" : "true"}"><div class="slide-canvas"><div class="sl l5-slide${slide.title.length > 34 ? " compact-title" : ""}${slideClass}"><header class="sl-h"><div class="sl-eb">${escapeHtml(slide.chapter)}</div><h2>${renderBidiQuantities(slide.title)}</h2></header><div class="sl-body">${content}</div><div class="sl-tk"><span>העיקר</span>${renderBidiQuantities(slide.takeaway)}</div><footer class="sl-f"><span>${escapeHtml(slide.chapter)}</span><span dir="ltr">${String(index + 1).padStart(2, "0")}</span></footer></div></div></section>`;
}).join("\n");

const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="תצוגה מקומית של מערך שיעור 5 במערכות תקשורת">
  <title>מערך שיעור 5 · מקלט AM</title>
  <style>${css}\n${katexCss}
    body{min-height:100vh;display:flex;flex-direction:column;background:#e6edf1}
    .local-viewer{display:flex;min-height:100vh;flex-direction:column}
    .local-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 20px;background:#13263e;color:#fff;font-family:Arial,"Noto Sans Hebrew",sans-serif}
    .local-toolbar strong{font-size:15px}.local-toolbar .count{font:13px ui-monospace,monospace;color:#b9c8d4}
    .local-stage{position:relative;width:min(calc(100vw - 40px),calc((100vh - 110px)*16/9));aspect-ratio:16/9;margin:auto;overflow:hidden;border-radius:12px;background:#f5f7f9;box-shadow:0 8px 32px #13263e20}
    .local-stage .slide-page{position:absolute;inset:0;display:none;overflow:hidden}.local-stage .slide-page.is-active{display:block}
    .local-stage .slide-canvas{position:absolute;inset-block-start:0;inset-inline-end:0;width:1600px;height:900px;transform-origin:top right}
    .local-controls{display:flex;align-items:center;justify-content:center;gap:14px;padding:12px;font-family:Arial,"Noto Sans Hebrew",sans-serif}
    .local-controls button{min-width:84px;padding:9px 15px;border:1px solid #b9cbd5;border-radius:8px;background:#fff;color:#13263e;font-weight:700;cursor:pointer}.local-controls button:disabled{opacity:.45;cursor:default}
    @media(max-width:700px){.local-toolbar{padding:10px 12px}.local-toolbar strong{font-size:12px}.local-stage{width:calc(100vw - 16px);border-radius:7px}.local-controls{padding:8px;gap:8px}.local-controls button{min-width:65px;padding:8px}}
  </style>
</head>
<body>
<main class="local-viewer l4-player" aria-label="מערך שיעור 5">
  <header class="local-toolbar"><strong>מערכות תקשורת · שיעור 05 · מקלט AM — סופר־הטרודיין וגלאי מעטפת</strong><span class="count" id="count" dir="ltr">01 / ${lesson05Slides.length}</span></header>
  <div class="local-stage" id="stage">${slides}</div>
  <nav class="local-controls" aria-label="ניווט בין שקפים"><button id="previous" type="button">הקודם</button><span id="position" dir="ltr">01 / ${lesson05Slides.length}</span><button id="next" type="button">הבא</button></nav>
</main>
<script>
(() => {
  const pages = [...document.querySelectorAll('.slide-page')];
  const stage = document.getElementById('stage');
  const position = document.getElementById('position');
  const count = document.getElementById('count');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  let current = 0;
  function sizeSlides(){
    const scale = Math.min(stage.clientWidth / 1600, stage.clientHeight / 900);
    document.querySelectorAll('.slide-canvas').forEach((canvas) => { canvas.style.transform = 'scale(' + scale + ')'; });
  }
  function show(index){
    current = Math.max(0, Math.min(pages.length - 1, index));
    pages.forEach((page, i) => { page.classList.toggle('is-active', i === current); page.setAttribute('aria-hidden', String(i !== current)); });
    const label = String(current + 1).padStart(2, '0') + ' / ' + pages.length;
    position.textContent = label; count.textContent = label;
    previous.disabled = current === 0; next.disabled = current === pages.length - 1;
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  window.addEventListener('resize', sizeSlides);
  window.addEventListener('keydown', (event) => {
    if (['ArrowLeft','PageDown',' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
    if (['ArrowRight','PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
  });
  sizeSlides(); show(0);
})();
</script>
</body>
</html>`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function renderBidiQuantities(value) {
  const pattern = /(\d+(?:[.,]\d+)?\s?(?:MHz|kHz|Hz|μs|µs|ms|nF|pF|kΩ|Ω|mV|V|dB)|\b(?:TRF|RF|LO|IF|AM|AGC|SNR|RC|LPF)\b)/g;
  return escapeHtml(value).replace(pattern, (token) => `<bdi dir="ltr">${token}</bdi>`);
}

const outputPath = path.join(root, "public/courses/communication-systems/lesson-05/lesson.html");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`Exported ${lesson05Slides.length} slides to ${path.relative(root, outputPath)}`);
