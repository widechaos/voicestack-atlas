export function plan(profile, rules, sources) {
  if (!['cpu','cuda'].includes(profile.device)) throw new Error('Choose cpu or cuda');
  if (!['file','array'].includes(profile.input)) throw new Error('Choose file or array');
  for (const key of ['cuda','cudnn']) if (profile[key] !== undefined && (!Number.isInteger(profile[key]) || profile[key] < 1)) throw new Error(`Invalid ${key} major version`);
  const index = new Map(sources.map(s => [s.id,s]));
  const matches = rules.filter(r => r.status === 'current' && Object.entries(r.when).every(([k,v]) => profile[k] === v));
  const missing = [];
  if (profile.device === 'cuda' && !matches.some(r => r.topic === 'gpu')) missing.push('No current rule supports this CUDA/cuDNN combination. Provide both major versions or consult upstream; no GPU install command is generated.');
  const historical = rules.filter(r => r.status === 'historical' && Object.entries(r.when).every(([k,v]) => profile[k] === v));
  const decorate = r => {
    const source = index.get(r.sourceId);
    if (!source || !/^https:\/\/github.com\/SYSTRAN\/faster-whisper\/blob\/[a-f0-9]{40}\//.test(source.url)) throw new Error('Untrusted or missing source');
    return {...r,source};
  };
  return {mode:'offline-structured-preview',profile,ready:missing.length === 0,decisions:matches.map(decorate),historical:historical.map(decorate),missing,limitations:['This preview applies curated constraints. It is not a live Sanity MCP or model run.','No ASR inference, package install or GPU benchmark was executed by this planner.']};
}
export function guardAnswer(answer, sources) {
  if (!answer || !Array.isArray(answer.decisions) || !Array.isArray(answer.missing)) throw new Error('Malformed answer');
  const allowed = new Set(sources.map(s => s.url));
  for (const d of answer.decisions) {
    if (!d.claim || !d.action || !Array.isArray(d.sourceUrls) || !d.sourceUrls.length || d.sourceUrls.some(u => !allowed.has(u))) throw new Error('Every decision must cite an allowed pinned source');
  }
  return answer;
}
