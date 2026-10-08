"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import katex from "katex";
import styles from "./lesson-05-player.module.css";
import playerStyles from "./lesson-04-player.module.css";

type DeckSlide = { chapter: string; title: string; minutes: number; takeaway: string; notes: string[]; content: React.ReactNode };
const chapters = ["פתיחה וחזרה", "ארכיטקטורת מקלט", "המרת תדר ובבואה", "גלאי מעטפת ו־AGC", "תרגול וסיכום"];
const formula = (tex: string) => <div dir="ltr" className="sl-fx" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: false, output: "htmlAndMathml" }) }} />;
const card = (title: string, children: React.ReactNode) => <article className="sl-card"><div className="sl-lab">{title}</div>{children}</article>;
const data: DeckSlide[] = [
  { chapter: chapters[0], title: "איך הרדיו בוחר תחנה אחת?", minutes: 3, takeaway: "המקלט צריך לבחור תחנה, לדחות שכנות ולשחזר את השמע.", notes: ["שאלו איך מכשיר רדיו בוחר תחנה מתוך אותות רבים.", "אספו שתיים או שלוש השערות לפני הצגת הפתרון.", "הבטיחו שנעקוב אחרי האות מהאנטנה ועד לרמקול."], content: <>{card("שאלת הפתיחה", <p className={styles.lead}>כשמסובבים את כפתור התחנות, מה משתנה בתוך המקלט כדי לבחור תחנה אחת?</p>)}<div className={styles.flow}><b>אנטנה</b><i>אותות רבים</i><b>מקלט</b><i>בחירה ושחזור</i><b>רמקול</b></div></> },
  { chapter: chapters[0], title: "מה מגיע לאנטנה?", minutes: 7, takeaway: "אות AM כולל נושא ופסי צד; פסי הצד נושאים את המידע.", notes: ["רעננו את מבנה אות AM משיעור 4.", "הצביעו על הנושא ועל שני פסי הצד.", "שאלו מה המקלט צריך לעשות לפני גילוי המעטפת."], content: <>{formula(String.raw`s(t)=A_c[1+m_a\cos(2\pi f_m t)]\cos(2\pi f_c t)`)}<div className={styles.three}>{card("נושא", <p>בתדר <bdi dir="ltr">f<sub>c</sub></bdi></p>)}{card("פס תחתון", <p><bdi dir="ltr">f<sub>c</sub> − f<sub>m</sub></bdi></p>)}{card("פס עליון", <p><bdi dir="ltr">f<sub>c</sub> + f<sub>m</sub></bdi></p>)}</div><p className={styles.note}>האנטנה קולטת תחנות רבות בו־זמנית, לא רק את התחנה הרצויה.</p></> },
  { chapter: chapters[1], title: "מקלט ישיר TRF: מסנן שעוקב אחרי התחנה", minutes: 8, takeaway: "במקלט TRF צריך לכוון את דרגות הסינון לתדר התחנה הנבחרת.", notes: ["הגדירו TRF: הגברת תדר הרדיו וסינון ישיר סביב התחנה.", "הצביעו על כך שהמסנן צריך להשתנות יחד עם כפתור התחנות.", "אל תקבעו שמקלט כזה 'נכשל תמיד'; הציגו את אתגר הכוונון והסלקטיביות."], content: <>{card("מסלול האות", <div className={styles.flow}><b>אנטנה</b><i>←</i><b>מסנן ומגבר RF מתכוונן</b><i>←</i><b>גלאי</b><i>←</i><b>שמע</b></div>)}{formula(String.raw`BW=\frac{f_0}{Q}`)}<p>כאשר <bdi dir="ltr">Q</bdi> קבוע, רוחב הפס גדל יחד עם תדר התהודה <bdi dir="ltr">f₀</bdi>. שמירה על מסנן חד לאורך תחום תחנות רחב דורשת כוונון מדויק ומתואם.</p>{card("בדיקה בכיתה", <p><bdi dir="ltr">f₀=1.5 MHz, Q=50</bdi>. מהו <bdi dir="ltr">BW</bdi>?</p>)}<Reveal label="הצגת הפתרון לאחר ניסיון" steps={[<p><bdi dir="ltr">BW = 1,500,000 Hz ÷ 50 = 30,000 Hz = 30 kHz</bdi></p>]}/></> },
  { chapter: chapters[1], title: "סופר־הטרודיין: מסנן קבוע, תחנה משתנה", minutes: 5, takeaway: "ממירים כל תחנה לתדר ביניים קבוע ואז מסננים ומגבירים אותה.", notes: ["הציגו את הרעיון: מזיזים את התחנה אל מסנן קבוע במקום להזיז מסנן חד.", "במקלט AM טיפוסי בדוגמה נשתמש ב־IF של 455 kHz.", "ציינו שזה ערך מקובל בדוגמה, לא כלל לכל מקלט או תקן לכל תחום."], content: <>{card("הרעיון", <p className={styles.lead}>התחנה משתנה, אבל דרגת הסינון המרכזית נשארת מכוונת לאותו תדר ביניים.</p>)}{formula(String.raw`f_{IF}=455\;\mathrm{kHz}`)}<div className={styles.flow}><b>תחנה נבחרת</b><i>→ המרה</i><b>455 kHz</b><i>→ סינון חד</i></div></> },
  { chapter: chapters[1], title: "מפת המקלט: מה עושה כל דרגה?", minutes: 7, takeaway: "כל בלוק מכין את האות לשלב הבא עד שמחלצים שמע.", notes: ["עברו לאורך התרשים משמאל לימין.", "הגדירו RF, Mixer, LO ו־IF לפני שימוש בראשי התיבות.", "הציגו את AGC כחוג בקרה שנחזור אליו אחרי הגלאי."], content: <>{card("מסלול אות", <div className={styles.blockFlow}><b>אנטנה</b><b>מגבר RF</b><b>ערבל</b><b>מגבר IF</b><b>גלאי מעטפת</b><b>מגבר שמע</b><b>רמקול</b></div>)}<div className={styles.three}>{card("RF", <p>סינון גס והגברה בכניסה</p>)}{card("ערבל + LO", <p>יוצרים רכיבי סכום והפרש</p>)}{card("IF", <p>סינון והגברה סביב תדר קבוע</p>)}</div><p className={styles.note}>AGC מחזיר משוב לדרגות ההגברה כדי לייצב את עוצמת השמע.</p></> },
  { chapter: chapters[2], title: "איך הערבל ממיר תדר?", minutes: 8, takeaway: "כפל של שני סינוסים יוצר תדר סכום ותדר הפרש.", notes: ["תארו את הערבל כמכפיל אותות, לא כמסנן.", "הראו את זהות המכפלה במלואה.", "מסנן IF בוחר את רכיב ההפרש הרצוי."], content: <>{formula(String.raw`\cos(\alpha)\cos(\beta)=\frac{1}{2}[\cos(\alpha-\beta)+\cos(\alpha+\beta)]`)}<p>לערבל נכנסים אות התחנה <bdi dir="ltr">f<sub>RF</sub></bdi> והמתנד המקומי <bdi dir="ltr">f<sub>LO</sub></bdi>. ביציאה מופיעים סכום והפרש; מסנן ה־IF מעביר את ההפרש.</p>{formula(String.raw`f_{IF}=f_{LO}-f_{RF},\quad f_{LO}>f_{RF}`)}<p className={styles.note}>הנחת המערך: הזרקת LO מעל RF. קיימת גם הזרקה מתחת ל־RF, אך לא ננתח אותה כאן.</p></> },
  { chapter: chapters[2], title: "מכוונים את ה־LO יחד עם התחנה", minutes: 2, takeaway: "בהזרקה גבוהה LO נשאר גבוה מ־RF בהפרש IF קבוע.", notes: ["הגדירו כל תדר לפני השימוש: RF תחנה, LO מתנד, IF הפרש נבחר.", "השתמשו במחוון כדי להזיז את RF ולצפות ב־LO.", "שאלו: מה נשאר קבוע? תשובה: ההפרש IF."], content: <Tuner /> },
  { chapter: chapters[2], title: "תדר הבבואה: תחנה נוספת עם אותו IF", minutes: 5, takeaway: "אות משני צדי LO יכול ליצור אותו תדר הפרש ולחדור לאותו IF.", notes: ["ציירו את RF, LO ו־IM על ציר אחד.", "הראו שה־LO נמצא באמצע בין התחנה הרצויה לתדר הבבואה.", "הדגישו שמסנן IF לבדו לא מפריד ביניהם אחרי הערבל."], content: <>{formula(String.raw`f_{RF}=f_{LO}-f_{IF} \qquad f_{IM}=f_{LO}+f_{IF}`)}<div className={styles.axis}><span>RF רצוי</span><i></i><span>LO</span><i></i><span>בבואה</span></div>{formula(String.raw`f_{IM}=f_{RF}+2f_{IF} \quad (LO>RF)`)}<p>שניהם יוצרים הפרש <bdi dir="ltr">f<sub>IF</sub></bdi> מה־LO, ולכן שניהם עוברים דרך מסנן ה־IF.</p></> },
  { chapter: chapters[2], title: "תרגיל מודרך: מכוונים לתחנת 657 kHz", minutes: 25, takeaway: "חשבנו תחום LO, LO לתחנה ואת תדר הבבואה עם יחידות.", notes: ["תנו זמן לסטודנטים לכתוב כל נוסחה לפני הפתרון.", "אחדו יחידות לפני חיבור; כאן כל הערכים ב־kHz.", "בבדיקת הפרעה השוו לתדר הבבואה, לא לתדר התחנה הרצויה."], content: <>{card("נתונים", <p dir="ltr">RF = 540–1600 kHz · IF = 455 kHz · LO &gt; RF</p>)}{card("משימות", <ol><li>תחום תדרי LO</li><li>לתחנה <bdi dir="ltr">RF=657 kHz</bdi>, חשבו LO ו־IM</li><li>האם תחנה ב־<bdi dir="ltr">1567 kHz</bdi> תגרום להפרעת בבואה?</li></ol>)}<Reveal label="חשיפת פתרון לפי שלבים" steps={[<p><bdi dir="ltr">LOmin = 540 kHz + 455 kHz = 995 kHz</bdi><br/><bdi dir="ltr">LOmax = 1600 kHz + 455 kHz = 2055 kHz</bdi></p>, <p><bdi dir="ltr">LO = 657 + 455 = 1112 kHz</bdi></p>, <p><bdi dir="ltr">IM = 657 + 2·455 = 1567 kHz</bdi>. התחנה ב־1567 kHz היא תדר הבבואה ולכן תומר לאותו IF.</p>]}/></> },
  { chapter: chapters[3], title: "הפסקה", minutes: 10, takeaway: "בהמשך: נחלץ את אות השמע ונבקר את עוצמתו.", notes: ["הפסקה של עשר דקות.", "לאחר ההפסקה חזרו מגלאי המעטפת אל בקרת AGC."], content: <div className={styles.card}><h3>10 דקות להפסקה</h3><p className={styles.lead}>אחרי ההפסקה: גלאי מעטפת, תכנון RC ובקרת הגבר אוטומטית.</p></div> },
  { chapter: chapters[2], title: "הפשרה בבחירת IF", minutes: 5, takeaway: "IF נמוך משפר סלקטיביות אך מקרב את הבבואה; IF גבוה מרחיק אותה.", notes: ["הסבירו את שני צדי הפשרה בלי לטעון ש־IF לבדו קובע הכל.", "Double conversion משלב IF ראשון גבוה ודחיית בבואה עם IF שני נמוך וסלקטיביות.", "הדוגמה 10.7 MHz מוכרת ממקלטי FM; הציגו אותה כאן רק להמחשת העיקרון."], content: <div className={styles.three}>{card("IF נמוך", <p>ערוצים קרובים ניתנים להפרדה טובה; הבבואה קרובה יותר ל־RF ועלולה להיות קשה לסינון בכניסה.</p>)}{card("IF גבוה", <p>הבבואה רחוקה יותר; מסנן הכניסה יכול לדחות אותה בקלות רבה יותר, אך הסלקטיביות דורשת מסנן חד בתדר גבוה.</p>)}{card("המרה כפולה", <p>IF ראשון גבוה לדחיית בבואה, ואז IF שני נמוך לסלקטיביות.</p>)}</div> },
  { chapter: chapters[3], title: "גלאי מעטפת: מה־IF אל אות השמע", minutes: 10, takeaway: "דיודה וקבוע זמן RC מתאים עוקבים אחרי המעטפת ומחלצים את המידע.", notes: ["הגדירו IF כעת כתדר הנושא שמגיע לגלאי.", "תארו את טעינת הקבל בשיאים ואת פריקתו דרך הנגד.", "הדיודה מיישרת; R ו־C קובעים את העקיבה."], content: <>{card("מעגל עקרוני", <div className={styles.blockFlow}><b>אות AM ב־IF</b><b>דיודה D</b><b>צומת מוצא</b><b>R ו־C במקביל לאדמה</b><b>אות שמע</b></div>)}<div className={styles.three}>{card("בכל שיא", <p>הדיודה מוליכה והקבל נטען בקירוב לשיא המעטפת.</p>)}{card("בין שיאים", <p>הדיודה נסגרת והקבל נפרק דרך הנגד.</p>)}{card("מטרה", <p>המוצא יעקוב אחרי המעטפת בלי תנודות נושא גדולות ובלי לחתוך את הירידה.</p>)}</div></> },
  { chapter: chapters[3], title: "בוחרים RC: בין הנושא לשמע", minutes: 10, takeaway: "קבוע הזמן גדול ממחזור הנושא וקטן מספיק לעקוב אחרי מעטפת השמע.", notes: ["תקנו את ניסוח התנאים: RC צריך להיות גדול ממחזור הנושא וקטן מהגבול העליון שתלוי בתדר השמע ובעומק האפנון.", "הציגו את אי־השוויון הרשמי כקירוב תכנוני, לא כשוויון מדויק.", "Diagonal clipping מתרחש כשפריקת RC איטית מדי בירידת המעטפת."], content: <>{formula(String.raw`\frac{1}{f_c}\ll RC\ll\frac{1}{2f_m\ln\left(\frac{1+m_a}{1-m_a}\right)}`)}<div className={styles.three}>{card("RC קטן מדי", <p>הקבל נפרק מהר מדי; אדוות תדר הנושא נשארות במוצא.</p>)}{card("תחום מתאים", <p>מספיק זמן להחליק בין מחזורי הנושא, ועדיין לעקוב אחרי שינויי המעטפת.</p>)}{card("RC גדול מדי", <p>הפריקה אינה עוקבת אחרי ירידת המעטפת ונוצר עיוות אלכסוני.</p>)}</div><p className={styles.note}>הנוסחה תקפה למעטפת סינוסואידלית ול־<bdi dir="ltr">0 ≤ m<sub>a</sub> &lt; 1</bdi>. כש־<bdi dir="ltr">m<sub>a</sub>→1</bdi>, הגבול העליון מתכווץ.</p></> },
  { chapter: chapters[3], title: "תרגול: תחום RC וקבל מתאים", minutes: 15, takeaway: "לפי נוסחת הנוסחאון: כ־2.20 μs ≪ RC ≪ 45.5 μs; בחירה 15 μs נותנת 1.5 nF.", notes: ["תנו 5 דקות עבודה בזוגות לפני פתיחת הפתרון.", "המירו kHz ל־Hz; התוצאה של הגבול היא שניות.", "הבחירה 15 μs היא ערך דוגמה בתוך התחום, לא הפתרון היחיד."], content: <>{card("נתונים", <p dir="ltr">f<sub>c</sub>=455 kHz · f<sub>m</sub>=5 kHz · m<sub>a</sub>=0.8 · R=10 kΩ</p>)}<p>מצאו תחום מותר ל־<bdi dir="ltr">τ=RC</bdi>, ואז בחרו <bdi dir="ltr">C</bdi> עבור <bdi dir="ltr">τ=15 μs</bdi>.</p><Reveal label="חשיפת פתרון" steps={[<p><bdi dir="ltr">f<sub>c</sub>=455,000 Hz; f<sub>m</sub>=5,000 Hz</bdi></p>, <p>גבול תחתון: <bdi dir="ltr">1/455000 = 2.20 μs</bdi>. גבול עליון: <bdi dir="ltr">1/[2·5000·ln(9)] = 45.5 μs</bdi>.</p>, <p><bdi dir="ltr">2.20 μs ≪ RC ≪ 45.5 μs</bdi>. אם <bdi dir="ltr">RC=15 μs</bdi> ו־<bdi dir="ltr">R=10 kΩ</bdi>, אז <bdi dir="ltr">C=15×10⁻⁶/10⁴=1.5 nF</bdi>.</p>]}/></> },
  { chapter: chapters[3], title: "AGC: עוצמת שמע יציבה", minutes: 5, takeaway: "AGC משתמש במשוב שלילי כדי להקטין הגבר לאות חזק ולהגדילו לאות חלש.", notes: ["הדגישו שמתח הבקרה נובע ממדידת רמת האות אחרי הגילוי.", "הציגו חזק → הגבר יורד, חלש → הגבר עולה.", "המטרה היא לצמצם שינויי עוצמה בין תחנות; לא לבטל רעש או להבטיח עוצמה זהה לחלוטין."], content: <>{card("לולאת בקרה", <div className={styles.flow}><b>RF/IF</b><i>→</i><b>גלאי</b><i>→</i><b>מדידת רמה</b><i>→</i><b>מתח AGC</b><i>↺</i></div>)}<div className={styles.two}>{card("אות חזק", <p>מתח AGC מפחית את הגבר דרגות RF/IF.</p>)}{card("אות חלש", <p>המקלט מאפשר הגבר גדול יותר, בגבולות המעגל.</p>)}</div><p className={styles.lead}>כך מצמצמים את שינוי עוצמת השמע כאשר עוברים בין תחנות חזקות וחלשות.</p></> },
  { chapter: chapters[4], title: "ארבעה מאפייני מקלט", minutes: 5, takeaway: "ברירות, רגישות, נאמנות ו־SNR מתארים היבטים שונים של איכות הקליטה.", notes: ["בקשו דוגמה לכל מאפיין.", "הבחינו בין רגישות (אות חלש שניתן לקלוט) לברירות (הפרדת תחנות).", "SNR מתייחס ליחס הספק אות שימושי להספק רעש; ציינו באותה נקודת מדידה."], content: <div className={styles.two}>{card("ברירות · Selectivity", <p>היכולת להפריד את התחנה הרצויה מתחנות קרובות.</p>)}{card("רגישות · Sensitivity", <p>האות המזערי שניתן לקלוט באיכות שנקבעה.</p>)}{card("נאמנות · Fidelity", <p>הדיוק בשחזור תוכן האות, לרבות תדרי השמע.</p>)}{card("יחס אות לרעש · SNR", <p>יחס בין הספק האות להספק הרעש, באותה נקודת מדידה.</p>)}</div> },
  { chapter: chapters[4], title: "כרטיס יציאה: בדקו את ההבנה", minutes: 5, takeaway: "ל־RF של 1000 kHz ו־IF של 455 kHz: LO=1455 kHz ו־IM=1910 kHz.", notes: ["אספו תשובות לפני חשיפת הפתרון.", "דרשו יחידות בכל שורה.", "סיימו בחיבור השרשרת: בחירת תחנה, המרה, סינון, גילוי ובקרה."], content: <>{card("פתרו לבד", <p className={styles.lead}>מקלט AM בהזרקה גבוהה מכוון ל־<bdi dir="ltr">RF=1000 kHz</bdi> עם <bdi dir="ltr">IF=455 kHz</bdi>. חשבו את <bdi dir="ltr">LO</bdi> ואת תדר הבבואה <bdi dir="ltr">IM</bdi>.</p>)}<Reveal label="בדיקת תשובה" steps={[<p><bdi dir="ltr">LO = RF + IF = 1000 kHz + 455 kHz = 1455 kHz</bdi></p>, <p><bdi dir="ltr">IM = RF + 2IF = 1000 kHz + 910 kHz = 1910 kHz</bdi></p>]}/><p className={styles.note}>סיכום: התחנה נבחרת, מומרת ל־IF קבוע, מסוננת, וגלאי המעטפת מחלץ את המידע.</p></> },
];

