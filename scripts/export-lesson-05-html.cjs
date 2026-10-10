const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "src/decks/lesson-05/genspark-source.html");
const outputPath = path.join(root, "public/courses/communication-systems/lesson-05/lesson.html");
let html = fs.readFileSync(sourcePath, "utf8");

const embedStyles = `
    html,body{width:100%;height:100%;min-height:0;margin:0;overflow:hidden}
    body{display:block}
    .local-viewer{display:block;width:100%;height:100%;min-height:0}
    .local-toolbar,.local-controls{display:none!important}
    .local-stage{width:100%;height:100%;min-height:0;aspect-ratio:auto;margin:0;overflow:hidden;border-radius:0;box-shadow:none}
    .local-stage .slide-canvas{inset-inline-end:auto;inset-inline-start:0;transform-origin:top left}
`;
if (!html.includes(".local-stage") || !html.includes("function show(index)")) {
  throw new Error("Genspark source is missing the expected slide stage or navigation function.");
}
html = html.replace("</style>", `${embedStyles}\n</style>`);
const notifySlide = `
    window.parent.postMessage({channel:'syllo-lesson-05',type:'slide-change',index:current,slideId:pages[current].id},'*');`;
const positionUpdate = "previous.disabled = current === 0; next.disabled = current === pages.length - 1;";
if (!html.includes(positionUpdate)) throw new Error("Could not find Genspark slide-change hook.");
html = html.replace(positionUpdate, `${positionUpdate}${notifySlide}`);
const initialNavigation = "sizeSlides(); show(0);";
const parentBridge = `
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.channel !== 'syllo-lesson-05' || event.data?.type !== 'navigate') return;
    const index = Number(event.data.index);
    if (Number.isInteger(index)) show(index);
  });
  window.parent.postMessage({channel:'syllo-lesson-05',type:'ready'},'*');
  sizeSlides(); show(0);`;
if (!html.includes(initialNavigation)) throw new Error("Could not find Genspark initial navigation hook.");
html = html.replace(initialNavigation, parentBridge);
html = html.replace(/[\t ]+$/gm, "");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`Prepared Genspark lesson with platform navigation bridge: ${path.relative(root, outputPath)}`);
