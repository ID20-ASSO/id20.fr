/* ================================================================
   ID20 — site.js : éléments PARTAGÉS par toutes les pages
   - barre du haut (logo + menu + connexion adhérent)
   - bas de page
   - fenêtre modale + parcours de connexion (code à usage unique)
   - petits utilitaires (icônes, échappement…)

   Chargé après config.js, avant planning.js.
   Pour AJOUTER une page au menu : ajoute une entrée dans SITE_NAV ci-dessous.
   ================================================================ */

/* ---- Le menu : UNE SEULE source pour tout le site ---- */
const SITE_NAV = [
  { label: "Accueil",       href: "index.html" },
  { label: "L'association", href: "index.html#association" },
  { label: "Les soirées",   href: "index.html#soirees" },
  { label: "Les lieux",     href: "index.html#lieux" },
  { label: "Planning",      href: "planning.html" },
];

/* ---- État de session adhérent (en mémoire seulement) ---- */
let session = { token:null, email:null, name:null };

/* ================= utilitaires partagés ================= */
function norm(s){return (s||"").toString().trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");}
function initials(n){return (n||"?").split(/[\s']/).filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();}
function esc(s){return (s||"").toString().replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function icon(name){
  const I={
    pin:'<path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', star:'<path d="M12 3l2.5 6 6.5.5-5 4.2 1.6 6.3L12 17l-5.6 3 1.6-6.3-5-4.2 6.5-.5Z"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    dice:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
    user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+I[name]+'</svg>';
}

/* Logo dé 20 (SVG autonome — pas de fichier image requis).
   Pour utiliser ton vrai logo : remplace ce SVG par
   <img src="assets/logo-id20.png" alt="ID20" class="d20"> dans buildHeader/hero. */
const D20_LOGO = '<svg class="d20" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" aria-hidden="true">'+
  '<polygon points="50,5 89,27 89,73 50,95 11,73 11,27"/>'+
  '<polygon points="50,22 73,67 27,67" fill="currentColor" stroke="none"/>'+
  '<path d="M50,5 50,22 M89,27 73,67 M89,73 73,67 M50,95 50,67 M11,73 27,67 M11,27 27,67 M50,22 89,27 M50,22 11,27"/>'+
  '<text x="50" y="58" font-family="DM Mono, monospace" font-size="20" font-weight="600" fill="var(--ra-orange)" text-anchor="middle">20</text></svg>';

function currentPage(){ const p=location.pathname.split('/').pop(); return p||'index.html'; }

function buildHeader(){
  const here=currentPage();
  const links=SITE_NAV.map(n=>{
    const base=n.href.split('#')[0];
    const active = base===here ? ' aria-current="page"' : '';
    return '<a class="navlink" href="'+n.href+'"'+active+'>'+esc(n.label)+'</a>';
  }).join('');
  return '<div class="wrap">'+
    '<a class="brand" href="index.html"><img src="assets/logo-id20.png" alt="ID20" style="height:46px;width:auto;display:block"><div class="t"><b>ID20</b><span>Jeu de rôle · Angers</span></div></a>'+
    '<nav class="nav">'+links+'<div id="account-slot"></div></nav>'+
  '</div>';
}
function buildFooter(){
  return '<div class="wrap"><span class="dot"></span>'+
    '<span>ID20 — Association de jeu de rôle sur table, Angers · Association loi 1901</span>'+
    '<nav><a href="planning.html">Planning</a><a href="index.html#association">L\'association</a><a href="index.html#contact">Contact</a></nav></div>';
}

/* ================= fenêtre modale (partagée) ================= */
function ensureOverlay(){
  let ov=document.getElementById('overlay');
  if(!ov){
    ov=document.createElement('div');
    ov.className='overlay'; ov.id='overlay';
    ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','Espace adhérent');
    ov.innerHTML='<div class="modal" id="modal"></div>';
    ov.addEventListener('click',e=>{ if(e.target===ov) closeModal(); });
    document.body.appendChild(ov);
  }
  return ov;
}
function showModal(html){ ensureOverlay(); document.getElementById('modal').innerHTML=html; document.getElementById('overlay').classList.add('open'); }
function closeModal(){ const ov=document.getElementById('overlay'); if(ov) ov.classList.remove('open'); }

/* ================= espace adhérent ================= */
function renderAccount(){
  const slot=document.getElementById('account-slot'); if(!slot) return;
  if(session.token){
    slot.innerHTML='<div class="who"><span class="avatar">'+initials(session.name||session.email)+'</span>'+
      '<span>'+esc(session.name||session.email)+'</span><button onclick="logout()">Déconnexion</button></div>';
  }else{
    slot.innerHTML='<button class="btn sm" onclick="openLogin()">'+icon('user')+'Connexion adhérent</button>';
  }
}
function afterAuthChange(){ renderAccount(); if(typeof render==='function') render(); }
function logout(){ session={token:null,email:null,name:null}; afterAuthChange(); }

function openLogin(){
  if(!CONFIG.BACKEND_URL){
    showModal('<div class="m-head"><span class="eyebrow orange">Espace membres</span><h3>Connexion adhérent</h3></div>'+
      '<div class="m-body"><p style="color:var(--text-body);font-size:15px;line-height:1.55">'+
      'L\'inscription en ligne aux tables arrive très bientôt&nbsp;! Pour l\'instant, le planning est consultable librement. '+
      'Pour proposer une table, contactez le bureau.</p>'+
      '<div class="m-actions"><button class="btn" onclick="closeModal()">Compris</button></div></div>');
    return;
  }
  showModal('<div class="m-head"><span class="eyebrow orange">Espace membres</span><h3>Connexion adhérent</h3><p>Réservé aux adhérents ID20. Recevez un code à usage unique par e-mail.</p></div>'+
    '<div class="m-body">'+
      '<div class="field"><label for="lg-email">Votre e-mail d\'adhérent</label>'+
        '<input id="lg-email" type="email" autocomplete="email" placeholder="prenom.nom@exemple.fr">'+
        '<div class="err-msg" id="lg-err">Veuillez saisir un e-mail valide.</div></div>'+
      '<div class="m-actions"><button class="btn ghost" onclick="closeModal()">Annuler</button>'+
        '<button class="btn" onclick="requestCode()">Recevoir mon code</button></div></div>');
  setTimeout(()=>{const e=document.getElementById('lg-email'); if(e)e.focus();},50);
}

async function requestCode(){
  const email=document.getElementById('lg-email').value.trim();
  const err=document.getElementById('lg-err');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ err.classList.add('show'); return; }
  err.classList.remove('show');
  showModal('<div class="center"><div class="spin"></div><p>Envoi du code…</p></div>');
  try{ await apiPost({action:'requestCode',email}); }catch(e){ /* réponse neutre quoi qu'il arrive */ }
  // Réponse TOUJOURS neutre (on ne révèle pas si l'e-mail est adhérent).
  showModal('<div class="m-head"><h3>Vérifiez vos e-mails</h3><p>Si cet e-mail est adhérent, un code à 6 chiffres vient d\'être envoyé. Il expire dans 10 minutes.</p></div>'+
    '<div class="m-body">'+
      '<div class="field"><label for="lg-code">Code reçu par e-mail</label>'+
        '<input id="lg-code" class="otp-input" inputmode="numeric" maxlength="6" placeholder="••••••">'+
        '<div class="err-msg" id="lg-cerr">Code incorrect ou expiré.</div></div>'+
      '<input type="hidden" id="lg-email-h" value="'+esc(email)+'">'+
      '<div class="m-actions"><button class="btn ghost" onclick="openLogin()">Changer d\'e-mail</button>'+
        '<button class="btn" onclick="verifyCode()">Se connecter</button></div></div>');
  setTimeout(()=>{const c=document.getElementById('lg-code'); if(c)c.focus();},50);
}

async function verifyCode(){
  const email=document.getElementById('lg-email-h').value;
  const code=document.getElementById('lg-code').value.trim();
  const cerr=document.getElementById('lg-cerr');
  if(!/^\d{6}$/.test(code)){ cerr.textContent="Entrez les 6 chiffres."; cerr.classList.add('show'); return; }
  cerr.classList.remove('show');
  try{
    const r=await apiPost({action:'verifyCode',email,code});
    if(r && r.ok && r.token){
      session={token:r.token,email,name:r.name||email.split('@')[0]};
      afterAuthChange(); closeModal(); return;
    }
    cerr.textContent=(r&&r.error)||"Code incorrect ou expiré."; cerr.classList.add('show');
  }catch(e){ cerr.textContent="Erreur réseau, réessayez."; cerr.classList.add('show'); }
}

/* ================= appel backend =================
   IMPORTANT : Apps Script gère mal le préflight CORS.
   → on poste en text/plain pour l'éviter (cf. cahier des charges §6.5).
   ================================================================ */
async function apiPost(payload){
  if(!CONFIG.BACKEND_URL) throw new Error("backend non configuré");
  const res=await fetch(CONFIG.BACKEND_URL,{
    method:"POST",
    headers:{"Content-Type":"text/plain;charset=utf-8"}, // évite le préflight CORS
    body:JSON.stringify(payload),
  });
  return res.json();
}

/* ================= init partagé ================= */
function initSite(){
  const h=document.getElementById('site-header'); if(h){ h.className='topbar'; h.innerHTML=buildHeader(); }
  const f=document.getElementById('site-footer'); if(f){ f.className='foot'; f.innerHTML=buildFooter(); }
  ensureOverlay();
  renderAccount();
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initSite);
else initSite();
