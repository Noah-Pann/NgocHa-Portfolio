(() => {
  function initSelectedWorks() {
    const track = document.querySelector("#works-track");
    if (!track || track.dataset.ready) return;
    track.dataset.ready = "true";

    /* ========================================
       PROJECT DATA
       Điền link thật vào projectUrl / websiteUrl sau.
       ======================================== */

    const projects = [
      {
        title: "Tò Te Tí",
        shortTitle: "Tò Te Tí",
        category: "Mixed-media Music Video",
        year: "2026",
        brief:
          "A playful romance takes a complicated turn in a mixed-media music video about blurred boundaries and hidden relationships.",
        poster: "",
        crop: "50% 50%",
        color: "#bc829e",
        projectUrl: "",
        isWebsite: false,
        websiteUrl: ""
      },
            {
        title: "Daddy’s Here",
        shortTitle: "Daddy’s Here",
        category: "Mixed-media Animated Short",
        year: "2026",
        brief:
          "A frightened child mistakes a toy’s shadow for a monster, until her father turns a stormy night into a moment of comfort.",
        poster: "",
        crop: "50% 50%",
        color: "#827b62",
        projectUrl: "project.html?project=daddys-here",
        isWebsite: false,
        websiteUrl: ""
      },{
        
        title:
          "When Constipation Became the Ultimate Villain and I Had to Awaken My Excretory Haki",
        shortTitle: "Excretory Haki",
        category: "Animation",
        year: "2025",
        brief:
          "A constipated university girl journeys inside her gut to battle the Fairy of Constipation and unlock the power of fiber.",
        poster: "",
        crop: "50% 50%",
        color: "#7974a0",
        projectUrl: "",
        isWebsite: false,
        websiteUrl: ""
      },
      {
        title: "Overthinking",
        shortTitle: "Overthinking",
        category: "Interactive Web Experience",
        year: "2025",
        brief:
          "An interactive exploration of overthinking through a clock, a phone, and a mirror, where controlling one thought unravels another.",
        poster: "",
        crop: "50% 50%",
        color: "#4e607c",
        projectUrl: "",
        isWebsite: true,
        websiteUrl: ""
      },
      {
        title: "Silent Cat",
        shortTitle: "Silent Cat",
        category: "Interactive Web Poetry",
        year: "2025",
        brief:
          "An interactive poem about quiet, unspoken love, told through the symbolic presence of a cat.",
        poster: "",
        crop: "50% 50%",
        color: "#ac9cac",
        projectUrl: "",
        isWebsite: true,
        websiteUrl: ""
      },
      {
        title: "SENTINEL: PLAGUE CONTROL",
        shortTitle: "SENTINEL: PLAGUE CONTROL",
        category: "Game Trailer Animatic",
        year: "2025",
        brief:
          "An animatic trailer introducing a game about detecting impostors who have infiltrated a factory.",
        poster: "",
        crop: "50% 50%",
        color: "#46585e",
        projectUrl: "",
        isWebsite: false,
        websiteUrl: ""
      },
      {
        title: "Olympian Icons",
        shortTitle: "Olympian Icons",
        category: "Icon Design & Animation",
        year: "2024",
        brief:
          "A Greek mythology-inspired icon collection in three sizes, accompanied by a set of four animated icons.",
        poster: "",
        crop: "50% 50%",
        color: "#ac927d",
        projectUrl: "",
        isWebsite: false,
        websiteUrl: ""
      },
      {
        title: "Best Skincare Routine Order for 20+ Year Olds",
        shortTitle: "Skincare Routine Order",
        category: "Interactive Infographic",
        year: "2024",
        brief:
          "A seven-step interactive infographic that makes skincare routines easier to understand and navigate for young adults.",
        poster: "",
        crop: "50% 50%",
        color: "#92a69f",
        projectUrl: "",
        isWebsite: false,
        websiteUrl: ""
      }
    ];

    const viewport = track.closest(".works-viewport");
    const title = document.querySelector("#works-title");
    const category = document.querySelector("#works-category");
    const brief = document.querySelector("#works-brief");
    const year = document.querySelector("#works-year");
    const projectLink = document.querySelector("#works-project-link");
    const websiteLink = document.querySelector("#works-website-link");
    const announcement = document.querySelector("#works-announcement");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const canAnimate = typeof track.animate === "function";

    const cards = [];
    const cardAnimations = new Map();

    let selectedIndex = 0;
    let yearAnimations = [];
    let textFrame = null;
    let finishText = () => {};

    /* ========================================
       PLACEHOLDER VÀ THUMBNAIL
       ======================================== */

    function createPlaceholder(project, index) {
      const box = document.createElement("div");
      box.className = "work-placeholder";
      box.setAttribute("aria-hidden", "true");
      box.style.setProperty("--placeholder-color", project.color);

      const number = document.createElement("span");
      number.className = "work-placeholder__number";
      number.textContent = String(index + 1).padStart(2, "0");

      box.append(number);
      return box;
    }

    projects.forEach((project, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "work-card";
      card.setAttribute("aria-label", project.title);
      card.setAttribute("aria-pressed", "false");
      card.setAttribute("aria-controls", "works-info");
      card.style.setProperty("--crop-position", project.crop);

      const media = document.createElement("div");
      media.className = "work-card__media";

      if (project.poster) {
        const image = document.createElement("img");
        image.src = project.poster;
        image.alt = "";
        image.draggable = false;

        image.addEventListener("error", () => {
          media.replaceChildren(createPlaceholder(project, index));
        }, { once: true });

        media.append(image);
      } else {
        media.append(createPlaceholder(project, index));
      }

      const caption = document.createElement("span");
      caption.className = "work-card__caption";
      caption.setAttribute("aria-hidden", "true");

      const name = document.createElement("span");
      name.className = "work-card__name";
      name.textContent = project.shortTitle;

      const type = document.createElement("span");
      type.className = "work-card__category";
      type.textContent = project.category;

      caption.append(name, type);
      card.append(media, caption);

      card.addEventListener("click", () => selectProject(index));

      cards.push(card);
      track.append(card);
    });

    /* ========================================
       NĂM LẬT
       ======================================== */

    function clearYearMotion() {
      yearAnimations.forEach(animation => animation.cancel());
      yearAnimations = [];

      year.parentElement
        .querySelectorAll(".works-year__old")
        .forEach(element => element.remove());
    }

    function updateYear(value, animate) {
      if (year.textContent === value) return;

      clearYearMotion();

      const oldValue = year.textContent;
      year.textContent = value;

      if (!animate) return;

      const old = document.createElement("span");
      old.className = "works-year__value works-year__old";
      old.textContent = oldValue;
      old.setAttribute("aria-hidden", "true");
      year.parentElement.append(old);

      const outgoing = old.animate(
        [
          { transform: "rotateX(0deg)", opacity: 1 },
          { transform: "rotateX(90deg)", opacity: 0 }
        ],
        {
          duration: 250,
          easing: "ease-in",
          fill: "both"
        }
      );

      const incoming = year.animate(
        [
          { transform: "rotateX(-90deg)", opacity: 0 },
          { transform: "rotateX(0deg)", opacity: 1 }
        ],
        {
          duration: 380,
          delay: 160,
          easing: "cubic-bezier(.22,1,.36,1)",
          fill: "both"
        }
      );

      yearAnimations.push(outgoing, incoming);

      outgoing.finished.then(() => {
        old.remove();
        outgoing.cancel();
      }).catch(() => {});

      incoming.finished.then(() => {
        incoming.cancel();
      }).catch(() => {});
    }

    /* ========================================
       CHỮ HIỆN DẦN — KHÔNG NHẢY TRONG LÚC GÕ
       ======================================== */

    function writeInfo(project, animate) {
      cancelAnimationFrame(textFrame);

      title.classList.toggle(
        "is-long-title",
        project.title.length > 48
      );

      const fields = [
        { element: title, text: project.title, delay: 0, speed: 130 },
        { element: category, text: project.category, delay: 100, speed: 170 },
        { element: brief, text: project.brief, delay: 180, speed: 220 }
      ];

      fields.forEach(field => {
        field.element.classList.add("works-write");

        const accessible = document.createElement("span");
        accessible.className = "works-sr-only";
        accessible.textContent = field.text;

        const space = document.createElement("span");
        space.className = "works-write__space";
        space.setAttribute("aria-hidden", "true");
        space.textContent = field.text;

        field.visible = document.createElement("span");
        field.visible.className = "works-write__visible";
        field.visible.setAttribute("aria-hidden", "true");

        field.chars = Array.from(field.text);
        field.count = -1;

        field.element.replaceChildren(
          accessible,
          space,
          field.visible
        );
      });

      finishText = () => {
        cancelAnimationFrame(textFrame);
        fields.forEach(field => {
          field.visible.textContent = field.text;
        });
      };

      if (!animate) {
        finishText();
        return;
      }

      let start = null;

      function tick(time) {
        if (start === null) start = time;

        const elapsed = time - start;
        let complete = true;

        fields.forEach(field => {
          const count = Math.min(
            field.chars.length,
            Math.floor(
              Math.max(0, elapsed - field.delay) * field.speed / 1000
            )
          );

          if (count !== field.count) {
            field.count = count;
            field.visible.textContent = field.chars
              .slice(0, count)
              .join("");
          }

          if (count < field.chars.length) complete = false;
        });

        if (!complete) textFrame = requestAnimationFrame(tick);
      }

      textFrame = requestAnimationFrame(tick);
    }

    /* ========================================
       LINK — TỰ BẬT KHI CÓ URL
       ======================================== */

    function setLink(element, url) {
      if (url) {
        element.href = url;
        element.removeAttribute("aria-disabled");
        element.removeAttribute("tabindex");
        element.removeAttribute("title");
      } else {
        element.removeAttribute("href");
        element.setAttribute("aria-disabled", "true");
        element.setAttribute("tabindex", "-1");
        element.title = "Coming soon";
      }
    }

    function updateInfo(index, animate) {
      const project = projects[index];

      writeInfo(project, animate);
      updateYear(project.year, animate);

      setLink(projectLink, project.projectUrl);

      websiteLink.hidden = !project.isWebsite;
      setLink(websiteLink, project.websiteUrl);

      announcement.textContent =
        `${project.title}. ${project.category}. ${project.year}.`;
    }

    /* ========================================
       CHỌN PROJECT
       ======================================== */

    function selectProject(index, initial = false) {
      if (!initial && index === selectedIndex) return;

      const animate = !initial && !reduce.matches && canAnimate;
      const focused = document.activeElement;
      const restoreFocus = track.contains(focused);
      const before = new Map();

      cards.forEach(card => {
        before.set(card, card.getBoundingClientRect());
      });

      cardAnimations.forEach(animation => animation.cancel());
      cardAnimations.clear();

      selectedIndex = index;

      cards.forEach((card, cardIndex) => {
        const selected = cardIndex === index;
        card.classList.toggle("is-selected", selected);
        card.setAttribute("aria-pressed", String(selected));
      });

      cards.forEach((card, cardIndex) => {
        if (cardIndex !== index) track.append(card);
      });

      track.append(cards[index]);

      if (restoreFocus && focused instanceof HTMLElement) {
        focused.focus({ preventScroll: true });
      }

      if (animate) {
        cards.forEach(card => {
          const first = before.get(card);
          const last = card.getBoundingClientRect();

          if (!first.width || !last.width || !last.height) return;

          const animation = card.animate(
            [
              {
                transformOrigin: "top left",
                transform:
                  `translate(${first.left - last.left}px, ` +
                  `${first.top - last.top}px) ` +
                  `scale(${first.width / last.width}, ` +
                  `${first.height / last.height})`
              },
              {
                transformOrigin: "top left",
                transform: "translate(0, 0) scale(1, 1)"
              }
            ],
            {
              duration: 850,
              easing: "cubic-bezier(.22,1,.36,1)",
              fill: "both"
            }
          );

          cardAnimations.set(card, animation);

          animation.finished.then(() => {
            animation.cancel();

            if (cardAnimations.get(card) === animation) {
              cardAnimations.delete(card);
            }
          }).catch(() => {});
        });
      }

      updateInfo(index, !reduce.matches);

      if (viewport.scrollWidth > viewport.clientWidth + 1) {
        viewport.scrollTo({
          left: viewport.scrollWidth - viewport.clientWidth,
          behavior: animate ? "smooth" : "auto"
        });
      }
    }

    document.querySelector("#works-prev").addEventListener("click", () => {
      selectProject(
        (selectedIndex - 1 + projects.length) % projects.length
      );
    });

    document.querySelector("#works-next").addEventListener("click", () => {
      selectProject((selectedIndex + 1) % projects.length);
    });

    track.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;

      event.preventDefault();

      const direction = event.key === "ArrowRight" ? 1 : -1;
      const target =
        (selectedIndex + direction + projects.length) %
        projects.length;

      selectProject(target);
      cards[target].focus({ preventScroll: true });
    });

    function finishMotion() {
      cardAnimations.forEach(animation => animation.cancel());
      cardAnimations.clear();
      clearYearMotion();
    }

    window.addEventListener("resize", finishMotion);

    reduce.addEventListener("change", event => {
      if (event.matches) {
        finishMotion();
        finishText();
      }
    });

    selectProject(0, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initSelectedWorks,
      { once: true }
    );
  } else {
    initSelectedWorks();
  }
})();