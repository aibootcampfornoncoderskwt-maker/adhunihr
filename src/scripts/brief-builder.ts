// Hiring brief builder: a four-step form that ends in a printable brief (PDF) or a message to the Adhuni team.
// The brief lives in the browser only (localStorage) until the visitor chooses "Send to Adhuni".
import {track} from './analytics';
import arabic from '../data/arabic.json';
import clientArabic from '../data/client-arabic.json';

interface Role{id:string;name:string;group:string|null;qty:number;exp:string;certs:string;langs:string;notes:string}
interface State{v:1;step:number;view:'build'|'summary';roles:Role[];countries:string[];location:string;start:string;type:string}
interface Data{groups:{slug:string;title:string;roles:string[]}[];countries:{name:string;code:string}[];enabled:boolean}

const root=document.getElementById('bb');
const dataEl=document.getElementById('bb-data');
if(root&&dataEl){
const data:Data=JSON.parse(dataEl.textContent||'{}');
const mount=root.querySelector<HTMLElement>('.bb-mount')!;
const sendForm=document.getElementById('bb-send') as HTMLFormElement;
const STORE='adhuni-hiring-brief';
const TYPES=['Permanent','Contract','Project'];
const STEPS=['Which roles do you need?','How many people for each role?','Where and when?','Key requirements'];
const STEP_KEYS=['roles','people','where_when','requirements'];
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- language ----------
const dictionary:Record<string,string>={...arabic,...clientArabic};
const isAr=()=>document.documentElement.lang==='ar';
const t=(text:string)=>isAr()?(dictionary[text]??text):text;
const esc=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));
const rolesLabel=(n:number)=>isAr()?(n===1?'تم اختيار وظيفة واحدة':n===2?'تم اختيار وظيفتين':n<=10?`تم اختيار ${n} وظائف`:`تم اختيار ${n} وظيفة`):`${n} ${n===1?'role':'roles'} selected`;
const peopleLabel=(n:number)=>isAr()?(n===1?'شخص واحد':n===2?'شخصان':n<=10?`${n} أشخاص`:`${n} شخصاً`):`${n} ${n===1?'person':'people'}`;
const stepLabel=(n:number)=>isAr()?`الخطوة ${n} من 4`:`Step ${n} of 4`;
const sep=()=>isAr()?'، ':', ';
const dateLabel=(iso:string)=>{const d=new Date(iso+'T00:00:00');return Number.isNaN(d.getTime())?iso:d.toLocaleDateString(isAr()?'ar-u-nu-latn':'en-GB',{day:'numeric',month:'long',year:'numeric'});};

// ---------- icons ----------
const svg=(path:string,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const ICON={plus:svg('<path d="M12 5v14M5 12h14"/>'),minus:svg('<path d="M5 12h14"/>'),x:svg('<path d="M18 6 6 18M6 6l12 12"/>',14),search:svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),check:svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>',16),arrow:svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),download:svg('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>')};

// ---------- state ----------
const fresh=():State=>({v:1,step:1,view:'build',roles:[],countries:[],location:'',start:'',type:''});
let state=fresh();
let restored=false;
try{
 const saved=JSON.parse(localStorage.getItem(STORE)||'null');
 if(saved&&saved.v===1&&Array.isArray(saved.roles)){state={...fresh(),...saved};restored=state.roles.length>0;}
}catch{/* storage can be unavailable or hold bad data */}
let saveTimer=0;
const save=()=>{window.clearTimeout(saveTimer);saveTimer=window.setTimeout(()=>{try{localStorage.setItem(STORE,JSON.stringify(state));}catch{/* ignore */}},200);};
let started=false;
const markStarted=()=>{if(!started){started=true;track('brief_started');}};
const totalPeople=()=>state.roles.reduce((sum,role)=>sum+(role.qty||0),0);
const roleId=(group:string|null,name:string)=>`${group??'custom'}:${name.toLowerCase()}`;
const todayIso=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};

// ---------- shared pieces ----------
function setError(message:string,focus?:HTMLElement|null){
 const box=mount.querySelector<HTMLElement>('.bb-error');
 if(box)box.textContent=message?t(message):'';
 if(message&&focus)focus.focus();
}
function announce(message:string){const live=document.getElementById('bb-live');if(live)live.textContent=message;}

