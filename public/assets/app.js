'use strict';
const $=s=>document.querySelector(s); const app=$('#app');
const G3_PERIOD_FILTERS=Object.create(null);
const G3_CONTRACT_PERIOD_FILTERS=Object.create(null);
const id=p=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
const today=()=>new Date().toISOString().slice(0,10);
const randomPart=(len=8)=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let out=''; for(let i=0;i<len;i++) out+=chars[Math.floor(Math.random()*chars.length)]; return out};
const autoCode=()=> randomPart(7); // Code produit/service : 7 caractères, chiffres et lettres, sans espace
function uniqueItemCode(d,cid,currentId=''){
  d.items=d.items||[];
  let code='';
  do{ code=autoCode(); }while(d.items.some(i=>i.companyId===cid&&i.id!==currentId&&String(i.code||'').toUpperCase()===code.toUpperCase()));
  return code;
}
const money=n=>Number(n||0).toLocaleString('fr-FR')+' FCFA';
const supportPhone='2250777041790';
const supportEmail='megaservicediabo@gmail.com';


function closeG3ProPopup(){document.querySelectorAll('.g3ProPopupBackdrop').forEach(x=>x.remove());}
function g3ProPopup(title,message,type='info',actionsHtml=''){
  closeG3ProPopup();
  const icon=type==='danger'?'⚠️':(type==='success'?'✅':'ℹ️');
  const cls=type==='danger'?' danger':(type==='success'?' success':'');
  const safeTitle=esc(title||'Information');
  const safeMsg=esc(message||'').replace(/\n/g,'<br>');
  document.body.insertAdjacentHTML('beforeend',`<div class="g3ProPopupBackdrop" onclick="if(event.target===this)closeG3ProPopup()"><div class="g3ProPopupCard${cls}" onclick="event.stopPropagation()"><button class="g3ProPopupClose" onclick="closeG3ProPopup()">×</button><div class="g3ProPopupIcon">${icon}</div><h2>${safeTitle}</h2><p>${safeMsg}</p><div class="g3ProPopupActions">${actionsHtml||'<button onclick="closeG3ProPopup()">Compris</button>'}</div></div></div>`);
}
function g3ProInfo(message,title='Information'){
  g3ProPopup(title,message,'info','<button onclick="closeG3ProPopup()">Compris</button>');
}
function g3ProWarning(message,title='Attention'){
  g3ProPopup(title,message,'danger','<button onclick="closeG3ProPopup()">Compris</button>');
}
function g3ProConfirm(title,message,confirmCode,confirmLabel='Confirmer'){
  const code=String(confirmCode||'').replace(/"/g,'&quot;');
  g3ProPopup(title,message,'danger',`<button class="danger" onclick="closeG3ProPopup();${code}">${esc(confirmLabel)}</button><button class="secondary" onclick="closeG3ProPopup()">Annuler</button>`);
}

const GLOBAL3_PLANS={
  FREE:{code:'FREE',label:'Plan gratuit — FREE',price:0,statut:'FREE',target:'Petits commerces, débutants et test de la plateforme.',maxUsers:1,maxItems:5,maxCategories:1,limits:['1 seule catégorie autorisée : produits OU services','Maximum 5 produits OU 5 services','1 seul utilisateur : administrateur uniquement','Accès limité aux sections Accueil, Vente, Panier, Rapport, Stock, 12 mois et Paramètre','Factures avec branding GLOBAL 3 visible en filigrane centré sans cacher les textes'],features:['Accueil','Vente simple','Panier','Rapport simple','Stock limité','12 mois','Paramètre limité','Historique des ventes','Impression de factures avec branding GLOBAL 3'],restrictions:['Marketplace','Multi-utilisateurs','Produits illimités','Services illimités','Clients sous contrat']},
  BUSINESS:{code:'BUSINESS',label:'Plan Business',price:3500,statut:'BUSINESS',target:'PME, boutiques et entreprises de services.',maxUsers:3,maxItems:Infinity,maxCategories:Infinity,limits:['Multi-utilisateurs limité à 3 utilisateurs','Clients sous contrat inclus','Marketplace public non inclus'],features:['Catégories limitées','Produits limités','Services limités','Multi-utilisateurs limités','Gestion avancée','Rapports détaillés','Facturation professionnelle','Clients sous contrat'],restrictions:['Marketplace public']},
  BUSINESS_PLUS:{code:'BUSINESS_PLUS',label:'Plan Business Plus',price:5500,statut:'BUSINESS_PLUS',target:'Grandes entreprises, commerces premium et entreprises voulant vendre publiquement.',maxUsers:Infinity,maxItems:Infinity,maxCategories:Infinity,limits:['Accès total premium'],features:['Toutes les fonctionnalités BUSINESS','Marketplace intégré','Boutique publique moderne avec inscription client et panier','Publication des produits et services avec photo','Réception des commandes clients','Panier moderne','Promotions','Gestion des livraisons','Publicités marketplace','Référencement dans GLOBAL MARKET','Support prioritaire'],restrictions:[]}
};
function planCode(company){const raw=String(company?.planCode||company?.plan||company?.status||'FREE').toUpperCase(); if(raw.includes('BUSINESS_PLUS')||raw.includes('PLUS')) return 'BUSINESS_PLUS'; if(raw.includes('BUSINESS')) return 'BUSINESS'; return 'FREE'}
function planDef(company){return GLOBAL3_PLANS[planCode(company)]||GLOBAL3_PLANS.FREE}
function hasPlanFeature(company,feature){const code=planCode(company); if(feature==='marketplace'||feature==='public_shop'||feature==='public_market') return code==='BUSINESS_PLUS'; if(feature==='multi_users') return code==='BUSINESS'||code==='BUSINESS_PLUS'; if(feature==='unlimited_items'||feature==='unlimited_categories'||feature==='qr'||feature==='contracts') return code==='BUSINESS'||code==='BUSINESS_PLUS'; return true}
function maxUsersAllowed(company){return planDef(company).maxUsers}
function userLimitLabel(company){const n=maxUsersAllowed(company); return n===Infinity?'illimité':String(n)}
function canCreateMoreUsers(company,d){const n=maxUsersAllowed(company); if(n===Infinity) return true; return (d.users||[]).filter(u=>u.companyId===company.id).length < n}
function planStatusText(company){return planDef(company).statut}
function renderPlanBadges(company){const p=planDef(company); return p.features.map(f=>`<span>✅ ${esc(f)}</span>`).join('')}
function assertPlanFeature(company,feature,msg){if(!hasPlanFeature(company,feature)){alert(msg||'Fonction réservée à un abonnement supérieur. Contactez MEGA SERVICES pour activer le plan adapté.'); return false} return true}
function activateCompanyPlan(cid,code){const d=seed(), c=(d.companies||[]).find(x=>x.id===cid), p=GLOBAL3_PLANS[code]; if(!c||!p)return; let days=code==='FREE'?30:Number(prompt('Durée de l’abonnement en jours :', code==='BUSINESS_PLUS'?'30':'30')||30); let amount=code==='FREE'?0:Number(prompt('Montant payé :','0')||0); c.planCode=code; c.plan=p.label; c.status=code; c.subscriptionStart=today(); c.subscriptionEnd=new Date(Date.now()+days*86400000).toISOString().slice(0,10); c.updatedAt=new Date().toISOString(); d.payments=d.payments||[]; d.payments.push({id:id('pay'),ref:'PAY-'+today().replaceAll('-','')+'-'+randomPart(4),companyId:cid,amount,plan:p.label,status:code==='FREE'?'Gratuit':'Payé',date:new Date().toISOString(),method:code==='FREE'?'-':'Activation Super Admin'}); save(d); closeSuperModal(); renderSuper(); alert(p.label+' activé avec succès.');}
function planActivationButtons(cid,currentCode){return `<div class="planActivationBox"><h3>Activation abonnement par Super Admin</h3><p>Activez le plan choisi par l’utilisateur. Les accès et restrictions sont appliqués automatiquement.</p><div class="planButtons"><button class="${currentCode==='FREE'?'active':''}" onclick="activateCompanyPlan('${cid}','FREE')">Activer FREE</button><button class="${currentCode==='BUSINESS'?'active':''}" onclick="activateCompanyPlan('${cid}','BUSINESS')">Activer BUSINESS</button><button class="${currentCode==='BUSINESS_PLUS'?'active':''}" onclick="activateCompanyPlan('${cid}','BUSINESS_PLUS')">Activer BUSINESS PLUS</button></div></div>`}

const slugify=s=>String(s||'boutique').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'boutique';
function secureDocLink(ref){return location.origin+location.pathname+'#doc/'+encodeURIComponent(ref)}
function qrPayload(ref,company,total,date){return JSON.stringify({document:ref,entreprise:company?.name||'',date:date||today(),montant:Number(total||0),lien:secureDocLink(ref)})}
function qrImg(data,size=150){return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`}
function qrBlock(ref,company,total,date){return ''}

function g3AmountWords(n){
  n=Math.round(Number(n||0));
  const units=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
  const tens=['','','vingt','trente','quarante','cinquante','soixante'];
  function under100(x){
    if(x<17)return units[x]; if(x<20)return 'dix-'+units[x-10]; if(x<70){const t=Math.floor(x/10),u=x%10; return tens[t]+(u?'-'+(u===1?'et-un':units[u]):'');}
    if(x<80)return 'soixante-'+under100(x-60); if(x<100)return 'quatre-vingt'+(x===80?'':'-'+under100(x-80));
  }
  function under1000(x){const h=Math.floor(x/100),r=x%100; let out=''; if(h){out=(h===1?'cent':units[h]+' cent')+(r?' ':'');} return out+(r?under100(r):'');}
  if(n===0)return 'ZÉRO FRANC CFA';
  let parts=[]; const millions=Math.floor(n/1000000); n%=1000000; const thousands=Math.floor(n/1000); const rest=n%1000;
  if(millions) parts.push((millions===1?'un':under1000(millions))+' million'+(millions>1?'s':''));
  if(thousands) parts.push(thousands===1?'mille':under1000(thousands)+' mille');
  if(rest) parts.push(under1000(rest));
  return (parts.join(' ')+' francs cfa').toUpperCase();
}
function premiumInvoiceRows(lines,minRows=0){
  // Présentation facture : n'afficher que les lignes réellement vendues.
  // Les anciennes lignes vides de remplissage sont supprimées pour obtenir un PDF propre.
  lines=Array.isArray(lines)?lines.filter(Boolean):[];
  return lines.map((s,i)=>{
    const qty=Number(s.qty||1), unit=Number(s.unit||0), lineTotal=Number(s.total||0);
    return `<tr><td>${i+1}</td><td>${esc(s.name||'')}</td><td>${qty}</td><td>${Number(unit||0).toLocaleString('fr-FR')}</td><td>${Number(lineTotal||0).toLocaleString('fr-FR')}</td></tr>`
  }).join('') || `<tr><td colspan="5" class="invoiceEmptyLine">Aucun produit/service renseigné.</td></tr>`;
}
function invoiceClientParts(raw){
  const str=String(raw||'Non précisé').trim();
  const parts=str.split(/\s+[—-]\s+/);
  const name=(parts[0]||str||'Non précisé').trim();
  const phone=(parts[1]||'').trim();
  return {name,phone,address:'DIABO-CI'};
}

function toggleSaleClientFields(){
  const type=document.getElementById('saleClientType')?.value||'particulier';
  const part=document.getElementById('saleClientParticulier');
  const contrat=document.getElementById('saleClientContrat');
  if(part) part.classList.toggle('hidden', type==='contrat');
  if(contrat) contrat.classList.toggle('hidden', type!=='contrat');
}
function getSaleClientInfo(){
  const type=document.getElementById('saleClientType')?.value||'particulier';
  if(type==='contrat'){
    const clientId=document.getElementById('saleContractClient')?.value||'';
    const {d,company}=current();
    const c=(d.clients||[]).find(x=>x.id===clientId && x.companyId===company.id);
    if(!clientId || !c) return {ok:false,type:'contrat',clientId:'',label:''};
    return {ok:true,type:'contrat',clientId:c.id,label:[c.name,c.phone].filter(Boolean).join(' — ')};
  }
  const name=String(document.getElementById('saleClientName')?.value||'').trim()||'Client comptoir';
  const phone=String(document.getElementById('saleClientPhone')?.value||'').trim();
  const address=String(document.getElementById('saleClientAddress')?.value||'').trim();
  return {ok:true,type:'particulier',clientId:'',label:[name,phone,address].filter(Boolean).join(' — ')};
}
function getSaleClientLabel(){
  const info=getSaleClientInfo();
  return info.label||'Client comptoir';
}
function getSaleClientId(){
  const info=getSaleClientInfo();
  return info.clientId||'';
}
function openClientContractPopup(){
  const modal=document.getElementById('clientContractModal');
  if(!modal) return;
  ['ccNamePopup','ccPhonePopup','ccObsPopup'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';});
  const r=document.getElementById('ccRemisePopup'); if(r) r.value=0;
  const m=document.getElementById('ccModePopup'); if(m) m.value='MENSUELLE';
  modal.classList.remove('hidden');
  setTimeout(()=>document.getElementById('ccNamePopup')?.focus(),60);
}
function closeClientContractPopup(){
  document.getElementById('clientContractModal')?.classList.add('hidden');
}
function premiumSaleInvoiceHTML(company,s,ref,dt){
  const fee=Number(s.serviceFee||0), total=Number(s.total||0);
  const rows=premiumInvoiceRows([s],0);
  const c=invoiceClientParts(s.client||'');
  const dateFact=esc(dt||new Date(s.validatedAt||s.date||Date.now()).toLocaleString('fr-FR'));
  return `<div class="premiumInvoiceModel">${freeWatermark(company)}
    <section class="invoiceTitleBlock"><h1>FACTURE / REÇU DE VENTE</h1><div class="invoiceBadge">N° ${esc(ref)}</div></section>
    <section class="invoiceClientPanel">
      <div class="invoiceClientIdentity"><div class="invoiceRoundIcon">♡</div><div><h2>CLIENT</h2><p><b>Nom</b><span>:</span> ${esc(c.name)}</p><p><b>Téléphone</b><span>:</span> ${esc(c.phone||'')}</p><p><b>Adresse</b><span>:</span> ${esc(c.address)}</p></div></div>
      <div class="invoiceMetaList"><p><b>▣ Date facture</b><span>:</span> ${dateFact}</p><p><b>▣ N° Facture</b><span>:</span> ${esc(ref)}</p><p><b>☷ Nombre de ligne(s)</b><span>:</span> 1</p></div>
    </section>
    <table class="premiumInvoiceTable"><thead><tr><th>N°</th><th>DÉSIGNATION</th><th>QUANTITÉ</th><th>PRIX UNIT. (FCFA)</th><th>MONTANT (FCFA)</th></tr></thead><tbody>${rows}</tbody></table>
    <section class="invoiceBottomGrid"><div class="amountWordsCard"><p>Arrêtée la présente facture à la somme de :</p><h2>${g3AmountWords(total)}</h2><h3>( ${money(total)} )</h3></div><div class="totalCard"><div><b>TOTAL HT</b><span>${money(total-fee)}</span></div><div><b>FRAIS DE SERVICE</b><span>${money(fee)}</span></div><div class="totalFinalV2"><b>TOTAL TTC</b><span>${money(total)}</span></div></div></section>
    <section class="invoiceSignatureGrid invoiceSignatureGestionnaireOnly"><div>Le Gestionnaire</div></section>
    <footer class="invoiceThanks">★ MERCI POUR VOTRE CONFIANCE ★<small>MEGA SERVICES SARL U, votre partenaire informatique et services de proximité.</small></footer>
  </div>`;
}




/* Facture unique multi-produits / multi-services */
function getInvoiceGroupSales(d,company,sale){
  if(!sale) return [];
  const gid=sale.invoiceGroupId||sale.invoiceId||'';
  if(gid){
    return (d.sales||[]).filter(x=>saleBelongsToCompany(x,company.id) && (x.invoiceGroupId===gid || x.invoiceId===gid)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  }
  return [sale];
}
function premiumMultiSaleInvoiceHTML(company,lines,ref,dt){
  lines=Array.isArray(lines)?lines.filter(Boolean):[];
  if(!lines.length) return '';
  const first=lines[0];
  const total=lines.reduce((a,s)=>a+Number(s.total||0),0);
  const fee=lines.reduce((a,s)=>a+Number(s.serviceFee||0),0);
  const rows=premiumInvoiceRows(lines,0);
  const c=invoiceClientParts(first.client||'');
  const dateFact=esc(dt||new Date(first.validatedAt||first.date||Date.now()).toLocaleString('fr-FR'));
  return `<div class="premiumInvoiceModel">${freeWatermark(company)}
    <section class="invoiceTitleBlock"><h1>FACTURE / REÇU DE VENTE</h1><div class="invoiceBadge">N° ${esc(ref)}</div></section>
    <section class="invoiceClientPanel">
      <div class="invoiceClientIdentity"><div class="invoiceRoundIcon">♡</div><div><h2>CLIENT</h2><p><b>Nom</b><span>:</span> ${esc(c.name)}</p><p><b>Téléphone</b><span>:</span> ${esc(c.phone||'')}</p><p><b>Adresse</b><span>:</span> ${esc(c.address)}</p></div></div>
      <div class="invoiceMetaList"><p><b>▣ Date facture</b><span>:</span> ${dateFact}</p><p><b>▣ N° Facture</b><span>:</span> ${esc(ref)}</p><p><b>☷ Nombre de ligne(s)</b><span>:</span> ${lines.length}</p></div>
    </section>
    <table class="premiumInvoiceTable"><thead><tr><th>N°</th><th>DÉSIGNATION</th><th>QUANTITÉ</th><th>PRIX UNIT. (FCFA)</th><th>MONTANT (FCFA)</th></tr></thead><tbody>${rows}</tbody></table>
    <section class="invoiceBottomGrid"><div class="amountWordsCard"><p>Arrêtée la présente facture à la somme de :</p><h2>${g3AmountWords(total)}</h2><h3>( ${money(total)} )</h3></div><div class="totalCard"><div><b>TOTAL HT</b><span>${money(total-fee)}</span></div><div><b>FRAIS DE SERVICE</b><span>${money(fee)}</span></div><div class="totalFinalV2"><b>TOTAL TTC</b><span>${money(total)}</span></div></div></section>
    <section class="invoiceSignatureGrid invoiceSignatureGestionnaireOnly"><div>Le Gestionnaire</div></section>
    <footer class="invoiceThanks">★ MERCI POUR VOTRE CONFIANCE ★<small>MEGA SERVICES SARL U, votre partenaire informatique et services de proximité.</small></footer>
  </div>`;
}
function standaloneMultiInvoiceHTML(company,lines,ref,dt){
  const invoiceBody=premiumMultiSaleInvoiceHTML(company,lines,ref,dt);
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Facture '+esc(ref)+'</title><style>'+invoicePrintStyles()+'</style></head><body><div class="printToolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div><div class="invoiceA4">'+invoiceA4HeaderHTML(company)+invoiceBody+'</div><script>setTimeout(function(){window.focus()},200);</script></body></html>';
}

function getSubscriptionInfo(company,users=[]){const end=new Date((company?.subscriptionEnd||today())+'T23:59:59'); const left=Math.max(0,Math.ceil((end-new Date())/86400000)); return {left,status:statusCompany(company),users:users.length}}
function marketplaceUrl(company){return location.origin+location.pathname+'#boutique/'+slugify(company?.name||'entreprise')}
function shareText(txt){if(navigator.share){navigator.share({text:txt}).catch(()=>{})}else{navigator.clipboard?.writeText(txt); alert('Lien copié / prêt à partager.')}}

const YK='GLOBAL3_MANAGEMENT_YEAR_V1';
const MK='GLOBAL3_ACTIVE_MONTH_V1';
const monthsList=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function getCompanyCategoryRecords(d,cid){
  d.categories=d.categories||{};
  const saved=Array.isArray(d.categories[cid])?d.categories[cid]:[];
  const map=new Map();
  saved.forEach(c=>{ if(c&&c.name) map.set(String(c.name), {name:String(c.name), kind:(c.kind==='service'?'service':'boutique')}); });
  (d.items||[]).filter(i=>i.companyId===cid&&i.cat).forEach(i=>{
    if(!map.has(i.cat)) map.set(i.cat,{name:i.cat,kind:(String(i.type||'boutique')==='service'?'service':'boutique')});
  });
  const arr=[...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'fr'));
  d.categories[cid]=arr;
  return arr;
}
function getCompanyCategories(d,cid){return getCompanyCategoryRecords(d,cid).map(c=>c.name)}
function categoryKind(cat){
  const {d,company}=current();
  const rec=company?getCompanyCategoryRecords(d,company.id).find(c=>c.name===cat):null;
  return rec?.kind || 'boutique';
}
function saveCompanyCategoryRecords(d,cid,records){d.categories=d.categories||{}; d.categories[cid]=records;}

function getManageYear(){
  const {company}=current();
  return Number(company?.managementYear || new Date().getFullYear());
}
function getActiveMonth(){
  const {company}=current();
  const m=Number(company?.activeMonth ?? new Date().getMonth());
  return Math.max(0,Math.min(11,isNaN(m)?new Date().getMonth():m));
}
function saveManagementPeriod(y,m){
  y=Math.max(1,Number(y||new Date().getFullYear()));
  m=Math.max(0,Math.min(11,Number(m||0)));
  const {d,company}=current();
  if(company){
    const c=(d.companies||[]).find(x=>x.id===company.id);
    if(c){c.managementYear=y; c.activeMonth=m; c.updatedAt=new Date().toISOString(); save(d);}
  }
}

function getObligationYear(){
  const {company}=current();
  return Number(company?.obligationYear || getManageYear() || new Date().getFullYear());
}
function getObligationMonth(){
  const {company}=current();
  const m=Number(company?.obligationMonth ?? getActiveMonth() ?? new Date().getMonth());
  return Math.max(0,Math.min(11,isNaN(m)?new Date().getMonth():m));
}
function saveObligationPeriod(y,m){
  y=Math.max(1,Number(y||new Date().getFullYear()));
  m=Math.max(0,Math.min(11,Number(m||0)));
  const {d,company}=current();
  if(company){
    const c=(d.companies||[]).find(x=>x.id===company.id);
    if(c){c.obligationYear=y; c.obligationMonth=m; c.updatedAt=new Date().toISOString(); save(d);}
  }
}
function setObligationPeriod(deltaMonth=0){
  if(!requireAdmin()) return;
  let y=getObligationYear(), m=getObligationMonth()+Number(deltaMonth||0);
  while(m<0){m+=12;y-=1;}
  while(m>11){m-=12;y+=1;}
  saveObligationPeriod(y,m); renderDash('param');
}
function applyObligationPeriod(){
  if(!requireAdmin()) return;
  const y=Math.max(1,Number($('#obligationYear')?.value||new Date().getFullYear()));
  const m=Math.max(0,Math.min(11,Number($('#obligationMonth')?.value||0)));
  saveObligationPeriod(y,m); renderDash('param');
}
function obligationPeriodControls(){
  const y=getObligationYear(), m=getObligationMonth();
  const opts=monthsList.map((name,i)=>`<option value="${i}" ${i===m?'selected':''}>${esc(name)}</option>`).join('');
  return `<div class="obligationPeriodBox no-print">
    <div class="obligationPeriodTitle"><b>Sélection des obligations par mois</b><span>Mois affiché : ${esc(monthsList[m])} ${y}</span></div>
    <div class="obligationPeriodGrid">
      <button class="btn2" onclick="setObligationPeriod(-1)">← Mois précédent</button>
      <label>Année des obligations<input id="obligationYear" type="number" value="${y}" onchange="applyObligationPeriod()" min="2000" max="2100"></label>
      <label>Mois des obligations<select id="obligationMonth" onchange="applyObligationPeriod()">${opts}</select></label>
      <button class="btn2" onclick="setObligationPeriod(1)">Mois suivant →</button>
    </div>
  </div>`;
}
function isInManageYear(s){const dt=new Date(s.date); return dt.getFullYear()===getManageYear();}
function isInActiveExercise(s){const dt=new Date(s.date); return dt.getFullYear()===getManageYear() && dt.getMonth()===getActiveMonth();}
function exerciseKey(y=getManageYear(),m=getActiveMonth()){return String(y)+'-'+String(Number(m)+1).padStart(2,'0')}
function getExerciseState(y=getManageYear(),m=getActiveMonth()){const {company}=current(); const k=exerciseKey(y,m); return company?.exerciseLocks?.[k]||'open'}
function isExerciseLocked(y=getManageYear(),m=getActiveMonth()){return ['locked','closed'].includes(getExerciseState(y,m))}
function ensureActiveExerciseEditable(msg=''){return true} // Ventes illimitées : aucun verrouillage mensuel/annuel ne bloque les opérations.
function isSaleExerciseLocked(s){const dt=new Date(s.date); return isExerciseLocked(dt.getFullYear(),dt.getMonth())}
function setActiveExerciseState(state){if(!requireAdmin()) return;if(!ensureDataUnlocked('le verrouillage ou la clôture de l’exercice')) return; const {d,company}=current(); const c=(d.companies||[]).find(x=>x.id===company.id); if(!c)return; c.exerciseLocks=c.exerciseLocks||{}; c.exerciseLocks[exerciseKey()]=state; c.updatedAt=new Date().toISOString(); save(d); renderDash('mois')}
function activeExerciseBadge(){return '✅ Ventes illimitées dans le temps'}
function setManageYear(delta){if(!requireAdmin()) return; saveManagementPeriod(getManageYear()+Number(delta||0),getActiveMonth()); renderDash('mois')}
function applyManagementYear(){if(!requireAdmin()) return;if(!ensureDataUnlocked('la modification de l’année et du mois de gestion')) return;const y=Math.max(1,Number($('#managementYear')?.value||new Date().getFullYear())); const m=Math.max(0,Math.min(11,Number($('#managementMonth')?.value||0))); saveManagementPeriod(y,m); renderDash('mois'); g3ProInfo('Année du résumé appliquée au tableau de gestion 12 mois, sans verrouiller les ventes.','Résumé appliqué')}
function openManagementMonth(i){const y=getManageYear(); const m=String(Number(i)+1).padStart(2,'0'); savePeriodFilter('report',{type:'month',month:String(y)+'-'+m,year:String(y)}); renderDash('rapports')}
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

async function sha256Text(text){
  const data=new TextEncoder().encode(String(text||''));
  const digest=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function buildPasswordHash(password,salt=''){
  salt=salt||randomPart(16)+Date.now().toString(36);
  return 'sha256$'+salt+'$'+await sha256Text(salt+'|GLOBAL3|'+String(password||''));
}
async function setUserPasswordSecure(user,password){
  if(!user) return;
  user.passwordHash=await buildPasswordHash(password||'1234');
  delete user.password;
}
async function verifyUserPassword(user,password){
  if(!user) return false;
  if(user.passwordHash){
    const parts=String(user.passwordHash).split('$');
    if(parts.length===3 && parts[0]==='sha256') return await buildPasswordHash(password,parts[1])===user.passwordHash;
  }
  return String(user.password||'')===String(password||'');
}
async function migratePasswordIfPlain(user,password,d){
  if(user && !user.passwordHash && String(user.password||'')===String(password||'')){
    await setUserPasswordSecure(user,password);
    if(d) save(d);
  }
}
function passwordFieldPlaceholder(u){return u?.passwordHash?'••••••••':''}


// ================================================================
// GLOBAL 3 — MODE EN LIGNE OBLIGATOIRE KV + D1
// Règle métier : aucun enregistrement n'est validé uniquement en local.
// 1) Chargement depuis Cloudflare KV/D1 au démarrage ;
// 2) Sauvegarde directe et confirmée par /api/save ;
// 3) Aucune sauvegarde navigateur : la source officielle est uniquement KV + D1.
// ================================================================
const CLOUD_KEY='global3_all';
let CLOUD_DATA=null;
let CLOUD_SESSION=null;
let CLOUD_SAVE_IN_PROGRESS=false;
let CLOUD_LAST_REMOTE_SIGNATURE='';
const CLOUD_API_BASE='/api';
const CLOUD_DATA_KEY='global3:data';
const CLOUD_SESSION_KEY='global3:session';
const CLOUD_TIMEOUT_MS=12000;
function defaultData(){return {companies:[],users:[{id:'super',companyId:null,name:'MEGA SERVICES DIABO',email:'mega@services.local',passwordHash:'sha256$G3_DEFAULT_SUPERADMIN_2026$6a8e54d650efaa5902cc6d5e9be24bce19060ee29d8e892d7eb23b76262a41b1',role:'superadmin',status:'active',mustChangePassword:true,createdAt:new Date().toISOString()}],items:[],sales:[],payments:[],loginAttempts:{}}}
function stableDataSignature(d){try{return JSON.stringify(d||{});}catch(e){return String(Date.now())}}
function normalizeData(d){d=d&&typeof d==='object'?d:{}; if(d.data&&typeof d.data==='object') d=d.data; const base=defaultData(); const out=Object.assign({},base,d,{companies:Array.isArray(d.companies)?d.companies:[],users:Array.isArray(d.users)?d.users:base.users,items:Array.isArray(d.items)?d.items:[],sales:Array.isArray(d.sales)?d.sales:[],payments:Array.isArray(d.payments)?d.payments:[],loginAttempts:d.loginAttempts||{}}); if(!out.users.some(u=>u.id==='super'||u.role==='superadmin')) out.users.unshift(base.users[0]); return out;}
function cacheConfirmedCloudData(d){
  const payload=normalizeData(Object.assign({},d||{}, {__lastModifiedAt:(d&&d.__lastModifiedAt)||new Date().toISOString()}));
  CLOUD_DATA=payload;
  return payload;
}
function cloudSyncLabel(){
  if(CLOUD_SAVE_IN_PROGRESS) return '☁️ Enregistrement KV/D1...';
  if(!isCloudOnline()) return '⚠️ Hors ligne — enregistrement impossible';
  if(CLOUD_DATA) return '☁️ En ligne KV/D1';
  return '☁️ Connexion KV/D1...';
}
function updateCloudSyncBadge(txt){const el=document.getElementById('syncBadge'); if(el) el.textContent=txt||'☁️ En ligne KV/D1';}
function currentDashboardSection(){return document.querySelector('.section.active')?.id || 'home'}
function isUserEditingForm(){const a=document.activeElement; return !!(a && ['INPUT','TEXTAREA','SELECT'].includes(a.tagName));}
function isCloudOnline(){try{return typeof navigator==='undefined' || navigator.onLine!==false;}catch(e){return true}}
function setMemorySession(x){CLOUD_SESSION=x||null; return CLOUD_SESSION;}
function getMemorySession(){return CLOUD_SESSION||null;}
async function fetchWithTimeout(url,opts={},ms=CLOUD_TIMEOUT_MS){
  const ctrl=new AbortController();
  const t=setTimeout(()=>ctrl.abort(),ms);
  try{return await fetch(url,Object.assign({cache:'no-store',signal:ctrl.signal},opts));}
  finally{clearTimeout(t)}
}
async function readJsonResponse(r){
  const text=await r.text();
  let j=null;
  try{j=text?JSON.parse(text):{};}catch(e){
    if ((text||'').trim().startsWith('<') || (r.headers.get('content-type')||'').includes('text/html')) {
      throw new Error('API Cloudflare non déployée : la route /api renvoie une page HTML. Déployez le projet via GitHub ou Wrangler, pas par dépôt ZIP direct du tableau de bord.');
    }
    throw new Error('Réponse API invalide : JSON attendu.');
  }
  if(!r.ok || j.success===false || j.ok===false){
    const parts=[];
    if(j.message||j.error) parts.push(j.message||j.error);
    if(Array.isArray(j.errors)&&j.errors.length) parts.push('Erreurs serveur : '+j.errors.join(' | '));
    if(Array.isArray(j.warnings)&&j.warnings.length) parts.push('Avertissements : '+j.warnings.join(' | '));
    if(j.bindings) parts.push('Bindings détectés : KV='+((j.bindings&&j.bindings.kvName)||'non détecté')+', D1='+((j.bindings&&j.bindings.d1Name)||'non détecté'));
    throw new Error(parts.join('\n')||('Erreur serveur '+r.status));
  }
  return j;
}
function cloudErrorMessage(e){return (e&&e.message)?e.message:String(e||'Enregistrement en ligne impossible')}
function onlineRequiredMessage(error){
  const detail=cloudErrorMessage(error);
  if(/API Cloudflare non déployée|page HTML|JSON attendu|API invalide/i.test(detail)){
    return 'API Cloudflare non active. Les routes /api/health, /api/save et /api/load ne répondent pas en JSON.\n\nCause probable : le ZIP a été envoyé par dépôt direct dans le tableau de bord Cloudflare, ce qui n’active pas les Pages Functions. Déployez par GitHub ou par Wrangler.\n\nDétail : '+detail;
  }
  return 'Enregistrement en ligne impossible. Vérifiez Internet et les bindings Cloudflare KV + D1, puis réessayez. Noms recommandés : GLOBAL3_KV + GLOBAL3_DB.\n\nDétail : '+detail;
}
function isCloudSyncedResult(j){return !!(j&&(j.success||j.ok)&&j.saved===true&&j.kvSaved===true&&j.d1Saved===true);}
function showOnlineOnlyScreen(error){
  const msg=onlineRequiredMessage(error||'Connexion non confirmée');
  app.innerHTML=`<div class="wrap"><div class="card" style="max-width:720px;margin:80px auto;text-align:center"><h1>GLOBAL 3</h1><h2>API Cloudflare à activer</h2><p style="line-height:1.55">Tous les enregistrements doivent se faire directement en ligne dans Cloudflare KV + D1. Pour cela, les routes API Cloudflare Pages Functions doivent être actives.</p><pre style="white-space:pre-wrap;text-align:left;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px;color:#334155">${esc(msg)}</pre><button onclick="location.reload()">Réessayer</button></div></div>`;
}
async function cloudHealthCheck(){
  if(!isCloudOnline()) return {ok:false,success:false,offline:true,message:'Internet indisponible'};
  const r=await fetchWithTimeout(CLOUD_API_BASE+'/health');
  return await readJsonResponse(r);
}
function chooseNewestData(localData,remoteData){
  const l=localData?Date.parse(localData.__lastModifiedAt||localData.updatedAt||0):0;
  const r=remoteData?Date.parse(remoteData.__lastModifiedAt||remoteData.updatedAt||0):0;
  if(remoteData && (!localData || r>=l)) return normalizeData(remoteData);
  return normalizeData(remoteData||localData||defaultData());
}
async function cloudLoadData(){
  updateCloudSyncBadge('☁️ Chargement KV/D1...');
  if(!isCloudOnline()) throw new Error('Internet indisponible');
  await cloudHealthCheck();
  const r=await fetchWithTimeout(CLOUD_API_BASE+'/load?key='+encodeURIComponent(CLOUD_DATA_KEY));
  const j=await readJsonResponse(r);
  const remoteData=j.data?normalizeData(j.data):defaultData();
  CLOUD_DATA=remoteData;
  cacheConfirmedCloudData(CLOUD_DATA);
  CLOUD_LAST_REMOTE_SIGNATURE=stableDataSignature(CLOUD_DATA);
  updateCloudSyncBadge(j.found?'☁️ Données KV/D1 chargées':'☁️ KV/D1 prêt — nouvelle base');
  return CLOUD_DATA;
}
function saveOnlineBlocking(payload){
  if(!isCloudOnline()) throw new Error('Internet indisponible');
  const xhr=new XMLHttpRequest();
  xhr.open('POST',CLOUD_API_BASE+'/save',false);
  xhr.setRequestHeader('Content-Type','application/json');
  xhr.setRequestHeader('X-GLOBAL3-ONLINE-ONLY','1');
  xhr.send(JSON.stringify({key:CLOUD_DATA_KEY,data:payload,updatedAt:payload.__lastModifiedAt}));
  let j=null;
  try{j=xhr.responseText?JSON.parse(xhr.responseText):{};}catch(e){
      if ((xhr.responseText||'').trim().startsWith('<')) {
        throw new Error('API Cloudflare non déployée : /api/save renvoie une page HTML. Déployez par GitHub ou Wrangler.');
      }
      throw new Error('Réponse API invalide : JSON attendu.');
    }
  if(xhr.status<200||xhr.status>=300||!isCloudSyncedResult(j)){
    const parts=[];
    if(j&&j.message) parts.push(j.message);
    if(j&&Array.isArray(j.errors)&&j.errors.length) parts.push('Erreurs serveur : '+j.errors.join(' | '));
    if(j&&Array.isArray(j.warnings)&&j.warnings.length) parts.push('Avertissements : '+j.warnings.join(' | '));
    if(j&&j.bindings) parts.push('Bindings détectés : KV='+((j.bindings&&j.bindings.kvName)||'non détecté')+', D1='+((j.bindings&&j.bindings.d1Name)||'non détecté'));
    throw new Error(parts.join('\n')||'Sauvegarde KV/D1 non confirmée');
  }
  return j;
}
async function cloudSaveNow(d=CLOUD_DATA,opts={}){
  const payload=normalizeData(Object.assign({},d||CLOUD_DATA||defaultData(),{__lastModifiedAt:new Date().toISOString()}));
  updateCloudSyncBadge('☁️ Enregistrement KV/D1...');
  const r=await fetchWithTimeout(CLOUD_API_BASE+'/save',{
    method:'POST',
    headers:{'Content-Type':'application/json','X-GLOBAL3-ONLINE-ONLY':'1'},
    body:JSON.stringify({key:CLOUD_DATA_KEY,data:payload,updatedAt:payload.__lastModifiedAt})
  });
  const j=await readJsonResponse(r);
  if(!isCloudSyncedResult(j)) throw new Error('Sauvegarde KV/D1 non confirmée');
  cacheConfirmedCloudData(payload);
  CLOUD_LAST_REMOTE_SIGNATURE=stableDataSignature(payload);
  updateCloudSyncBadge('☁️ Enregistrement en ligne confirmé');
  return Object.assign({onlineSaved:true},j);
}
async function cloudPullLatest({rerender=false,silent=true}={} ){
  const before=currentDashboardSection();
  const data=await cloudLoadData();
  if(rerender && !isUserEditingForm()){
    try{renderDash(before.replace(/^sec-/,'')||'home');}catch(e){try{render();}catch(_) {}}
  }
  return data;
}
function startCloudAutoSync(){
  // Mode en ligne obligatoire : pas de file locale. Le serveur est la source officielle.
  window.GLOBAL3_REFRESH_CLOUD=function(){return cloudPullLatest({rerender:true,silent:false});};
}
async function cloudLoadSession(){
  setMemorySession(null);
  if(!isCloudOnline()) return getMemorySession();
  try{
    const r=await fetchWithTimeout(CLOUD_API_BASE+'/session?key='+encodeURIComponent(CLOUD_SESSION_KEY));
    const j=await readJsonResponse(r);
    if(j.session) setMemorySession(j.session);
  }catch(e){}
  return getMemorySession();
}
async function cloudSetSession(x){
  setMemorySession(x||null);
  if(isCloudOnline()){
    try{await fetchWithTimeout(CLOUD_API_BASE+'/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:CLOUD_SESSION_KEY,session:getMemorySession()})},4000);}catch(e){}
  }
  return {success:true,session:true};
}
async function cloudClearSession(){
  setMemorySession(null);
  if(isCloudOnline()){
    try{await fetchWithTimeout(CLOUD_API_BASE+'/session?key='+encodeURIComponent(CLOUD_SESSION_KEY),{method:'DELETE'},4000);}catch(e){}
  }
}
async function cloudStart(){
  app.innerHTML='<div class="wrap"><div class="card" style="max-width:620px;margin:80px auto;text-align:center"><h1>GLOBAL 3</h1><p>Connexion à Cloudflare KV/D1...</p><small>Mode en ligne obligatoire : les enregistrements sont confirmés directement sur le serveur.</small></div></div>';
  try{
    await cloudLoadData();
    await cloudLoadSession();
    startCloudAutoSync();
    render();
  }catch(e){
    showOnlineOnlyScreen(e);
  }
}
function seed(){if(!CLOUD_DATA) CLOUD_DATA=defaultData(); return CLOUD_DATA}
function save(d){
  const previous=CLOUD_DATA;
  const payload=normalizeData(Object.assign({},d||CLOUD_DATA||defaultData(),{__lastModifiedAt:new Date().toISOString()}));
  try{
    CLOUD_SAVE_IN_PROGRESS=true;
    updateCloudSyncBadge('☁️ Enregistrement KV/D1...');
    const result=saveOnlineBlocking(payload);
    cacheConfirmedCloudData(payload);
    CLOUD_LAST_REMOTE_SIGNATURE=stableDataSignature(payload);
    updateCloudSyncBadge('☁️ Enregistrement en ligne confirmé');
    return CLOUD_DATA;
  }catch(e){
    CLOUD_DATA=previous||CLOUD_DATA;
    updateCloudSyncBadge('⚠️ Enregistrement non confirmé');
    g3ProWarning(onlineRequiredMessage(e),'Enregistrement refusé');
    throw e;
  }finally{
    CLOUD_SAVE_IN_PROGRESS=false;
  }
}
function session(){return getMemorySession()}
function setSession(x){return cloudSetSession(x)}
function logout(){cloudClearSession().finally(()=>renderLogin())}
function current(){const d=seed(), s=session(); if(!s) return {d}; if(s.expiresAt && Date.now()>Number(s.expiresAt)){CLOUD_SESSION=null; cloudClearSession(); alert('Session caisse expirée. Veuillez vous reconnecter.'); return {d};} const user=d.users.find(u=>u.id===s.userId&&u.status==='active'); if(user?.role==='caisse' && !isCaisseInAllowedHours(user)){CLOUD_SESSION=null; cloudClearSession(); alert('Accès caisse bloqué : vous êtes hors de la plage horaire autorisée ('+caisseAllowedRangeLabel(user)+').'); return {d};} const company=user?.companyId?d.companies.find(c=>c.id===user.companyId):null; return {d,s,user,company}}
window.addEventListener('online',function(){updateCloudSyncBadge('☁️ Internet rétabli — vérification KV/D1...'); cloudPullLatest({rerender:false,silent:true}).catch(()=>{});});
window.addEventListener('offline',function(){updateCloudSyncBadge('⚠️ Hors ligne — enregistrement impossible');});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible' && isCloudOnline()){cloudPullLatest({rerender:false,silent:true}).catch(()=>{});}});


function isDataLocked(){const {company}=current(); return !!company?.dataLocked;}
function dataLockStatusBox(){
  const {company}=current();
  if(!company) return '';
  const locked=!!company.dataLocked;
  const dt=company.dataLockedAt?new Date(company.dataLockedAt).toLocaleString('fr-FR'):'';
  return `<div class="dataSecurityBox ${locked?'locked':'open'} no-print"><div><h3>Sécurité des données</h3><p>${locked?'Les données de cette entreprise sont protégées contre les suppressions et modifications sensibles.':'Activez le verrouillage avant toute correction du système ou intervention technique.'}</p><span class="dataLockBadge">${locked?'Données verrouillées 🔒':'Données déverrouillées 🔓'}</span>${locked&&dt?`<small>Verrou activé le ${esc(dt)}</small>`:''}<small class="backupHint">Sauvegardez un fichier JSON avant chaque correction du ZIP afin de pouvoir restaurer vos données.</small></div><div class="dataLockActions">${locked?`<button class="darkBtn" onclick="openUnlockDataPopup()">Déverrouiller avec mot de passe admin</button>`:`<button class="stockPrimaryBtn" onclick="lockCompanyData()">Verrouiller les données</button>`}<button class="backupBtn" onclick="exportGlobal3Backup()">Sauvegarder maintenant</button><button class="restoreBtn" onclick="openRestoreBackupPopup()">Restaurer une sauvegarde</button></div></div>`;
}
function lockCompanyData(){
  if(!requireAdmin('Seul un administrateur peut verrouiller les données.')) return;
  const {d,company,user}=current();
  const c=(d.companies||[]).find(x=>x.id===company.id); if(!c) return;
  c.dataLocked=true; c.dataLockedAt=new Date().toISOString(); c.dataLockedBy=user?.name||user?.email||'Administrateur';
  save(d); renderDash('param');
  g3ProInfo('Les données sont maintenant verrouillées. Les suppressions de ventes, rapports, produits, services et catégories sont bloquées jusqu’au déverrouillage par mot de passe administrateur.','Données verrouillées');
}
function openUnlockDataPopup(){
  if(!requireAdmin('Seul un administrateur peut déverrouiller les données.')) return;
  closeG3ProPopup();
  document.body.insertAdjacentHTML('beforeend',`<div class="g3ProPopupBackdrop" onclick="if(event.target===this)closeG3ProPopup()"><div class="g3ProPopupCard" onclick="event.stopPropagation()"><button class="g3ProPopupClose" onclick="closeG3ProPopup()">×</button><div class="g3ProPopupIcon">🔐</div><h2>Déverrouillage sécurisé</h2><p>Entrez le mot de passe administrateur pour déverrouiller les données de cette entreprise.</p><input id="unlockAdminPass" type="password" class="unlockAdminInput" placeholder="Mot de passe administrateur"><div class="g3ProPopupActions"><button onclick="confirmUnlockCompanyData()">Déverrouiller</button><button class="secondary" onclick="closeG3ProPopup()">Annuler</button></div></div></div>`);
  setTimeout(()=>document.getElementById('unlockAdminPass')?.focus(),80);
}
async function confirmUnlockCompanyData(){
  const pass=document.getElementById('unlockAdminPass')?.value||'';
  const {d,company,user}=current();
  if(!user || user.role!=='admin') return g3ProWarning('Déverrouillage réservé à l’administrateur de l’entreprise.','Accès refusé');
  if(!(await verifyUserPassword(user,pass))) return g3ProWarning('Mot de passe administrateur incorrect. Les données restent verrouillées.','Déverrouillage refusé');
  await migratePasswordIfPlain(user,pass,d);
  const c=(d.companies||[]).find(x=>x.id===company.id); if(!c) return;
  c.dataLocked=false; c.dataUnlockedAt=new Date().toISOString(); c.dataUnlockedBy=user?.name||user?.email||'Administrateur';
  save(d); closeG3ProPopup(); renderDash('param');
  g3ProInfo('Les données sont déverrouillées. Les actions sensibles sont à nouveau disponibles.','Données déverrouillées');
}
function ensureDataUnlocked(action='cette action sensible'){
  if(!isDataLocked()) return true;
  g3ProWarning('Les données sont verrouillées. Pour effectuer '+action+', veuillez d’abord cliquer sur « Déverrouiller avec mot de passe admin » dans Paramètres.','Données verrouillées');
  return false;
}


function deepCloneDataForBackup(obj){
  try{return JSON.parse(JSON.stringify(obj||{}));}catch(e){return obj||{};}
}
function safeBackupFilename(company){
  const clean=String(company?.name||'global3').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'global3';
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'').replace('T','-');
  return `backup-global3-${clean}-${stamp}.json`;
}
function exportGlobal3Backup(){
  if(!requireAdmin('Seul un administrateur peut sauvegarder les données.')) return;
  const {d,company,user}=current();
  const payload={
    app:'GLOBAL 3',
    type:'GLOBAL3_BACKUP_JSON',
    version:'1.0',
    createdAt:new Date().toISOString(),
    createdBy:user?.name||user?.email||'Administrateur',
    companyId:company?.id||'',
    companyName:company?.name||'',
    note:'Sauvegarde complète exportée depuis GLOBAL 3 avant correction ou maintenance. Stockage officiel en ligne KV + D1.',
    onlineOnly:true,
    storage:'Cloudflare KV + D1',
    data:deepCloneDataForBackup(normalizeData(d))
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=safeBackupFilename(company);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  g3ProInfo('Sauvegarde JSON créée avec succès. Conservez ce fichier dans un endroit sûr avant toute correction du ZIP.','Sauvegarde effectuée');
}
function openRestoreBackupPopup(){
  if(!requireAdmin('Seul un administrateur peut restaurer une sauvegarde.')) return;
  closeG3ProPopup();
  document.body.insertAdjacentHTML('beforeend',`<div class="g3ProPopupBackdrop" onclick="if(event.target===this)closeG3ProPopup()"><div class="g3ProPopupCard restoreBackupCard" onclick="event.stopPropagation()"><button class="g3ProPopupClose" onclick="closeG3ProPopup()">×</button><div class="g3ProPopupIcon">🛡️</div><h2>Restaurer une sauvegarde</h2><p>Choisissez un fichier JSON exporté depuis GLOBAL 3. Une copie interne de sécurité sera créée avant la restauration.</p><label class="restoreFileLabel">Fichier de sauvegarde JSON<input id="restoreBackupFile" type="file" accept="application/json,.json"></label><label class="restoreFileLabel">Mot de passe administrateur<input id="restoreBackupPass" type="password" placeholder="Mot de passe administrateur"></label><div class="g3ProPopupActions"><button onclick="confirmRestoreGlobal3Backup()">Restaurer</button><button class="secondary" onclick="closeG3ProPopup()">Annuler</button></div></div></div>`);
}
async function confirmRestoreGlobal3Backup(){
  const {d,user}=current();
  const pass=document.getElementById('restoreBackupPass')?.value||'';
  const file=document.getElementById('restoreBackupFile')?.files?.[0];
  if(!user || user.role!=='admin') return g3ProWarning('Restauration réservée à l’administrateur de l’entreprise.','Accès refusé');
  if(!(await verifyUserPassword(user,pass))) return g3ProWarning('Mot de passe administrateur incorrect. La restauration est annulée.','Restauration refusée');
  await migratePasswordIfPlain(user,pass,d);
  if(!file) return g3ProWarning('Veuillez sélectionner un fichier de sauvegarde JSON avant de restaurer.','Fichier manquant');
  const reader=new FileReader();
  reader.onload=function(){
    try{
      const parsed=JSON.parse(String(reader.result||'{}'));
      const restored=parsed.data && (parsed.type==='GLOBAL3_BACKUP_JSON' || parsed.app) ? parsed.data : parsed;
      if(!restored || !Array.isArray(restored.companies) || !Array.isArray(restored.users)) throw new Error('Format invalide');
      CLOUD_DATA=normalizeData(restored);
      save(CLOUD_DATA);
      closeG3ProPopup();
      g3ProInfo('Sauvegarde restaurée avec succès. Les données de GLOBAL 3 ont été récupérées depuis le fichier JSON.','Restauration réussie');
      setTimeout(()=>render(),200);
    }catch(e){
      g3ProWarning('Le fichier sélectionné n’est pas une sauvegarde GLOBAL 3 valide. Veuillez choisir un fichier JSON exporté depuis GLOBAL 3.','Restauration impossible');
    }
  };
  reader.onerror=function(){g3ProWarning('Impossible de lire le fichier sélectionné.','Erreur de lecture');};
  reader.readAsText(file);
}

function saleBelongsToCompany(s,cid){
  if(!s) return false;
  const sid=String(s.companyId||'');
  const target=String(cid||'');
  if(sid && sid===target) return true;
  // Sécurité de récupération : certaines anciennes ventes pouvaient être enregistrées sans companyId.
  // Si une seule entreprise existe dans la base, on rattache ces ventes à cette entreprise pour le rapport.
  const d=seed();
  return !sid && Array.isArray(d.companies) && d.companies.length===1 && target===String(d.companies[0].id||'');
}
function companySalesRows(d,cid){
  return (Array.isArray(d?.sales)?d.sales:[]).filter(s=>saleBelongsToCompany(s,cid));
}
function ensureSaleCompanyId(s,cid){
  if(s && !s.companyId && saleBelongsToCompany(s,cid)){
    s.companyId=cid;
    s.companyIdRepairedAt=s.companyIdRepairedAt||new Date().toISOString();
    return true;
  }
  return false;
}
function normalizeCompanySalesOwnership(d,cid){
  if(!d || !Array.isArray(d.sales)) return false;
  let changed=false;
  d.sales.forEach(s=>{ if(ensureSaleCompanyId(s,cid)) changed=true; });
  return changed;
}
function findCompanySaleById(d,cid,sid){
  const sale=(Array.isArray(d?.sales)?d.sales:[]).find(s=>saleBelongsToCompany(s,cid) && String(s.id||'')===String(sid||''));
  if(sale) ensureSaleCompanyId(sale,cid);
  return sale||null;
}
function removeCompanySalesByIds(d,cid,ids){
  if(!d || !Array.isArray(d.sales)) return 0;
  const set=new Set((Array.isArray(ids)?ids:[ids]).map(x=>String(x||'')).filter(Boolean));
  const before=d.sales.length;
  d.sales=d.sales.filter(s=>!(saleBelongsToCompany(s,cid) && set.has(String(s.id||''))));
  return before-d.sales.length;
}
function caisseSessionMinutes(u){return Math.max(5,Number(u?.sessionMinutes||60));}
function normalizeHour(v,def){v=String(v||def||'').trim(); return /^([01]\d|2[0-3]):[0-5]\d$/.test(v)?v:def;}
function caisseStartTime(u){return normalizeHour(u?.caisseStartTime||u?.workStart,'07:00')}
function caisseEndTime(u){return normalizeHour(u?.caisseEndTime||u?.workEnd,'22:00')}
function minutesFromHHMM(v){const [h,m]=String(v||'00:00').split(':').map(Number); return h*60+m;}
function caisseAllowedRangeLabel(u){return caisseStartTime(u)+'–'+caisseEndTime(u)}
function isCaisseInAllowedHours(u,dt=new Date()){if(!u || u.role!=='caisse') return true; const start=minutesFromHHMM(caisseStartTime(u)), end=minutesFromHHMM(caisseEndTime(u)); const now=dt.getHours()*60+dt.getMinutes(); if(start===end) return true; return start<end ? (now>=start && now<=end) : (now>=start || now<=end);}
function sessionPayloadForUser(u){return {userId:u.id,loginAt:Date.now(),expiresAt:null};}
function loginAttemptsKey(email){return 'GLOBAL3_LOGIN_ATTEMPTS_'+String(email||'').toLowerCase();}
function getLoginAttempts(email){const d=seed(); d.loginAttempts=d.loginAttempts||{}; return Number(d.loginAttempts[String(email||'').toLowerCase()]||0);}
function resetLoginAttempts(email){const d=seed(); d.loginAttempts=d.loginAttempts||{}; delete d.loginAttempts[String(email||'').toLowerCase()]; save(d);}
function registerLoginFailure(email){const d=seed(); d.loginAttempts=d.loginAttempts||{}; const key=String(email||'').toLowerCase(); const attempts=Number(d.loginAttempts[key]||0)+1; d.loginAttempts[key]=attempts; const u=(d.users||[]).find(x=>String(x.email||'').toLowerCase()===key); if(attempts>=5 && u){u.status='blocked'; save(d); return {blocked:true,attempts};} save(d); return {blocked:false,attempts};}
function logCaisseAction(action,details=''){const {d,user,company}=current(); if(!user||user.role!=='caisse'||!company) return; d.caisseLogs=d.caisseLogs||[]; d.caisseLogs.push({id:id('log'),companyId:company.id,userId:user.id,userName:user.name||user.email,action,details,date:new Date().toISOString()}); if(d.caisseLogs.length>1000)d.caisseLogs=d.caisseLogs.slice(-1000); save(d);}
function caisseLogsTable(){const {d,company}=current(); const rows=(d.caisseLogs||[]).filter(x=>x.companyId===company.id).slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,100); return `<div class="superTableWrap"><table class="g2table"><tr><th>Date</th><th>Utilisateur caisse</th><th>Action</th><th>Détail</th></tr>${rows.map(r=>`<tr><td>${new Date(r.date).toLocaleString('fr-FR')}</td><td>${esc(r.userName||'')}</td><td>${esc(r.action||'')}</td><td>${esc(r.details||'')}</td></tr>`).join('')||'<tr><td colspan="4">Aucune action caisse enregistrée.</td></tr>'}</table></div>`}
function requireCaisseCanEditSale(s){if(isCaisse() && s && !getCurrentCompanyCartSales().some(x=>x.id===s.id)){alert('La caisse ne peut pas modifier une facture après validation.'); return false;} return true;}
function statusCompany(c){if(!c) return 'blocked'; if(['blocked','suspended'].includes(c.status)) return c.status; if(c.subscriptionEnd && c.subscriptionEnd < today()) return 'expired'; const code=planCode(c); return code||c.status||'FREE'}

const GLOBAL3_CGU_TEXT = String.raw`CONDITIONS GÉNÉRALES D’UTILISATION (CGU)
GLOBAL 3 — Plateforme Multi Entreprises
Développé par MEGA SERVICES SARL U
Dernière mise à jour : Mai 2026
________________________________________
1. PRÉSENTATION DE LA PLATEFORME
GLOBAL 3 est une plateforme numérique multi entreprises développée par MEGA SERVICES SARL U permettant aux entreprises, commerces, boutiques et prestataires de services de gérer leurs activités professionnelles.
La plateforme propose notamment :
- la gestion des ventes ;
- la gestion des produits ;
- la gestion des services ;
- la gestion des stocks ;
- la gestion des utilisateurs ;
- la génération de factures ;
- les rapports financiers ;
- la gestion des abonnements ;
- la marketplace intégrée ;
- les espaces administrateurs ;
- les outils d’impression et d’exportation PDF.
L’utilisation de la plateforme implique l’acceptation complète des présentes Conditions Générales d’Utilisation.
________________________________________
2. ACCÈS À LA PLATEFORME
L’accès à GLOBAL 3 est réservé aux utilisateurs disposant d’un compte valide.
Chaque entreprise inscrite dispose d’un espace indépendant et sécurisé.
L’utilisateur est responsable :
- de la confidentialité de ses identifiants ;
- des activités réalisées depuis son compte ;
- de la sécurité des appareils utilisés.
MEGA SERVICES SARL U se réserve le droit de suspendre ou bloquer tout compte en cas :
- d’activité frauduleuse ;
- de tentative de piratage ;
- d’utilisation abusive ;
- de non respect des présentes conditions.
________________________________________
3. ABONNEMENTS
GLOBAL 3 fonctionne avec plusieurs types d’abonnements.
PLAN FREE
Le plan gratuit est limité en fonctionnalités.
Restrictions possibles :
- limitation du nombre de produits ;
- limitation des catégories ;
- limitation des utilisateurs ;
- branding GLOBAL 3 visible.
PLAN BUSINESS ET AUTRES OFFRES
Les abonnements payants permettent d’accéder à des fonctionnalités avancées.
Chaque abonnement possède :
- une durée ;
- des limites éventuelles ;
- un statut d’activation ;
- une date d’expiration.
MEGA SERVICES SARL U peut modifier les offres ou les fonctionnalités afin d’améliorer le service.
________________________________________
4. RESPONSABILITÉ DE L’UTILISATEUR
L’utilisateur s’engage à :
- fournir des informations exactes ;
- utiliser la plateforme légalement ;
- respecter les lois fiscales et commerciales ;
- ne pas utiliser la plateforme pour des activités illicites.
L’utilisateur reste seul responsable :
- de ses ventes ;
- de ses factures ;
- de ses déclarations fiscales ;
- de ses contenus ;
- de ses données commerciales.
________________________________________
5. DISPONIBILITÉ DU SERVICE
MEGA SERVICES SARL U met tout en œuvre pour assurer le bon fonctionnement de GLOBAL 3.
Cependant, la société ne garantit pas :
- l’absence totale d’interruption ;
- l’absence de bug ;
- l’absence de maintenance ;
- la disponibilité permanente du service.
Des interruptions temporaires peuvent intervenir pour :
- maintenance ;
- mise à jour ;
- amélioration technique ;
- sécurité.
________________________________________
6. PROPRIÉTÉ INTELLECTUELLE
GLOBAL 3, son design, ses logos, ses modules, ses codes, ses interfaces et ses contenus sont la propriété exclusive de MEGA SERVICES SARL U.
Toute reproduction, modification, copie ou exploitation sans autorisation écrite est interdite.
________________________________________
7. DONNÉES ET SAUVEGARDE
L’utilisateur est responsable de la sauvegarde de ses données importantes.
MEGA SERVICES SARL U peut mettre en place des systèmes de sauvegarde automatique sans obligation de garantie absolue.
________________________________________
8. SUSPENSION ET RÉSILIATION
MEGA SERVICES SARL U peut suspendre un compte en cas :
- de non paiement ;
- d’utilisation frauduleuse ;
- de tentative de contournement du système ;
- de comportement abusif.
L’utilisateur peut demander la fermeture de son compte à tout moment.
________________________________________
9. LIMITATION DE RESPONSABILITÉ
MEGA SERVICES SARL U ne peut être tenue responsable :
- des pertes financières ;
- des erreurs de saisie ;
- des mauvaises décisions commerciales ;
- des interruptions réseau ;
- des pertes liées à des appareils tiers ;
- des actes réalisés par les utilisateurs.
________________________________________
10. MODIFICATION DES CONDITIONS
MEGA SERVICES SARL U se réserve le droit de modifier les présentes conditions à tout moment.
Les nouvelles conditions prennent effet dès leur publication sur la plateforme.
________________________________________
11. CONTACT
MEGA SERVICES SARL U Diabo — Côte d’Ivoire
Téléphone : +225 07 77 04 17 90 Email : megaservicediabo@gmail.com`;

const GLOBAL3_PRIVACY_TEXT = String.raw`POLITIQUE DE CONFIDENTIALITÉ
GLOBAL 3 — Plateforme Multi Entreprises
Dernière mise à jour : Mai 2026
________________________________________
1. INTRODUCTION
La présente Politique de Confidentialité explique comment MEGA SERVICES SARL U collecte, utilise et protège les informations des utilisateurs de la plateforme GLOBAL 3.
L’utilisation de GLOBAL 3 implique l’acceptation de cette politique.
________________________________________
2. DONNÉES COLLECTÉES
GLOBAL 3 peut collecter les informations suivantes :
Informations d’identification
- nom de l’entreprise ;
- nom du responsable ;
- téléphone ;
- email ;
- adresse ;
- RCCM ;
- compte contribuable.
Informations techniques
- adresse IP ;
- navigateur ;
- appareil utilisé ;
- données de connexion ;
- historique d’utilisation.
Données commerciales
- produits ;
- services ;
- ventes ;
- factures ;
- clients ;
- rapports.
________________________________________
3. UTILISATION DES DONNÉES
Les données collectées servent à :
- fournir les services ;
- améliorer la plateforme ;
- sécuriser les comptes ;
- générer les rapports ;
- assurer le support technique ;
- gérer les abonnements ;
- prévenir la fraude.
________________________________________
4. PROTECTION DES DONNÉES
MEGA SERVICES SARL U met en place des mesures de sécurité raisonnables afin de protéger les données des utilisateurs.
Cependant, aucun système informatique ne garantit une sécurité absolue.
________________________________________
5. PARTAGE DES DONNÉES
Les données des utilisateurs ne sont pas vendues.
Les informations peuvent être partagées uniquement :
- avec des prestataires techniques ;
- en cas d’obligation légale ;
- pour protéger la sécurité du système.
________________________________________
6. CONSERVATION DES DONNÉES
Les données peuvent être conservées pendant la durée nécessaire au fonctionnement du service et aux obligations légales.
________________________________________
7. DROITS DES UTILISATEURS
Les utilisateurs peuvent demander :
- l’accès à leurs données ;
- la correction des données ;
- la suppression des données ;
- la fermeture de leur compte.
Certaines données peuvent toutefois être conservées pour des raisons légales ou administratives.
________________________________________
8. COOKIES ET TECHNOLOGIES SIMILAIRES
GLOBAL 3 peut utiliser des cookies ou technologies similaires afin :
- d’améliorer l’expérience utilisateur ;
- de mémoriser certaines préférences ;
- d’assurer la sécurité des connexions.
________________________________________
9. RESPONSABILITÉ DES UTILISATEURS
Chaque utilisateur est responsable des données qu’il enregistre sur la plateforme.
L’utilisateur doit respecter les lois applicables relatives à la protection des données personnelles.
________________________________________
10. MODIFICATION DE LA POLITIQUE
MEGA SERVICES SARL U peut modifier la présente Politique de Confidentialité à tout moment.
Les modifications prennent effet dès leur publication.
________________________________________
11. CONTACT
Pour toute question concernant cette politique :
MEGA SERVICES SARL U Diabo — Côte d’Ivoire
Téléphone : +225 07 77 04 17 90 Email : megaservicediabo@gmail.com`;

function loginLegalHtml(){return `<div class="loginLegalNotice">En vous inscrivant sur GLOBAL3, vous confirmez que vous acceptez nos <button type="button" class="legalTextLink" onclick="openLegalPopup('cgu')">conditions d’utilisation</button> et que vous avez pris connaissance de notre <button type="button" class="legalTextLink" onclick="openLegalPopup('privacy')">politique de confidentialité</button>.</div>`}
function legalModalHtml(){return `<div id="legalPopup" class="legalPopup hidden" role="dialog" aria-modal="true" aria-labelledby="legalTitle"><div class="legalBackdrop" onclick="closeLegalPopup()"></div><div class="legalCard"><button type="button" class="legalClose" onclick="closeLegalPopup()">×</button><h2 id="legalTitle">Documents légaux GLOBAL 3</h2><pre id="legalText"></pre></div></div>`}
function openLegalPopup(type){const pop=document.querySelector('#legalPopup'), title=document.querySelector('#legalTitle'), text=document.querySelector('#legalText'); if(!pop||!title||!text)return; title.textContent=type==='privacy'?'Politique de confidentialité':'Conditions d’utilisation'; text.textContent=type==='privacy'?GLOBAL3_PRIVACY_TEXT:GLOBAL3_CGU_TEXT; pop.classList.remove('hidden')}
function closeLegalPopup(){document.querySelector('#legalPopup')?.classList.add('hidden')}

function renderLogin(){app.innerHTML=`<div class="loginPage militaryLoginPage">
  <div class="loginBox militaryLoginBox">
    <div class="loginLeft militaryLoginLeft">
      <div class="militaryLogoWrap">
        <div class="militaryShield">
          <img src="assets/global3-logo.png" alt="Logo GLOBAL 3">
          <span class="shieldStar">★</span>
        </div>
      </div>
      <h1>CONNEXION <span>GLOBAL 3</span></h1>
      <div class="militaryTitleLine"><i></i><b>★</b><i></i></div>
      <div class="militaryDev"><i></i><span>Développé par MEGA SERVICES SARL U</span><i></i></div>
      <button type="button" class="supportBtn supportLeftBtn militarySupportBtn" onclick="openSupportWhatsApp()"><span>☘</span> Support WhatsApp <b>›</b></button>
      <button type="button" class="globalShopLoginBtn militaryShopBtn" onclick="location.hash='boutique-global';render()"><span>▣</span> Boutique GLOBAL3 <b>›</b></button>
    </div>
    <div class="loginRight militaryLoginRight">
      <div class="militaryWingBadge">★</div>
      <h2>Choisir un profil</h2>
      <p class="mutedDark militarySubTitle">Connectez-vous selon votre responsabilité.</p>
      <div class="profileBtns militaryProfileBtns">
        <button type="button" class="profile militaryProfile active" onclick="selectProfile(this,'caisse')"><em>★</em><strong>▤</strong><span>La Caisse</span></button>
        <button type="button" class="profile militaryProfile" onclick="selectProfile(this,'admin')"><em>★</em><strong>♟</strong><span>Administrateur</span></button>
      </div>
      <input id="loginRole" type="hidden" value="caisse">
      <label>Nom utilisateur / Email</label>
      <div class="militaryInput"><span>👤</span><input id="loginEmail" placeholder="email@.com" autocomplete="username"></div>
      <label>Mot de passe</label>
      <div class="militaryInput militaryPassword"><span>🔒</span><input id="loginPass" type="password" placeholder="Entrer le mot de passe" autocomplete="current-password"><button type="button" onclick="const p=document.getElementById('loginPass'); if(p){p.type=p.type==='password'?'text':'password'}">👁</button></div>
      <div class="loginActions loginActionsTwo militaryLoginActions">
        <button onclick="login()"><span>▰</span> Se connecter</button>
        <button class="btn2 darkBtn" onclick="openRegisterPopup()"><span>🛡️</span> Inscription</button>
      </div>
      <div class="forgotLine militaryForgot"><button type="button" class="legalTextLink" onclick="openForgotPasswordPopup()">🔒 Mot de passe oublié ?</button></div>
    </div>
  </div>
  ${loginLegalHtml()}
</div>
${legalModalHtml()}
<div id="registerModal" class="modal hidden">
  <div class="modalOverlay" onclick="closeRegisterPopup()"></div>
  <div class="modalCard">
    <button class="modalClose" onclick="closeRegisterPopup()">×</button>
    <h2>FICHE D’INSCRIPTION DES ENTREPRISES</h2>
    <p class="sub registerSub"><b>IDENTIFICATION DE L’ENTREPRISE</b><br><span>Remplissez correctement les champs. Tous les textes saisis restent visibles et lisibles.</span></p>
    <div class="grid two registerBusinessGrid">
      <label>Raison sociale<input id="cName" placeholder="EX/ MEGA SERVICES SARL U"></label>
      <label>Forme juridique<input id="cLegalForm" placeholder="EX/ SARL U"></label>
      <label>RCCM<input id="cRccm" placeholder="EX/ CI-BKE-2025-B-00000"></label>
      <label>Compte Contribuable<input id="cTaxAccount" placeholder="EX/ 0000000 A"></label>
      <label class="fullRow">Activité<input id="cActivity" placeholder="EX/ Informatique, impression, services numériques et transfert d’argent"></label>
      <label>Gérant<input id="cOwner" placeholder="EX/ Monsieur CESAR"></label>
      <label>Adresse<input id="cAddress" placeholder="EX/ Diabo, Côte d’Ivoire"></label>
      <label>Téléphone<input id="cPhone" placeholder="EX/ +225 XX XX XX XX XX"></label>
      <label>E-mail<input id="cEmail" placeholder="Email de connexion"></label>
      <label>Mot de passe admin<input id="cPass" type="password" placeholder="Mot de passe"></label>
      <label>Type de commerce<select id="cType"><option value="boutique">Vente de produits / Boutique</option><option value="service">Vente de services</option></select></label>
    </div>
    <button class="fullBtn" onclick="registerCompany()">Créer mon entreprise</button>
  </div>
</div>
<div id="forgotPasswordModal" class="modal hidden">
  <div class="modalOverlay" onclick="closeForgotPasswordPopup()"></div>
  <div class="modalCard">
    <button class="modalClose" onclick="closeForgotPasswordPopup()">×</button>
    <h2>Mot de passe oublié</h2>
    <p class="sub">Cette demande est transmise à l’administrateur principal de votre entreprise. Le Super Admin n’est pas réinitialisable ici.</p>
    <div class="grid two">
      <label>Profil concerné<select id="fpRole"><option value="caisse">Caisse</option><option value="admin">Administrateur</option></select></label>
      <label>Email / Identifiant<input id="fpEmail" placeholder="votre email de connexion"></label>
      <label>Téléphone ou contact<input id="fpPhone" placeholder="contact pour vérification"></label>
      <label>Motif<input id="fpReason" placeholder="ex: mot de passe oublié"></label>
    </div>
    <button class="fullBtn" onclick="requestPasswordReset()">Envoyer la demande</button>
  </div>
</div>`}
function selectProfile(btn,role){document.querySelectorAll('.profile').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const r=document.querySelector('#loginRole'); if(r) r.value=role; const e=document.querySelector('#loginEmail'); if(role==='superadmin'&&e) e.value='mega@services.local'}

function openSupportWhatsApp(){
  const msg=encodeURIComponent('Bonjour MEGA SERVICES, j’ai besoin d’assistance pour GLOBAL 3.');
  window.open('https://wa.me/2250777041790?text='+msg,'_blank');
}
function openRegisterPopup(){document.querySelector('#registerModal')?.classList.remove('hidden')}
function closeRegisterPopup(){document.querySelector('#registerModal')?.classList.add('hidden')}
function openForgotPasswordPopup(){document.querySelector('#forgotPasswordModal')?.classList.remove('hidden')}
function closeForgotPasswordPopup(){document.querySelector('#forgotPasswordModal')?.classList.add('hidden')}
function makeTempPassword(){return 'G3-'+Math.random().toString(36).slice(2,6).toUpperCase()+'-'+String(Math.floor(100+Math.random()*900));}
function requestPasswordReset(){
  const d=seed();
  const email=($('#fpEmail')?.value||'').trim().toLowerCase();
  const role=$('#fpRole')?.value||'caisse';
  const phone=($('#fpPhone')?.value||'').trim();
  const reason=($('#fpReason')?.value||'Mot de passe oublié').trim();
  if(!email) return alert('Veuillez saisir votre email / identifiant.');
  const u=(d.users||[]).find(x=>String(x.email||'').toLowerCase()===email);
  if(!u) return alert('Aucun compte trouvé avec cet email. Vérifiez l’identifiant.');
  if(u.role==='superadmin') return alert('Le mot de passe Super Admin ne peut pas être récupéré automatiquement. Utilisez le code maître sécurisé.');
  if(role==='caisse' && u.role!=='caisse') return alert('Ce compte n’est pas un profil Caisse. Sélectionnez le bon profil.');
  if(role==='admin' && u.role!=='admin') return alert('Ce compte n’est pas un profil Administrateur. Sélectionnez le bon profil.');
  d.passwordResetRequests=d.passwordResetRequests||[];
  const old=d.passwordResetRequests.find(r=>r.userId===u.id&&r.status==='pending');
  if(old) return alert('Une demande est déjà en attente pour ce compte. Contactez votre administrateur.');
  d.passwordResetRequests.push({id:id('rst'),companyId:u.companyId,userId:u.id,userName:u.name||'',email:u.email,role:u.role,phone,reason,status:'pending',createdAt:new Date().toISOString()});
  save(d);
  closeForgotPasswordPopup();
  alert(u.role==='admin' ? 'Demande envoyée. Le Super Admin GLOBAL3 pourra générer un mot de passe temporaire.' : 'Demande envoyée. Votre administrateur d’entreprise pourra générer un mot de passe temporaire dans Paramètres > Demandes de mot de passe oublié.');
}
function passwordResetRequestsBox(){
  const {d,company}=current();
  const rows=(d.passwordResetRequests||[]).filter(r=>r.companyId===company.id && r.role==='caisse').slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  return `<div class="superTableWrap"><table class="g2table"><tr><th>Date</th><th>Utilisateur</th><th>Profil</th><th>Contact</th><th>Motif</th><th>Statut</th><th>Action</th></tr>${rows.map(r=>`<tr><td>${new Date(r.createdAt).toLocaleString('fr-FR')}</td><td>${esc(r.userName||r.email)}<br><small>${esc(r.email||'')}</small></td><td>${esc(r.role||'')}</td><td>${esc(r.phone||'')}</td><td>${esc(r.reason||'')}</td><td>${esc(r.status||'')}</td><td class="actionCell">${r.status==='pending'?`<button onclick="resetPasswordRequestByAdmin('${r.id}')">Générer mot de passe</button>`:'<span class="saleBadge">traité</span>'}</td></tr>`).join('')||'<tr><td colspan="7">Aucune demande de mot de passe oublié.</td></tr>'}</table></div>`;
}
async function resetPasswordRequestByAdmin(rid){
  if(!requireAdmin('Réservé à l’administrateur.')) return;
  const {d,company,user}=current();
  const r=(d.passwordResetRequests||[]).find(x=>x.id===rid&&x.companyId===company.id);
  if(!r) return alert('Demande introuvable.');
  const u=(d.users||[]).find(x=>x.id===r.userId&&x.companyId===company.id);
  if(!u||u.role!=='caisse') return alert('Compte non autorisé. L’administrateur peut réinitialiser uniquement un compte Caisse.');
  const temp=makeTempPassword();
  await setUserPasswordSecure(u,temp);
  u.status='active';
  u.mustChangePassword=true;
  r.status='done'; r.doneAt=new Date().toISOString(); r.doneBy=user?.id||'';
  resetLoginAttempts(u.email);
  save(d);
  alert('Mot de passe temporaire généré pour '+(u.name||u.email)+' :\n\n'+temp+'\n\nL’utilisateur devra le changer à la prochaine connexion.');
  renderDash('param');
}
async function enforcePasswordChange(u){
  if(!u?.mustChangePassword) return true;
  const np=prompt('Mot de passe temporaire détecté. Saisissez un nouveau mot de passe personnel :');
  if(!np || np.length<6){alert('Mot de passe trop court. Utilisez au moins 6 caractères. Connexion annulée.'); return false;}
  const d=seed(); const target=(d.users||[]).find(x=>x.id===u.id);
  if(target){await setUserPasswordSecure(target,np); target.mustChangePassword=false; save(d);}
  alert('Nouveau mot de passe enregistré.');
  return true;
}

async function login(){
  const d=seed(), email=$('#loginEmail').value.trim().toLowerCase(), pass=$('#loginPass').value, selectedRole=$('#loginRole')?.value||'caisse';
  const existing=d.users.find(x=>String(x.email||'').toLowerCase()===email);
  if(existing && existing.status==='blocked') return alert('Ce compte est bloqué. Contactez l’administrateur.');
  const u=(existing && existing.status==='active' && await verifyUserPassword(existing,pass)) ? existing : null;
  if(!u){const r=registerLoginFailure(email); return alert(r.blocked?'Compte bloqué après 05 mauvaises tentatives. Contactez l’administrateur.':'Identifiants incorrects. Tentative '+r.attempts+'/5');}

  // Respect strict du profil choisi sur la page de connexion.
  // Un administrateur ne doit pas entrer par le profil Caisse, et une caisse ne doit pas entrer par le profil Administrateur.
  if(selectedRole==='caisse' && u.role!=='caisse'){
    return alert('Profil incorrect : ce compte n’est pas un compte CAISSE. Sélectionnez « Administrateur » pour ce compte.');
  }
  if(selectedRole==='admin' && !['admin','superadmin'].includes(u.role)){
    return alert('Profil incorrect : ce compte n’est pas un compte ADMINISTRATEUR. Sélectionnez « Caisse » pour ce compte.');
  }

  if(u.role==='caisse' && !isCaisseInAllowedHours(u)){
    return alert('Accès caisse refusé : ce compte est utilisable uniquement de '+caisseAllowedRangeLabel(u)+'. Contactez l’administrateur pour modifier la plage horaire.');
  }
  await migratePasswordIfPlain(u,pass,d);
  resetLoginAttempts(email);
  if(u.companyId){const c=d.companies.find(x=>x.id===u.companyId), st=statusCompany(c); if(['expired','blocked','suspended'].includes(st)) return renderExpired(c,st)}
  if(!(await enforcePasswordChange(u))) return;
  await setSession(sessionPayloadForUser(u));
  if(u.role==='caisse') logCaisseAction('Connexion caisse','Session '+caisseSessionMinutes(u)+' min | Horaire autorisé '+caisseAllowedRangeLabel(u));
  render()
}
async function registerCompany(){
  const d=seed(), name=$('#cName').value.trim(), legalForm=$('#cLegalForm')?.value.trim()||'', rccm=$('#cRccm')?.value.trim()||'', taxAccount=$('#cTaxAccount')?.value.trim()||'', activity=$('#cActivity')?.value.trim()||'', owner=$('#cOwner').value.trim(), address=$('#cAddress')?.value.trim()||'', phone=$('#cPhone').value.trim(), email=$('#cEmail').value.trim().toLowerCase(), pass=$('#cPass').value||'1234', type=$('#cType').value;
  if(!name||!email) return alert('Raison sociale et e-mail obligatoires');
  if(d.users.some(u=>String(u.email||'').toLowerCase()===email)) return alert('Email déjà utilisé');
  const cid=id('ent'), uid=id('usr'), start=today();
  d.companies.push({id:cid,name,legalForm,rccm,taxAccount,activity,owner,address,phone,email,businessType:type,status:'FREE',planCode:'FREE',plan:'Plan gratuit — FREE',subscriptionStart:start,subscriptionEnd:new Date(Date.now()+30*86400000).toISOString().slice(0,10),createdAt:new Date().toISOString(),notes:'',shopSlug:slugify(name),shopBanner:'Boutique officielle',shopColor:'#024644'});
  const newUser={id:uid,companyId:cid,name:owner||'Administrateur principal',email,role:'admin',status:'active',createdAt:new Date().toISOString(),mainAdmin:true};
  await setUserPasswordSecure(newUser,pass);
  d.users.push(newUser);
  save(d);
  save(d); await setSession({userId:uid});
  render();
}
function renderExpired(c,st){app.innerHTML=`<div class="wrap"><div class="card" style="max-width:720px;margin:80px auto;text-align:center"><div class="brand">GLOBAL 3</div><h1>Abonnement ${esc(st)}</h1><p class="sub">L’accès de l’entreprise <b>${esc(c?.name)}</b> est actuellement ${esc(st)}. Contactez MEGA SERVICES DIABO pour renouveler ou réactiver l’abonnement.</p><p><b>+225 0777041790</b><br>megaservicediabo@gmail.com</p><button onclick="logout()">Retour connexion</button></div></div>`}
function render(){if(location.hash.startsWith('#boutique-global')) return renderGlobalShop(); if(location.hash.startsWith('#boutique/')) return renderPublicShop(location.hash.split('/')[1]||''); const {user,company}=current(); if(!user) return renderLogin(); if(user.role==='superadmin') return renderSuper(); const st=statusCompany(company); if(['expired','blocked','suspended'].includes(st)) return renderExpired(company,st); renderDash('home')}

function printCompanyHeader(company){
  if(!company) return '';
  const active=String(monthsList[getActiveMonth()]||'').toUpperCase()+' '+getManageYear();
  return `<div class="printCompanyHeader pdfModeleGlobal3">
    <div class="pchFrame">
      <div class="pchLogoCell"><div class="pchLogo">G3</div></div>
      <div class="pchInfoCell"><p><b>Raison sociale :</b> ${esc(company.name||'')}</p><p><b>Forme juridique :</b> ${esc(company.legalForm||'')}</p></div>
      <div class="pchInfoCell"><p><b>RCCM :</b> ${esc(company.rccm||'')}</p><p><b>Compte contribuable :</b> ${esc(company.taxAccount||'')}</p></div>
    </div>
    <div class="pchInfoStrip"><span>Adresse : ${esc(company.address||'DIABO-CI')}</span><span>Mode : ventes illimitées</span><span>Contact : +225 ${esc(company.phone||'0777041790')}</span></div>
  </div>`;
}

function isEnterpriseAdmin(){const {user}=current(); return user && user.role==='admin'}
function isCaisse(){const {user}=current(); return user && user.role==='caisse'}
function requireAdmin(msg='Accès réservé à l’administrateur entreprise.'){if(!isEnterpriseAdmin()){alert(msg); return false} return true}
function menu(active){
  const {user,company}=current();
  const labels={home:'⌂ Accueil',vente:'☰ Ventes',panier:'🧺 Panier',rapports:'▣ Rapports',contrats:'▣ Clients',marketplace:'🛍 Marketplace',stocks:'📦 Stocks',mois:'📅 12 mois',param:'⚙ Paramètres'};
  const freeAdmin=['home','vente','panier','rapports','stocks','mois','param'];
  const baseAdmin=planCode(company)==='FREE'?freeAdmin:['home','vente','panier','rapports',...(hasPlanFeature(company,'contracts')?['contrats']:[]),'stocks','mois','param'];
  const baseCaisse=['home','vente','panier','rapports'];
  const allowed=user?.role==='admin'?(hasPlanFeature(company,'marketplace')?[...baseAdmin,'marketplace']:baseAdmin):baseCaisse;
  return allowed.map(x=>`<button class="${active===x?'active':''}" onclick="show('${x}')">${labels[x]}</button>`).join('')
}
function shell(content,active='home'){
  const {user,company}=current();
  app.innerHTML=`<div class="g2app">
    <header class="g2topbar">
      <div class="g2brand"><div class="g2logo">G3</div><div><strong>GLOBAL 3</strong><span>MEGA SERVICES SARL U</span></div></div>
      <nav class="g2nav">${menu(active)}</nav>
      <div class="g2actions"><span class="pill">👤 ${esc(user.name||user.email)}</span>${user.role==='admin'?'<button class="accountLink" onclick="showAccountPage()">Mon compte</button>':''}<span class="pill light">${user.role==='admin'?'Administrateur':'Caisse'}</span><button onclick="logout()" class="logoutBtn">Déconnexion</button></div>
    </header>
    <main class="g2main">${printCompanyHeader(company)}<div class="companyLine"><b>${esc(company.name)}</b><span>${esc(company.plan)} — fin : ${esc(company.subscriptionEnd)}</span></div>${content}</main>
    <div id="syncBadge" class="syncBadge">${cloudSyncLabel()}</div><footer class="g2footer">© 2026 GLOBAL 3 - MEGA SERVICES SARL U. Tous droits réservés.</footer>
  </div>`
  if(active==='stocks') setTimeout(()=>toggleChargeField(),0);
}

function show(sec){
  if(sec==='marketplace') return showMarketplacePage();
  if(sec==='contrats'){const {company}=current(); if(!assertPlanFeature(company,'contracts','Clients sous contrat réservés aux plans BUSINESS et BUSINESS PLUS.')) return renderDash('home');}
  const {user}=current();
  const {company}=current(); const caisseAllowed=['home','vente','panier','rapports'];
  if(user?.role==='caisse' && !caisseAllowed.includes(sec)){alert('Accès non autorisé pour le compte caisse.'); return renderDash('home')}
  renderDash(sec)
}
function accountNav(active='info'){
  return `<div class="accountNavBanner">
    <button class="${active==='info'?'active':''}" onclick="showAccountPage()">Modifier informations entreprise</button>
    <button class="${active==='subscription'?'active':''}" onclick="showSubscriptionPage()">Mon abonnement</button>
    <button class="${active==='users'?'active':''}" onclick="showAccountUsersPage()">Comptes utilisateurs</button>
  </div>`;
}
function showAccountPage(){
  const {user,company}=current();
  if(user?.role!=='admin') return alert('Accès Mon compte réservé à l’administrateur entreprise.');
  if(!company) return render();
  var admin=user && user.role==='admin';
  shell(`<section class="section active"><div class="g2panel accountPanel"><div class="accountHead"><div><h2><span></span> Mon compte</h2><p class="sub">Espace entreprise : informations, abonnement et comptes utilisateurs.</p></div></div>${accountNav('info')}
  <div class="formCard accountForm"><h3>INFORMATION DE L’ENTREPRISE</h3><div class="grid two">
    <label>Raison sociale<input id="accName" value="${esc(company.name||'')}" ${admin?'':'disabled'}></label>
    <label>Forme juridique<input id="accLegalForm" value="${esc(company.legalForm||'')}" placeholder="EX/ SARL U" ${admin?'':'disabled'}></label>
    <label>RCCM<input id="accRccm" value="${esc(company.rccm||'')}" placeholder="EX/ CI-BKE-2025-B-00000" ${admin?'':'disabled'}></label>
    <label>Compte Contribuable<input id="accTaxAccount" value="${esc(company.taxAccount||'')}" placeholder="EX/ 0000000 A" ${admin?'':'disabled'}></label>
    <label class="fullRow">Activité<input id="accActivity" value="${esc(company.activity||company.businessType||'')}" placeholder="EX/ Informatique, impression, services numériques et transfert d’argent" ${admin?'':'disabled'}></label>
    <label>Gérant<input id="accOwner" value="${esc(company.owner||'')}" ${admin?'':'disabled'}></label>
    <label>Adresse<input id="accAddress" value="${esc(company.address||'')}" placeholder="EX/ Diabo, Côte d’Ivoire" ${admin?'':'disabled'}></label>
    <label>Téléphone<input id="accPhone" value="${esc(company.phone||'')}" ${admin?'':'disabled'}></label>
    <label>E-mail<input id="accEmail" value="${esc(company.email||'')}" ${admin?'':'disabled'}></label>
    <label>Type de commerce<select id="accType" ${admin?'':'disabled'}><option value="boutique" ${(company.businessType||'')==='boutique'?'selected':''}>Vente de produits / Boutique</option><option value="service" ${(company.businessType||'')==='service'?'selected':''}>Vente de services</option></select></label>
  </div>${admin?'<button class="fullBtn" onclick="saveCompanyInfo()">Enregistrer les informations de l’entreprise</button>':'<p class="notice">Modification réservée à l’administrateur principal.</p>'}</div>
  </div></section>`,'account');
}
function showAccountUsersPage(){
  const {d,user,company}=current();
  if(user?.role!=='admin') return alert('Accès Mon compte réservé à l’administrateur entreprise.');
  if(!company) return render();
  var admin=user && user.role==='admin';
  const users=(d.users||[]).filter(u=>u.companyId===company.id);
  shell(`<section class="section active"><div class="g2panel accountPanel"><div class="accountHead"><div><h2><span></span> Mon compte</h2><p class="sub">Gestion des comptes utilisateurs rattachés à cette entreprise.</p></div></div>${accountNav('users')}
  <div class="formCard"><h3>COMPTES UTILISATEURS</h3><p class="notice">Plan ${esc(planDef(company).statut)} : limite ${userLimitLabel(company)} utilisateur(s).</p>${admin?`<div class="grid four compactGrid"><input id="accNewName" placeholder="Nom utilisateur"><input id="accNewEmail" placeholder="Email"><input id="accNewPass" placeholder="Mot de passe"><select id="accNewRole" onchange="toggleNewCaisseHours('acc')"><option value="caisse">Caisse</option><option value="admin">Admin</option></select><span class="caisseHourFields accCaisseOnly"><input id="accNewStart" type="time" value="07:00" title="Heure début caisse"></span><span class="caisseHourFields accCaisseOnly"><input id="accNewEnd" type="time" value="22:00" title="Heure fin caisse"></span><button onclick="addAccountUser()">Ajouter utilisateur</button></div>`:''}${accountUsersTable(users,admin,user.id)}</div>
  </div></section>`,'account');
}
function saveCompanyInfo(){if(!requireAdmin()) return;const {d,company}=current(); const c=d.companies.find(x=>x.id===company.id); if(!c) return; c.name=$('#accName')?.value.trim()||c.name; c.legalForm=$('#accLegalForm')?.value.trim()||''; c.rccm=$('#accRccm')?.value.trim()||''; c.taxAccount=$('#accTaxAccount')?.value.trim()||''; c.activity=$('#accActivity')?.value.trim()||''; c.owner=$('#accOwner')?.value.trim()||''; c.address=$('#accAddress')?.value.trim()||''; c.phone=$('#accPhone')?.value.trim()||''; c.email=$('#accEmail')?.value.trim()||''; c.businessType=$('#accType')?.value||c.businessType; save(d); alert('Informations de l’entreprise mises à jour.'); showAccountPage();}
function accountUsersTable(users,admin,currentUserId){return `<div class="superTableWrap"><table class="g2table accountUsersTable"><tr><th>Nom</th><th>Email</th><th>Mot de passe</th><th>Rôle</th><th>Début caisse</th><th>Fin caisse</th><th>Statut</th><th>Action</th></tr>${users.map(u=>{const isCaisse=u.role==='caisse'; return `<tr><td><input id="auName_${u.id}" value="${esc(u.name||'')}" ${admin?'':'disabled'}></td><td><input id="auEmail_${u.id}" value="${esc(u.email||'')}" ${admin?'':'disabled'}></td><td><input id="auPass_${u.id}" value="" placeholder="${passwordFieldPlaceholder(u)||'Nouveau mot de passe'}" ${admin?'':'disabled'}></td><td><select id="auRole_${u.id}" onchange="toggleRowCaisseHours('${u.id}')" ${admin?'':'disabled'}><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option><option value="caisse" ${u.role==='caisse'?'selected':''}>Caisse</option></select></td><td class="caisseOnlyCell" id="auStartCell_${u.id}">${isCaisse?`<input id="auStart_${u.id}" type="time" value="${esc(caisseStartTime(u))}" ${admin?'':'disabled'}>`:''}</td><td class="caisseOnlyCell" id="auEndCell_${u.id}">${isCaisse?`<input id="auEnd_${u.id}" type="time" value="${esc(caisseEndTime(u))}" ${admin?'':'disabled'}>`:''}</td><td><select id="auStatus_${u.id}" ${admin?'':'disabled'}><option value="active" ${(u.status||'active')==='active'?'selected':''}>Actif</option><option value="blocked" ${u.status==='blocked'?'selected':''}>Bloqué</option></select></td><td class="actionCell">${admin?`<div class="rowActions"><button class="btn2" onclick="saveAccountUser('${u.id}')">Enregistrer</button>${u.id!==currentUserId?`<button class="danger" onclick="deleteAccountUser('${u.id}')">Supprimer</button>`:''}</div>`:'-'}</td></tr>`}).join('')||'<tr><td colspan="8">Aucun utilisateur enregistré.</td></tr>'}</table></div>`}

function toggleNewCaisseHours(prefix){const roleId=prefix==='acc'?'accNewRole':'uRole'; const role=$('#'+roleId)?.value||'caisse'; document.querySelectorAll('.'+prefix+'CaisseOnly').forEach(el=>{el.style.display=role==='caisse'?'':'none';});}
function toggleRowCaisseHours(uid){const role=$(`#auRole_${uid}`)?.value||'caisse'; const startCell=$(`#auStartCell_${uid}`), endCell=$(`#auEndCell_${uid}`); if(!startCell||!endCell) return; if(role==='caisse'){if(!startCell.querySelector('input')) startCell.innerHTML=`<input id="auStart_${uid}" type="time" value="07:00">`; if(!endCell.querySelector('input')) endCell.innerHTML=`<input id="auEnd_${uid}" type="time" value="22:00">`;}else{startCell.innerHTML=''; endCell.innerHTML='';}}
async function saveAccountUser(uid){if(!requireAdmin()) return;const {d,company}=current(); const u=d.users.find(x=>x.id===uid&&x.companyId===company.id); if(!u) return alert('Utilisateur introuvable'); const email=$(`#auEmail_${uid}`)?.value.trim().toLowerCase()||''; if(!email) return alert('Email obligatoire'); if(d.users.some(x=>x.id!==uid&&String(x.email||'').toLowerCase()===email)) return alert('Cet email est déjà utilisé'); u.name=$(`#auName_${uid}`)?.value.trim()||u.name; u.email=email; const newPass=$(`#auPass_${uid}`)?.value||''; if(newPass){await setUserPasswordSecure(u,newPass); u.mustChangePassword=true;} u.role=$(`#auRole_${uid}`)?.value||u.role; u.sessionMinutes=0; u.caisseStartTime=u.role==='caisse'?normalizeHour($(`#auStart_${uid}`)?.value,'07:00'):''; u.caisseEndTime=u.role==='caisse'?normalizeHour($(`#auEnd_${uid}`)?.value,'22:00'):''; u.status=$(`#auStatus_${uid}`)?.value||'active'; save(d); alert('Utilisateur modifié.'); showAccountUsersPage();}
function deleteAccountUser(uid){if(!requireAdmin()) return;const {d,company}=current(); const us=d.users.filter(u=>u.companyId===company.id); if(us.length<=1) return alert('Impossible de supprimer le dernier utilisateur du compte.'); if(!confirm('Supprimer définitivement cet utilisateur et son accès ?')) return; d.users=d.users.filter(u=>u.id!==uid); save(d); showAccountUsersPage();}
async function addAccountUser(){if(!requireAdmin()) return;const {d,company}=current(); if(!assertPlanFeature(company,'multi_users','Le multi-utilisateur est réservé aux plans BUSINESS et BUSINESS PLUS.')) return; if(!canCreateMoreUsers(company,d)) return alert('Limite utilisateurs atteinte pour le plan '+planDef(company).statut+' : '+userLimitLabel(company)+' utilisateur(s).'); const name=$('#accNewName')?.value.trim()||'', email=$('#accNewEmail')?.value.trim().toLowerCase()||'', pass=$('#accNewPass')?.value||'1234', role=$('#accNewRole')?.value||'caisse'; if(!name||!email) return alert('Nom et email obligatoires'); if(d.users.some(u=>String(u.email||'').toLowerCase()===email)) return alert('Email déjà utilisé'); const u={id:id('usr'),companyId:company.id,name,email,role,status:'active',sessionMinutes:0,caisseStartTime:role==='caisse'?normalizeHour($('#accNewStart')?.value,'07:00'):'',caisseEndTime:role==='caisse'?normalizeHour($('#accNewEnd')?.value,'22:00'):'',createdAt:new Date().toISOString(),mustChangePassword:true}; await setUserPasswordSecure(u,pass); d.users.push(u); save(d); showAccountUsersPage();}

function quickCard(label,icon,target,cls){return `<button class="quickCard ${cls||''}" onclick="show('${target}')"><span>${icon}</span><b>${label}</b></button>`}
function renderDash(sec='home'){
  const {d,user,company}=current(), cid=company.id;
  d.items=Array.isArray(d.items)?d.items:[]; d.sales=Array.isArray(d.sales)?d.sales:[];
  const fixedLegacySales=normalizeCompanySalesOwnership(d,cid);
  const fixedMarketplaceSales=syncMarketplaceValidatedOrdersToReport(d,cid);
  if(fixedLegacySales||fixedMarketplaceSales) save(d);
  const items=d.items.filter(i=>i.companyId===cid), sales=companySalesRows(d,cid), users=(d.users||[]).filter(u=>u.companyId===cid), clients=(d.clients||[]).filter(c=>c.companyId===cid), obligations=getObligations(d,cid);
  const manageYear=getManageYear(), activeMonth=getActiveMonth();
  var admin=user && user.role==='admin';
  const yearSales=sales.filter(isInManageYear), allReportSales=getCompanyReportSales(sales), exerciseSales=filterSalesByPeriod(allReportSales,'report'), contractPeriodSales=filterContractSalesByPeriod(allReportSales,'contracts');
  const clearedAt=getCartCutoffDate(d,cid);
  const cartSales=sales.filter(s=>!clearedAt || String(s.date||'')>clearedAt);
  const clientNames=[...new Set(yearSales.map(s=>s.client).filter(Boolean))];
  const ca=yearSales.reduce((a,b)=>a+b.total,0), charges=yearSales.reduce((a,b)=>a+(b.charges||0),0), profit=yearSales.reduce((a,b)=>a+b.profit,0);
  const exerciseCa=exerciseSales.reduce((a,b)=>a+Number(b.total||0),0), exerciseCharges=exerciseSales.reduce((a,b)=>a+Number(b.charges||0),0), exerciseProfit=exerciseSales.reduce((a,b)=>a+Number(b.profit||0),0);
  const obligationSales=admin?getSelectedObligationSales():[], obligationProfit=obligationSales.reduce((a,b)=>a+Number(b.profit||0),0);
  const todaySales=sales.filter(s=>String(s.date||'').slice(0,10)===today());
  const caDay=todaySales.reduce((a,b)=>a+b.total,0), profitDay=todaySales.reduce((a,b)=>a+b.profit,0);
  if(!admin && ['stocks','mois','param'].includes(sec)) sec='home';
  shell(`<section id="home" class="section ${sec==='home'?'active':''}">
    <div class="g2panel homeQuickPanel"><h2><span></span> Accès rapide</h2><div class="quickGrid homeQuickGrid">
      ${quickCard('Nouvelle commande','🛒','vente','green')}
      ${quickCard('Voir le panier','🧺','panier','blue')}
      ${quickCard('Rapport général','▤','rapports','gold')}
      ${quickCard('Clients contrat','📑','contrats','green')}
      ${quickCard('Marketplace','🛍','marketplace','cyan')}
      ${admin?quickCard('Paramètres','⚙️','param','purple'):''}
      ${admin?quickCard(company.businessType==='service'?'Stock services':'Stock boutique','📦','stocks','green'):''}
      ${admin?quickCard('Gestion 12 mois','📅','mois','gold'):''}
      ${admin?quickCard('Utilisateurs','👤','param','blue'):''}
    </div></div>
    <div class="homeBottomWrap">
      <div class="homeBottomGrid">
        <div class="g2panel homeSummaryPanel"><h2><span></span> Résumé du jour</h2>
          <div class="homeSummaryList">
            <div class="homeSummaryRow"><span class="homeIcon green">💼</span><b>Commandes</b><strong>${todaySales.length}</strong></div>
            <div class="homeSummaryRow"><span class="homeIcon blue">▤</span><b>Total ventes</b><strong>${money(caDay)}</strong></div>
            <div class="homeSummaryRow"><span class="homeIcon purple">🛒</span><b>Articles vendus</b><strong>${todaySales.reduce((a,b)=>a+Number(b.qty||0),0)}</strong></div>
          </div>
        </div>
        ${admin?`<div class="g2panel homeSummaryPanel"><h2><span></span> Résumé année ${manageYear}</h2>
          <div class="homeSummaryList">
            <div class="homeSummaryRow"><span class="homeIcon green">📦</span><b>Total ventes année</b><strong>${yearSales.length}</strong></div>
            <div class="homeSummaryRow"><span class="homeIcon blue">💰</span><b>CA total</b><strong>${money(ca)}</strong></div>
            <div class="homeSummaryRow"><span class="homeIcon purple">📈</span><b>Bénéfice total</b><strong>${money(profit)}</strong></div>
            <div class="homeSummaryRow"><span class="homeIcon gold">📑</span><b>Clients contrat</b><strong>${clientNames.length}</strong></div>
          </div>
        </div>`:''}
      </div>
      <div class="homeDateFooter">📅 Date : ${new Date().toLocaleDateString('fr-FR')} — Ventes illimitées</div>
    </div>
  </section>
  <section id="vente" class="section ${sec==='vente'?'active':''}">
    <div class="posShell">
      <div class="posTopBar">
        <div>
          <span class="posKicker">CAISSE ENREGISTREUSE</span>
          <h2>Vente rapide — ${esc(activeExerciseLabel())}</h2>
          <p>Recherchez, scannez/tapez un code, ajoutez les articles, puis validez une facture unique.</p>
        </div>
        <div class="posTotalBox"><small>Total panier</small><strong>${money(cartSales.reduce((a,b)=>a+Number(b.total||0),0))}</strong><button onclick="renderDash('panier')">Ouvrir le panier</button></div>
      </div>
      <div class="posLayout">
        <div class="posLeft">
          <div class="posClientCard">
            <h3>Client</h3>
            <div class="posClientGrid">
              <select id="saleClientType" onchange="toggleSaleClientFields()"><option value="particulier">Client particulier</option><option value="contrat">Client sous contrat</option></select>
              <div id="saleClientParticulier" class="posInlineFields"><input id="saleClientName" placeholder="Nom client"><input id="saleClientPhone" placeholder="Téléphone"><input id="saleClientAddress" placeholder="Adresse"></div>
              <div id="saleClientContrat" class="posInlineFields hidden"><select id="saleContractClient"><option value="">Choisir un client sous contrat</option>${clients.map(c=>`<option value="${c.id}">${esc(c.name)} — ${esc(c.phone||'')}</option>`).join('')}</select><button type="button" class="btn2" onclick="openClientContractPopup()">+ Client</button></div>
            </div>
          </div>
          <div class="posSearchCard">
            <div class="posSearchHeader"><h3>Produits / services</h3><span>${items.length} élément(s)</span></div>
            <div class="posSearchLine posSearchLinePro"><input id="posSearchInput" placeholder="Rechercher par nom, code ou catégorie..." oninput="filterPosItems()"><button onclick="renderDash('panier')">Voir panier</button></div>
            ${posCategoryChips(items)}
            <div id="posProductGrid" class="posProductGrid">${posProductCards(items)}</div>
          </div>
        </div>
      </div>
    </div>
    <div id="clientContractModal" class="modal hidden"><div class="modalOverlay" onclick="closeClientContractPopup()"></div><div class="modalCard"><button class="modalClose" onclick="closeClientContractPopup()">×</button><h2>Fiche d’enregistrement client sous contrat</h2><p class="sub">Enregistrer un nouveau client sous contrat sans quitter la vente.</p><div class="grid two"><input id="ccNamePopup" placeholder="Nom du client contrat"><input id="ccPhonePopup" placeholder="Téléphone"><select id="ccModePopup"><option value="MENSUELLE">MENSUELLE</option><option value="FIN DE MOIS">FIN DE MOIS</option><option value="AVANCE">AVANCE</option></select><input id="ccRemisePopup" type="number" value="0" placeholder="Remise %"><input id="ccObsPopup" class="fullRow" placeholder="Observation"></div><button class="fullBtn" onclick="addContractClientFromSale()">Enregistrer le client contrat</button></div></div>
  </section>
  <section id="panier" class="section ${sec==='panier'?'active':''}"><div class="g2panel panierPanel"><h2><span></span> Panier de commande</h2><p class="sub">Retirez un article, ajoutez d’autres services ou validez la commande.</p>${panierClient(cartSales)}</div></section>
  <section id="stocks" class="section printable ${sec==='stocks'?'active':''}">${stockModernSection(company,admin?items:[],admin)}</section>
  <section id="rapports" class="section printable ${sec==='rapports'?'active':''}"><div class="g2panel"><div class="reportActions"><button onclick="renderDash('rapports')">Actualiser le rapport</button><button onclick="openServiceReportPdfPage()">Imprimer / PDF</button>${admin?'<button onclick="showBilan()">Rapport bilan détaillé</button><button onclick="showBilanJourPage()">BILAN JOUR</button>':''}</div><div class="reportBox"><h1>RAPPORT GÉNÉRAL DÉTAILLÉ DES SERVICES VENDUS</h1><h3>${esc(company.name)} — GLOBAL 3 — ${esc(periodFilterLabel('report'))}</h3>${periodFilterControls('report')}${serviceReport(items,exerciseSales,admin)}<div class="totalLine">TOTAL DES VENTES AFFICHÉES : ${money(exerciseCa)}${admin?' | Bénéfice : '+money(exerciseProfit):''}</div></div></div></section>
  <section id="contrats" class="section ${sec==='contrats'?'active':''}"><div class="g2panel contractSectionPanel"><div class="contractSectionHead"><h2><span></span> Clients sous contrat</h2></div>${hasPlanFeature(company,'contracts')?`${clientContractToolbar(admin)}${clientContractForm()}${clientContractList(clients,admin)}<div class="contractConsumptionPanel"><h1>CONSOMMATION CLIENTS SOUS CONTRAT</h1><h3>${esc(contractPeriodFilterLabel('contracts'))}</h3>${contractPeriodFilterControls(allReportSales,'contracts')}${clientTable(contractPeriodSales)}</div>`:'<p class="notice">Accès non autorisé avec le plan FREE. Activez BUSINESS ou BUSINESS PLUS.</p>'}</div></section>
  <section id="mois" class="section ${sec==='mois'?'active':''}"><div class="g2panel yearManagePanel"><h2><span></span> TABLEAU DE GESTION SUR 12 MOIS</h2><div class="yearControlBar"><button class="btn2" onclick="setManageYear(-1)">← Année précédente</button><div class="yearBadgeSummary">Résumé annuel : <b>${manageYear}</b></div><button class="btn2" onclick="setManageYear(1)">Année suivante →</button></div><div class="reportActions no-print"><button onclick="openYearManagementPdfPage()">Imprimer le tableau / PDF</button><button class="btn2" onclick="renderDash('rapports')">Voir toutes les ventes</button></div></div><div class="g2panel"><div class="reportBox slim yearlyReport"><h1>TABLEAU DE GESTION SUR 12 MOIS</h1><h3>${esc(company.name)} — Année ${manageYear}</h3>${monthsGrid(admin?sales:[], admin?obligations:[])}</div></div></section>
  <section id="param" class="section ${sec==='param'?'active':''}">${admin?dataLockStatusBox():''}<div class="g2panel"><h2><span></span> Paramètres — Base de calcul des charges</h2><div class="reportActions"><button onclick="saveChargePercentages()">Enregistrer les pourcentages</button><button onclick="renderDash('param')">Actualiser la liste</button><button onclick="showFichePaiement()">Créer fiche de paiement</button></div>${chargesBase(admin?items:[])}</div><div class="g2panel"><h2><span></span> Obligations mensuelles</h2>${admin?obligationPeriodControls():''}${admin?obligationForm():''}${obligationsBox(admin?obligationProfit:0,admin?obligations:[],admin)}</div><div class="g2panel"><h2><span></span> Utilisateurs internes</h2><p class="notice">Limite du plan : ${userLimitLabel(company)} utilisateur(s).</p>${admin?`<div class="formCard"><div class="grid three"><input id="uName" placeholder="Nom"><input id="uEmail" placeholder="Email"><input id="uPass" placeholder="Mot de passe"><select id="uRole" onchange="toggleNewCaisseHours('u')"><option value="caisse">Caisse</option><option value="admin">Admin</option></select><span class="caisseHourFields uCaisseOnly"><input id="uStart" type="time" value="07:00" title="Heure début caisse"></span><span class="caisseHourFields uCaisseOnly"><input id="uEnd" type="time" value="22:00" title="Heure fin caisse"></span><button onclick="addUser()">Créer utilisateur</button></div></div>`:'<p class="notice">Réservé admin.</p>'}${usersTable(users,admin)}</div><div class="g2panel"><h2><span></span> Journal automatique des actions caisse</h2><p class="sub">Historique sécurisé des connexions, ventes, validations, impressions et actions sensibles des comptes caisse.</p>${admin?caisseLogsTable():'<p class="notice">Réservé admin.</p>'}</div><div class="g2panel"><h2><span></span> Demandes de mot de passe oublié</h2><p class="sub">Règle de sécurité : l’administrateur d’entreprise peut réinitialiser uniquement les comptes Caisse. Les comptes Administrateur sont réinitialisés par le Super Admin GLOBAL3.</p>${admin?passwordResetRequestsBox():'<p class="notice">Réservé admin.</p>'}</div></section>`,sec)
}

function stockModernSection(company,items,admin=false){
  const list=visibleStockListItems(items||[]);
  const productItems=list.filter(isBoutiqueItem);
  const categories=[...new Set(list.map(i=>String(i.cat||'Sans catégorie').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  const lowItems=productItems.filter(i=>String(i.stockType||'limited')!=='unlimited' && Number(i.stock||0)>0 && Number(i.stock||0)<=Number(i.alert||5));
  const stockValue=productItems.reduce((s,i)=>s+((String(i.stockType||'limited')==='unlimited'?0:Number(i.stock||0))*Number(i.sell||0)),0);
  const stockBuyValue=productItems.reduce((s,i)=>s+((String(i.stockType||'limited')==='unlimited'?0:Number(i.stock||0))*Number(i.buy||0)),0);
  const potentialProfit=Math.max(0,stockValue-stockBuyValue);
  return `<div class="stockProPage">
    <div class="stockProTopbar no-print">
      <div><h1>Gestion de stock</h1></div>
      <div class="stockProSearch"><span>⌕</span><input id="stockTopSearch" placeholder="Rechercher un produit, une catégorie, un code..." oninput="syncStockTopSearch(this.value)"><kbd>Ctrl + K</kbd></div>
    </div>
    <div class="stockKpiGrid">
      ${stockKpiCard('▦','Catégories',categories.length,'0% depuis le mois dernier','blue')}
      ${stockKpiCard('▣','Produits',productItems.length,'Produits et services visibles','green')}
      ${stockKpiCard('⚠','Stock faible',lowItems.length,'À surveiller rapidement','orange')}
      ${stockKpiCard('◉','Valeur du stock',money(stockValue),'Bénéfice potentiel : '+money(potentialProfit),'purple')}
    </div>
    <div class="stockActionBar stockActionBarInline no-print">
      ${admin?'<button class="stockPrimaryBtn" onclick="openStockItemPopup()">＋ Ajouter un produit</button><button class="stockCategoryAddBtn" onclick="openStockCategoryPopup()">＋ Ajouter catégorie</button>':'<button class="stockPrimaryBtn" disabled>Accès caisse</button>'}
      <label class="stockInlineFilter"><span>Catégorie</span><select id="stockCategoryFilter" onchange="filterStockTable()"><option value="">Toutes les catégories</option>${categories.map(c=>`<option value="${esc(c.toLowerCase())}">${esc(c)}</option>`).join('')}</select></label>
      <label class="stockInlineFilter"><span>Nom du produit</span><input id="stockSearch" placeholder="Rechercher un produit..." oninput="filterStockTable()"></label>
      <label class="stockInlineFilter"><span>Code</span><input id="stockCodeFilter" placeholder="Rechercher un code..." oninput="filterStockTable()"></label>
      <label class="stockInlineFilter"><span>Statut</span><select id="stockFilter" onchange="filterStockTable()"><option value="">Tous les statuts</option><option value="dispo">En stock</option><option value="alerte">Stock faible</option><option value="rupture">Rupture</option><option value="service">Service</option></select></label>
    </div>
    ${stockCategoryPrintButtons(list)}
    <div class="stockMainGrid stockMainGridFull">
      <div class="stockTableCard stockListPanel">
        ${stockModernTable(list,admin)}
      </div>
    </div>
    <div class="stockBottomGrid">
      <div class="stockChartCard no-print"><div class="stockChartHead"><h3>Évolution de la valeur du stock</h3><select><option>6 derniers mois</option></select></div><div class="stockChartSvg"><svg viewBox="0 0 800 170" preserveAspectRatio="none"><defs><linearGradient id="stockGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#2563eb" stop-opacity=".22"/><stop offset="100%" stop-color="#2563eb" stop-opacity="0"/></linearGradient></defs><path d="M20 110 L170 120 L320 130 L470 112 L620 100 L780 88 L780 160 L20 160 Z" fill="url(#stockGrad)"/><polyline points="20,110 170,120 320,130 470,112 620,100 780,88" fill="none" stroke="#2563eb" stroke-width="4"/><g fill="#2563eb"><circle cx="20" cy="110" r="5"/><circle cx="170" cy="120" r="5"/><circle cx="320" cy="130" r="5"/><circle cx="470" cy="112" r="5"/><circle cx="620" cy="100" r="5"/><circle cx="780" cy="88" r="5"/></g></svg></div><div class="stockMonths"><span>M-5</span><span>M-4</span><span>M-3</span><span>M-2</span><span>M-1</span><span>Actuel</span></div></div>
      <div class="stockValueBox no-print"><small>Valeur actuelle</small><strong>${money(stockValue)}</strong><span>Stock actif visible</span></div>
    </div>
  </div>`;
}
function stockKpiCard(icon,title,value,sub,tone){return `<div class="stockKpiCard ${tone}"><div class="stockKpiIcon">${icon}</div><div><span>${esc(title)}</span><strong>${value}</strong><small>${esc(sub)}</small></div></div>`}
function stockModernTable(items,admin=false){
  return `<div class="stockTableWrap"><table class="g2table stockTable stockModernTable"><thead><tr><th>Code</th><th>Produit</th><th>Catégorie</th><th>Quantité</th><th>Prix d’achat</th><th>Prix de vente</th><th>Valeur stock</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${items.map(i=>{const boutique=isBoutiqueItem(i); const rawQty=Number(i.stock||0); const unlimited=String(i.stockType||'limited')==='unlimited'; const qty=boutique?(unlimited?'Illimité':rawQty):'-'; const status=boutique?(unlimited?'En stock':(rawQty<=0?'Rupture':(rawQty<=Number(i.alert||5)?'Stock faible':'En stock'))):'Service'; const statusKey=status==='Rupture'?'rupture':status==='Stock faible'?'alerte':status==='Service'?'service':'dispo'; const stockVal=boutique&&!unlimited?rawQty*Number(i.buy||0):0; const photo=i.photo?`<img src="${esc(i.photo)}" alt="${esc(i.name||'Produit')}">`:`<span>${boutique?'📦':'🛠️'}</span>`; return `<tr data-search="${esc(((i.code||'')+' '+(i.name||'')+' '+(i.cat||'')+' '+(i.detail||'')).toLowerCase())}" data-code="${esc(String(i.code||'').toLowerCase())}" data-cat="${esc(String(i.cat||'').toLowerCase())}" data-status="${statusKey}"><td>${esc(i.code)}</td><td><div class="stockProductCell"><div class="stockThumb">${photo}</div><b>${esc(i.name)}</b></div></td><td>${esc(i.cat)}</td><td class="stockQtyCell ${statusKey==='alerte'?'warn':statusKey==='rupture'?'danger':''}">${qty}</td><td>${boutique?money(i.buy):'-'}</td><td>${money(i.sell)}</td><td>${boutique?money(stockVal):'-'}</td><td><span class="stockStatus ${statusKey==='alerte'?'warn':statusKey==='rupture'?'danger':statusKey==='service'?'service':'ok'}">${status}</span></td><td class="actionCell">${admin?`<div class="stockIconActions"><button class="eyeMini" title="Voir détails" onclick="openStockDetailsPopup('${i.id}')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C7 5 3.2 8.1 1.7 12c1.5 3.9 5.3 7 10.3 7s8.8-3.1 10.3-7C20.8 8.1 17 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" fill="currentColor"/></svg></button><button title="Modifier" onclick="editItem('${i.id}')">✎</button><button title="Supprimer" class="dangerMini" onclick="openStockDeletePopup('${i.id}')">🗑</button></div>`:'-'}</td></tr>`}).join('')||'<tr><td colspan="9">Aucun produit/service disponible. Les produits à stock zéro sont masqués sans être supprimés.</td></tr>'}</tbody></table></div>`;
}
function syncStockTopSearch(v){const s=document.getElementById('stockSearch'); if(s){s.value=v||''; filterStockTable();}}
function resetStockFilters(){['stockTopSearch','stockSearch','stockCodeFilter'].forEach(id=>{const el=document.getElementById(id); if(el)el.value='';}); ['stockCategoryFilter','stockFilter'].forEach(id=>{const el=document.getElementById(id); if(el)el.value='';}); filterStockTable();}
function focusStockForm(){openStockItemPopup();}
function scrollToStockCategories(){document.getElementById('stockCategoriesPanel')?.scrollIntoView({behavior:'smooth',block:'center'});}
function stockActionHint(type){openStockItemPopup(); showAutoNotice('Utilisez le popup de stock pour enregistrer une '+type+' de stock.','info');}
function closeStockPopup(){document.querySelector('.stockModalBackdrop')?.remove();}
function openStockItemPopup(iid=''){
  if(!requireAdmin('La caisse ne peut pas gérer les stocks.')) return;
  if(!ensureDataUnlocked(iid?'la modification du produit ou service':'l’ajout d’un produit ou service')) return;
  const {d,company}=current();
  const item=iid?(d.items||[]).find(x=>x.id===iid&&x.companyId===company.id):null;
  document.querySelector('.stockModalBackdrop')?.remove();
  const html=`<div class="stockModalBackdrop" onclick="if(event.target===this)closeStockPopup()"><div class="stockModalCard stockEditModal stockEditModalCompact" onclick="event.stopPropagation()"><button class="stockModalClose" onclick="closeStockPopup()">×</button><div class="stockModalHead"><h2>${item?'Modifier le produit':'Ajouter un produit'}</h2></div>${stockProductForm(company,item)}<div class="stockModalActions compactActions stockModalCloseOnly"><button class="darkBtn" onclick="closeStockPopup()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
  if(item) fillStockItemForm(item); else {clearItemForm();}
}
function fillStockItemForm(i){
  setTimeout(()=>{ const {d,company}=current();
    const set=(id,val)=>{const el=document.getElementById(id); if(el) el.value=val??''};
    set('pEdit',i.id); set('pCode',i.code||uniqueItemCode(d,company.id,i.id)); set('pName',i.name||''); set('pDetail',i.marketplaceDesc||i.detail||''); setStockPhotoPreview(i.photo||''); const rm=document.getElementById('pRemovePhoto'); if(rm) rm.checked=false; set('pCat',i.cat||''); set('pType',i.type||categoryKind(i.cat)); set('pStockType',i.stockType||'limited'); set('pBuy',i.buy||0); set('pSell',i.sell||0); set('pServicePrice',i.sell||0); set('pStock',i.stock||0); set('pAlert',i.alert||5); set('pCharge',isBoutiqueItem(i)?autoBoutiqueChargePercent(i):Number(i.charge||0)); toggleChargeField(); toggleStockQuantityField();
  },0);
}
function editItem(iid){openStockItemPopup(iid)}
function openStockDetailsPopup(iid){
  const {d,company}=current(); const i=(d.items||[]).find(x=>x.id===iid&&x.companyId===company.id); if(!i) return;
  const boutique=isBoutiqueItem(i), qty=Number(i.stock||0), buy=Number(i.buy||0), sell=Number(i.sell||0), stockVal=boutique?qty*buy:0, saleVal=boutique?qty*sell:sell, profit=Math.max(0,saleVal-stockVal);
  document.querySelector('.stockModalBackdrop')?.remove();
  const html=`<div class="stockModalBackdrop" onclick="if(event.target===this)closeStockPopup()"><div class="stockModalCard stockDetailsModal" onclick="event.stopPropagation()"><button class="stockModalClose" onclick="closeStockPopup()">×</button><div class="stockModalHead"><h2>Détails du produit ou service</h2><p>Informations complètes, valeurs et historique.</p></div><div class="stockDetailsGrid"><div class="stockDetailPhoto">${i.photo?`<img src="${esc(i.photo)}" alt="${esc(i.name||'')}">`:'📦'}</div><div class="stockDetailList"><p><b>Code :</b> ${esc(i.code||'-')}</p><p><b>Nom :</b> ${esc(i.name||'-')}</p><p><b>Catégorie :</b> ${esc(i.cat||'-')}</p><p><b>Description :</b> ${esc(i.marketplaceDesc||i.detail||'-')}</p><p><b>Quantité :</b> ${boutique?qty:'Service'}</p><p><b>Prix d’achat :</b> ${boutique?money(buy):'-'}</p><p><b>Prix de vente :</b> ${money(sell)}</p><p><b>Valeur du stock :</b> ${boutique?money(stockVal):'-'}</p><p><b>Bénéfice potentiel :</b> ${money(profit)}</p></div></div><div class="stockMovementBox"><h3>Historique des entrées</h3>${stockHistoryHtml(i,'approvisionnement')}</div><div class="stockMovementBox"><h3>Historique des sorties</h3>${stockHistoryHtml(i,'retrait')}</div><div class="stockModalActions"><button class="btn2" onclick="editItem('${i.id}')">Modifier</button><button class="darkBtn" onclick="closeStockPopup()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
function openStockDeletePopup(iid){
  if(!requireAdmin('La caisse ne peut pas supprimer les stocks.')) return;
  const {d,company}=current(); const i=(d.items||[]).find(x=>x.id===iid&&x.companyId===company.id); if(!i) return;
  document.querySelector('.stockModalBackdrop')?.remove();
  document.body.insertAdjacentHTML('beforeend',`<div class="stockModalBackdrop" onclick="if(event.target===this)closeStockPopup()"><div class="stockModalCard stockDeleteModal" onclick="event.stopPropagation()"><button class="stockModalClose" onclick="closeStockPopup()">×</button><div class="stockModalHead"><h2>Confirmation de suppression</h2><p>Cette action supprimera l’élément sélectionné de la liste.</p></div><div class="notice dangerNotice"><b>${esc(i.name||'Élément')}</b><br>Code : ${esc(i.code||'-')} — Catégorie : ${esc(i.cat||'-')}</div><div class="stockModalActions"><button class="danger" onclick="confirmDeleteStockItem('${i.id}')">Supprimer définitivement</button><button class="btn2" onclick="closeStockPopup()">Annuler</button></div></div></div>`);
}
function confirmDeleteStockItem(iid){if(!ensureDataUnlocked('la suppression d’un produit ou service')) return;const {d,company}=current(); d.items=d.items.filter(i=>!(i.id===iid&&i.companyId===company.id)); save(d); closeStockPopup(); renderDash('stocks')}
function deleteItem(iid){openStockDeletePopup(iid)}
function stockHistoryHtml(item,type=''){
  if(!item) return '<p class="notice">Sélectionnez ou enregistrez d’abord un produit/service pour afficher l’historique.</p>';
  const rows=(item.movements||[]).filter(m=>!type||m.type===type).slice().reverse();
  if(!rows.length) return '<p class="notice">Aucun mouvement enregistré.</p>';
  return `<table class="g2table stockHistoryTable"><tr><th>Date</th><th>Type</th><th>Qté avant</th><th>Mouvement</th><th>Qté après</th><th>Responsable</th><th>Note</th></tr>${rows.map(m=>`<tr><td>${esc(m.date||'-')}</td><td>${esc(m.type||'-')}</td><td>${Number(m.before||0)}</td><td>${Number(m.qty||0)}</td><td>${Number(m.after||0)}</td><td>${esc(m.responsable||'-')}</td><td>${esc(m.note||'')}</td></tr>`).join('')}</table>`;
}
function currentStockFormItem(){const {d,company}=current(); const eid=document.getElementById('pEdit')?.value; return eid?(d.items||[]).find(i=>i.id===eid&&i.companyId===company.id):null;}
function stockApprovisionner(){
  if(!requireAdmin('La caisse ne peut pas gérer les stocks.')) return; const {d}=current(); const it=currentStockFormItem(); if(!it) return alert('Enregistrez ou sélectionnez d’abord un produit.'); if(!isBoutiqueItem(it)) return alert('L’approvisionnement concerne uniquement les produits.');
  const qty=Number(document.getElementById('stockInQty')?.value||0); if(qty<=0) return alert('Quantité à ajouter obligatoire.'); const before=Number(it.stock||0); it.stock=before+qty; const buy=Number(document.getElementById('stockInBuy')?.value||0); if(buy>0) it.buy=buy; it.movements=it.movements||[]; it.movements.push({date:document.getElementById('stockInDate')?.value||new Date().toLocaleDateString('fr-FR'),type:'approvisionnement',before,qty,after:it.stock,responsable:activeUserName(),note:(document.getElementById('stockInSupplier')?.value||'')+' '+(document.getElementById('stockInNote')?.value||'')}); save(d); showAutoNotice('Approvisionnement enregistré avec succès.','success'); closeStockPopup(); renderDash('stocks');
}
function stockRetirer(){
  if(!requireAdmin('La caisse ne peut pas gérer les stocks.')) return; const {d}=current(); const it=currentStockFormItem(); if(!it) return alert('Enregistrez ou sélectionnez d’abord un produit.'); if(!isBoutiqueItem(it)) return alert('Le retrait concerne uniquement les produits.');
  const qty=Number(document.getElementById('stockOutQty')?.value||0); const before=Number(it.stock||0); if(qty<=0) return alert('Quantité à retirer obligatoire.'); if(qty>before) return alert('Retrait impossible : quantité supérieure au stock disponible.'); it.stock=before-qty; it.movements=it.movements||[]; it.movements.push({date:document.getElementById('stockOutDate')?.value||new Date().toLocaleDateString('fr-FR'),type:'retrait',before,qty:-qty,after:it.stock,responsable:document.getElementById('stockOutResp')?.value||activeUserName(),note:(document.getElementById('stockOutReason')?.value||'')+' '+(document.getElementById('stockOutNote')?.value||'')}); save(d); showAutoNotice('Retrait de stock enregistré avec succès.','success'); closeStockPopup(); renderDash('stocks');
}
function activeUserName(){try{return current()?.user?.name||'Utilisateur'}catch(e){return 'Utilisateur'}}
function printStockCurrentFicha(){const it=currentStockFormItem(); if(!it) return alert('Sélectionnez ou enregistrez un élément avant impression.'); openStockDetailsPopup(it.id); setTimeout(()=>window.print(),300)}


function openStockCategoryPopup(){
  if(!requireAdmin('La caisse ne peut pas gérer les catégories.')) return;
  const {d,company}=current();
  const catRecords=getCompanyCategoryRecords(d,company.id);
  document.querySelector('.stockModalBackdrop')?.remove();
  const rows=catRecords.map(c=>`<tr><td>${esc(c.name)}</td><td>${c.kind==='service'?'Service':'Produit'}</td><td><button class="btn2 smallCatBtn" onclick="openEditCategoryPopup('${esc(c.name).replace(/'/g,'&#39;')}')">✎</button><button class="danger smallCatBtn" onclick="openDeleteCategoryPopup('${esc(c.name).replace(/'/g,'&#39;')}')">×</button></td></tr>`).join('')||'<tr><td colspan="3">Aucune catégorie enregistrée.</td></tr>';
  const html=`<div class="stockModalBackdrop" onclick="if(event.target===this)closeStockPopup()"><div class="stockModalCard stockCategoryModal" onclick="event.stopPropagation()"><button class="stockModalClose" onclick="closeStockPopup()">×</button><div class="stockModalHead"><h2>Ajouter catégorie</h2></div><div class="categoryOnlyForm"><div id="categoryPopupNotice" class="categoryPopupNotice hidden"></div><div class="grid three"><label>Nom de la catégorie<input id="customCatName" placeholder="Exemple : Téléphones, Impressions, Accessoires..."></label><label>Type de catégorie<select id="customCatKind"><option value="boutique">Catégorie PRODUIT</option><option value="service">Catégorie SERVICE</option></select></label><button class="stockPrimaryBtn" onclick="if(addCustomCategory()) closeStockPopup()">Ajouter catégorie</button></div>${planCode(company)==='FREE'?'<p class="notice"><b>Plan FREE :</b> 1 seule catégorie autorisée.</p>':''}<div class="stockCategoryList"><h3>Catégories enregistrées</h3><table class="g2table"><tr><th>Catégorie</th><th>Type</th><th>Actions</th></tr>${rows}</table></div></div><div class="stockModalActions compactActions stockModalCloseOnly"><button class="darkBtn" onclick="closeStockPopup()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function stockProductForm(company,item=null){
 const {d}=current();
 const allCats=getCompanyCategoryRecords(d,company.id);
 const currentCat=item?.cat||'';
 const extraCurrent=(currentCat && !allCats.some(c=>c.name===currentCat))?`<option value="${esc(currentCat)}" data-kind="${categoryKind(currentCat)}">${esc(currentCat)} — Catégorie existante</option>`:'';
 const catOptions='<option value="">Sélectionner une catégorie enregistrée</option>'+extraCurrent+allCats.map(c=>`<option value="${esc(c.name)}" data-kind="${esc(c.kind)}">${esc(c.name)} — ${c.kind==='service'?'Catégorie service':'Catégorie produit'}</option>`).join('');
 return `<input id="pEdit" type="hidden"><input id="pType" type="hidden" value="boutique"><div class="stockForm stockFormReorg productMode"><div class="field fullRow"><label>Catégorie obligatoire</label><select id="pCat" required onchange="toggleChargeField()">${catOptions}</select><small>Toutes les catégories enregistrées sont disponibles. Le formulaire s’adapte automatiquement selon Produit ou Service.</small></div><div class="field itemField line1"><label>Code produit</label><input id="pCode" maxlength="7" pattern="[A-Za-z0-9]{7}" value="${uniqueItemCode(d,company.id)}" readonly><small>7 caractères, chiffres et lettres, sans espace.</small></div><div class="field itemField line1"><label>Nom du produit</label><input id="pName" placeholder="Exemple : Ordinateur portable, téléphone, accessoire..."></div><div class="field itemField stockTypeOnly line1"><label>Type de stock</label><select id="pStockType" onchange="toggleStockQuantityField()"><option value="limited">Stock limité — respecter la quantité</option><option value="unlimited">Stock illimité — vente sans contrôle de stock</option></select><small>La quantité s’affiche uniquement pour un stock limité.</small></div><div class="field itemField stockOnly stockQtyOnly line1"><label>Quantité</label><input id="pStock" type="number" value="0"></div><div class="field itemField stockOnly line1"><label>Seuil d’alerte</label><input id="pAlert" type="number" value="5"></div><div class="field itemField serviceOnly line2" id="servicePriceField" style="display:none"><label>Prix du service</label><input id="pServicePrice" type="number" placeholder="FCFA"></div><div class="field itemField stockOnly line2"><label>Prix d’achat unitaire</label><input id="pBuy" type="number" placeholder="FCFA" oninput="updateAutoProductCharge()"></div><div class="field itemField stockOnly line2"><label>Prix de vente unitaire</label><input id="pSell" type="number" placeholder="FCFA" oninput="updateAutoProductCharge()"></div><div class="field itemField chargeField line2" id="chargeField"><label>Charge automatique (%)</label><input id="pCharge" type="number" min="0" max="100" value="30" readonly><small id="chargeHelp">Produit : % automatique = prix d’achat ÷ prix de vente × 100.</small></div><div class="field itemField line2 photoField photoBoxField"><label>Photo produit</label><div class="stockPhotoBox"><div id="pPhotoPreview" class="stockPhotoPreview stockPhotoEmpty"><span class="photoIcon">📷</span><strong>Aucune photo</strong><small>Photo visible par les clients dans la boutique publique.</small></div><div class="photoActions"><label class="photoChooseBtn" for="pPhoto">Choisir une photo</label><button type="button" class="photoDeleteBtn" onclick="removeStockPhoto()">Supprimer</button></div><input id="pPhoto" class="photoInputHidden" type="file" accept="image/*" onchange="previewStockPhoto(this)"><input id="pPhotoData" type="hidden"><input id="pRemovePhoto" type="checkbox" class="hidden"></div></div><div class="field itemField line2 descField"><label>Description visible client</label><textarea id="pDetail" rows="5" maxlength="350" placeholder="Courte description du produit visible dans la boutique client"></textarea><small>Cette description sera affichée dans Marketplace et la boutique publique.</small></div><div class="stockButtons itemField fullRow"><button onclick="addItem()">Enregistrer le produit</button><button class="btn2" onclick="clearItemForm()">Vider le formulaire</button></div></div>`;
}

function stockForm(company){
 const {d}=current(), catRecords=getCompanyCategoryRecords(d,company.id);
 const catOptions='<option value="">Sélectionner obligatoirement une catégorie enregistrée</option>'+catRecords.map(c=>`<option value="${esc(c.name)}" data-kind="${c.kind}">${esc(c.name)} — ${c.kind==='service'?'Catégorie service':'Catégorie produit'}</option>`).join('');
 return `<div class="categoryManager"><h3>Catégories utiles pour cette entreprise</h3><p class="sub">Ajoutez d’abord vos catégories. Ensuite, l’enregistrement d’un élément commence obligatoirement par le choix d’une catégorie produit ou service.</p>${planCode(company)==='FREE'?'<p class="notice"><b>Plan FREE :</b> 1 seule catégorie autorisée et 5 produits OU 5 services maximum.</p>':''}<div class="grid three"><input id="customCatName" placeholder="Nom de la catégorie"><select id="customCatKind"><option value="boutique">Catégorie PRODUIT</option><option value="service">Catégorie SERVICE</option></select><button onclick="addCustomCategory()">Ajouter la catégorie</button></div><div class="categoryChips">${catRecords.map(c=>`<span class="catChip">${esc(c.name)} <small>${c.kind==='service'?'SERVICE':'PRODUIT'}</small><button title="Modifier la catégorie" onclick="openEditCategoryPopup('${esc(c.name).replace(/'/g,'&#39;')}')">✎</button><button title="Supprimer la catégorie" onclick="openDeleteCategoryPopup('${esc(c.name).replace(/'/g,'&#39;')}')">×</button></span>`).join('')||'<em>Aucune catégorie enregistrée. Ajoutez une catégorie produit ou service avant d’enregistrer un élément.</em>'}</div></div>
 <input id="pEdit" type="hidden"><input id="pType" type="hidden" value=""><div class="stockForm stockFormReorg"><div class="field fullRow"><label>1. Catégorie obligatoire</label><select id="pCat" required onchange="toggleChargeField()">${catOptions}</select><small>Les autres champs s’affichent automatiquement selon le type de catégorie choisi.</small></div><div class="field itemField line1"><label>Code produit/service</label><input id="pCode" maxlength="7" pattern="[A-Za-z0-9]{7}" value="${uniqueItemCode(d,company.id)}" readonly><small>7 caractères, chiffres et lettres, sans espace.</small></div><div class="field itemField line1"><label>Nom de l’élément</label><input id="pName" placeholder="Nom du produit ou service"></div><div class="field itemField stockTypeOnly line1"><label>Type de stock</label><select id="pStockType" onchange="toggleStockQuantityField()"><option value="limited">Stock limité — respecter la quantité</option><option value="unlimited">Stock illimité — vente sans contrôle de stock</option></select><small>La quantité s’affiche uniquement pour un stock limité.</small></div><div class="field itemField stockOnly stockQtyOnly line1"><label>Quantité</label><input id="pStock" type="number" value="0"></div><div class="field itemField stockOnly line1"><label>Seuil d’alerte</label><input id="pAlert" type="number" value="5"></div><div class="field itemField serviceOnly line1" id="servicePriceField" style="display:none"><label>Prix du service indicatif</label><input id="pServicePrice" type="number" placeholder="FCFA"></div><div class="field itemField stockOnly line2"><label>Prix d’achat unitaire</label><input id="pBuy" type="number" placeholder="FCFA" oninput="updateAutoProductCharge()"></div><div class="field itemField stockOnly line2"><label>Prix de vente unitaire</label><input id="pSell" type="number" placeholder="FCFA" oninput="updateAutoProductCharge()"></div><div class="field itemField chargeField line2" id="chargeField"><label>Charges service (%)</label><input id="pCharge" type="number" min="0" max="100" value="30"><small id="chargeHelp">Produit : automatique. Service : manuel.</small></div><div class="field itemField line2 photoField photoBoxField"><label>Photo produit/service</label><div class="stockPhotoBox"><div id="pPhotoPreview" class="stockPhotoPreview stockPhotoEmpty"><span class="photoIcon">📷</span><strong>Aucune photo</strong><small>Photo visible par les clients dans la boutique publique.</small></div><div class="photoActions"><label class="photoChooseBtn" for="pPhoto">Choisir une photo</label><button type="button" class="photoDeleteBtn" onclick="removeStockPhoto()">Supprimer</button></div><input id="pPhoto" class="photoInputHidden" type="file" accept="image/*" onchange="previewStockPhoto(this)"><input id="pPhotoData" type="hidden"><input id="pRemovePhoto" type="checkbox" class="hidden"></div></div><div class="field itemField line2 descField"><label>Description visible client</label><textarea id="pDetail" rows="5" maxlength="350" placeholder="Courte description du produit ou du service visible dans la boutique client"></textarea><small>Cette description sera affichée dans Marketplace et la boutique publique.</small></div><div class="stockButtons itemField fullRow"><button onclick="addItem()">Enregistrer l’élément</button><button class="btn2" onclick="clearItemForm()">Vider le formulaire</button><button class="darkBtn" onclick="openStockPdfPage()">Imprimer la liste</button></div></div>`}


function posCategoryChips(items){
  const cats=[...new Set((items||[]).map(i=>String(i.cat||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  // Les boutons utilisent uniquement data-pos-cat : cela évite les erreurs onclick avec les apostrophes, accents ou caractères spéciaux.
  return `<div class="posChips"><button class="active" data-pos-cat="" onclick="selectPosCategoryFromButton(this)">Tous</button>${cats.map(c=>`<button data-pos-cat="${esc(c)}" onclick="selectPosCategoryFromButton(this)">${esc(c)}</button>`).join('')}</div>`;
}
function posProductCards(items){
  const rows=(items||[]).filter(i=>!isBoutiqueItem(i)||i.stockType==='unlimited'||Number(i.stock||0)>0).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'fr'));
  return rows.map(i=>{
    const isProduct=isBoutiqueItem(i);
    const price=isProduct?Number(i.sell||0):Number(i.sell||i.servicePrice||0);
    const typeLabel=isProduct?'Produit':'Service';
    const icon=i.photo?`<img src="${esc(i.photo)}" alt="${esc(i.name||'Article')}">`:`<span class="posCardIcon">${isProduct?'📦':'🛠️'}</span>`;
    const searchValue=String((i.code||'')+' '+(i.name||'')+' '+(i.cat||'')+' '+(i.detail||'')+' '+(i.marketplaceDesc||'')).toLowerCase();
    return `<button type="button" class="posProductCard posProductCardPro posCardCenter" data-pos-search="${esc(searchValue)}" data-pos-cat="${esc(i.cat||'')}" onclick="quickAddPosItem('${i.id}')">
      <div class="posCenterIcon">${icon}</div>
      <div class="posCenterBadge ${isProduct?'prod':'serv'}">${typeLabel}</div>
      <div class="posCenterName">${esc(i.name||'Sans nom')}</div>
      <div class="posCenterCode">Code : ${esc(i.code||'-')}</div>
      <div class="posCenterPrice">${money(price)}</div>
      <div class="posCenterAdd">Ajouter</div>
    </button>`;
  }).join('')||'<p class="emptyCart">Aucun produit/service disponible.</p>';
}
function selectPosCategoryFromButton(btn){
  const cat=btn?.getAttribute('data-pos-cat')||'';
  selectPosCategory(cat,btn);
}
function selectPosCategory(cat,btn){
  // Correction : les cartes de caisse utilisent display:flex!important en CSS.
  // Le filtrage doit donc appliquer un display avec priorité ou une classe dédiée.
  document.querySelectorAll('.posChips button').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  window.__posActiveCategory=String(cat||'');
  applyPosFilters();
}
function filterPosItems(){ applyPosFilters(); }
function normalizePosFilterValue(v){
  return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function applyPosFilters(){
  const q=normalizePosFilterValue(document.getElementById('posSearchInput')?.value||'');
  const active=document.querySelector('.posChips button.active');
  const cat=normalizePosFilterValue(window.__posActiveCategory || active?.getAttribute('data-pos-cat') || '');
  document.querySelectorAll('.posProductCard').forEach(card=>{
    const cardCat=normalizePosFilterValue(card.getAttribute('data-pos-cat')||'');
    const search=normalizePosFilterValue(card.getAttribute('data-pos-search')||'');
    const okCat=!cat || cardCat===cat;
    const okSearch=!q || search.includes(q);
    const visible=okCat && okSearch;
    card.classList.toggle('posCardHidden',!visible);
    card.style.setProperty('display', visible ? 'flex' : 'none', 'important');
  });
}
function focusPosCode(){document.getElementById('saleCodeInput')?.focus();}
function quickAddPosItem(itemId){
  openSaleAddPopup(itemId);
}
function openSaleAddPopup(itemId){
  const {d,company}=current();
  const item=(d.items||[]).find(i=>i.companyId===company.id&&i.id===itemId);
  if(!item) return showAutoNotice('Produit/service introuvable.','error');
  const mode=isBoutiqueItem(item)?'boutique':'service';
  const title=mode==='boutique'?'Ajouter le produit au panier':'Ajouter le service au panier';
  const price=mode==='boutique'?Number(item.sell||0):Number(item.sell||item.servicePrice||0);
  const detail=item.detail||item.marketplaceDesc||item.cat||'';
  const old=document.querySelector('.saleAddPopupBackdrop'); if(old) old.remove();
  const html=`<div class="saleAddPopupBackdrop" onclick="closeSaleAddPopup(event)">
    <div class="saleAddPopupCard" onclick="event.stopPropagation()">
      <div class="saleAddPopupHead"><div><span>${mode==='boutique'?'PRODUIT':'SERVICE'}</span><h2>${title}</h2></div><button type="button" onclick="document.querySelector('.saleAddPopupBackdrop')?.remove()">×</button></div>
      <input id="salePopupItemId" type="hidden" value="${esc(item.id)}"><input id="salePopupMode" type="hidden" value="${mode}">
      <div class="salePopupGrid">
        <label>Catégorie<input readonly value="${esc(item.cat||'')}"></label>
        <label>Code<input readonly value="${esc(item.code||'')}"></label>
        <label>Nom<input readonly value="${esc(item.name||'')}"></label>
        <label>Détail<input readonly value="${esc(detail)}"></label>
        ${mode==='boutique'?`
          <label>Prix<input id="salePopupProductPrice" readonly type="number" value="${price}"></label>
          <label>Qté<input id="salePopupQty" type="number" min="1" value="1" oninput="updateSalePopupTotals()"></label>
          <label>Total<input id="salePopupTotal" readonly type="number" value="${price}"></label>
        `:`
          <label>Prix vente du service<input id="salePopupServicePrice" type="number" min="0" value="${price||''}" placeholder="Prix de vente" oninput="updateSalePopupTotals()"></label>
          <label>Frais service<input id="salePopupServiceFee" type="number" min="0" value="0" oninput="updateSalePopupTotals()"></label>
          <label>Qté<input id="salePopupQty" type="number" min="1" value="1" oninput="updateSalePopupTotals()"></label>
          <label>Prix unitaire<input id="salePopupUnit" readonly type="number" value="${price||0}"></label>
          <label>Total<input id="salePopupTotal" readonly type="number" value="${price||0}"></label>
        `}
        <label class="salePopupFull">Note<textarea id="salePopupNote" rows="3" placeholder="Note ou observation facultative"></textarea></label>
      </div>
      <div class="salePopupMessage" id="salePopupMessage"></div>
      <div class="salePopupActions"><button type="button" class="btn2" onclick="document.querySelector('.saleAddPopupBackdrop')?.remove()">Annuler</button><button type="button" class="salePopupSubmit" onclick="addSaleFromPopup()">Ajouter au panier</button></div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend',html);
  updateSalePopupTotals();
}
function closeSaleAddPopup(e){ if(e&&e.target&&e.target.classList.contains('saleAddPopupBackdrop')) e.target.remove(); }
function salePopupMessage(msg,type='error'){
  const el=document.getElementById('salePopupMessage');
  if(el){el.textContent=msg; el.className='salePopupMessage '+type;}
  else showAutoNotice(msg,type);
}
function updateSalePopupTotals(){
  const mode=document.getElementById('salePopupMode')?.value||'';
  const qtyEl=document.getElementById('salePopupQty');
  let qty=Math.max(1,Number(qtyEl?.value||1));
  if(qtyEl && (!qtyEl.value || Number(qtyEl.value)<1)){qtyEl.value=1; qty=1;}
  const totalEl=document.getElementById('salePopupTotal');
  if(mode==='boutique'){
    const price=Math.max(0,Number(document.getElementById('salePopupProductPrice')?.value||0));
    if(totalEl) totalEl.value=price*qty;
  }else{
    const servicePrice=Math.max(0,Number(document.getElementById('salePopupServicePrice')?.value||0));
    const fee=Math.max(0,Number(document.getElementById('salePopupServiceFee')?.value||0));
    const total=servicePrice+fee;
    const unitEl=document.getElementById('salePopupUnit');
    if(totalEl) totalEl.value=total;
    if(unitEl) unitEl.value=qty?Number((total/qty).toFixed(2)):0;
  }
}
function addSaleFromPopup(){
  if(!ensureActiveExerciseEditable()) return;
  const {d,user,company}=current();
  const cid=company.id, iid=document.getElementById('salePopupItemId')?.value||'', mode=document.getElementById('salePopupMode')?.value||'';
  const item=(d.items||[]).find(i=>i.companyId===cid&&i.id===iid);
  if(!item) return salePopupMessage('Produit ou service introuvable.');
  let qty=Math.max(1,Number(document.getElementById('salePopupQty')?.value||1));
  const qtyEl=document.getElementById('salePopupQty'); if(qtyEl) qtyEl.value=qty;
  let unit=0,total=0,serviceFee=0,charges=0;
  if(mode==='boutique'){
    unit=Math.max(0,Number(item.sell||0)); total=unit*qty;
    if(unit<=0) return salePopupMessage('Le prix du produit doit être supérieur à 0.');
    if(qty<1||total<=0) return salePopupMessage('Quantité ou total invalide.');
    if(item.stockType!=='unlimited' && Number(item.stock||0)<qty) return salePopupMessage('Stock insuffisant pour ce produit.');
    charges=Number(item.buy||0)*qty;
    if(item.stockType!=='unlimited') item.stock=Number(item.stock||0)-qty;
  }else{
    const servicePrice=Math.max(0,Number(document.getElementById('salePopupServicePrice')?.value||0));
    serviceFee=Math.max(0,Number(document.getElementById('salePopupServiceFee')?.value||0));
    total=servicePrice+serviceFee;
    unit=qty>0?total/qty:0;
    if(servicePrice<=0) return salePopupMessage('Veuillez saisir le prix de vente du service avant d’ajouter au panier.');
    if(qty<1||total<=0||unit<=0) return salePopupMessage('Quantité, total ou prix unitaire invalide.');
    charges=servicePrice*(Number(item.charge||0)/100);
  }
  const note=String(document.getElementById('salePopupNote')?.value||'').trim();
  const saleClientInfo=getSaleClientInfo();
  if(!saleClientInfo.ok) return salePopupMessage('Veuillez choisir un client sous contrat avant d’ajouter au panier.');
  const client=saleClientInfo.label, clientId=saleClientInfo.clientId;
  const sid='G3-'+new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14)+'-'+Math.floor(Math.random()*90+10);
  d.sales=d.sales||[];
  d.sales.push({id:sid,companyId:cid,userId:user.id,client,name:item.name,detail:item.detail||item.marketplaceDesc||item.cat||'',qty,unit,total,serviceFee,charges,profit:total-charges,date:new Date().toISOString(),docSecureLink:secureDocLink(sid),docQr:true,clientType:saleClientInfo.type,clientId,itemCode:item.code||'',itemId:item.id,category:item.cat||'',saleKind:mode,note,serviceSalePrice:mode==='service'?Math.max(0,Number(document.getElementById('salePopupServicePrice')?.value||0)):0});
  save(d);
  logCaisseAction('Ajout au panier','Ligne '+sid+' — '+(item.name||''));
  document.querySelector('.saleAddPopupBackdrop')?.remove();
  refreshPosTicket();
  showAutoNotice('Commande ajoutée au panier.', 'success');
}
function posCartRowsHTML(cartSales){
  const rows=(cartSales||[]).slice(-10).reverse();
  if(!rows.length) return '<p class="emptyCart">Aucun article ajouté.</p>';
  return rows.map(s=>`<div class="posCartRow" data-sale-id="${esc(s.id)}"><div class="posCartInfo"><b>${esc(s.name)}</b><span>${Number(s.qty||1)} × ${money(s.unit||0)}</span></div><strong>${money(s.total||0)}</strong><div class="posCartActions"><button type="button" class="posEditBtn" onclick="openEditCartLine('${s.id}')" title="Modifier cette ligne">✎</button><button type="button" class="posRemoveBtn" onclick="removeSaleFromTicket('${s.id}')" title="Retirer du ticket">×</button></div></div>`).join('');
}
function refreshPosTicket(){
  const rowsBox=document.getElementById('posCartRows');
  const totalBox=document.getElementById('posCartTotal');
  const topTotal=document.querySelector('.posTotalBox strong');
  if(!rowsBox && !totalBox && !topTotal) return;
  const cart=getCurrentCompanyCartSales();
  const total=cart.reduce((a,b)=>a+Number(b.total||0),0);
  if(rowsBox) rowsBox.innerHTML=posCartRowsHTML(cart);
  if(totalBox) totalBox.textContent=money(total);
  if(topTotal) topTotal.textContent=money(total);
}
function removeSaleFromTicket(sid){
  const {d,company}=current();
  const s=findCompanySaleById(d,company.id,sid);
  if(!s) return showAutoNotice('Ligne introuvable.','error');
  if(!requireCaisseCanEditSale(s)) return;
  if(isSaleExerciseLocked(s)) return showAutoNotice('Cet exercice est verrouillé. Retrait impossible.','error');
  restoreStockFromSaleRecord(d,s);
  removeCompanySalesByIds(d,company.id,sid);
  rebuildMarketplaceOrderReportState(d,s?.marketplaceOrderId);
  markMarketplaceReportDeletedIfEmpty(d,s?.marketplaceOrderId);
  save(d);
  logCaisseAction('Retrait du ticket','Ligne '+sid+' retirée');
  refreshPosTicket();
  showAutoNotice('Article retiré du ticket.','success');
}
function showAutoNotice(message,type='success'){
  document.querySelectorAll('.g3AutoNotice').forEach(x=>x.remove());
  const el=document.createElement('div');
  el.className='g3AutoNotice '+(type==='error'?'error':'success');
  el.textContent=message;
  document.body.appendChild(el);
  setTimeout(()=>{el.classList.add('hide'); setTimeout(()=>el.remove(),260);},2000);
}
function isVisibleStockListItem(i){
  // Masquer dans la liste active les produits à stock limité arrivés à 0,
  // sans supprimer l'article et sans toucher aux anciennes ventes/rapports.
  const boutique=isBoutiqueItem(i);
  if(!boutique) return true; // les services restent visibles
  if(String(i.stockType||'limited')==='unlimited') return true; // stock illimité toujours visible
  return Number(i.stock||0)>0;
}
function visibleStockListItems(items){return (items||[]).filter(isVisibleStockListItem);}
function itemsTable(items,admin=false){
  const visibleItems=visibleStockListItems(items);
  return `<div class="reportBox slim stockReport"><h1>LISTE DES CATÉGORIES, PRODUITS ET SERVICES</h1><h3>GLOBAL 3</h3><table class="g2table stockTable"><tr><th>Code</th><th>Élément</th><th>Catégorie</th><th>Type</th><th>Qté</th><th>Achat U.</th><th>Vente / Prix</th><th>Charges %</th><th>Statut</th><th>Action</th></tr>${visibleItems.map(i=>{const boutique=isBoutiqueItem(i); const st=boutique?(i.stockType==='unlimited'?'Illimité':(Number(i.stock||0)<=Number(i.alert||5)?'Alerte':'Disponible')):'Service'; return `<tr data-search="${esc((i.code+' '+i.name+' '+i.cat).toLowerCase())}" data-status="${(st==='Disponible'||st==='Illimité')?'dispo':st==='Alerte'?'alerte':'service'}"><td>${esc(i.code)}</td><td>${esc(i.name)}</td><td>${esc(i.cat)}</td><td>${boutique?'Produit':'Service'}</td><td>${boutique?(i.stockType==='unlimited'?'Illimité':Number(i.stock||0)):'-'}</td><td>${boutique?money(i.buy):'-'}</td><td>${money(i.sell)}</td><td>${boutique?autoBoutiqueChargePercent(i):Number(i.charge||0)}%</td><td><span class="stockStatus ${(st==='Disponible'||st==='Illimité')?'ok':st==='Alerte'?'warn':'ok'}">${st}</span></td><td class="actionCell">${admin?`<div class="actionBtns"><button class="btn2" onclick="editItem('${i.id}')">✎ Modifier</button><button class="danger" onclick="deleteItem('${i.id}')">🗑 Supprimer</button></div>`:'-'}</td></tr>`}).join('')||'<tr><td colspan="10">Aucun produit/service disponible. Les produits à stock zéro sont masqués sans être supprimés.</td></tr>'}</table></div>`}

function stockCategoryPrintButtons(items){
  items=visibleStockListItems(items);
  const cats=[...new Set((items||[]).map(i=>String(i.cat||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  if(!cats.length) return '<div class="stockPrintPanel compactStockPrint no-print"><b>Impression par catégorie</b><p>Aucune catégorie disponible pour l’impression individuelle.</p></div>';
  return `<div class="stockPrintPanel compactStockPrint no-print"><div class="stockPrintTitle"><b>Impression par catégorie</b><p>Sélectionnez une catégorie puis cliquez sur imprimer. Toute la liste reste imprimable.</p></div><div class="stockPrintControls"><select id="stockPrintCategorySelect"><option value="">Choisir une catégorie à imprimer</option>${cats.map(c=>`<option value="${encodeURIComponent(c)}">${esc(c)}</option>`).join('')}</select><button class="darkBtn" onclick="printSelectedStockCategory()">Imprimer</button><button class="btn2" onclick="openStockPdfPage()">Imprimer toutes les catégories</button></div></div>`;
}
function printSelectedStockCategory(){
  const sel=document.getElementById('stockPrintCategorySelect');
  const val=sel?sel.value:'';
  if(!val){ showStockPrintCategoryRequiredPopup(); return; }
  openStockCategoryPdfPage(val);
}


function showStockPrintCategoryRequiredPopup(){
  document.querySelector('.stockPrintAlertBackdrop')?.remove();
  const html=`<div class="stockPrintAlertBackdrop" onclick="if(event.target===this)closeStockPrintAlert()">
    <div class="stockPrintAlertCard" onclick="event.stopPropagation()">
      <button class="stockPrintAlertClose" onclick="closeStockPrintAlert()">×</button>
      <div class="stockPrintAlertIcon">▣</div>
      <h2>Catégorie non sélectionnée</h2>
      <p>Veuillez choisir une catégorie dans la liste avant de lancer l’impression.</p>
      <div class="stockPrintAlertHint">Cette vérification évite d’imprimer un rapport vide ou incomplet.</div>
      <div class="stockPrintAlertActions">
        <button onclick="closeStockPrintAlert();document.getElementById('stockPrintCategorySelect')?.focus()">Choisir une catégorie</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
function closeStockPrintAlert(){document.querySelector('.stockPrintAlertBackdrop')?.remove();}

function filterStockTable(){
  const q=String(document.getElementById('stockSearch')?.value||'').trim().toLowerCase();
  const top=String(document.getElementById('stockTopSearch')?.value||'').trim().toLowerCase();
  const code=String(document.getElementById('stockCodeFilter')?.value||'').trim().toLowerCase();
  const cat=String(document.getElementById('stockCategoryFilter')?.value||'').trim().toLowerCase();
  const f=String(document.getElementById('stockFilter')?.value||'');
  const term=(q||top);
  document.querySelectorAll('.stockTable tr[data-search]').forEach(tr=>{
    const okQ=!term || String(tr.dataset.search||'').includes(term);
    const okCode=!code || String(tr.dataset.code||'').includes(code);
    const okCat=!cat || String(tr.dataset.cat||'')===cat;
    const okF=!f || String(tr.dataset.status||'')===f;
    tr.style.display=(okQ&&okCode&&okCat&&okF)?'':'none';
  });
}
function salesTable(sales){return `<table class="g2table"><tr><th>Date</th><th>Client</th><th>Désignation</th><th>Qté</th><th>Prix unitaire</th><th>Total</th><th>Bénéfice</th></tr>${sales.map(s=>`<tr><td>${new Date(s.date).toLocaleString('fr-FR')}</td><td>${esc(s.client||'-')}</td><td>${esc(s.name)}</td><td>${s.qty}</td><td>${money(s.unit||0)}</td><td>${money(s.total)}</td><td>${money(s.profit)}</td></tr>`).join('')||'<tr><td colspan="7">Aucune vente enregistrée.</td></tr>'}</table>`}
function panierClient(sales){
  const total=sales.reduce((a,b)=>a+(Number(b.total)||0),0);
  const lastClient=[...sales].reverse().find(s=>s.client)?.client || 'Non précisé';
  const rows=sales.map((s,i)=>`<tr data-sale-row="${esc(s.id)}"><td class="selectCell"><input type="checkbox" class="saleSelect cartSaleSelect" value="${esc(s.id)}" onchange="updateSelectedSalesBar('cart')"></td><td>${i+1}</td><td>${new Date(s.date).toLocaleDateString('fr-FR')}</td><td>${esc(s.name)}</td><td>${esc(s.note||s.client||'Commande simple')}</td><td>${s.qty}</td><td>${money(s.serviceFee||0)}</td><td>${money(s.total)}</td><td><div class="rowActions compactSaleActions"><button class="btn2" onclick="openEditCartLine('${s.id}')">Modifier</button><button class="miniDanger" onclick="deleteSale('${s.id}')">Retirer</button></div></td></tr>`).join('')||'<tr><td colspan="9" class="emptyCart">Panier vide.</td></tr>';
  return `<div class="cartBox"><h1>PANIER CLIENT</h1><h3>Client : ${esc(lastClient)}</h3><div class="multiSaleToolbar no-print"><label class="selectAllSales"><input type="checkbox" onchange="toggleSaleSelection('cart',this.checked)"> Tout sélectionner</label><button onclick="printSelectedSalesInvoice('cart')">Éditer facture unique sélectionnée</button><button class="danger" onclick="deleteSelectedSales('cart')">Supprimer la sélection</button><span id="cartSelectedInfo">0 vente sélectionnée</span></div><table class="cartTable multiSalesTable"><tr><th class="selectCell">☑</th><th>N°</th><th>Date</th><th>Service / Produit</th><th>Détail</th><th>Qté</th><th>Frais service</th><th>Montant</th><th>Action</th></tr>${rows}</table><div class="cartTotal">Total panier : ${money(total)}</div></div><div class="cartActions"><button onclick="show('vente')" class="cartAdd">Ajouter d’autres services</button><button onclick="validateCart()" class="cartValidate">Valider</button><button onclick="emptyCart()" class="cartClear">Vider le panier</button></div>`
}

function selectedSaleIds(scope){
  const cls=scope==='report'?'reportSaleSelect':'cartSaleSelect';
  return Array.from(document.querySelectorAll('.'+cls+':checked')).map(x=>x.value).filter(Boolean);
}
function updateSelectedSalesBar(scope){
  const ids=selectedSaleIds(scope);
  const el=document.getElementById(scope==='report'?'reportSelectedInfo':'cartSelectedInfo');
  if(el) el.textContent=ids.length+' vente'+(ids.length>1?'s':'')+' sélectionnée'+(ids.length>1?'s':'');
}
function toggleSaleSelection(scope,checked){
  const cls=scope==='report'?'reportSaleSelect':'cartSaleSelect';
  document.querySelectorAll('.'+cls).forEach(x=>{ if(x.closest('tr')?.style.display!=='none') x.checked=!!checked; });
  updateSelectedSalesBar(scope);
}
function getSelectedSaleRecords(scope){
  const ids=selectedSaleIds(scope);
  const {d,company}=current();
  return ids.map(id=>findCompanySaleById(d,company.id,id)).filter(Boolean);
}
function printSelectedSalesInvoice(scope){
  const {d,company}=current();
  const lines=getSelectedSaleRecords(scope);
  if(!lines.length) return g3ProWarning('Veuillez sélectionner au moins une vente.','Aucune vente sélectionnée');
  const now=new Date().toISOString();
  const ref='FAC-SEL-'+now.replace(/[-:.TZ]/g,'').slice(0,14)+'-'+Math.floor(Math.random()*90+10);
  const dt=new Date().toLocaleString('fr-FR');
  lines.forEach(line=>{line.invoiceGroupId=ref; line.invoiceId=ref; line.invoiceRef=ref; line.validatedAt=line.validatedAt||now;});
  save(d);
  logCaisseAction('Facture unique sélectionnée',ref+' : '+lines.length+' ligne(s)');
  const html=standaloneMultiInvoiceHTML(company,lines,ref,dt);
  const w=window.open('','_blank');
  if(!w){const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const url=URL.createObjectURL(blob); location.href=url; return;}
  w.document.open(); w.document.write(html); w.document.close();
  if(scope==='cart'){d.cartValidatedAt=d.cartValidatedAt||{}; d.cartClearedAt=d.cartClearedAt||{}; d.cartValidatedAt[company.id]=now; d.cartClearedAt[company.id]=now; save(d); renderDash('panier');}
  else renderDash('rapports');
}
function deleteSelectedSales(scope){
  if(!ensureDataUnlocked('la suppression de ventes sélectionnées')) return;
  const ids=selectedSaleIds(scope);
  if(!ids.length) return g3ProWarning('Veuillez sélectionner au moins une vente à supprimer.','Aucune vente à supprimer');
  const {d,company}=current();
  const rows=(d.sales||[]).filter(s=>saleBelongsToCompany(s,company.id) && ids.includes(s.id));
  if(scope==='report' && !requireAdmin('La caisse ne peut pas supprimer une vente dans l’historique général.')) return;
  if(rows.some(isSaleExerciseLocked)) return alert('Une ou plusieurs ventes appartiennent à un exercice verrouillé ou clôturé. Suppression impossible.');
  if(!confirm('Supprimer les '+rows.length+' vente(s) sélectionnée(s) ? Le stock des produits sera recalculé automatiquement.')) return;
  rows.forEach(s=>restoreStockFromSaleRecord(d,s));
  removeCompanySalesByIds(d,company.id,ids);
  rows.forEach(s=>{rebuildMarketplaceOrderReportState(d,s.marketplaceOrderId); markMarketplaceReportDeletedIfEmpty(d,s.marketplaceOrderId);});
  save(d);
  renderDash(scope==='report'?'rapports':'panier');
}
function openEditCartLine(sid){
  const {d,company}=current();
  const s=findCompanySaleById(d,company.id,sid);
  if(!s) return alert('Ligne introuvable');
  if(!requireCaisseCanEditSale(s)) return;
  const isService=Number(s.serviceFee||0)>0 || !s.itemCode;
  const html=`<div class="modalBackdrop" onclick="closeEditCartLine(event)"><div class="editSaleModal" onclick="event.stopPropagation()"><h2>Modifier l’article du panier</h2><p class="sub"><b>${esc(s.name)}</b><br>N° ${esc(s.id)}</p><div class="grid two"><label>Quantité<input id="cartEditQty" type="number" min="1" value="${Number(s.qty||1)}" oninput="updateCartEditTotal()"></label><label>Prix unitaire<input id="cartEditUnit" type="number" min="0" value="${Number(s.unit||0)}" oninput="updateCartEditTotal()"></label><label>Frais de service<input id="cartEditFee" type="number" min="0" value="${Number(s.serviceFee||0)}" ${isService?'':'readonly'} oninput="updateCartEditTotal()"></label><label>Prix total<input id="cartEditTotal" type="number" min="0" value="${Number(s.total||0)}" oninput="this.dataset.manual='1'"></label><label>Client<input id="cartEditClient" value="${esc(s.client||'')}"></label><label class="fullRow">Note / observation<textarea id="cartEditNote" rows="2">${esc(s.note||'')}</textarea></label></div><div class="modalActions"><button onclick="saveEditCartLine('${sid}')">Enregistrer</button><button class="danger" onclick="document.querySelector('.modalBackdrop')?.remove()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
function closeEditCartLine(e){ if(e&&e.target&&e.target.classList.contains('modalBackdrop')) e.target.remove(); }
function updateCartEditTotal(){
  const totalEl=document.getElementById('cartEditTotal');
  if(!totalEl || totalEl.dataset.manual==='1') return;
  const qty=Math.max(1,Number(document.getElementById('cartEditQty')?.value||1));
  const unit=Math.max(0,Number(document.getElementById('cartEditUnit')?.value||0));
  const fee=Math.max(0,Number(document.getElementById('cartEditFee')?.value||0));
  totalEl.value=(qty*unit)+fee;
}
function saveEditCartLine(sid){
  const {d,company}=current();
  const s=findCompanySaleById(d,company.id,sid);
  if(!s) return alert('Ligne introuvable');
  if(!requireCaisseCanEditSale(s)) return;
  if(isSaleExerciseLocked(s)) return showAutoNotice('Cet exercice est verrouillé ou clôturé. Modification impossible.','error');
  const oldQty=Number(s.qty||1), qty=Math.max(1,Number($('#cartEditQty')?.value||1));
  let unit=Math.max(0,Number($('#cartEditUnit')?.value||0));
  const fee=Math.max(0,Number($('#cartEditFee')?.value||0));
  const totalEl=$('#cartEditTotal');
  const manualTotal=totalEl && totalEl.dataset.manual==='1';
  let finalTotal=manualTotal ? Math.max(0,Number(totalEl.value||0)) : ((qty*unit)+fee);
  if(manualTotal && qty>0){ unit=Math.max(0,(finalTotal-fee)/qty); }
  const item=(d.items||[]).find(i=>i.companyId===company.id&&i.id===s.itemId);
  if(item&&isBoutiqueItem(item)){
    if(item.stockType!=='unlimited'){
      const available=Number(item.stock||0)+oldQty;
      if(qty>available) return showAutoNotice('Stock insuffisant pour cette modification.','error');
      item.stock=available-qty;
    }
  }
  s.qty=qty; s.unit=unit; s.serviceFee=fee; s.total=finalTotal; s.client=$('#cartEditClient')?.value||s.client; s.note=$('#cartEditNote')?.value||s.note||'';
  if(item){ s.charges=isBoutiqueItem(item)?Number(item.buy||0)*qty:(qty*unit)*(Number(item.charge||0)/100); }
  s.profit=Number(s.total||0)-Number(s.charges||0);
  save(d);
  document.querySelector('.modalBackdrop')?.remove();
  refreshPosTicket();
  showAutoNotice('Ligne du ticket modifiée.','success');
  if(document.querySelector('#panier.section.active')) renderDash('panier');
}
function deleteSale(sid){if(!ensureDataUnlocked('la suppression d’une vente')) return;const {d,company}=current(); const s=findCompanySaleById(d,company.id,sid); if(!s) return g3ProWarning('Vente introuvable ou déjà supprimée.','Suppression impossible'); if(!requireCaisseCanEditSale(s)) return; if(s&&isSaleExerciseLocked(s)) return alert('Cet exercice est verrouillé ou clôturé. Suppression impossible.'); restoreStockFromSaleRecord(d,s); removeCompanySalesByIds(d,company.id,sid); rebuildMarketplaceOrderReportState(d,s?.marketplaceOrderId); markMarketplaceReportDeletedIfEmpty(d,s?.marketplaceOrderId); save(d); renderDash('panier')}
function deleteSaleFromReport(sid){if(!requireAdmin('La caisse ne peut pas supprimer une vente dans l’historique général.')) return;if(!ensureDataUnlocked('la suppression d’une vente du rapport')) return;const {d,company}=current(); const s=findCompanySaleById(d,company.id,sid); if(!s) return g3ProWarning('Vente introuvable ou déjà supprimée.','Suppression impossible'); if(s&&isSaleExerciseLocked(s)) return alert('Cet exercice est verrouillé ou clôturé. Suppression impossible.'); g3ProConfirm('Confirmation de suppression','Supprimer définitivement cette vente du rapport ? Le stock du produit sera recalculé automatiquement.',`confirmDeleteSaleFromReport('${sid}')`,'Supprimer');}
function confirmDeleteSaleFromReport(sid){if(!ensureDataUnlocked('la suppression d’une vente du rapport')) return;const {d,company}=current(); const s=findCompanySaleById(d,company.id,sid); if(!s) return g3ProWarning('Vente introuvable ou déjà supprimée.','Suppression impossible'); restoreStockFromSaleRecord(d,s); removeCompanySalesByIds(d,company.id,sid); rebuildMarketplaceOrderReportState(d,s?.marketplaceOrderId); markMarketplaceReportDeletedIfEmpty(d,s?.marketplaceOrderId); save(d); renderDash('rapports')}
function clearSalesHistory(){if(!requireAdmin('La caisse ne peut pas supprimer l’historique général.')) return;if(!ensureDataUnlocked('la suppression de l’historique général')) return;if(!ensureActiveExerciseEditable()) return;const {d,company}=current(); const companySales=companySalesRows(d,company.id); const total=companySales.length; if(!total) return alert('Aucune vente enregistrée à supprimer.'); if(!confirm('Attention : cette action va supprimer définitivement toutes les ventes enregistrées de cette entreprise et recalculer les stocks concernés. Continuer ?')) return; companySales.forEach(s=>restoreStockFromSaleRecord(d,s)); d.sales=(d.sales||[]).filter(s=>!saleBelongsToCompany(s,company.id)); (d.orders||[]).forEach(o=>{if(o.companyId===company.id){o.marketplaceReported=false;o.reportSaleIds=[]; if(['Validée','Terminer'].includes(marketplaceValidationValue(o))){o.marketplaceReportDeletedByUser=true; o.marketplaceReportDeletedAt=new Date().toISOString();}}}); d.cartClearedAt=d.cartClearedAt||{}; d.cartClearedAt[company.id]=new Date().toISOString(); save(d); alert('Historique des ventes vidé avec succès. Stocks recalculés.'); renderDash('rapports')}

function freeWatermark(company){return planCode(company)==='FREE'?'<div class="global3Watermark">GLOBAL 3</div>':''}


/* Correctif impression PDF facture/reçu : ouverture dans une vraie page A4 imprimable */
function invoicePrintStyles(){return `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pdfStdHeader{margin:0 0 6mm}.pdfStdHeadBox{display:grid;grid-template-columns:26mm 1fr 1fr;align-items:center;border:.45mm solid #00625d;border-radius:2.6mm;min-height:18mm;padding:2mm 5mm;background:#fff}.pdfStdLogoBox{width:13.5mm;height:13.5mm;border:.55mm solid #009688;border-radius:2mm;display:flex;align-items:center;justify-content:center;color:#009688;font-size:7mm;font-weight:1000;line-height:1}.pdfStdInfo{height:14mm;display:flex;flex-direction:column;justify-content:center;padding-left:7mm;border-left:.25mm solid #b8c7c4}.pdfStdInfo p{margin:0 0 1.8mm;font-size:2.7mm;line-height:1.08;color:#111;overflow-wrap:anywhere}.pdfStdInfo b{font-weight:1000;color:#000}.pdfStdStrip{margin:2mm 1.5mm 0;background:#00554f;color:#fff;border-radius:6mm;min-height:7mm;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;text-align:center;padding:1.3mm 5mm;font-size:2.85mm;font-weight:900;font-style:italic}.pdfStdStrip span:first-child{text-align:left}.pdfStdStrip span:last-child{text-align:right}

.printToolbar{position:fixed;top:12px;right:12px;z-index:50;display:flex;gap:8px}.printToolbar button{border:0;border-radius:12px;padding:12px 16px;font-weight:900;cursor:pointer;background:#00625d;color:#fff}.printToolbar button:first-child{background:#e1a500;color:#062b29}
.invoiceA4{position:relative;width:210mm;min-height:297mm;height:auto;margin:0 auto;background:#fff;overflow:visible;padding:6mm 7mm 5mm;display:flex;flex-direction:column;page-break-after:auto}
.premiumInvoiceModel{position:relative;display:flex;flex-direction:column;flex:1;min-height:0}
.invoiceTopHeader{border:.45mm solid #00544f;border-radius:2.4mm;display:grid;grid-template-columns:28mm 1fr 1fr;align-items:center;min-height:18mm;overflow:hidden;break-inside:avoid;margin:0 2mm}.invoiceLogoCell{height:100%;display:flex;align-items:center;justify-content:center;border-right:.25mm solid #cfcfcf}.invoiceLogoBox{width:13.5mm;height:13.5mm;margin:auto;border:.55mm solid #07958f;border-radius:2mm;display:flex;align-items:center;justify-content:center;font-size:6.2mm;font-weight:1000;color:#07958f;letter-spacing:-.06em}.invoiceHeadCol{border-left:.25mm solid #d2d2d2;padding:0 7mm;min-height:15mm;display:flex;flex-direction:column;justify-content:center;gap:1.9mm}.invoiceHeadCol p{margin:0;font-size:3.05mm;line-height:1.05}.invoiceHeadCol b{font-weight:1000;color:#000}
.invoiceInfoStrip{margin:2.2mm 3.5mm 7mm;background:#00544f;color:white;border-radius:99px;display:grid;grid-template-columns:1fr 1fr 1fr;padding:1.55mm 5mm;font-size:3.05mm;font-weight:900;font-style:italic;text-align:center;break-inside:avoid}.invoiceTopLine{height:.7mm;background:#00544f;margin:0 0 6mm;position:relative;break-inside:avoid}.invoiceTopLine:after{content:"";position:absolute;left:50%;top:0;transform:translateX(-50%);border-left:4mm solid transparent;border-right:4mm solid transparent;border-top:4mm solid #f4aa00}
.invoiceTitleBlock{text-align:center;margin:0 0 4mm;break-inside:avoid}.invoiceTitleBlock h1{font-size:8.6mm;line-height:1;color:#00544f;margin:0 0 3mm;letter-spacing:.02em}.invoiceBadge{display:inline-block;min-width:78mm;padding:2mm 8mm;background:#00544f;color:#fff;border-radius:2mm;font-size:4.1mm;font-weight:1000;box-shadow:0 1mm 2mm rgba(0,0,0,.12)}
.invoiceClientPanel{display:grid;grid-template-columns:1fr 1.05fr;border:.35mm solid #00544f;border-radius:2mm;margin:0 0 5mm;min-height:31mm;overflow:hidden;break-inside:avoid}.invoiceClientIdentity{display:grid;grid-template-columns:24mm 1fr;gap:3mm;padding:5mm;border-right:.25mm dotted #889;align-items:center}.invoiceRoundIcon{width:16mm;height:16mm;border-radius:50%;background:#00544f;color:#f3ad00;font-size:8mm;display:flex;align-items:center;justify-content:center}.invoiceClientIdentity h2{margin:0 0 2.5mm;color:#00544f;font-size:5mm}.invoiceClientIdentity p,.invoiceMetaList p{margin:0 0 1.8mm;font-size:3.35mm;line-height:1.1}.invoiceClientIdentity b,.invoiceMetaList b{display:inline-block;min-width:25mm;font-weight:1000}.invoiceClientIdentity span,.invoiceMetaList span{display:inline-block;width:4mm;font-weight:900}.invoiceMetaList{padding:5mm 7mm;display:flex;flex-direction:column;justify-content:center}
.premiumInvoiceTable{width:100%;border-collapse:separate;border-spacing:0;border:.25mm solid #bfc8c5;border-radius:1.5mm;overflow:hidden;table-layout:fixed;margin:0 0 4mm;page-break-inside:auto}.premiumInvoiceTable thead{display:table-header-group}.premiumInvoiceTable tfoot{display:table-footer-group}.premiumInvoiceTable tr{break-inside:avoid;page-break-inside:avoid}.premiumInvoiceTable th{background:#00544f;color:#fff;font-size:3.45mm;padding:3mm 1.5mm;border:.2mm solid #296e69;text-align:center}.premiumInvoiceTable th:nth-child(1){width:9%}.premiumInvoiceTable th:nth-child(2){width:30%}.premiumInvoiceTable th:nth-child(3){width:20%}.premiumInvoiceTable th:nth-child(4){width:21%}.premiumInvoiceTable th:nth-child(5){width:20%}.premiumInvoiceTable td{min-height:8mm;color:#111;background:#fff;border:.18mm solid #d1d6d5;font-size:3.25mm;padding:2mm 1.6mm;text-align:center;vertical-align:middle}.premiumInvoiceTable td:nth-child(2){text-align:left}.invoiceEmptyLine{text-align:center!important;color:#777!important;font-style:italic}
.invoiceBottomGrid{display:grid;grid-template-columns:.92fr 1.08fr;gap:7mm;margin:auto 0 3mm;break-inside:avoid;page-break-inside:avoid}.amountWordsCard{min-height:34mm;padding:5mm 7mm;border:.35mm solid #00544f;border-radius:2mm}.amountWordsCard p{font-size:3.25mm;margin:0 0 2mm}.amountWordsCard h2{font-size:5.1mm;line-height:1.18;color:#00544f;margin:0}.amountWordsCard h3{font-size:4.2mm;color:#00544f;margin:2mm 0 0}.totalCard{border:.35mm solid #bfc8c5;border-radius:2mm;overflow:hidden}.totalCard>div{display:flex;justify-content:space-between;align-items:center;min-height:10mm;padding:2mm 6mm;border-bottom:.25mm solid #d2d7d5;font-size:3.9mm}.totalFinalV2{background:#00544f!important;color:#fff!important;border-left:1.5mm solid #f3ad00;border-bottom:0!important;font-size:6.2mm!important;font-weight:1000}.totalFinalV2 span{font-size:7.4mm}
.invoiceSignatureGrid{display:flex;align-items:flex-start;justify-content:center;min-height:25mm;border:.35mm solid #00544f;border-radius:2mm;margin:0 auto 3mm;width:62%;break-inside:avoid;page-break-inside:avoid}.invoiceSignatureGrid div{text-align:center;padding-top:4mm;font-size:3.5mm;width:100%;font-weight:700}.invoiceSignatureGrid div:first-child{border-right:0}.invoiceThanks{background:#00544f;color:#fff;border-bottom:1.2mm solid #f3ad00;border-radius:0 0 7mm 7mm;text-align:center;font-size:4.2mm;font-weight:1000;padding:2mm 5mm;break-inside:avoid;page-break-inside:avoid}.invoiceThanks small{display:block;font-size:3.1mm;font-weight:500;margin-top:1mm}
@media print{.printToolbar{display:none}.invoiceA4{margin:0;width:210mm;min-height:297mm;height:auto;box-shadow:none}.premiumInvoiceTable{page-break-inside:auto}.invoiceBottomGrid,.invoiceSignatureGrid,.invoiceThanks{break-inside:avoid;page-break-inside:avoid}}
`;}

function invoiceA4HeaderHTML(company){
  const active=String(monthsList[getActiveMonth()]||'').toUpperCase()+' '+getManageYear();
  return `<header class="invoiceTopHeader"><div class="invoiceLogoCell"><div class="invoiceLogoBox">G3</div></div><div class="invoiceHeadCol"><p><b>Raison sociale :</b> ${esc(company?.name||'')}</p><p><b>Forme juridique :</b> ${esc(company?.legalForm||'')}</p></div><div class="invoiceHeadCol"><p><b>RCCM :</b> ${esc(company?.rccm||'')}</p><p><b>Compte contribuable :</b> ${esc(company?.taxAccount||'')}</p></div></header><div class="invoiceInfoStrip"><span>Adresse : ${esc(company?.address||'DIABO-CI')}</span><span>Mode : ventes illimitées</span><span>Contact : +225 ${esc(company?.phone||'0777041790')}</span></div><div class="invoiceTopLine"></div>`;
}

function standaloneInvoiceHTML(company,s,ref,dt){
  const invoiceBody=premiumSaleInvoiceHTML(company,s,ref,dt);
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Facture '+esc(ref)+'</title><style>'+invoicePrintStyles()+'</style></head><body><div class="printToolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div><div class="invoiceA4">'+invoiceA4HeaderHTML(company)+invoiceBody+'</div><script>setTimeout(function(){window.focus()},200);</script></body></html>';
}
function openSalePdfPage(sid){
  const {d,company}=current();
  const s=findCompanySaleById(d,company.id,sid);
  if(!s) return alert('Vente introuvable');
  const lines=getInvoiceGroupSales(d,company,s);
  const ref=s.invoiceGroupId||s.invoiceId||s.id, dt=new Date(s.validatedAt||s.date).toLocaleString('fr-FR');
  const html=lines.length>1?standaloneMultiInvoiceHTML(company,lines,ref,dt):standaloneInvoiceHTML(company,s,ref,dt);
  const w=window.open('','_blank');
  if(!w){
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    location.href=url;
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}




/* Correctif PDF ÉTAT DU STOCK : page A4 professionnelle dédiée — catégories flexibles */

function pdfStandardHeaderHTML(company){
  const phone=String(company.phone||'').trim();
  const contact=phone ? (phone.startsWith('+')?phone:'+225 '+phone) : '';
  return `<div class="pdfStdHeader">
    <div class="pdfStdHeadBox">
      <div class="pdfStdLogoBox">G3</div>
      <div class="pdfStdInfo pdfStdInfoLeft">
        <p><b>Raison sociale :</b> ${esc(company.name||'')}</p>
        <p><b>Forme juridique :</b> ${esc(company.legalForm||'')}</p>
      </div>
      <div class="pdfStdInfo pdfStdInfoRight">
        <p><b>RCCM :</b> ${esc(company.rccm||'')}</p>
        <p><b>Compte contribuable :</b> ${esc(company.taxAccount||'')}</p>
      </div>
    </div>
    <div class="pdfStdStrip"><span><b>Adresse :</b> ${esc(company.address||'')}</span><span><b>Mode :</b> ventes illimitées</span><span><b>Contact :</b> ${esc(contact)}</span></div>
  </div>`;
}

function stockPrintStyles(){return `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pdfStdHeader{margin:0 0 6mm}.pdfStdHeadBox{display:grid;grid-template-columns:26mm 1fr 1fr;align-items:center;border:.45mm solid #00625d;border-radius:2.6mm;min-height:18mm;padding:2mm 5mm;background:#fff}.pdfStdLogoBox{width:13.5mm;height:13.5mm;border:.55mm solid #009688;border-radius:2mm;display:flex;align-items:center;justify-content:center;color:#009688;font-size:7mm;font-weight:1000;line-height:1}.pdfStdInfo{height:14mm;display:flex;flex-direction:column;justify-content:center;padding-left:7mm;border-left:.25mm solid #b8c7c4}.pdfStdInfo p{margin:0 0 1.8mm;font-size:2.7mm;line-height:1.08;color:#111;overflow-wrap:anywhere}.pdfStdInfo b{font-weight:1000;color:#000}.pdfStdStrip{margin:2mm 1.5mm 0;background:#00554f;color:#fff;border-radius:6mm;min-height:7mm;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;text-align:center;padding:1.3mm 5mm;font-size:2.85mm;font-weight:900;font-style:italic}.pdfStdStrip span:first-child{text-align:left}.pdfStdStrip span:last-child{text-align:right}

.printToolbar{position:fixed;top:10px;right:10px;z-index:50;display:flex;gap:8px}
.printToolbar button{border:0;border-radius:12px;padding:11px 14px;font-weight:900;cursor:pointer;background:#00625d;color:#fff}
.printToolbar button:first-child{background:#e1a500;color:#062b29}
.stockA4{position:relative;width:210mm;min-height:297mm;margin:0 auto;background:#fff;overflow:visible;padding:7mm 8mm 12mm}
.stockHeader{display:grid;grid-template-columns:34mm 1fr 1fr 1fr;gap:5mm;align-items:start;margin:0 0 5mm}
.stockLogo{text-align:center}
.stockLogoBox{width:22mm;height:22mm;margin:0 auto 3mm;border:.75mm solid #08928b;border-radius:3mm;display:flex;align-items:center;justify-content:center;font-size:10.5mm;font-weight:1000;color:#08928b;line-height:1}
.stockLogo small{display:block;font-size:2.25mm;line-height:1.15}
.stockInfo{border-left:.25mm solid #d6d6d6;padding-left:3mm;min-height:23mm}
.stockInfo p{margin:0 0 1.4mm;font-size:2.85mm;line-height:1.12}
.stockInfo b{font-weight:1000;color:#000}
.stockTopLine{height:.55mm;background:#009688;margin:0 0 5.5mm}
.stockTitle{text-align:center;margin:0 0 3.2mm}
.stockTitle h1{font-size:5.5mm;line-height:1;color:#004a48;letter-spacing:.04em;margin:0;text-transform:uppercase}
.stockGoldLine{height:.45mm;background:#d49b08;margin:0 0 2.4mm}
.stockCatStrip{display:block;background:#008a82;color:#fff6a8;padding:3mm 3.5mm;margin:0 0 4mm;min-height:15mm;height:auto;border:0;white-space:normal;overflow:visible;word-break:normal;overflow-wrap:anywhere;line-height:1.45}
.stockCatLine{display:block;color:#fff200;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:3.35mm;font-weight:700;line-height:1.45;white-space:normal;overflow-wrap:anywhere;word-break:normal}
.stockSubTitle{text-align:center;margin:0 0 3mm;break-inside:avoid}
.stockSubTitle h2{font-size:4.7mm;color:#004a48;letter-spacing:.03em;margin:0;text-transform:uppercase}
.stockTable{width:100%;border-collapse:collapse;table-layout:fixed;font-size:2.65mm;page-break-inside:auto}
.stockTable thead{display:table-header-group}
.stockTable tr{page-break-inside:avoid;break-inside:avoid}
.stockTable th{background:#eaf2ef;color:#004a48;border:.25mm solid #aebcb9;text-align:center;text-transform:uppercase;font-weight:1000;padding:2mm 1mm;line-height:1.05;overflow-wrap:anywhere}
.stockTable td{border:.25mm solid #bfc7c5;color:#111;padding:2.1mm 1.2mm;line-height:1.12;font-weight:700;vertical-align:middle;word-break:normal;overflow-wrap:anywhere}
.stockTable td:nth-child(2){font-weight:900}
.stockTable td:nth-child(4),.stockTable td:nth-child(5),.stockTable td:nth-child(6),.stockTable td:nth-child(7),.stockTable td:nth-child(8){text-align:center}
.stockFooterWave{position:absolute;left:0;right:0;bottom:0;height:9mm;border-top:.8mm solid #d49b08;background:#004a48;border-top-left-radius:70% 9mm}
.emptyCell{color:#777;text-align:center;padding:8mm!important}.stockMeta{font-size:2.5mm;text-align:right;color:#555;margin-top:2mm}
@media print{.printToolbar{display:none!important}body{background:#fff!important}.stockA4{margin:0!important;width:210mm!important;min-height:297mm!important;box-shadow:none!important}.stockCatStrip{height:auto!important;min-height:15mm!important;overflow:visible!important}.stockFooterWave{position:fixed}}
`;}
function stockA4HTML(company,items,categoryTitle){
  const now=new Date();
  const type=(company.businessType||'').toUpperCase();
  const cats=[...new Set((items||[]).map(i=>String(i.cat||'').trim()).filter(Boolean))];
  const catText=categoryTitle ? categoryTitle : (cats.length ? cats.join(' / ') + ' /' : 'Aucune catégorie enregistrée');
  const rows=(items||[]).map(i=>{const boutique=isBoutiqueItem(i);return `<tr><td>${esc(i.code||'')}</td><td>${esc(i.name||'')}</td><td>${esc(i.cat||'')}</td><td>${boutique?'Produit':'Service'}</td><td>${boutique?(i.stockType==='unlimited'?'Illimité':Number(i.stock||0)):'-'}</td><td>${boutique?money(i.buy):'-'}</td><td>${money(i.sell)}</td><td>${boutique?autoBoutiqueChargePercent(i):Number(i.charge||0)}%</td></tr>`}).join('') || '<tr><td colspan="8" class="emptyCell">Aucun produit ou service enregistré.</td></tr>';
  return `<div class="stockA4">${pdfStandardHeaderHTML(company)}<div class="stockTopLine"></div><div class="stockTitle"><h1>LISTE DES CATÉGORIES</h1></div><div class="stockGoldLine"></div><div class="stockCatStrip"><span class="stockCatLine">${esc(catText)}</span></div><div class="stockSubTitle"><h2>${categoryTitle?'ÉTAT DU STOCK — CATÉGORIE : '+esc(categoryTitle):'ÉTAT DU STOCK — LISTE DES PRODUITS ET SERVICES'}</h2></div><div class="stockGoldLine"></div><table class="stockTable"><colgroup><col style="width:13%"><col style="width:16%"><col style="width:15%"><col style="width:12%"><col style="width:9%"><col style="width:12%"><col style="width:13%"><col style="width:10%"></colgroup><thead><tr><th>Code</th><th>Élément</th><th>Catégorie</th><th>Type</th><th>Qté</th><th>Achat U.</th><th>Vente / Prix</th><th>Charges %</th></tr></thead><tbody>${rows}</tbody></table><div class="stockMeta">Document généré par GLOBAL 3 — MEGA SERVICES DIABO</div><div class="stockFooterWave"></div></div>`;
}
function standaloneStockHTML(company,items,categoryTitle){
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(categoryTitle?'Stock - '+categoryTitle:'État du stock')+'</title><style>'+stockPrintStyles()+'</style></head><body><div class="printToolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div>'+stockA4HTML(company,items,categoryTitle)+'<script>setTimeout(function(){window.focus();},200);</script></body></html>';
}
function openStockPdfPage(){
  const {d,company}=current();
  const items=visibleStockListItems((d.items||[]).filter(i=>i.companyId===company.id));
  const html=standaloneStockHTML(company,items,'');
  const w=window.open('','_blank');
  if(!w){const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const url=URL.createObjectURL(blob); location.href=url; return;}
  w.document.open(); w.document.write(html); w.document.close();
}
function openStockCategoryPdfPage(catEncoded){
  const {d,company}=current();
  const cat=decodeURIComponent(catEncoded||'');
  const items=visibleStockListItems((d.items||[]).filter(i=>i.companyId===company.id && String(i.cat||'').trim()===cat));
  const html=standaloneStockHTML(company,items,cat);
  const w=window.open('','_blank');
  if(!w){const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const url=URL.createObjectURL(blob); location.href=url; return;}
  w.document.open(); w.document.write(html); w.document.close();
}

function serviceReportPrintStyles(){return `
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#061f1f;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pdfStdHeader{margin:0 0 6mm}.pdfStdHeadBox{display:grid;grid-template-columns:26mm 1fr 1fr;align-items:center;border:.45mm solid #00625d;border-radius:2.6mm;min-height:18mm;padding:2mm 5mm;background:#fff}.pdfStdLogoBox{width:13.5mm;height:13.5mm;border:.55mm solid #009688;border-radius:2mm;display:flex;align-items:center;justify-content:center;color:#009688;font-size:7mm;font-weight:1000;line-height:1}.pdfStdInfo{height:14mm;display:flex;flex-direction:column;justify-content:center;padding-left:7mm;border-left:.25mm solid #b8c7c4}.pdfStdInfo p{margin:0 0 1.8mm;font-size:2.7mm;line-height:1.08;color:#111;overflow-wrap:anywhere}.pdfStdInfo b{font-weight:1000;color:#000}.pdfStdStrip{margin:2mm 1.5mm 0;background:#00554f;color:#fff;border-radius:6mm;min-height:7mm;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;text-align:center;padding:1.3mm 5mm;font-size:2.85mm;font-weight:900;font-style:italic}.pdfStdStrip span:first-child{text-align:left}.pdfStdStrip span:last-child{text-align:right}
.printToolbar{position:fixed;top:10px;right:10px;z-index:999;display:flex;gap:8px}.printToolbar button{border:0;border-radius:10px;padding:10px 14px;font-weight:900;cursor:pointer;background:#00625d;color:#fff}.printToolbar button:first-child{background:#e1a500;color:#062b29}.reportA4{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:7mm 7mm 10mm;position:relative;box-shadow:0 0 18px rgba(0,0,0,.18);overflow:hidden}.rHeader{display:grid;grid-template-columns:34mm 1fr 1fr 1.08fr;gap:5mm;align-items:start;margin-bottom:5mm}.rLogo{text-align:center}.rLogoBox{width:19mm;height:19mm;border:1.2mm solid #009287;border-radius:4mm;margin:0 auto 2mm;display:flex;align-items:center;justify-content:center;color:#009287;font-size:10mm;font-weight:1000;line-height:1}.rLogo small{display:block;font-size:2mm;line-height:1.18;color:#111}.rInfo{border-left:.35mm solid #d3d3d3;padding-left:3mm;min-height:24mm}.rInfo p{font-size:2.85mm;line-height:1.2;margin:0 0 2.5mm;color:#111;white-space:normal;overflow-wrap:anywhere}.rInfo b{font-weight:1000}.topLine{height:.55mm;background:#008b82;margin:0 0 10mm}.reportTitle{text-align:center;margin:0 0 4mm}.reportTitle h1{font-size:5.2mm;line-height:1.15;color:#004a48;letter-spacing:.04em;margin:0;text-transform:uppercase;font-weight:1000}.goldLine{height:.45mm;background:#d8a700;margin:0 0 9mm}.summary{margin:0 0 8mm;font-size:4.5mm;line-height:1.25;color:#082020}.summary b{font-weight:1000}.blockTitle{height:8.5mm;background:#004a48;color:#ffd84a;display:flex;align-items:center;justify-content:center;text-transform:uppercase;font-size:3.25mm;font-weight:1000;letter-spacing:.03em;margin:0 0 3.5mm}.reportTable{width:100%;border-collapse:collapse;table-layout:fixed;font-size:2.05mm;margin:0 0 8mm}.reportTable th{background:#eaf2ef;color:#004a48;border:.25mm solid #b9c6c4;text-align:center;text-transform:uppercase;font-weight:1000;padding:1.7mm 1mm;line-height:1.05}.reportTable td{border:.25mm solid #c8cdcc;color:#111;background:#fff;padding:2.1mm 1.2mm;line-height:1.15;vertical-align:middle;word-break:normal;overflow-wrap:anywhere}.reportTable td:nth-child(4),.reportTable td:nth-child(6),.reportTable td:nth-child(7),.reportTable td:nth-child(8){text-align:center}.reportTable td:nth-child(8){text-align:right}.saleBadge{display:inline-block;margin-top:1mm;background:#fff2b8;color:#111;border:.25mm solid #caa600;border-radius:5mm;padding:.4mm 1.2mm;font-size:1.8mm;font-weight:900}.totalStrip{width:100%;border:.35mm solid #d8a700;background:#fff2b8;min-height:8mm;display:flex;align-items:center;justify-content:flex-end;text-align:right;padding:2mm 3mm;font-size:3mm;font-weight:1000;color:#000;margin-top:2mm}.reportMeta{position:absolute;left:7mm;right:7mm;bottom:5mm;border-top:.3mm solid #e6e6e6;padding-top:2mm;font-size:2.25mm;color:#555;text-align:right}.emptyCell{text-align:center;color:#666;padding:8mm!important}.pageFiller{height:120mm}@media print{.printToolbar{display:none!important}@page{size:A4 portrait;margin:0}html,body{background:#fff!important;margin:0!important;padding:0!important}.reportA4{margin:0!important;width:210mm!important;min-height:297mm!important;box-shadow:none!important;page-break-after:avoid!important}.reportTable thead{display:table-header-group}.reportTable tr{page-break-inside:avoid;break-inside:avoid}.pageFiller{height:auto}}
`;}
function serviceReportA4HTML(company,sales,admin=false){
  const now=new Date();
  const month=monthsList[getActiveMonth()];
  const year=getManageYear();
  const type=String(company.businessType||'').toUpperCase();
  const sorted=(sales||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total=sorted.reduce((a,b)=>a+Number(b.total||0),0);
  const profit=sorted.reduce((a,b)=>a+Number(b.profit||0),0);
  const allItems=(seed().items||[]).filter(i=>i.companyId===company.id);
  const rows=sorted.map(s=>{const user=(seed().users||[]).find(u=>u.id===s.userId);const clientTxt=s.client||'Non précisé';const clientName=clientTxt.replace(/\s*\/\s*.*/,'')||'Non précisé';const badge=s.clientType==='contrat'?'Contrat':'Simple';const caisse=user?.role||'admin';const inf=saleItemInfo(allItems,s);return `<tr><td>${esc(s.invoiceGroupId||s.invoiceId||s.id||'')}</td><td>${new Date(s.date).toLocaleString('fr-FR')}</td><td>${esc(clientName)}<br><span class="saleBadge">${badge}</span></td><td><span class="saleBadge">${esc(caisse)}</span></td><td>${esc(inf.name)}</td><td>${Number(s.qty||1)}</td><td>${money(s.serviceFee||0)}</td><td>${money(s.total||0)}</td></tr>`}).join('') || '<tr><td colspan="8" class="emptyCell">Aucune vente validée disponible.</td></tr>';
  return `<div class="reportA4"><div class="rHeader"><div class="rLogo"><div class="rLogoBox">G3</div><small>Date : ${now.toLocaleDateString('fr-FR')}<br>Heure : ${now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div><div class="rInfo"><p><b>Raison sociale :</b> ${esc(company.name||'')}</p><p><b>RCCM :</b> ${esc(company.rccm||'')}</p><p><b>Activité :</b> ${esc(company.activity||company.businessType||'')}</p><p><b>Adresse :</b> ${esc(company.address||'')}</p></div><div class="rInfo"><p><b>Forme juridique :</b> ${esc(company.legalForm||'')}</p><p><b>Compte contribuable :</b> ${esc(company.taxAccount||'')}</p><p><b>Téléphone :</b> ${esc(company.phone||'')}</p><p><b>Année du résumé :</b> ${year}</p></div><div class="rInfo"><p><b>Type :</b> ${esc(type)}</p><p><b>Gérant :</b> ${esc(company.owner||'')}</p><p><b>E-mail :</b> ${esc(company.email||'')}</p><p><b>Période :</b> ${esc(periodFilterLabel('report'))}</p></div></div><div class="topLine"></div><div class="reportTitle"><h1>RAPPORT GÉNÉRAL DÉTAILLÉ DES SERVICES VENDUS</h1></div><div class="goldLine"></div><div class="summary"><div>Commandes validées <b>${sorted.length}</b></div><div>Total ventes <b>${money(total)}</b></div></div><div class="blockTitle">RAPPORT GÉNÉRAL DES VENTES</div><table class="reportTable"><colgroup><col style="width:14%"><col style="width:16%"><col style="width:18%"><col style="width:10%"><col style="width:18%"><col style="width:6%"><col style="width:9%"><col style="width:9%"></colgroup><thead><tr><th>N° Facture</th><th>Date</th><th>Client</th><th>Caisse</th><th>Service / Produit</th><th>Qté</th><th>Frais service</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totalStrip">TOTAL DES VENTES ENREGISTRÉES : ${money(total)}${admin?' | Bénéfice : '+money(profit):''}</div><div class="pageFiller"></div><div class="reportMeta">Document généré par GLOBAL 3 — MEGA SERVICES DIABO</div></div>`;
}
function standaloneServiceReportHTML(company,sales,admin=false){return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rapport services vendus</title><style>'+serviceReportPrintStyles()+'</style></head><body><div class="printToolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div>'+serviceReportA4HTML(company,sales,admin)+'<script>setTimeout(function(){window.focus()},200);</script></body></html>';}
function openServiceReportPdfPage(){
  const {d,company,admin}=current();
  if(syncMarketplaceValidatedOrdersToReport(d,company.id)) save(d);
  const allSales=companySalesRows(d,company.id);
  const sales=filterSalesByPeriod(getCompanyReportSales(allSales),'report');
  const html=standaloneServiceReportHTML(company,sales,admin);
  const w=window.open('','_blank');
  if(!w){const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const url=URL.createObjectURL(blob); location.href=url; return;}
  w.document.open(); w.document.write(html); w.document.close();
}

function yearManagementPrintStyles(){return `
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#062b29;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pdfStdHeader{margin:0 0 6mm}.pdfStdHeadBox{display:grid;grid-template-columns:26mm 1fr 1fr;align-items:center;border:.45mm solid #00625d;border-radius:2.6mm;min-height:18mm;padding:2mm 5mm;background:#fff}.pdfStdLogoBox{width:13.5mm;height:13.5mm;border:.55mm solid #009688;border-radius:2mm;display:flex;align-items:center;justify-content:center;color:#009688;font-size:7mm;font-weight:1000;line-height:1}.pdfStdInfo{height:14mm;display:flex;flex-direction:column;justify-content:center;padding-left:7mm;border-left:.25mm solid #b8c7c4}.pdfStdInfo p{margin:0 0 1.8mm;font-size:2.7mm;line-height:1.08;color:#111;overflow-wrap:anywhere}.pdfStdInfo b{font-weight:1000;color:#000}.pdfStdStrip{margin:2mm 1.5mm 0;background:#00554f;color:#fff;border-radius:6mm;min-height:7mm;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;text-align:center;padding:1.3mm 5mm;font-size:2.85mm;font-weight:900;font-style:italic}.pdfStdStrip span:first-child{text-align:left}.pdfStdStrip span:last-child{text-align:right}
.printToolbar{position:fixed;top:10px;right:10px;z-index:999;display:flex;gap:8px}.printToolbar button{border:0;border-radius:10px;padding:10px 14px;font-weight:900;cursor:pointer;background:#00625d;color:#fff}.printToolbar button:first-child{background:#e1a500;color:#062b29}.yearA4{width:210mm;height:297mm;margin:0 auto;background:#fff;padding:6mm 6.5mm 6mm;position:relative;box-shadow:0 0 18px rgba(0,0,0,.18);overflow:hidden}.yHeader{display:grid;grid-template-columns:32mm 1fr 1fr 1.08fr;gap:4.5mm;align-items:start;margin-bottom:4mm}.yLogo{text-align:center}.yLogoBox{width:19mm;height:19mm;border:1.1mm solid #009287;border-radius:4mm;margin:0 auto 1.5mm;display:flex;align-items:center;justify-content:center;color:#009287;font-size:10mm;font-weight:1000;line-height:1}.yLogo small{display:block;font-size:1.9mm;line-height:1.12;color:#111}.yInfo{border-left:.35mm solid #d3d3d3;padding-left:2.8mm;min-height:23mm}.yInfo p{font-size:2.65mm;line-height:1.14;margin:0 0 2.05mm;color:#111;white-space:normal;overflow-wrap:anywhere}.yInfo b{font-weight:1000}.yTopLine{height:.55mm;background:#008b82;margin:0 0 3mm}.yBanner{height:13.2mm;background:#004a48;color:#ffd84a;display:flex;align-items:center;text-transform:uppercase;font-size:3.55mm;font-weight:1000;letter-spacing:.02em;margin:0 0 7mm;padding:0 5.2mm;position:relative}.yBanner:before{content:'';width:1.35mm;height:8mm;border-radius:3mm;background:#ffd84a;margin-right:2.4mm}.yearPanel{border:.32mm solid #e5c248;border-radius:2.4mm;padding:2.7mm 2.8mm 2.9mm;background:#fffdf8}.yearPanelTitle{text-align:center;margin:0 0 2.7mm}.yearPanelTitle h1{font-size:3.85mm;line-height:1.05;color:#004a48;letter-spacing:.02em;margin:0;text-transform:uppercase;font-weight:1000}.yearPanelTitle h3{font-size:2.2mm;line-height:1.05;color:#7b6100;margin:.6mm 0 0;font-weight:900}.yMonthsGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:2.1mm;margin:0 0 2.8mm}.yMonthCard{height:24.2mm;border:.25mm solid #ead799;border-radius:2mm;padding:2.35mm 2.7mm;background:#fffef9;color:#073432;display:flex;flex-direction:column;justify-content:space-between;break-inside:avoid}.yMonthCard.active{background:#fff6cf;border-color:#e0b000}.yMonthCard h4{margin:0 0 1.8mm;font-size:2.75mm;color:#004a48;font-weight:1000}.yMonthCard p{margin:0;font-size:2.2mm;line-height:1.15;color:#173f3c}.yMonthCard b{font-weight:1000;color:#001c1b}.yOpenPill{display:inline-flex;align-items:center;justify-content:center;margin-top:1.6mm;width:25mm;min-height:6mm;border-radius:6mm;background:#e8f8f8;color:#004a48;font-size:2.15mm;font-weight:1000}.yearlyA4Table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:1.95mm;border-radius:1.8mm;overflow:hidden}.yearlyA4Table th{background:#004a48;color:#ffd84a;border:.22mm solid #004a48;text-transform:uppercase;font-weight:1000;text-align:center;padding:1.65mm .55mm;line-height:1.02}.yearlyA4Table th:first-child{text-align:left}.yearlyA4Table td{border:.2mm solid #e5e9e8;background:#fff;color:#153c39;text-align:center;padding:1.35mm .55mm;line-height:1.02;white-space:nowrap}.yearlyA4Table td:first-child{text-align:left;white-space:normal}.yearlyA4Table tr.activeYearRow td{background:#fff6cf!important;font-weight:1000;color:#061f1f}.yearlyA4Table tr.total td{background:#fff0ad!important;font-weight:1000;color:#061f1f}.yearMeta{position:absolute;left:6.5mm;right:6.5mm;bottom:3.5mm;border-top:.25mm solid #e6e6e6;padding-top:1.4mm;font-size:2mm;color:#666;text-align:right}@media print{.printToolbar{display:none!important}@page{size:A4 portrait;margin:0}html,body{background:#fff!important;margin:0!important;padding:0!important;width:210mm!important;height:297mm!important;overflow:hidden!important}.yearA4{margin:0!important;width:210mm!important;height:297mm!important;min-height:0!important;box-shadow:none!important;page-break-after:avoid!important;page-break-before:avoid!important;break-after:avoid!important}.yearlyA4Table tr,.yMonthCard{page-break-inside:avoid;break-inside:avoid}}
`;}
function yearManagementA4HTML(company,sales,obligations){
  const now=new Date();
  const year=getManageYear(), activeMonth=getActiveMonth();
  const type=String(company.businessType||'').toUpperCase();
  const rows=monthsList.map((m,i)=>{const ms=(sales||[]).filter(s=>{const dt=new Date(s.date);return dt.getFullYear()===year&&dt.getMonth()===i});const monthObligations=getObligationsForMonth(current().d,current().company.id,year,i);const obligationTotal=getMonthlyObligationTotal(monthObligations, ms);const commandes=ms.length, articles=ms.reduce((a,b)=>a+Number(b.qty||0),0), ca=ms.reduce((a,b)=>a+Number(b.total||0),0), serviceFee=ms.reduce((a,b)=>a+Number(b.serviceFee||0),0), charges=ms.reduce((a,b)=>a+Number(b.charges||0),0), benef=ms.reduce((a,b)=>a+Number(b.profit||0),0), net=benef-obligationTotal;return {m,i,commandes,articles,ca,serviceFee,charges,benef,obligations:obligationTotal,net};});
  const total=rows.reduce((a,r)=>({commandes:a.commandes+r.commandes,articles:a.articles+r.articles,ca:a.ca+r.ca,serviceFee:a.serviceFee+r.serviceFee,charges:a.charges+r.charges,benef:a.benef+r.benef,obligations:a.obligations+r.obligations,net:a.net+r.net}),{commandes:0,articles:0,ca:0,serviceFee:0,charges:0,benef:0,obligations:0,net:0});
  const cards=rows.map(r=>`<div class="yMonthCard ${r.i===activeMonth?'active':''}"><div><h4>${esc(r.m)}</h4><p>Commandes : <b>${r.commandes}</b><br>CA : <b>${money(r.ca)}</b><br>Net : <b>${money(r.net)}</b></p></div><span class="yOpenPill">Ouvrir ce mois</span></div>`).join('');
  const tr=rows.map(r=>`<tr class="${r.i===activeMonth?'activeYearRow':''}"><td>${esc(r.m)}</td><td>${r.commandes}</td><td>${r.articles}</td><td>${money(r.ca)}</td><td>${money(r.serviceFee)}</td><td>${money(r.charges)}</td><td>${money(r.benef)}</td><td>${money(r.obligations)}</td><td>${money(r.net)}</td></tr>`).join('');
  return `<div class="yearA4">${pdfStandardHeaderHTML(company)}<div class="yTopLine"></div><div class="yBanner">ANNÉE DE GESTION ADMINISTRATEUR</div><div class="yearPanel"><div class="yearPanelTitle"><h1>TABLEAU DE GESTION SUR 12 MOIS</h1><h3>${esc(company.name||'Entreprise')} — Année ${year}</h3></div><div class="yMonthsGrid">${cards}</div><table class="yearlyA4Table"><colgroup><col style="width:12%"><col style="width:9%"><col style="width:8%"><col style="width:14%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:11%"><col style="width:10%"></colgroup><thead><tr><th>Mois</th><th>Commandes</th><th>Articles</th><th>Chiffre d’affaires</th><th>Frais service</th><th>Charges estimées</th><th>Bénéfice estimé</th><th>Obligations</th><th>Résultat net</th></tr></thead><tbody>${tr}<tr class="total"><td>TOTAL ANNUEL</td><td>${total.commandes}</td><td>${total.articles}</td><td>${money(total.ca)}</td><td>${money(total.serviceFee)}</td><td>${money(total.charges)}</td><td>${money(total.benef)}</td><td>${money(total.obligations)}</td><td>${money(total.net)}</td></tr></tbody></table></div><div class="yearMeta">Document généré par GLOBAL 3 — MEGA SERVICES DIABO</div></div>`;
}
function standaloneYearManagementHTML(company,sales,obligations){return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tableau de gestion sur 12 mois</title><style>'+yearManagementPrintStyles()+'</style></head><body><div class="printToolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div>'+yearManagementA4HTML(company,sales,obligations)+'<script>setTimeout(function(){window.focus()},200);</script></body></html>';}
function openYearManagementPdfPage(){
  const {d,company}=current();
  /* Impression PDF sans sécurité : le PDF Année de gestion doit s'ouvrir même si le contrôle admin bloque l'interface. */
  const sales=companySalesRows(d,company.id);
  const obligations=getObligations(d,company.id);
  const html=standaloneYearManagementHTML(company,sales,obligations);
  const w=window.open('','_blank');
  if(!w){const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const url=URL.createObjectURL(blob); location.href=url; return;}
  w.document.open(); w.document.write(html); w.document.close();
}




/* Correctif panier : seules les ventes NON validées restent visibles dans le panier.
   Les ventes validées restent conservées dans les rapports, mais disparaissent du panier. */
function getCartCutoffDate(d,cid){
  const clearedAt=(d.cartClearedAt&&d.cartClearedAt[cid])||'';
  const validatedAt=(d.cartValidatedAt&&d.cartValidatedAt[cid])||'';
  if(clearedAt && validatedAt) return String(clearedAt)>String(validatedAt)?clearedAt:validatedAt;
  return clearedAt || validatedAt || '';
}
function getCurrentCompanyCartSales(){
  const {d,company}=current();
  const cid=company.id;
  const cutoff=getCartCutoffDate(d,cid);
  return (d.sales||[]).filter(s=>saleBelongsToCompany(s,cid) && (!cutoff || String(s.date||'')>cutoff));
}
function validateCart(){
  const {d,company}=current();
  const cart=getCurrentCompanyCartSales();
  if(!cart.length){ alert('Panier vide.'); return; }
  const now=new Date().toISOString();
  const ref='FAC-'+now.replace(/[-:.TZ]/g,'').slice(0,14)+'-'+Math.floor(Math.random()*90+10);
  cart.forEach(line=>{line.invoiceGroupId=ref; line.invoiceId=ref; line.invoiceRef=ref; line.validatedAt=now;});
  d.cartValidatedAt=d.cartValidatedAt||{};
  d.cartClearedAt=d.cartClearedAt||{};
  d.cartValidatedAt[company.id]=now;
  d.cartClearedAt[company.id]=now;
  save(d);
  logCaisseAction('Validation des ventes','Validation simple '+ref+' : '+cart.length+' ligne(s)');
  const firstSaleId=cart[0]?.id||'';
  renderDash('panier');
  showCartValidationSuccessPopup(firstSaleId,ref,cart.length);
}
function showCartValidationSuccessPopup(firstSaleId,ref,count){
  const sid=String(firstSaleId||'').replace(/'/g,"\'");
  const label=Number(count||0)+' vente'+(Number(count||0)>1?'s':'')+' validée'+(Number(count||0)>1?'s':'');
  g3ProPopup('Commande validée', 'Commande validée avec succès. Voulez-vous imprimer la facture unique maintenant ?\nRéférence : '+ref+'\n'+label, 'success', `<button onclick="closeG3ProPopup();openSalePdfPage('${sid}')">Imprimer la facture</button><button class="secondary" onclick="closeG3ProPopup()">Ne pas imprimer</button>`);
}
function emptyCart(){
  const {d,company}=current();
  const cart=getCurrentCompanyCartSales();
  if(!cart.length){ alert('Panier déjà vide.'); return; }
  if(!confirm('Vider le panier actuel ? Les ventes déjà enregistrées resteront dans le rapport général.')) return;
  d.cartClearedAt=d.cartClearedAt||{};
  d.cartClearedAt[company.id]=new Date().toISOString();
  save(d);
  logCaisseAction('Vider panier','Panier caisse vidé');
  renderDash('panier');
}
function filterSalesByInvoice(){
  const q=String(document.getElementById('invoiceSearch')?.value||'').toLowerCase().trim();
  document.querySelectorAll('tr[data-invoice]').forEach(tr=>{
    tr.style.display = (!q || String(tr.getAttribute('data-invoice')||'').includes(q)) ? '' : 'none';
  });
}
function openEditSalePopup(sid){
  const {d,company}=current();
  const s=findCompanySaleById(d,company.id,sid);
  if(!s) return alert('Vente introuvable');
  openEditCartLine(sid);
}

function printSaleReport(sid){logCaisseAction('Impression facture / reçu','Facture '+sid); const {d,company}=current(); const s=findCompanySaleById(d,company.id,sid); if(!s) return alert('Vente introuvable'); const lines=getInvoiceGroupSales(d,company,s); const ref=s.invoiceGroupId||s.invoiceId||s.id, dt=new Date(s.validatedAt||s.date).toLocaleString('fr-FR'); shell(`<div class="g2panel printable"><div class="reportActions no-print"><button onclick="show('rapports')">Retour au rapport</button><button onclick="openSalePdfPage('${s.id}')">Imprimer / PDF</button><button onclick="shareText('${secureDocLink(ref)}')">Partager</button></div>${lines.length>1?premiumMultiSaleInvoiceHTML(company,lines,ref,dt):premiumSaleInvoiceHTML(company,s,ref,dt)}</div>`,'rapports')}
function localDateISO(d=new Date()){const x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,10)}
function activeExerciseDefaultDate(){return localDateISO(new Date())}
function activeExerciseLabel(){return 'Ventes illimitées'}
function saleItemInfo(items,s){
  const it=(items||[]).find(i=>i.id===s.itemId||i.name===s.name) || {};
  return {name:s.name||it.name||'Produit / service non précisé', detail:s.note||it.marketplaceDesc||it.detail||s.category||it.cat||'—', cat:s.category||it.cat||'SERVICE / PRODUIT'};
}
function saleDayKey(v){
  if(!v) return localDateISO();
  const raw=String(v);
  const m=raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if(m) return m[1];
  return localDateISO(new Date(v));
}
function restoreStockFromSaleRecord(d,s){
  if(!d||!s||s.stockRestoredFromReport) return false;
  const it=(d.items||[]).find(x=>String(x.id||'')===String(s.itemId||'') && String(x.companyId||'')===String(s.companyId||''));
  if(it && isBoutiqueItem(it) && it.stockType!=='unlimited'){
    it.stock=Number(it.stock||0)+Number(s.qty||1);
    s.stockRestoredFromReport=true;
    return true;
  }
  return false;
}
function rebuildMarketplaceOrderReportState(d,orderId){
  if(!d||!orderId) return;
  const o=(d.orders||[]).find(x=>String(x.id||'')===String(orderId));
  if(!o) return;
  const ids=(d.sales||[]).filter(s=>String(s.marketplaceOrderId||'')===String(orderId)).map(s=>s.id);
  o.reportSaleIds=ids;
  o.marketplaceReported=ids.length>0;
}
function markMarketplaceReportDeletedIfEmpty(d,orderId){
  if(!d||!orderId) return;
  const o=(d.orders||[]).find(x=>String(x.id||'')===String(orderId));
  if(!o) return;
  const hasRemaining=(d.sales||[]).some(s=>String(s.marketplaceOrderId||'')===String(orderId));
  if(!hasRemaining){
    o.marketplaceReported=false;
    o.reportSaleIds=[];
    o.marketplaceReportDeletedByUser=true;
    o.marketplaceReportDeletedAt=new Date().toISOString();
  }
}
function bilanJourReport(items,sales){
  const selected=window.__bilanJourDate || activeExerciseDefaultDate();
  const daySales=(sales||[]).filter(s=>saleDayKey(s.date||new Date())===selected);
  const map={};
  daySales.forEach(s=>{
    const inf=saleItemInfo(items,s);
    const key=inf.cat+'__'+inf.name;
    if(!map[key]) map[key]={cat:inf.cat,name:inf.name,clients:new Set(),qty:0,total:0,serviceFee:0,charges:0,profit:0,count:0};
    const r=map[key];
    if(s.client) r.clients.add(s.client);
    r.qty+=Number(s.qty||0); r.total+=Number(s.total||0); r.serviceFee+=Number(s.serviceFee||0); r.charges+=Number(s.charges||0); r.profit+=Number(s.profit||0); r.count+=1;
  });
  const rows=Object.values(map);
  const tq=rows.reduce((a,b)=>a+b.qty,0), tt=rows.reduce((a,b)=>a+b.total,0), tf=rows.reduce((a,b)=>a+b.serviceFee,0), tc=rows.reduce((a,b)=>a+b.charges,0), tp=rows.reduce((a,b)=>a+b.profit,0);
  return `<div class="serviceBlock bilanJourBlock"><h2>BILAN JOUR</h2><div class="invoiceSearchBox no-print bilanDateBox"><label>Choisir le jour : <input type="date" value="${esc(selected)}" onchange="showBilanJourPage(this.value)"></label></div><h3>Résumé des ventes / jour</h3><table class="g2table bilanJourTable"><tr><th>Catégorie</th><th>Produit / Service</th><th>Nombre de ventes</th><th>Clients servis</th><th>Quantité totale</th><th>Chiffre d’affaires</th><th>Frais service</th><th>Charges estimées</th><th>Bénéfice estimé</th></tr>${rows.map(r=>`<tr><td>${esc(r.cat)}</td><td>${esc(r.name)}</td><td>${r.count}</td><td>${r.clients.size}</td><td>${r.qty}</td><td>${money(r.total)}</td><td>${money(r.serviceFee)}</td><td>${money(r.charges)}</td><td>${money(r.profit)}</td></tr>`).join('')||'<tr><td colspan="9">Aucune vente enregistrée pour le jour sélectionné.</td></tr>'}<tr class="total"><td colspan="4">TOTAL JOUR</td><td>${tq}</td><td>${money(tt)}</td><td>${money(tf)}</td><td>${money(tc)}</td><td>${money(tp)}</td></tr></table></div>`;
}

function bilanJoursList(items,sales){
  const map={};
  (sales||[]).forEach(s=>{
    const jour=saleDayKey(s.date||new Date());
    if(!map[jour]) map[jour]={jour,clients:new Set(),qty:0,total:0,serviceFee:0,charges:0,profit:0,count:0};
    const r=map[jour];
    if(s.client) r.clients.add(s.client);
    r.qty+=Number(s.qty||0);
    r.total+=Number(s.total||0);
    r.serviceFee+=Number(s.serviceFee||0);
    r.charges+=Number(s.charges||0);
    r.profit+=Number(s.profit||0);
    r.count+=1;
  });
  const rows=Object.values(map).sort((a,b)=>String(b.jour).localeCompare(String(a.jour)));
  const tq=rows.reduce((a,b)=>a+b.qty,0), tt=rows.reduce((a,b)=>a+b.total,0), tf=rows.reduce((a,b)=>a+b.serviceFee,0), tc=rows.reduce((a,b)=>a+b.charges,0), tp=rows.reduce((a,b)=>a+b.profit,0);
  return `<div class="serviceBlock bilanJoursListBlock"><h2>LISTE DES JOURS ET LEURS BILANS</h2><p class="small darkSmall">Cette liste affiche le bilan général de chaque journée de vente enregistrée.</p><table class="g2table bilanJoursListTable"><tr><th>Jour</th><th>Nombre de ventes</th><th>Clients servis</th><th>Quantité totale</th><th>Chiffre d’affaires</th><th>Frais service</th><th>Charges estimées</th><th>Bénéfice estimé</th><th class="no-print">Action</th></tr>${rows.map(r=>`<tr><td><b>${esc(new Date(r.jour+'T00:00:00').toLocaleDateString('fr-FR'))}</b></td><td>${r.count}</td><td>${r.clients.size}</td><td>${r.qty}</td><td>${money(r.total)}</td><td>${money(r.serviceFee)}</td><td>${money(r.charges)}</td><td>${money(r.profit)}</td><td class="no-print"><button onclick="showBilanJourPage('${esc(r.jour)}')">Voir détail</button></td></tr>`).join('')||'<tr><td colspan="9">Aucun jour de vente enregistré.</td></tr>'}<tr class="total"><td colspan="3">TOTAL GÉNÉRAL DES JOURS</td><td>${tq}</td><td>${money(tt)}</td><td>${money(tf)}</td><td>${money(tc)}</td><td>${money(tp)}</td><td class="no-print">—</td></tr></table></div>`;
}

function bilanJourA4HTML(company,items,sales,selected){
  const daySales=(sales||[]).filter(s=>saleDayKey(s.date||new Date())===selected);
  const map={};
  daySales.forEach(s=>{const inf=saleItemInfo(items,s);const key=inf.cat+'__'+inf.name;if(!map[key]) map[key]={cat:inf.cat,name:inf.name,clients:new Set(),qty:0,total:0,serviceFee:0,charges:0,profit:0,count:0};const r=map[key];if(s.client) r.clients.add(s.client);r.qty+=Number(s.qty||0);r.total+=Number(s.total||0);r.serviceFee+=Number(s.serviceFee||0);r.charges+=Number(s.charges||0);r.profit+=Number(s.profit||0);r.count+=1;});
  const rows=Object.values(map);const tq=rows.reduce((a,b)=>a+b.qty,0),tt=rows.reduce((a,b)=>a+b.total,0),tf=rows.reduce((a,b)=>a+b.serviceFee,0),tc=rows.reduce((a,b)=>a+b.charges,0),tp=rows.reduce((a,b)=>a+b.profit,0);
  const body=rows.map(r=>`<tr><td>${esc(r.cat)}</td><td>${esc(r.name)}</td><td>${r.count}</td><td>${r.clients.size}</td><td>${r.qty}</td><td>${money(r.total)}</td><td>${money(r.serviceFee)}</td><td>${money(r.charges)}</td><td>${money(r.profit)}</td></tr>`).join('') || '<tr><td colspan="9" class="emptyCell">Aucune vente enregistrée pour le jour sélectionné.</td></tr>';
  const selectedLabel=new Date(selected+'T00:00:00').toLocaleDateString('fr-FR');
  return `<div class="reportA4">${pdfStandardHeaderHTML(company)}<div class="topLine"></div><div class="reportTitle"><h1>BILAN JOUR</h1><h2>Date du résumé : ${esc(selectedLabel)}</h2></div><div class="goldLine"></div><div class="blockTitle">RÉSUMÉ DES VENTES / JOUR</div><table class="reportTable"><thead><tr><th>Catégorie</th><th>Produit / Service</th><th>Nombre de ventes</th><th>Clients servis</th><th>Quantité totale</th><th>Chiffre d’affaires</th><th>Frais service</th><th>Charges estimées</th><th>Bénéfice estimé</th></tr></thead><tbody>${body}<tr class="total"><td colspan="4"><b>TOTAL JOUR</b></td><td>${tq}</td><td>${money(tt)}</td><td>${money(tf)}</td><td>${money(tc)}</td><td>${money(tp)}</td></tr></tbody></table><div class="reportMeta">Document généré par GLOBAL 3 — MEGA SERVICES DIABO</div></div>`;
}
function showBilanJourPage(selectedDate){
  const {d,company}=current();
  if(syncMarketplaceValidatedOrdersToReport(d,company.id)) save(d);
  if(selectedDate) window.__bilanJourDate=selectedDate;
  const sales=getCompanyReportSales(companySalesRows(d,company.id));
  const items=(d.items||[]).filter(i=>i.companyId===company.id);
  const selected=window.__bilanJourDate || activeExerciseDefaultDate();
  shell(`<div class="g2panel printable bilanJourPage"><div class="reportActions no-print"><button onclick="show('rapports')">Retour au rapport</button><button onclick="openBilanJourPdfPage()">Imprimer / PDF</button><button onclick="openListeBilansJoursPdfPage()">Imprimer Liste des jours et leurs bilans</button></div><div class="reportBox"><h1>RÉSUMÉ DES VENTES / JOUR</h1><h3>${esc(company.name)} — Jour sélectionné : ${esc(selected)} — Mode : ${esc(activeExerciseLabel())}</h3>${bilanJoursList(items,sales)}${bilanJourReport(items,sales)}</div></div>`, 'rapports');
}

function listeBilansJoursA4HTML(company,items,sales){
  const map={};
  (sales||[]).forEach(s=>{
    const jour=saleDayKey(s.date||new Date());
    if(!map[jour]) map[jour]={jour,clients:new Set(),qty:0,total:0,serviceFee:0,charges:0,profit:0,count:0};
    const r=map[jour];
    if(s.client) r.clients.add(s.client);
    r.qty+=Number(s.qty||0); r.total+=Number(s.total||0); r.serviceFee+=Number(s.serviceFee||0); r.charges+=Number(s.charges||0); r.profit+=Number(s.profit||0); r.count+=1;
  });
  const rows=Object.values(map).sort((a,b)=>String(b.jour).localeCompare(String(a.jour)));
  const tq=rows.reduce((a,b)=>a+b.qty,0), tt=rows.reduce((a,b)=>a+b.total,0), tf=rows.reduce((a,b)=>a+b.serviceFee,0), tc=rows.reduce((a,b)=>a+b.charges,0), tp=rows.reduce((a,b)=>a+b.profit,0);
  const body=rows.map(r=>`<tr><td><b>${esc(new Date(r.jour+'T00:00:00').toLocaleDateString('fr-FR'))}</b></td><td>${r.count}</td><td>${r.clients.size}</td><td>${r.qty}</td><td>${money(r.total)}</td><td>${money(r.serviceFee)}</td><td>${money(r.charges)}</td><td>${money(r.profit)}</td></tr>`).join('') || '<tr><td colspan="8" class="emptyCell">Aucun jour de vente enregistré.</td></tr>';
  return `<div class="reportA4">${pdfStandardHeaderHTML(company)}<div class="topLine"></div><div class="reportTitle"><h1>LISTE DES JOURS ET LEURS BILANS</h1><h2>Résumé général par journée de vente</h2></div><div class="goldLine"></div><div class="blockTitle">LISTE DES JOURS ET LEURS BILANS</div><table class="reportTable"><thead><tr><th>Jour</th><th>Nombre de ventes</th><th>Clients servis</th><th>Quantité totale</th><th>Chiffre d’affaires</th><th>Frais service</th><th>Charges estimées</th><th>Bénéfice estimé</th></tr></thead><tbody>${body}<tr class="total"><td colspan="3"><b>TOTAL GÉNÉRAL DES JOURS</b></td><td>${tq}</td><td>${money(tt)}</td><td>${money(tf)}</td><td>${money(tc)}</td><td>${money(tp)}</td></tr></tbody></table><div class="reportMeta">Document généré par GLOBAL 3 — MEGA SERVICES DIABO</div></div>`;
}
function openListeBilansJoursPdfPage(){
  const {d,company}=current();
  if(syncMarketplaceValidatedOrdersToReport(d,company.id)) save(d);
  const sales=getCompanyReportSales(companySalesRows(d,company.id));
  const items=(d.items||[]).filter(i=>i.companyId===company.id);
  const html='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Liste des jours et leurs bilans</title><style>'+serviceReportPrintStyles()+'</style></head><body><div class="printToolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div>'+listeBilansJoursA4HTML(company,items,sales)+'<script>setTimeout(function(){window.focus();},200);</script></body></html>';
  const w=window.open('','_blank');
  if(!w){const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const url=URL.createObjectURL(blob); location.href=url; return;}
  w.document.open(); w.document.write(html); w.document.close();
}

function openBilanJourPdfPage(){
  const {d,company}=current();
  if(syncMarketplaceValidatedOrdersToReport(d,company.id)) save(d);
  const selected=window.__bilanJourDate || activeExerciseDefaultDate();
  const sales=getCompanyReportSales(companySalesRows(d,company.id));
  const items=(d.items||[]).filter(i=>i.companyId===company.id);
  const html='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bilan jour</title><style>'+serviceReportPrintStyles()+'</style></head><body><div class="printToolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div>'+bilanJourA4HTML(company,items,sales,selected)+'<script>setTimeout(function(){window.focus();},200);</script></body></html>';
  const w=window.open('','_blank');
  if(!w){const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const url=URL.createObjectURL(blob); location.href=url; return;}
  w.document.open(); w.document.write(html); w.document.close();
}
function serviceReport(items,sales,admin=false){
  const total=sales.reduce((a,b)=>a+Number(b.total||0),0);
  const count=sales.length;
  if(!sales.length) return `<div class="serviceBlock detailedSalesBlock"><h2>RAPPORT GÉNÉRAL DES VENTES</h2><p>Aucune vente validée disponible.</p>${admin?'<div class="clearHistoryBar no-print"><button class="clearHistoryBtn" onclick="clearSalesHistory()">🗑️ Vider l’historique</button><small>Aucune vente à supprimer pour le moment.</small></div>':''}</div>`;
  return `<div class="salesSummary"><div>Commandes validées <b>${count}</b></div><div>Total ventes <b>${money(total)}</b></div></div>
  <div class="serviceBlock detailedSalesBlock"><h2>RAPPORT GÉNÉRAL DES VENTES</h2>
  <div class="invoiceSearchBox"><input id="invoiceSearch" oninput="filterSalesByInvoice()" placeholder="Rechercher une vente par N° de facture..."><button onclick="filterSalesByInvoice()">Rechercher</button></div>
  ${admin?`<div class="multiSaleToolbar no-print"><label class="selectAllSales"><input type="checkbox" onchange="toggleSaleSelection('report',this.checked)"> Tout sélectionner</label><button onclick="printSelectedSalesInvoice('report')">Éditer facture unique sélectionnée</button><button class="danger" onclick="deleteSelectedSales('report')">Supprimer la sélection</button><span id="reportSelectedInfo">0 vente sélectionnée</span></div>`:''}
  <table class="g2table detailedSalesTable multiSalesTable"><tr>${admin?'<th class="selectCell">☑</th>':''}<th>N° Facture</th><th>Date</th><th>Client</th><th>Caisse</th><th>Service / Produit</th><th>Qté</th><th>Frais service</th><th>Total</th>${admin?'<th>Actions</th>':''}</tr>
  ${sales.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s=>{
    const user=(seed().users||[]).find(u=>u.id===s.userId);
    const clientTxt=s.client||'Non précisé';
    const clientName=clientTxt.replace(/\s*\/\s*.*/,'')||'Non précisé';
    const badge=s.clientType==='contrat'?'Contrat':'Simple';
    const caisse=user?.role||'caisse';
    const inf=saleItemInfo(items,s);
    return `<tr data-invoice="${esc(String((s.invoiceGroupId||s.invoiceId||s.id)).toLowerCase())}" data-sale-row="${esc(s.id)}">${admin?`<td class="selectCell"><input type="checkbox" class="saleSelect reportSaleSelect" value="${esc(s.id)}" onchange="updateSelectedSalesBar('report')"></td>`:''}<td>${esc(s.invoiceGroupId||s.invoiceId||s.id)}</td><td>${new Date(s.date).toLocaleString('fr-FR')}</td><td>${esc(clientName)}<br><span class="saleBadge">${badge}</span></td><td><span class="saleBadge">${esc(caisse)}</span></td><td>${esc(inf.name)}</td><td>${Number(s.qty||1)}</td><td>${money(s.serviceFee||0)}</td><td>${money(s.total||0)}</td>${admin?`<td class="actionCell"><div class="rowActions compactSaleActions"><button title="Imprimer la vente" onclick="printSaleReport('${s.id}')">Impr.</button><button class="btn2" title="Modifier la vente" onclick="openEditSalePopup('${s.id}')">Modif.</button><button class="danger" title="Supprimer la vente" onclick="deleteSaleFromReport('${s.id}')">Suppr.</button></div></td>`:''}</tr>`
  }).join('')}
  </table>
  ${admin?'<div class="clearHistoryBar no-print"><button class="clearHistoryBtn" onclick="clearSalesHistory()">🗑️ Vider l’historique</button><small>Cette action supprimera définitivement toutes les ventes enregistrées.</small></div>':''}
  </div>`
}

function clientContractToolbar(admin){return admin?`<div class="contractHeroActions no-print"><button type="button" class="contractAddBtn" onclick="openAddContractClientModal()">Ajouter client sous contrat</button><button type="button" class="contractListBtn" onclick="showContractClientsList()">Liste des clients sous contrat</button></div>`:''}
function clientContractForm(){const {company}=current(); if(!hasPlanFeature(company,'contracts')) return '<p class="notice">Clients sous contrat non autorisés avec le plan FREE.</p>'; return `<div id="contractClientModal" class="modal hidden contractModal"><div class="modalOverlay" onclick="closeContractClientModal()"></div><div class="modalCard contractModalCard"><button class="modalClose" onclick="closeContractClientModal()">×</button><h2 id="contractModalTitle">Formulaire d’ajout client sous contrat</h2><div class="contractFormFrame"><input id="ccEditMain" type="hidden"><div class="contractFormGrid"><label>Nom du client contrat<input id="ccName" placeholder="Nom du client contrat"></label><label>Téléphone<input id="ccPhone" placeholder="Téléphone"></label><label>Type de facturation<select id="ccMode"><option value="Mensuelle">Mensuelle</option><option value="Trimestriel">Trimestriel</option></select></label><label>Remise en %<input id="ccRemise" type="number" min="0" max="100" step="0.01" value="0" placeholder="Remise %"></label><label class="fullRow">Observation<textarea id="ccObs" rows="3" placeholder="Observation"></textarea></label></div><div class="contractFormFooter"><button id="ccSaveBtn" class="contractSaveOrange" onclick="addContractClient()">Enregistrer</button></div></div></div></div>`}
function showContractClientsList(){window.contractClientPanel='list'; renderDash('contrats'); setTimeout(()=>document.getElementById('contractClientsList')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}
function clientContractList(clients,admin){const count=Array.isArray(clients)?clients.length:0; return `<div class="contractListPage" id="contractClientsList"><div class="contractListHeader"><div><h3>Liste des clients sous contrat</h3></div><span>${count} client(s)</span></div><div class="contractCards">${clients.map(c=>`<div class="contractClientCard"><div class="contractClientDetails"><div class="contractClientName">${esc(c.name)}</div><div class="contractClientMeta"><span><b>Téléphone :</b> ${esc(c.phone||'—')}</span><span><b>Type de facturation :</b> ${esc(c.mode||'Mensuelle')}</span><span><b>Remise appliquée :</b> ${Number(c.remise||0)}%</span>${c.obs?`<span class="contractObs"><b>Observation :</b> ${esc(c.obs)}</span>`:''}</div></div>${admin?`<div class="contractClientActions"><button class="contractEditBtn" onclick="openEditContractClientModal('${c.id}')">Modifier</button><button class="contractInvoiceBtn" onclick="showContractClientInvoices('${c.id}')">Facture</button><button class="contractDeleteBtn" onclick="deleteContractClient('${c.id}')">Supprimer</button></div>`:''}</div>`).join('')||'<div class="contractEmptyState">Aucun client sous contrat enregistré. Cliquez sur « Ajouter client sous contrat » pour créer le premier client.</div>'}</div></div>`}
function openAddContractClientModal(){if(!requireAdmin('La caisse ne peut pas créer de client sous contrat.')) return; const modal=document.getElementById('contractClientModal'); if(!modal) return; ['ccEditMain','ccName','ccPhone','ccObs'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); const r=document.getElementById('ccRemise'); if(r) r.value=0; const m=document.getElementById('ccMode'); if(m) m.value='Mensuelle'; const title=document.getElementById('contractModalTitle'); if(title) title.textContent='Formulaire d’ajout client sous contrat'; const btn=document.getElementById('ccSaveBtn'); if(btn) btn.textContent='Enregistrer'; modal.classList.remove('hidden'); setTimeout(()=>document.getElementById('ccName')?.focus(),60)}
function openEditContractClientModal(cid){if(!requireAdmin('La caisse ne peut pas modifier un client sous contrat.')) return; const {d,company}=current(); const c=(d.clients||[]).find(x=>x.id===cid&&x.companyId===company.id); if(!c) return alert('Client introuvable'); const modal=document.getElementById('contractClientModal'); if(!modal) return; document.getElementById('ccEditMain').value=c.id; document.getElementById('ccName').value=c.name||''; document.getElementById('ccPhone').value=c.phone||''; document.getElementById('ccMode').value=c.mode||'Mensuelle'; document.getElementById('ccRemise').value=Number(c.remise||0); document.getElementById('ccObs').value=c.obs||''; const title=document.getElementById('contractModalTitle'); if(title) title.textContent='Modification du client sous contrat'; const btn=document.getElementById('ccSaveBtn'); if(btn) btn.textContent='Enregistrer'; modal.classList.remove('hidden'); setTimeout(()=>document.getElementById('ccName')?.focus(),60)}
function closeContractClientModal(){document.getElementById('contractClientModal')?.classList.add('hidden')}
function contractSaleMonthKey(s){return String(s.date||'').slice(0,7) || new Date().toISOString().slice(0,7)}
function contractSaleYearKey(s){const d=new Date(s.date||Date.now()); return String(isNaN(d)?new Date().getFullYear():d.getFullYear())}
function contractClientSales(c){const {d,company}=current(); const cname=String(c?.name||'').toLowerCase(); return (d.sales||[]).filter(s=>saleBelongsToCompany(s,company.id)&&s.clientType==='contrat'&&(s.clientId===c?.id || String(s.client||'').toLowerCase().includes(cname))).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))}
function showContractClientInvoices(cid){const {d,company}=current(); const c=(d.clients||[]).find(x=>x.id===cid&&x.companyId===company.id); if(!c) return alert('Client introuvable'); const sales=contractClientSales(c); const groups={}; sales.forEach(s=>{const key=String(c.mode||'Mensuelle').toLowerCase().includes('trimes')?contractQuarterKey(s):contractSaleMonthKey(s); if(!groups[key]) groups[key]={key,type:c.mode||'Mensuelle',period:key,total:0,count:0}; groups[key].total+=Number(s.total||0); groups[key].count+=1;}); const rows=Object.values(groups).sort((a,b)=>String(b.period).localeCompare(String(a.period))); shell(`<div class="g2panel printable contractInvoicePage"><div class="contractInvoiceHeader no-print"><button onclick="show('contrats')">Retour clients sous contrat</button><button onclick="window.print()">Imprimer la page</button></div><div class="contractInvoiceTitle"><h1>Factures du client sous contrat</h1><p><b>Client :</b> ${esc(c.name)} ${c.phone?' — '+esc(c.phone):''}</p></div><table class="g2table contractInvoiceListTable"><thead><tr><th>Type de facturation</th><th>Période facturée</th><th>Montant</th><th>Action</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.type)}</td><td>${esc(r.period)}</td><td>${money(r.total)}</td><td><button class="contractInvoiceBtn" onclick="generateMonthlyClientInvoice('${cid}','', '${r.period}')">Imprimer</button></td></tr>`).join('')||'<tr><td colspan="4">Aucune facture disponible pour ce client.</td></tr>'}</tbody></table></div>`,'contrats')}
function contractQuarterKey(s){const d=new Date(s.date||Date.now()); const y=isNaN(d)?new Date().getFullYear():d.getFullYear(); const q=Math.floor((isNaN(d)?new Date().getMonth():d.getMonth())/3)+1; return y+'-T'+q}
function globalSalesReport(items,sales){
  const map={};
  sales.forEach(s=>{
    const it=items.find(i=>i.id===s.itemId||i.name===s.name);
    const key=(s.name||'Produit / service non précisé')+'__'+(it?.cat||'SERVICE / PRODUIT');
    if(!map[key]) map[key]={name:s.name||'Produit / service non précisé',cat:it?.cat||'SERVICE / PRODUIT',clients:new Set(),qty:0,total:0,serviceFee:0,charges:0,profit:0,count:0};
    const r=map[key];
    if(s.client) r.clients.add(s.client);
    r.qty+=Number(s.qty||0);
    r.total+=Number(s.total||0);
    r.serviceFee+=Number(s.serviceFee||0);
    r.charges+=Number(s.charges||0);
    r.profit+=Number(s.profit||0);
    r.count+=1;
  });
  const rows=Object.values(map);
  if(!rows.length) return '<div class="serviceBlock"><h2>Ventes généralisées des produits et services vendus</h2><p>Aucune vente enregistrée.</p></div>';
  const tq=rows.reduce((a,b)=>a+b.qty,0), tt=rows.reduce((a,b)=>a+b.total,0), tf=rows.reduce((a,b)=>a+b.serviceFee,0), tc=rows.reduce((a,b)=>a+b.charges,0), tp=rows.reduce((a,b)=>a+b.profit,0);
  return `<div class="serviceBlock"><h2>Ventes généralisées des produits et services vendus</h2><table><tr><th>Catégorie</th><th>Produit / Service</th><th>Nombre de ventes</th><th>Clients servis</th><th>Quantité totale</th><th>Chiffre d’affaires</th><th>Frais service</th><th>Charges estimées</th><th>Bénéfice estimé</th></tr>${rows.map(r=>`<tr><td>${esc(r.cat)}</td><td>${esc(r.name)}</td><td>${r.count}</td><td>${r.clients.size}</td><td>${r.qty}</td><td>${money(r.total)}</td><td>${money(r.serviceFee||0)}</td><td>${money(r.charges)}</td><td>${money(r.profit)}</td></tr>`).join('')}<tr class="total"><td colspan="4">TOTAL GLOBAL</td><td>${tq}</td><td>${money(tt)}</td><td>${money(tf)}</td><td>${money(tc)}</td><td>${money(tp)}</td></tr></table></div>`;
}

function clientTable(sales){const contratSales=(Array.isArray(sales)?sales:[]).filter(s=>s.clientType==='contrat'&&s.client); const total=contratSales.reduce((a,b)=>a+Number(b.total||0),0); const rows=contratSales.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).map(s=>{const qty=Number(s.qty||1)||1; const unit=Number(s.unit||0)||Math.round(Number(s.total||0)/qty)||0; return `<tr><td>${new Date(s.date).toLocaleString('fr-FR')}</td><td>${esc(s.client||'—')}</td><td>${esc(s.name||s.detail||'—')}</td><td>${qty}</td><td>${money(unit)}</td><td>${money(s.total||0)}</td><td>${esc(s.note||s.obs||s.detail||'—')}</td></tr>`}).join('') || '<tr><td colspan="7" class="emptyCell">Aucune consommation de client sous contrat pour cette période.</td></tr>'; return `<div class="contractConsumptionWrap"><table class="g2table contractConsumptionTable"><thead><tr><th>Date</th><th>Client</th><th>Service consommé</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th><th>Observation</th></tr></thead><tbody>${rows}</tbody></table></div><div class="totalLine contractConsumptionTotal">Total consommation : ${money(total)}</div>`}
function autoBoutiqueChargePercent(i){const sell=Number(i.sell||0), buy=Number(i.buy||0); if(!sell||!buy) return 0; return Math.round((buy/sell*100)*100)/100}
function isBoutiqueItem(i){return String(i?.type||'boutique').toLowerCase()!=='service'}
function chargesBase(items){return `<div class="reportBox slim"><h1>BASE DE CALCUL DES CHARGES</h1><h3>Produits et services — GLOBAL 3</h3><table><tr><th>Catégorie / Service principal</th><th>Produit / Service / Prestation</th><th>Estimation des charges (%)</th><th>Base de calcul</th></tr>${items.map(i=>{const boutique=isBoutiqueItem(i); const pct=boutique?autoBoutiqueChargePercent(i):(i.charge||30); return `<tr><td>${esc(i.cat||'SERVICE')}</td><td>${esc(i.name)}</td><td>${boutique?`<input type="number" value="${pct}" readonly disabled title="Calcul automatique : prix d’achat / prix de vente"><div class="miniNote">Automatique — prix d’achat / prix de vente</div>`:`<input class="chargeInput" data-id="${i.id}" type="number" min="0" max="100" value="${pct}">`}</td><td>${boutique?`Basé automatiquement sur le prix d’achat dans le prix de vente<br><b>${money(i.buy||0)} / ${money(i.sell||0)}</b>`:'Pourcentage appliqué sur le montant vendu'}</td></tr>`}).join('')||'<tr><td colspan="4">Ajoutez d’abord vos produits ou services dans Stocks.</td></tr>'}</table></div>`}
function saveChargePercentages(){if(!requireAdmin()) return;if(!ensureDataUnlocked('la modification des pourcentages')) return;const {d,company}=current(); document.querySelectorAll('.chargeInput[data-id]').forEach(inp=>{const it=d.items.find(i=>i.id===inp.dataset.id&&i.companyId===company.id); if(it&&!isBoutiqueItem(it)) it.charge=+inp.value||0}); save(d); alert('Pourcentages enregistrés. Les produits BOUTIQUE restent calculés automatiquement avec le prix d’achat.'); renderDash('param')}
function getDefaultObligations(){return [['Salaire Agent de réception et d’enregistrement','Des bénéfices généraux',30000],['Salaire Agent d’opération','Des bénéfices généraux',30000],['Salaire Agent de propreté','Des bénéfices généraux',20000],['Salaire Directeur','Des bénéfices généraux',100000],['Électricité','Des bénéfices généraux',10000],['Internet','Des bénéfices généraux',15000]].map(r=>({id:id('obl'),designation:r[0],provenance:r[1],amount:r[2],baseType:'general',percent:0,targetId:null,targetName:''}))}
function getObligationsForMonth(d,cid,year,month){
  d.monthlyObligations=d.monthlyObligations||{};
  d.monthlyObligations[cid]=d.monthlyObligations[cid]||{};
  const y=String(year||getManageYear());
  const m=String(Number(month||0));
  d.monthlyObligations[cid][y]=d.monthlyObligations[cid][y]||{};
  d.monthlyObligations[cid][y][m]=d.monthlyObligations[cid][y][m]||[];
  return d.monthlyObligations[cid][y][m];
}
function getObligations(d,cid){
  return getObligationsForMonth(d,cid,getObligationYear(),getObligationMonth());
}
function obligationForm(){
  const {d,company}=current();
  const categories=getCompanyCategories(d,company.id);
  const items=d.items.filter(i=>i.companyId===company.id).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'fr'));
  const catOpts=categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  const itemOpts=items.map(i=>`<option value="${i.id}">${esc(i.name)} — ${esc(i.cat||i.type||'Produit / service')}</option>`).join('');
  return `<div class="formCard obligationForm"><input id="oEdit" type="hidden">
    <div class="grid three obligationGrid">
      <input id="oDesignation" placeholder="Désignation de l’obligation">
      <select id="oBaseType" onchange="toggleObligationMode()">
        <option value="general">Basée sur les bénéfices généraux</option>
        <option value="category">Basée sur une catégorie</option>
        <option value="item">Basée sur un produit ou service</option>
      </select>
      <select id="oCategoryTarget" class="obligationTarget" style="display:none"><option value="">Choisir une catégorie</option>${catOpts}</select>
      <select id="oItemTarget" class="obligationTarget" style="display:none"><option value="">Choisir un produit / service</option>${itemOpts}</select>
      <input id="oAmount" type="number" placeholder="Montant fixe à payer">
      <div class="field" id="oPercentBox" style="display:none"><input id="oPercent" type="number" placeholder="% du bénéfice concerné" min="0" max="100"></div>
      <button onclick="addObligation()" id="oSaveBtn">Ajouter obligation</button>
      <button class="btn2" onclick="clearObligationForm()">Vider le formulaire</button>
    </div>
    <p class="small darkSmall">Choisissez la base de l’obligation : bénéfices généraux, une catégorie complète, ou un produit/service précis. Pour catégorie et produit/service, le montant est calculé sur le bénéfice de l’exercice actif.</p>
  </div>`
}
function getActiveExerciseSales(){const {d,company}=current(); return (d.sales||[]).filter(s=>saleBelongsToCompany(s,company.id)&&isInActiveExercise(s));}
function getSelectedObligationSales(){
  const {d,company}=current();
  const y=getObligationYear(), m=getObligationMonth();
  return companySalesRows(d,company.id).filter(s=>{const dt=new Date(s.date); return !isNaN(dt) && dt.getFullYear()===y && dt.getMonth()===m;});
}
function getObligationBaseInfoForSales(r, salesRows){
  const {d,company}=current();
  const sales=Array.isArray(salesRows)?salesRows:getSelectedObligationSales();
  const baseType=r.baseType || (r.itemId?'item':'general');
  if(baseType==='category'){
    const cat=r.targetName||r.category||r.provenance||'';
    const ids=(d.items||[]).filter(i=>i.companyId===company.id&&String(i.cat||'')===String(cat)).map(i=>i.id);
    const rows=sales.filter(s=>ids.includes(s.itemId)||String(s.cat||'')===String(cat));
    return {label:'Catégorie : '+cat, profit:rows.reduce((a,b)=>a+Number(b.profit||0),0), total:rows.reduce((a,b)=>a+Number(b.total||0),0)};
  }
  if(baseType==='item'){
    const iid=r.targetId||r.itemId;
    const item=(d.items||[]).find(i=>i.id===iid&&i.companyId===company.id);
    const name=item?.name||r.targetName||r.provenance||'';
    const rows=sales.filter(s=>s.itemId===iid || String(s.name||'')===String(name));
    return {label:'Produit / service : '+name, profit:rows.reduce((a,b)=>a+Number(b.profit||0),0), total:rows.reduce((a,b)=>a+Number(b.total||0),0)};
  }
  const profit=sales.reduce((a,b)=>a+Number(b.profit||0),0);
  return {label:'Des bénéfices généraux', profit, total:sales.reduce((a,b)=>a+Number(b.total||0),0)};
}
function getObligationBaseInfo(r){
  return getObligationBaseInfoForSales(r, getActiveExerciseSales());
}
function getObligationValueForSales(r, salesRows){
  const baseType=r.baseType || (r.itemId?'item':'general');
  if(baseType==='general' && !Number(r.percent||0)) return Number(r.amount||0);
  const info=getObligationBaseInfoForSales(r, salesRows);
  return Math.round(Number(info.profit||0)*(Number(r.percent||0)/100));
}
function getObligationValue(r){
  return getObligationValueForSales(r, getActiveExerciseSales());
}
function getMonthlyObligationTotal(obligations, salesRows){
  return (obligations||[]).reduce((a,r)=>a+getObligationValueForSales(r, salesRows||[]),0);
}
function toggleObligationMode(){
  const t=$('#oBaseType')?.value||'general';
  const cat=$('#oCategoryTarget'), item=$('#oItemTarget'), amount=$('#oAmount'), pct=$('#oPercentBox');
  if(cat) cat.style.display=t==='category'?'block':'none';
  if(item) item.style.display=t==='item'?'block':'none';
  if(amount){amount.style.display=t==='general'?'block':'none'; amount.placeholder=t==='general'?'Montant fixe à payer':'Montant calculé automatiquement';}
  if(pct) pct.style.display=t==='general'?'none':'flex';
}
function clearObligationForm(){
  ['oEdit','oDesignation','oAmount','oPercent'].forEach(k=>{const el=$('#'+k); if(el) el.value=''});
  const t=$('#oBaseType'); if(t)t.value='general';
  const c=$('#oCategoryTarget'); if(c)c.value='';
  const i=$('#oItemTarget'); if(i)i.value='';
  const b=$('#oSaveBtn'); if(b)b.textContent='Ajouter obligation';
  toggleObligationMode();
}
function obligationsBox(profit, rows=null, admin=false){
  const {d,company}=current();
  rows=rows||getObligations(d,company.id);
  const total=rows.reduce((a,b)=>a+getObligationValue(b),0);
  const safeTotal=Math.max(total,1);
  const currentMonth=monthsList[getObligationMonth()]+' '+getObligationYear();
  const rowHtml=rows.map(r=>{
    const val=getObligationValue(r);
    const pct=val/safeTotal*100;
    const fourchette=profit*(pct/100);
    return `<tr>
      <td>${esc(r.designation)}</td>
      <td>${esc(r.provenance||'Des bénéfices généraux')}</td>
      <td><span class="calcBadge">${pct.toFixed(2)}%</span></td>
      <td><span class="calcBadge">${money(fourchette)}</span></td>
      <td><span class="calcBadge">${money(val)}</span></td>
      <td><span class="calcBadge">${pct.toFixed(2)}%</span></td>
      ${admin?`<td class="actionCell"><div class="rowActions"><button onclick="editObligation('${r.id}')">Modifier</button><button class="danger" onclick="deleteObligation('${r.id}')">Supprimer</button></div></td>`:''}
    </tr>`;
  }).join('');
  return `<div class="reportBox slim obligationsReport">
    <h1>OBLIGATIONS MENSUELLES</h1>
    <h3>Charges fixes mensuelles — GLOBAL 3</h3>
    <div class="notice"><b>Mois concerné :</b> ${currentMonth}</div>
    <table class="obligationsTable">
      <thead>
        <tr>
          <th rowspan="2">Désignation</th>
          <th rowspan="2">Provenance</th>
          <th colspan="2">Fourchette</th>
          <th colspan="2">Salaire</th>
          ${admin?'<th rowspan="2">Action</th>':''}
        </tr>
        <tr>
          <th>% basé sur le total des obligations</th>
          <th>Valeur = (total bénéfices généraux × % basé sur le total des obligations)</th>
          <th>À payer</th>
          <th>% basé sur le total des obligations</th>
        </tr>
      </thead>
      <tbody>
        ${rowHtml}
        <tr class="total">
          <td colspan="2">TOTAL OBLIGATIONS À PAYER</td>
          <td><span class="calcBadge">100%</span></td>
          <td><span class="calcBadge">${money(profit)}</span></td>
          <td><span class="calcBadge">${money(total)}</span></td>
          <td><span class="calcBadge">100%</span></td>
          ${admin?'<td></td>':''}
        </tr>
      </tbody>
    </table>
  </div>`
}
function monthsGrid(sales,obligations=[]){
  const year=getManageYear(), activeMonth=getActiveMonth();
  const rows=monthsList.map((m,i)=>{
    const ms=sales.filter(s=>{const dt=new Date(s.date); return dt.getFullYear()===year && dt.getMonth()===i});
    const monthObligations=getObligationsForMonth(current().d,current().company.id,year,i);
    const obligationTotal=getMonthlyObligationTotal(monthObligations, ms);
    const commandes=ms.length, articles=ms.reduce((a,b)=>a+Number(b.qty||0),0), ca=ms.reduce((a,b)=>a+Number(b.total||0),0), serviceFee=ms.reduce((a,b)=>a+Number(b.serviceFee||0),0), charges=ms.reduce((a,b)=>a+Number(b.charges||0),0), benef=ms.reduce((a,b)=>a+Number(b.profit||0),0), net=benef-obligationTotal;
    return {m,i,commandes,articles,ca,serviceFee,charges,benef,obligations:obligationTotal,net};
  });
  const total=rows.reduce((a,r)=>({commandes:a.commandes+r.commandes,articles:a.articles+r.articles,ca:a.ca+r.ca,serviceFee:a.serviceFee+r.serviceFee,charges:a.charges+r.charges,benef:a.benef+r.benef,obligations:a.obligations+r.obligations,net:a.net+r.net}),{commandes:0,articles:0,ca:0,serviceFee:0,charges:0,benef:0,obligations:0,net:0});
  return `<div class="monthsGrid">${rows.map(r=>`<div class="monthCard ${r.i===activeMonth?'active':''}"><h4>${r.m}</h4><p>Commandes : <b>${r.commandes}</b><br>CA : <b>${money(r.ca)}</b><br>Net : <b>${money(r.net)}</b></p><button onclick="openManagementMonth(${r.i})">Voir ce mois</button></div>`).join('')}</div>
  <table class="g2table yearlyTable"><tr><th>Mois</th><th>Commandes</th><th>Articles</th><th>Chiffre d’affaires</th><th>Frais service</th><th>Charges estimées</th><th>Bénéfice estimé</th><th>Obligations</th><th>Résultat net</th></tr>${rows.map(r=>`<tr class="${r.i===activeMonth?'activeYearRow':''}"><td>${r.m}</td><td>${r.commandes}</td><td>${r.articles}</td><td>${money(r.ca)}</td><td>${money(r.serviceFee)}</td><td>${money(r.charges)}</td><td>${money(r.benef)}</td><td>${money(r.obligations)}</td><td>${money(r.net)}</td></tr>`).join('')}<tr class="total"><td>TOTAL ANNUEL</td><td>${total.commandes}</td><td>${total.articles}</td><td>${money(total.ca)}</td><td>${money(total.serviceFee)}</td><td>${money(total.charges)}</td><td>${money(total.benef)}</td><td>${money(total.obligations)}</td><td>${money(total.net)}</td></tr></table>`
}
function usersTable(users,admin){return `<table class="g2table"><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Horaire caisse</th><th>Statut</th><th>Action</th></tr>${users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${u.role==='caisse'?esc(caisseAllowedRangeLabel(u)):'—'}</td><td>${esc(u.status)}${u.mustChangePassword?' <span class="saleBadge">mot de passe temporaire</span>':''}</td><td class="actionCell">${admin?`<div class="rowActions">${u.role!=='admin'?`<button class="danger" onclick="blockUser('${u.id}')">Bloquer</button>`:''}${u.role==='caisse'?`<button class="btn2" onclick="resetUserPasswordDirect('${u.id}')">Réinitialiser</button>`:'<span class="notice">Admin : Super Admin</span>'}</div>`:''}</td></tr>`).join('')}</table>`}
function isInCurrentCalendarMonth(s){const dt=new Date(s?.date||s); const now=new Date(); return !isNaN(dt) && dt.getFullYear()===now.getFullYear() && dt.getMonth()===now.getMonth();}
function showBilan(){
  if(!requireAdmin('La caisse ne peut pas voir le bilan détaillé, les bénéfices ou les charges globales.')) return;
  const {d,company}=current();
  if(syncMarketplaceValidatedOrdersToReport(d,company.id)) save(d);
  const allCompanySales=companySalesRows(d,company.id);
  const sales=filterSalesByPeriod(getCompanyReportSales(allCompanySales),'bilan');
  const items=d.items.filter(i=>i.companyId===company.id);
  const ca=sales.reduce((a,b)=>a+Number(b.total||0),0), charges=sales.reduce((a,b)=>a+Number(b.charges||0),0), profit=sales.reduce((a,b)=>a+Number(b.profit||0),0);
  const oblTotal=getObligations(d,company.id).reduce((a,r)=>a+getObligationValue(r),0);
  shell(`<div class="g2panel printable"><div class="reportActions no-print"><button onclick="show('rapports')">Retour administrateur</button><button onclick="window.print()">Imprimer / PDF</button></div><div class="reportBox"><h1>RAPPORT BILAN DÉTAILLÉ DE L’ENTREPRISE</h1><h3>${esc(company.name)} — ${esc(periodFilterLabel('bilan'))}<br>N° Rapport : BILAN-${Date.now()} | Date : ${new Date().toLocaleString('fr-FR')}</h3>${periodFilterControls('bilan')}<div class="notice"><b>Filtre indépendant :</b> choisissez un jour, un mois ou une année pour afficher uniquement les ventes de cette période dans le bilan détaillé.</div>${globalSalesReport(items,sales)}<div class="serviceBlock"><h2>Résumé financier de la période sélectionnée</h2><table><tr><th>Indicateur</th><th>Valeur</th></tr><tr><td>Nombre total de clients servis</td><td>${new Set(sales.map(s=>s.client).filter(Boolean)).size}</td></tr><tr><td>Quantité totale vendue</td><td>${sales.reduce((a,b)=>a+Number(b.qty||0),0)}</td></tr><tr><td>Chiffre d’affaires de la période</td><td>${money(ca)}</td></tr><tr><td>Total des charges estimées de la période</td><td>${money(charges)}</td></tr><tr><td>Bénéfice net estimé avant obligations</td><td>${money(profit)}</td></tr><tr><td>Total obligations mensuelles calculées</td><td>${money(oblTotal)}</td></tr><tr><td>Résultat net réel estimé après obligations</td><td>${money(profit-oblTotal)}</td></tr></table></div></div></div>`, 'rapports')
}
function fichePaiementBox(){
  const {d,company}=current();
  const sales=getSelectedObligationSales();
  const ca=sales.reduce((a,b)=>a+Number(b.total||0),0);
  const profit=sales.reduce((a,b)=>a+Number(b.profit||0),0);
  const rows=getObligations(d,company.id);
  const total=rows.reduce((a,r)=>a+getObligationValue(r),0);
  const now=new Date();
  const mois=monthsList[getObligationMonth()]+' '+getObligationYear();
  const ref='FPO-'+now.toISOString().replace(/[-:.TZ]/g,'').slice(0,12);
  const byGroup={};
  rows.forEach(r=>{const g=r.group||guessObligationGroup(r.designation); (byGroup[g]=byGroup[g]||[]).push(r)});
  const groups=Object.keys(byGroup);
  const body=groups.map(g=>`<tr class="ficheGroup"><td colspan="4">${esc(g)}</td></tr>`+byGroup[g].map(r=>`<tr>
    <td>${esc(r.designation)}</td>
    <td>${esc(r.provenance||'Des bénéfices généraux')}</td>
    <td class="salaryCell">${r.percent?esc(String(r.percent).replace('.',','))+'%':money(getObligationValue(r)).replace(' FCFA','')}</td>
    <td class="signatureCell"></td>
  </tr>`).join('')).join('');
  return `<div class="reportBox fichePaiementReport">
    <h1>FICHE DE PAIEMENT DES OBLIGATIONS MENSUELLES</h1>
    <h3>${esc(company.name)} — GLOBAL 3</h3>
    <div class="ficheSeparator"></div>
    <div class="ficheInfoGrid">
      <div><b>Référence :</b> ${ref}</div>
      <div><b>Mois concerné :</b> ${mois}</div>
      <div><b>Date d’édition :</b> ${now.toLocaleString('fr-FR')}</div>
      <div><b>Chiffre d’affaires :</b> ${money(ca)}</div>
      <div><b>Bénéfice avant obligations :</b> ${money(profit)}</div>
      <div><b>Total à prévoir :</b> ${money(total)}</div>
    </div>
    <table class="fichePaiementTable">
      <thead>
        <tr><th>Désignation</th><th>Provenance</th><th colspan="2">Salaire</th><th>Observation / Signature</th></tr>
        <tr><th></th><th></th><th>fixe</th><th>payer</th><th></th></tr>
      </thead>
      <tbody>
        ${body || '<tr><td colspan="5" class="emptyCart">Aucune obligation enregistrée.</td></tr>'}
        <tr class="total"><td colspan="2">TOTAL À PRÉVOIR</td><td>${money(total)}</td><td></td><td></td></tr>
      </tbody>
    </table>
  </div>`
}
function guessObligationGroup(txt=''){
  const t=String(txt).toLowerCase();
  if(t.includes('salaire')||t.includes('agent')||t.includes('directeur')||t.includes('personnel')) return 'Rémunération du personnel';
  if(t.includes('impôt')||t.includes('cnps')||t.includes('fiscal')||t.includes('social')) return 'Charges fiscales et sociales';
  return 'Frais généraux et charges d’exploitation';
}
function showFichePaiement(){if(!requireAdmin('La caisse ne peut pas voir les charges globales.')) return;shell(`<div class="g2panel printable"><div class="reportActions no-print"><button onclick="show('param')">Retour paramètres</button><button onclick="showFichePaiement()">Actualiser la fiche</button><button onclick="window.print()">Imprimer / PDF</button></div>${fichePaiementBox()}</div>`,'param')}
function openCustomCategoryBox(){document.querySelector('#customCategoryBox')?.classList.toggle('hidden')}
function addCustomCategory(){
  if(!requireAdmin()) return false;
  if(!ensureDataUnlocked('l’ajout d’une catégorie')) return false;
  const cat=$('#customCatName')?.value.trim();
  const kind=$('#customCatKind')?.value||'boutique';
  if(!cat){ showCategoryPopupNotice('Nom de catégorie obligatoire', 'Veuillez saisir le nom de la catégorie avant de valider.'); return false; }
  const {d,company}=current();
  const rows=getCompanyCategoryRecords(d,company.id);
  if(planCode(company)==='FREE' && rows.length>=1){ showCategoryPopupNotice('Limite du plan FREE', 'Vous pouvez ajouter une seule catégorie seulement : produits ou services.'); return false; }
  if(rows.some(c=>String(c.name).toLowerCase()===cat.toLowerCase())){ showCategoryPopupNotice('Catégorie déjà enregistrée', 'Une catégorie porte déjà ce nom.'); return false; }
  rows.push({name:cat,kind});
  saveCompanyCategoryRecords(d,company.id,rows);
  save(d); renderDash('stocks'); return true;
}

function showCategoryPopupNotice(title,msg,type='error'){
  const box=document.getElementById('categoryPopupNotice');
  if(!box){ alert((title?title+' : ':'')+msg); return; }
  box.className='categoryPopupNotice '+(type==='success'?'success':'error');
  box.innerHTML=`<b>${esc(title||'Information')}</b><span>${esc(msg||'')}</span>`;
  box.scrollIntoView({behavior:'smooth',block:'center'});
}
function openEditCategoryPopup(cat){
  if(!requireAdmin()) return;
  if(!ensureDataUnlocked('la modification d’une catégorie')) return;
  const {d,company}=current();
  const rows=getCompanyCategoryRecords(d,company.id);
  const rec=rows.find(c=>c.name===cat);
  if(!rec) return showCategoryPopupNotice('Catégorie introuvable','Impossible de retrouver cette catégorie.');
  document.querySelector('.stockSubModalBackdrop')?.remove();
  document.body.insertAdjacentHTML('beforeend',`<div class="stockSubModalBackdrop"><div class="stockSubModalCard"><button class="stockModalClose" onclick="closeStockSubModal()">×</button><h3>Modifier la catégorie</h3><p>Modifiez le nom et le type de cette catégorie de façon sécurisée.</p><label>Nom de la catégorie<input id="editCatName" value="${esc(rec.name)}"></label><label>Type de catégorie<select id="editCatKind"><option value="boutique" ${rec.kind==='service'?'':'selected'}>Catégorie PRODUIT</option><option value="service" ${rec.kind==='service'?'selected':''}>Catégorie SERVICE</option></select></label><div class="stockModalActions compactActions"><button class="stockPrimaryBtn" onclick="confirmEditCategory('${esc(cat).replace(/'/g,'&#39;')}')">Enregistrer</button><button class="btn2" onclick="closeStockSubModal()">Annuler</button></div></div></div>`);
}
function closeStockSubModal(){document.querySelector('.stockSubModalBackdrop')?.remove();}
function confirmEditCategory(cat){
  const {d,company}=current();
  const rows=getCompanyCategoryRecords(d,company.id);
  const rec=rows.find(c=>c.name===cat); if(!rec) return;
  const newName=(document.getElementById('editCatName')?.value||'').trim();
  const newKind=document.getElementById('editCatKind')?.value||'boutique';
  if(!newName){ alert('Nom de catégorie obligatoire.'); return; }
  if(rows.some(c=>c.name!==cat && c.name.toLowerCase()===newName.toLowerCase())){ alert('Une catégorie porte déjà ce nom.'); return; }
  rec.name=newName; rec.kind=newKind;
  (d.items||[]).forEach(i=>{ if(i.companyId===company.id&&i.cat===cat){i.cat=newName; i.type=newKind; if(newKind==='service'){i.stock=0;i.alert=0;i.buy=0;} } });
  saveCompanyCategoryRecords(d,company.id,rows); save(d); closeStockSubModal(); closeStockPopup(); renderDash('stocks'); openStockCategoryPopup();
}
function openDeleteCategoryPopup(cat){
  if(!requireAdmin()) return;
  if(!ensureDataUnlocked('la suppression d’une catégorie')) return;
  const {d,company}=current();
  const count=(d.items||[]).filter(i=>i.companyId===company.id&&i.cat===cat).length;
  document.querySelector('.stockSubModalBackdrop')?.remove();
  document.body.insertAdjacentHTML('beforeend',`<div class="stockSubModalBackdrop"><div class="stockSubModalCard dangerBox"><button class="stockModalClose" onclick="closeStockSubModal()">×</button><h3>Supprimer la catégorie</h3><p>Confirmez la suppression de la catégorie sélectionnée.</p><div class="notice dangerNotice"><b>${esc(cat)}</b><br>Cette catégorie contient ${count} élément(s). Les éléments liés seront également supprimés.</div><div class="stockModalActions compactActions"><button class="danger" onclick="confirmDeleteCategory('${esc(cat).replace(/'/g,'&#39;')}')">Supprimer définitivement</button><button class="btn2" onclick="closeStockSubModal()">Annuler</button></div></div></div>`);
}
function confirmDeleteCategory(cat){
  if(!ensureDataUnlocked('la suppression d’une catégorie')) return;
  const {d,company}=current();
  d.items=(d.items||[]).filter(i=>!(i.companyId===company.id&&i.cat===cat));
  const rows=getCompanyCategoryRecords(d,company.id).filter(c=>c.name!==cat);
  saveCompanyCategoryRecords(d,company.id,rows); save(d); closeStockSubModal(); closeStockPopup(); renderDash('stocks'); openStockCategoryPopup();
}

function editCategory(cat){
  if(!requireAdmin()) return;
  const {d,company}=current();
  const rows=getCompanyCategoryRecords(d,company.id);
  const rec=rows.find(c=>c.name===cat); if(!rec) return alert('Catégorie introuvable.');
  const newName=(prompt('Nouveau nom de la catégorie :', rec.name)||'').trim();
  if(!newName) return;
  const newKind=(prompt('Type de catégorie : tapez produit ou service', rec.kind==='service'?'service':'produit')||'').trim().toLowerCase().startsWith('s')?'service':'boutique';
  if(rows.some(c=>c.name!==cat && c.name.toLowerCase()===newName.toLowerCase())) return alert('Une catégorie porte déjà ce nom.');
  rec.name=newName; rec.kind=newKind;
  (d.items||[]).forEach(i=>{ if(i.companyId===company.id&&i.cat===cat){i.cat=newName; i.type=newKind; if(newKind==='service'){i.stock=0;i.alert=0;i.buy=0;} else {i.serviceFee=0;} } });
  saveCompanyCategoryRecords(d,company.id,rows); save(d); renderDash('stocks');
}
function deleteCategory(cat){
  if(!requireAdmin()) return;
  if(!ensureDataUnlocked('la suppression d’une catégorie')) return;
  const {d,company}=current();
  const count=(d.items||[]).filter(i=>i.companyId===company.id&&i.cat===cat).length;
  if(!confirm('Supprimer la catégorie "'+cat+'" et ses '+count+' élément(s) ?')) return;
  d.items=(d.items||[]).filter(i=>!(i.companyId===company.id&&i.cat===cat));
  const rows=getCompanyCategoryRecords(d,company.id).filter(c=>c.name!==cat);
  saveCompanyCategoryRecords(d,company.id,rows); save(d); renderDash('stocks');
}

function updateAutoProductCharge(){
  const cat=$('#pCat')?.value||'';
  const selectedKind=$('#pCat')?.selectedOptions?.[0]?.dataset?.kind||categoryKind(cat);
  const isService=selectedKind==='service'||$('#pType')?.value==='service';
  const inp=$('#pCharge'), help=$('#chargeHelp');
  if(!inp) return;
  if(isService){ inp.readOnly=false; inp.disabled=false; if(help)help.textContent='Service : % appliqué sur le montant vendu.'; return; }
  const buy=Number($('#pBuy')?.value||0), sell=Number($('#pSell')?.value||0);
  const pct=sell>0?Math.round((buy/sell*100)*100)/100:0;
  inp.value=pct; inp.readOnly=true; inp.disabled=true;
  if(help) help.textContent='Produit : % automatique = prix d’achat unitaire ÷ prix de vente unitaire × 100.';
}
function previewStockPhoto(input){const file=input?.files?.[0]; const prev=$('#pPhotoPreview'); const hidden=$('#pPhotoData'); if(!file){return;} if(!file.type.startsWith('image/')){alert('Veuillez choisir une image valide.'); input.value=''; return;} if(file.size>850000){alert('Image trop lourde. Choisissez une photo inférieure à 850 Ko pour une sauvegarde plus fiable.'); input.value=''; return;} const reader=new FileReader(); reader.onload=e=>{const val=e.target.result||''; if(hidden) hidden.value=val; if(prev){prev.classList.remove('stockPhotoEmpty','hidden'); prev.innerHTML=`<img src="${val}" alt="Aperçu photo"><div><strong>Photo sélectionnée</strong><small>Prête à être enregistrée.</small></div>`;} const rm=$('#pRemovePhoto'); if(rm) rm.checked=false;}; reader.readAsDataURL(file);} 
function setStockPhotoPreview(src){const prev=$('#pPhotoPreview'), hidden=$('#pPhotoData'); if(hidden) hidden.value=src||''; if(prev){ if(src){prev.classList.remove('stockPhotoEmpty','hidden'); prev.innerHTML=`<img src="${src}" alt="Photo actuelle"><div><strong>Photo actuelle</strong><small>Visible dans la boutique client.</small></div>`;} else {prev.classList.remove('hidden'); prev.classList.add('stockPhotoEmpty'); prev.innerHTML='<span class="photoIcon">📷</span><strong>Aucune photo</strong><small>Photo visible par les clients dans la boutique publique.</small>';}}}
function removeStockPhoto(){const hidden=$('#pPhotoData'); if(hidden) hidden.value=''; const pf=$('#pPhoto'); if(pf) pf.value=''; const rm=$('#pRemovePhoto'); if(rm) rm.checked=true; setStockPhotoPreview('');}
async function addItem(){if(!requireAdmin('La caisse ne peut pas gérer les stocks.')) return;if(!ensureDataUnlocked('l’enregistrement du produit ou service')) return;if(!ensureActiveExerciseEditable()) return;const {d,company}=current(), cid=company.id; const eid=$('#pEdit')?.value; const existing=eid?(d.items||[]).find(i=>i.id===eid&&i.companyId===cid):null; const cat=$('#pCat')?.value||''; if(!cat) return alert('Sélectionnez ou créez une catégorie.'); const selectedKind=$('#pCat')?.selectedOptions?.[0]?.dataset?.kind||categoryKind(cat); const isService=selectedKind==='service'||($('#pType')?.value==='service'); const servicePrice=+($('#pServicePrice')?.value||0); const buy=isService?0:(+$('#pBuy')?.value||0), sell=isService?servicePrice:(+($('#pSell')?.value||0)); const charge=isService?(+($('#pCharge')?.value||0)):autoBoutiqueChargePercent({buy,sell}); const removePhoto=!!$('#pRemovePhoto')?.checked; const photoData=$('#pPhotoData')?.value||''; const photo=removePhoto?'':(photoData||existing?.photo||''); const detail=($('#pDetail')?.value||'').trim(); const obj={companyId:cid,code:eid?($('#pCode')?.value||uniqueItemCode(d,cid,eid)):uniqueItemCode(d,cid),name:$('#pName').value,cat:cat,detail,marketplaceDesc:detail,buy,sell,stockType:isService?'none':($('#pStockType')?.value||'limited'),stock:isService?0:(($('#pStockType')?.value||'limited')==='unlimited'?0:(+$('#pStock')?.value||0)),alert:isService?0:(+$('#pAlert')?.value||5),charge,type:isService?'service':'boutique',photo}; if(!obj.name) return alert('Nom obligatoire'); if(!eid && planCode(company)==='FREE'){const itemCount=(d.items||[]).filter(i=>i.companyId===cid).length; const cats=new Set((d.items||[]).filter(i=>i.companyId===cid).map(i=>i.cat).filter(Boolean)); if(!cats.has(cat) && cats.size>=1) return alert('Plan FREE : 1 seule catégorie produits OU services est autorisée.'); if(itemCount>=5) return alert('Plan FREE : maximum 5 produits OU 5 services.');} if(d.items.some(i=>i.companyId===cid&&i.id!==eid&&String(i.code||'').toUpperCase()===String(obj.code||'').toUpperCase())) obj.code=uniqueItemCode(d,cid,eid); if(eid){const it=d.items.find(i=>i.id===eid&&i.companyId===cid); if(it){const before=Number(it.stock||0); Object.assign(it,obj); it.movements=it.movements||[]; it.movements.push({date:new Date().toLocaleDateString('fr-FR'),type:'modification',before,qty:Number(it.stock||0)-before,after:Number(it.stock||0),responsable:activeUserName(),note:'Modification de la fiche'})}}else{const newItem=Object.assign({id:id('itm'),movements:[]},obj); newItem.movements.push({date:new Date().toLocaleDateString('fr-FR'),type:'création',before:0,qty:Number(newItem.stock||0),after:Number(newItem.stock||0),responsable:activeUserName(),note:'Création de la fiche'}); d.items.push(newItem)} save(d); closeStockPopup(); renderDash('stocks')}
function clearItemForm(){['pEdit','pName','pDetail','pBuy','pSell','pServicePrice','pStock','pAlert','pCharge','pPhotoData'].forEach(k=>{const el=$('#'+k); if(el) el.value=(k==='pAlert'?5:k==='pStock'?0:k==='pCharge'?30:'')}); const pc=$('#pCat'); if(pc) pc.value=''; const pst=$('#pStockType'); if(pst)pst.value='limited'; setStockPhotoPreview(''); const pf=$('#pPhoto'); if(pf) pf.value=''; const rm=$('#pRemovePhoto'); if(rm) rm.checked=false; toggleChargeField(); const {d,company}=current(); const c=$('#pCode'); if(c)c.value=uniqueItemCode(d,company.id)}
function toggleChargeField(){const cat=$('#pCat')?.value||''; const selectedKind=$('#pCat')?.selectedOptions?.[0]?.dataset?.kind||categoryKind(cat); const hasCat=!!cat; const isService=hasCat&&(selectedKind==='service'); const form=document.querySelector('.stockFormReorg'); if(form){form.classList.toggle('serviceMode',!!isService); form.classList.toggle('productMode',hasCat&&!isService);} document.querySelectorAll('.itemField').forEach(el=>{el.style.display=hasCat?'flex':'none'}); const price=$('#servicePriceField'); if(price) price.style.display=(hasCat&&isService)?'flex':'none'; document.querySelectorAll('.stockTypeOnly').forEach(el=>{el.style.display=(hasCat&&!isService)?'flex':'none'}); document.querySelectorAll('.stockOnly').forEach(el=>{el.style.display=(hasCat&&!isService)?'flex':'none'}); const pt=$('#pType'); if(pt) pt.value=hasCat?(isService?'service':'boutique'):''; toggleStockQuantityField(); updateAutoProductCharge()}
function toggleStockQuantityField(){const st=$('#pStockType')?.value||'limited'; document.querySelectorAll('.stockQtyOnly').forEach(el=>{el.style.display=st==='limited'?'flex':'none'}); const stock=$('#pStock'); if(stock && st==='unlimited') stock.value=0;}
function addObligation(){
  if(!requireAdmin()) return;if(!ensureDataUnlocked('la modification des obligations mensuelles')) return;if(!ensureActiveExerciseEditable()) return;
  const {d,company}=current(); const rows=getObligations(d,company.id);
  const designation=$('#oDesignation').value.trim(), baseType=$('#oBaseType')?.value||'general', editId=$('#oEdit')?.value;
  const amount=+($('#oAmount')?.value||0), percent=+($('#oPercent')?.value||0);
  if(!designation) return g3ProWarning('Veuillez renseigner la désignation avant d’enregistrer cette obligation mensuelle.','Désignation obligatoire');
  let obj={designation,baseType,amount:0,percent:0,targetId:null,targetName:'',itemId:null,provenance:'Des bénéfices généraux'};
  if(baseType==='general'){
    if(!amount) return alert('Montant fixe obligatoire pour les bénéfices généraux');
    obj.amount=amount; obj.percent=0;
  }else if(baseType==='category'){
    const cat=$('#oCategoryTarget')?.value||'';
    if(!cat) return alert('Choisissez la catégorie concernée');
    if(!percent) return alert('Indiquez le pourcentage du bénéfice de cette catégorie');
    obj.percent=percent; obj.targetName=cat; obj.provenance='Catégorie : '+cat;
  }else{
    const iid=$('#oItemTarget')?.value||'';
    const item=d.items.find(i=>i.id===iid&&i.companyId===company.id);
    if(!item) return alert('Choisissez le produit ou service concerné');
    if(!percent) return alert('Indiquez le pourcentage du bénéfice de ce produit/service');
    obj.percent=percent; obj.targetId=item.id; obj.targetName=item.name; obj.itemId=item.id; obj.provenance='Produit / service : '+item.name;
  }
  if(editId){const r=rows.find(x=>x.id===editId); if(r) Object.assign(r,obj)}else{rows.push(Object.assign({id:id('obl')},obj))}
  save(d); renderDash('param')
}
function editObligation(oid){
  if(!requireAdmin()) return;if(!ensureActiveExerciseEditable()) return;
  const {d,company}=current(); const r=getObligations(d,company.id).find(o=>o.id===oid); if(!r) return;
  const baseType=r.baseType || (r.itemId?'item':'general');
  const e=$('#oEdit'); if(e)e.value=r.id;
  $('#oDesignation').value=r.designation||'';
  const bt=$('#oBaseType'); if(bt)bt.value=baseType;
  const cat=$('#oCategoryTarget'); if(cat)cat.value=r.targetName||r.category||'';
  const item=$('#oItemTarget'); if(item)item.value=r.targetId||r.itemId||'';
  $('#oAmount').value=r.amount||'';
  const pc=$('#oPercent'); if(pc)pc.value=r.percent||'';
  const b=$('#oSaveBtn'); if(b)b.textContent='Enregistrer la modification';
  toggleObligationMode(); document.querySelector('#oDesignation')?.scrollIntoView({behavior:'smooth',block:'center'})
}
function deleteObligation(oid){if(!requireAdmin()) return;if(!ensureDataUnlocked('la suppression d’une obligation mensuelle')) return;if(!ensureActiveExerciseEditable()) return; g3ProConfirm('Suppression d’obligation mensuelle','Supprimer cette obligation mensuelle ? Cette action retirera cette obligation de la liste de gestion.','deleteObligationConfirmed(\''+oid+'\')','Supprimer')}
function deleteObligationConfirmed(oid){const {d,company}=current(); const rows=getObligations(d,company.id); const idx=rows.findIndex(o=>o.id===oid); if(idx>=0) rows.splice(idx,1); save(d); renderDash('param'); g3ProInfo('L’obligation mensuelle a été supprimée avec succès pour le mois sélectionné.','Suppression effectuée')}
function addContractClient(){if(!ensureActiveExerciseEditable()) return;const {d,company}=current(); if(!assertPlanFeature(company,'contracts','Clients sous contrat réservés aux plans BUSINESS et BUSINESS PLUS.')) return; d.clients=d.clients||[]; const name=$('#ccName')?.value.trim()||''; if(!name) return alert('Nom du client obligatoire'); const editId=$('#ccEditMain')?.value||''; const obj={companyId:company.id,name,phone:$('#ccPhone')?.value.trim()||'',mode:$('#ccMode')?.value||'Mensuelle',remise:+($('#ccRemise')?.value||0),obs:$('#ccObs')?.value.trim()||'',updatedAt:new Date().toISOString()}; if(editId){const c=d.clients.find(x=>x.id===editId&&x.companyId===company.id); if(c){Object.assign(c,obj)} }else{d.clients.push(Object.assign({id:id('cli'),createdAt:new Date().toISOString()},obj))} save(d); closeContractClientModal(); renderDash('contrats')}
function editContractClient(cid){openEditContractClientModal(cid)}
function deleteContractClient(cid){if(!ensureDataUnlocked('la suppression d’un client contrat')) return;if(!ensureActiveExerciseEditable()) return; g3ProConfirm('Suppression client sous contrat','Supprimer définitivement ce client contrat ? Cette action retirera le client de la liste des contrats.','deleteContractClientConfirmed(\''+cid+'\')','Supprimer')}
function deleteContractClientConfirmed(cid){const {d,company}=current(); d.clients=(d.clients||[]).filter(c=>!(c.id===cid&&c.companyId===company.id)); save(d); renderDash('contrats'); g3ProInfo('Le client sous contrat a été supprimé avec succès.','Suppression effectuée')}
function findClientSalesByName(name,periodKey=''){const {d,company}=current(); const n=String(name||'').toLowerCase(); return (d.sales||[]).filter(s=>{const ok=saleBelongsToCompany(s,company.id)&&s.clientType==='contrat'&&String(s.client||'').toLowerCase().includes(n); if(!ok) return false; if(!periodKey) return true; return contractSaleMonthKey(s)===periodKey || contractQuarterKey(s)===periodKey || contractSaleYearKey(s)===periodKey;}).sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));}
function generateMonthlyClientInvoiceByName(encodedName){generateMonthlyClientInvoice('', decodeURIComponent(encodedName||''));}
function generateMonthlyClientInvoice(cid='', clientName='', periodKey=''){const {d,company}=current(); const c=cid?(d.clients||[]).find(x=>x.id===cid&&x.companyId===company.id):null; const label=clientName || (c?[c.name,c.phone].filter(Boolean).join(' — '):''); const sales=findClientSalesByName(c?.name||label,periodKey); if(!sales.length) return g3ProWarning('Aucune consommation trouvée pour ce client sous contrat. Vérifiez la période sélectionnée ou les ventes enregistrées pour ce client.','Aucune consommation trouvée'); const total=sales.reduce((a,b)=>a+Number(b.total||0),0), remise=c?Number(c.remise||0):0, net=total-(total*remise/100); const now=new Date(), ref='FCM-'+now.toISOString().replace(/[-:.TZ]/g,'').slice(0,12); const periode=periodKey || contractSaleMonthKey(sales[0]); shell(`<div class="g2panel printable"><div class="reportActions no-print"><button onclick="showContractClientInvoices('${cid}')">Retour factures client</button><button onclick="window.print()">Imprimer / PDF</button></div><div class="reportBox monthlyInvoice">${freeWatermark(company)}<h1>FACTURE CLIENT SOUS CONTRAT</h1><h3>${esc(company.name)} — GLOBAL 3 — Période : ${esc(periode)}</h3><div class="ficheSeparator"></div><div class="ficheInfoGrid"><div><b>Référence :</b> ${ref}</div><div><b>Client :</b> ${esc(label)}</div><div><b>Type facturation :</b> ${esc(c?.mode||'Mensuelle')}</div><div><b>Date :</b> ${now.toLocaleString('fr-FR')}</div><div><b>Nombre de lignes :</b> ${sales.length}</div><div><b>Total consommation :</b> ${money(total)}</div><div><b>Remise :</b> ${Number(remise||0)}%</div><div><b>Net à payer :</b> ${money(net)}</div></div><table class="g2table monthlyContractTable"><tr><th>Date</th><th>Service / produit</th><th>Note / Détail</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th><th>Observation</th></tr>${sales.map(s=>`<tr><td>${new Date(s.date).toLocaleString('fr-FR')}</td><td>${esc(s.name)}</td><td>${esc(s.note||s.detail||s.description||'—')}</td><td>${Number(s.qty||1)}</td><td>${money(s.unit||0)}</td><td>${money(s.total||0)}</td><td>${esc(s.obs||'—')}</td></tr>`).join('')}<tr class="total"><td colspan="5">TOTAL CONSOMMATION</td><td>${money(total)}</td><td></td></tr><tr class="total"><td colspan="5">REMISE ${remise}%</td><td>${money(total-net)}</td><td></td></tr><tr class="total"><td colspan="5">NET À PAYER</td><td>${money(net)}</td><td></td></tr></table>${qrBlock(ref,company,net,now.toISOString())}<div class="signatureZone"><span>Signature client</span><span>Cachet / Signature entreprise</span></div></div></div>`,'contrats')}
function addContractClientFromSale(){if(!ensureDataUnlocked('l’ajout d’un client contrat')) return;if(!ensureActiveExerciseEditable()) return;const {d,company}=current(); if(!assertPlanFeature(company,'contracts','Clients sous contrat réservés aux plans BUSINESS et BUSINESS PLUS.')) return; d.clients=d.clients||[]; const name=$('#ccNamePopup')?.value.trim(); if(!name) return alert('Nom du client obligatoire'); d.clients.push({id:id('cli'),companyId:company.id,name,phone:$('#ccPhonePopup')?.value.trim()||'',mode:$('#ccModePopup')?.value||'MENSUELLE',remise:+($('#ccRemisePopup')?.value||0),obs:$('#ccObsPopup')?.value.trim()||'',createdAt:new Date().toISOString()}); save(d); closeClientContractPopup(); renderDash('vente')}

function openSaleAddPopupFromManual(){
  const iid=document.getElementById('saleItem')?.value||'';
  if(!iid) return showAutoNotice('Sélectionnez un produit ou un service valide.','error');
  openSaleAddPopup(iid);
}

function addSale(){
  if(!ensureActiveExerciseEditable()) return;
  const {d,user,company}=current(), cid=company.id, iid=$('#saleItem')?.value;
  let item=d.items.find(i=>i.id===iid&&i.companyId===cid), qty=+($('#saleQty')?.value||1), charges=0;
  const mode=$('#saleMode')?.value||'';
  if(!$('#saleCat')?.value) return showAutoNotice('Choisissez d’abord une catégorie.','error');
  if(!item) return showAutoNotice('Sélectionnez un produit ou un service valide.','error');
  if(qty<1) return showAutoNotice('Quantité obligatoire','error');
  if(mode==='boutique' && item.stockType!=='unlimited' && Number(item.stock||0)<qty) return showAutoNotice('Stock insuffisant','error');
  const serviceFee=(!isBoutiqueItem(item)&&mode==='service')?Math.max(0,Number($('#saleServiceFee')?.value||0)):0;
  const note=String($('#saleNote')?.value||'').trim();
  let unit=0,total=0;
  if(isBoutiqueItem(item)||mode==='boutique'){
    unit=Number(item.sell||0); charges=Number(item.buy||0)*qty;
    if(item.stockType!=='unlimited') item.stock=Number(item.stock||0)-qty;
    total=qty*unit;
  }else{
    unit=Math.max(0,Number($('#salePrice')?.value||0));
    if(!unit) return showAutoNotice('Renseignez le prix du service.','error');
    const serviceBase=unit; total=serviceBase+serviceFee; charges=serviceBase*(Number(item.charge||0)/100);
  }
  const saleClientInfo=getSaleClientInfo();
  if(!saleClientInfo.ok) return showAutoNotice('Veuillez choisir un client sous contrat avant d’ajouter au panier.','error');
  const client=saleClientInfo.label, clientId=saleClientInfo.clientId;
  const sid='G3-'+new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14)+'-'+Math.floor(Math.random()*90+10);
  d.sales.push({id:sid,companyId:cid,userId:user.id,client,name:item.name,qty,unit,total,serviceFee,charges,profit:total-charges,date:new Date().toISOString(),docSecureLink:secureDocLink(sid),docQr:true,clientType:saleClientInfo.type,clientId,itemCode:item.code||'',itemId:item.id,category:item.cat||'',saleKind:mode,note});
  save(d);
  logCaisseAction('Ajout au panier','Ligne '+sid+' — '+(item.name||''));
  refreshPosTicket();
  showAutoNotice('Commande ajoutée au ticket.', 'success');
  const code=$('#saleCodeInput'); if(code)code.value=''; const list=$('#saleServiceSelect'); if(list)list.value='';
  resetSaleSelection(); refreshSaleCodeSuggestions(); if($('#saleServiceLookup')?.value==='list') populateSaleItemList();
}
async function resetUserPasswordDirect(uid){
  if(!requireAdmin('Réservé à l’administrateur.')) return;
  const {d,company}=current();
  const u=(d.users||[]).find(x=>x.id===uid&&x.companyId===company.id);
  if(!u||u.role!=='caisse') return alert('Réinitialisation refusée : un administrateur d’entreprise peut réinitialiser uniquement un compte Caisse. Pour un compte Administrateur, contactez le Super Admin GLOBAL3.');
  if(!confirm('Réinitialiser le mot de passe de '+(u.name||u.email)+' ?')) return;
  const temp=makeTempPassword();
  await setUserPasswordSecure(u,temp); u.status='active'; u.mustChangePassword=true;
  resetLoginAttempts(u.email);
  save(d);
  alert('Nouveau mot de passe temporaire :\n\n'+temp+'\n\nÀ communiquer à l’utilisateur. Il devra le changer à la prochaine connexion.');
  renderDash('param');
}
async function addUser(){if(!requireAdmin('La caisse ne peut pas créer ni voir les mots de passe des utilisateurs.')) return;const {d,company}=current(); if(!assertPlanFeature(company,'multi_users','Le multi-utilisateur est réservé aux plans BUSINESS et BUSINESS PLUS.')) return; if(!canCreateMoreUsers(company,d)) return alert('Limite utilisateurs atteinte pour le plan '+planDef(company).statut+' : '+userLimitLabel(company)+' utilisateur(s).'); const email=$('#uEmail').value.trim().toLowerCase(); if(d.users.some(u=>u.companyId===company.id&&String(u.email||'').toLowerCase()===email)) return alert('Email déjà utilisé'); const u={id:id('usr'),companyId:company.id,name:$('#uName').value,email,role:$('#uRole').value,status:'active',sessionMinutes:0,caisseStartTime:$('#uRole').value==='caisse'?normalizeHour($('#uStart')?.value,'07:00'):'',caisseEndTime:$('#uRole').value==='caisse'?normalizeHour($('#uEnd')?.value,'22:00'):'',createdAt:new Date().toISOString(),mustChangePassword:true}; await setUserPasswordSecure(u,$('#uPass').value||'1234'); d.users.push(u); save(d); renderDash('param')}
function blockUser(uid){const d=seed(), u=d.users.find(x=>x.id===uid); if(u)u.status='blocked'; save(d); renderDash('param')}

function superPasswordResetRequestsBox(){
  const d=seed();
  const rows=(d.passwordResetRequests||[]).filter(r=>r.role==='admin').slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  return `<div class="superTableWrap"><table class="superTable"><thead><tr><th>Date</th><th>Entreprise</th><th>Administrateur</th><th>Contact</th><th>Motif</th><th>Statut</th><th>Action</th></tr></thead><tbody>${rows.map(r=>{const c=(d.companies||[]).find(x=>x.id===r.companyId); return `<tr><td>${new Date(r.createdAt).toLocaleString('fr-FR')}</td><td>${esc(c?.name||'-')}</td><td><b>${esc(r.userName||r.email)}</b><br><small>${esc(r.email||'')}</small></td><td>${esc(r.phone||'')}</td><td>${esc(r.reason||'')}</td><td>${esc(r.status||'')}</td><td>${r.status==='pending'?`<button class="detailsBtn" onclick="resetPasswordRequestBySuper('${r.id}')">Générer mot de passe</button>`:'<span class="statusPill active">traité</span>'}</td></tr>`}).join('')||'<tr><td colspan="7">Aucune demande administrateur en attente.</td></tr>'}</tbody></table></div>`;
}
async function resetPasswordRequestBySuper(rid){
  const {d,user}=current();
  if(user?.role!=='superadmin') return alert('Réservé au Super Admin GLOBAL3.');
  const r=(d.passwordResetRequests||[]).find(x=>x.id===rid && x.role==='admin');
  if(!r) return alert('Demande administrateur introuvable.');
  const u=(d.users||[]).find(x=>x.id===r.userId && x.role==='admin');
  if(!u) return alert('Compte administrateur introuvable.');
  const temp=makeTempPassword();
  await setUserPasswordSecure(u,temp); u.status='active'; u.mustChangePassword=true;
  r.status='done'; r.doneAt=new Date().toISOString(); r.doneBy=user.id;
  resetLoginAttempts(u.email);
  save(d);
  alert('Mot de passe temporaire généré pour l’administrateur '+(u.name||u.email)+' :\n\n'+temp+'\n\nL’administrateur devra le changer à la prochaine connexion.');
  renderSuper();
}
async function superResetAdminPassword(uid){
  const {d,user}=current();
  if(user?.role!=='superadmin') return alert('Réservé au Super Admin GLOBAL3.');
  const u=(d.users||[]).find(x=>x.id===uid && x.role==='admin');
  if(!u) return alert('Compte administrateur introuvable.');
  if(!confirm('Générer un mot de passe temporaire pour cet administrateur ?')) return;
  const temp=makeTempPassword();
  await setUserPasswordSecure(u,temp); u.status='active'; u.mustChangePassword=true;
  resetLoginAttempts(u.email);
  save(d);
  alert('Mot de passe temporaire généré pour '+(u.name||u.email)+' :\n\n'+temp+'\n\nChangement obligatoire à la prochaine connexion.');
  closeSuperModal(); showCompanyDetails(u.companyId);
}
function renderSuper(){const {d,user}=current(); const ca=d.sales.reduce((a,b)=>a+b.total,0); const active=d.companies.filter(c=>statusCompany(c)==='active'||statusCompany(c)==='trial').length; const expired=d.companies.filter(c=>statusCompany(c)==='expired').length; app.innerHTML=`<div class="superShell"><aside class="superSide"><div class="superBrand"><div class="superLogo">MS</div><div><h2>MEGA SERVICES</h2><p>Super Admin GLOBAL 3</p></div></div><div class="superMenu"><button class="active" onclick="renderSuper()">📊 Vue générale</button><button onclick="exportData()">📤 Exporter données</button><button class="danger" onclick="logout()">🚪 Déconnexion</button></div><div class="superNote">Gestion centrale des entreprises, abonnements, utilisateurs et chiffres déclarés.</div></aside><main class="superMain"><div class="superHero"><div><span class="superKicker">Administration centrale</span><h1>Gestion professionnelle des entreprises inscrites</h1><p>Suivi des abonnements, contrôle des statuts, chiffre d’affaires et actions rapides MEGA SERVICES.</p></div><button class="superExport" onclick="exportData()">📤 Exporter données</button></div><div class="superStats"><div class="superStat"><span>🏢</span><small>Entreprises</small><b>${d.companies.length}</b></div><div class="superStat"><span>✅</span><small>Actives</small><b>${active}</b></div><div class="superStat"><span>⏳</span><small>Expirées</small><b>${expired}</b></div><div class="superStat"><span>💰</span><small>CA déclaré</small><b>${money(ca)}</b></div></div><section class="superPanel"><div class="superPanelHead"><div><h2>Entreprises inscrites</h2><p>Liste simplifiée : cliquez sur <b>Voir détails</b> devant chaque entreprise pour ouvrir la fiche complète avec les actions.</p></div><span>${d.companies.length} entreprise(s)</span></div><div class="superTableWrap"><table class="superTable superCompanyList"><thead><tr><th>Entreprise</th><th>Responsable</th><th>Abonnement</th><th>CA déclaré</th><th>Fiche complète</th></tr></thead><tbody>${d.companies.map(c=>{let s=d.sales.filter(x=>x.companyId===c.id).reduce((a,b)=>a+b.total,0), st=statusCompany(c); return `<tr><td><div class="companyNameLine"><button class="detailsBtn" onclick="showCompanyDetails('${c.id}')">Voir détails</button><strong>${esc(c.name)}</strong></div></td><td>${esc(c.owner)}</td><td><span class="statusPill ${st}">${st}</span><br><small>${esc(planDef(c).label)} — Fin : ${esc(c.subscriptionEnd)}</small></td><td><b>${money(s)}</b></td><td><button class="detailsBtn wide" onclick="showCompanyDetails('${c.id}')">Ouvrir la fiche</button></td></tr>`}).join('')}</tbody></table></div></section><section class="superPanel"><div class="superPanelHead"><div><h2>Réinitialisation mots de passe Administrateur</h2><p>Règle de sécurité : seul le Super Admin GLOBAL3 peut réinitialiser un compte Administrateur d’entreprise.</p></div></div>${superPasswordResetRequestsBox()}</section></main></div>`}

function showCompanyDetails(cid){const d=seed(), c=d.companies.find(x=>x.id===cid); if(!c)return; const us=d.users.filter(u=>u.companyId===c.id), sales=d.sales.filter(x=>x.companyId===c.id), pay=d.payments.filter(x=>x.companyId===c.id); const ca=sales.reduce((a,b)=>a+b.total,0), articles=sales.reduce((a,b)=>a+(Number(b.qty)||0),0), st=statusCompany(c); const old=document.querySelector('.superModalBackdrop'); if(old)old.remove(); const box=document.createElement('div'); box.className='superModalBackdrop'; box.innerHTML=`<div class="superCompanyModal"><button class="superClose" onclick="closeSuperModal()">×</button><div class="companyModalHead"><div><span class="superKicker">Fiche entreprise</span><h2>${esc(c.name)}</h2><p>Informations d’inscription, abonnement, utilisateurs, chiffre d’affaires et gestion des accès.</p></div><span class="statusPill ${st}">${st}</span></div><div class="companyDetailGrid"><div><small>Responsable</small><b>${esc(c.owner)}</b></div><div><small>Téléphone</small><b>${esc(c.phone)}</b></div><div><small>Email</small><b>${esc(c.email)}</b></div><div><small>Type de commerce</small><b>${esc(c.businessType)}</b></div><div><small>Plan</small><b>${esc(c.plan)}</b></div><div><small>Début abonnement</small><b>${esc(c.subscriptionStart||'-')}</b></div><div><small>Fin abonnement</small><b>${esc(c.subscriptionEnd||'-')}</b></div><div><small>Utilisateurs</small><b>${us.length}</b></div><div><small>Ventes réalisées</small><b>${sales.length}</b></div><div><small>Articles vendus</small><b>${articles}</b></div><div><small>Chiffre d’affaires</small><b>${money(ca)}</b></div><div><small>Paiements enregistrés</small><b>${pay.length}</b></div></div><h3>Utilisateurs du compte</h3><div class="miniList">${us.length?us.map(u=>`<div><b>${esc(u.name)}</b><span>${esc(u.role)} — ${esc(u.email)} — ${esc(u.status||'active')}${u.mustChangePassword?' — mot de passe temporaire':''}</span>${u.role==='admin'?`<button class="detailsBtn" onclick="superResetAdminPassword('${u.id}')">Réinitialiser admin</button>`:''}</div>`).join(''):'<em>Aucun utilisateur enregistré.</em>'}</div>${planActivationButtons(c.id,planCode(c))}<div class="superModalActions"><button onclick="renewCompany('${c.id}');closeSuperModal()">Renouveler</button><button class="soft" onclick="setCompanyStatus('${c.id}','suspended');closeSuperModal()">Suspendre</button><button class="danger" onclick="setCompanyStatus('${c.id}','blocked');closeSuperModal()">Bloquer</button><button class="ok" onclick="setCompanyStatus('${c.id}','active');closeSuperModal()">Activer</button></div></div>`; document.body.appendChild(box)}
function closeSuperModal(){const m=document.querySelector('.superModalBackdrop'); if(m)m.remove()}

function renewCompany(cid){const d=seed(), c=d.companies.find(x=>x.id===cid), days=Number(prompt('Nombre de jours ?', '30')||0), amount=Number(prompt('Montant payé ?', '0')||0); if(!c||!days)return; c.status='active'; c.plan='Abonnement '+days+' jours'; c.subscriptionStart=today(); c.subscriptionEnd=new Date(Date.now()+days*86400000).toISOString().slice(0,10); d.payments.push({id:id('pay'),companyId:cid,amount,plan:c.plan,date:new Date().toISOString()}); save(d); renderSuper()}
function setCompanyStatus(cid,st){const d=seed(), c=d.companies.find(x=>x.id===cid); if(c)c.status=st; save(d); renderSuper()}
function exportData(){if(!requireAdmin('La caisse ne peut pas exporter toute la base de données.')) return;const blob=new Blob([JSON.stringify(seed(),null,2)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='global3-sauvegarde.json'; a.click()}
window.addEventListener('error',e=>{app.innerHTML='<div class="wrap"><div class="card"><h1>GLOBAL 3</h1><p>Une erreur a été détectée, mais la page n’est pas blanche.</p><pre>'+esc(e.message)+'</pre><button onclick="cloudStart()">Réessayer</button></div></div>'});
window.addEventListener('unhandledrejection',e=>{const msg=(e.reason&&e.reason.message)||String(e.reason||'Erreur inconnue'); app.innerHTML='<div class="wrap"><div class="card"><h1>GLOBAL 3</h1><p>Une erreur a été détectée pendant l’ouverture.</p><pre>'+esc(msg)+'</pre><button onclick="cloudStart()">Réessayer</button></div></div>'});
cloudStart();



function availableSubscriptionPlansHTML(){
  const plans=[
    {code:'FREE',name:'PLAN GRATUIT — FREE',price:0,status:'FREE',tag:'Idéal pour commencer',dest:['Petits commerces','Débutants','Test de la plateforme'],features:['1 seule catégorie autorisée','Maximum 5 produits OU 5 services','1 utilisateur admin uniquement','Vente simple','Gestion basique','Historique ventes','Impression facture','Rapport simple']},
    {code:'BUSINESS',name:'PLAN BUSINESS',price:3500,status:'BUSINESS',tag:'PME & boutiques',dest:['PME','Boutiques','Entreprises de services'],features:['Catégories limitées','Produits limités','Services limités','Multi-utilisateurs limités','Gestion avancée','Rapports détaillés','Facturation professionnelle','Clients sous contrat']},
    {code:'BUSINESS_PLUS',name:'PLAN BUSINESS PLUS',price:5500,status:'BUSINESS_PLUS',tag:'Premium + marketplace',dest:['Grandes entreprises','Commerces premium','Entreprises voulant vendre publiquement'],features:['Tout BUSINESS','Marketplace intégré','Publication produits/services','Boutique publique moderne','Référencement dans GLOBAL MARKET','Support prioritaire','Fonctionnalités premium futures']}
  ];
  return `<div class="g2panel subscriptionPlansBox"><div class="subscriptionPlansHead"><div><h3>Plans d’abonnement disponibles</h3><p>Choisissez un plan puis cliquez sur <b>Acheter</b> pour ouvrir le formulaire de paiement.</p></div><span>GLOBAL 3</span></div><div class="subscriptionPlansGrid">${plans.map(p=>`<article class="subscriptionPlanCard ${p.code==='BUSINESS_PLUS'?'premiumPlan':''}"><div class="planTopLine"><span>${esc(p.tag)}</span><b>${esc(p.status)}</b></div><h2>${esc(p.name)}</h2><div class="planPrice">${money(p.price)} <small>/ mois</small></div><p class="planDest"><b>Destiné à :</b> ${p.dest.map(esc).join(' • ')}</p><ul>${p.features.map(f=>`<li>✅ ${esc(f)}</li>`).join('')}</ul>${p.code==='FREE'?`<button class="freePlanBtn" disabled>Déjà activé à l’inscription</button>`:`<button class="buyPlanBtn" onclick="openSubscriptionPayment('${p.code}')">Acheter</button>`}</article>`).join('')}</div></div>`;
}
function openSubscriptionPayment(code){
  if(code==='FREE'){alert('Le plan FREE est activé automatiquement à la première inscription de l’entreprise. Aucun achat n’est nécessaire.');return;}
  const {company}=current(); const plan=GLOBAL3_PLANS[code]||GLOBAL3_PLANS.FREE;
  const ticket='G3-'+today().replaceAll('-','')+'-'+randomPart(5); const amount=Number(plan.price||0);
  const usdRate=600;
  const amountUsd=Math.ceil((amount/usdRate)*100)/100;
  const wave='https://pay.wave.com/m/M_ci_Enx-2JNAklk-/c/ci/?amount='+amount;
  const usdt='TELcLXo2sFUEnzVTJnX25dvanqca6VLwyM';
  const usdtPayload='USDT TRC20 | Adresse: '+usdt+' | Montant: '+amountUsd+' USD | Ticket: '+ticket;
  const qr=(data)=>'https://api.qrserver.com/v1/create-qr-code/?size=190x190&margin=8&data='+encodeURIComponent(data);
  const old=document.querySelector('.subscriptionPaymentBackdrop'); if(old)old.remove();
  const box=document.createElement('div'); box.className='subscriptionPaymentBackdrop';
  box.innerHTML=`<div class="subscriptionPaymentModal"><button class="subscriptionClose" onclick="this.closest('.subscriptionPaymentBackdrop').remove()">×</button><div class="paymentHero"><div><span>GLOBAL3 • Commande & Paiement</span><h2>${esc(plan.label)}</h2><p>Vérifiez les informations, sélectionnez le moyen de paiement puis le QR Code correspondant s’affichera.</p></div><b id="g3payHeroAmount">${money(amount)}</b></div><div class="paymentGrid"><label>N° de ticket<input id="g3payTicket" value="${ticket}" readonly></label><label>Entreprise<input id="g3payCompany" value="${esc(company?.name||'')}" readonly></label><label>Nom complet<input id="g3payName" placeholder="Nom du responsable"></label><label>WhatsApp / Téléphone<input id="g3payPhone" placeholder="Ex : 0777041790"></label><label>Pack choisi<input value="${esc(plan.label)}" readonly></label><label>Montant à payer<input id="g3payAmountDisplay" value="${money(amount)}" readonly></label></div><div class="paymentSummary"><h3>Résumé de la commande</h3><p><b>Produit :</b> GLOBAL 3 — ${esc(plan.label)}</p><p><b>Code pack :</b> ${esc(plan.code)}</p><p><b>Mode d’accès :</b> Activation par Super Admin après validation.</p><p><b>Montant FCFA :</b> ${money(amount)}</p><p><b>Montant USDT TRC20 :</b> ${amountUsd} $</p></div><div class="paymentMethodSelect"><h3>Choisir le moyen de paiement</h3><div><button type="button" onclick="selectSubscriptionPaymentMethod('wave')">Wave Côte d’Ivoire</button><button type="button" onclick="selectSubscriptionPaymentMethod('usdt')">USDT TRC20</button></div><small>Sélectionnez d’abord un moyen de paiement pour afficher uniquement son QR Code.</small></div><div class="paymentChoices paymentQrChoices"><div id="g3payWaveBox" class="payQrPanel" style="display:none"><h4>Paiement Wave Côte d’Ivoire</h4><div class="qrPayBox"><img src="${qr(wave)}" alt="QR Code Paiement Wave"><p>Montant : <b>${money(amount)}</b><br>Scannez ce QR Code pour ouvrir le paiement Wave.</p></div><a href="${wave}" target="_blank" rel="noopener">Ouvrir Wave</a></div><div id="g3payUsdtBox" class="payQrPanel" style="display:none"><h4>USDT TRC20</h4><div class="qrPayBox"><img src="${qr(usdtPayload)}" alt="QR Code USDT TRC20"><p>Montant à payer : <b>${amountUsd} $</b><br>Réseau : <b>TRC20</b><br>Adresse : ${esc(usdt)}</p></div><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${usdt}')">Copier l’adresse</button></div></div><div class="paymentFinal"><input type="hidden" id="g3payMethod" value=""><label>Référence de transaction*<input id="g3payRef" placeholder="Référence Wave / USDT"></label><label>Note complémentaire<textarea id="g3payNote" placeholder="Facultatif"></textarea></label><button onclick="sendSubscriptionPaymentWhatsApp('${plan.code}','${ticket}',${amount},${amountUsd})">J’ai payé</button><small>Les informations de commande seront envoyées au support MEGA SERVICES par WhatsApp.</small></div></div>`;
  document.body.appendChild(box);
}
function selectSubscriptionPaymentMethod(method){
  const waveBox=$('#g3payWaveBox'), usdtBox=$('#g3payUsdtBox'), methodInput=$('#g3payMethod'), amountInput=$('#g3payAmountDisplay'), hero=$('#g3payHeroAmount');
  if(methodInput) methodInput.value=method;
  if(waveBox) waveBox.style.display=method==='wave'?'block':'none';
  if(usdtBox) usdtBox.style.display=method==='usdt'?'block':'none';
  document.querySelectorAll('.paymentMethodSelect button').forEach(b=>b.classList.remove('activePayMethod'));
  const active=[...document.querySelectorAll('.paymentMethodSelect button')].find(b=>method==='wave'?b.textContent.includes('Wave'):b.textContent.includes('USDT'));
  if(active) active.classList.add('activePayMethod');
  const usdText=document.querySelector('#g3payUsdtBox .qrPayBox b')?.textContent||'';
  const fcfaText=document.querySelector('#g3payWaveBox .qrPayBox b')?.textContent||'';
  if(method==='usdt'){ if(amountInput) amountInput.value=usdText; if(hero) hero.textContent=usdText; }
  if(method==='wave'){ if(amountInput) amountInput.value=fcfaText; if(hero) hero.textContent=fcfaText; }
}
function sendSubscriptionPaymentWhatsApp(code,ticket,amount,amountUsd){
  const {company}=current(); const plan=GLOBAL3_PLANS[code]||GLOBAL3_PLANS.FREE;
  const name=($('#g3payName')?.value||'').trim(), phone=($('#g3payPhone')?.value||'').trim(), ref=($('#g3payRef')?.value||'').trim(), note=($('#g3payNote')?.value||'').trim(), method=($('#g3payMethod')?.value||'').trim();
  if(!method){alert('Veuillez d’abord sélectionner le moyen de paiement.');return;}
  if(!name||!phone||!ref){alert('Veuillez renseigner le nom, le téléphone et la référence de transaction.');return;}
  const methodLabel=method==='usdt'?'USDT TRC20':'Wave Côte d’Ivoire';
  const amountLabel=method==='usdt'?(amountUsd+' $') : money(amount);
  const msg=`Bonjour MEGA SERVICES, je viens de payer un abonnement GLOBAL 3.%0A%0AEntreprise : ${encodeURIComponent(company?.name||'')}%0AResponsable : ${encodeURIComponent(name)}%0ATéléphone : ${encodeURIComponent(phone)}%0ATicket : ${encodeURIComponent(ticket)}%0APack : ${encodeURIComponent(plan.label)}%0AStatut demandé : ${encodeURIComponent(plan.statut)}%0AMoyen de paiement : ${encodeURIComponent(methodLabel)}%0AMontant : ${encodeURIComponent(amountLabel)}%0ARéférence transaction : ${encodeURIComponent(ref)}%0ANote : ${encodeURIComponent(note||'-')}%0A%0AMerci de valider mon abonnement.`;
  window.open('https://wa.me/'+supportPhone+'?text='+msg,'_blank');
}

function printPlanPaymentReceipt(paymentId){
  const {d,company}=current();
  const p=(d.payments||[]).find(x=>x.id===paymentId&&x.companyId===company.id);
  if(!p){alert('Paiement introuvable.');return;}
  const dt=p.date?new Date(p.date).toLocaleString('fr-FR'):new Date().toLocaleString('fr-FR');
  const ref=esc(p.ref||p.id||'');
  const plan=esc(p.plan||company.plan||planDef(company).label);
  const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Reçu abonnement ${ref}</title><style>
  @page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{margin:0;background:#f3f7f6;font-family:Arial,Helvetica,sans-serif;color:#123}.toolbar{position:fixed;top:12px;right:12px;display:flex;gap:8px}.toolbar button{border:0;border-radius:10px;padding:11px 14px;font-weight:900;cursor:pointer;background:#00625d;color:#fff}.receipt{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:14mm;position:relative;overflow:hidden}.top{display:flex;justify-content:space-between;gap:12mm;border-bottom:2px solid #00625d;padding-bottom:8mm}.brand h1{margin:0;color:#00625d;font-size:28px}.brand p{margin:6px 0 0;color:#555}.badge{background:#00625d;color:#fff;border-radius:18px;padding:10px 16px;height:max-content;font-weight:900}.title{text-align:center;margin:16mm 0 10mm}.title h2{font-size:30px;margin:0;color:#062b29}.title p{margin:8px 0 0;color:#777}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8mm;margin-bottom:10mm}.box{border:1px solid #d9e4e2;border-radius:14px;padding:7mm;background:#fbfefd}.box small{display:block;color:#667;margin-bottom:4px}.box b{font-size:17px;color:#102b2a}.amount{border-radius:18px;padding:10mm;background:#062b29;color:#fff;display:flex;justify-content:space-between;align-items:center;margin:8mm 0}.amount span{font-size:15px;color:#d7eee9}.amount b{font-size:32px}.foot{display:grid;grid-template-columns:1fr 1fr;gap:12mm;margin-top:18mm}.sign{border-top:1px solid #222;text-align:center;padding-top:4mm;color:#333}.wave{position:absolute;left:0;right:0;bottom:0;height:18mm;background:#00625d;border-top:5px solid #d6a21b}@media print{body{background:#fff}.toolbar{display:none}.receipt{margin:0;width:210mm;min-height:297mm}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div><main class="receipt"><div class="top"><div class="brand"><h1>GLOBAL 3</h1><p>MEGA SERVICES SARL U — Reçu officiel d’abonnement</p></div><div class="badge">REÇU DE PAIEMENT</div></div><div class="title"><h2>Reçu abonnement</h2><p>Référence : <b>${ref}</b></p></div><div class="grid"><div class="box"><small>Entreprise</small><b>${esc(company.name||'')}</b></div><div class="box"><small>Responsable</small><b>${esc(company.owner||'')}</b></div><div class="box"><small>Plan payé</small><b>${plan}</b></div><div class="box"><small>Date du paiement</small><b>${esc(dt)}</b></div><div class="box"><small>Statut</small><b>${esc(p.status||'Payé')}</b></div><div class="box"><small>Moyen / observation</small><b>${esc(p.method||'-')}</b></div></div><div class="amount"><span>Montant reçu</span><b>${money(p.amount||0)}</b></div><div class="foot"><div class="sign">Signature client</div><div class="sign">Cachet / Signature GLOBAL 3</div></div><div class="wave"></div></main></body></html>`;
  const w=window.open('','_blank'); if(!w){alert('Autorisez les popups pour imprimer le reçu.');return;} w.document.open(); w.document.write(html); w.document.close(); setTimeout(()=>w.focus(),200);
}

function showSubscriptionPage(){
  const {d,user,company}=current(); if(!user||user.role!=='admin') return alert('Accès réservé à l’administrateur entreprise.');
  const users=(d.users||[]).filter(u=>u.companyId===company.id); const info=getSubscriptionInfo(company,users);
  const payments=(d.payments||[]).filter(p=>p.companyId===company.id);
  shell(`<section class="section active"><div class="g2panel subscriptionHero"><div><h2><span></span> Mon abonnement</h2><p class="sub">Espace client entreprise : suivi de l’abonnement, renouvellement, support et fonctionnalités actives.</p></div></div>${accountNav('subscription')}
  <div class="subscriptionGrid">
    <div class="subCard"><small>Type d’abonnement</small><b>${esc(planDef(company).label)}</b></div>
    <div class="subCard"><small>Statut</small><b>${esc(planStatusText(company))}</b></div>
    <div class="subCard"><small>Date d’activation</small><b>${esc(company.subscriptionStart||company.createdAt||'')}</b></div>
    <div class="subCard"><small>Date d’expiration</small><b>${esc(company.subscriptionEnd||'')}</b></div>
    <div class="subCard"><small>Nombre d’utilisateurs</small><b>${info.users}</b></div>
    <div class="subCard"><small>Durée restante</small><b>${info.left} jour(s)</b></div>
  </div>
  ${availableSubscriptionPlansHTML()}
  <div class="g2panel"><h3>Historique paiements</h3><table class="g2table"><tr><th>Date</th><th>Référence</th><th>Plan</th><th>Montant</th><th>Statut</th><th>Reçu</th></tr>${payments.map(p=>`<tr><td>${esc(p.date||'')}</td><td>${esc(p.ref||p.id||'')}</td><td>${esc(p.plan||company.plan||'')}</td><td>${money(p.amount||0)}</td><td>${esc(p.status||'Payé')}</td><td><button class="btn2" onclick="printPlanPaymentReceipt('${p.id}')">Tirer le reçu</button></td></tr>`).join('')||'<tr><td colspan="6">Aucun paiement enregistré pour le moment.</td></tr>'}</table></div>
  <div class="subscriptionActions subscriptionSupportOnly"><button class="supportContactBtn" onclick="openSupportWhatsApp()">Contacter le support</button></div></section>`,'account');
}


function marketplaceSourceItems(d,cid){return (d.items||[]).filter(i=>i.companyId===cid);}
function marketplaceVisibleItems(d,cid){return marketplaceSourceItems(d,cid).filter(i=>!i.marketplaceHidden);}
function syncMarketplaceValidatedOrdersToReport(d,cid){
  if(!d) return false;
  d.sales=Array.isArray(d.sales)?d.sales:[];
  d.orders=Array.isArray(d.orders)?d.orders:[];
  let changed=false;
  d.orders.filter(o=>o&&o.companyId===cid).forEach(o=>{
    const v=marketplaceValidationValue(o);
    const mustReport=(v==='Validée'||v==='Terminer') && !isMarketplaceOrderCancelled(o) && !o.marketplaceReportDeletedByUser;
    const ids=Array.isArray(o.reportSaleIds)?o.reportSaleIds:[];
    const hasReport=o.marketplaceReported && ids.length && ids.every(id=>d.sales.some(s=>s.id===id&&s.marketplaceOrderId===o.id));
    if(mustReport && !hasReport){
      removeMarketplaceOrderFromReport(d,o);
      addMarketplaceOrderToReport(d,o);
      changed=true;
    }
    if(!mustReport && d.sales.some(s=>s.marketplaceOrderId===o.id)){
      removeMarketplaceOrderFromReport(d,o);
      changed=true;
    }
  });
  return changed;
}
function getCompanyReportSales(sales){
  sales=Array.isArray(sales)?sales:[];
  // Ventes illimitées : le rapport reçoit toutes les ventes de tous les jours, mois et années.
  return sales.slice().sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
}
function periodFilterKey(scope){const {company}=current(); return 'GLOBAL3_PERIOD_FILTER_'+String(company?.id||'global')+'_'+String(scope||'report');}
function getPeriodFilter(scope){return G3_PERIOD_FILTERS[periodFilterKey(scope)]||{};}
function savePeriodFilter(scope,obj){G3_PERIOD_FILTERS[periodFilterKey(scope)]=Object.assign({},obj||{});}
function periodFilterRenderTarget(scope){
  if(scope==='contracts') return 'contrats';
  if(scope==='bilan') return 'bilan';
  return 'rapports';
}
function resetPeriodFilter(scope){delete G3_PERIOD_FILTERS[periodFilterKey(scope)]; const target=periodFilterRenderTarget(scope); target==='bilan'?showBilan():renderDash(target);}
function applyPeriodFilter(scope){
  const now=new Date();
  const type=document.getElementById(scope+'FilterType')?.value||'';
  let year=String(now.getFullYear()), month=String(now.getMonth()+1), day=String(now.getDate());
  if(type==='day'){
    year=document.getElementById(scope+'FilterYearDay')?.value||year;
    month=document.getElementById(scope+'FilterMonthDay')?.value||month;
    day=document.getElementById(scope+'FilterDayOnly')?.value||day;
  }else if(type==='month'){
    year=document.getElementById(scope+'FilterYearMonth')?.value||year;
    month=document.getElementById(scope+'FilterMonthOnly')?.value||month;
  }else if(type==='year'){
    year=document.getElementById(scope+'FilterYearOnly')?.value||year;
  }
  savePeriodFilter(scope,{type,year,month,day});
  const target=periodFilterRenderTarget(scope);
  target==='bilan'?showBilan():renderDash(target);
}
function updatePeriodFilterInputs(scope){
  const type=document.getElementById(scope+'FilterType')?.value||'';
  ['day','month','year'].forEach(k=>{
    const el=document.getElementById(scope+'FilterField_'+k);
    if(el) el.classList.toggle('active', k===type);
  });
  applyPeriodFilter(scope);
}
function filterSalesByPeriod(sales,scope){
  const f=getPeriodFilter(scope); const type=['day','month','year'].includes(f.type)?f.type:'';
  sales=Array.isArray(sales)?sales:[];
  if(!type) return sales;
  if(type==='day' && f.year && f.month && f.day){
    const key=f.year+'-'+String(f.month).padStart(2,'0')+'-'+String(f.day).padStart(2,'0');
    return sales.filter(s=>String(s.date||'').slice(0,10)===key);
  }
  if(type==='month' && f.year && f.month){
    const key=f.year+'-'+String(f.month).padStart(2,'0');
    return sales.filter(s=>String(s.date||'').slice(0,7)===key);
  }
  if(type==='year' && f.year) return sales.filter(s=>{const d=new Date(s.date); return !isNaN(d) && String(d.getFullYear())===String(f.year);});
  return sales;
}
function periodFilterLabel(scope){
  const f=getPeriodFilter(scope); const type=['day','month','year'].includes(f.type)?f.type:'';
  if(type==='day'&&f.year&&f.month&&f.day) return 'Jour sélectionné : '+f.year+'-'+String(f.month).padStart(2,'0')+'-'+String(f.day).padStart(2,'0');
  if(type==='month'&&f.year&&f.month) return 'Mois sélectionné : '+f.year+'-'+String(f.month).padStart(2,'0');
  if(type==='year'&&f.year) return 'Année sélectionnée : '+f.year;
  return 'Toutes les ventes jusqu’à ce jour';
}
function periodFilterControls(scope){
  const now=new Date();
  const allSales=(current()?.d?.sales||[]);
  const years=[...new Set(allSales.map(s=>{const d=new Date(s.date); return isNaN(d)?null:d.getFullYear()}).filter(Boolean))];
  if(!years.includes(now.getFullYear())) years.push(now.getFullYear());
  years.sort((a,b)=>b-a);
  const f=getPeriodFilter(scope); const type=['day','month','year'].includes(f.type)?f.type:'';
  const y=f.year||String(now.getFullYear());
  const m=f.month||String(now.getMonth()+1);
  const d=f.day||String(now.getDate());
  const yearOptions=years.map(v=>`<option value="${v}" ${String(v)===String(y)?'selected':''}>${v}</option>`).join('');
  const monthOptions=Array.from({length:12},(_,i)=>`<option value="${i+1}" ${String(i+1)===String(Number(m))?'selected':''}>${String(i+1).padStart(2,'0')}</option>`).join('');
  const dayOptions=Array.from({length:31},(_,i)=>`<option value="${i+1}" ${String(i+1)===String(Number(d))?'selected':''}>${String(i+1).padStart(2,'0')}</option>`).join('');
  return `<div class="periodFilterBox periodFilterPro no-print"><div><b>Choisir la période</b><span>Afficher les ventes correspondant à la période choisie</span></div><label>Type de filtre<select id="${scope}FilterType" onchange="updatePeriodFilterInputs('${scope}')"><option value="" ${!type?'selected':''}>Toutes les ventes</option><option value="day" ${type==='day'?'selected':''}>Vente du Jour</option><option value="month" ${type==='month'?'selected':''}>Vente du Mois</option><option value="year" ${type==='year'?'selected':''}>Vente de l’Année</option></select></label><div id="${scope}FilterField_day" class="periodChoiceGroup ${type==='day'?'active':''}"><label>Année<select id="${scope}FilterYearDay" onchange="applyPeriodFilter('${scope}')">${yearOptions}</select></label><label>Mois<select id="${scope}FilterMonthDay" onchange="applyPeriodFilter('${scope}')">${monthOptions}</select></label><label>Jour<select id="${scope}FilterDayOnly" onchange="applyPeriodFilter('${scope}')">${dayOptions}</select></label></div><div id="${scope}FilterField_month" class="periodChoiceGroup ${type==='month'?'active':''}"><label>Année<select id="${scope}FilterYearMonth" onchange="applyPeriodFilter('${scope}')">${yearOptions}</select></label><label>Mois<select id="${scope}FilterMonthOnly" onchange="applyPeriodFilter('${scope}')">${monthOptions}</select></label></div><div id="${scope}FilterField_year" class="periodChoiceGroup ${type==='year'?'active':''}"><label>Année<input id="${scope}FilterYearOnly" type="number" min="2000" max="2100" step="1" value="${esc(y)}" onchange="applyPeriodFilter('${scope}')" oninput="applyPeriodFilterDebounced('${scope}')"></label></div><button onclick="applyPeriodFilter('${scope}')">Afficher</button><button class="btn2" onclick="resetPeriodFilter('${scope}')">Tout afficher</button></div>`;
}
function applyPeriodFilterDebounced(scope){clearTimeout(window.__g3PeriodTimer); window.__g3PeriodTimer=setTimeout(()=>applyPeriodFilter(scope),350);}
function contractPeriodFilterKey(scope){const {company}=current(); return 'GLOBAL3_CONTRACT_PERIOD_FILTER_'+String(company?.id||'global')+'_'+String(scope||'contracts');}
function getContractPeriodFilter(scope){return G3_CONTRACT_PERIOD_FILTERS[contractPeriodFilterKey(scope)]||{};}
function saveContractPeriodFilter(scope,obj){G3_CONTRACT_PERIOD_FILTERS[contractPeriodFilterKey(scope)]=Object.assign({},obj||{});}
function resetContractPeriodFilter(scope){delete G3_CONTRACT_PERIOD_FILTERS[contractPeriodFilterKey(scope)]; renderDash('contrats')}
function updateContractPeriodInputs(scope){
  const type=document.getElementById(scope+'ContractFilterType')?.value||'';
  ['day','month','year'].forEach(k=>{const el=document.getElementById(scope+'ContractFilterField_'+k); if(el) el.classList.toggle('active', k===type);});
  applyContractPeriodFilter(scope);
}
function applyContractPeriodFilter(scope,fromChange=false){
  const now=new Date();
  const type=document.getElementById(scope+'ContractFilterType')?.value||'';
  let year=String(now.getFullYear()), month=String(now.getMonth()+1), day=String(now.getDate());
  if(type==='day'){
    year=document.getElementById(scope+'ContractFilterYearDay')?.value||year;
    month=document.getElementById(scope+'ContractFilterMonthDay')?.value||month;
    day=document.getElementById(scope+'ContractFilterDayOnly')?.value||day;
  }else if(type==='month'){
    year=document.getElementById(scope+'ContractFilterYearMonth')?.value||year;
    month=document.getElementById(scope+'ContractFilterMonthOnly')?.value||month;
  }else if(type==='year'){
    year=document.getElementById(scope+'ContractFilterYearOnly')?.value||year;
  }
  saveContractPeriodFilter(scope,{type,year,month,day});
  if(!fromChange) renderDash('contrats')
}
function applyContractPeriodFilterDebounced(scope){clearTimeout(window.__g3ContractPeriodTimer); window.__g3ContractPeriodTimer=setTimeout(()=>applyContractPeriodFilter(scope),350);}
function contractPeriodFilterLabel(scope){const f=getContractPeriodFilter(scope); if(f.type==='day'&&f.year&&f.month&&f.day) return 'Jour sélectionné : '+f.year+'-'+String(f.month).padStart(2,'0')+'-'+String(f.day).padStart(2,'0'); if(f.type==='month'&&f.year&&f.month) return 'Mois sélectionné : '+f.year+'-'+String(f.month).padStart(2,'0'); if(f.type==='year'&&f.year) return 'Année sélectionnée : '+f.year; return 'Toutes les consommations jusqu’à ce jour';}
function filterContractSalesByPeriod(sales,scope){const f=getContractPeriodFilter(scope); const rows=(Array.isArray(sales)?sales:[]).filter(s=>s.clientType==='contrat'); if(!f.type) return rows; if(f.type==='day'&&f.year&&f.month&&f.day){const key=f.year+'-'+String(f.month).padStart(2,'0')+'-'+String(f.day).padStart(2,'0'); return rows.filter(s=>String(s.date||'').slice(0,10)===key)} if(f.type==='month'&&f.year&&f.month){const key=f.year+'-'+String(f.month).padStart(2,'0'); return rows.filter(s=>String(s.date||'').slice(0,7)===key)} if(f.type==='year'&&f.year){return rows.filter(s=>{const d=new Date(s.date); return !isNaN(d)&&String(d.getFullYear())===String(f.year)})} return rows;}
function contractPeriodFilterControls(allSales,scope){const now=new Date(); const years=[...new Set((allSales||[]).map(s=>{const d=new Date(s.date); return isNaN(d)?null:d.getFullYear()}).filter(Boolean))]; if(!years.includes(now.getFullYear())) years.push(now.getFullYear()); years.sort((a,b)=>b-a); const f=getContractPeriodFilter(scope); const type=f.type||''; const y=f.year||String(now.getFullYear()); const m=f.month||String(now.getMonth()+1); const d=f.day||String(now.getDate()); const yearOptions=years.map(v=>`<option value="${v}" ${String(v)===String(y)?'selected':''}>${v}</option>`).join(''); const monthOptions=Array.from({length:12},(_,i)=>`<option value="${i+1}" ${String(i+1)===String(Number(m))?'selected':''}>${String(i+1).padStart(2,'0')}</option>`).join(''); const dayOptions=Array.from({length:31},(_,i)=>`<option value="${i+1}" ${String(i+1)===String(Number(d))?'selected':''}>${String(i+1).padStart(2,'0')}</option>`).join(''); return `<div class="contractPeriodFilter no-print"><div class="contractPeriodTitle"><b>Choisir la période</b><span>Filtrer les consommations des clients sous contrat</span></div><label>Type de filtre<select id="${scope}ContractFilterType" onchange="updateContractPeriodInputs('${scope}')"><option value="" ${!type?'selected':''}>Toutes les ventes</option><option value="day" ${type==='day'?'selected':''}>Vente du Jour</option><option value="month" ${type==='month'?'selected':''}>Vente du Mois</option><option value="year" ${type==='year'?'selected':''}>Vente de l’Année</option></select></label><div id="${scope}ContractFilterField_day" class="contractPeriodGroup ${type==='day'?'active':''}"><label>Année<select id="${scope}ContractFilterYearDay" onchange="applyContractPeriodFilter('${scope}')">${yearOptions}</select></label><label>Mois<select id="${scope}ContractFilterMonthDay" onchange="applyContractPeriodFilter('${scope}')">${monthOptions}</select></label><label>Jour<select id="${scope}ContractFilterDayOnly" onchange="applyContractPeriodFilter('${scope}')">${dayOptions}</select></label></div><div id="${scope}ContractFilterField_month" class="contractPeriodGroup ${type==='month'?'active':''}"><label>Année<select id="${scope}ContractFilterYearMonth" onchange="applyContractPeriodFilter('${scope}')">${yearOptions}</select></label><label>Mois<select id="${scope}ContractFilterMonthOnly" onchange="applyContractPeriodFilter('${scope}')">${monthOptions}</select></label></div><div id="${scope}ContractFilterField_year" class="contractPeriodGroup ${type==='year'?'active':''}"><label>Année<input id="${scope}ContractFilterYearOnly" type="number" min="2000" max="2100" step="1" value="${esc(y)}" onchange="applyContractPeriodFilter('${scope}')" oninput="applyContractPeriodFilterDebounced('${scope}')"></label></div><button onclick="applyContractPeriodFilter('${scope}')">Afficher</button><button class="btn2" onclick="resetContractPeriodFilter('${scope}')">Tout afficher</button></div>`;}
function showMarketplacePage(){if(isCaisse()) return alert('Accès interdit : la caisse ne peut pas administrer la marketplace.');
  const {d,user,company}=current();
  if(!user) return renderLogin();
  if(!assertPlanFeature(company,'marketplace','Marketplace et boutique publique réservées au plan BUSINESS PLUS.')) return renderDash('home');
  const cid=company.id;
  d.orders=d.orders||[]; save(d);
  const items=marketplaceSourceItems(d,cid);
  const visible=marketplaceVisibleItems(d,cid);
  const hidden=items.filter(i=>i.marketplaceHidden);
  const products=visible.filter(i=>isBoutiqueItem(i));
  const orders=d.orders.filter(o=>o.companyId===cid&&!o.adminDeleted).slice().reverse();
  const recentItems=visible.slice().reverse().slice(0,8);
  const totalStock=products.reduce((a,b)=>a+(b.stockType==='unlimited'?0:Number(b.stock||0)),0);
  const caOrders=orders.reduce((a,b)=>a+Number(b.total||0),0);
  const active=window.marketplaceAdminSection||'stock';
  const pageTitle=active==='preview'?'Aperçu boutique client':(active==='stock'?'Produits / services du stock général':(active==='recent'?'Produits récents':'Commandes récentes'));
  let pageHtml='';
  if(active==='stock'){
    pageHtml=`<div class="mkPanel mkAdminSinglePage" id="marketFormPanel">
      <h2>Produits / services du stock général</h2>
      <p class="sub">Choisissez ce que le client peut voir dans la boutique publique. Masqué = invisible côté client.</p>
      <div class="mkCatalogTop"><input class="marketSearch" id="marketSearchAdmin" placeholder="Rechercher dans le stock général..." oninput="filterMarketAdminRows()"><select id="marketVisibilityFilter" onchange="filterMarketAdminRows()"><option value="">Tous</option><option value="visible">Visibles</option><option value="hidden">Masqués</option></select></div>
      <div class="marketStockRows">${items.map(i=>marketAdminRow(i)).join('')||'<p class="notice">Aucun produit ou service enregistré. Ajoutez d’abord vos articles dans la section Stocks.</p>'}</div>
    </div>`;
  }else if(active==='preview'){
    pageHtml=`<div class="mkPanel mkAdminSinglePage mkCatalogPanel">
      <div class="mkCatalogTop"><h2>Aperçu boutique client</h2><input class="marketSearch" id="marketSearch" placeholder="Rechercher un produit visible..." oninput="filterMarketCards()"><select><option>Plus récents</option><option>Prix croissant</option><option>En ligne</option></select></div>
      <div class="marketCatalog mkCatalogCards">${visible.map(i=>marketItemCard(i)).join('')||'<p class="notice">Aucun article visible dans la boutique client.</p>'}</div>
    </div>`;
  }else if(active==='recent'){
    pageHtml=`<div class="mkPanel mkAdminSinglePage">
      <div class="mkPanelHead"><h2>Produits récents</h2><a onclick="showMarketplaceAdminPage('stock')">Voir le stock général</a></div>
      <div class="mkRecentList mkRecentPageList">${recentItems.map(i=>marketRecentRow(i)).join('')||'<p class="notice">Aucun article visible. Rendez visibles les éléments du stock général.</p>'}</div>
    </div>`;
  }else{
    pageHtml=`<div class="mkPanel mkAdminSinglePage mkOrdersPanel">
      <div class="mkPanelHead"><h2>Commandes récentes</h2><a onclick="showMarketplaceAdminPage('stock')">Retour stock</a></div>
      <table class="mkOrdersTable"><tr><th>N° COMMANDE</th><th>CLIENT</th><th>ARTICLES</th><th>MONTANT</th><th>STATUT</th><th>DATE</th><th>ACTION</th></tr>${orders.map(o=>`<tr><td><button class="orderLinkBtn" onclick="openMarketplaceOrderPopup('${esc(o.id||'CMD')}',true)">#${esc(o.id||'CMD')}</button></td><td>${esc(o.client||'Client')}</td><td>${orderItemsCount(o)} article(s)</td><td>${money(orderTotal(o))}</td><td><span class="mkStatus">${esc(orderMainStatus(o))}</span></td><td>${new Date(o.date).toLocaleDateString('fr-FR')}</td><td><button class="danger smallDeleteOrder" onclick="deleteMarketplaceOrder('${esc(o.id||'CMD')}',true)">Supprimer</button></td></tr>`).join('')||'<tr><td colspan="7">Aucune commande récente.</td></tr>'}</table>
    </div>`;
  }
  shell(`<section class="section active marketplacePage marketplaceClean">
    <div class="mkTopHero compactMarketHeader mkHeaderSimple">
      <div class="mkBrandBlock">
        <div class="mkLogoRound">G3</div>
        <div><h1>Marketplace</h1></div>
      </div>
      <div class="mkHeroBtns mkHeroBtnsHorizontal"><button onclick="openPublicShop()">Voir boutique publique</button><button class="payConfigBtn" onclick="openMarketplacePaymentConfig()">Configurer paiement</button><button class="clientReportBtn" onclick="openMarketplaceClientsReport()">Mes clients enregistrés</button><button class="darkBtn" onclick="shareText('${marketplaceUrl(company)}')">Partager le lien</button></div>
    </div>

    <div class="mkStatsRow">
      <div><i>👁</i><small>Vues boutique</small><b>2 458</b><span>+18% ce mois</span></div>
      <div><i>📦</i><small>Articles visibles</small><b>${visible.length}</b><span>Masqués : ${hidden.length}</span></div>
      <div><i>🛒</i><small>Commandes</small><b>${orders.length}</b><span>+${Math.min(12,orders.length)} ce mois</span></div>
      <div><i>💼</i><small>Chiffre d’affaires</small><b>${money(caOrders)}</b><span>Marketplace</span></div>
      <div><i>⭐</i><small>Avis clients</small><b>4.8/5</b><span>★★★★★</span></div>
      <div><i>🧺</i><small>Stock général visible</small><b>${totalStock}</b><span>produits</span></div>
    </div>

    <div class="mkSectionButtons mkSectionButtonsFour">
      <button class="${active==='preview'?'active':''}" onclick="showMarketplaceAdminPage('preview')">Aperçu boutique client</button>
      <button class="${active==='stock'?'active':''}" onclick="showMarketplaceAdminPage('stock')">Produits / services du stock général</button>
      <button class="${active==='recent'?'active':''}" onclick="showMarketplaceAdminPage('recent')">Produits récents</button>
      <button class="${active==='orders'?'active':''}" onclick="showMarketplaceAdminPage('orders')">Commandes récentes</button>
    </div>

    <div class="mkPageTitle"><h2>${pageTitle}</h2></div>
    <div class="mkSinglePageWrap">${pageHtml}</div>
  </section>`,'marketplace');
}
function showMarketplaceAdminPage(type){window.marketplaceAdminSection=type||'stock'; showMarketplacePage();}
function mkProductVisual(i){if(i&&i.photo){return `<img src="${esc(i.photo)}" alt="${esc(i.name||'Article')}" class="mkProductPhoto">`;} const n=(i.name||'').toLowerCase(); if(n.includes('imprim')) return '🖨️'; if(n.includes('souris')) return '🖱️'; if(n.includes('clé')||n.includes('usb')) return '💾'; if(n.includes('casque')||n.includes('audio')) return '🎧'; if(n.includes('montre')) return '⌚'; if(n.includes('phone')||n.includes('portable')||n.includes('laptop')||n.includes('ordinateur')) return '💻'; if(!isBoutiqueItem(i)) return '🛠️'; return '📦'}
function itemMarketPrice(i){return Number(i.sell||i.price||0)}
function marketStockLabel(i){return isBoutiqueItem(i)?(i.stockType==='unlimited'?'Stock illimité':'Stock : '+Number(i.stock||0)):'Service disponible'}
function marketRecentRow(i){const rupture=(isBoutiqueItem(i)&&i.stockType!=='unlimited'&&Number(i.stock||0)<=0); return `<div class="mkRecentRow"><div class="mkThumb">${mkProductVisual(i)}</div><div><b>${esc(i.name)}</b><small>${esc(i.cat||'Sans catégorie')}</small></div><strong>${money(itemMarketPrice(i))}<small>${marketStockLabel(i)}</small></strong><span class="${rupture?'mkRupture':'mkOnline'}">${rupture?'RUPTURE':'VISIBLE'}</span><button class="miniBtn" onclick="toggleMarketplaceVisibility('${i.id}')">${i.marketplaceHidden?'👁':'🚫'}</button></div>`}
function marketItemCard(i){const rupture=(isBoutiqueItem(i)&&i.stockType!=='unlimited'&&Number(i.stock||0)<=0); return `<div class="marketCard mkProductCard" data-search="${esc((i.name+' '+i.cat+' '+i.type+' '+(i.marketplacePromo||'')+' '+(i.marketplaceDesc||i.detail||'')).toLowerCase())}">${i.marketplacePromo?`<div class="mkPromoBadge">${esc(i.marketplacePromo)}</div>`:''}<div class="mkProductImg">${mkProductVisual(i)}</div><h3>${esc(i.name)}</h3><p>${esc(i.cat||'Sans catégorie')}</p><em class="mkCardDesc">${esc(i.marketplaceDesc||i.detail||'')}</em><div class="mkStars">★ 4.8 <small>(20)</small></div><b>${money(itemMarketPrice(i))}</b><small>${marketStockLabel(i)}</small><span class="${rupture?'mkRupture':'mkOnline'}">${rupture?'RUPTURE':'VISIBLE CLIENT'}</span><div class="marketCardActions"><button onclick="fakeCustomerOrder('${i.id}')">🛒</button><button class="btn2" onclick="toggleMarketplaceVisibility('${i.id}')">Masquer</button></div></div>`}
function marketAdminRow(i){const hidden=!!i.marketplaceHidden; const rupture=(isBoutiqueItem(i)&&i.stockType!=='unlimited'&&Number(i.stock||0)<=0); return `<div class="mkRecentRow marketAdminRow" data-hidden="${hidden?'hidden':'visible'}" data-search="${esc((i.name+' '+i.cat+' '+i.code+' '+i.type+' '+(i.marketplaceDesc||i.detail||'')).toLowerCase())}"><div class="mkThumb">${mkProductVisual(i)}</div><div><b>${esc(i.name)}</b><small>${esc(i.code||'')} • ${esc(i.cat||'Sans catégorie')} • ${isBoutiqueItem(i)?'Produit':'Service'}</small></div><strong>${money(itemMarketPrice(i))}<small>${marketStockLabel(i)}</small></strong><span class="${hidden?'mkRupture':(rupture?'mkRupture':'mkOnline')}">${hidden?'MASQUÉ':(rupture?'RUPTURE':'VISIBLE')}</span><button class="miniBtn" onclick="toggleMarketplaceVisibility('${i.id}')">${hidden?'Afficher':'Masquer'}</button><button class="miniBtn" onclick="editMarketplaceInfo('${i.id}')">Promo</button></div>`}
function filterMarketAdminRows(){const q=($('#marketSearchAdmin')?.value||'').toLowerCase(); const f=$('#marketVisibilityFilter')?.value||''; document.querySelectorAll('.marketAdminRow').forEach(r=>{const okSearch=r.dataset.search.includes(q); const okFilter=!f||r.dataset.hidden===f; r.style.display=(okSearch&&okFilter)?'flex':'none';});}
function toggleMarketplaceVisibility(iid){const {d,company}=current(); const it=(d.items||[]).find(i=>i.id===iid&&i.companyId===company.id); if(!it) return; it.marketplaceHidden=!it.marketplaceHidden; save(d); showMarketplacePage();}
function editMarketplaceInfo(iid){const {d,company}=current(); const it=(d.items||[]).find(i=>i.id===iid&&i.companyId===company.id); if(!it) return; it.marketplacePromo=prompt('Badge / promotion visible en boutique client :',it.marketplacePromo||'')||''; it.marketplaceDesc=prompt('Description courte visible en boutique client :',it.marketplaceDesc||it.detail||'')||''; save(d); showMarketplacePage();}

function marketplaceOrderBenefit(d,o){
  return normalizeOrderItems(o).reduce((sum,line)=>{
    const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===o.companyId);
    const total=Number(line.total||0); const qty=Number(line.qty||1);
    const product=isBoutiqueItem(it||{type:line.type});
    const charges=product?Number(it?.buy||0)*qty:total*(Number(it?.charge||0)/100);
    return sum+(total-charges);
  },0);
}
function openMarketplaceClientsReport(){
  const {d,company}=current(); const cid=company.id;
  const clients=(d.marketClients||[]).filter(c=>c.companyId===cid);
  const allOrders=(d.orders||[]).filter(o=>o.companyId===cid&&!o.adminDeleted);
  const orders=allOrders.filter(o=>!isMarketplaceOrderCancelled(o));
  const stats=clients.map(c=>{
    const os=orders.filter(o=>o.clientId===c.id);
    const ca=os.reduce((a,o)=>a+orderTotal(o),0);
    const benef=os.reduce((a,o)=>a+marketplaceOrderBenefit(d,o),0);
    const articles=os.reduce((a,o)=>a+orderItemsCount(o),0);
    const last=os[0]?.date?new Date(os.sort((a,b)=>new Date(b.date)-new Date(a.date))[0].date).toLocaleDateString('fr-FR'):'-';
    return {c,os,ca,benef,articles,last};
  }).sort((a,b)=>b.ca-a.ca);
  const totalCa=stats.reduce((a,x)=>a+x.ca,0), totalBenef=stats.reduce((a,x)=>a+x.benef,0), totalOrders=orders.length;
  const rows=stats.map((x,i)=>`<tr class="clientReportRow rank${i<3?i+1:'Other'}"><td>${i+1}</td><td><b>${esc(x.c.name)}</b><small>${esc(x.c.phone||'')} ${x.c.email?'— '+esc(x.c.email):''}</small></td><td>${new Date(x.c.createdAt||Date.now()).toLocaleDateString('fr-FR')}</td><td>${x.os.length}</td><td>${x.articles}</td><td>${money(x.ca)}</td><td>${money(x.benef)}</td><td>${x.last}</td><td><button class="btn2" onclick="openClientPurchaseDetails('${esc(x.c.id)}')">Détails achats</button></td></tr>`).join('')||'<tr><td colspan="9">Aucun client enregistré.</td></tr>';
  const html=`<div class="marketPayModalBackdrop" id="marketClientsReportModal"><div class="marketPayModal clientsReportBox"><button class="marketPayClose" onclick="document.getElementById('marketClientsReportModal')?.remove()">×</button><h2>Rapport général des clients et leurs achats</h2><div class="clientReportStats"><div><small>Clients</small><b>${clients.length}</b></div><div><small>Commandes</small><b>${totalOrders}</b></div><div><small>Chiffre d’affaires</small><b>${money(totalCa)}</b></div><div><small>Bénéfice estimé</small><b>${money(totalBenef)}</b></div></div><p class="sub">Classement automatique par chiffre d’affaires client. Les commandes annulées ne sont pas comptées dans les totaux.</p><div class="clientOrdersScroll"><table class="mkOrdersTable clientReportTable"><tr><th>Rang</th><th>Client</th><th>Inscription</th><th>Lots</th><th>Articles</th><th>Chiffre d’affaires</th><th>Bénéfice estimé</th><th>Dernier achat</th><th>Détail</th></tr>${rows}</table></div><div class="marketPayActions"><button onclick="printMarketplaceClientsReportOnly()">Imprimer</button><button class="btn2" onclick="document.getElementById('marketClientsReportModal')?.remove()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function printMarketplaceClientsReportOnly(){
  const modal=document.getElementById('marketClientsReportModal');
  const table=modal?.querySelector('.clientReportTable');
  if(!table) return alert('Aucune liste de clients à imprimer.');
  const cleanTable=table.cloneNode(true);
  cleanTable.querySelectorAll('tr').forEach(tr=>{
    const cells=tr.children;
    if(cells.length){ cells[cells.length-1].remove(); }
  });
  const {company}=current();
  const now=new Date().toLocaleString('fr-FR');
  const w=window.open('','_blank');
  if(!w) return alert('Autorisez les fenêtres popup pour imprimer.');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Liste des clients enregistrés</title><style>
    @page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#fff;color:#0f172a}.toolbar{position:fixed;top:10px;right:10px;display:flex;gap:8px}.toolbar button{border:0;border-radius:10px;padding:10px 14px;font-weight:900;cursor:pointer;background:#0f766e;color:#fff}.page{padding:12mm}h1{text-align:center;margin:0;color:#0f766e;font-size:24px;text-transform:uppercase}h2{text-align:center;margin:6px 0 16px;font-size:15px;color:#334155}.meta{display:flex;justify-content:space-between;margin:0 0 12px;font-size:12px;color:#475569}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11px}th{background:#0f766e;color:#fff;padding:8px;border:1px solid #0b5f59;text-align:center}td{padding:8px;border:1px solid #cbd5e1;text-align:center;word-break:break-word;color:#111827!important;font-weight:700}td:nth-child(2),th:nth-child(2){text-align:left;width:22%}tr:nth-child(even) td{background:#eef2ff!important}tr:nth-child(odd) td{background:#ecfdf5!important}small{display:block;color:#334155!important;font-weight:700;margin-top:3px}@media print{.toolbar{display:none}.page{padding:0}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Imprimer</button><button onclick="window.close()">Fermer</button></div><main class="page"><h1>Rapport général des clients et leurs achats</h1><h2>Liste des clients enregistrés seulement</h2><div class="meta"><b>${esc(company.name||'GLOBAL 3')}</b><span>Date d’impression : ${now}</span></div>${cleanTable.outerHTML}</main></body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),300);
}

function openClientPurchaseDetails(clientId){
  const {d,company}=current(); const client=(d.marketClients||[]).find(c=>c.id===clientId&&c.companyId===company.id); if(!client) return;
  const orders=(d.orders||[]).filter(o=>o.companyId===company.id&&o.clientId===clientId).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const rows=orders.map(o=>`<tr class="${isMarketplaceOrderCancelled(o)?'cancelledOrderLine':'activeOrderLine'}"><td><button class="orderLinkBtn" onclick="openMarketplaceOrderPopup('${esc(o.id)}',true)">#${esc(o.id)}</button></td><td>${new Date(o.date).toLocaleString('fr-FR')}</td><td>${orderItemsCount(o)} article(s)</td><td>${money(orderTotal(o))}</td><td>${isMarketplaceOrderCancelled(o)?'Non compté':money(marketplaceOrderBenefit(d,o))}</td><td>${esc(o.paymentMethod||'-')}</td><td><span class="${isMarketplaceOrderCancelled(o)?'cancelledBadge':'activeBadge'}">${esc(orderMainStatus(o))}</span></td></tr>`).join('')||'<tr><td colspan="7">Aucun achat.</td></tr>';
  const html=`<div class="marketPayModalBackdrop" id="clientPurchaseDetailsModal"><div class="marketPayModal clientPurchaseDetailsBox"><button class="marketPayClose" onclick="document.getElementById('clientPurchaseDetailsModal')?.remove()">×</button><h2>Détails achats client</h2><p><b>${esc(client.name)}</b><br>Téléphone : ${esc(client.phone||'-')}<br>Email : ${esc(client.email||'-')}</p><div class="clientOrdersScroll"><table class="mkOrdersTable"><tr><th>N° commande</th><th>Date</th><th>Articles</th><th>Montant</th><th>Bénéfice</th><th>Paiement</th><th>Statut</th></tr>${rows}</table></div><div class="marketPayActions"><button class="btn2" onclick="document.getElementById('clientPurchaseDetailsModal')?.remove()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function openMarketplacePaymentConfig(){
  const {company}=current();
  const wave=company.marketWaveBusinessLink||'';
  const usdt=company.marketUsdtTrc20||'';
  const html=`<div class="marketPayModalBackdrop" id="marketPayModal"><div class="marketPayModal"><button class="marketPayClose" onclick="closeMarketplacePaymentConfig()">×</button><h2>Configurer paiement Marketplace</h2><p>Ces informations seront utilisées côté boutique client pour faciliter le paiement des commandes.</p><label>Lien Wave Business<input id="marketWaveBusinessLink" placeholder="Ex : lien Wave Business" value="${esc(wave)}"></label><small>Le montant de la commande sera ajouté automatiquement au lien pour afficher le QR code de paiement au client.</small><label>Adresse USDT TRC20<input id="marketUsdtTrc20" placeholder="Adresse USDT TRC20" value="${esc(usdt)}"></label><div class="marketPayActions"><button onclick="saveMarketplacePaymentConfig()">Enregistrer</button><button class="btn2" onclick="closeMarketplacePaymentConfig()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
function closeMarketplacePaymentConfig(){document.getElementById('marketPayModal')?.remove();}
function saveMarketplacePaymentConfig(){
  const {d,company}=current();
  const c=(d.companies||[]).find(x=>x.id===company.id);
  if(!c) return;
  c.marketWaveBusinessLink=($('#marketWaveBusinessLink')?.value||'').trim();
  c.marketUsdtTrc20=($('#marketUsdtTrc20')?.value||'').trim();
  save(d); closeMarketplacePaymentConfig(); alert('Paramètres de paiement Marketplace enregistrés.'); showMarketplacePage();
}
function buildWavePaymentLink(link,amount){
  link=(link||'').trim(); amount=Number(amount||0);
  if(!link) return '';
  if(link.includes('{amount}')) return link.replaceAll('{amount}',String(amount));
  if(link.includes('MONTANT')) return link.replaceAll('MONTANT',String(amount));
  const sep=link.includes('?')?'&':'?';
  return link+sep+'amount='+encodeURIComponent(String(amount));
}
function getPublicClient(companyId){
  const cid=window.publicShopClientId||'';
  if(!cid) return null;
  const d=seed();
  return (d.marketClients||[]).find(c=>c.id===cid&&c.companyId===companyId)||null;
}

function getPublicCart(companyId){
  window.publicShopCart=window.publicShopCart||{};
  window.publicShopCart[companyId]=window.publicShopCart[companyId]||[];
  return window.publicShopCart[companyId];
}
function publicCartCount(companyId){return getPublicCart(companyId).reduce((a,x)=>a+Number(x.qty||0),0)}
function showPublicToast(msg){
  document.querySelector('.publicToast')?.remove();
  const div=document.createElement('div');
  div.className='publicToast';
  div.textContent=msg;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),2000);
}
function addToPublicCart(companyId,itemId){
  if(!getPublicClient(companyId)){ alert('Veuillez vous inscrire ou vous connecter avant d’ajouter au panier.'); openClientRegisterPopup(companyId); return; }
  const d=seed(); const it=(d.items||[]).find(x=>x.id===itemId&&x.companyId===companyId&&!x.marketplaceHidden);
  if(!it) return alert('Article introuvable.');
  const qty=isBoutiqueItem(it)?Math.max(1,Number(prompt('Quantité à ajouter au panier :','1')||1)):1;
  const cart=getPublicCart(companyId); const line=cart.find(x=>x.itemId===itemId);
  if(line) line.qty=Number(line.qty||0)+qty; else cart.push({itemId,qty});
  refreshPublicCartBadge(companyId);
  showPublicToast('Commande ajouter au panier');
}
function refreshPublicCartBadge(companyId){const b=document.getElementById('publicCartBadge'); if(b) b.textContent=publicCartCount(companyId);}
function openPublicCart(companyId){
  if(!getPublicClient(companyId)){ alert('Veuillez vous inscrire ou vous connecter pour voir votre panier.'); openClientRegisterPopup(companyId); return; }
  document.getElementById('publicCartModal')?.remove();
  const d=seed(); const c=(d.companies||[]).find(x=>x.id===companyId); const cart=getPublicCart(companyId);
  const rows=cart.map((line,idx)=>{const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===companyId); if(!it) return ''; const price=itemMarketPrice(it), total=price*Number(line.qty||1); return `<tr><td>${idx+1}</td><td>${esc(it.name)}</td><td>${esc(it.cat||'-')}</td><td><input class="cartQtyInput" type="number" min="1" value="${Number(line.qty||1)}" onchange="updatePublicCartQty('${companyId}','${line.itemId}',this.value)"></td><td>${money(price)}</td><td><b>${money(total)}</b></td><td><button class="miniDanger" onclick="removePublicCartItem('${companyId}','${line.itemId}')">Retirer</button></td></tr>`}).join('');
  const total=cart.reduce((sum,line)=>{const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===companyId); return sum+(it?itemMarketPrice(it)*Number(line.qty||1):0)},0);
  const html=`<div class="marketPayModalBackdrop" id="publicCartModal"><div class="marketPayModal publicCartBox"><button class="marketPayClose" onclick="document.getElementById('publicCartModal')?.remove()">×</button><h2>Mon panier</h2><p class="sub">Vérifiez vos produits/services avant le paiement.</p><div class="clientOrdersScroll"><table class="mkOrdersTable"><tr><th>N°</th><th>Produit / Service</th><th>Catégorie</th><th>Qté</th><th>Prix</th><th>Total</th><th>Action</th></tr>${rows||'<tr><td colspan="7">Panier vide.</td></tr>'}</table></div><div class="publicCartTotal">Total panier : <b>${money(total)}</b></div><div class="paymentChoiceBtns"><button onclick="payPublicCart('${companyId}','WAVE')">Paiement Wave</button><button class="btn2" onclick="payPublicCart('${companyId}','USDT TRC20')">Paiement USDT TRC20</button></div><div id="publicCartPayBox" class="publicPaymentChoiceBox"><p class="notice">Choisissez un moyen de paiement pour afficher le QR Code du panier.</p></div><div class="marketPayActions"><button onclick="document.getElementById('publicCartModal')?.remove()">Continuer mes achats</button><button class="btn2" onclick="getPublicCart('${companyId}').length=0;openPublicCart('${companyId}');refreshPublicCartBadge('${companyId}')">Vider le panier</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
function updatePublicCartQty(companyId,itemId,qty){const cart=getPublicCart(companyId); const line=cart.find(x=>x.itemId===itemId); if(line) line.qty=Math.max(1,Number(qty||1)); openPublicCart(companyId); refreshPublicCartBadge(companyId);}
function removePublicCartItem(companyId,itemId){const cart=getPublicCart(companyId); const i=cart.findIndex(x=>x.itemId===itemId); if(i>=0) cart.splice(i,1); openPublicCart(companyId); refreshPublicCartBadge(companyId);}
function publicCartTotal(companyId){
  const d=seed(); const cart=getPublicCart(companyId);
  return cart.reduce((sum,line)=>{const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===companyId); return sum+(it?itemMarketPrice(it)*Number(line.qty||1):0)},0);
}
function fcfaToUsdt(total){return (Number(total||0)/600).toFixed(2);}
function payPublicCart(companyId,method){
  const d=seed(); const c=(d.companies||[]).find(x=>x.id===companyId); const client=getPublicClient(companyId); const cart=getPublicCart(companyId);
  if(!client) return openClientRegisterPopup(companyId); if(!cart.length) return alert('Panier vide.');
  const total=publicCartTotal(companyId);
  let content='';
  if(method==='WAVE'){
    const waveLink=buildWavePaymentLink(c?.marketWaveBusinessLink,total); const qr=waveLink?'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(waveLink):'';
    content=waveLink?`<div class="payQrBox"><img src="${qr}" alt="QR Code Wave"><a href="${esc(waveLink)}" target="_blank">Payer avec Wave</a><p>Montant à payer : <b>${money(total)}</b></p></div>`:'<p class="notice">Lien Wave Business non configuré par le vendeur.</p>';
  }else{
    const usd=fcfaToUsdt(total);
    const payload=`USDT TRC20\nAdresse: ${c?.marketUsdtTrc20||''}\nMontant: ${usd} USD`; const qr=c?.marketUsdtTrc20?'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(payload):'';
    content=c?.marketUsdtTrc20?`<div class="payQrBox"><img src="${qr}" alt="QR Code USDT TRC20"><div class="usdtBox"><small>Adresse USDT TRC20</small><b>${esc(c.marketUsdtTrc20)}</b><small>Montant à payer : ${usd} $</small></div></div>`:'<p class="notice">Adresse USDT TRC20 non configurée par le vendeur.</p>';
  }
  const proof=`<div class="paymentProofBox"><h3>Preuve de paiement</h3><label>Type de preuve<select id="payProofType" class="proofSelect" onchange="togglePublicProofFields()"><option value="ref">Référence de paiement</option><option value="capture">Capture d’écran</option></select></label><div id="proofRefBox"><label>Référence de paiement<input id="publicPayRef" placeholder="Inscrire la référence"></label></div><div id="proofCaptureBox" style="display:none"><label>Ajouter capture<input id="publicPayCapture" type="file" accept="image/*"></label></div><button class="paidBtn" onclick="finalizePublicCartPayment('${companyId}','${method}')">J’ai payé</button></div>`;
  const box=document.getElementById('publicCartPayBox'); if(box) box.innerHTML=content+proof;
}
function togglePublicProofFields(){
  const type=document.getElementById('payProofType')?.value||'ref';
  const ref=document.getElementById('proofRefBox'), cap=document.getElementById('proofCaptureBox');
  if(ref) ref.style.display=type==='ref'?'block':'none';
  if(cap) cap.style.display=type==='capture'?'block':'none';
}
function readPaymentCaptureAsDataUrl(file){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve('');
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result||'');
    reader.onerror=()=>reject(reader.error||new Error('Lecture capture impossible'));
    reader.readAsDataURL(file);
  });
}
async function finalizePublicCartPayment(companyId,method){
  const d=seed(); const client=getPublicClient(companyId); const cart=getPublicCart(companyId);
  if(!client) return openClientRegisterPopup(companyId); if(!cart.length) return alert('Panier vide.');
  const proofType=document.getElementById('payProofType')?.value||'ref';
  const ref=($('#publicPayRef')?.value||'').trim(); const file=$('#publicPayCapture')?.files?.[0];
  if(proofType==='ref'&&!ref) return alert('Veuillez inscrire la référence de paiement.');
  if(proofType==='capture'&&!file) return alert('Veuillez ajouter la capture d’écran du paiement.');
  let captureData='';
  if(proofType==='capture'){
    try{captureData=await readPaymentCaptureAsDataUrl(file);}catch(e){return alert('Impossible de charger la capture de paiement.');}
  }
  d.orders=d.orders||[];
  const orderItems=[];
  for(const line of [...cart]){
    const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===companyId&&!x.marketplaceHidden); if(!it) continue;
    const qty=Number(line.qty||1); if(isBoutiqueItem(it)&&it.stockType!=='unlimited'&&Number(it.stock||0)<qty){ alert('Stock insuffisant pour : '+it.name); return; }
  }
  for(const line of [...cart]){
    const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===companyId&&!x.marketplaceHidden); if(!it) continue;
    const qty=Number(line.qty||1); if(isBoutiqueItem(it)&&it.stockType!=='unlimited') it.stock=Number(it.stock||0)-qty;
    const unit=itemMarketPrice(it); const amount=unit*qty;
    orderItems.push({itemId:it.id,item:it.name,category:it.cat||'',type:isBoutiqueItem(it)?'Produit':'Service',qty,unit,total:amount});
  }
  const total=orderItems.reduce((a,x)=>a+Number(x.total||0),0); const oid=id('cmd');
  d.orders.push({
    id:oid, companyId, clientId:client.id, client:client.name, clientPhone:client.phone, date:new Date().toISOString(),
    items:orderItems, item:orderItems.map(x=>x.item).join(', '), qty:orderItems.reduce((a,x)=>a+Number(x.qty||0),0), total,
    paymentMethod:method, paymentCurrency:method==='WAVE'?'FCFA':'USD', paymentAmount:method==='WAVE'?total:fcfaToUsdt(total),
    paymentProofType:proofType, paymentRef:proofType==='ref'?ref:'', paymentCaptureName:proofType==='capture'?(file?.name||'capture'):'', paymentCaptureData:captureData,
    validationStatus:'En attente de validation', deliveryStatus:'En cours de livraison', afterSaleStatus:'', delivery:'En attente de validation',
    source:'lot panier boutique client'
  });
  save(d); cart.length=0; refreshPublicCartBadge(companyId);
  showOrderSentModal(companyId);
}
function showOrderSentModal(companyId){
  document.querySelector('.orderSentModal')?.remove();
  const d=seed(); const c=(d.companies||[]).find(x=>x.id===companyId);
  const html=`<div class="marketPayModalBackdrop orderSentModal"><div class="marketPayModal orderSentBox"><h2>Commande Envoyée</h2><p>Votre commande a été envoyée au Marketplace administrateur.</p><button onclick="document.querySelector('.orderSentModal')?.remove();document.getElementById('publicCartModal')?.remove();renderPublicShop('${esc(c?.shopSlug||'')}')">OK</button></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
function openClientRegisterPopup(companyId){
  const html=`<div class="marketPayModalBackdrop" id="clientRegisterModal"><div class="marketPayModal clientAuthModal"><button class="marketPayClose" onclick="document.getElementById('clientRegisterModal')?.remove()">×</button><h2>Inscription nouveau client</h2><p>Inscription obligatoire avant toute commande dans la boutique client.</p><label>Nom complet<input id="clientRegName" placeholder="Nom et prénom"></label><label>Téléphone<input id="clientRegPhone" placeholder="Ex : 0700000000"></label><label>Email<input id="clientRegEmail" placeholder="Email facultatif"></label><label>Mot de passe<input id="clientRegPass" type="password" placeholder="Créer un mot de passe"></label><div class="marketPayActions"><button onclick="savePublicClientRegister('${companyId}')">Créer mon espace client</button><button class="btn2" onclick="openClientLoginPopup('${companyId}')">J’ai déjà un compte</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
function openClientLoginPopup(companyId){
  document.getElementById('clientRegisterModal')?.remove();
  document.getElementById('clientSpaceModal')?.remove();
  const html=`<div class="marketPayModalBackdrop" id="clientLoginModal"><div class="marketPayModal clientAuthModal"><button class="marketPayClose" onclick="document.getElementById('clientLoginModal')?.remove()">×</button><h2>Connexion espace client</h2><label>Téléphone<input id="clientLoginPhone" placeholder="Téléphone"></label><label>Mot de passe<input id="clientLoginPass" type="password" placeholder="Mot de passe"></label><div class="marketPayActions"><button onclick="loginPublicClient('${companyId}')">Ouvrir mon espace</button><button class="btn2" onclick="document.getElementById('clientLoginModal')?.remove();openClientRegisterPopup('${companyId}')">Inscription</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
async function savePublicClientRegister(companyId){
  const d=seed(); d.marketClients=d.marketClients||[];
  const name=($('#clientRegName')?.value||'').trim(), phone=($('#clientRegPhone')?.value||'').trim(), email=($('#clientRegEmail')?.value||'').trim(), pass=($('#clientRegPass')?.value||'').trim();
  if(!name||!phone||!pass) return alert('Nom, téléphone et mot de passe obligatoires.');
  if(d.marketClients.some(c=>c.companyId===companyId&&c.phone===phone)) return alert('Ce téléphone est déjà inscrit. Connectez-vous à votre espace client.');
  const client={id:id('clt'),companyId,name,phone,email,createdAt:new Date().toISOString()};
  await setUserPasswordSecure(client,pass);
  d.marketClients.push(client); save(d); window.publicShopClientId=client.id;
  document.getElementById('clientRegisterModal')?.remove(); alert('Inscription réussie. Votre espace client est créé.'); renderPublicShop((d.companies||[]).find(c=>c.id===companyId)?.shopSlug||'');
}
async function loginPublicClient(companyId){
  const d=seed(); const phone=($('#clientLoginPhone')?.value||'').trim(), pass=($('#clientLoginPass')?.value||'').trim();
  const client=(d.marketClients||[]).find(c=>c.companyId===companyId&&c.phone===phone);
  if(!client || !(await verifyUserPassword(client,pass))) return alert('Téléphone ou mot de passe incorrect.');
  await migratePasswordIfPlain(client,pass,d);
  window.publicShopClientId=client.id; document.getElementById('clientLoginModal')?.remove(); openClientSpace(companyId);
}
function openClientSpace(companyId){
  document.getElementById('clientSpaceModal')?.remove();
  const d=seed(); const c=(d.companies||[]).find(x=>x.id===companyId); const client=getPublicClient(companyId);
  if(!client) return openClientLoginPopup(companyId);
  const clientDeletedSet=new Set([...(client.deletedOrderIds||[]),...((d.clientDeletedOrders&&d.clientDeletedOrders[client.id])||[])]);
  const orders=(d.orders||[]).filter(o=>o.companyId===companyId&&o.clientId===client.id&&!((o.clientDeletedIds||[]).includes(client.id))&&!clientDeletedSet.has(o.id)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const rows=orders.map(o=>`<tr><td><button class="orderLinkBtn" onclick="openMarketplaceOrderPopup('${esc(o.id||'CMD')}',false)">#${esc(o.id||'CMD')}</button></td><td>${new Date(o.date).toLocaleDateString('fr-FR')}</td><td>${orderItemsCount(o)} article(s)</td><td>${money(orderTotal(o))}</td><td>${esc(o.paymentMethod||'Non choisi')}</td><td>${esc(orderMainStatus(o))}</td><td><button class="danger smallDeleteOrder" onclick="deleteMarketplaceOrder('${esc(o.id||'CMD')}',false)">Supprimer</button></td></tr>`).join('')||'<tr><td colspan="7">Aucune commande pour le moment.</td></tr>';
  const html=`<div class="marketPayModalBackdrop" id="clientSpaceModal"><div class="marketPayModal clientSpaceBox"><button class="marketPayClose" onclick="document.getElementById('clientSpaceModal')?.remove()">×</button><h2>Espace client</h2><p><b>${esc(client.name)}</b><br>${esc(client.phone)} ${client.email?'— '+esc(client.email):''}</p><h3>Historique / suivi de mes commandes</h3><div class="clientOrdersScroll"><table class="mkOrdersTable"><tr><th>N° LOT</th><th>Date</th><th>Articles</th><th>Total</th><th>Paiement</th><th>Statut</th><th>Action</th></tr>${rows}</table></div><div class="marketPayActions"><button onclick="document.getElementById('clientSpaceModal')?.remove()">Fermer</button><button class="btn2" onclick="window.publicShopClientId='';document.getElementById('clientSpaceModal')?.remove();renderPublicShop('${esc(c?.shopSlug||'')}')">Déconnexion</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function normalizeOrderItems(o){
  if(o&&Array.isArray(o.items)&&o.items.length) return o.items;
  if(!o) return [];
  return [{itemId:o.itemId||'',item:o.item||'Commande',category:o.category||'',type:o.type||'',qty:Number(o.qty||1),unit:Number(o.unit||0),total:Number(o.total||0)}];
}
function orderItemsCount(o){return normalizeOrderItems(o).reduce((a,x)=>a+Number(x.qty||1),0)}
function orderTotal(o){return Number(o?.total||normalizeOrderItems(o).reduce((a,x)=>a+Number(x.total||0),0)||0)}
function orderMainStatus(o){return marketplaceValidationValue(o)==='Annuler'?(o?.afterSaleStatus||'Annuler'):(o?.deliveryStatus||o?.validationStatus||o?.delivery||'En attente de validation')}
function isMarketplaceOrderCancelled(o){return marketplaceValidationValue(o)==='Annuler'||String(o?.validationStatus||o?.delivery||'').toLowerCase().includes('annul')||String(o?.afterSaleStatus||'').toLowerCase().includes('rembours');}
function openMarketplaceOrderPopup(orderId,isAdmin){
  document.getElementById('marketOrderDetailsModal')?.remove();
  const d=seed(); const o=(d.orders||[]).find(x=>String(x.id)===String(orderId));
  if(!o) return alert('Commande introuvable.');
  const items=normalizeOrderItems(o);
  const rows=items.map((it,i)=>`<tr><td>${i+1}</td><td>${esc(it.item||'Article')}</td><td>${esc(it.category||'-')}</td><td>${esc(it.type||'-')}</td><td>${Number(it.qty||1)}</td><td>${money(it.unit||0)}</td><td><b>${money(it.total||0)}</b></td></tr>`).join('');
  const valState=marketplaceValidationValue(o); const autoDelivery=marketplaceDeliveryByValidation(valState);
  const statusAdmin=isAdmin?`<div class="orderStatusGrid statusSelectColor"><label>Validation<select id="orderValidationStatus" onchange="toggleMarketplaceActionField()"><option value="En attente de validation" ${valState==='En attente de validation'?'selected':''}>En attente de validation</option><option value="Validée" ${valState==='Validée'?'selected':''}>Validée</option><option value="Terminer" ${valState==='Terminer'?'selected':''}>Terminer</option><option value="Annuler" ${valState==='Annuler'?'selected':''}>Annuler</option></select></label><label>Livraison<select id="orderDeliveryStatus" disabled><option ${autoDelivery==='Aucune action'?'selected':''}>Aucune action</option><option ${autoDelivery==='En cours de livraison'?'selected':''}>En cours de livraison</option><option ${autoDelivery==='Livrée'?'selected':''}>Livrée</option></select></label><label id="orderRefundActionBox" style="display:${valState==='Annuler'?'block':'none'}">Action<select id="orderAfterSaleStatus"><option value="En cours de remboursement" ${o.afterSaleStatus==='En cours de remboursement'?'selected':''}>En cours de remboursement</option><option value="Rembourser" ${o.afterSaleStatus==='Rembourser'||o.afterSaleStatus==='Remboursée'?'selected':''}>Rembourser</option></select></label></div><div class="marketPayActions"><button onclick="saveMarketplaceOrderStatus('${esc(o.id)}')">Enregistrer les détails</button><button class="btn2" onclick="document.getElementById('marketOrderDetailsModal')?.remove()">Fermer</button></div>`:`<div class="orderStatusRead"><p><b>Validation :</b> ${esc(marketplaceValidationValue(o))}</p><p><b>Livraison :</b> ${esc(o.deliveryStatus||marketplaceDeliveryByValidation(marketplaceValidationValue(o)))}</p><p><b>Action :</b> ${esc(o.afterSaleStatus||'Aucune action')}</p></div><div class="marketPayActions"><button onclick="document.getElementById('marketOrderDetailsModal')?.remove()">Fermer</button></div>`;
  const proof=o.paymentProofType==='capture'?('Capture : '+(o.paymentCaptureName||'capture')):('Référence : '+(o.paymentRef||'-'));
  const proofLink=o.paymentProofType==='capture'&&o.paymentCaptureData?`<a class="paymentCaptureLink" href="${o.paymentCaptureData}" target="_blank" download="${esc(o.paymentCaptureName||'capture-paiement.png')}">📎 Ouvrir / télécharger la capture de paiement</a>`:(o.paymentProofType==='capture'?'<span class="paymentCaptureMissing">Capture indiquée, mais aucun fichier lisible enregistré.</span>':'');
  const html=`<div class="marketPayModalBackdrop" id="marketOrderDetailsModal"><div class="marketPayModal orderDetailsBox ${isAdmin?'adminOrderDetails':'clientOrderDetails'}"><button class="marketPayClose" onclick="document.getElementById('marketOrderDetailsModal')?.remove()">×</button><h2>Détails commande #${esc(o.id)}</h2><p><b>Client :</b> ${esc(o.client||'Client')} — ${esc(o.clientPhone||'')}<br><b>Date :</b> ${new Date(o.date).toLocaleString('fr-FR')}<br><b>Paiement :</b> ${esc(o.paymentMethod||'-')} — ${esc(proof)}</p>${proofLink?`<div class="paymentProofLinkBox">${proofLink}</div>`:''}<div class="clientOrdersScroll"><table class="mkOrdersTable orderDetailsLines"><tr><th>N°</th><th>Produit / Service</th><th>Catégorie</th><th>Type</th><th>Qté</th><th>PU</th><th>Total</th></tr>${rows}</table></div><div class="publicCartTotal">Total lot : <b>${money(orderTotal(o))}</b></div><h3>Détails remplis par l’administrateur Marketplace</h3>${statusAdmin}</div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}


function marketplaceValidationValue(o){
  const v=String(o?.validationStatus||'En attente de validation').trim().toLowerCase();
  if(v.includes('termin')) return 'Terminer';
  if(v.includes('annul')) return 'Annuler';
  if(v.includes('valid')) return 'Validée';
  return 'En attente de validation';
}
function marketplaceDeliveryByValidation(v){
  v=String(v||'').toLowerCase();
  if(v.includes('valid')) return 'En cours de livraison';
  if(v.includes('termin')) return 'Livrée';
  return 'Aucune action';
}
function toggleMarketplaceActionField(){
  const v=$('#orderValidationStatus')?.value||'En attente de validation';
  const livraison=marketplaceDeliveryByValidation(v);
  const del=$('#orderDeliveryStatus'); if(del) del.value=livraison;
  const box=$('#orderRefundActionBox'); if(box) box.style.display=(v==='Annuler')?'block':'none';
}
function deleteMarketplaceOrder(orderId,isAdmin){
  if(!ensureDataUnlocked('la suppression d’une commande')) return;
  if(!confirm('Supprimer cette commande seulement de cette liste ?')) return;
  const d=seed(); const o=(d.orders||[]).find(x=>String(x.id)===String(orderId));
  if(!o) return alert('Commande introuvable.');
  if(isAdmin){
    // Suppression indépendante côté administrateur : la commande disparaît seulement de « Commandes récentes ».
    o.adminDeleted=true;
  }else{
    // Suppression indépendante et persistante côté client : la commande reste dans les rapports admin,
    // mais elle ne réapparaît plus dans l’espace client après déconnexion/reconnexion.
    const client=getPublicClient(o.companyId);
    const cid=client?.id||o.clientId||'';
    o.clientDeletedIds=o.clientDeletedIds||[];
    if(cid && !o.clientDeletedIds.includes(cid)) o.clientDeletedIds.push(cid);
    const savedClient=(d.marketClients||[]).find(c=>c.id===cid);
    if(savedClient){
      savedClient.deletedOrderIds=savedClient.deletedOrderIds||[];
      if(!savedClient.deletedOrderIds.includes(o.id)) savedClient.deletedOrderIds.push(o.id);
    }
    d.clientDeletedOrders=d.clientDeletedOrders||{};
    if(cid){
      d.clientDeletedOrders[cid]=d.clientDeletedOrders[cid]||[];
      if(!d.clientDeletedOrders[cid].includes(o.id)) d.clientDeletedOrders[cid].push(o.id);
    }
  }
  save(d);
  save(CLOUD_DATA);
  document.getElementById('marketOrderDetailsModal')?.remove();
  if(isAdmin) showMarketplacePage(); else { document.getElementById('clientSpaceModal')?.remove(); openClientSpace(o.companyId); }
}

function restoreMarketplaceOrderStock(d,o){
  if(!o || o.stockRestored) return;
  normalizeOrderItems(o).forEach(line=>{
    const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===o.companyId);
    if(it && isBoutiqueItem(it) && it.stockType!=='unlimited') it.stock=Number(it.stock||0)+Number(line.qty||0);
  });
  o.stockRestored=true;
}
function removeMarketplaceOrderFromReport(d,o){
  if(!o) return;
  d.sales=(d.sales||[]).filter(s=>!(s.marketplaceOrderId===o.id));
  o.marketplaceReported=false;
  o.reportSaleIds=[];
}
function addMarketplaceOrderToReport(d,o){
  if(!o || o.marketplaceReported) return;
  d.sales=d.sales||[];
  const ids=[];
  normalizeOrderItems(o).forEach(line=>{
    const qty=Number(line.qty||1), unit=Number(line.unit||0), total=Number(line.total||unit*qty);
    const it=(d.items||[]).find(x=>x.id===line.itemId&&x.companyId===o.companyId);
    const product=isBoutiqueItem(it||{type:line.type});
    const charges=product?Number(it?.buy||0)*qty:total*(Number(it?.charge||0)/100);
    const sid=id('mkp');
    d.sales.push({
      id:sid,companyId:o.companyId,userId:'marketplace',client:o.client||'Client boutique',
      name:line.item||'Commande Marketplace',qty,unit,total,serviceFee:0,charges,profit:total-charges,
      date:o.date||new Date().toISOString(),docSecureLink:secureDocLink(sid),docQr:true,
      clientType:'marketplace',itemCode:it?.code||'',itemId:line.itemId||'',category:line.category||it?.cat||'',
      saleKind:product?'boutique':'service',note:'Vente Marketplace validée — commande '+(o.id||''),
      source:'marketplace',marketplaceOrderId:o.id
    });
    ids.push(sid);
  });
  o.marketplaceReported=true;
  o.reportSaleIds=ids;
}
function saveMarketplaceOrderStatus(orderId){
  const d=seed(); const o=(d.orders||[]).find(x=>String(x.id)===String(orderId)); if(!o) return alert('Commande introuvable.');
  const validation=$('#orderValidationStatus')?.value||'En attente de validation';
  o.validationStatus=validation;
  o.deliveryStatus=marketplaceDeliveryByValidation(validation);
  o.afterSaleStatus=validation==='Annuler'?($('#orderAfterSaleStatus')?.value||'En cours de remboursement'):'';
  if(validation==='Annuler'){
    restoreMarketplaceOrderStock(d,o);
    removeMarketplaceOrderFromReport(d,o);
  }else if(validation==='Validée'||validation==='Terminer'){
    delete o.marketplaceReportDeletedByUser;
    delete o.marketplaceReportDeletedAt;
    addMarketplaceOrderToReport(d,o);
  }else{
    removeMarketplaceOrderFromReport(d,o);
  }
  o.delivery=orderMainStatus(o);
  save(d); alert('Détails de la commande enregistrés.'); document.getElementById('marketOrderDetailsModal')?.remove(); showMarketplacePage();
}
function requirePublicClientBeforePay(companyId,itemId){
  if(!getPublicClient(companyId)){ alert('Veuillez vous inscrire ou vous connecter avant de commander.'); openClientRegisterPopup(companyId); return; }
  openPublicPaymentModal(companyId,itemId);
}
function ensurePublicOrder(companyId,itemId,qty,total,method){
  const d=seed(); const it=(d.items||[]).find(x=>x.id===itemId&&x.companyId===companyId&&!x.marketplaceHidden); const client=getPublicClient(companyId);
  if(!it||!client) return null;
  if(isBoutiqueItem(it) && it.stockType!=='unlimited' && Number(it.stock||0)<qty) { alert('Stock insuffisant.'); return null; }
  if(isBoutiqueItem(it) && it.stockType!=='unlimited') it.stock=Number(it.stock||0)-qty;
  d.orders=d.orders||[];
  const order={id:id('cmd'),companyId,clientId:client.id,client:client.name,clientPhone:client.phone,date:new Date().toISOString(),item:it.name,itemId:it.id,total,qty,paymentMethod:method,delivery:'Paiement en attente',source:'boutique client'};
  d.orders.push(order); save(d); return order;
}
function showPublicPaymentChoice(companyId,itemId,qty,total,method){
  const d=seed(); const c=(d.companies||[]).find(x=>x.id===companyId); const it=(d.items||[]).find(x=>x.id===itemId&&x.companyId===companyId&&!x.marketplaceHidden);
  if(!c||!it) return;
  const order=ensurePublicOrder(companyId,itemId,qty,total,method); if(!order) return;
  let content='';
  if(method==='WAVE'){
    const waveLink=buildWavePaymentLink(c.marketWaveBusinessLink,total); const qr=waveLink?'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(waveLink):'';
    content=waveLink?`<div class="payQrBox"><img src="${qr}" alt="QR Code Wave"><a href="${esc(waveLink)}" target="_blank">Payer avec Wave Business</a></div>`:'<p class="notice">Lien Wave Business non configuré par le vendeur.</p>';
  }else{
    const payload=`USDT TRC20\nAdresse: ${c.marketUsdtTrc20||''}\nMontant commande: ${total} FCFA\nCommande: ${order.id}`;
    const qr=c.marketUsdtTrc20?'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(payload):'';
    content=c.marketUsdtTrc20?`<div class="payQrBox"><img src="${qr}" alt="QR Code USDT TRC20"><div class="usdtBox"><small>Adresse USDT TRC20</small><b>${esc(c.marketUsdtTrc20)}</b><small>Commande #${esc(order.id)} — ${money(total)}</small></div></div>`:'<p class="notice">Adresse USDT TRC20 non configurée par le vendeur.</p>';
  }
  const box=document.getElementById('publicPaymentChoiceBox'); if(box) box.innerHTML=content+`<p class="notice">Commande enregistrée dans votre espace client : #${esc(order.id)}</p>`;
}
function openPublicPaymentModal(companyId,itemId){
  const d=seed(); const c=(d.companies||[]).find(x=>x.id===companyId); const it=(d.items||[]).find(x=>x.id===itemId&&x.companyId===companyId&&!x.marketplaceHidden);
  if(!c||!it) return alert('Article introuvable.');
  const client=getPublicClient(companyId); if(!client) return openClientRegisterPopup(companyId);
  const qty=isBoutiqueItem(it)?Math.max(1,Number(prompt('Quantité :','1')||1)):1;
  const total=itemMarketPrice(it)*qty;
  const html=`<div class="marketPayModalBackdrop" id="publicPaymentModal"><div class="marketPayModal publicPayBox"><button class="marketPayClose" onclick="document.getElementById('publicPaymentModal')?.remove()">×</button><h2>Paiement commande</h2><p>Client : <b>${esc(client.name)}</b><br><b>${esc(it.name)}</b><br>Quantité : ${qty} — Montant : <b>${money(total)}</b></p><div class="paymentChoiceBtns"><button onclick="showPublicPaymentChoice('${companyId}','${itemId}',${qty},${total},'WAVE')">Paiement Wave</button><button class="btn2" onclick="showPublicPaymentChoice('${companyId}','${itemId}',${qty},${total},'USDT TRC20')">Paiement USDT TRC20</button></div><div id="publicPaymentChoiceBox" class="publicPaymentChoiceBox"><p class="notice">Choisissez d’abord votre moyen de paiement pour afficher le QR Code.</p></div><div class="marketPayActions"><button onclick="openClientSpace('${companyId}')">Voir mon espace client</button><button class="btn2" onclick="document.getElementById('publicPaymentModal')?.remove()">Fermer</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}


function previewMkImage(e){}
function openPublicProductPhoto(companyId,itemId){
  const d=seed(); const it=(d.items||[]).find(x=>x.id===itemId&&x.companyId===companyId);
  if(!it || !it.photo) return;
  const html=`<div class="publicPhotoModal" id="publicPhotoModal" onclick="if(event.target.id==='publicPhotoModal')this.remove()"><div class="publicPhotoModalCard"><button class="publicPhotoClose" onclick="document.getElementById('publicPhotoModal')?.remove()">×</button><img src="${esc(it.photo)}" alt="${esc(it.name||'Produit')}"><h2>${esc(it.name||'Produit / service')}</h2><p>${esc(it.marketplaceDesc||it.detail||it.cat||'')}</p></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function saveShopSettings(){const {d,company}=current(); const c=d.companies.find(x=>x.id===company.id); c.shopBanner=$('#shopBanner')?.value||c.name; c.phone=$('#shopContact')?.value||c.phone; c.shopColor=$('#shopColor')?.value||'#004a48'; c.shopSlug=slugify(c.name); save(d); alert('Boutique publique mise à jour.'); showMarketplacePage();}
function openPublicShop(){const {company}=current(); window.open(marketplaceUrl(company),'_blank')}
function filterMarketCards(){const q=($('#marketSearch')?.value||'').toLowerCase(); document.querySelectorAll('.marketCard').forEach(c=>c.style.display=c.dataset.search.includes(q)?'':'none')}
function focusMarketForm(){document.getElementById('marketFormPanel')?.scrollIntoView({behavior:'smooth',block:'start'});}
function toggleMarketType(){}
function clearMarketForm(){}
function saveMarketItem(){alert('La Marketplace est maintenant basée sur le stock général. Ajoutez ou modifiez les produits/services dans la section Stocks, puis affichez/masquez ici.');}
function editMarketItem(iid){editMarketplaceInfo(iid)}
function deleteMarketItem(iid){toggleMarketplaceVisibility(iid)}
function fakeCustomerOrder(iid){const {d,company}=current(); const it=(d.items||[]).find(i=>i.id===iid&&i.companyId===company.id&&!i.marketplaceHidden); if(!it) return; const client=prompt('Nom du client pour la commande :','Client boutique'); if(!client) return; const qty=isBoutiqueItem(it)?Math.max(1,Number(prompt('Quantité :','1')||1)):1; if(isBoutiqueItem(it) && it.stockType!=='unlimited' && Number(it.stock||0)<qty) return alert('Stock général insuffisant.'); if(isBoutiqueItem(it) && it.stockType!=='unlimited') it.stock=Number(it.stock||0)-qty; d.orders=d.orders||[]; d.orders.push({id:id('cmd'),companyId:company.id,date:new Date().toISOString(),client,item:it.name,total:itemMarketPrice(it)*qty,qty,delivery:'Commande reçue',source:'marketplace'}); save(d); alert('Commande client enregistrée. Le stock général de l’entreprise a été mis à jour.'); showMarketplacePage();}
function updateOrderStatus(oid){const {d,company}=current(); const o=(d.orders||[]).find(x=>x.id===oid&&x.companyId===company.id); if(!o) return; const st=prompt('Statut livraison :',o.delivery||'Commande reçue'); if(st){o.delivery=st; save(d); showMarketplacePage();}}


function renderGlobalShop(){
  const d=seed();
  const companies=(d.companies||[]).filter(c=>hasPlanFeature(c,'public_shop'));
  const companyMap=new Map(companies.map(c=>[c.id,c]));
  const items=(d.items||[]).filter(i=>{
    const c=companyMap.get(i.companyId);
    return c && !i.marketplaceHidden && !(isBoutiqueItem(i)&&i.stockType!=='unlimited'&&Number(i.stock||0)<=0);
  });
  const cats=[...new Set(items.map(i=>i.cat).filter(Boolean))].sort();
  const cards=items.map(i=>{const c=companyMap.get(i.companyId)||{}; return `<div class="globalProductCard" data-type="${isBoutiqueItem(i)?'product':'service'}" data-cat="${esc(i.cat||'')}" data-search="${esc((i.name+' '+i.cat+' '+c.name+' '+(i.marketplaceDesc||i.detail||'')).toLowerCase())}"><div class="globalCardTop"><span>${isBoutiqueItem(i)?'Produit':'Service'}</span><b>${esc(c.name||'Entreprise')}</b></div><button type="button" class="globalProductImage ${i.photo?'clickable':''}" ${i.photo?`onclick="openGlobalProductPhoto('${i.id}')" title="Agrandir la photo"`:''}>${mkProductVisual(i)}${i.photo?'<small>🔍 Voir photo</small>':''}</button><div class="globalProductBody"><h3>${esc(i.name)}</h3><p>${esc(i.cat||'Sans catégorie')}</p><em>${esc(i.marketplaceDesc||i.detail||'')}</em><div class="globalPriceRow"><strong>${money(itemMarketPrice(i))}</strong><span>${marketStockLabel(i)}</span></div><button onclick="location.hash='boutique/${esc(c.shopSlug||slugify(c.name||''))}';render()">Voir la boutique</button></div></div>`}).join('');
  app.innerHTML=`<div class="globalShopPage"><header class="globalShopHeader"><button onclick="location.hash='';renderLogin()">← Connexion</button><div><h1>Boutique GLOBAL3</h1><p>Tous les produits et services publiés par les entreprises enregistrées.</p></div></header><section class="globalShopHero"><div><small>GLOBAL 3 MARKETPLACE</small><h2>La boutique générale de toutes les entreprises</h2><p>Comparez les produits, services, prix et boutiques disponibles en un seul endroit.</p></div><div class="globalHeroStats"><span><b>${companies.length}</b> entreprises</span><span><b>${items.length}</b> articles</span></div></section><section class="globalShopFilters"><input id="globalShopSearch" placeholder="Rechercher produit, service ou entreprise..." oninput="filterGlobalShop()"><select id="globalShopType" onchange="filterGlobalShop()"><option value="">Tous types</option><option value="product">Produits</option><option value="service">Services</option></select><select id="globalShopCat" onchange="filterGlobalShop()"><option value="">Toutes catégories</option>${cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></section><main class="globalProductsGrid">${cards||'<p class="notice">Aucun produit ou service publié dans la boutique générale.</p>'}</main><footer>© 2026 GLOBAL 3 - MEGA SERVICES SARL U. Tous droits réservés.</footer></div>`;
}
function filterGlobalShop(){
  const q=(document.getElementById('globalShopSearch')?.value||'').toLowerCase();
  const t=document.getElementById('globalShopType')?.value||'';
  const cat=document.getElementById('globalShopCat')?.value||'';
  document.querySelectorAll('.globalProductCard').forEach(card=>{
    const okQ=card.dataset.search.includes(q), okT=!t||card.dataset.type===t, okC=!cat||card.dataset.cat===cat;
    card.style.display=(okQ&&okT&&okC)?'':'none';
  });
}
function openGlobalProductPhoto(itemId){
  const d=seed(); const it=(d.items||[]).find(x=>x.id===itemId); if(!it||!it.photo) return;
  const c=(d.companies||[]).find(x=>x.id===it.companyId)||{};
  const html=`<div class="publicPhotoModal" id="globalPhotoModal" onclick="if(event.target.id==='globalPhotoModal')this.remove()"><div class="publicPhotoModalCard globalPhotoCard"><button class="publicPhotoClose" onclick="document.getElementById('globalPhotoModal')?.remove()">×</button><img src="${esc(it.photo)}" alt="${esc(it.name||'Produit')}"><h2>${esc(it.name||'Produit / service')}</h2><p><b>${esc(c.name||'Entreprise')}</b> — ${esc(it.cat||'Catégorie')}</p><p>${esc(it.marketplaceDesc||it.detail||'')}</p></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}

function renderPublicShop(slug){
  const d=seed(); const c=(d.companies||[]).find(x=>slugify(x.name)===decodeURIComponent(slug)||x.shopSlug===decodeURIComponent(slug));
  if(!c){app.innerHTML=`<div class="loginPage"><div class="loginBox"><div class="loginLeft"><div class="logoG">G3</div><h1>Boutique introuvable</h1><p>Le lien public demandé n’existe pas encore.</p><button onclick="location.hash='';renderLogin()">Retour connexion</button></div></div></div>`;return;}
  if(!hasPlanFeature(c,'public_shop')){app.innerHTML=`<div class="loginPage"><div class="loginBox"><div class="loginLeft"><div class="logoG">G3</div><h1>Boutique publique non active</h1><p>Cette entreprise n’a pas encore le plan BUSINESS PLUS.</p><button onclick="location.hash='';renderLogin()">Retour connexion</button></div></div></div>`;return;}
  const items=(d.items||[]).filter(i=>i.companyId===c.id&&!i.marketplaceHidden && !(isBoutiqueItem(i)&&i.stockType!=='unlimited'&&Number(i.stock||0)<=0));
  app.innerHTML=`<div class="publicShop publicShopClean"><header class="publicShopTop publicShopTopClean"><div><b>${esc(c.name)}</b><span>${esc(c.activity||'Boutique officielle')}</span></div><div class="publicTopActions"><button onclick="openClientRegisterPopup('${c.id}')">Inscription</button><button onclick="openClientSpace('${c.id}')">Espace client</button><button class="publicCartBtn" onclick="openPublicCart('${c.id}')">🛒 Panier <span id="publicCartBadge">${publicCartCount(c.id)}</span></button></div></header><main class="publicCatalog publicCatalogClean"><div class="publicStoreTitle"><div><h1>${esc(c.shopBanner||c.name)}</h1></div></div><div class="publicFilters"><input id="publicSearch" placeholder="Rechercher dans la boutique..." oninput="document.querySelectorAll('.publicCard').forEach(x=>x.style.display=x.dataset.search.includes(this.value.toLowerCase())?'':'none')"><select onchange="document.querySelectorAll('.publicCard').forEach(x=>x.style.display=!this.value||x.dataset.type===this.value?'':'none')"><option value="">Toutes catégories</option><option value="product">Produits</option><option value="service">Services</option></select></div><div class="marketCatalog marketCatalogPro publicCatalogGrid">${items.map(i=>`<div class="publicCard marketCard marketCardPro publicProductCard" data-type="${isBoutiqueItem(i)?'product':'service'}" data-search="${esc((i.name+' '+i.cat+' '+(i.marketplacePromo||'')+' '+(i.marketplaceDesc||i.detail||'')).toLowerCase())}"><div class="marketBadge">${isBoutiqueItem(i)?'PRODUIT':'SERVICE'}</div>${i.marketplacePromo?`<div class="promoRibbon">${esc(i.marketplacePromo)}</div>`:''}<button type="button" class="mkProductImg publicPhotoBox publicPhotoClickable" ${i.photo?`onclick="openPublicProductPhoto('${c.id}','${i.id}')" title="Cliquer pour agrandir la photo"`:''}>${mkProductVisual(i)}${i.photo?'<span class="zoomHint">🔍 Agrandir</span>':''}</button><div class="publicProductInfo"><h3>${esc(i.name)}</h3><p>${esc(i.cat||'Catégorie')}</p><b>${money(itemMarketPrice(i))}</b><small>${marketStockLabel(i)}</small><em>${esc(i.marketplaceDesc||i.detail||'')}</em></div><div class="publicCardActions"><button class="addCartBtn" onclick="addToPublicCart('${c.id}','${i.id}')">Ajouter au panier</button></div></div>`).join('')||'<p>Aucun produit ou service publié.</p>'}</div></main><footer>© 2026 GLOBAL 3 - MEGA SERVICES SARL U. Tous droits réservés.</footer></div>`;
}
