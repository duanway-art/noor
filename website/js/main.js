(function () {
  const RTL_LOCALES = new Set(["ar", "ur"]);
  const STORAGE_KEY = "noor-site-locale";

  function supportedLocales() {
    return Object.keys(window.NoorI18n || {}).filter((k) => !k.startsWith("_"));
  }

  function detectLocale() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && window.NoorI18n?.[saved]) return saved;
    // Site default is English; do not auto-switch from browser language.
    return "en";
  }

  function t(locale, key) {
    const dict = window.NoorI18n?.[locale] || window.NoorI18n.en;
    return dict[key] ?? window.NoorI18n.en[key] ?? key;
  }

  function applyTranslations(locale) {
    const dict = window.NoorI18n?.[locale] || window.NoorI18n.en;
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (value == null) return;
      if (el.hasAttribute("data-i18n-attr")) {
        el.setAttribute(el.getAttribute("data-i18n-attr"), value);
      } else {
        el.textContent = value;
      }
    });

    const title = dict["meta.title"];
    const desc = dict["meta.description"];
    if (title) document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && desc) metaDesc.setAttribute("content", desc);

    const select = document.getElementById("lang-select");
    if (select && [...select.options].some((o) => o.value === locale)) {
      select.value = locale;
    }

    localStorage.setItem(STORAGE_KEY, locale);
    setupLegalLinks();
  }

  function setupLanguageSwitcher(initialLocale) {
    const select = document.getElementById("lang-select");
    if (!select || !window.NoorI18n) return;

    const labels = window.NoorI18n._localeNames || {};
    const codes = supportedLocales();
    const ordered = ["en", ...codes.filter((c) => c !== "en")];

    select.innerHTML = "";
    ordered.forEach((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = labels[code] || code;
      select.appendChild(opt);
    });

    if ([...select.options].some((o) => o.value === initialLocale)) {
      select.value = initialLocale;
    }

    select.addEventListener("change", () => applyTranslations(select.value));
  }

  function setupDownloadLinks() {
    const url = window.NOOR_SITE?.appStoreUrl?.trim();
    const cta = document.getElementById("hero-cta");
    const storeBtn = document.getElementById("app-store-btn");
    const comingSoon = document.getElementById("download-coming-soon");

    if (url) {
      [cta, storeBtn].forEach((el) => {
        if (!el) return;
        el.href = url;
        el.removeAttribute("aria-disabled");
        el.classList.remove("is-disabled");
      });
      comingSoon?.classList.add("hidden");
    } else {
      [cta, storeBtn].forEach((el) => {
        if (!el) return;
        el.href = "#download";
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-disabled");
      });
      comingSoon?.classList.remove("hidden");
    }
  }

  function setupLegalLinks() {
    const base = window.NOOR_SITE?.legalBase || "../docs/legal";
    const locale = localStorage.getItem(STORAGE_KEY) || "en";
    const privacy = document.getElementById("footer-privacy");
    const terms = document.getElementById("footer-terms");
    const folder = locale === "zh-Hans" || locale === "zh-Hant" ? locale : locale;
    if (privacy) privacy.href = `${base}/${folder}/privacy.html`;
    if (terms) terms.href = `${base}/${folder}/terms.html`;
  }

  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.querySelectorAll('.site-nav a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => nav?.classList.remove("is-open"));
    });
  }

  const locale = detectLocale();
  setupLanguageSwitcher(locale);
  applyTranslations(locale);
  setupDownloadLinks();
  setupLegalLinks();
  setupNav();

})();
