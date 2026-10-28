/* =========================================================
   שיעור 07 · שקפים 01–09
   פתיחה · בחירת תחנה ומבנה המקלט
   ========================================================= */
(function(){
window.L7 = window.L7 || {};
window.L7.SLIDES = window.L7.SLIDES || [];

const F = (id, ch, kind, t, note, tk, body) => ({
  id: id, ch: ch, kind: kind, t: t, note: note, tk: tk,
  html: `<div class="sl l6-slide dense tight">
  <header class="sl-h"><div class="sl-eb">${ch} · שיעור 7</div><h2>${t}</h2></header>
  <div class="sl-body">${body}</div>
  <div class="sl-tk"><span>שורה תחתונה</span><div class="tk-text">${tk}</div></div>
  <footer class="sl-f"><span>${ch}</span><span dir="ltr">%%N%% / %%T%%</span></footer>
</div>`
});

const S = window.L7.SLIDES;

/* ---------------- 01 ---------------- */
S.push(F('s01','פתיחה','פתיחה',
 'איך הופכים גל רדיו לשמע?',
 'שקף הפתיחה נועד לשים על השולחן שלוש בעיות הנדסיות — לא לפתור אף אחת. אל תזכירו עדיין ערבל, מגבל או גלאי; בקשו מהכיתה להציע סדר טיפול, ואספו תשובות לפני שאתם ממשיכים. המסר: שלוש הבעיות נולדות באותו מקום — באנטנה.',
 'שלוש בעיות, אות אחד: בחירת התחנה, ניקוי הרעש, וחילוץ המידע.',
 `<div class="rcmap" style="margin-bottom:4px">
  <div class="rc" style="--rc:#0f172a">אנטנה<small>88–108 MHz</small></div>
  <i>←</i>
  <div class="rc side" style="--rc:#94a3b8">?<small>מה קורה כאן</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#db2777">רמקול<small>שמע</small></div>
</div>

<div class="g3 tightgap">
  <div class="card5 ask"><h3>1 · בחירה</h3><p>באנטנה יש שמונה תחנות. איך בוחרים אחת?</p></div>
  <div class="card5 ask"><h3>2 · רעש</h3><p>האות סופג הפרעות משרעת בדרך. מה עושים איתן?</p></div>
  <div class="card5 ask"><h3>3 · גילוי</h3><p>המידע יושב בתדר. איך הופכים אותו למתח שמע?</p></div>
</div>

<div class="teach">
  <div class="t-lab">מה חשוב להסביר</div>
  <ul>
    <li><b>השאלה המנחה:</b> "כשאתם שומעים רדיו <bdi dir="ltr">FM</bdi> ברכב בזמן סופה — למה אין קולות סריקה כמו ב־<bdi dir="ltr">AM</bdi>?" אל תענו. השאלה תיסגר בשקף 21.</li>
    <li><b>הבטחה אחת:</b> בסוף השיעור תדעו להסביר כל בלוק במסלול, ולחשב תדרים ומתחים בעצמכם.</li>
  </ul>
</div>`));

/* ---------------- 02 ---------------- */
S.push(F('s02','פתיחה','חזרה',
 'זוכרים FM משיעור 6',
 'זו תזכורת, לא שיעור חוזר. הזיזו את המחוון פעם אחת לאט, ושאלו מה זז ומה לא. המשרעת נשארת זהה לחלוטין — זה ההבדל היחיד שחייב להישאר בראש לפני שמתחילים.',
 'ב־FM המידע יושב בצפיפות המחזורים; המשרעת נשארת קבועה.',
 `<div class="simwrap" data-sim="ampnoise" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="clean" width="1500" height="360"></canvas></div>
      <div class="plotbox tight"><canvas data-c="dirty" width="1500" height="360"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>הפרעת משרעת</label><output data-o="noise">35%</output></div>
        <input type="range" data-k="noise" min="0" max="100" value="35"></div>
      <p class="status" data-o="st">שני האותות זהים בזמן שהמחוון באפס</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
      <p class="hint"><b>השלב הראשון:</b> אפסו את המחוון, וודאו שהשניים זהים. רק אז הזיזו.</p>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>שלושת הגדלים</h3>
      <div class="pkey">
        <div class="r"><b>Δf</b><span>סטיית התדר</span><em>kHz</em></div>
        <div class="r"><b>f<sub>m</sub></b><span>תדר האות המאפנן</span><em>kHz</em></div>
        <div class="r"><b>β</b><span>מקדם האפנון</span><em>—</em></div>
      </div>
      <p style="font-size:18px">ערכים מקובלים: עד <bdi dir="ltr">75 kHz</bdi> סטייה, עד <bdi dir="ltr">15 kHz</bdi> מידע.</p>
    </div>
  </div>
</div>
<div class="g3 tightgap" style="flex:0 0 auto">
  <div class="card5"><h3>תדר רגעי</h3>
    <div class="fxb sm" data-unit="Hz">\\[f(t)=f_c+K_f\\,x(t)\\]</div>
    <div class="pkey">
      <div class="r"><b>f<sub>c</sub></b><span>תדר המוביל</span><em>MHz</em></div>
      <div class="r"><b>K<sub>f</sub></b><span>רגישות האפנון</span><em>Hz/V</em></div>
      <div class="r"><b>x(t)</b><span>אות המידע</span><em>V</em></div>
    </div>
  </div>
  <div class="card5"><h3>סטיית תדר</h3>
    <div class="fxb sm" data-unit="kHz">\\[\\Delta f=K_f\\,A_m\\]</div>
    <div class="pkey">
      <div class="r"><b>Δf</b><span>סטייה מרבית</span><em>kHz</em></div>
      <div class="r"><b>A<sub>m</sub></b><span>משרעת המידע</span><em>V</em></div>
      <div class="r"><b>K<sub>f</sub></b><span>רגישות האפנון</span><em>Hz/V</em></div>
    </div>
  </div>
  <div class="card5"><h3>מקדם אפנון</h3>
    <div class="fxb sm">\\[\\beta=\\frac{\\Delta f}{f_m}\\]</div>
    <div class="pkey">
      <div class="r"><b>β</b><span>יחס הסטייה לתדר</span><em>—</em></div>
      <div class="r"><b>Δf</b><span>סטיית התדר</span><em>kHz</em></div>
      <div class="r"><b>f<sub>m</sub></b><span>תדר המידע</span><em>kHz</em></div>
    </div>
  </div>
</div>
<div class="mdl">מודל: תדר רגעי אמיתי, יחידות יחסיות בזמן</div>`));

/* ---------------- 03 ---------------- */
S.push(F('s03','פתיחה','ניבוי',
 'מה קורה כשהמידע משתנה?',
 'ניבוי לפני הדגמה: שלוש נקודות מסומנות על גל המידע — בשיא, באפס, בשפל. בקשו מהכיתה לקבוע היכן המחזורים צפופים, היכן דלילים, ומה קורה במעבר. הרבה סטודנטים יגידו שהתדר נמוך בשיא, כי "גבוה" נשמע להם כמו עוצמה חזקה.',
 'כשהאות המאפנן גבוה — המחזורים צפופים; כשהוא שלילי — דלילים.',
 `<div class="g12">
  <div class="card5">
    <h3>שלוש נקודות — מה דעתכם?</h3>
    <ul>
      <li><b>A</b> — בשיא האות המאפנן</li>
      <li><b>B</b> — במעבר דרך האפס</li>
      <li><b>C</b> — בשפל האות המאפנן</li>
    </ul>
    <p style="margin-top:4px"><b>שאלה:</b> באיזו נקודה התדר הרגעי הגבוה ביותר?</p>
  </div>
  <div class="card5 ok">
    <h3>התשובה</h3>
    <p><b>A</b> — הקדם חיובי, התדר עולה, ולכן המחזורים צפופים.</p>
    <p><b>C</b> — הקדם שלילי, התדר יורד, המחזורים דלילים.</p>
    <p><b>B</b> — התדר שווה ל־\\(f_c\\), כלומר בדיוק התדר המרכזי.</p>
    <p style="font-size:19px">בשלושת המקרים <b>המשרעת זהה</b> — זה מה שמזהה FM.</p>
  </div>
</div>
<div class="teach compact">
  <div class="t-lab">מה חשוב להסביר</div>
  <ul>
    <li><b>הטעות הנפוצה:</b> "תדר גבוה = עוצמה גבוהה". ב־<bdi dir="ltr">FM</bdi> אלה שני גדלים בלתי־תלויים: <b>תדר</b> נושא את המידע, <b>משרעת</b> לא.</li>
    <li>אל תציגו נוסחה חדשה. \\(f(t)=f_c+K_f x(t)\\) כבר מופיע בשקף הקודם — כאן רק קוראים אותה חזותית.</li>
  </ul>
</div>`));

/* ---------------- 04 ---------------- */
S.push(F('s04','בחירת תחנה','המחשה',
 'הבעיה: שמונה תחנות באנטנה',
 'התחילו מכאן את החלק ההנדסי. לחצו על תחנות שונות והראו שהספקטרום לא משתנה — רק הבחירה. אחר כך לחצו "הגברת הכול" ושאלו מה קרה ליחס בין התחנה הרצויה לשכנותיה. זו הבעיה הראשונה, ופתרונה הוא כל שאר השיעור.',
 'האנטנה מקבלת את כולן בבת אחת — ובחירה היא פעולה, לא נתון.',
 `<div class="simwrap" data-sim="spectrum" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="sp" width="1600" height="480"></canvas></div></div>
  <div class="gtcol" style="flex-basis:330px;width:330px">
    <div class="ctrl tight">
      <p class="plotcap sm"><b>בחרו תחנה:</b></p>
      <div class="stns">
        <button type="button" data-stn="88.9">88.9</button>
        <button type="button" data-stn="91.8">91.8</button>
        <button type="button" data-stn="94.2">94.2</button>
        <button type="button" data-stn="97.6">97.6</button>
        <button type="button" data-stn="98.1" aria-pressed="true">98.1</button>
        <button type="button" data-stn="100.4">100.4</button>
        <button type="button" data-stn="103.5">103.5</button>
        <button type="button" data-stn="106.7">106.7</button>
      </div>
      <div class="ro"><div class="hl"><small>נבחרה</small><b data-o="pick">98.1 MHz</b></div></div>
      <button class="btn5 ghost" type="button" data-mode aria-pressed="false">הגברת הכול</button>
      <p class="hint">זה מה שקורה כשמגבירים את הכניסה בלי לסנן.</p>
    </div>
  </div>
</div>
<div class="caveat">
  <span class="cv-lab">הערה</span>
  <p>הספקטרום סכמטי: התחנות מרווחות כ־<bdi dir="ltr">200 kHz</bdi> זו מזו בתוך <bdi dir="ltr">88–108 MHz</bdi>. רוחב הפס של כל תחנה לא מוצג בקנה מידה אמיתי.</p>
</div>`));

/* ---------------- 05 ---------------- */
S.push(F('s05','בחירת תחנה','הסבר',
 'למה אי אפשר פשוט להגביר הכול',
 'ההמחשה כאן סטטית בכוונה: אותו ספקטרום בשתי עוצמות. בקשו מהכיתה להצביע מה השתנה — והדגישו שכל התחנות עלו יחד, כולל השכנות שמפריעות. המסקנה מובילה ישירות למסנן ולתדר ביניים.',
 'הגברה מרימה את התחנה ואת השכנות באותה מידה — ולכן אינה בוחרת.',
 `<div class="g2">
  <div class="card5">
    <h3>בלי סינון</h3>
    <p>שלוש תחנות באותה עוצמה. המגבר מגביר את כולן — הרצויה, השכנה, וגם הרעש שביניהן.</p>
    <p><b>התוצאה:</b> שמע מרוח, בלי הבחנה.</p>
  </div>
  <div class="card5">
    <h3>עם סינון</h3>
    <p>מסנן צר מעביר רק את התחנה הרצויה. ההגברה אחריו פועלת עליה בלבד.</p>
    <p><b>התוצאה:</b> שמע נקי — אבל המסנן צריך לזוז עם התחנה.</p>
  </div>
</div>
<div class="keyidea">
  <div class="k-lab">המסקנה</div>
  <p>קודם <span class="m">בוחרים</span>, אחר כך <span class="m">מגבירים</span>. הסדר ההפוך רק מחזק את ההפרעה.</p>
</div>
<div class="explain">
  הפתרון הנאיבי הוא מסנן <bdi dir="ltr">LC</bdi> שמכוון לתדר התחנה. אבל תחנה ב־<bdi dir="ltr">88.9</bdi> ותחנה ב־<bdi dir="ltr">106.7</bdi> דורשות שני מסננים שונים לגמרי — ובמקלט שמחליף תחנות צריך מסנן שמשתנה עם כל סיבוב כפתור. זה המקום שבו נכנס <b>תדר הביניים</b>.
</div>`));

/* ---------------- 06 ---------------- */
S.push(F('s06','בחירת תחנה','מבנה',
 'המקלט כשרשרת פעולות',
 'זו המפה שתלווה את כל השיעור. אל תסבירו את כל ששת הבלוקים בבת אחת — אמרו רק מה התפקיד של כל אחד במשפט, והדגישו שני דברים: ה־LO נכנס מהצד ולא מהמסלול, והמגבל יושב בין ה־IF לגלאי. בכל שקף בהמשך תופיע המפה עם הבלוק הנוכחי מודלק.',
 'עשרה בלוקים, תפקיד אחד לכל אחד — ואות אחד שעובר בכולם.',
 `<div class="rcmap">
  <div class="rc" style="--rc:#0f172a">אנטנה<small>כניסה</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#0891b2">מגבר RF<small>הגברה וסינון</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#7c3aed">ערבל<small>המרה ל־IF</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#059669">מגבר IF<small>הגברה וסינון</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#d97706">מגבל<small>קיטום משרעת</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#db2777">גלאי FM<small>תדר למתח</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#475569">מגבר שמע<small>לרמקול</small></div>
</div>

<div class="g21">
  <div class="card5">
    <h3>שני כללים לקריאת המפה</h3>
    <ul>
      <li><b>המסלול הראשי</b> תמיד מימין לשמאל, מהאנטנה לרמקול.</li>
      <li><b>ה־LO</b> הוא כניסה צדדית לערבל — הוא לא חלק ממסלול האות, ואין לו שמע.</li>
    </ul>
    <p style="margin-top:4px">בכל שקף בהמשך, הבלוק הנוכחי יודלק והשאר ידעך.</p>
  </div>
  <div class="card5 warnbox">
    <h3>היכן ה־Limiter?</h3>
    <p>אחרי דרגת ה־IF <b>ולפני</b> הגלאי. לא במקום אחר — זה הסדר שקובע שהרעש יוסר לפני הגילוי.</p>
  </div>
</div>`));

/* ---------------- 07 ---------------- */
S.push(F('s07','בחירת תחנה','המחשה',
 'מה עושה הדרגה הראשונה?',
 'שני תפקידים שקל לבלבל: הגברה וסינון. הזיזו את מחוון התדר והראו שהתחנה שבתחום עוברת, וזו שמחוצה לו נדחית לפני שהגיעה לערבל. זה חשוב משום שכל ההגנה של המקלט מפני תדר הבבואה מתחילה כאן.',
 'הדרגה הראשונה מסננת לפני שהיא מגבירה — וזה מה שמגן על הערבל.',
 `<div class="simwrap" data-sim="bwfilter" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="bw" width="1600" height="470"></canvas></div></div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>רוחב מסנן הכניסה</label><output data-o="bw">200 kHz</output></div>
        <input type="range" data-k="bw" min="60" max="600" step="10" value="200"></div>
      <div class="ctl sm"><div><label>היסט תחנה מהמרכז</label><output data-o="off">0 kHz</output></div>
        <input type="range" data-k="off" min="-400" max="400" step="10" value="0"></div>
      <p class="status" data-o="st">רוחב המסנן מתאים לערוץ</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
      <p class="hint">רוחב פס של דרגת <bdi dir="ltr">RF</bdi> במקלט פרקטי רחב יותר מ־<bdi dir="ltr">200 kHz</bdi> — הוא בוחר <b>תחום</b>, לא תחנה.</p>
    </div>
  </div>
</div>
<div class="g3 tightgap">
  <div class="card5"><h3>קלט</h3><p>כל התחנות <bdi dir="ltr">88–108 MHz</bdi>.</p></div>
  <div class="card5"><h3>פעולה</h3><p>הגברה + מסנן מעביר־פס ברוחב רצועת <bdi dir="ltr">FM</bdi>.</p></div>
  <div class="card5"><h3>פלט</h3><p>תחום מצומצם, עם כל התחנות שבתוכו — עדיין לא תחנה אחת.</p></div>
</div>`));

/* ---------------- 08 ---------------- */
S.push(F('s08','בחירת תחנה','הסבר',
 'למה תדר ביניים ולא תדר התחנה?',
 'זה הרעיון המרכזי של הסופר־הטרודיין, ואל תמהרו עליו. בקשו מהכיתה לחשב: אם המסנן צריך לזוז בין <bdi dir="ltr">88.9</bdi> ל־<bdi dir="ltr">106.7</bdi>, פי כמה הוא צריך להשתנות? התשובה — פי <bdi dir="ltr">1.2</bdi> בתדר, כלומר שינוי של כל סליל וקבל. ה־IF קובע מסנן אחד קבוע.',
 'כל תחנה מומרת לאותו תדר עבודה — ולכן מסנן אחד מספיק לכולן.',
 `<div class="g21">
  <div class="card5">
    <h3>הבעיה</h3>
    <p>מסנן שמכוון לתדר התחנה צריך לעבור את כל הסקאלה. כל שינוי תחנה = שינוי סליל או קבל, וכל שינוי כזה משנה גם את רוחב הפס.</p>
    <p><b>הפתרון:</b> מזיזים את התחנה לתדר עבודה קבוע — <bdi dir="ltr">10.7 MHz</bdi>.</p>
  </div>
  <div class="card5">
    <h3>שני המספרים</h3>
    <div class="numline hl"><span class="nl-k">תדר ביניים</span><span class="nl-f">f_IF</span><span class="nl-r">10.7 MHz</span></div>
    <div class="numline"><span class="nl-k">מרווח ערוץ</span><span class="nl-f">BW</span><span class="nl-r">200 kHz</span></div>
    <p style="font-size:19px">השניים אינם אותו גודל: <bdi dir="ltr">10.7 MHz</bdi> הוא <b>מקום</b> העבודה, <bdi dir="ltr">200 kHz</bdi> הוא <b>רוחב</b> הערוץ.</p>
  </div>
</div>
<div class="keyidea">
  <div class="k-lab">הרעיון</div>
  <p>מסנן <span class="m">אחד</span>, מכוון פעם אחת, משרת את <span class="m">כל</span> התחנות — כי כולן מגיעות אליו באותו תדר.</p>
</div>`));

/* ---------------- 09 ---------------- */
S.push(F('s09','בחירת תחנה','מבנה',
 'המתנד המקומי: אות עזר, לא אות שמע',
 'ההבחנה הזו נראית טריוויאלית אבל היא מקור של טעויות רבות: ה־LO אינו משהו ששומעים, הוא כלי מדידה. הדגישו שהוא נכנס לערבל מהצד, ושהוא נושא תדר אחד בלבד — בלי אפנון. בהמשך, כשהוא יסחף, תבינו למה זה הופך לבעיית כוונון ולא לבעיית שמע.',
 'ה־LO מספק תדר ייחוס לערבל; אין בו מידע ואין בו שמע.',
 `<div class="rcmap" style="margin-bottom:2px">
  <div class="rc off" style="--rc:#0f172a">אנטנה</div><i>←</i>
  <div class="rc off" style="--rc:#0891b2">מגבר RF</div><i>←</i>
  <div class="rc on" style="--rc:#7c3aed">ערבל<small>שני כניסות</small></div><i>←</i>
  <div class="rc off" style="--rc:#059669">מגבר IF</div><i>←</i>
  <div class="rc off" style="--rc:#d97706">מגבל</div>
</div>
<div class="rcmap" style="justify-content:flex-end">
  <div class="rc on lo" style="--rc:#7c3aed;max-width:280px">LO<small>כניסה מהצד · תדר נקי</small></div>
  <i>↑</i>
  <div class="rc side" style="--rc:#94a3b8;max-width:280px">נוסף לערבל</div>
</div>

<div class="g2">
  <div class="card5">
    <h3>מה יש ב־LO</h3>
    <ul>
      <li>תדר אחד, קבוע לרגע נתון: \\(f_{LO}\\).</li>
      <li>משרעת קבועה, בלי אפנון.</li>
      <li>תפקיד: להיות תדר הייחוס שהערבל מחסיר ממנו.</li>
    </ul>
  </div>
  <div class="card5 warnbox">
    <h3>מה אין ב־LO</h3>
    <p>אין בו שמע, אין בו מידע, ואין בו קליטה. אם ה־LO מתנתק — המקלט שותק לגמרי, גם אם האנטנה מצוינת.</p>
  </div>
</div>
<div class="symkey">
  <span class="s">f_LO</span> — תדר המתנד המקומי, ב־<bdi dir="ltr">MHz</bdi>. מסומן תמיד <b>מעל</b> \\(f_{RF}\\) בהזרקה גבוהה, כפי שנראה בשקף 12.
</div>`));
})();
