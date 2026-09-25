import type { Metadata } from "next";
import Link from "next/link";
import LecturerInterestModal from "../components/lecturer-interest-modal";
import LandingDemo, { LearningLoop } from "../components/landing-interactions";
import styles from "./company.module.css";

export const metadata: Metadata = {
  title: "Syllo | מהשיעור הזה לשיעור הבא",
  description: "סביבת למידה שמחברת בין ההוראה בכיתה, הלמידה שאחריה והשיעור הבא.",
};

const learningSteps = [
  {
    number: "01", stage: "בכיתה", title: "לתפוס את הרגע",
    description: "מערך השיעור פתוח לסטודנטים בזמן אמת. אפשר להתנסות בסימולציות ולסמן על השקף מה לא ברור.",
    points: ["מערך שיעור אינטראקטיבי, מחולק לשאלות מרכזיות", "משוב על כל שקף בלי להרים יד", "נוסחאות ומושגים בהקשר של החומר"],
  },
  {
    number: "02", stage: "אחרי השיעור", title: "לחבר את הידע",
    description: "התרגול ממשיך את השיעור, והנוסחאות והמושגים מופיעים לצד הקשרם בקורס.",
    points: ["תרגול אינטראקטיבי", "נוסחאון עם הסבר לסמלים וליחידות", "מפת מושגים שמציגה את הקשרים בקורס"],
  },
  {
    number: "03", stage: "לקראת השיעור הבא", title: "לדעת מה לשנות",
    description: "רפלקציה קצרה ומשובים מהשיעור עוזרים למרצה לראות מה כדאי לחזק בפעם הבאה.",
    points: ["רפלקציה אישית קצרה", "תמונה מרוכזת לפי מושג ושקף", "תובנות לקראת השיעור הבא"],
  },
];

function Brand({ small = false }: { small?: boolean }) {
  return <span className={`${styles.brand} ${small ? styles.brandSmall : ""}`} dir="ltr" aria-label="Syllo">
    <svg viewBox="0 0 26 14" aria-hidden="true"><path d="M7 2a5 5 0 1 0 0 10c4 0 8-10 12-10a5 5 0 1 1 0 10c-4 0-8-10-12-10z" /></svg>
    <span>Syllo</span>
  </span>;
}

function Waveform() {
  const width = 480, height = 120, middle = height / 2;
  let signal = "", upper = "", lower = "";
  for (let point = 0; point <= 360; point += 1) {
    const x = point / 360 * width;
    const t = point / 360 * Math.PI * 4;
    const envelope = 1 + 0.58 * Math.cos(t);
    signal += `${point ? "L" : "M"}${x.toFixed(1)} ${(middle - 29 * envelope * Math.cos(12 * t)).toFixed(1)} `;
    if (point % 4 === 0) {
      upper += `${upper ? "L" : "M"}${x.toFixed(1)} ${(middle - 29 * envelope).toFixed(1)} `;
      lower += `${lower ? "L" : "M"}${x.toFixed(1)} ${(middle + 29 * envelope).toFixed(1)} `;
    }
  }
  return <svg className={styles.wave} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="גל AM: המעטפת משתנה סביב גל הנושא">
    <line x1="0" x2={width} y1={middle} y2={middle} />
    <path className={styles.waveSignal} d={signal} />
    <path className={styles.waveEnvelope} d={upper} /><path className={styles.waveEnvelope} d={lower} />
  </svg>;
}

