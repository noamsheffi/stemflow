/* =========================================================
   שיעור 07 · מנוע הצפייה
   מבוסס על המנוע של שיעור 06 — סקיילינג, KaTeX, bidi,
   ניווט, שמירת מקום, תוכן עניינים ומדריך מרצה.
   ========================================================= */
(function(){
const L7 = window.L7 || (window.L7 = {});
const KEY = 'l7-fm-receiver-slide';

const stage = document.getElementById('stage');
const position = document.getElementById('position');
const count = document.getElementById('count');
const previous = document.getElementById('previous');
const next = document.getElementById('next');

/* ---------- הזרקת השקפים ---------- */
function mount(){
  const host = document.getElementById('stage');
  const wrap = document.createElement('div');
  wrap.innerHTML = '';
  (L7.SLIDES || []).forEach(function(s, i){
    const sec = document.createElement('section');
    sec.className = 'slide-page';
    sec.id = s.id;
    sec.dataset.kind = s.kind || 'הסבר';
    sec.dataset.ch = s.ch || '';
    sec.dataset.screenLabel = String(i+1);
    sec.setAttribute('aria-label', 'שקף ' + (i+1) + ' / ' + L7.SLIDES.length);
    sec.innerHTML = '<div class="slide-canvas">' + s.html.replace('%%N%%', String(i+1)).replace('%%T%%', String(L7.SLIDES.length)) + '</div>';
    host.appendChild(sec);
  });
}
mount();

const pages = Array.from(document.querySelectorAll('.slide-page'));
const N = pages.length;
let current = 0;

/* ---------- סקיילינג ---------- */
function fitSlides(){
  const r = stage.getBoundingClientRect();
  const sc = Math.min(r.width/1400, r.height/788);
  stage.querySelectorAll('.slide-canvas').forEach(function(c){ c.style.transform = 'scale(' + sc + ')'; });
}

/* ---------- KaTeX ---------- */
function renderTexIn(el){
  if (!el || !window.katex) return;
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodes = []; let n;
  while ((n = walk.nextNode())){
    if (n.parentElement && n.parentElement.closest('.katex,svg,script,style,canvas,select,option')) continue;
    if (n.textContent.indexOf('\\(') >= 0 || n.textContent.indexOf('\\[') >= 0) nodes.push(n);
  }
  nodes.forEach(function(node){
    const txt = node.textContent;
    /* סובלני לכל מספר לוכסנים לפני הסוגר — תקין גם אם מקור הנתונים
       מכיל בריחה כפולה. המפריד מנורמל לפני שליחה ל־KaTeX. */
    const re = /(\\+\[[\s\S]+?\\+\]|\\+\([\s\S]+?\\+\))/g;
    if (!re.test(txt)) return;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    while ((m = re.exec(txt))){
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const display = /\\+\[/.test(m[1]);
      let inner = m[1].replace(/^\\+[\[(]/, '').replace(/\\+[\])]$/, '');
      /* תוכן שהוזרק דרך innerHTML מכיל ישויות HTML (למשל &lt;).
         KaTeX צריך את התו עצמו, אחרת "\\lt" נשאר כטקסט והנוסחה נשברת. */
      inner = inner.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
      const holder = document.createElement('span'); holder.className = 'mth';
      try { window.katex.render(inner, holder, {displayMode: display, throwOnError: false, strict: false}); }
      catch(e){ holder.textContent = m[1]; }
      frag.appendChild(holder);
      last = m.index + m[1].length;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    node.replaceWith(frag);
  });
}

/* ---------- יחידה בקצה של קופסת הנוסחה ---------- */
/* בקופסה המסומנת ב־data-unit נכתב היחידה ליד הנוסחה, בקצה השמאלי
   שלה מבחינה חזותית — כפי שנהוג לסמן יחידות בטקסט הנדסי. */
function addUnits(page){
  page.querySelectorAll('.fxb[data-unit]').forEach(function(box){
    if (box.querySelector('.unit')) return;
    const u = document.createElement('span');
    u.className = 'unit';
    u.textContent = '[' + box.dataset.unit + ']';
    box.appendChild(u);
  });
}

/* ---------- bidi: טווחים ומספרים עם יחידות בתוך טקסט עברי ---------- */
/* טווח כמו 88–108 MHz מתהפך חזותית ב־RTL, כי המקף ניטרלי. לכן טווחים
   נעטפים ב־bdi dir=ltr לפני הטיפול ביחידות. */
const RANGE_RE = /\d[\d.,]*\s*[–—-]\s*\d[\d.,]*(?:\s?(?:kHz\/V|MHz|GHz|kHz|Hz|V|%))?/g;
const UNIT_RE = /([−\-–+]?\d[\d.,]*\s?(?:kHz\/V|MHz\/V|MHz|GHz|kHz|Hz|dBµV|dBm|dB|kΩ|Ω|µs|μs|ms|nF|pF|µF|V|W|%))/g;
function fixBidiIn(page){
  const skip = function(el){
    return el.closest('[dir=ltr],.katex,svg,script,style,button,output,bdi,select,option,canvas,.param,.pill,.ro b,.numline');
  };
  const collect = function(re){
    const w = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, null);
    const nodes = []; let n;
    while ((n = w.nextNode())){
      if (!skip(n.parentElement) && re.test(n.textContent)) nodes.push(n);
      re.lastIndex = 0;
    }
    return nodes;
  };
  const wrap = function(nodes, re){
    nodes.forEach(function(t){
      const str = t.textContent, frag = document.createDocumentFragment();
      let last = 0;
      str.replace(re, function(m, g, off){
        frag.appendChild(document.createTextNode(str.slice(last, off)));
        const b = document.createElement('bdi'); b.dir = 'ltr'; b.textContent = m;
        frag.appendChild(b); last = off + m.length; return m;
      });
      frag.appendChild(document.createTextNode(str.slice(last)));
      t.replaceWith(frag);
    });
  };
  /* סדר חשוב: קודם טווחים (הם בולעים את היחידה), ורק אחר כך מספרים בודדים */
  wrap(collect(RANGE_RE), RANGE_RE);
  wrap(collect(UNIT_RE), UNIT_RE);
}

/* ---------- הכנה: כל שקף מומר פעם אחת ---------- */
function prepare(i){
  const p = pages[i];
  if (!p || p.__ready) return;
  addUnits(p);
  renderTexIn(p);
  fixBidiIn(p);
  p.__ready = true;
}
/* המרה מלאה בעלייה: אין רגע שבו התלמיד רואה LaTeX גולמי,
   גם אם המרצה מדלג ישר לשקף 37 דרך תוכן העניינים. */
function collectTex(){ pages.forEach(function(_,i){ prepare(i); }); }

/* ---------- התאמת גרפים לחלל ---------- */
function fitCanvases(page){
  page.querySelectorAll('.plotbox > canvas').forEach(function(cv){ cv.style.width=''; cv.style.height='0px'; });
  page.querySelectorAll('.plotbox').forEach(function(box){
    const cv = box.querySelector('canvas'); if (!cv) return;
    const cs = getComputedStyle(box);
    const padX = parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
    const gap = parseFloat(cs.rowGap || cs.gap) || 0;
    let used = 0;
    Array.from(box.children).forEach(function(c){ if (c !== cv) used += c.getBoundingClientRect().height + gap; });
    let H = box.clientHeight - padY - used;
    const W = box.clientWidth - padX;
    const ar = cv.width / cv.height;
    let w, h;
    if (H > 26 && W > 26){
      w = W; h = W/ar;
      if (h > H){ h = H; w = H*ar; }
    } else {
      h = Math.max(140, Math.round(((box.parentElement||box).clientHeight || 300) / Math.max(1, box.parentElement ? box.parentElement.children.length : 1) - padY - 18));
      w = h*ar;
      const availW = W > 26 ? W : (box.clientWidth || 640) - padX;
      if (w > availW){ w = availW; h = availW/ar; }
    }
    if (!(w > 26) || !(h > 26)) return;
    cv.style.width = Math.floor(w)+'px';
    cv.style.height = Math.floor(h)+'px';
  });
}
function fitSims(page){
  if (L7.initSims) L7.initSims(page);
  fitCanvases(page);
  if (L7.drawSims) L7.drawSims(page);
}

/* ---------- ניווט ---------- */
function show(i){
  current = Math.max(0, Math.min(N-1, i));
  pages.forEach(function(p,k){
    p.classList.toggle('is-active', k === current);
    p.setAttribute('aria-hidden', String(k !== current));
    if (k === current) p.removeAttribute('inert'); else p.setAttribute('inert','');
  });
  const label = String(current+1).padStart(2,'0') + ' / ' + N;
  if (position) position.textContent = label;
  if (count) count.textContent = label;
  if (previous) previous.disabled = current === 0;
  if (next) next.disabled = current === N-1;
  try { localStorage.setItem(KEY, String(current)); } catch(e){}
  try { window.parent.postMessage({slideIndexChanged: current}, '*'); } catch(e){}
  const t = document.getElementById('drawerTitle'), b = document.getElementById('drawerBody');
  if (t && b){
    const s = L7.SLIDES[current];
    t.textContent = 'מדריך למרצה · שקף ' + (current+1);
    b.innerHTML = '<div class="note-card"><h3>' + (s.t || '') + '</h3><p>' + (s.note || '—') + '</p>' +
      (s.tk ? '<div class="tk"><b>שורה תחתונה:</b> ' + s.tk + '</div>' : '') + '</div>';
    renderTexIn(b);
  }
  markOutline();
  /* אתחול סינכרוני: המאזינים של הסימולציה חייבים להתקיים מיד עם ההצגה,
     ולא רק לאחר פריים — אחרת לחיצה מהירה על צ'יפ או מחוון נופלת על כלום. */
  prepare(current);
  if (L7.initSims) L7.initSims(pages[current]);
  requestAnimationFrame(function(){
    fitSims(pages[current]);
    requestAnimationFrame(function(){ fitSims(pages[current]); });
  });
}
L7.show = show;
L7.gotoId = function(id){ const i = pages.findIndex(function(p){ return p.id === id; }); if (i>=0) show(i); };

/* ---------- תוכן עניינים ---------- */
const outlineEl = document.getElementById('outlineList');
const chapters = [];
pages.forEach(function(p,i){
  const ch = p.dataset.ch || '';
  let g = chapters.find(function(x){ return x.name === ch; });
  if (!g){ g = {name: ch, items: []}; chapters.push(g); }
  const s = L7.SLIDES[i];
  g.items.push({i: i, title: s.t, sim: !!p.querySelector('[data-sim]'), kind: s.kind});
});
if (outlineEl){
  outlineEl.innerHTML = chapters.map(function(g){
    return '<div class="ol-ch"><div class="ol-ch-h">' + g.name + '<span class="mn">' + g.items.length + '</span></div>' +
      g.items.map(function(it){
        return '<button class="ol-s" data-go="' + it.i + '"><span class="sn">' + String(it.i+1).padStart(2,'0') + '</span><span>' +
          it.title + (it.sim ? '<span class="ol-int">סימולציה</span>' : '') + '</span></button>';
      }).join('') + '</div>';
  }).join('');
  renderTexIn(outlineEl);
  outlineEl.addEventListener('click', function(e){
    const b = e.target.closest('button[data-go]'); if (!b) return;
    show(+b.dataset.go); closeAll();
  });
}
function markOutline(){
  if (!outlineEl) return;
  outlineEl.querySelectorAll('.ol-s').forEach(function(b){ b.classList.toggle('on', +b.dataset.go === current); });
}

/* ---------- מגירות ---------- */
function toggle(id, btn){
  const el = document.getElementById(id); if (!el) return;
  el.hidden = !el.hidden;
  if (btn) btn.setAttribute('aria-pressed', String(!el.hidden));
}
function closeAll(){
  ['outlineDrawer','notesDrawer'].forEach(function(id){
    const el = document.getElementById(id); if (el) el.hidden = true;
  });
  ['toggleOutline','toggleNotes'].forEach(function(id){
    const b = document.getElementById(id); if (b) b.setAttribute('aria-pressed','false');
  });
}
document.getElementById('toggleOutline')?.addEventListener('click', function(){ toggle('outlineDrawer', this); });
document.getElementById('toggleNotes')?.addEventListener('click', function(){ toggle('notesDrawer', this); });
document.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click', closeAll); });

/* ---------- מצב הקרנה ---------- */
L7.presenter = false;
L7.togglePresenter = function(force){
  L7.presenter = (force === undefined) ? !L7.presenter : !!force;
  document.body.classList.toggle('presenting', L7.presenter);
  const b = document.getElementById('presentBtn');
  if (b){
    b.setAttribute('aria-pressed', String(L7.presenter));
    b.textContent = L7.presenter ? 'יציאה מהקרנה' : 'מצב הקרנה';
  }
  requestAnimationFrame(function(){ fitSlides(); fitSims(pages[current]); requestAnimationFrame(fitSlides); });
};
document.getElementById('presentBtn')?.addEventListener('click', function(){ L7.togglePresenter(); });

/* ---------- ניווט מקלדת ---------- */
previous?.addEventListener('click', function(){ show(current-1); });
next?.addEventListener('click', function(){ show(current+1); });
window.addEventListener('resize', function(){ fitSlides(); fitSims(pages[current]); });
document.addEventListener('keydown', function(e){
  const t = e.target;
  if (t && /INPUT|SELECT|TEXTAREA/.test(t.tagName)) return;
  if (t && t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
  if (e.key === 'ArrowLeft' || e.key === 'PageDown'){ e.preventDefault(); show(current+1); }
  else if (e.key === 'ArrowRight' || e.key === 'PageUp'){ e.preventDefault(); show(current-1); }
  else if (e.key === ' ' && !e.target.closest('button, select, input')){ e.preventDefault(); show(current+1); }
  else if (e.key === 'Home'){ e.preventDefault(); show(0); }
  else if (e.key === 'End'){ e.preventDefault(); show(N-1); }
  else if (e.key === 'o' || e.key === 'O'){ toggle('outlineDrawer', document.getElementById('toggleOutline')); }
  else if (e.key === 'n' || e.key === 'N'){ toggle('notesDrawer', document.getElementById('toggleNotes')); }
  else if (e.key === 'f' || e.key === 'F'){ e.preventDefault(); L7.togglePresenter(); }
  else if (e.key === 'Escape'){ closeAll(); if (L7.presenter) L7.togglePresenter(false); if (document.fullscreenElement) document.exitFullscreen().catch(function(){}); }
});
document.getElementById('fullBtn')?.addEventListener('click', function(){
  if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
});
pages.forEach(function(p){
  p.querySelectorAll('input, select').forEach(function(i){ i.addEventListener('keydown', function(e){ e.stopPropagation(); }); });
});

/* ---------- חשיפה מדורגת ---------- */
document.addEventListener('click', function(e){
  const nx = e.target.closest('[data-next]');
  if (nx){
    const box = nx.closest('[data-steps]');
    const steps = Array.from(box.querySelectorAll('.step'));
    const s = steps.find(function(x){ return !x.classList.contains('shown'); });
    if (s){ s.classList.add('shown'); renderTexIn(s); }
    updSteps(box);
    return;
  }
  const gr = e.target.closest('[data-gsreset]');
  if (gr){
    const box = gr.closest('[data-steps]');
    box.querySelectorAll('.gsrow').forEach(function(g){ g.classList.remove('open'); });
    box.querySelectorAll('[data-gscap]').forEach(function(c){
      c.classList.toggle('cur', c.dataset.gscap === '1');
    });
    const nb = box.querySelector('[data-gsopen]'); if (nb) nb.disabled = false;
    return;
  }
  const rs = e.target.closest('[data-sreset]');
  if (rs){
    const box = rs.closest('[data-steps]');
    box.querySelectorAll('.step').forEach(function(x){ x.classList.remove('shown'); });
    updSteps(box);
    return;
  }
  /* חשיפה מדורגת של מסלולים שלמים (שקף 05):
     data-gs על העטיפה, data-gsopen על הכפתור */
  const gb = e.target.closest('[data-gsopen]');
  if (gb){
    const box = gb.closest('[data-steps]');
    box.querySelectorAll('.gsrow').forEach(function(g){ g.classList.add('open'); });
    box.querySelectorAll('[data-gscap]').forEach(function(c){
      c.classList.toggle('cur', c.dataset.gscap === '2');
    });
    gb.disabled = true;
    return;
  }
  const q = e.target.closest('.mcq button');
  if (q){
    const box = q.closest('.mcq');
    const fb = box.parentElement.querySelector('[data-fb]');
    box.querySelectorAll('button').forEach(function(x){ x.classList.remove('right','wrong'); });
    const ok = q.dataset.ok === '1';
    q.classList.add(ok ? 'right' : 'wrong');
    if (!ok) box.querySelectorAll('button').forEach(function(x){ if (x.dataset.ok === '1') x.classList.add('right'); });
    if (fb){
      fb.className = 'fb show ' + (ok ? 'good' : 'badf');
      fb.innerHTML = (ok ? '<b>נכון.</b> ' : '<b>לא מדויק.</b> ') + (q.dataset.why || '');
      renderTexIn(fb);
    }
  }
});
function updSteps(box){
  const steps = Array.from(box.querySelectorAll('.step'));
  const n = steps.filter(function(s){ return s.classList.contains('shown'); }).length;
  const nb = box.querySelector('[data-next]');
  if (nb){
    nb.disabled = n === steps.length;
    nb.textContent = n === 0 ? 'חשיפת שלב' : (n === steps.length ? 'כל השלבים מוצגים' : 'חשיפת שלב ' + (n+1) + ' / ' + steps.length);
  }
}

/* ---------- טיימר הפסקה ---------- */
(function(){
  const el = document.getElementById('brkTimer'); if (!el) return;
  const KEYB = 'l7-break-end';
  function tick(){
    let end = 0;
    try { end = +(localStorage.getItem(KEYB) || 0); } catch(e){}
    if (!end) { el.textContent = '10:00'; return; }
    const rest = Math.max(0, Math.round((end - Date.now())/1000));
    el.textContent = String(Math.floor(rest/60)).padStart(2,'0') + ':' + String(rest%60).padStart(2,'0');
  }
  document.getElementById('brkStart')?.addEventListener('click', function(){
    try { localStorage.setItem(KEYB, String(Date.now() + 10*60*1000)); } catch(e){}
    tick();
  });
  document.getElementById('brkReset')?.addEventListener('click', function(){
    try { localStorage.removeItem(KEYB); } catch(e){}
    el.textContent = '10:00';
  });
  setInterval(tick, 1000); tick();
})();

/* ---------- עלייה ---------- */
let start = 0;
try { start = +(localStorage.getItem(KEY) || 0); } catch(e){}
const hash = location.hash.match(/^#(\d+)$/);
if (hash) start = +hash[1]-1;
collectTex();
fitSlides();
show(isFinite(start) && start >= 0 && start < N ? start : 0);
window.addEventListener('load', function(){ fitSlides(); fitSims(pages[current]); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fitSlides(); fitSims(pages[current]); });
})();
