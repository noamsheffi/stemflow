export type CourseMindMapNode = {
  id: string;
  title: string;
  conceptId?: string;
  kind: "root" | "lesson" | "topic" | "concept";
  lessonNumber?: number;
  children: CourseMindMapNode[];
};

const concept = (id: string, title: string): CourseMindMapNode => ({ id, conceptId: id, title, kind: "concept", children: [] });
const topic = (id: string, title: string, children: CourseMindMapNode[]): CourseMindMapNode => ({ id, title, kind: "topic", children });
const lesson = (number: number, title: string, children: CourseMindMapNode[]): CourseMindMapNode => ({ id: `lesson-${number}`, lessonNumber: number, title, kind: "lesson", children });

/** Curated parent-child structure: cross-topic associations stay as dotted links. */
export const courseMindMap: CourseMindMapNode = {
  id: "course-root",
  title: "מערכות תקשורת",
  kind: "root",
  children: [
    lesson(1, "יסודות המערכת", [
      topic("architecture", "מבנה המערכת", [
        concept("block-diagram", "תרשים מלבנים של מערכת תקשורת"),
        concept("simplex-duplex", "כיווניות שידור (Simplex / Duplex)"),
        topic("sending-receiving", "משדר ומקלט", [
          concept("transmitter", "משדר (Tx)"),
          concept("receiver", "מקלט סופר־הטרודיין (Rx)"),
        ]),
        topic("power-measurement", "הספק ומדידה", [concept("decibels-power", "חישובי דציבלים והספקים")]),
      ]),
      topic("channel", "הערוץ והתפשטות", [
        concept("channel-noise", "תווך שידור ורעש תרמי"),
        topic("wave-and-antenna", "גלים ואנטנות", [
          concept("wave-propagation", "תצורות התפשטות גלים"),
          concept("wavelength-antenna", "אורך גל ואנטנות"),
        ]),
        topic("frequency-selection", "בחירת תדר", [concept("filters", "מסננים ותדר קטיעה")]),
      ]),
    ]),
    lesson(2, "אותות ורוחב פס", [
      topic("signal-description", "תיאור האות", [
        concept("periodic-random", "אות מחזורי מול אות אקראי"),
        topic("signal-domains", "מייצוג להבנת ספקטרום", [
          concept("time-freq-domains", "תחום הזמן מול תחום התדר"),
          concept("harmonics-fourier", "טור פורייה והרמוניות"),
          concept("bandwidth", "רוחב פס (BW)"),
        ]),
      ]),
      topic("channel-capacity", "מגבלות ערוץ", [concept("shannon-capacity", "קיבולת ערוץ שאנון־הרטלי")]),
    ]),
    lesson(3, "מתנדים ומשוב", [
      topic("oscillation", "איך נוצרת תנודה?", [
        concept("oscillator", "מתנד אלקטרוני"),
        concept("thermal-noise", "התנעה מרעש תרמי"),
        concept("barkhausen", "קריטריון ברקהאוזן"),
      ]),
      topic("oscillator-circuits", "מימושים ושימושים", [
        concept("colpitts-hartley", "מתנדי RF: קולפיץ והרטלי"),
        concept("wien-bridge", "מתנד גשר ויין"),
        concept("rc-phase-shift", "מתנד הסחת מופע RC"),
        concept("crystal-oscillator", "מתנד גבישי"),
        concept("local-oscillator", "מתנד מקומי (LO) וסחף תדרים"),
      ]),
    ]),
    lesson(4, "אפנון תנופה AM", [
      topic("why-modulate", "למה ואיך מאפננים?", [
        concept("modulation-need", "הצורך הפיזיקלי באפנון"),
        concept("carrier-wave", "גל נושא מול אות מידע"),
        topic("am-signal", "אות AM", [
          concept("modulation-am", "אפנון תנופה (AM)"),
          concept("envelope-ma", "מעטפת האות ומקדם אפנון"),
        ]),
      ]),
      topic("am-spectrum-power", "ספקטרום והספק", [
        concept("spectrum-am", "ספקטרום AM ופסי צד"),
        concept("power-efficiency-am", "מאזן הספקים ונצילות AM"),
        concept("ssb-dsb", "DSB-SC ו־SSB"),
      ]),
      topic("am-reception", "קליטת המידע", [concept("envelope-detector", "גלאי מעטפת")]),
    ]),
    lesson(5, "FM ותקשורת ספרתית", [
      topic("frequency-modulation", "אפנון תדר", [
        concept("modulation-fm", "אפנון תדר (FM)"),
        concept("carson-rule", "רוחב פס ב־FM וכלל קארסון"),
      ]),
      topic("digital-communication", "מעולם רציף לנתונים", [
        concept("nyquist-sampling", "משפט הדגימה של נייקוויסט"),
        concept("pcm-encoding", "דגימה, קוונטיזציה ו־PCM"),
        concept("digital-modulation", "אפנונים ספרתיים (ASK, FSK, PSK, QAM)"),
      ]),
    ]),
  ],
};
