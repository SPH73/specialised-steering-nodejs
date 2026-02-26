# A/B Testing Explanation for Specialised Steering

**For: Devon (Client)**
**Prepared by: Sue Holder**
**Date: February 2026**

---

## What is A/B Testing?

A/B testing is like running a **controlled experiment** on your website to find out which version performs better. We show **half of your visitors one version (A)** and **half another version (B)**, then measure which gets better results.

Think of it like testing two different signs in a shop window to see which brings in more customers.

---

## What Are We Testing?

**Test Name:** "Near-me" Meta Description Test

**What's different?**

- **Version A (AEO Copy):** Uses location phrases like "hydraulic repairs near me in Germiston, Gauteng"
- **Version B (Client Copy):** Your preferred wording without "near me" phrasing

**Where?**

- Homepage (/)
- About page (/about)
- Contact page (/contact)
- Our Work page (/our-work)

---

## How Does It Work?

### For New Visitors:

1. **Visitor arrives** at your website
2. **System randomly assigns** them to Version A or B (50/50 chance)
3. **Cookie is saved** on their device (called `ab_near_me_meta`)
4. They see their assigned version

### For Returning Visitors:

1. **System checks cookie** on their device
2. **Shows same version** they saw before
3. This ensures consistency - they don't flip between versions

**Why consistency matters:**

- Confusing to see different content each visit
- Skews results if people see both versions
- Industry standard for valid test data

---

## Example Visitor Journey:

### Visitor 1 (Gets Version A):

- **First visit:** Randomly assigned Version A → Cookie saved
- **Second visit:** Cookie detected → Sees Version A again
- **Third visit:** Still Version A (cookie lasts 90 days)

### Visitor 2 (Gets Version B):

- **First visit:** Randomly assigned Version B → Cookie saved
- **Returns next week:** Sees Version B again
- **All future visits:** Version B for 90 days

---

## What We're Measuring:

### Primary Metrics:

1. **Form Submissions**

   - Contact form filled out
   - Parts enquiry form filled out

2. **Click-Through Rate from Google**
   - How many people click your search result (influenced by meta description)

### Success Looks Like:

- Version A gets **10%+ more form submissions** than Version B
- Version A gets **higher click-through rate** in Google search results
- Results are **statistically significant** (not just random luck)

---

## How Long Will It Run?

**Minimum Requirements (BOTH must be met):**
1. **Time:** 2-4 weeks minimum
2. **Conversions:** 100+ per variant (200+ total)

**Why These Numbers?**

**Statistical Significance:**
- Need enough data to know results aren't just random luck
- Industry standard: 95% confidence level
- Too few conversions = unreliable results

**Example Timeline:**
```
Week 1: Variant A: 12 conversions, Variant B: 8 conversions
❌ Too early - only 20 total conversions

Week 3: Variant A: 62 conversions, Variant B: 55 conversions  
⚠️ Getting there - 117 total, but borderline

Week 4: Variant A: 85 conversions, Variant B: 78 conversions
✅ Good! 163 total conversions - results are reliable
```

---

## How Will You Know Results?

### Weekly Updates from Sue:

I'll send you weekly email updates showing progress. Here's what they look like:

**Week 1 Email Example:**
```
Subject: A/B Test Update - Week 1

Hi Devon,

Quick update on the A/B testing:

Current Status (7 days):
- Variant A (near-me copy): 12 conversions from 315 visitors (3.8%)
- Variant B (original copy): 8 conversions from 298 visitors (2.7%)

Early Trend: Version A ahead by 40%
Data Quality: Too early - need 3 more weeks for reliable results

Next Update: Week 2

Cheers, Sue
```

**Week 4 Email (Final Report) Example:**
```
Subject: A/B Test Results - Final Report

Hi Devon,

The A/B test is complete! Here are the results:

RESULTS (28 days):
───────────────────────────────────────────

Version A (Near-me copy):
- Visitors: 1,247
- Form Submissions: 45
- Conversion Rate: 3.61%

Version B (Original copy):
- Visitors: 1,258  
- Form Submissions: 38
- Conversion Rate: 3.02%

WINNER: Version A 🎉
Improvement: +19.5% more conversions
Confidence: 95% (statistically significant)

RECOMMENDATION:
Keep Version A permanently - it generates ~20% more leads

Next Steps:
1. Implement Version A across all pages
2. Remove testing code
3. Monitor results for 30 days

Let me know if you'd like to proceed!

Cheers, Sue
```

### Visual Dashboard:

The final report includes a visual breakdown:

