(() => {
  const root = document.documentElement;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const narrowScreen = window.matchMedia(
    "(max-width: 900px)"
  );

  const useIntro =
    !reducedMotion.matches &&
    typeof Element.prototype.animate === "function";

  let finished = false;
  let animations = [];

  let navigation;
  let toggle;
  let letter;
  let safetyTimer;

  /* Mỗi nút có timer riêng, tránh bị kẹt khi chạm liên tục */
  const tapTimers = new Map();


  /* ========================================
     KẾT THÚC INTRO
     ======================================== */

  function finishIntro() {
    finished = true;
    clearTimeout(safetyTimer);

    root.classList.remove("intro-pending", "intro-running");

    animations.forEach(animation => animation.cancel());
    animations = [];

    if (navigation) navigation.inert = false;
    if (toggle) toggle.disabled = false;
  }


  /* ========================================
     ĐẶT LẠI TRẠNG THÁI TƯƠNG TÁC
     ======================================== */

  function resetInteractions() {
    tapTimers.forEach((timer, button) => {
      clearTimeout(timer);
      button.classList.remove("is-tap-active");
    });

    tapTimers.clear();

    if (letter) {
      letter.classList.remove("is-paper-raised");
    }

    if (toggle) {
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", "Pull out paper");
    }
  }


  /* Mobile, cảm ứng và bàn phím đều dùng nhấn */
  function usesTap(event) {
    return (
      narrowScreen.matches ||
      !canHover.matches ||
      event.pointerType === "touch" ||
      event.pointerType === "pen" ||
      event.detail === 0
    );
  }


  /* ========================================
     MỘT LẦN CHẠM → CHẠY TRỌN HIỆU ỨNG
     ======================================== */

  function playTap(button) {
    clearTimeout(tapTimers.get(button));

    button.classList.add("is-tap-active");

    /*
     * 700ms: đủ để quét vào rồi giữ nhẹ.
     * Sau đó CSS tự chạy chuyển động thu lại.
     *
     * Chạm lại cùng nút: kéo dài trạng thái,
     * không ép animation nhảy về đầu.
     */
    const timer = setTimeout(() => {
      button.classList.remove("is-tap-active");
      tapTimers.delete(button);
    }, reducedMotion.matches ? 180 : 700);

    tapTimers.set(button, timer);
  }


  /* Chuẩn bị intro trước khi Home xuất hiện */
  if (useIntro) {
    root.classList.add("intro-pending");

    /* Không để nội dung bị ẩn mãi khi có lỗi */
    safetyTimer = setTimeout(finishIntro, 6500);
  }


  document.addEventListener("DOMContentLoaded", async () => {
    letter = document.querySelector(".letter");

    const menu = document.querySelector(".menu-letter");
    const paper = document.querySelector(".paper-motion");

    const items = [
      ...document.querySelectorAll(".nav-item")
    ];

    navigation = document.querySelector(".navigation");
    toggle = document.querySelector(".paper-toggle");

    if (!letter || !menu || !paper || !navigation || !toggle) {
      finishIntro();
      return;
    }


    /* ========================================
       CHẠM PHONG THƯ ĐỂ KÉO GIẤY
       ======================================== */

    toggle.hidden = false;
    toggle.setAttribute("aria-label", "Pull out paper");

letter.addEventListener("click", event => {
  // Bấm thông tin liên lạc thì mở link, không kéo giấy.
  if (event.target.closest("a")) return;

  // Không nhận thao tác kéo giấy khi intro chưa hoàn tất.
  if (toggle.disabled || !usesTap(event)) return;

  const raised = letter.classList.toggle("is-paper-raised");

  toggle.setAttribute("aria-pressed", String(raised));

  toggle.setAttribute(
    "aria-label",
    raised ? "Put paper back" : "Pull out paper"
  );
});


    /* ========================================
       CHẠM MENU ĐỂ CHẠY HIGHLIGHT
       ======================================== */

    navigation.addEventListener("click", event => {
      const button = event.target.closest(".nav-link");

      if (!button || !navigation.contains(button)) return;

      if (usesTap(event)) {
        playTap(button);
      }

      /*
       * Chưa nối chuyển trang.
       * data-page trong HTML được giữ cho bước sau.
       */
    });


    /* Bỏ intro nếu không cần chạy */
    if (!useIntro || finished || document.hidden) {
      finishIntro();
      return;
    }

    navigation.inert = true;
    toggle.disabled = true;


    try {
      /* ========================================
         ĐỢI ASSET VÀ FONT — TỐI ĐA 1,8 GIÂY
         ======================================== */

      const imagesReady = [
        ...document.querySelectorAll(".home img")
      ].map(img => {
        return img.decode
          ? img.decode().catch(() => {})
          : Promise.resolve();
      });

      await Promise.race([
        Promise.all([
          ...imagesReady,
          document.fonts.ready
        ]),
        new Promise(resolve => setTimeout(resolve, 1800))
      ]);

      if (finished || reducedMotion.matches || document.hidden) {
        finishIntro();
        return;
      }


      /* ========================================
         ANIMATION INTRO
         ======================================== */

      function animate(element, frames, duration, delay = 0) {
        const animation = element.animate(frames, {
          duration,
          delay,
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "both"
        });

        animations.push(animation);
      }

      root.classList.add("intro-running");


      /* Thư bên trái chạy vào */
      animate(
        letter,
        [
          {
            transform: "translate3d(-110vw, 18px, 0) rotate(-2deg)",
            opacity: 0
          },
          {
            transform: "translate3d(0, 0, 0) rotate(0deg)",
            opacity: 1
          }
        ],
        1200
      );


      /* Thư bên phải chạy vào */
      animate(
        menu,
        [
          {
            transform: "translate3d(110vw, 12px, 0) rotate(2deg)",
            opacity: 0
          },
          {
            transform: "translate3d(0, 0, 0) rotate(0deg)",
            opacity: 1
          }
        ],
        1200,
        100
      );


      /*


      /* Menu hiện lần lượt sau khi thư phải vào vị trí */
      items.forEach((item, index) => {
        animate(
          item,
          [
            {
              transform: "translateY(-14px)",
              opacity: 0
            },
            {
              transform: "translateY(0)",
              opacity: 1
            }
          ],
          550,
          1400 + index * 110
        );
      });

      root.classList.remove("intro-pending");

      await Promise.allSettled(
        animations.map(animation => animation.finished)
      );
    } catch (error) {
      console.warn("Intro skipped:", error);
    } finally {
      finishIntro();
    }
  }, { once: true });


  /* ========================================
     ĐỔI THIẾT BỊ / KÍCH THƯỚC / TRẠNG THÁI
     ======================================== */

  narrowScreen.addEventListener("change", () => {
    /*
     * Tránh giữ animation theo trục cũ
     * khi đổi giữa desktop và mobile.
     */
    finishIntro();
    resetInteractions();
  });

  canHover.addEventListener("change", resetInteractions);

  reducedMotion.addEventListener("change", event => {
    if (event.matches) {
      finishIntro();
      resetInteractions();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      finishIntro();
      resetInteractions();
    }
  });

  window.addEventListener("pageshow", event => {
    if (event.persisted) {
      finishIntro();
      resetInteractions();
    }
  });
})();