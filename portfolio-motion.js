// Shared timing for page entrances, scroll reveals and navigation.
window.portfolioMotion = Object.freeze({
  reveal:850, detail:650, stagger:90, exit:320,
  envelope:1200, easing:'cubic-bezier(.22, 1, .36, 1)'
});
(() => {
  function init() {
    if (!document.body.classList.contains('editorial-page')) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const timing = window.portfolioMotion;
    const pending = new Map();
    let observer;
    function reveal(node) {
      const animation = pending.get(node);
      if (!animation) return;
      observer?.unobserve(node);
      node.dataset.revealed = 'true';
      if (reduced.matches) { animation.cancel(); pending.delete(node); }
      else animation.play();
    }
    function restore() {
      observer?.disconnect();
      pending.forEach((animation,node) => {
        animation.cancel(); node.dataset.revealed='true';
      });
      pending.clear();
    }
    function register(node,delay=0) {
      if (!node || reduced.matches || typeof node.animate!=='function') return;
      // Individual translate preserves rotation and pointer-driven transforms.
      const style=getComputedStyle(node);
      const animation=node.animate([
        {opacity:0,translate:'0 16px'},
        {opacity:style.opacity,translate:style.translate==='none'?'0 0':style.translate}
      ],{duration:timing.reveal,delay,easing:timing.easing,fill:'both'});
      animation.pause(); animation.currentTime=0;
      pending.set(node,animation); node.dataset.revealed='false';
      animation.finished.then(()=>{animation.cancel();pending.delete(node);}).catch(()=>{});
      if (observer) observer.observe(node); else reveal(node);
    }
    if ('IntersectionObserver' in window) {
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting) reveal(entry.target);
      }),{threshold:0,rootMargin:'0px 0px -20px 0px'});
    }
    document.querySelectorAll('.editorial-masthead,.editorial-jumps,.editorial-footer').forEach(node=>register(node,timing.stagger));
    document.querySelectorAll('.archive-film').forEach((node,index)=>register(node,(index%2)*timing.stagger));
    document.querySelectorAll('.scrap-girl,.scrap-print').forEach((node,index)=>register(node,index*timing.stagger));
    document.querySelectorAll('.scrap-art').forEach((node,index)=>register(node,(index%4)*timing.stagger));
    document.querySelectorAll('.scrap-window').forEach((node,index)=>register(node,(index%4)*timing.stagger));
    document.addEventListener('focusin',event=>{
      pending.forEach((_,node)=>{if(node.contains(event.target)) reveal(node);});
    });
    reduced.addEventListener('change',event=>{if(event.matches)restore();});
    window.addEventListener('pagehide',restore);
    window.addEventListener('pageshow',event=>{if(event.persisted)restore();});
    document.addEventListener('visibilitychange',()=>{
      pending.forEach((animation,node)=>{
        if(node.dataset.revealed==='true') document.hidden?animation.pause():animation.play();
      });
    });
  }
  // Page-specific builders finish before registering artwork figures.
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});
})();
