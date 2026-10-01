import {readFile} from 'node:fs/promises';
import {plan} from '../src/planner.mjs';
const rules=JSON.parse(await readFile('content/rules.json'));
const sources=JSON.parse(await readFile('content/sources.json'));
console.log(JSON.stringify(plan({device:'cuda',cuda:12,cudnn:8,input:'array'},rules,sources),null,2));
