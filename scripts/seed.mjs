import {createClient} from '@sanity/client';
import {readFile} from 'node:fs/promises';
if(!process.env.SANITY_PROJECT_TOKEN)throw new Error('Set the personal project Editor token locally.');
const client=createClient({projectId:'jud8maoc',dataset:'production',apiVersion:'2026-09-01',useCdn:false,token:process.env.SANITY_PROJECT_TOKEN});
const docs=(await readFile('content/dataset.ndjson','utf8')).trim().split('\n').map(JSON.parse);
let transaction=client.transaction();
for(const doc of docs)transaction=transaction.createIfNotExists(doc);
const result=await transaction.commit();
console.log(JSON.stringify({projectId:'jud8maoc',dataset:'production',seeded:docs.length,transactionId:result.transactionId}));
