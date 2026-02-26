# A/B Testing System Overview

## Quick Start

### Running a Report
```bash
# All tests, last 7 days
node scripts/ab-test-report.js

# Specific test, last 30 days
node scripts/ab-test-report.js near_me_meta 30
```

### Checking Logs
```bash
# View recent logs
tail -50 logs/ab-tests.log

# Count exposures by variant
grep "exposure | near_me_meta | A" logs/ab-tests.log | wc -l
grep "exposure | near_me_meta | B" logs/ab-tests.log | wc -l
```

### Test a Variant Assignment Locally
```bash
# Start server
npm start

# Visit http://localhost:3000 in browser
# Check DevTools > Application > Cookies
# Should see: ab_near_me_meta = A or B

# Clear cookies and reload several times
# Confirm ~50/50 split over multiple visits
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Request                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Route Handler                             │
│  (routes/dynamic.js, routes/default.js)                      │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐      ┌──────────────────────────┐
│   getVariantsForRoute │      │   getCopyVariant         │
│   (ab-testing.js)     │      │   (ab-copy-variants.js)  │
│                       │      │                          │
│ - Check for cookie    │      │ - Return meta object     │
│ - Assign if missing   │      │   based on variant       │
│ - Set cookie          │      │                          │
└───────────────────────┘      └──────────────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
                  ┌─────────────────┐
                  │  logExposure    │
                  │  (ab-logger.js) │
                  │                 │
                  │ - Write to file │
                  │ - Non-blocking  │
                  └─────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐      ┌──────────────────────────┐
│   Server Log File     │      │   Client-Side Tracking   │
│   logs/ab-tests.log   │      │   (ab-tracking.js)       │
│                       │      │                          │
│ - Exposures           │      │ - GA4 ab_exposure event  │
│ - Conversions         │      │ - GA4 ab_conversion evt  │
└───────────────────────┘      └──────────────────────────┘
            │                               │
            ▼                               ▼
┌───────────────────────┐      ┌──────────────────────────┐
│  ab-test-report.js    │      │    GA4 Dashboard         │
│                       │      │                          │
│ - Parse log file      │      │ - Real-time events       │
│ - Calculate stats     │      │ - Custom explorations    │
│ - Print report        │      │ - Funnel analysis        │
└───────────────────────┘      └──────────────────────────┘
```

---

## File Structure

```
specialised/
├── utils/
│   ├── ab-testing.js          # Core A/B test logic & registry
│   ├── ab-copy-variants.js    # Meta descriptions per variant
│   └── ab-logger.js            # Server-side logging utilities
├── routes/
│   ├── dynamic.js              # Routes with A/B integration (home, contact, etc.)
│   └── default.js              # Routes with A/B integration (about, gallery)
├── public/js/
│   └── ab-tracking.js          # Client-side GA4 event tracking
├── scripts/
│   └── ab-test-report.js       # CLI reporting tool
├── logs/
│   └── ab-tests.log            # Server-side event log
└── docs/
    ├── aeo-opportunities-inventory.md      # All copy variants & opportunities
    ├── ab-testing-deployment-guide.md      # Deployment & validation guide
    ├── ab-testing-overview.md              # This file
    ├── client-ab-testing-email.md          # Client communication template
    └── ab-test-results-template.md         # Results reporting template
```

---

## Key Components

### 1. Test Registry (`utils/ab-testing.js`)

Defines all A/B tests:

```javascript
const AB_TESTS = {
  nearMeMetaDescription: {
    id: "near_me_meta",
    name: "Near-me Meta Description Test",
    routes: ["/", "/our-work", "/about", "/contact"],
    variants: ["A", "B"],
    trafficSplit: 0.5,
    active: true,  // ← Set to false to disable
  },
  // ... more tests
};
```

### 2. Copy Variants (`utils/ab-copy-variants.js`)

Maps variants to actual copy:

