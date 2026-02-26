# A/B Testing Deployment & Validation Guide

## Overview
This guide covers the deployment, validation, and monitoring of A/B tests for the Specialised Steering website.

---

## Pre-Deployment Checklist

### 1. Code Review
- [ ] Review all A/B test configurations in `utils/ab-testing.js`
- [ ] Verify copy variants in `utils/ab-copy-variants.js`
- [ ] Confirm logging utilities are properly integrated
- [ ] Check that GA4 tracking script is included in templates

### 2. Local Testing
```bash
# Start local server
npm start

# Test key pages and check:
# - Variant cookie assignment (check browser DevTools > Application > Cookies)
# - Meta description changes (view page source)
# - Console logs for exposure tracking
# - GA4 event payloads (use GA4 DebugView)
```

### 3. Environment Variables
Ensure staging/production `.env` has:
```
NODE_ENV=production
# ... other vars
```

---

## Deployment to Staging

### Step 1: Deploy Code
```bash
# From project root
./deploy-staging.sh
```

### Step 2: Verify Staging Deployment
1. **Check variant assignment:**
   - Visit: https://staging.specialisedsteering.com/
   - Open DevTools > Application > Cookies
   - Verify `ab_near_me_meta` cookie is set (value: A or B)
   - Clear cookies and refresh multiple times - confirm ~50/50 split

2. **Check meta descriptions:**
   - Variant A: "We repair and source hydraulic components..."
   - Variant B: "Expert hydraulic repairs near Germiston..."
   - View page source to confirm meta tags match variant

3. **Check server logs:**
   ```bash
   # SSH to staging server
   tail -f /path/to/logs/ab-tests.log
   ```
   - Should see exposure events: `timestamp | exposure | near_me_meta | A | / | sessionId | {...}`

4. **Check GA4 events:**
   - Go to GA4 > Configure > DebugView
   - Visit staging site with `?debug_mode=true` query param
   - Verify `ab_exposure` events are firing with correct parameters:
     - `test_id`: near_me_meta
     - `variant`: A or B
     - `page_path`: /

### Step 3: Test Form Submissions
1. Submit contact form on staging
2. Check logs for conversion event: `timestamp | conversion | near_me_meta | A | contact_form_submit | ...`
3. Verify GA4 `ab_conversion` event fires

### Step 4: Monitor for 24 Hours
- Check error logs for any A/B-related errors
- Verify no performance degradation
- Confirm cookie persistence across pages

---

## Deployment to Production

### Step 1: Client Approval
- Send client email explaining A/B testing (see `docs/client-ab-testing-email.md`)
- Get explicit approval to proceed
- Confirm test duration (recommended: 4-6 weeks minimum)

### Step 2: Deploy to Production
```bash
# From project root
./deploy-production.sh
```

### Step 3: Production Validation
Repeat all staging validation steps on production:
1. Variant assignment (check cookies)
2. Meta description output (view source)
3. Server logs (`logs/ab-tests.log`)
4. GA4 events (production property)

### Step 4: Monitor First 48-72 Hours
- Check server logs daily
- Monitor GA4 Real-Time reports
- Verify balanced traffic split (~50/50)
- Watch for any error rate increases

---

## Monitoring & Reporting

### Server-Side Logs
```bash
# View recent logs
tail -100 logs/ab-tests.log

# Count exposures by variant
grep "exposure | near_me_meta" logs/ab-tests.log | grep " | A | " | wc -l
grep "exposure | near_me_meta" logs/ab-tests.log | grep " | B | " | wc -l

# Count conversions by variant
grep "conversion | near_me_meta" logs/ab-tests.log | grep " | A | " | wc -l
grep "conversion | near_me_meta" logs/ab-tests.log | grep " | B | " | wc -l
```

### Automated Report
```bash
# Generate report for all tests (last 7 days)
node scripts/ab-test-report.js

# Generate report for specific test (last 30 days)
node scripts/ab-test-report.js near_me_meta 30
```

### GA4 Dashboards
1. **Create Custom Exploration:**
   - Dimension: Event Name = `ab_exposure`
   - Breakdown: test_id, variant
   - Metrics: Event count

2. **Conversion Funnel:**
   - Step 1: `ab_exposure` (any variant)
   - Step 2: `ab_conversion` (form_submit)
   - Breakdown by variant

3. **Key Metrics to Monitor:**
   - Exposures per variant (should be ~50/50)
   - Conversion rate by variant
   - Avg time on page by variant
   - Bounce rate by variant

### Google Search Console
1. **SERP Performance by Page:**
   - Track impressions, clicks, CTR, position
   - Compare before/after test start date
   - Filter by pages in test (/, /our-work, /about, /contact)

2. **Weekly Snapshots:**
   - Export data weekly
   - Track trend over test duration
   - Look for CTR improvements

---

## Test Duration & Statistical Significance

