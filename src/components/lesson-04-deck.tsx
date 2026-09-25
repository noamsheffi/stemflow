// @ts-nocheck
"use client";
import React from "react";
import katex from "katex";
import { lesson04Chapters as L4_CHAPTERS, lesson04Slides as L4_SLIDES } from "./lesson-04-data";

function Tex({ tex, display = false, className = "" }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, trust: false, output: "htmlAndMathml" });
  return <span dir="ltr" className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
// Lesson 04 – signal plots & interactive widgets (SVG, Syllo palette)
const { useState: sUseState } = React;
const PLOT = { carrier: '#1C97A6', env: '#13233A', side: '#6247c9', grid: '#e3e7ee', axis: '#8a9aab' };

const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

// Generic AM time plot. m = modulation index; cycles = carrier cycles per envelope period
function AMPlot({ w = 560, h = 300, m = 0.65, periods = 2, cycles = 12, showEnv = true, grid = true, amp = 0.42, stroke = 2.2 }) {
  const N = 1400, mid = h / 2, A = h * amp / (1 + Math.min(m, 1.4));
  const s = [], eT = [], eB = [];
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1) * w, t = i / (N - 1) * periods * 2 * Math.PI;
    const env = 1 + m * Math.cos(t);
    s.push([x, mid - A * env * Math.cos(cycles * t)]);
    if (i % 8 === 0) { eT.push([x, mid - A * Math.abs(env)]); eB.push([x, mid + A * Math.abs(env)]); }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="plot" dir="ltr">
      {grid && [1, 2, 3, 4, 5].map(i => <line key={i} x1={i * w / 6} x2={i * w / 6} y1="0" y2={h} stroke={PLOT.grid} />)}
      <line x1="0" x2={w} y1={mid} y2={mid} stroke={PLOT.axis} strokeWidth="1.2" />
      <path d={pathOf(s)} fill="none" stroke={PLOT.carrier} strokeWidth={stroke} />
      {showEnv && <><path d={pathOf(eT)} fill="none" stroke={PLOT.env} strokeWidth="1.5" strokeDasharray="6 5" />
        <path d={pathOf(eB)} fill="none" stroke={PLOT.env} strokeWidth="1.5" strokeDasharray="6 5" /></>}
    </svg>
  );
}

function SinePlot({ w = 360, h = 90, cycles = 2, color = PLOT.carrier, amp = 0.38 }) {
  const pts = Array.from({ length: 400 }, (_, i) => [i / 399 * w, h / 2 - h * amp * Math.cos(i / 399 * cycles * 2 * Math.PI)]);
  return <svg viewBox={`0 0 ${w} ${h}`} className="plot" dir="ltr"><line x1="0" x2={w} y1={h / 2} y2={h / 2} stroke={PLOT.grid} /><path d={pathOf(pts)} fill="none" stroke={color} strokeWidth="2.2" /></svg>;
}

// Spectrum: carrier + two sidebands
function SpectrumPlot({ w = 560, h = 260, ac = 1, side = 0.35, labels = true, fc = 'f_c', bw = false, fcN, fmN }) {
  const base = h - 40, cx = w / 2, dx = w * 0.22, H = base - 30;
  const stick = (x, a, c, lab, sub) => (
    <g key={lab}>
      <line x1={x} x2={x} y1={base} y2={base - H * a} stroke={c} strokeWidth="5" strokeLinecap="round" />
      <circle cx={x} cy={base - H * a} r="6" fill={c} />
      {labels && <text x={x} y={base + 24} textAnchor="middle" className="pl-lab">{sub}</text>}
    </g>
  );
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="plot" dir="ltr">
      <line x1="20" x2={w - 20} y1={base} y2={base} stroke={PLOT.axis} strokeWidth="1.4" />
      <text x={w - 18} y={base - 8} textAnchor="end" className="pl-ax">f</text>
      {stick(cx - dx, side, PLOT.side, 'l', fcN ? `${fcN - fmN} kHz` : 'fc − fm')}
      {stick(cx, ac, PLOT.carrier, 'c', fcN ? `${fcN} kHz` : 'fc')}
      {stick(cx + dx, side, PLOT.side, 'u', fcN ? `${fcN + fmN} kHz` : 'fc + fm')}
      {bw && <g><line x1={cx - dx} x2={cx + dx} y1={base - H * side - 26} y2={base - H * side - 26} stroke={PLOT.env} strokeWidth="1.4" markerStart="url(#ar)" markerEnd="url(#ar)" />
        <text x={cx - dx / 2} y={base - H * side - 34} textAnchor="middle" className="pl-lab b">BW = 2fm</text></g>}
      <defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9z" fill={PLOT.env} /></marker></defs>
    </svg>
  );
}