// ---------- render: frame ----------
let direction:'fwd'|'back'='fwd';
function render(){
 if(state.view==='summary'){renderSummary();return;}
 sendForm.hidden=true;
 const step=state.step;
 const labels=STEPS.map((title,i)=>`<li class="bb-step-label${i+1<step?' is-done':''}${i+1===step?' is-current':''}"${i+1===step?' aria-current="step"':''}><span class="bb-step-num" aria-hidden="true">${i+1<step?ICON.check:i+1}</span><span class="bb-step-name">${esc(t(title))}</span></li>`).join('');
 mount.innerHTML=`<div class="bb-card">
  <div class="bb-head"><p class="bb-count">${stepLabel(step)}</p>
   <div class="bb-progress" role="progressbar" aria-label="${esc(t('Progress'))}" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${step}" aria-valuetext="${esc(stepLabel(step)+': '+t(STEPS[step-1]))}"><span style="--p:${step/4}"></span></div>
   <ol class="bb-steps">${labels}</ol></div>
  ${restored&&step===1&&state.roles.length?`<p class="bb-restored">${esc(t('We restored your saved brief.'))} <button type="button" class="bb-link" data-act="reset">${esc(t('Start over'))}</button></p>`:''}
  <div class="bb-panel bb-in-${direction}" id="bb-panel"><h2 class="bb-title" id="bb-title" tabindex="-1">${esc(t(STEPS[step-1]))}</h2><div class="bb-body"></div><p class="bb-error" role="alert"></p></div>
  <div class="bb-nav">${step>1?`<button type="button" class="bb-btn bb-btn-outline" data-act="back">${esc(t('Back'))}</button>`:'<span></span>'}<button type="button" class="bb-btn bb-btn-gold" data-act="next">${esc(step===4?t('Create my brief'):t('Next'))} ${ICON.arrow}</button></div>
 </div>`;
 const body=mount.querySelector<HTMLElement>('.bb-body')!;
 [step1,step2,step3,step4][step-1](body);
}
function go(step:number,dir:'fwd'|'back'){
 direction=dir;state.step=step;state.view='build';restored=false;save();render();
 const title=document.getElementById('bb-title');
 const top=root!.getBoundingClientRect().top;
 if(top<0||top>window.innerHeight*.5)root!.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
 title?.focus({preventScroll:true});
}