function StepVisual({ index }: { index: number }) {
  if (index === 0) return <div className={styles.visualStack}>
    <article className={styles.slidePreview}>
      <div className={styles.previewTop}><span>שיעור 04 · מה רואים בזמן?</span><span className={styles.mono} dir="ltr">17 / 44</span></div>
      <div className={styles.previewBody}><strong>התנופה משתנה. תדר הנושא נשאר קבוע</strong><Waveform /></div>
    </article>
    <div className={styles.chips}><span className={styles.flagChip}><i aria-hidden="true">?</i>סומן: לא ברור לי</span><span className={styles.chip}>מעטפת · Envelope</span><span className={styles.chip}>מקדם אפנון</span></div>
  </div>;
  if (index === 1) return <div className={styles.visualStack}>
    <article className={styles.formulaPreview}><div><small>שיעור 04 · מקדם אפנון</small><strong>מקדם אפנון מהמעטפת</strong></div><span className={styles.equation} dir="ltr">mₐ = (Vmax − Vmin) / (Vmax + Vmin)</span></article>
    <article className={styles.formulaPreview}><div><small>שיעור 04 · רוחב פס</small><strong>רוחב סרט AM</strong></div><span className={styles.equation} dir="ltr">BW = 2 · fₘ</span></article>
    <article className={styles.mapPreview} aria-label="מושגים קשורים באפנון AM"><svg viewBox="0 0 460 120" role="img" aria-label="מתנד ורוחב פס מתחברים לאפנון תנופה ולמשדר AM"><g className={styles.mapEdges}><path d="M120 38 C160 38 180 60 220 60"/><path d="M120 88 C160 88 180 60 220 60"/><path d="M320 60h40"/></g><g className={styles.mapNodes}><rect x="20" y="20" width="100" height="36" rx="8"/><text x="70" y="43">מתנד</text><rect x="20" y="70" width="100" height="36" rx="8"/><text x="70" y="93">רוחב פס</text><rect className={styles.mapSelected} x="220" y="42" width="100" height="36" rx="8"/><text className={styles.mapSelectedText} x="270" y="65">אפנון תנופה</text><rect x="360" y="42" width="90" height="36" rx="8"/><text x="405" y="65">משדר AM</text></g></svg></article>
  </div>;
  return <div className={styles.visualStack}>
    <article className={styles.reflectionPreview}><strong>מה עבד לך בשיעור?</strong><div className={styles.scale}><span>לא הבנתי</span><span>חלקית</span><span className={styles.scaleSelected}>הבנתי</span><span>הבנתי היטב</span></div></article>
    <p className={styles.downArrow}>↓ אצל המרצה</p>
    <article className={styles.lecturerPreview}><small>לקראת שיעור 05 · המחשה</small><strong>איפה הכיתה צריכה עזרה</strong>{[["זהות טריגונומטרית", "62%", 62], ["מקדם אפנון", "34%", 34], ["נצילות הספק", "21%", 21]].map(([label, amount, width]) => <div className={styles.metricBar} key={label as string}><span>{label}</span><div><i style={{ width: `${width}%` }} /></div><span className={styles.mono} dir="ltr">{amount}</span></div>)}</article>
  </div>;
}

