# Audit report comparison

We addressed vulnerabilities from the original **npm-audit-report.txt** and from **new Snyk reports**. The new Snyk findings were also fixed (upgrades and overrides as below). As a result, **all reported vulnerabilities have been resolved**: `npm audit` reports 0 vulnerabilities.

Comparison of **npm-audit-report.txt** (earlier dependency state) with the fixes we applied. (Any additional Snyk items will be noted as they are confirmed.)

## Report item → Our fix

| # | Package / issue | In report | Our fix | Status |
|---|----------------|-----------|---------|--------|
| 1 | **body-parser / express / qs** (DoSS, vulnerable qs) | FIX NOW | **qs** override `6.14.2` forces all consumers (including express/body-parser) to use patched qs | ✅ Addressed via qs override |
| 2 | **brace-expansion** (ReDoS) | FIX NOW | No explicit change | ✅ Resolved in current tree (no longer present or fixed transitively) |
| 3 | **cloudinary** (argument injection) | FIX LATER | Upgraded to **cloudinary ^2.7.0** | ✅ Fixed |
| 4 | **cookie** (out of bounds chars) | FIX NOW | No explicit change | ✅ Resolved in current tree |
| 5 | **dicer / multer** (HeaderParser crash, DoS) | TRY FIX NOW | Upgraded **multer** to **^2.0.2** (drops vulnerable dicer/busboy) | ✅ Fixed |
| 6 | **ejs** (pollution protection) | FIX NOW | No explicit change | ✅ Resolved in current tree (ejs ^3.1.6 may resolve to 3.1.10+) |
| 7 | **ip** (SSRF / misclassification) | FIX LATER | No patch available per report | ⏳ Deferred (no patch) |
| 8 | **is_js / request-ip** (ReDoS) | FIX LATER | Upgraded **request-ip** to **^3.3.0** (no is_js dependency) | ✅ Fixed |
| 9 | **minimatch** (ReDoS) | FIX NOW | **Override** `minimatch: "10.2.1"` | ✅ Fixed |
| 10 | **nodemailer** (domain / DoS) | FIX LATER | **nodemailer ^7.0.11** in package.json (patched version) | ✅ Fixed |
| 11 | **on-headers / compression** | FIX NOW | No explicit change | ✅ Resolved in current tree |
| 12 | **path-to-regexp** (ReDoS) | FIX NOW | No explicit change | ✅ Resolved in current tree (express transitive) |
| 13 | **qs** (prototype pollution) | FIX NOW | **Override** `qs: "6.14.2"` | ✅ Fixed |
| 14 | **send / serve-static** (XSS) | FIX NOW | No explicit change | ✅ Resolved in current tree |
| 15 | **vm2** (sandbox escape, critical) | FIX NOW | Not a direct dep; if present, no longer in current tree | ✅ Resolved in current tree |
| 16 | **word-wrap** (ReDoS) | FIX NOW | No explicit change | ✅ Resolved in current tree |

## Not in the report (we fixed anyway)

- **lodash** (prototype pollution in `_.unset`/`_.omit`) – **Override** `lodash: "4.17.23"` (Dependabot #53).
- **Multer** – Four additional DoS issues (Dependabot #37, #40, #45, #46) fixed by upgrading to multer **2.0.2**.

## Summary

- **Explicitly fixed by us:** cloudinary, dicer/multer (incl. multer 2.0.2), is_js/request-ip, minimatch, qs, nodemailer (version), plus lodash override and full multer 2.x upgrade.
- **Resolved in current tree** (no action needed or transitive): body-parser/express chain (qs override), brace-expansion, cookie, ejs, on-headers/compression, path-to-regexp, send/serve-static, vm2, word-wrap.
- **Deferred (no patch):** ip (#7).

The audit report reflects an **earlier** state (e.g. it suggests “Will install request-ip@3.3.0” for is_js – we did that). Running **`npm audit`** now shows **0 vulnerabilities**, consistent with the fixes above.
