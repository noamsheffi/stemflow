/* =========================================================
   שיעור 07 · שקפים 41–57
   AFC · AM מול FM · תרגול · סיכום
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

/* ---------------- 41 ---------------- */
S.push(F('s41','AFC','המחשה',
 'למה תחנה יוצאת מכוונון?',
 'ההבחנה הקריטית: זו לא תופעת שמע, זו תופעת כוונון. הזיזו את מחוון הסחיפה לאט, והראו שה־IF זז — בלי שום שינוי באות המשודר. חום, הזדקנות רכיבים ולחות עושים בדיוק את זה.',
 'סחיפה היא שינוי איטי בכוונון — לא שינוי בשמע.',
 `${MAP('mix')}
<div class="simwrap" data-sim="drift" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="if" width="1600" height="460"></canvas></div></div>
  <div class="gtcol" style="flex-basis:325px;width:325px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>סחיפת LO</label><output data-o="d">0 kHz</output></div>
        <input type="range" data-k="d" min="-200" max="200" step="5" value="0"></div>
      <div class="ro">
        <div><small>IF רצוי</small><b>10.700 MHz</b></div>
        <div class="hl"><small>IF בפועל</small><b data-o="ifa">10.700 MHz</b></div>
      </div>
      <p class="status" data-o="st">IF במרכז החלון</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5 warnbox" style="flex:0 0 auto">
      <h3>הגורמים</h3>
      <p style="font-size:19px">טמפרטורה, הזדקנות רכיבים, שינוי מתח אספקה. כולם איטיים — ולכן AFC יכול לתקן אותם.</p>
    </div>
  </div>
</div>`));

/* ---------------- 42 ---------------- */
S.push(F('s42','AFC','המחשה',
 'איך רואים סחיפה?',
 'אותה המחשה, אבל עם דגש על המדידה: ה־IF זז ביחס לחלון המסנן, ולכן המשרעת יורדת לפני שהשמע נעלם. זה מה שמאפשר ל־AFC למדוד את הסחיפה מהמשרעת עצמה — לפני שהקול נשבר.',
 'סחיפה נראית כהזזה של IF ביחס לחלון — ולכן גם כירידת משרעת.',
 `${MAP('if')}
<div class="simwrap" data-sim="drift" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="if" width="1600" height="460"></canvas></div></div>
  <div class="gtcol" style="flex-basis:325px;width:325px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>סחיפת LO</label><output data-o="d">0 kHz</output></div>
        <input type="range" data-k="d" min="-200" max="200" step="5" value="0"></div>
      <div class="ro">
        <div><small>IF רצוי</small><b>10.700 MHz</b></div>
        <div class="hl"><small>IF בפועל</small><b data-o="ifa">10.700 MHz</b></div>
      </div>
      <p class="status" data-o="st">IF במרכז החלון</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>סדר הקריסה</h3>
      <ul style="font-size:19px">
        <li>סטייה קטנה — שמע מעוות.</li>
        <li>סטייה בינונית — משרעת יורדת.</li>
        <li>סטייה גדולה — שקט.</li>
      </ul>
    </div>
  </div>
</div>`));

/* ---------------- 43 ---------------- */
S.push(F('s43','AFC','המחשה',
 'מה עושה AFC?',
 'הפעילו וכבו את ה־AFC על אותה סחיפה — זה ההשוואה שצריך לראות. חשוב להראות גם את המקרה שבו AFC <b>לא</b> מצליח: סחיפה גדולה מתחום התיקון. אחרת נשארת אשליה שהחוג פותר הכול.',
 'AFC מחזיר את הכוונון במשוב איטי — עד גבול תחום התיקון.',
 `${MAP('mix')}
<div class="simwrap" data-sim="afc" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="afc" width="1600" height="460"></canvas></div></div>
  <div class="gtcol" style="flex-basis:335px;width:335px">
    <div class="ctrl tight">
      <div class="togglerow"><input type="checkbox" data-k="on" checked> AFC פעיל</div>
      <div class="ctl sm"><div><label>סחיפת LO</label><output data-o="d">+120 kHz</output></div>
        <input type="range" data-k="d" min="-260" max="260" step="10" value="120"></div>
      <div class="ctl sm"><div><label>תחום תיקון</label><output data-o="rng">200 kHz</output></div>
        <input type="range" data-k="range" min="60" max="260" step="10" value="200"></div>
      <div class="ro">
        <div><small>LO לאחר תיקון</small><b data-o="lo">108.800 MHz</b></div>
        <div class="hl"><small>שגיאת IF</small><b data-o="err">0 kHz</b></div>
      </div>
      <p class="status" data-o="st">AFC מתקן</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
  </div>
</div>`));

