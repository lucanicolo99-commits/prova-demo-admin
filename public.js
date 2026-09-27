"use strict";
const C={...window.OPENIGHT_CONFIG};let enabled=false,activeEvent=null,lastFocus=null;
const $=O.$,form=$("bookingForm");
function wa(n,t){return "https://wa.me/"+String(n||"").replace(/\D/g,"")+"?text="+encodeURIComponent(t)}
function link(id,url){const el=$(id),safe=O.safeURL(url);if(safe){el.href=safe;el.hidden=false;el.rel="noopener noreferrer"}else el.hidden=true}
function applyData(j){
const c=j.content||{},s=j.settings||{};C.WHATSAPP_OPENIGHT=s.whatsapp_openight||C.WHATSAPP_OPENIGHT;C.WHATSAPP_YOURPARTY=s.whatsapp_yourparty||C.WHATSAPP_YOURPARTY;
if(c.hero_title){const h=document.querySelector(".hero h1");h.replaceChildren();const parts=c.hero_title.trim().split(/\s+/),span=document.createElement("span");h.append(parts.shift()+" ");span.textContent=parts.join(" ");h.append(span)}
if(c.hero_subtitle!==undefined)document.querySelector(".hero p").textContent=c.hero_subtitle;
if(c.amazonia_desc!==undefined)document.querySelector("#amazonia .copy p").textContent=c.amazonia_desc;
link("amazoniaWa",wa(C.WHATSAPP_OPENIGHT,"Ciao Openight, vorrei informazioni su Amazônia"));
link("yourPartyWa",wa(C.WHATSAPP_YOURPARTY,"Ciao Your Party, vorrei informazioni per una festa"));
link("openwingsLink",c.openwings_url??C.OPENWINGS_URL);link("yourPartySite",c.yourparty_url??C.YOURPARTY_URL);
}
function element(tag,cls,text){const el=document.createElement(tag);el.className=cls||"";if(text!==undefined)el.textContent=text;return el}
function cta(e){
if(e.bookingType==="external"||e.bookingType==="whatsapp"){
const a=element("a","btn",e.ctaLabel||"Scopri");const url=e.bookingType==="whatsapp"?wa(C.WHATSAPP_OPENIGHT,"Info per "+e.title+" del "+e.date):O.safeURL(e.ctaLink);if(!url)return element("span","","Link non disponibile");a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;
}
const b=element("button","btn",enabled?(e.ctaLabel||"Prenota"):"Info WhatsApp");b.type="button";b.addEventListener("click",()=>enabled?openBooking(e):window.open(wa(C.WHATSAPP_OPENIGHT,"Info per "+e.title+" del "+e.date),"_blank","noopener"));return b;
}
function card(e,mini=false){
const date=new Date(e.date+"T12:00:00"),a=element("article",mini?"mini":"eventCard"),inner=element("div",mini?"":"eventInner");
if(!mini){const url=O.safeURL(e.image||"./img/nurbar.jpeg",true);if(url)a.style.backgroundImage="url("+JSON.stringify(url)+")";}
inner.append(element("div","eventMeta",date.toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"short"})+" • "+(e.startTime||"")+" • "+(e.venueName||"")),element(mini?"h4":"h3","",e.title),element("p","",e.description||""),cta(e));a.append(inner);if(mini)a.style.gridTemplateColumns="1fr";return a;
}
async function load(){
applyData({});
try{const j=await O.request("publicData");enabled=j.bookingsEnabled===true;applyData(j);
for(const [id,data,mini] of [["eventsGrid",j.events,false],["amazoniaEvents",j.amazoniaEvents,true]]){$(id).replaceChildren(...(data||[]).map(e=>card(e,mini)));if(!data?.length)$(id).append(element("div","empty","Nessun evento in programma."))}
}catch(e){for(const id of ["eventsGrid","amazoniaEvents"]){$(id).replaceChildren(element("div","empty","Calendario temporaneamente non disponibile. Contattaci su WhatsApp."))}console.warn(e.message)}
}
function openBooking(e){lastFocus=document.activeElement;activeEvent=e;form.reset();$("eventId").value=e.id;$("bookingType").value="form";$("bookingTitle").textContent=e.title;$("bookingStatus").textContent="La richiesta sarà confermata dallo staff.";$("sendBooking").disabled=false;$("bookingModal").classList.add("open");document.body.style.overflow="hidden";form.elements.name.focus()}
function closeBooking(){$("bookingModal").classList.remove("open");document.body.style.overflow="";lastFocus?.focus()}
document.addEventListener("keydown",e=>{if(!$("bookingModal").classList.contains("open"))return;if(e.key==="Escape")closeBooking();if(e.key==="Tab"){const nodes=[...$("bookingModal").querySelectorAll('button:not(:disabled),input:not([type=hidden]),textarea,a[href]')].filter(x=>x.offsetParent!==null),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
form.addEventListener("submit",async e=>{
e.preventDefault();if(!enabled||!activeEvent)return;
const d=Object.fromEntries(new FormData(form));d.eventId=activeEvent.id;d.privacy=form.elements.privacy.checked;d.pax=Number(d.pax);
const fingerprint=JSON.stringify(d);let pending;try{pending=JSON.parse(sessionStorage.getItem("pendingBooking"))}catch{}
if(!pending||pending.fingerprint!==fingerprint)pending={fingerprint,id:crypto.randomUUID()};
sessionStorage.setItem("pendingBooking",JSON.stringify(pending));d.requestId=pending.id;
$("sendBooking").disabled=true;$("bookingStatus").textContent="Invio…";
try{const j=await O.request("book",d);$("bookingStatus").textContent=j.message;$("sendBooking").disabled=true}
catch(err){$("bookingStatus").textContent=err.message;$("sendBooking").disabled=false}
});load();

