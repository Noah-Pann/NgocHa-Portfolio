(() => {
  const root = document.documentElement;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  /* Hỗ trợ các nút hiện có trên Home */
  const homeDestinations = {
    profile: "profile.html",
    "selected-works": "selected-works.html",
    "visual-playground": "visual-playground.html",
    contact: "contact.html"
  };

  const EXIT_DURATION = 320;

  let navigating = false;
  let exitAnimation = null;

  const tapTimers = new Map();


  /* ========================================
     HIGHLIGHT KHI CHẠM HEADER
     ======================================== */

  function playTap(element) {
    clearTimeout(tapTimers.get(element));

    element.classList.add("is-tap-active");

    tapTimers.set(
      element,
      setTimeout(() => {
        element.classList.remove("is-tap-active");
        tapTimers.delete(element);
      }, reducedMotion.matches ? 180 : 700)
    );
  }


  /* ========================================
     MỞ TRANG SAU ANIMATION RỜI
     ======================================== */

  async function leavePage(destination) {
    if (navigating) return;

    navigating = true;
    root.classList.add("is-page-leaving");

    const content =
      document.querySelector(".inner-main") ||
      document.querySelector(".home");

    if (
      reducedMotion.matches ||
      !content ||
      typeof content.animate !== "function"
    ) {
      window.location.assign(destination.href);
      return;
    }

    /*
     * Lấy đúng trạng thái hiện tại.
     * Nếu bấm khi animation vào trang chưa xong,
     * chuyển động rời vẫn bắt đầu từ vị trí đang thấy.
     */
    const currentStyle = getComputedStyle(content);

    const fromOpacity = currentStyle.opacity;
    const fromTransform = currentStyle.transform;

    content.getAnimations().forEach(animation => {
      animation.cancel();
    });

    try {
      exitAnimation = content.animate(
        [
          {
            opacity: fromOpacity,
            transform: fromTransform
          },
          {
            opacity: 0,
            transform: "translateY(-10px)"
          }
        ],
        {
          duration: EXIT_DURATION,
          easing: "cubic-bezier(.4, 0, 1, 1)",
          fill: "forwards"
        }
      );

      await exitAnimation.finished;
    } catch {
      /* Animation bị hủy vẫn có thể tiếp tục điều hướng */
    }

    window.location.assign(destination.href);
  }


  /* ========================================
     ĐIỀU HƯỚNG HOME VÀ TRANG CON
     ======================================== */

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;

    const trigger = event.target.closest(
      ".nav-link[data-page], .header-link, .inner-home, .inner-back"
    );

    if (!trigger) return;

    if (
      trigger.disabled ||
      trigger.closest("[inert]") ||
      event.defaultPrevented
    ) {
      return;
    }

    /*
     * Giữ nguyên cách dùng link của trình duyệt:
     * Ctrl/Cmd + click, mở tab mới, download...
     */
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const anchor = trigger.matches("a[href]");

    if (
      anchor &&
      (
        trigger.hasAttribute("download") ||
        (
          trigger.target &&
          trigger.target.toLowerCase() !== "_self"
        )
      )
    ) {
      return;
    }

    const href = anchor
      ? trigger.getAttribute("href")
      : homeDestinations[trigger.dataset.page];

    if (!href) return;

    const destination = new URL(href, document.baseURI);

    /* Link bên ngoài hoặc email hoạt động bình thường */
    if (
      destination.origin !== window.location.origin ||
      destination.protocol !== window.location.protocol
    ) {
      return;
    }

    const isSamePage =
      destination.pathname === window.location.pathname &&
      destination.search === window.location.search;

    /* Giữ cách cuộn đến anchor bên trong trang */
    if (isSamePage && destination.hash) return;

    event.preventDefault();

    if (navigating) return;

    if (
      trigger.classList.contains("header-link") &&
      (
        !canHover.matches ||
        event.pointerType === "touch" ||
        event.pointerType === "pen" ||
        event.detail === 0
      )
    ) {
      playTap(trigger);
    }

    /* Bấm mục đang xem: không tải lại trang */
    if (isSamePage) return;

    leavePage(destination);
  });


  /* ========================================
     QUAY LẠI BẰNG NÚT BACK
     ======================================== */

  window.addEventListener("pageshow", () => {
    navigating = false;
    root.classList.remove("is-page-leaving");

    if (exitAnimation) {
      exitAnimation.cancel();
      exitAnimation = null;
    }

    tapTimers.forEach((timer, element) => {
      clearTimeout(timer);
      element.classList.remove("is-tap-active");
    });

    tapTimers.clear();
  });
})();
/* ========================================
   ANIMATION CHUNG — THEO NHỊP PROFILE
   ======================================== */

