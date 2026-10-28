/* =========================================================
   שיעור 07 · שקפים 10–21
   ערבל · IF · משרעת ומגבל
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

/* ---------------- 10 ---------------- */
S.push(F('s10','ערבל ו־IF','המחשה',
 'מה באמת קורה בערבל?',
 'אל תתחילו מהנוסחה. הזיזו קודם את <bdi dir="ltr">f_LO</bdi> והראו איך שני התוצרים זזים: האחד מתרחק, השני מתקרב. רק אחרי שהכיתה רואה שני תוצרים — חשפו את שתי הנוסחאות. הדגישו שהערבל אינו מפענח את המידע; הוא רק מזיז את הספקטרום.',
 'ערבול יוצר שני תוצרים — סכום והפרש; את ההפרש נבחר.',
 `${MAP('mix')}
<div class="simwrap" data-sim="mixer" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="spec" width="1500" height="330"></canvas></div>
      <div class="plotbox tight"><canvas data-c="out" width="1500" height="330"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>תחנה · f_RF</label><output data-o="rf">98.1 MHz</output></div>
        <input type="range" data-k="rf" min="88" max="108" step="0.1" value="98.1"></div>
      <div class="ctl sm"><div><label>מתנד מקומי · f_LO</label><output data-o="lo">108.8 MHz</output></div>
        <input type="range" data-k="lo" min="95" max="125" step="0.1" value="108.8"></div>
      <div class="ro">
        <div class="hl"><small>הפרש</small><b data-o="dif">10.7 MHz</b></div>
        <div><small>סכום</small><b data-o="sum">206.9 MHz</b></div>
      </div>
      <p class="status" data-o="st">ההפרש נופל על 10.7 MHz</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>שתי הנוסחאות</h3>
      <div data-unit="MHz" class="fxb sm">\\[f_{sum}=f_{RF}+f_{LO}\\]</div>
      <div class="pkey"><div class="r"><b>f<sub>sum</sub></b><span>תדר הסכום</span><em>MHz</em></div></div>
      <div data-unit="MHz" class="fxb sm">\\[f_{diff}=\\left|f_{RF}-f_{LO}\\right|\\]</div>
      <div class="pkey"><div class="r"><b>f<sub>RF</sub></b><span>תדר התחנה</span><em>MHz</em></div><div class="r"><b>f<sub>LO</sub></b><span>תדר המתנד</span><em>MHz</em></div><div class="r"><b>f<sub>diff</sub></b><span>ההפרש</span><em>MHz</em></div></div>
    </div>
  </div>
</div>`));

/* ---------------- 11 ---------------- */
S.push(F('s11','ערבל ו־IF','הסבר',
 'המסנן בוחר את ההפרש',
 'הנקודה הדקה כאן: גם תוצר הסכום קיים פיזית, אבל הוא נמצא רחוק ולכן המסנן דוחה אותו. הזיזו את <bdi dir="ltr">f_LO</bdi> והראו שההפרש יוצא מהחלון. זו גם הסיבה לכך ששלב הכוונון קריטי: אם ה־LO לא מדויק, ההפרש לא נופל על <bdi dir="ltr">10.7</bdi>.',
 'מסנן ה־IF הוא זה שהופך שני תוצרים לתוצר אחד שמיש.',
 `${MAP('if')}
<div class="simwrap" data-sim="mixer" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="spec" width="1500" height="330"></canvas></div>
      <div class="plotbox tight"><canvas data-c="out" width="1500" height="330"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>תחנה · f_RF</label><output data-o="rf">98.1 MHz</output></div>
        <input type="range" data-k="rf" min="88" max="108" step="0.1" value="98.1"></div>
      <div class="ctl sm"><div><label>מתנד מקומי · f_LO</label><output data-o="lo">108.8 MHz</output></div>
        <input type="range" data-k="lo" min="95" max="125" step="0.1" value="108.8"></div>
      <div class="ro">
        <div class="hl"><small>הפרש</small><b data-o="dif">10.7 MHz</b></div>
        <div><small>סכום</small><b data-o="sum">206.9 MHz</b></div>
      </div>
      <p class="status" data-o="st">ההפרש נופל על 10.7 MHz</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 warnbox" style="flex:0 0 auto">
      <h3>גודל מול רוחב</h3>
      <p style="font-size:19px">החלון הירוק הוא <b>מקום</b> העבודה (<bdi dir="ltr">10.7 MHz</bdi>). רוחבו (<bdi dir="ltr">200 kHz</bdi>) נקבע בנפרד.</p>
    </div>
  </div>
</div>`));

