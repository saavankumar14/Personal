// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// NOTE: update `site` to the real deployed URL once Vercel assigns one.
// It is used to build absolute URLs for the Open Graph / link-preview tags,
// which is what people see when the save-the-date gets shared by text.
const SITE = 'https://saavan-wedding.vercel.app';

export default defineConfig({
  site: SITE,

  // Fonts are SELF-HOSTED from src/assets/fonts (see that folder's README
  // for provenance and licensing). Astro emits the @font-face CSS, hashes
  // the files, and exposes each family as the `cssVariable` below.
  //
  // Why local files rather than `fontProviders.google()`: the Google
  // provider fetches font metadata over the network *at build time*, which
  // makes every deploy depend on fonts.google.com being reachable. Checking
  // the .woff2 files into the repo removes that dependency entirely — the
  // build is hermetic and reproducible.
  //
  // SWAPPING IN THE CANVA FONTS: drop the new .woff2 files into
  // src/assets/fonts, update the `name` and `src` paths below, and leave
  // `cssVariable` alone — no other file needs to change.
  fonts: [
    {
      // Display face — names, "Save the Date", headings.
      // A variable font: one file covers the whole 300-600 weight range.
      name: 'Cormorant Garamond',
      cssVariable: '--font-display',
      provider: fontProviders.local(),
      display: 'swap',
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/cormorant-garamond-variable.woff2'],
            weight: '300 600',
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/cormorant-garamond-italic-variable.woff2'],
            weight: '300 600',
            style: 'italic',
          },
        ],
      },
    },
    {
      // Body face — supporting copy, labels, buttons.
      name: 'Lato',
      cssVariable: '--font-body',
      provider: fontProviders.local(),
      display: 'swap',
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/lato-400.woff2'], weight: 400, style: 'normal' },
          { src: ['./src/assets/fonts/lato-700.woff2'], weight: 700, style: 'normal' },
        ],
      },
    },
  ],
});
