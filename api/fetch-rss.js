const dns=require('node:dns').promises;
const net=require('node:net');

function privateIp(ip){
  if(net.isIPv4(ip)){
    const p=ip.split('.').map(Number),a=p[0],b=p[1];
    return a===0||a===10||a===127||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19))||a>=224;
  }
  if(net.isIPv6(ip)){
    const x=ip.toLowerCase();
    return x==='::'||x==='::1'||x.startsWith('fc')||x.startsWith('fd')||/^fe[89ab]/.test(x);
  }
  return true;
}
async function validate(raw){
  const u=new URL(raw);
  if(!['http:','https:'].includes(u.protocol))throw new Error('unsupported_protocol');
  if(u.username||u.password)throw new Error('credentials_not_allowed');
  const host=u.hostname.replace(/^\[|\]$/g,'').toLowerCase();
  if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal'))throw new Error('private_host');
  if(net.isIP(host)){if(privateIp(host))throw new Error('private_ip')}
  else{
    const rows=await dns.lookup(host,{all:true,verbatim:true});
    if(!rows.length||rows.some(r=>privateIp(r.address)))throw new Error('private_ip');
  }
  return u;
}
async function fetchSafe(raw){
  let current=await validate(raw);
  for(let i=0;i<=5;i++){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
    let res;
    try{
      res=await fetch(current,{redirect:'manual',signal:controller.signal,headers:{'User-Agent':'SnakeBonD-Bookmarks-RSS/0.8','Accept':'application/rss+xml,application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.1'}});
    }finally{clearTimeout(timer)}
    if(res.status>=300&&res.status<400&&res.headers.get('location')){
      current=await validate(new URL(res.headers.get('location'),current).toString());continue;
    }
    if(!res.ok)throw new Error('http_'+res.status);
    const len=Number(res.headers.get('content-length')||0);
    if(len>1048576)throw new Error('feed_too_large');
    const reader=res.body.getReader();let size=0,chunks=[];
    while(true){
      const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;if(size>1048576){reader.cancel();throw new Error('feed_too_large')}
      chunks.push(value);
    }
    return {text:new TextDecoder().decode(Buffer.concat(chunks.map(x=>Buffer.from(x)))),url:current.toString()};
  }
  throw new Error('too_many_redirects');
}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  try{
    const raw=String(req.body?.url||'').trim();
    if(!raw||raw.length>2048)return res.status(400).json({error:'invalid_url'});
    const out=await fetchSafe(raw);
    res.setHeader('Cache-Control','private, max-age=0, must-revalidate');
    res.status(200).json(out);
  }catch(err){
    res.status(400).json({error:err.name==='AbortError'?'timeout':(err.message||'fetch_failed')});
  }
};
