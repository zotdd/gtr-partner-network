const MAX_LENGTH={name:110,contact:45,messengerId:100,region:100,email:180,profession:130,notes:600,ref:24};
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const clean=(v,max)=>String(v??'').trim().slice(0,max);
export async function POST(request){
 if(!request.headers.get('content-type')?.includes('application/json'))return response({ok:false,error:'Invalid content type'},415);
 const origin=request.headers.get('origin');
 if(origin){try{const target=new URL(request.url);if(new URL(origin).host!==target.host)return response({ok:false},403);}catch{return response({ok:false},403);}}
 const length=Number(request.headers.get('content-length')||0);
 if(length>12000)return response({ok:false},413);
 let raw;
 try{raw=await request.text();if(raw.length>12000)return response({ok:false},413);}catch{return response({ok:false},400);}
 let payload;
 try{payload=JSON.parse(raw);}catch{return response({ok:false},400);}
 if(typeof payload!=='object'||!payload||Array.isArray(payload))return response({ok:false},400);
 // Honeypot keeps casual bots from triggering email alerts; add Turnstile for high traffic.
 if(clean(payload.website,100))return response({ok:true});
 if(payload.consent!=='yes')return response({ok:false},400);
 const data={};for(const [key,max]of Object.entries(MAX_LENGTH))data[key]=clean(payload[key],max);
 data.messenger=clean(payload.messenger,15).toLowerCase();
 data.lang=clean(payload.lang,3);data.intent='partner';
 if(!data.name||data.name.length<2||!data.contact||data.contact.length<6||!['zalo','wechat','whatsapp'].includes(data.messenger)||!data.messengerId||!['vi','zh','en'].includes(data.lang))return response({ok:false},400);
 if(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))return response({ok:false},400);
 if(data.ref&&!/^[a-zA-Z0-9_-]{3,24}$/.test(data.ref))data.ref='';
 // These values belong ONLY in the private Vercel Production Environment Variables.
 const webhook=process.env.GTR_SHEETS_WEBHOOK_URL;
 const secret=process.env.GTR_WEBHOOK_SECRET;
 if(!webhook||!secret)return response({ok:false,error:'Not configured'},503);
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(webhook))return response({ok:false,error:'Invalid webhook configuration'},503);
 try{
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),8500);
  let upstream;
  try{
   upstream=await fetch(webhook,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...data,secret}),signal:ctrl.signal});
  }finally{clearTimeout(timer);}
  if(!upstream.ok)return response({ok:false},502);
  const upstreamJson=await upstream.json();
  if(upstreamJson?.ok===true)return response({ok:true});
  if(upstreamJson?.error==='duplicate')return response({ok:true});
  return response({ok:false},502);
 }catch{return response({ok:false},502);}
}
export function GET(){return response({ok:false,error:'Method not allowed'},405);}