function Reveal({ label, steps }: { label: string; steps: React.ReactNode[] }) {
  const [shown, setShown] = useState(0);
  return <div className={styles.reveal}><button type="button" onClick={() => setShown((v) => v >= steps.length ? 0 : v + 1)}>{shown === 0 ? label : shown === steps.length ? "הסתרת הפתרון" : "הצגת השלב הבא"}</button>{shown > 0 && <ol>{steps.slice(0, shown).map((step, i) => <li key={i}>{step}</li>)}</ol>}</div>;
}

function Tuner() {
  const [rf, setRF] = useState(657);
  const ifHz = 455; const lo = rf + ifHz; const image = rf + 2 * ifHz;
  const min = 540; const max = 1600; const x = (v: number) => 5 + (v - min) / (max - min) * 90;
  return <div className={styles.tuner}><label>תדר התחנה RF <output dir="ltr">{rf} kHz</output><input type="range" min={min} max={max} step="1" value={rf} onChange={(e) => setRF(Number(e.target.value))}/></label><div className={styles.tunerValues}><span>IF <bdi dir="ltr">455 kHz</bdi></span><span>LO <bdi dir="ltr">{lo} kHz</bdi></span><span>תדר בבואה <bdi dir="ltr">{image} kHz</bdi></span></div><div className={styles.tunerAxis}><i style={{ left: `${x(rf)}%` }}><b>RF</b></i><i style={{ left: `${x(lo)}%` }}><b>LO</b></i><i style={{ left: `${x(image)}%` }}><b>IM</b></i></div><p>המרחק RF–LO והמרחק LO–IM נשארים <bdi dir="ltr">455 kHz</bdi>.</p></div>;
}

