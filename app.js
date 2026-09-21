const STORAGE_KEY='snakebond-bookmarks-v01';
const THEME_KEY='snakebond-bookmarks-theme';
const BACKUP_KEY='snakebond-bookmarks-backups';
const VERSION='0.9';

const seed={
  version:VERSION,activePageId:'ai-studio',view:'grid',collapsed:{},settings:{note:''},
  pages:[
    {id:'finances',name:'FINANCES',icon:'💰'},{id:'ai-studio',name:'SnakeBonD AI Studio',icon:'🧠'},
    {id:'informatique',name:'INFORMATIQUE',icon:'🖥️'},{id:'smartphone',name:'SMARTPHONE',icon:'📱'},
    {id:'photo-restoration',name:'Photo Restoration',icon:'📷'},{id:'skool',name:'SKOOL',icon:'🏫'},
    {id:'procedures',name:'PROCÉDURES',icon:'🧭'},{id:'ebooks',name:'eBooks',icon:'📚'},
    {id:'domotique',name:'DOMOTIQUE',icon:'🏠'},{id:'genealogie',name:'GENEALOGIE',icon:'🗃️'}
  ],
  bookmarks:[
    bm('chatgpt','ChatGPT','https://chatgpt.com','ai-studio','AI Tools Hub','TEXTE / LLM','Assistants','Assistant général et création','ai,llm',true,'Utilisé'),
    bm('gemini','Gemini','https://gemini.google.com','ai-studio','AI Tools Hub','TEXTE / LLM','Assistants','Assistant Google et génération multimodale','ai,llm',false,'Utilisé'),
    bm('midjourney','Midjourney','https://www.midjourney.com','ai-studio','AI Tools Hub','IMAGE','Génération','Génération d’images','image,ai',true,'Utilisé'),
    bm('ideogram','Ideogram','https://ideogram.ai','ai-studio','AI Tools Hub','IMAGE','Génération','Images et typographie','image,design',false,'Utilisé'),
    bm('kling','Kling AI','https://klingai.com','ai-studio','AI Tools Hub','VIDEO','Image-to-video','Génération vidéo IA','video,ai',false,'Utilisé'),
    bm('suno','Suno','https://suno.com','ai-studio','AI Tools Hub','MUSIQUE / AUDIO','Génération','Création musicale par IA','music,audio',false,'Utilisé'),
    bm('github','GitHub','https://github.com','informatique','Développement','CODE','Dépôts','Code et versions','dev,git',true,'Utilisé'),
    bm('vercel','Vercel','https://vercel.com','informatique','Développement','HÉBERGEMENT','Déploiement','Déploiement web','dev,hosting',false,'Utilisé'),
    bm('notion','Notion','https://www.notion.so','procedures','Organisation','DOCUMENTATION','Notes','Documentation et procédures','notes,docs',true,'Utilisé'),
    bm('homeassistant','Home Assistant','https://www.home-assistant.io','domotique','Maison','DOMOTIQUE','Plateforme','Automatisation maison','home,iot',true,'Utilisé')
  ]
};
function bm(id,name,url,pageId,category,subcategory,group,description,tags,pinned,status){return{id,name,url,pageId,category,subcategory,group,description,tags:tags.split(','),pinned,status,createdAt:new Date().toISOString()}}
function uid(prefix='id'){return prefix+'-'+Math.random().toString(36).slice(2,10)}
function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!x||!x.pages||!x.bookmarks)throw 0;x.version=VERSION;x.collapsed=x.collapsed||{};x.settings=x.settings||{note:''};x.settings.pageWidgets=x.settings.pageWidgets||{};x.settings.pageNotes=x.settings.pageNotes||{};x.settings.searchEngine=x.settings.searchEngine||'google';x.settings.rssUrls=x.settings.rssUrls||{};return x}catch{return clone(seed)}}
let state=load();
let cloudClient=null,cloudSession=null,cloudReady=false,cloudTimer=null,cloudBusy=false;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const els={pageTabs:$('#pageTabs'),content:$('#content'),widgets:$('#widgets'),search:$('#searchInput'),scope:$('#scopeSelect'),view:$('#viewSelect'),drawer:$('#pagesDrawer'),backdrop:$('#backdrop'),drawerPages:$('#drawerPages'),pageSearch:$('#pageSearch'),bookmarkDialog:$('#bookmarkDialog'),bookmarkForm:$('#bookmarkForm'),pageDialog:$('#pageDialog'),pageForm:$('#pageForm'),toolsDialog:$('#toolsDialog'),cloudDialog:$('#cloudDialog'),widgetDialog:$('#widgetDialog'),backupDialog:$('#backupDialog')};
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));scheduleCloudSync()}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function currentPage(){return state.pages.find(p=>p.id===state.activePageId)||state.pages[0]}
function favicon(url){try{return`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(new URL(url).origin)}&sz=64`}catch{return''}}
function normalizeUrl(url){try{const u=new URL(url);u.hash='';u.hostname=u.hostname.toLowerCase();if(u.pathname==='/'&&!u.search)u.pathname='';return u.toString().replace(/\/$/,'')}catch{return url.trim().toLowerCase()}}
function groupBy(arr,key){return arr.reduce((o,x)=>((o[x[key]||'Sans '+key]=(o[x[key]||'Sans '+key]||[])).push(x),o),{})}
function render(){renderTabs();renderDrawer();renderWidgets();renderContent();fillPageSelect();save()}
function renderTabs(){els.pageTabs.innerHTML=state.pages.slice(0,7).map(p=>`<button class="page-tab ${p.id===state.activePageId?'active':''}" data-page="${p.id}">${p.icon||'🔖'} ${esc(p.name)}<span class="count">${state.bookmarks.filter(b=>b.pageId===p.id).length}</span></button>`).join('');$$('.page-tab').forEach(b=>{b.onclick=()=>switchPage(b.dataset.page);b.ondblclick=()=>openPage(b.dataset.page)})}
function renderDrawer(){const q=els.pageSearch.value.toLowerCase();els.drawerPages.innerHTML=state.pages.filter(p=>p.name.toLowerCase().includes(q)).map(p=>`<div class="drawer-item ${p.id===state.activePageId?'active':''}" draggable="true" data-page="${p.id}"><span>${p.icon||'🔖'}</span><strong>${esc(p.name)}</strong><span>${state.bookmarks.filter(b=>b.pageId===p.id).length}</span><button class="page-action" data-edit-page="${p.id}" title="Modifier">⋮</button></div>`).join('');$$('.drawer-item').forEach(x=>x.onclick=e=>{if(e.target.closest('[data-edit-page]'))return;switchPage(x.dataset.page);closeDrawer()});$$('[data-edit-page]').forEach(x=>x.onclick=e=>{e.stopPropagation();openPage(x.dataset.editPage)});wirePageReorder()}
function wirePageReorder(){
  let dragged=null;
  $$('.drawer-item').forEach(el=>{
    el.addEventListener('dragstart',()=>{dragged=el.dataset.page;el.classList.add('dragging')});
    el.addEventListener('dragend',()=>el.classList.remove('dragging'));
    el.addEventListener('dragover',e=>e.preventDefault());
    el.addEventListener('drop',e=>{
      e.preventDefault();const target=el.dataset.page;if(!dragged||dragged===target)return;
      const a=state.pages.findIndex(p=>p.id===dragged),t=state.pages.findIndex(p=>p.id===target);
      if(a<0||t<0)return;const[item]=state.pages.splice(a,1);state.pages.splice(t,0,item);render();
    });
  });
}
function switchPage(id){state.activePageId=id;els.search.value='';render()}
function widgetConfig(pageId){return state.settings.pageWidgets[pageId]||['clock','stats','most','recent','note']}
function calendarWidgetHtml(){
  const d=new Date(),y=d.getFullYear(),m=d.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),offset=(first+6)%7;
  const names=['L','M','M','J','V','S','D'];let cells=names.map(n=>'<b>'+n+'</b>');
  for(let i=0;i<offset;i++)cells.push('<span></span>');
  for(let day=1;day<=days;day++)cells.push('<span class="'+(day===d.getDate()?'today':'')+'">'+day+'</span>');
  return '<div class="mini-cal">'+cells.join('')+'</div>';
}
function renderWidgets(){
  const page=currentPage(),pageItems=state.bookmarks.filter(b=>b.pageId===page?.id),count=pageItems.length,pins=pageItems.filter(b=>b.pinned).length;
  const most=[...pageItems].sort((a,b)=>(b.visitCount||0)-(a.visitCount||0))[0],recent=[...pageItems].filter(b=>b.lastUsedAt).sort((a,b)=>new Date(b.lastUsedAt)-new Date(a.lastUsedAt))[0];
  const cfg=widgetConfig(page?.id),parts=[];
  for(const type of cfg){
    if(type==='clock')parts.push('<div class="widget"><div class="widget-title">Heure</div><div id="clockWidget" class="widget-value"></div></div>');
    if(type==='stats')parts.push(`<div class="widget"><div class="widget-title">Page</div><div class="widget-value">${esc(page?.name||'')}</div><div class="tool-note">${count} favoris · ${pins} épinglés</div></div>`);
    if(type==='most')parts.push(`<div class="widget"><div class="widget-title">Plus utilisé</div><div class="widget-value">${esc(most?.name||'—')}</div><div class="tool-note">${most?.visitCount||0} ouverture${(most?.visitCount||0)>1?'s':''}</div></div>`);
    if(type==='recent')parts.push(`<div class="widget"><div class="widget-title">Dernier utilisé</div><div class="widget-value">${esc(recent?.name||'—')}</div><div class="tool-note">${recent?.lastUsedAt?new Date(recent.lastUsedAt).toLocaleString('fr-FR'):'Aucun historique'}</div></div>`);
    if(type==='note')parts.push(`<div class="widget"><div class="widget-title">Note rapide</div><textarea id="quickNote" class="widget-note" placeholder="Une note pour cette page…">${esc(state.settings.pageNotes[page?.id]||state.settings.note||'')}</textarea></div>`);
    if(type==='search')parts.push('<div class="widget"><div class="widget-title">Recherche web</div><form id="webSearchForm" class="web-search"><input id="webSearchInput" placeholder="Rechercher…"><button class="btn primary">Go</button></form></div>');
    if(type==='calendar')parts.push('<div class="widget"><div class="widget-title">Calendrier</div>'+calendarWidgetHtml()+'</div>');
    if(type==='rss')parts.push('<div class="widget widget-rss"><div class="widget-title">Flux RSS</div><div id="rssWidgetBody" class="tool-note">Chargement…</div></div>');
  }
  els.widgets.innerHTML=parts.join('');
  tickClock();
  const note=$('#quickNote');if(note)note.oninput=e=>{state.settings.pageNotes[page.id]=e.target.value;save()};
  const form=$('#webSearchForm');if(form)form.onsubmit=e=>{e.preventDefault();const q=$('#webSearchInput').value.trim();if(!q)return;const engines={google:'https://www.google.com/search?q=',duckduckgo:'https://duckduckgo.com/?q=',bing:'https://www.bing.com/search?q='};window.open((engines[state.settings.searchEngine]||engines.google)+encodeURIComponent(q),'_blank','noopener')};
  if(cfg.includes('rss'))loadRssWidget(page?.id);
}
async function loadRssWidget(pageId){
  const body=$('#rssWidgetBody'),url=state.settings.rssUrls?.[pageId];
  if(!body)return;
  if(!url){body.textContent='Configure une URL RSS dans les widgets.';return}
  try{
    const res=await fetch('/api/fetch-rss',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
    const data=await res.json();if(!res.ok||!data.text)throw new Error(data.error||'rss_error');
    const doc=new DOMParser().parseFromString(data.text,'application/xml');
    if(doc.querySelector('parsererror'))throw new Error('xml_invalid');
    const nodes=[...doc.querySelectorAll('item')].slice(0,5);
    const atom=nodes.length?nodes:[...doc.querySelectorAll('entry')].slice(0,5);
    if(!atom.length){body.textContent='Aucun article détecté.';return}
    body.innerHTML='<div class="rss-items">'+atom.map(node=>{
      const title=(node.querySelector('title')?.textContent||'Sans titre').trim();
      const link=node.querySelector('link')?.getAttribute('href')||node.querySelector('link')?.textContent||'';
      const date=(node.querySelector('pubDate, published, updated')?.textContent||'').trim();
      return '<a class="rss-item" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer"><strong>'+esc(title)+'</strong>'+(date?'<span>'+esc(new Date(date).toLocaleDateString('fr-FR'))+'</span>':'')+'</a>';
    }).join('')+'</div>';
  }catch(err){console.error('RSS error',err);body.textContent='Flux RSS indisponible.'}
}

function tickClock(){const e=$('#clockWidget');if(e)e.textContent=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())}
setInterval(tickClock,1000);
function filteredBookmarks(){const q=els.search.value.trim().toLowerCase();let arr=els.scope.value==='all'?state.bookmarks:state.bookmarks.filter(b=>b.pageId===state.activePageId);if(q)arr=arr.filter(b=>[b.name,b.url,b.category,b.subcategory,b.group,b.description,...(b.tags||[])].join(' ').toLowerCase().includes(q));return arr.sort((a,b)=>(b.pinned-a.pinned)||a.name.localeCompare(b.name))}
function renderContent(){const page=currentPage(),items=filteredBookmarks();const title=els.scope.value==='all'&&els.search.value?'Résultats globaux':`${page?.icon||'🔖'} ${esc(page?.name||'Bookmarks')}`;let html=`<section class="hero"><div><h1>${title}</h1><p>${items.length} favori${items.length>1?'s':''}${els.search.value?' trouvé'+(items.length>1?'s':''):''}</p></div><div class="hero-actions"><button class="btn secondary" id="editCurrentPage">⚙ Page</button><button class="btn secondary" id="addCategoryQuick">+ Catégorie</button><button class="btn primary" id="heroAddBookmark">+ Favori</button></div></section>`;
if(!items.length){html+='<div class="empty">Aucun favori ici. Ajoute ton premier lien ou modifie la recherche.</div>';els.content.innerHTML=html;wireHero();return}
for(const [cat,catItems] of Object.entries(groupBy(items,'category'))){const key='cat:'+state.activePageId+':'+cat,collapsed=!!state.collapsed[key];html+=`<section class="category"><div class="category-head"><button class="page-action category-title" data-collapse="${esc(key)}">${collapsed?'▸':'▾'} ${esc(cat)}</button><div class="category-meta">${catItems.length} lien${catItems.length>1?'s':''}</div></div><div class="${collapsed?'hidden':''}">`;for(const [sub,subItems] of Object.entries(groupBy(catItems,'subcategory'))){html+=`<div class="subcategory"><div class="subcategory-head"><div class="subcategory-title">${esc(sub)}</div><span class="status">${subItems.length}</span></div>`;for(const [grp,grpItems] of Object.entries(groupBy(subItems,'group'))){html+=`<div class="group"><div class="group-title">${esc(grp)}</div><div class="${state.view==='list'?'bookmarks-list':'bookmarks-grid'}">${grpItems.map(card).join('')}</div></div>`}html+='</div>'}html+='</div></section>'}
els.content.innerHTML=html;wireHero();wireCards();$$('[data-collapse]').forEach(b=>b.onclick=()=>{state.collapsed[b.dataset.collapse]=!state.collapsed[b.dataset.collapse];render()})}
function card(b){const health=b.linkHealth?'<span class="health '+(b.linkHealth.ok?'health-ok':'health-bad')+'" title="Vérifié '+esc(b.linkHealth.checkedAt||'')+'">'+(b.linkHealth.ok?'✓':'⚠')+'</span>':'';return`<article class="bookmark" draggable="true" data-id="${b.id}"><div class="bookmark-icon"><img src="${favicon(b.url)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='🔗'"></div><div class="bookmark-main"><a class="bookmark-name" data-visit="${b.id}" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${b.pinned?'<span class="pin">📌</span> ':''}${esc(b.name)} ${health}</a><div class="bookmark-desc">${esc(b.description||b.url)}</div><div class="bookmark-tags">${(b.tags||[]).slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}<span class="status">${esc(b.status||'Utilisé')}</span>${b.visitCount?'<span class="tag">'+b.visitCount+'×</span>':''}</div></div><button class="bookmark-menu" data-edit="${b.id}" title="Modifier">⋮</button></article>`}
function wireHero(){const h=$('#heroAddBookmark');if(h)h.onclick=()=>openBookmark();const c=$('#addCategoryQuick');if(c)c.onclick=()=>{openBookmark();setTimeout(()=>$('#bmCategory').focus(),50)};const p=$('#editCurrentPage');if(p)p.onclick=()=>openPage(state.activePageId)}
function wireCards(){$$('[data-edit]').forEach(x=>x.onclick=e=>{e.preventDefault();openBookmark(x.dataset.edit)});$$('[data-visit]').forEach(x=>x.addEventListener('click',()=>{const b=state.bookmarks.find(v=>v.id===x.dataset.visit);if(b){b.visitCount=(b.visitCount||0)+1;b.lastUsedAt=new Date().toISOString();save();renderWidgets()}}));let dragged=null;$$('.bookmark').forEach(el=>{el.addEventListener('dragstart',()=>{dragged=el.dataset.id;el.classList.add('dragging')});el.addEventListener('dragend',()=>el.classList.remove('dragging'));el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();const target=e.currentTarget.dataset.id;if(!dragged||dragged===target)return;const a=state.bookmarks.findIndex(b=>b.id===dragged),t=state.bookmarks.findIndex(b=>b.id===target);const[item]=state.bookmarks.splice(a,1);state.bookmarks.splice(t,0,item);render()})})}
function fillPageSelect(){$('#bmPage').innerHTML=state.pages.map(p=>`<option value="${p.id}">${p.icon||'🔖'} ${esc(p.name)}</option>`).join('')}
function openBookmark(id){const b=id?state.bookmarks.find(x=>x.id===id):null;$('#bookmarkDialogTitle').textContent=b?'Modifier le favori':'Ajouter un favori';$('#bookmarkId').value=b?.id||'';$('#bmName').value=b?.name||'';$('#bmUrl').value=b?.url||'';$('#bmPage').value=b?.pageId||state.activePageId;$('#bmCategory').value=b?.category||'';$('#bmSubcategory').value=b?.subcategory||'';$('#bmGroup').value=b?.group||'';$('#bmTags').value=(b?.tags||[]).join(', ');$('#bmStatus').value=b?.status||'Utilisé';$('#bmDescription').value=b?.description||'';$('#bmPinned').checked=!!b?.pinned;$('#deleteBookmarkBtn').classList.toggle('hidden',!b);els.bookmarkDialog.showModal()}
els.bookmarkForm.addEventListener('submit',e=>{e.preventDefault();const url=$('#bmUrl').value.trim();try{const u=new URL(url);if(!['http:','https:'].includes(u.protocol))throw 0}catch{return alert('URL invalide. Utilise http:// ou https://')};const id=$('#bookmarkId').value||uid('bm');const dupe=state.bookmarks.find(b=>b.id!==id&&normalizeUrl(b.url)===normalizeUrl(url));if(dupe&&!confirm(`Ce lien existe déjà sous “${dupe.name}”. L’ajouter quand même ?`))return;const old=state.bookmarks.find(b=>b.id===id);const data={id,name:$('#bmName').value.trim(),url,pageId:$('#bmPage').value,category:$('#bmCategory').value.trim()||'Sans catégorie',subcategory:$('#bmSubcategory').value.trim()||'Général',group:$('#bmGroup').value.trim()||'Favoris',tags:$('#bmTags').value.split(',').map(x=>x.trim()).filter(Boolean),status:$('#bmStatus').value,description:$('#bmDescription').value.trim(),pinned:$('#bmPinned').checked,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const i=state.bookmarks.findIndex(b=>b.id===id);if(i>=0)state.bookmarks[i]=data;else state.bookmarks.push(data);els.bookmarkDialog.close();state.activePageId=data.pageId;render()});
$('#deleteBookmarkBtn').onclick=()=>{const id=$('#bookmarkId').value,b=state.bookmarks.find(x=>x.id===id);if(b&&confirm(`Supprimer “${b.name}” ?`)){state.bookmarks=state.bookmarks.filter(x=>x.id!==id);els.bookmarkDialog.close();render()}};
$$('.close-modal').forEach(b=>b.onclick=()=>els.bookmarkDialog.close());$('#addBookmarkBtn').onclick=()=>openBookmark();

const templates={
blank:[],
ai:[['ChatGPT','https://chatgpt.com','AI Tools Hub','TEXTE / LLM','Assistants'],['Midjourney','https://www.midjourney.com','AI Tools Hub','IMAGE','Génération'],['Kling AI','https://klingai.com','AI Tools Hub','VIDEO','Génération']],
dev:[['GitHub','https://github.com','Développement','CODE','Dépôts'],['Vercel','https://vercel.com','Développement','HÉBERGEMENT','Déploiement']],
home:[['Home Assistant','https://www.home-assistant.io','Maison','DOMOTIQUE','Plateforme']]
};
function openPage(id){const p=id?state.pages.find(x=>x.id===id):null;els.pageForm.reset();$('#pageDialogTitle').textContent=p?'Modifier la page':'Nouvelle page';$('#pageId').value=p?.id||'';$('#pageName').value=p?.name||'';$('#pageIcon').value=p?.icon||'';$('#templateLabel').classList.toggle('hidden',!!p);$('#duplicatePageBtn').classList.toggle('hidden',!p);$('#deletePageBtn').classList.toggle('hidden',!p);els.pageDialog.showModal();setTimeout(()=>$('#pageName').focus(),40)}
$('#addPageBtn').onclick=()=>openPage();$('#drawerAddPage').onclick=()=>openPage();$$('.close-page-modal').forEach(b=>b.onclick=()=>els.pageDialog.close());
els.pageForm.addEventListener('submit',e=>{e.preventDefault();const id=$('#pageId').value,name=$('#pageName').value.trim();if(!name)return;if(id){const p=state.pages.find(x=>x.id===id);p.name=name;p.icon=$('#pageIcon').value.trim()||'🔖'}else{const p={id:uid('page'),name,icon:$('#pageIcon').value.trim()||'🔖'};state.pages.push(p);for(const [n,u,c,s,g] of templates[$('#pageTemplate').value]||[])state.bookmarks.push({id:uid('bm'),name:n,url:u,pageId:p.id,category:c,subcategory:s,group:g,description:'',tags:[],status:'Utilisé',pinned:false,createdAt:new Date().toISOString()});state.activePageId=p.id}els.pageDialog.close();render()});
$('#duplicatePageBtn').onclick=()=>{const id=$('#pageId').value,p=state.pages.find(x=>x.id===id);if(!p)return;const np={id:uid('page'),name:p.name+' — copie',icon:p.icon};state.pages.push(np);state.bookmarks.filter(b=>b.pageId===id).forEach(b=>state.bookmarks.push({...clone(b),id:uid('bm'),pageId:np.id,createdAt:new Date().toISOString()}));state.activePageId=np.id;els.pageDialog.close();render()};
$('#deletePageBtn').onclick=()=>{const id=$('#pageId').value,p=state.pages.find(x=>x.id===id);if(!p||state.pages.length===1)return alert('Il faut conserver au moins une page.');const count=state.bookmarks.filter(b=>b.pageId===id).length;if(confirm(`Supprimer “${p.name}” et ses ${count} favoris ?`)){createSnapshot('Avant suppression de page');state.pages=state.pages.filter(x=>x.id!==id);state.bookmarks=state.bookmarks.filter(b=>b.pageId!==id);state.activePageId=state.pages[0].id;els.pageDialog.close();render()}};


function escapeHtmlText(s=''){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function importBrowserHtml(html,pageId){
  const doc=new DOMParser().parseFromString(html,'text/html'),found=[];
  function walk(dl,path=[]){
    if(!dl)return;
    const children=[...dl.children];
    for(let i=0;i<children.length;i++){
      const node=children[i];
      if(node.tagName==='DT'){
        const h=[...node.children].find(x=>x.tagName==='H3');
        const a=[...node.children].find(x=>x.tagName==='A');
        if(h){
          let nested=[...node.children].find(x=>x.tagName==='DL');
          if(!nested&&children[i+1]?.tagName==='DL')nested=children[++i];
          walk(nested,[...path,h.textContent.trim()].filter(Boolean));
        }else if(a?.href){
          found.push({name:(a.textContent||a.href).trim(),url:a.href,path});
        }
      }else if(node.tagName==='DL')walk(node,path);
      else{
        const nested=node.querySelector?.(':scope > dl');if(nested)walk(nested,path);
      }
    }
  }
  const root=doc.querySelector('dl');walk(root,[]);
  let added=0,skipped=0;const existing=new Set(state.bookmarks.map(b=>normalizeUrl(b.url)));
  for(const item of found){
    const url=normalizeUrl(item.url);if(existing.has(url)){skipped++;continue}
    existing.add(url);
    const parts=item.path.filter(Boolean),category=parts[0]||'Import navigateur',subcategory=parts[1]||'GÉNÉRAL',group=parts.slice(2).join(' / ')||'Favoris';
    state.bookmarks.push({id:uid('bm'),name:item.name,url:item.url,pageId,category,subcategory,group,description:'Importé depuis les favoris du navigateur',tags:['import'],status:'Utilisé',pinned:false,createdAt:new Date().toISOString()});added++;
  }
  return{found:found.length,added,skipped};
}
function exportBrowserHtml(){
  const lines=['<!DOCTYPE NETSCAPE-Bookmark-file-1>','<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">','<TITLE>Bookmarks</TITLE>','<H1>Bookmarks</H1>','<DL><p>'];
  for(const page of state.pages){
    lines.push(`<DT><H3>${escapeHtmlText(page.name)}</H3><DL><p>`);
    const items=state.bookmarks.filter(b=>b.pageId===page.id);
    const cats=groupBy(items,'category');
    for(const [cat,catItems] of Object.entries(cats)){
      lines.push(`<DT><H3>${escapeHtmlText(cat)}</H3><DL><p>`);
      const subs=groupBy(catItems,'subcategory');
      for(const [sub,subItems] of Object.entries(subs)){
        lines.push(`<DT><H3>${escapeHtmlText(sub)}</H3><DL><p>`);
        const groups=groupBy(subItems,'group');
        for(const [grp,grpItems] of Object.entries(groups)){
          lines.push(`<DT><H3>${escapeHtmlText(grp)}</H3><DL><p>`);
          for(const b of grpItems)lines.push(`<DT><A HREF="${escapeHtmlText(b.url)}">${escapeHtmlText(b.name)}</A>`);
          lines.push('</DL><p>');
        }
        lines.push('</DL><p>');
      }
      lines.push('</DL><p>');
    }
    lines.push('</DL><p>');
  }
  lines.push('</DL><p>');
  const blob=new Blob([lines.join('\n')],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bookmarks.html';a.click();URL.revokeObjectURL(a.href);
}


function getBackups(){try{return JSON.parse(localStorage.getItem(BACKUP_KEY))||[]}catch{return[]}}
function saveBackups(list){localStorage.setItem(BACKUP_KEY,JSON.stringify(list.slice(0,10)))}
function createSnapshot(label='Snapshot manuel'){
  const list=getBackups();
  list.unshift({id:uid('snapshot'),label,createdAt:new Date().toISOString(),payload:clone(state)});
  saveBackups(list);renderBackupList();
}
function renderBackupList(){
  const el=$('#backupList');if(!el)return;const list=getBackups();
  if(!list.length){el.innerHTML='<div class="empty">Aucune sauvegarde.</div>';return}
  el.innerHTML=list.map(x=>`<div class="backup-item"><div><strong>${esc(x.label)}</strong><div class="tool-note">${new Date(x.createdAt).toLocaleString('fr-FR')}</div></div><div class="backup-actions"><button class="btn secondary" data-restore="${x.id}">Restaurer</button><button class="btn danger" data-delete-backup="${x.id}">Supprimer</button></div></div>`).join('');
  $('[data-restore]').forEach(b=>b.onclick=()=>restoreSnapshot(b.dataset.restore));
  $('[data-delete-backup]').forEach(b=>b.onclick=()=>deleteSnapshot(b.dataset.deleteBackup));
}
function openBackups(){renderBackupList();els.backupDialog.showModal()}
function restoreSnapshot(id){
  const snap=getBackups().find(x=>x.id===id);if(!snap)return;
  if(!confirm('Restaurer cette sauvegarde ? Les données actuelles seront remplacées.'))return;
  createSnapshot('Avant restauration');
  state=clone(snap.payload);state.version=VERSION;state.settings=state.settings||{};state.collapsed=state.collapsed||{};localStorage.setItem(STORAGE_KEY,JSON.stringify(state));els.backupDialog.close();render();
}
function deleteSnapshot(id){
  if(!confirm('Supprimer cette sauvegarde ?'))return;
  saveBackups(getBackups().filter(x=>x.id!==id));renderBackupList();
}
if($('#closeBackups'))$('#closeBackups').onclick=()=>els.backupDialog.close();
if($('#createSnapshotBtn'))$('#createSnapshotBtn').onclick=()=>createSnapshot();

function duplicateGroups(){const m=new Map;for(const b of state.bookmarks){const k=normalizeUrl(b.url);if(!m.has(k))m.set(k,[]);m.get(k).push(b)}return[...m.values()].filter(g=>g.length>1)}
async function initCloud(){
  try{
    const res=await fetch('/api/config',{cache:'no-store'});
    if(!res.ok)throw 0;
    const cfg=await res.json();
    if(!cfg.enabled||!cfg.supabaseUrl||!cfg.supabasePublishableKey||!window.supabase)throw 0;
    cloudClient=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
    const {data}=await cloudClient.auth.getSession();
    cloudSession=data.session||null;cloudReady=true;
    cloudClient.auth.onAuthStateChange((_event,session)=>{cloudSession=session;updateCloudUI()});
  }catch{cloudReady=false;cloudClient=null;cloudSession=null}
  updateCloudUI();
}
function cloudLabel(){if(!cloudReady)return'Cloud non configuré';if(!cloudSession)return'Cloud prêt — non connecté';return'Synchronisé avec '+(cloudSession.user?.email||'le cloud')}
function updateCloudUI(){
  const btn=$('#cloudBtn');if(btn){btn.textContent=cloudSession?'☁ Connecté':'☁ Cloud';btn.title=cloudLabel()}
  const st=$('#cloudStatus');if(st)st.innerHTML=`<span class="${cloudSession?'sync-ok':cloudReady?'sync-warn':''}">${esc(cloudLabel())}</span>`;
  const auth=$('#cloudAuthArea'),signed=$('#cloudSignedArea');if(auth)auth.classList.toggle('hidden',!!cloudSession||!cloudReady);if(signed)signed.classList.toggle('hidden',!cloudSession);
  if($('#cloudUser'))$('#cloudUser').textContent=cloudSession?.user?.email||'';
  if($('#cloudAutoSync'))$('#cloudAutoSync').checked=!!state.settings.cloudAutoSync;
}
async function cloudPush(){
  if(!cloudClient||!cloudSession||cloudBusy)return false;cloudBusy=true;
  try{
    const payload=clone(state);payload.settings=payload.settings||{};payload.settings.lastCloudSync=new Date().toISOString();
    const {error}=await cloudClient.from('bookmark_states').upsert({user_id:cloudSession.user.id,payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(error)throw error;state.settings.lastCloudSync=payload.settings.lastCloudSync;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));updateCloudUI();return true
  }catch(err){console.error('Cloud push failed',err);return false}finally{cloudBusy=false}
}
async function cloudPull(){
  if(!cloudClient||!cloudSession||cloudBusy)return false;cloudBusy=true;
  try{
    const {data,error}=await cloudClient.from('bookmark_states').select('payload,updated_at').eq('user_id',cloudSession.user.id).maybeSingle();
    if(error)throw error;if(!data?.payload)return false;
    state=data.payload;state.version=VERSION;state.collapsed=state.collapsed||{};state.settings=state.settings||{};localStorage.setItem(STORAGE_KEY,JSON.stringify(state));render();return true
  }catch(err){console.error('Cloud pull failed',err);return false}finally{cloudBusy=false}
}
function scheduleCloudSync(){
  if(!cloudReady||!cloudSession||!state.settings?.cloudAutoSync)return;
  clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>cloudPush(),1200);
}
function openCloud(){updateCloudUI();els.cloudDialog?.showModal()}
if($('#cloudBtn'))$('#cloudBtn').onclick=openCloud;if($('#closeCloud'))$('#closeCloud').onclick=()=>els.cloudDialog.close();
if($('#cloudLoginBtn'))$('#cloudLoginBtn').onclick=async()=>{if(!cloudClient)return;const email=$('#cloudEmail').value.trim();if(!email)return alert('Indique une adresse e-mail.');const {error}=await cloudClient.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin}});if(error)return alert(error.message);alert('Lien de connexion envoyé par e-mail.')};
if($('#cloudLogoutBtn'))$('#cloudLogoutBtn').onclick=async()=>{if(cloudClient)await cloudClient.auth.signOut();cloudSession=null;updateCloudUI()};
if($('#cloudPushBtn'))$('#cloudPushBtn').onclick=async()=>{const ok=await cloudPush();alert(ok?'Sauvegarde cloud envoyée.':'Échec de la sauvegarde cloud.')};
if($('#cloudPullBtn'))$('#cloudPullBtn').onclick=async()=>{if(!confirm('Remplacer les données locales par la sauvegarde cloud ?'))return;createSnapshot('Avant restauration cloud');const ok=await cloudPull();alert(ok?'Sauvegarde cloud chargée.':'Aucune sauvegarde cloud disponible ou erreur.')};
if($('#cloudAutoSync'))$('#cloudAutoSync').onchange=e=>{state.settings.cloudAutoSync=e.target.checked;save();updateCloudUI()};

