
(() => {
  "use strict";

  /* =====================================================
     1. THEME MANAGEMENT
  ===================================================== */

  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const themeLabel = document.querySelector("[data-theme-label]");

  const THEME_KEY = "emro-theme";

  const getSystemTheme = () => {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  };

  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);

      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (error) {
      // Storage may be unavailable.
    }

    return null;
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // Theme still works for the current page.
    }
  };

  const updateThemeButton = (theme) => {
    if (!themeToggle) return;

    const isDark = theme === "dark";

    /*
      The button describes the action it will perform:
      Dark theme active  -> offer Light mode
      Light theme active -> offer Dark mode
    */

    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀" : "☾";
    }

    if (themeLabel) {
      themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    }

    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    themeToggle.setAttribute(
      "aria-pressed",
      String(isDark)
    );
  };

  const applyTheme = (theme, persist = false) => {
    if (theme !== "light" && theme !== "dark") {
      theme = getSystemTheme();
    }

    root.setAttribute("data-theme", theme);

    updateThemeButton(theme);

    if (persist) {
      saveTheme(theme);
    }
  };


  // Apply the saved theme or system preference.
  const initialTheme = getSavedTheme() || getSystemTheme();

  applyTheme(initialTheme);


  // Theme toggle interaction.
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme =
        root.getAttribute("data-theme") || "light";

      const nextTheme =
        currentTheme === "dark" ? "light" : "dark";

      applyTheme(nextTheme, true);
    });
  }


  // Follow system preference changes only when the user
  // has not explicitly selected a theme.
  if (window.matchMedia) {
    const systemThemeQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemThemeChange = () => {
      if (!getSavedTheme()) {
        applyTheme(getSystemTheme());
      }
    };

    if (systemThemeQuery.addEventListener) {
      systemThemeQuery.addEventListener(
        "change",
        handleSystemThemeChange
      );
    } else if (systemThemeQuery.addListener) {
      // Compatibility with older browsers.
      systemThemeQuery.addListener(handleSystemThemeChange);
    }
  }


  /* =====================================================
     2. MOBILE NAVIGATION
  ===================================================== */

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");

  const closeMenu = (returnFocus = false) => {
    if (!menuToggle || !nav) return;

    nav.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");

    if (returnFocus) {
      menuToggle.focus();
    }
  };

  if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {
      const expanded =
        menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute(
        "aria-expanded",
        String(!expanded)
      );

      nav.classList.toggle("is-open", !expanded);
    });


    // Close the mobile menu after navigating.
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });


    // Close the menu when clicking outside it.
    document.addEventListener("click", (event) => {
      const clickedInsideNav = nav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideNav && !clickedToggle) {
        closeMenu();
      }
    });


    // Close the menu with Escape.
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuToggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu(true);
      }
    });

  }


  /* =====================================================
     3. CURRENT PAGE DETECTION
  ===================================================== */

  const currentPath = window.location.pathname;

  const navLinks = document.querySelectorAll(
    ".primary-nav a[data-page]"
  );

  navLinks.forEach((link) => {
    const target = link.getAttribute("data-page");

    let isCurrentPage = false;


    // Homepage.
    if (target === "index.html") {
      isCurrentPage =
        currentPath.endsWith("/") ||
        currentPath.endsWith("/index.html");
    }


    // Blog landing page.
    else if (target === "blog-index.html") {
      isCurrentPage =
        /\/pages\/blog\/index\.html$/.test(currentPath) ||
        /\/pages\/blog\/?$/.test(currentPath);
    }


    // Other top-level pages.
    else {
      isCurrentPage = currentPath.endsWith("/" + target);
    }


    if (isCurrentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });


  /* =====================================================
     4. AUTOMATIC FOOTER YEAR
  ===================================================== */

  const currentYear = new Date().getFullYear();

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = currentYear;
  });


  /* =====================================================
     5. INITIALIZE PAGE
  ===================================================== */

  // Ensure the correct theme controls are displayed
  // after all page elements have been located.
  updateThemeButton(
    root.getAttribute("data-theme") || initialTheme
  );

})();
