"use client";

import React, { useState } from "react";
import katex from "katex";
import { lesson06Chapters, lesson06Slides } from "./lesson-06-data";

const L6_CHAPTERS = lesson06Chapters;
const L6_SLIDES = lesson06Slides;
const L6_LINKS: Record<number, { c?: string[]; f?: string[] }> = {};
function Tex({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, trust: false, output: "htmlAndMathml" });
  return <span dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
}
const mathRows: Record<string, string> = {
  "f(t)=f꜀+Kf·x(t) [Hz]": "f(t)=f_c+K_f\\,x(t)\\quad[\\mathrm{Hz}]",
  "x(t)=Aₘ cos(ωₘt)": "x(t)=A_m\\cos(\\omega_m t)",
  "Δf=Kf·Aₘ [Hz]": "\\Delta f=K_f A_m\\quad[\\mathrm{Hz}]",
  "fmax=f꜀+Δf [Hz]": "f_{\\max}=f_c+\\Delta f\\quad[\\mathrm{Hz}]",
  "fmin=f꜀−Δf [Hz]": "f_{\\min}=f_c-\\Delta f\\quad[\\mathrm{Hz}]",
  "β=Δf/fₘ": "\\beta=\\frac{\\Delta f}{f_m}",
  "xFM(t)=A꜀ cos[ω꜀t+β sin(ωₘt)]": "x_{\\mathrm{FM}}(t)=A_c\\cos\\left(\\omega_c t+\\beta\\sin(\\omega_m t)\\right)",
  "AM · mₐ=Aₘ/A꜀": "\\mathrm{AM}:\\quad m_a=\\frac{A_m}{A_c}",
  "FM · β=Δf/fₘ": "\\mathrm{FM}:\\quad\\beta=\\frac{\\Delta f}{f_m}",
  "BW≈2(Δf+fₘ)=2(β+1)fₘ.": "BW\\approx2(\\Delta f+f_m)=2(\\beta+1)f_m",
  "BW≈2(Δf+fₘ)": "BW\\approx2(\\Delta f+f_m)",
  "PFM=Pc=A꜀²/(2R)": "P_{\\mathrm{FM}}=P_c=\\frac{A_c^2}{2R}",
  "fout=f₀+Kf·vin": "f_{\\mathrm{out}}=f_0+K_f v_{\\mathrm{in}}",
  "Kf=Δf/Δv [Hz/V]": "K_f=\\frac{\\Delta f}{\\Delta v}\\quad[\\mathrm{Hz/V}]",
};

function ContentCard({ row, index, slideNumber }: { row: string; index: number; slideNumber: number }) {
  const formula = mathRows[row];
  if (formula) return <div className={`sl-card ${index === 0 ? "hl" : ""}`} key={`${slideNumber}-${index}`}><Tex tex={formula} display /></div>;
  return <div className={`sl-card ${index === 0 ? "hl" : ""}`} key={`${slideNumber}-${index}`}><p className={/([=≈·]|\[Hz\]|\[V\])/.test(row) ? "big-sym" : "lead"} dir="auto">{row}</p></div>;
}

function Frame({ s, children }: { s: (typeof L6_SLIDES)[number]; children: React.ReactNode }) {
  const chapter = L6_CHAPTERS.find((item) => item.id === s.ch)!;
  return <div className="sl">
    <header className="sl-h"><div className="sl-eb">{s.eb}</div><h2>{s.h}</h2></header>
    <div className="sl-body">{children}</div>
    {s.tk && <div className="sl-tk"><span>העיקר</span>{s.tk}</div>}
    <footer className="sl-f"><span>{chapter.id ? `${String(chapter.id).padStart(2, "0")} · ` : ""}{chapter.title}</span><span dir="ltr">{String(s.n).padStart(2, "0")}</span></footer>
  </div>;
}

