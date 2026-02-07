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

**Minimum:** 2-4 weeks  
**Ideal:** Until we have 100+ conversions per variant

**Why wait?**
- Need enough visitors to see real patterns
- Too early = results might be random luck
- Industry standard: minimum 100 conversions per version

---

## How Will You Know Results?

I'll send you a report showing:

### Visual Dashboard:
```
Version A (AEO Copy)          Version B (Client Copy)
─────────────────             ─────────────────────
Visitors: 1,250               Visitors: 1,250
Form Submissions: 45          Form Submissions: 38
Conversion Rate: 3.6%         Conversion Rate: 3.0%

📊 Winner: Version A (+20% more conversions)
✅ Confidence: 95% (statistically significant)
```

### What It Means:
- **Clear winner identified**
- **Percentage improvement shown**
- **Recommendation provided** (keep A, B, or run longer)

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

## Questions?

**"Can I see both versions?"**
- Yes! Clear your browser cookies between visits
- Or use different browsers/devices
- Or ask me to send screenshots of both

**"Will this affect my Google ranking?"**
- No - Google doesn't penalize A/B testing
- Both versions are high-quality, relevant content
- It's about finding which performs BETTER

**"What if visitors don't like their version?"**
- They won't know there are two versions
- Both are professional, accurate copy
- We're measuring results, not opinions

**"Can we stop the test early?"**
- Yes, but results may not be valid
- Minimum 2 weeks + 100 conversions recommended
- I'll advise if we have enough data early

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
