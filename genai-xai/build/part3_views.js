/* ================= shared builders ================= */
function distBars(dk,onClick){
  const d=DK[dk], f=cnt(PAPERS,p=>p.dim[dk]), mx=Math.max(...d.defs.map(c=>f[c.code]||0));
  const html=d.defs.map(c=>{const n=f[c.code]||0;
    return `<div class="bar clk" data-cat="${dk}|${c.code}" style="--lw:262px">
      <div class="lab"><b>${c.code} · ${esc(c.label)}</b><span>${Math.round(n/N*100)}% of corpus</span></div>
      <div class="track"><div class="fill" style="width:${mx?n/mx*100:0}%;background:${d.colors[c.code]}"></div></div>
      <div class="val">${n}</div></div>`}).join('');
  return html;
}
function bindDist(root){
  $$('.bar[data-cat]',root).forEach(el=>{
    const [dk,code]=el.dataset.cat.split('|');
    tip(el,`<b>${code} · ${esc(lab[code])}</b><br>${esc(rule[code])}`);
    el.onclick=()=>{const ids=PAPERS.filter(p=>p.dim[dk]===code).map(p=>p.id);
      listModal(ids,`${code} · ${esc(lab[code])}`,`${ids.length} papers — ${esc(rule[code])}`)};
  });
}
function crossTab(xk,yk){
  const R=DK[xk],C=DK[yk];
  const cells={}; PAPERS.forEach(p=>{const k=p.dim[xk]+'|'+p.dim[yk];(cells[k]=cells[k]||[]).push(p.id)});
  const mx=Math.max(...Object.values(cells).map(v=>v.length));
  const ths=C.defs.map(c=>`<th title="${esc(c.label)}">${c.code}<span>${esc(SH(c.code))}</span></th>`).join('');
  const rows=R.defs.map(r=>{
    const tds=C.defs.map(c=>{const ids=cells[r.code+'|'+c.code]||[],n=ids.length;
      const a=n?0.10+0.72*(n/mx):0;
      return n?`<td class="v" data-x="${xk}|${r.code}|${yk}|${c.code}" style="background:rgba(169,113,63,${a.toFixed(3)});color:${a>.5?'#fff':'var(--ink)'}">${n}</td>`
              :`<td class="v z">—</td>`}).join('');
    const tot=PAPERS.filter(p=>p.dim[xk]===r.code).length;
    return `<tr><th class="rl">${r.code} · ${esc(r.label)}</th>${tds}<td class="tot">${tot}</td></tr>`}).join('');
  const tot=C.defs.map(c=>`<td class="tot">${PAPERS.filter(p=>p.dim[yk]===c.code).length}</td>`).join('');
  return `<div class="ctwrap"><table class="ct"><thead><tr><th class="rl">${esc(R.name)} <span style="font-weight:400;color:var(--ink3)">(${R.rq})</span></th>${ths}<th>Total</th></tr></thead>
   <tbody>${rows}<tr class="totrow"><th class="rl">Total</th>${tot}<td class="tot">${N}</td></tr></tbody></table></div>`;
}
function bindCross(root){
  $$('td.v[data-x]',root).forEach(td=>{
    const [xk,rc,yk,cc]=td.dataset.x.split('|');
    const ids=X(xk,rc,yk,cc);
    tip(td,`<b>${rc} × ${cc}</b> — ${ids.length} paper${ids.length>1?'s':''}<br><span style="color:#c5bdb0">${esc(lab[rc])}<br>× ${esc(lab[cc])}</span>`);
    td.onclick=()=>listModal(ids,`${esc(lab[rc])} &nbsp;×&nbsp; ${esc(lab[cc])}`,`${ids.length} paper${ids.length>1?'s':''}`);
  });
}
function codebookBlock(rq){
  return dimsOf(rq).map(d=>{const f=cnt(PAPERS,p=>p.dim[d.k]);
    return `${dimsOf(rq).length>1?`<div class="subh">${esc(d.name)}</div>`:''}
     ${d.defs.map(c=>`<div class="def"><div class="dh"><span class="code" style="background:${d.colors[c.code]}">${c.code}</span>
      <b>${esc(c.label)}</b><span class="n">${f[c.code]||0} papers</span></div><p>${esc(c.rule)}</p></div>`).join('')}`}).join('');
}
function stackedByYear(dk){
  const d=DK[dk],W=740,H=250,pad={t:14,r:10,b:38,l:36};
  const bw=Math.min(78,(W-pad.l-pad.r)/YEARS.length-16),plotH=H-pad.t-pad.b,step=(W-pad.l-pad.r)/YEARS.length;
  const data=YEARS.map(y=>{const ps=PAPERS.filter(p=>p.year===y);
    return{y,total:ps.length,seg:d.defs.map(c=>({c,n:ps.filter(p=>p.dim[dk]===c.code).length}))}});
  const mx=Math.max(...data.map(x=>x.total));
  let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">`;
  [...new Set(Array.from({length:6},(_,i)=>Math.round(mx*i/5)))].forEach(t=>{const yy=pad.t+plotH-t/mx*plotH;
    s+=`<line x1="${pad.l}" x2="${W-pad.r}" y1="${yy}" y2="${yy}" stroke="#e8e4dc"/><text x="${pad.l-7}" y="${yy+4}" font-size="10" fill="#8a857c" text-anchor="end">${t}</text>`});
  data.forEach((x,i)=>{const px=pad.l+step*i+(step-bw)/2;let acc=0;
    x.seg.forEach(sg=>{if(!sg.n)return;const hh=sg.n/mx*plotH,yy=pad.t+plotH-acc-hh;acc+=hh;
      s+=`<rect class="seg" x="${px}" y="${yy}" width="${bw}" height="${hh}" fill="${d.colors[sg.c.code]}" data-sg="${dk}|${sg.c.code}|${x.y}|${sg.n}|${x.total}"/>`;
      if(hh>14)s+=`<text x="${px+bw/2}" y="${yy+hh/2+4}" font-size="10" fill="#fff" text-anchor="middle" font-weight="600" pointer-events="none">${sg.n}</text>`});
    s+=`<text x="${px+bw/2}" y="${H-pad.b+17}" font-size="11.5" fill="#55524c" text-anchor="middle" font-weight="600">${x.y}</text>
        <text x="${px+bw/2}" y="${H-pad.b+30}" font-size="10" fill="#8a857c" text-anchor="middle">n=${x.total}</text>`});
  return s+'</svg>'+`<div class="legend">${d.defs.map(c=>`<span><i style="background:${d.colors[c.code]}"></i>${c.code} · ${esc(SH(c.code))}</span>`).join('')}</div>`;
}
function bindSeg(root){
  $$('.seg',root).forEach(e=>{if(!e.dataset.sg)return;const[dk,code,y,n,tot]=e.dataset.sg.split('|');
    tip(e,`<b>${y} · ${code}</b><br>${esc(lab[code])}<br>${n} of ${tot} papers`);e.style.cursor='pointer';
    e.onclick=()=>{const ids=PAPERS.filter(p=>p.year===y&&p.dim[dk]===code).map(p=>p.id);
      listModal(ids,`${code} · ${esc(lab[code])} in ${y}`,`${ids.length} paper${ids.length>1?'s':''}`)}});
}
/* ================= the RQ views ================= */
const NOTE={
 RQ1:'The educational setting whose outputs are being explained.',
 RQ2:'Two dimensions: what the explanation is about, and what it is meant to enable.',
 RQ3:'How the explanation is produced — three near-equal architectures encode three different theories of how a generated explanation earns belief.',
 RQ4:'Two dimensions: who the explanation is designed for, and what they may do with it.',
 RQ5:'What each paper’s evidence principally establishes.',
 RQ6:'The dominant risk concern each paper raises.'};
