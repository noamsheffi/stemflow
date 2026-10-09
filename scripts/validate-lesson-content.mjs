import { readFile } from "node:fs/promises";

const deckPath = new URL("../src/components/lesson-05-player.tsx", import.meta.url);
const lesson4DeckPath = new URL("../src/components/lesson-04-player.tsx", import.meta.url);
const playerStylePath = new URL("../src/components/lesson-04-player.module.css", import.meta.url);
const lesson5StylePath = new URL("../src/components/lesson-05-player.module.css", import.meta.url);
const conceptPath = new URL("../src/lib/concept-map-data.json", import.meta.url);
const studentWorkspacePath = new URL("../src/components/student-workspace.tsx", import.meta.url);
const feedbackApiPath = new URL("../src/app/api/student/slide-feedback/route.ts", import.meta.url);
const extensionManifestPath = new URL("../extensions/lecturer-reflection/manifest.json", import.meta.url);
const exportedHtmlPath = new URL("../public/courses/communication-systems/lesson-05/lesson.html", import.meta.url);
const [deck, lesson4Deck, playerStyle, lesson5Style, conceptJson, studentWorkspace, feedbackApi, extensionManifestText, exportedHtml] = await Promise.all([
  readFile(deckPath, "utf8"),
  readFile(lesson4DeckPath, "utf8"),
  readFile(playerStylePath, "utf8"),
  readFile(lesson5StylePath, "utf8"),
  readFile(conceptPath, "utf8"),
  readFile(studentWorkspacePath, "utf8"),
  readFile(feedbackApiPath, "utf8"),
  readFile(extensionManifestPath, "utf8"),
  readFile(exportedHtmlPath, "utf8"),
]);
const extensionManifest = JSON.parse(extensionManifestText);
const concepts = JSON.parse(conceptJson);
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

