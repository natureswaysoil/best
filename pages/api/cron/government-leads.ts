import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const SAM = 'https://api.sam.gov/opportunities/v2/search';
const USA = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';
const FROM = process.env.RESEND_FROM || "Nature's Way Soil <no-reply@natureswaysoil.com>";
const TO = process.env.GOVERNMENT_LEADS_TO || process.env.SALES_TO || process.env.JAMES_TO || 'natureswaysoil@gmail.com';
const terms = ['biobased', 'BioPreferred', 'soil amendment', 'fertilizer', 'grounds maintenance', 'landscaping', 'erosion control'];

type Lead = { id:string; source:'SAM.gov'|'USAspending'; title:string; org?:string; email?:string; deadline?:string; value?:number; url:string; score:number; reasons:string[] };
const safe = (v:unknown) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const date = (d:Date) => `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;

function rank(text:string) {
  const s=text.toLowerCase(), reasons:string[]=[]; let score=0;
  const rules:Array<[RegExp,number,string]> = [
    [/hubzone/,45,'HUBZone'], [/biopreferred|bio[- ]?based/,35,'biobased'],
    [/soil amendment|fertilizer|compost|biochar|humic|kelp/,25,'product match'],
    [/landscap|grounds maintenance|turf|lawn|erosion control|revegetation/,18,'grounds match'],
  ];
  for (const [re,n,label] of rules) if (re.test(s)) { score+=n; reasons.push(label); }
  return {score,reasons};
}

async function findOpportunities():Promise<Lead[]> {
  if (!process.env.SAM_API_KEY) return [];
  const now=new Date(), from=new Date(now.getTime()-7*86400000), found=new Map<string,Lead>();
  for (const q of terms) {
    const p=new URLSearchParams({api_key:process.env.SAM_API_KEY,postedFrom:date(from),postedTo:date(now),limit:'25',offset:'0',q});
    const response=await fetch(`${SAM}?${p}`);
    if (!response.ok) throw new Error(`SAM.gov returned ${response.status}`);
    const json=await response.json();
    for (const x of json.opportunitiesData || []) {
      const id=String(x.noticeId || x.solicitationNumber || ''); if (!id) continue;
      const r=rank([x.title,x.description,x.typeOfSetAsideDescription,x.naicsCode].join(' ')); if (r.score<18) continue;
      const contact=x.pointOfContact?.find((c:any)=>c?.email) || x.pointOfContact?.[0] || {};
      found.set(id,{id,source:'SAM.gov',title:x.title||id,org:x.fullParentPathName,email:contact.email,deadline:x.responseDeadLine,url:x.uiLink||`https://sam.gov/opp/${encodeURIComponent(id)}/view`,...r});
    }
  }
  return Array.from(found.values());
}

async function findContractors():Promise<Lead[]> {
  const end=new Date(), start=new Date(end.getTime()-730*86400000);
  const response=await fetch(USA,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({filters:{time_period:[{start_date:start.toISOString().slice(0,10),end_date:end.toISOString().slice(0,10)}],award_type_codes:['A','B','C','D'],keywords:['landscaping','grounds maintenance','fertilizer','soil amendment','biobased']},fields:['Award ID','Recipient Name','Awarding Agency','Award Amount','Description','End Date'],page:1,limit:50,subawards:false})});
  if (!response.ok) throw new Error(`USAspending returned ${response.status}`);
  const json=await response.json();
  return (json.results||[]).map((x:any)=>{ const id=String(x['Award ID']||'unknown'), r=rank(`${x.Description||''} ${x['Recipient Name']||''}`); return {id,source:'USAspending' as const,title:x.Description||id,org:x['Recipient Name'],deadline:x['End Date'],value:Number(x['Award Amount']||0),url:`https://www.usaspending.gov/award/${encodeURIComponent(id)}`,...r}; }).filter((x:Lead)=>x.score>=18);
}

function html(leads:Lead[], notes:string[]) {
  const rows=leads.slice(0,40).map(x=>`<tr><td>${safe(x.source)}<br>${x.score} pts</td><td><a href="${safe(x.url)}">${safe(x.title)}</a><br><small>${safe(x.org)} · ${safe(x.reasons.join(', '))}</small></td><td>${x.email?`<a href="mailto:${safe(x.email)}">${safe(x.email)}</a>`:'Research business contact'}<br><small>${safe(x.deadline||'')}${x.value?` · $${x.value.toLocaleString()}`:''}</small></td></tr>`).join('');
  return `<div style="font-family:Arial;max-width:900px;margin:auto"><h2>HUBZone &amp; biobased government leads</h2><p>${leads.length} relevant matches found. Review requirements before contacting buyers.</p>${notes.length?`<p><b>Notes:</b> ${safe(notes.join(' '))}</p>`:''}<table cellpadding="9" style="border-collapse:collapse;width:100%"><tr><th>Source</th><th>Opportunity / contractor</th><th>Contact</th></tr>${rows||'<tr><td colspan="3">No matches today.</td></tr>'}</table></div>`;
}

export default async function handler(req:NextApiRequest,res:NextApiResponse) {
  const token=req.headers.authorization?.replace(/^Bearer\s+/i,'')||String(req.query.secret||'');
  if (!process.env.CRON_SECRET||token!==process.env.CRON_SECRET) return res.status(401).json({error:'Unauthorized'});
  const dry=req.query.dry_run==='true', notes:string[]=[], errors:string[]=[]; let opportunities:Lead[]=[], contractors:Lead[]=[];
  if (!process.env.SAM_API_KEY) notes.push('SAM_API_KEY is required for live SAM.gov opportunity contacts.');
  try { opportunities=await findOpportunities(); } catch(e) { errors.push(e instanceof Error?e.message:String(e)); }
  try { contractors=await findContractors(); } catch(e) { errors.push(e instanceof Error?e.message:String(e)); }
  const leads=[...opportunities,...contractors].sort((a,b)=>b.score-a.score);
  if (!dry&&process.env.RESEND_API_KEY) { const day=new Date().toISOString().slice(0,10), resend=new Resend(process.env.RESEND_API_KEY); const {error}=await resend.emails.send({from:FROM,to:[TO],subject:`[Gov Leads] ${leads.length} HUBZone/biobased matches — ${day}`,html:html(leads,[...notes,...errors])},{idempotencyKey:`government-leads/digest/${day}`}); if (error) errors.push(error.message); }
  return res.status(errors.length?207:200).json({success:!errors.length,dry_run:dry,opportunities:opportunities.length,contractors:contractors.length,published_contact_emails:opportunities.filter(x=>x.email).length,notes,errors,preview:dry?leads.slice(0,10):undefined});
}
