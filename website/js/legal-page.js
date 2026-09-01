(function () {
  const STORAGE_KEY = "mycloset.lang";

  const BACK_LABEL = {
    "zh-Hans": "返回首页",
    "zh-Hant": "返回首頁",
    en: "Back to home",
    ja: "ホームに戻る",
    ko: "홈으로 돌아가기",
  };

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
    if (fromStorage && window.LEGAL_CONTENT?.documents?.privacy?.[fromStorage]) return fromStorage;

    const nav = navigator.languages || [navigator.language];
    for (const lang of nav) {
      const normalized = normalizeLang(lang);
      if (normalized) return normalized;
    }
    return "zh-Hans";
  }

  function render(documentKind, lang) {
    const content = window.LEGAL_CONTENT;
    if (!content) return;

    const sections = content.documents?.[documentKind]?.[lang]
      || content.documents?.[documentKind]?.["zh-Hans"]
      || [];
    const title = content.titles?.[documentKind]?.[lang]
      || content.titles?.[documentKind]?.["zh-Hans"]
      || "";
    const date = content.lastUpdated?.[lang] || content.lastUpdated?.["zh-Hans"] || "";
    const updatedTemplate = content.updatedLabel?.[lang]
      || content.updatedLabel?.["zh-Hans"]
      || "Last updated: {date}";

    document.documentElement.lang = lang;
    document.title = `${title} · My Closet`;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", title);

    const titleEl = document.getElementById("legal-title");
    const updatedEl = document.getElementById("legal-updated");
    const bodyEl = document.getElementById("legal-sections");
    const backEl = document.getElementById("legal-back");

    if (titleEl) titleEl.textContent = title;
    if (updatedEl) updatedEl.textContent = updatedTemplate.replace("{date}", date);
    if (backEl) backEl.textContent = BACK_LABEL[lang] || BACK_LABEL.en;

    if (bodyEl) {
      bodyEl.innerHTML = sections
        .map(
          (section) => `
            <article class="legal-section">
              <h2>${escapeHtml(section.title)}</h2>
              <p class="legal-section-body">${escapeHtml(section.body)}</p>
            </article>`
        )
        .join("");
    }

    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initLangSwitcher(documentKind) {
    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (!window.LEGAL_CONTENT?.documents?.privacy?.[lang]) return;
        render(documentKind, lang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        history.replaceState({}, "", url);
      });
    });
  }

  const documentKind = document.body.dataset.document;
  if (!documentKind) return;

  const lang = detectLang();
  render(documentKind, lang);
  initLangSwitcher(documentKind);
})();