/* ---------------- 12 ---------------- */
S.push(F('s12','ערבל ו־IF','ניבוי',
 'הזרקה גבוהה: LO מעל או מתחת?',
 'ניבוי לפני חשיפה. שאלו: אם התחנה ב־<bdi dir="ltr">98.1</bdi> וה־IF ב־<bdi dir="ltr">10.7</bdi>, האם ה־LO צריך להיות גבוה או נמוך? שתי התשובות נותנות הפרש של <bdi dir="ltr">10.7</bdi> — ולכן שתיהן עובדות, אבל רק אחת נבחרת בתכנון. במצגת שלנו: גבוהה.',
 'בהזרקה גבוהה ה־LO מעל התחנה — ולכן כל חישוב הוא חיבור.',
 `<div class="simwrap" data-sim="inject" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="inj" width="1600" height="480"></canvas></div></div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <p class="plotcap sm"><b>בחרו הזרקה:</b></p>
      <div class="chips">
        <button class="chip" type="button" data-inj="high" aria-pressed="true">גבוהה</button>
        <button class="chip" type="button" data-inj="low" aria-pressed="false">נמוכה</button>
      </div>
      <div class="ro">
        <div class="hl"><small>f_LO</small><b data-o="lo">108.8 MHz</b></div>
        <div><small>סוג</small><b data-o="mode">גבוהה</b></div>
      </div>
      <div class="fxb sm" data-o="fc" data-unit="MHz">f_LO = f_RF + f_IF</div>
      <div class="pkey"><div class="r"><b>f<sub>LO</sub></b><span>תדר המתנד</span><em>MHz</em></div><div class="r"><b>f<sub>RF</sub></b><span>תדר התחנה</span><em>MHz</em></div><div class="r"><b>f<sub>IF</sub></b><span>תדר הביניים</span><em>MHz</em></div></div>
      <p class="hint">בשתי ההזרקות <b>אותו הפרש</b> — אבל רק הגבוהה נבחרת כאן, כדי שכל החישובים יישארו חיבור פשוט.</p>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>למה גבוהה?</h3>
      <ul style="font-size:19px">
        <li>ההפרש תמיד חיובי — אין ערך מוחלט.</li>
        <li>תדר הבבואה נופל מחוץ לתחום <bdi dir="ltr">88–108 MHz</bdi>.</li>
      </ul>
    </div>
  </div>
</div>`));

