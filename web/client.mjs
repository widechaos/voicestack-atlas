import {plan} from '../src/planner.mjs';
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
  const groq='*[_type == "compatibilityRule" || _type == "source"]';
  const response=await fetch('https://jud8maoc.api.sanity.io/v2026-09-01/data/query/production?query='+encodeURIComponent(groq), {signal:AbortSignal.timeout(15000)});
  const data=await response.json(); if(!response.ok)throw new Error('Sanity data is unavailable. No cached answer is substituted.');
  const rules=data.result.filter(d=>d._type==='compatibilityRule'), sources=data.result.filter(d=>d._type==='source');
  if(!rules.length||!sources.length)throw new Error('Sanity dataset is empty.');
  const p={device:query.get('device'),input:query.get('input')}; for(const k of ['cuda','cudnn'])if(query.get(k))p[k]=Number(query.get(k));
  const r=plan(p,rules,sources); r.mode='live-sanity-content-lake';
  document.querySelector('#state').textContent=r.ready?'CONSTRAINTS RESOLVED':'MORE EVIDENCE NEEDED';
  const out=document.querySelector('#decisions');out.replaceChildren(...r.missing.map(m=>create('p',m,'warning')),...r.decisions.map(renderDecision));
  const history=document.querySelector('#historical');history.replaceChildren(...(r.historical.length?r.historical.map((d,i)=>renderDecision(d,i)):[create('p','No historical GPU rule applies to this CPU profile.')]));
 }catch(e){document.querySelector('#state').textContent='Error';document.querySelector('#decisions').replaceChildren(create('p',e.message==='Failed to fetch'?'Cannot reach the content source. Check your connection and retry.':e.message,'warning'));}finally{button.disabled=false;}
}
device.addEventListener('change',()=>{document.querySelector('#gpu').hidden=device.value==='cpu'});
form.addEventListener('submit',e=>{e.preventDefault();resolve()});resolve();