// —— Slide 05: oscillator / Barkhausen ——
function OscWidget() {
  const [g, setG] = sUseState(1);
  const [ph, setPh] = sUseState(true);
  const w = 620, h = 300, mid = h / 2;
  const eff = ph ? g : 0.4;
  const pts = Array.from({ length: 900 }, (_, i) => {
    const t = i / 899, grow = Math.pow(eff, t * 8), a = Math.min(1, 0.12 * grow / 0.12 * (eff >= 1 ? 0.25 : 1));
    const amp = eff === 1 ? 0.8 : eff > 1 ? Math.min(0.9, 0.12 * Math.pow(eff, t * 10)) : 0.8 * Math.pow(eff, t * 10);
    return [t * w, mid - (h * 0.45) * amp * Math.sin(t * 2 * Math.PI * 14)];
  });
  const st = !ph ? ['bad', 'אין משוב חיובי — אין תנודה'] : g < 0.98 ? ['bad', 'התנודה דועכת'] : g > 1.02 ? ['warn', 'התנודה גדלה עד רוויה'] : ['ok', 'תנודה יציבה'];
  return (
    <div className="osc">
      <div className="osc-ctl">
        <div className="ctl-row"><span>הגבר החוג <b dir="ltr">|Aβ|</b></span><output dir="ltr">{g.toFixed(2)}</output></div>
        <input type="range" min="0.6" max="1.4" step="0.05" value={g} onChange={e => setG(+e.target.value)} />
        <button className={'toggle' + (ph ? ' on' : '')} onClick={() => setPh(!ph)}>המופע בחוג: {ph ? '0°' : '180°'}</button>
        <div className={'status ' + st[0]}>{st[1]}</div>
      </div>
      <div className="plot-card">
        <svg viewBox={`0 0 ${w} ${h}`} className="plot" dir="ltr">
          <line x1="0" x2={w} y1={mid} y2={mid} stroke={PLOT.axis} />
          <path d={pathOf(pts)} fill="none" stroke={PLOT.carrier} strokeWidth="2.2" />
        </svg>
      </div>
    </div>
  );
}

// —— Slide 22: AM simulator ——
function AMSim() {
  const [p, setP] = sUseState({ ac: 60, am: 36, fc: 500, fm: 5 });
  const set = k => e => setP({ ...p, [k]: +e.target.value });
  const ma = p.am / p.ac;
  const st = ma < 0.999 ? ['ok', 'אפנון תקין'] : ma <= 1.001 ? ['warn', 'אפנון מלא · 100%'] : ['bad', 'אפנון יתר · עיוות'];
  const sl = (k, label, unit, min, max, step) => (
    <label className="sim-sl" key={k}>
      <span className="ctl-row"><span dir="ltr">{label}</span><output dir="ltr">{p[k]} {unit}</output></span>
      <input type="range" min={min} max={max} step={step} value={p[k]} onChange={set(k)} />
    </label>
  );
  return (
    <div className="sim">
      <div className="sim-ctl">
        {sl('ac', 'Ac', 'V', 20, 100, 2)}
        {sl('am', 'Am', 'V', 0, 100, 2)}
        {sl('fc', 'fc', 'kHz', 200, 1000, 10)}
        {sl('fm', 'fm', 'kHz', 1, 10, 1)}
        <div className="sim-out">
          <div><small>ma</small><b dir="ltr">{ma.toFixed(2)}</b></div>
          <div><small>BW</small><b dir="ltr">{2 * p.fm} kHz</b></div>
          <div><small>LSB</small><b dir="ltr">{p.fc - p.fm}</b></div>
          <div><small>USB</small><b dir="ltr">{p.fc + p.fm}</b></div>
        </div>
        <div className={'status ' + st[0]}>{st[1]}</div>
      </div>
      <div className="sim-plots">
        <div className="plot-card"><span className="pc-lab">תחום הזמן</span><AMPlot w={1040} h={170} m={ma} cycles={Math.min(22, Math.max(8, Math.round(p.fc / p.fm / 8)))} amp={0.44 * (p.ac + p.am) / 160 + 0.08} /></div>
        <div className="plot-card"><span className="pc-lab">תחום התדר</span><SpectrumPlot w={1040} h={150} ac={p.ac / 100} side={p.am / 200} fcN={p.fc} fmN={p.fm} /></div>
      </div>
    </div>
  );
}


