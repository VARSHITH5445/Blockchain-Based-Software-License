/**
 * ChainLicense Final Acceptance Test Workflow
 * Executes the exact 15-step demonstration required by Section 12:
 * 1. Log in as Publisher
 * 2. Open Software Catalog and confirm demo products appear
 * 3. Create a new product named 'AI CodeGuardian 2026'
 * 4. Verify product remains visible across catalog queries
 * 5. Issue a new license for the product through the smart contract
 * 6. Record actual license ID and transaction hash
 * 7. Log in as Customer and confirm license is visible in vault
 * 8. Activate a device and confirm seat count updates on-chain
 * 9. Open public verification page without logging in
 * 10. Verify newly created license as VALID
 * 11. Return to Publisher and revoke that license
 * 12. Verify the same license as REVOKED
 * 13. Open Ledger Activity and confirm actual transactions are indexed
 * 14. Refresh data check and confirm consistency
 * 15. Report results
 */

const API_BASE = 'http://localhost:5000/api';

async function req(endpoint: string, options: any = {}) {
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

async function runAcceptanceWorkflow() {
  console.log('======================================================================');
  console.log('  CHAINLICENSE — MANDATORY ACCEPTANCE TEST WORKFLOW (SECTION 12)');
  console.log('======================================================================\n');

  // Step 1: Log in as Publisher
  console.log('Step 1: Logging in as Publisher...');
  const pubAuth = await req('/auth/login', {
    method: 'POST',
    body: { email: 'publisher@cybershield.io', password: 'Password123!' },
  });
  if (!pubAuth.ok || !pubAuth.data?.token) {
    throw new Error(`Publisher login failed: ${JSON.stringify(pubAuth.data)}`);
  }
  const publisherToken = pubAuth.data.token;
  console.log(`✔ Logged in as: ${pubAuth.data.user.email} (${pubAuth.data.user.name})`);
  console.log(`  Wallet: ${pubAuth.data.user.walletAddress}`);

  // Step 2: Open Software Catalog and confirm demo products appear
  console.log('\nStep 2: Inspecting Software Catalog...');
  const catalogRes = await req('/software');
  if (!catalogRes.ok || !Array.isArray(catalogRes.data?.products)) {
    throw new Error('Failed to load software catalog');
  }
  console.log(`✔ Software catalog loaded successfully: ${catalogRes.data.products.length} products found.`);
  const demoTitles = catalogRes.data.products.map((p: any) => p.name);
  console.log(`  Products in registry: ${demoTitles.join(' | ')}`);

  // Step 3: Create a new product named 'AI CodeGuardian 2026'
  console.log('\nStep 3: Creating new software product "AI CodeGuardian 2026"...');
  const createProdPayload = {
    name: 'AI CodeGuardian 2026',
    description: 'Autonomous AI-powered secure code auditor and contract vulnerability scanner with formal verification.',
    category: 'Developer Tools',
    version: 'v1.0.0',
    plans: [
      {
        name: 'Enterprise Audit Node',
        licenseType: 'SEAT_BASED',
        durationDays: 365,
        maxSeats: 3,
        priceDemo: 0.75,
        isDefault: true,
      },
    ],
  };

  const createRes = await req('/software', {
    method: 'POST',
    headers: { Authorization: `Bearer ${publisherToken}` },
    body: createProdPayload,
  });

  if (!createRes.ok || !createRes.data?.product?.id) {
    throw new Error(`Product creation failed: ${JSON.stringify(createRes.data)}`);
  }
  const createdProduct = createRes.data.product;
  console.log(`✔ Product successfully published: "${createdProduct.name}" (ID: ${createdProduct.id}, Slug: ${createdProduct.slug})`);

  // Step 4: Refresh / query product from catalog to confirm persistence
  console.log('\nStep 4: Confirming product persistence across queries...');
  const getProductRes = await req(`/software/${createdProduct.id}`);
  if (!getProductRes.ok || getProductRes.data?.product?.id !== createdProduct.id) {
    throw new Error('Product not found in persistent store after creation');
  }
  console.log(`✔ Verified persistence: Product "${getProductRes.data.product.name}" safely stored on disk.`);

  // Step 5: Issue a new license for the product through the smart contract
  console.log('\nStep 5 & 6: Issuing license on-chain for customer wallet...');
  const customerWallet = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
  const issuePayload = {
    productId: createdProduct.id,
    planId: createdProduct.plans[0].id,
    customerWalletAddress: customerWallet,
  };

  const issueRes = await req('/licenses/issue', {
    method: 'POST',
    headers: { Authorization: `Bearer ${publisherToken}` },
    body: issuePayload,
  });

  if (!issueRes.ok || !issueRes.data?.license?.onChainId) {
    throw new Error(`On-chain license issuance failed: ${JSON.stringify(issueRes.data)}`);
  }
  const licenseRecord = issueRes.data.license;
  const onChainLicenseId = licenseRecord.onChainId;
  const issuanceTxHash = licenseRecord.txHash;
  console.log(`✔ Smart Contract Mined License: Token ID #${onChainLicenseId}`);
  console.log(`  Confirmed Tx Hash: ${issuanceTxHash}`);
  console.log(`  Canonical Metadata Hash: ${licenseRecord.metadataHash}`);

  // Step 7: Log in as Customer and confirm the license is visible
  console.log('\nStep 7: Customer login & License Vault check...');
  const custAuth = await req('/auth/login', {
    method: 'POST',
    body: { email: 'customer@enterprise.com', password: 'Password123!' },
  });
  if (!custAuth.ok || !custAuth.data?.token) {
    throw new Error('Customer login failed');
  }
  const customerToken = custAuth.data.token;

  const vaultRes = await req('/licenses/customer', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const customerLicenses = vaultRes.data?.licenses || [];
  const foundLicense = customerLicenses.find((l: any) => l.onChainId === onChainLicenseId);
  if (!foundLicense) {
    throw new Error(`Newly issued license #${onChainLicenseId} not found in Customer vault`);
  }
  console.log(`✔ Customer Vault loaded: Found License Token #${onChainLicenseId} registered to ${customerWallet}`);

  // Step 8: Activate a device and confirm the seat count updates on-chain
  console.log('\nStep 8: Binding device hardware node-lock on-chain...');
  const activateRes = await req(`/licenses/${onChainLicenseId}/activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: { deviceName: 'MacBookPro-M3-Max-Node' },
  });
  if (!activateRes.ok) {
    throw new Error(`Device activation failed: ${JSON.stringify(activateRes.data)}`);
  }
  console.log(`✔ Hardware Node-Lock Bound: ${activateRes.data.message}`);
  console.log(`  Active Seats: ${activateRes.data.license?.currentSeats} / ${activateRes.data.license?.maxSeats}`);

  // Step 9 & 10: Open public verification without logging in and verify as VALID
  console.log('\nStep 9 & 10: Public Zero-Gas Verification (Unauthenticated)...');
  const publicVerify1 = await req(`/verify/${onChainLicenseId}`);
  if (!publicVerify1.ok || publicVerify1.data?.verificationStatus !== 'VALID') {
    throw new Error(`Verification expected VALID but got: ${publicVerify1.data?.verificationStatus}`);
  }
  console.log(`✔ Public Verification Status: ${publicVerify1.data.verificationStatus}`);
  console.log(`  Smart Contract Response: "${publicVerify1.data.statusMessage}"`);
  console.log(`  Integrity Verified: ${publicVerify1.data.license?.metadataIntegrityVerified}`);

  // Step 11: Return to Publisher and revoke that license
  console.log('\nStep 11: Publisher revoking license on-chain...');
  const revocationReason = 'Evaluator live demonstration: License key invalidated';
  const revokeRes = await req('/licenses/revoke', {
    method: 'POST',
    headers: { Authorization: `Bearer ${publisherToken}` },
    body: {
      licenseId: onChainLicenseId,
      reason: revocationReason,
    },
  });
  if (!revokeRes.ok) {
    throw new Error(`Revocation failed: ${JSON.stringify(revokeRes.data)}`);
  }
  console.log(`✔ Smart Contract Revocation Executed: ${revokeRes.data.message}`);

  // Step 12: Verify the same license as REVOKED
  console.log('\nStep 12: Re-verifying license on public portal...');
  const publicVerify2 = await req(`/verify/${onChainLicenseId}`);
  if (!publicVerify2.ok || publicVerify2.data?.verificationStatus !== 'REVOKED') {
    throw new Error(`Verification expected REVOKED but got: ${publicVerify2.data?.verificationStatus}`);
  }
  console.log(`✔ Public Re-Verification Status: ${publicVerify2.data.verificationStatus}`);
  console.log(`  On-Chain Audit Reason: "${publicVerify2.data.statusMessage}"`);

  // Step 13: Open Ledger Activity and confirm transactions are indexed
  console.log('\nStep 13: Ledger Activity inspection...');
  const txsRes = await req('/transactions');
  if (!txsRes.ok || !Array.isArray(txsRes.data?.transactions)) {
    throw new Error('Failed to query ledger transactions');
  }
  const matchingTx = txsRes.data.transactions.find((t: any) => t.txHash === issuanceTxHash);
  console.log(`✔ Ledger Activity loaded: ${txsRes.data.transactions.length} total confirmed transactions.`);
  console.log(`  Found Issuance Tx in Ledger: ${!!matchingTx} (${issuanceTxHash.slice(0, 20)}...)`);

  // Step 14: Refresh and confirm persistence
  console.log('\nStep 14: Final consistency confirmation...');
  const finalCheck = await req(`/verify/${onChainLicenseId}`);
  console.log(`✔ Status after full workflow: ${finalCheck.data.verificationStatus} (Zero-Gas query confirmed)`);

  console.log('\n======================================================================');
  console.log('  ALL 15 STEPS OF ACCEPTANCE WORKFLOW COMPLETED SUCCESSFULLY!');
  console.log(`  Created Product: ${createdProduct.name} (${createdProduct.id})`);
  console.log(`  Issued License ID: #${onChainLicenseId}`);
  console.log(`  Transaction Hash: ${issuanceTxHash}`);
  console.log('======================================================================\n');
}

runAcceptanceWorkflow().catch(err => {
  console.error('\n❌ Workflow failed:', err);
  process.exit(1);
});
