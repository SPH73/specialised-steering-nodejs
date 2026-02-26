# Security Vulnerabilities Report

**Project:** Specialised Steering Web Application  
**Last Updated:** 26 February 2026  
**Scan Date:** 26 February 2026

---

## Executive Summary

This document tracks known security vulnerabilities in the project dependencies and their remediation status.

**Current Status:**
- **Total Vulnerabilities:** 5
- **High Severity:** 5
- **Direct Dependencies:** 1 (fixable)
- **Transitive Dependencies:** 4 (no fix available)

---

## Vulnerability Details

### 1. ejs@3.1.10 (HIGH - Priority Score: 614)

**Status:** ⚠️ No fix available  
**Type:** Transitive dependency  
**Issues:** 2

#### Issue 1.1: Inefficient Algorithmic Complexity
- **Vulnerability:** Inefficient Algorithmic Complexity in `minimatch@3.0.5`
- **CWE:** CWE-407
- **CVSS Score:** 8.7 (High)
- **Priority Score:** 614
- **Path:** ejs → minimatch@3.0.5
- **Fix:** No supported fix available

#### Issue 1.2: Regular Expression Denial of Service (ReDoS)
- **Vulnerability:** Regular Expression Denial of Service in `minimatch@3.0.5`
- **CWE:** CWE-1333
- **CVSS Score:** 8.7 (High)
- **Priority Score:** 614
- **Path:** ejs → minimatch@3.0.5
- **Fix:** No supported fix available

**Impact Assessment:**
- EJS is the template engine (v3.1.10)
- Used server-side only, not exposed to user input directly
- Vulnerabilities are in transitive dependency `minimatch` used by EJS
- Risk: Low in production (server-side rendering with controlled input)

**Mitigation:**
- Monitor for EJS updates that upgrade minimatch dependency
- Continue using current version with awareness of limitation
- Input validation already in place for all user-submitted data
- Template files are not user-editable

**Recommended Action:** Monitor for updates, no immediate action required

---

### 2. googleapis@169.0.0 (HIGH - Priority Score: 614)

**Status:** ⚠️ No fix available  
**Type:** Transitive dependency  
**Issues:** 2

#### Issue 2.1: Inefficient Algorithmic Complexity
- **Vulnerability:** Inefficient Algorithmic Complexity in `minimatch@3.0.5`
- **CWE:** CWE-407
- **CVSS Score:** 8.7 (High)
- **Priority Score:** 614
- **Path:** googleapis → (dependency chain) → minimatch@3.0.5
- **Fix:** No supported fix available

#### Issue 2.2: Regular Expression Denial of Service (ReDoS)
- **Vulnerability:** Regular Expression Denial of Service in `minimatch@3.0.5`
- **CWE:** CWE-1333
- **CVSS Score:** 8.7 (High)
- **Priority Score:** 614
- **Path:** googleapis → (dependency chain) → minimatch@3.0.5
- **Fix:** No supported fix available

**Impact Assessment:**
- googleapis package used for Google Photos Picker API OAuth
- Used only in admin panel (protected by Basic Auth)
- Limited to admin operations (gallery management)
- Same underlying vulnerability as EJS (minimatch@3.0.5)
- Risk: Very low (admin-only, authenticated usage)

**Mitigation:**
- Admin panel protected by Basic Auth
- OAuth tokens stored securely in token.json
- Limited to trusted admin users only
- Monitor for googleapis updates

**Recommended Action:** Monitor for updates, no immediate action required

---

### 3. airtable@0.11.1 (HIGH - Priority Score: 579)

**Status:** ✅ Fix available  
**Type:** Direct dependency  
**Issues:** 1

#### Upgrade Path
- **Current Version:** 0.11.1
- **Fix Version:** 0.11.6 or higher
- **Issues Fixed:** 1 direct issue

**Impact Assessment:**
- Airtable client library for database operations
- Used throughout application for form submissions and security logs
- Direct dependency (controllable by updating package.json)

**Mitigation:**
- Upgrade available to version 0.11.6
- Testing required before deployment

**Recommended Action:** 🔧 **Upgrade to airtable@0.11.6**

