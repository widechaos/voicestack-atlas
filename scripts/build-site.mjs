import {readFile,writeFile,mkdir} from 'node:fs/promises';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
await mkdir('docs/sources',{recursive:true});
const rules=JSON.parse(await readFile('content/rules.json'));
const sources=JSON.parse(await readFile('content/sources.json'));
for(const file of ['index.html','app.mjs','style.css']){
 let text=await readFile('public/'+file,'utf8');
 if(file==='index.html')text=text.replace('href="/"','href="./"').replace('href="/style.css"','href="./style.css"').replace('src="/app.mjs"','src="./app.mjs"');
 if(file==='app.mjs')text=text.replace("const response=await fetch(`/api/plan?${query}`),r=await response.json();if(!response.ok)throw new Error(r.error);","const [{plan},rules,sources]=await Promise.all([import('./planner.mjs'),fetch('./rules.json').then(r=>r.json()),fetch('./sources.json').then(r=>r.json())]); const p={device:query.get('device'),input:query.get('input')}; for(const k of ['cuda','cudnn'])if(query.get(k))p[k]=Number(query.get(k)); const r=plan(p,rules,sources);");
 await writeFile('docs/'+file,text);
}
await writeFile('docs/planner.mjs',await readFile('src/planner.mjs'));
await writeFile('docs/rules.json',JSON.stringify(rules));await writeFile('docs/sources.json',JSON.stringify(sources));
const header='<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>VoiceStack Atlas source corpus</title></head><body style="font-family:system-ui;max-width:900px;margin:40px auto;padding:20px;line-height:1.6">';
for(const source of sources){
 const text=await readFile(`content/${source.id}.md`,'utf8');
 await writeFile(`docs/sources/${source.id}.html`,`${header}<h1>${escape(source.id)}</h1><p>Original source: <a href="${source.url}">${source.url}</a></p><p>Documentation era: ${source.ref}; commit: ${source.commit}. Collected: ${source.collected}. MIT licensed SYSTRAN/faster-whisper material.</p><pre style="white-space:pre-wrap">${escape(text)}</pre></body></html>`);
}
await writeFile('docs/sources/index.html',`${header}<h1>VoiceStack Atlas curated deployment corpus</h1><p>Current and historical sources are version-scoped. These are original structured annotations, grounded in the linked public upstream files. No GPU benchmark or inference run was performed.</p><ul>${sources.map(s=>`<li><a href="./${s.id}.html">${s.id}: ${s.ref} ${s.path}</a> — <a href="${s.url}">pinned original</a></li>`).join('')}</ul>${rules.map(r=>`<article><h2>${r._id}</h2><p>Status: ${r.status}. Conditions: ${escape(JSON.stringify(r.when))}</p><p>${escape(r.claim)}</p><p>Action: ${escape(r.action)}</p><p>Evidence literal: ${escape(r.evidence)}</p><a href="${sources.find(s=>s.id===r.sourceId).url}">Original source</a></article>`).join('')}</body></html>`);
await writeFile('docs/.nojekyll','');
console.log('Built static preview and public corpus.');
