'use strict';
window.OpenightForm={
 render(container,config){
  container.replaceChildren();
  if(config?.intro){const p=document.createElement('p');p.textContent=config.intro;container.append(p)}
  for(const f of config?.fields||[]){
   const label=document.createElement('label'),input=document.createElement(f.type==='textarea'?'textarea':f.type==='select'?'select':'input');
   input.name='custom_'+f.id;input.dataset.customId=f.id;input.required=f.required;
   if(f.type==='select'){input.append(new Option('Seleziona…',''));f.options.forEach(o=>input.append(new Option(o,o)))}
   else if(f.type==='textarea'){input.rows=3;input.maxLength=500}
   else {input.type=f.type==='checkbox'?'checkbox':f.type==='number'?'number':f.type==='date'?'date':'text';if(f.type==='number')input.step='any';if(f.type==='text')input.maxLength=500}
   if(f.type==='checkbox'){label.style.cssText='display:flex;gap:10px;align-items:center';input.style.cssText='width:20px;flex:0 0 20px';label.append(input,document.createTextNode(f.label+(f.required?' *':'')))}
   else {label.append(document.createTextNode(f.label+(f.required?' *':'')),input)}
   container.append(label);
  }
 },
 collect(container){return Object.fromEntries([...container.querySelectorAll('[data-custom-id]')].map(i=>[i.dataset.customId,i.type==='checkbox'?i.checked:i.value]))}
};
