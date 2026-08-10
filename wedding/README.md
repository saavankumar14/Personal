# Wedding Website

A Save the Date page, built so the rest of the site (schedule, travel, RSVP,
gallery, registry) can be added later without rework.

Built with [Astro](https://astro.build) 7. The page ships **zero JavaScript** —
everything is static HTML, CSS, and self-hosted fonts.

## Running it

Requires Node 22.12 or newer.

```bash
cd wedding
npm install
npm run dev          # http://localhost:4321
```

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                    |
| `npm run build`   | Production build into `dist/`                 |
| `npm run preview` | Serve the built site locally                  |
| `npm run check`   | TypeScript + Astro diagnostics                |

## The two files you will actually edit

Almost every change you want to make lives in one of these:

### 1. `src/data/wedding.ts` — the details

Names, date, venue, city. One typed object, imported by every component, so
changing the date is a one-line edit rather than a search-and-replace.

```ts
export const wedding: WeddingData = {
  partnerOne: 'Firstname',   // ← replace
  partnerTwo: 'Firstname',   // ← replace
  startsAt: '2027-05-15T16:00:00',
  showTime: false,           // save-the-dates usually omit the time
  venue: null,               // null → shows "Venue details to follow"
  city: 'City',
  region: 'State',
  ...
};
```

> ⚠️ The values currently in the file are **placeholders**. The site is not
> ready to share until they're real.

### 2. `src/styles/tokens.css` — the design

The Canva design translated into CSS custom properties: colours, type scale,
spacing. Every component references these variables and never a raw hex value,
so re-skinning the whole site happens in this one file.

## Bringing the Canva design across

The approach is to export **assets** from Canva and rebuild the layout in real
HTML/CSS — not to export finished pages as images. That keeps the text
selectable and searchable, keeps the page fast on phone data, and means fixing
a typo doesn't require a re-export.

What to pull out of Canva:

1. **Colour hex codes** → paste into `src/styles/tokens.css`.
2. **Font names** → see the licensing warning below.
3. **Decorative elements** (monogram, florals, dividers) → export each one
   *separately* as SVG, or transparent PNG at 2x. Drop them in `src/assets/`
   and swap them into `src/components/Ornament.astro`.
4. **Photos** → high-resolution JPGs into `src/assets/photos/`. Render them
   with Astro's `<Image />` component, which generates WebP/AVIF and the
   responsive `srcset` automatically.
5. **A 1200×630 export** → `public/og-image.jpg`. This is the link-preview
   card people see when the URL is shared by text or WhatsApp. A generated
   placeholder is in place; replace it.
6. **A flat PNG of the finished design** → purely as a visual reference to
   match. This one does *not* get shipped.

### ⚠️ About Canva fonts

Most Canva fonts are licensed for use **inside Canva only** and cannot legally
be downloaded and self-hosted on a website. Note the font *names* and match
each to a free, self-hostable equivalent (Google Fonts) — or buy a web licence
if a specific face is non-negotiable.

Current placeholders are Cormorant Garamond (display) and Lato (body), both
SIL Open Font License. See `src/assets/fonts/README.md` to swap them.

## Deploying to Vercel

1. Import `saavankumar14/Personal` at [vercel.com/new](https://vercel.com/new).
2. **Set Root Directory to `wedding`** — this is the one setting that isn't
   auto-detected, and the build fails without it.
3. Framework preset auto-detects as Astro. Build command `npm run build`,
   output directory `dist`.
4. Deploy. Every push to the branch redeploys automatically.

Then update `site` in `astro.config.mjs` to the real URL Vercel assigns and
push again — the Open Graph tags need an absolute URL, so link previews stay
broken until you do.

## Project layout

```
src/
├── data/wedding.ts          the details — single source of truth
├── styles/
│   ├── tokens.css           the design — colours, type scale, spacing
│   └── global.css           reset + base typography
├── layouts/Base.astro       <head>, meta/OG tags, font loading
├── components/
│   ├── Hero.astro           names + "Save the Date"
│   ├── EventDetails.astro   date + location
│   ├── AddToCalendar.astro  .ics download link
│   └── Ornament.astro       decorative divider (swap for Canva art)
├── lib/ics.ts               RFC 5545 calendar file builder
├── assets/fonts/            self-hosted woff2 files
└── pages/
    ├── index.astro          the Save the Date page
    └── save-the-date.ics.ts generates /save-the-date.ics at build time
```

## Adding a page later

1. Create `src/pages/<name>.astro`.
2. Wrap it in `<Base title="…">`.
3. Import anything it needs from `src/data/wedding.ts`.
4. Style it with the tokens — no new colour values.

When there is more than one page, add a nav component to `Base.astro`.

## Verified

- Builds clean; `npm run check` reports 0 errors, 0 warnings.
- `dist/` contains **no JavaScript**.
- No horizontal overflow at 320, 360, 390, 768, or 1440px.
- All text/background pairs pass WCAG AA contrast (lowest is 5.5:1).
- The `.ics` file is valid RFC 5545: CRLF endings, 75-octet line folding,
  all-day event, escaped text values.
