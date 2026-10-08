"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import katex from "katex";
import Link from "next/link";
import { concepts } from "../lib/course-data";
import styles from "./lesson-05-player.module.css";
import playerStyles from "./lesson-04-player.module.css";

type DeckSlide = { chapter: string; title: string; minutes: number; takeaway: string; notes: string[]; content: React.ReactNode };
const chapters = ["פתיחה וחזרה", "ארכיטקטורת מקלט", "המרת תדר ובבואה", "הפסקה ופשרת IF", "גלאי מעטפת ו־AGC", "תרגול וסיכום"];
const formula = (tex: string) => <div dir="ltr" className="sl-fx" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: false, output: "htmlAndMathml" }) }} />;
const card = (title: string, children: React.ReactNode) => <article className="sl-card"><div className="sl-lab">{title}</div>{children}</article>;
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
      <line x1="420" y1="300" x2="420" y2="205" stroke="#16808c" strokeWidth="9" />
      <line x1="750" y1="300" x2="750" y2="72" stroke="#13263e" strokeWidth="12" />
      <line x1="1080" y1="300" x2="1080" y2="205" stroke="#16808c" strokeWidth="9" />
      <circle cx="420" cy="205" r="10" fill="#16808c" /><circle cx="750" cy="72" r="12" fill="#13263e" /><circle cx="1080" cy="205" r="10" fill="#16808c" />
      <text x="420" y="175" textAnchor="middle" fontSize="25" fill="#116f79" direction="rtl">פס צד תחתון</text>
      <text x="750" y="40" textAnchor="middle" fontSize="25" fontWeight="700" fill="#13263e" direction="rtl">גל נושא</text>
      <text x="1080" y="175" textAnchor="middle" fontSize="25" fill="#116f79" direction="rtl">פס צד עליון</text>
      <text x="420" y="345" textAnchor="middle" fontSize="30" fill="#243b53">f<tspan baselineShift="sub" fontSize="20">c</tspan> − f<tspan baselineShift="sub" fontSize="20">m</tspan></text>
      <text x="750" y="345" textAnchor="middle" fontSize="30" fill="#13263e">f<tspan baselineShift="sub" fontSize="20">c</tspan></text>
      <text x="1080" y="345" textAnchor="middle" fontSize="30" fill="#243b53">f<tspan baselineShift="sub" fontSize="20">c</tspan> + f<tspan baselineShift="sub" fontSize="20">m</tspan></text>
      <text x="1370" y="345" textAnchor="end" fontSize="25" fill="#52677a" direction="rtl">תדר</text>
    </svg>
    <figcaption id="am-spectrum-caption"><b>הנושא</b> נמצא ב־<bdi dir="ltr">f<sub>c</sub></bdi>. <b>המידע</b> מופיע בפסי הצד, במרחק <bdi dir="ltr">f<sub>m</sub></bdi> מהנושא. התרשים איכותי; גובה הקווים אינו בקנה מידה.</figcaption>
  </figure>;
}
const data: DeckSlide[] = [
  { chapter: chapters[0], title: "מקלט AM — סופר־הטרודיין וגלאי מעטפת", minutes: 0, takeaway: "נעקוב אחרי האות מהאנטנה, דרך בחירת התדר, ועד לשמע.", notes: ["הציגו את שאלת השיעור: איך רדיו בוחר תחנה אחת ומחזיר ממנה שמע?", "הזכירו שהיום נלמד את המקלט, כהמשך לאות AM משיעור 4.", "התחילו בשאלת הפתיחה בשקף הבא."], content: <div className={styles.cover}><div><span>מערכות תקשורת · שיעור 05</span><h3>מקלט AM</h3><p>סופר־הטרודיין וגלאי מעטפת</p><b dir="ltr">AM RECEIVER · AUDIO ← IF ← RF</b></div><div className={styles.coverArt}><div className={styles.flow}><b>אנטנה</b><i>←</i><b>בחירת תחנה</b><i>←</i><b>שמע</b></div><span>ממקלט התחנה ועד לרמקול</span></div></div> },
  { chapter: chapters[0], title: "משדר AM בשיעור 4: ממקור המידע לאנטנה", minutes: 3, takeaway: "בשיעור 4 עקבנו אחרי המידע מהמיקרופון, דרך האפנון וההגברה, ועד לאנטנה המשדרת.", notes: ["זהו שקף גישור נפרד: שחזרו את מסלול האות כפי שנלמד בשיעור 4.", "הצביעו על המיקרופון כמקור המידע, ועל גל הנושא שנכנס לאפנן יחד עם אות השמע.", "סיימו באנטנה המשדרת והעבירו את נקודת המבט לאנטנה הקולטת בשיעור 5."], content: <div className={styles.bridge}><div className={styles.bridgeLabel}>חזרה קצרה · מערך שיעור 4</div><div className={styles.flow}><b>מיקרופון<br/><small>מקור מידע</small></b><i>←</i><b>מסנן שמע<br/><small>LPF</small></b><i>←</i><b>אפנן AM<br/><small>אות שמע + נושא</small></b><i>←</i><b>מגבר הספק</b><i>←</i><b>אנטנה<br/><small>שידור</small></b></div><div className={styles.bridgeHandoff}><span>עד כאן: המשדר של שיעור 4</span><b>עכשיו: המקלט קולט את האות באנטנה</b></div></div> },
  { chapter: chapters[0], title: "שאלת פתיחה: איך בוחרים תחנה אחת?", minutes: 3, takeaway: "לפני שמחלצים שמע, צריך לבודד את האות של התחנה הרצויה.", notes: ["הציגו את השאלה אחרי שחזור שרשרת המשדר בשקף הקודם.", "הדגישו שהאנטנה קולטת כמה תחנות בו־זמנית.", "בקשו מהכיתה להציע מה המקלט צריך לעשות לפני הגילוי."], content: <div className={styles.openingQuestion}>{card("מה מגיע למקלט?", <p className={styles.lead}>האנטנה קולטת אותות מכמה תחנות יחד.</p>)}{card("השאלה להיום", <p className={styles.lead}>איך בוחרים תחנה אחת ומחלצים ממנה את השמע?</p>)}</div> },
  { chapter: chapters[0], title: "מה יש בתוך אות AM? נושא ושני פסי צד", minutes: 4, takeaway: "הנושא נמצא בתדר המרכזי; פסי הצד מופיעים במרחק תדר השמע משני צדדיו.", notes: ["קראו את הגרף משמאל לימין: התדר גדל, ובמרכז נמצא הנושא.", "הצביעו בנפרד על הנושא, פס הצד התחתון ופס הצד העליון.", "הסבירו שהמרחק של כל פס צד מהנושא הוא תדר השמע fm; פסי הצד נושאים את המידע."], content: <div className={styles.spectrumSlide}><AMSpectrum /></div> },
  { chapter: chapters[1], title: "מקלט ישיר TRF: מסנן שעוקב אחרי התחנה", minutes: 2, takeaway: "במקלט TRF המסנן ומגבר תדר הרדיו מכוונים סביב התחנה הרצויה.", notes: ["הגדירו RF: תדר הרדיו של התחנה לפני הגילוי.", "הגדירו TRF: מקלט ישיר (Tuned Radio Frequency) שמסנן ומגביר סביב תדר התחנה.", "הדגישו שהכוונון משתנה עם התחנה; את רוחב הפס נחשב בשקף הבא."], content: <><div className={styles.two}>{card("RF · תדר רדיו", <p>תדר התחנה שנבחרה, לפני הגילוי.</p>)}{card("TRF · מקלט ישיר", <p>Tuned Radio Frequency: מסנן ומגבר מכוונים סביב תדר התחנה.</p>)}</div><div className={styles.flow}><b>אנטנה</b><i>←</i><b>מסנן ומגבר RF מתכווננים</b><i>←</i><b>גלאי AM</b><i>←</i><b>שמע</b></div><p className={styles.note}>כשבוחרים תחנה אחרת, גם דרגת הסינון צריכה להתכוונן לתדר החדש.</p></> },
  { chapter: chapters[1], title: "רוחב פס המסנן: מה אומר Q?", minutes: 2, takeaway: "כאשר Q קבוע, מסנן בתדר תהודה גבוה יותר מעביר רוחב פס גדול יותר.", notes: ["הגדירו f₀ כתדר התהודה, BW כרוחב הפס ו־Q כמקדם האיכות.", "הסבירו ש־Q גדול פירושו מסנן חד יותר ביחס לתדר המרכזי.", "השאירו את החישוב המספרי לשקף הבא כדי לא לערבב הגדרה, נוסחה ותרגיל."], content: <>{formula(String.raw`BW=\frac{f_0}{Q}`)}<div className={styles.two}>{card("תדר מרכזי", <p><bdi dir="ltr">f₀</bdi> הוא תדר התהודה שסביבו המסנן מעביר אותות.</p>)}{card("מקדם איכות · Q", <p>מתאר את חדות המסנן ביחס לתדר המרכזי.</p>)}</div><p className={styles.note}><bdi dir="ltr">BW</bdi> הוא רוחב תחום התדרים שעובר במסנן. כש־<bdi dir="ltr">Q</bdi> קבוע, <bdi dir="ltr">f₀</bdi> גבוה יותר גורר רוחב פס גדול יותר.</p></> },
  { chapter: chapters[1], title: "דוגמת TRF: מחשבים רוחב פס", minutes: 4, takeaway: "בדוגמה, רוחב הפס הוא 30 kHz.", notes: ["הזכירו Q חסר יחידות.", "המירו MHz ל־kHz או ל־Hz לפני החלוקה.", "בדקו ש־30 kHz קטן מ־1.5 MHz ומתאים לרוחב פס."], content: <>{card("נתונים מקובצים", <p dir="ltr">f₀ = 1.5 MHz = 1500 kHz · Q = 50</p>)}{formula(String.raw`BW=\frac{f_0}{Q}`)}<p>חשבו את רוחב הפס של המסנן.</p><Reveal label="פתרון מדורג" steps={[<p><bdi dir="ltr">BW = 1500 kHz / 50</bdi></p>, <p><bdi dir="ltr">BW = 30 kHz</bdi>. בדיקה: רוחב הפס קטן מתדר התהודה.</p>]}/></> },
  { chapter: chapters[1], title: "סופר־הטרודיין: מסנן קבוע, תחנה משתנה", minutes: 5, takeaway: "ממירים כל תחנה לתדר ביניים קבוע ואז מסננים ומגבירים אותה.", notes: ["הציגו את הרעיון: מזיזים את התחנה אל מסנן קבוע במקום להזיז מסנן חד.", "במקלט AM טיפוסי בדוגמה נשתמש ב־IF של 455 kHz.", "ציינו שזה ערך מקובל בדוגמה, לא כלל לכל מקלט או תקן לכל תחום."], content: <>{card("הרעיון", <p className={styles.lead}>התחנה משתנה, אבל דרגת הסינון המרכזית נשארת מכוונת לאותו תדר ביניים.</p>)}{formula(String.raw`f_{IF}=455\;\mathrm{kHz}`)}<div className={styles.flow}><b>תחנה נבחרת</b><i>← המרה</i><b>455 kHz</b><i>← סינון חד</i></div></> },
  { chapter: chapters[1], title: "מפת המקלט: מה עושה כל דרגה?", minutes: 4, takeaway: "כל בלוק מכין את האות לשלב הבא עד שמחלצים שמע.", notes: ["עברו לאורך התרשים מימין לשמאל.", "הגדירו RF, Mixer, LO ו־IF לפני שימוש בראשי התיבות.", "הציגו את AGC כחוג בקרה שנחזור אליו אחרי הגלאי."], content: <>{card("מסלול אות", <div className={styles.blockFlow}><b>אנטנה</b><b>מגבר RF</b><b>ערבל</b><b>מגבר IF</b><b>גלאי מעטפת</b><b>מגבר שמע</b><b>רמקול</b></div>)}<div className={styles.three}>{card("RF", <p>סינון גס והגברה בכניסה</p>)}{card("ערבל + LO", <p>יוצרים רכיבי סכום והפרש</p>)}{card("IF", <p>סינון והגברה סביב תדר קבוע</p>)}</div><p className={styles.note}>AGC מחזיר משוב לדרגות ההגברה כדי לייצב את עוצמת השמע.</p></> },
  { chapter: chapters[1], title: "למה משתמשים בתדר ביניים קבוע?", minutes: 3, takeaway: "המרת התחנה לתדר קבוע מאפשרת להשתמש בדרגת סינון והגבר קבועה.", notes: ["הבדילו בין RF של התחנה לבין IF אחרי ההמרה.", "הדגישו שהתחנה הנבחרת משתנה אך ה־IF נשאר קבוע בתכנון.", "אל תציגו עדיין את אופן פעולת הערבל."], content: <>{card("הרעיון לפני הנוסחה", <p className={styles.lead}>במקום לכוון מסנן חד לכל תחנה, ממירים כל תחנה נבחרת לאותו תדר ביניים.</p>)}<div className={styles.flow}><b>RF משתנה</b><i>← המרה</i><b>IF קבוע</b><i>←</i><b>מסנן קבוע</b></div><p className={styles.note}>IF ‏455 kHz הוא ערך הדוגמה של מערך זה, לא ערך אוניברסלי לכל מקלט.</p></> },
  { chapter: chapters[1], title: "מגבר RF, ערבל ומגבר IF", minutes: 3, takeaway: "המסנן בכניסה מצמצם הפרעות; ה־IF מספק סינון והגבר סביב תדר קבוע.", notes: ["עברו בבלוקים לפי כיוון זרימת האות.", "הגדירו RF ו־IF בעברית לפני הקיצור.", "ציינו שה־LO מזין את הערבל אך אינו אות התחנה."], content: <>{card("שלוש דרגות", <div className={styles.blockFlow}><b>מגבר RF<br/>כניסה</b><b>ערבל<br/>RF + LO</b><b>מגבר IF<br/>תדר קבוע</b></div>)}<div className={styles.three}>{card("RF", <p>תדר הרדיו שנבחר מן האנטנה.</p>)}{card("LO", <p>המתנד המקומי שמספק לערבל אות בתדר מכוון.</p>)}{card("IF", <p>תדר הביניים שנבחר לסינון ולהגבר.</p>)}</div></> },
  { chapter: chapters[2], title: "איך הערבל ממיר תדר?", minutes: 2, takeaway: "כפל של שני סינוסים יוצר תדר סכום ותדר הפרש.", notes: ["תארו את הערבל כמכפיל אותות, לא כמסנן.", "הראו את זהות המכפלה במלואה.", "מסנן IF בוחר את רכיב ההפרש הרצוי."], content: <>{formula(String.raw`\cos(\alpha)\cos(\beta)=\frac{1}{2}[\cos(\alpha-\beta)+\cos(\alpha+\beta)]`)}<p>לערבל נכנסים אות התחנה <bdi dir="ltr">f<sub>RF</sub></bdi> והמתנד המקומי <bdi dir="ltr">f<sub>LO</sub></bdi>. ביציאה מופיעים סכום והפרש; מסנן ה־IF מעביר את ההפרש.</p>{formula(String.raw`f_{IF}=f_{LO}-f_{RF},\quad f_{LO}>f_{RF}`)}<p className={styles.note}>הנחת המערך: הזרקת LO מעל RF. קיימת גם הזרקה מתחת ל־RF, אך לא ננתח אותה כאן.</p></> },
  { chapter: chapters[2], title: "מה יוצא מהערבל? סכום והפרש", minutes: 3, takeaway: "מכפלת תדר RF ו־LO יוצרת רכיב סכום ורכיב הפרש.", notes: ["השתמשו בזהות כדי להראות את המעבר ולא רק את התוצאה.", "סמנו את רכיב ההפרש כבחירת מסנן ה־IF בדוגמת ההזרקה הגבוהה.", "הבחינו בין תדרי הכניסה לבין הרכיבים ביציאה."], content: <>{card("שני אותות הכניסה", <p dir="ltr">RF: cos(2πf<sub>RF</sub>t) · LO: cos(2πf<sub>LO</sub>t)</p>)}{formula(String.raw`\cos(\alpha)\cos(\beta)=\frac{1}{2}[\cos(\alpha-\beta)+\cos(\alpha+\beta)]`)}<div className={styles.two}>{card("הפרש", <p><bdi dir="ltr">f<sub>LO</sub> − f<sub>RF</sub></bdi></p>)}{card("סכום", <p><bdi dir="ltr">f<sub>LO</sub> + f<sub>RF</sub></bdi></p>)}</div><p className={styles.note}>מסנן ה־IF בוחר את רכיב ההפרש הרצוי.</p></> },
  { chapter: chapters[2], title: "מכוונים את ה־LO יחד עם התחנה", minutes: 2, takeaway: "בהזרקה גבוהה LO נשאר גבוה מ־RF בהפרש IF קבוע.", notes: ["הגדירו כל תדר לפני השימוש: RF תחנה, LO מתנד, IF הפרש נבחר.", "השתמשו במחוון כדי להזיז את RF ולצפות ב־LO.", "שאלו: מה נשאר קבוע? תשובה: ההפרש IF."], content: <Tuner /> },
  { chapter: chapters[2], title: "תדר הבבואה: תחנה נוספת עם אותו IF", minutes: 3, takeaway: "אות משני צדי LO יכול ליצור אותו תדר הפרש ולחדור לאותו IF.", notes: ["ציירו את RF, LO ו־IM על ציר אחד.", "הראו שה־LO נמצא באמצע בין התחנה הרצויה לתדר הבבואה.", "הדגישו שמסנן IF לבדו לא מפריד ביניהם אחרי הערבל."], content: <>{formula(String.raw`f_{RF}=f_{LO}-f_{IF} \qquad f_{IM}=f_{LO}+f_{IF}`)}<div className={styles.axis}><span>RF רצוי</span><i></i><span>LO</span><i></i><span>בבואה</span></div>{formula(String.raw`f_{IM}=f_{RF}+2f_{IF} \quad (LO>RF)`)}<p>שניהם יוצרים הפרש <bdi dir="ltr">f<sub>IF</sub></bdi> מה־LO, ולכן שניהם עוברים דרך מסנן ה־IF.</p></> },
  { chapter: chapters[2], title: "גוזרים את תדר הבבואה", minutes: 2, takeaway: "בהזרקה גבוהה, תדר הבבואה הוא תדר התחנה ועוד פעמיים תדר הביניים.", notes: ["הצביעו על המרחק השווה של RF ושל IM מן ה־LO.", "הראו תחילה את שתי משוואות ההפרש.", "רק לאחר החיסור כתבו את נוסחת הבבואה."], content: <>{formula(String.raw`f_{LO}-f_{RF}=f_{IF}\qquad f_{IM}-f_{LO}=f_{IF}`)}<p>מחברים את המרחקים משני צדי המתנד המקומי:</p>{formula(String.raw`f_{IM}-f_{RF}=2f_{IF}`)}<p>ולכן, בהזרקה גבוהה:</p>{formula(String.raw`f_{IM}=f_{RF}+2f_{IF}`)}</> },
  { chapter: chapters[2], title: "תרגיל מודרך: נתונים ושאלות", minutes: 5, takeaway: "חשבנו תחום LO, LO לתחנה ואת תדר הבבואה עם יחידות.", notes: ["תנו זמן לסטודנטים לכתוב כל נוסחה לפני הפתרון.", "אחדו יחידות לפני חיבור; כאן כל הערכים ב־kHz.", "בבדיקת הפרעה השוו לתדר הבבואה, לא לתדר התחנה הרצויה."], content: <>{card("נתונים", <p dir="ltr">f<sub>RF</sub> = 540–1600 kHz · f<sub>IF</sub> = 455 kHz · f<sub>LO</sub> &gt; f<sub>RF</sub></p>)}{card("משימות", <ol><li>תחום תדרי LO</li><li>לתחנה <bdi dir="ltr">f<sub>RF</sub>=657 kHz</bdi>, חשבו LO ו־IM</li><li>האם תחנה ב־<bdi dir="ltr">1567 kHz</bdi> תגרום להפרעת בבואה?</li></ol>)}<Reveal label="חשיפת פתרון לפי שלבים" steps={[<p><bdi dir="ltr">f<sub>LO,min</sub> = 540 + 455 = 995 kHz</bdi><br/><bdi dir="ltr">f<sub>LO,max</sub> = 1600 + 455 = 2055 kHz</bdi></p>, <p><bdi dir="ltr">f<sub>LO</sub> = 657 + 455 = 1112 kHz</bdi></p>, <p><bdi dir="ltr">f<sub>IM</sub> = 657 + 2·455 = 1567 kHz</bdi>. התחנה ב־1567 kHz היא תדר הבבואה ולכן תומר לאותו IF.</p>]}/></> },
  { chapter: chapters[2], title: "תרגיל: תחום תדרי המתנד המקומי", minutes: 7, takeaway: "בהזרקה גבוהה, מוסיפים IF לכל אחד מגבולות תחום RF.", notes: ["בקשו מהסטודנטים לכתוב קשר לפני הצבה.", "שמרו על kHz בכל שלוש השורות.", "שאלו למה תחום LO זז למעלה ביחס לתחום התחנות."], content: <>{card("הנתונים מן השקף הקודם", <p dir="ltr">f<sub>RF</sub> = 540–1600 kHz · f<sub>IF</sub> = 455 kHz · f<sub>LO</sub> &gt; f<sub>RF</sub></p>)}{card("נסו לבד", <p>חשבו את תחום תדרי המתנד המקומי <bdi dir="ltr">LO</bdi> עבור כל תחום התחנות.</p>)}<Reveal label="בדיקת הפתרון" steps={[<p><bdi dir="ltr">f<sub>LO</sub> = f<sub>RF</sub> + f<sub>IF</sub></bdi> (הזרקה גבוהה)</p>, <p><bdi dir="ltr">f<sub>LO,min</sub> = 540 + 455 = 995 kHz</bdi><br/><bdi dir="ltr">f<sub>LO,max</sub> = 1600 + 455 = 2055 kHz</bdi></p>]}/></> },
  { chapter: chapters[2], title: "תרגיל: מכוונים לתחנה 657 kHz", minutes: 7, takeaway: "לתחנה 657 kHz נדרש LO של 1112 kHz.", notes: ["תנו זמן להצבה עצמאית לפני חשיפת התשובה.", "הצביעו על תנאי ההזרקה הגבוהה.", "בדקו שה־LO אכן גבוה מתדר התחנה."], content: <>{card("נתונים", <p dir="ltr">f<sub>RF</sub> = 657 kHz · f<sub>IF</sub> = 455 kHz · f<sub>LO</sub> &gt; f<sub>RF</sub></p>)}{card("חשבו", <p>מהו תדר המתנד המקומי <bdi dir="ltr">LO</bdi>?</p>)}<Reveal label="פתרון מדורג" steps={[<p><bdi dir="ltr">f<sub>LO</sub> = f<sub>RF</sub> + f<sub>IF</sub></bdi></p>, <p><bdi dir="ltr">f<sub>LO</sub> = 657 + 455 = 1112 kHz</bdi></p>, <p>בדיקה: <bdi dir="ltr">1112 kHz &gt; 657 kHz</bdi>, ולכן ההנחה של הזרקה גבוהה מתקיימת.</p>]}/></> },
  { chapter: chapters[2], title: "תרגיל: האם 1567 kHz היא בבואה?", minutes: 6, takeaway: "הבבואה נמצאת בצד השני של LO, במרחק IF זהה.", notes: ["בקשו לסמן RF, LO ו־IM על ציר אחד.", "הבחינו בין תדר התחנה הרצויה לבין האות המפריע.", "בדקו חיבור יחידות וסדר גודל."], content: <>{card("תחנה רצויה", <p dir="ltr">f<sub>RF</sub> = 657 kHz · f<sub>LO</sub> = 1112 kHz · f<sub>IF</sub> = 455 kHz</p>)}{card("נסו לבד", <p>חשבו את תדר הבבואה. האם אות ב־<bdi dir="ltr">1567 kHz</bdi> יוצר אותו IF?</p>)}<Reveal label="חשיפת הפתרון" steps={[<p><bdi dir="ltr">f<sub>IM</sub> = f<sub>LO</sub> + f<sub>IF</sub></bdi></p>, <p><bdi dir="ltr">f<sub>IM</sub> = 1112 + 455 = 1567 kHz</bdi></p>, <p>כן. גם <bdi dir="ltr">1567 kHz</bdi> נמצא במרחק <bdi dir="ltr">455 kHz</bdi> מה־LO, ולכן הוא יכול לעבור לאותו IF.</p>]}/></> },
  { chapter: chapters[3], title: "הפסקה", minutes: 10, takeaway: "בהמשך: נחלץ את אות השמע ונבקר את עוצמתו.", notes: ["הפסקה של עשר דקות.", "לאחר ההפסקה חזרו מגלאי המעטפת אל בקרת AGC."], content: <div className={styles.card}><h3>10 דקות להפסקה</h3><p className={styles.lead}>אחרי ההפסקה: גלאי מעטפת, תכנון RC ובקרת הגבר אוטומטית.</p></div> },
  { chapter: chapters[3], title: "הפשרה בבחירת IF", minutes: 5, takeaway: "IF נמוך משפר סלקטיביות אך מקרב את הבבואה; IF גבוה מרחיק אותה.", notes: ["הסבירו את שני צדי הפשרה בלי לטעון ש־IF לבדו קובע הכל.", "המרה כפולה יכולה לשלב IF ראשון גבוה לדחיית בבואה ו־IF שני נמוך לסלקטיביות.", "הציגו את 10.7 MHz רק כדוגמה להמחשה, לא כערך של מקלט AM."], content: <div className={styles.three}>{card("IF נמוך", <p>ערוצים קרובים ניתנים להפרדה; הבבואה קרובה יותר ל־RF ועלולה להיות קשה לסינון בכניסה.</p>)}{card("IF גבוה", <p>הבבואה רחוקה יותר, אך רוחב הפס של מסנן IF גדל כאשר Q קבוע. לכן סלקטיביות דורשת תכנון מסנן מתאים.</p>)}{card("המרה כפולה", <p>דוגמת תכנון: IF ראשון גבוה לדחיית בבואה, ואז IF שני נמוך לסלקטיביות.</p>)}</div> },
  { chapter: chapters[4], title: "גלאי מעטפת: מה־IF אל אות השמע", minutes: 3, takeaway: "דיודה וקבוע זמן RC מתאים עוקבים אחרי המעטפת ומחלצים את המידע.", notes: ["הגדירו IF כעת כתדר הנושא שמגיע לגלאי.", "תארו את טעינת הקבל בשיאים ואת פריקתו דרך הנגד.", "הדיודה מיישרת; R ו־C קובעים את העקיבה."], content: <>{card("מעגל עקרוני", <div className={styles.blockFlow}><b>אות AM ב־IF</b><b>דיודה D</b><b>צומת מוצא</b><b>R ו־C במקביל לאדמה</b><b>אות שמע</b></div>)}<div className={styles.three}>{card("בכל שיא", <p>הדיודה מוליכה והקבל נטען בקירוב לשיא המעטפת.</p>)}{card("בין שיאים", <p>הדיודה נסגרת והקבל נפרק דרך הנגד.</p>)}{card("מטרה", <p>המוצא יעקוב אחרי המעטפת בלי תנודות נושא גדולות ובלי לחתוך את הירידה.</p>)}</div></> },
  { chapter: chapters[4], title: "גלאי מעטפת: הדיודה והקבל", minutes: 3, takeaway: "הדיודה טוענת את הקבל בשיאי המעטפת.", notes: ["הראו את כיוון הזרם דרך הדיודה בזמן הולכה.", "הסבירו שהקבל שומר מתח בין שיאי הנושא.", "אל תסבירו עדיין את בחירת R ו־C."], content: <>{card("חלק ראשון במעגל", <div className={styles.blockFlow}><b>אות AM ב־IF</b><b>דיודה D</b><b>קבל C</b></div>)}<p className={styles.lead}>בשיא חיובי של האות, הדיודה מוליכה והקבל נטען בקירוב למתח המעטפת.</p></> },
  { chapter: chapters[4], title: "גלאי מעטפת: מסלול הפריקה", minutes: 3, takeaway: "בין שיאים הקבל נפרק דרך R ומפיק את שינויי המעטפת בתדר השמע.", notes: ["עקבו אחרי המתח על הקבל בין שיאי הנושא.", "הצביעו על הנגד כנתיב הפריקה.", "קשרו בין שינוי איטי של המעטפת לבין אות השמע."], content: <>{card("בין שיאים", <div className={styles.blockFlow}><b>דיודה סגורה</b><b>קבל C</b><b>נגד R</b></div>)}<p>הקבל נפרק דרך <bdi dir="ltr">R</bdi>. אם הפריקה מותאמת, המתח במוצא עוקב אחרי מעטפת השמע.</p><p className={styles.note}>ה־RC קובע את מהירות הפריקה; נבדוק את הפשרה בשקפים הבאים.</p></> },
  { chapter: chapters[4], title: "מה רוצים לראות במוצא הגלאי?", minutes: 1, takeaway: "המוצא צריך להחליק את תנודות הנושא בלי לעוות את מעטפת השמע.", notes: ["סכמו את תפקיד הדיודה, הקבל והנגד.", "שאלו מה קורה אם RC קטן או גדול מדי.", "העבירו לשקף התנאים לבחירת RC."], content: <div className={styles.three}>{card("להחליק", <p>להקטין את אדוות תדר הנושא.</p>)}{card("לעקוב", <p>לשמר את שינויי מעטפת השמע.</p>)}{card("להימנע", <p>מחיתוך או עיוות של הירידה במעטפת.</p>)}</div> },
  { chapter: chapters[4], title: "בוחרים RC: בין הנושא לשמע", minutes: 5, takeaway: "קבוע הזמן גדול ממחזור הנושא וקטן מספיק לעקוב אחרי מעטפת השמע.", notes: ["תקנו את ניסוח התנאים: RC צריך להיות גדול ממחזור הנושא וקטן מהגבול העליון שתלוי בתדר השמע ובעומק האפנון.", "הציגו את אי־השוויון הרשמי כקירוב תכנוני, לא כשוויון מדויק.", "עיוות אלכסוני מתרחש כשפריקת RC איטית מדי בירידת המעטפת."], content: <>{formula(String.raw`\frac{1}{f_c}\ll RC\ll\frac{1}{2f_m\ln\left(\frac{1+m_a}{1-m_a}\right)}`)}<div className={styles.three}>{card("RC קטן מדי", <p>הקבל נפרק מהר מדי; אדוות תדר הנושא נשארות במוצא.</p>)}{card("תחום מתאים", <p>מספיק זמן להחליק בין מחזורי הנושא, ועדיין לעקוב אחרי שינויי המעטפת.</p>)}{card("RC גדול מדי", <p>הפריקה אינה עוקבת אחרי ירידת המעטפת ונוצר עיוות אלכסוני.</p>)}</div><p className={styles.note}>הנוסחה תקפה למעטפת סינוסואידלית ול־<bdi dir="ltr">0 ≤ m<sub>a</sub> &lt; 1</bdi>. כש־<bdi dir="ltr">m<sub>a</sub>→1</bdi>, הגבול העליון מתכווץ.</p></> },
  { chapter: chapters[4], title: "פשרת RC: שני גבולות", minutes: 5, takeaway: "RC צריך להיות ארוך ביחס למחזור הנושא וקצר מספיק לעקוב אחרי המעטפת.", notes: ["הגדירו את כל הגדלים: fc נושא, fm שמע, ma עומק אפנון.", "הסבירו את המשמעות הפיזיקלית של כל צד באי־שוויון.", "ציינו שהגבולות מקורבים ותלויי תנאי המעטפת."], content: <>{formula(String.raw`\frac{1}{f_c}\ll RC\ll\frac{1}{2f_m\ln\left(\frac{1+m_a}{1-m_a}\right)}`)}<div className={styles.two}>{card("גבול תחתון", <p>RC גדול ממחזור הנושא, כדי להפחית אדוות.</p>)}{card("גבול עליון", <p>RC קטן מהגבול שתלוי בתדר השמע ובעומק האפנון, כדי לעקוב אחרי המעטפת.</p>)}</div><p className={styles.note}>הנוסחה היא קירוב לפי נוסחאון הקורס למעטפת סינוסואידלית, כאשר <bdi dir="ltr">0 ≤ ma &lt; 1</bdi>.</p></> },
  { chapter: chapters[4], title: "תרגול: נתונים ובחירת קבוע זמן", minutes: 6, takeaway: "לפי נוסחת הנוסחאון: כ־2.20 μs ≪ RC ≪ 45.5 μs; בחירה 15 μs נותנת 1.5 nF.", notes: ["תנו 5 דקות עבודה בזוגות לפני פתיחת הפתרון.", "המירו kHz ל־Hz; התוצאה של הגבול היא שניות.", "הבחירה 15 μs היא ערך דוגמה בתוך התחום, לא הפתרון היחיד."], content: <>{card("נתונים", <p dir="ltr">f<sub>c</sub>=455 kHz · f<sub>m</sub>=5 kHz · m<sub>a</sub>=0.8 · R=10 kΩ</p>)}<p>מצאו תחום מותר ל־<bdi dir="ltr">τ=RC</bdi>, ואז בחרו <bdi dir="ltr">C</bdi> עבור <bdi dir="ltr">τ=15 μs</bdi>.</p><Reveal label="חשיפת פתרון" steps={[<p><bdi dir="ltr">f<sub>c</sub>=455,000 Hz; f<sub>m</sub>=5,000 Hz</bdi></p>, <p>גבול תחתון: <bdi dir="ltr">1/455000 = 2.20 μs</bdi>. גבול עליון: <bdi dir="ltr">1/[2·5000·ln(9)] = 45.5 μs</bdi>.</p>, <p><bdi dir="ltr">2.20 μs ≪ RC ≪ 45.5 μs</bdi>. אם <bdi dir="ltr">RC=15 μs</bdi> ו־<bdi dir="ltr">R=10 kΩ</bdi>, אז <bdi dir="ltr">C=15×10⁻⁶/10⁴=1.5 nF</bdi>.</p>]}/></> },
  { chapter: chapters[4], title: "תרגול RC: חישוב הגבולות", minutes: 4, takeaway: "הגבול התחתון כ־2.20 μs והעליון כ־45.5 μs.", notes: ["הזכירו שה־μs מתקבל מהמרת שניות.", "הציבו את m=0.8 בגבול העליון: ln(9).", "הקפידו להבדיל בין גבולות לבין בחירה יחידה."], content: <>{card("הנתונים", <p dir="ltr">fc = 455 kHz · fm = 5 kHz · ma = 0.8</p>)}<p>השתמשו בגבולות שבנוסחאון כדי למצוא את תחום <bdi dir="ltr">τ=RC</bdi>.</p><Reveal label="חישוב הגבולות" steps={[<p><bdi dir="ltr">455 kHz = 455,000 Hz</bdi>; לכן <bdi dir="ltr">1/fc = 2.20 μs</bdi>.</p>, <p><bdi dir="ltr">ln((1+0.8)/(1−0.8)) = ln(9)</bdi>; הגבול העליון הוא <bdi dir="ltr">1/(2·5000·ln(9)) = 45.5 μs</bdi>.</p>, <p>לכן תחום התכנון בקירוב: <bdi dir="ltr">2.20 μs ≪ RC ≪ 45.5 μs</bdi>.</p>]}/></> },
  { chapter: chapters[4], title: "תרגול RC: מוצאים קבל מתאים", minutes: 5, takeaway: "עבור R של 10 kΩ ו־RC של 15 μs מתקבל C של 1.5 nF.", notes: ["הסבירו ש־15 μs היא בחירה אפשרית בתוך התחום, לא ערך יחיד.", "הציגו את הקשר C=τ/R לפני ההצבה.", "בדקו ממד: שנייה חלקי אוהם שווה פאראד."], content: <>{card("בחירה מתוך התחום", <p dir="ltr">τ = 15 μs · R = 10 kΩ</p>)}<p>חשבו את הקיבול <bdi dir="ltr">C</bdi> הדרוש.</p><Reveal label="פתרון" steps={[<p><bdi dir="ltr">τ = RC</bdi>, ולכן <bdi dir="ltr">C = τ/R</bdi>.</p>, <p><bdi dir="ltr">C = 15×10⁻⁶ s / 10×10³ Ω = 1.5×10⁻⁹ F = 1.5 nF</bdi>.</p>, <p>הערך <bdi dir="ltr">15 μs</bdi> נמצא בין <bdi dir="ltr">2.20 μs</bdi> ל־<bdi dir="ltr">45.5 μs</bdi>, ולכן הוא בחירה סבירה לפי הקירוב שנלמד.</p>]}/></> },
  { chapter: chapters[4], title: "AGC: עוצמת שמע יציבה", minutes: 5, takeaway: "AGC משתמש במשוב שלילי כדי להקטין הגבר לאות חזק ולהגדילו לאות חלש.", notes: ["הדגישו שמתח הבקרה נובע ממדידת רמת האות אחרי הגילוי.", "הציגו חזק → הגבר יורד, חלש → הגבר עולה.", "המטרה היא לצמצם שינויי עוצמה בין תחנות; לא לבטל רעש או להבטיח עוצמה זהה לחלוטין."], content: <>{card("לולאת בקרה", <div className={styles.flow}><b>RF/IF</b><i>←</i><b>גלאי</b><i>←</i><b>מדידת רמה</b><i>←</i><b>מתח AGC</b><i>↺</i></div>)}<div className={styles.two}>{card("אות חזק", <p>מתח AGC מפחית את הגבר דרגות RF/IF.</p>)}{card("אות חלש", <p>המקלט מאפשר הגבר גדול יותר, בגבולות המעגל.</p>)}</div><p className={styles.lead}>כך מצמצמים את שינוי עוצמת השמע כאשר עוברים בין תחנות חזקות וחלשות.</p></> },
  { chapter: chapters[5], title: "ארבעה מאפייני מקלט", minutes: 3, takeaway: "ברירות, רגישות, נאמנות ו־SNR מתארים היבטים שונים של איכות הקליטה.", notes: ["בקשו דוגמה לכל מאפיין.", "הבחינו בין רגישות (אות חלש שניתן לקלוט) לברירות (הפרדת תחנות).", "SNR מתייחס ליחס הספק אות שימושי להספק רעש; ציינו באותה נקודת מדידה."], content: <div className={styles.two}>{card("ברירות · Selectivity", <p>היכולת להפריד את התחנה הרצויה מתחנות קרובות.</p>)}{card("רגישות · Sensitivity", <p>האות המזערי שניתן לקלוט באיכות שנקבעה.</p>)}{card("נאמנות · Fidelity", <p>הדיוק בשחזור תוכן האות, לרבות תדרי השמע.</p>)}{card("יחס אות לרעש · SNR", <p>יחס בין הספק האות להספק הרעש, באותה נקודת מדידה.</p>)}</div> },
  { chapter: chapters[5], title: "מבחינים בין מאפייני המקלט", minutes: 2, takeaway: "ברירות מפרידה תחנות; רגישות מתארת קליטת אות חלש; נאמנות מתארת שחזור.", notes: ["הציגו כל מונח בנפרד לפני ההשוואה.", "שאלו איזה מאפיין עוזר כשיש תחנה סמוכה חזקה.", "קשרו ברירות למסנני RF/IF שכבר נלמדו."], content: <div className={styles.three}>{card("ברירות · Selectivity", <p>הפרדת התחנה הרצויה מתחנות סמוכות.</p>)}{card("רגישות · Sensitivity", <p>האות החלש ביותר שניתן לקלוט לפי קריטריון מוגדר.</p>)}{card("נאמנות · Fidelity", <p>דיוק שחזור תוכן האות, לרבות תחום השמע.</p>)}</div> },
  { chapter: chapters[5], title: "כרטיס יציאה: בדקו את ההבנה", minutes: 5, takeaway: "מתדר תחנה של 1000 kHz ותדר ביניים של 455 kHz מתקבלים מתנד מקומי של 1455 kHz ותדר בבואה של 1910 kHz.", notes: ["אספו תשובות לפני חשיפת הפתרון.", "דרשו יחידות בכל שורה.", "סיימו בחיבור השרשרת: בחירת תחנה, המרה, סינון, גילוי ובקרה."], content: <>{card("פתרו לבד", <p className={styles.lead}>מקלט AM בהזרקה גבוהה מכוון ל־<bdi dir="ltr">f<sub>RF</sub>=1000 kHz</bdi> עם <bdi dir="ltr">f<sub>IF</sub>=455 kHz</bdi>. חשבו את <bdi dir="ltr">f<sub>LO</sub></bdi> ואת תדר הבבואה <bdi dir="ltr">f<sub>IM</sub></bdi>.</p>)}<Reveal label="בדיקת תשובה" steps={[<p><bdi dir="ltr">f<sub>LO</sub> = f<sub>RF</sub> + f<sub>IF</sub> = 1000 + 455 = 1455 kHz</bdi></p>, <p><bdi dir="ltr">f<sub>IM</sub> = f<sub>RF</sub> + 2f<sub>IF</sub> = 1000 + 910 = 1910 kHz</bdi></p>]}/><p className={styles.note}>סיכום: התחנה נבחרת, מומרת ל־IF קבוע, מסוננת, וגלאי המעטפת מחלץ את המידע.</p></> },
];

