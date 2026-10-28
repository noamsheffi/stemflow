/* =========================================================
   שיעור 07 · v2 — תיקוני שקפים 01–15
   כל רשומה: n (שקף), pr (עדיפות), find (הממצא), fix (מה נעשה),
   ורשות: title / tk / note / body / pairs
   ========================================================= */
(function(){
const R = window.L7REV = window.L7REV || [];
const map = (on) => `<div class="rcmini">
  <span style="--rc:#0f172a" class="${on==='ant'?'on':''}">אנטנה</span><i>‹</i>
  <span style="--rc:#0891b2" class="${on==='rf'?'on':''}">RF</span><i>‹</i>
  <span style="--rc:#7c3aed" class="${on==='mix'?'on':''}">ערבל</span><i>‹</i>
  <span style="--rc:#059669" class="${on==='if'?'on':''}">IF</span><i>‹</i>
  <span style="--rc:#d97706" class="${on==='lim'?'on':''}">מגבל</span><i>‹</i>
  <span style="--rc:#db2777" class="${on==='det'?'on':''}">גלאי</span><i>‹</i>
  <span style="--rc:#475569" class="${on==='aud'?'on':''}">שמע</span>
</div>`;

/* ---------------- 01 ---------------- */
R.push({
  n:1, pr:'בינוני',
  find:'המשפט "ניקוי רעש" מבטיח יותר מדי — המגבל מצמצם הפרעות משרעת בלבד.',
  fix:'הניסוח הוחלף ל"צמצום הפרעות משרעת"; שמות הפתרונות נשארו מוסתרים. נוסף סימון שהמספר שמונה הוא דוגמה.',
  tk:'שלוש בעיות, אות אחד: בחירת התחנה, צמצום הפרעות המשרעת, וחילוץ המידע.',
  pairs:[
    ['<p>האות סופג הפרעות משרעת בדרך. מה עושים איתן?</p>',
     '<p>האות סופג <b>הפרעות משרעת</b> בדרך. מה אפשר לעשות איתן — ומה לא?</p>'],
    ['<h3>2 · רעש</h3>','<h3>2 · הפרעות משרעת</h3>'],
    ['<div class="rc" style="--rc:#0f172a">אנטנה<small>88–108 MHz</small></div>',
     '<div class="rc" style="--rc:#0f172a">אנטנה<small>כל התחנות יחד</small></div>'],
    ['<li><b>הבטחה אחת:</b> בסוף השיעור תדעו להסביר כל בלוק במסלול, ולחשב תדרים ומתחים בעצמכם.</li>',
     '<li><b>הבטחה אחת:</b> בסוף השיעור תדעו להסביר כל בלוק במסלול, ולחשב תדרים ומתחים בעצמכם.</li>\n    <li><b>הבחנה:</b> המגבל אינו "מנקה רעש" — הוא מוחק שינויי <b>משרעת</b>. הפרעות שמשנות <b>תדר או מופע</b> נשארות.</li>'],
    ['שקף הפתיחה נועד לשים על השולחן שלוש בעיות הנדסיות — לא לפתור אף אחת. אל תזכירו עדיין ערבל, מגבל או גלאי; בקשו מהכיתה להציע סדר טיפול, ואספו תשובות לפני שאתם ממשיכים. המסר: שלוש הבעיות נולדות באותו מקום — באנטנה.',
     'שקף הפתיחה שם על השולחן שלוש בעיות הנדסיות — ולא פותר אף אחת. אל תזכירו עדיין ערבל, מגבל או גלאי. בקשו מהכיתה למנות את שלוש הבעיות במילים שלה, לפני שאתם מציעים פתרון. תנאי מעבר: התלמיד מונה שלוש בעיות בלי לקבל מהן את שמות הפתרונות.']
  ]
});

/* ---------------- 02 ---------------- */
/* החלפה מלאה · 27.10.2026 — שלושה גרפים מסונכרנים, מחוון אחד,
   ללא נוסחאות. המטרה: לראות את הקשר מידע ← תדר, ולחבר למשימת המקלט. */
R.push({
  n:2, pr:'גבוהה',
  find:'המחוון היה באחוזים ולא ביחידות פיזיקליות; הסמן היה קבוע ולא ניתן לגרירה; גל ה־FM חושב מביטוי סגור ולא מאינטגרציית התדר.',
  fix:'המחוון הומר ל־kHz עם תווית Δf מפורשת; הסמן הפך לידית גרירה על גרף אות המידע; גל ה־FM נבנה באינטגרציה נומרית של התדר הרגעי לפאזה; נוספו קריאות רגעיות ושלושה מצבי בדיקה.',
  title:'איך המידע מסתתר בשינויי התדר — ואיך המקלט מוציא אותו?',
  tk:'אם המידע נמצא בשינויי התדר — איך המקלט יוכל למדוד אותם ולהפוך אותם לצליל?',
  note:'בשיעור הקודם למדנו שב־FM המשרעת נשארת קבועה, והמידע מיוצג באמצעות שינויי התדר. גררו את הנקודה השחורה לאורך הזמן — שלושת הגרפים זזים יחד. שימו לב שבשיא של m(t) המחזורים צפופים, ובשקת הם מתרווחים. אחר כך שנו את Δf וראו שהגל נעשה צפוף או מרווח יותר, אבל המשרעת לא זזה. שאלו: איך המקלט מודד את זה?',
  body:`<div class="simwrap" data-sim="mfm3" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="m" width="1500" height="255"></canvas></div>
      <div class="plotbox tight"><canvas data-c="fm" width="1500" height="360"></canvas></div>
      <div class="plotbox tight"><canvas data-c="f" width="1500" height="255"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:310px;width:310px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>סטיית התדר המרבית (<i>Δf</i>)</label><output data-o="df">40 kHz</output></div>
        <input type="range" data-k="df" min="0" max="75" step="1" value="40"></div>
      <p class="mfm-hint">המחוון קובע עד כמה תדר גל ה־FM יכול לסטות מהתדר המרכזי. הוא אינו משנה את אות המידע.</p>
      <div class="ro">
        <div><small>m(t) ברגע הנבחר</small><b data-o="mv">0.00</b></div>
        <div class="hl"><small>סטייה רגעית</small><b data-o="dft">0 kHz</b></div>
      </div>
      <p class="status" data-o="st">אות המידע לא משתנה; רק שינויי התדר משתנים.</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
      <p class="hint"><b>גררו את הנקודה</b> בגרף העליון — שלושת הגרפים זזים יחד.</p>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>מה קורה כאן</h3>
      <p style="font-size:17px">אות המידע נשאר זהה. הגדלת סטיית התדר גורמת לגל ה־FM לשנות את תדרו בצורה חזקה יותר. המקלט מזהה את שינויי התדר ומשחזר מהם את אות המידע.</p>
    </div>
  </div>
</div>
<div class="explain tight">
  ב־<b>FM</b> המידע אינו נמצא בגובה הגל, אלא בשינויי התדר שלו. התדר הרגעי הוא <bdi dir="ltr">f<sub>i</sub>(t) = f<sub>c</sub> + Δf·m(t)</bdi>, כאשר <bdi dir="ltr">m(t)</bdi> מנורמל בין <bdi dir="ltr">−1</bdi> ל־<bdi dir="ltr">+1</bdi>. כאשר אות המידע עולה, התדר הרגעי עולה; כאשר הוא יורד, התדר הרגעי יורד.
</div>`
});

/* ---------------- 03 ---------------- */
/* בנייה מחדש · 27.10.2026 — בדיקת הבנה פעילה:
   נקודה ← שאלה ← תשובה רק בלחיצה. ללא נוסחה. */
R.push({
  n:3, pr:'גבוהה',
  find:'שלוש נקודות, שאלות ותשובות הוצגו בו־זמנית וללא גרפים; לא היה מה לראות, והתשובות שללו חשיבה עצמאית.',
  fix:'נבנה מחדש כהדגמה תלת־שלבית: גרף m(t) עם A/B/C, גל FM מסונכרן, הדגשת חלון הזמן של הנקודה הפעילה, וחשיפת התשובה בלחיצה בלבד. המשרעת נשארת קבועה לאורך כל השלבים.',
  title:'מה קורה לתדר הרגעי בכל נקודה?',
  tk:'הערך של אות המידע קובע את התדר הרגעי. המשרעת נשארת קבועה.',
  note:'אל תחשפו את התשובה לפני שהכיתה ענתה. שלושה שלבים, בכל שלב נקודה אחת מסומנת על גל המידע והחלון המתאים מודגש בגל ה־FM. בקשו תשובה בקול, ורק אז חשפו. ההבחנה שחייבת להישאר: נקודה B היא אפס מידע — לא אפס תדר; הגל ממשיך להתנודד סביב תדר המרכז.',
  body:`<div class="simwrap" data-sim="fmprobe" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="pm" width="1500" height="452"></canvas></div>
      <div class="plotbox tight"><canvas data-c="pfm" width="1500" height="452"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:355px;width:355px">
    <div class="ctrl tight">
      <p class="plotcap sm"><b>שלב <span data-o="step">1 / 3 · נקודה A</span></b></p>
      <p class="qnow" data-o="qn">נקודה A — שיא חיובי של אות המידע. מה קורה לתדר הרגעי?</p>
      <p class="fb" data-o="fb"></p>
      <div class="chips">
        <button class="chip" type="button" data-reveal>חשיפת התשובה</button>
        <button class="chip" type="button" data-ask>לנקודה הבאה</button>
      </div>
      <button class="btn5 ghost" type="button" data-reset>מהתחלה</button>
    </div>
  </div>
</div>`
});

/* ---------------- 04 ---------------- */
R.push({
  n:4, pr:'נמוכה',
  find:'מספר התחנות מוצג כעובדה אוניברסלית; חסרה יחידת MHz על הציר.',
  fix:'הכותרת הוסרה־מהכללה ("כמה תחנות"), נוסף סימון שהמספר הוא דוגמה, והציר מסומן ביחידות עם תדר התחנה הרצויה.',
  title:'הבעיה: כמה תחנות באנטנה',
  pairs:[
    ['<b>בחרו תחנה:</b>','<b>בחרו תחנה (דוגמה · 8 מתוך תחום אחד):</b>'],
    ['<p>הספקטרום סכמטי: התחנות מרווחות כ־<bdi dir="ltr">200 kHz</bdi> זו מזו בתוך <bdi dir="ltr">88–108 MHz</bdi>. רוחב הפס של כל תחנה לא מוצג בקנה מידה אמיתי.</p>',
     '<p><b>שמונה הוא מספר דוגמה</b>, לא עובדה על אנטנה כלשהי: במרחב קולטים את כל התחנות שהספק והמרחק מאפשרים. הציר ב־<bdi dir="ltr">MHz</bdi>; המרווח בין תחנות מוצג סכמטית, לא בקנה מידה.</p>'],
    ['התחילו מכאן את החלק ההנדסי. לחצו על תחנות שונות והראו שהספקטרום לא משתנה — רק הבחירה. אחר כך לחצו "הגברת הכול" ושאלו מה קרה ליחס בין התחנה הרצויה לשכנותיה. זו הבעיה הראשונה, ופתרונה הוא כל שאר השיעור.',
     'התחילו מהספקטרום עם יחידות, וסמנו תחנה רצויה אחת מול השכנות. לחצו על תחנות שונות והראו שהספקטרום לא משתנה — רק הבחירה. אחר כך "הגברת הכול", ושאלו מה קרה ליחס בין הרצויה לשכנותיה. הדגישו ששמונה הוא מספר דוגמה.']
  ]
});

/* ---------------- 05 ---------------- */
/* עיצוב מחדש · 27.10.2026 — שני מסלולים זה לצד זה.
   הטענה נשארת נכונה: הגברה מכפילה הכול באותו גורם;
   הסינון מחליש מחוץ לתחום, אך אינו מפריד perfectly בין שכנות. */
R.push({
  n:5, pr:'גבוהה',
  find:'"בלי סינון התוצאה שמע מרוח" מדלג על שלב הגילוי; הפריסה הסתירה את ההבדל בין הגברה לסינון מאחורי פסקאות.',
  fix:'נבנה מחדש כשני מסלולים חזותיים זה לצד זה — בלי סינון מול עם סינון — על אותם תדרים ואותם צבעים, בסקאלה לינארית. נוספה חשיפה בשתי לחיצות, והפסקאות הוחלפו במשפט מסכם אחד.',
  tk:'מגבר מחזק אותות; מסנן עוזר להפריד ביניהם.',
  note:'אל תציגו את שני המסלולים בבת אחת. לחיצה ראשונה — המסלול בלי סינון: שלוש התחנות עולות יחד, אותה מכפלה לכולן, והיחס ביניהן לא משתנה. לחיצה שנייה — המסלול עם סינון: רצועת המעבר מסומנת, התחנה שמחוץ לתחום נחלשת, ואז ההגברה מרימה את מה שנשאר. הדגישו שהמסנן אינו מלבני — תחנה סמוכה לקצה התחום נחלשת אך אינה נעלמת. תנאי מעבר: הסטודנט מסביר מדוע הגברה לבדה אינה בוחרת תחנה.',
  body:`<div class="gstep" data-steps data-sim="gainfilt">
<div class="gsrow">
  <div class="gspanel">
    <div class="gs-h"><b>בלי סינון</b><span>מגבר בלבד</span></div>
    <div class="gsflow">
      <div class="gsbox">ספקטרום כניסה</div><i>←</i>
      <div class="gsbox amp">מגבר</div>
    </div>
    <div class="gspair">
      <div class="plotbox tight"><canvas data-c="rin" width="700" height="300"></canvas></div>
      <div class="plotbox tight"><canvas data-c="rout" width="700" height="300"></canvas></div>
    </div>
  </div>
  <div class="gspanel" data-panel="2">
    <div class="gs-h"><b>עם סינון</b><span>מסנן ואז מגבר</span></div>
    <div class="gsflow">
      <div class="gsbox">ספקטרום כניסה</div><i>←</i>
      <div class="gsbox bpf">מסנן BPF</div><i>←</i>
      <div class="gsbox amp">מגבר</div>
    </div>
    <div class="gspair">
      <div class="plotbox tight"><canvas data-c="lin" width="700" height="300"></canvas></div>
      <div class="plotbox tight"><canvas data-c="lout" width="700" height="300"></canvas></div>
    </div>
  </div>
</div>
<div class="gsfoot">
  <p class="gscap-l cur" data-gscap="1">כל שלוש התחנות מתחזקות <b>באותו גורם</b> — היחס ביניהן נשמר.</p>
  <p class="gscap-l" data-gscap="2">המסנן מחליש מחוץ לתחום ההעברה; ההגברה מרימה את מה שנשאר. <b>סינון ראשוני</b> — לא הפרדה מושלמת.</p>
  <div class="gsnav">
    <button class="chip" type="button" data-gsopen>הצגת המסלול עם סינון</button>
    <button class="chip rst" type="button" data-gsreset>מהתחלה</button>
  </div>
</div>
</div>
<div class="keyidea tight">
  <div class="k-lab">המסקנה</div>
  <p>מגבר מחזק אותות; מסנן עוזר להפריד ביניהם.</p>
</div>`
});

/* ---------------- 06 ---------------- */
/* פושט · 27.10.2026 — מסלול על בלבד. הוסרו LO, הכללים
   והסברי מיקום המגבל; נוסף מסנן RF ראשוני. */
R.push({
  n:6, pr:'בינוני',
  find:'השקף העמיס מושגים שיידונו בהמשך (LO, שני סוגי מסננים, מיקום המגבל) ולא נתן תמונת־על של המסלול.',
  fix:'הוסרו קוביית ה־LO, תיבת שלושת הכללים ותיבת היכן המגבל. נוסף מסנן RF ראשוני לפני מגבר ה־RF. התרשים הוגדל לאלמנט המרכזי, ונוסף משפט הסבר כללי אחד בלבד.',
  note:'כאן אנחנו רואים את המסלול שהאות עובר מהאנטנה ועד הרמקול. המקלט צריך לבחור את האות הרצוי מתוך כל מה שהאנטנה קולטת, להגביר ולעבד אותו, ולבסוף להחזיר את הצליל המקורי. כרגע חשוב להבין את התמונה הכללית — בהמשך נפרק את השרשרת ונבין מה עושה כל רכיב.',
  body:`<div class="bigmap">
  <div class="rc" style="--rc:#0f172a">אנטנה<small>קולטת</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#0891b2">מסנן RF<small>סינון ראשוני</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#0891b2">מגבר RF<small>הגברה</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#7c3aed">ערבל<small>המרה</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#059669">מסנן IF<small>סינון מדויק</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#059669">מגבר IF<small>הגברה</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#d97706">מגביל<small>יישור משרעת</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#db2777">גלאי FM<small>תדר למתח</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#475569">מגבר שמע<small>לרמקול</small></div>
  <i>←</i>
  <div class="rc" style="--rc:#0f172a">רמקול<small>צליל</small></div>
</div>
<div class="explain tight big">
  המקלט מסנן את האותות שנקלטו, מגביר את האות הרצוי, מעבד אותו ומחזיר את המידע לצליל. בהמשך נבין מה עושה כל שלב.
</div>`
});

/* ---------------- 07 ---------------- */
/* עיצוב מחדש · 27.10.2026 — הגרף הוא האלמנט המרכזי.
   המסר: RF מסננת תחום ומגבירה; הבחירה המדויקת ב-IF. */
R.push({
  n:7, pr:'קריטי',
  find:'מחוון "רוחב מסנן הכניסה 200 kHz" סתר את הטקסט שאמר שמסנן RF פרקטי רחב יותר; הגרף היה קטן ותוויות התדרים חפפו.',
  fix:'הגרף הוגדל לאלמנט המרכזי ותוויות התחנות מוצגות בשתי שורות מדורגות ללא חפיפה. המחוון משנה את רוחב תחום המעבר בזמן אמת ומעדכן אילו תחנות עוברות. ברירת המחדל היא רוחב תחום (~21 MHz), וכל מצב מסומן כ"המחשה סכמטית".',
  title:'מה עושה הדרגה הראשונה?',
  tk:'דרגת ה־RF מסננת תחום ומגבירה. הבחירה המדויקת של התחנה — ב־IF.',
  note:'הציגו קודם את הרוחב הרחב: שמונה תחנות, כולן עוברות. שאלו מה השתנה — שום תחנה לא נבחרה. אחר כך הצרו את תחום המעבר: התחנות שבחוץ נחלשות, אבל גם השכנות שבפנים אינן נעלמות. המסר: סינון ראשוני. דרגת ה־IF היא שתבחר את הערוץ. אל תאמרו שמסנן RF מעביר תמיד את כל 88–108, ואל תאמרו שהוא בוחר תחנה אחת.',
  body:`<div class="rfwrap" data-sim="rffilter">
  <div class="rfplot"><canvas data-c="rf" width="1600" height="560"></canvas></div>
  <div class="rfside">
    <div class="rfctl">
      <div class="ctl sm"><div><label>רוחב תחום המעבר</label><output data-o="bw">21 MHz</output></div>
        <input type="range" data-k="bw" min="3" max="30" step="1" value="21"></div>
      <div class="ro"><div class="hl"><small>תחנות שעוברות</small><b data-o="pass">8</b></div></div>
      <p class="status" data-o="st">הרבה תחנות עוברות יחד</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="rfmsg">
      <p>דרגת ה־RF מסננת תחום תדרים ומגבירה את האותות שעוברים. זהו <b>סינון ראשוני</b> — הבחירה המדויקת יותר של התחנה מתבצעת בהמשך, בדרגת ה־IF.</p>
    </div>
  </div>
</div>`
});

/* ---------------- 08 ---------------- */
/* עיצוב מחדש · 27.10.2026 — אותה שרשרת, תחנה אחרת.
   המסנן לא זז; התחנה מומרת אליו. */
R.push({
  n:8, pr:'קריטי',
  find:'השקף הסביר את הצורך ב-IF אבל לא המחיש אותו; הסימון f_IF הופיע כטקסט ואילו 200 kHz הוצג כגודל אחד עם תדר הביניים.',
  fix:'נבנה מחדש: שתי תחנות (98.1 ו-103.5) בבורר, ספקטרום RF מול ספקטרום IF, חץ המרה, ומסנן IF קבוע ב-10.7 MHz. תדר המרכז ורוחב הפס הופרדו לשני כרטיסים נפרדים עם סימון מתמטי תקני.',
  title:'למה משתמשים בתדר ביניים קבוע?',
  tk:'משנים את תדר התחנה הנקלטת — אבל מסנן ה־IF נשאר קבוע.',
  note:'הציגו קודם את 98.1: בספקטרום ה-RF היא מודגשת, וב-IF היא יושבת ב-10.7. החליפו ל-103.5 — שימו לב שכל העקומה ב-RF זזה, אבל החלון הירוק ב-IF לא זז בכלל. זו כל הסיבה לתדר ביניים. אל תסבירו עדיין איך הערבל עושה את זה. הדגישו: לא שתי תחנות בו-זמנית, אלא אותה שרשרת עם תחנה אחרת.',
  body:`<div class="ifwrap" data-sim="ifsame">
  <div class="ifplots">
    <div class="ifplot"><canvas data-c="rfsp" width="1500" height="420"></canvas></div>
    <div class="ifarrow"><i>←</i><span>המרה</span></div>
    <div class="ifplot"><canvas data-c="ifsp" width="1500" height="420"></canvas></div>
  </div>
  <div class="ifside">
    <p class="iflead">תחנות שונות משדרות בתדרים שונים, אבל כל אחת מהן נבחרת ועוברת לאותו תדר עבודה — ולכן מסנן אחד מדויק משמש את כולן.</p>
    <div class="ifctl">
      <p class="plotcap sm"><b>איזו תחנה?</b></p>
      <div class="chips">
        <button class="chip" type="button" data-stn="98.1" aria-pressed="true">98.1</button>
        <button class="chip" type="button" data-stn="103.5" aria-pressed="false">103.5</button>
      </div>
      <div class="ro"><div class="hl"><small>תחנה נבחרת</small><b data-o="fsel">98.1 MHz</b></div></div>
      <p class="status" data-o="st">אותה שרשרת, תחנה אחרת</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="ifcards">
      <div class="ifcard">
        <h4>תדר ביניים</h4>
        <div class="ifcard-v" dir="ltr">10.7 MHz</div>
        <div class="ifcard-f" data-unit="MHz">\\[f_{\\mathrm{IF}}=10.7\\ \\mathrm{MHz}\\]</div>
      </div>
      <div class="ifcard alt">
        <h4>רוחב פס לדוגמה</h4>
        <div class="ifcard-v" dir="ltr">200 kHz</div>
        <div class="ifcard-f">\\[BW\\ \\text{(דוגמה)}\\]</div>
      </div>
    </div>
  </div>
</div>`
});

/* ---------------- 09 ---------------- */
/* פושט · 27.10.2026 — הגדל את התרשים; הוסר תוכן מוקדם מדי. */
R.push({
  n:9, pr:'בינוני',
  find:'LO הוסבר עם סחיפה, AFC, הזרקה גבוהה ו"תדר ייחוס שהערבל מחסיר" — מושגים שיידונו בשקפים 12 ו-41.',
  fix:'הוסרו הסחיפה, AFC, מיקום ה-LO מעל התחנה וכל נוסחה. נשארו שתי תיבות קצרות — מה ה-LO עושה ומה אינו עושה — ותרשים מוגדל עם חץ מהלו לתוך הערבל.',
  title:'המתנד המקומי: אות עזר, לא אות שמע',
  tk:'ה־LO מייצר אות עזר בתדר מתכוונן ומעביר אותו לערבל. הוא אינו נושא את המידע שאנחנו רוצים לשמוע.',
  note:'שתי שאלות בלבד בסוף השקף: מה ה-LO מייצר, ולאן האות שלו נכנס. הדגישו את החץ שנכנס לתוך הערבל ולא למרווח. אל תזכירו סחיפה, AFC או הזרקה גבוהה — הם מגיעים בשקפים 12 ו-41. תנאי מעבר: הסטודנט עונה על שתי השאלות בלי עזרה.',
  body:`<div class="lowrap">
  <div class="lomap">
    <div class="lomap-grid">
      <div class="rc dim" style="--rc:#0f172a">אנטנה</div>
      <div class="arw">←</div>
      <div class="rc dim" style="--rc:#0891b2">מגבר RF</div>
      <div class="arw">←</div>
      <div class="rc hot" style="--rc:#7c3aed">ערבל<small>שני כניסות</small></div>
      <div class="arw">←</div>
      <div class="rc dim" style="--rc:#059669">מסנן IF</div>
      <div class="arw">←</div>
      <div class="rc dim" style="--rc:#d97706">מגבל</div>

      <div class="stem"><span>אות עזר מה־LO</span><i>↑</i></div>

      <div class="rc hot lo" style="--rc:#7c3aed">LO<small>מתנד מקומי&nbsp;·&nbsp;מתכוונן</small></div>
    </div>
  </div>
  <div class="locards">
    <div class="locard yes">
      <h3>מה ה־LO עושה?</h3>
      <ul>
        <li>מייצר אות חשמלי בתדר שניתן לכוון.</li>
        <li>התדר שלו משתנה בהתאם לתחנה שבחרנו.</li>
        <li>האות שלו נכנס לערבל.</li>
      </ul>
    </div>
    <div class="locard no">
      <h3>מה ה־LO לא עושה?</h3>
      <ul>
        <li>אינו קולט תחנות מהאנטנה.</li>
        <li>אינו מכיל את המוזיקה או הדיבור.</li>
        <li>אינו מפיק את אות השמע לרמקול.</li>
      </ul>
    </div>
  </div>
</div>`
});

/* ---------------- 10 ---------------- */
/* עיצוב מחדש · 27.10.2026 — גרפים ממלאים את המסגרת,
   תוויות גדולות, והנוסחאות נראות במלואן. */
R.push({
  n:10, pr:'גבוהה',
  find:'הגרף התחתון היה קטן ומרוכז למעלה, תוויות f_RF/f_LO זעירות, ותיבת "שתי הנוסחאות" נחתכה בתחתית השקף.',
  fix:'הגרפים נבנו מחדש בפריסה שממלאת את התיבה, עם תוויות 24px, הפרדה בין תווית ההפרש למרכז לכותרת חלון המסנן, ושתי הנוסחאות בשתי כרטיסיות נפרדות מעל הגרפים.',
  title:'מה באמת קורה בערבל?',
  tk:'ערבול יוצר שני תוצרים — סכום והפרש. מסנן ה־IF הוא זה שבוחר את ההפרש.',
  note:'אל תתחילו מהנוסחה. הזיזו את f_LO והראו איך שני התוצרים זזים: האחד מתרחק, השני מתקרב. רק אחרי שהכיתה רואה שני תוצרים — חשפו את הנוסחאות. הדגישו שהערבל אינו מסנן: הוא יוצר את שניהם, והמסנן בוחר.',
  body:`<div class="mixwrap" data-sim="mixer2">
  <div class="mixformulas">
    <div class="mixf" data-unit="MHz">
      <span class="mixf-l">סכום</span>
      <div class="mixf-e">\\[f_{\\mathrm{sum}}=f_{\\mathrm{RF}}+f_{\\mathrm{LO}}\\]</div>
      <span class="mixf-v" data-o="sum">206.9 MHz</span>
    </div>
    <div class="mixf" data-unit="MHz">
      <span class="mixf-l">הפרש</span>
      <div class="mixf-e">\\[f_{\\mathrm{diff}}=\\left|f_{\\mathrm{RF}}-f_{\\mathrm{LO}}\\right|\\]</div>
      <span class="mixf-v" data-o="dif">10.7 MHz</span>
    </div>
  </div>
  <div class="mixplots">
    <div class="mixplot"><canvas data-c="mspec" width="1500" height="430"></canvas></div>
    <div class="mixplot"><canvas data-c="mout" width="1500" height="430"></canvas></div>
  </div>
  <div class="mixctl">
    <div class="ctl sm"><div><label>תחנה · f_RF</label><output data-o="rf">98.1 MHz</output></div>
      <input type="range" data-k="rf" min="88" max="108" step="0.1" value="98.1"></div>
    <div class="ctl sm"><div><label>מתנד · f_LO</label><output data-o="lo">108.8 MHz</output></div>
      <input type="range" data-k="lo" min="95" max="125" step="0.1" value="108.8"></div>
    <p class="status" data-o="st">ההפרש נופל על 10.7 MHz</p>
    <button class="btn5 ghost" data-reset type="button">איפוס</button>
  </div>
</div>`
});

/* ---------------- 11 ---------------- */
/* עיצוב מחדש · 27.10.2026 — שני תוצרים, לפני ואחרי הסינון */
R.push({
  n:11, pr:'גבוהה',
  find:'ההמחשה לא הראתה את תוצר הסכום שנדחה לצד תוצר ההפרש; 10.7 ו-200 kHz הוצגו יחד בלי הפרדה.',
  fix:'נבנו שני חלונות: חלון ה-IF המורחב סביב 10.7 עם רוחב פס הניתן לשינוי, ולצידו תוצר הסכום מסומן כנדחה. תדר המרכז ורוחב הפס מוצגים בנפרד.',
  title:'המסנן בוחר את ההפרש',
  tk:'שני תוצרים בערבל — רק ההפרש עובר, והמידע נשמר בתוכו.',
  note:'הראו קודם את החלון הימני: תוצר ההפרש בתוך חלון המסנן. אחר כך את השמאלי: תוצר הסכום ב-206.9, מחוץ לתחום — ולכן נדחה. הדגישו: הערבל יוצר את שניהם, המסנן בוחר. הזיזו את ההיסט וראו מתי האות יוצא מהחלון.',
  body:`<div class="ifs2" data-sim="ifsel2">
  <div class="ifs2-plots">
    <div class="ifs2-p"><canvas data-c="ifz" width="1500" height="460"></canvas></div>
    <div class="ifs2-p"><canvas data-c="ifsum" width="900" height="460"></canvas></div>
  </div>
  <div class="ifs2-side">
    <div class="ifs2-nums">
      <div class="ifs2-n"><small>תדר מרכז</small><b dir="ltr">10.7 MHz</b></div>
      <div class="ifs2-n alt"><small>רוחב פס (דוגמה)</small><b dir="ltr">200 kHz</b></div>
    </div>
    <div class="rfctl">
      <div class="ctl sm"><div><label>רוחב מסנן IF</label><output data-o="bw">200 kHz</output></div>
        <input type="range" data-k="bw" min="60" max="400" step="10" value="200"></div>
      <div class="ctl sm"><div><label>היסט התחנה</label><output data-o="off">0 kHz</output></div>
        <input type="range" data-k="off" min="-220" max="220" step="10" value="0"></div>
      <p class="status" data-o="st">האות בתוך חלון המסנן</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
  </div>
</div>`
});

/* ---------------- 12 ---------------- */
/* עיצוב מחדש · 27.10.2026 — הגרף דומיננטי, אותו IF בשתי האפשרויות */
R.push({
  n:12, pr:'גבוהה',
  find:'הגרף היה קטן, השטח שמתחתיו ריק, וההסבר על הבבואה והסחיפה הקדים מושגים שטרם נלמדו.',
  fix:'הגרף הוגדל לאלמנט הדומיננטי עם ציר תדר בקנה מידה עקבי; לוח הנתונים עבר לצד; הוסרו הבבואה והסחיפה, ונוסחה מתחלפת לפי הבחירה.',
  title:'הזרקה גבוהה: LO מעל או מתחת?',
  tk:'בשתי האפשרויות מתקבל אותו תדר ביניים — 10.7 MHz.',
  note:'ניבוי לפני חשיפה: אם התחנה ב-98.1 וה-IF ב-10.7, ה-LO מעל או מתחת? הראו שגם 108.8 וגם 87.4 נותנים הפרש של 10.7. הדגישו את המרחק הפיזי בגרף — הוא זהה בשני המקרים. בשיעור נשתמש בהזרקה גבוהה כדי לשמור על חישובים עקביים.',
  body:`<div class="inj2" data-sim="inject2">
  <div class="inj2-plot"><canvas data-c="inj2" width="1600" height="520"></canvas></div>
  <div class="inj2-side">
    <div class="rfctl">
      <p class="plotcap sm"><b>סוג הזרקה</b></p>
      <div class="chips">
        <button class="chip" type="button" data-inj2="high" aria-pressed="true">גבוהה</button>
        <button class="chip" type="button" data-inj2="low" aria-pressed="false">נמוכה</button>
      </div>
      <div class="inj2-ro">
        <div><small>RF · תחנה</small><b data-o="rf" dir="ltr">98.1 MHz</b></div>
        <div class="hl"><small>LO · מתנד</small><b data-o="lo" dir="ltr">108.8 MHz</b></div>
        <div><small>IF · ביניים</small><b data-o="iff" dir="ltr">10.7 MHz</b></div>
      </div>
      <div class="inj2-f" data-o="fml" dir="ltr">f_LO = f_RF + f_IF</div>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <p class="inj2-note">בשתי האפשרויות מתקבל אותו תדר ביניים. בשיעור נשתמש בהזרקה גבוהה כדי לשמור על חישובים עקביים. בהמשך נלמד כיצד הבחירה משפיעה על תדר הבבואה.</p>
  </div>
</div>`
});

/* ---------------- 13 ---------------- */
R.push({
  n:13, pr:'נמוכה',
  find:'הדוגמה מפורקת היטב, אך חסרה בדיקת יחידות בכל שורת הצבה.',
  fix:'נוספה שורת יחידות בכל שלב ושאלה עצמאית לפני חשיפה; הפתרון אינו גלוי מראש.',
  pairs:[
    ['<div class="step"><b>2 · LO:</b> \\(f_{LO}=98.1+10.7=\\mathbf{108.8\\ MHz}\\)</div>',
     '<div class="step"><b>2 · LO:</b> \\(f_{LO}=98.1\\,\\mathrm{MHz}+10.7\\,\\mathrm{MHz}=\\mathbf{108.8\\ MHz}\\)</div>'],
    ['<div class="step"><b>5 · בדיקה:</b> \\(108.8-98.1=10.7\\ \\checkmark\\)</div>',
     '<div class="step"><b>5 · בדיקה:</b> \\(108.8-98.1=10.7\\ \\mathrm{MHz}\\ \\checkmark\\)</div>'],
    ['<div class="callout" style="margin-top:6px"><b>כלל:</b> לעולם לא מסיימים חישוב בלי לחסר חזרה.</div>',
     '<div class="callout" style="margin-top:6px"><b>כלל:</b> לעולם לא מסיימים חישוב בלי לחסר חזרה — ובלי לרשום יחידה בכל שורה.</div>\n    <p style="font-size:18px;margin-top:4px"><b>לפני החשיפה:</b> חשבו לבד את שלב 2, ורשמו גם את היחידה. מי שכתב מספר בלי יחידה — לא סיים.</p>']
  ]
});

/* ---------------- 14 ---------------- */
/* עיצוב מחדש · 27.10.2026 — המחשה חזותית במקום פסקה */
R.push({
  n:14, pr:'גבוהה',
  find:'ההיפוך בסטיית התדר הוצג כהיפוך גרפי, בלי הסבר מדוע הוא נובע מחיסור תדר ה־LO, ובלי סימון תואם שמראה +75 מול −75 באותו רגע.',
  fix:'ההיפוך נגזר כעת מפורשות מ־f_IF(t) = f_LO − f_RF(t); נוסף סימון זמן תואם בשני הגרפים (+75 / −75), כיתוב LO מתחת לחץ, וההסבר המרכזי והשורה התחתונה נוסחו מחדש.',
  title:'שינינו את תדר הנושא — האם המידע השתנה?',
  tk:'הערבל משנה את תדר הנושא, ובמקרה זה גם הופך את סימן סטיית התדר. המידע אינו הולך לאיבוד.',
  note:'שני הגרפים הם סטיית תדר רגעית, לא גל הנושא. שימו לב לסימון באותו רגע זמן: בצד ה־RF ‎+75 kHz, בצד ה־IF ‎−75 kHz. זה נובע מחיסור: f_IF = f_LO − f_RF, וכשמחסירים גדל — ההפרש קטן. המידע עצמו לא השתנה, רק סימן הסטייה.',
  body:`<div class="shfwrap" data-sim="shift">
  <div class="shfpair">
    <div class="shfp"><canvas data-c="shfR" width="1400" height="460"></canvas></div>
    <div class="shfarrow">
      <bdi dir="ltr" class="shflo">LO = 108.8 MHz</bdi>
      <i>←</i>
      <span>המרת תדר עם היפוך סטיית התדר</span>
    </div>
    <div class="shfp"><canvas data-c="shfL" width="1400" height="460"></canvas></div>
  </div>
  <div class="shffoot">
    <p class="shfbig">המרת התדר משנה את תדר הנושא מ־<bdi dir="ltr">98.1 MHz</bdi> ל־<bdi dir="ltr">10.7 MHz</bdi>. מכיוון שהמתנד המקומי גבוה מתדר התחנה, כיוון סטיית התדר מתהפך — אך המידע נשמר וניתן לשחזור.</p>
  </div>
</div>`
});

/* ---------------- 15 ---------------- */
/* עיצוב מחדש · 27.10.2026 — הגרף מלמד, הטקסט תומך */
R.push({
  n:15, pr:'קריטי',
  find:'200 kHz הוצג גם כרוחב מסנן מחייב וגם כמרווח ערוץ; הגרף היה קטן ותיבת ההסבר הכתומה עמוסה.',
  fix:'הכותרת והמסר עברו לרוחב האות מול רוחב המסנן; הגרף הוגדל עם ציר כסטייה מתדר המרכז ב-kHz; שלושת מצבי הכשל מוצגים כמשוב חי ולא כפסקה.',
  title:'איך רוחב מסנן ה־IF משפיע על קליטת האות?',
  tk:'מסנן IF צריך להיות ממורכז בתדר הנכון ורחב מספיק כדי להעביר את האות הרצוי.',
  note:'אל תאמרו "המסנן חייב 200 kHz" — אמרו "בדוגמה בחרו 200 kHz". הציר הוא סטייה מתדר המרכז, לא תדר מוחלט: אפס = 10.7 MHz. הצרו את רוחב המסנן וראו את האות נחתך; הרחיבו וראו אותו מעביר שכנים; הזיזו את ההיסט וראו את האות יוצא מהמרכז. שלושת הכשלים הם שלושה סוגים שונים של בעיה.',
  body:`<div class="bwf" data-sim="bwfilter2">
  <div class="bwf-plot"><canvas data-c="bw2" width="1600" height="520"></canvas></div>
  <div class="bwf-side">
    <div class="rfctl">
      <div class="ctl sm"><div><label>רוחב מסנן IF · דוגמה</label><output data-o="bw">200 kHz</output></div>
        <input type="range" data-k="bw" min="60" max="480" step="10" value="200"></div>
      <div class="ctl sm"><div><label>היסט התחנה</label><output data-o="off">0 kHz</output></div>
        <input type="range" data-k="off" min="-220" max="220" step="10" value="0"></div>
      <p class="status" data-o="st">רוחב מתאים</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <ul class="bwf-notes">
      <li><b>צר מדי:</b> חלק מהאות נחלש ועלול להיגרם עיוות.</li>
      <li><b>רחב מדי:</b> יותר רעש והפרעות עלולים לעבור.</li>
      <li><b>לא ממורכז:</b> גם ברוחב מתאים, חלק מהאות נחלש.</li>
    </ul>
  </div>
</div>`
});
})();
