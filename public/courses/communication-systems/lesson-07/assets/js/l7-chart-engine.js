/* =========================================================
   שיעור 07 · מנוע ציור הגרפים — זהה למנוע של שיעור 06
   כתיבת טקסט דו־כיוונית בקנבס (עברית RTL + מתמטיקה LTR)
   ========================================================= */
(function(){
const L7 = window.L7 = window.L7 || {};
const HFONT = '"Heebo","Segoe UI","Noto Sans Hebrew",Arial,sans-serif';
const MFONT = '600 30px ui-monospace,SFMono-Regular,Consolas,monospace';
const SUBMAP = [['ₘₐₓ','_{max}'],['ₘᵢₙ','_{min}'],['ᵢₙ','_{in}'],['꜀','_{c}'],['ₘ','_{m}'],['ₐ','_{a}'],['ₙ','_{n}'],['₀','_{0}'],['₁','_{1}'],['₂','_{2}']];
function norm(s){ s = String(s); SUBMAP.forEach(function(p){ s = s.split(p[0]).join(p[1]); }); return s; }
function parse(s){
  const out = []; let i = 0;
  while (i < s.length){
    const c = s[i];
    if (c === '_' && i + 1 < s.length){
      if (s[i+1] === '{'){ const j = s.indexOf('}', i+2); if (j > 0){ for (const ch of s.slice(i+2, j)) out.push({ch:ch, sub:true}); i = j + 1; continue; } }
      else if (/[A-Za-z0-9]/.test(s[i+1])){ let j = i + 1; while (j < s.length && /[A-Za-z0-9]/.test(s[j])) j++; for (const ch of s.slice(i+1, j)) out.push({ch:ch, sub:true}); i = j; continue; }
    }
    out.push({ch:c, sub:false}); i++;
  }
  return out;
}
const isR = function(ch){ return /[֐-׿יִ-ﭏ]/.test(ch); };
const isN = function(ch){ return /[\s.,:;·—–\-()\[\]\/=+×−±→←⇒⇐⟹⟸≈<>|"'״׳!?]/.test(ch); };

/* מחזיר את רוחב התווית; st: {font, color, align, base, rtl} */
L7.drawText = function(ctx, s, x, y, st, measureOnly){
  st = st || {};
  const font = st.font || '600 28px "Heebo",sans-serif';
  const m = font.match(/(\d+(?:\.\d+)?)px/); const px = m ? +m[1] : 28;
  const subFont = font.replace(/(\d+(?:\.\d+)?)px/, (px*0.7).toFixed(1) + 'px');
  const atoms = parse(norm(s));
  const base = (st.rtl && atoms.some(function(a){ return isR(a.ch); })) ? 'R' : 'L';
  if (base === 'R') atoms.forEach(function(a){ if (!a.sub){ if (a.ch === '⇒') a.ch = '⇐'; else if (a.ch === '→') a.ch = '←'; else if (a.ch === '⟹') a.ch = '⟸'; } });
  const cls = atoms.map(function(a){ return a.sub ? 'L' : (isR(a.ch) ? 'R' : (isN(a.ch) ? 'N' : 'L')); });
  for (let i = 0; i < cls.length; i++){
    if (cls[i] !== 'N') continue;
    let p = null, q = null;
    for (let k = i-1; k >= 0; k--) if (cls[k] === 'L' || cls[k] === 'R'){ p = cls[k]; break; }
    for (let k = i+1; k < cls.length; k++) if (cls[k] === 'L' || cls[k] === 'R'){ q = cls[k]; break; }
    const pp = p || base, qq = q || base;
    cls[i] = 'n' + (pp === qq ? pp : base);
  }
  const runs = [];
  atoms.forEach(function(a, i){
    const c = cls[i].replace('n','');
    const last = runs[runs.length-1];
    if (last && last.dir === c) last.atoms.push(a); else runs.push({dir:c, atoms:[a]});
  });
  ctx.save();
  // מדידה
  runs.forEach(function(r){
    if (r.dir === 'R'){
      ctx.font = font; ctx.direction = 'rtl';
      r.text = r.atoms.map(function(a){ return a.ch; }).join('');
      r.w = ctx.measureText(r.text).width;
    } else {
      r.segs = [];
      r.atoms.forEach(function(a){ const l = r.segs[r.segs.length-1]; if (l && l.sub === a.sub) l.t += a.ch; else r.segs.push({t:a.ch, sub:a.sub}); });
      ctx.direction = 'ltr';
      r.w = 0; r.segs.forEach(function(g){ ctx.font = g.sub ? subFont : font; g.w = ctx.measureText(g.t).width; r.w += g.w; });
    }
  });
  const total = runs.reduce(function(a, r){ return a + r.w; }, 0);
  if (measureOnly){ ctx.restore(); return total; }
  const order = base === 'R' ? runs.slice().reverse() : runs;
  let align = st.align || 'left';
  if (align === 'start') align = st.rtl ? 'right' : 'left';
  if (align === 'end') align = st.rtl ? 'left' : 'right';
  let cx = align === 'right' ? x - total : (align === 'center' ? x - total/2 : x);
  ctx.fillStyle = st.color || '#64748b';
  ctx.textBaseline = st.base || 'middle';
  order.forEach(function(r){
    if (r.dir === 'R'){
      ctx.font = font; ctx.direction = 'rtl'; ctx.textAlign = 'right';
      ctx.fillText(r.text, cx + r.w, y);
    } else {
      ctx.direction = 'ltr'; ctx.textAlign = 'left';
      let gx = cx;
      r.segs.forEach(function(g){ ctx.font = g.sub ? subFont : font; ctx.fillText(g.t, gx, g.sub ? y + px*0.3 : y); gx += g.w; });
    }
    cx += r.w;
  });
  ctx.restore();
  return total;
};

/* הגדלת גופן לפי יחס התצוגה של הקנבס בשקף */
L7.readableFont = function(cv, font, minPx){
  minPx = minPx || 17;
  const m = font.match(/(\d+(?:\.\d+)?)px/); if (!m) return font;
  const px = +m[1];
  const k = (cv && cv.clientWidth) ? cv.width / cv.clientWidth : 1;
  const want = Math.min(Math.max(px, minPx * k), px * 1.8);
  return font.replace(/(\d+(?:\.\d+)?)px/, want.toFixed(1) + 'px');
};
/* ---------- ציור: פונקציית P ---------- */
L7.P = function P(cv, o){
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const pad = o.pad || {t:34, r:26, b:44, l:70};
  const X0 = pad.l, X1 = W - pad.r, Y0 = pad.t, Y1 = H - pad.b;
  const xm = o.xm, xM = o.xM, ym = o.ym, yM = o.yM;
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);
  const X = v => X0 + (v-xm)/(xM-xm)*(X1-X0);
  const Y = v => Y1 - (v-ym)/(yM-ym)*(Y1-Y0);
  const api = {ctx,W,H,X0,X1,Y0,Y1,X,Y};
  api.grid = function(nx, ny){
    ctx.strokeStyle = '#eef2f7'; ctx.lineWidth = 2;
    for (let i=1;i<nx;i++){ const x = X0 + (X1-X0)*i/nx; ctx.beginPath(); ctx.moveTo(x,Y0); ctx.lineTo(x,Y1); ctx.stroke(); }
    for (let i=1;i<ny;i++){ const y = Y0 + (Y1-Y0)*i/ny; ctx.beginPath(); ctx.moveTo(X0,y); ctx.lineTo(X1,y); ctx.stroke(); }
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.5; ctx.strokeRect(X0,Y0,X1-X0,Y1-Y0);
  };
  api.zero = function(v){
    if (ym < (v||0) && yM > (v||0)){ ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(X0,Y(v||0)); ctx.lineTo(X1,Y(v||0)); ctx.stroke(); }
  };
  api.curve = function(fn, st){
    st = st || {}; const n = st.n || 520;
    ctx.beginPath(); ctx.strokeStyle = st.color || '#0891b2'; ctx.lineWidth = st.w || 4.5;
    ctx.setLineDash(st.dash || []); ctx.lineJoin = 'round';
    for (let i=0;i<=n;i++){
      const t = xm + (xM-xm)*i/n; let v = fn(t);
      if (!isFinite(v)) continue;
      v = Math.max(ym-(yM-ym)*0.05, Math.min(yM+(yM-ym)*0.05, v));
      i ? ctx.lineTo(X(t),Y(v)) : ctx.moveTo(X(t),Y(v));
    }
    ctx.stroke(); ctx.setLineDash([]);
  };
  api.hline = function(v, st){
    st = st || {}; ctx.beginPath(); ctx.strokeStyle = st.color || '#cbd5e1'; ctx.lineWidth = st.w || 2.5;
    ctx.setLineDash(st.dash || []); ctx.moveTo(X0,Y(v)); ctx.lineTo(X1,Y(v)); ctx.stroke(); ctx.setLineDash([]);
  };
  api.vline = function(v, st){
    st = st || {}; ctx.beginPath(); ctx.strokeStyle = st.color || '#cbd5e1'; ctx.lineWidth = st.w || 2.5;
    ctx.setLineDash(st.dash || []); ctx.moveTo(X(v),Y0); ctx.lineTo(X(v),Y1); ctx.stroke(); ctx.setLineDash([]);
  };
  api.band = function(a,b,color){ ctx.fillStyle = color; ctx.fillRect(X(a),Y0,X(b)-X(a),Y1-Y0); };
  api.text = function(s,x,y,st){
    st = Object.assign({}, st || {});
    st.font = L7.readableFont(cv, st.font || ('600 30px ' + HFONT));
    return L7.drawText(ctx, s, x, y, st);
  };
  api.axisX = function(labels, st){
    st = st || {}; const y = Y1 + (st.dy || 26);
    labels.forEach(function(L){
      api.text(L, X(L.v), y, {align:'center', font:MFONT, color:'#94a3b8', size:26});
    });
  };
  api.tag = function(s, x, y, color, align){
    const font = L7.readableFont(cv, '700 27px ' + HFONT);
    const fpx = +font.match(/([\d.]+)px/)[1];
    const w = L7.drawText(ctx, s, 0, 0, {font:font, rtl:true}, true) + fpx*0.8;
    let rx = (align === 'right') ? x - w : (align === 'center' ? x - w/2 : x);
    rx = Math.max(2, Math.min(W - w - 2, rx));
    const yy = Math.max(fpx*0.75 + 2, y);
    ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = .13; ctx.fillRect(rx, yy - fpx*0.75, w, fpx*1.5); ctx.restore();
    L7.drawText(ctx, s, rx + fpx*0.4, yy, {font:font, color:color, rtl:true, align:'left'});
  };
  return api;
}

})();