function suggestMetadata(name,url){
  const text=(name+' '+url).toLowerCase(),host=(()=>{try{return new URL(url).hostname.replace(/^www\./,'')}catch{return''}})();
  const known={
    'chatgpt.com':['AI Tools Hub','TEXTE / LLM','Assistants',['ai','llm']],
    'gemini.google.com':['AI Tools Hub','TEXTE / LLM','Assistants',['ai','llm']],
    'midjourney.com':['AI Tools Hub','IMAGE','Génération',['ai','image']],
    'ideogram.ai':['AI Tools Hub','IMAGE','Génération',['ai','image','design']],
    'klingai.com':['AI Tools Hub','VIDEO','Génération',['ai','video']],
    'suno.com':['AI Tools Hub','MUSIQUE / AUDIO','Génération',['ai','audio','music']],
    'github.com':['Développement','CODE','Dépôts',['dev','git']],
    'vercel.com':['Développement','HÉBERGEMENT','Déploiement',['dev','hosting']],
    'notion.so':['Organisation','DOCUMENTATION','Notes',['notes','docs']]
  };
  if(known[host])return known[host];
  if(/image|photo|design|midjourney|flux|stable diffusion/.test(text))return['AI Tools Hub','IMAGE','Général',['image']];
  if(/video|kling|runway|veo|sora/.test(text))return['AI Tools Hub','VIDEO','Général',['video']];
  if(/audio|music|musique|voice|voix|suno/.test(text))return['AI Tools Hub','MUSIQUE / AUDIO','Général',['audio']];
  if(/code|dev|github|api|program/.test(text))return['Développement','CODE','Outils',['dev']];
  if(/home assistant|domotique|iot/.test(text))return['Maison','DOMOTIQUE','Outils',['iot']];
  return['Favoris','GÉNÉRAL','Liens',[]];
}
if($('#smartSuggestBtn'))$('#smartSuggestBtn').onclick=()=>{const s=suggestMetadata($('#bmName').value,$('#bmUrl').value);$('#bmCategory').value=s[0];$('#bmSubcategory').value=s[1];$('#bmGroup').value=s[2];const tags=new Set([...$('#bmTags').value.split(',').map(x=>x.trim()).filter(Boolean),...s[3]]);$('#bmTags').value=[...tags].join(', ')};

