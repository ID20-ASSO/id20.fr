/* ================================================================
   ID20 — planning.js : logique du PLANNING uniquement.
   Chargé seulement sur les pages qui contiennent un <div id="board">.
   Dépend de config.js (CONFIG) et site.js (session, showModal, icon, esc…).
   ================================================================ */

/* ---------- état ---------- */
let sessions = [];
let filter   = "all";
let target   = null;   // {si, ti} créneau visé par le modal

/* ---------- aperçu hors-ligne (si PLANNING_CSV_URL vide) ----------
   Instantané des 7 soirées à venir tiré du vrai Sheet (juin → sept. 2026).
   Remplacé par la lecture en direct dès que PLANNING_CSV_URL est renseignée. */
const DEMO_SESSIONS = [
  { date:new Date(2026,5,19), lieu:"Cartepinte", tables:[
    {type:"Initiation",locked:true,sys:"À la demande",mj:"Pierre",notes:""},
    {type:"Découverte",sys:"TGCQ",mj:"Clément",notes:""},
    {type:"Adventure League",free:true}]},
  { date:new Date(2026,5,24), lieu:"Ludotrotter", tables:[
    {type:"Initiation",locked:true,sys:"2e AL",mj:"Thomas",notes:"Pierre absent ce soir"},
    {type:"Découverte",sys:"Tales from the Loop",mj:"Ro'",notes:""},
    {type:"Adventure League",sys:"D&D 5E",mj:"Quentin H",notes:""}]},
  { date:new Date(2026,6,8), lieu:"Ludotrotter", tables:[
    {type:"Initiation",locked:true,sys:"Tiny D6",mj:"Pierre",notes:""},
    {type:"Découverte",sys:"FF XIV",mj:"Kamo Kami",notes:"4 joueurs max"},
    {type:"Adventure League",sys:"D&D 5E",mj:"Ro'",notes:""}]},
  { date:new Date(2026,6,22), lieu:"", tables:[
    {type:"Initiation",locked:true,sys:"À définir",mj:"Bureau",notes:""},
    {type:"Découverte",free:true},
    {type:"Adventure League",free:true}]},
  { date:new Date(2026,7,5), lieu:"", tables:[
    {type:"Initiation",locked:true,sys:"À définir",mj:"Bureau",notes:""},
    {type:"Découverte",free:true},
    {type:"Adventure League",free:true}]},
  { date:new Date(2026,7,19), lieu:"", tables:[
    {type:"Initiation",locked:true,sys:"À définir",mj:"Bureau",notes:""},
    {type:"Découverte",free:true},
    {type:"Adventure League",free:true}]},
  { date:new Date(2026,8,2), lieu:"", tables:[
    {type:"Initiation",locked:true,sys:"À définir",mj:"Bureau",notes:""},
    {type:"Découverte",free:true},
    {type:"Adventure League",free:true}]},
];

/* ---------- utilitaires planning ---------- */
const MONTHS=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const DOW=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
function isFreeMarker(v){return norm(v)===norm(CONFIG.FREE_MARKER) || norm(v)===""; }
function isNA(v){return norm(v)==="[n/a]"; }
// Heure de début selon le lieu (depuis content.js), insensible à la casse/accents.
function heureFor(lieu){
  const inf = window.CONTENT && CONTENT.infos;
  if(inf && inf.heures){
    for(const k in inf.heures){ if(norm(k)===norm(lieu)) return inf.heures[k]; }
  }
  return (inf && inf.heureDefaut) || "";
}
function freeCount(){let c=0; sessions.forEach(s=>s.tables.forEach(t=>{if(t.free)c++;})); return c;}

function banner(kind,html){
  const b=document.getElementById('banner'); if(!b) return;
  if(!kind){ b.className='banner'; b.innerHTML=''; return; }
  b.className='banner show '+kind; b.innerHTML=icon('info')+'<span>'+html+'</span>';
}