/* ---------------- 44 ---------------- */
S.push(F('s44','AFC','השוואה',
 'AFC מול PLL — שני חוגים, שתי מטרות',
 'ההשוואה הזו נשאלת בבחינה, ולכן היא שקף בפני עצמו ולא הערת אגב. הדגישו: PLL יכול לשמש כגלאי, AFC אינו גלאי אלא מתקן כוונון. וכל אחד פועל בקצב אחר לגמרי.',
 'AFC מתקן סחיפה איטית; PLL עוקב אחרי המידע המהיר.',
 `<table class="tbl tightc">
  <tr><th style="width:20%">שאלה</th><th style="width:40%">AFC</th><th style="width:40%">PLL</th></tr>
  <tr><td class="l"><b>מה מתוקן</b></td><td>תדר הכוונון של ה־LO</td><td> מופע ותדר של ה־VCO</td></tr>
  <tr><td class="l"><b>הקצב</b></td><td>איטי — סחיפה תרמית</td><td>מהיר — קצב השמע</td></tr>
  <tr><td class="l"><b>אות הבקרה</b></td><td>מתח DC (רכיב קבוע)</td><td>אות השמע עצמו</td></tr>
  <tr class="hl"><td class="l"><b>האם זה גלאי?</b></td><td><b>לא.</b> מתקן כוונון בלבד.</td><td><b>כן.</b> מגלה FM.</td></tr>
  <tr><td class="l"><b>מקום בשרשרת</b></td><td>מהפוך מה־LO</td><td>אחרי המגבל</td></tr>
</table>
<div class="explain" style="margin-top:6px">
  שני החוגים יכולים להתקיים באותו מקלט — הם לא מחליפים זה את זה. PLL מגלה את השמע, ו־AFC שומר שהתחנה לא "תברח" כשהמקלט מתחמם.
</div>`));

/* ---------------- 45 ---------------- */
S.push(F('s45','AM מול FM','השוואה',
 'חמשת פרמטרי ההשוואה',
 'הטבלה היא לפי חמשת הקריטריונים של הסילבוס — לא לפי דעה. פתחו שורה־שורה, ואל תתנו לכיתה להעתיק את כולה בבת אחת. הדגישו שרוחב הפס של FM אינו "בזבוז": הוא המחיר של חסינות לרעש.',
 'חמישה פרמטרים; אין "טוב יותר" מוחלט — יש מסחרר.',
 `<div class="amfm" style="font-size:19px">
  <div class="af-head af-corner">פרמטר</div>
  <div class="af-head am">AM</div>
  <div class="af-head fm">FM</div>
  <div class="af-row"><div class="af-lab">1 · תדר</div><div class="af-cell am"><bdi dir="ltr">540–1600 kHz</bdi></div><div class="af-cell fm"><bdi dir="ltr">88–108 MHz</bdi> · <bdi dir="ltr">VHF</bdi></div></div>
  <div class="af-row"><div class="af-lab">2 · טווח</div><div class="af-cell am"><bdi dir="ltr">100–1000+ km</bdi><br>גל קרקע ורקיע</div><div class="af-cell fm"><bdi dir="ltr">30–80 km</bdi><br>קו ראייה</div></div>
  <div class="af-row"><div class="af-lab">3 · רוחב פס</div><div class="af-cell am"><bdi dir="ltr">≈10 kHz</bdi></div><div class="af-cell fm"><bdi dir="ltr">≈200 kHz</bdi></div></div>
  <div class="af-row"><div class="af-lab">4 · נצילות</div><div class="af-cell am">נמוכה · <bdi dir="ltr">≤33%</bdi><br>מגבר ליניארי</div><div class="af-cell fm">גבוהה · <bdi dir="ltr">&gt;80%</bdi><br>Class C</div></div>
  <div class="af-row"><div class="af-lab">5 · רעש</div><div class="af-cell am">רגיש מאוד<br>איכות נמוכה</div><div class="af-cell fm">חסין (בזכות המגבל)<br>Hi-Fi</div></div>
</div>
<div class="caveat" style="margin-top:5px">
  <span class="cv-lab">דיוק</span>
  <p>המספרים הם טיפוסיים, לא מדויקים לכל מערכת. <bdi dir="ltr">200 kHz</bdi> הוא מרווח ערוץ; רוחב הפס של האות עצמו לפי קרסון קטן יותר.</p>
</div>`));