```
Version A (AEO Copy)          Version B (Client Copy)
─────────────────             ─────────────────────
Visitors: 1,250               Visitors: 1,250
Form Submissions: 45          Form Submissions: 38
Conversion Rate: 3.6%         Conversion Rate: 3.0%

📊 Winner: Version A (+20% more conversions)
✅ Confidence: 95% (statistically significant)
💰 Business Impact: ~20% more enquiries per month
```

### What It Means:

- **Clear winner identified** (or "no significant difference" if tied)
- **Percentage improvement** shown (how much better)
- **Business impact** calculated (more leads = more revenue)
- **Recommendation provided** (keep A, keep B, or continue testing)

---

## Why Random Assignment?

**Question:** "Why did I get Version B twice in incognito mode?"

**Answer:** Pure chance!

- It's like flipping a coin - sometimes you get heads twice in a row
- 50/50 split means:
  - 50% chance of B on first try
  - 25% chance of B twice in a row (50% × 50%)
  - 12.5% chance three times in a row

**This is normal and expected!**

To guarantee seeing Version A, we'd need to:

- Clear cookies completely between tests
- Open multiple incognito windows
- Eventually you'll see Version A (probability!)

---

## Privacy & Compliance

### What We Store:

- **Cookie name:** `ab_near_me_meta`
- **Cookie value:** Just the letter "A" or "B"
- **Duration:** 90 days
- **Personal data:** NONE

### Legal Compliance:

✅ Disclosed in Cookie Policy
✅ No personal information collected
✅ Compliant with POPIA (South Africa)
✅ Users can delete via browser settings

---

## Testing Timeline & Monitoring

### Week-by-Week Schedule:

**Week 1: Launch & Initial Check**
- **What happens:** Test goes live, data starts collecting
- **Update to you:** Email confirming test is running correctly
- **Look for:** Roughly 50/50 visitor split between versions
- **Decision:** Monitor only - too early for results

**Week 2: Early Trends**
- **What happens:** Patterns start emerging
- **Update to you:** Email showing early conversion numbers
- **Look for:** 50+ total conversions minimum
- **Decision:** Continue testing - not enough data yet

**Week 3: Getting Close**
- **What happens:** Results becoming more reliable
- **Update to you:** Email showing trend direction
- **Look for:** 100+ total conversions
- **Decision:** If <100 conversions, continue; if >100, almost ready

**Week 4: Decision Time**
- **What happens:** Statistical significance reached
- **Update to you:** Final report with recommendation
- **Look for:** 200+ total conversions, clear winner or tie
- **Decision:** Implement winning version or continue if inconclusive

### Decision Criteria Chart:

**✅ STOP TESTING - Clear Winner:**
```
Requirements Met:
☑ 2-4 weeks of data collected
☑ 100+ conversions per variant
☑ >10% performance difference
☑ Statistical confidence: 95%+

Example Result:
Version A: 3.61% conversion (45/1,247 visitors)
Version B: 3.02% conversion (38/1,258 visitors)
Difference: +19.5% relative improvement

✅ Winner: Version A
💰 Impact: ~20% more form submissions
📝 Action: Implement Version A permanently
```

**➡️ CONTINUE TESTING - Inconclusive:**
```
Current Status:
☐ Only 1-2 weeks of data
☐ <100 conversions per variant
☐ Results too close (<5% difference)
☐ Confidence: <90%

Example Result:
Version A: 3.35% conversion (21/627 visitors)
Version B: 3.19% conversion (20/627 visitors)
Difference: +5% relative (too close to call)

➡️ Status: Keep testing
⏱️ Duration: Run 1-2 more weeks
📝 Action: Monitor and check again next week
```

**🛑 STOP TESTING - No Difference (Tie):**
```
Requirements Met:
☑ 4+ weeks of data collected
☑ 200+ conversions per variant
☐ <5% performance difference (essentially equal)

Example Result:
Version A: 3.21% conversion (40/1,247 visitors)
Version B: 3.18% conversion (40/1,258 visitors)
Difference: +0.9% relative (negligible)

➡️ Result: No significant difference
💰 Impact: Both versions perform equally
📝 Action: Keep your preferred version (B), no optimization needed
```

### What I'm Monitoring Behind the Scenes:

**Technical Checks (Daily):**
- Test is running correctly
- Exposures maintain ~50/50 split
- Conversion tracking working
- No technical errors

**Data Quality (Weekly):**
- Total visitor count
- Total conversion count
- Conversion rates per variant
- Statistical significance level

**Red Flags to Watch For:**
- ❌ Uneven split (e.g., 80% see A, 20% see B) → Technical issue
- ❌ Zero conversions → Forms might be broken
- ❌ Wildly fluctuating results → External factors affecting data

