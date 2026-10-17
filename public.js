"use strict";
const C={...window.OPENIGHT_CONFIG};
let enabled=false,activeEvent=null,activeMode="form",lastFocus=null;
const $=O.$,form=$("bookingForm");

function wa(n,t){return "https://wa.me/"+String(n||"").replace(/\D/g,"")+"?text="+encodeURIComponent(t)}
function link(id,url){const el=$(id),safe=O.safeURL(url);if(safe){el.href=safe;el.hidden=false;el.rel="noopener noreferrer"}else el.hidden=true}
function element(tag,cls,text){const el=document.createElement(tag);el.className=cls||"";if(text!==undefined)el.textContent=text;return el}

function applyData(j){
 const c=j.content||{},s=j.settings||{};
 C.WHATSAPP_OPENIGHT=s.whatsapp_openight||C.WHATSAPP_OPENIGHT;
 C.WHATSAPP_YOURPARTY=s.whatsapp_yourparty||C.WHATSAPP_YOURPARTY;
 if(c.hero_title){
  const h=document.querySelector(".hero h1");h.replaceChildren();
  const parts=c.hero_title.trim().split(/\s+/),span=document.createElement("span");
  h.append(parts.shift()+" ");span.textContent=parts.join(" ");h.append(span);
 }
 if(c.hero_subtitle!==undefined)document.querySelector(".hero p").textContent=c.hero_subtitle;
 link("yourPartyWa",wa(C.WHATSAPP_YOURPARTY,"Ciao Your Party, vorrei informazioni per una festa"));
 link("openwingsLink",c.openwings_url??C.OPENWINGS_URL);
 link("yourPartySite",c.yourparty_url??C.YOURPARTY_URL);
}

function choiceButton(title,subtitle,disabled,fn){
 const b=element("button","choice");
 b.type="button";b.disabled=disabled;
 b.innerHTML="<b>"+O.esc(title)+"</b><span>"+O.esc(subtitle)+"</span>";
 b.addEventListener("click",fn);
 return b;
}

function openTableMap(e){
 const base=C.TABLE_MAP_URL||"./nur-map.html",url=new URL(base,location.href);
 url.searchParams.set("event",e.id);
 url.searchParams.set("date",e.date||"");
 url.searchParams.set("title",e.title||"");
 location.href=url.href;
}

function openNurOptions(e){
 lastFocus=document.activeElement;activeEvent=e;
 const o=e.options||{},box=$("nurChoices");
 $("nurOptionsTitle").textContent=e.title;
 box.replaceChildren(
  choiceButton("VIP List Free",o.vipRemaining>0?"Restano "+o.vipRemaining+" posti free":"VIP List sold out",!o.vipEnabled||o.vipRemaining<=0,()=>{closeNurOptions();openBooking(e,"vip_list")}),
  choiceButton("Ingresso ridotto",o.reducedEnabled?"Lista ridotta aperta":"Lista ridotta chiusa",!o.reducedEnabled,()=>{closeNurOptions();openBooking(e,"reduced")}),
  choiceButton("Tavoli",o.tablesEnabled?"Apri la mappa interattiva e richiedi un tavolo":"Richieste tavoli chiuse",!o.tablesEnabled,()=>{closeNurOptions();openTableMap(e)})
 );
 $("nurOptionsStatus").textContent="Scegli una modalita per "+e.date+".";
 $("nurOptionsModal").classList.add("open");
 document.body.style.overflow="hidden";
}

function closeNurOptions(){
 $("nurOptionsModal").classList.remove("open");
 document.body.style.overflow="";
 lastFocus?.focus();
}
window.closeNurOptions=closeNurOptions;