```javascript
const COPY_VARIANTS = {
  home: {
    A: { title: "...", description: "..." },  // Control
    B: { title: "...", description: "..." },  // Test variant
  },
  // ... more pages
};
```

### 3. Route Integration (Example)

```javascript
router.get("/", async (req, res) => {
  // Get variant assignment
  const variants = getVariantsForRoute(req, res, "/");

  // Get copy for assigned variant
  const meta = getMetaForPage("home", variants);

  // Log exposure (non-blocking)
  if (variants.near_me_meta) {
    logExposure(req, "near_me_meta", variants.near_me_meta, "/")
      .catch((err) => console.error("Failed to log:", err));
  }

  res.render("index", { meta: meta, abVariants: variants });
});
```

### 4. Server Logging (`utils/ab-logger.js`)

```javascript
// Log format: timestamp | eventType | testId | variant | route | sessionId | metadata
await logExposure(req, "near_me_meta", "A", "/");
// → 2026-01-26T10:30:45.123Z | exposure | near_me_meta | A | / | session_123 | {...}

await logConversion(req, "near_me_meta", "A", "contact_form_submit", { reference: "rec123" });
// → 2026-01-26T10:35:12.456Z | conversion | near_me_meta | A | contact_form_submit | session_123 | {...}
```

### 5. Client Tracking (`public/js/ab-tracking.js`)

Automatically tracks:
- **Exposures:** On page load, sends `ab_exposure` event to GA4
- **Conversions:** On form submit, sends `ab_conversion` event to GA4
- **Phone clicks:** On tel: link click, sends `ab_conversion` event

---

## How to Add a New Test

### Step 1: Define the Test

Edit `utils/ab-testing.js`:

```javascript
const AB_TESTS = {
  // ... existing tests

  myNewTest: {
    id: "my_new_test",
    name: "My New Test",
    routes: ["/page1", "/page2"],
    variants: ["A", "B"],
    trafficSplit: 0.5,
    active: true,
  },
};
```

### Step 2: Add Copy Variants

Edit `utils/ab-copy-variants.js`:

```javascript
const COPY_VARIANTS = {
  // ... existing pages

  page1: {
    A: {
      title: "Control Title",
      description: "Control description...",
    },
    B: {
      title: "Test Title",
      description: "Test description...",
    },
  },
};
```

### Step 3: Update getMetaForPage Function

Edit the `getMetaForPage()` function in `utils/ab-copy-variants.js` to handle your new test if it's not using the default logic:

```javascript
function getMetaForPage(page, variants) {
  // Check which test is active
  if (variants.my_new_test) {
    return getCopyVariant(page, variants.my_new_test);
  }

  // Fallback to near_me_meta or control
  const variant = variants.near_me_meta || "A";
  return getCopyVariant(page, variant);
}
```

### Step 4: Update Route Handlers

No changes needed if using existing routes! The system automatically picks up active tests.

### Step 5: Test Locally

```bash
npm start
# Visit pages in test
# Check cookies and meta descriptions
# Clear cookies, refresh multiple times
# Verify ~50/50 variant split
```

### Step 6: Deploy

```bash
./deploy-staging.sh
# Validate on staging
./deploy-production.sh
```

---

## How to End a Test

### Step 1: Generate Final Report

```bash
node scripts/ab-test-report.js near_me_meta 42  # 6 weeks of data
```

### Step 2: Declare Winner

Document results in `docs/ab-test-results-[testname].md` using the template.

### Step 3: Implement Winner

Edit `utils/ab-copy-variants.js`:

```javascript
// Before
home: {
  A: { description: "Old control..." },
  B: { description: "Winning variant..." },
}

// After (B becomes new control)
home: {
  A: { description: "Winning variant..." },  // ← Updated
  B: { description: "Future test variant..." },  // ← Optional: keep for next test
}
```

### Step 4: Deactivate Test

