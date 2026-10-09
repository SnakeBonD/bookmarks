module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
  try{
    const raw=String(req.query?.url||'').trim();
    if(!raw||raw.length>2048)return res.status(400).json({error:'invalid_url'});
    const u=new URL(raw);
    if(!['http:','https:'].includes(u.protocol))return res.status(400).json({error:'unsupported_protocol'});
    const hostname=u.hostname.toLowerCase();
    if(!hostname)return res.status(400).json({error:'invalid_host'});

    const upstream='https://www.google.com/s2/favicons?domain='+encodeURIComponent(hostname)+'&sz=64';
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),5000);
    let response;
    try{
      response=await fetch(upstream,{signal:controller.signal,redirect:'follow',headers:{'User-Agent':'SnakeBonD-Bookmarks/1.0.1'}});
    }finally{
      clearTimeout(timer);
    }

    if(!response.ok)return res.status(404).end();
    const type=response.headers.get('content-type')||'';
    if(!type.startsWith('image/'))return res.status(415).end();

    const data=Buffer.from(await response.arrayBuffer());
    if(!data.length||data.length>262144)return res.status(413).end();

    res.setHeader('Content-Type',type);
    res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    return res.status(200).send(data);
  }catch(err){
    if(err?.name==='AbortError')return res.status(504).end();
    return res.status(400).end();
  }
};
