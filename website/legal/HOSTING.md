# Hosting Privacy Policy & User Agreement (HTTPS)

Localized HTML is generated from `scripts/legal/locales/*.json` via `python3 scripts/build_legal_html.py`.

- **App bundle:** `QuranApp/Resources/Legal/<locale>/privacy.html` and `terms.html` (en, zh-Hans, zh-Hant, id, ur, hi, bn, tr, ms, ar).
- **This folder:** per-locale subfolders plus English copies at `privacy.html` / `terms.html` for simple hosting.

## GitHub Pages (recommended)

The workflow **`.github/workflows/deploy-github-pages.yml`** publishes:

- Marketing site from `website/` at the repository site root
- Legal HTML from `docs/legal/` at `/legal/`

### Setup

1. Push this repository to a **public** GitHub repo.
2. **Settings → Pages → Build and deployment** → **Source: GitHub Actions**.
3. Push to `main` / `master` (or run the workflow from **Actions**).
4. Legal URLs (project site example):

`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/legal/en/privacy.html`  
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/legal/en/terms.html`

Per-locale paths: `/legal/<locale>/privacy.html` and `terms.html` (`ar`, `zh-Hans`, `zh-Hant`, `id`, `ms`, `tr`, `ur`, `hi`, `bn`).

5. Set `QuranApp/LegalURLs.swift`:

```swift
static let privacyPolicyWeb: URL? = URL(string: "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/legal/en/privacy.html")
static let termsOfUseWeb: URL? = URL(string: "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/legal/en/terms.html")
```

6. Rebuild the app. Settings → Privacy Policy / User Agreement can open the hosted pages in Safari.

See also `website/README.md` for local preview and custom domains.

## App Store

You can paste the same HTTPS URLs into App Store Connect’s privacy policy URL field.
