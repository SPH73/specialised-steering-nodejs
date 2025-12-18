# NPM Security Audit Summary

**Date**: December 18, 2025
**Total Vulnerabilities**: 28 (7 low, 3 moderate, 17 high, 1 critical)

---

## 🚨 Critical Vulnerabilities (1)

### 1. vm2 (Critical)

- **Package**: `vm2` ≤3.9.19
- **Issues**: Multiple sandbox escape vulnerabilities leading to Remote Code Execution
- **Severity**: CRITICAL
- **Fix**: Run `npm audit fix`
- **Impact**: Could allow attackers to escape sandbox and execute code on host

---

## ⚠️ High Severity Vulnerabilities (17)

### 1. body-parser

- **Version**: ≤1.20.2
- **Issue**: Denial of service when URL encoding is enabled
- **Fix**: `npm audit fix`
- **Dependencies**: Used by Express

### 2. cloudinary

- **Version**: ≤2.6.1
- **Issue**: Arbitrary Argument Injection through parameters with ampersands
- **Fix**: `npm audit fix --force` (Breaking change to 2.8.0)
- **Impact**: Affects image upload functionality
- **Note**: This is used in your enquiry form

### 3. dicer

- **Issue**: Crash in HeaderParser
- **Fix**: `npm audit fix`
- **Dependencies**: Used by busboy → multer
- **Impact**: Affects file upload functionality

### 4. ip

- **Issue**: Multiple SSRF vulnerabilities, incorrectly identifies private IPs as public
- **Fix**: `npm audit fix --force` (cloudinary 2.8.0 - breaking change)
- **Dependencies**: Used by proxy-agent chain

### 5. is_js

- **Issue**: Regular Expression Denial of Service
- **Fix**: `npm audit fix --force` (request-ip 3.3.0 - breaking change)
- **Dependencies**: Used by request-ip
- **Impact**: Affects IP detection for form submissions

### 6. minimatch

- **Version**: <3.0.5
- **Issue**: ReDoS vulnerability
- **Fix**: `npm audit fix`

### 7. path-to-regexp

- **Version**: ≤0.1.11
- **Issue**: Multiple ReDoS vulnerabilities
- **Fix**: `npm audit fix`
- **Dependencies**: Used by Express for routing

### 8. qs

- **Version**: 6.7.0 - 6.7.2
- **Issue**: Prototype Pollution vulnerability
- **Fix**: `npm audit fix`
- **Dependencies**: Used by Express body-parser

### 9. send

- **Version**: <0.19.0
- **Issue**: Template injection leading to XSS
- **Fix**: `npm audit fix`
- **Dependencies**: Used by Express serve-static

### 10. cookie

- **Version**: <0.7.0
- **Issue**: Accepts out of bounds characters in name/path/domain
- **Fix**: `npm audit fix`
- **Dependencies**: Used by cookie-parser

### 11. brace-expansion

- **Version**: 1.0.0 - 1.1.11 || 2.0.0 - 2.0.1
- **Issue**: Regular Expression Denial of Service
- **Fix**: `npm audit fix`

---

## 📋 Moderate Severity Vulnerabilities (3)

### 1. ejs

- **Version**: <3.1.10
- **Current**: 3.1.6
- **Issue**: Lacks certain pollution protection
- **Fix**: `npm audit fix`
- **Impact**: Template engine vulnerability
- **Action**: Safe to upgrade

### 2. nodemailer

- **Version**: ≤7.0.10
- **Current**: 6.9.0
- **Issue**:
  - Email to unintended domain due to interpretation conflict
  - Address parser DoS via recursive calls
- **Fix**: `npm audit fix --force` (7.0.11 - breaking change)
- **Impact**: YOUR NEW EMAIL NOTIFICATION SYSTEM
- **Note**: Important to fix but test thoroughly after upgrade

### 3. word-wrap

- **Version**: <1.2.4
- **Issue**: Regular Expression Denial of Service
- **Fix**: `npm audit fix`

---

