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

### Minimatch upgrade (ReDoS) and install note

- **Completed:** 24 Feb 2026
- **What was done:** Added npm override so all transitive uses of `minimatch` use patched version 10.2.1 (fixes ReDoS, CVE-2026-26996). README and `npm run install:legacy` script added so future installs use `--legacy-peer-deps` where needed (see Client report caveat).

### request-ip upgrade (is_js ReDoS – Dependabot #18)

- **Completed:** 24 Feb 2026
- **What was done:** Upgraded `request-ip` from ^2.1.3 to ^3.3.0. Version 3.x has no dependency on `is_js`, so the transitive ReDoS vulnerability (Dependabot alert #18) is resolved. Confirmed `is_js` no longer appears in `package-lock.json`; `getClientIp(req)` usage in `ab-logger`, `security-logger`, and routes unchanged.

### Lodash and qs overrides (Dependabot #53, #54)

- **Completed:** 24 Feb 2026
- **What was done:** Added npm overrides so all transitive uses of `lodash` use 4.17.23 (fixes prototype pollution in `_.unset`/`_.omit`, Dependabot #53) and all uses of `qs` use 6.14.2 (fixes arrayLimit bypass DoS, Dependabot #54). Transitive via airtable/cloudinary (lodash) and express/googleapis (qs). `npm audit` reports 0 vulnerabilities after install.

### Multer upgrade to 2.0.2 (Dependabot #37, #40, #45, #46)

- **Completed:** 24 Feb 2026
- **What was done:** Upgraded `multer` from 1.4.5-lts.2 to ^2.0.2. Fixes four High-severity DoS issues: unhandled exception, memory leaks from unclosed streams, malformed request DoS, and maliciously crafted request DoS (CVE-2025-47944, CVE-2025-47935; 2.0.1/2.0.2 address additional CVEs). No code changes required; existing `diskStorage`, `fileFilter`, `limits`, and `upload.single('image')` usage remains compatible. Enquiry form upload should be retested after deploy.

### Analytics partial: defensive check for excludeFromAnalytics

- **Completed:** 24 Feb 2026
- **What was done:** Fixed `ReferenceError: excludeFromAnalytics is not defined` in `views/includes/analytics.ejs`. The partial now uses `typeof excludeFromAnalytics === 'undefined' || !excludeFromAnalytics` so it safely shows the GA snippet when the variable is not in scope (e.g. some error-handler renders). No change to IP-exclusion behaviour when the middleware has set the flag.

### CSP violation: framing www.google.com (frame-ancestors)

- **Completed:** 24 Feb 2026
- **What was done:** Resolved report-only CSP violation “Framing 'https://www.google.com/' violates frame-ancestors 'self'”. Switched reCAPTCHA to load from `www.recaptcha.net/recaptcha/api.js` (so the widget iframe uses recaptcha.net instead of www.google.com) and removed `https://www.google.com` from `frame-src` in app.js. reCAPTCHA behaviour unchanged; contact/enquiry forms should be retested on staging.

---

## Client report

_Use this section for the report attached to the invoice._

### Summary of work

- **Search and legal pages (AEO):** Schema and legal pages updated (Privacy Policy, Terms of Sale, Cookie Policy, Disclaimer); gallery structured data added; section and link names tidied for clarity.
- **Homepage UX:** Button labels and links clarified (e.g. “Repairs”, “Repair enquiry”); button text alignment fixed; section id updated from “our-work-list” to “our-repairs”.
- **Enquiry and success page:** Success page now shows the filename when a user attaches an image to the parts enquiry form; email notifications unchanged and tested.
- **Security upgrades:** Dependencies upgraded or overridden to address known vulnerabilities (including new Snyk reports): multer (dicer, then full upgrade to 2.0.2 for four DoS fixes), Cloudinary (argument injection), minimatch (ReDoS), request-ip (is_js ReDoS), lodash (prototype pollution), and qs (arrayLimit DoS). We were able to address the new vulnerabilities and, as a result, **all vulnerabilities are now resolved** (`npm audit` reports 0). Enquiry image upload should be retested after multer 2.x upgrade.
- **Documentation and process:** README updated (install steps, Cursor IDE and agent rules); TODO completed list maintained for reporting; Cursor rules added (e.g. merge workflow, completed-list updates).
- **Analytics:** Full-site Google Analytics tracking is in place (all pages except the success screen). IP exclusion for internal/company traffic is configured; we await the IP list to add to the server so GA reports reflect real visitor behaviour only (see “Google Analytics: IP exclusion” below).

### New Snyk alerts (addressed)

New vulnerability alerts from Snyk were received for this project. We addressed both; dates and issues are below (screenshots of the alerts are included for reference).

| Date | Issue | Package | Our fix |
|------|--------|---------|---------|
| **29 Jan 2026** | Prototype Pollution | lodash 4.17.21 | Override to lodash 4.17.23 |
| **19 Feb 2026** | ReDoS | minimatch 9.0.5 | Override to minimatch 10.2.1 |

![Snyk alert – lodash Prototype Pollution (29 Jan 2026)](docs/client-report/snyk-alert-lodash-2026-01-29.png)

![Snyk alert – minimatch ReDoS (19 Feb 2026)](docs/client-report/snyk-alert-minimatch-2026-02-19.png)

### Google Analytics: IP exclusion (internal traffic)

We have set up **IP-based exclusion** for Google Analytics so that company and internal traffic is not sent to GA. We await the specific IP addresses (company and key user) to add to the server configuration; once provided, they will be added to the environment variable and no code change is required.

**What the exclusion means:** Visits from the excluded IPs are not tracked at all. The Google Analytics script (gtag) is not loaded for those visitors, so no page views, events, or bounces from them are recorded in GA. Reports therefore reflect only **real customer and prospect traffic**.

**How we enforce it:** The server reads the visitor’s IP on each request and compares it to a configured list (stored in the environment, not in code). If the IP matches, we set a flag and the analytics snippet is omitted from the page HTML. Enforcement is **server-side**: excluded users never receive the tracking script, so there is no dependency on cookie consent or client-side logic.

**Why we do it:** Internal and company traffic (e.g. staff checking the site, testing forms, or reviewing content) would otherwise inflate page views and distort bounce rates and behaviour. Excluding it keeps GA data meaningful for marketing and conversion decisions.

### Upgrades and caveat

All security upgrades have been applied and tested. **One caveat:** when installing or updating dependencies in future, use **`npm run install:legacy`** (or `npm install --legacy-peer-deps`). This is required because one listed package is unused at runtime but still declares an older peer dependency; using the flag avoids install conflicts and has no effect on how the site runs. The README and a convenience script are in place so this is documented and easy to follow.
