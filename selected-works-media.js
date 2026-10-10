(() => {
  function initWorksMedia() {
    const track = document.querySelector("#works-track");
    if (!track || track.dataset.mediaReady) return;

    const cards = [...track.querySelectorAll(".work-card")];
    if (!cards.length) return;

    track.dataset.mediaReady = "true";

    const root = "selected works/projects/";
    const iconRoot = root + "icons/animated icons/";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const touchDevice = window.matchMedia("(hover: none)");

    /*
      still: giây dùng làm ảnh tĩnh
      start / end: đoạn chạy khi hover
      crop: vị trí hình trong khung hẹp
      staticOnly: chỉ hiện ảnh tĩnh
    */
    const items = [
      {
        title: "Tò Te Tí",
        file: "MV.webm",
        still: 3.77,
        start: 2.5,
        end: 11.8,
        crop: "50% 50%"
      },
            {
        title: "Daddy’s Here",
        file: "daddys-here.webm",
        still: 2,
        start: 0,
        end: 20,
        crop: "50% 50%"
      },{
        title:
          "When Constipation Became the Ultimate Villain and I Had to Awaken My Excretory Haki",
        file: "constipation animation.webm",
        still: 78.1,
        start: 75,
        end: 87,
        crop: "50% 50%"
      },
      {
        title: "Overthinking",
        file: "overthinking.webm",
        still: 16.3,
        start: 12,
        end: 24,
        crop: "50% 50%"
      },
      {
        title: "Silent Cat",
        file: "poem based website.webm",
        still: 24.8,
        start: 22,
        end: 32,
crop: "calc(50% + 83px) 50%"
      },
      {
        title: "SENTINEL: PLAGUE CONTROL",
        file: "Animatic_Sentinel Plague control.webm",
        still: 51.4,
        start: 48,
        end: 60,
        crop: "55% 50%"
      },
      {
        title: "Olympian Icons",
        icons: [
          "song-tu.gif",
          "bach-duong.gif",
          "kim-nguu.gif",
          "song-ngu.gif"
        ]
      },
{
  title: "Best Skincare Routine Order for 20+ Year Olds",
  file: "inforgraphic.webm",
  still: 15.4,
  start: 12,
  end: 26,
crop: "calc(50% + 40px) 50%"
}
    ];

    const states = [];
    let pageVisible = !document.hidden;

    function assetURL(path) {
      return encodeURI(path);
    }

    function mount(card, item) {
      const media = card.querySelector(".work-card__media");
      if (!media) return;

      const state = {
        card,
        item,
        media,
        hovered: false,
        focused: false,
        inView: true,
        active: false,
        ready: false,
        timer: null,
        iconIndex: 0
      };

      states.push(state);
      media.replaceChildren();

      if (item.icons) {
        mountIcons(state);
      } else {
        mountVideo(state);
      }

      card.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        state.hovered = true;
        reconcile();
      });

      card.addEventListener("pointerleave", () => {
        state.hovered = false;
        reconcile();
      });

      card.addEventListener("focus", () => {
        state.focused = card.matches(":focus-visible");
        reconcile();
      });

      card.addEventListener("blur", () => {
        state.focused = false;
        reconcile();
      });

      card.addEventListener("click", () => {
        requestAnimationFrame(reconcile);
      });
    }

    function mountVideo(state) {
      const { media, item } = state;
      const video = document.createElement("video");

      video.className = "work-preview-video";
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.controls = false;
      video.preload = "metadata";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true");
      video.style.objectPosition = item.crop;
      video.src = assetURL(root + item.file);

      state.video = video;
      media.append(video);

      video.addEventListener("loadedmetadata", () => {
        const maxTime = Math.max(0, video.duration - 0.1);

        state.still = Math.min(item.still || 0, maxTime);
        state.start = Math.min(item.start || 0, maxTime);
        state.end = Math.min(
          item.end || video.duration,
          video.duration
        );

        state.ready = true;

        if (state.active) {
          playVideo(state);
        } else {
          video.currentTime = state.still;
        }
      });

      video.addEventListener("timeupdate", () => {
        if (!state.active || !state.ready) return;

        if (video.currentTime >= state.end) {
          video.currentTime = state.start;
        }
      });

      video.addEventListener("ended", () => {
        if (state.active) playVideo(state);
      });

      video.addEventListener("error", () => {
        media.classList.add("work-media-error");

        const message = document.createElement("span");
        message.className = "work-media-message";
        message.textContent = "Preview unavailable";

        media.replaceChildren(message);
        console.warn("Không tải được preview:", video.src);
      });
    }

    function playVideo(state) {
      if (!state.ready) return;

      const video = state.video;
      video.currentTime = state.start;

      const promise = video.play();

      if (promise) {
        promise.then(() => {
          // Chặn video tiếp tục chạy nếu chuột đã rời đi.
          if (!state.active) {
            video.pause();
            video.currentTime = state.still;
          }
        }).catch(() => {
          video.pause();
          if (state.ready) video.currentTime = state.still;
        });
      }
    }

    function mountIcons(state) {
      state.media.classList.add("work-icon-media");

      state.images = state.item.icons.map((file, index) => {
        const image = document.createElement("img");

        image.className = "work-icon-slide";
        image.classList.toggle("is-visible", index === 0);
        image.src = assetURL(iconRoot + file);
        image.alt = "";
        image.draggable = false;

        state.media.append(image);
        return image;
      });
    }

    function showIcon(state, index) {
      state.iconIndex = index;

      state.images.forEach((image, i) => {
        image.classList.toggle("is-visible", i === index);
      });
    }

    function setActive(state, active) {
      if (state.active === active) return;
      state.active = active;

      if (state.images) {
        clearInterval(state.timer);
        state.timer = null;

        if (active) {
          // Mỗi hình giữ 3.6 giây, CSS fade trong 650ms.
          state.timer = setInterval(() => {
            showIcon(
              state,
              (state.iconIndex + 1) % state.images.length
            );
          }, 3600);
        }

        return;
      }

      if (active) {
        playVideo(state);
      } else {
        state.video.pause();

        if (state.ready) {
          state.video.currentTime = state.still;
        }
      }
    }

function reconcile() {
  states.forEach((state) => {
    const selected = state.card.classList.contains("is-selected");
    const isIcons = Boolean(state.images);

    const requested = isIcons
      // Bốn GIF luôn luân phiên, không cần hover hoặc chọn thẻ.
      ? true
      // Video: desktop hover, mobile bấm chọn.
      : state.hovered ||
        state.focused ||
        (selected && touchDevice.matches);

    const active =
      requested &&
      pageVisible &&
      state.inView &&
      !reduceMotion.matches &&
      !state.item.staticOnly;

    setActive(state, Boolean(active));
  });
}

    cards.forEach((card) => {
      const label = card.getAttribute("aria-label") || "";

      // Tìm theo tên, không theo vị trí vì các thẻ được sắp xếp lại.
      const item = items.find((entry) => label.includes(entry.title));

      if (item) mount(card, item);
    });

    // Theo dõi thẻ được chọn bởi selected-works.js.
    const selectionObserver = new MutationObserver(reconcile);

    selectionObserver.observe(track, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-pressed"]
    });

    if ("IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const state = states.find(
            (item) => item.card === entry.target
          );

          if (state) state.inView = entry.isIntersecting;
        });

        reconcile();
      });

      states.forEach((state) => {
        visibilityObserver.observe(state.card);
      });
    }

    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
      reconcile();
    });

    window.addEventListener("pagehide", () => {
      pageVisible = false;
      reconcile();
    });

    window.addEventListener("pageshow", () => {
      pageVisible = !document.hidden;
      reconcile();
    });

    reduceMotion.addEventListener("change", reconcile);
    touchDevice.addEventListener("change", reconcile);

    reconcile();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorksMedia, {
      once: true
    });
  } else {
    initWorksMedia();
  }
})();