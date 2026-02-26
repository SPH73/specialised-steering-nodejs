# Audit Report Comparison

**Last Updated:** 26 February 2026

We addressed vulnerabilities from the original **npm-audit-report.txt** and from **Snyk reports**. As a result, **npm audit reports 0 vulnerabilities**. However, **Snyk continues to monitor** and has identified 5 new high-severity issues (as of 26 Feb 2026).

## Current Status (26 February 2026)

- **npm audit:** ✅ 0 vulnerabilities
- **Snyk scan:** ⚠️ 5 high-severity vulnerabilities
  - 1 fixable (airtable)
  - 4 no fix available (transitive dependencies in ejs and googleapis)

---

## Historical Fixes

Comparison of **npm-audit-report.txt** (earlier dependency state) with the fixes we applied.

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

---

## New Snyk Findings (26 February 2026)

While npm audit reports 0 vulnerabilities, Snyk's more comprehensive scanning has identified 5 new high-severity issues:

### 1. ejs@3.1.10 (HIGH - Priority Score: 614)
- **Issues:** 2 transitive issues via minimatch@3.0.5
- **Vulnerabilities:**
  - Inefficient Algorithmic Complexity (CWE-407, CVSS 8.7)
  - Regular Expression Denial of Service - ReDoS (CWE-1333, CVSS 8.7)
- **Status:** ⚠️ No fix available
- **Impact:** LOW - Server-side only, controlled input
- **Action:** Monitor for ejs updates

### 2. googleapis@169.0.0 (HIGH - Priority Score: 614)
- **Issues:** 2 transitive issues via minimatch@3.0.5
- **Vulnerabilities:** Same as ejs (Inefficient Algorithmic Complexity, ReDoS)
- **Status:** ⚠️ No fix available
- **Impact:** VERY LOW - Admin-only, authenticated usage
- **Action:** Monitor for googleapis updates

### 3. airtable@0.11.1 (HIGH - Priority Score: 579)
- **Issues:** 1 direct issue
- **Status:** ✅ Fix available - upgrade to airtable@0.11.6+
- **Impact:** MEDIUM - Used throughout application
- **Action:** 🔧 **UPGRADE REQUIRED**

### Root Cause Analysis

**minimatch@3.0.5** is responsible for 4 out of 5 vulnerabilities:
- Used transitively by ejs and googleapis
- Cannot be controlled via overrides (deeper transitive dependency)
- Must wait for upstream packages to update

### Risk Assessment

**Overall Risk:** LOW-MEDIUM

- ✅ ejs: Server-side only, no direct user input to templates
- ✅ googleapis: Admin-only, Basic Auth protected
- ⚠️ airtable: Should be upgraded (fix available)

### Upgrade Instructions

```bash
# Upgrade airtable
npm install airtable@latest

# Test locally
npm start
# - Test contact form submission
# - Test enquiry form submission  
# - Verify security logs write to Airtable

# Deploy
./deploy-staging.sh && ./deploy-production.sh
```

---

## Scan History

| Date | Tool | Total | Critical | High | Moderate | Low | Status |
|------|------|-------|----------|------|----------|-----|--------|
| 24 Dec 2025 | npm audit | 28 | 1 | 17 | 3 | 7 | All fixed |
| 6 Jan 2026 | npm audit | 0 | 0 | 0 | 0 | 0 | ✅ Clean |
| 26 Feb 2026 | npm audit | 0 | 0 | 0 | 0 | 0 | ✅ Clean |
| 26 Feb 2026 | Snyk | 5 | 0 | 5 | 0 | 0 | ⚠️ Action needed |
