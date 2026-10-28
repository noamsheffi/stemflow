/* =========================================================
   שיעור 07 · סימולטורים — מקטעים ה׳–ח׳
   PLL · AFC · רעש והשוואה
   ========================================================= */
(function(){
const L7 = window.L7 = window.L7 || {};
L7.sims = L7.sims || {};

const HFONT = '"Heebo","Segoe UI","Noto Sans Hebrew",Arial,sans-serif';
const MFONT = '600 28px ui-monospace,SFMono-Regular,Consolas,monospace';
const num=L7.num, st=L7.st, setO=L7.setO, C=L7.C, ranges=L7.ranges;
const O=(root,k)=>root.querySelector('[data-o="'+k+'"]');

/* =========================================================
   13 · מערכת משוב — שגיאה שמתקטנת
   ========================================================= */
L7.sims.feedback = function(root){
  const cv = C(root,'fb');
  const D = {gain:6};
  function draw(){
    const s = st(root,D);
    const k = s.gain/10;                 // 0.1 … 1.4
    const p = L7.P(cv,{xm:0,xM:5,ym:0,yM:1.12,pad:{t:34,r:28,b:48,l:40}});
    p.grid(5,3);
    // שגיאה מתחילה באתחול ומתכנסת בהתאם ל"הגבר" של התיקון
    p.curve(t=>Math.exp(-k*2.2*t), {color:'#dc2626', w:4.5, n:600});
    p.curve(t=>t<0.28?1:Math.exp(-k*2.2*(t-0.28)), {color:'#7c3aed', w:3, n:600, dash:[9,7]});
    p.text('ללא תיקון · השגיאה נשארת', p.X(3.5), p.Y(0.94), {align:'center',font:'800 21px '+HFONT, color:'#6d28d9'});
    p.text('עם משוב · השגיאה מתקטנת', p.X(3.6), p.Y(0.10)+4, {align:'center',font:'800 21px '+HFONT, color:'#991b1b'});
    p.text('זמן →', p.X1-4, p.Y1+24, {align:'right', font:MFONT, color:'#94a3b8'});
    p.text('גודל השגיאה', 6, 22, {rtl:true, font:'800 21px '+HFONT, color:'#334155'});
    setO(root,'gain', (k).toFixed(2));
    const tc = (1/(k*2.2));
    setO(root,'tc', tc.toFixed(2)+' s');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   14 · שני אותות לפני נעילה
   ========================================================= */
L7.sims.prelock = function(root){
  const cv = C(root,'pr');
  const D = {df:0.9};
  function draw(){
    const s = st(root,D);
    const p = L7.P(cv,{xm:0,xM:6,ym:-1.6,yM:1.6,pad:{t:32,r:26,b:42,l:44}});
    p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
    p.curve(t=>Math.cos(2*Math.PI*4.2*t), {color:'#0891b2', w:3.4, n:1600});
    p.curve(t=>Math.cos(2*Math.PI*(4.2+s.df)*t), {color:'#7c3aed', w:3.4, n:1600});
    p.text('אות הכניסה (FM)', 8, 20, {rtl:true,font:'800 21px '+HFONT, color:'#0e7490'});
    p.text('אות ה־VCO', 8, p.Y1-16, {rtl:true,font:'800 21px '+HFONT, color:'#6d28d9'});
    setO(root,'df', (s.df*10).toFixed(0)+'%');
    const el=O(root,'st');
    if(el){
      el.textContent = Math.abs(s.df)<0.06 ? 'התדרים שווים — הפער היחיד הוא מופע'
        : 'התדרים שונים — הפער גדל וקטן מחזורית';
      el.className='status '+(Math.abs(s.df)<0.06?'':'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   15 · משווה מופע — פלט תלוי בהפרש מופע
   ========================================================= */
L7.sims.phasedet = function(root){
  const A = C(root,'in'), B = C(root,'out');
  const D = {phi:60};
  function draw(){
    const s = st(root,D);
    const ph = s.phi/180*Math.PI;
    function w(cv, showOut, top){
      const p = L7.P(cv,{xm:0,xM:4,ym:-1.65,yM:1.65,pad:{t:30,r:24,b:36,l:42}});
      p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
      if(showOut){
        p.curve(t=>{
          const a = Math.cos(2*Math.PI*5*t), b = Math.cos(2*Math.PI*5*t+ph);
          return Math.sign(a-b)*Math.abs(a-b)*0.9;
        }, {color:'#d97706', w:3.2, n:2000});
        p.text('פלט המשווה · פרופורציונלי להפרש המופע', 8, 20, {rtl:true,font:'800 21px '+HFONT, color:'#b45309'});
      } else {
        p.curve(t=>Math.cos(2*Math.PI*5*t), {color:'#0891b2', w:3.2, n:1200});
        p.curve(t=>Math.cos(2*Math.PI*5*t+ph), {color:'#7c3aed', w:3.2, n:1200});
        p.text('אות FM', 8, 20, {rtl:true,font:'800 21px '+HFONT, color:'#0e7490'});
        p.text('אות VCO', 8, p.Y1-16, {rtl:true,font:'800 21px '+HFONT, color:'#6d28d9'});
      }
    }
    w(A,false); w(B,true);
    setO(root,'phi', s.phi+'°');
    setO(root,'vd', (Math.sin(ph)*100).toFixed(0)+'%');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   16 · LPF — אות שגיאה לפני ואחרי
   ========================================================= */
L7.sims.lpf = function(root){
  const A = C(root,'raw'), B = C(root,'filt');
  const D = {fc:0.9};
  function draw(){
    const s = st(root,D);
    const alpha = Math.min(1, s.fc/4.2);
    function w(cv, filt){
      const p = L7.P(cv,{xm:0,xM:4,ym:-1.7,yM:1.7,pad:{t:30,r:24,b:36,l:42}});
      p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
      let y = 0;
      p.curve(t=>{
        const carrier = Math.cos(2*Math.PI*22*t)*0.55;
        const msg = 0.65*Math.cos(2*Math.PI*0.8*t);
        const raw = carrier + msg;
        return filt ? msg*1.25 : raw;
      }, {color: filt?'#059669':'#d97706', w:3.2, n:2400});
      p.text(filt?'מתח בקרה · מהיר חלק':'אות שגיאה גלי', 8, 20, {rtl:true,font:'800 21px '+HFONT, color:filt?'#047857':'#b45309'});
    }
    w(A,false); w(B,true);
    setO(root,'fc', s.fc.toFixed(1)+' kHz');
    const el=O(root,'st');
    if(el){
      el.textContent = s.fc<1.1 ? 'חיתוך נמוך — מתח בקרה חלק, תגובה איטית' : (s.fc>2.6 ? 'חיתוך גבוה — עוקב מהר, אבל רוחש' : 'איזון: מתח בקרה חלק ועוקב');
      el.className='status '+(s.fc>2.6?'warn':'');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   17 · VCO — f מול Vctr l
   ========================================================= */
L7.sims.vco = function(root){
  const A = C(root,'vco');
  const D = {v:2, kv:6, ff:10};
  function draw(){
    const s = st(root,D);
    const p = L7.P(A,{xm:0,xM:5,ym:s.ff-2,yM:s.ff+s.kv*5+2,pad:{t:34,r:28,b:48,l:52}});
    p.grid(5,4);
    p.curve(v=>s.ff+s.kv*v,{color:'#7c3aed',w:5,n:2});
    p.vline(s.v,{color:'#059669',w:2.5,dash:[7,6]});
    p.hline(s.ff+s.kv*s.v,{color:'#059669',w:2.5,dash:[7,6]});
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.ctx.arc(p.X(s.v),p.Y(s.ff+s.kv*s.v),10,0,7); p.ctx.fill();
    p.text('V_ctrl', p.X(s.v), p.Y1+24, {align:'center', font:MFONT, color:'#047857'});
    [0,1,2,3,4,5].forEach(v=>p.text(String(v), p.X(v), p.Y1+24, {align:'center', font:MFONT, color:'#94a3b8'}));
    p.text('V [volt]', p.X(5), p.Y1+42, {align:'right', font:MFONT, color:'#94a3b8'});
    p.text('f [MHz]', 6, 20, {rtl:true, font:'800 20px '+HFONT, color:'#6d28d9'});
    // שיפוע K_VCO
    p.ctx.strokeStyle='#f59e0b'; p.ctx.lineWidth=3;
    p.ctx.beginPath(); p.ctx.moveTo(p.X(1),p.Y(s.ff+s.kv)); p.ctx.lineTo(p.X(2),p.Y(s.ff+s.kv));
    p.ctx.lineTo(p.X(2),p.Y(s.ff+2*s.kv)); p.ctx.stroke();
    p.text('K_VCO', p.X(2)+10, p.Y(s.ff+s.kv*1.5), {font:'800 22px '+HFONT, color:'#b45309'});
    setO(root,'v', s.v.toFixed(1)+' V');
    setO(root,'f', (s.ff+s.kv*s.v).toFixed(2)+' MHz');
    setO(root,'kv', s.kv.toFixed(1)+' MHz/V');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   18 · סגירת החוג — ארבעה בלוקים
   ========================================================= */
L7.sims.loopclose = function(root){
  const A = C(root,'err');
  const D = {df:0.55};
  function draw(){
    const s = st(root,D);
    const p = L7.P(A,{xm:0,xM:6,ym:-1,yM:1.05,pad:{t:32,r:26,b:44,l:42}});
    p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
    p.curve(t=>Math.exp(-1.6*t)*Math.cos(2*Math.PI*(2.4+s.df)*t), {color:'#dc2626', w:3.4, n:1800});
    p.text('שגיאת המופע לאורך זמן', 8, 20, {rtl:true,font:'800 21px '+HFONT, color:'#991b1b'});
    p.text('זמן →', p.X1-4, p.Y1+24, {align:'right', font:MFONT, color:'#94a3b8'});
    setO(root,'df', (s.df*10).toFixed(0)+'%');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   19 · PLL — נעילה, עקיבה וגילוי
   ========================================================= */
L7.sims.pll = function(root){
  const A = C(root,'pll');
  const D = {dev:30, k:40};
  function draw(){
    const s = st(root,D);
    const dev = s.dev/100;
    const lockRange = s.k/100;              // טווח העקיבה במודל
    const locked = dev <= lockRange;
    const T = 8;
    const p = L7.P(A,{xm:0,xM:T,ym:-1.9,yM:1.9,pad:{t:32,r:26,b:44,l:54}});
    p.grid(8,4);
    const rows=[
      {y:1.34, n:'f_in(t)',  c:'#0891b2'},
      {y:0.45, n:'f_VCO(t)', c:'#7c3aed'},
      {y:-0.45,n:'שגיאה',    c:'#dc2626'},
      {y:-1.34,n:'V_ctrl(t)',c:'#059669'}
    ];
    rows.forEach(function(r){
      p.hline(r.y,{color:'#f1f5f9',w:2});
      p.text(r.n, 6, p.Y(r.y)-40, {rtl:true, font:'800 20px '+HFONT, color:r.c});
    });
    const sig = t => dev*Math.sin(2*Math.PI*0.62*t);
    p.curve(t=>1.34+sig(t)*1.05, {color:'#0891b2',w:3,n:900});
    p.curve(t=>0.45+(locked?sig(t)*1.05:Math.max(-lockRange,Math.min(lockRange,sig(t)))*1.05), {color:'#7c3aed',w:3,n:900});
    p.curve(t=>-0.45+(locked?0:(sig(t)-Math.max(-lockRange,Math.min(lockRange,sig(t))))*1.6), {color:'#dc2626',w:3,n:900});
    p.curve(t=>-1.34+(locked?sig(t)*1.05:Math.max(-lockRange,Math.min(lockRange,sig(t)))*1.05), {color:'#059669',w:3,n:900});
    const el=O(root,'st');
    if(el){
      el.textContent = locked ? 'בתוך טווח העקיבה: ה־VCO עוקב, והשגיאה נשארת קטנה'
                              : 'מחוץ לטווח העקיבה: ה־VCO רווי, השגיאה נשארת, אין נעילה';
      el.className='status '+(locked?'':'warn');
    }
    setO(root,'dev', s.dev+'%');
    setO(root,'k', (s.k/100).toFixed(2));
    setO(root,'mode', locked?'נעילה':'אין נעילה');
    setO(root,'vmax', (locked?s.dev:s.k)+'%');
    const b=O(root,'lockbadge');
    if(b){ b.textContent = locked?'נעול':'אין נעילה'; b.className='ro '+(locked?'ok':'bad'); }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   20 · סחיפת LO — IF זז ביחס למסנן
   ========================================================= */
L7.sims.drift = function(root){
  const A = C(root,'if');
  const D = {d:0};
  function draw(){
    const s = st(root,D);
    const ifa = 10.7 + s.d/1000;
    const p = L7.P(A,{xm:10.35,xM:11.05,ym:0,yM:1.15,pad:{t:34,r:28,b:50,l:40}});
    p.grid(7,3);
    p.band(10.6,10.8,'rgba(5,150,105,.14)');
    p.curve(f=>1/(1+Math.pow((f-10.7)/0.075,8)), {color:'#059669',w:4,n:1000});
    p.vline(10.7,{color:'#059669',w:2,dash:[6,7]});
    p.vline(ifa,{color:'#dc2626',w:4});
    p.text('מסנן IF', p.X(10.7), 22, {align:'center', font:'800 21px '+HFONT, color:'#047857'});
    p.text('סמן IF בפועל · '+(ifa).toFixed(3)+' MHz', p.X(ifa), p.Y(1.0), {align:'center', font:'800 21px '+HFONT, color:'#b91c1c'});
    [10.4,10.6,10.8,11].forEach(v=>p.text(v.toFixed(1), p.X(v), p.Y1+24, {align:'center', font:MFONT, color:'#94a3b8'}));
    setO(root,'d', (s.d>0?'+':'')+s.d+' kHz');
    setO(root,'ifa', ifa.toFixed(3)+' MHz');
    const el=O(root,'st');
    const out = Math.abs(ifa-10.7)>0.1;
    if(el){
      el.textContent = out ? 'IF יצא מחלון המסנן — השמע מתעוות, ולבסוף נקטע' : 'IF במרכז החלון — הקליטה תקינה';
      el.className='status '+(out?'warn':'');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   21 · AFC — תיקון איטי, כולל מקרה שאינו מתוקן
   ========================================================= */
L7.sims.afc = function(root){
  const A = C(root,'afc');
  const D = {d:120, on:1, range:200};
  function draw(){
    const s = st(root,D);
    const onEl = root.querySelector('input[data-k="on"]');
    const on = onEl ? onEl.checked : true;
    const rng = s.range;
    const within = Math.abs(s.d) <= rng;
    const resid = (on && within) ? 0 : s.d;
    const T = 6;
    const p = L7.P(A,{xm:0,xM:T,ym:-rng*1.35,yM:rng*1.35,pad:{t:34,r:28,b:48,l:56}});
    p.grid(6,4); p.hline(0,{color:'#e2e8f0',w:2});
    p.curve(t=>{
      const v = s.d*Math.exp(-2.1*t);
      return on ? (within ? v : v*0.55 + resid*0.45) : s.d;
    }, {color:'#dc2626', w:4, n:800});
    p.hline(rng,{color:'#fca5a5',w:2,dash:[8,7]});
    p.hline(-rng,{color:'#fca5a5',w:2,dash:[8,7]});
    p.text('תחום התיקון של החוג', p.X(T*0.55), p.Y(rng)-16, {align:'center', font:'800 20px '+HFONT, color:'#b91c1c'});
    p.text('שגיאת IF [kHz]', 6, 22, {rtl:true,font:'800 20px '+HFONT, color:'#334155'});
    setO(root,'d',(s.d>0?'+':'')+s.d+' kHz');
    setO(root,'err',(resid>0?'+':'')+resid.toFixed(0)+' kHz');
    setO(root,'lo',(108.8-s.d/1000 + (on&&within? s.d/1000:0)).toFixed(3)+' MHz');
    const el=O(root,'st');
    if(el){
      el.textContent = !on ? 'AFC כבוי — הסחיפה נשארת' : (within ? 'AFC מתקן את הסחיפה לאורך זמן' : 'הסחיפה גדולה מתחום התיקון — AFC לא יאחוז, נדרש כיוון ידני');
      el.className='status '+(on&&within?'':'warn');
    }
  }
  ranges(root,draw);
  root.querySelectorAll('input[type=checkbox],input[type=range]').forEach(i=>i.addEventListener('input',()=>draw()));
  draw();
  return {draw};
};

/* =========================================================
   22 · השוואת AM מול FM — ארבעה מצבים
   ========================================================= */
L7.sims.amfm = function(root){
  const A = C(root,'sig');
  const D = {noise:45};
  let mode = 'fm';       // 'am' | 'fm'
  let lim = false;
  function draw(){
    const s = st(root,D), n = s.noise/100;
    const p = L7.P(A,{xm:0,xM:5,ym:-1.8,yM:1.8,pad:{t:32,r:26,b:42,l:44}});
    p.grid(10,2); p.hline(0,{color:'#e2e8f0',w:2});
    if(mode==='am'){
      p.curve(t=>{
        const m = 0.5+0.5*(1+n*0.9*Math.sin(2*Math.PI*3.1*t));   // הרעש נכנס למשרעת
        const c = m*1.5*Math.cos(2*Math.PI*17*t);
        return lim ? Math.max(-0.85,Math.min(0.85,c)) : c;
      },{color: lim?'#dc2626':'#1d4ed8', w:3.2, n:2400});
    } else {
      p.curve(t=>{
        const ph = 2*Math.PI*17*t + 2.2*Math.sin(2*Math.PI*1.1*t);
        const env = lim ? 1 : (1-n*0.55 + n*0.55*Math.sin(2*Math.PI*3.1*t));
        return env*1.5*Math.cos(ph);
      },{color: lim?'#059669':'#d97706', w:3.2, n:2600});
    }
    p.text(mode==='am'?'AM · המידע במשרעת':'FM · המידע בתדר', 8, 20, {rtl:true,font:'800 22px '+HFONT, color:mode==='am'?'#1d4ed8':'#b45309'});
    setO(root,'noise', s.noise+'%');
    setO(root,'mode', mode.toUpperCase()+(lim?' + מגבל':''));
    const el=O(root,'st');
    if(el){
      if(mode==='am') el.textContent = lim ? 'המגבל מחק את המשרעת — וכך גם את המידע' : 'רעש המשרעת מתמזג ישירות עם המידע';
      else el.textContent = lim ? 'המגבל איפס את המשרעת; המידע בתדר שרד' : 'שינויי המשרעת נראים, אבל המידע עדיין בתדר';
      el.className='status '+(mode==='am'&&lim?'warn':'');
    }
  }
  root.querySelectorAll('[data-mod]').forEach(b=>b.addEventListener('click',()=>{
    mode=b.dataset.mod;
    root.querySelectorAll('[data-mod]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    draw();
  }));
  const lb=root.querySelector('[data-limtog]');
  if(lb) lb.addEventListener('click',()=>{
    lim=!lim;
    lb.setAttribute('aria-pressed',String(lim));
    lb.textContent=lim?'מגבל פעיל':'מגבל כבוי';
    draw();
  });
  ranges(root,draw,function(){
    /* איפוס אמיתי: גם מצב השיטה והמגבל חוזרים לברירת המחדל,
       אחרת המחוון נראה "תקוע" כי במצב מגבל הרעש באמת לא משפיע. */
    mode='fm'; lim=false;
    root.querySelectorAll('[data-mod]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.mod==='fm')));
    if(lb){ lb.setAttribute('aria-pressed','false'); lb.textContent='מגבל כבוי'; }
  });
  draw();
  return {draw};
};

/* =========================================================
   23 · מנוע החישוב של שקף התרגיל
   ========================================================= */
L7.sims.solver = function(root){
  const D = {rf:101.3, fif:10.7};
  function draw(){
    const inch = root.querySelector('input[data-k="rf"]');
    const rf = inch ? +inch.value : D.rf;
    const fif = 10.7;
    const lo = rf+fif;
    const im = rf+2*fif;
    setO(root,'rf', rf.toFixed(1)+' MHz');
    setO(root,'lo', lo.toFixed(1)+' MHz');
    setO(root,'dif', (lo-rf).toFixed(1)+' MHz');
    setO(root,'im', im.toFixed(1)+' MHz');
    setO(root,'imin', im>=88&&im<=108 ? 'בתוך תחום FM' : 'מחוץ לתחום FM');
    const b=O(root,'imbadge'); if(b){ b.className='ro '+(im>=88&&im<=108?'bad':'ok'); }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   24 · V_m = Δf / K_VCO
   ========================================================= */
L7.sims.pllv = function(root){
  const A = C(root,'vm');
  const D = {df:75, kv:50};
  function draw(){
    const s = st(root,D);
    const vm = s.df/s.kv;
    const p = L7.P(A,{xm:0,xM:100,ym:0,yM:4,pad:{t:34,r:28,b:48,l:46}});
    p.grid(5,4);
    p.curve(df=>df/s.kv,{color:'#7c3aed',w:5,n:2});
    p.vline(s.df,{color:'#059669',w:2.5,dash:[7,6]});
    p.hline(vm,{color:'#059669',w:2.5,dash:[7,6]});
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.ctx.arc(p.X(s.df),p.Y(vm),10,0,7); p.ctx.fill();
    p.text('Δf [kHz]', p.X1-6, p.Y1+24, {align:'right', font:MFONT, color:'#94a3b8'});
    [0,25,50,75,100].forEach(v=>p.text(String(v), p.X(v), p.Y1+24, {align:'center', font:MFONT, color:'#94a3b8'}));
    p.text('V_m [V]', 6, 20, {rtl:true, font:MFONT, color:'#6d28d9'});
    setO(root,'df', s.df+' kHz');
    setO(root,'kv', s.kv+' kHz/V');
    setO(root,'vm', vm.toFixed(2)+' V');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   25 · סימולציית מערכת: אות אחד לאורך השרשרת
   ========================================================= */
L7.sims.system = function(root){
  const A = C(root,'sys');
  const D = {rf:101.3, fm:1.0, df:75};
  function draw(){
    const s = st(root,D);
    const fif=10.7, lo=s.rf+fif, im=s.rf+2*fif;
    setO(root,'lo', lo.toFixed(1)+' MHz');
    setO(root,'im', im.toFixed(1)+' MHz');
    setO(root,'imok', im>108?'מחוץ לתחום':'בתוך התחום');
    setO(root,'bw', (2*(s.df/1000+s.fm)).toFixed(3)+' MHz');
    const p = L7.P(A,{xm:0,xM:6,ym:-1.9,yM:1.9,pad:{t:32,r:26,b:40,l:48}});
    p.grid(6,4);
    const stages=[
      {y:1.42, n:'אנטנה / RF',      c:'#0891b2', amp:0.55},
      {y:0.48, n:'אחרי ערבול (IF)', c:'#7c3aed', amp:0.62},
      {y:-0.48,n:'אחרי מגבל',       c:'#d97706', amp:0.70},
      {y:-1.42,n:'מוצא הגלאי',      c:'#059669', amp:0.60}
    ];
    stages.forEach(function(sg,i){
      p.hline(sg.y,{color:'#f1f5f9',w:2});
      p.curve(t=>{
        if(i===3) return sg.y + sg.amp*0.8*Math.cos(2*Math.PI*1.0*t);
        const ph = 2*Math.PI*14*t + 2.2*Math.sin(2*Math.PI*1.0*t);
        return sg.y + sg.amp*Math.cos(ph);
      },{color:sg.c, w:2.8, n:1800});
      p.text(sg.n, 6, p.Y(sg.y)-40, {rtl:true, font:'800 20px '+HFONT, color:sg.c});
    });
  }
  ranges(root,draw); draw();
  return {draw};
};
})();