function cta(e){
 if(e.isNur){
  const b=element("button","btn",enabled?"Scegli ingresso":"Info WhatsApp");
  b.type="button";
  b.addEventListener("click",()=>enabled?openNurOptions(e):window.open(wa(C.WHATSAPP_OPENIGHT,"Info per "+e.title+" del "+e.date),"_blank","noopener"));
  return b;
 }
 if(e.bookingType==="external"||e.bookingType==="whatsapp"){
  const a=element("a","btn",e.ctaLabel||"Scopri");
  const url=e.bookingType==="whatsapp"?wa(C.WHATSAPP_OPENIGHT,"Info per "+e.title+" del "+e.date):O.safeURL(e.ctaLink);
  if(!url)return element("span","","Link non disponibile");
  a.href=url;a.target="_blank";a.rel="noopener noreferrer";
  return a;
 }
 const b=element("button","btn",enabled?(e.ctaLabel||"Prenota"):"Info WhatsApp");
 b.type="button";
 b.addEventListener("click",()=>enabled?openBooking(e):window.open(wa(C.WHATSAPP_OPENIGHT,"Info per "+e.title+" del "+e.date),"_blank","noopener"));
 return b;
}

function card(e,mini=false,dates=null){
 const date=new Date(e.date+"T12:00:00"),a=element("article",mini?"mini":"eventCard"),inner=element("div",mini?"":"eventInner");
 if(!mini){O.resolveImage(e.image||"./img/nurbar.jpeg").then(url=>{if(url)a.style.backgroundImage="url("+JSON.stringify(url)+")"}).catch(()=>{});}
 else if(e.image){const img=element("img","poster");img.alt=e.title;img.loading="lazy";O.resolveImage(e.image).then(url=>{if(url){img.src=url;inner.prepend(img)}}).catch(()=>{});}
 inner.append(
  element("div","eventMeta",date.toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"short"})+" • "+(e.startTime||"")+" • "+(e.venueName||"")),
  element(mini?"h4":"h3","",e.title),
  element("p","",e.description||""),
  dates?datesButton(e,dates):cta(e)
 );
 if(e.videoUrl)inner.append(videoLink(e.videoUrl));
 if(dates){a.classList.add("series-open");a.tabIndex=0;a.setAttribute("aria-label",e.title+": scegli una data");a.addEventListener("click",ev=>{if(!ev.target.closest("button,a"))openDates(e,dates)});a.addEventListener("keydown",ev=>{if(ev.target===a&&["Enter"," "].includes(ev.key)){ev.preventDefault();openDates(e,dates)}})}
 a.append(inner);
 if(mini)a.style.gridTemplateColumns="1fr";
 return a;
}

function mergedEvents(j){
 const all=[...new Map([...(j.events||[]),...(j.amazoniaEvents||[])].map(e=>[e.id,e])).values()]
  .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||String(a.startTime||"").localeCompare(String(b.startTime||"")));
 return all;
}

async function load(){
 applyData({});
 try{
  const j=await O.request("publicData");
  enabled=j.bookingsEnabled===true;
  applyData(j);
  const events=mergedEvents(j);
  prepareCalendar(events);
  for(const [id,data,mini] of [["eventsGrid",events,false]]){
   $(id).replaceChildren(...groupEvents(data||[]).slice(0,6).map(g=>card(g[0],mini,g)));
   if(!data?.length)$(id).append(element("div","empty","Nessun evento in programma."));
  }
 }catch(e){
  for(const id of ["eventsGrid"])$(id).replaceChildren(element("div","empty","Calendario temporaneamente non disponibile. Contattaci su WhatsApp."));
  console.warn(e.message);
 }
}

function openBooking(e,mode="form"){
 lastFocus=document.activeElement;activeEvent=e;activeMode=mode;
 form.reset();
 OpenightForm.render($("customBookingFields"),e.formConfig);
 $("eventId").value=e.id;
 $("bookingType").value=mode;
 $("tableField").hidden=mode!=="table";
 $("bookingTitle").textContent=mode==="vip_list"?"VIP List Free":mode==="reduced"?"Ingresso ridotto":mode==="table"?"Richiesta tavolo":e.title;
 $("bookingStatus").textContent=mode==="table"?"La richiesta tavolo sara confermata dallo staff.":"La richiesta sara confermata dallo staff.";
 $("sendBooking").textContent=mode==="table"?"Invia richiesta tavolo":"Invia richiesta";
 if(e.formConfig?.title)$("bookingTitle").textContent=e.formConfig.title;
 if(e.formConfig?.button)$("sendBooking").textContent=e.formConfig.button;
 $("sendBooking").disabled=false;
 $("bookingModal").classList.add("open");
 document.body.style.overflow="hidden";
 form.elements.name.focus();
}

