(function () {
  const STORAGE_KEY = window.NoorLocale?.STORAGE_KEY || "noor-site-locale";
  const RTL_LOCALES = window.NoorLocale?.RTL_LOCALES || new Set(["ar", "ur"]);

  function supportedLocales() {
    return window.NoorLocale?.supported() || [];
  }

  function detectLocale() {
    return window.NoorLocale?.detect() || "en";
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

  function isWeChatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent || "");
  }

  function isMobileOrTablet() {
    const ua = navigator.userAgent || "";
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) {
      return true;
    }
    if (/iPad/i.test(ua)) return true;
    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }

  function isDesktop() {
    return !isMobileOrTablet();
  }

  function appStoreUrl() {
    return window.NOOR_SITE?.appStoreUrl?.trim() || "";
  }

  function googlePlayUrl() {
    return window.NOOR_SITE?.googlePlayUrl?.trim() || "";
  }

  let wechatCopyTargetUrl = "";

  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(input);
      }
    });
  }

  function showWeChatGuide(url) {
    const guide = document.getElementById("wechat-guide");
    if (!guide) return;
    wechatCopyTargetUrl = url || appStoreUrl();
    guide.classList.remove("hidden");
    guide.hidden = false;
    document.body.classList.add("wechat-guide-open");
    document.getElementById("wechat-copy-toast")?.classList.add("hidden");
  }

  function hideWeChatGuide() {
    const guide = document.getElementById("wechat-guide");
    if (!guide) return;
    guide.classList.add("hidden");
    guide.hidden = true;
    document.body.classList.remove("wechat-guide-open");
  }

  function setupWeChatDownload() {
    if (!isWeChatBrowser()) return;

    document.querySelectorAll("[data-store-download]").forEach((el) => {
      el.addEventListener("click", (event) => {
        const store = el.getAttribute("data-store-download");
        const url =
          store === "google-play" ? googlePlayUrl() : appStoreUrl();
        if (!url) return;
        event.preventDefault();
        showWeChatGuide(url);
      });
    });

    document
      .getElementById("wechat-guide")
      ?.querySelectorAll("[data-wechat-dismiss]")
      .forEach((el) => {
        el.addEventListener("click", hideWeChatGuide);
      });

    document.getElementById("wechat-copy")?.addEventListener("click", () => {
      const toast = document.getElementById("wechat-copy-toast");
      const url = wechatCopyTargetUrl || appStoreUrl();
      copyText(url)
        .then(() => {
          toast?.classList.remove("hidden");
          window.setTimeout(() => toast?.classList.add("hidden"), 2400);
        })
        .catch(() => {
          window.prompt(
            document.documentElement.lang.startsWith("zh")
              ? "请长按复制此链接："
              : "Copy this link:",
            url
          );
        });
    });
  }

  function bindStoreButton(el, url, inWeChat, { comingSoon = false } = {}) {
    if (!el) return;
    el.classList.remove("is-coming-soon");
    if (url) {
      el.href = inWeChat ? "#download" : url;
      el.removeAttribute("aria-disabled");
      el.classList.remove("is-disabled");
      if (inWeChat) {
        el.setAttribute("role", "button");
        el.setAttribute("aria-haspopup", "dialog");
      } else {
        el.removeAttribute("role");
        el.removeAttribute("aria-haspopup");
      }
    } else if (comingSoon) {
      el.href = "#";
      el.removeAttribute("aria-disabled");
      el.classList.remove("is-disabled");
      el.classList.add("is-coming-soon");
      el.setAttribute("role", "button");
      el.setAttribute("aria-haspopup", "dialog");
    } else {
      el.href = "#download";
      el.setAttribute("aria-disabled", "true");
      el.classList.add("is-disabled");
      el.classList.remove("is-coming-soon");
      el.removeAttribute("role");
      el.removeAttribute("aria-haspopup");
    }
  }

  function showAndroidSoonDialog() {
    const dialog = document.getElementById("android-soon-dialog");
    if (!dialog) return;
    dialog.classList.remove("hidden");
    dialog.hidden = false;
    document.body.classList.add("site-dialog-open");
    dialog.querySelector("[data-android-soon-dismiss].btn")?.focus();
  }

  function hideAndroidSoonDialog() {
    const dialog = document.getElementById("android-soon-dialog");
    if (!dialog) return;
    dialog.classList.add("hidden");
    dialog.hidden = true;
    document.body.classList.remove("site-dialog-open");
  }

  function showIosScanDialog() {
    const dialog = document.getElementById("ios-scan-dialog");
    if (!dialog) return;
    dialog.classList.remove("hidden");
    dialog.hidden = false;
    document.body.classList.add("site-dialog-open");
    dialog.querySelector("[data-ios-scan-dismiss].btn")?.focus();
  }

  function hideIosScanDialog() {
    const dialog = document.getElementById("ios-scan-dialog");
    if (!dialog) return;
    dialog.classList.add("hidden");
    dialog.hidden = true;
    document.body.classList.remove("site-dialog-open");
  }

  function setupIosDesktopScanModal() {
    if (!appStoreUrl()) return;

    document.querySelectorAll('[data-store-download="app-store"]').forEach((el) => {
      el.addEventListener(
        "click",
        (event) => {
          if (!isDesktop()) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          showIosScanDialog();
        },
        true
      );
    });

    document
      .getElementById("ios-scan-dialog")
      ?.querySelectorAll("[data-ios-scan-dismiss]")
      .forEach((el) => {
        el.addEventListener("click", hideIosScanDialog);
      });
  }

  function setupAndroidSoonModal() {
    if (googlePlayUrl()) return;

    document.querySelectorAll('[data-store-download="google-play"]').forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        showAndroidSoonDialog();
      });
    });

    document
      .getElementById("android-soon-dialog")
      ?.querySelectorAll("[data-android-soon-dismiss]")
      .forEach((el) => {
        el.addEventListener("click", hideAndroidSoonDialog);
      });
  }

  function setupDownloadLinks() {
    const iosUrl = appStoreUrl();
    const androidUrl = googlePlayUrl();
    const inWeChat = isWeChatBrowser();

    bindStoreButton(document.getElementById("hero-cta-ios"), iosUrl, inWeChat);
    const androidComingSoon = !androidUrl;
    bindStoreButton(
      document.getElementById("hero-cta-android"),
      androidUrl,
      inWeChat,
      { comingSoon: androidComingSoon }
    );
    bindStoreButton(document.getElementById("app-store-btn"), iosUrl, inWeChat);
    bindStoreButton(
      document.getElementById("google-play-btn"),
      androidUrl,
      inWeChat,
      { comingSoon: androidComingSoon }
    );

    document
      .getElementById("download-coming-soon-ios")
      ?.classList.toggle("hidden", Boolean(iosUrl));
    document
      .getElementById("download-coming-soon-android")
      ?.classList.toggle("hidden", Boolean(androidUrl));
  }

  /** Site root with trailing slash (supports GitHub Pages project URLs). */
  function siteRoot() {
    const path = window.location.pathname;
    if (path.endsWith("/")) return path;
    const slash = path.lastIndexOf("/");
    return slash >= 0 ? path.slice(0, slash + 1) : "/";
  }

  function setupLegalLinks() {
    const root = siteRoot();
    const privacy = document.getElementById("footer-privacy");
    const terms = document.getElementById("footer-terms");
    if (privacy) privacy.href = `${root}privacy.html`;
    if (terms) terms.href = `${root}terms.html`;
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
  setupIosDesktopScanModal();
  setupAndroidSoonModal();
  setupWeChatDownload();
  setupLegalLinks();
  setupNav();

})();
