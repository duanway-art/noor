/**
 * Browser locale detection for the Noor marketing site.
 * Supported: en, ar, zh-Hans, zh-Hant, id, ms, tr, ur, hi, bn — fallback: en.
 */
window.NoorLocale = {
  STORAGE_KEY: "noor-site-locale",
  RTL_LOCALES: new Set(["ar", "ur"]),

  supported() {
    return Object.keys(window.NoorI18n || {}).filter((k) => !k.startsWith("_"));
  },

  normalizeTag(tag) {
    const parts = tag.replace(/_/g, "-").split("-");
    const lang = parts[0]?.toLowerCase();
    if (!lang) return null;

    if (lang === "zh") {
      const sub = (parts[1] || "").toLowerCase();
      if (["tw", "hk", "mo", "hant"].includes(sub)) return "zh-Hant";
      if (["cn", "sg", "hans", "my"].includes(sub)) return "zh-Hans";
      if (sub === "") return "zh-Hans";
    }

    return null;
  },

  resolveTag(tag) {
    const supported = this.supported();
    if (!tag) return null;

    const normalized = tag.replace(/_/g, "-");
    if (supported.includes(normalized)) return normalized;

    const mapped = this.normalizeTag(normalized);
    if (mapped && supported.includes(mapped)) return mapped;

    const base = normalized.split("-")[0].toLowerCase();
    const exact = supported.find((code) => code.toLowerCase() === base);
    if (exact) return exact;

    return (
      supported.find(
        (code) =>
          code.toLowerCase().startsWith(base + "-") ||
          code.split("-")[0].toLowerCase() === base
      ) || null
    );
  },

  matchBrowserLocale() {
    if (!window.NoorI18n) return "en";

    const candidates = navigator.languages?.length
      ? [...navigator.languages]
      : [navigator.language || "en"];

    for (const raw of candidates) {
      const match = this.resolveTag(raw);
      if (match) return match;
    }

    return "en";
  },

  detect() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && window.NoorI18n?.[saved]) return saved;
    return this.matchBrowserLocale();
  },
};