/* ---------------- 13 ---------------- */
S.push(F('s13','ערבל ו־IF','דוגמה',
 '‏98.1 MHz הופכת ל־10.7 MHz',
 'הצג את השלבים אחד אחד, ובקשו מהכיתה לחזות כל שלב לפני החשיפה. הדגש את בדיקת הסבירות בסוף — לא רק את התוצאה. שים לב: זו תחנת הדוגמה היחידה בשיעור; תחנת התרגול תהיה <bdi dir="ltr">101.3</bdi>.',
 'תחנה, LO, הפרש — ובדיקה חוזרת שמאשרת את התוצאה.',
 `${MAP('if')}
<div class="g12">
  <div class="card5" data-steps>
    <h3>חמישה שלבים</h3>
    <div class="steps">
      <div class="step"><b>1 · נתון:</b> תחנה <bdi dir="ltr">98.1 MHz</bdi>, תדר ביניים <bdi dir="ltr">10.7 MHz</bdi>.</div>
      <div class="step"><b>2 · LO:</b> \\(f_{LO}=98.1+10.7=\\mathbf{108.8\\ MHz}\\)</div>
      <div class="step"><b>3 · ערבול:</b> נוצרים <bdi dir="ltr">206.9 MHz</bdi> ו־<bdi dir="ltr">10.7 MHz</bdi>.</div>
      <div class="step"><b>4 · בחירה:</b> מסנן ה־IF מעביר רק את <bdi dir="ltr">10.7 MHz</bdi>.</div>
      <div class="step"><b>5 · בדיקה:</b> \\(108.8-98.1=10.7\\ \\checkmark\\)</div>
    </div>
    <div class="step-ctl" style="margin-top:6px">
      <button class="btn5" type="button" data-next>חשיפת שלב</button>
      <button class="btn5 ghost" type="button" data-sreset>איפוס</button>
    </div>
  </div>
  <div class="card5">
    <h3>בדיקת סבירות — לא רק תוצאה</h3>
    <p>אם יצא לכם הפרש שאינו <bdi dir="ltr">10.7 MHz</bdi>, אחת משלוש הטעויות הבאה קרתה:</p>
    <ul style="font-size:20px">
      <li>חוסר/עודף אפס ביחידות.</li>
      <li>חיסור במקום חיבור (או להפך).</li>
      <li>שימוש בתדר הלא נכון — <bdi dir="ltr">f_IF</bdi> במקום <bdi dir="ltr">f_RF</bdi>.</li>
    </ul>
    <div class="callout" style="margin-top:6px"><b>כלל:</b> לעולם לא מסיימים חישוב בלי לחסר חזרה.</div>
  </div>
</div>
<div class="symkey">
  <span class="s">f_RF</span> תדר התחנה · <span class="s">f_LO</span> תדר המתנד המקומי · <span class="s">f_IF</span> תדר הביניים — כולם ב־<bdi dir="ltr">MHz</bdi>, ובאותו סדר גודל.
</div>`));

/* ---------------- 14 ---------------- */
S.push(F('s14','ערבל ו־IF','הסבר',
 'מה נשמר אחרי הערבול?',
 'השאלה שמפחידה סטודנטים: "האם ההמרה הורסת את המידע?" ההמחשה עונה חזותית — אותה צפיפות מחזורים, רק בתדר אחר. שני הגלים מסונכרנים בכוונה: אם הצפיפות הייתה משתנה, היינו יודעים שהערבול פגע במידע.',
 'הערבול מזיז את המידע בתדר — הוא לא נוגע בו.',
 `${MAP('mix')}
<div class="g2">
  <div class="card5">
    <h3>לפני הערבול · 98.1 MHz</h3>
    <p>אותו אות מאפנן: <bdi dir="ltr">1 kHz</bdi>, סטייה <bdi dir="ltr">75 kHz</bdi>.</p>
    <p>מחזורים צפופים ודלילים לסירוגין — זה המידע.</p>
  </div>
  <div class="card5" style="background:#f7fefe;border-color:#a5f3fc">
    <h3>אחרי הערבול · 10.7 MHz</h3>
    <p>אותו אות מאפנן, אותה סטייה — אבל סביב תדר אחר.</p>
    <p>הצפיפות זהה לחלוטין; רק <b>מקום</b> האות השתנה.</p>
  </div>
</div>
<div class="keyidea">
  <div class="k-lab">המסקנה</div>
  <p>הערבל מעביר את המידע <span class="m">ממקום למקום</span> — הוא אינו מפענח אותו ואינו הורג אותו.</p>
</div>
<div class="explain">
  זו הסיבה שכל שרשרת <bdi dir="ltr">IF</bdi> יכולה להיות מתוכננת פעם אחת: היא רואה תמיד את אותו אות, באותו תדר, עם אותו רוחב פס. מה שמשתנה הוא רק <b>איזו תחנה</b> נכנסה לשם — לפי <bdi dir="ltr">f_LO</bdi>.
</div>`));

