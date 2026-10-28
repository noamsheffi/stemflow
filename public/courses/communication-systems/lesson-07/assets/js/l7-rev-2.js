/* =========================================================
   שיעור 07 · v2 — תיקוני שקפים 16–33
   המגבל · גילוי FM · גלאי שיפוע · PLL
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

/* ---------------- 16 ---------------- */
R.push({
  n:16, pr:'בינוני',
  find:'יש לערבב בין דעיכה/ריבוי נתיבים לרעש משרעת; חסר תיוג שהמודל הוא הפרעת משרעת בלבד.',
  fix:'המודל תויג מפורשות כהפרעת משרעת; נוסף סייג שאין להבטיח שהמגבל מסיר ריבוי נתיבים או רעש מופע.',
  tk:'רעש מוסיף תנודות משרעת — ואלה אינן המידע.',
  pairs:[
    ['<p style="font-size:19px">רעש תדר ורעש מופע <b>אינם</b> מיוצגים כאן.</p>',
     '<p style="font-size:19px">רעש תדר, רעש מופע וריבוי נתיבים <b>אינם</b> מיוצגים כאן — והמגבל אינו פותר אותם.</p>'],
    ['ההבדל בין השניים נראה בעין ואת זה צריך לנצל. התחילו מהגל העליון — נקי, מעטפת קבועה. אחר כך הזיזו את המחוון והראו שהמעטפת מתעוותת אבל התדר הרגעי לא. הדגישו שזה מודל של הפרעת AM בלבד — לא כל רעש אפשרי.',
     'ההבדל נראה בעין. התחילו מהגל העליון — נקי, מעטפת קבועה. הזיזו את המחוון והראו שהמעטפת מתעוותת אבל התדר הרגעי לא. הדגישו: זה <b>מודל הפרעת משרעת בלבד</b>. דעיכה, החזרות מבנים וריבוי נתיבים אינם אותו דבר, וחלקם אינם ניתנים להסרה במגבל. תנאי מעבר: אין הבטחה שהמגבל מסיר multipath או רעש מופע.']
  ]
});

/* ---------------- 17 ---------------- */
R.push({
  n:17, pr:'קריטי',
  find:'התשובה "לא, המידע בתדר בלבד" מוחלטת מדי; הסתייגות מופיעה רק בסוף, אחרי החשיפה.',
  fix:'התשובה הותנתה במודל: "במודל שבו משתנה רק המשרעת והתדר הרגעי אינו משתנה", וההסתייגות מופיעה <b>לפני</b> התשובה, לא בסופה.',
  title:'האם המידע נפגע?',
  tk:'במודל של הפרעת משרעת בלבד — מספר מעברי האפס נשמר.',
  note:'הסדר קריטי כאן: קודם ההסתייגות, אחר כך התשובה. הציגו את השאלה המותנית, ורק אז את הניבוי. רוב הכיתה תגיד "כן, השמע יתעוות" — ואז תראה להם שמספר מעברי האפס לאורך הזמן לא השתנה. אבל אל תסיימו בלי המשפט השני: מגבל אינו מתקן הפרעות שמשנות פאזה או תזמון מעברי אפס.',
  body:`${map('lim')}
<div class="caveat" style="margin-bottom:0">
  <span class="cv-lab">לפני שעונים</span>
  <p>השאלה מוצגת <b>בתוך מודל</b>: משתנה רק המשרעת, והתדר הרגעי אינו משתנה. במציאות חלק מההפרעות משנות גם פאזה — ואת אלה מגבל <b>לא</b> מתקן.</p>
</div>
<div class="g2">
  <div class="card5 ask">
    <h3>הניבוי</h3>
    <p>בתוך המודל הזה: המשרעת משתנה בעשרות אחוזים. האם השמע יתעוות?</p>
    <p style="font-size:20px;font-weight:700;color:#0e7490">א · כן<br>ב · לא, כי התדר הרגעי לא השתנה</p>
  </div>
  <div class="card5 ok">
    <h3>התשובה — מותנית</h3>
    <p><b>ב, במודל הזה.</b> מספר מעברי האפס ליחידת זמן לא השתנה, ולכן התדר הרגעי נשמר.</p>
    <p>מגבל אינו מתקן הפרעות שמשנות <b>פאזה</b> או <b>תזמון מעברי אפס</b>: שם המידע עצמו זז.</p>
  </div>
</div>
<div class="keyidea">
  <div class="k-lab">ההשלכה</div>
  <p>אם במודל הזה המידע לא נפגע — אפשר <span class="m">למחוק</span> את המשרעת בלי לפגוע בשמע. זה בדיוק תפקיד המגבל.</p>
</div>`
});

