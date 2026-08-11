/* ---- interpretive callouts, computed from the data ---- */
const nA=c=>PAPERS.filter(p=>p.dim.a===c).length;
const CALL={
 RQ2:`<b>Assessment and analytics dominate — and are tested differently.</b> Assessment work concentrates
  in technical evaluation, while analytics work carries most of the learning-outcome evidence. The two largest
  settings in the field are not accumulating the same kind of evidence.`,
 RQ3:`<b>Traceability is treated as a grading obligation.</b> Every paper that makes the evidence behind an
  output traceable is explaining an assessment judgement. Across the ${X('o',['O2','O3','O4'],'p',['P1','P2','P3','P4']).length}
  papers explaining analytics, predictions or recommendations, none does the same — even though the techniques would transfer.`,
 RQ4:`<b>Learners receive explanations; they do not shape them.</b> Across every learner-facing paper, none
  gives learners a role in configuring, correcting or contesting what the system says. Where explanatory authority
  is shared, an educator holds it.`,
 RQ5:`<b>The field has not converged.</b> Three architectures are near-equally represented and encode
  incompatible theories of where explanatory credibility comes from: fluency is sufficient, credibility is
  inherited from an interpretable component, or credibility must be constructed through grounding and oversight.`,
 RQ6:`<b>Read the shaded rows against the dashes.</b> Direct generation and grounded construction —
  ${nA('A1')+nA('A3')} papers between them — are never evaluated for learning outcomes. Conversational explanation,
  evaluated for learning in ${X('a','A4','ev','EV3').length} of its ${nA('A4')} papers, is never evaluated for technical quality.
  The systems we know to be faithful and the systems we know to help someone are not the same systems.`,
 RQ6:`<b>The dominant risk is not the one being measured.</b> Papers whose central concern is faithfulness
  evaluate technically and almost never measure what a learner does afterwards; papers concerned with overreliance
  and human agency do the reverse. Establishing that an explanation is persuasively unfaithful needs both halves
  of that evidence about one system.`};

