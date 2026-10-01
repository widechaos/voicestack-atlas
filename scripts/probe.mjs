import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const url=process.env.SANITY_CONTEXT_URL,token=process.env.SANITY_ORGANIZATION_TOKEN;
if(!url||!token) throw new Error('Set SANITY_CONTEXT_URL and SANITY_ORGANIZATION_TOKEN in your environment.');
if(!/^https:\/\/api\.sanity\.io\/v1\/context\/organizations\/[a-zA-Z0-9_-]+\/mcp\/[a-z0-9-]+$/.test(url)) throw new Error('Use the exact Sanity Context HTTPS endpoint, without URL credentials.');
const client=new Client({name:'voicestack-atlas',version:'0.1.0'});
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(url),{requestInit:{headers:{Authorization:`Bearer ${token}`}}}));
  const tools=await client.listTools();
  console.log(JSON.stringify({mode:'live-sanity-mcp',tools:tools.tools.map(t=>({name:t.name,inputSchema:t.inputSchema}))},null,2));
  const result=await client.callTool({name:'initial_context',arguments:{}});
  if(result.isError) throw new Error('Sanity initial_context returned an error.');
  console.log(JSON.stringify({tool:'initial_context',result},null,2));
} catch(e) { console.error(String(e.message).replaceAll(token,'[REDACTED]')); process.exitCode=1; }
finally { await client.close(); }
