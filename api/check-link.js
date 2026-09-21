const dns=require('node:dns').promises;
const net=require('node:net');

function privateIp(ip){
  if(net.isIPv4(ip)){
    const p=ip.split('.').map(Number),a=p[0],b=p[1];
    return a===0||a===10||a===127||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19))||a>=224;
  }
  if(net.isIPv6(ip)){
    const x=ip.toLowerCase();
    return x==='::'||x==='::1'||x.startsWith('fc')||x.startsWith('fd')||x.startsWith('fe8')||x.startsWith('fe9')||x.startsWith('fea')||x.startsWith('feb')||x.startsWith('::ffff:127.')||x.startsWith('::ffff:10.')||x.startsWith('::ffff:192.168.');
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
    const records=await dns.lookup(host,{all:true,verbatim:true});
    if(!records.length||records.some(r=>privateIp(r.address)))throw new Error('private_ip');
  }
  return u;
}
async function request(url,method){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),7000);
  try{
    return await fetch(url,{method,redirect:'manual',signal:controller.signal,headers:{'User-Agent':'SnakeBonD-Bookmarks-LinkChecker/0.4','Accept':'text/html,application/xhtml+xml,*/*;q=0.8',...(method==='GET'?{'Range':'bytes=0-0'}:{})}});
  }finally{clearTimeout(timer)}
}
async function check(raw){
  let current=await validate(raw),redirects=0;
  while(redirects<=5){
    let res;
    try{
      res=await request(current.toString(),'HEAD');
      if(res.status===405||res.status===501){res=await request(current.toString(),'GET')}
    }catch(err){return{ok:false,status:0,error:err.name==='AbortError'?'timeout':'network_error',url:current.toString()}}
    if(res.status>=300&&res.status<400&&res.headers.get('location')){
      const next=new URL(res.headers.get('location'),current);
      current=await validate(next.toString());redirects++;continue;
    }
    try{await res.body?.cancel()}catch{}
    const reachable=(res.status>=200&&res.status<400)||[401,403,405,429].includes(res.status);
    return{ok:reachable,status:res.status,url:current.toString(),redirects};
  }
  return{ok:false,status:0,error:'too_many_redirects',url:current.toString()};
}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  try{
    const raw=String(req.body?.url||'').trim();
    if(!raw||raw.length>2048)return res.status(400).json({error:'invalid_url'});
    const result=await check(raw);
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json(result);
  }catch(err){
    const code=['unsupported_protocol','credentials_not_allowed','private_host','private_ip'].includes(err.message)?400:502;
    return res.status(code).json({ok:false,error:err.message||'check_failed'});
  }
};