/* ---------- parsing CSV (Sheet publié) ---------- */
function parseCSV(text){
  const rows=[]; let row=[], cell="", q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){
      if(c==='"'){ if(text[i+1]==='"'){cell+='"';i++;} else q=false; }
      else cell+=c;
    } else {
      if(c==='"') q=true;
      else if(c===',') { row.push(cell); cell=""; }
      else if(c==='\n'){ row.push(cell); rows.push(row); row=[]; cell=""; }
      else if(c==='\r'){ /* ignore */ }
      else cell+=c;
    }
  }
  if(cell.length||row.length){ row.push(cell); rows.push(row); }
  return rows;
}
// Localise la ligne d'en-tête (celle contenant ex. "date" ET "lieu").
function findHeaderRow(rows){
  const need=(CONFIG.COLS.HEADER_CONTAINS||[]).map(norm);
  if(!need.length) return 0;
  for(let i=0;i<rows.length;i++){
    const set=rows[i].map(norm);
    if(need.every(n=>set.includes(n))) return i;
  }
  return -1;
}
function mkDate(y,mon,day){ if(y<100)y+=2000; const d=new Date(y,mon-1,day); return isNaN(d)?null:d; }
// Tolère ISO (2026-06-24), J/M/A et M/J/A (si un nombre > 12, c'est le jour ; sinon défaut français).
function parseDate(raw){
  if(!raw) return null;
  raw=raw.toString().trim();
  let m=raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);          if(m) return mkDate(+m[1],+m[2],+m[3]);
  m=raw.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})/);
  if(m){
    let a=+m[1], b=+m[2], y=+m[3], day, mon;
    if(a>12 && b<=12){ day=a; mon=b; }
    else if(b>12 && a<=12){ mon=a; day=b; }
    else { day=a; mon=b; }
    return mkDate(y,mon,day);
  }
  const d=new Date(raw); return isNaN(d)? null : d;
}
// Date locale au format yyyy-mm-dd (PAS via toISOString : éviterait un décalage de fuseau).
function ymd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function val(cells, idx){ return (idx>=0 && idx<cells.length) ? (cells[idx]||"").trim() : ""; }

function rowToSession(cells){
  const C=CONFIG.COLS;
  const date=parseDate(val(cells,C.date));
  const lieu=val(cells,C.lieu);
  if(C.REQUIRE_DATE && !date) return null;   // écarte historique / brouillon
  if(!date && !lieu) return null;
  const tables=C.tables.map(tc=>{
    const sys=val(cells,tc.sys), mj=val(cells,tc.mj), notes=val(cells,tc.notes);
    if(tc.locked){
      const undef = isFreeMarker(mj) && isFreeMarker(sys);
      return {type:tc.type, locked:true, sys: undef?"À définir":(sys||"Initiation"), mj: undef?"Bureau":(mj||"Bureau"), notes};
    }
    if(isNA(mj)||isNA(sys)) return {type:tc.type, na:true};
    if(isFreeMarker(mj))    return {type:tc.type, free:true};
    return {type:tc.type, sys, mj, notes};
  });
  return {date,lieu,tables};
}

function applyFutureFilter(){
  if(!CONFIG.FUTURE_ONLY) return;
  const today=new Date(); today.setHours(0,0,0,0);
  sessions = sessions.filter(s=>!s.date || s.date>=today);
}