/* ---------------- 46 ---------------- */
S.push(F('s46','AM מול FM','המחשה',
 'למה FM חסין לרעש?',
 'זו החוליה שסוגרת את כל השיעור, ולכן היא מגיעה כאן ולא בפתיחה. הפעילו את המגבל על FM — השמע שורד. הפעילו אותו על AM — המידע נמחק. ארבעה מצבים, מסקנה אחת.',
 'FM חסין לרעש לא כי התדר חסין — אלא כי אפשר לקטם את המשרעת.',
 `<div class="simwrap" data-sim="amfm" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="sig" width="1600" height="420"></canvas></div></div>
  <div class="gtcol" style="flex-basis:325px;width:325px">
    <div class="ctrl tight">
      <p class="plotcap sm"><b>שיטה:</b></p>
      <div class="chips">
        <button class="chip" type="button" data-mod="am" aria-pressed="false">AM</button>
        <button class="chip" type="button" data-mod="fm" aria-pressed="true">FM</button>
      </div>
      <button class="btn5" type="button" data-limtog aria-pressed="false">מגבל כבוי</button>
      <div class="ctl sm"><div><label>רעש משרעת</label><output data-o="noise">45%</output></div>
        <input type="range" data-k="noise" min="0" max="100" value="45"></div>
      <div class="ro"><div class="hl"><small>מצב</small><b data-o="mode">FM</b></div></div>
      <p class="status" data-o="st">שינויי המשרעת נראים</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
  </div>
</div>`));

/* ---------------- 47 ---------------- */
S.push(F('s47','AM מול FM','הסבר',
 'למה AM שורד למרחקים?',
 'הפרמטר השני בטבלה נראה כמו "עוד שורה", אבל הוא פיזיקה נפרדת. AM יורד לתדרים נמוכים שבהם הגל עוקב אחרי עקמומיות כדור הארץ ומחזיר מהשכבה היונוספירית. FM ב־<bdi dir="ltr">100 MHz</bdi> מתפשט בקו ישר ולכן נחסם באופק.',
 'טווח AM נובע מתדר נמוך וגל רקיע; FM מוגבל לקו ראייה.',
 `<div class="g2">
  <div class="card5" style="border-color:#93c5fd;background:#fbfdff">
    <h3 style="color:#1d4ed8">AM · גל קרקע ורקיע</h3>
    <ul style="font-size:20px">
      <li>תדר נמוך — הגל מתכופף עם כדור הארץ.</li>
      <li>החזרה מהשכבה היונוספירית בלילה.</li>
      <li>לכן <bdi dir="ltr">100–1000+ km</bdi>.</li>
      <li>המחיר: רוחב פס צר ואיכות נמוכה.</li>
    </ul>
  </div>
  <div class="card5" style="border-color:#a5f3fc;background:#f7fefe">
    <h3>FM · קו ראייה</h3>
    <ul style="font-size:20px">
      <li>תדר גבוה — הגל לא מתכופף ולא חוזר.</li>
      <li>נחסם באופק ובמכשולים.</li>
      <li>לכן <bdi dir="ltr">30–80 km</bdi>.</li>
      <li>היתרון: רוחב פס רחב ואיכות גבוהה.</li>
    </ul>
  </div>
</div>
<div class="keyidea">
  <div class="k-lab">המסחרר</div>
  <p>AM מנצח ב<span class="m">טווח</span> ובחיסכון בספקטרום; FM מנצח ב<span class="m">איכות</span> ובחסינות לרעש.</p>
</div>`));

