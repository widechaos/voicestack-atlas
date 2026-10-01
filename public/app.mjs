const form=document.querySelector('#profile'), device=document.querySelector('#device');
const create=(tag,text,className)=>{const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el};
function renderDecision(d,i){
 const row=create('article','','decision');row.append(create('span',String(i+1).padStart(2,'0'),'number'));
 const body=create('div','');body.append(create('h3',d.claim),create('p',d.action));
 const source=create('div','','source');const a=create('a',`${d.source.repository} · ${d.source.ref} · ${d.source.commit.slice(0,8)}`);
 a.href=d.source.url;a.target='_blank';a.rel='noopener noreferrer';source.append(a);body.append(source);row.append(body);return row;
}
async function resolve(){
 const button=form.querySelector('button');button.disabled=true;document.querySelector('#state').textContent='Resolving…';
 try{
  const query=new URLSearchParams(new FormData(form));
  const response=await fetch(`/api/plan?${query}`),r=await response.json();if(!response.ok)throw new Error(r.error);
  document.querySelector('#state').textContent=r.ready?'CONSTRAINTS RESOLVED':'MORE EVIDENCE NEEDED';
  const out=document.querySelector('#decisions');out.replaceChildren(...r.missing.map(m=>create('p',m,'warning')),...r.decisions.map(renderDecision));
  const history=document.querySelector('#historical');history.replaceChildren(...(r.historical.length?r.historical.map(d=>create('p',`${d.claim} ${d.action}`)):[create('p','No historical GPU rule applies to this CPU profile.')]));
 }catch(e){document.querySelector('#state').textContent='Error';document.querySelector('#decisions').replaceChildren(create('p',e.message,'warning'));}finally{button.disabled=false;}
}
device.addEventListener('change',()=>{document.querySelector('#gpu').hidden=device.value==='cpu'});
form.addEventListener('submit',e=>{e.preventDefault();resolve()});resolve();