// ---------- step 1: roles ----------
function step1(body:HTMLElement){
 body.innerHTML=`<div class="bb-search">${ICON.search}<input id="bb-q" type="search" autocomplete="off" aria-label="${esc(t('Search roles'))}" placeholder="${esc(t('Search roles, for example welder'))}"/></div>
  <div class="bb-selected" id="bb-selected" aria-live="polite"></div>
  <div class="bb-groups" id="bb-groups"></div>
  <p class="bb-nomatch" id="bb-nomatch" hidden></p>
  <div class="bb-custom"><label for="bb-custom">${esc(t('Add a custom role'))}</label><div class="bb-custom-row"><input id="bb-custom" type="text" maxlength="80" autocomplete="off" placeholder="${esc(t('For example, crane operator'))}"/><button type="button" class="bb-btn bb-btn-outline" data-act="add-custom">${ICON.plus} ${esc(t('Add'))}</button></div></div>`;
 drawGroups();drawSelected();
 const q=body.querySelector<HTMLInputElement>('#bb-q')!;
 q.addEventListener('input',()=>filterRoles(q.value));
 body.querySelector<HTMLInputElement>('#bb-custom')!.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();addCustom();}});
}
function drawGroups(){
 const box=document.getElementById('bb-groups');if(!box)return;
 const has=(id:string)=>state.roles.some(r=>r.id===id);
 const custom=state.roles.filter(r=>r.group===null);
 const roleBox=(id:string,name:string,checked:boolean)=>`<label class="bb-role"><input type="checkbox" data-role="${esc(id)}"${checked?' checked':''}/><span>${esc(t(name))}</span></label>`;
 const groups=[
  ...(custom.length?[`<fieldset class="bb-group" data-group="custom"><legend>${esc(t('Your custom roles'))}</legend><div class="bb-roles">${custom.map(r=>roleBox(r.id,r.name,true)).join('')}</div></fieldset>`]:[]),
  ...data.groups.map(g=>`<fieldset class="bb-group" data-group="${esc(g.slug)}"><legend>${esc(t(g.title))}</legend><div class="bb-roles">${g.roles.map(name=>roleBox(roleId(g.slug,name),name,has(roleId(g.slug,name)))).join('')}</div></fieldset>`)
 ];
 box.innerHTML=groups.join('');
 const q=document.getElementById('bb-q') as HTMLInputElement|null;
 if(q&&q.value)filterRoles(q.value);
}
function filterRoles(raw:string){
 const q=raw.trim().toLowerCase();
 let visible=0;
 document.querySelectorAll<HTMLElement>('#bb-groups .bb-group').forEach(group=>{
  let any=false;
  group.querySelectorAll<HTMLElement>('.bb-role').forEach(label=>{
   const input=label.querySelector('input')!;
   const english=(input.dataset.role||'').split(':').slice(1).join(':');
   const show=!q||english.includes(q)||(label.textContent||'').toLowerCase().includes(q);
   label.hidden=!show;if(show)any=true;
  });
  group.hidden=!any;if(any)visible++;
 });
 const none=document.getElementById('bb-nomatch');
 if(none){
  none.hidden=visible>0||!q;
  if(!none.hidden)none.innerHTML=`${esc(t('No roles match your search.'))} <button type="button" class="bb-link" data-act="add-query">${esc(t('Add it as a custom role'))}</button>`;
 }
}
function drawSelected(){
 const box=document.getElementById('bb-selected');if(!box)return;
 const n=state.roles.length;
 box.innerHTML=n?`<p class="bb-selected-count">${esc(rolesLabel(n))}</p><ul class="bb-chips">${state.roles.map(r=>`<li class="bb-chip"><span>${esc(t(r.name))}</span><button type="button" data-act="remove" data-id="${esc(r.id)}" aria-label="${esc(t('Remove'))} ${esc(t(r.name))}">${ICON.x}</button></li>`).join('')}</ul>`:`<p class="bb-selected-count bb-muted">${esc(t('No roles selected yet.'))}</p>`;
}
function toggleRole(id:string,checked:boolean){
 if(checked){
  const [slug,...rest]=id.split(':');const name=data.groups.find(g=>g.slug===slug)?.roles.find(r=>r.toLowerCase()===rest.join(':'));
  if(!name||state.roles.some(r=>r.id===id))return;
  state.roles.push({id,name,group:slug,qty:1,exp:'',certs:'',langs:'',notes:''});
  markStarted();
 }else{
  state.roles=state.roles.filter(r=>r.id!==id);
 }
 save();drawSelected();setError('');
}
function addCustom(raw?:string){
 const input=document.getElementById('bb-custom') as HTMLInputElement|null;
 const name=(raw??input?.value??'').replace(/\s+/g,' ').trim();
 if(!name){setError('Type a role name to add it.',input);return;}
 const id=roleId(null,name);
 if(!state.roles.some(r=>r.id===id)){state.roles.push({id,name,group:null,qty:1,exp:'',certs:'',langs:'',notes:''});markStarted();}
 if(input)input.value='';
 const q=document.getElementById('bb-q') as HTMLInputElement|null;if(q)q.value='';
 save();drawGroups();drawSelected();setError('');
 filterRoles('');
 announce(`${t(name)}: ${t('added')}`);
}

// ---------- step 2: how many ----------
function step2(body:HTMLElement){
 body.innerHTML=`<p class="bb-hint">${esc(t('Enter how many people you need for each role.'))}</p><div class="bb-qty-list">${state.roles.map((r,i)=>`<div class="bb-qty-row"><label for="bb-qty-${i}">${esc(t(r.name))}</label><div class="bb-qty"><button type="button" data-act="dec" data-i="${i}" aria-label="${esc(t('Fewer'))}: ${esc(t(r.name))}">${ICON.minus}</button><input id="bb-qty-${i}" type="number" inputmode="numeric" min="1" max="9999" value="${r.qty}" data-i="${i}" data-f="qty"/><button type="button" data-act="inc" data-i="${i}" aria-label="${esc(t('More'))}: ${esc(t(r.name))}">${ICON.plus}</button></div></div>`).join('')}</div><p class="bb-total" id="bb-total" aria-live="polite"></p>`;
 drawTotal();
}
function drawTotal(){const el=document.getElementById('bb-total');if(el)el.innerHTML=`${esc(t('Total'))}: <strong>${esc(peopleLabel(totalPeople()))}</strong>`;}
function setQty(i:number,value:number){
 const role=state.roles[i];if(!role)return;
 role.qty=Math.max(1,Math.min(9999,Math.round(value)||1));
 const input=document.getElementById(`bb-qty-${i}`) as HTMLInputElement|null;if(input)input.value=String(role.qty);
 save();drawTotal();
}