/* ---------------- 18 (מאוחד: 18+19+20) ---------------- */
R.push({
  n:18, pr:'קריטי',
  find:'שלושת השקפים פיזרו את אותו נושא: הפעולה (18), ההרמוניות (19) והגבולות (20) — בלי רצף אחד ובלי טקסט שאפשר ללמד ממנו.',
  fix:'אוחדו לשקף אחד עם שלושה גרפים מסונכרנים, שלושה מחוונים, תיבת "מה חשוב להבין?" גלויה, והסבר על הרמוניות וגבולות בגוף השקף.',
  title:'איך המגבל מסיר הפרעות משרעת — ומתי הוא לא מצליח?',
  tk:'המגבל מצמצם שינויי משרעת — אבל רק כשהאות מגיע לסף, ורק להפרעות משרעת.',
  note:'התחילו מהגרף העליון: המשרעת משתנה אף שהמידע בתדר. עברו לאמצעי והראו את הסף. אחר כך השלישי — משרעת כמעט קבועה. הזיזו את רמת האות למטה והראו שהמגבל מפסיק לעבוד. הדגישו: קיטום אינו סינוס נקי, ונדרש סינון אחריו.',
  body:`<div class="lim3" data-sim="lim3">
  <div class="lim3-plots">
    <div class="lim3-p"><canvas data-c="l3a" width="1500" height="330"></canvas></div>
    <div class="lim3-p"><canvas data-c="l3b" width="1500" height="330"></canvas></div>
    <div class="lim3-p"><canvas data-c="l3c" width="1500" height="330"></canvas></div>
  </div>
  <div class="lim3-side">
    <div class="rfctl">
      <div class="ctl sm"><div><label>רמת האות</label><output data-o="level">80%</output></div>
        <input type="range" data-k="level" min="10" max="100" value="80"></div>
      <div class="ctl sm"><div><label>עוצמת הפרעת המשרעת</label><output data-o="noise">45%</output></div>
        <input type="range" data-k="noise" min="0" max="100" value="45"></div>
      <div class="ctl sm"><div><label>סף הקיטום · V_lim</label><output data-o="lim">55%</output></div>
        <input type="range" data-k="lim" min="25" max="95" value="55"></div>
      <p class="status" data-o="st">האות מגיע לתחום הפעולה</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="lim3-teach">
      <h4>מה חשוב להבין?</h4>
      <p>כאשר אות FM מגיע למגבל, ייתכן שהמשרעת שלו משתנה בגלל הפרעות בדרך. המגבל מצמצם את שינויי המשרעת, משום שהמידע הרצוי נמצא בשינויי התדר. אבל המגבל אינו פתרון לכל סוגי הרעש, והוא פועל ביעילות רק כאשר האות נמצא בתחום הפעולה המתאים.</p>
      <p class="lim3-tech">המגבל מדכא הפרעות משרעת <b>בתחום פעולתו בלבד</b>. הוא אינו מבטל רעש תדר או מופע, ואינו מבטיח שיפור בכל מצב קליטה. קיטום עלול ליצור הרמוניות נוספות, ולכן במימוש מעשי נדרש סינון מתאים.</p>
    </div>
  </div>
</div>`
});