### Minimum Test Duration
- **4-6 weeks minimum** for SERP-related tests
- Accounts for:
  - Search engine crawl cycles
  - Weekly traffic patterns
  - Seasonal variations

### Sample Size Guidelines
- **Target: 1,000+ exposures per variant** for statistical significance
- **Target: 50+ conversions per variant** for meaningful results
- Use online calculators (e.g., Optimizely, VWO) for significance testing

### When to Stop a Test
**Stop early (winning variant) if:**
- 95%+ statistical significance achieved
- 10%+ relative improvement in key metric
- Minimum sample size reached

**Stop early (no winner) if:**
- 6+ weeks elapsed with <5% difference
- Sample size targets met with no significant difference

**Continue testing if:**
- Approaching significance but not quite there
- Interesting trends emerging
- Under 4 weeks duration

---

## Troubleshooting

### Issue: Cookies not persisting
**Symptoms:** New variant assigned on every page load

**Solutions:**
1. Check browser allows cookies
2. Verify `secure` flag matches HTTPS status
3. Check `sameSite` setting (should be "lax")
4. Confirm cookie expiry is set (90 days)

### Issue: No GA4 events firing
**Symptoms:** DebugView shows no `ab_exposure` events

**Solutions:**
1. Verify GA4 script loads before `ab-tracking.js`
2. Check browser console for errors
3. Confirm `gtag` function is defined
4. Test with `?debug_mode=true` query param

### Issue: Unbalanced traffic split
**Symptoms:** 70/30 split instead of 50/50

**Possible causes:**
1. **Bot traffic:** Bots may not accept cookies, causing new assignments
2. **Cache issues:** CDN may cache variant A for some users
3. **Small sample size:** May normalize over time

**Solutions:**
- Monitor over longer period (patterns often normalize)
- Exclude bot traffic from analysis
- Check CDN cache settings for cookie-based content

### Issue: Server logs not writing
**Symptoms:** `logs/ab-tests.log` file empty or missing

**Solutions:**
1. Check file permissions: `chmod 644 logs/ab-tests.log`
2. Verify `logs/` directory exists
3. Check for filesystem errors in server logs
4. Test manually: `node scripts/ab-test-report.js`

---

## Rollout Plan

### Phase 1: Near-me Meta Description Test (Current)
- **Pages:** Home, Our Work, About, Contact
- **Duration:** 4-6 weeks
- **Target:** Improve SERP CTR by 10%+
- **Variants:** A (control) vs B (near-me/locality)

### Phase 2: Action-Oriented CTA Test (Future)
- **Pages:** Enquiry, Contact, Home
- **Duration:** 4 weeks
- **Target:** Improve form submission rate
- **Variants:** A (passive) vs B (action verbs)

**Activation:**
1. Update `utils/ab-testing.js`: Set `actionCTA.active = true`
2. Deploy to staging
3. Validate
4. Deploy to production

### Phase 3: Industry-Specific Focus Test (Future)
- **Pages:** Home, Our Work
- **Duration:** 6-8 weeks
- **Target:** Improve traffic quality (industry match)
- **Variants:** A (mining-first) vs B (agriculture-first) vs C (neutral)

**Activation:**
1. Update `utils/ab-testing.js`: Set `industryFocus.active = true`
2. Update `utils/ab-copy-variants.js`: Add variant C copy
3. Deploy to staging
4. Validate
5. Deploy to production

---

## Cleanup & Declaring a Winner

### When Test Concludes
1. **Generate final report:**
   ```bash
   node scripts/ab-test-report.js near_me_meta 42  # 6 weeks
   ```

2. **Export GA4 data:**
   - Full test period
   - All metrics
   - Save CSV for records

3. **Declare winner:**
   - Document results in `docs/ab-test-results.md`
   - Share summary with client
   - Get approval to implement winning variant

4. **Implement winner:**
   - Update copy in `utils/ab-copy-variants.js`: Make winning variant the new "A"
   - Set `active = false` in `utils/ab-testing.js`
   - Remove old variant copy
   - Deploy

5. **Archive test:**
   - Save logs: `cp logs/ab-tests.log logs/archive/ab-tests-near-me-meta-2026-01-26.log`
   - Document learnings
   - Plan next test

---

## Support & Resources

### Internal Documentation
- [`docs/aeo-opportunities-inventory.md`](./aeo-opportunities-inventory.md) - All page variants and opportunities
- [`utils/ab-testing.js`](../utils/ab-testing.js) - Test configuration
- [`utils/ab-copy-variants.js`](../utils/ab-copy-variants.js) - Copy for each variant
- [`utils/ab-logger.js`](../utils/ab-logger.js) - Logging utilities

### External Resources
- [Google A/B Testing Guide](https://support.google.com/optimize/answer/6211930)
- [GA4 Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Statistical Significance Calculator](https://www.optimizely.com/sample-size-calculator/)

### Contact
For questions about A/B testing implementation, contact the development team.

---

*Last updated: 2026-01-26*