const dataBlock = deck.match(/const data: DeckSlide\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const slides = dataBlock.split("\n").filter((line) => /^\s*\{ chapter:/.test(line));
check(slides.length >= 30, `Expected a complete lesson 5 deck; found ${slides.length} slide records.`);
check(slides.every((line) => line.includes("title:") && line.includes("minutes:") && line.includes("takeaway:") && line.includes("notes:") && line.includes("content:")), "Every slide record must include a title, planned duration, takeaway, teaching notes, and student content.");
const plannedMinutes = slides.reduce((sum, line) => sum + Number(line.match(/minutes: (\d+)/)?.[1] ?? 0), 0);
check(plannedMinutes === 135, `Expected the source lesson plan duration of 135 minutes including break; found ${plannedMinutes}.`);

check(!/\bf(?:LO|RF|IF|IM)\b/.test(dataBlock), "A frequency symbol uses inline fLO/fRF/fIF/fIM notation; use f with a subscript or KaTeX braces.");
check(!/\{slide\.minutes\}\s*דקות|timeLeft|דק׳ לסיום|דקות בסך הכול|דקות כולל הפסקה/.test(deck), "Slide timing is rendered in the student-facing player; timing should remain planning metadata only.");
check(dataBlock.includes("משדר AM בשיעור 4: ממקור המידע לאנטנה") && ["מיקרופון", "מסנן שמע", "אפנן AM", "מגבר הספק", "אנטנה"].every((term) => dataBlock.includes(term)), "The lesson 4 bridge must be a separate slide showing the transmitter path from source to antenna.");
check(dataBlock.includes("מפת חזרה משיעור 4: מאות AM לתדרי פסי הצד") && deck.includes("BW<sub>AM</sub> = f<sub>USB</sub> − f<sub>LSB</sub> = 2f<sub>m,max</sub>") && deck.includes("P<sub>SB</sub>") && deck.includes(String.raw`P_{AM}=P_c\\left(1+\\frac{m_a^2}{2}\\right)`), "The opening must explicitly review the prior lesson's AM spectrum, bandwidth, and power relationships.");
check(dataBlock.includes("שאלת פתיחה: איך בוחרים תחנה אחת?") && dataBlock.includes("מה יש בתוך אות AM? נושא ושני פסי צד"), "The opening question and the AM spectrum teaching slide must be distinct from the lesson 4 recap.");
check(dataBlock.includes("<AMSpectrum />") && deck.includes("פס צד תחתון") && deck.includes("פס צד עליון") && deck.includes("f<tspan") && deck.includes(">משרעת</text>") && deck.includes(">תדר</text>") && deck.includes("התרשים איכותי"), "The AM spectrum plot must label both axes, the carrier, both sidebands, and clarify that the drawn heights are qualitative.");
check(dataBlock.includes("מקדם האיכות") && dataBlock.includes("רוחב פס") && dataBlock.includes("Tuned Radio Frequency"), "Define Q, bandwidth, and TRF before asking students to use them.");
const trfIntro = slides.find((line) => line.includes('title: "מקלט ישיר: מסנן')) ?? "";
const bandwidthDefinition = slides.find((line) => line.includes('title: "רוחב פס המסנן')) ?? "";
check(Boolean(trfIntro && !trfIntro.includes("BW=")), "The TRF overview slide should not combine the receiver definition with the bandwidth formula.");
const amReviewSlide = deck.match(/title: "מפת חזרה משיעור 4:[\s\S]*?content: <div className=\{styles\.amReview\}[\s\S]*?\},/)?.[0] ?? "";
check(amReviewSlide.includes("תדר המידע:") && amReviewSlide.includes("עומק האפנון:") && amReviewSlide.includes("מידת השינוי במשרעת הנושא") && amReviewSlide.includes("חסר יחידות") && !amReviewSlide.includes("f<sub>m</sub> · m<sub>a</sub>"), "The AM concept map must distinguish the information frequency from the dimensionless modulation depth, define its meaning, and avoid ambiguous dot notation.");
check(Boolean(bandwidthDefinition && bandwidthDefinition.includes("qDefinitionCards") && bandwidthDefinition.includes(String.raw`Q=\\frac{f_0}{BW}`) && !bandwidthDefinition.includes("<TRFResponseGraph />")), "The Q concept slide must define Q and bandwidth in large cards before the graph, using a stacked fraction.");
const responseGraph = deck.match(/function TRFResponseGraph\(\) \{([\s\S]*?)\n\}/)?.[1] ?? "";
const responseGraphSlide = slides.find((line) => line.includes('title: "גרף תגובת המסנן: Q גבוה מול Q נמוך"')) ?? "";
check(Boolean(responseGraphSlide && responseGraphSlide.includes("<TRFResponseGraph />")), "The TRF response graph must have its own full-size slide after Q and bandwidth are defined.");
check(responseGraph.includes("תדר תהודה") && responseGraph.includes("f<tspan baselineShift=\"sub\" fontSize=\"17\">0</tspan>") && responseGraph.includes("f<tspan baselineShift=\"sub\" fontSize=\"13\">L</tspan>") && responseGraph.includes("f<tspan baselineShift=\"sub\" fontSize=\"13\">H</tspan>"), "The TRF graph must label the resonance peak and both passband edges f₀, fL, and fH.");
check(responseGraph.includes("C300 292 380 280 445 215") && responseGraph.includes("C760 280 840 292 970 298") && responseGraph.includes("C460 290 500 280 530 215") && responseGraph.includes("C640 280 680 290 760 298"), "The low- and high-Q curves must intersect the −3 dB threshold at their labeled passband boundaries.");
check(responseGraph.includes("Q נמוך · פס רחב") && responseGraph.includes("Q גבוה · פס צר") && responseGraph.includes("−3 dB") && responseGraph.includes("העקומות איכותיות"), "The TRF graph must compare high and low Q at a half-power threshold and identify its curves as qualitative.");
check(responseGraph.includes("Q=f<sub>0</sub>/BW") && responseGraph.includes("חסר יחידות") && responseGraph.includes("BW=f<sub>H</sub>−f<sub>L</sub>") && responseGraph.includes("חצי־הספק"), "The TRF graph caption must define bandwidth at the half-power threshold and the dimensionless quality factor.");
check(dataBlock.includes("מקדם האיכות") && dataBlock.includes(String.raw`Q=\\frac{f_0}{BW}`) && dataBlock.includes("ללא יחידות") && dataBlock.includes("Q גבוה נותן פס צר יותר"), "Define Q in student-visible text before the graph/example, including the physical meaning of high Q.");
check(dataBlock.includes('className={styles.trfExampleData}') && dataBlock.includes('className={styles.parameterTiles}') && dataBlock.includes('<p><b>f₀</b><span>1.5 MHz = 1500 kHz</span></p><p><b>Q</b><span>50</span></p>'), "The TRF worked example must show f₀ and Q in two separate compact frames on one row.");
check(lesson5Style.includes(".parameterTiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));") && lesson5Style.includes(".trfExampleData{display:grid;width:min(100%,900px);"), "The TRF parameter frames must remain side by side in a compact, centered group.");
check(lesson5Style.includes(".parameterTiles{grid-template-columns:1fr;gap:8px}") && lesson5Style.includes(".architectureSingle h3{min-height:0;font-size:22px}") && lesson5Style.includes(".architectureFlow b{min-width:112px;min-height:66px;flex-basis:112px;font-size:15px;"), "Compact data frames and receiver flow labels must remain readable and fit on mobile.");

const flows = [...dataBlock.matchAll(/<div className=\{styles\.flow\}>([\s\S]*?)<\/div>/g)].map((match) => match[1]);
check(flows.length > 0, "The deck should include its authored signal-flow diagrams.");
check(flows.every((flow) => !flow.includes("→")), "A right-pointing arrow appears in a right-to-left signal-flow diagram.");
const directReceiverSlide = slides.find((line) => line.includes('title: "מקלט ישיר: המסנן עוקב אחרי התחנה"')) ?? "";
const superheterodyneSlide = slides.find((line) => line.includes('title: "מקלט סופר־הטרודיין: המרה ל־IF קבוע"')) ?? "";
check(Boolean(directReceiverSlide && directReceiverSlide.includes("אין המרת תדר") && directReceiverSlide.includes("מסנן ומגבר RF") && !directReceiverSlide.includes("מתנד מקומי")), "The direct receiver slide must teach only the direct/TRF architecture and its retuning behavior.");
check(Boolean(superheterodyneSlide && superheterodyneSlide.includes("מתנד מקומי") && superheterodyneSlide.includes("מסנן IF קבוע") && superheterodyneSlide.includes("455 kHz")), "The superheterodyne slide must explain conversion to a fixed IF and show its signal path.");
check(directReceiverSlide.includes('className: "architectureSingle"') && superheterodyneSlide.includes('className: "architectureSingle"') && slides.indexOf(superheterodyneSlide) === slides.indexOf(directReceiverSlide) + 1, "The dense architecture comparison must be split into two adjacent, consistently framed slides.");
check(lesson5Style.includes(".architectureSingle :global(.sl-body){justify-content:flex-start;align-items:stretch;") && lesson5Style.includes(".architectureSingle article{box-sizing:border-box;display:flex;width:min(100%,1480px);min-height:0;") && lesson5Style.includes(".architectureSingle h3{flex:none;min-height:0;margin:0;color:#008F4D;font-size:36px;") && lesson5Style.includes(".architectureFlow b{box-sizing:border-box;display:flex;min-width:170px;min-height:112px;flex:1 1 170px;"), "The direct/superheterodyne slides must align content to the top, use readable type, and keep equal flow-node frames.");
check(lesson5Style.includes(".receiverStages :global(.sl-body)") && lesson5Style.includes(".receiverStages :global(.sl-card)") && lesson5Style.includes(".mixerOutput :global(.sl-fx)") && lesson5Style.includes(".l5-slide.compact-title :global(.sl-h)"), "Rules targeting shared slide classes must mark them global so CSS Modules apply them to rendered slide markup.");
const receiverStagesSlide = slides.find((line) => line.includes('title: "מה עושה כל דרגה במקלט?"')) ?? "";
const mixerOutputSlide = slides.find((line) => line.includes('title: "מה יוצא מהערבל? סכום והפרש"')) ?? "";
check(Boolean(receiverStagesSlide.includes('className: "receiverStages"') && ["RF", "LO", "IF"].every((signal) => receiverStagesSlide.includes(`<bdi dir=\"ltr\">${signal}</bdi>`))), "Receiver map abbreviations must be isolated LTR labels on separate lines alongside their Hebrew meanings.");
check(Boolean(mixerOutputSlide.includes('className: "mixerOutput"') && mixerOutputSlide.includes('className={styles.mixerInputs}') && mixerOutputSlide.includes('<bdi dir="ltr">RF</bdi>') && mixerOutputSlide.includes('<bdi dir="ltr">LO</bdi>') && !mixerOutputSlide.includes("RF: cos") && !mixerOutputSlide.includes("LO: cos")), "Mixer input signals must be isolated and displayed on separate parameter rows.");
const parameterDataSlides = ["תרגיל מודרך: נתונים ושאלות", "תרגיל: האם 1567 kHz היא בבואה?", "תרגול: נתונים ובחירת קבוע זמן", "תרגול RC: חישוב הגבולות", "תרגול RC: מוצאים קבל מתאים", "כרטיס יציאה: בדקו את ההבנה"];
check(parameterDataSlides.every((title) => {
  const slide = slides.find((line) => line.includes(`title: "${title}"`)) ?? "";
  return slide.includes("className={styles.parameterList}") && (slide.match(/<p><b>/g) ?? []).length >= 2;
}), "Every multi-parameter exercise must put each bold parameter and its value on its own row.");
check(!dataBlock.includes("f<sub>RF</sub> = 540–1600 kHz · f<sub>IF</sub>") && !dataBlock.includes("f<sub>c</sub>=455 kHz · f<sub>m</sub>"), "Parameter data rows must not collapse multiple variables into an inline dot-separated string.");
check(deck.includes("bidiTokenPattern") && deck.includes("TRF|RF|LO|IF|AM|AGC|SNR|RC|LPF") && deck.includes("slide.title.length > 34 ? \"compact-title\""), "Mixed Hebrew/English acronyms must be isolated and long slide titles must use the compact title treatment.");
check(lesson5Style.includes(".l5-slide .three,.l5-slide .two{grid-auto-rows:minmax(160px,1fr);align-items:stretch}") && lesson5Style.includes(".l5-slide.compact-title :global(.sl-h) h2{font-size:48px;"), "Parallel card frames must have consistent row sizing and long headings must fit the slide canvas.");
check(deck.includes('import playerStyles from "./lesson-04-player.module.css"') && deck.includes("playerStyles.outlineHeader") && deck.includes("playerStyles.outlineSectionHeading") && deck.includes("playerStyles.outlineScroll") && deck.includes("playerStyles.chapterButton") && deck.includes("playerStyles.progressRing") && deck.includes("playerStyles.feedbackMarker") && deck.includes("playerStyles.interactiveMark"), "Lesson 5 table of contents must reuse the same outline structure and visual components as lesson 4.");
check(deck.includes("interactive?: boolean") && deck.includes("interactive: Boolean(slide.interactive)") && deck.includes("Boolean(item.interactive)") && deck.includes('aria-label="פרקי השיעור"') && deck.includes('aria-label="שקף אינטראקטיבי"') && deck.includes("playerStyles.closePanel") && deck.includes("chapterIndex === 0 || chapterIndex === chapters.length - 1 ? \"·\""), "The lesson outline must match lesson 4's open/close, chapter markers, and accessible metadata-driven interactive markers.");
check(lesson5Style.includes(".receiverStages :global(.sl-card) p{font-size:24px;") && lesson5Style.includes(".mixerOutput .two p{margin:0;text-align:center;font-size:42px;"), "Receiver labels and mixer results must use readable type that fills their frames.");
check(deck.includes('title: "למה בתחום AM מעדיפים הזרקה גבוהה?", minutes: 7, className: "injectionAnalysis"') && deck.includes('title: "גוזרים את תדר הבבואה", minutes: 2, className: "imageFrequency"') && deck.includes('title: "AGC: חילוץ רמת האות ומשוב שלילי", minutes: 5, className: "agcSlide"') && lesson5Style.includes(".injectionAnalysis :global(.sl-body){justify-content:flex-start;") && lesson5Style.includes(".imageFrequency :global(.sl-body){justify-content:flex-start;") && lesson5Style.includes(".agcSlide :global(.sl-body){justify-content:flex-start;"), "Dense injection, image-frequency, and AGC slides must start below the heading and use slide-specific fitting rules.");
check(deck.includes('<bdi dir="ltr">f<sub>LO</sub></bdi><bdi dir="ltr">{lo} kHz</bdi>') && deck.includes('<bdi dir="ltr">f<sub>IF</sub></bdi><bdi dir="ltr">455 kHz</bdi>') && deck.includes('aria-pressed={side === "high"}') && deck.includes('aria-pressed={side === "low"}') && deck.includes('const image = side === "high" ? rf + 2 * ifHz : rf - 2 * ifHz') && lesson5Style.includes(".tunerValues span{display:grid;grid-template-columns:auto auto;") && lesson5Style.includes(".injectionToggle button[aria-pressed=\"true\"]") && lesson5Style.includes("direction:ltr}"), "Interactive tuner must toggle injection side, update LO/image frequencies and label/value rows in LTR order.");
check(deck.includes("995–2055 kHz") && deck.includes("85–1145 kHz") && deck.includes("2.06 : 1") && deck.includes("13.47 : 1") && deck.includes("≈ 4.3 : 1") && deck.includes("≈ 181 : 1"), "LO tuning-range comparison must show both AM bands and the ideal capacitance ratios.");
check(deck.includes("אזהרת זהב לבחינות מה״ט") && deck.includes("f<sub>RF</sub>≥2f<sub>IF</sub>") && deck.includes("21.4 MHz") && deck.includes("1070</bdi>") && deck.includes("איך המרה כפולה משלבת את היתרונות?"), "Image-frequency exam warning and IF tradeoff/double-conversion explanation must be explicit.");
check(deck.includes("s_{RF}(t)s_{LO}(t)") && deck.includes("A_cA_{LO}") && deck.includes("f_{LO}+f_{RF}") && deck.includes("(f_{LO}+f_{IF})-f_{LO}=f_{IF}"), "Mixer development must show input amplitudes, sum/difference terms, and why the image creates the same IF.");
check(deck.includes("ככל ש־<bdi dir=\"ltr\">m<sub>a</sub>→1</bdi>, המעטפת יורדת בתלילות") && deck.includes("דיודה מוליכה") && deck.includes("הקבל נפרק דרך הנגד"), "Envelope detector explanation must connect diode conduction/discharge and modulation depth to the RC limits.");
check(deck.includes("10 log<sub>10</sub>(P<sub>signal</sub>/P<sub>noise</sub>)") && deck.includes("50 Hz–5 kHz") && deck.includes("LPF איטי") && deck.includes("רכיב DC"), "Receiver metrics must include quantitative definitions and the slow-averaging AGC feedback path.");
check(deck.includes("10.245 MHz") && deck.includes("10.700 − 10.245 = 0.455 MHz") && deck.includes("בהזרקה נמוכה בשלב השני"), "Double conversion must show the second LO and a numerically verified IF2 difference.");
check(lesson5Style.includes("--teal:#008F4D") && lesson5Style.includes("--paper:#f5f0e5") && lesson5Style.includes("background:#26312b"), "Lesson 5 slide skin must use the requested dark/cream Retro Zine palette and product green.");
const amPowerSlide = deck.match(/function AMPowerAndBandwidth\(\) \{[\s\S]*?\n\}/)?.[0] ?? "";
check(amPowerSlide.includes(String.raw`P_c\\frac{m_a^2}{2}`) && amPowerSlide.includes(String.raw`1+\\frac{m_a^2}{2}`) && lesson5Style.includes(".spectrumInsights h3{display:flex;min-height:46px;align-items:flex-start}"), "AM power equations must use stacked numerator/denominator fractions and aligned card headings.");
check(lesson5Style.includes(".qDefinitionCards h3{display:flex;min-height:48px;align-items:flex-start}") && lesson5Style.includes(".qDefinitionCards article{justify-content:flex-start}"), "The bandwidth and Q definition card headings must share the same fixed top position.");
check(exportedHtml.includes('class="mfrac"') && exportedHtml.includes('class="katex-mathml"'), "Exported formulas must render actual stacked fractions and retain MathML in the accessible hidden layer.");
check(deck.includes('<div className={styles.mixerInputs}><p><b><bdi dir="ltr">RF</bdi></b><span dir="ltr">') && deck.includes('<p><b><bdi dir="ltr">LO</bdi></b><span dir="ltr">') && lesson5Style.includes(".mixerOutput .mixerInputs p{display:grid;grid-template-columns:120px 1fr;") && lesson5Style.includes("font-weight:700;direction:ltr}"), "Mixer inputs must be separated into rows with parameter labels on the visual left of each value.");
check(deck.includes("const extensionSlideCatalog = JSON.stringify(data.map") && (deck.match(/data-slides=\{extensionSlideCatalog\}/g) ?? []).length >= 3, "Lesson 5 must expose its full slide catalog to the lecturer Chrome extension in preview, player, and presentation mode.");
check(deck.includes("syllo:lesson-player-open") && deck.includes("syllo:lesson-player-exit") && deck.includes("syllo:lesson-feedback-update"), "Lesson 5 must emit the lifecycle and feedback events used by the lecturer and student panels.");
check(studentWorkspace.includes('selectedLesson?.lessonId === "lesson-04" || selectedLesson?.lessonId === "lesson-05"') && studentWorkspace.includes("lesson05Slides[slideNumber - 1]?.title"), "The student workspace feedback tab must display and link to lesson 5 feedback by slide.");
check(feedbackApi.includes("lesson-(04|05)"), "The student slide-feedback API must support deleting lesson 5 feedback as well as lesson 4.");
check(extensionManifest.content_scripts[0].matches.some((url) => url.includes("/lecturer/lessons/*")), "The lecturer extension must match lecturer lesson routes.");
check(deck.includes("function bidiQuantities") && deck.includes("{bidiQuantities(slide.takeaway)}") && superheterodyneSlide.includes("<bdi dir=\"ltr\">455 kHz</bdi>"), "Visible values with units must stay in value-then-unit order in RTL slides and diagrams.");
check(exportedHtml.includes('class="cover"') && exportedHtml.includes('architectureSingle') && exportedHtml.includes('<bdi dir="ltr">455 kHz</bdi>'), "The standalone lesson HTML must retain its slide-specific CSS classes and isolated value-unit direction.");
check(exportedHtml.includes('class="responseGraph"') && exportedHtml.includes('id="trf-response-title"') && exportedHtml.includes("Q גבוה · פס צר") && exportedHtml.includes("Q נמוך · פס רחב"), "The standalone lesson HTML must include the resonance response graph and both Q comparison labels.");
const exportedSpectrumSlide = exportedHtml.match(/<section class="slide-page[^>]*id="lesson-05-slide-04"[\s\S]*?<\/section>/)?.[0] ?? "";
const exportedAmPowerSlide = exportedHtml.match(/<section class="slide-page[^>]*id="lesson-05-slide-05"[\s\S]*?<\/section>/)?.[0] ?? "";
const exportedQGraphSlide = exportedHtml.match(/<section class="slide-page[^>]*id="lesson-05-slide-09"[\s\S]*?<\/section>/)?.[0] ?? "";
check(exportedSpectrumSlide.includes('class="spectrum"') && !exportedSpectrumSlide.includes('class="spectrumInsights"'), "The AM spectrum must have its own slide so the graph labels remain large and unobstructed.");
check(exportedAmPowerSlide.includes('class="spectrumInsights"') && exportedAmPowerSlide.includes("P<sub>SB</sub>") && exportedAmPowerSlide.includes("BW<sub>AM</sub>"), "Bandwidth and AM power must be explained on a separate readable slide after the spectrum graph.");
check(exportedQGraphSlide.includes('class="responseGraph"') && exportedQGraphSlide.includes("Q גבוה · פס צר") && exportedQGraphSlide.includes("Q נמוך · פס רחב"), "The exported Q response graph must appear on a separate slide at an enlarged, readable scale.");
check(lesson5Style.includes(".amReviewCards p,.spectrumInsights p{margin:0;color:#344c62;font-size:26px;") && lesson5Style.includes(".spectrumInsights article{min-height:460px;gap:20px;"), "AM recap labels and the separate bandwidth/power cards must be large enough to read on the projector.");
check(deck.includes('useLessonState(stateKey + ":index", 0)') && deck.includes('useLessonState<number[]>(stateKey + ":seen", [])') && deck.includes('useLessonState(stateKey + ":outline", true)') && deck.includes('useLessonState(stateKey + ":context", false)'), "Lesson 5 must persist its slide position, viewed-slide statistics, outline visibility, and context visibility like lesson 4.");
check(deck.includes("{seen.length}/{data.length} שקפים נצפו") && deck.includes("chapterSeen / chapterSlides.length") && deck.includes("chapterFeedback > 0") && deck.includes("feedbackMarker"), "Lesson 5 must show overall and chapter viewing progress plus per-chapter/per-slide feedback markers.");
check(deck.includes("title={label}") && deck.includes("משוב „") && deck.includes("insetInlineStart") && deck.includes("<em key={slideIndex}"), "The horizontal chapter bar must show feedback markers at the correct per-slide position with category/slide tooltips.");
check(deck.includes("playerStyles.feedbackTag") && deck.includes("title={currentFeedback ?") && deck.includes("עריכת משוב: ${selectedFeedbackType?.label}"), "A saved student-feedback category must be identified next to the FAB and in its accessible/hover label.");
check(playerStyle.includes('[data-lesson-id="lesson-05"] .feedback { position: fixed; z-index: 100; inset-inline-end: 24px; inset-inline-start: auto;') && playerStyle.includes('[data-lesson-id="lesson-05"] .feedbackPopover { inset-inline-end: 0; inset-inline-start: auto;'), "Lesson 5 feedback FAB and popover must stay at the physical left in RTL, clear of the outline panel.");
check(exportedHtml.includes('id="count" dir="ltr"'), "The exported RTL viewer must isolate the slide counter as LTR so its slide index is not reversed.");
check(exportedHtml.includes(".katex-mathml{border:0") && exportedHtml.includes("clip-path:inset(50%)"), "Standalone math formulas must visually hide the accessible MathML tree to prevent duplicate formulas.");
check(lesson5Style.includes(".bridge .flow b{box-sizing:border-box;display:flex;min-width:0;min-height:148px;flex:1 1 0;") && lesson5Style.includes(".parameterList p{display:grid;grid-template-columns"), "Equivalent flow nodes must use uniform frame dimensions, and calculation parameters must use a consistent line layout.");
check(deck.includes("aria-expanded={Boolean(openChapters[chapter])}") && deck.includes("setOpenChapters") && deck.includes("onClick={() => go(slideIndex)}"), "Lesson 5 outline controls must expand/collapse chapters and navigate to slides.");
check(deck.includes("title={item.title}") && deck.includes("title={chapter}"), "Truncated table-of-contents chapter and slide names must remain discoverable by tooltip.");
check(deck.includes("currentFeedback && !feedbackEditing") && deck.includes('window.localStorage.setItem("syllo:student:lesson:lesson-05:feedback"') && deck.includes('method: "POST"') && deck.includes('method: "DELETE"'), "Lesson 5 feedback must restore saved submissions, show their status, and support create/update/delete operations.");
check(["#D9731F", "#137A86", "#3B5BA9", "#C0392B"].every((color) => deck.includes(color) && lesson4Deck.includes(color)), "Lesson 5 feedback categories must reuse the four lesson 4 colors.");
check(deck.includes('event.key === "Escape"') && deck.includes("exitPresentation()") && deck.includes("requestFullscreen()"), "Lesson 5 presentation controls must enter fullscreen and let Escape exit it.");

const lesson5Concepts = concepts.filter((concept) => concept.lesson === "שיעור 5");
check(lesson5Concepts.length >= 6, `Expected at least 6 lesson 5 glossary concepts; found ${lesson5Concepts.length}.`);
for (const concept of lesson5Concepts) {
  check(Boolean(concept.title && concept.summary && concept.details), `Concept ${concept.id} needs a title, summary, and explanation.`);
  for (const relatedId of concept.connections ?? []) {
    check(concepts.some((candidate) => candidate.id === relatedId), `Concept ${concept.id} links to missing concept ${relatedId}.`);
  }
}

if (errors.length) {
  console.error("Lesson content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Lesson content validation passed: ${slides.length} slide records / ${plannedMinutes} planned minutes, ${lesson5Concepts.length} lesson 5 glossary entries, and checked learning sequence, bridge, AM spectrum, TRF resonance/Q response graph, notation, unit direction, feedback panels, persistence, progress statistics, controls, lecturer extension catalog, and flow direction.`);
}
