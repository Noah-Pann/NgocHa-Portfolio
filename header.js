(() => {
  function initHeader() {
    const header = document.querySelector(".inner-header");

    if (!header || header.dataset.ready) return;
    header.dataset.ready = "true";

    const mobile = window.matchMedia("(max-width: 900px)");

    const settings = {
      logo: "logo.svg",
      home: "index.html",
      links: [
        { label: "Home", href: "index.html" },
        { label: "Profile", href: "profile.html" },
        { label: "Selected Works", href: "selected-works.html" },
        { label: "Visual Playground", href: "visual-playground.html" },
        { label: "Contact", href: "contact.html" }
      ]
    };

    /* Logo */

    const homeLink = document.createElement("a");
    homeLink.className = "inner-home";
    homeLink.href = settings.home;
    homeLink.setAttribute("aria-label", "Phan Ngoc Ha — Home");

    const logo = document.createElement("img");
    logo.src = settings.logo;
    logo.alt = "";
    logo.width = 64;
    logo.height = 64;
    logo.draggable = false;

    homeLink.append(logo);

    /* Nút mở menu mobile */

    const toggle = document.createElement("button");
    toggle.className = "header-menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-controls", "header-navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");

    const toggleLabel = document.createElement("span");
    toggleLabel.className = "header-menu-label";
    toggleLabel.textContent = "Menu";

    const toggleIcon = document.createElement("span");
    toggleIcon.className = "header-menu-icon";
    toggleIcon.setAttribute("aria-hidden", "true");

    toggleIcon.append(
      document.createElement("span"),
      document.createElement("span")
    );

    toggle.append(toggleLabel, toggleIcon);

    /* Danh sách trang */

    const nav = document.createElement("nav");
    nav.id = "header-navigation";
    nav.className = "inner-nav";
    nav.setAttribute("aria-label", "Main navigation");

    settings.links.forEach(item => {
      const link = document.createElement("a");
      const label = document.createElement("span");

      link.className = "header-link";
      link.href = item.href;
      label.textContent = item.label;

      link.append(label);

      const destination = new URL(item.href, document.baseURI);
      const currentPath = window.location.pathname;

      const isCurrent =
        destination.pathname === currentPath ||
        (
          item.href === "index.html" &&
          currentPath === new URL(".", destination).pathname
        ) ||
        (
          item.href === "selected-works.html" &&
          currentPath.endsWith("/project.html")
        );

      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      }

      nav.append(link);
    });

    header.replaceChildren(homeLink, toggle, nav);

    let isOpen = false;

    function setOpen(open, restoreFocus = false) {
      isOpen = mobile.matches && open;

      header.classList.toggle("is-menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

      toggleLabel.textContent = isOpen ? "Close" : "Menu";

      // Menu đóng trên mobile không nhận focus bằng Tab.
      nav.inert = mobile.matches && !isOpen;

      if (restoreFocus && mobile.matches) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(!isOpen);
    });

    /* Giữ nguyên điều hướng và animation của pages.js */

    nav.addEventListener("click", event => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("a")) return;

      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      // Đợi pages.js xử lý click trước khi đóng và đặt inert.
      queueMicrotask(() => {
        setOpen(false, mobile.matches);
      });
    });

    document.addEventListener("click", event => {
      if (isOpen && !header.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setOpen(false, true);
      }
    });

    /* Tab ra khỏi header thì đóng menu */

    header.addEventListener("focusout", event => {
      if (
        isOpen &&
        event.relatedTarget &&
        !header.contains(event.relatedTarget)
      ) {
        setOpen(false);
      }
    });

    mobile.addEventListener("change", () => {
      const focusWasInNav = nav.contains(document.activeElement);
      const focusWasOnToggle = document.activeElement === toggle;

      setOpen(false);

      if (mobile.matches && focusWasInNav) {
        toggle.focus();
      } else if (!mobile.matches && focusWasOnToggle) {
        homeLink.focus();
      }
    });

    window.addEventListener("pageshow", () => {
      setOpen(false);
    });

    setOpen(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader, {
      once: true
    });
  } else {
    initHeader();
  }
})();