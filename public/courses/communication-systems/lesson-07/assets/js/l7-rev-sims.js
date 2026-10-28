/* =========================================================
   שיעור 07 · v2 — סימולטורים מתוקנים וחדשים
   כל סימולציה מחושבת מחדש; אין תמונות מוכנות.
   ========================================================= */
(function(){
const L7 = window.L7 = window.L7 || {};
L7.sims = L7.sims || {};
const HFONT = '"Heebo","Segoe UI","Noto Sans Hebrew",Arial,sans-serif';
const MFONT = '600 25px ui-monospace,SFMono-Regular,Consolas,monospace';
const st = L7.st, setO = L7.setO, C = L7.C, ranges = L7.ranges;
const O = (root,k)=>root.querySelector('[data-o="'+k+'"]');
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const sig = (d)=>Math.round(d*100)/100;

const STATIONS = [
  {f:88.9,n:'88.9'},{f:91.8,n:'91.8'},{f:94.2,n:'94.2'},{f:97.6,n:'97.6'},
  {f:98.1,n:'98.1'},{f:100.4,n:'100.4'},{f:103.5,n:'103.5'},{f:106.7,n:'106.7'}
];

/* =========================================================
   1 · m(t) וגל FM מסונכרנים — שקף 02
   ========================================================= */
L7.sims.mfm = function(root){
  const A = C(root,'m'), B = C(root,'fm');
  const D = {dev:55};
  const FM = 0.5;                 /* תדר המידע, Hz יחידות תצוגה */
  function draw(){
    const s = st(root,D), d = s.dev/100;
    const idx = d*7;              /* β מודגם */
    const T = 6;
    const p = L7.P(A,{xm:0,xM:T,ym:-1.35,yM:1.35,pad:{t:30,r:26,b:34,l:44}});
    p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
    p.curve(t=>Math.sin(2*Math.PI*FM*t),{color:'#7c3aed',w:3.6,n:900});
    [0.5,1.5,2.5,3.5].forEach(function(t){
      p.ctx.strokeStyle='#e2e8f0'; p.ctx.lineWidth=2; p.ctx.setLineDash([5,6]);
      p.ctx.beginPath(); p.ctx.moveTo(p.X(t),p.Y0); p.ctx.lineTo(p.X(t),p.Y1); p.ctx.stroke(); p.ctx.setLineDash([]);
    });
    p.text('אות המידע · m(t)', 8, 18, {rtl:true, font:'800 21px '+HFONT, color:'#6d28d9'});

    const q = L7.P(B,{xm:0,xM:T,ym:-1.3,yM:1.3,pad:{t:30,r:26,b:40,l:44}});
    q.grid(6,2); q.hline(0,{color:'#e2e8f0',w:2});
    q.curve(t=>Math.cos(2*Math.PI*4.2*t - idx*Math.cos(2*Math.PI*FM*t)),
      {color:'#0891b2',w:3.2,n:3200});
    [0.5,1.5,2.5,3.5].forEach(function(t){
      q.ctx.strokeStyle='#e2e8f0'; q.ctx.lineWidth=2; q.ctx.setLineDash([5,6]);
      q.ctx.beginPath(); q.ctx.moveTo(q.X(t),q.Y0); q.ctx.lineTo(q.X(t),q.Y1); q.ctx.stroke(); q.ctx.setLineDash([]);
    });
    q.text('אותו רגע בזמן · גל FM', 8, 18, {rtl:true, font:'800 21px '+HFONT, color:'#0e7490'});

    setO(root,'dev', s.dev+'%');
    const el = O(root,'st');
    if (el){
      el.textContent = d < 0.02
        ? 'ללא שינוי תדר — הגל אחיד, ואין בו מידע'
        : 'המחזורים צפופים היכן ש־m(t) חיובי, דלילים היכן שהוא שלילי';
      el.className = 'status ' + (d < 0.02 ? 'warn' : '');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   2 · דרגת RF — תחום, לא ערוץ — שקף 07
   ========================================================= */
L7.sims.rffilter = function(root){
  const cv = C(root,'rf');
  const D = {bw:21};
  const FC = 98.0;                 /* מרכז תחום השידור */
  const XM = 84, XX = 112;
  /* שמונה התחנות — אותה רשימה בכל מצב, מחושבת פעם אחת */
  const STN = [
    {f:88.9,a:0.62},{f:91.8,a:0.80},{f:94.2,a:0.52},{f:97.6,a:0.72},
    {f:98.1,a:1.00},{f:100.4,a:0.58},{f:103.5,a:0.76},{f:106.7,a:0.46}
  ];
  function H(f,bw){ return 1/(1+Math.pow(Math.abs(f-FC)/(bw/2),8)); }
  function sync(){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }
  function draw(){
    const s = st(root,D);
    const bw = s.bw;
    sync();
    const p = L7.P(cv,{xm:XM,xM:XX,ym:0,yM:1.42,pad:{t:46,r:34,b:78,l:34}});
    p.grid(14,4);

    /* תחום השידור כרקע */
    p.ctx.fillStyle='rgba(6,182,212,.055)';
    p.ctx.fillRect(p.X(88), p.Y0, p.X(108)-p.X(88), p.Y1-p.Y0);

    /* רצועת המעבר של המסנן */
    const lo = Math.max(XM, FC-bw/2), hi = Math.min(XX, FC+bw/2);
    p.ctx.fillStyle='rgba(14,116,144,.14)';
    p.ctx.fillRect(p.X(lo), p.Y0, p.X(hi)-p.X(lo), p.Y1-p.Y0);
    p.ctx.strokeStyle='rgba(14,116,144,.6)'; p.ctx.lineWidth=2; p.ctx.setLineDash([7,6]);
    [lo,hi].forEach(function(v){
      p.ctx.beginPath(); p.ctx.moveTo(p.X(v),p.Y0); p.ctx.lineTo(p.X(v),p.Y1); p.ctx.stroke();
    });
    p.ctx.setLineDash([]);

    /* עקומת המסנן */
    p.curve(f=>H(f,bw),{color:'#0891b2',w:5,n:1100});

    /* התחנות: בתוך התחום — כהה; מחוץ — אפור מוחלש */
    let pass = 0;
    STN.forEach(function(stn, i){
      const h = H(stn.f,bw);
      const inside = h >= 0.5;
      if (inside) pass++;
      const top = p.Y(Math.min(h*stn.a*1.16, 1.30));
      const base = p.Y1;
      const w = Math.max(7, (p.X1-p.X0)/72);
      p.ctx.fillStyle = inside ? 'rgba(8,145,178,.85)' : 'rgba(148,163,184,.42)';
      p.ctx.fillRect(p.X(stn.f)-w/2, top, w, base-top);
      p.ctx.fillStyle = inside ? '#0e7490' : '#94a3b8';
      p.ctx.beginPath(); p.ctx.arc(p.X(stn.f), top, 4.5, 0, 7); p.ctx.fill();

      /* תווית מדורגת בשתי שורות — מונע חפיפה בין 97.6 ל־98.1 */
      const row = i % 2;
      const ly = p.Y1 + 22 + row*25;
      p.text(stn.f.toFixed(1), p.X(stn.f), ly,
        {align:'center', font:'700 19px '+MFONT, color: inside?'#0f172a':'#94a3b8'});
      if (inside){
        p.ctx.strokeStyle='#cbd5e1'; p.ctx.lineWidth=1.4;
        p.ctx.beginPath(); p.ctx.moveTo(p.X(stn.f), base); p.ctx.lineTo(p.X(stn.f), ly-11); p.ctx.stroke();
      }
    });

    /* כותרת גרף — בשורה נפרדת מעל, לא על הנתונים */
    p.text('תגובת דרגת ה־RF ותחנות התחום · המחשה סכמטית',
      p.X1, 20, {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#0e7490'});

    /* יחידות וסימוני ציר — בתחתית, מופרדים מהתוויות */
    p.text('תדר [MHz]', p.X0, p.Y1+62, {rtl:true, align:'left', font:'700 17px '+HFONT, color:'#64748b'});
    p.text('תחום המעבר '+lo.toFixed(1)+'–'+hi.toFixed(1)+' MHz',
      p.X1, p.Y1+62, {rtl:true, align:'right', font:'700 17px '+HFONT, color:'#0e7490'});
    p.text('עוצמה', p.X0, p.Y0-14, {rtl:true, align:'left', font:'700 15px '+HFONT, color:'#94a3b8'});

    setO(root,'bw', bw+' MHz');
    setO(root,'pass', String(pass));
    const el = O(root,'st');
    if (el){
      el.textContent = pass >= 5
        ? 'הרבה תחנות עוברות יחד — דרגת RF מסננת תחום, לא בוחרת תחנה'
        : (pass === 1
            ? 'תחנה אחת בתחום המעבר — אבל גם השכנות רק נחלשות, לא נעלמות'
            : 'חלק מהתחנות מחוץ לתחום המעבר — הן מוחלשות');
      el.className = 'status ' + (pass === 1 ? 'warn' : '');
    }
  }
  ranges(root,draw);
  if (window.ResizeObserver && cv && cv.parentElement){
    new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(cv.parentElement);
  }
  draw();
  return {draw};
};

/* =========================================================
   3 · מסנן IF בוחר את התוצר — שקף 11
   ========================================================= */
L7.sims.ifsel = function(root){
  const cv = C(root,'ifs');
  const D = {bw:200, lo:0};
  function draw(){
    const s = st(root,D);
    const f = 10.7 + s.lo/1000;
    const half = s.bw/2000;
    const p = L7.P(cv,{xm:9.9,xM:11.5,ym:0,yM:1.22,pad:{t:34,r:30,b:46,l:34}});
    p.grid(8,3);
    p.band(10.7-half,10.7+half,'rgba(5,150,105,.16)');
    p.curve(x=>1/(1+Math.pow(Math.abs(x-10.7)/Math.max(half,0.004),8)),{color:'#059669',w:5,n:900});
    p.vline(10.7,{color:'#059669',w:2,dash:[6,7]});
    p.text('חלון IF · '+(s.bw/1000).toFixed(2)+' MHz', p.X(10.7), p.Y0+18,
      {align:'center', font:'800 22px '+HFONT, color:'#047857'});
    /* תוצר ההפרש — ספקטרום סכמטי עם שדרת FM */
    const c = (x)=>0.72*Math.exp(-Math.pow((x-f)/0.055,2));
    p.curve(c,{color:'#7c3aed',w:4.5,n:600});
    p.text('תוצר ההפרש', p.X(f), p.Y(0.80), {align:'center', font:'800 21px '+HFONT, color:'#6d28d9'});
    p.ctx.strokeStyle='#dc2626'; p.ctx.lineWidth=2.5; p.ctx.setLineDash([7,6]);
    p.ctx.beginPath(); p.ctx.moveTo(p.X(f),p.Y1); p.ctx.lineTo(p.X(f),p.Y(0.05)); p.ctx.stroke(); p.ctx.setLineDash([]);
    /* תוצר הסכום — מחוץ לחלון, מסומן בקצה */
    p.text('תוצר הסכום · 206.9 MHz — מחוץ לחלון', p.X1-4, p.Y1-16,
      {align:'right', font:'800 19px '+HFONT, color:'#94a3b8'});
    [10.0,10.4,10.7,11.0,11.4].forEach(v=>p.text(v.toFixed(1), p.X(v), p.Y1+24,
      {align:'center', font:MFONT, color:'#94a3b8'}));
    const inWin = Math.abs(f-10.7) <= half;
    const el = O(root,'st');
    if (el){
      el.textContent = inWin ? 'התוצר הרצוי בתוך חלון המסנן — הוא עובר לבד'
        : (Math.abs(f-10.7) < half+0.09 ? 'התוצר על שפת החלון — משרעתו יורדת' : 'התוצר מחוץ לחלון — המסנן דוחה אותו');
      el.className = 'status ' + (inWin ? '' : 'warn');
    }
    setO(root,'bw', s.bw.toFixed(0)+' kHz');
    setO(root,'pos', f.toFixed(3)+' MHz');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   4 · שלושה גרפים מסונכרנים: תדר → מעטפת → שמע — שקף 27
   ========================================================= */
L7.sims.fmenv = function(root){
  const A = C(root,'fi'), B = C(root,'env'), Cv = C(root,'aud');
  const D = {dev:60, rate:1.1, tc:1.4};
  const F0 = 12.4, Q = 6.0, FIF = 10.7;
  const H = f => 1/Math.sqrt(1+Math.pow(Q*(f-F0)/F0,2));
  function draw(){
    const s = st(root,D);
    const T = 4.5, d = s.dev/100;
    const dev = t => d*0.30*Math.sin(2*Math.PI*s.rate*t);        /* MHz */
    const env = t => H(FIF+dev(t));
    const base = H(FIF);
    /* --- 1 · תדר רגעי --- */
    const p = L7.P(A,{xm:0,xM:T,ym:10.3,yM:11.1,pad:{t:28,r:26,b:30,l:56}});
    p.grid(6,2);
    p.curve(t=>FIF+dev(t),{color:'#0891b2',w:3.6,n:900});
    p.hline(FIF+0.30,{color:'#fca5a5',w:2,dash:[7,6]});
    p.hline(FIF-0.30,{color:'#fca5a5',w:2,dash:[7,6]});
    p.text('f_inst(t) [MHz]', 8, 16, {rtl:true, font:'800 20px '+HFONT, color:'#0e7490'});
    /* --- 2 · מעטפת --- */
    const q = L7.P(B,{xm:0,xM:T,ym:0,yM:1.15,pad:{t:28,r:26,b:30,l:56}});
    q.grid(6,2);
    q.curve(t=>env(t),{color:'#d97706',w:3.8,n:900});
    q.text('A(t) · משרעת אחרי מסנן התהודה', 8, 16, {rtl:true, font:'800 20px '+HFONT, color:'#b45309'});
    /* --- 3 · שמע --- */
    const r = L7.P(Cv,{xm:0,xM:T,ym:-0.5,yM:0.5,pad:{t:26,r:26,b:40,l:56}});
    r.grid(6,2); r.hline(0,{color:'#cbd5e1',w:2.5});
    r.curve(t=>(env(t)-base)*1.9,{color:'#059669',w:3.6,n:900});
    r.text('v_audio(t) — אחרי הסרת DC', 8, 14, {rtl:true, font:'800 20px '+HFONT, color:'#047857'});
    [0,1,2,3,4].forEach(t=>r.text(String(t),r.X(t),r.Y1+22,{align:'center',font:MFONT,color:'#94a3b8'}));
    r.text('זמן [s]', r.X(T), r.Y1+22, {align:'right', font:MFONT, color:'#94a3b8'});
    /* סמן זמן משותף */
    const tc = clamp(s.tc, 0, T);
    [p,q,r].forEach(function(g){
      g.ctx.strokeStyle='#dc2626'; g.ctx.lineWidth=2.5; g.ctx.setLineDash([6,5]);
      g.ctx.beginPath(); g.ctx.moveTo(g.X(tc),g.Y0); g.ctx.lineTo(g.X(tc),g.Y1); g.ctx.stroke(); g.ctx.setLineDash([]);
    });
    const fNow = FIF+dev(tc);
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.ctx.arc(p.X(tc),p.Y(fNow),9,0,7); p.ctx.fill();
    q.ctx.fillStyle='#dc2626'; q.ctx.beginPath(); q.ctx.arc(q.X(tc),q.Y(env(tc)),9,0,7); q.ctx.fill();
    r.ctx.fillStyle='#dc2626'; r.ctx.beginPath(); r.ctx.arc(r.X(tc),r.Y((env(tc)-base)*1.9),9,0,7); r.ctx.fill();
    setO(root,'dev', s.dev+'%');
    setO(root,'rate', s.rate.toFixed(1)+' Hz');
    setO(root,'at', 'f='+fNow.toFixed(3)+' MHz · A='+(env(tc)*100).toFixed(0)+'%');
    const el = O(root,'st');
    if (el){
      el.textContent = d < 0.02 ? 'ללא סטייה — המשרעת קבועה ואין אות שמע'
        : 'תנודת התדר הופכת לתנודת משרעת — וזו כבר צורת השמע';
      el.className = 'status ' + (d < 0.02 ? 'warn' : '');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   5 · DC מול צימוד AC — שקף 28
   ========================================================= */
L7.sims.envdc = function(root){
  const cv = C(root,'dc');
  const D = {vdc:60};
  function draw(){
    const s = st(root,D), T = 4;
    const dc = s.vdc/100*1.4;
    const msg = t => 0.42*Math.cos(2*Math.PI*1.2*t) + 0.16*Math.cos(2*Math.PI*3.7*t+1);
    const p = L7.P(cv,{xm:0,xM:T,ym:-1.1,yM:2.0,pad:{t:32,r:30,b:46,l:52}});
    p.grid(8,3); p.hline(0,{color:'#cbd5e1',w:2.5});
    p.curve(t=>dc+msg(t),{color:'#d97706',w:3.6,n:1200});
    p.curve(t=>msg(t),{color:'#059669',w:3.6,n:1200});
    p.hline(dc,{color:'#f59e0b',w:2,dash:[8,6]});
    p.text('V_DC', p.X1-6, p.Y(dc)-14, {align:'right', font:MFONT, color:'#b45309'});
    p.text('לפני צימוד AC · v = V_DC + v_audio(t)', 8, 18, {rtl:true, font:'800 21px '+HFONT, color:'#b45309'});
    p.text('אחרי צימוד AC · v = v_audio(t)', 8, p.Y1-18, {rtl:true, font:'800 21px '+HFONT, color:'#047857'});
    setO(root,'vdc', dc.toFixed(2)+' V');
    setO(root,'amp', '±0.58 V');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   6 · שני מדרונות על אותה עקומה — שקף 24
   ========================================================= */
L7.sims.twoslope = function(root){
  const cv = C(root,'sl');
  const D = {f0:12.4};
  function draw(){
    const s = st(root,D);
    const F0 = s.f0, Q = 6.0, w = 10.7;
    const H = f => 1/Math.sqrt(1+Math.pow(Q*(f-F0)/F0,2));
    const dH = f => (H(f+0.01)-H(f-0.01))/0.02;
    const p = L7.P(cv,{xm:8.6,xM:14.4,ym:0,yM:1.2,pad:{t:34,r:28,b:48,l:34}});
    p.grid(9,3);
    p.curve(H,{color:'#0e7490',w:5,n:1200});
    p.vline(F0,{color:'#7c3aed',w:2.5,dash:[8,6]});
    p.text('f₀', p.X(F0), 22, {align:'center', font:MFONT, color:'#6d28d9'});
    const y=H(w), sl=dH(w), pos = w > F0;
    p.curve(f=>y+sl*(f-w),{color:'#d97706',w:3.2,dash:[9,7],n:2});
    p.vline(w,{color:'#059669',w:3.5});
    p.text('f_IF · נקודת העבודה', p.X(w), p.Y1+24, {align:'center', font:'800 21px '+HFONT, color:'#047857'});
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.ctx.arc(p.X(w),p.Y(y),10,0,7); p.ctx.fill();
    /* חץ כיוון */
    const dx = pos ? 26 : -26;
    p.ctx.strokeStyle='#dc2626'; p.ctx.lineWidth=3.5; p.ctx.setLineDash([]);
    p.ctx.beginPath(); p.ctx.moveTo(p.X(w),p.Y(y)); p.ctx.lineTo(p.X(w)+dx,p.Y(y)+(-dx)*sl*(p.Y0-p.Y1)/((p.Y1-p.Y0)/(1.2))/(p.X1-p.X0)*0+ (pos? 30 : -30));
    p.ctx.stroke();
    setO(root,'f0', F0.toFixed(2)+' MHz');
    setO(root,'side', pos ? 'מעל f₀' : 'מתחת ל־f₀');
    setO(root,'sign', sl>0 ? 'חיובי ↑' : 'שלילי ↓');
    const el = O(root,'st');
    if (el){
      el.textContent = Math.abs(sl)<0.02 ? 'על השיא — שיפוע אפס, אין גילוי'
        : (sl>0 ? 'שיפוע עולה: תדר עולה ← משרעת עולה' : 'שיפוע יורד: תדר עולה ← משרעת יורדת');
      el.className = 'status ' + (Math.abs(sl)<0.02 ? 'warn' : '');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   7 · עקומת מעבר IF — במקום "סדר קריסה" — שקף 42
   ========================================================= */
L7.sims.iftran = function(root){
  const cv = C(root,'tr');
  const D = {d:0};
  function draw(){
    const s = st(root,D);
    const pos = 10.7 + s.d/1000;                 /* MHz */
    const p = L7.P(cv,{xm:10.45,xM:10.95,ym:0,yM:1.2,pad:{t:34,r:28,b:50,l:34}});
    p.grid(10,3);
    p.curve(f=>1/(1+Math.pow((f-10.7)/0.05,6)),{color:'#059669',w:5,n:900});
    p.vline(10.7,{color:'#059669',w:2,dash:[6,7]});
    p.text('מרכז מסנן IF · 10.700 MHz', p.X(10.7), p.Y0+18,
      {align:'center', font:'800 21px '+HFONT, color:'#047857'});
    p.vline(pos,{color:'#dc2626',w:4});
    p.text('IF בפועל', p.X(pos), p.Y(1.06), {align:'center', font:'800 20px '+HFONT, color:'#b91c1c'});
    const h = 1/(1+Math.pow((pos-10.7)/0.05,6));
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.arc(p.X(pos),p.Y(h),10,0,7); p.ctx.fill();
    [10.5,10.6,10.7,10.8,10.9].forEach(v=>p.text(v.toFixed(2), p.X(v), p.Y1+24,
      {align:'center', font:MFONT, color:'#94a3b8'}));
    p.text('MHz', p.X1, p.Y1+24, {align:'right', font:MFONT, color:'#94a3b8'});
    setO(root,'d', (s.d>0?'+':'')+s.d+' kHz');
    setO(root,'att', (h*100).toFixed(0)+'%');
    const el = O(root,'st');
    if (el){
      if (h > 0.92) el.textContent = 'בתוך הפס — אות מלא, שמע תקין';
      else if (h > 0.45) el.textContent = 'על שפת הפס — ירידת משרעת, ועשוי להופיע עיוות';
      else el.textContent = 'מחוץ לפס — אות חלש מאוד או שקט, בהתאם לשאר השרשרת';
      el.className = 'status ' + (h>0.92 ? '' : 'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   --- תיקוני סימולטורים קיימים ---
   ========================================================= */

/* 35 · VCO — מיושר ל־10.7 MHz, תדר חופשי מוסבר */
L7.sims.vco = function(root){
  const A = C(root,'vco');
  const D = {v:2, kv:0.85, ff:9.0};
  function draw(){
    const s = st(root,D);
    const fv = s.ff + s.kv*s.v;
    const p = L7.P(A,{xm:0,xM:5,ym:Math.max(0,s.ff-1),yM:s.ff+s.kv*5+1,pad:{t:34,r:28,b:48,l:56}});
    p.grid(5,4);
    p.hline(10.7,{color:'#059669',w:2,dash:[7,7]});
    p.text('10.7 MHz · תדר IF', p.X1-6, p.Y(10.7)-14, {align:'right', font:'800 20px '+HFONT, color:'#047857'});
    p.curve(v=>s.ff+s.kv*v,{color:'#7c3aed',w:5,n:2});
    p.vline(s.v,{color:'#059669',w:2.5,dash:[7,6]});
    p.hline(fv,{color:'#059669',w:2.5,dash:[7,6]});
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.arc(p.X(s.v),p.Y(fv),10,0,7); p.ctx.fill();
    [0,1,2,3,4,5].forEach(v=>p.text(String(v), p.X(v), p.Y1+24,
      {align:'center', font:MFONT, color: v===Math.round(s.v)?'#047857':'#94a3b8'}));
    p.text('V_ctrl [V]', p.X(5), p.Y1+42, {align:'right', font:MFONT, color:'#94a3b8'});
    p.text('f_VCO [MHz]', 6, 20, {rtl:true, font:'800 20px '+HFONT, color:'#6d28d9'});
    /* שיפוע */
    p.ctx.strokeStyle='#f59e0b'; p.ctx.lineWidth=3;
    p.ctx.beginPath(); p.ctx.moveTo(p.X(1),p.Y(s.ff+s.kv)); p.ctx.lineTo(p.X(2),p.Y(s.ff+s.kv));
    p.ctx.lineTo(p.X(2),p.Y(s.ff+2*s.kv)); p.ctx.stroke();
    p.text('K_VCO', p.X(2)+12, p.Y(s.ff+s.kv*1.5), {font:'800 21px '+HFONT, color:'#b45309'});
    setO(root,'v', s.v.toFixed(1)+' V');
    setO(root,'f', fv.toFixed(2)+' MHz');
    setO(root,'kv', s.kv.toFixed(2)+' MHz/V');
    setO(root,'ff', s.ff.toFixed(1)+' MHz');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 34 · LPF — סינון אמיתי, ויחס לרוחב השמע */
L7.sims.lpf = function(root){
  const A = C(root,'raw'), B = C(root,'filt');
  const D = {fc:0.9};
  function draw(){
    const s = st(root,D), T = 0.012;               /* 12 ms */
    const rc = 1/(2*Math.PI*s.fc*1000);
    const dt = T/2400, a = dt/(rc+dt);
    let y = 0;
    const raw = t => 0.55*Math.cos(2*Math.PI*18000*t) + 0.62*Math.cos(2*Math.PI*900*t);
    const pts = []; for (let i=0;i<=2600;i++){ const t = T*i/2600; y += a*(raw(t)-y); pts.push(y); }
    function w(cv, filt){
      const p = L7.P(cv,{xm:0,xM:T*1000,ym:-1.3,yM:1.3,pad:{t:30,r:26,b:38,l:46}});
      p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
      if (filt) p.curve(t=>pts[Math.round(t/(T*1000)*2600)]||0,{color:'#059669',w:3.4,n:2600});
      else p.curve(t=>raw(t/1000),{color:'#d97706',w:3,n:2600});
      p.text(filt?'מוצא ה־LPF · מתח בקרה':'כניסת ה־LPF · פלט המשווה', 8, 18,
        {rtl:true, font:'800 20px '+HFONT, color:filt?'#047857':'#b45309'});
      p.text('ms', p.X1-4, p.Y1+22, {align:'right', font:MFONT, color:'#94a3b8'});
    }
    w(A,false); w(B,true);
    setO(root,'fc', s.fc.toFixed(1)+' kHz');
    setO(root,'a1', (20*Math.log10(1/Math.sqrt(1+Math.pow(18/s.fc,2)))).toFixed(1)+' dB');
    setO(root,'a15', (20*Math.log10(1/Math.sqrt(1+Math.pow(15/s.fc,2)))).toFixed(1)+' dB');
    const el = O(root,'st');
    if (el){
      el.textContent = s.fc < 3
        ? 'רוחב חוג צר מהתחום הדרוש — רק חלק משינויי השמע יעברו'
        : 'רוחב חוג קרוב לתחום השמע — עקיבה מהירה, פחות דיכוי רעש';
      el.className = 'status ' + (s.fc < 3 ? 'warn' : '');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 33 · משווה מופע — מודל מוצהר */
L7.sims.phasedet = function(root){
  const A = C(root,'in'), B = C(root,'out');
  const D = {phi:60};
  const KPD = 2.0;                     /* V/rad, מוצהר על השקף */
  function draw(){
    const s = st(root,D), ph = s.phi/180*Math.PI;
    function w(cv, showOut){
      const p = L7.P(cv,{xm:0,xM:4,ym:-1.65,yM:1.65,pad:{t:30,r:24,b:34,l:42}});
      p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
      if (showOut){
        p.curve(t=>KPD/2*Math.sin(ph)*(1+0.18*Math.cos(2*Math.PI*10*t)),
          {color:'#d97706',w:3.4,n:1200});
        p.text('v_d(t) = K_pd·sin(Δφ) · רכיב DC הוא השגיאה', 8, 16,
          {rtl:true, font:'800 19.5px '+HFONT, color:'#b45309'});
      } else {
        p.curve(t=>Math.cos(2*Math.PI*5*t),{color:'#0891b2',w:3.2,n:1200});
        p.curve(t=>Math.cos(2*Math.PI*5*t+ph),{color:'#7c3aed',w:3.2,n:1200});
        p.text('אות FM', 8, 16, {rtl:true, font:'800 20px '+HFONT, color:'#0e7490'});
        p.text('אות VCO', 8, p.Y1-14, {rtl:true, font:'800 20px '+HFONT, color:'#6d28d9'});
      }
    }
    w(A,false); w(B,true);
    setO(root,'phi', s.phi+'° / '+(ph).toFixed(2)+' rad');
    setO(root,'vd', (KPD*Math.sin(ph)).toFixed(2)+' V');
    setO(root,'vdrel', (Math.sin(ph)*100).toFixed(0)+'%');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 37 · PLL — טווחים ב־kHz, capture מול hold, זמן התכנסות */
L7.sims.pll = function(root){
  const A = C(root,'pll');
  const D = {dev:30, k:40};
  function draw(){
    const s = st(root,D);
    const dev = s.dev;                        /* kHz */
    const hold = s.k*5;                       /* kHz — טווח עקיבה */
    const capture = Math.round(hold*0.55);     /* kHz — טווח רכישה, צר יותר */
    const locked = dev <= hold;
    const acquired = dev <= capture;
    const T = 8;
    const p = L7.P(A,{xm:0,xM:T,ym:-1.9,yM:1.9,pad:{t:32,r:26,b:42,l:58}});
    p.grid(8,4);
    const rows = [
      {y:1.34, n:'f_in(t)', c:'#0891b2'},
      {y:0.45, n:'f_VCO(t)', c:'#7c3aed'},
      {y:-0.45, n:'שגיאת מופע', c:'#dc2626'},
      {y:-1.34, n:'V_ctrl(t)', c:'#059669'}
    ];
    rows.forEach(function(r){
      p.hline(r.y,{color:'#f1f5f9',w:2});
      p.text(r.n, 6, p.Y(r.y)-38, {rtl:true, font:'800 19.5px '+HFONT, color:r.c});
    });
    const sig = t => dev*Math.sin(2*Math.PI*0.55*t);
    const track = t => locked ? sig(t) : (dev>0?hold:-hold)*Math.sign(Math.sin(2*Math.PI*0.55*t));
    p.curve(t=>1.34+sig(t)/Math.max(dev,1)*1.0,{color:'#0891b2',w:3,n:900});
    p.curve(t=>0.45+track(t)/Math.max(dev,1)*1.0,{color:'#7c3aed',w:3,n:900});
    p.curve(t=>-0.45+(locked?0:Math.abs(sig(t)-track(t))/Math.max(dev,1)*1.0),{color:'#dc2626',w:3,n:900});
    p.curve(t=>-1.34+track(t)/Math.max(dev,1)*1.0,{color:'#059669',w:3,n:900});
    const tc = dev<1 ? 0.02 : (locked ? Math.min(2.4, 0.55/Math.max(1e-3, (1-dev/hold))*0.35) : NaN);
    setO(root,'dev', dev+' kHz');
    setO(root,'hold', hold+' kHz');
    setO(root,'cap', capture+' kHz');
    setO(root,'tc', isFinite(tc) ? tc.toFixed(2)+' s' : '—');
    setO(root,'mode', locked ? (acquired ? 'נעילה' : 'נעול, ללא רכישה') : 'אין נעילה');
    const b = O(root,'lockbadge');
    if (b){ b.className='ro '+(locked?'ok':'bad'); b.textContent = locked?'נעול':'אין נעילה'; }
    const el = O(root,'st');
    if (el){
      el.textContent = !locked ? 'מחוץ לטווח העקיבה — ה־VCO רווי והשגיאה נשארת'
        : (acquired ? 'בתוך טווח הרכישה — החוג נכנס לנעילה'
                    : 'בתוך טווח העקיבה אך מחוץ לרכישה — דרוש סיוע אתחולי');
      el.className = 'status ' + (locked ? '' : 'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 32 · לפני נעילה — גם פער תדר וגם פער מופע */
L7.sims.prelock = function(root){
  const cv = C(root,'pr');
  const D = {df:0.9, phi:0};
  function draw(){
    const s = st(root,D);
    const ph = s.phi/180*Math.PI;
    const p = L7.P(cv,{xm:0,xM:6,ym:-1.6,yM:1.6,pad:{t:32,r:26,b:40,l:44}});
    p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
    p.curve(t=>Math.cos(2*Math.PI*4.2*t),{color:'#0891b2',w:3.4,n:1600});
    p.curve(t=>Math.cos(2*Math.PI*(4.2+s.df)*t+ph),{color:'#7c3aed',w:3.4,n:1600});
    p.text('אות הכניסה (FM)', 8, 18, {rtl:true, font:'800 20px '+HFONT, color:'#0e7490'});
    p.text('אות ה־VCO', 8, p.Y1-14, {rtl:true, font:'800 20px '+HFONT, color:'#6d28d9'});
    setO(root,'df', (s.df*10).toFixed(0)+'%');
    setO(root,'phi', s.phi+'°');
    const el = O(root,'st');
    if (el){
      el.textContent = Math.abs(s.df) >= 0.06
        ? 'התדרים שונים — הפער במופע גדל והולך'
        : (s.phi === 0 ? 'תדר זהה ומופע זהה — מצב נעילה'
                       : 'תדר זהה, מופע שונה — עדיין אין נעילה');
      el.className = 'status ' + (Math.abs(s.df)<0.06 && s.phi===0 ? '' : 'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 23 · תדר למתח — מתח גולמי מול מתח שמע */
L7.sims.f2v = function(root){
  const A = C(root,'map'), B = C(root,'wave');
  let pt = 1;
  const V0 = 2.0, KD = 1.2;               /* V, V/MHz-יחידה */
  function draw(){
    const offs = [-1,0,1];
    const p = L7.P(A,{xm:-1.6,xM:1.6,ym:-0.4,yM:3.0,pad:{t:32,r:26,b:44,l:48}});
    p.grid(4,4); p.hline(V0,{color:'#94a3b8',w:2.5,dash:[7,6]});
    p.text('V₀ · מתח גולמי במרכז (רכיב DC)', p.X(-1.55), p.Y(V0)-14, {rtl:true, font:'800 19px '+HFONT, color:'#64748b'});
    p.curve(f=>V0+KD*f,{color:'#7c3aed',w:4.5});
    offs.forEach(function(o,i){
      const on = i===pt, v = V0+KD*o;
      p.ctx.fillStyle = on?'#d97706':'#94a3b8';
      p.ctx.beginPath(); p.ctx.arc(p.X(o),p.Y(v),on?11:7,0,7); p.ctx.fill();
      p.text(o>0?'+Δf':(o<0?'−Δf':'0'), p.X(o), p.Y1+24,
        {align:'center', font:'800 20px '+HFONT, color:on?'#b45309':'#94a3b8'});
      if (on){
        p.ctx.strokeStyle='#d97706'; p.ctx.lineWidth=2; p.ctx.setLineDash([5,5]);
        p.ctx.beginPath(); p.ctx.moveTo(p.X(o),p.Y(v)); p.ctx.lineTo(p.X(1.5),p.Y(v)); p.ctx.stroke(); p.ctx.setLineDash([]);
        p.text(v.toFixed(2)+' V', p.X(1.45), p.Y(v)-16, {align:'right', font:MFONT, color:'#b45309'});
      }
    });
    p.text('מתח גולמי', 6, 20, {rtl:true, font:'800 20px '+HFONT, color:'#6d28d9'});
    const pw = L7.P(B,{xm:0,xM:3,ym:-1.0,yM:1.0,pad:{t:30,r:24,b:38,l:46}});
    pw.grid(6,2); pw.hline(0,{color:'#cbd5e1',w:2.5});
    const amp = [0.55,0,0.55][pt], sgn = pt===0?-1:1;
    pw.curve(t=>amp*sgn*Math.cos(2*Math.PI*9*t),{color:pt===1?'#94a3b8':['#b91c1c','#94a3b8','#047857'][pt],w:3.4,n:1200});
    pw.text(pt===1?'v_audio(t) ≈ 0 — סטייה אפס, לאחר הסרת V₀':'v_audio(t) — לאחר הסרת V₀ (לא המתח הגולמי)', 8, 16,
      {rtl:true, font:'800 20px '+HFONT, color:'#047857'});
    setO(root,'pt', pt===0?'−Δf':(pt===1?'במרכז':'+Δf'));
    setO(root,'vol', (V0+KD*offs[pt]).toFixed(2)+' V');
    setO(root,'aud', pt===1?'0.00 V':(KD*0.55).toFixed(2)+' V');
    offs.forEach(function(o,i){
      const b = root.querySelector('[data-pt="'+i+'"]');
      if (b) b.setAttribute('aria-pressed', String(i===pt));
    });
  }
  root.querySelectorAll('[data-pt]').forEach(function(b){
    b.addEventListener('click', function(){ pt = +b.dataset.pt; draw(); });
  });
  draw();
  return {draw};
};

/* 19/18 · מגבל — קיטום אמיתי + מדידת אדוות */
L7.sims.limiter = function(root){
  const cv = C(root,'lim');
  const D = {level:100, noise:35, lim:62};
  function draw(){
    const s = st(root,D), lv = s.level/100, vl = s.lim/100, n = s.noise/100;
    const T = 5, lim = vl*1.05;
    const p = L7.P(cv,{xm:0,xM:T,ym:-1.95,yM:1.95,pad:{t:30,r:26,b:38,l:48}});
    p.grid(8,4); p.hline(0,{color:'#e2e8f0',w:2});
    const rows = [
      {y:1.30, name:'לפני המגבל', color:'#0891b2'},
      {y:0,    name:'אחרי קיטום',  color:'#d97706'},
      {y:-1.30,name:'אחרי מסנן',   color:'#059669'}
    ];
    let minA = 9, maxA = -9;
    rows.forEach(function(r){
      p.hline(r.y+lim,{color:'#fca5a5',w:2,dash:[7,7]});
      p.hline(r.y-lim,{color:'#fca5a5',w:2,dash:[7,7]});
      p.curve(t=>{
        const env = lv*(1-n*0.55 + n*0.55*Math.sin(2*Math.PI*1.9*t+0.7));
        const raw = env*Math.cos(2*Math.PI*15*t);
        if (r.name==='לפני המגבל'){ const v=r.y+raw; if(t>0.5&&t<2.5){ minA=Math.min(minA,env); maxA=Math.max(maxA,env);} return v; }
        if (r.name==='אחרי קיטום') return r.y + clamp(raw, -lim, lim);
        return r.y + (lv<vl ? 0.40 : 0.86)*Math.cos(2*Math.PI*15*t);
      },{color:r.color,w:3,n:2600});
      p.text(r.name, 8, p.Y(r.y)-58, {rtl:true, font:'800 20.5px '+HFONT, color:r.color});
    });
    p.text('±V_lim', p.X1-6, p.Y(1.30+lim)-14, {align:'right', font:MFONT, color:'#b91c1c'});
    const clip = lv > vl;
    setO(root,'level', s.level+'%');
    setO(root,'noise', s.noise+'%');
    setO(root,'lim', s.lim+'%');
    setO(root,'ripple', clip ? ((maxA-minA)/Math.max(maxA,0.01)*100).toFixed(0)+'%' : '—');
    const el = O(root,'st');
    if (el){
      el.textContent = !clip ? 'האות נמוך מהסף — אין קיטום, ולכן גם אין הסרת רעש'
        : (n>0.02 ? 'כל מה שמעל הסף נחתך — שינויי המשרעת נעלמו' : 'אין שינויי משרעת מלכתחילה; הקיטום רק מיישר את הגובה');
      el.className = 'status ' + (clip ? '' : 'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 21 · מגבל על AM — כולל תוצאת השמע */
L7.sims.amlimiter = function(root){
  const A = C(root,'am'), B = C(root,'amc'), Cc = C(root,'aud');
  let on = false;
  function draw(){
    const T = 4;
    function w(cv, clipped, small){
      const p = L7.P(cv,{xm:0,xM:T,ym:-1.6,yM:1.6,pad:{t:28,r:24,b:32,l:44}});
      p.grid(8,2); p.hline(0,{color:'#e2e8f0',w:2});
      p.curve(t=>{
        const m = 0.55+0.45*Math.cos(2*Math.PI*1.15*t);
        const raw = m*Math.cos(2*Math.PI*16*t);
        return clipped ? clamp(raw*1.5, -0.72, 0.72) : raw;
      },{color: clipped?'#dc2626':'#1d4ed8', w:3.1, n:2400});
      p.text(clipped?'אחרי מגבל — המעטפת נמחקה':'AM נקי — המידע במעטפת', 8, 17,
        {rtl:true, font:'800 19.5px '+HFONT, color:clipped?'#991b1b':'#1d4ed8'});
    }
    w(A,false); w(B,on);
    const p3 = L7.P(Cc,{xm:0,xM:T,ym:-0.35,yM:1.25,pad:{t:26,r:24,b:30,l:44}});
    p3.grid(8,2);
    p3.curve(t=>0.62+0.38*Math.cos(2*Math.PI*1.15*t),{color:'#1d4ed8',w:3,n:900});
    if (on) p3.curve(t=>0.62,{color:'#dc2626',w:3.4,dash:[8,6],n:2});
    p3.text(on?'שמע משוחזר: מתח קבוע — המידע אבד':'שמע משוחזר: עוקב אחרי m(t)', 8, 16,
      {rtl:true, font:'800 19.5px '+HFONT, color:on?'#991b1b':'#1d4ed8'});
    setO(root,'mode', on?'מגבל פעיל':'מגבל כבוי');
  }
  const b = root.querySelector('[data-limtoggle]');
  if (b) b.addEventListener('click', function(){
    on = !on; b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'כיבוי המגבל' : 'הפעלת המגבל'; draw();
  });
  draw();
  return {draw};
};

/* 10 · מסנן תהודה — ברירת מחדל שאינה על השיא */
L7.sims.slope = function(root){
  const A = C(root,'curve'), B = C(root,'time');
  const D = {f:10.7};
  const F0 = 12.4, Q = 6.0;
  const H = f => 1/Math.sqrt(1+Math.pow(Q*(f-F0)/F0,2));
  const dH = f => (H(f+0.01)-H(f-0.01))/0.02;
  function draw(){
    const s = st(root,D);
    const p = L7.P(A,{xm:8.6,xM:14.4,ym:0,yM:1.15,pad:{t:32,r:26,b:46,l:32}});
    p.grid(9,3);
    p.band(10.6,10.8,'rgba(5,150,105,.14)');
    p.curve(H,{color:'#0e7490',w:5,n:1200});
    p.vline(F0,{color:'#7c3aed',w:2.5,dash:[8,6]});
    p.text('f₀ · שיא תהודה', p.X(F0), 22, {align:'center', font:'800 21px '+HFONT, color:'#6d28d9'});
    p.vline(10.7,{color:'#059669',w:3.5});
    p.text('f_IF · נקודת עבודה', p.X(10.7), p.Y1+22, {align:'center', font:'800 20px '+HFONT, color:'#047857'});
    const y0=H(10.7), sl=dH(10.7);
    p.curve(f=>y0+sl*(f-10.7),{color:'#d97706',w:3,dash:[9,7],n:2});
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.arc(p.X(s.f),p.Y(H(s.f)),10,0,7); p.ctx.fill();
    const pw = L7.P(B,{xm:0,xM:3,ym:-1.7,yM:1.7,pad:{t:30,r:24,b:36,l:46}});
    pw.grid(6,2); pw.hline(0,{color:'#e2e8f0',w:2});
    pw.curve(t=>H(s.f)*1.5*Math.cos(2*Math.PI*11*t),{color:'#dc2626',w:3.2,n:1600});
    pw.text('משרעת האות ביציאה', 8, 18, {rtl:true, font:'800 19.5px '+HFONT, color:'#991b1b'});
    setO(root,'amp', (H(s.f)*100).toFixed(0)+'%');
    setO(root,'slopeSign', dH(10.7)>0?'חיובי ↑':'שלילי ↓');
    setO(root,'f', s.f.toFixed(2)+' MHz');
    const el = O(root,'st');
    if (el){
      el.textContent = Math.abs(s.f-10.7)<0.6 ? 'בתחום המקומי — הקשר כמעט ליניארי'
        : 'מחוץ לתחום הליניארי — המשרעת רוויה והמוצא מתעוות';
      el.className = 'status ' + (Math.abs(s.f-10.7)<0.6 ? '' : 'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 41/50 · סחיפה — יחידות kHz וכיוון סימן לפי הזרקה */
L7.sims.drift = function(root){
  const A = C(root,'if');
  const D = {d:0};
  function draw(){
    const s = st(root,D);
    const ifa = 10.7 + s.d/1000;
    const p = L7.P(A,{xm:10.35,xM:11.05,ym:0,yM:1.15,pad:{t:34,r:28,b:50,l:40}});
    p.grid(7,3);
    p.band(10.61,10.79,'rgba(5,150,105,.14)');
    p.curve(f=>1/(1+Math.pow((f-10.7)/0.075,8)),{color:'#059669',w:4,n:1000});
    p.vline(10.7,{color:'#059669',w:2,dash:[6,7]});
    p.vline(ifa,{color:'#dc2626',w:4});
    p.text('מסנן IF', p.X(10.7), 22, {align:'center', font:'800 20px '+HFONT, color:'#047857'});
    p.text('סמן IF בפועל', p.X(ifa), p.Y(1.0), {align:'center', font:'800 20px '+HFONT, color:'#b91c1c'});
    [10.4,10.6,10.8,11].forEach(v=>p.text(v.toFixed(1), p.X(v), p.Y1+24,
      {align:'center', font:MFONT, color:'#94a3b8'}));
    setO(root,'d', (s.d>0?'+':'')+s.d+' kHz');
    setO(root,'ifa', ifa.toFixed(3)+' MHz');
    setO(root,'dif', (s.d>0?'+':'')+s.d+' kHz');
    const el = O(root,'st');
    if (el){
      el.textContent = Math.abs(s.d) < 30 ? 'IF במרכז החלון — הקליטה תקינה'
        : (Math.abs(s.d) < 120 ? 'IF על שפת הפס — משרעת יורדת' : 'IF מחוץ לפס — אות חלש או שקט');
      el.className = 'status ' + (Math.abs(s.d) < 30 ? '' : 'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* 43 · AFC — מקור שגיאה, סינון איטי, תחום תיקון, כולל כשל */
L7.sims.afc = function(root){
  const A = C(root,'afc');
  const D = {d:120, on:1, range:200};
  function draw(){
    const s = st(root,D);
    const onEl = root.querySelector('input[data-k="on"]');
    const on = onEl ? onEl.checked : true;
    const rng = s.range;
    const within = Math.abs(s.d) <= rng;
    const corrected = on && within;
    const resid = corrected ? 0 : s.d;
    const T = 6;
    const p = L7.P(A,{xm:0,xM:T,ym:-rng*1.35,yM:rng*1.35,pad:{t:34,r:28,b:48,l:60}});
    p.grid(6,4); p.hline(0,{color:'#e2e8f0',w:2});
    p.hline(rng,{color:'#fca5a5',w:2,dash:[8,7]});
    p.hline(-rng,{color:'#fca5a5',w:2,dash:[8,7]});
    p.text('תחום התיקון של החוג', p.X(T*0.55), p.Y(rng)-16,
      {align:'center', font:'800 19px '+HFONT, color:'#b91c1c'});
    p.curve(t=>{
      if (!on) return s.d;
      if (within) return s.d*Math.exp(-2.1*t);
      const meet = s.d*Math.exp(-2.1*t);
      return Math.abs(meet) > rng ? meet - Math.sign(s.d)*(Math.abs(meet)-rng)*0 : s.d*0.86;
    },{color:'#dc2626',w:4,n:800});
    p.text('שגיאת כוונון [kHz]', 6, 22, {rtl:true, font:'800 19px '+HFONT, color:'#334155'});
    setO(root,'d',(s.d>0?'+':'')+s.d+' kHz');
    setO(root,'err',(resid>0?'+':'')+resid.toFixed(0)+' kHz');
    setO(root,'lo',(108.8 - (corrected? s.d/1000 : 0)).toFixed(3)+' MHz');
    const el = O(root,'st');
    if (el){
      el.textContent = !on ? 'AFC כבוי — הסחיפה נשארת'
        : (within ? 'AFC מתקן את הכוונון לאורך זמן' : 'הסחיפה גדולה מתחום התיקון — AFC אינו אוחז');
      el.className = 'status ' + (corrected ? '' : 'warn');
    }
  }
  ranges(root,draw);
  root.querySelectorAll('input[type=checkbox],input[type=range]').forEach(i=>i.addEventListener('input',()=>draw()));
  draw();
  return {draw};
};
/* =========================================================
   שקף 02 · שלושה גרפים מסונכרנים — m(t) · גל FM · תדר רגעי
   הקנבס מתיישב על גודל התיבה בפועל (backing = CSS px),
   ולכן הגרפים ממלאים את המסגרת ללא שוליים מדומים.
   ========================================================= */
function syncCanvas(cv){
  if (!cv) return;
  /* המנוע קורא ל-fitCanvases ומזריק מידות px ישירות על הקנבס.
     כאן מחזירים אותו למלוא התיבה — אחרת הגרף יושב קטן באמצע
     עם שוליים לבנים, וזה מה שנראה כגרף שלא ממלא את המסגרת. */
  cv.style.width = '100%';
  cv.style.height = '100%';
  const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
  if (w > 20 && h > 20 && (cv.width !== w || cv.height !== h)){ cv.width = w; cv.height = h; }
}

L7.sims.mfm3 = function(root){
  const A = C(root,'m'), B = C(root,'fm'), F = C(root,'f');
  if (!A || !B || !F) return {draw:function(){}};

  /* df — סטיית התדר המרבית ב-kHz.  t — רגע הזמן הנבחר, בשניות.
     שני המצבים נפרדים לגמרי: שינוי df אינו מזיז את הסמן, וגרירת
     הסמן אינה משנה את df. */
  const D = {df: 40, t: 0.5};
  const FM = 0.5;          /* תדר אות המידע, Hz-visual */
  const T  = 6;            /* אורך חלון הזמן, s */
  const DFMAX = 75;        /* סטייה מרבית, kHz */
  const FCV = 2.0;         /* תדר נושא חזותי, מחזורים/שנייה */
  const DVV = 1.7;         /* סטייה חזותית ב-DFMAX → אינדקס 3.4 */
  const N = 3200;          /* דגימות לאינטגרציה */

  const mOf = t => Math.sin(2*Math.PI*FM*t);

  /* ---- אינטגרציה נומרית של התדר הרגעי לפאזה ----
     f_i(t) = f_c + Δf·m(t)   [m מנורמל −1..+1]
     θ(t) = 2π ∫₀ᵗ f_i(τ) dτ
     הגל הוא cos θ(t) — ולכן שינוי התדר מתבטא בצפיפות המחזורים,
     ולא בשינוי משרעת. אין כאן הצבה של תדר משתנה בתוך 2πft. */
  function buildWave(k){
    const dt = T/N, pts = new Float64Array(N+1);
    let th = 0;
    for (let i = 0; i <= N; i++){
      pts[i] = th;
      const t = i*dt;
      th += 2*Math.PI*(FCV + DVV*k*mOf(t))*dt;
    }
    return pts;
  }

  let pageA = null;   /* נשמר לצורך גרירה */

  function draw(){
    const s = st(root,D);
    const df = Math.max(0, Math.min(DFMAX, s.df));
    const k  = df/DFMAX;                 /* 0..1 */
    const tc = Math.max(0, Math.min(T, s.t));

    [A,B,F].forEach(function(cv){
      const box = cv.parentElement;
      if (box){ box.style.padding='0'; box.style.overflow='hidden'; box.style.minHeight='0'; }
      syncCanvas(cv);
    });

    const PAD = {t:38, r:72, b:14, l:34};

    /* ---- 1 · אות המידע ---- */
    const p = L7.P(A,{xm:0,xM:T,ym:-1.30,yM:1.30,pad:PAD});
    p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
    p.curve(t=>mOf(t),{color:'#7c3aed',w:3.6,n:700});
    p.text('אות המידע · m(t)', p.X1-8, 18,
      {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#6d28d9'});
    p.text('+1', p.X1+8, p.Y(1), {align:'left', font:MFONT, color:'#94a3b8'});
    p.text('−1', p.X1+8, p.Y(-1), {align:'left', font:MFONT, color:'#94a3b8'});

    /* ---- 2 · גל FM ---- */
    const q = L7.P(B,{xm:0,xM:T,ym:-1.12,yM:1.12,pad:PAD});
    q.grid(6,2); q.hline(0,{color:'#e2e8f0',w:2});
    const PH = buildWave(k);
    q.ctx.beginPath();
    for (let i = 0; i <= N; i++){
      const t = i*T/N, y = Math.cos(PH[i]);
      const X = q.X(t), Y = q.Y(y);
      if (i === 0) q.ctx.moveTo(X,Y); else q.ctx.lineTo(X,Y);
    }
    q.ctx.strokeStyle='#0891b2'; q.ctx.lineWidth=2.6; q.ctx.stroke();
    q.text('גל FM המשודר · משרעת קבועה', q.X1-8, 18,
      {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#0e7490'});
    q.text('+1', q.X1+8, q.Y(1), {align:'left', font:MFONT, color:'#94a3b8'});
    q.text('−1', q.X1+8, q.Y(-1), {align:'left', font:MFONT, color:'#94a3b8'});

    /* ---- 3 · סטיית התדר הרגעית ---- */
    const r = L7.P(F,{xm:0,xM:T,ym:-90,yM:90,pad:{t:38,r:72,b:40,l:34}});
    r.grid(6,2);
    r.hline(0,{color:'#cbd5e1',w:2.2,dash:[7,6]});
    r.curve(t=>df*mOf(t),{color:'#db2777',w:3.4,n:700});
    r.text('סטיית התדר הרגעית · Δf·m(t) [kHz]', r.X1-8, 18,
      {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#be185d'});
    r.text('+'+DFMAX, r.X1+8, r.Y(DFMAX), {align:'left', font:MFONT, color:'#94a3b8'});
    r.text('−'+DFMAX, r.X1+8, r.Y(-DFMAX), {align:'left', font:MFONT, color:'#94a3b8'});
    r.text('[s]', r.X1-8, r.Y1+26, {align:'right', font:MFONT, color:'#94a3b8'});

    /* ---- סמן זמן משותף ---- */
    const mv = mOf(tc);
    const dev = df*mv;
    const phIdx = Math.round(tc/T*N);
    const phv = PH[Math.max(0, Math.min(N, phIdx))];

    [p,q,r].forEach(function(pg){
      pg.ctx.strokeStyle='#0f172a'; pg.ctx.lineWidth=2; pg.ctx.setLineDash([5,5]);
      pg.ctx.beginPath(); pg.ctx.moveTo(pg.X(tc),pg.Y0); pg.ctx.lineTo(pg.X(tc),pg.Y1); pg.ctx.stroke();
      pg.ctx.setLineDash([]);
    });

    /* ידית הגרירה — עיגול גדול עם טבעת, רק בגרף העליון */
    p.ctx.fillStyle='#0f172a';
    p.ctx.beginPath(); p.ctx.arc(p.X(tc), p.Y(mv), 9, 0, 7); p.ctx.fill();
    p.ctx.strokeStyle='#fff'; p.ctx.lineWidth=3;
    p.ctx.beginPath(); p.ctx.arc(p.X(tc), p.Y(mv), 9, 0, 7); p.ctx.stroke();
    p.ctx.strokeStyle='#0f172a'; p.ctx.lineWidth=1.5;
    p.ctx.beginPath(); p.ctx.arc(p.X(tc), p.Y(mv), 13, 0, 7); p.ctx.stroke();

    q.ctx.fillStyle='#0f172a';
    q.ctx.beginPath(); q.ctx.arc(q.X(tc), q.Y(Math.cos(phv)), 7, 0, 7); q.ctx.fill();

    r.ctx.fillStyle='#db2777';
    r.ctx.beginPath(); r.ctx.arc(r.X(tc), r.Y(dev), 7, 0, 7); r.ctx.fill();

    /* קריאות ליד הסמן */
    p.text('m = '+mv.toFixed(2), p.X(tc)+14, p.Y(mv)-14,
      {align:'left', font:'800 17px '+MFONT, color:'#6d28d9'});
    r.text(dev.toFixed(0)+' kHz', r.X(tc)+14, r.Y(dev)-14,
      {align:'left', font:'800 17px '+MFONT, color:'#be185d'});

    pageA = p;

    setO(root,'df', df+' kHz');
    setO(root,'mv', mv.toFixed(2));
    setO(root,'dft', dev.toFixed(0)+' kHz');

    const el = O(root,'st');
    if (el){
      if (df < 0.5){
        el.textContent = 'סטייה 0 — התדר אינו משתנה, והגל הוא נושא נקי. אין מידע.';
        el.className = 'status warn';
      } else {
        el.textContent = 'אות המידע לא משתנה; רק שינויי התדר של גל ה־FM משתנים.';
        el.className = 'status';
      }
    }
  }

  /* ---- גרירת סמן הזמן על הגרף העליון ---- */
  function tFromEvent(ev){
    if (!pageA) return null;
    const rect = A.getBoundingClientRect();
    if (!rect.width) return null;
    const clientX = ev.clientX != null ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : null);
    if (clientX == null) return null;
    /* יחס ישיר לאורך הקנבס — לא דרך X0/X1, מפני שאלה נמדדים
       בקנה מידה של ה-canvas attribute ולא של תצוגת ה-CSS. */
    const fx = (clientX - rect.left) / rect.width;
    const t = fx * T;
    return Math.max(0, Math.min(T, t));
  }
  let dragging = false;
  function onDown(ev){
    dragging = true;
    const t = tFromEvent(ev);
    if (t !== null){ D.t = t; draw(); }
    if (ev.pointerId != null && A.setPointerCapture) { try{ A.setPointerCapture(ev.pointerId); }catch(e){} }
    ev.preventDefault();
  }
  function onMove(ev){
    if (!dragging) return;
    const t = tFromEvent(ev);
    if (t !== null){ D.t = t; draw(); }
    ev.preventDefault();
  }
  function onUp(){ dragging = false; }

  if (!root.__mfm3bound){
    root.__mfm3bound = true;
    A.style.touchAction = 'none';
    A.style.cursor = 'ew-resize';
    A.addEventListener('pointerdown', onDown);
    A.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    /* fallback לדפדפנים ללא Pointer Events */
    if (!window.PointerEvent){
      A.addEventListener('mousedown', onDown);
      A.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
  }

  const rs = root.querySelector('[data-reset]');
  if (rs && !rs.__wired){
    rs.__wired = true;
    rs.addEventListener('click', function(){
      D.df = 40; D.t = 0.5;
      const sl = root.querySelector('[data-k="df"]'); if (sl) sl.value = 40;
      draw();
    });
  }

  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   שקף 03 · בדיקת הבנה תלת־שלבית
   נקודה על m(t) ← שאלה ← תשובה רק בלחיצה.
   ========================================================= */
L7.sims.fmprobe = function(root){
  const A = C(root,'pm'), B = C(root,'pfm');
  const FM = 0.5, T = 6, FC = 98.1, DF = 60, IDX = 3.0;
  const PTS = [
    {t:0.5, n:'A',
     q:'נקודה A — שיא חיובי של אות המידע. מה קורה לתדר הרגעי?',
     a:'התדר הרגעי <b>גבוה</b> מתדר המרכז — המחזורים <b>צפופים</b>.',
     why:'המידע חיובי ⟵ התדר עולה מעל '+FC+' MHz.'},
    {t:1.0, n:'B',
     q:'נקודה B — אות המידע חוצה את האפס. ומה קורה לתדר הרגעי?',
     a:'התדר הרגעי <b>שווה</b> לתדר המרכז — צפיפות המחזורים <b>רגילה</b>.',
     why:'מידע אפס אינו תדר אפס: הגל ממשיך להתנודד סביב '+FC+' MHz.'},
    {t:1.5, n:'C',
     q:'נקודה C — שיא שלילי של אות המידע. ומה קורה לתדר הרגעי?',
     a:'התדר הרגעי <b>נמוך</b> מתדר המרכז — המחזורים <b>מרווחים</b>.',
     why:'המידע שלילי ⟵ התדר יורד מתחת ל־'+FC+' MHz.'}
  ];
  function fres(t){ return FC + DF*Math.sin(2*Math.PI*FM*t)/1000; }
  const S = {i:0, rev:false};

  function draw(){
    const pt = PTS[S.i];
    [A,B].forEach(function(cv){
      if (!cv) return;
      const box = cv.parentElement;
      if (box){ box.style.padding = '0'; box.style.overflow = 'hidden'; box.style.minHeight = '0'; }
      syncCanvas(cv);
    });

    /* ---- אות המידע ---- */
    const p = L7.P(A,{xm:0,xM:T,ym:-1.42,yM:1.42,pad:{t:40,r:64,b:14,l:38}});
    p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
    p.curve(t=>Math.sin(2*Math.PI*FM*t),{color:'#7c3aed',w:3.6,n:700});
    PTS.forEach(function(o,k){
      const act = k===S.i;
      const yv = Math.sin(2*Math.PI*FM*o.t);
      p.ctx.fillStyle = act ? '#0f172a' : '#c4b5fd';
      p.ctx.beginPath(); p.ctx.arc(p.X(o.t), p.Y(yv), act?10:7, 0, 7); p.ctx.fill();
      if (act){
        p.ctx.strokeStyle='#0f172a'; p.ctx.lineWidth=2.5;
        p.ctx.beginPath(); p.ctx.arc(p.X(o.t), p.Y(yv), 16, 0, 7); p.ctx.stroke();
      }
      p.text(o.n, p.X(o.t), p.Y(yv) + (yv>0?-28:28), {align:'center',
        font:(act?'800 26px ':'700 21px ')+HFONT, color:act?'#0f172a':'#a78bfa'});
    });
    p.text('אות המידע · m(t)', p.X1-8, 18, {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#6d28d9'});
    p.text('+1', p.X1+6, p.Y(1), {align:'left', font:MFONT, color:'#94a3b8'});
    p.text('−1', p.X1+6, p.Y(-1), {align:'left', font:MFONT, color:'#94a3b8'});

    /* ---- גל FM ---- */
    const q = L7.P(B,{xm:0,xM:T,ym:-1.18,yM:1.18,pad:{t:40,r:64,b:36,l:38}});
    q.grid(6,2); q.hline(0,{color:'#e2e8f0',w:2});
    q.band(pt.t-0.16, pt.t+0.16, 'rgba(15,23,42,.07)');
    q.curve(t=>Math.cos(2*Math.PI*2.0*t - IDX*Math.cos(2*Math.PI*FM*t)),
      {color:'#0891b2',w:2.8,n:3200});
    q.ctx.strokeStyle='#0f172a'; q.ctx.lineWidth=2.4;
    q.ctx.beginPath(); q.ctx.moveTo(q.X(pt.t),q.Y0); q.ctx.lineTo(q.X(pt.t),q.Y1); q.ctx.stroke();
    q.text('גל FM המשודר · אותו רגע בזמן', q.X1-8, 18, {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#0e7490'});
    q.text('f(t) ≈ '+fres(pt.t).toFixed(3)+' MHz', q.X(pt.t), q.Y0-16,
      {align:'center', font:'800 21px '+HFONT, color:'#0f172a'});
    q.text('[s]', q.X1-8, q.Y1+22, {align:'right', font:MFONT, color:'#94a3b8'});

    /* ---- לוח השאלה והתשובה ---- */
    setO(root,'step', (S.i+1)+' / 3 · נקודה '+pt.n);
    setO(root,'qn', pt.q);
    const fb = root.querySelector('[data-o="fb"]');
    if (fb){
      if (S.rev){
        fb.className = 'fb show good';
        fb.innerHTML = pt.a + '<br><span style="font-size:17px;opacity:.9">' + pt.why + '</span>';
      } else {
        fb.className = 'fb';
        fb.innerHTML = '';
      }
    }
    const askB = root.querySelector('[data-ask]'), revB = root.querySelector('[data-reveal]');
    if (askB) askB.disabled = (S.i>=PTS.length-1);
    if (revB) revB.disabled = S.rev;
  }

  const askB = root.querySelector('[data-ask]');
  if (askB) askB.addEventListener('click', function(){ if(S.i<PTS.length-1){ S.i++; S.rev=false; draw(); } });
  const revB = root.querySelector('[data-reveal]');
  if (revB) revB.addEventListener('click', function(){ S.rev=true; draw(); });
  const rsB = root.querySelector('[data-reset]');
  if (rsB) rsB.addEventListener('click', function(){ S.i=0; S.rev=false; draw(); });

  draw();
  return {draw};
};

/* =========================================================
   שקף 05 · הגברה מול סינון — שני מסלולים זה לצד זה
   שלוש תחנות, צבע קבוע לכל תחנה, סקאלה לינארית יחסית.
   ========================================================= */
L7.sims.gainfilt = function(root){
  const R1 = C(root,'rin'), R2 = C(root,'rout');
  const L1 = C(root,'lin'), L2 = C(root,'lout');
  const G = 2.2;                      /* הגבר זהה בשני המסלולים */
  const PASS = [96.4, 98.8];          /* תחום המעבר של ה-BPF, MHz */
  const MID = (PASS[0]+PASS[1])/2, HW = (PASS[1]-PASS[0])/2;
  const STN = [
    {f:94.2,  a:0.30, c:'#0891b2', n:'94.2'},
    {f:97.6,  a:0.42, c:'#db2777', n:'97.6'},
    {f:100.4, a:0.55, c:'#059669', n:'100.4'}
  ];
  const NOISE = 0.030;
  const YM = 1.78;
  const XM = 90, XX = 104;

  /* תגובת המסנן: 1 במרכז תחום המעבר, דועכת מחוצה לו.
     אינה מלבנית — ולכן גם אינה מפרידה perfectly בין תחנות סמוכות. */
  function H(f){
    const x = Math.abs(f-MID)/HW;
    return 1/(1+Math.pow(x,4));
  }

  function size(cv){
    if (!cv) return false;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (!(w>20 && h>20)) return false;
    if (cv.width!==w || cv.height!==h){ cv.width=w; cv.height=h; }
    return true;
  }

  function spec(cv, mode){
    if (!size(cv)) return;
    const p = L7.P(cv,{xm:XM,xM:XX,ym:0,yM:YM,pad:{t:40,r:28,b:34,l:34}});
    p.grid(7,3);

    /* רצועת המעבר של המסנן — שקופה, מאחורי העקומה */
    if (mode==='inF' || mode==='outF'){
      p.ctx.fillStyle='rgba(6,182,212,.13)';
      p.ctx.fillRect(p.X(PASS[0]), p.Y0, p.X(PASS[1])-p.X(PASS[0]), p.Y1-p.Y0);
      p.ctx.strokeStyle='rgba(14,116,144,.55)'; p.ctx.lineWidth=2; p.ctx.setLineDash([6,5]);
      p.ctx.beginPath();
      p.ctx.moveTo(p.X(PASS[0]),p.Y0); p.ctx.lineTo(p.X(PASS[0]),p.Y1);
      p.ctx.moveTo(p.X(PASS[1]),p.Y0); p.ctx.lineTo(p.X(PASS[1]),p.Y1);
      p.ctx.stroke(); p.ctx.setLineDash([]);
    }

    /* רף הרעש */
    const nf = NOISE * (mode==='outF' ? 0.2*G : (mode==='outN' ? G : 1));
    p.ctx.fillStyle='rgba(100,116,139,.16)';
    p.ctx.fillRect(p.X0, p.Y(nf), p.X1-p.X0, p.Y(0)-p.Y(nf));

    /* שלוש התחנות */
    STN.forEach(function(s){
      let amp = s.a;
      if (mode==='inF')  amp = s.a * H(s.f);
      if (mode==='outN') amp = s.a * G;
      if (mode==='outF') amp = s.a * H(s.f) * G;
      const sig = 0.30;
      const y0 = nf;
      p.curve(f=>{
        const g = Math.exp(-Math.pow((f-s.f)/sig,2));
        return Math.min(y0 + amp*g, YM*0.985);
      },{color:s.c, w:3.4, n:260});
      /* תווית מעל הפסגה */
      const top = Math.min(y0+amp, YM*0.985);
      p.text(s.n, p.X(s.f), p.Y(top)-16,
        {align:'center', font:'800 19px '+MFONT, color:s.c});
    });

    /* כותרת קטנה בתוך הגרף */
    const lbl = mode==='inN' ? 'ספקטרום הכניסה'
              : mode==='outN' ? 'אחרי הגברה'
              : mode==='inF' ? 'אחרי המסנן'
              : 'אחרי הגברה';
    p.text(lbl + ' · סכמטי', p.X0, 15, {rtl:true, align:'left', font:'800 18px '+HFONT, color:'#64748b'});
    p.text('עוצמה', p.X0+2, p.Y0+16, {rtl:true, align:'left', font:'700 15px '+HFONT, color:'#94a3b8'});
    p.text('תדר [MHz]', p.X1, p.Y1+15, {rtl:true, align:'right', font:'600 16px '+HFONT, color:'#94a3b8'});
  }

  function draw(){
    spec(R1,'inN'); spec(R2,'outN');
    spec(L1,'inF'); spec(L2,'outF');
  }

  /* הציור חוזר על עצמו כשהעמודה נחשפת (מ-0px לרוחב מלא) */
  if (window.ResizeObserver){
    const ro = new ResizeObserver(function(){ requestAnimationFrame(draw); });
    [R1,R2,L1,L2].forEach(function(cv){ if (cv && cv.parentElement) ro.observe(cv.parentElement); });
    root.__ro = ro;
  }
  draw();
  return {draw};
};

/* =========================================================
   שקף 08 · תדר ביניים קבוע — אותה שרשרת, תחנה אחרת
   RF (מימין) ← חץ המרה ← IF (משמאל). מסנן ה-IF לא זז.
   ========================================================= */
L7.sims.ifsame = function(root){
  const RF = C(root,'rfsp'), IFC = C(root,'ifsp');
  const STN = [
    {f:88.9,a:0.55},{f:91.8,a:0.78},{f:94.2,a:0.44},{f:97.6,a:0.62},
    {f:98.1,a:0.96},{f:100.4,a:0.50},{f:103.5,a:0.72},{f:106.7,a:0.38}
  ];
  const picks = [98.1, 103.5];
  let sel = 0;
  const FIF = 10.7, BW = 0.2;          /* רוחב מסנן לדוגמה, MHz */

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }

  function draw(){
    const f0 = picks[sel];
    [RF,IFC].forEach(size);

    /* ---------- ספקטרום RF ---------- */
    if (RF){
      const p = L7.P(RF,{xm:87,xM:109,ym:0,yM:1.46,pad:{t:56,r:30,b:52,l:30}});
      p.grid(11,3);
      p.ctx.fillStyle='rgba(6,182,212,.05)';
      p.ctx.fillRect(p.X(88), p.Y0, p.X(108)-p.X(88), p.Y1-p.Y0);

      STN.forEach(function(s){
        const on = Math.abs(s.f - f0) < 0.01;
        const col = on ? '#dc2626' : '#94a3b8';
        p.curve(f=>Math.min(s.a*Math.exp(-Math.pow((f-s.f)/0.20,2)), 1.24),
          {color:col, w:on?5:3, n:180});
        const k = STN.indexOf(s);
        p.text(s.f.toFixed(1), p.X(s.f), p.Y1 + 22 + (k%2)*22,
          {align:'center', font:(on?'800 20px ':'600 17px ')+MFONT, color: on?'#b91c1c':'#94a3b8'});
      });
      p.text('ספקטרום RF · כל התחנות', p.X1, 20,
        {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#0e7490'});
      p.text('תדר [MHz]', p.X0, p.Y1+62,
        {rtl:true, align:'left', font:'700 15px '+HFONT, color:'#64748b'});
      const onS = STN.find(function(s){ return Math.abs(s.f-f0)<0.01; });
      p.text('התחנה הנבחרת', p.X(onS.f), p.Y(Math.min(onS.a,1.30))-22,
        {align:'center', font:'800 17px '+HFONT, color:'#b91c1c'});
    }

    /* ---------- ספקטרום IF ---------- */
    if (IFC){
      const q = L7.P(IFC,{xm:10.35,xM:11.05,ym:0,yM:1.46,pad:{t:46,r:30,b:76,l:30}});
      q.grid(7,3);

      /* חלון המסנן — קבוע, לא זז בין התחנות */
      q.ctx.fillStyle='rgba(5,150,105,.15)';
      q.ctx.fillRect(q.X(FIF-BW/2), q.Y0, q.X(FIF+BW/2)-q.X(FIF-BW/2), q.Y1-q.Y0);
      q.ctx.strokeStyle='#059669'; q.ctx.lineWidth=2.4; q.ctx.setLineDash([7,6]);
      [FIF-BW/2, FIF+BW/2].forEach(function(v){
        q.ctx.beginPath(); q.ctx.moveTo(q.X(v),q.Y0); q.ctx.lineTo(q.X(v),q.Y1); q.ctx.stroke();
      });
      q.ctx.setLineDash([]);

      /* תחנה אחת בלבד — תמיד ב-10.7 */
      q.curve(f=>Math.min(0.94*Math.exp(-Math.pow((f-FIF)/0.035,2)), 1.24),
        {color:'#dc2626', w:5.5, n:220});
      q.text('10.7', q.X(FIF), q.Y1+22,
        {align:'center', font:'800 20px '+MFONT, color:'#0f172a'});
      q.text('ספקטרום IF · תחנה אחת', q.X1, 20,
        {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#047857'});
      q.text('תדר [MHz]', q.X0, q.Y1+40,
        {rtl:true, align:'left', font:'700 15px '+HFONT, color:'#64748b'});
      q.text('מסנן IF קבוע', q.X(FIF), q.Y1+52,
        {align:'center', font:'800 18px '+HFONT, color:'#047857'});
    }

    setO(root,'fsel', f0.toFixed(1)+' MHz');
    const el = O(root,'st');
    if (el) el.textContent = 'אותה שרשרת, תחנה אחרת — מסנן ה־IF נשאר במקומו ב־10.7 MHz';
  }

  root.querySelectorAll('[data-stn]').forEach(function(b){
    b.addEventListener('click', function(){
      sel = picks.indexOf(+b.dataset.stn);
      if (sel < 0) sel = 0;
      root.querySelectorAll('[data-stn]').forEach(function(x){ x.setAttribute('aria-pressed', String(x===b)); });
      draw();
    });
  });
  const rs = root.querySelector('[data-reset]');
  if (rs) rs.addEventListener('click', function(){
    sel = 0;
    root.querySelectorAll('[data-stn]').forEach(function(x){ x.setAttribute('aria-pressed', String(+x.dataset.stn===picks[0])); });
    draw();
  });
  if (window.ResizeObserver){
    [RF,IFC].forEach(function(cv){ if (cv && cv.parentElement) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(cv.parentElement); });
  }
  draw();
  return {draw};
};

/* =========================================================
   שקף 10 · ערבל — שני תוצרים, תוויות גדולות ובלי חפיפה
   ========================================================= */
L7.sims.mixer2 = function(root){
  const A = C(root,'mspec'), B = C(root,'mout');
  const D = {rf:98.1, lo:108.8};

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }

  function draw(){
    const s = st(root,D);
    const rf = s.rf, lo = s.lo;
    const dif = Math.abs(lo-rf), sum = rf+lo;
    [A,B].forEach(size);

    /* ---------- ספקטרום הכניסה ---------- */
    if (A){
      const p = L7.P(A,{xm:80,xM:230,ym:0,yM:1.34,pad:{t:64,r:96,b:50,l:96}});
      p.grid(15,3);
      const marks = [
        {f:rf,  t:'f_RF '+rf.toFixed(1), c:'#0891b2'},
        {f:lo,  t:'f_LO '+lo.toFixed(1), c:'#7c3aed'}
      ];
      marks.forEach(function(m, i){
        p.vline(m.f,{color:m.c, w:4.5});
        const lx = Math.min(Math.max(p.X(m.f), p.X0+80), p.X1-80);
        p.text(m.t, lx, i ? 44 : 24, {align:'center', font:'800 24px '+HFONT, color:m.c});
      });
      /* מרחק הערבול */
      const x1=p.X(Math.min(rf,lo)), x2=p.X(Math.max(rf,lo)), yy=p.Y(0.24);
      p.ctx.strokeStyle='#059669'; p.ctx.lineWidth=3.5;
      p.ctx.beginPath(); p.ctx.moveTo(x1,yy); p.ctx.lineTo(x2,yy); p.ctx.stroke();
      [x1,x2].forEach(function(x){ p.ctx.beginPath(); p.ctx.arc(x,yy,6,0,7); p.ctx.fillStyle='#059669'; p.ctx.fill(); });
      p.text('הפרש '+(lo-rf).toFixed(1), (x1+x2)/2, p.Y(0.42),
        {align:'center', font:'800 22px '+HFONT, color:'#047857'});
      p.text('ספקטרום הכניסה לערבל', p.X1, 20,
        {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#0e7490'});
      p.text('תדר [MHz]', p.X1, p.Y1+30, {rtl:true, align:'right', font:'700 16px '+HFONT, color:'#64748b'});
    }

    /* ---------- תוצרי הערבול ---------- */
    if (B){
      const q = L7.P(B,{xm:0,xM:230,ym:0,yM:1.34,pad:{t:64,r:96,b:78,l:96}});
      q.grid(15,3);

      /* חלון מסנן IF — בתחתית, לא ליד תוויות התוצרים */
      q.ctx.fillStyle='rgba(5,150,105,.14)';
      q.ctx.fillRect(q.X(dif-0.9), q.Y0, q.X(dif+0.9)-q.X(dif-0.9), q.Y1-q.Y0);
      q.text('חלון מסנן IF', Math.min(Math.max(q.X(dif), q.X0+90), q.X1-90), q.Y1+40,
        {align:'center', font:'800 17px '+HFONT, color:'#047857'});

      [{v:dif,t:'הפרש '+dif.toFixed(1),c:'#059669',h:1.16,dy:-24},
       {v:sum,t:'סכום '+sum.toFixed(1),c:'#64748b',h:0.74,dy:-24}].forEach(function(m){
        q.curve(f=>Math.min(m.h*Math.exp(-Math.pow((f-m.v)/1.5,2)), 1.24),
          {color:m.c, w:5, n:420});
        const lx = Math.min(Math.max(q.X(m.v), q.X0+92), q.X1-92);
        q.text(m.t, lx, q.Y(m.h)+m.dy,
          {align:'center', font:'800 24px '+HFONT, color:m.c});
      });
      q.text('תוצרי הערבול', q.X1, 20,
        {rtl:true, align:'right', font:'800 21px '+HFONT, color:'#0e7490'});
      q.text('תדר [MHz]', q.X1, q.Y1+30, {rtl:true, align:'right', font:'700 16px '+HFONT, color:'#64748b'});
    }

    setO(root,'rf', rf.toFixed(1)+' MHz');
    setO(root,'lo', lo.toFixed(1)+' MHz');
    setO(root,'dif', dif.toFixed(1)+' MHz');
    setO(root,'sum', sum.toFixed(1)+' MHz');
    const el = O(root,'st');
    if (el){
      const ok = Math.abs(dif-10.7) < 0.35;
      el.textContent = ok ? 'ההפרש נופל על 10.7 MHz — מסנן ה־IF יבחר בו'
                          : 'ההפרש רחוק מ־10.7 MHz — הכוונון אינו מדויק';
      el.className = 'status ' + (ok ? '' : 'warn');
    }
  }
  if (window.ResizeObserver){
    [A,B].forEach(function(cv){ if (cv && cv.parentElement) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(cv.parentElement); });
  }
  ranges(root,draw); draw();
  return {draw};
};


/* =========================================================
   שקף 11 · המסנן בוחר את ההפרש
   מימין: חלון ה-IF סביב 10.7. משמאל: תוצר הסכום שנדחה.
   ========================================================= */
L7.sims.ifsel2 = function(root){
  const A = C(root,'ifz'), B = C(root,'ifsum');
  const D = {bw:200, off:0};
  const FIF = 10.7, FSUM = 206.9;

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }

  function draw(){
    const s = st(root,D);
    const half = s.bw/2000;                 /* MHz */
    const fc = FIF + s.off/1000;            /* מרכז האות לאחר היסט */
    [A,B].forEach(size);

    /* ---------- אזור ה-IF ---------- */
    if (A){
      const p = L7.P(A,{xm:FIF-1.1, xM:FIF+1.1, ym:0, yM:1.30, pad:{t:48,r:96,b:54,l:96}});
      p.grid(11,3);

      /* חלון המסנן */
      const lo = FIF-half, hi = FIF+half;
      p.ctx.fillStyle='rgba(5,150,105,.16)';
      p.ctx.fillRect(p.X(lo), p.Y0, p.X(hi)-p.X(lo), p.Y1-p.Y0);
      p.ctx.strokeStyle='#059669'; p.ctx.lineWidth=2.6; p.ctx.setLineDash([8,6]);
      [lo,hi].forEach(function(v){
        p.ctx.beginPath(); p.ctx.moveTo(p.X(v),p.Y0); p.ctx.lineTo(p.X(v),p.Y1); p.ctx.stroke();
      });
      p.ctx.setLineDash([]);

      /* עקומת תגובת המסנן */
      p.curve(f=>1.14/(1+Math.pow(Math.abs(f-FIF)/Math.max(half,0.006),6)),
        {color:'#059669', w:4, n:900, dash:[9,6]});

      /* תוצר ההפרש — ספקטרום האות */
      p.curve(f=>Math.min(0.80*Math.exp(-Math.pow((f-fc)/0.075,2)), 1.24),
        {color:'#7c3aed', w:5.5, n:520});

      p.text('חלון המסנן', p.X(FIF), 22,
        {align:'center', font:'800 20px '+HFONT, color:'#047857'});
      p.text('10.7 MHz', p.X(FIF), p.Y1+26,
        {align:'center', font:'800 20px '+MFONT, color:'#0f172a'});
      p.text('תוצר ההפרש', p.X(fc), p.Y0+18,
        {align:'center', font:'800 21px '+HFONT, color:'#6d28d9'});
      p.text('תדר [MHz]', p.X1, p.Y1+50, {rtl:true, align:'right', font:'700 15px '+HFONT, color:'#64748b'});
    }

    /* ---------- תוצר הסכום שנדחה ---------- */
    if (B){
      const q = L7.P(B,{xm:0,xM:10,ym:0,yM:1.30,pad:{t:48,r:26,b:54,l:26}});
      q.grid(4,3);

      /* פסילה ברורה */
      q.curve(f=>Math.min(0.62*Math.exp(-Math.pow((f-5)/0.75,2)), 1.24),
        {color:'#cbd5e1', w:5, n:300});
      q.ctx.strokeStyle='#dc2626'; q.ctx.lineWidth=5; q.ctx.lineCap='round';
      q.ctx.beginPath();
      q.ctx.moveTo(q.X(4.0), q.Y(0.30)); q.ctx.lineTo(q.X(6.0), q.Y(0.92));
      q.ctx.moveTo(q.X(4.0), q.Y(0.92)); q.ctx.lineTo(q.X(6.0), q.Y(0.30));
      q.ctx.stroke(); q.ctx.lineCap='butt';

      q.text('תוצר הסכום', q.X(5), 22, {align:'center', font:'800 19px '+HFONT, color:'#94a3b8'});
      q.text('206.9 MHz', q.X(5), q.Y1+26, {align:'center', font:'800 19px '+MFONT, color:'#94a3b8'});
      q.text('נדחה', q.X(5), q.Y(1.10), {align:'center', font:'800 19px '+HFONT, color:'#b91c1c'});
    }

    setO(root,'bw', s.bw+' kHz');
    setO(root,'off', (s.off>0?'+':'')+s.off+' kHz');
    const el = O(root,'st');
    if (el){
      const inWin = Math.abs(s.off) <= s.bw/2;
      el.textContent = inWin
        ? 'האות בתוך חלון המסנן — עובר, והמידע נשמר'
        : 'חלק מהאות מחוץ לחלון — נחלש ומתעוות, אבל עדיין FM';
      el.className = 'status ' + (inWin ? '' : 'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   שקף 12 · הזרקה גבוהה מול נמוכה — אותו IF
   ========================================================= */
L7.sims.inject2 = function(root){
  const cv = C(root,'inj2');
  let high = true;
  const RF = 98.1, FIF = 10.7;
  const XM = 82, XX = 116;

  function size(c){
    if (!c) return;
    const box = c.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    c.style.width='100%'; c.style.height='100%';
    const w = Math.round(c.clientWidth), h = Math.round(c.clientHeight);
    if (w>20 && h>20 && (c.width!==w || c.height!==h)){ c.width=w; c.height=h; }
  }

  function draw(){
    const lo = high ? RF+FIF : RF-FIF;
    size(cv);
    const p = L7.P(cv,{xm:XM,xM:XX,ym:0,yM:1.34,pad:{t:60,r:40,b:62,l:40}});
    p.grid(17,3);

    const rows = [
      {f:RF, t:'f_RF '+RF.toFixed(1), c:'#0891b2', y:0.30},
      {f:lo, t:'f_LO '+lo.toFixed(1), c:'#7c3aed', y:0.30}
    ];
    rows.forEach(function(m, i){
      p.vline(m.f,{color:m.c, w:5});
      p.ctx.fillStyle=m.c; p.ctx.beginPath(); p.ctx.arc(p.X(m.f), p.Y(m.y), 9, 0, 7); p.ctx.fill();
      const lx = Math.min(Math.max(p.X(m.f), p.X0+90), p.X1-90);
      p.text(m.t, lx, i? 48 : 24, {align:'center', font:'800 26px '+HFONT, color:m.c});
    });

    /* חץ ההפרש בין שני הסמנים */
    const x1 = p.X(Math.min(RF,lo)), x2 = p.X(Math.max(RF,lo)), yy = p.Y(0.62);
    p.ctx.strokeStyle='#059669'; p.ctx.lineWidth=4;
    p.ctx.beginPath(); p.ctx.moveTo(x1,yy); p.ctx.lineTo(x2,yy); p.ctx.stroke();
    p.ctx.beginPath(); p.ctx.arc(x1,yy,7,0,7); p.ctx.fillStyle='#059669'; p.ctx.fill();
    p.ctx.beginPath(); p.ctx.arc(x2,yy,7,0,7); p.ctx.fill();
    p.text('10.7 MHz', (x1+x2)/2, p.Y(0.62)-26,
      {align:'center', font:'800 26px '+HFONT, color:'#047857'});

    /* היחידה בשורה נפרדת מתחת למספרים — שלא תידרס על ידי 115 */
    [85,90,95,100,105,110,115].forEach(function(v){
      p.text(v, p.X(v), p.Y1+26, {align:'center', font:MFONT, color:'#94a3b8'});
    });
    p.text('תדר [MHz]', (p.X0+p.X1)/2, p.Y1+52,
      {rtl:true, align:'center', font:'700 16px '+HFONT, color:'#64748b'});

    setO(root,'rf', RF.toFixed(1)+' MHz');
    setO(root,'lo', lo.toFixed(1)+' MHz');
    setO(root,'iff', (Math.abs(lo-RF)).toFixed(1)+' MHz');
    setO(root,'mode', high ? 'גבוהה' : 'נמוכה');
    setO(root,'fml', high ? 'f_LO = f_RF + f_IF' : 'f_LO = f_RF − f_IF');
  }

  root.querySelectorAll('[data-inj2]').forEach(function(b){
    b.addEventListener('click', function(){
      high = b.dataset.inj2 === 'high';
      root.querySelectorAll('[data-inj2]').forEach(function(x){ x.setAttribute('aria-pressed', String(x===b)); });
      draw();
    });
  });
  const rs = root.querySelector('[data-reset]');
  if (rs) rs.addEventListener('click', function(){
    high = true;
    root.querySelectorAll('[data-inj2]').forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.inj2==='high')); });
    draw();
  });
  if (window.ResizeObserver && cv && cv.parentElement){
    new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(cv.parentElement);
  }
  draw();
  return {draw};
};

/* =========================================================
   שקף 14→13 · שינינו את תדר הנושא — האם המידע השתנה?
   שני גרפי תדר רגעי, אותה סטייה, תדרי מרכז שונים.
   ========================================================= */
L7.sims.shift = function(root){
  const R = C(root,'shfR'), L = C(root,'shfL');
  if (!R || !L) return {draw:function(){}};

  const FM = 0.5;              /* תדר אות המידע */
  const T  = 5;                /* חלון זמן, s */
  const DF = 75;               /* סטייה מרבית, kHz */
  const F_RF = 98.1, F_LO = 108.8, F_IF = 10.7;   /* MHz */

  /* m(t) מנורמל −1..+1 */
  const mOf = t => Math.sin(2*Math.PI*FM*t);

  /* f_RF(t) = f_c,RF + Δf·m(t)             [kHz סביב 98.1]
     f_IF(t) = f_LO − f_RF(t) = f_c,IF − Δf·m(t)
     ⇒ סטיית ה-IF היא −Δf·m(t). ההיפוך נובע מהחיסור, ולא מהיפוך
       גרפי: זה אותו ביטוי, עם הסימן שיוצא מההפרש. */
  const devRF = t => DF*mOf(t);
  const devIF = t => (F_LO*1000 - (F_RF*1000 + devRF(t))) - F_IF*1000;

  function size(c){
    if (!c) return;
    const box = c.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    c.style.width='100%'; c.style.height='100%';
    const w = Math.round(c.clientWidth), h = Math.round(c.clientHeight);
    if (w>20 && h>20 && (c.width!==w || c.height!==h)){ c.width=w; c.height=h; }
  }

  function plot(cv, center, fn, label, color, side){
    if (!cv) return null;
    size(cv);
    const p = L7.P(cv,{xm:0,xM:T,ym:-108,yM:108,pad:{t:56,r:34,b:46,l:74}});
    p.grid(5,2);
    p.hline(0,{color:'#cbd5e1',w:2.4,dash:[7,6]});
    p.curve(fn,{color:color,w:4.4,n:640});

    p.text(label, p.X0, 18, {rtl:true, align:'left', font:'800 21px '+HFONT, color:color});
    p.text(center.toFixed(1)+' MHz', p.X1, 18,
      {rtl:true, align:'right', font:'800 24px '+HFONT, color:'#0f172a'});
    p.text('+75', p.X0-8, p.Y(DF), {align:'right', font:MFONT, color:'#94a3b8'});
    p.text('−75', p.X0-8, p.Y(-DF), {align:'right', font:MFONT, color:'#94a3b8'});
    p.text('סטייה [kHz]', p.X0-58, p.Y0+8,
      {rtl:true, align:'left', font:'700 15px '+HFONT, color:'#64748b'});
    p.text('זמן [s]', p.X1, p.Y1+30,
      {rtl:true, align:'right', font:'700 15px '+HFONT, color:'#64748b'});
    return p;
  }

  function draw(){
    const pR = plot(R, F_RF, devRF, 'אות RF · לפני ההמרה', '#dc2626', 'rf');
    const pL = plot(L, F_IF, devIF, 'אות IF · אחרי ההמרה', '#7c3aed', 'if');

    /* סימון תואם באותו רגע זמן — מראה +75 מול −75 */
    const tMark = 0.5;                        /* רבע מחזור של 0.5 Hz: m(t) = +1 */
    const vR = devRF(tMark), vL = devIF(tMark);

    if (pR){
      pR.ctx.strokeStyle='#0f172a'; pR.ctx.lineWidth=2; pR.ctx.setLineDash([5,5]);
      pR.ctx.beginPath(); pR.ctx.moveTo(pR.X(tMark),pR.Y0); pR.ctx.lineTo(pR.X(tMark),pR.Y1); pR.ctx.stroke();
      pR.ctx.setLineDash([]);
      pR.ctx.fillStyle='#dc2626';
      pR.ctx.beginPath(); pR.ctx.arc(pR.X(tMark), pR.Y(vR), 8, 0, 7); pR.ctx.fill();
      pR.ctx.strokeStyle='#fff'; pR.ctx.lineWidth=2.5;
      pR.ctx.beginPath(); pR.ctx.arc(pR.X(tMark), pR.Y(vR), 8, 0, 7); pR.ctx.stroke();
      pR.text((vR>0?'+':'')+vR.toFixed(0)+' kHz', pR.X(tMark)+13, pR.Y(vR)-13,
        {align:'left', font:'800 19px '+MFONT, color:'#b91c1c'});
    }
    if (pL){
      pL.ctx.strokeStyle='#0f172a'; pL.ctx.lineWidth=2; pL.ctx.setLineDash([5,5]);
      pL.ctx.beginPath(); pL.ctx.moveTo(pL.X(tMark),pL.Y0); pL.ctx.lineTo(pL.X(tMark),pL.Y1); pL.ctx.stroke();
      pL.ctx.setLineDash([]);
      pL.ctx.fillStyle='#7c3aed';
      pL.ctx.beginPath(); pL.ctx.arc(pL.X(tMark), pL.Y(vL), 8, 0, 7); pL.ctx.fill();
      pL.ctx.strokeStyle='#fff'; pL.ctx.lineWidth=2.5;
      pL.ctx.beginPath(); pL.ctx.arc(pL.X(tMark), pL.Y(vL), 8, 0, 7); pL.ctx.stroke();
      pL.text((vL>0?'+':'')+vL.toFixed(0)+' kHz', pL.X(tMark)+13, pL.Y(vL)+20,
        {align:'left', font:'800 19px '+MFONT, color:'#6d28d9'});
    }
  }

  if (window.ResizeObserver){
    [R,L].forEach(function(c){
      if (c && c.parentElement) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(c.parentElement);
    });
  }
  draw();
  return {draw};
};

/* =========================================================
   שקף 15→14 · רוחב מסנן IF — ציר כסטייה מתדר המרכז
   ========================================================= */
L7.sims.bwfilter2 = function(root){
  const cv = C(root,'bw2');
  const D = {bw:200, off:0};
  const SIG = 180;      /* רוחב האות בדוגמה, kHz */

  function size(c){
    if (!c) return;
    const box = c.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    c.style.width='100%'; c.style.height='100%';
    const w = Math.round(c.clientWidth), h = Math.round(c.clientHeight);
    if (w>20 && h>20 && (c.width!==w || c.height!==h)){ c.width=w; c.height=h; }
  }

  function draw(){
    const s = st(root,D);
    const half = s.bw/2;
    const center = s.off;              /* סטייה של האות מהמרכז, kHz */
    size(cv);

    const p = L7.P(cv,{xm:-400,xM:400,ym:0,yM:1.30,pad:{t:74,r:36,b:56,l:36}});
    p.grid(8,3);

    /* חלון המסנן */
    const lo = -half, hi = half;
    p.ctx.fillStyle='rgba(5,150,105,.15)';
    p.ctx.fillRect(p.X(lo), p.Y0, p.X(hi)-p.X(lo), p.Y1-p.Y0);
    p.ctx.strokeStyle='#059669'; p.ctx.lineWidth=2.6; p.ctx.setLineDash([8,6]);
    [lo,hi].forEach(function(v){
      p.ctx.beginPath(); p.ctx.moveTo(p.X(v),p.Y0); p.ctx.lineTo(p.X(v),p.Y1); p.ctx.stroke();
    });
    p.ctx.setLineDash([]);

    /* תגובת המסנן */
    p.curve(f=>1/(1+Math.pow(Math.abs(f)/Math.max(half,10),6)),
      {color:'#059669', w:4, n:900});

    /* ספקטרום האות — רוחב 180 kHz סביב center */
    p.curve(f=>Math.min(0.86*Math.exp(-Math.pow((f-center)/(SIG*0.30),2)), 1.24),
      {color:'#7c3aed', w:5.5, n:520});

    p.vline(0,{color:'#0f172a', w:2, dash:[5,6]});
    /* "10.7 MHz" מעל העקומה, "0" על הציר — כדי שלא יידרסו בידי 200- */
    p.text('10.7 MHz', p.X(0), p.Y0+20,
      {align:'center', font:'800 18px '+HFONT, color:'#0f172a'});
    p.text('0', p.X(0), p.Y1+26, {align:'center', font:'800 19px '+MFONT, color:'#0f172a'});
    [ -400,-200,200,400 ].forEach(function(v){
      p.text((v>0?'+':'')+v, p.X(v), p.Y1+26,
        {align:'center', font:MFONT, color:'#94a3b8'});
    });
    p.text('סטייה מתדר המרכז [kHz]', p.X1, p.Y1+50,
      {rtl:true, align:'right', font:'700 15px '+HFONT, color:'#64748b'});

    /* מקרא */
    p.text('ספקטרום האות', p.X0+8, 22, {rtl:true, align:'left', font:'800 17px '+HFONT, color:'#6d28d9'});
    p.text('תגובת המסנן', p.X0+190, 22, {rtl:true, align:'left', font:'800 17px '+HFONT, color:'#047857'});

    setO(root,'bw', s.bw+' kHz');
    setO(root,'off', (s.off>0?'+':'')+s.off+' kHz');
    const el = O(root,'st');
    if (el){
      const sigHalf = SIG/2;
      const tooNarrow = s.bw < SIG;   /* צר מהאות עצמו */
      const tooWide = s.bw > 320;
      /* "לא ממורכז" נבדק לפי ההיסט בלבד, מול המרווח שנשאר אחרי שהאות נכנס.
         אם המסנן עצמו צר מהאות — זו לא בעיית מירכוז, וזו הבדיקה שגוברת. */
      const margin = Math.max(0, half - sigHalf);
      const misaligned = Math.abs(s.off) > margin;
      if (tooNarrow)      { el.textContent='המסנן צר מהאות — נחתך ומתעוות'; el.className='status warn'; }
      else if (misaligned){ el.textContent='המסנן אינו ממורכז לאות — חלק ממנו נחתך'; el.className='status warn'; }
      else if (tooWide)   { el.textContent='המסנן רחב מדי — מעביר גם שכנים ורעש'; el.className='status warn'; }
      else                { el.textContent='רוחב מתאים — האות עובר בשלמותו'; el.className='status'; }
    }
  }
  ranges(root,draw); draw();
  return {draw};
};


/* =========================================================
   שקף 18 (מאוחד) · המגבל — שלושה גרפים, שלושה מחוונים
   ========================================================= */
L7.sims.lim3 = function(root){
  const A = C(root,'l3a'), B = C(root,'l3b'), Cc = C(root,'l3c');
  const D = {level:80, noise:45, lim:55};
  const T = 5;

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }
  /* המעטפת: רמת האות כפול הפרעת המשרעת */
  function env(t, lv, nz){
    return lv * (1 - nz*0.58 + nz*0.58*Math.sin(2*Math.PI*0.85*t + 0.7));
  }
  function carrier(t){ return Math.cos(2*Math.PI*4.5*t + 1.0*Math.sin(2*Math.PI*0.5*t)); }

  function draw(){
    const s = st(root,D);
    const lv = s.level/100, nz = s.noise/100, vl = s.lim/100;
    [A,B,Cc].forEach(size);

    /* ---- 1 · לפני המגבל ---- */
    if (A){
      const p = L7.P(A,{xm:0,xM:T,ym:-1.5,yM:1.5,pad:{t:34,r:28,b:26,l:28}});
      p.grid(5,2); p.hline(0,{color:'#e2e8f0',w:2});
      p.curve(t=>1.34*env(t,lv,nz),{color:'#f59e0b',w:2, dash:[6,5], n:400});
      p.curve(t=>-1.34*env(t,lv,nz),{color:'#f59e0b',w:2, dash:[6,5], n:400});
      p.curve(t=>env(t,lv,nz)*carrier(t),{color:'#0891b2',w:2.8,n:2400});
      p.text('לפני המגבל · המשרעת משתנה', p.X0, 16, {rtl:true, align:'left', font:'800 19px '+HFONT, color:'#0e7490'});
    }

    /* ---- 2 · פעולת ההגבלה ---- */
    if (B){
      const q = L7.P(B,{xm:0,xM:T,ym:-1.5,yM:1.5,pad:{t:34,r:28,b:26,l:28}});
      q.grid(5,2); q.hline(0,{color:'#e2e8f0',w:2});
      [1,-1].forEach(function(sg){
        q.ctx.strokeStyle='#dc2626'; q.ctx.lineWidth=2.4; q.ctx.setLineDash([8,6]);
        q.ctx.beginPath(); q.ctx.moveTo(q.X0, q.Y(sg*vl)); q.ctx.lineTo(q.X1, q.Y(sg*vl)); q.ctx.stroke();
        q.ctx.setLineDash([]);
        q.text((sg>0?'+':'−')+'V_lim', q.X1-4, q.Y(sg*vl)-14,
          {rtl:true, align:'right', font:'800 15px '+HFONT, color:'#b91c1c'});
      });
      q.curve(t=>{
        const raw = env(t,lv,nz)*carrier(t);
        const L = vl;
        return Math.max(-L, Math.min(L, raw));
      },{color:'#d97706',w:2.8,n:2400});
      q.text('הגבלה · האות נחתך בסף', q.X0, 16, {rtl:true, align:'left', font:'800 19px '+HFONT, color:'#9a3412'});
    }

    /* ---- 3 · אחרי המגבל ---- */
    if (Cc){
      const r = L7.P(Cc,{xm:0,xM:T,ym:-1.5,yM:1.5,pad:{t:34,r:28,b:34,l:28}});
      r.grid(5,2); r.hline(0,{color:'#e2e8f0',w:2});
      /* אחרי קיטום + סינון: משרעת כמעט קבועה */
      const amp = Math.min(vl*1.05, lv*1.05);
      r.curve(t=>amp*carrier(t),{color:'#059669',w:2.8,n:2400});
      r.text('אחרי המגבל · משרעת כמעט קבועה', r.X0, 16,
        {rtl:true, align:'left', font:'800 19px '+HFONT, color:'#047857'});
      r.text('זמן [s]', r.X1, r.Y1+20, {rtl:true, align:'right', font:'600 14px '+HFONT, color:'#94a3b8'});
    }

    setO(root,'level', s.level+'%');
    setO(root,'noise', s.noise+'%');
    setO(root,'lim', s.lim+'%');

    /* המשוב מחושב משני קצוות המעטפת, ולא מהשיא בלבד.
       הגבלה מלאה מתקיימת רק אם גם השוקת — ולא רק השיא — עוברת את הסף.
       אחרת האות נקטם לסירוגין, וזה עדיין לא "מוגבל בהצלחה". */
    const envMax = lv*(1 + nz*0.58);
    const envMin = lv*(1 - nz*0.58);
    const el = O(root,'st');
    if (el){
      if (envMin >= vl){
        el.textContent = 'האות כולו מעל הסף — הגבלה מלאה. שינויי המשרעת מצטמצמים, והמידע בשינויי התדר נשמר בקירוב.';
        el.className = 'status';
      } else if (envMax >= vl){
        el.textContent = 'רק שיאי האות עוברים את הסף — הגבלה חלקית. השוקת אינה נקטמת, ולכן חלק מהפרעת המשרעת נשאר.';
        el.className = 'status warn';
      } else {
        el.textContent = 'האות כולו מתחת לסף — המגבל אינו פועל. הפרעות המשרעת עוברות כמו שהן.';
        el.className = 'status warn';
      }
    }
  }
  if (window.ResizeObserver){
    [A,B,Cc].forEach(function(c){ if (c && c.parentElement) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(c.parentElement); });
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   שקף 21 · AM — שלושה גרפים ברוחב זהה
   ========================================================= */
L7.sims.amlim3 = function(root){
  const G = [C(root,'amA'), C(root,'amB'), C(root,'amC')];
  let on = false;
  const T = 4;

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }
  const m = t => 0.34 + 0.66*(0.5+0.5*Math.cos(2*Math.PI*1.05*t));
  const car = t => Math.cos(2*Math.PI*5*t);

  function draw(){
    G.forEach(size);
    const meta = [
      {title:'אות AM מקורי · המידע במעטפת', color:'#1d4ed8'},
      {title:'לאחר המגבל · המעטפת נחתכת', color:'#d97706'},
      {title:'אות המידע המקורי · להשוואה', color:'#7c3aed'}
    ];
    G.forEach(function(cv, i){
      if (!cv) return;
      const p = L7.P(cv,{xm:0,xM:T,ym:-1.28,yM:1.28,pad:{t:36,r:28,b:i===2?34:20,l:28}});
      p.grid(4,2); p.hline(0,{color:'#e2e8f0',w:2});
      if (i===2){
        p.curve(t=>m(t)*1.12,{color:'#7c3aed',w:4,n:500});
      } else {
        p.curve(t=>m(t)*1.06,{color:'#94a3b8',w:1.8,dash:[6,6],n:500});
        p.curve(t=>-m(t)*1.06,{color:'#94a3b8',w:1.8,dash:[6,6],n:500});
        if (i===0){
          p.curve(t=>m(t)*car(t),{color:'#1d4ed8',w:2.6,n:2200});
        } else {
          const L = 0.62;
          p.curve(t=>{
            const raw = m(t)*car(t);
            return on ? Math.max(-L, Math.min(L, raw)) : raw;
          },{color: on?'#d97706':'#1d4ed8', w:2.6, n:2200});
        }
      }
      p.text(meta[i].title, p.X0, 16, {rtl:true, align:'left', font:'800 19px '+HFONT, color:meta[i].color});
      if (i===2) p.text('זמן [s]', p.X1, p.Y1+18, {rtl:true, align:'right', font:'600 14px '+HFONT, color:'#94a3b8'});
    });
    setO(root,'mode', on ? 'מגבל פעיל' : 'מגבל כבוי');
  }
  const b = root.querySelector('[data-limtoggle]');
  if (b) b.addEventListener('click', function(){
    on = !on; b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'חזרה למצב ההתחלתי' : 'הפעלת המגבל';
    draw();
  });
  if (window.ResizeObserver){
    G.forEach(function(c){ if (c && c.parentElement) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(c.parentElement); });
  }
  draw();
  return {draw};
};

/* =========================================================
   שקף 25 (מאוחד) · גלאי שיפוע — שלושה שלבים
   ========================================================= */
L7.sims.slope3 = function(root){
  const R = C(root,'slR'), E = C(root,'slE'), DC = C(root,'slD');
  const D = {det:6, pos:40};
  const FIF = 10.7, FC = 10.85;  /* f0 של המעגל ≠ 10.7 */

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }
  const H = (f)=>{ const Q = D.det*1.5; const x = Math.abs(f-FC)/0.42; return 1/Math.sqrt(1+Q*Q*x*x); };

  function draw(){
    const s = st(root,D);
    const Q = s.det*1.5;
    [R,E,DC].forEach(size);

    /* ---- 1 · עקומת התהודה ---- */
    if (R){
      const p = L7.P(R,{xm:9.6,xM:11.6,ym:0,yM:1.18,pad:{t:40,r:30,b:44,l:30}});
      p.grid(8,3);
      p.curve(f=>H(f),{color:'#0e7490',w:4.5,n:900});
      p.vline(FC,{color:'#0e7490',w:2,dash:[6,6]});
      p.vline(FIF,{color:'#db2777',w:2.6,dash:[6,6]});
      p.ctx.fillStyle='#ed9a17'; p.ctx.beginPath();
      p.ctx.arc(p.X(FIF+s.pos/1000), p.Y(H(FIF+s.pos/1000)), 9, 0, 7); p.ctx.fill();
      p.text('f0 = '+FC.toFixed(2)+' MHz', p.X(FC), 18,
        {align:'center', font:'800 17px '+HFONT, color:'#0e7490'});
      p.text('f_IF = 10.70 MHz', p.X(FIF), p.Y1+32,
        {align:'center', font:'800 17px '+HFONT, color:'#be185d'});
      p.text('מעגל תהודה · f0 ≠ f_IF', p.X0, 18,
        {rtl:true, align:'left', font:'800 18px '+HFONT, color:'#0e7490'});
      p.text('תדר [MHz]', p.X1, p.Y1+32, {rtl:true, align:'right', font:'600 14px '+HFONT, color:'#94a3b8'});
    }

    /* ---- 2 · מעטפת ---- */
    if (E){
      const p = L7.P(E,{xm:0,xM:5,ym:-1.3,yM:1.3,pad:{t:38,r:30,b:24,l:30}});
      p.grid(5,2); p.hline(0,{color:'#e2e8f0',w:2});
      const c0 = FIF + s.pos/1000;
      p.curve(t=>{
        const dev = 0.055*Math.sin(2*Math.PI*0.9*t);
        const amp = H(c0+dev);
        return amp*Math.cos(2*Math.PI*4.5*t);
      },{color:'#0891b2',w:2.6,n:2200});
      p.curve(t=>H(c0+0.055*Math.sin(2*Math.PI*0.9*t)),{color:'#f59e0b',w:2.2,dash:[6,5],n:400});
      p.curve(t=>-H(c0+0.055*Math.sin(2*Math.PI*0.9*t)),{color:'#f59e0b',w:2.2,dash:[6,5],n:400});
      p.text('גלאי מעטפת · משרעת משתנה', p.X0, 18,
        {rtl:true, align:'left', font:'800 18px '+HFONT, color:'#0e7490'});
    }

    /* ---- 3 · הסרת DC ---- */
    if (DC){
      const p = L7.P(DC,{xm:0,xM:5,ym:-2.2,yM:3.4,pad:{t:38,r:30,b:34,l:30}});
      p.grid(5,3);
      const c0 = FIF + s.pos/1000;
      const wa = t => H(c0+0.055*Math.sin(2*Math.PI*0.9*t));
      p.hline(2,{color:'#94a3b8',w:2,dash:[7,6]});
      p.hline(0,{color:'#cbd5e1',w:2});
      p.curve(t=>2 + (wa(t)-0.75)*1.5,{color:'#db2777',w:3,n:500});
      p.curve(t=>(wa(t)-0.75)*1.5,{color:'#059669',w:3.4,n:500});
      p.text('2 V · לפני הסרת DC', p.X1, p.Y(2)-16,
        {rtl:true, align:'right', font:'800 16px '+HFONT, color:'#be185d'});
      p.text('אחרי הסרת DC · סביב 0 V', p.X0, 18,
        {rtl:true, align:'left', font:'800 18px '+HFONT, color:'#047857'});
      p.text('מתח [V] · זמן [s]', p.X1, p.Y1+20,
        {rtl:true, align:'right', font:'600 14px '+HFONT, color:'#94a3b8'});
    }

    setO(root,'det', s.det+'');
    setO(root,'pos', (s.pos>0?'+':'')+s.pos+' kHz');
    /* נקודת העבודה היא f_IF + pos/1000, והשיא נמצא ב-FC.
       לכן המרחק מהשיא הוא |(FIF + pos/1000) − FC|, ולא |pos|.
       עם FIF=10.70 ו-FC=10.85 השיא מתקבל ב-pos=+150 kHz. */
    const el = O(root,'st');
    if (el){
      const atPeak = Math.abs((FIF + s.pos/1000) - FC) * 1000;   // kHz from peak
      const slopeSign = s.pos < 150 ? 'חיובי' : 'שלילי';
      if (atPeak < 25)      el.textContent='על שיא התהודה — השיפוע אפס, ולכן אין גילוי כלל';
      else if (atPeak > 260) el.textContent='הרחק מהשיא — המשרעת נמוכה, המרה לא ליניארית ועיוות';
      else el.textContent='על השיפוע ('+slopeSign+') — המרה כמעט ליניארית, רק בסביבת נקודה זו';
      el.className = 'status ' + (atPeak<25||atPeak>260 ? 'warn' : '');
    }
  }
  if (window.ResizeObserver){
    [R,E,DC].forEach(function(c){ if (c && c.parentElement) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(c.parentElement); });
  }
  ranges(root,draw); draw();
  return {draw};
};


/* =========================================================
   שקף 36 (מאוחד) · איך בנוי גלאי PLL — לחיצה על רכיב
   ========================================================= */
L7.sims.pllmap = function(root){
  const PARTS = {
    in:   {t:'אות FM', d:'האות הנקלט מהמגבל נכנס למשווה המופע כאחת משתי הכניסות. השנייה מגיעה מה־VCO.'},
    pd:   {t:'משווה מופע', d:'משווה את מופע אות הכניסה למופע אות ה־VCO. כאשר קיים הפרש ביניהם, מתקבל אות שגיאה המשמש לתיקון.'},
    lpf:  {t:'מסנן LPF', d:'מסנן רכיבים מהירים ולא רצויים מאות השגיאה ומייצר מתח בקרה מתאים להפעלת ה־VCO.'},
    vco:  {t:'מתנד VCO', d:'מתנד שהתדר שלו נקבע באמצעות מתח הבקרה. כאשר מתח הבקרה משתנה, גם תדר המתנד משתנה.'},
    out:  {t:'מוצא השמע', d:'מתח הבקרה כולל רכיב קבוע ורכיב משתנה. לאחר הסרת הרכיב הקבוע נשאר אות השמע.'},
    fb:   {t:'משוב', d:'אות ה־VCO חוזר למשווה המופע. כך המערכת בודקת כל הזמן את ההתאמה ומתקנת את תדר המתנד.'}
  };
  const ORDER = ['in','pd','lpf','vco','out','fb'];
  const FLOW = {in:['in'], pd:['in','err'], lpf:['err'], vco:['ctrl'], out:['ctrl'], fb:['fbpath']};

  function paint(r){
    const key = PARTS[r.dataset.sel] ? r.dataset.sel : 'pd';
    const allParts = r.querySelectorAll('[data-part]');
    for (let a = 0; a < allParts.length; a++) allParts[a].classList.remove('on');
    for (let b = 0; b < allParts.length; b++){
      if (allParts[b].dataset.part === key) allParts[b].classList.add('on');
    }
    const want = FLOW[key] || [];
    r.querySelectorAll('[data-flow]').forEach(function(el){
      el.classList.toggle('on', want.indexOf(el.dataset.flow) >= 0);
    });
    const t = r.querySelector('[data-o="pt"]');
    const d = r.querySelector('[data-o="pd"]');
    if (t) t.textContent = PARTS[key].t;
    if (d) d.textContent = PARTS[key].d;
  }

  function init(r){
    if (!r.dataset.sel) r.dataset.sel = 'in';
    paint(r);
  }

  /* מאזין אחד על document, עם delegation — ולא מאזין לכל בלוק.
     המנוע קורא ל-initSims ואחר כך ל-drawSims, ולכן מאזינים
     שנקשרו ישירות לבלוקים נמחקים כשהתוכן נבנה מחדש. */
  if (!L7.__pllmapBound){
    L7.__pllmapBound = true;
    document.addEventListener('click', function(e){
      const r = e.target.closest ? e.target.closest('.pllm') : null;
      if (!r) return;
      const part = e.target.closest('[data-part]');
      if (part && PARTS[part.dataset.part]){ r.dataset.sel = part.dataset.part; paint(r); return; }
      if (e.target.closest('[data-nextpart]')){
        const i = ORDER.indexOf(r.dataset.sel);
        r.dataset.sel = ORDER[(i + 1) % ORDER.length]; paint(r); return;
      }
      if (e.target.closest('[data-reset]')){ r.dataset.sel = 'in'; paint(r); }
    });
  }

  init(root);
  return {draw:function(){ init(root); }};
};

/* =========================================================
   שקף 37 · איך PLL מגיע לנעילה — שלושה מצבים
   ========================================================= */
/* =========================================================
   שקף 23 · איך PLL מגיע לנעילה — שלושה מצבים
   מודל זמן רציף ועקבי: מתח בקרה ← תדר VCO ← שגיאת תדר ← הפרש מופע.
   אין פתרון משוואות חוג; זה מודל לימודי עם קשרים עקביים.
   ========================================================= */
L7.sims.lock3 = function(root){
  const A = C(root,'lkA'), B = C(root,'lkB');
  if (!A || !B) return {draw:function(){}};

  const D = {state: 0};
  const T = 4;              /* חלון זמן, s */
  const F_IN = 4.0;         /* תדר הכניסה, מחזורים/s (חזותי) */
  const N = 1400;           /* דגימות */

  /* ---- שלושת המצבים ----
     dF0   — שגיאת התדר ההתחלתית [מחזורים/s]
     tau   — קבוע זמן של סגירת הלולאה [s]; Infinity = לא מתכנס
     ripple— אמפליטודת האדווה במתח הבקרה (ביטוי האפנון ב-FM)
     ph0   — הפרש המופע הבסיסי במצב נעול [rad]  (קטן, אך לא אפס)
     amp   — אמפליטודת מתח הבקרה הכוללת, ליחידות יחסיות */
  const M = [
    { dF0: 0.62, tau: Infinity, ripple: 0.00, ph0: 0,    amp: 1.00 },
    { dF0: 0.62, tau: 1.15,     ripple: 0.09, ph0: 0.22, amp: 1.00 },
    { dF0: 0.00, tau: 0.28,     ripple: 0.10, ph0: 0.42, amp: 1.00 }
  ];

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }

  /* שגיאת התדר כפונקציה של הזמן. במצב 1 היא קבועה (אין תיקון);
     במצב 2 ו-3 היא דועכת אקספוננציאלית — בלי קפיצה לנעילה. */
  function errAt(t, m){
    if (!isFinite(m.tau)) return m.dF0;
    return m.dF0 * Math.exp(-t / m.tau);
  }

  /* מתח הבקרה: ערך התחלתי נמוך, שעולה לערך העבודה בקצב שנקבע
     ע"י קבוע הזמן של הלולאה. אין תלות בשגיאת התדר ההתחלתית —
     אחרת מצב נעילה (dF0=0) היה נשאר on 0.18 במקום להתייצב.
     האדוות מדמות את אפנון ה-FM בכניסה, ולכן מופיעות רק
     כשהלולאה כבר עוקבת. */
  function ctrlAt(t, m){
    if (!isFinite(m.tau)){
      /* מצב 1 — הלולאה סגורה אך אינה מתכנסת: מתח הבקרה נמוך,
         אינו בערך העבודה, ומתנודד קלות עם שגיאת התדר. */
      return 0.34 + 0.055 * Math.sin(2*Math.PI*0.62*t) - 0.012*Math.sin(2*Math.PI*1.9*t);
    }
    const settle = 1 - Math.exp(-t / m.tau);
    const base = 0.22 + 0.58 * settle;                    /* 0.22 → 0.80 */
    const ripple = m.ripple * settle * Math.sin(2*Math.PI*0.9*t);
    const v = m.amp * (base + ripple);
    return Math.max(0.02, Math.min(1.00, v));
  }

  /* הפרש המופע הוא האינטגרל של שגיאת התדר — ולכן כשהשגיאה אינה
     אפס, הפרש המופע גדל בלי גבול והגלים מחליקים זה על זה.
     כשהשגיאה דועכת, הפרש המופע מתייצב על ph0. */
  function phaseAt(t, m){
    const tau = m.tau;
    if (!isFinite(tau)) return m.ph0 + 2*Math.PI*m.dF0*t;
    /* ∫ dF0·e^(-τ/tau) dτ = dF0·tau·(1 - e^(-t/tau)) */
    return m.ph0 + 2*Math.PI*m.dF0*tau*(1 - Math.exp(-t/tau));
  }

  function draw(){
    const s = st(root,D);
    const mi = Math.max(0, Math.min(2, s.state|0));
    const m = M[mi];
    [A,B].forEach(size);

    const tEnd = T;

    /* ---- גרף 1 · אות הכניסה מול אות ה-VCO ---- */
    if (A){
      const p = L7.P(A,{xm:0,xM:tEnd,ym:-1.28,yM:1.28,pad:{t:44,r:30,b:28,l:30}});
      p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});

      /* כניסה — FM מאופנן קלות, תדר בסיס F_IN */
      p.curve(t=>0.86*Math.cos(2*Math.PI*F_IN*t + 0.42*Math.sin(2*Math.PI*0.9*t)),
        {color:'#0891b2', w:3.0, n:2200});

      /* VCO — תדר = F_IN − err/… ; המופע מתקבל מהאינטגרל, ולכן
         הפרש המופע בין השניים הוא מה שרואים בפועל */
      p.curve(t=>{
        const ph = 2*Math.PI*F_IN*t + 0.42*Math.sin(2*Math.PI*0.9*t) + phaseAt(t,m);
        return 0.86*Math.cos(ph);
      }, {color:'#7c3aed', w:2.4, dash:[8,5], n:2200});

      p.text('כניסה · FM', p.X0, 18, {rtl:true, align:'left', font:'800 18px '+HFONT, color:'#0e7490'});
      p.text('VCO', p.X0+132, 18, {rtl:true, align:'left', font:'800 18px '+HFONT, color:'#6d28d9'});
      p.text('זמן [s]', p.X1, p.Y1+22, {rtl:true, align:'right', font:'600 14px '+HFONT, color:'#94a3b8'});
    }

    /* ---- גרף 2 · מתח הבקרה ---- */
    if (B){
      const q = L7.P(B,{xm:0,xM:tEnd,ym:0,yM:1.05,pad:{t:44,r:30,b:32,l:30}});
      q.grid(6,2);
      q.curve(t=>ctrlAt(t,m), {color:'#db2777', w:3.2, n:900});
      q.hline(0.80,{color:'#94a3b8', w:2, dash:[6,6]});
      q.text('מתח בקרה', q.X0, 18, {rtl:true, align:'left', font:'800 18px '+HFONT, color:'#be185d'});
      q.text('ערך העבודה', q.X0+6, q.Y(0.80)-12, {rtl:true, align:'left', font:'700 14px '+HFONT, color:'#94a3b8'});
      q.text('זמן [s]', q.X1, q.Y1+22, {rtl:true, align:'right', font:'600 14px '+HFONT, color:'#94a3b8'});
    }

    setO(root,'mode', mi===0?'לפני נעילה':(mi===1?'תהליך התאמה':'נעילה'));

    /* קריאות מספריות */
    const eEnd = errAt(tEnd, m);
    const phEnd = phaseAt(tEnd, m);
    setO(root,'fe', eEnd < 0.005 ? 'אפס' : eEnd.toFixed(3) + ' מחז׳/s');
    const turns = phEnd / (2*Math.PI);
    /* במצב נעול הפרש המופע קבוע — מציגים מעלות. במצב לא נעול
       הוא גדל ללא גבול, ולכן מציגים כמה מחזורים עבר. */
    if (isFinite(m.tau) && m.dF0 === 0){
      setO(root,'ph', 'קבוע · ' + (phEnd*180/Math.PI).toFixed(0) + '°');
    } else if (turns >= 1){
      setO(root,'ph', 'גדל · ' + turns.toFixed(1) + ' מחזורים');
    } else {
      setO(root,'ph', 'גדל · ' + (phEnd*180/Math.PI).toFixed(0) + '°');
    }

    const el = O(root,'st');
    if (el){
      el.textContent = mi===0
        ? 'תדר המתנד המקומי שונה מתדר הכניסה. משווה המופע מזהה הפרש משתנה, ומערכת המשוב מתחילה לתקן את מתח הבקרה.'
        : (mi===1
            ? 'מתח הבקרה משנה את תדר ה־VCO. ככל שהתדרים מתקרבים, המערכת מתקדמת לעבר מצב נעילה.'
            : 'ה־VCO עוקב אחר תדר הכניסה, והפרש המופע נשאר קבוע עבור אות בתדר קבוע. כאשר אות הכניסה מאופנן FM, מתח הבקרה משתנה בהתאם לאפנון.');
      el.className = 'lk3-guide';
    }
  }

  if (!root.__lock3bound){
    root.__lock3bound = true;
    root.querySelectorAll('[data-lk]').forEach(function(b){
      b.addEventListener('click', function(){
        D.state = +b.dataset.lk;
        root.querySelectorAll('[data-lk]').forEach(function(x){
          x.setAttribute('aria-pressed', String(x === b));
        });
        draw();
      });
    });
    const rs = root.querySelector('[data-reset]');
    if (rs) rs.addEventListener('click', function(){
      D.state = 0;
      root.querySelectorAll('[data-lk]').forEach(function(x){
        x.setAttribute('aria-pressed', String(x.dataset.lk === '0'));
      });
      draw();
    });
  }

  if (window.ResizeObserver){
    [A,B].forEach(function(c){
      if (c && c.parentElement) new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(c.parentElement);
    });
  }
  draw();
  return {draw};
};

/* =========================================================
   שקף 38 · איך PLL משחזר את אות השמע — שלושה גרפים
   ========================================================= */
L7.sims.pllaudio = function(root){
  const G1 = C(root,'paF'), G2 = C(root,'paC'), G3 = C(root,'paA');
  const D = {dev:55};
  const FM = 0.5, T = 5, DF = 75;

  function size(cv){
    if (!cv) return;
    const box = cv.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    cv.style.width='100%'; cv.style.height='100%';
    const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
    if (w>20 && h>20 && (cv.width!==w || cv.height!==h)){ cv.width=w; cv.height=h; }
  }

  function draw(){
    const s = st(root,D), d = s.dev/100;
    [G1,G2,G3].forEach(size);

    /* 1 · תדר רגעי של הכניסה */
    if (G1){
      const p = L7.P(G1,{xm:0,xM:T,ym:-105,yM:105,pad:{t:40,r:30,b:26,l:62}});
      p.grid(5,2); p.hline(0,{color:'#cbd5e1',w:2,dash:[6,6]});
      p.curve(t=>DF*d*Math.sin(2*Math.PI*FM*t),{color:'#0891b2',w:3.6,n:640});
      p.text('שינויי תדר הכניסה', p.X1, 18, {rtl:true, align:'right', font:'800 19px '+HFONT, color:'#0e7490'});
      p.text('±'+(DF*d).toFixed(0)+' kHz', p.X1, 40, {rtl:true, align:'right', font:'800 17px '+MFONT, color:'#0f172a'});
      p.text('+75', p.X0-8, p.Y(DF), {align:'right', font:MFONT, color:'#94a3b8'});
      p.text('−75', p.X0-8, p.Y(-DF), {align:'right', font:MFONT, color:'#94a3b8'});
    }

    /* 2 · מתח הבקרה — עוקב אחרי התדר */
    if (G2){
      const q = L7.P(G2,{xm:0,xM:T,ym:0,yM:1.55,pad:{t:40,r:30,b:26,l:62}});
      q.grid(5,3);
      q.curve(t=>0.78 + 0.62*d*Math.sin(2*Math.PI*FM*t),{color:'#db2777',w:3.6,n:640});
      q.hline(0.78,{color:'#94a3b8',w:2,dash:[6,6]});
      q.text('מתח בקרה', q.X1, 18, {rtl:true, align:'right', font:'800 19px '+HFONT, color:'#be185d'});
      q.text('רכיב קבוע', q.X1, 40, {rtl:true, align:'right', font:'700 15px '+HFONT, color:'#94a3b8'});
      q.text('0 V', q.X0-8, q.Y(0)+2, {align:'right', font:MFONT, color:'#94a3b8'});
    }

    /* 3 · אות השמע — אחרי הסרת DC */
    if (G3){
      const r = L7.P(G3,{xm:0,xM:T,ym:-1.05,yM:1.05,pad:{t:40,r:30,b:34,l:62}});
      r.grid(5,2); r.hline(0,{color:'#cbd5e1',w:2.4});
      r.curve(t=>0.62*d*Math.sin(2*Math.PI*FM*t),{color:'#059669',w:3.8,n:640});
      r.text('אות השמע המשוחזר', r.X1, 18, {rtl:true, align:'right', font:'800 19px '+HFONT, color:'#047857'});
      r.text('זמן [s]', r.X1, r.Y1+20, {rtl:true, align:'right', font:'600 14px '+HFONT, color:'#94a3b8'});
    }

    setO(root,'dev', s.dev+'%');
    const el = O(root,'st');
    if (el){
      el.textContent = d < 0.05
        ? 'ללא שינויי תדר אין מתח בקרה משתנה — ולכן אין שמע.'
        : 'שינויי התדר גורמים לשינויי מתח הבקרה, ומהם מתקבל אות השמע.';
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   שקף 43 (מאוחד) · AFC — תיקון תדר אוטומטי
   ========================================================= */
L7.sims.afc2 = function(root){
  const cv = C(root,'afcv');
  const D = {drift:80, on:1};
  const FIF = 10.7;

  function size(c){
    if (!c) return;
    const box = c.parentElement;
    if (box){ box.style.padding='0'; box.style.minHeight='0'; }
    c.style.width='100%'; c.style.height='100%';
    const w = Math.round(c.clientWidth), h = Math.round(c.clientHeight);
    if (w>20 && h>20 && (c.width!==w || c.height!==h)){ c.width=w; c.height=h; }
  }

  function draw(){
    const s = st(root,D);
    const onEl = root.querySelector('input[data-k="on"]');
    const on = onEl ? onEl.checked : true;
    size(cv);

    /* בהזרקה גבוהה: Δf_IF = +Δf_LO. תיקון = היפוך. */
    const residual = on ? 0 : s.drift;
    const p = L7.P(cv,{xm:-260,xM:260,ym:0,yM:1.30,pad:{t:52,r:34,b:74,l:34}});
    p.grid(13,3);

    /* חלון המסנן */
    p.ctx.fillStyle='rgba(5,150,105,.15)';
    p.ctx.fillRect(p.X(-100), p.Y0, p.X(100)-p.X(-100), p.Y1-p.Y0);
    p.ctx.strokeStyle='#059669'; p.ctx.lineWidth=2.4; p.ctx.setLineDash([7,5]);
    [-100,100].forEach(function(v){
      p.ctx.beginPath(); p.ctx.moveTo(p.X(v),p.Y0); p.ctx.lineTo(p.X(v),p.Y1); p.ctx.stroke();
    });
    p.ctx.setLineDash([]);
    p.curve(f=>Math.min(0.92*Math.exp(-Math.pow((f-residual)/34,2)),1.24),
      {color:'#dc2626',w:5,n:400});

    p.vline(0,{color:'#0f172a',w:2,dash:[5,6]});
    p.text('10.7 MHz', p.X(0), p.Y0+18, {align:'center', font:'800 17px '+HFONT, color:'#0f172a'});
    p.text('חלון מסנן IF', p.X(0), p.Y1+30, {align:'center', font:'800 16px '+HFONT, color:'#047857'});
    [-200,-100,100,200].forEach(function(v){
      p.text((v>0?'+':'')+v, p.X(v), p.Y1+30, {align:'center', font:MFONT, color:'#94a3b8'});
    });
    p.text('סטיית IF [kHz]', p.X1, p.Y1+50, {rtl:true, align:'right', font:'700 15px '+HFONT, color:'#64748b'});

    setO(root,'drift', (s.drift>0?'+':'')+s.drift+' kHz');
    setO(root,'res', (residual>0?'+':'')+residual+' kHz');
    setO(root,'lo', (108.8 - (on? s.drift/1000 : 0)).toFixed(3)+' MHz');
    const el = O(root,'st');
    if (el){
      el.textContent = !on
        ? 'AFC כבוי — סטיית ה־IF נשארת כפי שהיא'
        : 'AFC זיהה את הסטייה ותיקן את תדר ה־LO — מודל אידיאלי, ללא השהיה';
      el.className = 'status ' + (on ? '' : 'warn');
    }
  }
  root.querySelectorAll('input[type=checkbox],input[type=range]').forEach(function(i){
    i.addEventListener('input', draw);
  });
  const rs = root.querySelector('[data-reset]');
  if (rs) rs.addEventListener('click', function(){
    const r = root.querySelector('[data-k="drift"]'); if (r){ r.value = 80; }
    const c = root.querySelector('input[data-k="on"]'); if (c){ c.checked = true; }
    draw();
  });
  if (window.ResizeObserver && cv && cv.parentElement){
    new ResizeObserver(function(){ requestAnimationFrame(draw); }).observe(cv.parentElement);
  }
  draw();
  return {draw};
};


})();
