'use strict';
(() => {
  const $=s=>document.querySelector(s), dialog=$('#manager');
  const categories=['Brand films','Products','Spaces','Presentations','People & stories','Experiments'];
  const defaults=['cfu-XLeZXH4','13XfIpgDFnW89iUTpTxB9p-p1uXIV0w7D','1CtdcPCaLHccBGir5st1dAYHiLr_Ce2CI','kuUCt8yEowc','UGoMkOqnYiI'];
  const originals=new Map(window.FILMS.map(f=>[f.id,f]));
  let draft=[], dirty=false, saving=false, dragged=null, revision=0;
  const reload=document.createElement('button');reload.type='button';reload.className='secondary';reload.textContent='Reload saved collection';reload.hidden=true;
  $('#manage-discard').before(reload);
  reload.addEventListener('click',async()=>{
    if(saving||!confirm('Reload the latest saved collection and discard your unsaved changes?'))return;
    reload.disabled=true;
    try{const response=await fetch('/api/portfolio',{cache:'no-store'});if(!response.ok)throw new Error('Could not reload. Please retry.');window.portfolioData=await response.json();resetDraft();window.refreshPortfolio(window.portfolioData.state);reload.hidden=true;message('Latest saved collection loaded. You can edit it now.');}catch(error){message(error.message);}finally{reload.disabled=false;}
  });
  const message=text=>$('#save-status').textContent=text;
  function changed(){dirty=true;$('#manage-save').disabled=false;message('Unsaved changes. Save to update the portfolio on every device.');}
  function resetDraft(){
    const data=window.portfolioData; revision=data.revision;
    draft=structuredClone(data.state?.items || window.FILMS.map(f=>({id:f.id,category:f.category,hidden:false,featured:defaults.includes(f.id)})));
    dirty=false;$('#manage-save').disabled=true;render();
  }
  function button(text,label,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b;}
  function move(id,target){const index=draft.findIndex(x=>x.id===id); if(target<0||target>=draft.length||index===target)return; const [item]=draft.splice(index,1);draft.splice(target,0,item);changed();render(); const row=[...$('#manage-list').children].find(x=>x.dataset.id===id);row?.querySelector('button')?.focus({preventScroll:true});}
  function render(){
    const query=$('#manage-search').value.trim().toLowerCase(), removed=$('#manage-removed').checked;
    const visible=draft.filter(x=>x.hidden===removed && `${originals.get(x.id).title} ${originals.get(x.id).originalTitle}`.toLowerCase().includes(query));
    $('#manage-count').textContent=`${draft.filter(x=>!x.hidden).length} visible · ${draft.filter(x=>x.hidden).length} removed · ${draft.filter(x=>x.featured&&!x.hidden).length}/6 selected films`;
    const rows=visible.map((item,visibleIndex)=>{
      const f=originals.get(item.id),index=draft.indexOf(item),row=document.createElement('article');row.className='manage-row';row.dataset.id=item.id;
      row.draggable=!query&&!removed&&!saving;
      row.addEventListener('dragstart',e=>{dragged=item.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',item.id);row.classList.add('dragging');});
      row.addEventListener('dragend',()=>{dragged=null;row.classList.remove('dragging');document.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));});
      row.addEventListener('dragover',e=>{if(dragged&&!query&&!removed){e.preventDefault();row.classList.add('drop-target');}});
      row.addEventListener('dragleave',()=>row.classList.remove('drop-target'));
      row.addEventListener('drop',e=>{e.preventDefault();if(dragged&&!query&&!removed)move(dragged,index);});
      const order=document.createElement('div');order.className='order-controls';
      const up=button('↑',`Move ${f.title} up`,()=>move(item.id,draft.indexOf(visible[visibleIndex-1]))), down=button('↓',`Move ${f.title} down`,()=>move(item.id,draft.indexOf(visible[visibleIndex+1])));up.disabled=visibleIndex===0;down.disabled=visibleIndex===visible.length-1;
      const pos=document.createElement('span');pos.textContent=String(index+1).padStart(2,'0');order.append(up,pos,down);
      const img=document.createElement('img');img.src=f.image;img.alt='';img.loading='lazy';
      const copy=document.createElement('div');copy.className='manage-copy';const title=document.createElement('h3');title.textContent=f.title;const sub=document.createElement('p');sub.textContent=f.originalTitle;copy.append(title,sub);
      const label=document.createElement('label');label.className='category-label';label.textContent='Category';const select=document.createElement('select');select.setAttribute('aria-label',`Category for ${f.title}`);
      categories.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;select.append(o);});select.value=item.category;select.addEventListener('change',()=>{item.category=select.value;changed();});label.append(select);
      const feature=document.createElement('label');feature.className='feature-check';const check=document.createElement('input');check.type='checkbox';check.checked=item.featured;check.disabled=item.hidden;check.setAttribute('aria-label',`Feature ${f.title}`);
      check.addEventListener('change',()=>{if(check.checked&&draft.filter(x=>x.featured&&!x.hidden).length>=6){check.checked=false;message('You can select up to 6 films. Uncheck one first.');return;} item.featured=check.checked;changed();render();});feature.append(check,document.createTextNode('Selected'));
      const remove=button(item.hidden?'Restore ↶':'Remove',`${item.hidden?'Restore':'Remove'} ${f.title}`,()=>{item.hidden=!item.hidden;if(item.hidden)item.featured=false;changed();render();message(item.hidden?'Video removed from the draft. Save changes to apply. You can restore it under Show removed.':'Video restored to the draft. Save changes to apply.');});remove.className='remove-video';
      row.append(order,img,copy,label,feature,remove);return row;
    });
    $('#manage-list').replaceChildren(...rows);
    if(!rows.length){const p=document.createElement('p');p.className='manager-empty';p.textContent=removed?'No removed videos match your search.':'No videos match your search.';$('#manage-list').append(p);}
    if(saving)$('#manage-list').querySelectorAll('button,input,select').forEach(x=>x.disabled=true);
  }
  $('#manage-open').addEventListener('click',()=>{if(!window.portfolioData?.canEdit)return; resetDraft();message('Changes appear on the portfolio after saving.');dialog.showModal();});
  const close=()=>{if(saving)return;if(dirty&&!confirm('Discard your unsaved changes?'))return;dirty=false;dialog.close();$('#manage-open').focus();};
  $('#manager-close').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  $('#manage-search').addEventListener('input',render);$('#manage-removed').addEventListener('change',render);
  $('#manage-discard').addEventListener('click',()=>{if(dirty&&!confirm('Discard your unsaved changes?'))return;resetDraft();message('Unsaved changes discarded.');});
  $('#manage-save').addEventListener('click',async()=>{
    if(!dirty||saving)return;saving=true;$('#manage-save').disabled=true;$('#manage-discard').disabled=true;$('#manager-close').disabled=true;render();message('Saving your collection…');
    try{
      const response=await fetch('/api/portfolio',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,state:{items:draft}})});
      const data=await response.json();if(response.status===409)reload.hidden=false;if(!response.ok)throw new Error(data.error||'Could not save changes. Please retry.');
      window.portfolioData=data;revision=data.revision;dirty=false;window.refreshPortfolio(data.state);message('Saved. Your collection is updated across devices.');
    }catch(error){message(error.message);}
    finally{saving=false;$('#manage-save').disabled=!dirty;$('#manage-discard').disabled=false;$('#manager-close').disabled=false;render();}
  });
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
})();
