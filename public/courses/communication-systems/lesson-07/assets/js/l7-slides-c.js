/* =========================================================
   שיעור 07 · שקפים 22–40
   גילוי FM · גלאי שיפוע · PLL · הפסקה
   ========================================================= */
(function(){
window.L7 = window.L7 || {};
window.L7.SLIDES = window.L7.SLIDES || [];
const S = window.L7.SLIDES;

const F = (id, ch, kind, t, note, tk, body) => ({
  id: id, ch: ch, kind: kind, t: t, note: note, tk: tk,
  html: `<div class="sl l6-slide dense tight">
  <header class="sl-h"><div class="sl-eb">${ch} · שיעור 7</div><h2>${t}</h2></header>
  <div class="sl-body">${body}</div>
  <div class="sl-tk"><span>שורה תחתונה</span><div class="tk-text">${tk}</div></div>
  <footer class="sl-f"><span>${ch}</span><span dir="ltr">%%N%% / %%T%%</span></footer>
</div>`
});
const MAP = (on) => `<div class="rcmini">
  <span style="--rc:#0f172a" class="${on==='ant'?'on':''}">אנטנה</span><i>‹</i>
  <span style="--rc:#0891b2" class="${on==='rf'?'on':''}">RF</span><i>‹</i>
  <span style="--rc:#7c3aed" class="${on==='mix'?'on':''}">ערבל</span><i>‹</i>
  <span style="--rc:#059669" class="${on==='if'?'on':''}">IF</span><i>‹</i>
  <span style="--rc:#d97706" class="${on==='lim'?'on':''}">מגבל</span><i>‹</i>
  <span style="--rc:#db2777" class="${on==='det'?'on':''}">גלאי</span><i>‹</i>
  <span style="--rc:#475569" class="${on==='aud'?'on':''}">שמע</span>
</div>`;

/* ---------------- 22 ---------------- */
S.push(F('s22','גילוי FM','מבנה',
 'מה חסר אחרי המגבל?',
 'השקף הזה הוא רק מיקום — אל תסבירו בו גילוי. הדליקו את המפה עד המגבל, הראו שהגלאי נשאר כה, ושאלו מה עוד חסר. את התשובה תנו בשקף הבא, לא כאן.',
 'אחרי המגבל יש עדיין FM — ואין עדיין שמע.',
 `${MAP('lim')}
<div class="rcmap" style="margin:6px 0">
  <div class="rc off" style="--rc:#0f172a">אנטנה</div><i>←</i>
  <div class="rc off" style="--rc:#0891b2">מגבר RF</div><i>←</i>
  <div class="rc off" style="--rc:#7c3aed">ערבל</div><i>←</i>
  <div class="rc off" style="--rc:#059669">מגבר IF</div><i>←</i>
  <div class="rc on" style="--rc:#d97706">מגבל<small>משרעת קבועה</small></div><i>←</i>
  <div class="rc" style="--rc:#db2777;border-style:dashed">גלאי<small>?</small></div><i>←</i>
  <div class="rc off" style="--rc:#475569">שמע</div>
</div>
<div class="g2">
  <div class="card5">
    <h3>מה יש לנו</h3>
    <p>גל בתדר משתנה, משרעת קבועה, נקי מרעש משרעת.</p>
    <p><b>אבל:</b> עדיין אין מתח שמע שיכול להזיז ממברנה.</p>
  </div>
  <div class="card5 ask">
    <h3>מה עוד חסר</h3>
    <p>המתח שיוצא מהגלאי צריך להשתנות <b>בהתאם לתדר</b> — ולא בהתאם למשרעת.</p>
  </div>
</div>`));

/* ---------------- 23 ---------------- */
S.push(F('s23','גילוי FM','המחשה',
 'מה צריך לצאת מהגלאי?',
 'המחשה איכותית בלבד — שלוש נקודות, בלי מחוון רציף. זה מכוון: אם תיתן מחוון, הכיתה תראה בזה כיול. בקשו מהם לנחש מה יקרה למשרעת ביציאה בכל אחת מהשלוש.',
 'גלאי FM ממפה תדר למתח: כל סטייה מקבלת מתח משלה.',
 `${MAP('det')}
<div class="simwrap" data-sim="f2v" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="map" width="1500" height="360"></canvas></div>
      <div class="plotbox tight"><canvas data-c="wave" width="1500" height="300"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:315px;width:315px">
    <div class="ctrl tight">
      <p class="plotcap sm"><b>בחרו נקודת תדר:</b></p>
      <div class="chips">
        <button class="chip" type="button" data-pt="0" aria-pressed="false">−Δf</button>
        <button class="chip" type="button" data-pt="1" aria-pressed="true">מרכז</button>
        <button class="chip" type="button" data-pt="2" aria-pressed="false">+Δf</button>
      </div>
      <div class="ro">
        <div><small>תדר</small><b data-o="pt">במרכז</b></div>
        <div class="hl"><small>מתח</small><b data-o="vol">יחסי 100%</b></div>
      </div>
      <p class="hint">ההמחשה <b>איכותית</b>: הכיוון והקנה תלויים במימוש ובכיול הגלאי.</p>
    </div>
  </div>
</div>
<div class="mdl">המחשה איכותית · אין נוסחה בשקף זה</div>`));

/* ---------------- 24 ---------------- */
S.push(F('s24','גילוי FM','הסבר',
 'שיפוע חיובי או שלילי?',
 'המחשה קצרה אך חשובה: אותו גלאי, שני כיווני שיפוע, שני סימני מוצא. זו הסיבה שקיטוב השמע יכול להתהפך בין מקלטים שונים. אל תזכירו עדיין את <bdi dir="ltr">K_d</bdi> — הוא מגיע בשקף 29.',
 'כיוון השיפוע קובע אם מתח המוצא עולה או יורד עם התדר.',
 `<div class="g2">
  <div class="card5">
    <h3>שיפוע עולה</h3>
    <p>תדר עולה ← משרעת עולה ← מתח מוצא עולה.</p>
    <div class="fxb sm" data-unit="MHz">\\[f \\uparrow \\Rightarrow V \\uparrow\\]</div>
  </div>
  <div class="card5">
    <h3>שיפוע יורד</h3>
    <p>תדר עולה ← משרעת יורדת ← מתח מוצא יורד.</p>
    <div class="fxb sm" data-unit="MHz">\\[f \\uparrow \\Rightarrow V \\downarrow\\]</div>
      <div class="pkey"><div class="r"><b>f</b><span>תדר הכניסה</span><em>MHz</em></div><div class="r"><b>V</b><span>מתח המוצא</span><em>V</em></div></div>
  </div>
</div>
<div class="explain">
  בשני המקרים המידע נשמר — אבל <b>הקיטוב מתהפך</b>. מקלט שבנוי על שיפוע יורד יוצא אותו שמע בדיוק, רק בסימן הפוך. לכן בודקים קיטוב לפני שמסיקים שיש תקלה.
</div>
<div class="caveat">
  <span class="cv-lab">לזכור</span>
  <p>המתח יכול לעלות או לרדת — תלוי במאפייני הגלאי. אין "כיוון נכון" אוניברסלי.</p>
</div>`));

/* ---------------- 25 ---------------- */
S.push(F('s25','גילוי FM','הסבר',
 'מסנן תהודה הוא כבר גלאי',
 'הרעיון המבריק: לא צריך רכיב מיוחד — מסנן LC שהתדר שלו לא מיושר לתדר הביניים הופך בעצמו לגלאי. הזיזו את <bdi dir="ltr">f₀</bdi> והראו איך המשרעת בנקודת העבודה משתנה. זה מה שמכונה גלאי שיפוע.',
 'מסנן שתלוי בתדר הוא כבר התחלה של גלאי.',
 `${MAP('det')}
<div class="simwrap" data-sim="slope" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="curve" width="1500" height="360"></canvas></div>
      <div class="plotbox tight"><canvas data-c="time" width="1500" height="290"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>שיא התהודה · f₀</label><output data-o="f">10.70 MHz</output></div>
        <input type="range" data-k="f" min="9.2" max="12.6" step="0.05" value="10.7"></div>
      <div class="ro">
        <div class="hl"><small>משרעת</small><b data-o="amp">100%</b></div>
        <div><small>שיפוע</small><b data-o="slopeSign">חיובי ↑</b></div>
      </div>
      <p class="status" data-o="st">בתחום המקומי</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>שני תדרים, לא אחד</h3>
      <p style="font-size:19px"><b>f₀</b> — שיא התהודה של הסליל והקבל.</p>
      <p style="font-size:19px"><b>f_IF</b> — תדר העבודה של המקלט (<bdi dir="ltr">10.7 MHz</bdi>).</p>
      <p style="font-size:19px">אם הם שווים — אין שיפוע, ואין גילוי.</p>
    </div>
  </div>
</div>`));

/* ---------------- 26 ---------------- */
S.push(F('s26','גילוי FM','הסבר',
 'היכן נקודת העבודה?',
 'הנקודה הקריטית: אף אחד לא עובד על השיא. על השיא השיפוע אפס, ולכן כל סטייה קטנה נותנת שינוי אפס — כלומר אין גילוי. עובדים על השיפוע, באמצע, היכן שהנגזרת גדולה.',
 'נקודת העבודה יושבת על השיפוע — לא על שיא התהודה.',
 `<div class="g3 tightgap">
  <div class="card5 warnbox"><h3>על השיא</h3><p>שיפוע <b>אפס</b>. סטייה קטנה ← שינוי אפס. אין גילוי.</p></div>
  <div class="card5 ok"><h3>על השיפוע</h3><p>שיפוע <b>מקסימלי</b>. סטייה קטנה ← שינוי מדיד. כאן עובדים.</p></div>
  <div class="card5 warnbox"><h3>מחוץ לתחום</h3><p>משרעת קרובה לאפס, והקשר <b>לא ליניארי</b>. עיוות.</p></div>
</div>
<div class="explain">
  נקודת העבודה נקבעת כך ש־\\(f_{IF}\\) יושב על המדרון, מרחק מהוגן מ־\\(f_0\\). המרחק הזה קובע גם את <b>רוחב התחום הליניארי</b>: ככל שהשיפוע תלול יותר, התחום צר יותר — וסטייה גדולה מדי יוצאת ממנו.
</div>
<div class="symkey">
  <span class="s">f₀</span> — תדר שיא התהודה, ב־<bdi dir="ltr">MHz</bdi>. <b>אינו</b> תדר העבודה. <span class="s">f_IF</span> — תדר העבודה, <bdi dir="ltr">10.7 MHz</bdi>.
</div>`));

/* ---------------- 27 ---------------- */
S.push(F('s27','גילוי FM','המחשה',
 'איך שינוי תדר הופך למעטפת?',
 'השקף הזה הוא הצעד החסר בין העקומה לגרף הזמן, ולרוב הוא מדולג. הזיזו את התדר לאט והראו ששני הגרפים זזים יחד: הסמן על העקומה והמשרעת בגל הזמן. בלי הקישור הזה, הסטודנט לא מבין איך מעקומת תדר נולד שמע.',
 'כל שינוי תדר הופך לשינוי משרעת — וזו המעטפת.',
 `${MAP('det')}
<div class="simwrap" data-sim="slopeflow" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="c" width="1500" height="350"></canvas></div>
      <div class="plotbox tight"><canvas data-c="t" width="1500" height="300"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:315px;width:315px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>תדר הכניסה</label><output data-o="f">10.70 MHz</output></div>
        <input type="range" data-k="f" min="9.4" max="12.2" step="0.02" value="10.7"></div>
      <div class="ro">
        <div class="hl"><small>משרעת</small><b data-o="amp">100%</b></div>
      </div>
      <p class="hint"><b>הקישור:</b> הסמן על העקומה והמשרעת בגל שלמטה זזים יחד. זה כל הסוד.</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
  </div>
</div>`));

/* ---------------- 28 ---------------- */
S.push(F('s28','גילוי FM','שרשרת',
 'ממעטפת לאות שמע',
 'כאן נסגר המעגל: המעטפת עצמה עוד נושאת רכיב DC (המשרעת הממוצעת). גלאי מעטפת מחלץ אותה, והסרת ה־DC מחזירה את האות סביב אפס. הראו את קו ה־DC לפני ואחרי — זה הפרט שהסטודנטים מפספסים.',
 'גלאי מעטפת מחלץ את המעטפת; הסרת DC מחזירה אות סביב אפס.',
 `<div class="flow5" style="display:flex;gap:8px;align-items:stretch">
  <div class="card5" style="flex:1"><h3>1 · תדר</h3><p>FM סביב <bdi dir="ltr">10.7 MHz</bdi></p></div>
  <div class="card5" style="flex:1"><h3>2 · משרעת</h3><p>המסנן משנה את המשרעת לפי התדר</p></div>
  <div class="card5" style="flex:1"><h3>3 · מעטפת</h3><p>גלאי מעטפת עוקב אחרי הגובה</p></div>
  <div class="card5" style="flex:1"><h3>4 · הסרת DC</h3><p>קבל צימוד מסלק את הרכיב הקבוע</p></div>
</div>
<div class="g2" style="margin-top:2px">
  <div class="card5">
    <h3>לפני הסרת DC</h3>
    <p>המעטפת יושבת על מתח ממוצע חיובי — יש "היסט" קבוע.</p>
    <div class="fxb sm" data-unit="V">\\[v=V_{DC}+v_{audio}(t)\\]</div>
  </div>
  <div class="card5 ok">
    <h3>אחרי הסרת DC</h3>
    <p>האות ממורכז סביב אפס, מתאים להגברה ולשמע.</p>
    <div class="fxb sm" data-unit="V">\\[v=v_{audio}(t)\\]</div>
      <div class="pkey"><div class="r"><b>v</b><span>מתח המוצא</span><em>V</em></div><div class="r"><b>V<sub>DC</sub></b><span>רכיב ישר שהוסר</span><em>V</em></div></div>
  </div>
</div>
<div class="caveat">
  <span class="cv-lab">הבחנה</span>
  <p>גלאי המעטפת הוא <b>אותו רכיב</b> כמו במקלט AM — הוא לא ייחודי ל־FM. הייחוד הוא במסנן השיפוע שלפניו.</p>
</div>`));

/* ---------------- 29 ---------------- */
S.push(F('s29','גילוי FM','נוסחה',
 'נוסחת גלאי השיפוע — קירוב מקומי',
 'הנוסחה מגיעה רק אחרי שההמחשה עבדה. הדגישו שני תנאי תוקף: (1) רק בתחום הליניארי, (2) <bdi dir="ltr">K_d</bdi> תלוי בנקודת העבודה ובשיפוע — לא קבוע אוניברסלי. הציגו את טבלת הסימונים לפני הדוגמה המספרית, ולא אחריה.',
 'הנוסחה היא משיק — לא חוק. מחוץ לתחום היא מפסיקה לתאר.',
 `<div class="g21">
  <div class="card5">
    <h3>הנוסחה</h3>
    <div data-unit="V" class="fxb">\\[v_{out}(t)\\approx K_d\\left[f_{in}(t)-f_c\\right]\\]</div>
    <p class="pcite" style="font-size:19px;color:#64748b;margin:2px 0 4px">תקפה רק בתחום הליניארי המסומן סביב \\(f_c\\).</p>
    <table class="vars">
      <tr><th>סימון</th><th>משמעות</th><th>יחידה</th></tr>
      <tr><td class="s">v_out</td><td>מתח מוצא הגלאי</td><td class="u">V</td></tr>
      <tr><td class="s">K_d</td><td>רגישות הגלאי (שיפוע)</td><td class="u">V/Hz</td></tr>
      <tr><td class="s">f_in</td><td>תדר הכניסה הרגעי</td><td class="u">Hz</td></tr>
      <tr><td class="s">f_c</td><td>תדר ייחוס / נקודת עבודה</td><td class="u">Hz</td></tr>
    </table>
  </div>
  <div class="card5">
    <h3>דוגמה</h3>
    <p style="font-size:19px">סטייה של <bdi dir="ltr">20 kHz</bdi> מ־\\(f_c\\), ו־\\(K_d=0.4\\ \\text{mV/kHz}\\).</p>
    <div class="numline"><span class="nl-k">נוסחה</span><span class="nl-f">v = K_d · Δf</span><span class="nl-r">—</span></div>
    <div class="numline"><span class="nl-k">הצבה</span><span class="nl-f">0.4 mV/kHz × 20 kHz</span><span class="nl-r">—</span></div>
    <div class="numline ok"><span class="nl-k">תוצאה</span><span class="nl-f">v_out</span><span class="nl-r">8 mV</span></div>
    <div class="caveat" style="margin-top:5px"><span class="cv-lab">שימו לב</span><p style="font-size:18px"><bdi dir="ltr">f_c</bdi> אינו בהכרח <bdi dir="ltr">f₀</bdi> (שיא התהודה), ואינו בהכרח <bdi dir="ltr">f_IF</bdi> — הוא <b>נקודת העבודה שנבחרה</b> על השיפוע.</p></div>
  </div>
</div>`));

/* ---------------- 30 ---------------- */
S.push(F('s30','PLL','המחשה',
 'מגבלת גלאי השיפוע',
 'ההמחשה שחייבת לבוא לפני PLL, אחרת PLL נראה כמו עוד רכיב. הגדילו את הסטייה והראו שהמוצא מתעוות ולא רק מתחזק. זה מה שמצדיק מעבר לשיטה אחרת.',
 'סטייה גדולה יוצאת מהתחום הליניארי — והמוצא מתעוות.',
 `${MAP('det')}
<div class="simwrap" data-sim="linappx" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="app" width="1600" height="470"></canvas></div></div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>סטייה מ־f_c</label><output data-o="dev">0%</output></div>
        <input type="range" data-k="dev" min="-100" max="100" value="0"></div>
      <div class="ro">
        <div class="hl"><small>שגיאת קירוב</small><b data-o="err">0%</b></div>
      </div>
      <p class="status" data-o="st">בתחום הסימון — הקירוב תקף</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 warnbox" style="flex:0 0 auto">
      <h3>מה נדרש</h3>
      <p style="font-size:19px">גלאי שעוקב אחרי התדר <b>לאורך תחום פעולה רחב</b>, ולא רק על קטע צר של עקומה.</p>
    </div>
  </div>
</div>`));

/* ---------------- 31 ---------------- */
S.push(F('s31','PLL','הסבר',
 'מהי מערכת משוב?',
 'אנלוגיה אחת בלבד — ואז עוזבים. אל תבנו את כל PLL על כף אחת. המסר: משוב אינו קסם, הוא מדידה + תיקון, ולכן הוא מקטין שגיאה. הזיזו את מחוון ההגבר והראו שההתכנסות מהירה יותר.',
 'משוב = מודדים שגיאה, מתקנים, והשגיאה מתקטנת.',
 `<div class="simwrap" data-sim="feedback" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="fb" width="1600" height="470"></canvas></div></div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>עוצמת התיקון</label><output data-o="gain">0.60</output></div>
        <input type="range" data-k="gain" min="1" max="14" value="6"></div>
      <div class="ro"><div class="hl"><small>זמן התכנסות</small><b data-o="tc">0.76 s</b></div></div>
      <p class="hint">התיקון לא מבטל את השגיאה בבת אחת — הוא מקטין אותה עם הזמן.</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>האנלוגיה</h3>
      <p style="font-size:19px">נהג עוקב אחרי רכב: רואה פער, לוחץ גז או ברקס. <b>הפער</b> הוא השגיאה, <b>הדוושה</b> היא אות הבקרה.</p>
    </div>
  </div>
</div>`));

/* ---------------- 32 ---------------- */
S.push(F('s32','PLL','המחשה',
 'מה PLL מנסה לעשות?',
 'ההבחנה בין תדר למופע חייבת להיעשות כאן, לפני שמציגים את המשווה. הזיזו לאט והראו שני דברים נפרדים: הפער בתדר (הגלים מתרחקים) והפער במופע (הגלים לא מסונכרנים).',
 'ה־VCO צריך להתאים גם תדר וגם מופע — לא רק תדר.',
 `${MAP('det')}
<div class="simwrap" data-sim="prelock" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="pr" width="1600" height="440"></canvas></div></div>
  <div class="gtcol" style="flex-basis:315px;width:315px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>הפרש תדר</label><output data-o="df">9%</output></div>
        <input type="range" data-k="df" min="0" max="2" step="0.02" value="0.9"></div>
      <p class="status" data-o="st">התדרים שונים</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
      <p class="hint">אפסו את הפער: התדרים משתווים, אבל <b>המופע</b> עוד יכול להיות שונה.</p>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>שני גדלים</h3>
      <p style="font-size:19px"><b>תדר</b> — כמה מהר הגל מתנודד.</p>
      <p style="font-size:19px"><b>מופע</b> — היכן הגל נמצא ברגע נתון.</p>
    </div>
  </div>
</div>`));

/* ---------------- 33 ---------------- */
S.push(F('s33','PLL','המחשה',
 'משווה מופע',
 'הראו את שני הגלים ואת הפלט שלהם באותו חלון זמן — זה מה שהופך את המשווה לרכיב מדיד ולא ל"קופסה". שימו לב שהפלט תלוי ב־<bdi dir="ltr">sin</bdi> של הפרש המופע, ולכן הוא מתאפס בשני קצוות התחום.',
 'המשווה מייצר אות שגדל עם הפרש המופע — וזה אות השגיאה.',
 `${MAP('det')}
<div class="simwrap" data-sim="phasedet" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="in" width="1500" height="330"></canvas></div>
      <div class="plotbox tight"><canvas data-c="out" width="1500" height="330"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>הפרש מופע · Δφ</label><output data-o="phi">60°</output></div>
        <input type="range" data-k="phi" min="0" max="180" step="5" value="60"></div>
      <div class="ro"><div class="hl"><small>פלט המשווה</small><b data-o="vd">87%</b></div></div>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>סימונים</h3>
      <table class="vars" style="font-size:17px">
        <tr><td class="s">φ_in</td><td>מופע הכניסה</td><td class="u">rad / °</td></tr>
        <tr><td class="s">φ_vco</td><td>מופע ה־VCO</td><td class="u">rad / °</td></tr>
        <tr><td class="s">v_d</td><td>מתח השגיאה</td><td class="u">V</td></tr>
      </table>
    </div>
  </div>
</div>`));

/* ---------------- 34 ---------------- */
S.push(F('s34','PLL','המחשה',
 'מסנן LPF בחוג',
 'המסנן הזה עושה שני תפקידים בבת אחת — וזה מבלבל: הוא מחליק את אות השגיאה, ובכך גם <b>יוצר</b> את מתח הבקרה. הזיזו את תדר החיתוך והראו את המחיר: חיתוך נמוך = חלק אבל איטי; גבוה = מהיר אבל רוחש.',
 'ה־LPF הוא גם מסנן וגם יוצר מתח הבקרה.',
 `${MAP('det')}
<div class="simwrap" data-sim="lpf" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="raw" width="1500" height="330"></canvas></div>
      <div class="plotbox tight"><canvas data-c="filt" width="1500" height="330"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>תדר חיתוך LPF</label><output data-o="fc">0.9 kHz</output></div>
      <div class="pkey"><div class="r"><b>f<sub>c</sub></b><span>תדר החיתוך של LPF</span><em>kHz</em></div></div>
        <input type="range" data-k="fc" min="0.3" max="3.6" step="0.1" value="0.9"></div>
      <p class="status" data-o="st">איזון</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 warnbox" style="flex:0 0 auto">
      <h3>הפשרה</h3>
      <p style="font-size:19px"><b>נמוך:</b> חלק, אבל איטי מדי לעקוב.</p>
      <p style="font-size:19px"><b>גבוה:</b> עוקב מהר, אבל משאיר ריחוש.</p>
    </div>
  </div>
</div>`));

/* ---------------- 35 ---------------- */
S.push(F('s35','PLL','נוסחה',
 'VCO: מתח הופך לתדר',
 'הנוסחה היא ליניארית רק בטווח העבודה — וזה תנאי התוקף. הראו את הגרף: השיפוע הוא <bdi dir="ltr">K_VCO</bdi>, והחתך בציר האנכי הוא <bdi dir="ltr">f_free</bdi>. יחידה: <bdi dir="ltr">MHz/V</bdi> או <bdi dir="ltr">kHz/V</bdi>.',
 'תדר ה־VCO עולה ליניארית עם מתח הבקרה — עד גבול הטווח.',
 `<div class="simwrap" data-sim="vco" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotbox tight" style="flex:1 1 0"><canvas data-c="vco" width="1400" height="420"></canvas></div>
    <div class="g3 tightgap">
      <div class="numline"><span class="nl-k">V_ctrl</span><span class="nl-f">—</span><span class="nl-r" data-o="v">2.0 V</span></div>
      <div class="numline hl"><span class="nl-k">f_VCO</span><span class="nl-f">—</span><span class="nl-r" data-o="f">22.00 MHz</span></div>
      <div class="numline"><span class="nl-k">K_VCO</span><span class="nl-f">—</span><span class="nl-r" data-o="kv">6.0 MHz/V</span></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:340px;width:340px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>מתח בקרה</label><output data-o="v2">2.0 V</output></div>
        <input type="range" data-k="v" min="0" max="5" step="0.1" value="2"></div>
      <div class="ctl sm"><div><label>רגישות · K_VCO</label><output data-o="kv2">6.0 MHz/V</output></div>
        <input type="range" data-k="kv" min="2" max="12" step="0.5" value="6"></div>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>הנוסחה</h3>
      <div data-unit="Hz" class="fxb sm">\\[f_{VCO}=f_{free}+K_{VCO}\\,V_{ctrl}\\]</div>
      <div class="symkey" style="font-size:18px;margin-top:4px">
        <span class="s">f_free</span> תדר ללא מתח · <span class="s">K_VCO</span> <bdi dir="ltr">Hz/V</bdi> · <span class="s">V_ctrl</span> <bdi dir="ltr">V</bdi>
      </div>
    </div>
  </div>
</div>`));

/* ---------------- 36 ---------------- */
S.push(F('s36','PLL','מבנה',
 'סוגרים את החוג',
 'זה הרגע שבו מעגל הופך למערכת. חשפו שלב אחד בכל לחיצה, ובכל שלב אמרו מה נכנס ומה יוצא. אל תסגרו את החץ עד שכל ארבעת הבלוקים הוסברו — אחרת נוצרת "קופסה שחורה".',
 'ארבעה בלוקים וחץ אחד שהופך אותם למערכת.',
 `${MAP('det')}
<div class="rcmap" style="margin:4px 0">
  <div class="rc" style="--rc:#db2777">אות FM<small>מ־Limiter</small></div><i>←</i>
  <div class="rc" style="--rc:#7c3aed">משווה מופע<small>v_d</small></div><i>←</i>
  <div class="rc" style="--rc:#0891b2">LPF<small>V_ctrl</small></div><i>←</i>
  <div class="rc" style="--rc:#059669">VCO<small>f_VCO</small></div>
</div>
<div class="flowback" style="display:flex;align-items:center;gap:10px;background:#f0f9ff;border:1px solid #7dd3fc;border-left:5px solid #0284c7;border-radius:10px;padding:7px 14px">
  <span style="font-size:20px;font-weight:800;color:#075985">↑ החץ חוזר:</b></span>
  <span style="font-size:20px;color:#0c4a6e">מוצא ה־VCO נכנס חזרה למשווה המופע. זו סגירת החוג — ובלעדיה אין PLL.</span>
</div>
<div class="g3 tightgap">
  <div class="card5"><h3>נכנס</h3><p>FM בתדר משתנה.</p></div>
  <div class="card5"><h3>יוצא</h3><p>מתח בקרה <bdi dir="ltr">V_ctrl</bdi> — שגם הוא השמע.</p></div>
  <div class="card5"><h3>בצד</h3><p>ה־VCO, שנעזר ב־\\(V_{ctrl}\\) כדי לעקוב.</p></div>
</div>`));

/* ---------------- 37 ---------------- */
S.push(F('s37','PLL','המחשה',
 'מהי נעילה?',
 'שלושה מצבים: לפני, התכנסות, נעילה. הזיזו את מחוון הסטייה עד מעבר לטווח העקיבה והראו שהשגיאה נשארת — לא שהיא "נעלמת" או "נכשלת". גם הודעת המצב אומרת במפורש: מודל מפושט, לא סף פיזיקלי.',
 'בנעילה ה־VCO עוקב והשגיאה נשארת קטנה; מחוץ לטווח היא נשארת.',
 `<div class="simwrap" data-sim="pll" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="pll" width="1600" height="500"></canvas></div></div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>סטיית תדר הכניסה</label><output data-o="dev">30%</output></div>
        <input type="range" data-k="dev" min="0" max="100" value="30"></div>
      <div class="ctl sm"><div><label>טווח עקיבה</label><output data-o="k">0.40</output></div>
        <input type="range" data-k="k" min="10" max="90" value="40"></div>
      <div class="ro">
        <div class="ok" data-o="lockbadge"><small>מצב</small><b data-o="mode">נעילה</b></div>
        <div class="hl"><small>V_ctrl שיא</small><b data-o="vmax">30%</b></div>
      </div>
      <p class="status" data-o="st">בתוך טווח העקיבה</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>תנאי תוקף</h3>
      <p style="font-size:18px">המודל מדגים <b>עקרון</b>. טווח הנעילה האמיתי תלוי ב־\\(K_{VCO}\\), ב־<bdi dir="ltr">LPF</bdi> ובמשווה — ואינו מספר קבוע.</p>
    </div>
  </div>
</div>`));

/* ---------------- 38 ---------------- */
S.push(F('s38','PLL','המחשה',
 'איך PLL מגלה FM?',
 'זה הרגע שבו מתברר למה כל החוג נבנה: מתח הבקרה <b>הוא</b> השמע. הראו את ארבעת הגלים מסונכרנים — כשה־<bdi dir="ltr">f_in</bdi> עולה, ה־<bdi dir="ltr">V_ctrl</bdi> עולה יחד איתו. הסתייגו: השוויון מספרי תלוי כיול.',
 'מתח הבקרה שמחזיק את ה־VCO בעקבות — הוא אות השמע.',
 `<div class="simwrap" data-sim="pll" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="pll" width="1600" height="500"></canvas></div></div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>סטיית תדר הכניסה</label><output data-o="dev">30%</output></div>
        <input type="range" data-k="dev" min="0" max="100" value="30"></div>
      <div class="ctl sm"><div><label>טווח עקיבה</label><output data-o="k">0.40</output></div>
        <input type="range" data-k="k" min="10" max="90" value="40"></div>
      <p class="hint"><b>התבוננו:</b> הגל הכחול (כניסה) והגל הירוק (מתח בקרה) נעים יחד. זה הגילוי.</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 ok" style="flex:0 0 auto">
      <h3>הקשר</h3>
      <div class="fxb sm" data-unit="V">\\[v_{out}=\\frac{\\Delta f}{K_{VCO}}\\]</div>
      <div class="pkey"><div class="r"><b>v<sub>out</sub></b><span>מתח השמע</span><em>V</em></div><div class="r"><b>Δf</b><span>סטיית התדר</span><em>kHz</em></div><div class="r"><b>K<sub>VCO</sub></b><span>רגישות ה־VCO</span><em>kHz/V</em></div></div>
      <p style="font-size:18px">השוויון תקף במודל ליניארי מכויל — לא בכל מקלט.</p>
    </div>
  </div>
</div>`));

/* ---------------- 39 ---------------- */
S.push(F('s39','PLL','בדיקה',
 'בדיקת PLL',
 'שלוש שאלות עם חשיפה מדורגת — אל תגלו את התשובות בבת אחת. המטרה היא שהכיתה תנמק לפי מתח הבקרה, לא לפי תחושה. השאלה השלישית היא המלכודת: סטייה גדולה אינה "נעלמת", היא נשארת.',
 'בנעילה — השגיאה קטנה; מחוץ לטווח — היא נשארת ולא נעלמת.',
 `<div class="g3 tightgap">
  <div class="card5" data-steps>
    <h3>1 · היכן השמע?</h3>
    <div class="steps" style="margin-top:4px">
      <div class="step">מוצא <b>ה־LPF</b> — הוא גם מתח הבקרה של ה־VCO.</div>
    </div>
    <button class="btn5 ghost" type="button" data-next style="margin-top:6px;font-size:19px">חשיפת תשובה</button>
  </div>
  <div class="card5" data-steps>
    <h3>2 · מה עושה LPF?</h3>
    <div class="steps" style="margin-top:4px">
      <div class="step">מסנן את רכיבי התדר הגבוהים של המשווה ומשאיר את השמע.</div>
    </div>
    <button class="btn5 ghost" type="button" data-next style="margin-top:6px;font-size:19px">חשיפת תשובה</button>
  </div>
  <div class="card5 ask" data-steps>
    <h3>3 · סטייה גדולה</h3>
    <p style="font-size:19px">האם ה־PLL "יסתדר" עם כל סטייה?</p>
    <div class="steps" style="margin-top:4px">
      <div class="step" style="background:#fef2f2;border-color:#fecaca;color:#991b1b">לא. מחוץ לטווח העקיבה השגיאה נשארת, והשמע מתעוות.</div>
    </div>
    <button class="btn5 ghost" type="button" data-next style="margin-top:6px;font-size:19px">חשיפת תשובה</button>
  </div>
</div>
<div class="caveat">
  <span class="cv-lab">לבחינה</span>
  <p>צריך לדעת לשרטט את שלושת הבלוקים, לסמן את <b>כיווני החצים</b>, ולציין מה נכנס ומה יוצא בכל אחד.</p>
</div>`));

/* ---------------- 40 ---------------- */
S.push(F('s40','הפסקה','הפסקה',
 'הפסקה · 10 דקות',
 'הפסקה של עשר דקות. אל תמשיכו לתוכן. עם החזרה, שאלו שאלה אחת בלבד: מה יקרה אם ה־LO יסחף והתחנה לא? זה הגשר ל־AFC.',
 'עשר דקות. חוזרים לשאלה אחת: מה אם ה־LO זז והתחנה לא?',
 `<div style="display:grid;place-items:center;gap:18px;height:100%">
  <div class="brkclock">
    <b id="brkTimer">10:00</b>
    <span><b>הפסקה.</b><br>עשר דקות מנוחה.</span>
  </div>
  <div style="display:flex;gap:10px">
    <button class="btn5" type="button" id="brkStart">התחלת טיימר</button>
    <button class="btn5 ghost" type="button" id="brkReset">איפוס</button>
  </div>
  <div class="keyidea" style="max-width:780px">
    <div class="k-lab">בחזרה</div>
    <p>נחזור למפת המקלט ונשאל: <span class="m">מה קורה אם תדר ה־LO נסחף והתחנה נשארת במקום?</span></p>
  </div>
</div>`));
})();