function SignalPlot({ beta = 1 }: { beta?: number }) {
  const width = 760, height = 230, center = height / 2;
  const info = Array.from({ length: 500 }, (_, i) => {
    const x = (i / 499) * width;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${(center - 28 * Math.cos((i / 499) * Math.PI * 2)).toFixed(1)}`;
  }).join(" ");
  const carrier = Array.from({ length: 1600 }, (_, i) => {
    const x = (i / 1599) * width, t = i / 1599 * Math.PI * 2;
    const phase = 15 * t + beta * Math.sin(t);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${(center - 74 * Math.cos(phase)).toFixed(1)}`;
  }).join(" ");
  return <svg viewBox={`0 0 ${width} ${height}`} className="plot" role="img" aria-label="גרף איכותי: אות מידע איטי וגל FM שתדירותו משתנה בעוד תנופתו קבועה" style={{ direction: "ltr" }}>
    <line x1="0" x2={width} y1={center} y2={center} stroke="#8a9aab" />
    <line x1="1" x2="1" y1="18" y2={height - 18} stroke="#8a9aab" />
    <path d={info} fill="none" stroke="#167a62" strokeWidth="3" />
    <path d={carrier} fill="none" stroke="#208eaa" strokeWidth="2" />
    <text x="8" y="18" fill="#167a62" fontSize="16">מידע · ירוק</text>
    <text x={width - 8} y="18" textAnchor="end" fill="#208eaa" fontSize="16">FM · כחול</text>
    <text x={width - 8} y={height - 4} textAnchor="end" fill="#52616f" fontSize="14">זמן t [s] →</text>
    <text x="8" y={height - 4} fill="#52616f" fontSize="14">מתח v(t) [V]</text>
  </svg>;
}

function VCOPlot() {
  return <svg viewBox="0 0 620 250" className="plot" role="img" aria-label="אופיין איכותי של VCO: התדר עולה ליניארית עם מתח הכניסה בתחום העבודה" style={{ direction: "ltr" }}>
    <line x1="70" y1="205" x2="585" y2="205" stroke="#64788a" strokeWidth="2" />
    <line x1="70" y1="205" x2="70" y2="24" stroke="#64788a" strokeWidth="2" />
    <path d="M90 184 L555 48" fill="none" stroke="#168f72" strokeWidth="5" />
    <text x="580" y="230" textAnchor="end" fontSize="16" fill="#334">מתח כניסה v [V] →</text>
    <text x="10" y="25" fontSize="16" fill="#334">fout [Hz]</text>
    <text x="326" y="94" fontSize="16" fill="#168f72">שיפוע Kf · תחום עבודה ליניארי</text>
    <text x="70" y="224" fontSize="13" fill="#667">איכותי</text>
  </svg>;
}

