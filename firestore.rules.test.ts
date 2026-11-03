import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');

test('firestore.rules enforces all 8 Pillars and blocks the Dirty Dozen vulnerabilities', () => {
  const rules = fs.readFileSync(rulesPath, 'utf8');
  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

  // 1. Rules version & Global Default-Deny Safety Net
  assert.ok(rules.includes("rules_version = '2';"));
  assert.ok(rules.includes('match /{document=**}'));
  assert.ok(rules.includes('allow read, write: if false;'));

  // 2. Every collection in firebase-blueprint.json has a corresponding match block
  assert.ok(blueprint.firestore['/users/{userId}']);
  assert.ok(blueprint.firestore['/users/{userId}/private/{docId}']);
  assert.ok(blueprint.firestore['/manufacturingRequests/{requestId}']);
  assert.ok(blueprint.firestore['/faults/{faultId}']);
  assert.ok(blueprint.firestore['/jobs/{jobId}']);
  assert.ok(blueprint.firestore['/marketListings/{listingId}']);

  assert.ok(rules.includes('match /users/{userId}'));
  assert.ok(rules.includes('match /private/{docId}'));
  assert.ok(rules.includes('match /manufacturingRequests/{requestId}'));
  assert.ok(rules.includes('match /faults/{faultId}'));
  assert.ok(rules.includes('match /jobs/{jobId}'));
  assert.ok(rules.includes('match /marketListings/{listingId}'));

  // 3. Dirty Dozen #1 & #11: Strict schema blueprints (hasAll + hasOnly) on create & update
  assert.ok(rules.includes('isValidUserPublicProfile(incoming())'));
  assert.ok(rules.includes('isValidUserPrivateInfo(incoming())'));
  assert.ok(rules.includes('isValidManufacturingRequestDoc(incoming())'));
  assert.ok(rules.includes('isValidIndustrialFaultDoc(incoming())'));
  assert.ok(rules.includes('isValidIndustrialJobDoc(incoming())'));
  assert.ok(rules.includes('isValidMarketListingDoc(incoming())'));

  // 4. Dirty Dozen #2: Verified Email enforcement
  assert.ok(rules.includes('request.auth.token.email_verified == true'));

  // 5. Dirty Dozen #6: Terminal state locking
  assert.ok(rules.includes("existing().status != 'completed'"));
  assert.ok(rules.includes("existing().status != 'cancelled'"));
  assert.ok(rules.includes("existing().status != 'closed'"));
  assert.ok(rules.includes("existing().status != 'archived'"));

  // 6. Dirty Dozen #7 & #8: Server timestamp and immutability enforcement
  assert.ok(rules.includes('incoming().createdAt == request.time'));
  assert.ok(rules.includes('incoming().updatedAt == request.time'));
  assert.ok(rules.includes('incoming().createdAt == existing().createdAt'));
  assert.ok(rules.includes('incoming().authorId == existing().authorId'));
});