// ---------- step 3: where and when ----------
function step3(body:HTMLElement){
 body.innerHTML=`<fieldset class="bb-field"><legend>${esc(t('Country'))} <span class="bb-muted">${esc(t('Choose one or more'))}</span></legend><div class="bb-pills">${data.countries.map(c=>`<label class="bb-pill"><input type="checkbox" name="bb-country" value="${esc(c.name)}"${state.countries.includes(c.name)?' checked':''}/><span class="flag flag-${c.code}" aria-hidden="true"></span><span>${esc(t(c.name))}</span></label>`).join('')}</div></fieldset>
  <div class="bb-grid2"><div class="bb-field"><label for="bb-location">${esc(t('Work location'))} <span class="bb-muted">${esc(t('Optional'))}</span></label><input id="bb-location" type="text" data-f="location" maxlength="200" autocomplete="off" placeholder="${esc(t('City, site or project'))}" value="${esc(state.location)}"/></div>
  <div class="bb-field"><label for="bb-start">${esc(t('Target start date'))} <span class="bb-muted">${esc(t('Optional'))}</span></label><input id="bb-start" type="date" data-f="start" min="${todayIso()}" value="${esc(state.start)}"/></div></div>
  <fieldset class="bb-field"><legend>${esc(t('Employment type'))} <span class="bb-muted">${esc(t('Optional'))}</span></legend><div class="bb-pills">${TYPES.map(type=>`<label class="bb-pill"><input type="radio" name="bb-type" value="${type}"${state.type===type?' checked':''}/><span>${esc(t(type))}</span></label>`).join('')}</div></fieldset>`;
}

// ---------- step 4: requirements ----------
function step4(body:HTMLElement){
 body.innerHTML=`<p class="bb-hint">${esc(t('Optional. Add anything that helps us screen candidates for each role.'))}</p>${state.roles.map((r,i)=>`<fieldset class="bb-req"><legend>${esc(t(r.name))}</legend><div class="bb-grid2">
  <div class="bb-field"><label for="bb-exp-${i}">${esc(t('Minimum years of experience'))}</label><input id="bb-exp-${i}" type="number" inputmode="numeric" min="0" max="40" data-i="${i}" data-f="exp" placeholder="${esc(t('For example, 5'))}" value="${esc(r.exp)}"/></div>
  <div class="bb-field"><label for="bb-lang-${i}">${esc(t('Languages'))}</label><input id="bb-lang-${i}" type="text" maxlength="120" data-i="${i}" data-f="langs" placeholder="${esc(t('For example, English, Arabic'))}" value="${esc(r.langs)}"/></div>
  <div class="bb-field bb-span"><label for="bb-cert-${i}">${esc(t('Certifications or licences'))}</label><input id="bb-cert-${i}" type="text" maxlength="200" data-i="${i}" data-f="certs" placeholder="${esc(t('For example, NEBOSH, valid driving licence'))}" value="${esc(r.certs)}"/></div>
  <div class="bb-field bb-span"><label for="bb-notes-${i}">${esc(t('Notes'))}</label><textarea id="bb-notes-${i}" rows="2" maxlength="600" data-i="${i}" data-f="notes" placeholder="${esc(t('Equipment, shift pattern, anything else'))}">${esc(r.notes)}</textarea></div></div></fieldset>`).join('')}`;
}

