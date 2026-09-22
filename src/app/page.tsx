import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./company.module.css";
import LecturerInterestModal from "../components/lecturer-interest-modal";

export const metadata: Metadata = {
  title: "Syllo | מהשיעור הזה לשיעור הבא",
  description: "Syllo מחברת בין ההוראה בכיתה ללמידה שאחריה. סביבת למידה לסטודנטים וכלים למרצים להתבונן, ללמוד ולשפר את השיעור הבא.",
};

const steps = [
  { number: "01", title: "מלמדים ומתבוננים", text: "מסמנים בזמן השיעור מה עבד, איפה היה קושי ולמה כדאי לחזור." },
  { number: "02", title: "ממשיכים ללמוד", text: "הסטודנטים חוזרים לשיעורים, לנוסחאות ולמושגים — בתוך ההקשר של הקורס." },
  { number: "03", title: "חוזרים עם כיוון", text: "עוצרים לרפלקציה, בוחנים את הסימנים מהלמידה ומחליטים מה לשנות בפעם הבאה." },
];

export default function CompanyHome() {
  return (
    <div className={styles.site}>
      <a className={styles.skip} href="#main">דילוג לתוכן</a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Syllo — דף הבית">
          <Image src="/brand/syllo-logo.png" alt="Syllo" width={1584} height={672} priority />
        </Link>
        <nav className={styles.nav} aria-label="ניווט ראשי">
          <a href="#approach">איך זה עובד</a>
          <a href="#about">על Syllo</a>
        </nav>
        <div className={styles.headerActions}>
          <Link className={styles.entry} href="/workspace">כניסת סטודנטים</Link>
          <LecturerInterestModal />
        </div>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>מהשיעור הזה לשיעור הבא</p>
            <h1 id="hero-title">השיעור נגמר.<br /><span>הלמידה ממשיכה.</span></h1>
            <p className={styles.intro}>בין מה שלימדנו למה שהובן, יש עוד מה לגלות. Syllo מחברת בין ההוראה בכיתה ללמידה שאחריה, כדי לעזור למרצים לשפר את השיעור הבא.</p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/workspace">כניסת סטודנטים</Link>
              <a className={styles.secondary} href="#approach">להכיר את הדרך שלנו</a>
            </div>
            <p className={styles.note}>נבנית מתוך הוראה אמיתית, בקורס STEM פעיל.</p>
          </div>
          <div className={styles.loop} aria-label="מחזור הלמידה של Syllo: בכיתה, אחרי השיעור ולקראת השיעור הבא">
            <div className={styles.loopHeading}><span>מחזור אחד. למידה מתמשכת.</span><span dir="ltr">SYLLO / LOOP</span></div>
            <div className={styles.loopStep}>
              <span className={styles.stepSymbol} aria-hidden="true">01</span>
              <div><span className={styles.loopLabel}>בכיתה</span><h2>לתפוס את הרגע</h2><p>מה עבד? איפה צריך לעצור?</p></div>
            </div>
            <div className={styles.loopStep}>
              <span className={styles.stepSymbol} aria-hidden="true">02</span>
              <div><span className={styles.loopLabel}>אחרי השיעור</span><h2>לחבר את הידע</h2><p>שיעורים · נוסחאות · מושגים</p></div>
            </div>
            <div className={`${styles.loopStep} ${styles.nextStep}`}>
              <span className={styles.stepSymbol} aria-hidden="true">03</span>
              <div><span className={styles.loopLabel}>לקראת השיעור הבא</span><h2>לדעת מה לשנות</h2><p>רפלקציה שהופכת לפעולה.</p></div>
            </div>
            <p className={styles.loopReturn}>כל שיעור הוא התחלה של השיעור הבא</p>
          </div>
        </section>
        <section id="approach" className={styles.approach} aria-labelledby="approach-title">
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>הדרך שלנו</p><h2 id="approach-title">להפוך את הניסיון של היום<br />להוראה של מחר.</h2></div>
          <div className={styles.steps}>{steps.map((step) => (
            <article key={step.number}><span className={styles.number}>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>
          ))}</div>
        </section>
        <section id="about" className={styles.about} aria-labelledby="about-title">
          <div><p className={styles.eyebrow}>מתחילים מהכיתה</p><h2 id="about-title">נולדה מתוך ההוראה.<br />נבנית מתוך השימוש.</h2></div>
          <div className={styles.aboutText}><p>Syllo התחילה בקורס מערכות תקשורת, מתוך צורך של מרצה להבין מה קורה ללמידה גם אחרי שהשיעור מסתיים.</p><p>היום אנחנו מפתחים ומשתמשים בה בתוך הקורס עצמו. מחברים חומרי לימוד, כלים לסטודנטים ורפלקציה למרצה — ולומדים מכל שיעור איך להשתפר.</p><span className={styles.stage}>בשלב פיתוח ושימוש ראשוני</span></div>
        </section>
      </main>
      <footer className={styles.footer}><span dir="ltr" className={styles.wordmark}>Syllo<span>.</span></span><p>הוראה, למידה ומה שביניהן.</p><Link href="/workspace">כניסת סטודנטים</Link></footer>
    </div>
  );
}
