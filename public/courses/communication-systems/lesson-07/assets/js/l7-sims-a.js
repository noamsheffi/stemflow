/* =========================================================
   שיעור 07 · סימולטורים — מקטעים א׳–ד׳
   ערבול · תדר ביניים · משרעת ומגבל
   כל גרף מחושב מחדש; אין תמונות מוכנות.
   ========================================================= */
(function(){
const L7 = window.L7 = window.L7 || {};
L7.sims = L7.sims || {};

const HFONT = '"Heebo","Segoe UI","Noto Sans Hebrew",Arial,sans-serif';
const MFONT = '600 28px ui-monospace,SFMono-Regular,Consolas,monospace';

function num(root,k,fb){
  const e = root.querySelector('[data-k="'+k+'"]');
  if (!e) return fb;
  const v = +e.value; return isFinite(v) ? v : fb;
}
function st(root,def){
  const s = Object.assign({},def);
  root.querySelectorAll('input[type=range]').forEach(r=>{ if(r.dataset.k) s[r.dataset.k]=+r.value; });
  return s;
}
const O=(root,k)=>root.querySelector('[data-o="'+k+'"]');
function setO(root,k,v){ const e=O(root,k); if(e) e.textContent=v; }
const C=(root,k)=>root.querySelector('canvas[data-c="'+k+'"]');
function ranges(root,cb,onReset){
  root.querySelectorAll('input[type=range]').forEach(r=>r.addEventListener('input',()=>cb(r)));
  root.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',()=>{
    root.querySelectorAll('input[type=range]').forEach(r=>{ r.value=r.defaultValue; });
    root.querySelectorAll('input[type=checkbox]').forEach(c=>{ c.checked=c.defaultChecked; });
    if (typeof onReset === 'function') onReset();
    cb(null);
  }));
}
L7.num=num; L7.st=st; L7.setO=setO; L7.C=C; L7.ranges=ranges;

/* =========================================================
   1 · ספקטרום התחנות — בחירת תחנה מתוך רבות
   ========================================================= */
const STATIONS = [
  {f:88.9, n:'88.9', s:0.55}, {f:91.8, n:'91.8', s:0.82},
  {f:94.2, n:'94.2', s:0.42}, {f:97.6, n:'97.6', s:0.66},
  {f:98.1, n:'98.1', s:1.00}, {f:100.4, n:'100.4', s:0.5},
  {f:103.5, n:'103.5', s:0.74}, {f:106.7, n:'106.7', s:0.38}
];
L7.STATIONS = STATIONS;