// ---------- validation and navigation ----------
function validate():string{
 if(state.step===1&&!state.roles.length){setError('Select at least one role to continue.',document.getElementById('bb-q'));return 'x';}
 if(state.step===2){
  const bad=state.roles.findIndex(r=>!Number.isInteger(r.qty)||r.qty<1);
  if(bad>=0){setError('Enter a number of 1 or more for each role.',document.getElementById(`bb-qty-${bad}`));return 'x';}
 }
 if(state.step===3){
  if(!state.countries.length){setError('Choose at least one country.',mount.querySelector<HTMLElement>('input[name=bb-country]'));return 'x';}
  if(state.start&&state.start<todayIso()){setError('Choose a start date that is today or later.',document.getElementById('bb-start'));return 'x';}
 }
 if(state.step===4){
  const bad=state.roles.findIndex(r=>r.exp!==''&&!(/^\d{1,2}$/.test(r.exp)&&Number(r.exp)<=40));
  if(bad>=0){setError('Enter years of experience as a whole number from 0 to 40.',document.getElementById(`bb-exp-${bad}`));return 'x';}
 }
 setError('');return '';
}
function next(){
 if(validate())return;
 track('brief_step_completed',{step:state.step,step_name:STEP_KEYS[state.step-1]});
 if(state.step<4)go(state.step+1,'fwd');
 else{state.view='summary';save();direction='fwd';render();focusSummary();}
}

