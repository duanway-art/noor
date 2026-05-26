/**
 * Privacy / Terms pages — load localized HTML from website/legal/.
 */
(function () {
  const STORAGE_KEY = "noor-site-locale";
  const RTL_LOCALES = new Set(["ar", "ur"]);

  function siteRoot() {
    const path = window.location.pathname;
    if (path.endsWith("/")) return path;
    const slash = path.lastIndexOf("/");
    return slash >= 0 ? path.slice(0, slash + 1) : "/";
  }

  function detectLocale() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && window.NoorI18n?.[saved]) return saved;
    return "en";
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

    const select = document.getElementById("lang-select");
    if (select && [...select.options].some((o) => o.value === locale)) {
      select.value = locale;
    }
    localStorage.setItem(STORAGE_KEY, locale);
  }

  function setupLanguageSwitcher(initialLocale, onChange) {
    const select = document.getElementById("lang-select");
    if (!select || !window.NoorI18n) return;

    const labels = window.NoorI18n._localeNames || {};
    const codes = Object.keys(window.NoorI18n).filter((k) => !k.startsWith("_"));
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

    select.addEventListener("change", () => {
      applyTranslations(select.value);
      onChange?.(select.value);
    });
  }

  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  async function loadLegalDocument(filename) {
    const locale = localStorage.getItem(STORAGE_KEY) || "en";
    const root = siteRoot();
    const container = document.getElementById("legal-content");
    if (!container) return;

    const dict = window.NoorI18n?.[locale] || window.NoorI18n.en;
    container.innerHTML = `<p class="legal-loading">${dict["legal.loading"] || "Loading…"}</p>`;

    const candidates = [
      `${root}legal/${locale}/${filename}`,
      `${root}legal/en/${filename}`,
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        container.innerHTML = doc.body.innerHTML;
        const title = doc.querySelector("title")?.textContent;
        if (title) document.title = title;
        return;
      } catch {
        /* try next */
      }
    }

    container.innerHTML = `<p class="legal-error">${dict["legal.loadError"] || "Could not load this document."}</p>`;
  }

  const filename = document.body.dataset.legalDocument;
  if (!filename) return;

  const locale = detectLocale();
  setupLanguageSwitcher(locale, () => loadLegalDocument(filename));
  applyTranslations(locale);
  setupNav();
  loadLegalDocument(filename);
})();
