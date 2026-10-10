(() => {
const root='visual-playground/';
const arts=[['angle.png','Angle'],['flower girl.png','Flower Girl'],['flower.png','Flower'],['girl-in-snow.png','Girl in Snow'],['green.webp','Green'],['love.webp','Love'],['prince.webp','Prince'],['sketch pencil.webp','Pencil Sketch'],['snow-guy.webp','Snow Guy'],['sunny.webp','Sunny'],['Trân.webp','Trân'],['viet phuc.png','Việt Phục']];
const motions=[
 {file:'posterr.gif',title:'Losing Hope',type:'Rigging experiment',gif:true,bio:'A small rigging experiment in Adobe After Effects.',software:'Adobe After Effects'},
 {file:'drivin car.mp4',title:'Fun Animation',type:'Frame-by-frame animation',bio:'A little meme animation I made about myself and my best friend, Hiền. I’m the one with pink hair, and Hiền is the one with blue hair.',software:'Clip Studio Paint'},
 {file:'final.mp4',title:'Love or Lust',type:'Rigged animation',bio:'An animation rigged in Adobe After Effects.',software:'Adobe After Effects'},
 {file:'windy.mp4',title:'Sky',type:'Frame-by-frame animation',bio:'A frame-by-frame animation created in Clip Studio Paint.',software:'Clip Studio Paint'}
];
const url=p=>encodeURI(root+p);
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n};
function init(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:640px)');
 const dialog=document.querySelector('#scrap-dialog'),media=document.querySelector('#scrap-dialog-media'),copy=document.querySelector('#scrap-dialog-copy');
 let opener=null;
 const previews=[];
 function open(item,trigger,animation=false){
  opener=trigger;previews.forEach(p=>p.stop());media.replaceChildren();copy.replaceChildren();document.querySelector('#scrap-dialog-title').textContent=animation?item.title:item[1];
  const src=url((animation?'animations/':'arts/')+(animation?item.file:item[0]));
  const visual=el(animation&&!item.gif?'video':'img');visual.src=src;
  if(visual.tagName==='VIDEO'){visual.controls=true;visual.playsInline=true;visual.preload='metadata';visual.setAttribute('aria-label',item.title)}else visual.alt=animation?item.title:item[1];
  media.append(visual);
  if(animation){copy.append(el('p','',item.bio),el('p','scrap-label','Software: '+item.software));}
  else {const link=el('a','','Open original image ↗');link.href=src;link.target='_blank';link.rel='noopener noreferrer';copy.append(link);}
  dialog.showModal();
 }
 document.querySelector('#scrap-close').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{if(dialog.open)return;media.querySelector('video')?.pause();media.replaceChildren();opener?.focus({preventScroll:true});previews.forEach(p=>p.sync());});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 const gallery=document.querySelector('#scrap-gallery');
 arts.forEach((art,index)=>{
  const fig=el('figure','scrap-art'),button=el('button','scrap-enlarge'),img=el('img'),caption=el('figcaption');
  fig.dataset.art=art[1];if(art[1]==='Green')fig.classList.add('is-green');
  button.type='button';button.setAttribute('aria-label','Enlarge '+art[1]);img.src=url('arts/'+art[0]);img.alt=art[1];img.loading='lazy';img.decoding='async';img.draggable=false;
  img.addEventListener('load',()=>fig.classList.toggle('is-landscape',img.naturalWidth/img.naturalHeight>1.25));
  button.append(img);button.onclick=()=>open(art,button);
  const label=el('span','scrap-art-name',art[1]);label.append(el('small','',String(index+1).padStart(2,'0')+' / ↗'));
  const handle=el('button','scrap-handle','⠿ Move');handle.type='button';handle.setAttribute('aria-label','Move '+art[1]);handle.setAttribute('aria-describedby','scrap-drag-help');
  caption.append(label,handle);fig.append(button,caption);gallery.append(fig);
 });
 const prints=[...document.querySelectorAll('.scrap-print,.scrap-art,.scrap-girl')];
 let front=10;
 prints.forEach(print=>{
  const art=print.classList.contains('scrap-girl')?['../girl-left.webp','Girl with birds']:arts.find(a=>a[1]===print.dataset.art),button=print.querySelector('.scrap-enlarge'),handle=print.querySelector('.scrap-handle');
  button.onclick=()=>open(art,button);
  let x=0,y=0,drag=null;
  function raise(){print.style.zIndex=++front;}
  button.addEventListener('focus',raise);handle.addEventListener('focus',raise);
  const update=()=>{print.style.setProperty('--dx',x+'px');print.style.setProperty('--dy',y+'px')};
  function move(nx,ny){
   // Clamp the image to its board, leaving room for its rotated paper edges.
   const board=print.parentElement.getBoundingClientRect(),rect=print.getBoundingClientRect();
   const baseLeft=rect.left-x,baseRight=rect.right-x,baseTop=rect.top-y,baseBottom=rect.bottom-y+(print.classList.contains('scrap-girl')?44:0);
   const limit=mobile.matches?28:80;
   const minX=Math.max(-limit,board.left+6-baseLeft),maxX=Math.min(limit,board.right-6-baseRight);
   const minY=Math.max(-limit,board.top+8-baseTop),maxY=Math.min(limit,board.bottom-8-baseBottom);
   x=minX<=maxX?Math.max(minX,Math.min(maxX,nx)):0;y=minY<=maxY?Math.max(minY,Math.min(maxY,ny)):0;update();
  }
  handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;raise();drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:x,oy:y};handle.setPointerCapture(e.pointerId);e.preventDefault();});
  handle.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId)move(drag.ox+e.clientX-drag.x,drag.oy+e.clientY-drag.y);});
  const release=()=>drag=null;handle.addEventListener('pointerup',release);handle.addEventListener('pointercancel',release);handle.addEventListener('lostpointercapture',release);
  handle.addEventListener('keydown',e=>{const delta={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[e.key];if(delta){e.preventDefault();move(x+delta[0],y+delta[1]);}if(e.key==='Home'){e.preventDefault();move(0,0);}});
  print.reset=()=>{x=0;y=0;update();print.style.removeProperty('z-index');};
 });
 document.querySelector('#scrap-reset').onclick=()=>prints.forEach(p=>p.reset());
 window.addEventListener('resize',()=>prints.forEach(p=>p.reset()));
 const motionRoot=document.querySelector('#scrap-motions');
 motions.forEach((item,index)=>{
  const article=el('article','scrap-window'),bar=el('div','scrap-titlebar');bar.append(el('span','',String(index+1).padStart(2,'0')+' / '+item.title),el('span','','[ motion ]'));
  const button=el('button','scrap-motion-open'),poster=el('img');button.type='button';button.setAttribute('aria-label','Open '+item.title);poster.src=url('posters/'+index+'.jpg');poster.alt=item.title;poster.loading='lazy';button.append(poster);
  let visual=null;
  if(!item.gif){visual=el('video');visual.src=url('animations/'+item.file);visual.muted=true;visual.defaultMuted=true;visual.loop=true;visual.playsInline=true;visual.preload='metadata';visual.setAttribute('aria-hidden','true');button.append(visual);}
  else {visual=el('img');visual.alt='';visual.setAttribute('aria-hidden','true');visual.style.position='absolute';visual.style.inset='0';visual.style.opacity='0';button.append(visual);}
  let inView=false;
  const shouldPlay=()=>inView&&!reduce.matches&&!dialog.open&&!document.hidden;
  function stop(){button.classList.remove('is-playing');if(item.gif){visual.removeAttribute('src');visual.style.opacity='0';}else visual.pause();}
  function sync(){if(!shouldPlay()){stop();return;}if(item.gif){if(!visual.hasAttribute('src'))visual.src=url('animations/'+item.file);visual.style.opacity='1';button.classList.add('is-playing');}else visual.play().then(()=>{if(shouldPlay())button.classList.add('is-playing');else stop();}).catch(()=>{});}
  button.onclick=()=>open(item,button,true);
  if('IntersectionObserver'in window)new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();},{threshold:.1}).observe(button);else{inView=true;sync();}
  reduce.addEventListener('change',sync);previews.push({stop,sync});
  button.append(el('span','','View animation ↗'));
  const info=el('div','scrap-motion-copy');info.append(el('h3','',item.title),el('p','',item.bio),el('p','scrap-label',item.type));article.append(bar,button,info);motionRoot.append(article);
 });
 document.addEventListener('visibilitychange',()=>{previews.forEach(p=>p.sync());if(document.hidden)media.querySelector('video')?.pause();});
 window.addEventListener('pagehide',()=>{previews.forEach(p=>p.stop());media.querySelector('video')?.pause();});
 window.addEventListener('pageshow',()=>previews.forEach(p=>p.sync()));
 document.querySelector('.inner-header a[href="visual-playground.html"]')?.setAttribute('aria-current','page');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
