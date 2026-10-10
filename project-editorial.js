(() => {
  if (!document.documentElement.classList.contains('project-editorial')) return;
  function init() {
    const page = document.querySelector('.project-page');
    if (!document.querySelector('#project-title') || page.dataset.editorialReady) return;
    page.dataset.editorialReady = 'true';
    // Use a short section reveal instead of the shared typewriter effect.
    // Content remains readable before scrolling or if motion is unavailable.
    page.dataset.sharedMotionReady = 'true';
    const projectId = page.dataset.projectId;
    const year = page.dataset.projectYear;
    const title = document.querySelector('#project-title');
    title.classList.toggle('is-medium-title', title.textContent.length > 16 && title.textContent.length <= 34);
    title.classList.toggle('is-long-title', title.textContent.length > 34);
    const make = (tag, cls, text) => {
      const el = document.createElement(tag);
      el.className = cls;
      if (text) el.textContent = text;
      return el;
    };
    const heading = document.querySelector('.project-heading');
    const mark = make('div', 'project-year-mark');
    const star = make('img', '');
    star.src = 'About%20me/decoration-assets/blue-black-star.svg';
    star.alt = ''; star.width = 130; star.height = 123;
    star.setAttribute('aria-hidden', 'true');
    mark.append(star, make('span', '', year));
    heading.append(mark);
    const media = document.querySelector('#project-media');
    const bar = make('div', 'project-screen-bar');
    const demo = media.querySelector('.project-demo');
    const icons = media.classList.contains('is-icon-project');
    bar.append(make('span', '', projectId === 'to-te-ti' ? 'Live action / low-poly 3D / 2D animation' : page.dataset.projectCategory), make('span', '', icons ? '4 animated icons / 3 sizes' : demo ? 'Muted preview / watch full ↗' : 'Project walkthrough / play with controls'));
    media.before(bar);
    const video = media.querySelector('video');
    if (video) video.poster = `selected%20works/posters/${projectId}.jpg`;
    const nav = make('nav', 'project-case-nav');
    nav.setAttribute('aria-label','Project sections');
    document.querySelector('.project-overview').id = 'project-about';
    const steps = [...document.querySelectorAll('.process-step')];
    steps.forEach((step, index) => step.id = `project-chapter-${index + 1}`);
    const sections = [['About & contribution','project-about'], ...steps.map((step,index) => [String(index+1).padStart(2,'0') + ' / ' + step.querySelector('h3').textContent, step.id])];
    for (const [label, id] of sections) {
      const link = make('a', '', label); link.href = '#' + id; nav.append(link);
    }
    if (icons) media.before(nav);
    else media.after(nav);
    document.querySelector('.project-process-header')?.append(make('p', 'project-process-note', projectId === 'to-te-ti' ? 'From storyboard to mixed media.' : `${String(steps.length).padStart(2,'0')} process chapters`));
    document.querySelectorAll('.process-caption').forEach((caption, index) => {
      const text = caption.textContent;
      caption.replaceChildren(make('span', 'project-figure-index', `FIG. ${String(index + 1).padStart(2,'0')}`), make('span', '', text));
    });
    document.querySelectorAll('.project-pagination a').forEach((link, index) => {
      const title = link.getAttribute('aria-label').replace(/^(Previous|Next): /, '');
      link.replaceChildren(make('span','project-pagination-label',index === 0 ? '← Previous project' : 'Next project →'), make('span','',title));
    });
    const back = make('a', 'project-end-link inner-back', `← Back to Selected Works / ${year}`);
    back.href = `selected-works.html#year-${year}`;
    page.append(back);
    document.querySelector('.project-back').href = back.href;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    if (icons) {
      const grid = media.querySelector('.project-icon-grid');
      const still = make('img', 'project-icons-poster');
      still.src = 'selected%20works/posters/olympian-icons.jpg';
      still.alt = 'The four animated icon designs'; still.width = 1280; still.height = 720;
      const stage = make('div','project-icons-stage');
      grid.before(stage); stage.append(still,grid);
      const images = [...grid.querySelectorAll('img')];
      images.forEach(image => { image.dataset.animationSource = image.getAttribute('src'); image.removeAttribute('src'); });
      let inView = false;
      function syncIcons() {
        const play = inView && !reduce.matches && !document.hidden;
        stage.classList.toggle('is-playing',play);
        images.forEach(image => {
          if (play && !image.hasAttribute('src')) image.src = image.dataset.animationSource;
          else if (!play) image.removeAttribute('src');
        });
      }
      if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { inView=entry.isIntersecting; syncIcons(); },{threshold:.1}).observe(stage);
      else { inView=true; syncIcons(); }
      reduce.addEventListener('change',syncIcons);
      document.addEventListener('visibilitychange',syncIcons);
      window.addEventListener('pagehide',() => { inView=false; syncIcons(); });
      window.addEventListener('pageshow',() => { const rect=stage.getBoundingClientRect(); inView=rect.bottom>0&&rect.top<innerHeight; syncIcons(); });
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (reduce.matches || document.hidden || !entry.target.animate) continue;
          const animation = entry.target.animate([{opacity:.7,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});
          animations.add(animation);
          animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
        }
      }, {threshold:.05});
      page.querySelectorAll('.project-overview,.process-step,.process-figure').forEach(el => observer.observe(el));
    }
    reduce.addEventListener('change', event => { if (event.matches) animations.forEach(a => a.cancel()); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
