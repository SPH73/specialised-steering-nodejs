# AEO Page Content Changes - For Future Implementation

**Branch:** `feature/aeo-full-content-test`
**Status:** Preserved for later testing/approval
**Date:** February 7, 2026

---

## Overview

This document lists all the page content (visible copy) changes made for AEO optimization. These changes are **NOT** part of the current meta description A/B test and are saved in a separate branch for future consideration.

**Current Status:**

- ❌ NOT deployed to production
- ✅ Saved in `feature/aeo-full-content-test` branch
- ⏳ Awaiting client review and approval

---

## Homepage Changes

### Hero Section (Header)

**Current (Client's Copy):**

```
H1: We do Hydraulics Best
H2: your first choice for hydraulic Repairs
P: We pride ourselves in customer satisfaction and will do our utmost to
   ensure we get you back up and running with minimal down time.
```

**Proposed (AEO Copy):**

```
H1: Hydraulic Component Repairs & Service Exchange
H2: Germiston, Gauteng hydraulic repairs for mining, agriculture &
    automotive equipment
P: Specialised Steering is an OEM repair workshop for pumps, motors,
   orbitrols/HMUs, valves, brakes, and cylinders. We focus on fast
   turnaround, documented inspection, and tested performance to OEM
   specification.
```

**Why Changed:**

- SEO keywords: "repairs", "service exchange", location
- Specificity: Lists actual services and location
- Search intent: Matches what customers search for

---

### Professional Section

**Current (Client's Copy):**

```
H2: Professional Hydraulic Engineers
P: We use our extensive technical knowledge with earth-moving and mining
   machinery and strong relationships with leading manufacturers to
   procure your hydraulic component requirements at competitive prices
   in the shortest time frames.
```

**Proposed (AEO Copy):**

```
H2: OEM Hydraulic Engineers & Component Sourcing
P: We repair and source hydraulic components for earth-moving and mining
   machinery, backed by manufacturer relationships and OEM documentation.
   Service exchange and component sourcing are available to reduce
   downtime.
```

**Why Changed:**

- Keywords: "OEM", "sourcing", "service exchange"
- Action-oriented: "repair and source" vs "procure"
- Benefit-focused: "reduce downtime"

---

### Customer Centric Section

**Current (Client's Copy):**

```
H2: Customer centric
P: We pride ourselves in customer satisfaction and will do our utmost to
   ensure your experience is easy and professional. We understand that
   down-time costs you time and money — our aim is to save you both with
   the most viable solution.

   We aim to be your preferred partner in hydraulics repairs and components.
```

**Proposed (AEO Copy):**

```
H2: Customer focused, downtime aware
P: We focus on practical solutions that get your equipment back to work
   quickly and cost-effectively. Expect clear communication, documented
   assessments, and straight advice on the most viable repair or exchange
   option.
```

**Why Changed:**

- Concise: Removed redundant statements
- Specific: "practical solutions", "documented assessments"
- Action-focused: Less aspirational, more concrete

---

### Repair Process Section

**Current (Client's Copy):**

```
Step 1: Strip & Assess
To strip and assess your unit for cause of failure.
Outline the corrective measures needed for repairs.

Step 2: Report & Quote
Provide and compile a comprehensive technical report that will give
you a visual of the finds of inspection.

Step 3: Assemble & Test
Our team will assemble and test unit to OEM specifications.
```

**Proposed (AEO Copy):**

```
Once booked in, we strip and inspect the unit, documenting findings
with images.

You receive a report covering wear, failure causes, and a repair
quotation.

We then repair, reassemble, and test the unit to OEM specification.

Customers are welcome to drop off and collect their components at our
Germiston repair shop. We accept couriered shipments if sent with a
works order.
```

**Why Changed:**

- Format: Paragraph vs numbered steps (more conversational)
- Added: Drop-off/shipping details (practical information)
- Simplified: Clearer, more direct language

---

### Our Work Section

**Current (Client's Copy):**

```
H2: OEM-Standard Hydraulic Repairs for Mining, Agriculture &
    Automotive Equipment
H3: Hydraulic Component Repairs to OEM Specification
P: OEM-standard hydraulic repairs that keep your machinery moving. We
   restore components for mining, agriculture, and automotive
   operations, with service exchange options available to cut downtime.
```

**Proposed (AEO Copy):**

```
H2: OEM-Standard Hydraulic Repairs & Service Exchange
H3: Hydraulic component repairs for mining, agriculture & automotive
    fleets
P: We restore pumps, motors, orbitrols/HMUs, valve banks, brakes, and
   cylinders to OEM specification. Every job is inspected, documented,
   repaired, and tested to keep critical equipment moving.
```

**Why Changed:**

- Specific components: Lists actual parts serviced
- Keywords: "Service Exchange", "fleets"
- Process emphasis: "inspected, documented, repaired, tested"

---

## Other Pages

Similar AEO-optimized changes were made to:

- About page
- Contact page
- Our Work page

(Full details available in git diff between branches)

---

## Recommendation

### Phase 1: Meta Description Test (Current)

- Test ONLY meta descriptions
- Keep client's page content
- Clean A/B test with single variable

### Phase 2: Content Approval (Next)

- Present both versions to client
- Show screenshots side-by-side
- Let client choose which changes to implement
- Could become Phase 2 A/B test

### Phase 3: Implementation

- Deploy approved content changes
- Monitor engagement metrics
- Measure impact on conversions

---

## Technical Details

**Preserved Branch:** `feature/aeo-full-content-test`

**To Review AEO Changes:**

```bash
git checkout feature/aeo-full-content-test
npm start
# Visit http://localhost:3300
```

**To Compare with Production:**

```bash
git diff origin/main feature/aeo-full-content-test -- views/
```

**To Deploy AEO Content (After Approval):**

```bash
git checkout feature/aeo-full-content-test
# Test thoroughly
git push origin feature/aeo-full-content-test
# Deploy to staging/production
```

---

## Questions for Client:

1. **Which changes resonate with your brand voice?**

   - More technical/specific vs aspirational?
   - Paragraph format vs numbered steps?

2. **Priority changes?**

   - Hero section (most visible)
   - Service descriptions
   - Process explanation

3. **Testing approach?**
   - Implement all at once?
   - A/B test content changes separately?
   - Phase in gradually?

---

**Sue Holder**
sue@designdevelophost.co.uk
February 7, 2026