// Lesson 04 – slide content. Slide frame is 1600×900.
const { useState: slUseState } = React;

function Frame({ s, children, cls = '', noTk }) {
  const ch = L4_CHAPTERS.find(c => c.id === s.ch);
  return (
    <div className={'sl ' + cls}>
      <header className="sl-h">
        <div className="sl-eb">{s.eb}</div>
        <h2>{s.h}</h2>
      </header>
      <div className="sl-body">{children}</div>
      {s.tk && !noTk && <div className="sl-tk"><span>העיקר</span>{s.tk}</div>}
      <footer className="sl-f"><span>{ch.id > 0 && ch.id < 6 ? pad2(ch.id) + ' · ' : ''}{ch.title}</span><span dir="ltr">{pad2(s.n)}</span></footer>
    </div>
  );
}
const pad2 = n => String(n).padStart(2, '0');
const F = ({ t, big }) => <div className={'sl-fx' + (big ? ' big' : '')}><Tex tex={t} display /></div>;
const Card = ({ children, cls = '', lab }) => <div className={'sl-card ' + cls}>{lab && <div className="sl-lab">{lab}</div>}{children}</div>;

function ConceptTable({ rows, cols = ['סימון', 'מושג', 'משמעות'] }) {
  return (
    <table className="sl-table"><thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{rows.map(r => <tr key={r[0]}><td className="sym" dir="ltr">{r[0]}</td><td className="term">{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>
  );
}

function Flow({ items, dark }) {
  return (
    <div className={'sl-flow' + (dark ? ' dark' : '')}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sl-arr">←</span>}
          <div className="sl-node">{Array.isArray(it) ? <><b>{it[0]}</b><small dir="ltr">{it[1]}</small></> : it}</div>
        </React.Fragment>
      ))}
    </div>
  );
}

function Quiz() {
  const [pick, setPick] = slUseState(null);
  const opts = [['995 & 1005 kHz', true], ['5 & 10 kHz'], ['1 & 6 MHz'], ['500 & 1500 kHz']];
  return (
    <div className="quiz">
      <div className="quiz-opts">
        {opts.map(([o, ok], i) => (
          <button key={o} className={'q-opt' + (pick === i ? (ok ? ' ok' : ' bad') : '')} onClick={() => setPick(i)} dir="ltr">
            <span className="q-k">{'אבגד'[i]}</span>{o}
          </button>
        ))}
      </div>
      <div className={'quiz-fb' + (pick == null ? '' : opts[pick][1] ? ' ok' : ' bad')}>
        {pick == null ? 'בחרו תשובה והסבירו את המרת היחידות.' : opts[pick][1] ? 'נכון. 1000 − 5 = 995 ו־1000 + 5 = 1005 kHz.' : 'בדקו שוב: המירו תחילה MHz ל־kHz.'}
      </div>
    </div>
  );
}

function Reveal({ label = 'הצגת פתרון', children }) {
  const [o, setO] = slUseState(false);
  return <div className="reveal">{o ? <div className="reveal-in">{children}</div> : <button className="reveal-btn" onClick={() => setO(true)}>{label}</button>}</div>;
}