function InteractiveLab({ mode }: { mode: "fm" | "vco" | "multiplier" }) {
  const [level, setLevel] = useState(4);
  const [carrier, setCarrier] = useState(8);
  const [carrierHz, setCarrierHz] = useState(100);
  const [messageHz, setMessageHz] = useState(5);
  const [sensitivity, setSensitivity] = useState(5);
  const [factor, setFactor] = useState(4);
  const [phase, setPhase] = useState(35);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const width = 720, height = 180, mid = height / 2;
  const waveform = Array.from({ length: 501 }, (_, i) => {
    const x = i / 500, t = x * Math.PI * 2;
    const beta = sensitivity * level / messageHz;
    const y = mode === "fm" ? Math.cos((10 + carrierHz / 10) * t + beta * Math.sin(t)) : mode === "multiplier" ? Math.cos((8 + factor * 2) * t + 1.2 * Math.sin(t)) : 0;
    return `${i ? "L" : "M"}${(x * width).toFixed(1)} ${(mid - 64 * y).toFixed(1)}`;
  }).join(" ");
  const curve = Array.from({ length: 121 }, (_, i) => {
    const x = i / 120, t = x * Math.PI * 2;
    const v = mode === "fm" ? mid - Math.sin(t) * (level / 100) * 55 : mid - (mode === "vco" ? (x - .5) * 105 : Math.cos(t) * 40);
    return `${i ? "L" : "M"}${(x * width).toFixed(1)} ${v.toFixed(1)}`;
  }).join(" ");
  const label = mode === "fm" ? "סימולטור אות FM" : mode === "vco" ? "אופיין VCO" : "סימולטור מכפיל תדר";
  const df = sensitivity * level;
  const beta = df / messageHz;
  const bw = 2 * (df + messageHz);
  const power = carrier * carrier / (2 * 50);
  return <section className="sl-card" aria-label={`מעבדת המחשה: ${label}`}>
    <p className="lead"><b>מעבדת המחשה · {label}</b></p>
    <p className="lead">{mode === "fm" ? "כוונו את אות המידע ואת הנושא. תנופת גל FM נשארת קבועה; תדרו הרגעי משתנה." : mode === "vco" ? "גררו את מתח הכניסה וראו את תדר היציאה משתנה לפי שיפוע Kf." : "שנו את n. קצב המידע נשאר קבוע, בעוד תדר הנושא וסטייתו גדלים."}</p>
    {(mode === "fm" || mode === "multiplier") && <button type="button" className="reveal-btn" aria-expanded={advancedOpen} onClick={() => setAdvancedOpen((open) => !open)}>{advancedOpen ? "סגירת הבקרים והחישוב" : "פתיחת בקרים וחישוב"}</button>}
    {mode === "fm" && advancedOpen && <div className="lab-controls">
      <label className="lead">A꜀: {carrier} V <input type="range" min="1" max="20" value={carrier} onChange={(e) => setCarrier(Number(e.target.value))} /></label>
      <label className="lead">f꜀: {carrierHz} MHz <input type="range" min="88" max="108" value={carrierHz} onChange={(e) => setCarrierHz(Number(e.target.value))} /></label>
      <label className="lead">Aₘ: {level} V <input type="range" min="1" max="10" value={level} onChange={(e) => setLevel(Number(e.target.value))} /></label>
      <label className="lead">fₘ: {messageHz} kHz <input type="range" min="1" max="15" value={messageHz} onChange={(e) => setMessageHz(Number(e.target.value))} /></label>
      <label className="lead">Kf: {sensitivity} kHz/V <input type="range" min="1" max="10" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} /></label>
    </div>}
    {mode === "vco" && <label className="lead">מתח כניסה: {(phase / 10).toFixed(1)} V <input type="range" min="0" max="100" value={phase} onChange={(e) => setPhase(Number(e.target.value))} /></label>}
    {mode === "multiplier" && advancedOpen && <div className="lab-controls">
      <label className="lead">f₀: {carrierHz} MHz <input type="range" min="1" max="20" value={carrierHz} onChange={(e) => setCarrierHz(Number(e.target.value))} /></label>
      <label className="lead">Kf: {sensitivity} kHz/V <input type="range" min="1" max="10" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} /></label>
      <label className="lead">Aₘ: {level} V <input type="range" min="1" max="10" value={level} onChange={(e) => setLevel(Number(e.target.value))} /></label>
      <label className="lead">fₘ: {messageHz} kHz <input type="range" min="1" max="20" value={messageHz} onChange={(e) => setMessageHz(Number(e.target.value))} /></label>
      <label className="lead">מכפיל n: {factor} <input type="range" min="1" max="20" value={factor} onChange={(e) => setFactor(Number(e.target.value))} /></label>
    </div>}
    <svg viewBox={`0 0 ${width} ${height}`} className="plot" role="img" aria-label={`${label}: גרף מתעדכן לפי המחוון`} style={{ direction: "ltr", maxHeight: 150 }}>
      <line x1="0" x2={width} y1={mid} y2={mid} stroke="#94a3b8"/><path d={waveform} fill="none" stroke="#1583a5" strokeWidth="2.5"/><path d={curve} fill="none" stroke="#13a06f" strokeWidth="3"/>
      <text x="8" y="16" fill="#13a06f" fontSize="14">{mode === "fm" ? "מידע / f(t)" : "השוואה / אופיין"}</text><text x={width-8} y="16" textAnchor="end" fill="#1583a5" fontSize="14">{mode === "fm" ? "אות FM" : "אות מוצא"}</text>
    </svg>
    {mode === "fm" && advancedOpen && <div className="lab-results" aria-live="polite"><span>Δf = {df} kHz</span><span>β = {beta.toFixed(2)}</span><span>BW ≈ {bw} kHz</span><span>P = {power.toFixed(2)} W ‏(R=50 Ω)</span></div>}
    {mode === "vco" && <p className="lead" aria-live="polite">ככל ש־vin גדל, fout=f₀+Kf·vin גדל בתחום הליניארי. נקודת הכוונון: {(phase / 10).toFixed(1)} V.</p>}
    {mode === "multiplier" && <><p className="lead" aria-live="polite">fₘ אינו משתנה במכפיל; f꜀, Δf ו־β מוכפלים פי {factor}.</p>{advancedOpen && <div className="lab-results"><span>f꜀: {carrierHz} → {carrierHz * factor} MHz</span><span>Δf: {df} → {df * factor} kHz</span><span>β: {beta.toFixed(2)} → {(beta * factor).toFixed(2)}</span><span>fₘ: {messageHz} → {messageHz} kHz</span></div>}</>}
  </section>;
}