function ScaledSlide({ slide, index, hostClass }: { slide: DeckSlide; index: number; hostClass: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      const next = Math.min(rect.width / 1600, rect.height / 900);
      if (Number.isFinite(next) && next > 0) setScale(next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={hostClass}>
    <div className={playerStyles.stageBox} style={{ width: 1600 * scale, height: 900 * scale }}>
      <div className={playerStyles.slideCanvas} style={{ transform: `scale(${scale})` }} data-current-slide="true" data-slide-id={`lesson-05-am-${String(index + 1).padStart(2, "0")}`} data-slide-number={index + 1} data-minutes={slide.minutes}>
        <div className="sl l5-slide"><header className="sl-h"><div className="sl-eb">{slide.chapter} · {slide.minutes} דקות</div><h2>{slide.title}</h2></header><div className="sl-body">{slide.content}</div><div className="sl-tk"><span>העיקר</span>{slide.takeaway}</div><footer className="sl-f"><span>{slide.chapter}</span><span dir="ltr">{String(index + 1).padStart(2, "0")}</span></footer></div>
      </div>
    </div>
  </div>;
}

export default function Lesson05Player() {
  const [index, setIndex] = useState(0);
  const [notesOpen, setNotesOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [present, setPresent] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const slide = data[index];
  const total = data.reduce((n, item) => n + item.minutes, 0);
  const remaining = data.slice(index).reduce((n, item) => n + item.minutes, 0);
  const go = (next: number) => setIndex(Math.max(0, Math.min(data.length - 1, next)));
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, button, [contenteditable='true']")) return;
      if (["ArrowLeft", "PageDown", " "].includes(event.key)) { event.preventDefault(); go(index + 1); }
      if (["ArrowRight", "PageUp"].includes(event.key)) { event.preventDefault(); go(index - 1); }
      if (event.key === "Escape") setPresent(false);
      if (event.key.toLowerCase() === "n") setNotesOpen((value) => !value);
      if (event.key.toLowerCase() === "p") setPresent((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width < 1192) setNotesOpen(false);
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  if (typeof document === "undefined") return null;
  if (present) return createPortal(<div dir="rtl" className={`l4-player syllo-student-app ${playerStyles.present}`} role="dialog" aria-label="הצגת שקף שיעור 05">
    <ScaledSlide slide={slide} index={index} hostClass={playerStyles.presentStage} />
    <div className={playerStyles.presentControls}><button type="button" onClick={() => go(index - 1)}>הקודם</button><span dir="ltr">{String(index + 1).padStart(2, "0")} / {data.length}</span><button type="button" onClick={() => go(index + 1)}>הבא</button><button type="button" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות מרצה · N</button><button type="button" onClick={() => setPresent(false)}>יציאה · Esc</button></div>
    {notesOpen && <aside className={playerStyles.speakerNotes}><b>הערות מרצה</b><p>{slide.notes.join(" · ")}</p></aside>}
  </div>, document.body);

  return createPortal(<div ref={playerRef} dir="rtl" className={`l4-player syllo-student-app ${playerStyles.player} ${outlineOpen ? playerStyles.withOutline : ""} ${notesOpen ? playerStyles.withContext : ""}`} aria-label="מערך שיעור 05">
    <header className={playerStyles.playerToolbar}>
      <div className={playerStyles.lessonIdentity}><a className={playerStyles.courseBreadcrumb} href="/lecturer/sessions#lessons"><span className={playerStyles.breadcrumbArrow} aria-hidden="true">›</span><span><small>חזרה לפנל המרצים</small><b>מערכות תקשורת</b></span></a><span className={playerStyles.toolbarDivider}/><span className={playerStyles.lessonBadge} dir="ltr">05</span><span className={playerStyles.lessonTitle}>מקלט AM — סופר־הטרודיין וגלאי מעטפת</span></div>
      <nav className={playerStyles.loopPhases} aria-label="שלבי השיעור"><a className={playerStyles.phaseActive} href="/lecturer/lessons/lesson-05/slides"><span dir="ltr">01</span>מערך השיעור</a><a href="/lecturer/lessons/lesson-05/practice"><span dir="ltr">02</span>תרגול</a></nav>
      <div className={playerStyles.toolbarActions}><button type="button" className={playerStyles.toolbarButton} aria-label="מבנה השיעור" aria-pressed={outlineOpen} onClick={() => setOutlineOpen((value) => !value)}>☷</button><button type="button" className={playerStyles.toolbarButton} aria-label="הערות מרצה" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות</button><button type="button" className={playerStyles.presentButton} onClick={() => setPresent(true)}>הצגה</button></div>
    </header>
    <div className={playerStyles.loopProgress}/>
    <div className={playerStyles.playerWorkspace}>
      {outlineOpen && <aside className={playerStyles.outline} aria-label="מבנה השיעור"><header className={playerStyles.outlineHeader}><div className={playerStyles.outlineTitleRow}><span className={playerStyles.lessonBadge} dir="ltr">05</span><div><span className={playerStyles.eyebrow}>מערך השיעור · מקלט AM</span><h2>סופר־הטרודיין וגלאי מעטפת</h2></div></div><div className={playerStyles.lessonProgress}><span>{index + 1}/{data.length} שקפים</span><i><b style={{ width: `${(index + 1) / data.length * 100}%` }}/></i></div></header><div className={playerStyles.outlineSectionHeading}>מבנה השיעור</div><nav className={playerStyles.outlineScroll}>{chapters.map((chapter, chapterIndex) => <section className={playerStyles.chapter} key={chapter}><button type="button" className={`${playerStyles.chapterButton} ${slide.chapter === chapter ? playerStyles.chapterActive : ""}`}><span className={playerStyles.chapterNumber} dir="ltr">{String(chapterIndex + 1).padStart(2, "0")}</span><span className={playerStyles.chapterTitle}>{chapter}</span></button><div className={playerStyles.chapterSlides}>{data.map((item, slideIndex) => item.chapter === chapter && <button type="button" key={slideIndex} className={`${playerStyles.slideLink} ${index === slideIndex ? playerStyles.slideActive : ""}`} onClick={() => go(slideIndex)}><span className={playerStyles.slideNumber} dir="ltr">{String(slideIndex + 1).padStart(2, "0")}</span><span className={playerStyles.slideTitle}>{item.title}</span></button>)}</div></section>)}</nav></aside>}
      <main className={playerStyles.playerMain} aria-label="נגן שיעור 05"><div className={playerStyles.stageWrap}><ScaledSlide slide={slide} index={index} hostClass={playerStyles.stage}/></div><footer className={playerStyles.playerFooter}><div className={playerStyles.chapterBar}>{chapters.map((chapter) => { const chapterSlides = data.filter((item) => item.chapter === chapter); const start = data.findIndex((item) => item.chapter === chapter); const progress = Math.max(0, Math.min(100, (index - start + 1) / chapterSlides.length * 100)); return <button type="button" key={chapter} className={`${playerStyles.chapterSegment} ${slide.chapter === chapter ? playerStyles.segmentActive : ""}`} style={{ flex: chapterSlides.length }} onClick={() => go(start)} aria-label={`מעבר לפרק ${chapter}`}><i style={{ width: `${progress}%` }}/></button>; })}</div><div className={playerStyles.slideNav}><button type="button" className={playerStyles.navButton} onClick={() => go(index - 1)} aria-label="לשקף הקודם">‹</button><span className={playerStyles.slideCount} dir="ltr">{String(index + 1).padStart(2, "0")} / {data.length}</span><button type="button" className={playerStyles.navButton} onClick={() => go(index + 1)} aria-label="לשקף הבא">›</button><span className={playerStyles.chapterLabel}>{slide.chapter}</span><span className={playerStyles.timeLeft}>כ־{remaining} דק׳ לסיום · {total} דקות בסך הכול</span></div></footer></main>
      {notesOpen && <aside className={playerStyles.slideContext} aria-label="הערות מרצה לשקף"><header className={playerStyles.contextHeader}><span>הערות מרצה</span><b dir="ltr">{String(index + 1).padStart(2, "0")}</b></header><div className={playerStyles.contextBody}><div className={playerStyles.takeaway}><small>העיקר</small>{slide.takeaway}</div><h3>הערות לשקף</h3><ul>{slide.notes.map((note) => <li key={note}>{note}</li>)}</ul></div></aside>}
    </div>
  </div>, document.body);
}
