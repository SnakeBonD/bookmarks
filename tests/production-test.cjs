const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

const html=read('index.html');
const vercel=JSON.parse(read('vercel.json'));
const robots=read('robots.txt');
const sitemap=read('sitemap.xml');
const pkg=JSON.parse(read('package.json'));
const sw=read('sw.js');
const nf=read('404.html');

if(pkg.version!=='1.0.0')throw new Error('package version is not 1.0.0');
if(!html.includes('<span class="version">v1.0</span>'))throw new Error('UI version is not v1.0');
if(!html.includes('https://bookmarks.snakebond.net/'))throw new Error('canonical production domain missing');
if(!html.includes('name="robots" content="noindex,nofollow,noarchive"'))throw new Error('private robots meta missing');
for(const marker of ['og:title','og:description','og:url','og:image'])if(!html.includes(marker))throw new Error('missing '+marker);
if(!robots.includes('Disallow: /'))throw new Error('robots.txt must block indexing');
if(!sitemap.includes('https://bookmarks.snakebond.net/'))throw new Error('canonical sitemap URL missing');
if(!nf.includes('Page introuvable')||!nf.includes('/404.css'))throw new Error('custom 404 incomplete');
if(!sw.includes("bookmarks-v1.0-shell"))throw new Error('PWA cache not bumped to v1.0');

const headers=JSON.stringify(vercel.headers||[]);
for(const header of ['Content-Security-Policy','X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy']) {
  if(!headers.includes(header))throw new Error('missing security header '+header);
}
if(headers.includes('service_role')||headers.includes('SUPABASE_SERVICE'))throw new Error('server secret reference exposed in headers');
if(!headers.includes("frame-ancestors 'none'"))throw new Error('CSP frame-ancestors missing');
if(!headers.includes("object-src 'none'"))throw new Error('CSP object-src missing');
console.log('PASS production certification');
