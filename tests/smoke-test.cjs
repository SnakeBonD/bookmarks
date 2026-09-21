const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
for(const f of ['index.html','styles.css','app.js','README.md']){if(!fs.existsSync(path.join(root,f)))throw new Error('Missing '+f)}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
for(const s of ['Bookmarks v0.9','searchInput','bookmarkDialog'])if(!html.includes(s))throw new Error('Missing HTML marker '+s);
for(const s of ['localStorage','AI Tools Hub','renderContent','exportBtn','duplicateGroups','templates','quickNote','initCloud','cloudPush','cloudPull','suggestMetadata','checkCurrentPageLinks','visitCount','importBrowserHtml','exportBrowserHtml','wirePageReorder','serviceWorker','deferredInstallPrompt','updateNetworkStatus','widgetConfig','calendarWidgetHtml','openWidgetSettings','loadRssWidget','createSnapshot','restoreSnapshot','getBackups'])if(!js.includes(s))throw new Error('Missing JS marker '+s);
console.log('PASS smoke test');

for(const f of ['api/config.js','api/check-link.js','api/fetch-rss.js','supabase/migrations/001_bookmark_states.sql']){if(!fs.existsSync(path.join(root,f)))throw new Error('Missing cloud file '+f)}

for(const f of ['manifest.webmanifest','favicon.svg','sw.js']){if(!fs.existsSync(path.join(root,f)))throw new Error('Missing PWA file '+f)}

const invalidForEach=[/(^|[^$])\$\('\.drawer-item'\)\.forEach/,/(^|[^$])\$\('\[data-edit\]'\)\.forEach/,/(^|[^$])\$\('\[data-visit\]'\)\.forEach/,/(^|[^$])\$\('\[data-edit-page\]'\)\.forEach/];
if(invalidForEach.some(re=>re.test(js)))throw new Error('Invalid single-element selector used with forEach');
