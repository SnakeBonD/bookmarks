const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
for(const f of ['index.html','styles.css','app.js','README.md']){if(!fs.existsSync(path.join(root,f)))throw new Error('Missing '+f)}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
for(const s of ['Bookmarks v0.2','searchInput','bookmarkDialog'])if(!html.includes(s))throw new Error('Missing HTML marker '+s);
for(const s of ['localStorage','AI Tools Hub','renderContent','exportBtn','duplicateGroups','templates','quickNote'])if(!js.includes(s))throw new Error('Missing JS marker '+s);
console.log('PASS smoke test');