/* ---------------- 48 ---------------- */
S.push(F('s48','תרגול','תרגיל',
 'תרגיל · תדר מתנד מקומי',
 'אל תגלו את הפתרון. תנו שתי דקות, ואז חשפו שלב. שימו לב ליחידות בכל שורה — זו הטעות השכיחה ביותר. התחנה היא <bdi dir="ltr">101.3</bdi>, לא <bdi dir="ltr">98.1</bdi> משקף הדוגמה.',
 'בהזרקה גבוהה: מחברים את תדר הביניים לתחנה.',
 `<div class="g21">
  <div class="card5">
    <h3>השאלה</h3>
    <p>מקלט FM מרווז לתחנה ב־<bdi dir="ltr">101.3 MHz</bdi>. תדר הביניים הוא <bdi dir="ltr">10.7 MHz</bdi>, בהזרקה גבוהה.</p>
    <p><b>חשב את תדר המתנד המקומי.</b></p>
    <div data-steps style="margin-top:4px">
      <div class="steps">
        <div class="step"><b>שלב 1:</b> מזהים הזרקה גבוהה ← \\(f_{LO}=f_{RF}+f_{IF}\\).</div>
        <div class="step"><b>שלב 2:</b> \\(101.3+10.7=112.0\\ \\text{MHz}\\).</div>
        <div class="step"><b>שלב 3 · בדיקה:</b> \\(112.0-101.3=10.7\\ \\checkmark\\)</div>
      </div>
      <div class="step-ctl" style="margin-top:6px">
        <button class="btn5" type="button" data-next>חשיפת שלב</button>
        <button class="btn5 ghost" type="button" data-sreset>איפוס</button>
      </div>
    </div>
  </div>
  <div class="card5">
    <h3>למה זה לא 90.6?</h3>
    <p style="font-size:19px">אם היינו מחסרים: \\(101.3-10.7=90.6\\ \\text{MHz}\\). זו <b>הזרקה נמוכה</b> — גם היא נותנת הפרש <bdi dir="ltr">10.7</bdi>, אבל אינה המצב שבחרנו.</p>
    <div class="caveat"><span class="cv-lab">כלל</span><p style="font-size:18px">קודם קובעים את <b>סוג ההזרקה</b>, ורק אחר כך מחברים או מחסרים.</p></div>
  </div>
</div>`));

/* ---------------- 49 ---------------- */
S.push(F('s49','תרגול','תרגיל',
 'תרגיל · בדיקת IF ותדר בבואה',
 'שורת אימות קצרה — לא תרגיל חדש. הוסיפו את תדר הבבואה במשפט אחד בלבד: הוא נלמד בשיעור 5, וכאן רק סוגרים את הפינה לבחינה. אל תפתחו שקף שלם לתדר הבבואה.',
 'אימות: ההפרש נותן בדיוק IF. תדר הבבואה נופל מחוץ לתחום.',
 `<div class="card5" style="margin-bottom:0">
  <h3>בדיקת ההפרש</h3>
  <div class="numline hl"><span class="nl-k">הצבה</span><span class="nl-f">112.0 − 101.3</span><span class="nl-r">10.7 MHz</span></div>
  <p style="font-size:19px;margin-top:4px">ההפרש שווה לתדר הביניים — ולכן החישוב עקבי. אם יצא מספר אחר, חזרו לשקף הקודם.</p>
</div>
<div class="g2" style="margin-top:6px">
  <div class="card5">
    <h3>תדר בבואה — משפט אחד</h3>
    <p style="font-size:19px">\\(f_{IM}=f_{RF}+2f_{IF}=101.3+21.4=\\mathbf{122.7\\ MHz}\\).</p>
    <p style="font-size:19px">הוא נמצא <b>מחוץ</b> לתחום <bdi dir="ltr">88–108 MHz</bdi> — ולכן תחנה אזרחית לא תיצור הפרעת בבואה.</p>
  </div>
  <div class="card5 ok">
    <h3>למה זה טוב</h3>
    <p style="font-size:19px">הזרקה גבוהה "דוחפת" את הבבואה מעל לתחום השידור. זו הסיבה ההנדסית לבחור בה, ולא רק נוחות חישובית.</p>
  </div>
</div>`));

