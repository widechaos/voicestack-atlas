import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {plan} from './planner.mjs';
const rules=JSON.parse(await readFile('content/rules.json'));
const sources=JSON.parse(await readFile('content/sources.json'));
const pages={'/':['public/index.html','text/html'],'/app.mjs':['public/app.mjs','text/javascript'],'/style.css':['public/style.css','text/css']};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(req.method!=='GET'){res.writeHead(405);res.end('GET only');return;}
  if(url.pathname==='/api/plan'){
   const q=url.searchParams;
   const p={device:q.get('device'),input:q.get('input')};
   for(const k of ['cuda','cudnn'])if(q.get(k))p[k]=Number(q.get(k));
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify(plan(p,rules,sources)));return;
  }
  if(url.pathname==='/api/status'){
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({mode:'offline-structured-preview',sourceCount:sources.length,ruleCount:rules.length}));return;
  }
  const entry=pages[url.pathname];
  if(!entry){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',entry[1]);res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'");
  res.end(await readFile(entry[0]));
 }catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));}
});
server.listen(Number(process.env.PORT||4317),'127.0.0.1',()=>console.log('VoiceStack Atlas preview: http://127.0.0.1:4317 (offline rules; live agent is npm run agent)'));
