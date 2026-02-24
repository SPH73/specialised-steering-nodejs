# Todo

## Planned / Backlog

- **HTML sitemap** – Update `views/sitemap.ejs`: make “Last Updated” and “Total pages” dynamic (or align with XML sitemap, e.g. 10 pages); fix typo “REAIRS” → “REPAIRS” in Our Work link title.
- **Default OG image** – Add a default `og:image` (and `twitter:image`) in `meta.ejs` or `head.ejs` so shared links get a consistent image (e.g. logo or hero).
- **Package.json** – Fix description typo: “Sepecialised” → “Specialised”.
- **AEO copy** – Use or A/B test meta description variants from `docs/aeo-opportunities-inventory.md` for homepage, our-work, about, contact, enquiry (where not already applied).
- **Accessibility** – Add skip link to main content; quick pass on focus styles and aria-labels for nav/footer.
- **Performance** – Lazy-load images below the fold (gallery, our-work) with `loading="lazy"` where appropriate.

## Completed

_Update this section when completing work so it can be used for invoicing and reporting._

### Staging noindex (prevent search engines from indexing staging)

- **Completed:** 19 Jan 2026
- **Time:** ~20 min
- **What was done:** Hostname-based noindex for `staging.specialisedsteering.com`: `X-Robots-Tag: noindex, nofollow` on all responses, `<meta name="robots" content="noindex, nofollow">` in `head.ejs`, and `/robots.txt` served with `Disallow: /` on staging only (route before static). Production and local unchanged.
- **GSC removal request:** Temporary removal requested in Google Search Console for URLs starting with `https://staging.specialisedsteering.com/`.
  **Requested:** 16 Feb 2026 (status: Processing request).

### Search improvements / AEO (legal pages, schema, gallery)

- **Completed:** Feb 2026
- **What was done:** LocalBusiness schema email updated to `admin@ssteering.co.za`; ImageGallery/CollectionPage JSON-LD on `/gallery`; AEO pass on Privacy Policy, Terms of Sale, Cookie Policy, Disclaimer (summaries, headings, dates, www canonical); section id `our-work-list` → `our-repairs`; ContactPoint schema fix. Merged to main.

### Homepage UX (buttons and section id)

- **Completed:** 24 Feb 2026
- **What was done:** Hero CTA "View Repair Gallery" → "Repairs" (links to #our-repairs); Customer section "Our Repair Work" → "Repair enquiry" (links to /contact); footer "Our repairs" link; button text centred (inline-flex); button CSS refactor (submit-button layout only). Committed to main.

### Cursor rule: merge parent branch check

- **Completed:** 24 Feb 2026
- **What was done:** Added `.cursor/rules/git-merge-branch-origin.mdc`: check reflog before merging into "the branch we branched from". Committed to main.

### Multer upgrade (dicer CVE)

- **Completed:** 24 Feb 2026
- **What was done:** Upgraded multer to `1.4.5-lts.2` to fix dicer DoS (CVE-2022-24434). Image upload (enquiry form) tested. Committed to main.

### Email logging (pending / rejected)

- **Completed:** 24 Feb 2026
- **What was done:** Only log "Email pending" when `info.pending` is set; only log "Email rejected" when `info.rejected` has entries. Reduces console noise. Committed to main.

### Cloudinary upgrade (argument injection CVE)

- **Completed:** 24 Feb 2026
- **What was done:** Upgraded cloudinary to `^2.7.0` to fix arbitrary argument injection (CVE-2025-12613). Enquiry image upload and email flow verified. (Package.json/lock may be uncommitted.)

### Success page: show image filename

- **Completed:** 24 Feb 2026
- **What was done:** Enquiry success (confirm) page now shows "An image was attached: [filename]" when user submitted with an image. Pass `imageFilename` and `imageUrl` from enquiry route; conditional block in `confirm.ejs`. Committed to main.
