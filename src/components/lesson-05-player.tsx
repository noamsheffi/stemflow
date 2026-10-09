"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import katex from "katex";
import Link from "next/link";
import { concepts } from "../lib/course-data";
import styles from "./lesson-05-player.module.css";
import playerStyles from "./lesson-04-player.module.css";

type DeckSlide = { chapter: string; title: string; minutes: number; takeaway: string; notes: string[]; content: React.ReactNode; className?: string; interactive?: boolean };
const chapters = ["פתיחה וחזרה", "ארכיטקטורת מקלט", "המרת תדר ובבואה", "הפסקה ופשרת IF", "גלאי מעטפת ו־AGC", "תרגול וסיכום"];
const formula = (tex: string) => <div dir="ltr" className="sl-fx" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: false, output: "htmlAndMathml" }) }} />;
const card = (title: string, children: React.ReactNode) => <article className="sl-card"><div className="sl-lab">{title}</div>{children}</article>;
const bidiTokenPattern = /(\d+(?:[.,]\d+)?\s?(?:MHz|kHz|Hz|μs|ms|nF|pF|kΩ|Ω|mV|V|dB)|\b(?:TRF|RF|LO|IF|AM|AGC|SNR|RC|LPF)\b)/g;
function bidiQuantities(text: string) {
  return text.split(bidiTokenPattern).map((part, index) => /^(?:\d+(?:[.,]\d+)?\s?(?:MHz|kHz|Hz|μs|ms|nF|pF|kΩ|Ω|mV|V|dB)|TRF|RF|LO|IF|AM|AGC|SNR|RC|LPF)$/.test(part)
    ? <bdi key={index} dir="ltr">{part}</bdi>
    : part);
}
const feedbackTypes = [
  { key: "unclear", label: "לא הבנתי", hint: "משהו בשקף לא ברור", color: "#D9731F", soft: "#FDF3EA" },
  { key: "example", label: "צריך עוד דוגמה", hint: "הבנתי חלקית, עוד דוגמה תעזור", color: "#137A86", soft: "#E8F4F5" },
  { key: "question", label: "יש לי שאלה", hint: "אכתוב אותה למטה", color: "#3B5BA9", soft: "#ECF0FA" },
  { key: "mistake", label: "נראה שיש טעות", hint: "בנוסחה, במספר או בטקסט", color: "#C0392B", soft: "#FCEDEB" },
] as const;
function useLessonState<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) setValue(JSON.parse(saved) as T);
    } catch { /* Continue when browser storage is unavailable. */ }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* Keep the lesson interactive when browser storage is unavailable. */ }
  }, [key, ready, value]);
  return [value, setValue] as const;
}
function FeedbackIcon({ type, size = 20 }: { type: (typeof feedbackTypes)[number]["key"] | "syllo"; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    unclear: <><circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/></>,
    example: <><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></>,
    question: <><path d="m4 20 1.2-4.2L15.6 5.4a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.2 18.8z"/><path d="m13.8 7.2 3 3"/></>,
    mistake: <><path d="m12 3.5 9 16H3z"/><path d="M12 10v4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/></>,
    syllo: <path d="M7 8a4 4 0 1 0 0 8c3.2 0 6.8-8 10-8a4 4 0 1 1 0 8c-3.2 0-6.8-8-10-8z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}
function AMSpectrum() {
  return <figure className={styles.spectrum} aria-labelledby="am-spectrum-caption">
    <svg viewBox="0 0 1500 440" role="img" aria-labelledby="am-spectrum-title am-spectrum-desc" style={{ direction: "ltr" }}>
      <title id="am-spectrum-title">ספקטרום של אות AM</title>
      <desc id="am-spectrum-desc">שלושה קווים בתדרים f c minus f m, f c, ו־f c plus f m. הקו המרכזי הוא הנושא ושני הקווים לצדו הם פסי הצד.</desc>
      <line x1="120" y1="300" x2="1380" y2="300" stroke="#52677a" strokeWidth="4" />
      <path d="M1370 289 L1385 300 L1370 311" fill="none" stroke="#52677a" strokeWidth="4" />
      <line x1="120" y1="300" x2="120" y2="70" stroke="#52677a" strokeWidth="4" />
      <path d="M109 82 L120 67 L131 82" fill="none" stroke="#52677a" strokeWidth="4" />
      <text x="58" y="205" textAnchor="middle" fontSize="23" fill="#52677a" direction="rtl" transform="rotate(-90 58 205)">משרעת</text>
      <line x1="420" y1="300" x2="420" y2="205" stroke="#008F4D" strokeWidth="9" />
      <line x1="750" y1="300" x2="750" y2="72" stroke="#13263e" strokeWidth="12" />
      <line x1="1080" y1="300" x2="1080" y2="205" stroke="#008F4D" strokeWidth="9" />
      <circle cx="420" cy="205" r="10" fill="#008F4D" /><circle cx="750" cy="72" r="12" fill="#13263e" /><circle cx="1080" cy="205" r="10" fill="#008F4D" />
      <text x="420" y="175" textAnchor="middle" fontSize="25" fill="#116f79" direction="rtl">פס צד תחתון</text>
      <text x="750" y="40" textAnchor="middle" fontSize="25" fontWeight="700" fill="#13263e" direction="rtl">גל נושא</text>
      <text x="1080" y="175" textAnchor="middle" fontSize="25" fill="#116f79" direction="rtl">פס צד עליון</text>
      <text x="420" y="345" textAnchor="middle" fontSize="30" fill="#243b53">f<tspan baselineShift="sub" fontSize="20">c</tspan> − f<tspan baselineShift="sub" fontSize="20">m</tspan></text>
      <text x="750" y="345" textAnchor="middle" fontSize="30" fill="#13263e">f<tspan baselineShift="sub" fontSize="20">c</tspan></text>
      <text x="1080" y="345" textAnchor="middle" fontSize="30" fill="#243b53">f<tspan baselineShift="sub" fontSize="20">c</tspan> + f<tspan baselineShift="sub" fontSize="20">m</tspan></text>
      <text x="1370" y="345" textAnchor="end" fontSize="25" fill="#52677a" direction="rtl">תדר</text>
    </svg>
    <figcaption id="am-spectrum-caption"><b>הנושא</b> נמצא ב־<bdi dir="ltr">f<sub>c</sub></bdi>. <b>המידע</b> מופיע בפסי הצד, במרחק <bdi dir="ltr">f<sub>m</sub></bdi> מהנושא. התרשים איכותי: גובה הקווים אינו מציג את היחס בין ההספקים.</figcaption>
  </figure>;
}
function AMPowerAndBandwidth() {
  return <div className={styles.spectrumInsights}>
    <article><h3>רוחב הסרט של התחנה</h3><p dir="ltr">BW<sub>AM</sub> = f<sub>USB</sub> − f<sub>LSB</sub> = 2f<sub>m,max</sub></p><p><b>המסנן חייב להעביר את שני פסי הצד.</b> רוחב הסרט הוא המרחק מהפס התחתון ועד הפס העליון.</p><p><b>דוגמה:</b> אם תדר השמע המרבי הוא <bdi dir="ltr">5 kHz</bdi>, רוחב הסרט הנדרש הוא <bdi dir="ltr">10 kHz</bdi>.</p></article>
    <article><h3>הספק: איפה נמצא המידע?</h3><div className={styles.powerEquations}>{formula("P_{SB}=P_c\\frac{m_a^2}{2}")}{formula("P_{AM}=P_c\\left(1+\\frac{m_a^2}{2}\\right)")}</div><p><b>P<sub>c</sub></b> הוא הספק הנושא. <b>m<sub>a</sub></b> הוא מקדם האפנון.</p><p>במודל AM חד־טוני, שני פסי הצד נושאים יחד הספק <bdi dir="ltr">P<sub>SB</sub></bdi> ולכן הם נושאים את המידע. גובה הקווים בגרף הקודם היה סכמטי, לא מדידת הספק.</p></article>
  </div>;
}
function TRFResponseGraph() {
  return <figure className={styles.responseGraph} aria-labelledby="trf-response-caption">
    <svg viewBox="0 0 1200 410" role="img" aria-labelledby="trf-response-title trf-response-desc" style={{ direction: "ltr" }}>
      <title id="trf-response-title">תגובת מסנן סביב תדר התהודה</title>
      <desc id="trf-response-desc">גרף איכותי של הגבר כפונקציה של התדר. שתי עקומות מגיעות לשיא באותו תדר תהודה f אפס. עקומת Q גבוה צרה, ועקומת Q נמוך רחבה. רוחב הפס נמדד בין f L ל־f H בקו מינוס שלושה דציבל.</desc>
      <line x1="125" y1="310" x2="1080" y2="310" stroke="#52677a" strokeWidth="4" />
      <path d="M1068 299 L1084 310 L1068 321" fill="none" stroke="#52677a" strokeWidth="4" />
      <line x1="125" y1="310" x2="125" y2="52" stroke="#52677a" strokeWidth="4" />
      <path d="M114 64 L125 48 L136 64" fill="none" stroke="#52677a" strokeWidth="4" />
      <text x="52" y="185" textAnchor="middle" fontSize="23" fill="#52677a" direction="rtl" transform="rotate(-90 52 185)">הגבר יחסי</text>
      <text x="1080" y="350" textAnchor="end" fontSize="23" fill="#52677a" direction="rtl">תדר</text>
      <line x1="155" y1="215" x2="1040" y2="215" stroke="#9aabb8" strokeWidth="2" strokeDasharray="8 8" />
      <text x="1035" y="202" textAnchor="end" fontSize="19" fill="#62768a">סף חצי הספק · ‎−3 dB</text>
      <path d="M170 298 C300 292 380 280 445 215 C500 160 510 75 570 72 C630 75 640 160 695 215 C760 280 840 292 970 298" fill="none" stroke="#008F4D" strokeWidth="8" strokeLinecap="round" />
      <path d="M380 298 C460 290 500 280 530 215 C550 150 548 75 570 72 C592 75 590 150 610 215 C640 280 680 290 760 298" fill="none" stroke="#13263e" strokeWidth="8" strokeLinecap="round" />
      <line x1="445" y1="215" x2="445" y2="310" stroke="#008F4D" strokeWidth="3" strokeDasharray="6 5" />
      <line x1="695" y1="215" x2="695" y2="310" stroke="#008F4D" strokeWidth="3" strokeDasharray="6 5" />
      <line x1="530" y1="215" x2="530" y2="310" stroke="#13263e" strokeWidth="3" strokeDasharray="6 5" />
      <line x1="610" y1="215" x2="610" y2="310" stroke="#13263e" strokeWidth="3" strokeDasharray="6 5" />
      <circle cx="570" cy="72" r="9" fill="#13263e" />
      <text x="570" y="42" textAnchor="middle" fontSize="22" fontWeight="700" fill="#13263e">שיא תגובה · תדר תהודה</text>
      <text x="570" y="399" textAnchor="middle" fontSize="24" fontWeight="700" fill="#13263e">f<tspan baselineShift="sub" fontSize="17">0</tspan></text>
      <text x="445" y="340" textAnchor="middle" fontSize="17" fill="#008F4D">f<tspan baselineShift="sub" fontSize="13">L</tspan> · Q נמוך</text>
      <text x="695" y="340" textAnchor="middle" fontSize="17" fill="#008F4D">f<tspan baselineShift="sub" fontSize="13">H</tspan> · Q נמוך</text>
      <text x="522" y="365" textAnchor="end" fontSize="16" fill="#13263e">f<tspan baselineShift="sub" fontSize="12">L</tspan> · Q גבוה</text>
      <text x="618" y="365" textAnchor="start" fontSize="16" fill="#13263e">f<tspan baselineShift="sub" fontSize="12">H</tspan> · Q גבוה</text>
      <text x="280" y="155" textAnchor="middle" fontSize="20" fontWeight="700" fill="#008F4D" direction="rtl">Q נמוך · פס רחב</text>
      <text x="850" y="155" textAnchor="middle" fontSize="20" fontWeight="700" fill="#13263e" direction="rtl">Q גבוה · פס צר</text>
    </svg>
    <figcaption id="trf-response-caption">בשיא המסנן נמצא ב־<bdi dir="ltr">f<sub>0</sub></bdi>. רוחב הפס נמדד בין <bdi dir="ltr">f<sub>L</sub></bdi> ל־<bdi dir="ltr">f<sub>H</sub></bdi> בסף חצי־הספק (<bdi dir="ltr">−3 dB</bdi>); לכן <bdi dir="ltr">BW=f<sub>H</sub>−f<sub>L</sub></bdi>. <bdi dir="ltr">Q=f<sub>0</sub>/BW</bdi> הוא יחס חסר יחידות: באותו <bdi dir="ltr">f<sub>0</sub></bdi>, <bdi dir="ltr">Q</bdi> גבוה יוצר פס צר יותר. העקומות איכותיות.</figcaption>
  </figure>;
}
const data: DeckSlide[] = [
  { chapter: chapters[0], title: "מקלט AM — סופר־הטרודיין וגלאי מעטפת", minutes: 0, takeaway: "נעקוב אחרי האות מהאנטנה, דרך בחירת התדר, ועד לשמע.", notes: ["הציגו את שאלת השיעור: איך רדיו בוחר תחנה אחת ומחזיר ממנה שמע?", "הזכירו שהיום נלמד את המקלט, כהמשך לאות AM משיעור 4.", "התחילו בשאלת הפתיחה בשקף הבא."], content: <div className={styles.cover}><div><span>מערכות תקשורת · שיעור 05</span><h3>מקלט AM</h3><p>סופר־הטרודיין וגלאי מעטפת</p><b dir="ltr">AM RECEIVER · AUDIO ← IF ← RF</b></div><div className={styles.coverArt}><div className={styles.flow}><b>אנטנה</b><i>←</i><b>בחירת תחנה</b><i>←</i><b>שמע</b></div><span>ממקלט התחנה ועד לרמקול</span></div></div> },
  { chapter: chapters[0], title: "משדר AM בשיעור 4: ממקור המידע לאנטנה", minutes: 3, takeaway: "בשיעור 4 עקבנו אחרי המידע מהמיקרופון, דרך האפנון וההגברה, ועד לאנטנה המשדרת.", notes: ["זהו שקף גישור נפרד: שחזרו את מסלול האות כפי שנלמד בשיעור 4.", "הצביעו על המיקרופון כמקור המידע, ועל גל הנושא שנכנס לאפנן יחד עם אות השמע.", "סיימו באנטנה המשדרת והעבירו את נקודת המבט לאנטנה הקולטת בשיעור 5."], content: <div className={styles.bridge}><div className={styles.bridgeLabel}>חזרה קצרה · מערך שיעור 4</div><div className={styles.flow}><b>מיקרופון<br/><small>מקור מידע</small></b><i>←</i><b>מסנן שמע<br/><small>LPF</small></b><i>←</i><b>אפנן AM<br/><small>אות שמע + נושא</small></b><i>←</i><b>מגבר הספק</b><i>←</i><b>אנטנה<br/><small>שידור</small></b></div><div className={styles.bridgeHandoff}><span>עד כאן: המשדר של שיעור 4</span><b>עכשיו: המקלט קולט את האות באנטנה</b></div></div> },
  { chapter: chapters[0], title: "מפת חזרה משיעור 4: מאות AM לתדרי פסי הצד", minutes: 2, takeaway: "אפנון AM מציב פס צד בכל צד של הנושא; המיקום נקבע לפי תדר המידע.", notes: ["רעננו את שלושת הסימונים: תדר נושא fc, תדר מידע fm ומקדם אפנון ma.", "עקבו במפה: אות המידע וגל הנושא נכנסים לאפנן AM.", "ביציאה מתקבלים נושא ושני פסי צד, אחד מתחת לתדר הנושא ואחד מעליו.", "השקף הבא יראה את הרכיבים על ציר תדר; את רוחב הסרט וההספק נחשב בנפרד אחריו."], content: <div className={styles.amReview}><div className={styles.amReviewFlow}><b>אות מידע<small>תדר המידע: <bdi dir="ltr">f<sub>m</sub></bdi></small><small>עומק האפנון: <bdi dir="ltr">m<sub>a</sub></bdi></small><small>מידת השינוי במשרעת הנושא; חסר יחידות.</small></b><i>+</i><b>גל נושא<br/><small dir="ltr">f<sub>c</sub></small></b><i>← אפנון AM</i><b><span>נושא + שני פסי צד</span></b></div><div className={styles.amReviewCards}><article><h3>פס צד תחתון</h3><p dir="ltr">f<sub>LSB</sub> = f<sub>c</sub> − f<sub>m</sub></p></article><article><h3>תדר הנושא</h3><p dir="ltr">f<sub>c</sub></p></article><article><h3>פס צד עליון</h3><p dir="ltr">f<sub>USB</sub> = f<sub>c</sub> + f<sub>m</sub></p></article></div></div> },
  { chapter: chapters[0], title: "מה יש בתוך אות AM? נושא ושני פסי צד", minutes: 2, takeaway: "הנושא נמצא בתדר המרכזי; שני פסי הצד נושאים את המידע. המרחק ביניהם נקבע לפי תדר המידע.", notes: ["קראו את הגרף משמאל לימין: התדר גדל, ובמרכז נמצא הנושא.", "הצביעו בנפרד על הנושא, פס הצד התחתון ופס הצד העליון.", "הסבירו שהמרחק של כל פס צד מהנושא הוא תדר השמע fm.", "העבירו לשקף הבא: נחבר את שני המרחקים ונחשב רוחב סרט והספק."], content: <div className={styles.spectrumTeachingSlide}><AMSpectrum /></div> },
  { chapter: chapters[0], title: "רוחב הסרט וההספק באות AM", minutes: 3, takeaway: "רוחב הסרט כולל את שני פסי הצד; במודל AM חד־טוני הם נושאים יחד הספק שתלוי בריבוע מקדם האפנון.", notes: ["הגדירו fm,max כתדר המידע הגבוה ביותר שיש להעביר.", "חברו fUSB−fLSB כדי לקבל רוחב סרט כולל של 2fm,max.", "בדוגמה, שמע עד 5 kHz דורש מעבר של 10 kHz.", "הגדירו Pc כהספק הנושא ו־ma כמקדם האפנון; בהנחת אות מידע חד־טוני, הספק שני פסי הצד יחד הוא Pc·ma²/2.", "הדגישו שפסי הצד נושאים את המידע; עוצמת הקו בגרף הספקטרום האיכותי אינה מייצגת הספק."], content: <div className={styles.amPowerSlide}><AMPowerAndBandwidth /></div> },
  { chapter: chapters[0], title: "שאלת פתיחה: איך בוחרים תחנה אחת?", minutes: 3, takeaway: "לפני שמחלצים שמע, צריך לבודד את האות של התחנה הרצויה.", notes: ["הציגו את השאלה אחרי שחזור שרשרת המשדר בשקף הקודם.", "הדגישו שהאנטנה קולטת כמה תחנות בו־זמנית.", "בקשו מהכיתה להציע מה המקלט צריך לעשות לפני הגילוי."], content: <div className={styles.openingQuestion}>{card("מה מגיע למקלט?", <p className={styles.lead}>האנטנה קולטת אותות מכמה תחנות יחד.</p>)}{card("השאלה להיום", <p className={styles.lead}>איך בוחרים תחנה אחת ומחלצים ממנה את השמע?</p>)}</div> },
  { chapter: chapters[1], title: "מקלט ישיר: מסנן שעוקב אחרי התחנה", minutes: 2, takeaway: "במקלט TRF המסנן ומגבר תדר הרדיו מכוונים סביב התחנה הרצויה.", notes: ["הגדירו RF: תדר הרדיו של התחנה לפני הגילוי.", "הגדירו TRF: מקלט ישיר (Tuned Radio Frequency) שמסנן ומגביר סביב תדר התחנה.", "הדגישו שהכוונון משתנה עם התחנה; את רוחב הפס נחשב בשקף הבא."], content: <><div className={styles.two}>{card("RF · תדר רדיו", <p>תדר התחנה שנבחרה, לפני הגילוי.</p>)}{card("TRF · מקלט ישיר", <p>Tuned Radio Frequency: מסנן ומגבר מכוונים סביב תדר התחנה.</p>)}</div><div className={styles.flow}><b>אנטנה</b><i>←</i><b>מסנן ומגבר RF מתכווננים</b><i>←</i><b>גלאי AM</b><i>←</i><b>שמע</b></div><p className={styles.note}>כשבוחרים תחנה אחרת, גם דרגת הסינון צריכה להתכוונן לתדר החדש.</p></> },
  { chapter: chapters[1], title: "רוחב פס המסנן: מה אומר Q?", minutes: 2, takeaway: "רוחב הפס הוא תחום המעבר סביב התהודה; Q הוא היחס f₀/BW ולכן Q גבוה מייצג פס צר יותר.", notes: ["הגדירו רוחב פס כהפרש בין גבולות הסינון fH ו־fL.", "הגדירו Q כמקדם איכות חסר יחידות: היחס בין תדר התהודה f₀ לרוחב הפס.", "הסבירו במילים: Q גבוה = תחום צר ובררני; Q נמוך = תחום רחב.", "בשקף הבא נזהה את f₀, גבולות חצי ההספק ואת רוחב הפס על גבי הגרף."], content: <div className={styles.qDefinition}><div className={styles.qDefinitionCards}><article><h3>רוחב פס</h3><p dir="ltr">BW = f<sub>H</sub> − f<sub>L</sub></p><p>התחום בין תדר החיתוך התחתון לעליון.</p></article><article><h3>מקדם האיכות</h3>{formula("Q=\\frac{f_0}{BW}")}<p>ללא יחידות. באותו תדר תהודה: Q גבוה נותן פס צר יותר.</p></article></div></div> },
  { chapter: chapters[1], title: "גרף תגובת המסנן: Q גבוה מול Q נמוך", minutes: 2, takeaway: "באותו תדר תהודה, עקומת Q גבוה צרה יותר; רוחב הפס נמדד בגבולות −3 dB.", notes: ["הצביעו על שיא העקומות: תדר התהודה f₀.", "עקבו לאורך קו −3 dB עד החיתוך עם העקומות; אלו גבולות fL ו־fH.", "השוו את המרחק בין הגבולות: הפס הצר שייך ל־Q הגבוה, והרחב ל־Q הנמוך.", "הכינו את החישוב הבא: נציב f₀ ו־Q בנוסחת BW=f₀/Q."], content: <div className={styles.qGraphSlide}><TRFResponseGraph /></div> },
  { chapter: chapters[1], title: "דוגמת TRF: מחשבים רוחב פס", minutes: 3, takeaway: "עבור תדר תהודה 1.5 MHz ו־Q של 50, רוחב הפס הוא 30 kHz.", notes: ["הזכירו ש־Q הוא מקדם האיכות וחסר יחידות.", "המירו MHz ל־kHz או ל־Hz לפני החלוקה.", "בדקו ש־30 kHz קטן מ־1.5 MHz ומתאים לרוחב פס."], className: "measurement-slide", content: <><div className={styles.trfExampleData}><h3>נתונים</h3><div className={styles.parameterTiles} dir="ltr"><p><b>f₀</b><span>1.5 MHz = 1500 kHz</span></p><p><b>Q</b><span>50</span></p></div></div>{formula(String.raw`BW=\frac{f_0}{Q}`)}<p>חשבו את רוחב הפס של המסנן.</p><Reveal label="פתרון מדורג" steps={[<p><bdi dir="ltr">BW = 1500 kHz / 50</bdi></p>, <p><bdi dir="ltr">BW = 30 kHz</bdi>. בדיקה: רוחב הפס קטן מתדר התהודה.</p>]}/></> },
  { chapter: chapters[1], title: "מקלט ישיר: המסנן עוקב אחרי התחנה", minutes: 4, takeaway: "במקלט ישיר, מסנן RF ומגבר מכוונים מחדש לכל תחנה; אין המרת תדר.", notes: ["השתמשו בשם העקבי: מקלט ישיר (TRF הוא הקיצור המקצועי שכבר הוגדר, לא הכותרת).", "עקבו בגרף הזרימה מהאנטנה אל המסנן, הגלאי והשמע.", "הדגישו ששינוי תחנה מחייב לכוון מחדש את דרגת הסינון.", "העבירו לשיטה שבה אפשר להשאיר את מסנן IF בתדר קבוע."], className: "architectureSingle", content: <article><h3>מקלט ישיר</h3><p>מסנן RF ומגבר מתכווננים עוקבים יחד אחרי תדר התחנה. אין המרת תדר.</p><div className={styles.architectureFlow}><b>אנטנה</b><i>←</i><b>מסנן ומגבר RF<br/>מתכווננים</b><i>←</i><b>גילוי</b><i>←</i><b>שמע</b></div><small>כשבוחרים תחנה אחרת, צריך לכוון מחדש את המסנן.</small></article> },
  { chapter: chapters[1], title: "מקלט סופר־הטרודיין: המרה ל־IF קבוע", minutes: 5, takeaway: "במקום לעקוב אחרי התחנה בכל המסננים, ממירים אותה ל־IF קבוע ואז מסננים.", notes: ["הציגו רק את שרשרת ההמרה; פירוט תפקיד כל רכיב מגיע בשקף מפת המקלט הבא.", "בחרו תחנה ב־RF; ערבול עם LO יוצר רכיבי סכום והפרש.", "מסנן IF בוחר את רכיב ההפרש סביב תדר קבוע.", "החיבור לשקף הבא: נפרק את השרשרת לבלוקים ונגדיר כל רכיב."], className: "architectureSingle", content: <article><h3>מקלט סופר־הטרודיין</h3><p>התחנה הנבחרת מומרת לתדר ביניים קבוע, ומסנן IF מכוון סביבו.</p><div className={styles.architectureFlow}><b>אנטנה</b><i>←</i><b>בחירת RF</b><i>←</i><b>ערבל + מתנד מקומי</b><i>←</i><b>מסנן IF קבוע<br/><bdi dir="ltr">455 kHz</bdi></b><i>←</i><b>גילוי</b><i>←</i><b>שמע</b></div><small>המספר הוא דוגמה; העיקרון הוא סינון בתדר ביניים קבוע.</small></article> },
  { chapter: chapters[1], title: "למה משתמשים בתדר ביניים קבוע?", minutes: 3, takeaway: "היתרון של הסופר־הטרודיין הוא סינון מרכזי קבוע; כדי להבין איך התחנה מגיעה אליו, נבחן את דרגות הכניסה והערבל.", notes: ["הבדילו בין RF של התחנה לבין IF אחרי ההמרה.", "הדגישו שהתחנה הנבחרת משתנה אך ה־IF נשאר קבוע בתכנון.", "ציינו שהמספר 455 kHz בדוגמה אינו ערך אוניברסלי.", "הכינו לשקף הבא: הערבל מקבל RF מן התחנה ואות מן המתנד המקומי."], content: <>{card("הרעיון לפני הנוסחה", <p className={styles.lead}>במקום לכוון מסנן חד לכל תחנה, ממירים כל תחנה נבחרת לאותו תדר ביניים.</p>)}<div className={styles.flow}><b><bdi dir="ltr">RF</bdi><br/>תדר משתנה</b><i>← המרה</i><b><bdi dir="ltr">IF</bdi><br/>תדר קבוע</b><i>←</i><b>מסנן קבוע</b></div><p className={styles.note}>IF <bdi dir="ltr">455 kHz</bdi> הוא ערך הדוגמה של מערך זה, לא ערך אוניברסלי לכל מקלט.</p></> },
  { chapter: chapters[1], title: "מה עושה כל דרגה במקלט?", minutes: 3, takeaway: "המסנן בכניסה מצמצם הפרעות; ה־IF מספק סינון והגבר סביב תדר קבוע.", notes: ["עברו בבלוקים לפי כיוון זרימת האות.", "הגדירו RF ו־IF בעברית לפני הקיצור.", "ציינו שה־LO מזין את הערבל אך אינו אות התחנה."], className: "receiverStages", content: <>{card("מסלול האות", <div className={styles.blockFlow}><b>מגבר כניסה<br/><bdi dir="ltr">RF</bdi></b><b>ערבל<br/><bdi dir="ltr">RF</bdi><br/><bdi dir="ltr">LO</bdi></b><b>מגבר<br/><bdi dir="ltr">IF</bdi></b></div>)}<div className={styles.three}>{card("תדר כניסה", <p><bdi dir="ltr">RF</bdi><br/>תדר התחנה שנבחרה מן האנטנה.</p>)}{card("מתנד מקומי", <p><bdi dir="ltr">LO</bdi><br/>מספק לערבל אות בתדר מכוון.</p>)}{card("תדר ביניים", <p><bdi dir="ltr">IF</bdi><br/>התדר הקבוע לסינון ולהגבר.</p>)}</div></> },
  { chapter: chapters[2], title: "איך הערבל ממיר תדר?", minutes: 2, takeaway: "מכפלת אות התחנה והמתנד המקומי יוצרת תדר סכום ותדר הפרש.", notes: ["הגדירו את שתי הכניסות כסינוסים והצביעו על כל איבר.", "הראו שזהות המכפלה יוצרת רכיב סכום ורכיב הפרש.", "מסנן IF מעביר רק את רכיב ההפרש שנבחר."], content: <>{card("אותות הכניסה לערבל", <div className={styles.parameterList} dir="ltr"><p><b>s<sub>RF</sub>(t)</b><span>A<sub>c</sub> cos(2πf<sub>RF</sub>t)</span></p><p><b>s<sub>LO</sub>(t)</b><span>A<sub>LO</sub> cos(2πf<sub>LO</sub>t)</span></p></div>)}{formula(String.raw`s_{RF}(t)s_{LO}(t)=\frac{A_cA_{LO}}{2}[\cos(2\pi(f_{LO}-f_{RF})t)+\cos(2\pi(f_{LO}+f_{RF})t)]`)}<div className={styles.two}>{card("רכיב הפרש", <p><bdi dir="ltr">|f<sub>LO</sub> − f<sub>RF</sub>| = f<sub>IF</sub></bdi></p>)}{card("רכיב סכום", <p><bdi dir="ltr">f<sub>LO</sub> + f<sub>RF</sub></bdi></p>)}</div><p className={styles.note}>הערבל יוצר את שני הרכיבים; מסנן IF צר מעביר את רכיב ההפרש סביב <bdi dir="ltr">455 kHz</bdi> ודוחה את רכיב הסכום.</p></> },
  { chapter: chapters[2], title: "מה יוצא מהערבל? סכום והפרש", minutes: 3, takeaway: "מכפלת תדר RF ו־LO יוצרת רכיב סכום ורכיב הפרש.", notes: ["השתמשו בזהות כדי להראות את המעבר ולא רק את התוצאה.", "סמנו את רכיב ההפרש כבחירת מסנן ה־IF בדוגמת ההזרקה הגבוהה.", "הבחינו בין תדרי הכניסה לבין הרכיבים ביציאה."], className: "mixerOutput", content: <>{card("שני אותות הכניסה", <div className={styles.mixerInputs}><p><b><bdi dir="ltr">RF</bdi></b><span dir="ltr">cos(2πf<sub>RF</sub>t)</span></p><p><b><bdi dir="ltr">LO</bdi></b><span dir="ltr">cos(2πf<sub>LO</sub>t)</span></p></div>)}{formula(String.raw`\cos(\alpha)\cos(\beta)=\frac{1}{2}[\cos(\alpha-\beta)+\cos(\alpha+\beta)]`)}<div className={styles.two}>{card("הפרש", <p><bdi dir="ltr">f<sub>LO</sub> − f<sub>RF</sub></bdi></p>)}{card("סכום", <p><bdi dir="ltr">f<sub>LO</sub> + f<sub>RF</sub></bdi></p>)}</div><p className={styles.note}>מסנן ה־IF בוחר את רכיב ההפרש הרצוי.</p></> },
  { chapter: chapters[2], title: "בוחרים צד הזרקה ורואים את תדרי הערבל", interactive: true, minutes: 3, takeaway: "בשני צדי ההזרקה ההפרש בין התחנה ל־LO הוא IF, אך מיקום הבבואה משתנה.", notes: ["הפעילו את בחירת הזרקת LO העליונה/התחתונה.", "הצביעו על RF, LO ותדר הבבואה בציר התדרים.", "בתדרים נמוכים, בבואת ההזרקה התחתונה עלולה להיות שלילית ולכן אינה תדר פיזיקלי בתחום הקליטה."], content: <Tuner /> },
  { chapter: chapters[2], title: "למה תדר הבבואה עובר גם הוא ל־IF?", minutes: 2, takeaway: "תדר הבבואה יוצר עם אותו LO בדיוק את אותו הפרש IF, ולכן מסנן ה־IF אינו יכול להפריד ביניהם.", notes: ["הראו שהבבואה נמצאת בצד הנגדי של LO ובמרחק IF זהה.", "הציבו את תדר הבבואה במכפלת הערבל.", "סיימו בכך שדחיית הבבואה חייבת להתחיל לפני הערבל, במסנן הכניסה."], content: <>{formula(String.raw`f_{IM}=f_{LO}+f_{IF}`)}<p>במכפלה עם המתנד המקומי מתקבל רכיב הפרש:</p>{formula(String.raw`f_{IM}-f_{LO}=(f_{LO}+f_{IF})-f_{LO}=f_{IF}`)}<p>לכן גם התחנה הרצויה וגם הבבואה מגיעות לאותו מסנן IF. אחרי הערבל, המסנן אינו יודע איזו מהן יצרה את ההפרש.</p><div className={styles.axis}><span>RF רצוי</span><i></i><span>LO</span><i></i><span>בבואה</span></div></> },
  { chapter: chapters[2], title: "גוזרים את תדר הבבואה", minutes: 2, className: "imageFrequency", takeaway: "מרחק הבבואה מן התחנה הוא פעמיים IF; סימן הפלוס או המינוס תלוי בצד ההזרקה.", notes: ["הראו שהמרחק בין RF ל־LO הוא IF.", "הכפילו את מרחק IF כדי לעבור מצד אחד של LO לצד האחר.", "ציינו שבהזרקה נמוכה נדרש שתדר התחנה יהיה לפחות פי שניים מתדר הביניים."], content: <>{formula(String.raw`f_{IF}=|f_{LO}-f_{RF}|`)}<div className={styles.two}>{card("הזרקה גבוהה · LO מעל RF", <><p><bdi dir="ltr">f<sub>LO</sub>=f<sub>RF</sub>+f<sub>IF</sub></bdi></p><p><bdi dir="ltr">f<sub>IM</sub>=f<sub>RF</sub>+2f<sub>IF</sub></bdi></p></>)}{card("הזרקה נמוכה · LO מתחת RF", <><p><bdi dir="ltr">f<sub>LO</sub>=f<sub>RF</sub>−f<sub>IF</sub></bdi></p><p><bdi dir="ltr">f<sub>IM</sub>=f<sub>RF</sub>−2f<sub>IF</sub></bdi></p></>)}</div><p className={styles.warning}><b>אזהרת זהב לבחינות מה״ט:</b> תדר הבבואה רחוק מתדר התחנה פי <bdi dir="ltr">2f<sub>IF</sub></bdi>, לא פי <bdi dir="ltr">f<sub>IF</sub></bdi>. בהזרקה נמוכה נדרש גם <bdi dir="ltr">f<sub>RF</sub>≥2f<sub>IF</sub></bdi> כדי לקבל בבואה חיובית.</p></> },
  { chapter: chapters[2], title: "תרגיל מודרך: נתונים ושאלות", interactive: true, minutes: 5, takeaway: "חשבנו תחום LO, LO לתחנה ואת תדר הבבואה עם יחידות.", notes: ["תנו זמן לסטודנטים לכתוב כל נוסחה לפני הפתרון.", "אחדו יחידות לפני חיבור; כאן כל הערכים ב־kHz.", "בבדיקת הפרעה השוו לתדר הבבואה, לא לתדר התחנה הרצויה."], content: <>{card("נתונים", <div className={styles.parameterList} dir="ltr"><p><b>f<sub>RF</sub></b><span>540–1600 kHz</span></p><p><b>f<sub>IF</sub></b><span>455 kHz</span></p><p><b>תנאי הזרקה</b><span>f<sub>LO</sub> &gt; f<sub>RF</sub></span></p></div>)}{card("משימות", <ol><li>תחום תדרי LO</li><li>לתחנה <bdi dir="ltr">f<sub>RF</sub>=657 kHz</bdi>, חשבו LO ו־IM</li><li>האם תחנה ב־<bdi dir="ltr">1567 kHz</bdi> תגרום להפרעת בבואה?</li></ol>)}<Reveal label="חשיפת פתרון לפי שלבים" steps={[<p><bdi dir="ltr">f<sub>LO,min</sub> = 540 + 455 = 995 kHz</bdi><br/><bdi dir="ltr">f<sub>LO,max</sub> = 1600 + 455 = 2055 kHz</bdi></p>, <p><bdi dir="ltr">f<sub>LO</sub> = 657 + 455 = 1112 kHz</bdi></p>, <p><bdi dir="ltr">f<sub>IM</sub> = 657 + 2·455 = 1567 kHz</bdi>. התחנה ב־1567 kHz היא תדר הבבואה ולכן תומר לאותו IF.</p>]}/></> },
  { chapter: chapters[2], title: "למה בתחום AM מעדיפים הזרקה גבוהה?", minutes: 7, className: "injectionAnalysis", takeaway: "הזרקה גבוהה מצמצמת מאוד את תחום כוונון ה־LO ואת שינוי הקיבול הדרוש.", notes: ["הציגו את תחום AM כ־540–1600 kHz ואת IF כדוגמה 455 kHz.", "חשבו תחומי LO בשתי השיטות, ואז יחס תדרים ויחס קיבול אידאלי.", "הבהירו שהיחס מבוסס על מעגל LC אידאלי, C∝1/f², והוא אומדן להשוואה.", "בהזרקה נמוכה, בקצה 540 kHz מתקבל LO=85 kHz; נוסחת תדר הבבואה נותנת תדר חיובי רק כאשר תדר התחנה לפחות פי שניים מתדר הביניים."], content: <><div className={styles.injectionCompare}><article><h3>הזרקה גבוהה</h3><div className={styles.parameterList} dir="ltr"><p><b>f<sub>LO</sub></b><span>995–2055 kHz</span></p><p><b>יחס תדרי קצה</b><span>2.06 : 1</span></p><p><b>C<sub>max</sub>/C<sub>min</sub></b><span>≈ 4.3 : 1</span></p></div><p className={styles.rangeDerivation} dir="ltr">540 + 455 = 995 kHz<br/>1600 + 455 = 2055 kHz</p></article><article><h3>הזרקה נמוכה</h3><div className={styles.parameterList} dir="ltr"><p><b>f<sub>LO</sub></b><span>85–1145 kHz</span></p><p><b>יחס תדרי קצה</b><span>13.47 : 1</span></p><p><b>C<sub>max</sub>/C<sub>min</sub></b><span>≈ 181 : 1</span></p></div><p className={styles.rangeDerivation} dir="ltr">540 − 455 = 85 kHz<br/>1600 − 455 = 1145 kHz</p></article></div><p className={styles.note}>במעגל LC אידאלי <bdi dir="ltr">C∝1/f²</bdi>; לכן יחס הקיבולים הוא ריבוע יחס התדרים.</p></> },
  { chapter: chapters[2], title: "תרגיל: האם 1567 kHz היא בבואה?", interactive: true, minutes: 6, takeaway: "הבבואה נמצאת בצד השני של LO, במרחק IF זהה.", notes: ["בקשו לסמן RF, LO ו־IM על ציר אחד.", "הבחינו בין תדר התחנה הרצויה לבין האות המפריע.", "בדקו חיבור יחידות וסדר גודל."], content: <>{card("תחנה רצויה", <div className={styles.parameterList} dir="ltr"><p><b>f<sub>RF</sub></b><span>657 kHz</span></p><p><b>f<sub>LO</sub></b><span>1112 kHz</span></p><p><b>f<sub>IF</sub></b><span>455 kHz</span></p></div>)}{card("נסו לבד", <p>חשבו את תדר הבבואה. האם אות ב־<bdi dir="ltr">1567 kHz</bdi> יוצר אותו IF?</p>)}<Reveal label="חשיפת הפתרון" steps={[<p><bdi dir="ltr">f<sub>IM</sub> = f<sub>LO</sub> + f<sub>IF</sub></bdi></p>, <p><bdi dir="ltr">f<sub>IM</sub> = 1112 + 455 = 1567 kHz</bdi></p>, <p>כן. גם <bdi dir="ltr">1567 kHz</bdi> נמצא במרחק <bdi dir="ltr">455 kHz</bdi> מה־LO, ולכן הוא יכול לעבור לאותו IF.</p>]}/></> },
  { chapter: chapters[3], title: "הפסקה", minutes: 10, takeaway: "בהמשך: נחלץ את אות השמע ונבקר את עוצמתו.", notes: ["הפסקה של עשר דקות.", "לאחר ההפסקה חזרו מגלאי המעטפת אל בקרת AGC."], content: <div className={styles.card}><h3>10 דקות להפסקה</h3><p className={styles.lead}>אחרי ההפסקה: גלאי מעטפת, תכנון RC ובקרת הגבר אוטומטית.</p></div> },
  { chapter: chapters[3], title: "פשרת הבחירה בתדר הביניים", minutes: 4, takeaway: "IF גבוה מרחיק את הבבואה, אבל דורש Q גבוה מאוד כדי להעביר ערוץ צר; IF נמוך מאפשר סינון חד יותר.", notes: ["השוו בתנאי דרישה זהה לרוחב פס ערוץ של 10 kHz.", "Q=1070 אינו סלקטיביות גרועה: זו דרישת Q גבוהה וקשה למימוש למסנן חד־שלבי ב־10.7 MHz.", "הציגו את הערכים כדוגמאות תכנון ולא כערכים אוניברסליים."], content: <div className={styles.ifTradeoff}>{formula(String.raw`Q=\frac{f_{IF}}{BW}`)}<table><thead><tr><th>תדר ביניים</th><th>מרחק הבבואה</th><th>Q לרוחב פס 10 kHz</th><th>משמעות</th></tr></thead><tbody><tr><th><bdi dir="ltr">455 kHz</bdi></th><td><bdi dir="ltr">910 kHz</bdi></td><td><bdi dir="ltr">45.5</bdi></td><td>סינון חד קל יותר; הבבואה קרובה יותר לתחנה.</td></tr><tr><th><bdi dir="ltr">10.7 MHz</bdi></th><td><bdi dir="ltr">21.4 MHz</bdi></td><td><bdi dir="ltr">1070</bdi></td><td>דחיית בבואה טובה יותר; Q כזה לפס צר קשה למימוש בדרגה יחידה.</td></tr></tbody></table><p className={styles.note}>באותו רוחב פס מוחלט, <bdi dir="ltr">Q=f<sub>IF</sub>/BW</bdi>. שני הערכים הם דוגמאות; הם אינם קובעים לבדם את ביצועי המקלט.</p></div> },
  { chapter: chapters[3], title: "איך המרה כפולה משלבת את היתרונות?", minutes: 7, takeaway: "המרה ראשונה לתדר גבוה משפרת דחיית בבואה; המרה שנייה לתדר נמוך מאפשרת סינון חד לערוץ.", notes: ["הציגו זאת כארכיטקטורת פשרה אפשרית, לא כתכונה של כל מקלט.", "עקבו אחרי אות התחנה דרך שני ערבלים ומסנני IF.", "בדוגמה, LO₂ נמוך מ־IF₁ ב־455 kHz: 10.7−10.245=0.455 MHz.", "הדגישו את המחיר: יותר דרגות, מסננים ומתנדים לתכנון."], content: <>{card("מסלול המרה כפולה", <div className={styles.architectureFlow}><b>RF נבחר</b><i>←</i><b>ערבל 1</b><i>←</i><b>IF ראשון<br/><bdi dir="ltr">10.7 MHz</bdi></b><i>←</i><b>מסנן IF 1</b><i>←</i><b>ערבל 2</b><i>←</i><b>IF שני<br/><bdi dir="ltr">455 kHz</bdi></b><i>←</i><b>מסנן חד</b></div>)}<div className={styles.parameterList} dir="ltr"><p><b>f<sub>LO₂</sub></b><span>10.245 MHz</span></p><p><b>בדיקת ההפרש</b><span>10.700 − 10.245 = 0.455 MHz</span></p></div><div className={styles.two}>{card("מה מרוויחים?", <p>ה־IF הראשון מגדיל את מרחק תדר הבבואה; ה־IF השני מקל על השגת סלקטיביות לערוץ.</p>)}{card("מה המחיר?", <p>נדרשים ערבל, מתנד ומסנן נוספים, לצד תכנון של דחיית תדרי ביניים לא רצויים.</p>)}</div><p className={styles.note}>דוגמת פשרה: <bdi dir="ltr">10.7 MHz → 455 kHz</bdi>, בהזרקה נמוכה בשלב השני. ערכי IF בפועל תלויים בתחום התדר ובתכנון המקלט.</p></> },
  { chapter: chapters[4], title: "גלאי מעטפת: מה־IF אל אות השמע", minutes: 2, takeaway: "דיודה וקבוע זמן RC מתאים עוקבים אחרי המעטפת ומחלצים את המידע.", notes: ["הגדירו IF כעת כתדר הנושא שמגיע לגלאי.", "תארו את טעינת הקבל בשיאים ואת פריקתו דרך הנגד.", "הדיודה מיישרת; R ו־C קובעים את העקיבה."], content: <>{card("מעגל עקרוני", <div className={styles.blockFlow}><b>אות AM ב־IF</b><b>דיודה D</b><b>צומת מוצא</b><b>R ו־C במקביל לאדמה</b><b>אות שמע</b></div>)}<div className={styles.three}>{card("בכל שיא", <p>הדיודה מוליכה והקבל נטען בקירוב לשיא המעטפת.</p>)}{card("בין שיאים", <p>הדיודה נסגרת והקבל נפרק דרך הנגד.</p>)}{card("מטרה", <p>המוצא יעקוב אחרי המעטפת בלי תנודות נושא גדולות ובלי לחתוך את הירידה.</p>)}</div></> },
  { chapter: chapters[4], title: "גלאי מעטפת: הדיודה והקבל", minutes: 3, takeaway: "הדיודה טוענת את הקבל בשיאי המעטפת.", notes: ["הראו את כיוון הזרם דרך הדיודה בזמן הולכה.", "הסבירו שהקבל שומר מתח בין שיאי הנושא.", "אל תסבירו עדיין את בחירת R ו־C."], content: <>{card("חלק ראשון במעגל", <div className={styles.blockFlow}><b>אות AM ב־IF</b><b>דיודה D</b><b>קבל C</b></div>)}<p className={styles.lead}>בשיא חיובי של האות, הדיודה מוליכה והקבל נטען בקירוב למתח המעטפת.</p></> },
  { chapter: chapters[4], title: "גלאי מעטפת: מסלול הפריקה", minutes: 3, takeaway: "בין שיאים הקבל נפרק דרך R ומפיק את שינויי המעטפת בתדר השמע.", notes: ["עקבו אחרי המתח על הקבל בין שיאי הנושא.", "הצביעו על הנגד כנתיב הפריקה.", "קשרו בין שינוי איטי של המעטפת לבין אות השמע."], content: <>{card("בין שיאים", <div className={styles.blockFlow}><b>דיודה סגורה</b><b>קבל C</b><b>נגד R</b></div>)}<p>הקבל נפרק דרך <bdi dir="ltr">R</bdi>. אם הפריקה מותאמת, המתח במוצא עוקב אחרי מעטפת השמע.</p><p className={styles.note}>ה־RC קובע את מהירות הפריקה; נבדוק את הפשרה בשקפים הבאים.</p></> },
  { chapter: chapters[4], title: "מה רוצים לראות במוצא הגלאי?", minutes: 1, takeaway: "המוצא צריך להחליק את תנודות הנושא בלי לעוות את מעטפת השמע.", notes: ["סכמו את תפקיד הדיודה, הקבל והנגד.", "שאלו מה קורה אם RC קטן או גדול מדי.", "העבירו לשקף התנאים לבחירת RC."], content: <div className={styles.three}>{card("להחליק", <p>להקטין את אדוות תדר הנושא.</p>)}{card("לעקוב", <p>לשמר את שינויי מעטפת השמע.</p>)}{card("להימנע", <p>מחיתוך או עיוות של הירידה במעטפת.</p>)}</div> },
  { chapter: chapters[4], title: "בוחרים RC: בין הנושא לשמע", minutes: 5, takeaway: "קבוע הזמן גדול ממחזור הנושא וקטן מספיק לעקוב אחרי מעטפת השמע.", notes: ["תקנו את ניסוח התנאים: RC צריך להיות גדול ממחזור הנושא וקטן מהגבול העליון שתלוי בתדר השמע ובעומק האפנון.", "הציגו את אי־השוויון הרשמי כקירוב תכנוני, לא כשוויון מדויק.", "עיוות אלכסוני מתרחש כשפריקת RC איטית מדי בירידת המעטפת."], content: <>{formula(String.raw`\frac{1}{f_c}\ll RC\ll\frac{1}{2f_m\ln\left(\frac{1+m_a}{1-m_a}\right)}`)}<div className={styles.three}>{card("RC קטן מדי", <p>הקבל נפרק מהר מדי; אדוות תדר הנושא נשארות במוצא.</p>)}{card("תחום מתאים", <p>מספיק זמן להחליק בין מחזורי הנושא, ועדיין לעקוב אחרי שינויי המעטפת.</p>)}{card("RC גדול מדי", <p>הפריקה אינה עוקבת אחרי ירידת המעטפת ונוצר עיוות אלכסוני.</p>)}</div><p className={styles.note}>כאן <bdi dir="ltr">f<sub>c</sub>=f<sub>IF</sub>=455 kHz</bdi> הוא תדר הנושא בגלאי, <bdi dir="ltr">f_m</bdi> הוא תדר השמע ו־<bdi dir="ltr">m<sub>a</sub></bdi> הוא מקדם האפנון. הנוסחה תקפה למעטפת סינוסואידלית ול־<bdi dir="ltr">0 ≤ m<sub>a</sub> &lt; 1</bdi>. ככל ש־<bdi dir="ltr">m<sub>a</sub>→1</bdi>, המעטפת יורדת בתלילות והגבול העליון ל־<bdi dir="ltr">RC</bdi> קטן.</p></> },
  { chapter: chapters[4], title: "פשרת RC: שני גבולות", minutes: 5, takeaway: "RC צריך להיות ארוך ביחס למחזור הנושא וקצר מספיק לעקוב אחרי המעטפת.", notes: ["הגדירו את כל הגדלים: fc נושא, fm שמע, ma עומק אפנון.", "הסבירו את המשמעות הפיזיקלית של כל צד באי־שוויון.", "ציינו שהגבולות מקורבים ותלויי תנאי המעטפת."], content: <>{formula(String.raw`\frac{1}{f_c}\ll RC\ll\frac{1}{2f_m\ln\left(\frac{1+m_a}{1-m_a}\right)}`)}<div className={styles.two}>{card("גבול תחתון", <p>RC גדול ממחזור הנושא, כדי להפחית אדוות.</p>)}{card("גבול עליון", <p>RC קטן מהגבול שתלוי בתדר השמע ובעומק האפנון, כדי לעקוב אחרי המעטפת.</p>)}</div><p className={styles.note}>הנוסחה היא קירוב לפי נוסחאון הקורס למעטפת סינוסואידלית, כאשר <bdi dir="ltr">0 ≤ ma &lt; 1</bdi>.</p></> },
  { chapter: chapters[4], title: "תרגול: נתונים ובחירת קבוע זמן", interactive: true, minutes: 5, takeaway: "לפי נוסחת הנוסחאון: כ־2.20 μs ≪ RC ≪ 45.5 μs; בחירה 15 μs נותנת 1.5 nF.", notes: ["תנו 5 דקות עבודה בזוגות לפני פתיחת הפתרון.", "המירו kHz ל־Hz; התוצאה של הגבול היא שניות.", "הבחירה 15 μs היא ערך דוגמה בתוך התחום, לא הפתרון היחיד."], content: <>{card("נתונים", <div className={styles.parameterList} dir="ltr"><p><b>f<sub>c</sub></b><span>455 kHz</span></p><p><b>f<sub>m</sub></b><span>5 kHz</span></p><p><b>m<sub>a</sub></b><span>0.8</span></p><p><b>R</b><span>10 kΩ</span></p></div>)}<p>מצאו תחום מותר ל־<bdi dir="ltr">τ=RC</bdi>, ואז בחרו <bdi dir="ltr">C</bdi> עבור <bdi dir="ltr">τ=15 μs</bdi>.</p><Reveal label="חשיפת פתרון" steps={[<p><bdi dir="ltr">f<sub>c</sub>=455,000 Hz</bdi><br/><bdi dir="ltr">f<sub>m</sub>=5,000 Hz</bdi></p>, <p>גבול תחתון: <bdi dir="ltr">1/455000 = 2.20 μs</bdi>. גבול עליון: <bdi dir="ltr">1/[2·5000·ln(9)] = 45.5 μs</bdi>.</p>, <p><bdi dir="ltr">2.20 μs ≪ RC ≪ 45.5 μs</bdi>. אם <bdi dir="ltr">RC=15 μs</bdi> ו־<bdi dir="ltr">R=10 kΩ</bdi>, אז <bdi dir="ltr">C=15×10⁻⁶/10⁴=1.5 nF</bdi>.</p>]}/></> },
  { chapter: chapters[4], title: "תרגול RC: חישוב הגבולות", interactive: true, minutes: 3, takeaway: "הגבול התחתון כ־2.20 μs והעליון כ־45.5 μs.", notes: ["הזכירו שה־μs מתקבל מהמרת שניות.", "הציבו את m=0.8 בגבול העליון: ln(9).", "הקפידו להבדיל בין גבולות לבין בחירה יחידה."], content: <>{card("הנתונים", <div className={styles.parameterList} dir="ltr"><p><b>f<sub>c</sub></b><span>455 kHz</span></p><p><b>f<sub>m</sub></b><span>5 kHz</span></p><p><b>m<sub>a</sub></b><span>0.8</span></p></div>)}<p>השתמשו בגבולות שבנוסחאון כדי למצוא את תחום <bdi dir="ltr">τ=RC</bdi>.</p><Reveal label="חישוב הגבולות" steps={[<p><bdi dir="ltr">455 kHz = 455,000 Hz</bdi>; לכן <bdi dir="ltr">1/fc = 2.20 μs</bdi>.</p>, <p><bdi dir="ltr">ln((1+0.8)/(1−0.8)) = ln(9)</bdi>; הגבול העליון הוא <bdi dir="ltr">1/(2·5000·ln(9)) = 45.5 μs</bdi>.</p>, <p>לכן תחום התכנון בקירוב: <bdi dir="ltr">2.20 μs ≪ RC ≪ 45.5 μs</bdi>.</p>]}/></> },
  { chapter: chapters[4], title: "תרגול RC: מוצאים קבל מתאים", interactive: true, minutes: 4, takeaway: "עבור R של 10 kΩ ו־RC של 15 μs מתקבל C של 1.5 nF.", notes: ["הסבירו ש־15 μs היא בחירה אפשרית בתוך התחום, לא ערך יחיד.", "הציגו את הקשר C=τ/R לפני ההצבה.", "בדקו ממד: שנייה חלקי אוהם שווה פאראד."], content: <>{card("בחירה מתוך התחום", <div className={styles.parameterList} dir="ltr"><p><b>τ</b><span>15 μs</span></p><p><b>R</b><span>10 kΩ</span></p></div>)}<p>חשבו את הקיבול <bdi dir="ltr">C</bdi> הדרוש.</p><Reveal label="פתרון" steps={[<p><bdi dir="ltr">τ = RC</bdi>, ולכן <bdi dir="ltr">C = τ/R</bdi>.</p>, <p><bdi dir="ltr">C = 15×10⁻⁶ s / 10×10³ Ω = 1.5×10⁻⁹ F = 1.5 nF</bdi>.</p>, <p>הערך <bdi dir="ltr">15 μs</bdi> נמצא בין <bdi dir="ltr">2.20 μs</bdi> ל־<bdi dir="ltr">45.5 μs</bdi>, ולכן הוא בחירה סבירה לפי הקירוב שנלמד.</p>]}/></> },
  { chapter: chapters[4], title: "AGC: חילוץ רמת האות ומשוב שלילי", minutes: 5, className: "agcSlide", takeaway: "מסנן LPF איטי מחלץ רמת DC אחרי הגלאי ומחזיר משוב שלילי שמווסת את הגבר RF/IF.", notes: ["הצביעו על הגלאי כמקום שבו אות השמע ורמת האות נגישים.", "LPF איטי מסנן את רכיבי השמע ומותיר מתח בקרה שמשתנה לאט.", "הציגו את הסימן: אות חזק מעלה את מתח הבקרה ומקטין הגבר; אות חלש מאפשר יותר הגבר."], content: <>{card("מסלול אות ומשוב", <div className={styles.agcSchematic}><div className={styles.agcForward}><b>דרגות RF/IF</b><i>אות</i><b>ערבל ומסנן IF</b><i>אות</i><b>גלאי AM</b><i>שמע</i><b>רמקול</b></div><div className={styles.agcFeedback}><b>מוצא הגלאי</b><i>מעטפת</i><b>LPF איטי</b><i>רכיב DC</i><b>מתח AGC</b><i>משוב שלילי</i><b>בקרת הגבר RF/IF</b></div></div>)}<div className={styles.two}>{card("תחנה חזקה", <p>רמת DC עולה → מתח AGC מפחית את הגבר RF/IF.</p>)}{card("תחנה חלשה", <p>רמת DC יורדת → הבקרה מאפשרת הגבר גדול יותר, בגבולות המקלט.</p>)}</div><p className={styles.note}>הבקרה מצמצמת שינויי עוצמה בין תחנות; היא אינה מבטיחה עוצמה קבועה ואינה מבטלת רעש.</p></> },
  { chapter: chapters[5], title: "ארבעה מדדים לאיכות המקלט", minutes: 4, takeaway: "רגישות, ברירות, נאמנות ו־SNR מודדים תכונות שונות, וכל מדד זקוק לתנאי בדיקה מוגדרים.", notes: ["הדגישו שכל מספר רגישות תלוי בתנאי הבדיקה, ולכן לא ניתנת כאן סף µV אוניברסלי.", "תחום 50 Hz–5 kHz הוא דוגמת תחום שמע למערכת הנלמדת, לא תקן מחייב לכל מקלט.", "ודאו שמדידת הספק SNR נעשית באותו רוחב פס ובאותה נקודת מדידה."], content: <div className={styles.receiverMetrics}><article><h3>ברירות</h3><p>הנחתת תחנה סמוכה, נמדדת ב־<bdi dir="ltr">dB</bdi> להיסט תדר ורוחב פס מוגדרים.</p></article><article><h3>רגישות</h3><p>מתח הכניסה המזערי באנטנה, ב־<bdi dir="ltr">µV</bdi>, לקבלת איכות או יחס אות־לרעש שנקבעו.</p></article><article><h3>נאמנות</h3><p>אחידות הגבר ושחזור בתחום השמע; דוגמת טווח: <bdi dir="ltr">50 Hz–5 kHz</bdi>.</p></article><article><h3>יחס אות לרעש</h3><p><bdi dir="ltr">SNR=10 log<sub>10</sub>(P<sub>signal</sub>/P<sub>noise</sub>) dB</bdi></p><p>ההספקים נמדדים באותה נקודה וברוחב פס זהה.</p></article></div> },
  { chapter: chapters[5], title: "מבחינים בין מאפייני המקלט", minutes: 2, takeaway: "ברירות מפרידה תחנות; רגישות מתארת קליטת אות חלש; נאמנות מתארת שחזור.", notes: ["הציגו כל מונח בנפרד לפני ההשוואה.", "שאלו איזה מאפיין עוזר כשיש תחנה סמוכה חזקה.", "קשרו ברירות למסנני RF/IF שכבר נלמדו."], content: <div className={styles.three}>{card("ברירות · Selectivity", <p>הפרדת התחנה הרצויה מתחנות סמוכות.</p>)}{card("רגישות · Sensitivity", <p>האות החלש ביותר שניתן לקלוט לפי קריטריון מוגדר.</p>)}{card("נאמנות · Fidelity", <p>דיוק שחזור תוכן האות, לרבות תחום השמע.</p>)}</div> },
  { chapter: chapters[5], title: "כרטיס יציאה: בדקו את ההבנה", interactive: true, minutes: 5, takeaway: "מתדר תחנה של 1000 kHz ותדר ביניים של 455 kHz מתקבלים מתנד מקומי של 1455 kHz ותדר בבואה של 1910 kHz.", notes: ["אספו תשובות לפני חשיפת הפתרון.", "דרשו יחידות בכל שורה.", "סיימו בחיבור השרשרת: בחירת תחנה, המרה, סינון, גילוי ובקרה."], content: <>{card("פתרו לבד", <><p className={styles.lead}>מקלט AM בהזרקה גבוהה מכוון לתחנה. חשבו את המתנד המקומי ואת תדר הבבואה.</p><div className={styles.parameterList} dir="ltr"><p><b>f<sub>RF</sub></b><span>1000 kHz</span></p><p><b>f<sub>IF</sub></b><span>455 kHz</span></p></div></>)}<Reveal label="בדיקת תשובה" steps={[<p><bdi dir="ltr">f<sub>LO</sub> = f<sub>RF</sub> + f<sub>IF</sub> = 1000 + 455 = 1455 kHz</bdi></p>, <p><bdi dir="ltr">f<sub>IM</sub> = f<sub>RF</sub> + 2f<sub>IF</sub> = 1000 + 910 = 1910 kHz</bdi></p>]}/><p className={styles.note}>סיכום: התחנה נבחרת, מומרת ל־IF קבוע, מסוננת, וגלאי המעטפת מחלץ את המידע.</p></> },
];

const extensionSlideCatalog = JSON.stringify(data.map((slide, index) => ({ slideId: `lesson-05-am-${String(index + 1).padStart(2, "0")}`, slideNumber: index + 1, minutes: slide.minutes, title: slide.title, chapter: slide.chapter, section: false, interactive: Boolean(slide.interactive) })));
export { data as lesson05Slides };

function Reveal({ label, steps }: { label: string; steps: React.ReactNode[] }) {
  const [shown, setShown] = useState(0);
  return <div className={styles.reveal}><button type="button" onClick={() => setShown((v) => v >= steps.length ? 0 : v + 1)}>{shown === 0 ? label : shown === steps.length ? "הסתרת הפתרון" : "הצגת השלב הבא"}</button>{shown > 0 && <ol>{steps.slice(0, shown).map((step, i) => <li key={i}>{step}</li>)}</ol>}</div>;
}

function Tuner() {
  const [rf, setRF] = useState(657);
  const [side, setSide] = useState<"high" | "low">("high");
  const ifHz = 455; const lo = side === "high" ? rf + ifHz : rf - ifHz;
  const image = side === "high" ? rf + 2 * ifHz : rf - 2 * ifHz;
  const hasImage = image > 0;
  const values = hasImage ? [rf, lo, image] : [rf, lo];
  const min = Math.min(...values) - 70; const max = Math.max(...values) + 70;
  const x = (v: number) => 3 + (v - min) / (max - min) * 94;
  const marks = [{ key: "RF", value: rf }, { key: "LO", value: lo }, ...(hasImage ? [{ key: "IM", value: image }] : [])].sort((a, b) => a.value - b.value);
  return <div className={styles.tuner}>
    <div className={styles.injectionToggle} role="group" aria-label="בחירת צד הזרקת המתנד המקומי">
      <button type="button" aria-pressed={side === "high"} onClick={() => setSide("high")}>הזרקה גבוהה · <bdi dir="ltr">f<sub>LO</sub> &gt; f<sub>RF</sub></bdi></button>
      <button type="button" aria-pressed={side === "low"} onClick={() => setSide("low")}>הזרקה נמוכה · <bdi dir="ltr">f<sub>LO</sub> &lt; f<sub>RF</sub></bdi></button>
    </div>
    <label><span dir="rtl">תדר התחנה <bdi dir="ltr">RF</bdi></span><output dir="ltr">{rf} kHz</output><input type="range" min="540" max="1600" step="1" value={rf} onChange={(e) => setRF(Number(e.target.value))}/></label>
    <div className={styles.tunerValues}><span><bdi dir="ltr">f<sub>RF</sub></bdi><bdi dir="ltr">{rf} kHz</bdi></span><span><bdi dir="ltr">f<sub>IF</sub></bdi><bdi dir="ltr">455 kHz</bdi></span><span><bdi dir="ltr">f<sub>LO</sub></bdi><bdi dir="ltr">{lo} kHz</bdi></span>{hasImage && <span><bdi dir="ltr">f<sub>IM</sub></bdi><bdi dir="ltr">{image} kHz</bdi></span>}</div>
    <div className={styles.frequencyAxis} aria-label="ציר תדר עם סימוני התחנה, המתנד המקומי ותדר הבבואה"><div className={styles.frequencyAxisLine}/>{marks.map((mark) => <i key={mark.key} style={{ left: `${x(mark.value)}%` }}><b>{mark.key}</b><small>{mark.value}</small></i>)}</div>
    <p>{hasImage ? <>ההפרש <bdi dir="ltr">|RF−LO|</bdi> הוא <bdi dir="ltr">455 kHz</bdi>; גם הבבואה נמצאת במרחק זהה מה־<bdi dir="ltr">LO</bdi>.</> : <>בנקודה זו <bdi dir="ltr">f<sub>RF</sub>−2f<sub>IF</sub>={image} kHz</bdi>, ערך שלילי. אין תדר בבואה חיובי לפי התוכנית הזאת.</>}</p>
  </div>;
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
  const slideSkin = slide.className ? styles[slide.className] : "";
  const compactTitle = slide.title.length > 34 ? styles["compact-title"] : "";
  return <div ref={host} className={hostClass}>
    <div className={playerStyles.stageBox} style={{ width: 1600 * scale, height: 900 * scale }}>
      <div className={playerStyles.slideCanvas} style={{ transform: `scale(${scale})` }} data-current-slide="true" data-slide-id={`lesson-05-am-${String(index + 1).padStart(2, "0")}`} data-slide-id-source="authored" data-slide-number={index + 1} data-minutes={slide.minutes}>
      <div className={`sl l5-slide ${compactTitle} ${slideSkin ?? ""}`}><header className="sl-h"><div className="sl-eb">{slide.chapter}</div><h2>{bidiQuantities(slide.title)}</h2></header><div className="sl-body">{slide.content}</div><div className="sl-tk"><span>העיקר</span>{bidiQuantities(slide.takeaway)}</div><footer className="sl-f"><span>{slide.chapter}</span><span dir="ltr">{String(index + 1).padStart(2, "0")}</span></footer></div>
      </div>
    </div>
  </div>;
}

export default function Lesson05Player({ lecturerMode = false }: { lecturerMode?: boolean }) {
  const stateKey = "syllo:student:lesson:lesson-05";
  const [index, setIndex] = useLessonState(stateKey + ":index", 0);
  const [seen, setSeen] = useLessonState<number[]>(stateKey + ":seen", []);
  const [outlineOpen, setOutlineOpen] = useLessonState(stateKey + ":outline", true);
  const [notesOpen, setNotesOpen] = useLessonState(stateKey + ":context", false);
  const [opened, setOpened] = useState(false);
  const [present, setPresent] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState<"unclear" | "example" | "question" | "mistake" | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackEditing, setFeedbackEditing] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackBySlide, setFeedbackBySlide] = useState<Record<number, { t: "unclear" | "example" | "question" | "mistake"; text: string; ts: number }>>({});
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({ [chapters[0]]: true });
  const playerRef = useRef<HTMLDivElement>(null);
  const slide = data[index];
  const currentFeedback = feedbackBySlide[index + 1];
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("syllo:student:lesson:lesson-05:feedback");
      if (saved) setFeedbackBySlide(JSON.parse(saved) as typeof feedbackBySlide);
    } catch { /* Feedback remains usable when browser storage is unavailable. */ }
    setFeedbackReady(true);
  }, []);
  useEffect(() => {
    if (!feedbackReady) return;
    try { window.localStorage.setItem("syllo:student:lesson:lesson-05:feedback", JSON.stringify(feedbackBySlide)); }
    catch { /* The panel still updates for this visit if storage is disabled. */ }
  }, [feedbackBySlide, feedbackReady]);
  const notifyLecturer = (eventName: "open" | "exit") => window.dispatchEvent(new CustomEvent(eventName === "open" ? "syllo:lesson-player-open" : "syllo:lesson-player-exit"));
  const enterPresentation = () => {
    setPresent(true);
    if (document.fullscreenEnabled && !document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => {});
  };
  const exitPresentation = () => {
    setPresent(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };
  useEffect(() => {
    setSeen((value) => value.includes(index + 1) ? value : [...value, index + 1]);
    setOpenChapters((value) => ({ ...value, [slide.chapter]: true }));
  }, [index, setSeen, slide.chapter]);
  useEffect(() => {
    setFeedbackError("");
    setFeedbackEditing(false);
    setFeedbackChoice(currentFeedback?.t ?? null);
    setFeedbackComment(currentFeedback?.text ?? "");
  }, [index, feedbackReady, currentFeedback?.t, currentFeedback?.text]);
  const visibleConceptIds = index < 4
    ? ["carrier-wave", "modulation-am", "spectrum-am", "receiver", "radio-frequency"]
    : index < 10
      ? ["receiver", "radio-frequency", "trf-receiver", "filters"]
      : index < 34
        ? ["receiver", "radio-frequency", "mixer", "local-oscillator", "intermediate-frequency", "image-frequency", "filters"]
        : ["receiver", "intermediate-frequency", "envelope-detector", "agc"];
  const previewSlide = data[0];
  const go = (next: number) => setIndex(Math.max(0, Math.min(data.length - 1, next)));
  const sendFeedback = async () => {
    if (!feedbackChoice || feedbackBusy) return;
    setFeedbackBusy(true);
    setFeedbackError("");
    try {
      const idKey = "syllo:anonymous-client-id";
      let anonymousClientId = window.localStorage.getItem(idKey);
      if (!anonymousClientId) {
        anonymousClientId = window.crypto.randomUUID();
        window.localStorage.setItem(idKey, anonymousClientId);
      }
      const suffix = String(index + 1).padStart(2, "0");
      const response = await fetch("/api/student/slide-feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          anonymousClientId,
          courseId: "communication-systems",
          lessonId: "lesson-05",
          slideId: `lesson-05-am-${suffix}`,
          slideNumber: index + 1,
          deckVersion: "lesson-05-am-v3",
          feedbackType: { unclear: "NOT_UNDERSTOOD", example: "NEED_EXAMPLE", question: "QUESTION", mistake: "POSSIBLE_ERROR" }[feedbackChoice],
          optionalComment: feedbackComment.trim(),
          submittedAt: new Date().toISOString(),
          pageUrl: window.location.href,
          idempotencyKey: `communication-systems:lesson-05:slide-${suffix}`,
        }),
      });
      if (!response.ok) throw new Error("שליחת המשוב נכשלה. נסו שוב.");
      const savedFeedback = { t: feedbackChoice, text: feedbackComment.trim(), ts: Date.now() };
      const nextFeedback = { ...feedbackBySlide, [index + 1]: savedFeedback };
      setFeedbackBySlide(nextFeedback);
      window.dispatchEvent(new CustomEvent("syllo:lesson-feedback-update", { detail: { lessonId: "lesson-05", feedback: nextFeedback } }));
      setFeedbackEditing(false);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "שליחת המשוב נכשלה. נסו שוב.");
    } finally {
      setFeedbackBusy(false);
    }
  };
  const deleteFeedback = async () => {
    setFeedbackBusy(true);
    setFeedbackError("");
    try {
      const anonymousClientId = window.localStorage.getItem("syllo:anonymous-client-id");
      if (anonymousClientId) {
        const suffix = String(index + 1).padStart(2, "0");
        const response = await fetch("/api/student/slide-feedback", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ anonymousClientId, courseId: "communication-systems", lessonId: "lesson-05", slideId: `lesson-05-am-${suffix}` }),
        });
        if (!response.ok) throw new Error("ביטול המשוב נכשל. נסו שוב.");
      }
      const nextFeedback = { ...feedbackBySlide };
      delete nextFeedback[index + 1];
      setFeedbackBySlide(nextFeedback);
      window.dispatchEvent(new CustomEvent("syllo:lesson-feedback-update", { detail: { lessonId: "lesson-05", feedback: nextFeedback } }));
      setFeedbackEditing(false);
      setFeedbackChoice(null);
      setFeedbackComment("");
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "ביטול המשוב נכשל. נסו שוב.");
    } finally {
      setFeedbackBusy(false);
    }
  };
  const selectedFeedbackType = feedbackTypes.find((item) => item.key === (currentFeedback?.t ?? feedbackChoice));
  const studentFeedback = <div className={`${playerStyles.feedback} ${present ? playerStyles.feedbackDark : ""}`}>
    {feedbackOpen && <section className={playerStyles.feedbackPopover} role="dialog" aria-label="משוב על השקף" aria-modal="false">
      <header className={playerStyles.feedbackHeader}><div><b>משוב על השקף</b><span><i dir="ltr">{String(index + 1).padStart(2, "0")}</i> · {slide.title}</span></div><button type="button" aria-label="סגירת משוב" onClick={() => setFeedbackOpen(false)}>×</button></header>
      {currentFeedback && !feedbackEditing ? <div className={playerStyles.feedbackSent}><div className={playerStyles.feedbackSentCard} style={{ "--feedback-color": selectedFeedbackType?.color, "--feedback-soft": selectedFeedbackType?.soft } as React.CSSProperties}><span><FeedbackIcon type={currentFeedback.t} size={18}/></span><div><b>{selectedFeedbackType?.label}</b>{currentFeedback.text && <p>“{currentFeedback.text}”</p>}<small>נשלח · אנונימי למרצה</small></div></div>{feedbackError && <p className={playerStyles.feedbackError} role="alert">{feedbackError}</p>}<div className={playerStyles.feedbackActions}><button type="button" onClick={() => setFeedbackOpen(false)}>סגירה</button><button type="button" onClick={() => { setFeedbackChoice(currentFeedback.t); setFeedbackComment(currentFeedback.text); setFeedbackEditing(true); }}>עריכה</button><button type="button" disabled={feedbackBusy} onClick={() => void deleteFeedback()}>{feedbackBusy ? "מבטל…" : "ביטול המשוב"}</button></div></div> : <div className={playerStyles.feedbackBody}><b>מה תרצו לשתף?</b><div className={playerStyles.feedbackOptions}>{feedbackTypes.map((item) => <button type="button" key={item.key} aria-pressed={feedbackChoice === item.key} className={feedbackChoice === item.key ? playerStyles.feedbackOptionSelected : ""} style={{ "--feedback-color": item.color, "--feedback-soft": item.soft } as React.CSSProperties} onClick={() => setFeedbackChoice(item.key)}><span><FeedbackIcon type={item.key} size={18}/></span><span><b>{item.label}</b><small>{item.hint}</small></span></button>)}</div><textarea rows={3} maxLength={800} value={feedbackComment} onChange={(event) => setFeedbackComment(event.target.value)} placeholder={feedbackChoice === "question" ? "מה השאלה?" : feedbackChoice === "mistake" ? "איפה הטעות?" : "אפשר להוסיף כמה מילים (אופציונלי)"} />{feedbackError && <p className={playerStyles.feedbackError} role="alert">{feedbackError}</p>}<footer><button type="button" disabled={!feedbackChoice || feedbackBusy || (feedbackChoice === "question" && !feedbackComment.trim())} onClick={() => void sendFeedback()}>{feedbackBusy ? "שולח…" : currentFeedback ? "עדכון" : "שליחה"}</button><small>נשמר לשקף הזה · אנונימי למרצה</small></footer></div>}
    </section>}
    <button type="button" className={`${playerStyles.feedbackFab} ${currentFeedback ? playerStyles.feedbackFabSet : ""} ${feedbackOpen ? playerStyles.feedbackFabOpen : ""}`} style={currentFeedback ? { background: selectedFeedbackType?.color } : undefined} aria-label={feedbackOpen ? "סגירת חלונית המשוב" : currentFeedback ? `עריכת משוב: ${selectedFeedbackType?.label}` : "משוב על השקף (F)"} title={currentFeedback ? `המשוב לשקף: ${selectedFeedbackType?.label}` : "משוב על השקף"} aria-expanded={feedbackOpen} onClick={() => setFeedbackOpen((value) => !value)}>{feedbackOpen ? "×" : <FeedbackIcon type={currentFeedback?.t ?? "syllo"} size={currentFeedback ? 24 : 27}/>}</button>
    {!feedbackOpen && currentFeedback && selectedFeedbackType && <span className={playerStyles.feedbackTag} style={{ color: selectedFeedbackType.color }}>{selectedFeedbackType.label}</span>}
  </div>;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === " " && target instanceof HTMLElement && target.closest("button")) return;
      if (["ArrowLeft", "PageDown", " "].includes(event.key)) { event.preventDefault(); go(index + 1); }
      if (["ArrowRight", "PageUp"].includes(event.key)) { event.preventDefault(); go(index - 1); }
      if (event.key === "Escape") { if (feedbackOpen) setFeedbackOpen(false); else if (present) exitPresentation(); else if (notesOpen) setNotesOpen(false); else if (outlineOpen) setOutlineOpen(false); else { notifyLecturer("exit"); setOpened(false); } }
      if (event.key.toLowerCase() === "n") setNotesOpen((value) => !value);
      if (event.key.toLowerCase() === "p") present ? exitPresentation() : enterPresentation();
      if (!lecturerMode && event.key.toLowerCase() === "f") setFeedbackOpen((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedbackOpen, index, lecturerMode, notesOpen, outlineOpen, present]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width < 1192) setNotesOpen(false);
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  if (!opened) return <section className={`l4-player ${playerStyles.preview}`} aria-label="תצוגה מקדימה של מערך השיעור" data-lesson-player="true" data-course-id="communication-systems" data-lesson-id="lesson-05" data-deck-version="lesson-05-am-v3" data-slides={extensionSlideCatalog}>
    <div className={playerStyles.previewStage}><ScaledSlide slide={previewSlide} index={0} hostClass={playerStyles.stage}/></div>
    <footer className={playerStyles.previewFooter}><div><strong>מערך שיעור 05 · מקלט AM — סופר־הטרודיין וגלאי מעטפת</strong><span>{data.length} שקפים</span></div><button type="button" className={playerStyles.openLessonButton} onClick={() => { notifyLecturer("open"); setIndex(0); setOutlineOpen(true); setNotesOpen(false); setOpened(true); }}>פתיחת מערך השיעור <span aria-hidden="true">←</span></button></footer>
  </section>;

  if (typeof document === "undefined") return null;
  if (present) return createPortal(<div dir="rtl" data-lesson-player="true" data-course-id="communication-systems" data-lesson-id="lesson-05" data-deck-version="lesson-05-am-v3" data-slides={extensionSlideCatalog} className={`l4-player syllo-student-app ${playerStyles.present}`} role="dialog" aria-label="הצגת שקף שיעור 05">
    <ScaledSlide slide={slide} index={index} hostClass={playerStyles.presentStage} />
    <div className={playerStyles.presentControls}><button type="button" onClick={() => go(index - 1)}>הקודם</button><span dir="ltr">{String(index + 1).padStart(2, "0")} / {data.length}</span><button type="button" onClick={() => go(index + 1)}>הבא</button><button type="button" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות מרצה · N</button><button type="button" onClick={exitPresentation}>יציאה · Esc</button></div>
    {!lecturerMode && studentFeedback}
    {notesOpen && <aside className={playerStyles.speakerNotes}><b>הערות מרצה</b><p>{slide.notes.join(" · ")}</p></aside>}
  </div>, document.body);

  return createPortal(<div ref={playerRef} dir="rtl" data-lesson-player="true" data-course-id="communication-systems" data-lesson-id="lesson-05" data-deck-version="lesson-05-am-v3" data-slides={extensionSlideCatalog} className={`l4-player syllo-student-app ${playerStyles.player} ${outlineOpen ? playerStyles.withOutline : ""} ${notesOpen ? playerStyles.withContext : ""}`} aria-label="מערך שיעור 05">
    <header className={playerStyles.playerToolbar}>
      <div className={playerStyles.lessonIdentity}><a className={playerStyles.courseBreadcrumb} href={lecturerMode ? "/lecturer/sessions#lessons" : "/course/communication-systems/lessons"} onClick={() => notifyLecturer("exit")}><span className={playerStyles.breadcrumbArrow} aria-hidden="true">›</span><span><small>{lecturerMode ? "חזרה לפנל המרצים" : "חזרה למערכי השיעור"}</small><b>מערכות תקשורת</b></span></a><span className={playerStyles.toolbarDivider}/><span className={playerStyles.lessonBadge} dir="ltr">05</span><span className={playerStyles.lessonTitle}>מקלט AM — סופר־הטרודיין וגלאי מעטפת</span></div>
      <nav className={playerStyles.loopPhases} aria-label="שלבי השיעור"><a className={playerStyles.phaseActive} href={lecturerMode ? "/lecturer/lessons/lesson-05/slides" : "/course/communication-systems/lessons/lesson-05/slides"}><span dir="ltr">01</span>מערך השיעור</a><a href={lecturerMode ? "/lecturer/lessons/lesson-05/practice" : "/course/communication-systems/lessons/lesson-05/practice"}><span dir="ltr">02</span>תרגול</a></nav>
      <div className={playerStyles.toolbarActions}><button type="button" className={playerStyles.toolbarButton} aria-label="מבנה השיעור" aria-pressed={outlineOpen} onClick={() => setOutlineOpen((value) => !value)}>☷</button><button type="button" className={`${playerStyles.toolbarButton} ${playerStyles.toolbarTextButton}`} aria-label="הערות מרצה" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות</button><button type="button" className={playerStyles.presentButton} onClick={enterPresentation}>הצגה</button></div>
    </header>
    <div className={playerStyles.loopProgress}/>
    <div className={playerStyles.playerWorkspace}>
      {outlineOpen && <aside className={playerStyles.outline} aria-label="מבנה השיעור"><header className={playerStyles.outlineHeader}><div className={playerStyles.outlineTitleRow}><span className={playerStyles.lessonBadge} dir="ltr">05</span><div><span className={playerStyles.eyebrow}>מערך השיעור · מקלט AM</span><h2>סופר־הטרודיין וגלאי מעטפת</h2></div></div><div className={playerStyles.lessonProgress}><span>{seen.length}/{data.length} שקפים נצפו</span><i><b style={{ width: `${seen.length / data.length * 100}%` }}/></i></div><button type="button" className={playerStyles.closePanel} onClick={() => setOutlineOpen(false)}>סגירה</button></header><div className={playerStyles.outlineSectionHeading}>מבנה השיעור</div><nav className={playerStyles.outlineScroll} aria-label="פרקי השיעור">{chapters.map((chapter, chapterIndex) => { const chapterSlides = data.map((item, slideIndex) => ({ item, slideIndex })).filter(({ item }) => item.chapter === chapter); const chapterSeen = chapterSlides.filter(({ slideIndex }) => seen.includes(slideIndex + 1)).length; const chapterFeedback = chapterSlides.filter(({ slideIndex }) => Boolean(feedbackBySlide[slideIndex + 1])).length; return <section className={playerStyles.chapter} key={chapter}><button type="button" title={chapter} aria-expanded={Boolean(openChapters[chapter])} className={`${playerStyles.chapterButton} ${slide.chapter === chapter ? playerStyles.chapterActive : ""}`} onClick={() => setOpenChapters((value) => ({ ...value, [chapter]: !value[chapter] }))}><span className={playerStyles.chapterNumber} dir="ltr">{chapterIndex === 0 || chapterIndex === chapters.length - 1 ? "·" : String(chapterIndex).padStart(2, "0")}</span><span className={playerStyles.chapterTitle}>{chapter}</span>{chapterFeedback > 0 && <span className={playerStyles.flagCount} aria-label={`${chapterFeedback} תגובות בפרק`}>{chapterFeedback}</span>}<span className={playerStyles.progressRing} style={{ "--progress": chapterSlides.length ? chapterSeen / chapterSlides.length : 0 } as React.CSSProperties} aria-label={`${chapterSeen} מתוך ${chapterSlides.length} שקפים נצפו`}/></button>{openChapters[chapter] && <div className={playerStyles.chapterSlides}>{chapterSlides.map(({ item, slideIndex }) => { const slideNumber = slideIndex + 1; const feedbackTypeForSlide = feedbackBySlide[slideNumber] && feedbackTypes.find((type) => type.key === feedbackBySlide[slideNumber].t); return <button type="button" key={slideIndex} title={item.title} className={`${playerStyles.slideLink} ${index === slideIndex ? playerStyles.slideActive : ""} ${seen.includes(slideNumber) ? playerStyles.slideSeen : ""}`} aria-current={index === slideIndex ? "step" : undefined} onClick={() => go(slideIndex)}><span className={playerStyles.slideNumber} dir="ltr">{String(slideNumber).padStart(2, "0")}</span><span className={playerStyles.slideTitle}>{item.title}</span>{feedbackTypeForSlide && <span className={playerStyles.feedbackMarker} title={feedbackTypeForSlide.label} aria-label={`משוב: ${feedbackTypeForSlide.label}`}><FeedbackIcon type={feedbackTypeForSlide.key} size={13}/></span>}{Boolean(item.interactive) && <span className={playerStyles.interactiveMark} title="שקף אינטראקטיבי" aria-label="שקף אינטראקטיבי">◆</span>}</button>; })}</div>}</section>; })}</nav></aside>}
      <main className={playerStyles.playerMain} aria-label="נגן שיעור 05"><div className={playerStyles.stageWrap}><ScaledSlide slide={slide} index={index} hostClass={playerStyles.stage}/></div><footer className={playerStyles.playerFooter}><nav className={playerStyles.chapterBar} aria-label="התקדמות בין פרקי השיעור">{chapters.map((chapter) => { const chapterSlides = data.map((item, slideIndex) => ({ item, slideIndex })).filter(({ item }) => item.chapter === chapter); const start = chapterSlides[0]?.slideIndex ?? 0; const progress = Math.max(0, Math.min(100, (index - start + 1) / chapterSlides.length * 100)); return <button type="button" key={chapter} className={`${playerStyles.chapterSegment} ${slide.chapter === chapter ? playerStyles.segmentActive : ""}`} style={{ flex: chapterSlides.length }} onClick={() => go(start)} title={chapter} aria-label={`מעבר לפרק ${chapter}`}><i style={{ width: `${progress}%` }}/>{chapterSlides.map(({ slideIndex }) => { const feedback = feedbackBySlide[slideIndex + 1]; if (!feedback) return null; const type = feedbackTypes.find((item) => item.key === feedback.t); const label = `משוב „${type?.label ?? "נשלח"}” · שקף ${String(slideIndex + 1).padStart(2, "0")}: ${data[slideIndex].title}`; return <em key={slideIndex} title={label} aria-label={label} style={{ insetInlineStart: `${((slideIndex - start + 0.5) / chapterSlides.length) * 100}%`, background: type?.color ?? "#008F4D" }}/>; })}</button>; })}</nav><div className={playerStyles.slideNav}><button type="button" className={playerStyles.navButton} onClick={() => go(index - 1)} aria-label="לשקף הקודם">‹</button><span className={playerStyles.slideCount} dir="ltr">{String(index + 1).padStart(2, "0")} / {data.length}</span><button type="button" className={playerStyles.navButton} onClick={() => go(index + 1)} aria-label="לשקף הבא">›</button><span className={playerStyles.chapterLabel}>{slide.chapter}</span></div></footer></main>
      {notesOpen && <aside className={playerStyles.slideContext} aria-label="הערות מרצה לשקף"><header className={playerStyles.contextHeader}><span>הערות מרצה</span><b dir="ltr">{String(index + 1).padStart(2, "0")}</b></header><div className={playerStyles.contextBody}><div className={playerStyles.takeaway}><small>העיקר</small>{bidiQuantities(slide.takeaway)}</div><section className={playerStyles.contextSection}><h3>מפת מושגים</h3><p>הקשרים בין אות AM משיעור 4 לבין קליטת התחנה בשיעור 5.</p>{concepts.filter((concept) => visibleConceptIds.includes(concept.conceptId)).map((concept) => <Link className={playerStyles.conceptCard} key={concept.conceptId} href={`/course/communication-systems/concepts/${concept.conceptId}`}><b>{concept.name}</b><small>{concept.description}</small></Link>)}<Link href="/course/communication-systems/concepts" className={playerStyles.contextMore}>למפת המושגים המלאה ←</Link></section><h3>הערות לשקף</h3><ul>{slide.notes.map((note) => <li key={note}>{note}</li>)}</ul></div></aside>}
      {!lecturerMode && studentFeedback}
    </div>
  </div>, document.body);
}
