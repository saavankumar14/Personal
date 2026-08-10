# Fonts

Self-hosted web fonts. Checked into the repo on purpose: it makes the build
hermetic (no network call to a font CDN at build time) and means no
third-party request when a guest loads the page.

| File                                       | Family             | Weights   | Style  |
| ------------------------------------------ | ------------------ | --------- | ------ |
| `cormorant-garamond-variable.woff2`        | Cormorant Garamond | 300–600   | normal |
| `cormorant-garamond-italic-variable.woff2` | Cormorant Garamond | 300–600   | italic |
| `lato-400.woff2`                           | Lato               | 400       | normal |
| `lato-700.woff2`                           | Lato               | 700       | normal |

All files are the **latin subset only** (~108 KB total). Latin-ext, Cyrillic,
Greek, and Vietnamese subsets were dropped — they are dead weight for an
English-language site.

Cormorant Garamond ships as a variable font, so a single file covers every
weight from 300 to 600. Lato does not, hence the two static files.

## Licensing

Both families are licensed under the **SIL Open Font License 1.1**, which
permits self-hosting and redistribution — including bundling the files in this
repository. Retrieved from Google Fonts (`fonts.gstatic.com`).

- Cormorant Garamond — Catharsis Fonts — <https://fonts.google.com/specimen/Cormorant+Garamond>
- Lato — Łukasz Dziedzic — <https://fonts.google.com/specimen/Lato>

## Replacing these with the Canva fonts

⚠️ **Most Canva fonts cannot legally be self-hosted.** They are licensed for
use inside Canva only. Before copying a font file here, confirm it carries a
webfont licence (OFL, or a purchased web licence).

If the Canva font is not licensable, pick the nearest Google Fonts equivalent
instead. To swap:

1. Download the `.woff2` (latin subset) and drop it in this folder.
2. Update the matching entry's `name` and `src` in `astro.config.mjs`.
3. Leave `cssVariable` (`--font-display` / `--font-body`) unchanged — every
   component references those, so nothing else needs editing.