async function checkLinkBookmark(b){
  try{
    const res=await fetch('/api/check-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:b.url})});
    const data=await res.json();
    b.linkHealth={ok:!!data.ok,status:data.status||0,error:data.error||'',checkedAt:new Date().toISOString(),finalUrl:data.url||b.url};
  }catch(err){b.linkHealth={ok:false,status:0,error:'checker_unavailable',checkedAt:new Date().toISOString()}}
}
async function checkCurrentPageLinks(){
  const list=state.bookmarks.filter(b=>b.pageId===state.activePageId);
  if(!list.length)return alert('Aucun lien sur cette page.');
  const btn=$('#checkLinksBtn');if(btn){btn.disabled=true;btn.textContent='Vérification…'}
  let index=0,done=0;
  async function worker(){while(index<list.length){const b=list[index++];await checkLinkBookmark(b);done++;if(btn)btn.textContent=`Vérification ${done}/${list.length}`;save()}}
  await Promise.all(Array.from({length:Math.min(3,list.length)},()=>worker()));
  render();openTools();
}
function openWidgetSettings(){
  const cfg=new Set(widgetConfig(state.activePageId));$('input[name="widgetType"]').forEach(x=>x.checked=cfg.has(x.value));$('#searchEngine').value=state.settings.searchEngine||'google';els.widgetDialog.showModal()
}
if($('#closeWidgets'))$('#closeWidgets').onclick=()=>els.widgetDialog.close();
if($('#saveWidgetsBtn'))$('#saveWidgetsBtn').onclick=()=>{state.settings.pageWidgets[state.activePageId]=$('input[name="widgetType"]:checked').map(x=>x.value);state.settings.searchEngine=$('#searchEngine').value;els.widgetDialog.close();render()};
function openTools(){const d=duplicateGroups(),pageItems=state.bookmarks.filter(b=>b.pageId===state.activePageId),checked=pageItems.filter(b=>b.linkHealth),bad=checked.filter(b=>!b.linkHealth.ok);$('#toolsContent').innerHTML=`<div class="tool-row"><div><div class="tool-label">Sauvegardes</div><div class="tool-note">Snapshots locaux versionnés (10 maximum)</div></div><button id="backupBtn" class="btn secondary">Gérer</button></div><div class="tool-row"><div><div class="tool-label">Widgets</div><div class="tool-note">Choisir les widgets affichés sur cette page</div></div><button id="widgetsBtn" class="btn secondary">Configurer</button></div><div class="tool-row"><div><div class="tool-label">Favoris navigateur</div><div class="tool-note">Importer Chrome / Edge / Firefox ou exporter en HTML standard</div></div><div><button id="browserImportBtn" class="btn secondary">Importer</button> <button id="browserExportBtn" class="btn secondary">Exporter</button></div></div><div class="tool-row"><div><div class="tool-label">Santé des liens</div><div class="tool-note">${checked.length}/${pageItems.length} vérifiés · ${bad.length} problème${bad.length>1?'s':''}</div></div><button id="checkLinksBtn" class="btn secondary">Vérifier la page</button></div><div class="tool-row"><div><div class="tool-label">Doublons</div><div class="tool-note">${d.length?d.length+' URL en double':'Aucun doublon détecté'}</div>${d.length?'<ul class="duplicate-list">'+d.map(g=>'<li>'+g.map(x=>esc(x.name)).join(' / ')+'</li>').join('')+'</ul>':''}</div></div><div class="tool-row"><div><div class="tool-label">Raccourcis</div><div class="tool-note">Ctrl/⌘ K recherche · N nouveau favori · P pages · T thème</div></div></div><div class="tool-row"><div><div class="tool-label">Données locales</div><div class="tool-note">${state.pages.length} pages · ${state.bookmarks.length} favoris · version ${VERSION}</div></div></div>`;els.toolsDialog.showModal();const b=$('#checkLinksBtn');if(b)b.onclick=checkCurrentPageLinks;const ib=$('#browserImportBtn');if(ib)ib.onclick=()=>$('#browserImportInput').click();const eb=$('#browserExportBtn');if(eb)eb.onclick=exportBrowserHtml;const wb=$('#widgetsBtn');if(wb)wb.onclick=openWidgetSettings;const bb=$('#backupBtn');if(bb)bb.onclick=openBackups}
$('#toolsBtn').onclick=openTools;$('#closeTools').onclick=()=>els.toolsDialog.close();
function openDrawer(){els.drawer.classList.add('open');els.backdrop.classList.add('show');els.drawer.setAttribute('aria-hidden','false')}function closeDrawer(){els.drawer.classList.remove('open');els.backdrop.classList.remove('show');els.drawer.setAttribute('aria-hidden','true')}
$('#pagesMenuBtn').onclick=openDrawer;$('#closeDrawer').onclick=closeDrawer;els.backdrop.onclick=closeDrawer;els.pageSearch.oninput=renderDrawer;els.search.oninput=renderContent;els.scope.onchange=renderContent;els.view.value=state.view||'grid';els.view.onchange=()=>{state.view=els.view.value;render()};
function toggleTheme(){const n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem(THEME_KEY,n)}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();els.search.focus();return}if(e.target.matches('input,textarea,select'))return;if(e.key.toLowerCase()==='n')openBookmark();if(e.key.toLowerCase()==='p')openDrawer();if(e.key.toLowerCase()==='t')toggleTheme()});
document.documentElement.dataset.theme=localStorage.getItem(THEME_KEY)||'dark';$('#themeToggle').onclick=toggleTheme;
$('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bookmarks-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('#importInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x.pages||!x.bookmarks)throw 0;if(confirm('Remplacer les données actuelles par cette sauvegarde ?')){createSnapshot('Avant import JSON');state=x;state.version=VERSION;state.collapsed=state.collapsed||{};state.settings=state.settings||{note:''};render()}}catch{alert('Fichier de sauvegarde invalide.')}e.target.value=''};
$('#browserImportInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const result=importBrowserHtml(await f.text(),state.activePageId);render();alert(`${result.added} favoris importés · ${result.skipped} doublons ignorés · ${result.found} liens détectés`)}catch(err){console.error(err);alert('Impossible de lire ce fichier de favoris.')}e.target.value=''};

let deferredInstallPrompt=null;
function updateNetworkStatus(){
  const el=$('#networkStatus');if(!el)return;
  const online=navigator.onLine;el.textContent=online?'En ligne':'Hors ligne';el.classList.toggle('sync-ok',online);el.classList.toggle('sync-warn',!online);
}
window.addEventListener('online',updateNetworkStatus);
window.addEventListener('offline',updateNetworkStatus);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;const b=$('#installBtn');if(b)b.classList.remove('hidden')});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;const b=$('#installBtn');if(b)b.classList.add('hidden')});
if($('#installBtn'))$('#installBtn').onclick=async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('#installBtn').classList.add('hidden')};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(err=>console.warn('Service worker registration failed',err)));
updateNetworkStatus();

initCloud();
render();