function rqView(rq){
  const r=rqInfo(rq),cov=r.cov||{},im=META.implic[rq]||{},ds=dimsOf(rq);
  let h=`<div class="rqhead"><div class="k">Research question ${rq[2]} of ${META.rqs.length}</div><h2>${esc(r.q)}</h2>
    <div class="cov"><div><b>${cov.P||0}</b>primary contribution</div><div><b>${cov.S||0}</b>substantive</div>
    <div><b>${cov.C||0}</b>mentioned in passing</div><div><b>${N}</b>papers in corpus</div></div></div>
   <div class="card"><h2>The short answer</h2><p class="answer">${esc(r.answer||'')}</p>
    ${im.implication?`<div class="call"><b>What this means:</b> ${esc(im.implication)}</div>`:''}</div>
   <div class="card"><h2>What we found</h2><ol class="f">${(r.findings||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ol></div>`;
  ds.forEach(d=>{
    h+=`<div class="card"><h2>${esc(d.name)}</h2>
      <p class="note">${esc(NOTE[rq]||'')} Hover any bar for the rule used; click for the papers.</p>
      ${distBars(d.k)}</div>`});
  if(rq==='RQ3'){
    h+=`<div class="card"><h2>How architectures are distributed across the window</h2>
      <p class="note">The corpus spans 2024–2026. Three years is too short to read as a trend; the shares are reported for description, not trajectory.</p>
      ${stackedByYear('a')}</div>`}
  const cx=CROSS[rq];
  if(cx){
    h+=`<div class="card"><h2>${esc(cx.title)}</h2>
      <p class="note">Each paper appears exactly once, so the table totals ${N}. Click any figure for the papers behind it; a dash means no paper falls there.</p>
      ${crossTab(cx.x,cx.y)}${CALL[rq]?`<div class="call">${CALL[rq]}</div>`:''}</div>`}
  h+=`<div class="card"><h2>Codebook for this question</h2>
      <p class="note">Every category with the rule applied to all ${N} papers. This is the complete basis for the figures above.</p>
      ${codebookBlock(rq)}</div>`;
  return h;
}