/* ---------------- 21 ---------------- */
R.push({
  n:21, pr:'גבוהה',
  find:'הגרף העליון תפס כמעט את כל המסגרת ושני התחתונים היו קטנים; חסר גרף אות המידע להשוואה.',
  fix:'נבנו שלושה גרפים ברוחב וגובה זהים על אותו ציר זמן: AM מקורי, לאחר המגבל, ואות המידע המקורי להשוואה. נוסף טקסט מנחה גלוי.',
  tk:'במגבל הקוטם שמוצג כאן: ב־FM הוא מסייע להסיר הפרעות משרעת, וב־AM הוא מוחק את המעטפת שנושאת את המידע.',
  note:'הפעילו את המגבל והראו את המעטפת נחתכת בגרף האמצעי. הגרף התחתון נשאר קבוע — הוא הייחוס. שאלו: מה מהשלושה מייצג את המידע? ומה קרה לו?',
  body:`<div class="am3" data-sim="amlim3">
  <div class="am3-plots">
    <div class="am3-p"><canvas data-c="amA" width="1500" height="300"></canvas></div>
    <div class="am3-p"><canvas data-c="amB" width="1500" height="300"></canvas></div>
    <div class="am3-p"><canvas data-c="amC" width="1500" height="300"></canvas></div>
  </div>
  <div class="am3-foot">
    <p class="am3-guide">באות AM המידע נמצא בשינויי המשרעת. כאשר מפעילים מגבל, אנחנו מצמצמים דווקא את השינויים שנושאים את המידע. לכן האות לאחר ההגבלה כבר אינו מייצג בצורה נאמנה את המידע המקורי.</p>
    <button class="btn5" type="button" data-limtoggle aria-pressed="false">הפעלת המגבל</button>
  </div>
</div>`
});

/* ---------------- 22 ---------------- */
R.push({
  n:22, pr:'נמוך',
  find:'התרשים היה קטן ובחצי העליון של השקף, וחסר טקסט שאפשר להקריא במעבר למגבל ולגלאי.',
  fix:'המפה הוגדלה למרכז השקף, המגבל הודגש בכתום והגלאי סומן כרכיב הבא; נוסף טקסט מעבר גלוי שניתן להקריא.',
  tk:'המגבל מצמצם הפרעות משרעת; הגלאי ממיר את שינויי התדר לאות שממנו ניתן לשחזר את השמע.',
  note:'זהו שקף מעבר — אל תסבירו בו גילוי. הראו את המפה, הקריאו את ההסבר, ושאלו מה עוד חסר. את התשובה נותן השקף הבא.',
  body:`<div class="tr22">
  <div class="bigmap">
    <div class="rc" style="--rc:#0f172a">אנטנה</div><i>←</i>
    <div class="rc" style="--rc:#0891b2">מסנן RF</div><i>←</i>
    <div class="rc" style="--rc:#0891b2">מגבר RF</div><i>←</i>
    <div class="rc" style="--rc:#7c3aed">ערבל</div><i>←</i>
    <div class="rc" style="--rc:#059669">מסנן IF</div><i>←</i>
    <div class="rc" style="--rc:#059669">מגבר IF</div><i>←</i>
    <div class="rc hot" style="--rc:#d97706">מגביל<small>נלמד</small></div><i>←</i>
    <div class="rc next" style="--rc:#db2777">גלאי FM<small>הבא בתור</small></div><i>←</i>
    <div class="rc" style="--rc:#475569">מגבר שמע</div>
  </div>
  <p class="tr22-guide">עד עכשיו למדנו כיצד המקלט בוחר את התחנה, ממיר את התדר ומצמצם הפרעות משרעת. אבל האות שמתקבל עדיין מאופנן FM — המידע נמצא בשינויי התדר, ולא בשינויי המשרעת. כדי לשמוע את המידע ברמקול, אנחנו צריכים להפוך את שינויי התדר לאות שמע. זה בדיוק תפקידו של הגלאי.</p>
</div>`
});

