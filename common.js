"use strict";
window.O={$:id=>document.getElementById(id),esc:s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),
safeURL:(v,image=false)=>{try{if(image&&/^\.\/img\/[a-zA-Z0-9_./-]+$/.test(v)&&!v.includes(".."))return v;const u=new URL(v);return u.protocol==="https:"?u.href:""}catch{return ""}},
request:async function(action,payload){
const api=window.OPENIGHT_CONFIG.API_URL;
if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(api))throw Error("Backend non configurato: inserisci l’URL /exec in config.js.");
const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),45000);
try{const r=await fetch(payload===undefined?api+"?action="+encodeURIComponent(action):api,{signal:ctrl.signal,...(payload===undefined?{}:{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({...payload,action})})});
if(!r.ok)throw Error("Servizio non disponibile ("+r.status+").");
let j;try{j=await r.json()}catch{throw Error("Risposta non valida: controlla URL e permessi del deployment.");}
if(!j.ok){const e=Error(j.message||"Operazione non riuscita.");e.code=j.code;throw e}return j;
}catch(e){if(e.name==="AbortError"||e instanceof TypeError)throw Error("Connessione interrotta. Per una prenotazione, riprova senza cambiare i dati: non verrà duplicata.");throw e}finally{clearTimeout(timer)}
}};