/* ---------------- 15 ---------------- */
S.push(F('s15','ערבל ו־IF','דיוק',
 'תדר זה לא רוחב',
 'זו הנקודה שבה מרבית הבלבול נולד: <bdi dir="ltr">10.7 MHz</bdi> הוא מקום, <bdi dir="ltr">200 kHz</bdi> הוא רוחב. הזיזו את מחוון רוחב המסנן והראו מה נחתך. אחר כך הזיזו את התחנה והראו שהיא יוצאת מהחלון — שני כשלים שונים לגמרי.',
 'המסנן צריך להעביר <bdi dir="ltr">200 kHz</bdi> <b>סביב</b> <bdi dir="ltr">10.7 MHz</bdi> — לא נקודה אחת.',
 `${MAP('if')}
<div class="simwrap" data-sim="bwfilter" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="bw" width="1600" height="440"></canvas></div></div>
  <div class="gtcol" style="flex-basis:325px;width:325px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>רוחב מסנן IF</label><output data-o="bw">200 kHz</output></div>
        <input type="range" data-k="bw" min="50" max="600" step="10" value="200"></div>
      <div class="ctl sm"><div><label>היסט התחנה</label><output data-o="off">0 kHz</output></div>
        <input type="range" data-k="off" min="-400" max="400" step="10" value="0"></div>
      <p class="status" data-o="st">רוחב המסנן מתאים לערוץ</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 warnbox" style="flex:0 0 auto">
      <h3>שני כשלים שונים</h3>
      <ul style="font-size:19px">
        <li><b>צר מדי</b> — חותך את המידע עצמו.</li>
        <li><b>לא מכוון</b> — התחנה מחוץ לחלון.</li>
      </ul>
    </div>
  </div>
</div>
<div class="g3 tightgap">
  <div class="card5"><h3>15 kHz</h3><p>רוחב המידע המקסימלי (השמע).</p></div>
  <div class="card5"><h3>75 kHz</h3><p>סטיית התדר המקסימלית.</p></div>
  <div class="card5"><h3>200 kHz</h3><p>מרווח הערוץ — <b>לא</b> תוצאת חישוב.</p></div>
</div>`));

/* ---------------- 16 ---------------- */
S.push(F('s16','המגבל','המחשה',
 'מהי הפרעת משרעת?',
 'ההבדל בין השניים נראה בעין ואת זה צריך לנצל. התחילו מהגל העליון — נקי, מעטפת קבועה. אחר כך הזיזו את המחוון והראו שהמעטפת מתעוותת אבל התדר הרגעי לא. הדגישו שזה מודל של הפרעת AM בלבד — לא כל רעש אפשרי.',
 'רעש מוסיף תנודות משרעת — ואלה אינן המידע.',
 `${MAP('rf')}
<div class="simwrap" data-sim="ampnoise" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="clean" width="1500" height="340"></canvas></div>
      <div class="plotbox tight"><canvas data-c="dirty" width="1500" height="340"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>הפרעת משרעת</label><output data-o="noise">35%</output></div>
        <input type="range" data-k="noise" min="0" max="100" value="35"></div>
      <p class="status" data-o="st">שני האותות זהים בזמן שהמחוון באפס</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 warnbox" style="flex:0 0 auto">
      <h3>סוג הרעש</h3>
      <p style="font-size:19px">זהו מודל של <b>הפרעת משרעת</b>: ברקים, החזרות מבנים, רעש אטמוספרי.</p>
      <p style="font-size:19px">רעש תדר ורעש מופע <b>אינם</b> מיוצגים כאן.</p>
    </div>
  </div>
</div>
<div class="mdl">מודל: הפרעת AM סינוסואידלית, ללא רעש תדר</div>`));

