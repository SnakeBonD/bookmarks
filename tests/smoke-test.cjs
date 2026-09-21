const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
for(const f of ['index.html','styles.css','app.js','README.md']){if(!fs.existsSync(path.join(root,f)))throw new Error('Missing '+f)}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
for(const s of ['Bookmarks v0.4','searchInput','bookmarkDialog'])if(!html.includes(s))throw new Error('Missing HTML marker '+s);
for(const s of ['localStorage','AI Tools Hub','renderContent','exportBtn','duplicateGroups','templates','quickNote','initCloud','cloudPush','cloudPull','suggestMetadata','checkCurrentPageLinks','visitCount'])if(!js.includes(s))throw new Error('Missing JS marker '+s);
console.log('PASS smoke test');

for(const f of ['api/config.js','api/check-link.js','supabase/migrations/001_bookmark_states.sql']){if(!fs.existsSync(path.join(root,f)))throw new Error('Missing cloud file '+f)}
