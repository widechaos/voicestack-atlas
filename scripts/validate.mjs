import {readFile,writeFile} from 'node:fs/promises';
const sources=JSON.parse(await readFile('content/sources.json','utf8'));
const rules=JSON.parse(await readFile('content/rules.json','utf8'));
const ids=new Set();
for (const r of rules) {
  if(ids.has(r._id)) throw new Error('Duplicate rule'); ids.add(r._id);
  const source=sources.find(s=>s.id===r.sourceId);
  if(!source) throw new Error('Missing source');
  if(r.sourceRef?._type !== 'reference' || r.sourceRef._ref !== r.sourceId) throw new Error('Invalid Sanity source reference');
  if(!(await readFile(`content/${source.id}.md`,'utf8')).includes(r.evidence)) throw new Error(`Evidence missing: ${r._id}`);
}
const docs=[...sources.map(s=>({_id:s.id,_type:'source',...s})),...rules];
await writeFile('content/dataset.ndjson',docs.map(d=>JSON.stringify(d)).join('\n')+'\n');
console.log(`Validated ${rules.length} rules against ${sources.length} pinned upstream files; generated import data.`);