/* ---------------- 17 ---------------- */
S.push(F('s17','המגבל','ניבוי',
 'האם המידע נפגע?',
 'רגלו את הניבוי: לפני שמזיזים את המחוון, בקשו מהכיתה להצביע אם השמע ישתנה. רוב הכיתה תגיד "כן" — ואז תראה להם שמספר מעברי האפס לאורך הזמן לא השתנה. זו ההוכחה שהמידע בתדר שרד, וזה מה שמצדיק את כל המגבל.',
 'כל עוד עוברים בנקודת האפס, המידע בתדר נשמר.',
 `${MAP('lim')}
<div class="g2">
  <div class="card5 ask">
    <h3>הניבוי</h3>
    <p>המשרעת משתנה בעשרות אחוזים. האם השמע ישתנה?</p>
    <p style="font-size:20px;font-weight:700;color:#0e7490">א · כן, השמע יתעוות<br>ב · לא, המידע בתדר בלבד</p>
  </div>
  <div class="card5 ok">
    <h3>התשובה</h3>
    <p><b>ב.</b> מספר מעברי האפס ליחידת זמן לא השתנה — ולכן התדר הרגעי נשמר.</p>
    <p>המשרעת שינתה רק את <b>גובה</b> הגל, לא את <b>קצב</b> מעברי האפס.</p>
  </div>
</div>
<div class="keyidea">
  <div class="k-lab">ההשלכה</div>
  <p>אם המידע לא נפגע — אפשר <span class="m">למחוק</span> את המשרעת בלי לפגוע בשמע. זה בדיוק תפקיד המגבל.</p>
</div>
<div class="callout">
  <b>הסתייגות מדויקת:</b> הטענה תקפה כשהאות חזק מספיק. אות חלש מאוד — מעברי האפס עצמם מתבלבלים, והמידע נפגע.
</div>`));

/* ---------------- 18 ---------------- */
S.push(F('s18','המגבל','הסבר',
 'מהו Limiter?',
 'המגבל הוא קוטם, לא מסנן. הדגישו את זה: הוא לא "מנקה" אלא פשוט חותך כל מה שמעל למתח הקטימה. שלוש השורות בגרף מראות בדיוק את זה: לפני, אחרי קיטום, ואחרי מסנן שמחזיר סינוס. שימו לב שהסף מסומן בקו אדום דק.',
 'קיטום לרמה קבועה מוחק את שינויי המשרעת.',
 `${MAP('lim')}
<div class="simwrap" data-sim="limiter" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="lim" width="1550" height="520"></canvas></div></div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>רמת אות</label><output data-o="level">100%</output></div>
        <input type="range" data-k="level" min="0" max="100" value="100"></div>
      <div class="ctl sm"><div><label>הפרעת משרעת</label><output data-o="noise">35%</output></div>
        <input type="range" data-k="noise" min="0" max="100" value="35"></div>
      <div class="ctl sm"><div><label>סף קטימה · V_lim</label><output data-o="lim">62%</output></div>
        <input type="range" data-k="lim" min="25" max="90" value="62"></div>
      <p class="status" data-o="st">המשרעת נחתכת לרמה קבועה</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>הפונקציה</h3>
      <div data-unit="V" class="fxb sm">\\[v_{lim}=\\begin{cases}+V_{lim} & v_{in}\\ge V_{lim}\\\\ v_{in} & |v_{in}|&lt;V_{lim}\\\\ -V_{lim} & v_{in}\\le -V_{lim}\\end{cases}\\]</div>
      <div class="pkey"><div class="r"><b>v<sub>lim</sub></b><span>מתח המוצא הקטום</span><em>V</em></div><div class="r"><b>v<sub>in</sub></b><span>מתח הכניסה</span><em>V</em></div><div class="r"><b>V<sub>lim</sub></b><span>סף הקטימה</span><em>V</em></div></div>
      <p style="font-size:18px"><span class="s" style="font-family:var(--mono);color:#0e7490">V_lim</span> — מתח הקטימה, ב־<bdi dir="ltr">V</bdi>.</p>
    </div>
  </div>
</div>`));