/* ---------------- 23 ---------------- */
R.push({
  n:23, pr:'גבוהה',
  find:'"מתח יחסי 100%" בתדר המרכז מבלבל בין מתח גלאי גולמי לבין מתח שמע אחרי הסרת DC.',
  fix:'הופרדו מתח גולמי (עם רכיב DC‏ V₀) ומתח שמע (אחרי הסרת DC): במרכז — סטייה אפסית ← מתח שמע ≈ 0. האלמנט "100%" הוסר.',
  title:'מה צריך לצאת מהגלאי?',
  tk:'במרכז — מתח גולמי חיובי, אבל מתח השמע ≈ 0.',
  note:'המחשה איכותית בלבד — שלוש נקודות, בלי כיול. זה מכוון. הראו את שני סרגלי הקריאה: המתח הגולמי תמיד חיובי, ומתח השמע הוא <b>הסטייה ממנו</b>. בנקודת המרכז סטייה אפסית ← שמע אפס. אם תשאירו "100% במרכז" התלמיד יסיק שיש DC בשמע.',
  body:`${map('det')}
<div class="simwrap" data-sim="f2v" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="map" width="1500" height="330"></canvas></div>
      <div class="plotbox tight"><canvas data-c="wave" width="1500" height="250"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <p class="plotcap sm"><b>בחרו נקודת תדר:</b></p>
      <div class="chips">
        <button class="chip" type="button" data-pt="0" aria-pressed="false">−Δf</button>
        <button class="chip" type="button" data-pt="1" aria-pressed="true">מרכז</button>
        <button class="chip" type="button" data-pt="2" aria-pressed="false">+Δf</button>
      </div>
      <div class="ro">
        <div><small>תדר</small><b data-o="pt">במרכז</b></div>
        <div class="hl"><small>גולמי · רכיב DC בדוגמה</small><b data-o="vol">2.00 V</b></div>
        <div class="ok"><small>שמע</small><b data-o="aud">0.00 V</b></div>
      </div>
      <p class="hint">ההמחשה <b>איכותית</b>: הקיטוב והקנה תלויים במימוש ובכיול.</p>
    </div>
  </div>
</div>
<div class="caveat">
  <span class="cv-lab">הבחנה</span>
  <p>המתח <b>הגולמי</b> יושב על רכיב קבוע (V₀). <b>השמע</b> הוא רק השינוי סביבו: במרכז הסטייה אפסית, ולכן מתח השמע ≈ 0. אין כאן "100%" — אין סקאלה מחייבת.</p>
</div>`
});

/* ---------------- 24 ---------------- */
R.push({
  n:24, pr:'בינוני',
  find:'הנוסחאות מופיעות לפני בניית עקומת התהודה; מובטח "אותו שמע בדיוק".',
  fix:'הגרף (שני מדרונות על אותה עקומה) מגיע לפני סימני הכיוון, והוסר ההבטחה ל"אותו שמע בדיוק" — יש תלות בעיוות ובקיטוב.',
  tk:'כיוון השיפוע קובע אם מתח המוצא עולה או יורד עם התדר.',
  body:`${map('det')}
<div class="simwrap" data-sim="twoslope" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="sl" width="1600" height="400"></canvas></div></div>
  <div class="gtcol" style="flex-basis:320px;width:320px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>שיא התהודה · f₀</label><output data-o="f0">12.40 MHz</output></div>
        <input type="range" data-k="f0" min="9.4" max="13.4" step="0.05" value="12.4"></div>
      <div class="ro">
        <div><small>נקודת עבודה</small><b data-o="side">מעל f₀</b></div>
        <div class="hl"><small>סימן השיפוע</small><b data-o="sign">חיובי ↑</b></div>
      </div>
      <p class="status" data-o="st">שיפוע עולה: תדר עולה ← משרעת עולה</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
      <p class="hint">הזיזו את <b>f₀</b> לצד השני של <bdi dir="ltr">10.7</bdi> — הסימן מתהפך לנגד עיניכם.</p>
    </div>
  </div>
</div>
<div class="g2">
  <div class="card5 ok">
    <h3>שיפוע עולה</h3>
    <p>תדר עולה ← משרעת עולה ← מתח מוצא עולה.</p>
    <div class="fxb sm">\\[f\\uparrow \\Rightarrow V\\uparrow\\]</div>
  </div>
  <div class="card5 warnbox">
    <h3>שיפוע יורד</h3>
    <p>תדר עולה ← משרעת יורדת ← מתח מוצא יורד.</p>
    <div class="fxb sm">\\[f\\uparrow \\Rightarrow V\\downarrow\\]</div>
  </div>
</div>
<div class="caveat">
  <span class="cv-lab">לזכור</span>
  <p>שני הכיוונים מעבירים את המידע, אבל <b>הקיטוב מתהפך</b>. לא "אותו שמע בדיוק": יש תלות בעיוות ובנקודת העבודה. לכן בודקים קיטוב לפני שמסיקים שיש תקלה.</p>
</div>`
});