/* ---------------- 50 ---------------- */
S.push(F('s50','תרגול','תרגיל',
 'תרגיל · כיוון הסחיפה',
 'שקף הסימן — הוא לא מופיע באף אחד מהמקורות, ולכן חשוב להסבירו לאט. בהזרקה גבוהה, אם LO עולה, גם IF עולה. הזיזו את המחוון ובקשו מהכיתה לקבוע את הכיוון לפני שהמסך מראה.',
 'בהזרקה גבוהה, שינוי LO עובר ל־IF באותו גודל ובאותו כיוון.',
 `${MAP('mix')}
<div class="simwrap" data-sim="drift" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="if" width="1600" height="400"></canvas></div></div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>Δf_LO</label><output data-o="d">0 kHz</output></div>
        <input type="range" data-k="d" min="-200" max="200" step="10" value="0"></div>
      <div class="ro">
        <div class="hl"><small>Δf_IF</small><b data-o="d">0 kHz</b></div>
        <div><small>IF בפועל</small><b data-o="ifa">10.700 MHz</b></div>
      </div>
      <p class="status" data-o="st">IF במרכז</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>הכלל</h3>
      <div data-unit="kHz" class="fxb sm">\\[\\Delta f_{IF}=\\Delta f_{LO}\\]</div>
      <div class="pkey"><div class="r"><b>Δf<sub>IF</sub></b><span>שינוי תדר הביניים</span><em>kHz</em></div><div class="r"><b>Δf<sub>LO</sub></b><span>שינוי תדר ה־LO</span><em>kHz</em></div></div>
      <p style="font-size:18px">תקף בהזרקה גבוהה, כשתדר התחנה קבוע. בהזרקה נמוכה הסימן מתהפך.</p>
    </div>
  </div>
</div>`));

/* ---------------- 51 ---------------- */
S.push(F('s51','תרגול','דוגמה',
 'תרגיל · מתח שמע מגלאי PLL',
 'תרגיל מספרי קצר, אבל הוא סוגר את הקשר בין Δf ל־V. הזיזו את Δf והראו את הנקודה נעה על הקו — זה מה שהופך את החלוקה לאינטואיציה. שימו לב: <bdi dir="ltr">K_VCO</bdi> כאן הוא של החוג, לא של ה־LO.',
 'מתח השמע הוא סטיית התדר חלקי רגישות ה־VCO.',
 `<div class="simwrap" data-sim="pllv" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="vm" width="1500" height="420"></canvas></div></div>
  <div class="gtcol" style="flex-basis:335px;width:335px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>סטיית תדר · Δf</label><output data-o="df">75 kHz</output></div>
        <input type="range" data-k="df" min="5" max="100" step="5" value="75"></div>
      <div class="ctl sm"><div><label>רגישות · K_VCO</label><output data-o="kv">50 kHz/V</output></div>
        <input type="range" data-k="kv" min="10" max="100" step="5" value="50"></div>
      <div class="ro"><div class="hl"><small>V_m</small><b data-o="vm">1.50 V</b></div></div>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>השאלה</h3>
      <p style="font-size:18px">אם עוצמת הדיבור קטנה פי 3 — מה יקרה ל־\\(V_m\\)?</p>
      <p style="font-size:18px"><b>תשובה:</b> \\(\\Delta f\\) קטן פי 3, ולכן \\(V_m\\) קטן פי 3, ל־<bdi dir="ltr">0.50 V</bdi>.</p>
    </div>
  </div>
</div>`));

