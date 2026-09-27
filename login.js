"use strict";
const form=O.$("f"),message=O.$("status");
form.addEventListener("submit",async e=>{
e.preventDefault();const button=form.querySelector("button");button.disabled=true;message.textContent="Accesso…";
try{const j=await O.request("adminLogin",Object.fromEntries(new FormData(form)));sessionStorage.setItem("openightAdminToken",j.token);localStorage.removeItem("openightAdminToken");location.href="./admin.html"}
catch(err){message.textContent=err.message}finally{button.disabled=false}
});

