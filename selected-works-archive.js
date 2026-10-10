(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const page = document.querySelector('.works-page');
  let leaving = false;
  const states = [...document.querySelectorAll('.archive-film')].map(film => {
    const video = film.querySelector('video');
    const icons = [...film.querySelectorAll('.archive-icon-animation img')];
    const state = { film, video, icons, visible:false, wanted:false, failed:false, paused:false, pending:false };
    function stop() {
      state.wanted = false;
      film.classList.remove('is-previewing');
      if (video) video.pause();
      else {
        film.classList.remove('is-previewing');
        icons.forEach(image => image.removeAttribute('src'));
      }
    }
    function play() {
      if (!state.wanted || state.pending || !video || video.readyState < 1) return;
      state.pending = true;
      if (video.currentTime < Number(film.dataset.previewStart)) video.currentTime = Number(film.dataset.previewStart);
      video.play().then(() => {
        if (state.wanted) film.classList.add('is-previewing');
        else video.pause();
      }).catch(() => {
        film.classList.remove('is-previewing');
        state.wanted = false;
      }).finally(() => { state.pending = false; });
    }
    function reconcile() {
      if (!state.visible || document.hidden || reduced.matches || state.failed || state.paused || leaving) {
        stop();
        if (reduced.matches) film.classList.remove('is-previewing');
        return;
      }
      state.wanted = true;
      if (video) {
        if (!video.getAttribute('src')) { video.src=video.dataset.src; video.load(); }
        play();
      } else {
        icons.forEach(image => { if (!image.getAttribute('src')) image.src=image.dataset.src; });
        if (icons.every(image => image.complete && image.naturalWidth)) film.classList.add('is-previewing');
      }
    }
    if (video) {
      video.muted = true;
      video.loop = true;
      video.addEventListener('loadedmetadata',play);
      video.addEventListener('timeupdate',() => {
        if (state.wanted && video.currentTime >= Number(film.dataset.previewEnd)) video.currentTime=Number(film.dataset.previewStart);
      });
      video.addEventListener('error',() => { state.failed=true; stop(); film.classList.remove('is-previewing'); });
    } else {
      icons.forEach(image => {
        image.addEventListener('load',() => { if (state.wanted && icons.every(icon => icon.complete && icon.naturalWidth)) film.classList.add('is-previewing'); });
        image.addEventListener('error',() => { state.failed=true; stop(); });
      });
    }
    film.addEventListener('keydown',event => { if (event.key==='Escape') { state.paused=true; reconcile(); } });
    state.reconcile=reconcile;
    return state;
  });

  if ('IntersectionObserver' in window) {
    const mediaObserver=new IntersectionObserver(entries => entries.forEach(entry => {
      const state=states.find(item => item.film.querySelector('.archive-screen')===entry.target);
      state.visible=entry.isIntersecting;
      if (state.visible) state.film.classList.add('has-entered');
      else state.paused=false;
      state.reconcile();
    }),{threshold:.12});
    states.forEach(state => mediaObserver.observe(state.film.querySelector('.archive-screen')));
  } else {
    states.forEach(state => { state.visible=true; state.reconcile(); });
  }

  const years=[...document.querySelectorAll('.archive-year')];
  function glitch(year) {
    if (reduced.matches || year.dataset.animated) return;
    year.dataset.animated='true';
    year.classList.add('is-glitching');
    year.addEventListener('animationend',() => year.classList.remove('is-glitching'),{once:true});
  }
  if ('IntersectionObserver' in window) {
    const yearObserver=new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) glitch(entry.target); }),{threshold:.35});
    years.forEach(year => yearObserver.observe(year));
  }
  function syncMotion() {
    document.body.classList.toggle('is-motion-paused',reduced.matches);
    if (reduced.matches) years.forEach(year => year.classList.remove('is-glitching'));
    else years.forEach(year => {
      const rect=year.getBoundingClientRect();
      if (rect.top<innerHeight && rect.bottom>0) glitch(year);
    });
    states.forEach(state => state.reconcile());
  }
  reduced.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',() => states.forEach(state => state.reconcile()));
  window.addEventListener('pagehide',() => { leaving=true; states.forEach(state => state.reconcile()); });
  window.addEventListener('pageshow',event => {
    if (!event.persisted) return;
    leaving=false;
    page.getAnimations().forEach(animation => animation.cancel());
    states.forEach(state => {
      const rect=state.film.querySelector('.archive-screen').getBoundingClientRect();
      state.visible=rect.bottom>0 && rect.top<innerHeight;
      state.paused=false;
    });
    syncMotion();
  });

  page.addEventListener('click',async event => {
    const link=event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const destination=new URL(link.href,location.href);
    if (destination.origin!==location.origin || !destination.pathname.endsWith('/project.html') || reduced.matches) return;
    event.preventDefault();
    if (leaving) return;
    leaving=true;
    states.forEach(state => state.reconcile());
    try {
      await page.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-10px)'}],{duration:window.portfolioMotion?.exit ?? 320,easing:'cubic-bezier(.4, 0, 1, 1)',fill:'forwards'}).finished;
    } catch { /* Navigation must still work if animation is unavailable. */ }
    location.assign(destination.href);
  });
  syncMotion();
})();