/* ---------------- 52 ---------------- */
S.push(F('s52','תרגול','בדיקה',
 'איזה רכיב פותר איזו בעיה?',
 'התרגיל היחיד שמחבר את כל המקטעים. קראו תקלה, בקשו מהכיתה להצביע על הרכיב, ורק אז חשפו. אם מישהו בוחר PLL לסחיפה — חזרו לשקף 44.',
 'ארבע תקלות, ארבעה רכיבים — וההבחנה היא העיקר.',
 `<div class="g2">
  <div class="card5" data-steps>
    <h3>תקלה א · הפרעת משרעת</h3>
    <p style="font-size:19px">יש סריקות ורעש, אבל התדר יציב.</p>
    <div class="steps"><div class="step"><b>מגבל (Limiter)</b> — קוטם את המשרעת. אם האות חלש, גם הוא לא יעזור.</div></div>
    <button class="btn5 ghost" type="button" data-next style="font-size:18px;margin-top:5px">חשיפת תשובה</button>
  </div>
  <div class="card5" data-steps>
    <h3>תקלה ב · התחנה נסחפת</h3>
    <p style="font-size:19px">בהתחלה נקי, אחרי דקות מתעוות.</p>
    <div class="steps"><div class="step"><b>AFC</b> — מחזיר את כוונון ה־LO. לא PLL.</div></div>
    <button class="btn5 ghost" type="button" data-next style="font-size:18px;margin-top:5px">חשיפת תשובה</button>
  </div>
  <div class="card5" data-steps>
    <h3>תקלה ג · שמע חלש ומעוות תדיר</h3>
    <p style="font-size:19px">הסטייה גדולה, והמוצא נחתך בקצוות.</p>
    <div class="steps"><div class="step"><b>PLL</b> — עוקב בתחום רחב יותר מגלאי שיפוע.</div></div>
    <button class="btn5 ghost" type="button" data-next style="font-size:18px;margin-top:5px">חשיפת תשובה</button>
  </div>
  <div class="card5" data-steps>
    <h3>תקלה ד · שכנה דורכת על התחנה</h3>
    <p style="font-size:19px">שני שמעים מעורבבים.</p>
    <div class="steps"><div class="step"><b>מסנן IF</b> צר יותר — בחירה, לא הגברה.</div></div>
    <button class="btn5 ghost" type="button" data-next style="font-size:18px;margin-top:5px">חשיפת תשובה</button>
  </div>
</div>`));

/* ---------------- 53 ---------------- */
S.push(F('s53','תרגול','תרגיל',
 'תרגיל מערכת מלא',
 'התרגיל הארוך — יש לו ארבע תחנות עצירה, וכל אחת נחשפת רק אחרי ניסיון. אל תדלגו. הקישור בין השלבים הוא המסר: אותו אות לאורך כל השרשרת, לא ארבעה תרגילים נפרדים.',
 'אות אחד, ארבעה שלבים — מהאנטנה ועד המתח.',
 `<div class="g12">
  <div class="card5" data-steps>
    <h3>המסלול</h3>
    <div class="steps">
      <div class="step"><b>1 · ערבול:</b> \\(f_{LO}=101.3+10.7=\\mathbf{112.0\\ MHz}\\)</div>
      <div class="step"><b>2 · רוחב פס (קרסון):</b> \\(BW=2(75+15)=\\mathbf{180\\ kHz}\\)</div>
      <div class="step"><b>3 · בבואה:</b> \\(101.3+21.4=\\mathbf{122.7\\ MHz}\\) — מחוץ לתחום ✓</div>
      <div class="step"><b>4 · מתח שמע:</b> \\(V_m=75/25=\\mathbf{3.0\\ V}\\)</div>
    </div>
    <div class="step-ctl" style="margin-top:6px">
      <button class="btn5" type="button" data-next>חשיפת שלב</button>
      <button class="btn5 ghost" type="button" data-sreset>איפוס</button>
    </div>
  </div>
  <div class="card5">
    <h3>הנתונים</h3>
    <table class="vars" style="font-size:18px">
      <tr><td class="s">f_RF</td><td>תחנה</td><td class="u">101.3 MHz</td></tr>
      <tr><td class="s">f_IF</td><td>תדר ביניים</td><td class="u">10.7 MHz</td></tr>
      <tr><td class="s">β</td><td>מקדם אפנון</td><td class="u">5</td></tr>
      <tr><td class="s">f_m</td><td>תדר מידע</td><td class="u">15 kHz</td></tr>
      <tr><td class="s">K_VCO</td><td>רגישות VCO</td><td class="u">25 kHz/V</td></tr>
    </table>
    <div class="caveat" style="margin-top:5px"><span class="cv-lab">תשומת לב</span><p style="font-size:18px"><bdi dir="ltr">Δf = β·f_m = 5 × 15 = 75 kHz</bdi> — נתון שמגיע משיעור 6, לא מכאן.</p></div>
  </div>
</div>`));

