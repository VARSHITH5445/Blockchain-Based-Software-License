/**
 * Comprehensive End-to-End Integration and Functional Test Suite
 * Tests authentication, on-chain verification, dynamic CRUD, license issuance,
 * hardware activation, revocation, and data persistence.
 */

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint: string, options: any = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data: any = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

let publisherToken = '';
let customerToken = '';
let adminToken = '';

async function runTests() {
  console.log('===============================================================');
  console.log('  ChainLicense End-to-End Integration & Verification Tests');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  ✔ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Health Endpoint Test
  // ---------------------------------------------------------------------------
  console.log('1. Health Check Endpoint');
  const healthRes = await request('/health');
  assert(healthRes.status === 200 && healthRes.data?.status === 'ONLINE', 'API service is healthy and online');

  // ---------------------------------------------------------------------------
  // 2. Authentication & Test Personas
  // ---------------------------------------------------------------------------
  console.log('\n2. User Authentication (3 Personas)');
  
  // Publisher login
  const pubLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'publisher@cybershield.io', password: 'Password123!' },
  });
  assert(pubLogin.status === 200 && !!pubLogin.data?.token, 'Publisher login successful', pubLogin.data?.user?.email);
  publisherToken = pubLogin.data?.token || '';

  // Customer login
  const custLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'customer@enterprise.com', password: 'Password123!' },
  });
  assert(custLogin.status === 200 && !!custLogin.data?.token, 'Customer login successful', custLogin.data?.user?.email);
  customerToken = custLogin.data?.token || '';

  // Admin login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@licensechain.org', password: 'Password123!' },
  });
  assert(adminLogin.status === 200 && !!adminLogin.data?.token, 'Admin login successful', adminLogin.data?.user?.email);
  adminToken = adminLogin.data?.token || '';

  // Invalid password rejection
  const invalidLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'publisher@cybershield.io', password: 'WrongPassword!' },
  });
  assert(invalidLogin.status === 401, 'Rejects invalid login credentials');

  // ---------------------------------------------------------------------------
  // 3. Software Catalog Verification (5 Realistic Products)
  // ---------------------------------------------------------------------------
  console.log('\n3. Software Catalog Inspection');
  const catRes = await request('/software');
  assert(catRes.status === 200, 'Catalog endpoint returned HTTP 200');
  assert(catRes.data?.products?.length >= 5, 'Contains at least 5 software products', `Found: ${catRes.data?.products?.length}`);

  const requiredSlugs = ['devide-studio', 'securevault-pro', 'cloudsync-manager', 'designflow-studio', 'datalens-analytics'];
  const loadedSlugs = (catRes.data?.products || []).map((p: any) => p.slug);
  const allSlugsPresent = requiredSlugs.every(s => loadedSlugs.includes(s));
  assert(allSlugsPresent, 'All 5 realistic software packages exist', loadedSlugs.join(', '));

  // ---------------------------------------------------------------------------
  // 4. Zero-Gas Smart Contract Public Verification (On-Chain)
  // ---------------------------------------------------------------------------
  console.log('\n4. Smart Contract Zero-Gas Public Verification');

  // License #1001 - Perpetual (VALID)
  const v1001 = await request('/verify/1001');
  assert(
    v1001.data?.verificationStatus === 'VALID' && v1001.data?.blockchainReachable === true,
    'License #1001 is VALID on blockchain',
    `Status: ${v1001.data?.verificationStatus}, Integrity: ${v1001.data?.license?.metadataIntegrityVerified}`
  );

  // License #1002 - Seat-based (VALID)
  const v1002 = await request('/verify/1002');
  assert(v1002.data?.verificationStatus === 'VALID', 'License #1002 is VALID on blockchain');

  // License #1003 - Subscription Active (VALID)
  const v1003 = await request('/verify/1003');
  assert(v1003.data?.verificationStatus === 'VALID', 'License #1003 is VALID on blockchain');

  // License #1004 - Short-Duration Expired (EXPIRED)
  const v1004 = await request('/verify/1004');
  assert(
    v1004.data?.verificationStatus === 'EXPIRED',
    'License #1004 is genuinely EXPIRED on blockchain',
    `Status: ${v1004.data?.verificationStatus}`
  );

  // License #1005 - Leaked Key Revoked (REVOKED)
  const v1005 = await request('/verify/1005');
  assert(
    v1005.data?.verificationStatus === 'REVOKED' && v1005.data?.license?.revocationReason?.includes('piracy'),
    'License #1005 is REVOKED on blockchain with immutable reason',
    `Reason: "${v1005.data?.license?.revocationReason}"`
  );

  // License #9999 - Non-Existent (INVALID / NOT FOUND)
  const v9999 = await request('/verify/9999');
  assert(
    v9999.data?.verificationStatus === 'INVALID / NOT FOUND',
    'License #9999 returns INVALID / NOT FOUND',
    `Status: ${v9999.data?.verificationStatus}`
  );

  // ---------------------------------------------------------------------------
  // 5. Dynamic Data Creation: New Product Creation
  // ---------------------------------------------------------------------------
  console.log('\n5. Dynamic Product Creation (Publisher CRUD)');
  const newProductPayload = {
    name: 'MyTestSoftware Enterprise',
    description: 'Dynamic enterprise test software suite created at runtime to verify end-to-end CRUD persistence.',
    category: 'Developer Tools',
    version: 'v1.0.0',
    plans: [
      {
        name: 'Single Node Pro',
        licenseType: 'PERPETUAL',
        durationDays: 0,
        maxSeats: 1,
        priceDemo: 0.15,
        isDefault: true,
      },
      {
        name: 'Enterprise Cluster (3 Nodes)',
        licenseType: 'SEAT_BASED',
        durationDays: 365,
        maxSeats: 3,
        priceDemo: 0.35,
        isDefault: false,
      }
    ]
  };

  const createProdRes = await request('/software', {
    method: 'POST',
    headers: { Authorization: `Bearer ${publisherToken}` },
    body: newProductPayload,
  });

  assert(createProdRes.status === 201 && !!createProdRes.data?.product?.id, 'New product created via API', createProdRes.data?.product?.name);
  const createdProductId = createProdRes.data?.product?.id;
  const createdPlanId = createProdRes.data?.product?.plans?.[0]?.id;

  // ---------------------------------------------------------------------------
  // 6. Dynamic License Issuance On-Chain
  // ---------------------------------------------------------------------------
  console.log('\n6. Real Smart Contract License Issuance');
  const issuePayload = {
    productId: createdProductId,
    planId: createdPlanId,
    customerWalletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  };

  const issueRes = await request('/licenses/issue', {
    method: 'POST',
    headers: { Authorization: `Bearer ${publisherToken}` },
    body: issuePayload,
  });

  assert(issueRes.status === 201, 'Issued license through smart contract', `On-Chain ID: #${issueRes.data?.license?.onChainId}`);
  const newLicenseId = issueRes.data?.license?.onChainId;
  const newLicenseTx = issueRes.data?.license?.txHash;

  // ---------------------------------------------------------------------------
  // 7. Verify Newly Issued License On-Chain
  // ---------------------------------------------------------------------------
  console.log('\n7. Public Zero-Gas Verification of Newly Issued License');
  const newVerifyRes = await request(`/verify/${newLicenseId}`);
  assert(
    newVerifyRes.data?.verificationStatus === 'VALID',
    `Newly minted license #${newLicenseId} verified as VALID on blockchain`,
    `Tx: ${newLicenseTx?.slice(0, 18)}...`
  );

  // ---------------------------------------------------------------------------
  // 8. Dynamic Device Activation On-Chain
  // ---------------------------------------------------------------------------
  console.log('\n8. Hardware Node-Locking Device Activation');
  const actRes = await request(`/licenses/${newLicenseId}/activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: {
      deviceName: 'Workstation-Testing-Node-1',
    },
  });
  assert(actRes.status === 200, `Device activated for license #${newLicenseId}`, actRes.data?.message);

  // ---------------------------------------------------------------------------
  // 9. Dynamic License Revocation On-Chain
  // ---------------------------------------------------------------------------
  console.log('\n9. Smart Contract License Revocation');
  const revokeRes = await request('/licenses/revoke', {
    method: 'POST',
    headers: { Authorization: `Bearer ${publisherToken}` },
    body: {
      licenseId: newLicenseId,
      reason: 'Automated test revocation: Key invalidated during verification test',
    },
  });

  assert(revokeRes.status === 200, `License #${newLicenseId} revoked on-chain`, revokeRes.data?.message);

  // ---------------------------------------------------------------------------
  // 10. Re-verify Revoked License
  // ---------------------------------------------------------------------------
  console.log('\n10. Public Re-Verification of Revoked License');
  const reVerifyRes = await request(`/verify/${newLicenseId}`);
  assert(
    reVerifyRes.data?.verificationStatus === 'REVOKED',
    `License #${newLicenseId} now immediately reports REVOKED on blockchain`,
    `Reason: "${reVerifyRes.data?.statusMessage}"`
  );

  // ---------------------------------------------------------------------------
  // 11. Customer Vault Inspection
  // ---------------------------------------------------------------------------
  console.log('\n11. Customer License Vault');
  const custVault = await request('/licenses/customer', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(custVault.status === 200 && custVault.data?.licenses?.length > 0, 'Customer vault lists owned licenses', `Total: ${custVault.data?.licenses?.length}`);

  // ---------------------------------------------------------------------------
  // 12. Admin Management & Audit Logs
  // ---------------------------------------------------------------------------
  console.log('\n12. Admin Console & Audit Ledger');
  const adminMetrics = await request('/admin/metrics', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminMetrics.status === 200, 'Admin metrics loaded', `Users: ${adminMetrics.data?.metrics?.totalUsers}, Licenses: ${adminMetrics.data?.metrics?.totalLicenses}`);

  const auditLogs = await request('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(auditLogs.status === 200 && auditLogs.data?.logs?.length > 0, 'Audit logs recorded state transitions', `Total entries: ${auditLogs.data?.logs?.length}`);

  // ---------------------------------------------------------------------------
  // 13. Public Ledger Activity / Transactions Endpoint
  // ---------------------------------------------------------------------------
  console.log('\n13. Public Blockchain Transactions Ledger');
  const txRes = await request('/transactions');
  assert(txRes.status === 200, 'Public /transactions endpoint returns HTTP 200 without login');
  assert(txRes.data?.transactions?.length > 0, 'Ledger contains indexed confirmed transactions', `Total: ${txRes.data?.transactions?.length}`);

  // ---------------------------------------------------------------------------
  // 14. Role-Based Authorization & Security Controls
  // ---------------------------------------------------------------------------
  console.log('\n14. Security & Role-Based Access Controls');
  const noTokenRes = await request('/software', {
    method: 'POST',
    body: { name: 'Hacker Tool', description: 'Unauthorized creation attempt', category: 'Security Software', plans: [] },
  });
  assert(noTokenRes.status === 401, 'Rejects product creation when no JWT token provided');

  const custCreateRes = await request('/software', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: { name: 'Customer Tool', description: 'Customer should not create products', category: 'Security Software', plans: [] },
  });
  assert(custCreateRes.status === 403, 'Rejects product creation when caller is CUSTOMER role (403 Forbidden)');

  // ---------------------------------------------------------------------------
  // 15. Category & Search Filtering Robustness
  // ---------------------------------------------------------------------------
  console.log('\n15. Catalog Filtering & Search Robustness');
  const catFilterRes = await request('/software?category=Security+Software');
  assert(catFilterRes.status === 200 && catFilterRes.data?.products?.length > 0, 'Category filter returns matching products', `Found: ${catFilterRes.data?.products?.length}`);

  const searchFilterRes = await request('/software?search=DevIDE');
  assert(searchFilterRes.status === 200 && searchFilterRes.data?.products?.some((p: any) => p.name.includes('DevIDE')), 'Search filter finds DevIDE Studio');

  const safeUndefinedRes = await request('/software?category=undefined&search=undefined');
  assert(safeUndefinedRes.status === 200 && safeUndefinedRes.data?.products?.length >= 5, 'Safely ignores stringified "undefined" parameters');
  console.log(`  Test Suite Completed: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