/* ---------------- 19 ---------------- */
S.push(F('s19','המגבל','דיוק',
 'קיטום אינו סינוס נקי',
 'הטעות הנפוצה: לחשוב שהמגבל מחזיר גל נקי. הוא מחזיר גל <b>קטום</b>, כלומר גל עם הרמוניות. רק המסנן שאחריו מחזיר סינוס. הראו את שלוש השורות זו מול זו, ושאלו איזו מהן מגיעה לגלאי.',
 'אחרי הקיטום נוצרות הרמוניות — המסנן אחריו מחזיר סינוס.',
 `<div class="g3 tightgap">
  <div class="card5"><h3>1 · לפני</h3><p>משרעת משתנה + רעש.</p></div>
  <div class="card5 warnbox"><h3>2 · אחרי קיטום</h3><p>משרעת קבועה, אבל <b>גל מרובע</b> עם הרמוניות <bdi dir="ltr">2f, 3f…</bdi></p></div>
  <div class="card5 ok"><h3>3 · אחרי מסנן</h3><p>סינוס נקי בתדר ה־IF, במשרעת קבועה.</p></div>
</div>
<div class="explain">
  ההרמוניות שנוצרות בקיטום נמצאות <b>מחוץ</b> לרוחב הפס של הערוץ. מסנן ה־IF שאחרי המגבל מסלק אותן ומשאיר רק את הרכיב בתדר הביניים. לכן מגבל תמיד מגיע עם מסנן — לא לבדו.
</div>
<div class="caveat">
  <span class="cv-lab">לזכור</span>
  <p>המגבל אינו "מנקה" את האות. הוא <b>קוטם</b> אותו, והסינון נעשה במסנן שאחריו. שני רכיבים, שני תפקידים.</p>
</div>`));

/* ---------------- 20 ---------------- */
S.push(F('s20','המגבל','גבולות',
 'גבולות הפעולה של המגבל',
 'שקף הגבולות, לא שקף יכולות. הזיזו את רמת האות למטה והראו שהמגבל מפסיק לעבוד. זה נקרא אפקט הסף, והוא ההסבר לכך שרדיו FM נשמע נקי קרוב למשדר ומתמלא רעש בקצה הטווח — למרות שהמידע בתדר.',
 'מגבל עובד רק כשיש לו מה לקטום — אחרת הרעש נשאר.',
 `${MAP('lim')}
<div class="simwrap" data-sim="limiter" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="lim" width="1550" height="470"></canvas></div></div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>רמת אות</label><output data-o="level">100%</output></div>
        <input type="range" data-k="level" min="0" max="100" value="100"></div>
      <div class="ctl sm"><div><label>סף קטימה · V_lim</label><output data-o="lim">62%</output></div>
        <input type="range" data-k="lim" min="25" max="90" value="62"></div>
      <p class="status" data-o="st">המשרעת נחתכת לרמה קבועה</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 warnbox" style="flex:0 0 auto">
      <h3>אפקט הסף</h3>
      <p style="font-size:19px">מתחת ל־\\(V_{lim}\\) אין קיטום, ולכן הרעש עובר כמו שהוא. זה מה ששומעים בקצה הטווח.</p>
    </div>
  </div>
</div>`));

/* ---------------- 21 ---------------- */
S.push(F('s21','המגבל','בדיקה',
 'למה AM לא יכול להשתמש במגבל',
 'זה שקף בדיקת ההבנה של המחצית הראשונה, והוא עונה על שאלת הפתיחה משקף 1. הפעילו את המגבל על אות AM והראו שהמעטפת — כלומר המידע — נמחקת. אל תסתפקו בהצהרה; תנו להם לראות.',
 'ב־AM המשרעת היא המידע — ולכן קיטום מוחק אותו.',
 `<div class="simwrap" data-sim="amlimiter" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="am" width="1500" height="330"></canvas></div>
      <div class="plotbox tight"><canvas data-c="amc" width="1500" height="330"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:325px;width:325px">
    <div class="ctrl tight">
      <div class="ro"><div class="hl"><small>מצב</small><b data-o="mode">מגבל כבוי</b></div></div>
      <button class="btn5" type="button" data-limtoggle aria-pressed="false">הפעלת המגבל</button>
      <p class="status">בשני המצבים — אותו אות AM</p>
      <p class="hint"><b>שאלו קודם:</b> מה יקרה לשמע? ואז הפעילו.</p>
    </div>
    <div class="card5 ok" style="flex:0 0 auto">
      <h3>התשובה לפתיחה</h3>
      <p style="font-size:19px">ב־<bdi dir="ltr">FM</bdi> אפשר לקטום, כי המידע בתדר. ב־<bdi dir="ltr">AM</bdi> המשרעת <b>היא</b> המידע — קיטום מוחק אותו.</p>
    </div>
  </div>
</div>`));
})();
