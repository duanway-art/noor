# Noor Official Website

Static marketing site for **Noor Pro** ([App Store](https://apps.apple.com/us/app/noor-pro-quran-prayer-qibla/id6761876263)). Default language is English; supports the same 10 locales as the app.

## Preview locally

**Do not** open `index.html` by double-clicking (`file://` will break links and legal pages). Use a local web server:

```bash
bash scripts/preview-website.sh
```

Then open in your browser:

- http://127.0.0.1:8080/
- http://127.0.0.1:8080/privacy.html
- http://127.0.0.1:8080/terms.html

Optional port: `bash scripts/preview-website.sh 8888`

## GitHub Pages deployment

Workflow: [`.github/workflows/deploy-github-pages.yml`](../.github/workflows/deploy-github-pages.yml)

It publishes:

- `website/` → site root (`/`)
- `docs/legal/` → `/legal/` (privacy & terms per locale)

**Important:** `docs/legal/` must be committed to Git. Before Cloudflare deploy, run `bash scripts/build_website_for_deploy.sh` so `website/legal/` exists.

### Live URLs ([duanway-art/noor](https://github.com/duanway-art/noor))

| Host | Site | Privacy (en) |
|------|------|----------------|
| GitHub Pages | https://duanway-art.github.io/noor/ | https://duanway-art.github.io/noor/privacy.html |
| Cloudflare | Your `*.pages.dev` or custom domain | `/legal/en/privacy.html` on same host |

### One-time setup in GitHub

1. Push this repository to GitHub.
2. **Settings → Pages → Build and deployment**
   - **Source:** GitHub Actions
3. Push to `main` or `master` (or run the workflow manually under **Actions**).
4. After the workflow succeeds, your site URL is shown on the workflow run and under **Settings → Pages**.

**Project site URL:** `https://<username>.github.io/<repo>/`  
**User/org site** (repo named `<username>.github.io`): `https://<username>.github.io/`

### Optional: custom domain

In **Settings → Pages**, set a custom domain (e.g. `noor.app`) and add the DNS records GitHub shows. Add a `CNAME` file to `website/` if you use a fixed domain (the workflow copies `website/` as-is).

### App Store & legal URLs

| File | Purpose |
|------|---------|
| `js/config.js` | `appStoreUrl`, `legalBase` (`legal` on Pages) |

After Pages is live, you can point the iOS app to hosted legal pages in `QuranApp/LegalURLs.swift`, for example:

```swift
static let privacyPolicyWeb: URL? = URL(string: "https://duanway-art.github.io/noor/privacy.html")
static let termsOfUseWeb: URL? = URL(string: "https://duanway-art.github.io/noor/terms.html")
```

### Cloudflare Pages (`wrangler.jsonc`)

This repo is connected to [Cloudflare](https://developers.cloudflare.com/workers/static-assets/). Wrangler only uploads `website/`, so **run before deploy:**

```bash
bash scripts/build_website_for_deploy.sh
npx wrangler deploy
```

In the Cloudflare dashboard → your project → **Build command**, set:

`bash scripts/build_website_for_deploy.sh`

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Landing page |
| `privacy.html` | Privacy policy (site chrome + localized body) |
| `terms.html` | Terms of use (site chrome + localized body) |
| `js/legal-page.js` | Loads `legal/<locale>/` HTML into legal pages |
| `css/styles.css` | Sacred Sanctuary theme |
| `js/i18n.js` | Copy for 10 locales |
| `js/main.js` | Language switcher, RTL, links |
| `js/config.js` | App Store URL and legal base |
| `assets/screenshots/` | Hero screenshots (prayer, Quran, Qibla) |
| `assets/` | App icons |

## Hero screenshots

Sourced from `stitch_splash_screen/` design mocks, optimized for web:

- `hero-quran-index.png` — Quran index / Surah list (first)
- `hero-prayer.png` — Prayer times
- `hero-quran.png` — Quran reader
- `hero-qibla.png` — Qibla compass

To refresh after UI changes:

```bash
python3 scripts/crop_hero_screenshots.py
```

This crops stitch mockups to iPhone size (390×844, top of screen).