---

## What Happens After Testing?

### If Version A Wins:

- **Keep Version A permanently** across all pages
- **Update all content** to use winning copy
- **Remove testing code** (no longer needed)

### If Version B Wins:

- **Keep your original copy** (no changes needed)
- **Remove testing code**
- **Document findings** for future reference

### If It's a Tie:

- **Keep your preferred version** (Version B)
- No performance difference = go with your choice
- Cost savings (no further optimization needed)

---

## Technical Details (For Your Records):

**Cookie Details:**

- Name: `ab_near_me_meta`
- Type: First-party, HttpOnly
- Duration: 90 days
- Scope: specialisedsteering.com only
- Secure: Yes (production)

**Test Configuration:**

- Split: 50/50 (A/B)
- Assignment: Random on first visit
- Persistence: Cookie-based
- Tracking: Server-side logs

**Pages Affected:**

- / (Homepage)
- /about
- /contact
- /our-work

**Not Affected:**

- /enquiry (standard copy)
- /gallery (no meta test)
- Legal pages (privacy, terms, etc.)

---

## Frequently Asked Questions

### About Testing Process:

**"Can I see both versions?"**

- Yes! I can send you screenshots of both versions
- Or clear your browser cookies between visits
- Or use different browsers/devices
- Each has a 50% chance of showing up

**"Will visitors notice they're in a test?"**

- No - the experience is seamless
- Both versions look identical (just different wording)
- There's no "test" banner or indicator
- They simply see one version and don't know another exists

**"Will this affect my Google ranking?"**

- No - Google doesn't penalize A/B testing
- Both versions are high-quality, relevant content
- Google supports testing and considers it best practice
- We're finding which performs BETTER, both are already good

**"What if visitors don't like their version?"**

- They won't know there are two versions
- Both are professional, accurate copy
- We're measuring actual behavior (form submissions), not opinions
- Letting results speak for themselves

### About Monitoring & Results:

**"How will you track results?"**

- Automated logging system tracks every visitor
- Server records which version they see
- Tracks if they submit a form
- I review reports weekly and send you updates

**"Can we check results anytime?"**

- Yes - I can generate a report on demand
- But checking too early can be misleading
- Weekly updates keep you informed without noise
- Final decision made after minimum 2-4 weeks

**"What if we want to stop the test early?"**

- Yes, we can stop anytime
- But results may not be statistically valid
- Minimum recommended: 2 weeks + 100 conversions
- I'll advise if we have enough data early or need longer

**"What if results are close (essentially a tie)?"**

- If <5% difference, it's essentially tied
- Continue testing for 1-2 more weeks
- If still tied after 4+ weeks, keep your preferred version (B)
- No performance difference = your choice wins

### About Business Impact:

**"How much does a 20% improvement actually mean?"**

Example Calculation:
```
Current Performance:
- 100 visitors per month
- 3% conversion rate = 3 enquiries/month

With 20% Improvement:
- 100 visitors per month  
- 3.6% conversion rate = 3.6 enquiries/month
- Extra 0.6 enquiries/month = ~7 extra enquiries/year

If 1 in 4 enquiries becomes a customer:
- ~2 extra customers per year
- At R50,000 average value = R100,000 extra revenue/year
```

**"What if Version A loses?"**

- That's valuable information!
- Means your original copy is better
- Saves time on unnecessary optimization
- Validates your content decisions

**"Can we test something else after this?"**

- Absolutely! This is just Phase 1
- Future tests could include:
  - Different call-to-action phrasing
  - Industry-specific messaging (mining vs agriculture)
  - Homepage layout variations
- One test at a time for clean results

### Technical Questions:

**"Is this complicated to implement?"**

- Already built and integrated
- Runs automatically in the background
- No manual work needed from you
- I handle all technical aspects

**"What happens to my website during testing?"**

- Website functions normally
- No downtime or performance impact
- Forms work exactly as before
- Visitors won't notice anything different

**"Can the test break my website?"**

- No - extensively tested in development
- Both versions already work on live site
- Worst case: test stops and everyone sees Version B
- I monitor daily for any issues

**"How accurate are the results?"**

- 95% confidence level (industry standard)
- Means 95% certain the winner is truly better
- Not just random luck or coincidence
- Same methodology used by Google, Amazon, Facebook

---

## Next Steps:

1. **Test runs for 2-4 weeks minimum**
2. **I'll monitor data weekly**
3. **Send you progress updates**
4. **Final report with recommendation**
5. **Implement winning version permanently**

---

**Any questions? Let me know!**

**Sue Holder**
Web Developer
sue@designdevelophost.co.uk
