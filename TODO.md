# Todo

## Planned / Backlog

- **HTML sitemap** – Update `views/sitemap.ejs`: make “Last Updated” and “Total pages” dynamic (or align with XML sitemap, e.g. 10 pages); fix typo “REAIRS” → “REPAIRS” in Our Work link title.
- **Default OG image** – Add a default `og:image` (and `twitter:image`) in `meta.ejs` or `head.ejs` so shared links get a consistent image (e.g. logo or hero).
- **Package.json** – Fix description typo: “Sepecialised” → “Specialised”.
- **AEO copy** – Use or A/B test meta description variants from `docs/aeo-opportunities-inventory.md` for homepage, our-work, about, contact, enquiry (where not already applied).
- **Accessibility** – Add skip link to main content; quick pass on focus styles and aria-labels for nav/footer.
- **Performance** – Lazy-load images below the fold (gallery, our-work) with `loading="lazy"` where appropriate.

## Completed

### Staging noindex (prevent search engines from indexing staging)

- **Completed:** 19 Jan 2026
- **Time:** ~20 min
- **What was done:** Hostname-based noindex for `staging.specialisedsteering.com`: `X-Robots-Tag: noindex, nofollow` on all responses, `<meta name="robots" content="noindex, nofollow">` in `head.ejs`, and `/robots.txt` served with `Disallow: /` on staging only (route before static). Production and local unchanged.
- **GSC removal request:** Temporary removal requested in Google Search Console for URLs starting with `https://staging.specialisedsteering.com/`.
  **Requested:** 16 Feb 2026 (status: Processing request).
