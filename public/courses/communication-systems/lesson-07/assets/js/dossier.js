(function(){
  const $ = (s,r)=> (r||document).querySelector(s);
  const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));

  /* ---------- KPI numbers ---------- */
  const setKpi = (id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  setKpi('kpiSpec', window.AUDIT.length);
  setKpi('kpiPlan', window.PLAN.reduce((a,b)=>a+b.sliders.length,0));
  let mins = window.PLAN.reduce((a,b)=>a+b.sliders.reduce((c,s)=>c+s.min,0),0);
  setKpi('kpiMin', mins);
  const stCount = {};
  window.AUDIT.forEach(r=>stCount[r.st]=(stCount[r.st]||0)+1);
  const chipSet = {cOk:'ok',cThin:'thin',cGap:'gap',cFix:'fix'};
  Object.keys(chipSet).forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=stCount[chipSet[id]]||0; });
  const cAll=document.getElementById('cAll'); if(cAll) cAll.textContent=window.AUDIT.length;
  const kg=document.getElementById('kpiGaps'); if(kg) kg.textContent=(stCount.gap||0)+(stCount.fix||0);

  /* ---------- audit table ---------- */
  const labels = {ok:'תקין', thin:'דק', gap:'פער', fix:'לתקן'};
  const body = document.getElementById('auditBody');
  function row(r){
    const tr=document.createElement('tr');
    tr.className = r.st==='gap'?'gaprow':(r.st==='thin'?'thinrow':'');
    tr.dataset.st=r.st;
    tr.dataset.text=(r.n+' '+r.t+' '+r.msg+' '+r.why+' '+r.act+' '+r.src).toLowerCase();
    tr.innerHTML =
      '<td class="n">'+String(r.n).padStart(2,'0')+'</td>'+
      '<td class="t"><button class="rowbtn" aria-expanded="false"><span class="caret">▸</span><span>'+r.t+'</span></button></td>'+
      '<td class="src">'+r.src+'</td>'+
      '<td class="f">'+r.f+'</td>'+
      '<td class="s"><span class="st '+r.st+'"></span>'+labels[r.st]+'</td>';
    const det=document.createElement('tr');
    det.className='detail';
    det.innerHTML='<td colspan="5"><div class="dgrid">'+
      '<div><h6>המסר היחיד</h6><p>'+r.msg+'</p></div>'+
      '<div><h6>מה חסר או לא מדויק</h6><p>'+r.why+'</p></div>'+
      '<div><h6>המלצה</h6><p>'+r.act+'</p></div>'+
      '</div></td>';
    const btn=$('.rowbtn',tr);
    btn.addEventListener('click',()=>{
      const open=tr.classList.toggle('open');
      det.classList.toggle('on',open);
      btn.setAttribute('aria-expanded',String(open));
    });
    return [tr,det];
  }
  window.AUDIT.forEach(r=>{ const [tr,det]=row(r); body.appendChild(tr); body.appendChild(det); });

  /* filter + search */
  let filter='all';
  const search = document.getElementById('auditSearch');
  const countEl = document.getElementById('auditCount');
  function apply(){
    const q=(search.value||'').trim().toLowerCase();
    let shown=0;
    $$('#auditBody tr').forEach(tr=>{
      if(!tr.dataset.st) return;
      const okF = filter==='all' || tr.dataset.st===filter;
      const okQ = !q || tr.dataset.text.includes(q);
      const vis = okF&&okQ;
      tr.style.display = vis?'':'none';
      const det = tr.nextElementSibling;
      if(det && det.classList.contains('detail')){
        if(!vis){ det.style.display='none'; tr.classList.remove('open'); det.classList.remove('on'); }
        else det.style.display='';
      }
      if(vis) shown++;
    });
    countEl.textContent = shown+' / 51';
  }
  $$('.chip[data-filter]').forEach(c=>c.addEventListener('click',()=>{
    filter=c.dataset.filter;
    $$('.chip[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===c)));
    apply();
  }));
  search.addEventListener('input',apply);
  apply();

  /* ---------- time bar ---------- */
  const bar=document.getElementById('timebar');
  if(bar){
    const total=mins;
    window.PLAN.forEach((b,i)=>{
      const d=document.createElement('div');
      const n=b.sliders.length;
      d.style.flex = b.min+' 1 0';
      d.style.background = i%2 ? '#1d2b38' : '#16202b';
      d.title = b.nm+' · '+b.title+' · '+b.min+' דק׳ · '+n+' שקפים';
      d.textContent = b.min;
      bar.appendChild(d);
    });
    document.getElementById('tbStart').textContent='0:00';
    document.getElementById('tbEnd').textContent=(135/60).toFixed(2).replace('.', ':')+' (2:15)';
  }

  /* ---------- plan render ---------- */
  const planWrap=document.getElementById('planWrap');
  if(planWrap){
    const badge = {new:'חדש', split:'מפוצל', merge:'מאוחד', fix:'מורחב', keep:''};
    window.PLAN.forEach(b=>{
      const sec=document.createElement('div');
      sec.className='block-sec';
      const first=b.sliders[0].n, last=b.sliders[b.sliders.length-1].n;
      sec.innerHTML =
        '<div class="block-head"><div class="l"><span class="nm">'+b.nm+'</span>'+
        '<h4>'+b.title+'</h4></div>'+
        '<span class="tmeta">'+b.min+' min · '+b.sliders.length+' שקופיות</span></div>'+
        '<div class="ids">שקפים '+String(first).padStart(2,'0')+'–'+String(last).padStart(2,'0')+'</div>';
      const ul=document.createElement('ul');
      ul.className='slides';
      b.sliders.forEach(s=>{
        const li=document.createElement('li');
        li.className='slide-card';
        const bd = s.st!=='keep' ? '<span class="pill '+s.st+'">'+badge[s.st]+'</span>' : '';
        li.innerHTML =
          '<div class="sn">'+String(s.n).padStart(2,'0')+'<em>'+s.min+'׳</em></div>'+
          '<div>'+
            '<h5>'+s.t+bd+'</h5>'+
            '<p class="msg">'+s.msg+'</p>'+
            '<dl class="attrs">'+
              '<div><dt>ידע קודם</dt><dd>'+s.pre+'</dd></div>'+
              '<div><dt>נוסחה / דיוק</dt><dd>'+(s.f==='—'?'—':'<span class="fml">'+s.f+'</span>')+'</dd></div>'+
              '<div><dt>המחשה / אינטראקציה</dt><dd>'+s.vis+'</dd></div>'+
              '<div><dt>מה בונים בפועל</dt><dd>'+s.own+'</dd></div>'+
            '</dl>'+
          '</div>';
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      planWrap.appendChild(sec);
    });
  }

  /* ---------- print / expand ---------- */
  const pb=document.getElementById('printBtn');
  if(pb) pb.addEventListener('click',()=>window.print());
  const eb=document.getElementById('expandBtn');
  if(eb) eb.addEventListener('click',()=>{
    const anyClosed = $$('#auditBody tr.detail:not(.on)').length>0;
    $$('#auditBody tr').forEach(tr=>{
      if(tr.dataset.st){
        tr.classList.toggle('open',anyClosed);
        const b=$('.rowbtn',tr); if(b) b.setAttribute('aria-expanded',String(anyClosed));
      } else if(tr.classList.contains('detail')){
        tr.classList.toggle('on',anyClosed);
      }
    });
    eb.textContent = anyClosed ? 'כיווץ כל הפירוט' : 'פתיחת כל הפירוט';
  });
})();
