/* ================= sankey ================= */
const SK_DEF=['c','k','o','p']; let skStages=[...SK_DEF];
function initSankey(){
  $('#skPick').innerHTML=DIMS.map(d=>`<label data-k="${d.k}" class="${skStages.includes(d.k)?'on':''}">
    <input type="checkbox" ${skStages.includes(d.k)?'checked':''}>${esc(d.short)}</label>`).join('');
  $$('#skPick label').forEach(l=>l.onclick=e=>{e.preventDefault();
    const k=l.dataset.k,i=skStages.indexOf(k);
    if(i>-1){if(skStages.length<=2){flash('Keep at least two dimensions.');return}skStages.splice(i,1)}
    else{if(skStages.length>=5){flash('Five is the readable maximum.');return}
      skStages.push(k);skStages.sort((a,b)=>DIMS.findIndex(d=>d.k===a)-DIMS.findIndex(d=>d.k===b))}
    sync();drawSankey()});
  $('#skReset').onclick=()=>{skStages=[...SK_DEF];sync();drawSankey()};
  sync();drawSankey();
}
const sync=()=>$$('#skPick label').forEach(l=>{const on=skStages.includes(l.dataset.k);
  l.classList.toggle('on',on);l.querySelector('input').checked=on});
function flash(msg){const e=$('#skCount');e.textContent=msg;e.style.color='var(--accent)';
  clearTimeout(e._t);e._t=setTimeout(()=>{e.style.color='';e.textContent=`${N} papers · ${skStages.length} stages`},1800)}
