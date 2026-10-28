/* =========================================================
   שיעור 07 · v2 — שכבת ההחלה
   רצה לפני מנוע התצוגה: מתקנת את נתוני השקפים,
   כך שהמנוע בונה, מרנדר ומאתחל סימולציות כרגיל.
   ========================================================= */
(function(){
const L7 = window.L7 = window.L7 || {};
const R = window.L7REV || [];
const S = L7.SLIDES || [];
const REPORT = [];
const CLASS = { 'קריטי':'krit', 'גבוהה':'gavoha', 'בינוני':'beinoni', 'נמוך':'namuch' };

function byNum(n){
  const id = 's' + String(n).padStart(2,'0');
  return S.find(function(s){ return s.id === id; });
}

/* החלפת גוף השקף: מהפתיחה של .sl-body ועד תחילת שורת התחתית.
   החיפוש הוא על הרצף המדויק שמייצר המפעל (F), ולכן אינו יכול לפגוע
   ב־div פנימי כלשהו. */
function setBody(slide, body){
  const re = /(<div class="sl-body">)([\s\S]*?)(<\/div>\s*<div class="sl-tk">)/;
  if (!re.test(slide.html)) return false;
  slide.html = slide.html.replace(re, function(_, a, __, c){ return a + body + '\n  ' + c; });
  return true;
}
function setTitle(slide, t){
  slide.html = slide.html.replace(/(<h2>)([\s\S]*?)(<\/h2>)/, function(_, a, __, c){ return a + t + c; });
  slide.t = t;
}
/* שורת התחתית יושבת בתוך ה-HTML, ולכן עדכון השדה slide.tk בלבד
   לא היה מגיע למסך. כאן כותבים אותה מחדש גם ב-DOM של השקף. */
function setTk(slide, tk){
  const re = /(<div class="tk-text">)([\s\S]*?)(<\/div>\s*<\/div>)/;
  if (!re.test(slide.html)) return false;
  slide.html = slide.html.replace(re, function(_, a, __, c){ return a + tk + c; });
  slide.tk = tk;
  return true;
}

R.slice().sort(function(a,b){ return a.n - b.n; }).forEach(function(rev){
  const s = byNum(rev.n);
  if (!s){
    REPORT.push({n:rev.n, ok:false, why:'שקף לא נמצא'});
    return;
  }
  const log = {n:rev.n, pr:rev.pr, find:rev.find, fix:rev.fix, title:s.t, edits:[], ok:true};
  const origNote = s.note;

  if (rev.title){ setTitle(s, rev.title); log.newTitle = rev.title; log.edits.push('כותרת'); }
  if (rev.tk){ if (setTk(s, rev.tk)) log.edits.push('שורת תחתית'); }
  if (rev.note) s.note = rev.note;

  if (rev.body){
    if (setBody(s, rev.body)) log.edits.push('גוף חדש');
    else { log.ok = false; log.why = 'גוף לא הוחלף'; }
  }

  (rev.pairs || []).forEach(function(p, i){
    if (s.html.indexOf(p[0]) >= 0){
      s.html = s.html.replace(p[0], function(){ return p[1]; });
      log.edits.push('נוסח ' + (i+1));
      return;
    }
    /* חלק מהמחרוזות ממוקדות בהערת המרצה — ושם הן מוחלפות */
    if (origNote && origNote.indexOf(p[0]) >= 0){
      s.note = s.note.replace(p[0], function(){ return p[1]; });
      log.edits.push('הערת מרצה');
      return;
    }
    if (rev.note){ log.edits.push('נוסח ' + (i+1) + ' — נכלל בהערה שהוחלפה'); return; }
    log.ok = false;
    log.why = (log.why ? log.why + ' · ' : '') + 'מחרוזת ' + (i+1) + ' לא נמצאה';
  });

  /* תוספת בסוף גוף השקף, לפני שורת התחתית */
  if (rev.append){
    const anchor = '\n  <div class="sl-tk">';
    if (s.html.indexOf(anchor) >= 0){
      s.html = s.html.replace(anchor, rev.append + anchor);
      log.edits.push('תוספת');
    } else {
      log.ok = false;
      log.why = (log.why ? log.why + ' · ' : '') + 'עוגן תחתית לא נמצא';
    }
  }

  log.rev = { n: rev.n, pr: rev.pr, find: rev.find, fix: rev.fix, title: rev.title || s.t };
  REPORT.push(log);
});

/* ---------- תג "תוקן" ליד כותרת השקף ---------- */
S.forEach(function(s){
  const rec = REPORT.find(function(r){ return 's' + String(r.n).padStart(2,'0') === s.id; });
  if (!rec || !rec.ok) return;
  s.html = s.html.replace(/(<\/div>)(\s*<h2>)/, function(_, a, b){
    return '<span class="revtag" title="שקף זה תוקן בגרסה 2 מול מפרט התיקונים">v2 · תוקן</span>' + a + b;
  });
});

/* ---------- מחיקת שקפים ----------
   שקף 13 ("98.1 הופכת ל-10.7") ושקף 17 ("האם המידע נפגע?") הוסרו
   כרשומות כפילות. המחיקה מתבצעת לפי המספר המקורי, לפני המספור מחדש,
   ולכן שאר הרשומות ממשיכות להצביע למספר המקורי שלהן. */
const DROP = L7.DROP = [
  13,          /* "98.1 MHz הופכת ל-10.7 MHz" — כפילות של 10–12 */
  17,          /* "האם המידע נפגע?" — כפילות של 16 */
  19, 20,      /* אוחדו לשקף המגבל (18) */
  24,          /* "שיפוע חיובי או שלילי?" — אוחד לשקף גלאי השיפוע (25) */
  26, 27, 28, 29, 30,  /* אוחדו לשקף "איך גלאי שיפוע הופך שינויי תדר לאות שמע?" */
  32, 33, 34, 35,      /* אוחדו לשקף "איך בנוי גלאי PLL?" (36) */
  39,          /* "בדיקת PLL" */
  40,          /* "הפסקה · 10 דקות" */
  41, 42, 44,  /* אוחדו לשקף AFC (43) */
  46, 47,      /* אוחדו לשקף "AM מול FM — מה ההבדל?" (45) */
  50, 51,      /* תרגילי סחיפה ומתח PLL — הוסרו */
  53, 54, 55, 56, 57  /* שקפי סיום וכרטיסי יציאה */
];
if (DROP.length){
  for (let i = S.length - 1; i >= 0; i--){
    if (DROP.indexOf(i + 1) >= 0) S.splice(i, 1);
  }
  REPORT.push({
    n:13, pr:'נמוך', dropped:true,
    find:'שקף 13 ("98.1 MHz הופכת ל-10.7 MHz") חזר על המרת התדר שכבר הודגמה בשקפים 10–12.',
    fix:'השקף נמחק. המספור והמד מתעדכנים אוטומטית כי הם נגזרים מאורך רשימת השקפים.'
  });
  [[19,20,'אוחדו לשקף המגבל המאוחד (18)'],
   [24,'אוחד לשקף גלאי השיפוע המאוחד (25)'],
   [26,'אוחד לשקף גלאי השיפוע המאוחד (25)'],
   [27,'אוחד לשקף גלאי השיפוע המאוחד (25)'],
   [28,'אוחד לשקף גלאי השיפוע המאוחד (25) — כולל המחשת הסרת DC'],
   [29,'אוחד לשקף גלאי השיפוע המאוחד (25)'],
   [30,'אוחד לשקף גלאי השיפוע המאוחד (25)']
  ].forEach(function(d){
    REPORT.push({ n: d[0], pr:'נמוך', dropped:true,
      find:'שקף '+d[0]+': תכנו נכלל בשקף המאוחד ולא נדרש כשקף נפרד.',
      fix:'נמחק · '+d[1]+'.' });
  });

  REPORT.push({
    n:17, pr:'נמוך', dropped:true,
    find:'שקף 17 ("האם המידע נפגע?") חזר על שקף 16 ולא הוסיף ידע.',
    fix:'השקף נמחק. תוכן "מעברי האפס" נשמר בשקף 16.'
  });
}

L7.REV = { list: R, report: REPORT, cls: CLASS };

/* המונה ביומן מוצג לפי מספר השקפים שנשארו בפועל, ולא לפי 57 המקורי */
document.addEventListener('DOMContentLoaded', function(){
  const el = document.getElementById('revCount');
  if (el) el.textContent = String(S.length);
});

/* ---------- ניווט מתוך שקף (שקף 40) ---------- */
document.addEventListener('click', function(e){
  const b = e.target.closest('[data-goto]');
  if (b && window.L7 && L7.gotoId) L7.gotoId(b.dataset.goto);
});

/* ---------- מגירת יומן התיקונים ---------- */
function renderLog(){
  const host = document.getElementById('revBody');
  if (!host) return;
  const cnt = { 'קריטי':0, 'גבוהה':0, 'בינוני':0, 'נמוך':0 };
  REPORT.forEach(function(r){ if (cnt[r.pr] != null) cnt[r.pr]++; });
  const fails = REPORT.filter(function(r){ return !r.ok; });
  let filter = 'all';

  const items = function(){
    return REPORT.filter(function(r){ return filter === 'all' || r.pr === filter; })
      .sort(function(a,b){ return a.n - b.n; })
      .map(function(r){
        return '<div class="revitem">' +
          '<h4><span class="n">' + String(r.n).padStart(2,'0') + '</span>' +
          (r.newTitle || r.title) +
          '<span class="pr ' + (CLASS[r.pr]||'') + '">' + r.pr + '</span></h4>' +
          '<p><b>ממצא:</b> ' + r.find + '</p>' +
          '<p style="margin-top:3px"><b>בוצע:</b> ' + r.fix + '</p>' +
          (r.ok ? '' : '<p style="color:#b91c1c;margin-top:3px"><b>לתשומת לב:</b> ' + (r.why||'') + '</p>') +
          '<button class="go" data-goto="s' + String(r.n).padStart(2,'0') + '">מעבר לשקף ←</button>' +
          '</div>';
      }).join('');
  };

  const paint = function(){
    host.innerHTML =
      '<div class="revsum">' +
        '<div class="k"><b>' + S.length + '</b><span>שקפים מוצגים</span></div>' +
        '<div class="k"><b>' + REPORT.length + '</b><span>רשומות תיקון מקוריות</span></div>' +
        '<div class="k"><b>' + cnt['קריטי'] + '</b><span>קריטי</span></div>' +
        '<div class="k"><b>' + cnt['גבוהה'] + '</b><span>גבוה</span></div>' +
        '<div class="k"><b>' + (cnt['בינוני']+cnt['נמוך']) + '</b><span>בינוני/נמוך</span></div>' +
      '</div>' +
      (fails.length ? '<div class="revitem" style="border-color:#fecaca;background:#fef2f2"><h4 style="color:#b91c1c">' +
        fails.length + ' רשומות לא הוחלו במלואן</h4><p>' +
        fails.map(function(f){ return 'שקף ' + f.n + ': ' + (f.why||''); }).join('<br>') + '</p></div>' : '') +
      '<p style="margin:0 14px 8px;font-size:12.5px;line-height:1.45;color:#475569;' +
        'background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:7px 10px">' +
        '<b>הבחנה:</b> ' + REPORT.length + ' רשומות תיקון מקוריות מול ' + S.length +
        ' שקפים מוצגים. ' + (REPORT.length - S.length) +
        ' שקפים אוחדו או נמחקו ולכן אינם מוצגים בנפרד. ' +
        'בדיקות ה־QA של הגרסה המלאה אינן מהוות אישור לגרסה המקוצרת.</p>' +
      '<div class="revfilters">' +
        ['all','קריטי','גבוהה','בינוני','נמוך'].map(function(k){
          return '<button type="button" data-f="' + k + '" aria-pressed="' + (filter===k) + '">' +
            (k==='all' ? 'הכול' : k) + '</button>';
        }).join('') +
      '</div>' +
      '<div id="revList">' + items() + '</div>';

    host.querySelectorAll('[data-f]').forEach(function(b){
      b.addEventListener('click', function(){ filter = b.dataset.f; paint(); });
    });
    host.querySelectorAll('[data-goto]').forEach(function(b){
      b.addEventListener('click', function(){
        if (L7.gotoId) L7.gotoId(b.dataset.goto);
        document.querySelectorAll('.drawer').forEach(function(d){ d.hidden = true; });
        const tb = document.getElementById('revBtn'); if (tb) tb.setAttribute('aria-pressed','false');
      });
    });
  };
  paint();
}

document.addEventListener('DOMContentLoaded', function(){
  const btn = document.getElementById('revBtn');
  const drawer = document.getElementById('revDrawer');
  if (btn && drawer){
    btn.addEventListener('click', function(){
      drawer.hidden = !drawer.hidden;
      btn.setAttribute('aria-pressed', String(!drawer.hidden));
      if (!drawer.hidden) renderLog();
    });
    const close = drawer.querySelector('[data-close]');
    if (close) close.addEventListener('click', function(){
      drawer.hidden = true; btn.setAttribute('aria-pressed','false');
    });
  }
  /* סימון בתוכן העניינים */
  const ol = document.getElementById('outlineList');
  if (ol){
    const mark = function(){
      ol.querySelectorAll('.ol-s').forEach(function(b){
        const rec = REPORT.find(function(r){ return 's' + String(r.n).padStart(2,'0') === 's' + String(+b.dataset.go + 1).padStart(2,'0'); });
        if (rec && !b.querySelector('.ol-rev')){
          const i = document.createElement('i'); i.className = 'ol-rev'; b.appendChild(i);
        }
      });
    };
    mark();
    new MutationObserver(function(){ mark(); }).observe(ol, {childList:true});
  }
});
})();
