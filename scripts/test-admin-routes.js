#!/usr/bin/env node
/**
 * Test script for admin routes
 * Usage: node scripts/test-admin-routes.js
 * 
 * Prerequisites:
 * - Server must be running (npm start)
 * - ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env
 */

require('dotenv').config();
const http = require('http');

const SERVER_PORT = process.env.PORT || 3300;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

const auth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAdminRoutes() {
  console.log('🧪 Testing Admin Routes');
  console.log('='.repeat(60));
  console.log('');

  let passed = 0;
  let failed = 0;

  // Test 1: Without credentials (should return 401)
  console.log('Test 1: POST /admin/google/photos/sessions (no credentials)');
  try {
    const result = await httpRequest({
      hostname: 'localhost',
      port: SERVER_PORT,
      path: '/admin/google/photos/sessions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (result.status === 401) {
      console.log('   ✅ PASS - Returns 401 Unauthorized');
      passed++;
    } else {
      console.log(`   ❌ FAIL - Expected 401, got ${result.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ ERROR - ${err.message}`);
    failed++;
  }
  console.log('');

  // Test 2: With credentials (should create session)
  console.log('Test 2: POST /admin/google/photos/sessions (with credentials)');
  let sessionId = null;
  try {
    const result = await httpRequest({
      hostname: 'localhost',
      port: SERVER_PORT,
      path: '/admin/google/photos/sessions',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (result.status === 200 && result.body.sessionId) {
      sessionId = result.body.sessionId;
      console.log('   ✅ PASS - Session created');
      console.log(`   Session ID: ${sessionId}`);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      console.log(`   Response:`, result.body);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ ERROR - ${err.message}`);
    failed++;
  }
  console.log('');

  if (!sessionId) {
    console.log('⚠️  Cannot continue tests without session ID');
    console.log('');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  }

  // Test 3: Get session status
  console.log('Test 3: GET /admin/google/photos/sessions/:id/status');
  try {
    const result = await httpRequest({
      hostname: 'localhost',
      port: SERVER_PORT,
      path: `/admin/google/photos/sessions/${sessionId}/status`,
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    if (result.status === 200 && result.body.id === sessionId) {
      console.log('   ✅ PASS - Status retrieved');
      console.log(`   Media items set: ${result.body.mediaItemsSet || false}`);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      console.log(`   Response:`, result.body);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ ERROR - ${err.message}`);
    failed++;
  }
  console.log('');

  // Test 4: Ingest (empty session - should handle gracefully)
  console.log('Test 4: POST /admin/google/photos/sessions/:id/ingest (empty session)');
  try {
    const result = await httpRequest({
      hostname: 'localhost',
      port: SERVER_PORT,
      path: `/admin/google/photos/sessions/${sessionId}/ingest`,
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (result.status === 200 && typeof result.body.ingested === 'number') {
      console.log('   ✅ PASS - Endpoint works (empty session handled)');
      console.log(`   Ingested: ${result.body.ingested}, Skipped: ${result.body.skipped || 0}`);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}`);
      console.log(`   Response:`, result.body);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ ERROR - ${err.message}`);
    failed++;
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('');
  
  if (failed === 0) {
    console.log('✅ All tests passed!');
    console.log('');
    console.log('ℹ️  Note: Full ingestion tests with actual media items require Phase 4 Admin UI');
  } else {
    console.log('❌ Some tests failed');
  }
  console.log('');
  
  process.exit(failed > 0 ? 1 : 0);
}

testAdminRoutes().catch((err) => {
  console.error('❌ Test error:', err.message);
  process.exit(1);
});