export { data as lesson05Slides };

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
        <div className="sl l5-slide"><header className="sl-h"><div className="sl-eb">{slide.chapter}</div><h2>{slide.title}</h2></header><div className="sl-body">{slide.content}</div><div className="sl-tk"><span>העיקר</span>{slide.takeaway}</div><footer className="sl-f"><span>{slide.chapter}</span><span dir="ltr">{String(index + 1).padStart(2, "0")}</span></footer></div>
      </div>
    </div>
  </div>;
}

export default function Lesson05Player({ lecturerMode = false }: { lecturerMode?: boolean }) {
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [present, setPresent] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState<"unclear" | "example" | "question" | "mistake" | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const playerRef = useRef<HTMLDivElement>(null);
  const slide = data[index];
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
          deckVersion: "lesson-05-am-v2",
          feedbackType: { unclear: "NOT_UNDERSTOOD", example: "NEED_EXAMPLE", question: "QUESTION", mistake: "POSSIBLE_ERROR" }[feedbackChoice],
          optionalComment: feedbackComment.trim(),
          submittedAt: new Date().toISOString(),
          pageUrl: window.location.href,
          idempotencyKey: `communication-systems:lesson-05:slide-${suffix}`,
        }),
      });
      if (!response.ok) throw new Error("שליחת המשוב נכשלה. נסו שוב.");
      setFeedbackSent(true);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "שליחת המשוב נכשלה. נסו שוב.");
    } finally {
      setFeedbackBusy(false);
    }
  };
  const studentFeedback = <div className={`${playerStyles.feedback} ${present ? playerStyles.feedbackDark : ""}`}>
    {feedbackOpen && <section className={playerStyles.feedbackPopover} role="dialog" aria-label="משוב על השקף">
      <header className={playerStyles.feedbackHeader}><div><b>משוב על השקף</b><span>{String(index + 1).padStart(2, "0")} · {slide.title}</span></div><button type="button" aria-label="סגירת משוב" onClick={() => setFeedbackOpen(false)}>×</button></header>
      {feedbackSent ? <div className={playerStyles.feedbackSent}><div className={playerStyles.feedbackSentCard}><span>✓</span><div><b>תודה, המשוב נשמר</b><p>המשוב נשלח למרצה באופן אנונימי.</p></div></div><div className={playerStyles.feedbackActions}><button type="button" onClick={() => setFeedbackOpen(false)}>סגירה</button></div></div> : <div className={playerStyles.feedbackBody}><b>מה תרצו לשתף?</b><div className={playerStyles.feedbackOptions}>{([["unclear", "לא הבנתי"], ["example", "צריך עוד דוגמה"], ["question", "יש לי שאלה"], ["mistake", "נראה שיש טעות"]] as const).map(([key, label]) => <button type="button" key={key} aria-pressed={feedbackChoice === key} className={feedbackChoice === key ? playerStyles.feedbackOptionSelected : ""} onClick={() => setFeedbackChoice(key)}><span aria-hidden="true">{key === "mistake" ? "!" : key === "example" ? "?" : key === "question" ? "✎" : "…"}</span><span><b>{label}</b></span></button>)}</div><textarea rows={3} maxLength={800} value={feedbackComment} onChange={(event) => setFeedbackComment(event.target.value)} placeholder="אפשר להוסיף כמה מילים (אופציונלי)" />{feedbackError && <p className={playerStyles.feedbackError} role="alert">{feedbackError}</p>}<footer><button type="button" disabled={!feedbackChoice || feedbackBusy} onClick={() => void sendFeedback()}>{feedbackBusy ? "שולח…" : "שליחה"}</button><small>נשמר לשקף הזה · אנונימי למרצה</small></footer></div>}
    </section>}
    <button type="button" className={playerStyles.feedbackFab} aria-label="משוב על השקף" aria-expanded={feedbackOpen} onClick={() => setFeedbackOpen((value) => !value)}>{feedbackOpen ? "×" : "✎"}</button>
  </div>;
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

  if (!opened) return <section className={`l4-player ${playerStyles.preview}`} aria-label="תצוגה מקדימה של מערך השיעור" data-lesson-player="true" data-course-id="communication-systems" data-lesson-id="lesson-05" data-deck-version="lesson-05-am-v2">
    <div className={playerStyles.previewStage}><ScaledSlide slide={previewSlide} index={0} hostClass={playerStyles.stage}/></div>
    <footer className={playerStyles.previewFooter}><div><strong>מערך שיעור 05 · מקלט AM — סופר־הטרודיין וגלאי מעטפת</strong><span>{data.length} שקפים</span></div><button type="button" className={playerStyles.openLessonButton} onClick={() => { setIndex(0); setOutlineOpen(true); setNotesOpen(false); setOpened(true); }}>פתיחת מערך השיעור <span aria-hidden="true">←</span></button></footer>
  </section>;

  if (typeof document === "undefined") return null;
  if (present) return createPortal(<div dir="rtl" data-lesson-id="lesson-05" className={`l4-player syllo-student-app ${playerStyles.present}`} role="dialog" aria-label="הצגת שקף שיעור 05">
    <ScaledSlide slide={slide} index={index} hostClass={playerStyles.presentStage} />
    <div className={playerStyles.presentControls}><button type="button" onClick={() => go(index - 1)}>הקודם</button><span dir="ltr">{String(index + 1).padStart(2, "0")} / {data.length}</span><button type="button" onClick={() => go(index + 1)}>הבא</button><button type="button" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות מרצה · N</button><button type="button" onClick={() => setPresent(false)}>יציאה · Esc</button></div>
    {!lecturerMode && studentFeedback}
    {notesOpen && <aside className={playerStyles.speakerNotes}><b>הערות מרצה</b><p>{slide.notes.join(" · ")}</p></aside>}
  </div>, document.body);

  return createPortal(<div ref={playerRef} dir="rtl" data-lesson-id="lesson-05" className={`l4-player syllo-student-app ${playerStyles.player} ${outlineOpen ? playerStyles.withOutline : ""} ${notesOpen ? playerStyles.withContext : ""}`} aria-label="מערך שיעור 05">
    <header className={playerStyles.playerToolbar}>
      <div className={playerStyles.lessonIdentity}><a className={playerStyles.courseBreadcrumb} href={lecturerMode ? "/lecturer/sessions#lessons" : "/course/communication-systems/lessons"}><span className={playerStyles.breadcrumbArrow} aria-hidden="true">›</span><span><small>{lecturerMode ? "חזרה לפנל המרצים" : "חזרה למערכי השיעור"}</small><b>מערכות תקשורת</b></span></a><span className={playerStyles.toolbarDivider}/><span className={playerStyles.lessonBadge} dir="ltr">05</span><span className={playerStyles.lessonTitle}>מקלט AM — סופר־הטרודיין וגלאי מעטפת</span></div>
      <nav className={playerStyles.loopPhases} aria-label="שלבי השיעור"><a className={playerStyles.phaseActive} href={lecturerMode ? "/lecturer/lessons/lesson-05/slides" : "/course/communication-systems/lessons/lesson-05/slides"}><span dir="ltr">01</span>מערך השיעור</a><a href={lecturerMode ? "/lecturer/lessons/lesson-05/practice" : "/course/communication-systems/lessons/lesson-05/practice"}><span dir="ltr">02</span>תרגול</a></nav>
      <div className={playerStyles.toolbarActions}><button type="button" className={playerStyles.toolbarButton} aria-label="מבנה השיעור" aria-pressed={outlineOpen} onClick={() => setOutlineOpen((value) => !value)}>☷</button><button type="button" className={`${playerStyles.toolbarButton} ${playerStyles.toolbarTextButton}`} aria-label="הערות מרצה" aria-pressed={notesOpen} onClick={() => setNotesOpen((value) => !value)}>הערות</button><button type="button" className={playerStyles.presentButton} onClick={() => setPresent(true)}>הצגה</button></div>
    </header>
    <div className={playerStyles.loopProgress}/>
    <div className={playerStyles.playerWorkspace}>
      {outlineOpen && <aside className={playerStyles.outline} aria-label="מבנה השיעור"><header className={playerStyles.outlineHeader}><div className={playerStyles.outlineTitleRow}><span className={playerStyles.lessonBadge} dir="ltr">05</span><div><span className={playerStyles.eyebrow}>מערך השיעור · מקלט AM</span><h2>סופר־הטרודיין וגלאי מעטפת</h2></div></div><div className={playerStyles.lessonProgress}><span>{index + 1}/{data.length} שקפים</span><i><b style={{ width: `${(index + 1) / data.length * 100}%` }}/></i></div></header><div className={playerStyles.outlineSectionHeading}>מבנה השיעור</div><nav className={playerStyles.outlineScroll}>{chapters.map((chapter, chapterIndex) => <section className={playerStyles.chapter} key={chapter}><button type="button" className={`${playerStyles.chapterButton} ${slide.chapter === chapter ? playerStyles.chapterActive : ""}`}><span className={playerStyles.chapterNumber} dir="ltr">{String(chapterIndex + 1).padStart(2, "0")}</span><span className={playerStyles.chapterTitle}>{chapter}</span></button><div className={playerStyles.chapterSlides}>{data.map((item, slideIndex) => item.chapter === chapter && <button type="button" key={slideIndex} className={`${playerStyles.slideLink} ${index === slideIndex ? playerStyles.slideActive : ""}`} onClick={() => go(slideIndex)}><span className={playerStyles.slideNumber} dir="ltr">{String(slideIndex + 1).padStart(2, "0")}</span><span className={playerStyles.slideTitle}>{item.title}</span></button>)}</div></section>)}</nav></aside>}
      <main className={playerStyles.playerMain} aria-label="נגן שיעור 05"><div className={playerStyles.stageWrap}><ScaledSlide slide={slide} index={index} hostClass={playerStyles.stage}/></div><footer className={playerStyles.playerFooter}><div className={playerStyles.chapterBar}>{chapters.map((chapter) => { const chapterSlides = data.filter((item) => item.chapter === chapter); const start = data.findIndex((item) => item.chapter === chapter); const progress = Math.max(0, Math.min(100, (index - start + 1) / chapterSlides.length * 100)); return <button type="button" key={chapter} className={`${playerStyles.chapterSegment} ${slide.chapter === chapter ? playerStyles.segmentActive : ""}`} style={{ flex: chapterSlides.length }} onClick={() => go(start)} aria-label={`מעבר לפרק ${chapter}`}><i style={{ width: `${progress}%` }}/></button>; })}</div><div className={playerStyles.slideNav}><button type="button" className={playerStyles.navButton} onClick={() => go(index - 1)} aria-label="לשקף הקודם">‹</button><span className={playerStyles.slideCount} dir="ltr">{String(index + 1).padStart(2, "0")} / {data.length}</span><button type="button" className={playerStyles.navButton} onClick={() => go(index + 1)} aria-label="לשקף הבא">›</button><span className={playerStyles.chapterLabel}>{slide.chapter}</span></div></footer></main>
      {notesOpen && <aside className={playerStyles.slideContext} aria-label="הערות מרצה לשקף"><header className={playerStyles.contextHeader}><span>הערות מרצה</span><b dir="ltr">{String(index + 1).padStart(2, "0")}</b></header><div className={playerStyles.contextBody}><div className={playerStyles.takeaway}><small>העיקר</small>{slide.takeaway}</div><section className={playerStyles.contextSection}><h3>מפת מושגים</h3><p>הקשרים בין אות AM משיעור 4 לבין קליטת התחנה בשיעור 5.</p>{concepts.filter((concept) => visibleConceptIds.includes(concept.conceptId)).map((concept) => <Link className={playerStyles.conceptCard} key={concept.conceptId} href={`/course/communication-systems/concepts/${concept.conceptId}`}><b>{concept.name}</b><small>{concept.description}</small></Link>)}<Link href="/course/communication-systems/concepts" className={playerStyles.contextMore}>למפת המושגים המלאה ←</Link></section><h3>הערות לשקף</h3><ul>{slide.notes.map((note) => <li key={note}>{note}</li>)}</ul></div></aside>}
      {!lecturerMode && studentFeedback}
    </div>
  </div>, document.body);
}
