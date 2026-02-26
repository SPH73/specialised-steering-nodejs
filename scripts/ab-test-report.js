#!/usr/bin/env node
/**
 * A/B Test Reporting Script
 * Generates a report from A/B test logs
 * Usage: node scripts/ab-test-report.js [testId] [days]
 */

const { getStats, getRecentLogs } = require("../utils/ab-logger");
const { getActiveTests, AB_TESTS } = require("../utils/ab-testing");

async function generateReport(testId = null, days = 7) {
  console.log("========================================");
  console.log("A/B Test Report");
  console.log("========================================");
  console.log(`Period: Last ${days} days`);
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log("");

  // Get stats from logs
  const stats = await getStats(testId, days);

  if (Object.keys(stats).length === 0) {
    console.log("No A/B test data found for the specified period.");
    console.log("");
    console.log("Active tests:");
    const activeTests = getActiveTests();
    Object.keys(activeTests).forEach((key) => {
      const test = activeTests[key];
      console.log(`  - ${test.name} (${test.id})`);
      console.log(`    Routes: ${test.routes.join(", ")}`);
      console.log(`    Variants: ${test.variants.join(", ")}`);
    });
    return;
  }

  // Print stats for each test
  Object.keys(stats).forEach((testId) => {
    const test = AB_TESTS[testId];
    const testName = test ? test.name : testId;

    console.log(`Test: ${testName} (${testId})`);
    console.log("----------------------------------------");

    const variants = stats[testId];
    let totalExposures = 0;
    let totalConversions = 0;

    // Calculate totals
    Object.keys(variants).forEach((variant) => {
      totalExposures += variants[variant].exposures;
      totalConversions += variants[variant].conversions;
    });

    // Print variant stats
    Object.keys(variants).forEach((variant) => {
      const { exposures, conversions, ctr } = variants[variant];
      const exposurePercent =
        totalExposures > 0
          ? ((exposures / totalExposures) * 100).toFixed(1)
          : 0;

      console.log(`\nVariant ${variant}:`);
      console.log(`  Exposures: ${exposures} (${exposurePercent}%)`);
      console.log(`  Conversions: ${conversions}`);
      console.log(`  Conversion Rate: ${ctr}%`);
    });

    // Calculate statistical significance (basic chi-square test approximation)
    if (Object.keys(variants).length === 2) {
      const variantKeys = Object.keys(variants);
      const v1 = variants[variantKeys[0]];
      const v2 = variants[variantKeys[1]];

      const diff = Math.abs(parseFloat(v1.ctr) - parseFloat(v2.ctr));
      const avgCTR = (parseFloat(v1.ctr) + parseFloat(v2.ctr)) / 2;
      const relativeDiff = avgCTR > 0 ? (diff / avgCTR) * 100 : 0;

      console.log(`\nAnalysis:`);
      console.log(`  Total Exposures: ${totalExposures}`);
      console.log(`  Total Conversions: ${totalConversions}`);
      console.log(`  Overall Conversion Rate: ${totalExposures > 0 ? ((totalConversions / totalExposures) * 100).toFixed(2) : 0}%`);
      console.log(`  Absolute Difference: ${diff.toFixed(2)}%`);
      console.log(`  Relative Difference: ${relativeDiff.toFixed(1)}%`);

      // Simple significance heuristic (not statistically rigorous)
      if (totalExposures < 100) {
        console.log(
          `  Status: ⚠️  Insufficient data (need ~1000+ exposures per variant)`,
        );
      } else if (totalExposures < 1000) {
        console.log(`  Status: 📊 Early results (continue testing)`);
      } else if (relativeDiff > 10) {
        console.log(`  Status: ✅ Significant difference detected (>10% relative)`);
      } else {
        console.log(`  Status: ➡️  No significant difference yet`);
      }
    }

    console.log("");
  });

  console.log("========================================");
  console.log("Recent Activity (last 20 events)");
  console.log("========================================");
  const recentLogs = await getRecentLogs(20);
  recentLogs.forEach((log) => {
    console.log(
      `${log.timestamp} | ${log.eventType} | ${log.testId} | ${log.variant} | ${log.routeOrConversion}`,
    );
  });

  console.log("");
  console.log("For GA4 data, check:");
  console.log("  - Reports > Engagement > Events");
  console.log("  - Filter by: ab_exposure, ab_conversion");
  console.log("  - Custom dimensions: test_id, variant, conversion_type");
  console.log("");
}

// Parse command line arguments
const args = process.argv.slice(2);
const testId = args[0] || null;
const days = args[1] ? parseInt(args[1], 10) : 7;

// Run report
generateReport(testId, days).catch((err) => {
  console.error("Error generating report:", err);
  process.exit(1);
});