export default function CompanyHome() {
  return <div className={styles.site}>
    <a className={styles.skip} href="#main">דילוג לתוכן</a>
    <header className={styles.header}>
      <Link className={styles.brandLink} href="/" aria-label="Syllo — דף הבית"><Brand /></Link>
      <nav className={styles.nav} aria-label="ניווט ראשי"><a href="#how">איך זה עובד</a><a href="#lecturers">למרצים</a><a href="#about">על Syllo</a></nav>
      <div className={styles.headerActions}><Link className={styles.softButton} href="/workspace">כניסת סטודנטים</Link><LecturerInterestModal triggerClassName={styles.outlineButton} /></div>
    </header>

    <main id="main">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}><p className={styles.eyebrow}>מהשיעור הזה לשיעור הבא</p><h1 id="hero-title">השיעור נגמר.<br /><span>הלמידה ממשיכה.</span></h1><p className={styles.intro}>בין מה שלימדנו למה שהובן, יש עוד מה לגלות. Syllo מחברת בין ההוראה בכיתה ללמידה שאחריה, כדי לעזור למרצים לשפר את השיעור הבא.</p><div className={styles.heroActions}><Link className={styles.primaryButton} href="/workspace">כניסת סטודנטים <span aria-hidden="true">←</span></Link><a className={styles.textButton} href="#how">להכיר את הדרך שלנו ←</a></div><p className={styles.note}>נבנית מתוך הוראה אמיתית, בקורס STEM פעיל.</p></div>
        <LearningLoop />
      </section>

      <section id="how" className={styles.howSection} aria-labelledby="how-title">
        <header className={styles.sectionHeading}><p className={styles.eyebrow}>איך זה עובד</p><h2 id="how-title">שלושה שלבים לכל שיעור.</h2><p>כל שיעור בקורס בנוי כמחזור קבוע. הסטודנטים יודעים מה הצעד הבא, והמרצה רואה איפה הכיתה נמצאת.</p></header>
        <div className={styles.stepList}>{learningSteps.map((step, index) => <article className={styles.stepRow} key={step.number}>
          <div className={styles.stepCopy}><div className={styles.stepKicker}><span className={styles.mono} dir="ltr">{step.number}</span><span>{step.stage}</span></div><h3>{step.title}</h3><p>{step.description}</p><ul>{step.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
          <div className={styles.stepVisual}><StepVisual index={index} /></div>
        </article>)}</div>
      </section>

      <section id="demo" className={styles.demoSection} aria-labelledby="demo-title"><LandingDemo /></section>

      <section id="lecturers" className={styles.lecturersSection} aria-labelledby="lecturers-title"><div className={styles.sectionHeading}><p className={styles.eyebrow}>למרצים</p><h2 id="lecturers-title">לדעת מה קרה בכיתה, לפני שנכנסים לשיעור הבא.</h2><p>המערך שכבר בנית הופך לחוויה מלאה לסטודנטים, והלמידה שלהם חוזרת אליך כמידע שאפשר לפעול לפיו.</p></div>
        <div className={styles.lecturerGrid}><article><span className={styles.mono} dir="ltr">01</span><h3>המערך שלך, כמו שהוא</h3><p>משלבים מערך שיעור קיים, פרקים וחומרי עזר הקשורים לנושאים בקורס.</p></article><article><span className={styles.mono} dir="ltr">02</span><h3>מצב הצגה בכיתה</h3><p>מציגים את המערך בכיתה, עם הערות מרצה, סימולציות ומשוב מהסטודנטים.</p></article><article><span className={styles.mono} dir="ltr">03</span><h3>תמונת מצב לפני כל שיעור</h3><p>רואים אילו שקפים סומנו, באילו נושאים כדאי להתמקד, ומה לחזק בשיעור הבא.</p></article></div>
        <div className={styles.lecturerCta}><span>רוצים לקבל עדכון על כלי המרצים?</span><LecturerInterestModal triggerClassName={styles.primaryButton} /></div>
      </section>

      <section id="about" className={styles.aboutSection} aria-labelledby="about-title"><blockquote>לא עוד מערכת לניהול קורסים. <em>מחזור אחד</em> שמחבר בין מה שלימדנו למה שהובן.</blockquote><div><p className={styles.eyebrow}>מתחילים מהכיתה</p><h2 id="about-title">נולדה מתוך ההוראה.<br />נבנית מתוך השימוש.</h2><p>Syllo התחילה בקורס מערכות תקשורת, מתוך הצורך להבין מה קורה ללמידה גם אחרי שהשיעור מסתיים. אנחנו מפתחים ומשתמשים בה בתוך הקורס עצמו — ולומדים מכל שיעור איך להשתפר.</p><p>המטרה פשוטה: שכל שיעור יהיה קצת יותר טוב מהקודם.</p><div className={styles.courseTag}><span className={styles.courseBadge}>מת</span><span><small className={styles.mono} dir="ltr">11.9004 · סמסטר א׳</small><strong>מערכות תקשורת · נועם שפי</strong></span></div></div></section>

      <section className={styles.finalCta}><p className={styles.eyebrow}>Syllo · מחזור למידה מתמשך</p><h2>השיעור הבא<br /><span>מתחיל עכשיו.</span></h2><div><Link className={styles.primaryButton} href="/workspace">כניסת סטודנטים <span aria-hidden="true">←</span></Link><a className={styles.outlineButton} href="#lecturers">כניסת מרצים</a></div></section>
    </main>
    <footer className={styles.footer}><Link className={styles.brandLink} href="/" aria-label="Syllo — דף הבית"><Brand small /></Link><p>מהשיעור הזה לשיעור הבא.</p><nav aria-label="קישורי תחתית"><a href="#how">איך זה עובד</a><a href="#about">על Syllo</a><a href="#lecturers">יצירת קשר</a></nav></footer>
  </div>;
}
