(() => {
  function init() {
    const page = document.querySelector(".playground-page");
    if (!page) return;

    const root = "visual-playground/";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

    const viewport = document.querySelector("#arts-viewport");

    /* Tăng số để tranh tự chạy nhanh hơn */
    const speed = 24;

    const artworks = [
      { file: "angle.png", name: "Angle" },
      { file: "flower girl.png", name: "Flower Girl" },
      { file: "flower.png", name: "Flower" },
      { file: "girl-in-snow.png", name: "Girl in Snow" },
      { file: "green.webp", name: "Green" },
      { file: "love.webp", name: "Love" },
      { file: "prince.webp", name: "Prince" },
      { file: "sketch pencil.webp", name: "Pencil Sketch" },
      { file: "snow-guy.webp", name: "Snow Guy" },
      { file: "sunny.webp", name: "Sunny" },
      { file: "Trân.webp", name: "Trân" },
      { file: "viet phuc.png", name: "Việt Phục" }
    ];

    /* Đổi tên và nội dung animation tại đây */
    const animations = [
      {
        file: "posterr.gif",
        title: "Losing Hope",
        type: "Rigging experiment",
        gif: true,
        bio: "A small rigging experiment in Adobe After Effects.",
        software: "Adobe After Effects"
      },
      {
        file: "drivin car.mp4",
        title: "Fun Animation",
        type: "Frame-by-frame animation",
        bio:
          "A little meme animation I made about myself and my best friend, Hiền. I’m the one with pink hair, and Hiền is the one with blue hair.",
        software: "Clip Studio Paint"
      },
      {
        file: "final.mp4",
        title: "Love or Lust",
        type: "Rigged animation",
        bio: "An animation rigged in Adobe After Effects.",
        software: "Adobe After Effects"
      },
      {
        file: "windy.mp4",
        title: "Sky",
        type: "Frame-by-frame animation",
        bio: "A frame-by-frame animation created in Clip Studio Paint.",
        software: "Clip Studio Paint"
      }
    ];

    function url(path) {
      return encodeURI(root + path);
    }

    function node(tag, className, text) {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text !== undefined) el.textContent = text;
      return el;
    }


    /* ========================================
       DẢI TRANH
       ======================================== */

    let offset = 0;
    let lastTime = 0;
    let hovered = null;
    let focused = null;
    let pinned = null;
    let inView = true;

    let cardWidth = 150;
    let cardHeight = 245;
    let gap = 24;

    let gesture = null;
    let suppressClickUntil = 0;

    const cards = [];

    function loopWidth() {
      return cards.length * (cardWidth + gap);
    }

    function normalizeOffset() {
      const width = loopWidth();
      if (width > 0) offset = ((offset % width) + width) % width;
    }

    function draw() {
      if (!cards.length) return;

      const step = cardWidth + gap;
      const total = loopWidth();
      const active = gesture?.dragging
        ? null
        : pinned || hovered || focused;

      const availableWidth = viewport.clientWidth;
      const availableHeight = viewport.clientHeight;

      cards.forEach((card) => {
        const raw = card.index * step - offset;

        card.x =
          ((raw + step) % total + total) % total - step;

        card.slot.style.transform = `translateX(${card.x}px)`;

        const expanded = active === card;

        card.slot.classList.toggle("is-expanded", expanded);
        card.button.setAttribute(
          "aria-pressed",
          String(pinned === card)
        );

        if (!expanded) {
          card.button.style.width = `${cardWidth}px`;
          card.button.style.height = `${cardHeight}px`;
          card.button.style.left = "0px";
          return;
        }

        const ratio =
          card.image.naturalWidth && card.image.naturalHeight
            ? card.image.naturalWidth / card.image.naturalHeight
            : 1;

        const height = Math.min(
          cardHeight * 1.4,
          availableHeight - 24
        );

        const width = Math.min(
          Math.max(cardWidth * 1.35, height * ratio),
          Math.max(1, availableWidth - 20)
        );

        const preferredLeft = card.x + (cardWidth - width) / 2;

        const left = Math.max(
          10,
          Math.min(preferredLeft, availableWidth - width - 10)
        );

        card.button.style.width = `${width}px`;
        card.button.style.height = `${height}px`;
        card.button.style.left = `${left - card.x}px`;
      });
    }

    function focusCard(index) {
      const card = cards[
        (index + cards.length) % cards.length
      ];

      pinned = null;
      hovered = null;
      focused = card;

      offset =
        card.index * (cardWidth + gap) -
        Math.max(10, (viewport.clientWidth - cardWidth) / 2);

      normalizeOffset();
      draw();
      card.button.focus({ preventScroll: true });
    }

    artworks.forEach((art, index) => {
      const slot = node("div", "art-slot");
      const button = node("button", "art-card");
      const image = node("img");

      button.type = "button";
      button.setAttribute("aria-label", `Hold artwork: ${art.name}`);
      button.setAttribute("aria-pressed", "false");

      image.src = url("arts/" + art.file);
      image.alt = art.name;
      image.draggable = false;
      image.decoding = "async";

      button.append(image);
      slot.append(button);
      viewport.append(slot);

      const card = { slot, button, image, index, x: 0 };
      cards.push(card);

      button.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch" || gesture) return;
        hovered = card;
        draw();
      });

      button.addEventListener("pointerleave", () => {
        if (hovered === card) hovered = null;
        draw();
      });

      button.addEventListener("focus", () => {
        if (!button.matches(":focus-visible") || gesture) return;

        focused = card;

        offset =
          index * (cardWidth + gap) -
          Math.max(10, (viewport.clientWidth - cardWidth) / 2);

        normalizeOffset();
        draw();
      });

      button.addEventListener("blur", () => {
        if (focused === card) focused = null;
        draw();
      });

      button.addEventListener("click", () => {
        // Kéo tranh không bị hiểu nhầm thành click giữ tranh.
        if (performance.now() < suppressClickUntil) return;

        pinned = pinned === card ? null : card;
        draw();
      });

      button.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          focusCard(index + 1);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          focusCard(index - 1);
        }

        if (event.key === "Escape") {
          pinned = null;
          hovered = null;
          focused = null;
          button.blur();
          draw();
        }
      });

      image.addEventListener("load", draw);
    });


    /* ========================================
       KÉO BẰNG CHUỘT / CẢM ỨNG
       ======================================== */

    viewport.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;

      gesture = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startOffset: offset,
        dragging: false
      };
    });

    window.addEventListener("pointermove", (event) => {
      if (!gesture || event.pointerId !== gesture.id) return;

      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;

      if (!gesture.dragging) {
        // Trên điện thoại vẫn cuộn trang theo chiều dọc.
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          gesture = null;
          return;
        }

        if (Math.abs(dx) < 7) return;

        gesture.dragging = true;
        pinned = null;
        hovered = null;
        focused = null;

        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(event.pointerId);
      }

      if (event.cancelable) event.preventDefault();

      offset = gesture.startOffset - dx;
      normalizeOffset();
      draw();
    }, { passive: false });

    function finishGesture(event) {
      if (!gesture || event.pointerId !== gesture.id) return;

      const dragged = gesture.dragging;
      const id = gesture.id;

      gesture = null;
      viewport.classList.remove("is-dragging");

      if (viewport.hasPointerCapture(id)) {
        viewport.releasePointerCapture(id);
      }

      if (dragged) {
        suppressClickUntil = performance.now() + 350;
        hovered = null;
      }

      draw();
    }

    window.addEventListener("pointerup", finishGesture);
    window.addEventListener("pointercancel", finishGesture);

    viewport.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });


    /* ========================================
       CHUYỂN ĐỘNG TỰ ĐỘNG
       ======================================== */

    function measure() {
      const style = getComputedStyle(page);

      cardWidth = parseFloat(
        style.getPropertyValue("--art-width")
      );

      cardHeight = parseFloat(
        style.getPropertyValue("--art-height")
      );

      gap = parseFloat(style.getPropertyValue("--art-gap"));

      normalizeOffset();
      draw();
    }

    const dialog = document.querySelector("#animation-dialog");

    function tick(time) {
      const delta = lastTime ? Math.min(time - lastTime, 50) : 0;
      lastTime = time;

      const stopped =
        reduce.matches ||
        pinned ||
        hovered ||
        focused ||
        gesture ||
        !inView ||
        document.hidden ||
        dialog.open;

      if (!stopped) {
        offset += speed * delta / 1000;
        normalizeOffset();
        draw();
      }

      requestAnimationFrame(tick);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
      }).observe(viewport);
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(measure).observe(viewport);
    } else {
      window.addEventListener("resize", measure);
    }

    measure();
    requestAnimationFrame(tick);


    /* ========================================
       ANIMATION / VIEW PROJECT
       ======================================== */

    const grid = document.querySelector("#animation-grid");
    const dialogTitle = document.querySelector("#animation-dialog-title");
    const dialogMedia = document.querySelector("#animation-dialog-media");
    const dialogBio = document.querySelector("#animation-dialog-bio");
    const dialogSoftware = document.querySelector("#animation-dialog-software");
    const closeButton = document.querySelector("#animation-close");

    const previews = [];
    let opener = null;

    function stopPreviews() {
      previews.forEach((video) => video.pause());
    }

    function clearDialogMedia() {
      const video = dialogMedia.querySelector("video");

      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }

      dialogMedia.replaceChildren();
    }

    function openAnimation(item, button) {
      opener = button;
      stopPreviews();
      clearDialogMedia();

      dialogTitle.textContent = item.title;
      dialogBio.textContent = item.bio;
      dialogSoftware.textContent = `Software: ${item.software}`;

      if (item.gif) {
        const image = node("img");
        image.src = url("animations/" + item.file);
        image.alt = item.title;
        dialogMedia.append(image);

        dialog.showModal();
      } else {
        const video = node("video");

        video.src = url("animations/" + item.file);
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("aria-label", item.title);

        dialogMedia.append(video);
        dialog.showModal();

        video.play().catch(() => {});
      }
    }

    closeButton.addEventListener("click", () => {
      dialog.close();
    });

    dialog.addEventListener("close", () => {
      clearDialogMedia();
      opener?.focus({ preventScroll: true });
    });

    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;

      const box = dialog.getBoundingClientRect();

      const outside =
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom;

      if (outside) dialog.close();
    });

    animations.forEach((item) => {
      const card = node("article", "animation-card");
      const preview = node("div", "animation-preview");
      const overlay = node("div", "animation-overlay");

      if (item.gif) {
        const image = node("img");

        image.src = url("animations/" + item.file);
        image.alt = item.title;
        image.loading = "lazy";

        preview.append(image);
      } else {
        const video = node("video");

        video.src = url("animations/" + item.file);
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = "metadata";
        video.setAttribute("aria-hidden", "true");

        previews.push(video);

        video.addEventListener("loadedmetadata", () => {
          if (video.paused && Number.isFinite(video.duration)) {
            video.currentTime = Math.min(.1, video.duration / 2);
          }
        });

        let wantsPreview = false;

        card.addEventListener("pointerenter", () => {
          if (!finePointer.matches || reduce.matches || dialog.open) {
            return;
          }

          wantsPreview = true;

          video.play().then(() => {
            if (!wantsPreview || dialog.open || document.hidden) {
              video.pause();
            }
          }).catch(() => {});
        });

        card.addEventListener("pointerleave", () => {
          wantsPreview = false;
          video.pause();
        });

        preview.append(video);
      }

      // Cả GIF và MP4 đều có View Project.
      const view = node(
        "button",
        "playground-button",
        "View Project"
      );

      view.type = "button";
      view.setAttribute("aria-label", `View ${item.title}`);

      view.addEventListener("click", () => {
        openAnimation(item, view);
      });

      overlay.append(view);
      preview.append(overlay);

      card.append(
        preview,
        node("h3", "animation-name", item.title),
        node("p", "animation-type", item.type)
      );

      grid.append(card);
    });

    document.addEventListener("visibilitychange", () => {
      lastTime = 0;

      if (document.hidden) {
        stopPreviews();
        dialogMedia.querySelector("video")?.pause();
      }
    });

    window.addEventListener("pagehide", () => {
      stopPreviews();
      dialogMedia.querySelector("video")?.pause();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();