function closeBooking(){
 $("bookingModal").classList.remove("open");
 document.body.style.overflow="";
 lastFocus?.focus();
}
window.closeBooking=closeBooking;

document.addEventListener("keydown",e=>{
 if(!$("bookingModal").classList.contains("open"))return;
 if(e.key==="Escape")closeBooking();
 if(e.key==="Tab"){
  const nodes=[...$("bookingModal").querySelectorAll('button:not(:disabled),input:not([type=hidden]),textarea,select,a[href]')].filter(x=>x.offsetParent!==null),first=nodes[0],last=nodes.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});

form.addEventListener("submit",async e=>{
 e.preventDefault();
 if(!enabled||!activeEvent)return;
 const d=Object.fromEntries(new FormData(form));
 d.eventId=activeEvent.id;d.privacy=form.elements.privacy.checked;d.pax=Number(d.pax);
 d.customAnswers=OpenightForm.collect($("customBookingFields"));d.formVersion=activeEvent.formConfig?.version||"";
 for(const key of Object.keys(d))if(key.startsWith("custom_"))delete d[key];
 const fingerprint=JSON.stringify(d);let pending;
 try{pending=JSON.parse(sessionStorage.getItem("pendingBooking"))}catch{}
 if(!pending||pending.fingerprint!==fingerprint)pending={fingerprint,id:crypto.randomUUID()};
 sessionStorage.setItem("pendingBooking",JSON.stringify(pending));
 d.requestId=pending.id;
 $("sendBooking").disabled=true;$("bookingStatus").textContent="Invio...";
 try{
  const j=await O.request(activeMode==="table"?"tableRequest":"book",d);
  $("bookingStatus").textContent=j.message;
  $("sendBooking").disabled=true;
 }catch(err){
  $("bookingStatus").textContent=err.message;
  $("sendBooking").disabled=false;
 }
});



function groupEvents(events){
 const groups=new Map();
 for(const e of events){const day=new Date(e.date+"T12:00:00Z").getUTCDay();const key=e.seriesId?e.venueId+":series:"+e.seriesId:e.formatId?e.venueId+":format:"+e.formatId+":"+day:"event:"+e.id;
 if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e)}
 return [...groups.values()].map(g=>g.sort((a,b)=>a.date.localeCompare(b.date)||String(a.startTime).localeCompare(String(b.startTime)))).sort((a,b)=>a[0].date.localeCompare(b[0].date));
}
function videoLink(url){
 const a=element("a","btn ghost video-link","Guarda il video ↗");
 if(!/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(url))return element("span");
 a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;
}
let datesFocus=null;
function datesButton(e,dates){const b=element("button","btn",dates.length>1?"Scegli data · "+dates.length+" date":"Scopri e prenota");b.type="button";b.onclick=()=>openDates(e,dates);return b}
function openDates(e,dates){
 datesFocus=document.activeElement;$("datesTitle").textContent=e.title;
 $("dateList").replaceChildren(...dates.map(d=>{
  const row=element("div","date-option");row.append(element("h4","",new Date(d.date+"T12:00:00").toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})+(d.startTime?" · "+d.startTime:"")));
  if(d.description)row.append(element("p","",d.description));
  if(d.image){const img=element("img");img.alt=d.title;img.loading="lazy";img.style.cssText="width:100%;max-height:220px;object-fit:contain;border-radius:10px";O.resolveImage(d.image).then(url=>{if(url){img.src=url;row.prepend(img)}}).catch(()=>{});}
  const button=cta(d);button.addEventListener("click",()=>closeDates(),{capture:true});row.append(button);if(d.videoUrl)row.append(videoLink(d.videoUrl));return row;
 }));
 $("datesModal").classList.add("open");document.body.style.overflow="hidden";$("closeDates").focus();
}
function closeDates(){$("datesModal").classList.remove("open");document.body.style.overflow="";datesFocus?.focus()}
$("closeDates").onclick=closeDates;
$("datesModal").addEventListener("click",e=>{if(e.target===$("datesModal"))closeDates()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("datesModal").classList.contains("open"))closeDates()});

