import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync('src/decks/lesson-08/authored-r15.html', 'utf8');
// Evaluate the bundled content/model preamble in a restricted VM (no browser, network or filesystem).
// This includes R11–R15 catalog updates; the final runtime catalog is the source of truth.
const declarations = source.slice(source.indexOf('<script type="module">') + '<script type="module">'.length, source.indexOf('const C = COLORS;'));
const slides = vm.runInNewContext(`${declarations}; JSON.parse(JSON.stringify(slides))`, Object.create(null), { timeout: 10000 });
if (slides.length !== 37 || new Set(slides.map(s => s.id)).size !== slides.length) throw new Error('Invalid R15 catalog');
const chapters = [...new Set(slides.map(s => s.chapter))].map((title, i) => ({ id: i + 1, title, start: slides.find(s => s.chapter === title).number }));
const catalog = {
  deckVersion: 'lesson-08-am-fm-r15-v1', mainSlideCount: slides.length, appendixCount: 0,
  totalMinutes: slides.reduce((sum, s) => sum + s.minutes, 0), chapters,
  slides: slides.map(s => ({ id: s.id, slideId: s.id, title: s.title, chapter: s.chapter,
    chapterId: chapters.find(c => c.title === s.chapter).id, kind: s.kind ?? '', number: s.number,
    section: false, minutes: s.minutes, note: s.note ?? '', takeaway: s.takeaway ?? '' })),
};
writeFileSync('src/decks/lesson-08/published-catalog.json', JSON.stringify(catalog, null, 2) + '\n');
const embedHead = `<script>if(new URLSearchParams(location.search).has('embedded'))document.documentElement.dataset.platformEmbed='true';</script>
<style>html[data-platform-embed] .toolbar,html[data-platform-embed] .navigation,html[data-platform-embed] #notes,html[data-platform-embed] #outline{display:none!important}html[data-platform-embed] #viewport{height:100dvh;padding:0}html[data-platform-embed] body{margin:0;overflow:hidden}</style>`;
const bridge = `
// Platform integration: the authored slide IDs remain the analytics/feedback IDs.
const platformEmbedded = new URLSearchParams(location.search).has('embedded');
window.L8.show = index => { if(Number.isInteger(index)&&index>=0&&index<slides.length)navigate(index); };
if(platformEmbedded){
  fit = function(){ $('stage').style.width='1600px';$('stage').style.height='900px';$('slide').style.transform='none'; };
  fit();
  window.addEventListener('lesson08:slide',()=>parent.postMessage({slideIndexChanged:state.slide},location.origin));
  document.addEventListener('keydown',event=>{
    if(event.target.closest('input,textarea,select,[contenteditable=true]'))return;
    if(['Escape','f','n','p'].includes(event.key.toLowerCase())||event.key==='Escape'){
      event.preventDefault();parent.postMessage({lesson08Key:event.key},location.origin);
    }
  });
}
document.body.dataset.deckVersion='${catalog.deckVersion}';
`;
const html = source.replace('</head>', embedHead + '\n</head>').replace('</script>\n</body>', bridge + '\n</script>\n</body>');
if (!html.includes('window.L8.show')) throw new Error('Missing integration bridge');
mkdirSync('public/courses/communication-systems/lesson-08', { recursive: true });
writeFileSync('public/courses/communication-systems/lesson-08/lesson.html', html);
console.log(`Lesson 08 R15: ${slides.length} slides, ${catalog.totalMinutes} planning minutes`);
