import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {plan} from '../src/planner.mjs';
const groq='*[_type == "compatibilityRule" || _type == "source"]';
const url='https://jud8maoc.api.sanity.io/v2026-09-01/data/query/production?query='+encodeURIComponent(groq);
const response=await fetch(url);assert.equal(response.ok,true,'Public dataset must be readable without credentials');
const data=await response.json();
const rules=data.result.filter(d=>d._type==='compatibilityRule'),sources=data.result.filter(d=>d._type==='source');
const expected=JSON.parse(await readFile('content/rules.json','utf8'));
assert.equal(rules.length,expected.length);assert.equal(sources.length,4);
for(const rule of expected){const actual=rules.find(d=>d._id===rule._id);for(const [key,value] of Object.entries(rule))assert.deepEqual(actual?.[key],value,`Sanity must preserve ${rule._id}.${key}`);}
const checks=[
 {profile:{device:'cuda',cuda:12,cudnn:8,input:'array'},rule:'gpu-cudnn8',ready:true},
 {profile:{device:'cuda',cuda:13,cudnn:9,input:'array'},rule:null,ready:false},
 {profile:{device:'cpu',input:'file'},rule:'cpu-int8',ready:true}
];
for(const c of checks){const r=plan(c.profile,rules,sources);assert.equal(r.ready,c.ready);if(c.rule)assert.ok(r.decisions.some(d=>d._id===c.rule));else assert.ok(!r.decisions.some(d=>d.topic==='gpu'));}
const report={mode:'live-sanity-content-lake',projectId:'jud8maoc',dataset:'production',created:new Date().toISOString(),publicRead:true,ruleCount:rules.length,sourceCount:sources.length,checks};
await mkdir('runs',{recursive:true});await writeFile('runs/live-content-lake.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
