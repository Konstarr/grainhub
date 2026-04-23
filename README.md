# GrainHub Frontend

React + Vite port of the GrainHub millwork community mockup. All 14
reference HTML pages are now wired up as React pages sharing the same
nav, footer, and design system.

## Quick start

1. Install Node.js 18 or newer: https://nodejs.org
2. Open a terminal in this folder (`grainhub-frontend/`) and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open the URL it prints (usually `http://localhost:5173`).

To produce a production build for hosting:

```bash
npm run build   # outputs to dist/
npm run preview # serves dist/ locally so you can smoke-test the build
```

## Routes

| URL | Page file | Reference HTML |
|---|---|---|
| `/` | `src/pages/Home.jsx` | `grainhub-homepage.html` |
| `/forums` | `src/pages/Forums.jsx` | `grainhub-forums.html` |
| `/forums/thread` | `src/pages/ForumThread.jsx` | `grainhub-forum-thread.html` |
| `/jobs` | `src/pages/Jobs.jsx` | `grainhub-jobs.html` |
| `/wiki` | `src/pages/Wiki.jsx` | `grainhub-wiki.html` |
| `/wiki/article` | `src/pages/WikiArticle.jsx` | `grainhub-wiki-article.html` |
| `/news` | `src/pages/News.jsx` | `grainhub-news.html` |
| `/news/article` | `src/pages/NewsArticle.jsx` | `grainhub-article.html` |
| `/machinery` | `src/pages/Marketplace.jsx` | `grainhub-marketplace.html` |
| `/machinery/listing` | `src/pages/Listing.jsx` | `grainhub-listing.html` |
| `/suppliers` | `src/pages/Suppliers.jsx` | `grainhub-suppliers.html` |
| `/suppliers/profile` | `src/pages/SupplierProfile.jsx` | `grainhub-supplier-profile.html` |
| `/signup` | `src/pages/Signup.jsx` | `grainhub-signup.html` |
| `/sponsor` | `src/pages/Sponsor.jsx` | `grainhub-sponsor.html` |

## Project layout

```
grainhub-frontend/
├── index.html              # Vite entry
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                    # Bootstraps React + router
    ├── App.jsx                     # All 14 routes
    ├── styles/
    │   ├── global.css              # Design tokens + shared classes
    │   ├── forums.css              # One CSS file per page for
    │   ├── forumThread.css         #   page-specific styles
    │   ├── jobs.css
    │   ├── wiki.css
    │   ├── wikiArticle.css
    │   ├── news.css
    │   ├── newsArticle.css
    │   ├── marketplace.css
    │   ├── listing.css
    │   ├── suppliers.css
    │   ├── supplierProfile.css
    │   ├── signup.css
    │   └── sponsor.css
    ├── components/
    │   ├── layout/                 # Shared nav, footer, layout wrapper
    │   ├── home/                   # Home page sections
    │   ├── forums/                 # Forums page sections
    │   ├── forumThread/            # Thread page sections
    │   ├── jobs/
    │   ├── wiki/
    │   ├── news/
    │   ├── marketplace/
    │   ├── listing/
    │   ├── suppliers/
    │   ├── supplierProfile/
    │   ├── signup/
    │   └── sponsor/
    ├── pages/                      # One .jsx file per route
    └── data/                       # One data file per page — edit these to change copy
        ├── homeData.js
        ├── forumsData.js
        ├── forumThreadData.js
        ├── jobsData.js
        ├── wikiData.js
        ├── wikiArticleData.js
        ├── newsData.js
        ├── newsArticleData.js
        ├── marketplaceData.js
        ├── listingData.js
        ├── suppliersData.js
        ├── supplierProfileData.js
        ├── signupData.js
        └── sponsorData.js
```

## How to change things

- **Edit copy / sample data** — open the matching file in `src/data/`. All
  headlines, prices, job titles, etc. live there; the components just
  render them.
- **Tweak colors, spacing, typography** — the CSS variables at the top
  of `src/styles/global.css` (`--wood-dark`, `--wood-warm`, etc.) drive
  the whole design.
- **Tweak a page's own layout** — edit its CSS file in `src/styles/`
  (e.g. `jobs.css` for the jobs page).
- **Change a section's markup** — each page is split into sub-components
  under `src/components/<page>/`. Find the section you want to change and
  edit just that file.

## Verification

- Every `.jsx` file parses as valid JSX (105 files verified).
- Every internal `import` resolves to a real file (174 imports OK, 0 broken).
- Every page imports its own CSS file.
- All 14 routes are wired in `src/App.jsx`.

Full compile verification (`npm run build`) needs to happen on your
machine — if it succeeds, the app is ready to ship.