/* ================= overview ================= */
function overview(){
  const h=META.head;
  const stats=[[h['Retained papers'],'Papers reviewed'],[h['Core empirical / technical'],'Core empirical'],
    [h['Conceptual / foundational'],'Conceptual'],[h['Published from 2024 onward'],'From 2024 onward'],
    [String(META.rqs.length),'Research questions'],[String(DIMS.length),'Coded dimensions'],[YEARS[0]+'–'+YEARS[YEARS.length-1],'Span']];
  let o=`<div class="stats">${stats.map(([n,l])=>`<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>
   <div class="card"><h2>What the survey concludes</h2>
    <p class="note">Four findings that hold across the whole corpus.</p>
    <div class="concl">${META.concl.map(c=>`<div class="c"><h4>${esc(c.t)}</h4><p>${esc(c.d)}</p></div>`).join('')}</div></div>
   <div class="card"><h2>The research questions</h2>
    <p class="note">How substantively each question is addressed. Click a row to open that question’s page.</p>
    <div id="ovRQ"></div>
    <div class="legend"><span><i style="background:var(--p)"></i>Primary contribution</span>
     <span><i style="background:var(--s)"></i>Substantive</span><span><i style="background:var(--c)"></i>Mentioned in passing</span></div></div>
   <div class="card"><h2>How the corpus flows across dimensions</h2>
    <p class="note">Every paper carries one code on each dimension, so all ${N} flow through every stage and the totals always reconcile.
     Choose the dimensions to chain; hover a band to trace it, click for the papers.</p>
    <div class="dimpick" id="skPick"></div>
    <div class="ctl" style="margin-bottom:8px"><button class="btn" id="skReset">Default chain</button><span class="count" id="skCount"></span></div>
    <div style="overflow-x:auto" id="skOut"></div></div>
   <div class="card"><h2>Publication trend</h2><div id="ovYears"></div></div>`;
  return o;
}
function bindOverview(){
  const box=$('#ovRQ'); box.innerHTML='';
  RQS.forEach(rq=>{const r=rqInfo(rq),c=r.cov||{},P_=c.P||0,S=c.S||0,C=c.C||0,im=META.implic[rq]||{};
    const el=document.createElement('div'); el.className='bar clk'; el.style.setProperty('--lw','150px');
    el.innerHTML=`<div class="lab"><b>${rq}</b><span>${esc((im.dominant||''))} dominant</span></div>
      <div class="sbar"><span style="width:${P_/N*100}%;background:var(--p)"></span><span style="width:${S/N*100}%;background:var(--s)"></span><span style="width:${C/N*100}%;background:var(--c)"></span></div>
      <div class="val">${P_+S}</div>`;
    tip(el,`<b>${rq}</b> — ${esc(r.q||'')}<br>Primary ${P_} · Substantive ${S} · Passing ${C}`);
    el.onclick=()=>go(rq);
    box.appendChild(el)});
  const yb=$('#ovYears'); yb.innerHTML='';
  const ymax=Math.max(...META.years.map(y=>y.n));
  META.years.forEach(y=>{const el=document.createElement('div');el.className='bar clk';el.style.setProperty('--lw','110px');
    el.innerHTML=`<div class="lab"><b>${y.y}</b><span>${Math.round(y.n/N*100)}% of corpus</span></div>
     <div class="track"><div class="fill" style="width:${y.n/ymax*100}%;background:var(--accent)"></div></div><div class="val">${y.n}</div>`;
    el.onclick=()=>listModal(PAPERS.filter(p=>p.year===y.y).map(p=>p.id),`Published in ${y.y}`,`${y.n} papers`);
    yb.appendChild(el)});
  initSankey();
}
/* ================= papers ================= */
function papersView(){
  return `<div class="card" style="padding-bottom:14px"><h2>The corpus</h2>
   <p class="note">All ${N} papers with their full coding. <b>Cards</b> give the reasoning in full;
    <b>Table</b> puts every paper against every dimension for comparison — hover any code for what it means
    and why that paper was placed there.</p>
   <div class="ctl">
    <span class="vt"><button id="vC" class="on">Cards</button><button id="vT">Table</button></span>
    <input type="search" id="pS" placeholder="Search…">
    <select id="pD"><option value="">All categories</option></select>
    <select id="pY"><option value="">All years</option></select>
    <select id="pR"><option value="">Any question is primary</option></select>
    <select id="pSort"><option value="id">Sort: ID</option><option value="yeard">Sort: newest</option><option value="ttl">Sort: title</option></select>
    <button class="btn" id="pX">Expand all</button><button class="btn" id="pRe">Reset</button>
    <span class="count" id="pC"></span></div></div>
   <div class="plist" id="pList"></div>
   <div class="card" id="pTblWrap" style="display:none;padding:14px 16px"><div class="ctwrap"><table class="mx" id="pTbl"></table></div>
    <p class="note" style="margin:14px 0 0">Each column is one coded dimension; every paper carries exactly one code in each.
     <b>P</b> / <b>S</b> / <b>C</b> in the first block records how substantively the paper addresses that question.</p></div>`;
}
function bindPapers(){
  $('#pD').innerHTML+=DIMS.map(d=>`<optgroup label="${esc(d.rq+' · '+d.name)}">`+
    d.defs.map(c=>`<option value="${d.k}|${c.code}">${c.code} · ${esc(c.label)}</option>`).join('')+`</optgroup>`).join('');
  $('#pY').innerHTML+=YEARS.map(y=>`<option value="${y}">${y}</option>`).join('');
  $('#pR').innerHTML+=RQS.map(r=>`<option value="${r}">${r} is a primary contribution</option>`).join('');
  ['pS','pD','pY','pR','pSort'].forEach(i=>{const e=$('#'+i);e.oninput=drawPapers;e.onchange=drawPapers});
  $('#pRe').onclick=()=>{['pS','pD','pY','pR'].forEach(i=>$('#'+i).value='');$('#pSort').value='id';drawPapers()};
  $('#vC').onclick=()=>setPView('cards'); $('#vT').onclick=()=>setPView('table');
  $('#pX').onclick=()=>{const on=$('#pX').dataset.on==='1';$$('.paper').forEach(e=>e.classList.toggle('open',!on));
    $('#pX').dataset.on=on?'0':'1';$('#pX').textContent=on?'Expand all':'Collapse all'};
  drawPapers();
}
let pView='cards';
function setPView(v){pView=v;
  $('#vC').classList.toggle('on',v==='cards'); $('#vT').classList.toggle('on',v==='table');
  $('#pList').style.display=v==='cards'?'':'none';
  $('#pTblWrap').style.display=v==='table'?'':'none';
  $('#pX').style.display=v==='cards'?'':'none';
  drawPapers();}
function filteredPapers(){
  let rows=PAPERS;
  const q=$('#pS').value.toLowerCase().trim(), dv=$('#pD').value, y=$('#pY').value, rq=$('#pR').value;
  if(dv){const[dk,c]=dv.split('|');rows=rows.filter(p=>p.dim[dk]===c)}
  if(y)rows=rows.filter(p=>p.year===y);
  if(rq)rows=rows.filter(p=>p.codes[rq]==='P');
  if(q)rows=rows.filter(p=>JSON.stringify(p).toLowerCase().includes(q));
  const s=$('#pSort')?$('#pSort').value:'id';
  return [...rows].sort((a,b)=>({id:()=>a.id.localeCompare(b.id),
    yeard:()=>b.year-a.year||a.id.localeCompare(b.id),
    ttl:()=>a.title.localeCompare(b.title)}[s])());
}
function drawTable(rows){
  const groups=[['RQ1',['k']],['RQ2',['o','p']],['RQ3',['a']],['RQ4',['st','iu']],['RQ5',['ev']],['RQ6',['rk']]];
  let h='<thead><tr><th class="stick l" rowspan="2">ID</th><th class="stick l2" rowspan="2">Paper</th><th rowspan="2">Yr</th>'
       +'<th colspan="7" class="gh">How substantively each question is addressed</th>'
       +groups.map(([rq,ks])=>`<th colspan="${ks.length}" class="gh">${rq}</th>`).join('')+'</tr><tr>'
       +RQS.map(r=>`<th class="sm">${r}</th>`).join('')
       +groups.map(([rq,ks])=>ks.map(k=>`<th class="sm" title="${esc(DK[k].name)}">${esc(DK[k].short)}</th>`).join('')).join('')+'</tr></thead>';
  h+='<tbody>'+rows.map(p=>`<tr>
    <td class="stick l"><span class="idl" data-op="${p.id}">${p.id}</span></td>
    <td class="stick l2 ttl" title="${esc(p.title)}">${esc(p.title)}</td>
    <td class="yr">${p.year}</td>
    ${RQS.map(r=>`<td class="st" data-sc="${p.id}|${r}"><span class="mini ${({P:'P',S:'S',C:'C'})[p.codes[r]]||'X'}">${p.codes[r]==='—'?'·':p.codes[r]}</span></td>`).join('')}
    ${groups.map(([rq,ks])=>ks.map(k=>`<td class="cd" data-cc="${p.id}|${k}"><span class="cchip" style="background:${DK[k].colors[p.dim[k]]}">${p.dim[k]}</span></td>`).join('')).join('')}
   </tr>`).join('')+'</tbody>';
  $('#pTbl').innerHTML=rows.length?h:'<tbody><tr><td class="empty">No papers match these filters.</td></tr></tbody>';
  $$('#pTbl [data-op]').forEach(e=>e.onclick=()=>paperModal(e.dataset.op));
  $$('#pTbl td.cd').forEach(td=>{const[id,k]=td.dataset.cc.split('|'),p=byId[id],code=p.dim[k];
    tip(td,`<b>${esc(DK[k].rq)} · ${esc(DK[k].name)}</b><br><b style="color:#fff">${code} · ${esc(lab[code])}</b><br>
      <span style="color:#c5bdb0">${esc(p.rat[k]||rule[code])}</span>`);
    td.onclick=()=>paperModal(id)});
  $$('#pTbl td.st').forEach(td=>{const[id,r]=td.dataset.sc.split('|'),p=byId[id];
    const mean={P:'Primary contribution',S:'Substantively addressed',C:'Mentioned in passing','—':'Not addressed'}[p.codes[r]];
    tip(td,`<b>${r}</b> — ${mean}<br><span style="color:#c5bdb0">${esc(p.detail[r]||'No note recorded.')}</span>`);
    td.onclick=()=>paperModal(id,r)});
}
function drawPapers(){
  const rows=filteredPapers();
  $('#pC').textContent=`${rows.length} of ${N} papers`;
  if(pView==='table'){drawTable(rows);return}
  $('#pList').innerHTML=rows.length?rows.map(p=>`<article class="paper" id="c-${p.id}">
    <div class="hd"><div class="sid">${p.id}</div><div style="flex:1;min-width:0">
     <h4>${esc(p.title)}</h4><div class="au">${esc(p.authors)} · ${p.year} · ${esc(p.venue)}</div>
     <div class="ol">${esc(p.oneLiner)}</div>
     <div class="tags"><span class="chip yr">${p.year}</span><span class="chip">${esc(p.role)}</span>
      ${['c','k','a','ev'].map(k=>`<span class="chip" title="${esc(DK[k].name+': '+lab[p.dim[k]])}">${esc(SH(p.dim[k]))}</span>`).join('')}</div>
     </div><div class="caret">▶</div></div>
    <div class="exp">
     <div class="subh">Research-question coding</div>
     ${RQS.map(rq=>`<div class="rqrow"><div><span class="mini ${({P:'P',S:'S',C:'C'})[p.codes[rq]]||'X'}">${p.codes[rq]==='—'?'·':p.codes[rq]}</span>
      <b style="font-size:12px;margin-left:5px">${rq}</b></div><div>${esc(p.detail[rq]||'—')}</div></div>`).join('')}
     <div class="subh">Category assignments</div>
     ${DIMS.map(d=>`<div class="rqrow"><div><b>${p.dim[d.k]}</b></div><div>
      <span style="font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3);font-weight:700">${esc(d.name)}</span><br>
      <b>${esc(lab[p.dim[d.k]]||'')}</b><br><span style="color:var(--ink2)">${esc(p.rat[d.k]||'')}</span></div></div>`).join('')}
     <dl class="kv"><dt>Evidence type</dt><dd>${esc(p.evidenceType||'—')}</dd>
      <dt>Primary RQs</dt><dd>${esc(p.primaryRQ)}</dd>
      <dt>Link</dt><dd>${p.doi?`<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi:${esc(p.doi)}</a> · `:''}<a href="${esc(p.url)}" target="_blank" rel="noopener">source</a></dd></dl>
    </div></article>`).join(''):'<div class="card empty">No papers match these filters.</div>';
  $$('#pList .hd').forEach(e=>e.onclick=()=>e.parentElement.classList.toggle('open'));
}