L7.sims.spectrum = function(root){
  const cv = C(root,'sp');
  let sel = 4;
  function draw(eq){
    const p = L7.P(cv,{xm:88,xM:108,ym:0,yM:1.15,pad:{t:34,r:26,b:48,l:34}});
    p.grid(10,3);
    p.curve(f=>{
      let v=0.02;
      STATIONS.forEach((s,i)=>{ if(eq) v+=s.s; else v+=s.s*Math.exp(-Math.pow((f-s.f)/0.34,2)); });
      return v;
    },{color:'#0891b2', w:5, n:900});
    if(!eq) STATIONS.forEach((s,i)=>{
      const on = i===sel;
      p.vline(s.f,{color:on?'#0e7490':'#cbd5e1', w:on?4:2, dash:on?[]:[6,7]});
      p.text(s.n, p.X(s.f), p.Y(s.s*0.94+0.1), {align:'center', font:(on?'800 27px ':'600 24px ')+MFONT, color:on?'#0e7490':'#94a3b8'});
    });
    p.text('88', p.X(88), p.Y1+26,{align:'center',font:MFONT,color:'#94a3b8'});
    p.text('108 MHz', p.X(108), p.Y1+26,{align:'center',font:MFONT,color:'#94a3b8'});
    p.text(eq?'כל התחנות מוגברות יחד':'תחנה אחת נבחרת', 10, 22,{rtl:true, font:'800 25px '+HFONT, color:eq?'#9a3412':'#0e7490'});
  }
  root.querySelectorAll('[data-stn]').forEach(b=>b.addEventListener('click',()=>{
    sel = STATIONS.findIndex(s=>s.n===b.dataset.stn);
    root.querySelectorAll('[data-stn]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    draw(false); setO(root,'pick', b.dataset.stn+' MHz');
  }));
  const eqBtn = root.querySelector('[data-mode]');
  if(eqBtn) eqBtn.addEventListener('click',()=>{
    const eq = eqBtn.getAttribute('aria-pressed')!=='true';
    eqBtn.setAttribute('aria-pressed',String(eq));
    eqBtn.textContent = eq ? 'חזרה לבחירה' : 'הגברת הכול';
    draw(eq); setO(root,'pick', eq ? '— הכול —' : STATIONS[sel].n+' MHz');
  });
  draw(false);
  return {draw:()=>draw(false)};
};

/* =========================================================
   2 · מה עושה הערבל — סכום והפרש
   ========================================================= */
L7.sims.mixer = function(root){
  const A = C(root,'spec'), B = C(root,'out');
  const D = {rf:98.1, lo:108.8};
  function draw(){
    const s = st(root,D);
    const dif = Math.abs(s.lo-s.rf), sum = s.rf+s.lo;
    const ifOk = Math.abs(dif-10.7) < 0.35;
    setO(root,'rf', s.rf.toFixed(1)+' MHz');
    setO(root,'lo', s.lo.toFixed(1)+' MHz');
    setO(root,'dif', dif.toFixed(1)+' MHz');
    setO(root,'sum', sum.toFixed(1)+' MHz');
    const stEl = O(root,'st');
    if (stEl){
      stEl.textContent = ifOk ? 'ההפרש נופל על 10.7 MHz — מסנן IF יבחר בו'
                              : 'ההפרש רחוק מ־10.7 MHz — דומה לכיוון לא נכון';
      stEl.className = 'status '+(ifOk?'':'warn');
    }
    // ספקטרום בתדרי RF
    const pm = L7.P(A,{xm:88,xM:220,ym:0,yM:1.12,pad:{t:32,r:24,b:46,l:32}});
    pm.grid(12,3);
    [[s.rf,'f_RF','#0891b2'],[s.lo,'f_LO','#7c3aed'],[dif,'הפרש','#059669'],[sum,'סכום','#94a3b8']].forEach(function(m){
      pm.vline(m[0],{color:m[2], w:m[1]==='הפרש'?4.5:3, dash:m[1]==='סכום'?[7,7]:[]});
      pm.text(m[1]+' '+m[0].toFixed(1), pm.X(m[0]), 26, {align:'center', font:'800 23px '+HFONT, color:m[2]});
    });
    pm.band(10.7-1.05,10.7+1.05,'rgba(5,150,105,.13)');
    pm.text('10.7', pm.X(10.7), pm.Y1+24, {align:'center', font:MFONT, color:'#059669'});
    pm.text('MHz', pm.X(215), pm.Y1+24, {align:'center', font:MFONT, color:'#94a3b8'});
    // תוצר הערבול
    const pd = L7.P(B,{xm:0,xM:220,ym:0,yM:1.12,pad:{t:32,r:24,b:46,l:32}});
    pd.grid(12,3);
    pd.band(9.65,11.75,'rgba(5,150,105,.15)');
    [[dif,'הפרש','#059669',1],[sum,'סכום','#94a3b8',.72]].forEach(function(m){
      pd.curve(f=>m[3]*Math.exp(-Math.pow((f-m[0])/1.3,2)), {color:m[2], w:4.5, n:600});
      pd.text(m[1]+' '+m[0].toFixed(1), pd.X(Math.min(m[0],205)), pd.Y(m[3])-14, {align:'center', font:'800 23px '+HFONT, color:m[2]});
    });
    pd.text('חלון מסנן IF · 200 kHz', pd.X(10.7), 26, {align:'center', font:'800 24px '+HFONT, color:'#047857'});
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   3 · הזרקה גבוהה — LO מעל או מתחת
   ========================================================= */
L7.sims.inject = function(root){
  const cv = C(root,'inj');
  let high = true;
  function draw(){
    const rf = 98.1, fif = 10.7;
    const lo = high ? rf+fif : rf-fif;
    const p = L7.P(cv,{xm:80,xM:120,ym:0,yM:1.1,pad:{t:34,r:26,b:46,l:34}});
    p.grid(8,3);
    p.vline(rf,{color:'#0891b2',w:4.5});
    p.vline(lo,{color:'#7c3aed',w:4.5});
    p.text('f_RF 98.1', p.X(rf), 26, {align:'center', font:'800 22px '+HFONT, color:'#0891b2'});
    p.text('f_LO '+lo.toFixed(1), p.X(lo), 26, {align:'center', font:'800 22px '+HFONT, color:'#7c3aed'});
    const yA = 0.34;
    const x1 = p.X(Math.min(rf,lo)), x2 = p.X(Math.max(rf,lo));
    p.ctx.strokeStyle = '#059669'; p.ctx.lineWidth = 3.5; p.ctx.setLineDash([]);
    p.ctx.beginPath(); p.ctx.moveTo(x1,p.Y(yA)); p.ctx.lineTo(x2,p.Y(yA)); p.ctx.stroke();
    p.ctx.beginPath(); p.ctx.arc(x1,p.Y(yA),6,0,7); p.ctx.arc(x2,p.Y(yA),6,0,7); p.ctx.fillStyle='#059669'; p.ctx.fill();
    p.text('Δ = 10.7 MHz', (x1+x2)/2, p.Y(yA-0.11), {align:'center', font:'800 24px '+HFONT, color:'#047857'});
    p.text(high?'הזרקה גבוהה: f_LO > f_RF':'הזרקה נמוכה: f_LO < f_RF', 10, p.Y1-8, {rtl:true,font:'800 23px '+HFONT, color:'#0e7490'});
    setO(root,'lo', lo.toFixed(1)+' MHz');
    setO(root,'mode', high?'גבוהה':'נמוכה');
    setO(root,'fc', high?'f_LO = f_RF + f_IF':'f_LO = f_RF − f_IF');
    const fcEl = O(root,'fc');
    if (fcEl) fcEl.setAttribute('dir','ltr');
  }
  root.querySelectorAll('[data-inj]').forEach(b=>b.addEventListener('click',()=>{
    high = b.dataset.inj==='high';
    root.querySelectorAll('[data-inj]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    draw();
  }));
  draw();
  return {draw};
};

/* =========================================================
   4 · דוגמה מספרית — 98.1 MHz, חמישה שלבים
   ========================================================= */
L7.sims.numex = function(root){
  const cv = C(root,'bars');
  const rf = 98.1, fif = 10.7, lo = rf+fif, sum = rf+lo;
  function draw(){
    const p = L7.P(cv,{xm:0,xM:215,ym:0,yM:1.15,pad:{t:36,r:26,b:50,l:34}});
    p.grid(10,3);
    [[rf,'f_RF',1,'#0891b2'],[lo,'f_LO',0.85,'#7c3aed'],[fif,'f_IF',0.62,'#059669'],[sum,'סכום',0.34,'#cbd5e1']].forEach(function(m){
      const x = p.X(m[0]), w = Math.max(9,(p.X1-p.X0)/46);
      p.ctx.fillStyle = m[3]; p.ctx.globalAlpha = .85;
      p.ctx.beginPath();
      const yTop = p.Y(m[2]);
      if (p.ctx.roundRect) p.ctx.roundRect(x-w/2, yTop, w, p.Y1-yTop, 4); else p.ctx.rect(x-w/2,yTop,w,p.Y1-yTop);
      p.ctx.fill(); p.ctx.globalAlpha = 1;
      p.text(m[1], x, yTop-16, {align:'center', font:'800 22px '+HFONT, color:m[3]==='#cbd5e1'?'#64748b':m[3]});
    });
    p.ctx.save(); p.ctx.fillStyle='rgba(5,150,105,.12)';
    p.ctx.fillRect(p.X(9.3),p.Y0,p.X(12.1)-p.X(9.3),p.Y1-p.Y0); p.ctx.restore();
    p.text('חלון IF', p.X(fif), p.Y1+26, {align:'center', font:'800 20px '+HFONT, color:'#047857'});
    [0,50,100,150,200].forEach(v=>p.text(String(v), p.X(v), p.Y1+26, {align:'center', font:MFONT, color:'#94a3b8'}));
  }
  draw();
  return {draw};
};

/* =========================================================
   5 · רוחב פס מול רוחב מסנן
   ========================================================= */
L7.sims.bwfilter = function(root){
  const cv = C(root,'bw');
  const D = {bw:200, off:0};
  function draw(){
    const s = st(root,D);            // kHz
    const p = L7.P(cv,{xm:-420,xM:420,ym:0,yM:1.12,pad:{t:36,r:26,b:48,l:34}});
    p.grid(12,3);
    p.band(-100,100,'rgba(6,182,212,.14)');
    p.text('ערוץ FM · 200 kHz', 0, 24, {align:'center', font:'800 23px '+HFONT, color:'#0e7490', x:p.X(0)===undefined?0:undefined});
    // עקומת מסנן
    const b = s.bw/2;
    p.curve(f=>1/(1+Math.pow(Math.abs(f)/b,8)), {color:'#7c3aed', w:5, n:1200});
    // חבילת האות
    p.curve(f=>0.82*Math.exp(-Math.pow((f-s.off)/92,2)), {color:'#0891b2', w:4, n:800, dash:[10,6]});
    p.vline(s.off,{color:'#0891b2', w:2.5, dash:[5,6]});
    const cut = Math.abs(s.off)>b;
    const el=O(root,'st');
    if(el){
      el.textContent = s.bw<170 ? 'המסנן צר מהערוץ — חלק מהמידע נחתך' : (cut?'האות מחוץ לתחום המסנן — קליטה נכשלת':'רוחב המסנן מתאים לערוץ');
      el.className='status '+(s.bw<170||cut?'warn':'');
    }
    setO(root,'bw', s.bw.toFixed(0)+' kHz');
    setO(root,'off', (s.off>0?'+':'')+s.off.toFixed(0)+' kHz');
    [-400,-200,0,200,400].forEach(v=>p.text(String(v), p.X(v), p.Y1+24,{align:'center',font:MFONT,color:'#94a3b8'}));
    p.text('kHz מהמרכז', p.X(400), p.Y1+44, {align:'right', font:MFONT, color:'#94a3b8'});
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   6 · הפרעת משרעת — FM תקין מול מופרע
   ========================================================= */
L7.sims.ampnoise = function(root){
  const A = C(root,'clean'), B = C(root,'dirty');
  const D = {noise:35};
  function draw(){
    const s = st(root,D), n = s.noise/100;
    const T = 6;
    function wave(cv, noisy){
      /* 9 מחזורים במקום 18: בגל צפוף מדי קווי המעטפת נבלעים ולא רואים
         את שינויי המשרעת. אותו מודל, צפיפות קריאה. */
      const p = L7.P(cv,{xm:0,xM:T,ym:-1.62,yM:1.62,pad:{t:46,r:30,b:32,l:30}});
      p.grid(6,2); p.hline(0,{color:'#e2e8f0',w:2});
      /* מעטפת ההפרעה עצמה — קו מקווקו שמראה במפורש את השינוי */
      if (noisy){
        p.curve(t=>1-n*0.62 + n*0.62*Math.sin(2*Math.PI*0.85*t+0.7),
          {color:'#f59e0b', w:2.2, dash:[7,6], n:400});
        p.curve(t=>-(1-n*0.62 + n*0.62*Math.sin(2*Math.PI*0.85*t+0.7)),
          {color:'#f59e0b', w:2.2, dash:[7,6], n:400});
      }
      p.curve(t=>{
        const env = noisy ? (1-n*0.62 + n*0.62*Math.sin(2*Math.PI*0.85*t+0.7)) : 1;
        const ph = 2*Math.PI*4.5*t + 1.1*Math.sin(2*Math.PI*0.5*t);
        return env*Math.cos(ph);
      }, {color: noisy?'#d97706':'#0891b2', w:3, n:2200});
      p.text(noisy?'הפרעת משרעת מחזורית — דוגמה לימודית':'FM תקין · מעטפת קבועה', p.X0, 18,
        {rtl:true, align:'left', font:'800 21px '+HFONT, color:noisy?'#9a3412':'#0e7490'});
      p.text('זמן [s]', p.X1, p.Y1+18, {rtl:true, align:'right', font:'600 15px '+HFONT, color:'#94a3b8'});
    }
    wave(A,false); wave(B,true);
    setO(root,'noise', s.noise+'%');
    const el=O(root,'st');
    if(el){
      el.textContent = n<0.02 ? 'שני האותות זהים — התדר הרגעי לא השתנה'
        : 'המשרעת משתנה; מספר מעברי האפס לאורך הזמן לא השתנה. ההפרעה כאן מחזורית — דוגמה לימודית, לא רעש אקראי';
      el.className='status '+(n<0.02?'':'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   7 · מגבל — לפני, קיטום, אחרי מסנן
   ========================================================= */
L7.sims.limiter = function(root){
  const cv = C(root,'lim');
  const D = {level:100, noise:35, lim:62};
  function draw(){
    const s = st(root,D), lv = s.level/100, vl = s.lim/100, n = s.noise/100;
    const T = 5;
    const p = L7.P(cv,{xm:0,xM:T,ym:-1.9,yM:1.9,pad:{t:30,r:26,b:40,l:48}});
    p.grid(8,4); p.hline(0,{color:'#e2e8f0',w:2});
    const rows = [
      {y:1.28, name:'לפני המגבל', color:'#0891b2'},
      {y:0,    name:'אחרי קיטום',  color:'#d97706'},
      {y:-1.28,name:'אחרי מסנן',   color:'#059669'}
    ];
    const lim = vl*1.05;
    rows.forEach(function(r){
      p.hline(r.y+lim,{color:'#fca5a5',w:2,dash:[7,7]});
      p.hline(r.y-lim,{color:'#fca5a5',w:2,dash:[7,7]});
      p.curve(t=>{
        const env = lv*(1-n*0.55 + n*0.55*Math.sin(2*Math.PI*1.9*t+0.7));
        const raw = r.y + env*Math.cos(2*Math.PI*15*t);
        if(r.name==='אחרי קיטום') return Math.max(r.y-lim, Math.min(r.y+lim, raw*1.9));
        if(r.name==='אחרי מסנן') return r.y + (lv<0.5 ? 0.42 : 0.78)*Math.cos(2*Math.PI*15*t);
        return raw;
      }, {color:r.color, w:3, n:2400});
      p.text(r.name, 8, p.Y(r.y)-58, {rtl:true, font:'800 21px '+HFONT, color:r.color});
    });
    p.text('±V_lim', p.X1-6, p.Y(1.28+lim)-16, {align:'right', font:MFONT, color:'#b91c1c'});
    setO(root,'level', s.level+'%');
    setO(root,'noise', s.noise+'%');
    setO(root,'lim', s.lim+'%');
    const el=O(root,'st');
    if(el){
      const weak = lv < vl*0.92;
      el.textContent = weak ? 'האות חלש מהסף — המגבל אינו קוטם, ולכן הרעש נשאר'
                            : 'המשרעת נחתכת לרמה קבועה; שינויי המשרעת נעלמו כמעט לגמרי';
      el.className='status '+(weak?'warn':'');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   8 · מגבל על AM — למה אסור
   ========================================================= */
L7.sims.amlimiter = function(root){
  const A = C(root,'am'), B = C(root,'amc');
  let on = false;
  function draw(){
    const T = 4;
    function w(cv, clipped){
      const p = L7.P(cv,{xm:0,xM:T,ym:-1.6,yM:1.6,pad:{t:30,r:24,b:36,l:46}});
      p.grid(8,2); p.hline(0,{color:'#e2e8f0',w:2});
      p.curve(t=>{
        const m = 0.55+0.45*Math.cos(2*Math.PI*1.15*t);
        const raw = m*Math.cos(2*Math.PI*16*t);
        return clipped ? Math.max(-0.62, Math.min(0.62, raw*1.55)) : raw;
      }, {color: clipped?'#dc2626':'#1d4ed8', w:3.2, n:2400});
      p.text(clipped?'אחרי מגבל — המעטפת נמחקה':'AM נקי — המידע במעטפת', 8, 20, {rtl:true,font:'800 22px '+HFONT, color:clipped?'#991b1b':'#1d4ed8'});
    }
    w(A,false); w(B,on);
    setO(root,'mode', on?'מגבל פעיל':'מגבל כבוי');
  }
  const b=root.querySelector('[data-limtoggle]');
  if(b) b.addEventListener('click',()=>{ on=!on; b.setAttribute('aria-pressed',String(on)); b.textContent=on?'כיבוי המגבל':'הפעלת המגבל'; draw(); });
  draw();
  return {draw};
};

/* =========================================================
   9 · השוואת תדר למתח — ההמחשה האיכותית
   ========================================================= */
L7.sims.f2v = function(root){
  const A = C(root,'map'), B = C(root,'wave');
  let pt = 1;   // 0,1,2
  function draw(){
    const offs = [-1,0,1];
    const p = L7.P(A,{xm:-1.6,xM:1.6,ym:-1.4,yM:1.4,pad:{t:32,r:26,b:44,l:46}});
    p.grid(4,4); p.hline(0,{color:'#cbd5e1',w:2.5}); p.ctx.save();p.ctx.strokeStyle='#cbd5e1';p.ctx.lineWidth=2.5;
    p.ctx.beginPath(); p.ctx.moveTo(p.X(0),p.Y0); p.ctx.lineTo(p.X(0),p.Y1); p.ctx.stroke(); p.ctx.restore();
    p.curve(f=>0.92*f, {color:'#7c3aed', w:4.5});
    offs.forEach((o,i)=>{
      const on = i===pt;
      p.ctx.fillStyle = on?'#d97706':'#94a3b8';
      p.ctx.beginPath(); p.ctx.arc(p.X(o), p.Y(0.92*o), on?11:7, 0, 7); p.ctx.fill();
      if(on) p.ctx.stroke();
      p.text(o>0?'+Δf':(o<0?'−Δf':'0'), p.X(o), p.Y1+24, {align:'center', font:'800 21px '+HFONT, color:on?'#b45309':'#94a3b8'});
      p.text((o>0?'+':(o<0?'−':''))+'V'+(o===0?'0':''), p.X(o)+(o===0?34:-34), p.Y(0.92*o)-(o===0?0:18), {align:'center', font:'800 21px '+MFONT, color:on?'#b45309':'#94a3b8'});
    });
    p.text('תדר הכניסה →', p.X(1.35), p.Y1+24, {align:'right', font:'700 20px '+HFONT, color:'#94a3b8'});
    p.text('מתח מוצא', 6, 22, {rtl:true, font:'800 21px '+HFONT, color:'#6d28d9'});
    // גל עם המשרעת המתאימה
    const amp = [0.55,1.0,1.45][pt];
    const pw = L7.P(B,{xm:0,xM:3,ym:-1.7,yM:1.7,pad:{t:30,r:24,b:36,l:46}});
    pw.grid(6,2); pw.hline(0,{color:'#e2e8f0',w:2});
    pw.curve(t=>amp*Math.cos(2*Math.PI*9*t), {color:['#94a3b8','#0891b2','#0e7490'][pt], w:3.4, n:1200});
    pw.text('אות ה־FM אחרי המעבר', 8, 20, {rtl:true,font:'800 22px '+HFONT, color:'#0e7490'});
    setO(root,'pt', offs.length && (pt===0?'−Δf':(pt===1?'במרכז':'+Δf')));
    setO(root,'vol', ['יחסי 62%','יחסי 100%','יחסי 138%'][pt]);
    offs.forEach((o,i)=>{
      const b = root.querySelector('[data-pt="'+i+'"]');
      if(b) b.setAttribute('aria-pressed',String(i===pt));
    });
  }
  root.querySelectorAll('[data-pt]').forEach(b=>b.addEventListener('click',()=>{ pt=+b.dataset.pt; draw(); }));
  draw();
  return {draw};
};

/* =========================================================
   10 · מסנן תהודה — f0 מול f_IF, שיפוע חיובי/שלילי
   ========================================================= */
L7.sims.slope = function(root){
  const A = C(root,'curve'), B = C(root,'time');
  const D = {f0:13.4, work:10.7, f:10.7};
  function draw(){
    const s = st(root,D);
    const q = 6.2;
    const H = f => 1/Math.sqrt(1+Math.pow(q*(f-s.f0)/s.f0,2));
    const dH = f => (H(f+0.01)-H(f-0.01))/0.02;
    const p = L7.P(A,{xm:8.4,xM:15.4,ym:0,yM:1.15,pad:{t:34,r:28,b:48,l:34}});
    p.grid(7,3);
    p.band(s.work-0.1,s.work+0.1,'rgba(5,150,105,.16)');
    p.curve(H,{color:'#0e7490',w:5,n:1400});
    p.vline(s.f0,{color:'#7c3aed',w:3,dash:[8,6]});
    p.text('f₀ · שיא תהודה', p.X(s.f0), 24, {align:'center', font:'800 22px '+HFONT, color:'#6d28d9'});
    p.vline(s.work,{color:'#059669',w:3.5});
    p.text('f_IF · נקודת עבודה', p.X(s.work), p.Y1+22, {align:'center', font:'800 21px '+HFONT, color:'#047857'});
    // משיק בנקודת העבודה
    const y0=H(s.work), sl=dH(s.work);
    p.curve(f=>y0+sl*(f-s.work), {color:'#d97706',w:3,n:2,dash:[9,7]});
    // הנקודה הנעה
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.ctx.arc(p.X(s.f),p.Y(H(s.f)),10,0,7); p.ctx.fill();
    // גרף זמן
    const amp = H(s.work), ampNow = H(s.f);
    const pw = L7.P(B,{xm:0,xM:3,ym:-1.7,yM:1.7,pad:{t:30,r:24,b:36,l:46}});
    pw.grid(6,2); pw.hline(0,{color:'#e2e8f0',w:2});
    pw.curve(t=>ampNow*1.35*Math.cos(2*Math.PI*11*t), {color:'#dc2626',w:3.2,n:1600});
    pw.text('משרעת האות ביציאה מגלאי השיפוע', 8, 20, {rtl:true,font:'800 21px '+HFONT, color:'#991b1b'});
    const dcgap = (ampNow-amp)*1.35;
    setO(root,'amp', (ampNow*100).toFixed(0)+'%');
    setO(root,'slopeSign', dH(s.work)>0?'חיובי ↑':'שלילי ↓');
    setO(root,'dc', dcgap.toFixed(2));
    setO(root,'f', s.f.toFixed(2)+' MHz');
    const el=O(root,'st');
    if(el){
      el.textContent = Math.abs(s.f-s.work)<0.9 ? 'בתחום המקומי — הקשר כמעט ליניארי'
        : 'מחוץ לתחום הליניארי — המשרעת רוויה והמוצא מתעוות';
      el.className='status '+(Math.abs(s.f-s.work)<0.9?'':'warn');
    }
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   11 · תדר על השיפוע — שלוש נקודות והעבר למעטפת
   ========================================================= */
L7.sims.slopeflow = function(root){
  const A = C(root,'c'), B = C(root,'t');
  const D = {f:10.7};
  function draw(){
    const s = st(root,D);
    const f0=13.4, q=6.2;
    const H=f=>1/Math.sqrt(1+Math.pow(q*(f-f0)/f0,2));
    const p = L7.P(A,{xm:8.4,xM:15.4,ym:0,yM:1.15,pad:{t:32,r:26,b:46,l:32}});
    p.grid(7,3);
    p.curve(H,{color:'#0e7490',w:5,n:1200});
    p.vline(f0,{color:'#7c3aed',w:2.5,dash:[7,6]});
    [9.3,10.7,12.1].forEach(v=>{
      p.vline(v,{color:'#cbd5e1',w:2});
      p.ctx.fillStyle='#94a3b8'; p.ctx.beginPath(); p.ctx.arc(p.X(v),p.Y(H(v)),6,0,7); p.ctx.fill();
    });
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.ctx.arc(p.X(s.f),p.Y(H(s.f)),10,0,7); p.ctx.fill();
    p.text('f₀', p.X(f0), 22, {align:'center', font:MFONT, color:'#6d28d9'});
    const pw = L7.P(B,{xm:0,xM:3,ym:-1.8,yM:1.8,pad:{t:32,r:26,b:42,l:46}});
    pw.grid(6,2); pw.hline(0,{color:'#e2e8f0',w:2});
    const amp = H(s.f)*1.5;
    pw.curve(t=>amp*Math.cos(2*Math.PI*10*t),{color:'#dc2626',w:3.2,n:1600});
    pw.curve(t=>amp*0.86+0.14,{color:'#d97706',w:2.6,n:400});
    pw.text('גל · מעטפת · DC', 8, 20, {rtl:true,font:'800 21px '+HFONT, color:'#b45309'});
    setO(root,'f', s.f.toFixed(2)+' MHz');
    setO(root,'amp', (H(s.f)*100).toFixed(0)+'%');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* =========================================================
   12 · קירוב ליניארי — hf תקף
   ========================================================= */
L7.sims.linappx = function(root){
  const cv = C(root,'app');
  const D = {dev:0};
  function draw(){
    const s = st(root,D);
    const f0=13.4, q=6.2, work=10.7;
    const H=f=>1/Math.sqrt(1+Math.pow(q*(f-f0)/f0,2));
    const y0=H(work), sl=(H(work+0.01)-H(work-0.01))/0.02;
    const p = L7.P(cv,{xm:8.4,xM:15.4,ym:0,yM:1.2,pad:{t:34,r:28,b:48,l:34}});
    p.grid(7,3);
    p.band(work-0.9,work+0.9,'rgba(5,150,105,.13)');
    p.curve(H,{color:'#0e7490',w:5,n:1400});
    p.curve(f=>y0+sl*(f-work),{color:'#d97706',w:3.2,dash:[9,7],n:2});
    const fd = work+s.dev/100*2.6;
    p.vline(work,{color:'#059669',w:2.5});
    p.ctx.fillStyle='#dc2626'; p.ctx.beginPath(); p.ctx.arc(p.X(fd),p.Y(H(fd)),10,0,7); p.ctx.fill();
    p.text('המשיק · קירוב K_d', p.X1-8, p.Y(0.14)+18, {align:'right', font:'800 21px '+HFONT, color:'#b45309'});
    const err = Math.abs((H(fd) - (y0+sl*(fd-work)))/Math.max(H(fd),0.001))*100;
    setO(root,'dev',(s.dev>0?'+':'')+s.dev.toFixed(0)+'%');
    const el=O(root,'st');
    if(el){
      el.textContent = Math.abs(s.dev)<34 ? 'בתחום הסימון — הקירוב הליניארי תקף' : 'מחוץ לתחום — הקירוב מפסיק לתאר את העקומה';
      el.className='status '+(Math.abs(s.dev)<34?'':'warn');
    }
    setO(root,'err', err.toFixed(0)+'%');
  }
  ranges(root,draw); draw();
  return {draw};
};

/* ---------- אתחול כללי: מנוע הסימולציות ---------- */
L7.initSims = function(page){
  page.querySelectorAll('[data-sim]').forEach(function(el){
    if (el.__inst) return;
    const f = L7.sims[el.dataset.sim];
    if (typeof f !== 'function') return;
    try { el.__inst = f(el); } catch(e){ console.error('sim '+el.dataset.sim, e); }
  });
};
L7.drawSims = function(page){
  page.querySelectorAll('[data-sim]').forEach(function(el){
    const i = el.__inst;
    if (i && i.draw) { try { i.draw(); } catch(e){} }
  });
};
})();
