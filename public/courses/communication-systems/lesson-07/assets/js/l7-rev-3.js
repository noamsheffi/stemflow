/* =========================================================
   שיעור 07 · v2 — תיקוני השקפים ששרדו אחרי האיחוד
   PLL (36–38) · AFC (43) · AM מול FM (45) · תרגול (48,49,52) · משוב (31)
   ========================================================= */
(function(){
const R = window.L7REV = window.L7REV || [];
const map = (on) => `<div class="rcmini">
  <span style="--rc:#0f172a" class="${on==='ant'?'on':''}">אנטנה</span><i>‹</i>
  <span style="--rc:#0891b2" class="${on==='rf'?'on':''}">RF</span><i>‹</i>
  <span style="--rc:#7c3aed" class="${on==='mix'?'on':''}">ערבל</span><i>‹</i>
  <span style="--rc:#059669" class="${on==='if'?'on':''}">IF</span><i>‹</i>
  <span style="--rc:#d97706" class="${on==='lim'?'on':''}">מגבל</span><i>‹</i>
  <span style="--rc:#db2777" class="${on==='det'?'on':''}">גלאי</span>
</div>`;

/* ---------------- 31 · מהי מערכת משוב? ---------------- */
R.push({
  n:31, pr:'בינוני',
  find:'שקף המשוב הציג אנלוגיה בלבד, בלי משפט מעבר מגלאי השיפוע ובלי טקסט שאפשר ללמד ממנו.',
  fix:'נוסף משפט מעבר גלוי, הסבר מנחה על עיקרון המשוב, ומשפט מסכם. הובהר שהגרף הוא המחשה כללית ולא מודל PLL.',
  tk:'משוב = מדידת שגיאה ← ביצוע תיקון ← מדידה חוזרת.',
  note:'זהו שקף מעבר לעקרון חדש. הקריאו את משפט המעבר, ואז הדגימו: מודדים, מתקנים, מודדים שוב. הדגישו שהגרף כללי — לא מודל של PLL.',
  body:`<div class="fb31" data-sim="feedback">
  <p class="fb31-bridge">עד עכשיו למדנו כיצד גלאי שיפוע משחזר את המידע מאות FM. ראינו גם שלשיטה הזאת יש מגבלות. כעת נכיר עיקרון חדש — משוב — שיעזור לנו להבין כיצד פועל גלאי FM המבוסס על PLL.</p>
  <div class="fb31-body">
    <div class="plotbox tight"><canvas data-c="fb" width="1600" height="470"></canvas></div>
    <div class="fb31-side">
      <div class="rfctl">
        <div class="ctl sm"><div><label>עוצמת התיקון</label><output data-o="gain">0.60</output></div>
          <input type="range" data-k="gain" min="1" max="14" value="6"></div>
        <div class="ro"><div class="hl"><small>זמן התכנסות</small><b data-o="tc">0.76 s</b></div></div>
        <button class="btn5 ghost" data-reset type="button">איפוס</button>
      </div>
      <p class="fb31-guide">מערכת משוב מודדת את ההפרש בין המצב הרצוי למצב בפועל. בהתאם להפרש היא מבצעת תיקון, מודדת שוב וחוזרת על התהליך. כך ניתן לצמצם את השגיאה לאורך זמן.</p>
      <p class="fb31-mod">הגרף הוא המחשה כללית של משוב — לא מודל מדויק של פעולת PLL.</p>
    </div>
  </div>
</div>`
});

/* ---------------- 36 · איך בנוי גלאי PLL? ---------------- */
R.push({
  n:36, pr:'קריטי',
  find:'חמישה שקפים תיארו את אותם רכיבים בנפרד, בלי תרשים אחד שאפשר להצביע עליו ובלי טקסט ללמד ממנו.',
  fix:'אוחדו לשקף אחד עם תרשים חוג סגור גדול, לחיצה על כל רכיב שמדגישה את מסלול האות ומציגה הסבר קריא, ומעבר מסודר בין הרכיבים.',
  title:'איך בנוי גלאי PLL?',
  tk:'גלאי PLL משתמש במשוב כדי להתאים את תדר ה־VCO לתדר אות ה־FM הנכנס.',
  note:'עברו על התרשים עם המצביע לפי סדר הפעולה: כניסה → משווה → LPF → VCO → חזרה. בכל לחיצה קראו את ההסבר שעל המסך. הדגישו: השמע יוצא ממתח הבקרה, לא ממשווה המופע.',
  body:`<div class="pllm2">
  <div class="pllm2-map">
    <div class="pllbox in">אות FM<small>כניסה</small></div>
    <div class="pllflow">→</div>
    <div class="pllbox pd">משווה מופע<small>שגיאה</small></div>
    <div class="pllflow">→</div>
    <div class="pllbox lpf">מסנן LPF<small>מתח בקרה</small></div>
    <div class="pllflow">→</div>
    <div class="pllbox vco">מתנד VCO<small>תדר לפי מתח</small></div>
    <div class="pllflow">→</div>
    <div class="pllbox out">מוצא השמע<small>אחרי הסרת DC</small></div>
  </div>
  <div class="pllm2-fb">↩ משוב · מוצא ה־VCO חוזר לכניסה השנייה של משווה המופע</div>
  <div class="pllm2-legend">
    <div><b>משווה מופע</b><p>משווה את מופע אות הכניסה למופע אות ה־VCO. כאשר קיים הפרש ביניהם, מתקבל אות שגיאה המשמש לתיקון.</p></div>
    <div><b>מסנן LPF</b><p>מסנן רכיבים מהירים ולא רצויים מאות השגיאה ומייצר מתח בקרה מתאים להפעלת ה־VCO.</p></div>
    <div><b>מתנד VCO</b><p>מתנד שהתדר שלו נקבע באמצעות מתח הבקרה. כאשר מתח הבקרה משתנה, גם תדר המתנד משתנה.</p></div>
    <div><b>משוב</b><p>אות ה־VCO חוזר למשווה המופע. כך המערכת בודקת כל הזמן את ההתאמה ומתקנת את תדר המתנד.</p></div>
  </div>
</div>`});

/* ---------------- 37 · איך PLL מגיע לנעילה? ---------------- */
R.push({
  n:37, pr:'גבוהה',
  find:'הבאנר "הדמיה סכמטית" היה פריט grid שלישי בתוך .lk3, ולכן תפס את עמודת הגרפים ודחק אותם ל-300px. בנוסף, שלושת המצבים הציגו כמעט אותה התכנסות, ומתח הבקרה לא נגזר מתדר ה-VCO.',
  fix:'הפריסה שוכתבה לשתי שכבות מפורשות (באנר בשורה משלו + גוף בשתי עמודות 73/27). ההדמיה נבנתה מחדש כמודל זמן רציף: תדר ה-VCO נגזר ממתח הבקרה, והפרש המופע הוא אינטגרל של שגיאת התדר — ולכן שונה מהותית בכל מצב.',
  title:'איך PLL מגיע לנעילה?',
  tk:'במצב נעילה, המשוב גורם ל־VCO לעקוב אחר שינויי התדר של אות הכניסה.',
  note:'שלושה מצבים, ולא שלוש וריאציות של אותו גרף. במצב 1 הפרש המופע גדל כל הזמן והגלים מחליקים זה על זה. במצב 2 השגיאה דועכת בהדרגה — אין קפיצה לנעילה. במצב 3 הפרש המופע קבוע, אבל אינו אפס: הקווים לא מתלכדים. הדגישו שבנעילה מתח הבקרה ממשיך לנוע אם הכניסה מאופננת FM — קביעות מתח אינה תנאי לנעילה.',
  body:`<div class="lk3" data-sim="lock3">

  <p class="lk3-note">הדמיה סכמטית של התכנסות לנעילה — לא סימולציה של PLL פיזיקלי.</p>

  <div class="lk3-body">
    <div class="lk3-plots">
      <div class="lk3-p"><canvas data-c="lkA" width="1400" height="340"></canvas></div>
      <div class="lk3-p"><canvas data-c="lkB" width="1400" height="300"></canvas></div>
    </div>

    <div class="lk3-side">
      <div class="rfctl">
        <p class="plotcap sm"><b>מצב</b></p>
        <div class="chips col">
          <button class="chip" type="button" data-lk="0" aria-pressed="true">לפני נעילה</button>
          <button class="chip" type="button" data-lk="1" aria-pressed="false">תהליך התאמה</button>
          <button class="chip" type="button" data-lk="2" aria-pressed="false">נעילה</button>
        </div>
        <div class="ro">
          <div><small>שגיאת תדר</small><b data-o="fe">—</b></div>
          <div class="hl"><small>הפרש מופע</small><b data-o="ph">—</b></div>
        </div>
        <button class="btn5 ghost" data-reset type="button">איפוס</button>
      </div>

      <p class="lk3-guide" data-o="st">תדר המתנד המקומי שונה מתדר הכניסה. משווה המופע מזהה הפרש משתנה, ומערכת המשוב מתחילה לתקן את מתח הבקרה.</p>
    </div>
  </div>

</div>`
});

/* ---------------- 38 · איך PLL משחזר את אות השמע? ---------------- */
R.push({
  n:38, pr:'קריטי',
  find:'הנוסחה v_out=Δf/K_VCO הוצגה כשוויון כללי, בלי לומר שהשמע יוצא ממתח הבקרה ולא מהמשווה.',
  fix:'הוחלפה בשלושה גרפים מסונכרנים — תדר הכניסה, מתח הבקרה ואות השמע — עם מחוון אחד שמראה שהשרשרת הפיזיקלית נכונה. הנוסחה הוסרה.',
  title:'איך PLL משחזר את אות השמע?',
  tk:'בתנאי נעילה ובתחום הפעולה — מתח הבקרה משחזר את השמע. שינוי תדר שמופרע מדי לא ישוחזר ללא עיוות.',
  note:'זה השקף המרכזי של הפרק. הזיזו את המחוון וראו ששלושת הגרפים משתנים יחד — זה אותו מידע בשלוש צורות. הדגישו: השמע אינו יוצא ממשווה המופע; הוא יוצא ממתח הבקרה, אחרי הסרת הרכיב הקבוע. והשחזור מותנה בכך שהחוג נעול ומצליח לעקוב.',
  body:`<div class="pa3" data-sim="pllaudio">
  <div class="pa3-plots">
    <div class="pa3-p"><canvas data-c="paF" width="1500" height="300"></canvas></div>
    <div class="pa3-p"><canvas data-c="paC" width="1500" height="300"></canvas></div>
    <div class="pa3-p"><canvas data-c="paA" width="1500" height="300"></canvas></div>
  </div>
  <div class="pa3-side">
    <div class="rfctl">
      <div class="ctl sm"><div><label>עוצמת שינויי התדר</label><output data-o="dev">55%</output></div>
        <input type="range" data-k="dev" min="0" max="100" value="55"></div>
      <p class="status" data-o="st">שלושת הגרפים משתנים יחד</p>
      <button class="btn5 ghost" data-reset type="button">איפוס</button>
    </div>
    <div class="pa3-teach">
      <p><b>מהתדר למתח:</b> כאשר ה־PLL נעול, מתח הבקרה משתנה כדי לגרום ל־VCO לעקוב אחרי שינויי התדר — <b>בתנאי נעילה ובתחום הפעולה המתאים</b>.</p>
      <p><b>הסרת DC:</b> מתח הבקרה כולל רכיב קבוע (DC) ורכיב משתנה. השניים נפרדים: לאחר הסרת הקבוע נשאר הרכיב המשתנה — הוא השמע.</p>
    </div>
  </div>
</div>`
});

/* ---------------- 43 · AFC — תיקון תדר אוטומטי ---------------- */
R.push({
  n:43, pr:'גבוהה',
  find:'ארבעה שקפים על AFC — למה, איך רואים, מה עושה, והשוואה ל-PLL — בלי תרשים אחד שמראה את המשוב ובלי טיפול נכון בסימן התיקון.',
  fix:'אוחדו לשקף אחד: תרשים AFC בתוך מסלול המקלט, מחוון סחיפה יחיד, המחשת זיהוי ותיקון, ומשפט הבחנה מ־PLL. הודגש שהתיקון הפוך לסחיפה.',
  title:'AFC — תיקון תדר אוטומטי',
  tk:'PLL משמש כאן לגילוי אות FM ולשחזור המידע. AFC משמש לתיקון סטייה בתדר הכוונון של המקלט.',
  note:'הראו קודם את הסטייה: סמן האדום זז מהמרכז. אחר כך הפעילו את AFC וראו אותו חוזר. הדגישו את הכיוון: בהזרקה גבוהה עלייה ב-LO מעלה את ה-IF, ולכן התיקון חייב להיות הפוך לסחיפה. AFC איטי בכוונה — אחרת היה מתקן את השמע כאילו היה סחיפה.',
  body:`<div class="afc2" data-sim="afc2">
  <div class="afc2-map">
    <div class="rc" style="--rc:#0891b2">מסנן RF</div><i>←</i>
    <div class="rc" style="--rc:#7c3aed">ערבל</div><i>←</i>
    <div class="rc" style="--rc:#059669">מסנן IF</div><i>←</i>
    <div class="rc" style="--rc:#db2777">גלאי</div>
    <div class="afc2-lo"><div class="rc hot" style="--rc:#7c3aed">LO</div>
      <div class="afc2-fb">AFC ↩</div></div>
  </div>
  <div class="afc2-body">
    <div class="afc2-plot"><canvas data-c="afcv" width="1500" height="380"></canvas></div>
    <div class="afc2-side">
      <p class="afc2-lead">אם תדר המתנד המקומי משתנה, תדר הביניים עלול לסטות מהערך הרצוי ולפגוע בקליטה. מערכת AFC מזהה את הסטייה ומתקנת אוטומטית את תדר המתנד המקומי. <b>AFC משנה כוונון — הוא אינו מפענח את אות השמע.</b></p>
      <div class="rfctl">
        <div class="ctl sm"><div><label>סטיית תדר המתנד המקומי</label><output data-o="drift">+80 kHz</output></div>
          <input type="range" data-k="drift" min="-220" max="220" step="10" value="80"></div>
        <div class="togglerow"><input type="checkbox" data-k="on" checked> AFC פעיל</div>
        <div class="ro">
          <div class="hl"><small>סטייה שנותרה (לאחר התייצבות)</small><b data-o="res">0 kHz</b></div>
          <div><small>LO לאחר תיקון</small><b data-o="lo" dir="ltr">108.720 MHz</b></div>
        </div>
        <p class="status" data-o="st">AFC זיהה ותיקן</p>
        <button class="btn5 ghost" data-reset type="button">איפוס</button>
      </div>
      <div class="afc2-model">
        <span>מודל אידיאלי</span>
        <p>AFC מבטל את שגיאת הכוונון לאחר התייצבות. אין כאן דינמיקת זמן — התיקון מוצג כמיידי.</p>
      </div>
    </div>
  </div>
</div>`
});

/* ---------------- 45 · AM מול FM — מה ההבדל? ---------------- */
R.push({
  n:45, pr:'קריטי',
  find:'שלושת שקפי ההשוואה ערבבו תנאי שידור, מחלקות מגבר ותקני ערוץ, והציגו טענות גורפות על נצילות וטווח.',
  fix:'אוחדו לטבלה אחת בארבעה פרמטרים — תחומי תדר, טווח, הספק ונצילות — עם תנאים מפורשים בכל שורה. הוסרו הטענות הגורפות.',
  title:'AM מול FM — מה ההבדל?',
  tk:'ב־AM המידע מועבר בשינוי המשרעת, וב־FM בשינוי התדר. לכל שיטה מאפיינים ויתרונות שונים.',
  note:'אל תדרגו "מי טוב יותר". בכל שורה יש תנאי — הדגישו אותו. את ההבחנה בין הספק משדר להספק אות מאופנן אמרו בקול. בנצילות: אל תגידו ש-FM תמיד נציל יותר; זו תכונה של מגבר ההספק והאפנון גם יחד.',
  body:`<div class="amfm45">
  <table class="amfm-t">
    <thead><tr><th>פרמטר</th><th>AM</th><th>FM</th><th>התנאי</th></tr></thead>
    <tbody>
      <tr><td>תחומי תדר</td>
        <td>תחום שידור אופייני נמוך: <bdi dir="ltr">0.5–1.6 MHz</bdi></td>
        <td>תחום <bdi dir="ltr">VHF</bdi>: <bdi dir="ltr">88–108 MHz</bdi></td>
        <td>אלה תחומי שידור מקובלים — לא מגבלה של שיטת האפנון</td></tr>
      <tr><td>טווח</td>
        <td>גל קרקע; טווח גדול יותר באותם תנאים</td>
        <td>בעיקר קו ראייה; טווח קטן יותר</td>
        <td>תלוי בתדר, בהספק, באנטנה ובתנאי ההתפשטות</td></tr>
      <tr><td>הספק</td>
        <td>הספק נושא קבוע ועוד הספק צד</td>
        <td>הספק קבוע — גם כשאין מידע</td>
        <td>יש להבחין בין הספק המשדר להספק האות המאופנן</td></tr>
      <tr><td>נצילות</td>
        <td>תלויה במקדם האפנון; נמוכה בסף</td>
        <td>תלויה במחלקת מגבר ההספק</td>
        <td>נצילות האפנון אינה נצילות מגבר ההספק</td></tr>
    </tbody>
  </table>
</div>`
});

/* ---------------- 48 · תרגיל תדר מתנד מקומי ---------------- */
R.push({
  n:48, pr:'גבוהה',
  find:'הפתרון היה גלוי מדי ולא הפריד בין נתונים, נוסחה, הצבה ותוצאה.',
  fix:'נבנה תרגיל בשני שלבים: שאלה בלבד, ואחריה חשיפת פתרון מדורג — נוסחה, הצבה, תוצאה. כפתור איפוס מסתיר ומחזיר להתחלה.',
  tk:'בהזרקה גבוהה: מחברים את תדר הביניים לתחנה.',
  note:'אל תחשפו את הפתרון לפני שהכיתה ניסתה. בקשו מהסטודנט לומר קודם איזו נוסחה נכונה — חיבור או חיסור — ורק אז חשפו.',
  body:`<div class="ex" data-steps>
  <p class="ex-q">מקלט FM מכוון לתחנה בתדר <bdi dir="ltr">101.3 MHz</bdi>. תדר הביניים הוא <bdi dir="ltr">10.7 MHz</bdi>. המקלט פועל בהזרקה גבוהה. חשב את תדר המתנד המקומי.</p>
  <div class="ex-given">
    <div><small>תדר התחנה</small><b dir="ltr">101.3 MHz</b></div>
    <div><small>תדר ביניים</small><b dir="ltr">10.7 MHz</b></div>
    <div><small>סוג הזרקה</small><b>גבוהה</b></div>
  </div>
  <div class="step"><b>שלב 1 · הנוסחה</b><div class="ex-f">\\[f_{\\mathrm{LO}}=f_{\\mathrm{RF}}+f_{\\mathrm{IF}}\\]</div></div>
  <div class="step"><b>שלב 2 · הצבה</b><div class="ex-f">\\[f_{\\mathrm{LO}}=101.3\\,\\mathrm{MHz}+10.7\\,\\mathrm{MHz}\\]</div></div>
  <div class="step"><b>שלב 3 · תוצאה</b><div class="ex-f">\\[\\boxed{f_{\\mathrm{LO}}=112.0\\ \\mathrm{MHz}}\\]</div>
    <p class="ex-why">בהזרקה גבוהה, תדר המתנד המקומי גבוה מתדר התחנה בגודל תדר הביניים.</p></div>
  <div class="ex-nav">
    <button class="btn5" type="button" data-next>חשיפת פתרון</button>
    <button class="chip rst" type="button" data-sreset>איפוס</button>
  </div>
</div>`
});

/* ---------------- 49 · תרגיל תדר בבואה ---------------- */
R.push({
  n:49, pr:'גבוהה',
  find:'התרגיל לא הפריד שלבים ולא הבהיר שתדר בבואה מחוץ לתחום השידור עדיין עלול להפריע.',
  fix:'נבנה תרגיל בארבעה שלבים עם חשיפה מדורגת, ותוקן הניסוח: הבבואה עלולה להפריע גם מחוץ ל־88–108 MHz אם יש בה אות בעוצמה מספקת.',
  tk:'תדר בבואה: f_LO + f_IF — וגם מחוץ לתחום השידור הוא עלול להפריע.',
  note:'התיקון החשוב כאן הוא מדעי: אל תגידו שתדר הבבואה בטוח כי הוא מחוץ לתחום. הוא מסוכן אם יש בו אות חזק. מסנן המבוא הוא שמדכא אותו.',
  body:`<div class="ex" data-steps>
  <p class="ex-cont">בהמשך לתרגיל הקודם — אותו מקלט, אותה תחנה. עכשיו מחפשים את התדר הנוסף שנופל על אותו <bdi dir="ltr">IF</bdi>.</p>
  <p class="ex-q">מקלט FM מכוון לתחנה בתדר <bdi dir="ltr">101.3 MHz</bdi>. תדר הביניים <bdi dir="ltr">10.7 MHz</bdi>, הזרקה גבוהה. חשב את תדר הבבואה והסבר האם הוא עלול לגרום להפרעה.</p>
  <div class="ex-given">
    <div><small>תדר התחנה</small><b dir="ltr">101.3 MHz</b></div>
    <div><small>תדר ביניים</small><b dir="ltr">10.7 MHz</b></div>
    <div><small>סוג הזרקה</small><b>גבוהה</b></div>
  </div>
  <div class="step"><b>שלב 1 · תדר המתנד</b><div class="ex-f">\\[f_{\\mathrm{LO}}=101.3+10.7=112.0\\ \\mathrm{MHz}\\]</div></div>
  <div class="step"><b>שלב 2 · הנוסחה לבבואה</b><div class="ex-f">\\[f_{\\mathrm{IM}}=f_{\\mathrm{RF}}+2f_{\\mathrm{IF}}\\]</div></div>
  <div class="step"><b>שלב 3 · הצבה</b><div class="ex-f">\\[f_{\\mathrm{IM}}=101.3+2\\times10.7\\]</div></div>
  <div class="step"><b>שלב 4 · תוצאה</b><div class="ex-f">\\[\\boxed{f_{\\mathrm{IM}}=122.7\\ \\mathrm{MHz}}\\]</div>
    <p class="ex-why">גם אות בתדר <bdi dir="ltr">122.7 MHz</bdi> יוצר לאחר הערבול הפרש של <bdi dir="ltr">10.7 MHz</bdi> — אותו <bdi dir="ltr">IF</bdi> בדיוק. לכן אם אות כזה מגיע למקלט בעוצמה מספקת, הוא <b>עלול</b> לגרום להפרעה, גם מחוץ לתחום <bdi dir="ltr">88–108 MHz</bdi>. תפקידו של מסנן ה־RF בדרגת המבוא הוא לדכא אותו לפני הערבול — וזה גם מה שמסביר מדוע המסנן הזה קיים למרות שהוא רחב.</p></div>
  <div class="ex-nav">
    <button class="btn5" type="button" data-next>חשיפת פתרון</button>
    <button class="chip rst" type="button" data-sreset>איפוס</button>
  </div>
</div>`
});

/* ---------------- 52 · איזה רכיב פותר איזו בעיה? ---------------- */
R.push({
  n:52, pr:'בינוני',
  find:'שקף התרגול המסכם תיאר את הרכיבים בלי לקשרם לבעיה שכל אחד מהם פותר.',
  fix:'התרגיל הומר להתאמה בין ארבע בעיות לארבעה רכיבים, עם משוב הסברי לכל התאמה.',
  tk:'כל רכיב במקלט קיים מפני שהוא פותר בעיה מוגדרת — ולא מפני שהוא ברשימה.',
  note:'אל תתנו את התשובה. בקשו מהסטודנט לנמק לפי מה נשמר ומה נפגע בכל מקרה.',
  body:`${map('det')}
<div class="match52">
  <div class="m52row"><span class="m52q">כמה תחנות מגיעות לאנטנה יחד, ואין דרך להפריד ביניהן.</span><b class="m52a">מסנן RF</b></div>
  <div class="m52row"><span class="m52q">כל תחנה מגיעה בתדר אחר, ונדרש מסנן וגלאי שונים לכל אחת.</span><b class="m52a">ערבול ו־IF</b></div>
  <div class="m52row"><span class="m52q">המשרעת משתנה בדרך ומעוותת את האות לפני הגילוי.</span><b class="m52a">מגבל</b></div>
  <div class="m52row"><span class="m52q">המידע יושב בשינויי התדר, ולא ניתן לשמוע אותו כך.</span><b class="m52a">גלאי</b></div>
</div>`
});

})();