/* ---------------- 25 (מאוחד: 24+25+26+27+28+29+30) ---------------- */
R.push({
  n:25, pr:'קריטי',
  find:'שבעה שקפים פיזרו תהליך אחד: הכותרת "מסנן תהודה הוא כבר גלאי" שגויה כפשוטה, והשלבים הופרדו לשלושה שקפים.',
  fix:'אוחדו לשקף אחד עם שלושה שלבים מסונכרנים: עקומת תהודה, גלאי מעטפת, והסרת DC עם שני גרפים. נוספה המחשת שלושת מצבי נקודת העבודה, שיפוע חיובי/שלילי, ותיבת הסבר גלויה.',
  title:'איך גלאי שיפוע הופך שינויי תדר לאות שמע?',
  tk:'גלאי שיפוע ממיר שינויי תדר לשינויי משרעת, גלאי מעטפת ממיר אותם לשינויי מתח, ולאחר הסרת DC מתקבל אות השמע.',
  note:'שלושה שלבים, שלושה גרפים. שלב 1: הזיזו את נקודת העבודה — על השיא אין שיפוע ולכן אין גילוי; על המדרון ההמרה כמעט ליניארית; מחוץ לתחום היא לא ליניארית ומעוותת. שלב 2: המעטפת עוקבת אחרי המשרעת. שלב 3: שני גרפים — לפני ואחרי הסרת DC. הדגישו: ההסרה לא משנה את הצורה, רק את רמת הבסיס.',
  body:`<div class="sl3" data-sim="slope3">
  <p class="sl3-model">גלאי שיפוע חד־צדדי — מודל לימודי. ההמרה ליניארית בקירוב רק בסביבת נקודת העבודה, ולא בכל טווח המחוון.</p>
  <div class="sl3-plots">
    <div class="sl3-p"><canvas data-c="slR" width="1500" height="330"></canvas></div>
    <div class="sl3-p"><canvas data-c="slE" width="1500" height="330"></canvas></div>
    <div class="sl3-p"><canvas data-c="slD" width="1500" height="330"></canvas></div>
  </div>
  <div class="sl3-side">
    <div class="rfctl">
      <div class="ctl sm"><div><label>חדות המעגל · Q</label><output data-o="det">6</output></div>
        <input type="range" data-k="det" min="2" max="12" step="1" value="6"></div>
      <div class="ctl sm"><div><label>נקודת העבודה (<bdi dir="ltr">+150</bdi> = שיא)</label><output data-o="pos">+40 kHz</output></div>
        <input type="range" data-k="pos" min="-60" max="200" step="10" value="40"></div>
      <p class="status" data-o="st">על השיפוע</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="sl3-teach">
      <p>מעגל התהודה אינו משחזר את השמע בעצמו — הוא ממיר שינויי תדר לשינויי משרעת. גלאי המעטפת מפיק מהם מתח, והסרת ה־DC משאירה אות סביב אפס.</p>
      <p class="sl3-dc">ביציאת הגלאי המתח מורכב מחלק קבוע ומחלק משתנה. מסירים את הקבוע ונשאר אות השמע שמשתנה סביב אפס.</p>
    </div>
  </div>
</div>`
});