function drawSankey(){
  const st=skStages.map(k=>DK[k]),W=980,padT=38,padB=12,padL=6,padR=6,NW=12;
  const plotH=Math.max(340,st.length*80+200),H=plotH+padT+padB,gap=8;
  const cols=st.map((d,si)=>{const f=cnt(PAPERS,p=>p.dim[d.k]),defs=d.defs.filter(c=>(f[c.code]||0)>0);
    const avail=plotH-gap*(defs.length-1);let y=padT;
    return defs.map(c=>{const n=f[c.code],h=n/N*avail,o={d,si,code:c.code,label:c.label,n,y0:y,y1:y+h,
      x:padL+si*((W-padL-padR-NW)/(st.length-1)),color:d.colors[c.code]};y+=h+gap;return o})});
  const idx=cols.map(col=>Object.fromEntries(col.map(n=>[n.code,n])));
  const links=[];
  for(let i=0;i<st.length-1;i++){const A=st[i].k,B=st[i+1].k,mp={};
    PAPERS.forEach(p=>{const k=p.dim[A]+'|'+p.dim[B];(mp[k]=mp[k]||[]).push(p.id)});
    const src={},tgt={};
    const es=Object.entries(mp).map(([k,ids])=>{const[a,b]=k.split('|');
      return{a,b,ids,ai:cols[i].findIndex(n=>n.code===a),bi:cols[i+1].findIndex(n=>n.code===b)}})
      .filter(e=>e.ai>-1&&e.bi>-1);
    es.sort((x,y)=>x.ai-y.ai||x.bi-y.bi);
    es.forEach(e=>{const a=idx[i][e.a];src[e.a]=(src[e.a]||a.y0);
      e.sy0=src[e.a];e.sy1=e.sy0+e.ids.length/a.n*(a.y1-a.y0);src[e.a]=e.sy1});
    [...es].sort((x,y)=>x.bi-y.bi||x.ai-y.ai).forEach(e=>{const b=idx[i+1][e.b];tgt[e.b]=(tgt[e.b]||b.y0);
      e.ty0=tgt[e.b];e.ty1=e.ty0+e.ids.length/b.n*(b.y1-b.y0);tgt[e.b]=e.ty1});
    es.forEach(e=>links.push({...e,stage:i,x0:idx[i][e.a].x+NW,x1:idx[i+1][e.b].x,color:idx[i][e.a].color}))}
  let s=`<svg class="sk" viewBox="0 0 ${W} ${H}" style="width:100%;min-width:740px;height:auto">`;
  st.forEach((d,i)=>{const x=padL+i*((W-padL-padR-NW)/(st.length-1));
    const an=i===0?'start':i===st.length-1?'end':'middle',tx=i===0?x:i===st.length-1?x+NW:x+NW/2;
    s+=`<text class="stg" x="${tx}" y="14" text-anchor="${an}">${esc(d.rq)}</text>
        <text class="stg" x="${tx}" y="27" text-anchor="${an}" style="fill:var(--ink2);font-size:11px;letter-spacing:.02em;text-transform:none">${esc(d.short)}</text>`});
  links.forEach((l,i)=>{const xm=(l.x0+l.x1)/2;
    s+=`<path class="lnk" data-l="${i}" fill="${l.color}" d="M${l.x0},${l.sy0} C${xm},${l.sy0} ${xm},${l.ty0} ${l.x1},${l.ty0} L${l.x1},${l.ty1} C${xm},${l.ty1} ${xm},${l.sy1} ${l.x0},${l.sy1} Z"/>`});
  cols.forEach((col,si)=>col.forEach(n=>{const last=si===st.length-1;
    const tx=last?n.x-5:n.x+NW+5,an=last?'end':'start';
    s+=`<g class="nd" data-n="${si}|${n.code}"><rect x="${n.x}" y="${n.y0}" width="${NW}" height="${Math.max(n.y1-n.y0,1.5)}" rx="2.5" fill="${n.color}"/>
      <text class="nlab" x="${tx}" y="${(n.y0+n.y1)/2-1}" text-anchor="${an}">${esc(SH(n.code))}</text>
      <text class="nsub" x="${tx}" y="${(n.y0+n.y1)/2+10}" text-anchor="${an}">${n.n}</text></g>`}));
  s+='</svg>'; $('#skOut').innerHTML=s;
  const g=$('#skOut .sk');
  $$('.lnk',g).forEach(e=>{const l=links[+e.dataset.l];
    tip(e,`<b>${esc(SH(l.a))} → ${esc(SH(l.b))}</b> — ${l.ids.length} paper${l.ids.length>1?'s':''}`);
    e.onmouseenter=()=>{g.classList.add('focus');e.classList.add('hi');
      $$(`[data-n="${l.stage}|${l.a}"],[data-n="${l.stage+1}|${l.b}"]`,g).forEach(x=>x.classList.add('hi'))};
    e.onmouseleave=()=>{g.classList.remove('focus');$$('.hi',g).forEach(x=>x.classList.remove('hi'))};
    e.onclick=()=>listModal(l.ids,`${esc(lab[l.a])} → ${esc(lab[l.b])}`,`${l.ids.length} paper${l.ids.length>1?'s':''}`)});
  $$('.nd',g).forEach(e=>{const[si,code]=e.dataset.n.split('|'),d=st[+si],n=idx[+si][code];
    tip(e,`<b>${code} · ${esc(n.label)}</b><br>${n.n} of ${N} papers<br><span style="color:#c5bdb0">click to list</span>`);
    e.onmouseenter=()=>{g.classList.add('focus');e.classList.add('hi');
      const ids=new Set(PAPERS.filter(p=>p.dim[d.k]===code).map(p=>p.id));
      links.forEach((l,i)=>{if(l.ids.some(x=>ids.has(x))){$(`[data-l="${i}"]`,g).classList.add('hi');
        $$(`[data-n="${l.stage}|${l.a}"],[data-n="${l.stage+1}|${l.b}"]`,g).forEach(x=>x.classList.add('hi'))}})};
    e.onmouseleave=()=>{g.classList.remove('focus');$$('.hi',g).forEach(x=>x.classList.remove('hi'))};
    e.onclick=()=>listModal(PAPERS.filter(p=>p.dim[d.k]===code).map(p=>p.id),`${code} · ${esc(n.label)}`,rule[code])});
  $('#skCount').textContent=`${N} papers · ${st.length} stages`;
  g.dataset.check=JSON.stringify(st.map((d,i)=>cols[i].reduce((a,n)=>a+n.n,0)));
}
/* ================= router ================= */
const VIEWS=[{id:'overview',label:'Overview'},...RQS.map(r=>({id:r,label:r})),{id:'papers',label:'Papers'}];
function go(id){
  $$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.v===id));
  const main=$('#main');
  main.innerHTML=`<section class="view on">${
    id==='overview'?overview():id==='papers'?papersView():rqView(id)}</section>`;
  if(id==='overview')bindOverview();
  else if(id==='papers')bindPapers();
  else{bindDist(main);bindCross(main);bindSeg(main)}
  scrollTo({top:0,behavior:'smooth'});
}
$('#tabs').innerHTML=VIEWS.map((v,i)=>
  (i===1||i===8?'<span class="sep"></span>':'')+`<button data-v="${v.id}">${v.label}</button>`).join('');
$$('#tabs button').forEach(b=>b.onclick=()=>go(b.dataset.v));
$('#hdrSub').textContent=META.subtitle;
$('#foot').innerHTML=`${N} papers, ${YEARS[0]}–${YEARS[YEARS.length-1]}, each read in full and coded against
 ${META.rqs.length===6?'six':'seven'} research questions and ${DIMS.length} dimensions (${DIMS.reduce((a,d)=>a+d.defs.length,0)} categories).
 Every figure is computed at load time from the embedded coding — no hard-coded totals.
 Self-contained: no external scripts, styles or network requests.`;
go('overview');