// ——— Individual slides ———
const SLIDES = {
  1: s => (
    <div className="sl cover">
      <div className="cv-text">
        <div className="sl-eb">מערכות תקשורת · שיעור 04</div>
        <h1>אפנון תנופה<br /><span dir="ltr">AM</span> ומשדר</h1>
        <div className="cv-en" dir="ltr">AMPLITUDE MODULATION</div>
        <div className="cv-meta"><b>מרצה: נועם שפי</b><span>כיתה י״ג · 135 דקות</span></div>
      </div>
      <div className="cv-fig"><AMPlot w={640} h={560} m={0.62} cycles={14} amp={0.44} /></div>
      <footer className="sl-f"><span dir="ltr">11.9004</span><span dir="ltr">01</span></footer>
    </div>
  ),
  2: s => <Frame s={s}><ConceptTable cols={['סימון', 'מושג', 'תפקיד במערכת']} rows={[['S', 'מקור מידע', 'יוצר את ההודעה שרוצים להעביר.'], ['Tx', 'משדר', 'מעבד את המידע ומכין אותו לתווך.'], ['Ch', 'ערוץ / תווך', 'הדרך שבה האות עובר.'], ['N', 'רעש', 'הפרעה שנוספת לאות בדרך.'], ['Rx', 'מקלט', 'קולט את האות ומשחזר את המידע.']]} /></Frame>,
  3: s => <Frame s={s}><ConceptTable rows={[['A', 'תנופה', 'הערך המרבי של האות.'], ['T', 'זמן מחזור', 'הזמן למחזור אחד · T = 1/f'], ['f', 'תדר', 'מספר המחזורים בשנייה.'], ['φ', 'מופע', 'נקודת ההתחלה בתוך המחזור.'], ['λ', 'אורך גל', 'המרחק של מחזור במרחב · λ = v/f'], ['BW', 'רוחב פס', 'תחום התדרים שהאות תופס.']]} /></Frame>,
  4: s => (
    <Frame s={s}>
      <div className="qmap">
        {L4_CHAPTERS.slice(1, 5).map((c, i) => (
          <div key={c.id} className="qm-item"><span className="qm-n" dir="ltr">{pad2(c.id)}</span><b>{c.title}</b><small>שקפים {c.start}–{L4_CHAPTERS[i + 2].start - 1}</small></div>
        ))}
      </div>
    </Frame>
  ),
  5: s => <Frame s={s}><div className="two-osc"><div><Card lab="תזכורת · חוק ברקהאוזן"><F t="|A\beta| = 1 \qquad \angle A\beta = 0^\circ" /><p>בהתנעה <span dir="ltr">|Aβ| &gt; 1</span>. במצב יציב ההגבר מתייצב על 1.</p></Card></div><OscWidget /></div></Frame>,
  6: s => <Frame s={s}><div className="two"><Card lab="גשר וין"><div className="big-sym" dir="ltr">R + C</div><p>מתאים בעיקר לתדרי שמע ולתדרים נמוכים.</p></Card><Card cls="hl" lab="קולפיץ / הרטלי"><div className="big-sym" dir="ltr">L + C</div><p>מתאימים לתדרי רדיו וליצירת גל נושא במשדר.</p></Card></div></Frame>,
  8: s => <Frame s={s}><div className="two"><Card lab="תדר"><div className="big-sym" dir="ltr">300 Hz – 3 kHz</div><p>כשאנחנו מדברים, האות הוא תנודות לחץ אוויר. סדר גודל: <span dir="ltr">fm ≈ 1 kHz</span>.</p><SinePlot cycles={3} /></Card><Card lab="תנופה"><div className="big-sym">חלשה</div><p>האות דועך מהר במרחב ואינו מגיע רחוק. כדי לקלוט אותו מרחוק צריך אנטנה.</p><SinePlot cycles={3} amp={0.12} color={PLOT.axis} /></Card></div></Frame>,
  9: s => <Frame s={s}><div className="two"><div className="stack"><p className="lead">אנטנה יעילה צריכה להיות באורך בסדר גודל של <span dir="ltr">λ/4</span> (מונופול) או <span dir="ltr">λ/2</span> (דיפול).</p><Card cls="ask" lab="שאלה לכיתה"><div className="big-q">מה אורך האנטנה ל־<span dir="ltr">1 kHz</span>?</div></Card></div><div className="stack"><Card lab="אורך הגל במרחב החופשי"><F t="\lambda = \frac{c}{f}" /></Card><Card lab="אורך מונופול מעשי"><F t="L \approx \frac{\lambda}{4}" /></Card></div></div></Frame>,
  10: s => <Frame s={s}><div className="two-a"><div className="stack"><Card lab="חישוב"><F t="f_m = 1\,\text{kHz} \;\Rightarrow\; \lambda = \frac{3\cdot10^8}{10^3} = 300\,\text{km}" /><F t="L_{mono} \approx \frac{\lambda}{4} = 75\,\text{km}" /></Card></div><Card cls="dark center"><div className="huge" dir="ltr">75 km</div><p>לא מעשי. לכן מעבירים את המידע לתדר גבוה <span dir="ltr">(MHz)</span> שבו אורך הגל קטן והאנטנה מעשית.</p></Card></div></Frame>,
  11: s => <Frame s={s}><div className="two"><Card lab="אות המידע"><div className="big-sym" dir="ltr">fm = 5 kHz</div><SinePlot cycles={2} w={460} h={140} color={PLOT.env} /></Card><Card lab="הגל הנושא"><div className="big-sym" dir="ltr">fc = 1 MHz</div><SinePlot cycles={24} w={460} h={140} /></Card></div></Frame>,
  12: s => <Frame s={s}><Flow items={[['אות מידע', 'm(t)'], ['אפנן AM', '×  c(t)'], ['אות מאופנן', 's(t)']]} /><div className="mini-plots"><SinePlot cycles={2} w={380} h={110} color={PLOT.env} /><span /><AMPlot w={380} h={110} m={0.6} periods={2} cycles={12} grid={false} stroke={1.6} /></div></Frame>,
  13: s => <Frame s={s}><div className="two"><Card lab="לפני האפנון"><SpectrumBands overlap /><p>אותות השמע תופסים אותו תחום ועלולים לחפוף.</p></Card><Card lab="אחרי האפנון"><SpectrumBands /><p>מסנן מעביר־פס בוחר ערוץ שלם, לא תדר יחיד.</p></Card></div></Frame>,
  14: s => <Frame s={s}><Flow items={[['מיקרופון', 'm(t)'], ['מסנן מעביר נמוכים', 'LPF'], ['אפנן תנופה', 'AM ← c(t)'], ['מגבר הספק', 'PA'], ['אנטנה', 'RF OUT']]} /></Frame>,
  16: s => <Frame s={s}><div className="rows3">{[['מידע', 'm(t) = A_m\\cos(\\omega_m t)', <SinePlot key="a" cycles={2} w={700} h={90} color={PLOT.env} />], ['נושא', 'c(t) = A_c\\cos(\\omega_c t)', <SinePlot key="b" cycles={24} w={700} h={90} />], ['אות AM', 's(t) = [A_c + m(t)]\\cos(\\omega_c t)', <AMPlot key="c" w={700} h={110} m={0.6} cycles={12} grid={false} stroke={1.6} />]].map(r => <div key={r[0]} className="r3"><b>{r[0]}</b><Tex tex={r[1]} /><div>{r[2]}</div></div>)}</div></Frame>,
  17: s => <Frame s={s}><div className="two-b"><div className="plot-card"><AMPlot w={760} h={380} m={0.6} cycles={12} /></div><div className="stack"><Card lab="משתנה"><div className="big-sym">גובה התנודות</div></Card><Card lab="קבוע"><div className="big-sym">המרחק בין המחזורים</div></Card></div></div></Frame>,
  18: s => <Frame s={s}><F big t="s(t) = \underbrace{A_c\left[1 + m_a\cos(\omega_m t)\right]}_{\text{envelope}}\;\underbrace{\cos(\omega_c t)}_{\text{carrier}}" /><div className="two"><Card lab="המעטפת"><p>הסוגריים קובעים את הגובה, והם משתנים לאט לפי המידע.</p></Card><Card lab="הנושא"><p>הקוסינוס האחרון קובע את הקצב המהיר, בתדר <span dir="ltr">fc</span>.</p></Card></div></Frame>,
  19: s => <Frame s={s}><div className="two-a"><F big t="m_a = \frac{A_m}{A_c}" /><div className="defs"><div><b dir="ltr">Am</b>תנופת המידע</div><div><b dir="ltr">Ac</b>תנופת הנושא</div><div><b dir="ltr">ma</b>יחס ללא יחידות</div></div></div></Frame>,
  20: s => <Frame s={s}><div className="two-a"><div className="stack"><F t="V_{max} = A_c + A_m \qquad V_{min} = A_c - A_m" /><F t="m_a = \frac{V_{max} - V_{min}}{V_{max} + V_{min}}" /></div><Card cls="ask" lab="דוגמה · 18V ו־2V"><Reveal><F t="m_a = \frac{16}{20} = 0.8 = 80\%" /></Reveal></Card></div></Frame>,
  21: s => <Frame s={s}><div className="three">{[['אפנון חסר', '0 < m_a < 1', 0.5, 'אינה נוגעת באפס'], ['אפנון מלא', 'm_a = 1', 1, 'נוגעת באפס'], ['אפנון יתר', 'm_a > 1', 1.4, 'חוצה אפס ומתעוותת']].map((r, i) => <Card key={r[0]} cls={i === 2 ? 'warn' : ''} lab={r[0]}><Tex tex={r[1]} /><AMPlot w={420} h={200} m={r[2]} cycles={10} grid={false} stroke={1.6} /><small>{r[3]}</small></Card>)}</div></Frame>,
  22: s => <Frame s={s} cls="sim-slide" noTk><AMSim /></Frame>,
  24: s => <Frame s={s}><div className="two-a"><div className="stack"><Card lab="שתי זהויות בסיסיות"><F t="\cos(\alpha\pm\beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta" /></Card><Card lab="חיבור אגף לאגף"><F t="\cos\alpha\cos\beta = \tfrac12\left[\cos(\alpha+\beta) + \cos(\alpha-\beta)\right]" /></Card></div><Card cls="dark"><p className="lead">באפנון AM מכפלת המידע בנושא יוצרת שני תדרים חדשים — פס צד עליון ותחתון — סביב תדר הנושא.</p></Card></div></Frame>,
  25: s => <Frame s={s}><div className="plot-card wide"><SpectrumPlot w={1100} h={300} side={0.4} /></div><div className="legend3"><span><i className="c" />Carrier · גל נושא</span><span><i className="s" />LSB · פס צד תחתון</span><span><i className="s" />USB · פס צד עליון</span></div></Frame>,
  26: s => <Frame s={s}><div className="two-b"><div className="plot-card"><SpectrumPlot w={700} h={360} side={0.45} bw /></div><div className="stack"><F t="f_{USB} = f_c + f_m" /><F t="f_{LSB} = f_c - f_m" /><F big t="BW_{AM} = 2f_m" /></div></div></Frame>,
  27: s => <Frame s={s}><Quiz /></Frame>,
  29: s => <Frame s={s}><div className="two-a"><F big t="P_c = \frac{A_c^2}{2R}" /><Card cls="warn" lab="שימו לב"><p><span dir="ltr">Ac</span> הוא מתח שיא. אם נתון <span dir="ltr">Vpp</span>, מחלקים ב־2.</p></Card></div></Frame>,
  30: s => <Frame s={s}><div className="two"><Card lab="כל פס צד"><F t="P_{side} = P_c\,\frac{m_a^2}{4}" /></Card><Card cls="hl" lab="שני פסי הצד"><F t="P_{SB} = P_c\,\frac{m_a^2}{2}" /></Card></div></Frame>,
  31: s => <Frame s={s}><F big t="P_{AM} = P_c\left(1 + \frac{m_a^2}{2}\right)" /><PowerBar ma={0.8} /></Frame>,
  32: s => <Frame s={s}><div className="two-a"><div className="stack"><F big t="\eta = \frac{m_a^2}{2 + m_a^2}" /><F t="m_a = 1 \Rightarrow \eta_{max} = 33.3\%" /></div><Card cls="dark center"><div className="huge">⅓</div><p>לכל היותר שליש מההספק נושא מידע.</p></Card></div></Frame>,
  33: s => <Frame s={s}><div className="two"><Card lab="המספר עולה"><F t="m_a = 1.2 \Rightarrow \eta \approx 41.8\%" /></Card><Card cls="warn" lab="האות נהרס"><AMPlot w={460} h={170} m={1.4} cycles={10} grid={false} stroke={1.6} /><p>המעטפת חוצה אפס, וגלאי מעטפת משחזר מידע מעוות.</p></Card></div></Frame>,
  35: s => <Frame s={s}><Card lab="נתון"><F big t="s(t) = 100\left[1 + 0.8\cos(10{,}000\pi t)\right]\cos(2{,}000{,}000\pi t)\;[V]" /></Card><Card lab="הצורה התקנית"><F t="s(t) = A_c\left[1 + m_a\cos(\omega_m t)\right]\cos(\omega_c t)" /></Card><p className="lead">עומס האנטנה: <span dir="ltr">R = 50 Ω</span></p></Frame>,
  36: s => <Frame s={s}><Steps items={[['A_c', '100\\,V'], ['m_a', '0.8'], ['A_m = m_a A_c', '80\\,V']]} /></Frame>,
  37: s => <Frame s={s}><Steps items={[['f_c = \\frac{\\omega_c}{2\\pi}', '1\\,MHz'], ['f_m = \\frac{\\omega_m}{2\\pi}', '5\\,kHz']]} /></Frame>,
  38: s => <Frame s={s}><Steps items={[['V_{max} / V_{min}', '180\\,V \\;/\\; 20\\,V'], ['f_{LSB},\\,f_{USB}', '995,\\;1005\\,kHz'], ['BW', '10\\,kHz']]} /></Frame>,
  39: s => <Frame s={s}><Steps items={[['P_c', '100\\,W'], ['P_{SB}', '32\\,W'], ['P_{AM}', '132\\,W'], ['\\eta', '24.24\\%']]} /></Frame>,
  40: s => <Frame s={s}><Flow dark items={['חילוץ נתונים', 'המרת תדרים', 'זמן ותדר', 'הספק ובדיקה']} /></Frame>,
  41: s => <Frame s={s}><div className="two-a"><Card lab="נתונים"><div className="givens" dir="ltr">{['fc = 2 MHz', 'Ac = 50 V', 'fm = 10 kHz', 'Am = 25 V', 'R = 50 Ω'].map(g => <span key={g}>{g}</span>)}</div><p className="lead">חשבו <span dir="ltr">ma, BW, Pc, PAM, η</span>.</p></Card><Card cls="ask" lab="עבודה בזוגות · 7 דקות"><Reveal><div className="givens" dir="ltr">{['ma = 0.5', 'BW = 20 kHz', 'Pc = 25 W', 'PAM = 28.125 W', 'η = 11.11%'].map(g => <span key={g}>{g}</span>)}</div></Reveal></Card></div></Frame>,
  42: s => <Frame s={s}><div className="traps">{[['V_{pp} \\neq A_c', 'A_c = V_{pp}/2'], ['\\text{same units}', '1\\,MHz = 1000\\,kHz'], ['P_{SB} \\neq P_{AM}', 'מידע אינו ההספק הכולל'], ['\\omega \\neq f', 'f = \\omega / 2\\pi']].map(t => <Card key={t[0]}><Tex tex={t[0]} /><small>{/[א-ת]/.test(t[1]) ? t[1] : <Tex tex={t[1]} />}</small></Card>)}</div></Frame>,
  43: s => <Frame s={s}><div className="exit">{['מה משתנה באפנון AM?', 'אם fm = 4 kHz, מה BW?', 'מדוע הנצילות מוגבלת?'].map((q, i) => <Card key={q} lab={'שאלה ' + (i + 1)}><div className="big-q">{q}</div></Card>)}</div><Reveal label="הצגת תשובות"><p className="lead">התנופה משתנה · רוחב הפס הוא <span dir="ltr">8 kHz</span> · הנושא צורך רוב ההספק אך אינו נושא מידע.</p></Reveal></Frame>,
  44: s => <Frame s={s}><Flow items={['שמע נמוך', 'נושא גבוה', 'מעטפת', 'פסי צד', 'הספק מידע']} /></Frame>,
};

