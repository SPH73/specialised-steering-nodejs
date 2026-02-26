# A/B Testing Quick Reference Card

## 🚀 Common Commands

### Local Testing
```bash
# Start server
npm start

# Visit http://localhost:3000
# Check cookies: DevTools > Application > Cookies > ab_near_me_meta
# View source to see meta description
```

### Reporting
```bash
# All tests, last 7 days
node scripts/ab-test-report.js

# Specific test, last 30 days
node scripts/ab-test-report.js near_me_meta 30

# View recent logs
tail -50 logs/ab-tests.log

# Count exposures
grep "exposure | near_me_meta" logs/ab-tests.log | wc -l
```

### Deployment
```bash
# Deploy to staging
./deploy-staging.sh

# Deploy to production
./deploy-production.sh
```

---

## 📁 Key Files

### Configuration
- `utils/ab-testing.js` - Test registry (activate/deactivate tests here)
- `utils/ab-copy-variants.js` - Meta descriptions per variant
- `utils/ab-logger.js` - Logging utilities

### Routes
- `routes/dynamic.js` - Home, Our Work, Enquiry, Contact
- `routes/default.js` - About, Gallery

### Documentation
- `docs/README-AB-TESTING.md` - Master guide
- `docs/ab-testing-overview.md` - System overview
- `docs/ab-testing-deployment-guide.md` - Deployment steps

---

## 🎯 Active Tests

### Phase 1: Near-me Meta Description
- **Pages:** Home, Our Work, About, Contact
- **Status:** Ready to deploy
- **Duration:** 4-6 weeks
- **Variants:** A (control) vs B (near-me optimized)

---

## 📊 Monitoring Checklist

### Daily (First Week)
- [ ] Check error logs
- [ ] Verify balanced traffic split
- [ ] Monitor GA4 real-time events

### Weekly
- [ ] Generate report: `node scripts/ab-test-report.js`
- [ ] Review Google Search Console metrics
- [ ] Send client update

### Monthly
- [ ] Deep analysis of trends
- [ ] Check statistical significance
- [ ] Update client with detailed report

---

## 🔧 Quick Fixes

### Unbalanced traffic?
Wait for more data (100+ visits). Check: `node scripts/ab-test-report.js`

### No GA4 events?
Check: GA4 script loads, console errors, use `?debug_mode=true`

### Meta not changing?
Check: Cookie value, clear cache, view page source

### No logs?
Check: File permissions, `ls -la logs/ab-tests.log`

---

## 📞 Help

**Full docs:** `docs/README-AB-TESTING.md`
**Troubleshooting:** `docs/ab-testing-overview.md#troubleshooting`
**Deployment:** `docs/ab-testing-deployment-guide.md`

---

## ✅ Pre-Deploy Checklist

- [ ] Test locally (variant assignment works)
- [ ] Review copy variants (no typos)
- [ ] Check active tests (only Phase 1 active)
- [ ] Deploy to staging first
- [ ] Validate on staging (cookies, meta, logs, GA4)
- [ ] Get client approval
- [ ] Deploy to production
- [ ] Monitor first 48 hours

---

*Keep this handy for quick reference during deployment and monitoring!*
