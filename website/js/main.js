(function () {
  const STORAGE_KEY = "mycloset.lang";
  const DEFAULT_APP_STORE_URL = "#"; // Replace after App Store approval

  function normalizeLang(raw) {
    if (!raw) return null;
    const value = raw.toLowerCase();
    if (value.startsWith("zh-hant") || value === "zh-tw" || value === "zh-hk") return "zh-Hant";
    if (value.startsWith("zh")) return "zh-Hans";
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("ko")) return "ko";
    if (value.startsWith("en")) return "en";
    return null;
  }

  function detectLang() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = normalizeLang(params.get("lang"));
    if (fromQuery) return fromQuery;

    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && SITE_I18N[fromStorage]) return fromStorage;

    const nav = navigator.languages || [navigator.language];
    for (const lang of nav) {
      const normalized = normalizeLang(lang);
      if (normalized) return normalized;
    }
    return "zh-Hans";
  }

  function screenshotBase(lang) {
    const folder = LOCALE_SCREENSHOT_FOLDER[lang] || "zh-Hans";
    return `assets/screenshots/${folder}/`;
  }

  function applyLang(lang) {
    const strings = SITE_I18N[lang] || SITE_I18N["zh-Hans"];
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (strings[key]) node.textContent = strings[key];
    });

    document.title = strings.metaTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", strings.metaDescription);

    const base = screenshotBase(lang);
    document.querySelectorAll("[data-screenshot]").forEach((img) => {
      const file = img.getAttribute("data-screenshot");
      img.src = `${base}${file}`;
      img.alt = strings.appName;
    });

    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function initLangSwitcher() {
    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (!SITE_I18N[lang]) return;
        applyLang(lang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        history.replaceState({}, "", url);
      });
    });
  }

  function initStoreLinks() {
    document.querySelectorAll("#app-store-link, #app-store-link-bottom").forEach((link) => {
      link.href = DEFAULT_APP_STORE_URL;
    });
  }

  const lang = detectLang();
  applyLang(lang);
  initLangSwitcher();
  initStoreLinks();
})();
