(() => {
  function initProfile() {
    const page = document.querySelector(".profile-page");

    // Tránh chạy trước khi có HTML hoặc khởi tạo hai lần.
    if (!page || page.dataset.motionReady) return;
    page.dataset.motionReady = "true";

    /* ========================================
       CHỈNH NHANH
       ======================================== */

    const settings = {
      textSpeed: 170,   // Ký tự/giây của nội dung
      typeDelay: 55,    // Millisecond/ký tự nghề nghiệp
      deleteDelay: 28,
      roleHold: 1500,
      roleGap: 240
    };

    const reduce = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    // Giữ nội dung tĩnh nếu người xem chọn giảm chuyển động.
    if (
      reduce.matches ||
      typeof page.animate !== "function"
    ) {
      return;
    }

    const roles = [
      " Graphic Designer...",
      "n Illustrator...",
      " Motion Designer..."
    ];

    const role = page.querySelector("#profile-role-text");
    const roleBlock = page.querySelector(".profile-role");
    const collage = page.querySelector(".profile-collage");

    const animations = new Set();
    const groups = new Map();
    const writers = [];

    let observer;
    let raf;
    let safety;
    let stopped = false;
    let last = null;

    let roleActive = false;
    let index = 0;
    let length = 0;
    let deleting = false;
    let clock = 0;
    let wait = 400;

    /* ========================================
       ĐĂNG KÝ HIỆU ỨNG THEO VÙNG NHÌN THẤY
       ======================================== */

    function addAction(trigger, action) {
      if (!trigger) {
        action();
        return;
      }

      if (!groups.has(trigger)) {
        groups.set(trigger, []);
      }

      groups.get(trigger).push(action);
    }

    function motion(
      element,
      trigger,
      frames,
      duration = 850,
      delay = 0
    ) {
      if (!element) return;

      const animation = element.animate(frames, {
        duration,
        delay,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "both"
      });

      // Giữ frame đầu cho đến khi vùng chứa xuất hiện.
      animation.pause();
      animation.currentTime = 0;
      animations.add(animation);

      // Kết thúc thì trả lại trạng thái CSS gốc.
      animation.finished.then(() => {
        animation.cancel();
        animations.delete(animation);
      }).catch(() => {});

      addAction(trigger, () => animation.play());
    }

    function reveal(trigger) {
      const actions = groups.get(trigger);
      if (!actions) return;

      actions.forEach(action => action());

      groups.delete(trigger);
      observer?.unobserve(trigger);
    }

    /* ========================================
       KHÔI PHỤC NẾU CÓ LỖI / GIẢM CHUYỂN ĐỘNG
       ======================================== */

    function restore() {
      stopped = true;

      clearTimeout(safety);
      cancelAnimationFrame(raf);
      observer?.disconnect();

      animations.forEach(animation => animation.cancel());
      animations.clear();
      groups.clear();

      writers.forEach(writer => {
        writer.visible.textContent = writer.text;
      });

      if (role) {
        role.textContent = roles[0];
      }
    }

    /* ========================================
       GÕ CHỮ VÀ ĐỔI NGHỀ NGHIỆP
       ======================================== */

    function tick(time) {
      if (stopped) return;

      const delta = last === null
        ? 0
        : Math.min(time - last, 50);

      last = time;

      writers.forEach(writer => {
        if (
          !writer.active ||
          writer.count >= writer.chars.length
        ) {
          return;
        }

        writer.progress += delta * settings.textSpeed / 1000;

        const count = Math.min(
          Math.floor(writer.progress),
          writer.chars.length
        );

        if (count !== writer.count) {
          writer.count = count;
          writer.visible.textContent = writer.chars
            .slice(0, count)
            .join("");
        }
      });

      // Nghỉ đổi nghề nghiệp khi đã cuộn ra khỏi vùng nhìn thấy.
      const rect = roleBlock?.getBoundingClientRect();

      if (
        role &&
        roleActive &&
        rect &&
        rect.bottom > 0 &&
        rect.top < innerHeight
      ) {
        if (wait > 0) {
          wait = Math.max(0, wait - delta);
        } else {
          clock += delta;

          const step = deleting
            ? settings.deleteDelay
            : settings.typeDelay;

          while (clock >= step) {
            clock -= step;
            length += deleting ? -1 : 1;

            role.textContent = roles[index].slice(0, length);

            if (!deleting && length === roles[index].length) {
              deleting = true;
              wait = settings.roleHold;
              clock = 0;
              break;
            }

            if (deleting && length === 0) {
              deleting = false;
              index = (index + 1) % roles.length;
              wait = settings.roleGap;
              clock = 0;
              break;
            }
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    /* ========================================
       CHUẨN BỊ ANIMATION
       ======================================== */

    async function start() {
      // Không để nội dung bị ẩn mãi nếu bước khởi tạo lỗi.
      safety = setTimeout(restore, 4500);

      try {
        /* PORTRAIT — dịch nhẹ từ trái và fade */
        motion(
          page.querySelector(".profile-photo"),
          collage,
          [
            {
              opacity: 0,
              transform: "translateX(-32px)"
            },
            {
              opacity: 1,
              transform: "translateX(0)"
            }
          ],
          900
        );

        /*
         * KHUNG SAU — núp sau portrait rồi trượt ra.
         * Không animate opacity.
         * Clip tránh khung ló ra trước khi portrait xuất hiện.
         */
        motion(
          page.querySelector(".profile-side"),
          collage,
          [
            {
              transform: "translateX(-95%) rotate(-6deg)",
              clipPath: "inset(0 100% 0 0)"
            },
            {
              transform: "translateX(-70%) rotate(-4deg)",
              clipPath: "inset(0 0% 0 0)",
              offset: .2
            },
            {
              transform: "translateX(0) rotate(0)",
              clipPath: "inset(0 0% 0 0)"
            }
          ],
          1050,
          300
        );

        /* HAI SAO — xoay vào sau khi hai ảnh đã vào vị trí */
/* HAI SAO — XOAY VÀO RỒI ĐUNG ĐƯA CHẬM */
[
  {
    selector: ".profile-star--blue",
    entranceAngle: -125,
    angle: 7,
    duration: 9000,
    delay: 1400
  },
  {
    selector: ".profile-star--pink",
    entranceAngle: 115,
    angle: -9,
    duration: 11500,
    delay: 1540
  }
].forEach(config => {
  const star = page.querySelector(config.selector);
  if (!star) return;

  const entrance = star.animate(
    [
      {
        opacity: 0,
        transform: `rotate(${config.entranceAngle}deg) scale(.25)`
      },
      {
        opacity: 1,
        transform: "rotate(0deg) scale(1)"
      }
    ],
    {
      duration: 1000,
      delay: config.delay,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "both"
    }
  );

  entrance.pause();
  entrance.currentTime = 0;
  animations.add(entrance);

  addAction(collage, () => entrance.play());

  entrance.finished.then(() => {
    entrance.cancel();
    animations.delete(entrance);

    if (stopped) return;

    const sway = star.animate(
      [
        { transform: "rotate(0deg)", offset: 0 },
        {
          transform: `rotate(${config.angle}deg)`,
          offset: .25
        },
        { transform: "rotate(0deg)", offset: .5 },
        {
          transform: `rotate(${-config.angle}deg)`,
          offset: .75
        },
        { transform: "rotate(0deg)", offset: 1 }
      ],
      {
        duration: config.duration,
        iterations: Infinity,
        easing: "ease-in-out"
      }
    );

    animations.add(sway);
  }).catch(() => {});
});

        /* HAI CHẤM XANH — bật lên nhẹ */
        page.querySelectorAll(".profile-dot").forEach((dot, i) => {
          motion(
            dot,
            collage,
            [
              { transform: "scale(0)" },
              { transform: "scale(1.16)", offset: .65 },
              { transform: "scale(1)" }
            ],
            600,
            1700 + i * 130
          );
        });

        /*
         * DẤU NGOẶC
         * mark--up / closing: từ trái.
         * mark-down / opening: từ phải.
         * Quan sát section chứa để vị trí đang ẩn
         * không ảnh hưởng thời điểm kích hoạt.
         */
        page.querySelectorAll(".profile-mark").forEach(mark => {
          const closing = mark.classList.contains(
            "profile-mark--closing"
          );

          motion(
            mark,
            mark.parentElement,
            [
              {
                opacity: 0,
                transform:
                  `translateX(${closing ? -48 : 48}px)`
              },
              {
                opacity: 1,
                transform: "translateX(0)"
              }
            ],
            1000
          );
        });

        /* ICON PHẦN MỀM — lần lượt từ trái sang phải */
        page.querySelectorAll(".profile-tool-list li")
          .forEach((item, i) => {
            motion(
              item,
              item.closest(".profile-tool-list"),
              [
                {
                  opacity: 0,
                  transform: "translateY(22px) scale(.94)"
                },
                {
                  opacity: 1,
                  transform: "translateY(0) scale(1)"
                }
              ],
              750,
              i * 90
            );
          });

        /* BACK TO HOME */
        const back = page.querySelector(
          ".profile-bottom .inner-back"
        );

        motion(
          back,
          back?.parentElement,
          [
            {
              opacity: 0,
              transform: "translateY(14px)"
            },
            {
              opacity: 1,
              transform: "translateY(0)"
            }
          ],
          700,
          180
        );

        /* DÒNG NGHỀ NGHIỆP */
        motion(
          roleBlock,
          roleBlock,
          [{ opacity: 0 }, { opacity: 1 }],
          550
        );

        addAction(roleBlock, () => {
          roleActive = true;
        });


/* KEYWORDS — HIỆN LẦN LƯỢT */
page.querySelectorAll(".profile-keywords li").forEach((item, i) => {
  motion(
    item,
    item.closest(".profile-keywords"),
    [
      {
        opacity: 0,
        transform: "translateY(10px)"
      },
      {
        opacity: 1,
        transform: "translateY(0)"
      }
    ],
    600,
    200 + i * 90
  );
});
        /* CHỮ HIỆN DẦN — giữ diện tích để không nhảy layout */
        page.querySelectorAll("[data-write]").forEach(element => {
          const text = element.textContent
            .trim()
            .replace(/\s+/g, " ");

          const accessible = document.createElement("span");
          accessible.className = "profile-sr-only";
          accessible.textContent = text;

          const space = document.createElement("span");
          space.className = "profile-write__space";
          space.setAttribute("aria-hidden", "true");
          space.textContent = text;

          const visible = document.createElement("span");
          visible.className = "profile-write__visible";
          visible.setAttribute("aria-hidden", "true");

          element.classList.add("profile-write");
          element.replaceChildren(accessible, space, visible);

          const writer = {
            text,
            visible,
            chars: Array.from(text),
            progress: 0,
            count: 0,
            active: false
          };

          writers.push(writer);

          addAction(element, () => {
            writer.active = true;
          });
        });

        if (role) {
          role.textContent = "";
        }

        /*
         * Chờ ảnh và animation vào trang của tờ giấy.
         * Như vậy khung sau không bị fade theo giấy lúc trượt ra.
         * Không chờ animation con đang pause.
         */
        const ready = [
          ...page.querySelectorAll(
            ".profile-photo, .profile-side img"
          )
        ].map(img => {
          return img.decode
            ? img.decode().catch(() => {})
            : Promise.resolve();
        });

        page.getAnimations().forEach(animation => {
          ready.push(animation.finished.catch(() => {}));
        });

        let timeout;

        await Promise.race([
          Promise.all(ready),
          new Promise(resolve => {
            timeout = setTimeout(resolve, 1800);
          })
        ]);

        clearTimeout(timeout);

        if (stopped) return;

        /* CHẠY MỖI VÙNG MỘT LẦN KHI XUẤT HIỆN */
        if ("IntersectionObserver" in window) {
          observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                reveal(entry.target);
              }
            });
          }, {
            threshold: 0
          });

          groups.forEach((_, trigger) => {
            observer.observe(trigger);
          });
        } else {
          [...groups.keys()].forEach(reveal);
        }

        clearTimeout(safety);
        raf = requestAnimationFrame(tick);
      } catch (error) {
        console.warn("Profile animation:", error);
        restore();
      }
    }

    reduce.addEventListener("change", event => {
      if (event.matches) {
        restore();
      }
    });

    document.addEventListener("visibilitychange", () => {
      last = null;
    });

    // Khi Back phục hồi trang từ bộ nhớ, không để hình bị kẹt ẩn.
    window.addEventListener("pageshow", event => {
      if (event.persisted) {
        restore();
      }
    });

    start();
  }

  /* Hoạt động dù script nằm trong head hay cuối body */
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initProfile,
      { once: true }
    );
  } else {
    initProfile();
  }
})();