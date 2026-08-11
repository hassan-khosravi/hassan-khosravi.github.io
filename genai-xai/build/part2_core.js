const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N=PAPERS.length, RQS=META.rqs.map(r=>r.rq);
const YEARS=[...new Set(PAPERS.map(p=>p.year))].sort();
const SH=c=>(META.short||{})[c]||c;
const byId=Object.fromEntries(PAPERS.map(p=>[p.id,p]));
const cnt=(a,f)=>a.reduce((m,x)=>{const k=f(x);m[k]=(m[k]||0)+1;return m},{});
const PAL=['#6b7f9e','#5f8a72','#a9713f','#8d6a9e','#a8555a','#4c8c8c'];

/* ---- dimension registry: which dimensions belong to which question ---- */
const DIMS=[
 {k:'k', rq:'RQ1',name:'Educational context',       short:'Context'},
 {k:'o', rq:'RQ2',name:'Explanation object',        short:'Object'},
 {k:'p', rq:'RQ2',name:'Explanatory purpose',       short:'Purpose'},
 {k:'a', rq:'RQ3',name:'Construction architecture', short:'Architecture'},
 {k:'st',rq:'RQ4',name:'Stakeholder orientation',   short:'Stakeholder'},
 {k:'iu',rq:'RQ4',name:'Interaction/use mode',      short:'Interaction'},
 {k:'ev',rq:'RQ5',name:'Evaluation orientation',    short:'Evaluation'},
 {k:'rk',rq:'RQ6',name:'Risk orientation',          short:'Risk'}];
const DK=Object.fromEntries(DIMS.map(d=>[d.k,d]));
DIMS.forEach(d=>{ d.defs=META.cats.filter(c=>c.rq===d.rq&&c.dim===d.name);
                  d.colors={}; d.defs.forEach((c,i)=>d.colors[c.code]=PAL[i%PAL.length]); });
const lab={},rule={},dimOf={};
META.cats.forEach(c=>{lab[c.code]=c.label;rule[c.code]=c.rule});
DIMS.forEach(d=>d.defs.forEach(c=>dimOf[c.code]=d.k));
const rqInfo=rq=>META.rqs.find(r=>r.rq===rq)||{};
const dimsOf=rq=>DIMS.filter(d=>d.rq===rq);
const X=(x,cx,y,cy)=>PAPERS.filter(p=>(Array.isArray(cx)?cx.includes(p.dim[x]):p.dim[x]===cx)&&(Array.isArray(cy)?cy.includes(p.dim[y]):p.dim[y]===cy)).map(p=>p.id);

/* ---- which cross-tab each question carries, and why ---- */
const CROSS={
 RQ1:{x:'k',y:'ev',title:'Where explanation happens, against how it is tested'},
 RQ2:{x:'o',y:'p',title:'What is explained, against why'},
 RQ3:{x:'a',y:'ev',title:'What gets built, against what gets tested'},
 RQ4:{x:'st',y:'iu',title:'Who receives an explanation, against what they may do with it'},
 RQ5:{x:'a',y:'st',title:'How explanation is built, against who receives it'},
 RQ6:{x:'rk',y:'ev',title:'Which risk is named, against how the work is evaluated'}};

/* ---- tooltip ---- */
const tt=$('#tt');
function tip(el,html){
  el.addEventListener('mouseenter',()=>{tt.innerHTML=html;tt.classList.add('on')});
  el.addEventListener('mousemove',e=>{const r=tt.getBoundingClientRect();
    let x=e.clientX+14,y=e.clientY+14;
    if(x+r.width>innerWidth-10)x=e.clientX-r.width-14;
    if(y+r.height>innerHeight-10)y=e.clientY-r.height-14;
    tt.style.left=x+'px';tt.style.top=y+'px'});
  el.addEventListener('mouseleave',()=>tt.classList.remove('on'));
}
/* ---- modal ---- */
const m=$('#m'),mb=$('#mb');
$('#mx').onclick=()=>m.classList.remove('on');
m.onclick=e=>{if(e.target===m)m.classList.remove('on')};
addEventListener('keydown',e=>{if(e.key==='Escape')m.classList.remove('on')});
const show=h=>{mb.innerHTML=h;m.classList.add('on');$('.box',m).scrollTop=0};

function paperModal(id,hl){
  const p=byId[id];
  show(`<div style="font-family:var(--serif);font-weight:700;color:var(--accent);font-size:13px">${p.id}</div>
   <h2 style="font-size:18px;margin:5px 0 6px">${esc(p.title)}</h2>
   <div style="font-size:13px;color:var(--ink2)">${esc(p.authors)} · ${p.year} · ${esc(p.venue)}</div>
   <p style="font-style:italic;color:var(--ink2);font-size:13.5px;margin:12px 0 0">${esc(p.oneLiner)}</p>
   <div class="subh">Research-question coding</div>
   ${RQS.map(rq=>`<div class="rqrow" ${hl===rq?'style="background:#fdf6ee;border-radius:6px;padding-left:8px"':''}>
     <div><span class="mini ${({P:'P',S:'S',C:'C'})[p.codes[rq]]||'X'}">${p.codes[rq]==='—'?'·':p.codes[rq]}</span>
     <b style="font-size:12px;margin-left:5px">${rq}</b></div>
     <div>${esc(p.detail[rq]||'—')}</div></div>`).join('')}
   <div class="subh">Category assignments</div>
   ${DIMS.map(d=>`<div class="rqrow"><div><b>${p.dim[d.k]}</b></div>
     <div><span style="font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3);font-weight:700">${esc(d.name)}</span><br>
     <b>${esc(lab[p.dim[d.k]]||'')}</b><br><span style="color:var(--ink2)">${esc(p.rat[d.k]||'')}</span></div></div>`).join('')}
   <div class="subh">Record</div>
   <dl class="kv"><dt>Authors</dt><dd>${esc(p.authorsFull||p.authors)}</dd>
   <dt>Venue</dt><dd>${esc(p.venue)}${p.venueType?` <span style="color:var(--ink3)">(${esc(p.venueType)})</span>`:''}</dd>
   <dt>Survey role</dt><dd>${esc(p.role)}</dd>
   <dt>Evidence type</dt><dd>${esc(p.evidenceType||'—')}</dd>
   <dt>Primary RQs</dt><dd>${esc(p.primaryRQ)}</dd>
   <dt>Link</dt><dd>${p.doi?`<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi:${esc(p.doi)}</a> · `:''}<a href="${esc(p.url)}" target="_blank" rel="noopener">source</a></dd></dl>`);
}
function listModal(ids,title,sub){
  show(`<h2 style="font-size:17px">${title}</h2>
   ${sub?`<p style="color:var(--ink3);font-size:13px;margin:6px 0 14px;line-height:1.5">${sub}</p>`:''}
   ${ids.map(k=>{const p=byId[k];return `<div class="row" data-op="${k}">
     <b style="color:var(--accent)">${k}</b> ${esc(p.title)}
     <div style="font-size:12.5px;color:var(--ink3);margin-top:2px">${esc(p.authors)} · ${p.year}</div></div>`}).join('')}`);
  $$('[data-op]',mb).forEach(e=>e.onclick=()=>paperModal(e.dataset.op));
}