(() => {
  function initPageMotion() {
    const page = document.querySelector(".inner-main");

    // Profile có bộ animation riêng làm chuẩn.
    // Home cũng giữ animation phong thư riêng.
    if (
      !page ||
      page.matches(".profile-page") ||
      page.dataset.sharedMotionReady
    ) {
      return;
    }

    page.dataset.sharedMotionReady = "true";

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (
      reduce.matches ||
      document.hidden ||
      typeof page.animate !== "function"
    ) {
      return;
    }

    const settings = {
      textSpeed: 170,  // Ký tự/giây, bằng Profile
      moveDuration: 850,
      stagger: 90,
      ease: "cubic-bezier(.22, 1, .36, 1)"
    };

    const groups = new Map();
    const animations = new Set();
    const writers = [];
    const registered = new WeakSet();

    let observer = null;
    let leavingObserver = null;
    let frame = null;
    let lastTime = null;
    let stopped = false;
    let readyTimer = null;

    const all = selector => [
      ...page.querySelectorAll(selector)
    ];

    /* ========================================
       ĐĂNG KÝ TỪNG VÙNG
       ======================================== */

    function addAction(trigger, action) {
      if (!trigger) return;

      if (!groups.has(trigger)) {
        groups.set(trigger, []);
      }

      groups.get(trigger).push(action);
    }

    function reveal(trigger) {
      if (stopped) return;

      const actions = groups.get(trigger);
      if (!actions) return;

      groups.delete(trigger);
      observer?.unobserve(trigger);

      actions.forEach(action => action());
    }

    /* ========================================
       HIỆN HÌNH / KHUNG / NÚT
       Dùng translate riêng để không ghi đè
       transform của hover, xoay sao, kéo thẻ.
       ======================================== */

    function motion(node, options = {}) {
      if (!node || registered.has(node)) return;
      registered.add(node);

      const {
        x = 0,
        y = 20,
        delay = 0,
        duration = settings.moveDuration,
        trigger = node,
        wipe = false
      } = options;

      const style = getComputedStyle(node);

      const from = {
        opacity: 0,
        translate: `${x}px ${y}px`
      };

      const to = {
        opacity: style.opacity,
        translate: style.translate === "none"
          ? "0px 0px"
          : style.translate
      };

      if (wipe) {
        from.clipPath = "inset(0 100% 0 0)";
        to.clipPath = style.clipPath === "none"
          ? "inset(0 0% 0 0)"
          : style.clipPath;
      }

      const animation = node.animate(
        [from, to],
        {
          duration,
          delay,
          easing: settings.ease,
          fill: "both"
        }
      );

      animation.pause();
      animation.currentTime = 0;
      animations.add(animation);

      animation.finished
        .then(() => {
          animation.cancel();
          animations.delete(animation);
        })
        .catch(() => {
          animations.delete(animation);
        });

      addAction(trigger, () => animation.play());
    }

    /* ========================================
       CHỮ HIỆN DẦN NHƯ PROFILE
       Không có con trỏ, không thay đổi layout.
       ======================================== */

    function write(node, delay = 0) {
      if (!node || registered.has(node)) return;

      // Nếu có markup/link bên trong, giữ nguyên nội dung
      // và dùng hiệu ứng hé lộ thay vì tách chữ.
      if (node.children.length > 0) {
        motion(node, {
          x: -8,
          y: 0,
          delay,
          duration: 1000,
          wipe: true
        });
        return;
      }

      const text = node.textContent.trim();
      if (!text) return;

      registered.add(node);

      const accessible = document.createElement("span");
      accessible.className = "page-motion-sr";
      accessible.textContent = text;

      const space = document.createElement("span");
      space.className = "page-motion-space";
      space.textContent = text;
      space.setAttribute("aria-hidden", "true");

      const visible = document.createElement("span");
      visible.className = "page-motion-visible";
      visible.setAttribute("aria-hidden", "true");

      const writer = {
        text,
        chars: Array.from(text),
        visible,
        elapsed: 0,
        count: 0,
        delay,
        active: false
      };

      writers.push(writer);

      node.classList.add("page-motion-text");
      node.replaceChildren(accessible, space, visible);

      addAction(node, () => {
        writer.active = true;
        startWriting();
      });
    }

    function startWriting() {
      if (stopped || frame !== null) return;

      lastTime = null;
      frame = requestAnimationFrame(tick);
    }

    function tick(time) {
      frame = null;
      if (stopped) return;

      const delta = lastTime === null
        ? 0
        : Math.min(time - lastTime, 50);

      lastTime = time;

      let pending = false;

      writers.forEach(writer => {
        if (
          !writer.active ||
          writer.count >= writer.chars.length
        ) {
          return;
        }

        writer.elapsed += delta;

        const count = Math.min(
          writer.chars.length,
          Math.floor(
            Math.max(0, writer.elapsed - writer.delay) *
            settings.textSpeed / 1000
          )
        );

        if (count !== writer.count) {
          writer.count = count;

          writer.visible.textContent = writer.chars
            .slice(0, count)
            .join("");
        }

        if (count < writer.chars.length) {
          pending = true;
        }
      });

      if (pending) {
        frame = requestAnimationFrame(tick);
      }
    }

    /* ========================================
       KHÔI PHỤC NỘI DUNG
       ======================================== */

    function restore() {
      stopped = true;

      clearTimeout(readyTimer);
      cancelAnimationFrame(frame);

      observer?.disconnect();
      leavingObserver?.disconnect();

      animations.forEach(animation => animation.cancel());
      animations.clear();
      groups.clear();

      writers.forEach(writer => {
        writer.visible.textContent = writer.text;
      });
    }

    /* ========================================
       ĐĂNG KÝ ANIMATION THEO TRANG
       ======================================== */

    try {
      /* ---------- SELECTED WORKS ---------- */

      if (page.matches(".works-page")) {
        all(".works-heading, .works-subheading").forEach(
          (node, index) => write(node, index * 100)
        );

        motion(page.querySelector(".works-viewport"), {
          x: -32,
          y: 0,
          delay: 120,
          duration: 1000
        });

        // Các chữ bên trong đã có hiệu ứng khi đổi project.
        // Chỉ thêm chuyển động nhẹ cho khối thông tin.
        motion(page.querySelector(".works-info"), {
          x: 24,
          y: 0,
          delay: 180
        });

        motion(page.querySelector(".works-year"), {
          y: 12,
          delay: 200
        });

        motion(page.querySelector(".works-controls"), {
          y: 12,
          delay: 160
        });

        all(".works-dot").forEach((dot, index) => {
          motion(dot, {
            y: 10,
            delay: 180 + index * settings.stagger,
            trigger: dot.parentElement
          });
        });

        motion(
          page.querySelector(".works-star, .works-decoration-star"),
          {
            y: 18,
            delay: 200
          }
        );
      }

      /* ---------- PROJECT DETAIL ---------- */

      if (page.matches(".project-page")) {
        all(
          ".project-eyebrow, #project-title, #project-meta"
        ).forEach((node, index) => {
          write(node, index * 70);
        });

        const media = page.querySelector("#project-media");

        // Video hiện theo khung.
        // Bộ icon được xử lý từng section phía dưới.
        if (media && !media.classList.contains("is-icon-project")) {
          motion(media, {
            y: 24,
            delay: 140,
            duration: 1000
          });
        }

        all(
          ".project-overview h2, " +
          ".project-description > p, " +
          ".project-contribution-title, " +
          ".project-contribution-copy, " +
          ".project-format, " +
          ".project-process-header h2, " +
          ".process-step-copy h3, " +
          ".process-step-copy p, " +
          ".icon-animated-section > h2, " +
          ".icon-size-header h2, " +
          ".icon-size-label"
        ).forEach(node => write(node));

        motion(page.querySelector(".project-contribution"), {
          y: 14
        });

        all(".process-step-number, .process-heading-dot").forEach(
          node => motion(node, { y: 10 })
        );

        all(".process-figure").forEach((figure, index) => {
          motion(figure, {
            y: 24,
            delay: (index % 2) * settings.stagger
          });
        });

        all(".project-icon-grid > img").forEach((image, index) => {
          motion(image, {
            y: 18,
            delay: (index % 4) * settings.stagger
          });
        });

        all(".icon-pack-card").forEach((card, index) => {
          motion(card, {
            y: 18,
            delay: (index % 4) * 60,
            duration: 750
          });
        });

        all(
          ".project-description .project-button, " +
          ".project-pagination, .project-back"
        ).forEach(node => {
          motion(node, { y: 12 });
        });
      }

      /* ---------- VISUAL PLAYGROUND ---------- */

      if (page.matches(".playground-page")) {
        all(
          ".playground-heading h1, " +
          ".playground-intro h2, " +
          ".playground-intro p"
        ).forEach((node, index) => {
          write(node, index * 90);
        });

        const stage = page.querySelector(".arts-stage");
        const girlFrame = page.querySelector(
          ".playground-girl-frame"
        );

        // Desktop: wrapper là display: contents.
        // Mobile: wrapper là khung cắt phần trong suốt của ảnh.
        const girlTarget =
          girlFrame &&
          getComputedStyle(girlFrame).display !== "contents"
            ? girlFrame
            : page.querySelector(".playground-girl");

        // GIRL: từ trái vào.
        motion(girlTarget, {
          x: -60,
          y: 0,
          duration: 1100,
          delay: 100,
          trigger: stage || girlTarget
        });

        // ARTS: cả dải từ phải vào.
        // Không animate các art-slot đang được JS điều khiển.
        const arts = page.querySelector("#arts-viewport");

        motion(arts, {
          x: 60,
          y: 0,
          duration: 1100,
          delay: 240,
          trigger: stage || arts
        });

        motion(page.querySelector(".playground-star"), {
          y: 12,
          duration: 900,
          delay: 500,
          trigger: stage
        });

        const animationSection = page.querySelector(
          ".playground-animation"
        );

        // Khung Animation xuất hiện khi cuộn tới.
        motion(animationSection, {
          y: 20,
          duration: 900
        });

        write(
          page.querySelector(".playground-animation > h2"),
          80
        );

        all(".animation-card").forEach((card, index) => {
          motion(card, {
            y: 24,
            duration: 850,
            delay: (index % 4) * settings.stagger
          });
        });
      }

      /* ---------- CONTACT ---------- */

      if (page.matches(".contact-page")) {
        write(page.querySelector(".contact-heading h1"));

        motion(page.querySelector(".contact-hand"), {
          x: 28,
          y: -20,
          duration: 1100,
          delay: 150
        });

        // Giữ yêu cầu Contact: hé lộ cả câu,
        // không gõ từng ký tự.
        motion(page.querySelector("#contact-greeting"), {
          x: -10,
          y: 0,
          wipe: true,
          duration: 1200,
          delay: 180
        });

        motion(page.querySelector(".contact-frame"), {
          y: 20,
          delay: 180
        });

        all(".contact-list > li").forEach((item, index) => {
          motion(item, {
            y: 16,
            duration: 750,
            delay: 250 + index * settings.stagger
          });
        });
      }

      /* ========================================
         BẮT ĐẦU SAU KHI GIẤY VÀO TRANG
         ======================================== */

      async function observeContent() {
        const entrances = page.getAnimations().filter(
          animation => animation.playState !== "finished"
        );

        await Promise.race([
          Promise.allSettled(
            entrances.map(animation => animation.finished)
          ),
          new Promise(resolve => {
            readyTimer = setTimeout(resolve, 1400);
          })
        ]);

        clearTimeout(readyTimer);
        if (stopped) return;

        if ("IntersectionObserver" in window) {
          observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                reveal(entry.target);
              }
            });
          }, {
            threshold: 0,
            rootMargin: "0px 0px -20px 0px"
          });

          groups.forEach((_, trigger) => {
            observer.observe(trigger);
          });
        } else {
          [...groups.keys()].forEach(reveal);
        }
      }

      /* Tab tới một vùng thì hiện ngay vùng đó */
      page.addEventListener("focusin", event => {
        [...groups.keys()].forEach(trigger => {
          if (
            trigger === event.target ||
            trigger.contains(event.target)
          ) {
            reveal(trigger);
          }
        });
      });

      leavingObserver = new MutationObserver(() => {
        if (
          document.documentElement.classList.contains(
            "is-page-leaving"
          )
        ) {
          restore();
        }
      });

      leavingObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"]
      });

      reduce.addEventListener("change", event => {
        if (event.matches) restore();
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) restore();
      });

      window.addEventListener("pagehide", restore);

      window.addEventListener("pageshow", event => {
        if (event.persisted) restore();
      });

      observeContent().catch(error => {
        console.warn("Page animation:", error);
        restore();
      });
    } catch (error) {
      console.warn("Page animation:", error);
      restore();
    }
  }

  function scheduleMotion() {
    // Chờ các JS riêng dựng xong project, gallery và cards.
    setTimeout(initPageMotion, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      scheduleMotion,
      { once: true }
    );
  } else {
    scheduleMotion();
  }
})();