function ExamDrill() {
  const makeQuestion = () => {
    const fc = 88 + Math.floor(Math.random() * 21), fm = 5 + Math.floor(Math.random() * 16);
    const beta = 1 + Math.floor(Math.random() * 7), ac = 4 + Math.floor(Math.random() * 13);
    return { ac, fc, beta, fm, df: beta * fm, bw: 2 * (beta * fm + fm) };
  };
  const [question, setQuestion] = useState(makeQuestion);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const keys = [["ac", "A꜀ (V)"], ["fc", "f꜀ (MHz)"], ["beta", "β"], ["fm", "fₘ (kHz)"], ["df", "Δf (kHz)"], ["bw", "BW (kHz)"]] as const;
  const next = () => { setQuestion(makeQuestion()); setAnswers({}); setChecked(false); };
  return <section className="sl-card" aria-label="מחולל שאלות חילוץ למבחן">
    <p className="lead"><b>תרגול עצמאי · חילוץ ממשוואת זמן</b></p>
    <p className="lead" dir="ltr">xFM(t) = {question.ac} cos[2π·{question.fc}·10⁶t + {question.beta} sin(2π·{question.fm}·10³t)] V</p>
    <div className="drill-grid">{keys.map(([key, label]) => <label className="lead" key={key}>{label}<input aria-label={label} inputMode="decimal" type="number" value={answers[key] ?? ""} onChange={(event) => setAnswers((old) => ({ ...old, [key]: event.target.value }))} /></label>)}</div>
    <div className="drill-actions"><button type="button" className="reveal-btn" onClick={() => setChecked(true)}>בדיקת תשובה</button><button type="button" className="reveal-btn" onClick={next}>שאלה חדשה</button></div>
    {checked && <div className="drill-results" aria-live="polite">{keys.map(([key, label]) => { const value = Number(answers[key]); const expected = question[key]; const correct = answers[key] !== undefined && answers[key] !== "" && Math.abs(value - expected) <= Math.max(.02, Math.abs(expected) * .01); return <span key={key}>{correct ? "✓" : "✗"} {label}: {correct ? "נכון" : expected}</span>; })}<p>פתרון: β נקרא מהמקדם שבמופע; fₘ נקרא מהגורם של 10³. לאחר מכן Δf=βfₘ ו־BW≈2(Δf+fₘ).</p></div>}
  </section>;
}

function Reveal({ children, label = "חשיפת הפתרון" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return <div className="reveal">{open ? <div className="reveal-in">{children}</div> : <button className="reveal-btn" type="button" onClick={() => setOpen(true)}>{label}</button>}</div>;
}

function Slide({ s }: { s: (typeof L6_SLIDES)[number] }) {
  if (s.sec) return <div className="sl cover"><div className="cv-text"><div className="sl-eb">מערכות תקשורת · הפסקה</div><h1>הפסקה</h1><div className="cv-en" dir="ltr">10 MINUTES</div><div className="cv-meta"><span>אחריה: VCO, מכפיל תדר ומשדר FM</span></div></div><footer className="sl-f"><span>הפסקה</span><span dir="ltr">{String(s.n).padStart(2, "0")}</span></footer></div>;
  if (s.n === 1) return <div className="sl cover"><div className="cv-text"><div className="sl-eb">מערכות תקשורת · שיעור 06</div><h1>אפנון תדר<br/><span dir="ltr">FM</span> ומשדר</h1><div className="cv-en" dir="ltr">FREQUENCY MODULATION</div><div className="cv-meta"><b>קורס 11.9004</b><span>שיעור בן 135 דקות</span></div></div><div className="cv-fig"><SignalPlot beta={1.5}/></div><footer className="sl-f"><span dir="ltr">11.9004</span><span dir="ltr">01</span></footer></div>;
  const rows = s.body.split("|");
  const keyRows = s.reveal ? rows.slice(0, -1) : rows;
  return <Frame s={s}><div className="stack">
    {s.n === 10 && <InteractiveLab mode="fm" />}
    {keyRows.map((row, index) => <ContentCard row={row} index={index} slideNumber={s.n} key={`${s.n}-${index}`} />)}
    {s.reveal && <Reveal label="חשיפת הפתרון"><div className="sl-card hl"><p className="lead">{rows[rows.length - 1]}</p></div></Reveal>}
    {s.n === 17 && <><VCOPlot /><InteractiveLab mode="vco" /></>}
    {s.n === 19 && <InteractiveLab mode="multiplier" />}
    {s.n === 15 && <ExamDrill />}
    {s.n === 18 && <div className="flow"><div className="sl-card">מיקרופון<br/><b dir="ltr">m(t)</b></div><span>→</span><div className="sl-card">מגבר שמע</div><span>→</span><div className="sl-card">VCO</div><span>→</span><div className="sl-card">מכפיל ×n</div><span>→</span><div className="sl-card">PA → אנטנה</div></div>}
  </div></Frame>;
}

export { Slide, Tex, L6_LINKS, L6_CHAPTERS, L6_SLIDES };