/* ---------------- 54 ---------------- */
S.push(F('s54','סיכום','סיכום',
 'חזרה למסלול האות',
 'סגירת המעגל עם המפה. אל תסבירו שוב כל בלוק — בקשו מהכיתה להסביר, ואתם רק מאשרים. אם מישהו נתקע, חזרו לשקף הרלוונטי במקום להסביר מחדש כאן.',
 'שישה בלוקים, וכל אחד עונה על בעיה אחרת.',
 `<div class="rcmap">
  <div class="rc" style="--rc:#0f172a">אנטנה<small>קליטה</small></div><i>←</i>
  <div class="rc" style="--rc:#0891b2">RF<small>הגברה וסינון</small></div><i>←</i>
  <div class="rc" style="--rc:#7c3aed">ערבל<small>המרה</small></div><i>←</i>
  <div class="rc" style="--rc:#059669">IF<small>בחירה</small></div><i>←</i>
  <div class="rc" style="--rc:#d97706">מגבל<small>קיטום</small></div><i>←</i>
  <div class="rc" style="--rc:#db2777">גלאי<small>תדר למתח</small></div><i>←</i>
  <div class="rc" style="--rc:#475569">שמע<small>רמקול</small></div>
</div>
<div class="g3 tightgap" style="margin-top:6px">
  <div class="card5"><h3>בחירה</h3><p>RF + ערבל + IF: מבודדים תחנה אחת ומביאים אותה לתדר עבודה קבוע.</p></div>
  <div class="card5"><h3>הגבלה</h3><p>מגבל: מוחק את שינויי המשרעת, שהיו רעש טהור.</p></div>
  <div class="card5"><h3>גילוי</h3><p>גלאי שיפוע או PLL: הופכים שינוי תדר לשינוי מתח.</p></div>
</div>
<div class="explain">
  <b>AFC</b> אינו נמצא במסלול הזה — הוא חוג צדדי שמתקן את תדר ה־LO. גם <b>ה־LO</b> אינו במסלול: הוא כניסה צדדית לערבל. שני הפרטים האלה הם ההבדל בין ציור נכון לציור שגוי.
</div>`));

/* ---------------- 55 ---------------- */
S.push(F('s55','סיכום','כרטיס יציאה',
 'כרטיס יציאה · המסלול',
 'בקשו תשובה קצרה — שלושה שדות, לא חיבור. הקריטריון גלוי על השקף, וזה הוגן: הסטודנט יודע מה נדרש. אספו 2–3 תשובות בכיתה לפני היציאה.',
 'שלושה בלוקים, ומה נכנס ויוצא בכל אחד.',
 `<div class="card5" style="margin-bottom:0">
  <h3>השאלה</h3>
  <p>בחרו שלושה בלוקים מהמסלול. לכל אחד כתבו: <b>מה נכנס</b> · <b>מה יוצא</b> · <b>למה הוא נחוץ</b>.</p>
</div>
<div class="g3 tightgap" style="margin-top:6px">
  <div class="card5"><h3>בלוק 1</h3><p style="font-size:19px">נכנס: ______<br>יוצא: ______<br>נחוץ כי: ______</p></div>
  <div class="card5"><h3>בלוק 2</h3><p style="font-size:19px">נכנס: ______<br>יוצא: ______<br>נחוץ כי: ______</p></div>
  <div class="card5"><h3>בלוק 3</h3><p style="font-size:19px">נכנס: ______<br>יוצא: ______<br>נחוץ כי: ______</p></div>
</div>
<div class="caveat" style="margin-top:6px">
  <span class="cv-lab">קריטריון בדיקה</span>
  <p>תשובה מלאה = שם הבלוק + הכניסה + היציאה + הבעיה שהוא פותר. תשובה חלקית = שם הבלוק בלבד.</p>
</div>`));