## 📉 Low Severity Vulnerabilities (7)

- on-headers (compression dependency)
- Various transitive dependencies

---

## 🎯 Recommended Action Plan

### Phase 1: Safe Fixes (No Breaking Changes)

Run this first to fix most issues without breaking changes:

```bash
npm audit fix
```

**This will fix:**

- vm2 (CRITICAL)
- body-parser
- dicer/busboy/multer
- minimatch
- path-to-regexp
- qs
- send/serve-static
- cookie/cookie-parser
- brace-expansion
- word-wrap
- on-headers/compression
- ejs (safe upgrade to 3.1.10)

### Phase 2: Breaking Changes (Requires Testing)

These require `--force` and may have breaking changes:

#### A. Cloudinary Upgrade (High Priority)

````bash
npm install cloudinary@latest

```txt
- **Breaking Change**: 2.6.1 → 2.8.0

- **Test**: Enquiry form image uploads
- **Files to test**: `routes/dynamic.js` enquiry endpoint

#### B. Nodemailer Upgrade (Medium Priority)
```bash
npm install nodemailer@latest
````

- **Breaking Change**: 6.9.0 → 7.0.11
- **Test**: Email notifications (contact & enquiry forms)
- **Files to test**: `utils/email.js`, both form submissions

#### C. Request-IP Upgrade (Low Priority)

```bash
npm install request-ip@latest

```

- **Breaking Change**: 2.1.3 → 3.3.0
- **Test**: IP detection in forms
- **Files to check**: Form submission handlers

---

## ⚡ Quick Start

### Option 1: Conservative (Recommended)

```bash
# Fix everything safe first
npm audit fix

# Then manually test and upgrade the big ones
npm install cloudinary@latest
npm install nodemailer@latest
npm test  # Test your application
```

### Option 2: Aggressive (Test Thoroughly After)

```bash
# Fix everything at once (may break things)
npm audit fix --force

# THEN TEST EVERYTHING:
# - Image uploads on enquiry form
# - Email notifications
# - Form submissions
```

---

## 📝 Testing Checklist After Upgrades

- [ ] Test enquiry form with image upload
- [ ] Test enquiry form without image
- [ ] Test contact form submission
- [ ] Verify email notifications are received
- [ ] Check email notification formatting (HTML)
- [ ] Verify images appear correctly in emails
- [ ] Test IP tracking is working
- [ ] Check Airtable records are created correctly
- [ ] Test reCAPTCHA is functioning
- [ ] Verify all routes load correctly
- [ ] Test `/our-work` page and detail pages

---

## 📂 Files Affected by Major Upgrades

### Cloudinary Upgrade

- `routes/dynamic.js` (lines 194-247)
- `utils/cloudinary.js`
- Test: Image upload in enquiry form

### Nodemailer Upgrade

- `utils/email.js` (entire file - 409 lines)
- `routes/dynamic.js` (email notification calls)
- Test: All form submissions

### Request-IP Upgrade

- `routes/dynamic.js` (uses `requestIp.getClientIp(req)`)
- May need to change to `req.ip` or `req.headers['x-forwarded-for']`

---

## 🔍 Full Audit Reports

- **Text Report**: `npm-audit-report.txt` (6.5 KB)
- **JSON Report**: `npm-audit-detailed.json` (27.4 KB)

---

## ⏭️ Next Steps

1. **Backup**: Commit current working state before upgrades
2. **Run Phase 1**: `npm audit fix`
3. **Test**: Verify application works
4. **Run Phase 2**: Upgrade cloudinary, nodemailer one at a time
5. **Test thoroughly** after each upgrade
6. **Commit**: Each successful upgrade separately
7. **Deploy**: Only after all tests pass

---

**Note**: The most important vulnerabilities affecting your application are:

1. **cloudinary** - Used in enquiry form uploads
2. **nodemailer** - Your new email notification system
3. **express dependencies** - Core framework security

Consider running Phase 1 immediately, then Phase 2 in a development environment first.