function Steps({ items }) {
  return <div className="steps">{items.map((it, i) => <div key={i} className="stp"><span className="stp-n" dir="ltr">{i + 1}</span><Tex tex={it[0]} /><span className="stp-eq">=</span><b><Tex tex={it[1]} /></b></div>)}</div>;
}
function PowerBar({ ma }) {
  const pc = 1, sb = ma * ma / 2, tot = pc + sb;
  return (
    <div className="pbar">
      <div className="pb-track"><i className="pc" style={{ flex: pc }}><span>נושא · <span dir="ltr">Pc</span></span></i><i className="sb" style={{ flex: sb / 2 }} /><i className="sb" style={{ flex: sb / 2 }} /></div>
      <div className="pb-lab"><span>דוגמה: <span dir="ltr">ma = {ma}</span></span><span>פסי צד: <b dir="ltr">{(sb / tot * 100).toFixed(1)}%</b> מההספק הכולל</span></div>
    </div>
  );
}
function SpectrumBands({ overlap }) {
  const w = 560, h = 170, base = 130;
  const band = (x, c, lab, bw = 60) => <g key={lab}><path d={`M${x - bw} ${base} Q${x} ${base - 110} ${x + bw} ${base}`} fill={c} fillOpacity=".18" stroke={c} strokeWidth="2" /><text x={x} y={base + 26} textAnchor="middle" className="pl-lab">{lab}</text></g>;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="plot" dir="ltr">
      <line x1="10" x2={w - 10} y1={base} y2={base} stroke={PLOT.axis} />
      {overlap ? [band(110, PLOT.carrier, 'א׳'), band(125, PLOT.side, 'ב׳'), band(140, PLOT.env, 'ג׳')]
        : [band(150, PLOT.carrier, 'תחנה א׳', 44), band(290, PLOT.side, 'תחנה ב׳', 44), band(430, PLOT.env, 'תחנה ג׳', 44),
          <rect key="sel" x="236" y="10" width="108" height={base - 6} rx="6" fill="none" stroke={PLOT.side} strokeDasharray="5 4" strokeWidth="1.5" />]}
    </svg>
  );
}

