import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(path,'utf8');
const catalog=JSON.parse(read('src/decks/lesson-08/published-catalog.json'));
assert.equal(catalog.slides.length,37);assert.equal(catalog.totalMinutes,138);
assert.equal(new Set(catalog.slides.map(s=>s.slideId)).size,37);
for(const [i,s] of catalog.slides.entries()){
 assert.equal(s.number,i+1);assert.match(s.slideId,/^lesson-08-(?:detectors-\d{2}|vco-sensitivity)$/);
 assert.ok(s.title&&s.note&&s.takeaway);assert.ok(catalog.chapters.some(c=>c.id===s.chapterId));
}
assert.deepEqual(catalog.chapters.map(c=>c.start),[1,16,32]);
assert.match(read('src/components/lesson-phase.tsx'),/<Lesson08Player \/>/);
assert.match(read('src/app/lecturer/lessons/[lessonId]/[phase]/page.tsx'),/<Lesson08Player lecturerMode/);
assert.match(read('src/components/student-workspace.tsx'),/lesson08DeckVersion/);
const route=read('src/app/api/student/slide-feedback/route.ts');
const pattern=route.match(/lessonId === "lesson-08" \? (\/[^\n]+?\/)\.test\(slideId\)/)[1];
const valid=new RegExp(pattern.slice(1,-1));
for(const slide of catalog.slides) assert.ok(valid.test(slide.slideId));
assert.equal(valid.test('lesson-08-detectors-99'),false);
const html=read('public/courses/communication-systems/lesson-08/lesson.html');
assert.match(html,/window.L8.show/);assert.match(html,/parent.postMessage/);
const player=read('src/components/lesson-08-player.tsx');
assert.match(player,/event.origin !== window.location.origin/);assert.match(player,/event.source !== deckFrameRef.current/);
console.log('Lesson 08 R15 catalog, 37 stable IDs, 138 minutes, platform routes and bridge: passed');