// ---------- summary ----------
interface Row{name:string;qty:number;exp:string;certs:string;langs:string;notes:string}
const model=()=>({
 rows:state.roles.map<Row>(r=>({name:r.name,qty:r.qty,exp:r.exp,certs:r.certs.trim(),langs:r.langs.trim(),notes:r.notes.trim()})),
 total:totalPeople(),countries:state.countries,location:state.location.trim(),start:state.start,type:state.type
});
function yearsText(exp:string){return exp===''?'':isAr()?`${exp}+ سنوات`:`${exp}+ ${Number(exp)===1?'year':'years'}`;}
function renderSummary(){
 const m=model();
 const details=(r:Row)=>[[t('Experience'),yearsText(r.exp)],[t('Languages'),r.langs],[t('Certifications or licences'),r.certs],[t('Notes'),r.notes]].filter(([,v])=>v);
 mount.innerHTML=`<div class="bb-card bb-in-${direction}" id="bb-summary">
  <div class="bb-done"><span class="bb-done-icon" aria-hidden="true">${ICON.check}</span><div><h2 class="bb-title" id="bb-title" tabindex="-1">${esc(t('Your hiring brief is ready'))}</h2><p class="bb-hint">${esc(t('Review it, then download a PDF or send it to us.'))}</p></div></div>
  <article class="bb-brief" aria-label="${esc(t('Hiring brief'))}">
   <div class="bb-brief-total"><span>${esc(t('Total'))}</span><strong>${esc(peopleLabel(m.total))}</strong></div>
   <ul class="bb-brief-roles">${m.rows.map(r=>`<li><div class="bb-brief-role"><h3 dir="auto">${esc(t(r.name))}</h3><span class="bb-qty-badge">${esc(peopleLabel(r.qty))}</span></div>${details(r).length?`<dl>${details(r).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd dir="auto">${esc(v)}</dd></div>`).join('')}</dl>`:''}</li>`).join('')}</ul>
   <dl class="bb-brief-meta"><div><dt>${esc(t('Country'))}</dt><dd>${m.countries.map(c=>esc(t(c))).join(sep())}</dd></div>${m.location?`<div><dt>${esc(t('Work location'))}</dt><dd dir="auto">${esc(m.location)}</dd></div>`:''}${m.start?`<div><dt>${esc(t('Target start date'))}</dt><dd>${esc(dateLabel(m.start))}</dd></div>`:''}${m.type?`<div><dt>${esc(t('Employment type'))}</dt><dd>${esc(t(m.type))}</dd></div>`:''}</dl>
  </article>
  <div class="bb-actions"><button type="button" class="bb-btn bb-btn-gold" data-act="pdf">${ICON.download} ${esc(t('Download PDF'))}</button><button type="button" class="bb-btn bb-btn-navy" data-act="send-open" aria-expanded="false" aria-controls="bb-send">${esc(t('Send to Adhuni'))} ${ICON.arrow}</button><button type="button" class="bb-btn bb-btn-outline" data-act="edit">${esc(t('Edit brief'))}</button></div>
  <p class="bb-status" id="bb-status" role="status" aria-live="polite" tabindex="-1"></p>
  <p class="bb-privacy">${esc(t('Your brief stays in this browser until you choose to send it. The PDF is created on your device.'))} <button type="button" class="bb-link" data-act="reset">${esc(t('Start over'))}</button></p>
 </div>`;
 sendForm.hidden=sendForm.dataset.open!=='true';
}
function focusSummary(){
 const top=root!.getBoundingClientRect().top;
 if(top<0)root!.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
 document.getElementById('bb-title')?.focus({preventScroll:true});
}
function status(message:string,kind:''|'ok'|'error'=''){
 const el=document.getElementById('bb-status');if(!el)return;
 el.className='bb-status'+(kind?` is-${kind}`:'');el.textContent=message?t(message):'';
}

// ---------- PDF ----------
async function downloadPdf(button:HTMLButtonElement){
 button.disabled=true;status('Preparing your PDF…');
 let host:HTMLElement|null=null;
 try{
  const [{default:html2canvas},{jsPDF}]=await Promise.all([import('html2canvas'),import('jspdf')]);
  await document.fonts.ready;
  const m=model();const rtl=isAr();
  const W=794,H=1123,FOOT=64;
  host=document.createElement('div');host.className='bb-pdf-host';host.setAttribute('aria-hidden','true');host.dir=rtl?'rtl':'ltr';host.lang=rtl?'ar':'en';
  document.body.appendChild(host);
  const date=new Date().toLocaleDateString(rtl?'ar-u-nu-latn':'en-GB',{day:'numeric',month:'long',year:'numeric'});
  const block=(html:string,cls='')=>{const el=document.createElement('div');el.className='bb-pdf-block '+cls;el.innerHTML=html;return el;};
  const blocks:HTMLElement[]=[
   block(`<div class="bb-pdf-brand"><img src="/images/adhuni-logo-pdf.webp" alt="" width="190" height="50"/><div class="bb-pdf-date"><span>${esc(t('Date'))}</span><strong>${esc(date)}</strong></div></div><div class="bb-pdf-rule"></div><h1>${esc(t('Hiring brief'))}</h1><p class="bb-pdf-sub">${esc(peopleLabel(m.total))} · ${esc(m.countries.map(c=>t(c)).join(sep()))}</p>`),
   block(`<dl class="bb-pdf-meta">${m.location?`<div><dt>${esc(t('Work location'))}</dt><dd dir="auto">${esc(m.location)}</dd></div>`:''}${m.start?`<div><dt>${esc(t('Target start date'))}</dt><dd>${esc(dateLabel(m.start))}</dd></div>`:''}${m.type?`<div><dt>${esc(t('Employment type'))}</dt><dd>${esc(t(m.type))}</dd></div>`:''}<div><dt>${esc(t('Country'))}</dt><dd>${esc(m.countries.map(c=>t(c)).join(sep()))}</dd></div></dl><h2>${esc(t('Roles'))}</h2>`),
   ...m.rows.map(r=>{
    const rows=[[t('Experience'),yearsText(r.exp)],[t('Languages'),r.langs],[t('Certifications or licences'),r.certs],[t('Notes'),r.notes]].filter(([,v])=>v);
    return block(`<div class="bb-pdf-role-head"><h3 dir="auto">${esc(t(r.name))}</h3><span>${esc(peopleLabel(r.qty))}</span></div>${rows.length?`<dl>${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd dir="auto">${esc(v)}</dd></div>`).join('')}</dl>`:''}`,'bb-pdf-role');
   })
  ];
  const pages:HTMLElement[]=[];
  const newPage=()=>{const page=document.createElement('div');page.className='bb-pdf-page';page.innerHTML=`<div class="bb-pdf-bar"></div><div class="bb-pdf-content"></div><div class="bb-pdf-foot"><span>Adhuni HR Solutions · <bdi dir="ltr">info@adhunihr.com</bdi></span><span class="bb-pdf-pageno"></span></div>`;host!.appendChild(page);pages.push(page);return page.querySelector<HTMLElement>('.bb-pdf-content')!;};
  const limit=H-10-FOOT-18; // page height minus top bar, footer and a little breathing room
  let content=newPage();
  for(const el of blocks){
   content.appendChild(el);
   if(content.offsetHeight>limit&&content.children.length>1){content.removeChild(el);content=newPage();content.appendChild(el);}
  }
  pages.forEach((page,i)=>{const no=page.querySelector('.bb-pdf-pageno');if(no)no.textContent=rtl?`${i+1} / ${pages.length}`:`${i+1} / ${pages.length}`;});
  const pdf=new jsPDF({unit:'mm',format:'a4',compress:true});
  pdf.setProperties({title:`${t('Hiring brief')} - Adhuni HR Solutions`});
  for(let i=0;i<pages.length;i++){
   const canvas=await html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,width:W,height:H,windowWidth:W});
   if(i>0)pdf.addPage();
   pdf.addImage(canvas.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297,undefined,'FAST');
  }
  const stamp=new Date().toISOString().slice(0,10);
  pdf.save(`Adhuni-hiring-brief-${stamp}.pdf`);
  track('brief_pdf_downloaded',{roles:m.rows.length,people:m.total,language:rtl?'ar':'en'});
  status('Your PDF has been downloaded.','ok');
 }catch{
  status('The PDF could not be created. Please try again.','error');
 }finally{
  host?.remove();button.disabled=false;
 }
}

