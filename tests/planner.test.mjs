import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {plan,guardAnswer} from '../src/planner.mjs';
const rules=JSON.parse(readFileSync(new URL('../content/rules.json',import.meta.url)));
const sources=JSON.parse(readFileSync(new URL('../content/sources.json',import.meta.url)));
const get=p=>plan(p,rules,sources);
test('CUDA 12 with cuDNN 8 selects the workaround without treating old docs as current',()=>{
 const r=get({device:'cuda',cuda:12,cudnn:8,input:'array'});
 assert.equal(r.ready,true);assert.ok(r.decisions.some(d=>d._id==='gpu-cudnn8'));
 assert.ok(!r.decisions.some(d=>d._id==='gpu-current'||d.status==='historical'));
 assert.ok(r.historical.some(d=>d._id==='gpu-historical'));
});
test('CUDA 11 selects its distinct pin',()=>assert.ok(get({device:'cuda',cuda:11,cudnn:8,input:'file'}).decisions.some(d=>d._id==='gpu-cuda11')));
test('current cuDNN 9 rule selected only with CUDA 12',()=>assert.ok(get({device:'cuda',cuda:12,cudnn:9,input:'file'}).decisions.some(d=>d._id==='gpu-current')));
test('unknown GPU combination produces a missing-facts decision',()=>{
 const r=get({device:'cuda',cuda:13,cudnn:9,input:'file'});assert.equal(r.ready,false);assert.equal(r.decisions.some(d=>d.topic==='gpu'),false);
});
test('missing GPU versions cannot silently default',()=>assert.equal(get({device:'cuda',input:'file'}).ready,false));
test('file decoding does not become an array rule',()=>{
 const r=get({device:'cpu',input:'array'});assert.ok(r.decisions.some(d=>d._id==='audio-array'));assert.ok(!r.decisions.some(d=>d._id==='audio-file'));
});
test('CPU advice does not inherit GPU or historical dependencies',()=>{
 const r=get({device:'cpu',input:'file'});assert.equal(r.ready,true);assert.equal(r.historical.length,0);assert.ok(!r.decisions.some(d=>d.topic==='gpu'));
});
test('invalid inputs rejected',()=>{assert.throws(()=>get({device:'mps',input:'file'}));assert.throws(()=>get({device:'cuda',cuda:12.4,input:'array'}));});
test('unknown citations rejected',()=>assert.throws(()=>guardAnswer({decisions:[{claim:'x',action:'y',sourceUrls:['https://fake.example']}],missing:[]},sources)));
test('uncited claims rejected',()=>assert.throws(()=>guardAnswer({decisions:[{claim:'x',action:'y',sourceUrls:[]}],missing:[]},sources)));
test('known pinned citations accepted',()=>assert.ok(guardAnswer({decisions:[{claim:'x',action:'y',sourceUrls:[sources[0].url]}],missing:[]},sources)));