/* ---------------- 56 ---------------- */
S.push(F('s56','סיכום','כרטיס יציאה',
 'כרטיס יציאה · נוסחה',
 'המשימה כאן היא <b>פירוש</b>, לא הצבה. בחרו נוסחה אחת, וכתבו מה כל סימון אומר ובאיזו יחידה. זו הבדיקה הטובה ביותר לשאלה "האם הוא מבין או משנן".',
 'נוסחה ללא פירוש סימונים אינה תשובה.',
 `<div class="card5" style="margin-bottom:0">
  <h3>בחרו נוסחה אחת ופרשו אותה</h3>
  <div class="g2" style="margin-top:4px">
    <div data-unit="MHz" class="fxb sm">\\[f_{LO}=f_{RF}+f_{IF}\\]</div>
    <div data-unit="V" class="fxb sm">\\[v_{out}\\approx K_d\\left(f_{in}-f_c\\right)\\]</div>
    <div data-unit="Hz" class="fxb sm">\\[f_{VCO}=f_{free}+K_{VCO}V_{ctrl}\\]</div>
    <div data-unit="V" class="fxb sm">\\[V_m=\\dfrac{\\Delta f}{K_{VCO}}\\]</div>
  </div>
  <div class="pkey" style="margin-top:5px">
    <div class="r"><b>f<sub>LO</sub> · f<sub>RF</sub> · f<sub>IF</sub></b><span>מתנד · תחנה · תדר ביניים</span><em>MHz</em></div>
    <div class="r"><b>K<sub>d</sub> · K<sub>VCO</sub></b><span>רגישות גלאי · רגישות מתנד</span><em>V/Hz · Hz/V</em></div>
    <div class="r"><b>V<sub>m</sub> · Δf</b><span>מתח שמע · סטיית תדר</span><em>V · kHz</em></div>
  </div>
  </div>
</div>
<div class="g2" style="margin-top:6px">
  <div class="card5"><h3>מה נדרש</h3><ul style="font-size:19px"><li>שם כל סימון.</li><li>היחידה של כל סימון.</li><li>משמעות פיזיקלית במשפט.</li></ul></div>
  <div class="card5 warnbox"><h3>מה לא מתקבל</h3><ul style="font-size:19px"><li>הצבה בלבד בלי פירוש.</li><li>סימון שלא הוסבר.</li><li>יחידה חסרה.</li></ul></div>
</div>`));

/* ---------------- 57 ---------------- */
S.push(F('s57','סיכום','כרטיס יציאה',
 'כרטיס יציאה · תקלה',
 'שני מקרים, ושניהם נראים דומה למי שלא הפנים את ההבדל. בקשו נימוק, לא רק תשובה. זה גם סוגר את השיעור בחזרה לשאלת הפתיחה על רעשי הברק.',
 'הפרעת משרעת נפתרת במגבל; סחיפת LO נפתרת ב־AFC.',
 `<div class="g2">
  <div class="card5">
    <h3>מקרה א</h3>
    <p>השמע נקי אבל מלא סריקות. התדר לא זז, גם לאורך חצי שעה.</p>
    <div class="ro" style="margin-top:5px"><div class="hl"><small>רכיב</small><b>מגבל</b></div><div><small>סיבה</small><b>רעש משרעת</b></div></div>
  </div>
  <div class="card5">
    <h3>מקרה ב</h3>
    <p>בהתחלה מושלם. אחרי עשר דקות השמע מתעוות בהדרגה, בלי רעש.</p>
    <div class="ro" style="margin-top:5px"><div class="hl"><small>רכיב</small><b>AFC</b></div><div><small>סיבה</small><b>סחיפת LO</b></div></div>
  </div>
</div>
<div class="keyidea" style="margin-top:6px">
  <div class="k-lab">ההבחנה</div>
  <p>רעש <span class="m">מהיר</span> על המשרעת ← מגבל. הזזה <span class="m">איטית</span> של הכוונון ← AFC.</p>
</div>
<div class="callout" style="margin-top:6px">
  <b>חזרה לשאלת הפתיחה:</b> ברדיו <bdi dir="ltr">FM</bdi> אין סריקות בברקים — כי המגבל מוחק את שינויי המשרעת שהברק יוצר. ב־<bdi dir="ltr">AM</bdi> אותם שינויי משרעת <b>הם</b> המידע, ולכן שומעים אותם.
</div>`));
})();
