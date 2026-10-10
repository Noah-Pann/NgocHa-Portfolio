(() => {
  const storageKey = "portfolio-background-start";
  const now = Date.now();
  let start = now;

  try {
    const saved = Number(sessionStorage.getItem(storageKey));

    if (Number.isFinite(saved) && saved > 0 && saved <= now) {
      start = saved;
    } else {
      sessionStorage.setItem(storageKey, String(now));
    }
  } catch {
    // Nền vẫn hoạt động nếu trình duyệt không cho lưu phiên.
  }

  const elapsedSeconds = (now - start) / 1000;

  document.documentElement.style.setProperty(
    "--bg-time-offset",
    `${-elapsedSeconds}s`
  );
})();