let seasonEvents=[],calendarCursor='',calendarFirst='',calendarLast='',calendarFocus=null;
function monthNow(){const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit'}).format(new Date());return parts.slice(0,7)}
function prepareCalendar(events){
 seasonEvents=events;calendarFirst=monthNow();calendarLast=events.reduce((last,e)=>e.date.slice(0,7)>last?e.date.slice(0,7):last,calendarFirst);calendarCursor=calendarFirst;
 const venues=new Map(events.map(e=>[e.venueId,e.venueName]));$('calendarVenue').replaceChildren(new Option('Tutti i locali',''),...[...venues].map(([id,name])=>new Option(name||id,id)));
 $('calendarSummary').textContent=events.length?events.length+' date pubblicate · Calendario disponibile fino al '+new Date(calendarLast+'-01T12:00:00').toLocaleDateString('it-IT',{month:'long',year:'numeric'}):'Nessuna data pubblicata al momento.';
 renderSeasonCalendar();
}
function renderSeasonCalendar(){
 const [year,month]=calendarCursor.split('-').map(Number),grid=$('seasonGrid');grid.replaceChildren();
 $('calendarMonth').textContent=new Date(year,month-1,1).toLocaleDateString('it-IT',{month:'long',year:'numeric'});
 $('previousMonth').disabled=calendarCursor<=calendarFirst;$('nextMonth').disabled=calendarCursor>=calendarLast;
 for(const day of ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'])grid.append(element('div','season-weekday',day));
 for(let i=0;i<(new Date(year,month-1,1).getDay()+6)%7;i++)grid.append(element('div'));
 let count=0;
 for(let day=1;day<=new Date(year,month,0).getDate();day++){
  const cell=element('div','season-day'),date=calendarCursor+'-'+String(day).padStart(2,'0');cell.append(element('b','',String(day)));
  for(const e of seasonEvents.filter(e=>e.date===date&&(!$('calendarVenue').value||e.venueId===$('calendarVenue').value))){
   count++;const b=element('button','',e.title);b.type='button';b.append(element('small','',(e.startTime?' · '+e.startTime:'')+' · '+e.venueName));b.setAttribute('aria-label',e.title+' · '+e.date+' · '+e.venueName);b.onclick=()=>{closeSeasonCalendar();openDates(e,[e])};cell.append(b);
  }grid.append(cell);
 }
 $('calendarEmpty').textContent=count?'Seleziona un evento per dettagli e prenotazione.':'Nessun evento pubblicato per questo mese e locale.';
}
function closeSeasonCalendar(){$('seasonCalendar').classList.remove('open');document.body.style.overflow='';calendarFocus?.focus()}
$('openCalendar').onclick=()=>{calendarFocus=document.activeElement;if(!calendarCursor)prepareCalendar([]);renderSeasonCalendar();$('seasonCalendar').classList.add('open');document.body.style.overflow='hidden';$('closeCalendar').focus()};
$('closeCalendar').onclick=closeSeasonCalendar;
$('calendarVenue').onchange=renderSeasonCalendar;
for(const [id,delta] of [['previousMonth',-1],['nextMonth',1]])$(id).onclick=()=>{const [y,m]=calendarCursor.split('-').map(Number),d=new Date(y,m-1+delta,1);calendarCursor=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');renderSeasonCalendar()};
$('seasonCalendar').onclick=e=>{if(e.target===$('seasonCalendar'))closeSeasonCalendar()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('seasonCalendar').classList.contains('open'))closeSeasonCalendar()});
load();