// ---------- send ----------
const cut=(text:string,max:number)=>text.length>max?text.slice(0,max-1)+'…':text;
function industryFor(){
 const counts=new Map<string,number>();
 for(const r of state.roles){const title=r.group?data.groups.find(g=>g.slug===r.group)?.title:'Other';counts.set(title||'Other',(counts.get(title||'Other')||0)+1);}
 return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'Other';
}
function fieldError(input:HTMLInputElement,message:string){
 const slot=input.closest('.field')?.querySelector<HTMLElement>('.field-error');
 if(slot)slot.textContent=message?t(message):'';
 if(message)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid');
}
function validateSend():boolean{
 let first:HTMLInputElement|null=null;
 const check=(name:string,test:(v:string,el:HTMLInputElement)=>string)=>{
  const el=sendForm.elements.namedItem(name) as HTMLInputElement;
  const message=test(el.type==='checkbox'?(el.checked?'on':''):el.value.trim(),el);
  fieldError(el,message);
  if(message&&!first)first=el;
 };
 check('company',v=>v?'':'Please fill in this field.');
 check('name',v=>v?'':'Please fill in this field.');
 check('email',v=>!v?'Please fill in this field.':/^\S+@[^\s@]+\.[^\s@]+$/.test(v)?'':'Please enter a valid email address.');
 check('phone',v=>!v?'Please fill in this field.':/^\+?[\d\s().-]+$/.test(v)&&v.replace(/\D/g,'').length>=6?'':'Please enter a valid phone number.');
 check('consent',v=>v?'':'Please tick this box to continue.');
 (first as HTMLInputElement|null)?.focus();
 return !first;
}
async function sendBrief(){
 const sendStatus=sendForm.querySelector<HTMLElement>('.bb-send-status')!;
 const setSend=(message:string,kind:''|'ok'|'error'='')=>{sendStatus.className='bb-send-status'+(kind?` is-${kind}`:'');sendStatus.textContent=message?t(message):'';};
 setSend('');
 if(!validateSend()){setSend('Please check the highlighted fields and try again.','error');return;}
 if(root!.dataset.enabled!=='true'){setSend('This is a website preview. No information has been sent or stored.');return;}
 const m=model();
 const submit=sendForm.querySelector<HTMLButtonElement>('[type=submit]')!;
 submit.disabled=true;setSend('Sending your brief…');
 try{
  const body=new FormData(sendForm);
  const line=(r:Row)=>`${r.name} x ${r.qty}${r.exp?`, ${r.exp}+ years`:''}${r.certs?`, ${r.certs}`:''}${r.langs?`, languages: ${r.langs}`:''}${r.notes?`, notes: ${r.notes}`:''}`;
  body.set('type','employer');
  body.set('country',m.countries[0]);
  body.set('industry',industryFor());
  body.set('position_job_title',cut(m.rows.map(r=>r.name).join('; '),480));
  body.set('number_of_vacancies',String(Math.max(1,Math.min(100000,m.total))));
  if(m.location)body.set('work_location',cut(m.location,480));
  if(m.start)body.set('expected_joining_date',m.start);
  const certs=m.rows.filter(r=>r.certs).map(r=>`${r.name}: ${r.certs}`).join('; ');
  if(certs)body.set('qualification',cut(certs,480));
  const exp=m.rows.filter(r=>r.exp).map(r=>`${r.name}: ${r.exp}+ years`).join('; ');
  if(exp)body.set('experience_required',cut(exp,480));
  body.set('job_description',cut(`Hiring brief builder submission. ${m.total} people across ${m.rows.length} roles.\n${m.rows.map(line).join('\n')}`,3900));
  body.set('additional_requirements',cut(`Countries: ${m.countries.join(', ')}${m.type?`\nEmployment type: ${m.type}`:''}\nSent from the hiring brief builder.`,3900));
  const response=await fetch('/api/contact',{method:'POST',body});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||'Your brief could not be sent. Please try again.');
  setSend('Thank you. Your brief is on its way. We will reply within one business day.','ok');
  track('brief_sent',{roles:m.rows.length,people:m.total,language:isAr()?'ar':'en'});
  sendForm.reset();
  try{localStorage.removeItem(STORE);}catch{/* ignore */}
 }catch(error){
  setSend(error instanceof Error?error.message:'Unable to send. Please try again.','error');
 }finally{
  submit.disabled=false;
  const widget=(window as unknown as {turnstile?:{reset:(el:Element)=>void}}).turnstile;
  const el=sendForm.querySelector('.cf-turnstile');
  if(widget&&el)widget.reset(el);
 }
}
function openSend(open:boolean){
 sendForm.dataset.open=String(open);sendForm.hidden=!open;
 root!.querySelector('[data-act=send-open]')?.setAttribute('aria-expanded',String(open));
 if(open){sendForm.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'nearest'});(sendForm.elements.namedItem('company') as HTMLInputElement).focus({preventScroll:true});}
}
function reset(){
 state=fresh();restored=false;started=false;
 try{localStorage.removeItem(STORE);}catch{/* ignore */}
 sendForm.dataset.open='false';sendForm.hidden=true;
 direction='back';render();document.getElementById('bb-title')?.focus({preventScroll:true});
}