function SectionSlide({ s }) {
  const idx = L4_CHAPTERS.findIndex(c => c.id === s.ch);
  return (
    <div className="sl section">
      <div className="sec-n" dir="ltr">{pad2(s.ch)}</div>
      <div className="sec-t">
        <h1>{s.h}</h1>
        <p>{s.body.replace(/^\d+/, '').replace(s.h, '').trim() || s.tk}</p>
      </div>
      <div className="sec-map">
        {L4_CHAPTERS.slice(1, 6).map(c => <span key={c.id} className={c.id === s.ch ? 'on' : c.id < s.ch ? 'past' : ''}><b dir="ltr">{pad2(c.id)}</b>{c.title}</span>)}
      </div>
      <footer className="sl-f"><span>{s.tk}</span><span dir="ltr">{pad2(s.n)}</span></footer>
    </div>
  );
}

function Slide({ s }) {
  if (s.sec) return <SectionSlide s={s} />;
  const R = SLIDES[s.n];
  if (R) return R(s);
  return <Frame s={s}><p className="lead">{s.body}</p></Frame>;
}

// Slide → platform links (formula & concept ids from syllo/data.jsx)
const L4_LINKS = {
  5: { c: ['c7', 'c8'], f: ['f7'] }, 6: { c: ['c7', 'c9'] }, 9: { f: ['f1', 'f3'] }, 10: { f: ['f1', 'f3'], c: ['c3'] },
  11: { c: ['c10'] }, 12: { c: ['c10'] }, 13: { c: ['c5'] }, 14: { c: ['c12', 'c2'] }, 16: { f: ['f8'], c: ['c10'] }, 17: { c: ['c10'] },
  18: { f: ['f8'] }, 19: { f: ['f9'], c: ['c11'] }, 20: { f: ['f15'], c: ['c11'] }, 21: { c: ['c11'] }, 22: { f: ['f9', 'f12', 'f10'], c: ['c10', 'c11'] },
  24: { f: ['f12'] }, 25: { f: ['f12'], c: ['c5'] }, 26: { f: ['f12', 'f10'], c: ['c5'] }, 27: { f: ['f12'] },
  29: { f: ['f13'] }, 30: { f: ['f11'] }, 31: { f: ['f11'] }, 32: { f: ['f14'] }, 33: { f: ['f14'], c: ['c11'] },
  35: { f: ['f8'] }, 36: { f: ['f9'] }, 38: { f: ['f12', 'f10', 'f15'] }, 39: { f: ['f13', 'f11', 'f14'] }, 41: { f: ['f9', 'f10', 'f13', 'f11', 'f14'] },
};


export { AMPlot, SinePlot, SpectrumPlot, OscWidget, AMSim, Slide, L4_LINKS, L4_CHAPTERS, L4_SLIDES, Tex };