/* ---------------- 32 ---------------- */
R.push({
  n:32, pr:'גבוהה',
  find:'נעילה מוגדרת באמצעות שוויון תדרים בלבד, במקום באמצעות מופע.',
  fix:'נוסף מחוון הפרש מופע נפרד לצד מחוון הפרש התדר, והודגם מצב "תדר זהה, מופע שונה" — עדיין ללא נעילה. ההגדרה עודכנה לנעילת מופע.',
  tk:'נעילה = גם תדר שווה וגם מופע מקובע. תדר שווה לבדו אינו נעילה.',
  body:`${map('det')}
<div class="simwrap" data-sim="prelock" style="flex:1 1 0">
  <div class="simcol"><div class="plotbox tight"><canvas data-c="pr" width="1600" height="400"></canvas></div></div>
  <div class="gtcol" style="flex-basis:315px;width:315px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>הפרש תדר</label><output data-o="df">9%</output></div>
        <input type="range" data-k="df" min="0" max="2" step="0.02" value="0.9"></div>
      <div class="ctl sm"><div><label>הפרש מופע · Δφ</label><output data-o="phi">0°</output></div>
        <input type="range" data-k="phi" min="0" max="180" step="5" value="0"></div>
      <p class="status" data-o="st">התדרים שונים</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
      <p class="hint"><b>הניסוי:</b> אפסו את הפרש התדר, ואז הזיזו את <b>המופע</b>. התדרים שווים — ועדיין אין נעילה.</p>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>הגדרה</h3>
      <p style="font-size:18.5px"><b>נעילה</b> = תדר שווה <b>וגם</b> הפרש מופע קבוע.</p>
      <p style="font-size:18.5px">המשווה מודד <b>Δφ</b>; הוא אינו מודד תדר.</p>
    </div>
  </div>
</div>
<div class="mdl">מודל: שתי סינוסואידות · Δφ מוצג במעלות · נעילה מוגדרת על ידי מופע</div>`
});

/* ---------------- 33 ---------------- */
R.push({
  n:33, pr:'גבוהה',
  find:'פלט משווה מופע "87%" עבור 60° אינו מוסבר ומרמז על יחס שרירותי.',
  fix:'הוצג מודל מפורש v_d = K_pd·sin(Δφ) עם K_pd ב־V/rad ו־Δφ ברדיאנים; הערך המחושב ניתן לשחזור. הוסר אחוז חסר־הסבר (נשאר רק כערך יחסי מסומן).',
  tk:'המשווה מייצר אות пропорциональ ל־sin(Δφ) — וזה אות השגיאה.',
  body:`${map('det')}
<div class="simwrap" data-sim="phasedet" style="flex:1 1 0">
  <div class="simcol">
    <div class="plotstack">
      <div class="plotbox tight"><canvas data-c="in" width="1500" height="290"></canvas></div>
      <div class="plotbox tight"><canvas data-c="out" width="1500" height="290"></canvas></div>
    </div>
  </div>
  <div class="gtcol" style="flex-basis:325px;width:325px">
    <div class="ctrl tight">
      <div class="ctl sm"><div><label>הפרש מופע · Δφ</label><output data-o="phi">60° / 1.05 rad</output></div>
        <input type="range" data-k="phi" min="0" max="180" step="5" value="60"></div>
      <div class="ro">
        <div class="hl"><small>v_d מחושב</small><b data-o="vd">1.73 V</b></div>
        <div><small>יחסית למקסימום</small><b data-o="vdrel">87%</b></div>
      </div>
      <p class="hint"><b>שחזרו בעצמכם:</b> <bdi dir="ltr">2.0 · sin 60° = 1.73 V</bdi>. אין כאן יחס שרירותי.</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="card5" style="flex:0 0 auto">
      <h3>המודל המוצהר</h3>
      <div data-unit="V" class="fxb sm">\\[v_d=K_{pd}\\sin\\Delta\\varphi\\]</div>
      <div class="pkey">
        <div class="r"><b>Δφ</b><span>הפרש מופע</span><em>rad</em></div>
        <div class="r"><b>K<sub>pd</sub></b><span>רגישות המשווה = 2.0</span><em>V/rad</em></div>
        <div class="r"><b>v<sub>d</sub></b><span>מתח השגיאה</span><em>V</em></div>
      </div>
      <p style="font-size:17.5px">בתחום קטן: <bdi dir="ltr">sin Δφ ≈ Δφ</bdi> ← קשר ליניארי. בשני הקצוות (0°, 180°) הפלט מתאפס.</p>
    </div>
  </div>
</div>
<div class="caveat">
  <span class="cv-lab">תחום תוקף</span>
  <p>זהו מודל של משווה <b>כפלי</b> אידאלי. משווה XOR או משווה דיגיטלי יתנו צורת גל וסימן אחרים — לכן תמיד מגדירים את המודל לפני שמציבים מספר.</p>
</div>`
});
})();