// ---------- events ----------
root.addEventListener('click',event=>{
 const el=(event.target as HTMLElement).closest<HTMLElement>('[data-act]');if(!el)return;
 const act=el.dataset.act;
 if(act==='next')next();
 else if(act==='back')go(state.step-1,'back');
 else if(act==='add-custom')addCustom();
 else if(act==='add-query')addCustom((document.getElementById('bb-q') as HTMLInputElement).value);
 else if(act==='remove'){state.roles=state.roles.filter(r=>r.id!==el.dataset.id);save();drawGroups();drawSelected();}
 else if(act==='inc'||act==='dec'){const i=Number(el.dataset.i);setQty(i,state.roles[i].qty+(act==='inc'?1:-1));}
 else if(act==='pdf')downloadPdf(el as HTMLButtonElement);
 else if(act==='send-open')openSend(sendForm.hidden===true);
 else if(act==='edit'){sendForm.hidden=true;go(1,'back');}
 else if(act==='reset'){if(confirm(t('Start a new brief? Your current brief will be cleared.')))reset();}
});
root.addEventListener('change',event=>{
 const el=event.target as HTMLInputElement;
 if(el.dataset.role!==undefined){toggleRole(el.dataset.role,el.checked);return;}
 if(el.name==='bb-country'){state.countries=[...mount.querySelectorAll<HTMLInputElement>('input[name=bb-country]:checked')].map(i=>i.value);save();setError('');}
 if(el.name==='bb-type'){state.type=el.value;save();}
});
root.addEventListener('input',event=>{
 const el=event.target as HTMLInputElement;const f=el.dataset.f;if(!f)return;
 if(f==='qty'){const role=state.roles[Number(el.dataset.i)];const n=parseInt(el.value,10);if(role&&n>=1){role.qty=Math.min(9999,n);save();drawTotal();}return;}
 if(f==='location'||f==='start'){(state as unknown as Record<string,string>)[f]=el.value;save();return;}
 const role=state.roles[Number(el.dataset.i)];if(role){(role as unknown as Record<string,string>)[f]=el.value;save();}
});
root.addEventListener('keydown',event=>{
 const el=event.target as HTMLElement;
 if(event.key==='Enter'&&el instanceof HTMLInputElement&&el.type==='number'){event.preventDefault();next();}
});
sendForm.addEventListener('submit',event=>{event.preventDefault();sendBrief();});
sendForm.addEventListener('input',event=>{const el=event.target as HTMLInputElement;if(el.getAttribute('aria-invalid')==='true')fieldError(el,'');});

// Re-render when the visitor switches language so labels, counts and dates follow.
let lastLang=document.documentElement.lang;
new MutationObserver(()=>{if(document.documentElement.lang!==lastLang){lastLang=document.documentElement.lang;render();}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

render();
}