Edit `utils/ab-testing.js`:

```javascript
nearMeMetaDescription: {
  // ... config
  active: false,  // ← Set to false
}
```

### Step 5: Deploy

```bash
./deploy-staging.sh
# Validate winner is live for all users
./deploy-production.sh
```

### Step 6: Archive Logs

```bash
cp logs/ab-tests.log logs/archive/ab-tests-near-me-meta-$(date +%Y-%m-%d).log
# Optional: Clear main log for next test
echo "# A/B Test Logs" > logs/ab-tests.log
```

---

## Troubleshooting

### No logs appearing

**Check:**
1. File permissions: `ls -la logs/ab-tests.log`
2. Directory exists: `ls -la logs/`
3. Manual test: `node -e "require('./utils/ab-logger').logExposure({cookies:{}, get:(h)=>h}, 'test', 'A', '/test')"`

### Unbalanced traffic split (not 50/50)

**Possible causes:**
- Small sample size (needs 100+ visitors)
- Bot traffic (bots often don't accept cookies)
- CDN caching issues

**Check:**
- Run report: `node scripts/ab-test-report.js`
- Wait for more data (patterns normalize over time)

### GA4 events not firing

**Check:**
1. GA4 script loads: View source, search for `gtag`
2. ab-tracking.js loads: Check DevTools > Network
3. Console errors: Check DevTools > Console
4. GA4 DebugView: Visit site with `?debug_mode=true`

### Meta description not changing

**Check:**
1. Cookie value: DevTools > Application > Cookies > `ab_near_me_meta`
2. View source: Should match variant assigned
3. Cache: Clear browser cache and cookies
4. Server logs: Check for errors in console

---

## Performance Considerations

### Server-Side Impact

- **Cookie read:** ~0.1ms (negligible)
- **Cookie write:** ~0.2ms (negligible)
- **Log write:** Async, non-blocking (~5-10ms in background)
- **Total added latency:** <1ms per request

### Client-Side Impact

- **ab-tracking.js size:** ~3KB (minified: ~1KB)
- **GA4 event payload:** ~500 bytes per event
- **Added network calls:** 1-2 per page (already using GA4)

### Recommendations

- Keep test active for 4-6 weeks minimum
- Aim for 1,000+ exposures per variant
- Monitor server logs for any performance issues
- Use `console.time()` to measure route handler performance if concerned

---

## Best Practices

### Test Design

1. **Change one thing at a time** - Isolate variables
2. **Test for sufficient duration** - Minimum 4 weeks for SERP tests
3. **Get enough sample size** - Target 1,000+ exposures per variant
4. **Consider seasonality** - Avoid testing during holidays or unusual periods
5. **Document everything** - Keep detailed records of changes and results

### Copy Writing

1. **Be specific** - "Near Germiston" vs. generic descriptions
2. **Lead with value** - What's unique about your service?
3. **Use action verbs** - "Get", "View", "Contact", "Call"
4. **Include proof** - "40+ years", "OEM-certified", "Expert"
5. **Match search intent** - Answer the question searchers are asking

### Reporting

1. **Weekly snapshots** - Track trends early
2. **Bi-weekly deep dives** - Look for patterns
3. **Final comprehensive report** - Document all learnings
4. **Share with stakeholders** - Keep client informed
5. **Archive for reference** - Future tests benefit from past learnings

---

## Resources

### Internal
- [AEO Opportunities Inventory](./aeo-opportunities-inventory.md)
- [Deployment Guide](./ab-testing-deployment-guide.md)
- [Client Email Template](./client-ab-testing-email.md)
- [Results Template](./ab-test-results-template.md)

### External
- [Google A/B Testing Guidelines](https://developers.google.com/search/docs/advanced/guidelines/testing-changes)
- [GA4 Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Statistical Significance Calculator](https://www.optimizely.com/sample-size-calculator/)

---

*Last updated: 2026-01-26*
