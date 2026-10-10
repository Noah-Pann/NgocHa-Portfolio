(() => {
  const composition = document.querySelector('.home-body .composition');
  const home = document.querySelector('.home-body .home');
  if (!composition || !home) return;
  let frame;
  function fit() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const scale = matchMedia('(max-width:900px)').matches
        ? Math.min(1, (home.clientHeight - 1) / Math.max(1, composition.offsetHeight)) : 1;
      composition.style.setProperty('--home-fit-scale', scale);
    });
  }
  new ResizeObserver(fit).observe(composition);
  window.addEventListener('resize', fit);
  document.fonts.ready.then(fit);
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('is-home-hidden', document.hidden);
  });
  fit();
})();