**Upgrade Steps:**
```bash
# Update package.json
npm install airtable@latest

# Test locally
npm start
node scripts/test-admin-routes.js

# Verify Airtable operations work
# - Test contact form submission
# - Test enquiry form submission
# - Check security logs are being written

# Deploy to staging
./deploy-staging.sh

# Test on staging environment

# Deploy to production
./deploy-production.sh
```

---

## Summary by Severity

| Severity | Count | Status |
|----------|-------|--------|
| High | 5 | 1 fixable, 4 no fix available |
| Medium | 0 | - |
| Low | 0 | - |

---

## Dependency Tree Analysis

### minimatch@3.0.5 (Root Cause of 4 Vulnerabilities)

This outdated version of minimatch is the root cause of 4 out of 5 vulnerabilities:

**Affected via:**
1. ejs@3.1.10 → minimatch@3.0.5
2. googleapis@169.0.0 → (dependency chain) → minimatch@3.0.5

**Issues:**
- CWE-407: Inefficient Algorithmic Complexity
- CWE-1333: Regular Expression Denial of Service (ReDoS)

**Why No Fix:**
- Both ejs and googleapis need to update their dependencies
- We cannot directly control transitive dependencies
- Must wait for upstream package maintainers to update

**Workaround:**
- None available without forking and patching packages
- Not recommended for production stability

---

## Risk Assessment

### Overall Risk Level: **LOW-MEDIUM**

**Rationale:**
1. **EJS Vulnerabilities** (4 issues):
   - Server-side only, controlled environment
   - Template files not user-editable
   - Input validation in place
   - Risk: **LOW**

2. **Airtable Vulnerability** (1 issue):
   - Direct dependency with fix available
   - Should be upgraded
   - Risk: **MEDIUM** (until upgraded)

### Production Risk Factors:
- ✅ No public-facing vulnerabilities
- ✅ All user input validated and sanitized
- ✅ Admin panel protected by authentication
- ✅ Rate limiting and spam protection active
- ✅ Security logging in place

---

## Action Plan

### Immediate (This Week)
- [ ] Upgrade airtable from 0.11.1 to 0.11.6 or latest
- [ ] Test all Airtable operations locally
- [ ] Deploy to staging and verify
- [ ] Deploy to production

### Short-term (This Month)
- [ ] Monitor ejs package for updates that fix minimatch dependency
- [ ] Monitor googleapis package for security updates
- [ ] Run npm audit weekly to catch new vulnerabilities
- [ ] Document any new vulnerabilities in this file

### Long-term (Ongoing)
- [ ] Set up automated vulnerability scanning (e.g., Dependabot, Snyk)
- [ ] Review and update all dependencies quarterly
- [ ] Consider alternative packages if vulnerabilities persist
- [ ] Implement dependency version pinning strategy

---

## Monitoring

### Weekly Checks
```bash
# Run npm audit
npm audit

# Check for package updates
npm outdated

# Generate detailed report
npm audit --json > npm-audit-detailed.json
```

### Update This Document
- Add new vulnerabilities as they are discovered
- Update status when fixes are applied
- Document any incidents or exploitation attempts
- Track upgrade history

---

## Historical Upgrades

### 2026-02-26 - Initial Documentation
- Documented ejs@3.1.10 vulnerabilities (no fix available)
- Documented googleapis@169.0.0 vulnerabilities (no fix available)
- Documented airtable@0.11.1 vulnerability (fix available: upgrade to 0.11.6)

---

## References

- **npm audit documentation:** https://docs.npmjs.com/cli/v8/commands/npm-audit
- **CWE-407 (Algorithmic Complexity):** https://cwe.mitre.org/data/definitions/407.html
- **CWE-1333 (ReDoS):** https://cwe.mitre.org/data/definitions/1333.html
- **Snyk Vulnerability Database:** https://snyk.io/vuln/
- **CVSS Calculator:** https://www.first.org/cvss/calculator/3.1

---

**Next Review Date:** 4 March 2026 (Weekly)  
**Responsible:** Development Team  
**Approval Required:** Client notification if high-risk vulnerabilities found