async function loadPlanning(){
  if(!CONFIG.PLANNING_CSV_URL){
    sessions = DEMO_SESSIONS.slice(); applyFutureFilter();
    banner('info','<b>Aperçu hors-ligne</b>, instantané des soirées à venir. Renseignez <code>PLANNING_CSV_URL</code> dans <code>assets/config.js</code> pour la lecture en direct du Sheet.');
    render(); return;
  }
  try{
    const res=await fetch(CONFIG.PLANNING_CSV_URL,{cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const rows=parseCSV(await res.text());
    if(!rows.length) throw new Error("CSV vide");
    const hi=findHeaderRow(rows);
    const dataRows = hi>=0 ? rows.slice(hi+(CONFIG.COLS.DATA_OFFSET||1)) : rows;
    sessions = dataRows.map(rowToSession).filter(Boolean);
    applyFutureFilter();
    sessions.sort((a,b)=>(a.date?+a.date:0)-(b.date?+b.date:0));
    banner(null); render();
  }catch(e){
    console.error("Lecture du planning impossible :",e);
    sessions = DEMO_SESSIONS.slice(); applyFutureFilter();
    banner('err','Impossible de lire le planning en ligne pour l\'instant, affichage d\'un exemple. (Vérifiez l\'URL de publication CSV.)');
    render();
  }
}

/* ---------- rendu ---------- */
function tileHTML(si,ti){
  const t=sessions[si].tables[ti];
  const label='<div class="tlabel">Table '+(ti+1)+' · <b>'+t.type+'</b></div>';
  if(t.na) return '<div class="tile na">'+label+
      '<div class="hint" style="color:var(--text-muted)">Pas de table ce soir-là</div></div>';
  if(t.locked) return '<div class="tile locked">'+label+
      '<div class="sys">'+esc(t.sys)+'</div><div class="mj"><span class="avatar">'+initials(t.mj)+'</span>'+esc(t.mj)+'</div>'+
      (t.notes?'<div class="note">'+esc(t.notes)+'</div>':'')+
      '<span class="tag lock">'+icon('lock')+'Assurée par le bureau</span></div>';
  if(t.free){
    const label2 = session.token ? 'Prendre cette table' : 'Connectez-vous pour prendre';
    return '<div class="tile free">'+label+
      '<div class="hint">Personne pour l\'instant…</div>'+
      '<button class="btn take'+(CONFIG.BACKEND_URL?'':' sm')+'" '+(CONFIG.BACKEND_URL?'':'disabled title="Inscription bientôt disponible"')+' onclick="onTake('+si+','+ti+')">'+icon('plus')+label2+'</button></div>';
  }
  const mine = session.name && norm(t.mj)===norm(session.name);
  return '<div class="tile">'+label+
      '<div class="sys">'+esc(t.sys)+'</div><div class="mj"><span class="avatar">'+initials(t.mj)+'</span>'+esc(t.mj)+'</div>'+
      (t.notes?'<div class="note">'+esc(t.notes)+'</div>':'')+
      (mine
        ? '<span class="tag mine">'+icon('star')+'Votre table</span><button class="btn free-out" onclick="onRelease('+si+','+ti+')">Je ne peux plus venir, libérer ma table</button>'
        : '<span class="tag taken">'+icon('check')+'Réservée</span>')+
      '</div>';
}
function render(){
  const num=document.getElementById('tally-num'); if(num) num.textContent=freeCount();
  const board=document.getElementById('board'); if(!board) return;
  board.innerHTML="";
  if(!sessions.length){ board.innerHTML='<p style="color:var(--text-muted);padding:20px 0">Aucune soirée à venir au planning pour l\'instant.</p>'; return; }
  let shown=0;
  sessions.forEach((s,si)=>{
    const free=s.tables.filter(t=>t.free).length;
    if(filter==='free' && free===0) return;
    shown++;
    const d=s.date;
    const dStr = d ? {dow:DOW[d.getDay()],day:String(d.getDate()).padStart(2,'0'),mon:MONTHS[d.getMonth()]} : {dow:'',day:'?',mon:''};
    const el=document.createElement('div'); el.className='session';
    el.innerHTML=
      '<div class="s-head">'+
        '<div class="date"><div class="dow">'+dStr.dow+'</div><span class="day">'+dStr.day+'</span><div class="mon">'+dStr.mon+'</div></div>'+
        '<div class="s-meta"><b>Soirée JDR</b><div class="lieu">'+icon('pin')+esc(s.lieu||'Lieu à confirmer')+(s.lieu&&heureFor(s.lieu)?' · '+esc(heureFor(s.lieu)):'')+'</div></div>'+
        '<span class="s-free '+(free?'has':'none')+'">'+(free? free+' table'+(free>1?'s':'')+' libre'+(free>1?'s':'') : 'Complet')+'</span>'+
      '</div>'+
      '<div class="tables">'+s.tables.map((_,ti)=>tileHTML(si,ti)).join('')+'</div>';
    board.appendChild(el);
  });
  if(!shown){ board.innerHTML='<p style="color:var(--text-muted);padding:20px 0">Aucun créneau libre pour l\'instant, revenez bientôt&nbsp;!</p>'; }
}
function setFilter(f){
  filter=f;
  const a=document.getElementById('f-all'), b=document.getElementById('f-free');
  if(a) a.setAttribute('aria-pressed',f==='all'); if(b) b.setAttribute('aria-pressed',f==='free');
  render();
}

/* ---------- prendre une table ---------- */
function onTake(si,ti){
  if(!session.token){ openLogin(); return; }
  target={si,ti};
  const s=sessions[si], d=s.date;
  const dStr=d?DOW[d.getDay()]+' '+d.getDate()+' '+MONTHS[d.getMonth()]:'date';
  const sysOpts=CONFIG.SYSTEMS.map(x=>'<option>'+esc(x)+'</option>').join('');
  showModal('<div class="m-head"><span class="eyebrow orange">Réservation MJ</span><h3>Prendre cette table</h3><p>Vous proposez de masteriser ce créneau. Il sera réservé à votre nom.</p></div>'+
    '<div class="m-body">'+
      '<div class="chiprow"><span class="badge soft">'+dStr+'</span><span class="badge soft">'+esc(s.lieu||'Lieu à confirmer')+'</span><span class="badge orange">Table '+(ti+1)+' · '+s.tables[ti].type+'</span></div>'+
      '<div class="field"><label for="f-sys">Système proposé</label><select id="f-sys">'+sysOpts+'</select></div>'+
      '<div class="field"><label for="f-note">Scénario, niveau, nb de joueurs (optionnel)</label><input id="f-note" placeholder="Ex. : intro, 4 joueurs max"></div>'+
      '<div class="m-actions"><button class="btn ghost" onclick="closeModal()">Annuler</button>'+
        '<button class="btn" onclick="confirmTake()">'+icon('check')+'Confirmer la réservation</button></div></div>');
  setTimeout(()=>{const e=document.getElementById('f-sys'); if(e)e.focus();},50);
}
async function confirmTake(){
  const sys=document.getElementById('f-sys').value, notes=document.getElementById('f-note').value;
  const s=sessions[target.si], t=s.tables[target.ti];
  showModal('<div class="center"><div class="spin"></div><p>Vérification de la disponibilité…</p><p class="sub">Écriture dans le planning partagé</p></div>');
  try{
    const r=await apiPost({action:'register',token:session.token,date:s.date?ymd(s.date):'',lieu:s.lieu,table:target.ti+1,systeme:sys,mj:session.name,notes});
    if(!(r&&r.ok)) throw new Error((r&&r.error)||"refus");
    s.tables[target.ti]={type:t.type,sys,mj:session.name,notes};
    render();
    const left=(typeof r.freeLeft==='number')? r.freeLeft : freeCount();
    const d=s.date, dStr=d?d.getDate()+' '+MONTHS[d.getMonth()]:'';
    const leftLbl=left+' table'+(left>1?'s':'')+' libre'+(left>1?'s':'');
    showModal('<div class="center"><div class="tick">✓</div>'+
      '<h3 style="margin-top:14px">Table réservée</h3>'+
      '<p>'+esc(sys)+' · Table '+(target.ti+1)+' ('+t.type+')<br>le '+dStr+' à '+esc(s.lieu||'lieu à confirmer')+'</p>'+
      '<div class="discord"><div class="dh"><span class="d"></span>#planning-jdr · à l\'instant</div>'+
        '<div class="dm">🎲 <b>'+esc(session.name)+'</b> ouvre une table : <b>'+esc(sys)+'</b> le '+dStr+' ('+esc(s.lieu||'lieu à confirmer')+'). Il reste <b>'+leftLbl+'</b>, à vous de jouer&nbsp;!</div></div>'+
      '<div class="m-actions" style="justify-content:center;margin-top:20px"><button class="btn" onclick="closeModal()">Voir le planning</button></div></div>');
  }catch(e){
    showModal('<div class="m-head"><h3>Oups…</h3><p>Ce créneau vient peut-être d\'être pris par quelqu\'un d\'autre, ou votre session a expiré.</p></div>'+
      '<div class="m-body"><div class="m-actions"><button class="btn" onclick="closeModal();loadPlanning();">Rafraîchir le planning</button></div></div>');
  }
}

/* ---------- libérer une table ---------- */
function onRelease(si,ti){
  target={si,ti}; const t=sessions[si].tables[ti];
  showModal('<div class="m-head"><h3>Libérer cette table&nbsp;?</h3><p>Le créneau redeviendra disponible pour un autre MJ. Cette action est immédiate.</p></div>'+
    '<div class="m-body"><div class="chiprow"><span class="badge soft">'+esc(t.sys)+' · Table '+(ti+1)+'</span></div>'+
    '<div class="m-actions"><button class="btn ghost" onclick="closeModal()">Garder ma table</button>'+
      '<button class="btn" onclick="confirmRelease()">Libérer le créneau</button></div></div>');
}
async function confirmRelease(){
  const s=sessions[target.si];
  try{
    const r=await apiPost({action:'release',token:session.token,date:s.date?ymd(s.date):'',lieu:s.lieu,table:target.ti+1});
    if(!(r&&r.ok)) throw new Error();
    s.tables[target.ti]={type:s.tables[target.ti].type,free:true};
    render(); closeModal();
  }catch(e){ closeModal(); loadPlanning(); }
}

/* ---------- init (seulement si la page a un planning) ---------- */
function initPlanning(){ if(document.getElementById('board')) loadPlanning(); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initPlanning);
else initPlanning();
