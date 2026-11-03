# PLASTICO Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched under `/databases/{database}/documents` are denied (`allow read, write: if false;`).
2. **PII Isolation (Split Collection)**: `/users/{userId}` stores only public industrial profile attributes (`UserPublicProfile`), while PII (`email`, `phone`) is strictly isolated in `/users/{userId}/private/{docId}` (`UserPrivateInfo`) and readable/writable only by `isOwner(userId)` with `isValidId(userId) && isValidId(docId)`.
3. **Identity Integrity & Verified Email**: All mutations (`create`, `update`, `delete`) require a verified authenticated user (`request.auth != null && request.auth.token.email_verified == true`) and verify that `authorId == request.auth.uid` (or `uid == request.auth.uid`) and exists in `/users/$(request.auth.uid)` for relational records.
4. **Strict Keys & Anti-Update-Gap**: Every `create` and `update` invokes `isValid[Entity](incoming())` enforcing exact `hasAll` and `hasOnly` key sets, string `.size()` bounds, numeric bounds, and regex ID guards (`^[a-zA-Z0-9_\-]+$`).
5. **Immutable & Temporal Fields**: `createdAt == request.time` on `create`, `createdAt == existing().createdAt` and `updatedAt == request.time` on `update`, and `authorId == existing().authorId`.
6. **Terminal State Locking**: Once a `manufacturingRequests` document reaches `completed` or `cancelled`, or a `faults` document reaches `closed`, or a `jobs` document reaches `closed`, or a `marketListings` document reaches `archived`, no further updates are permitted.
7. **Zero Blanket List Queries**: Every `allow list` rule evaluates `existing().visibility == 'public' || existing().authorId == request.auth.uid` (or `existing().uid == request.auth.uid`) without any `get()` or `exists()` calls inside `list`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection (`users`)**: Adding `"isAdmin": true` to `/users/{userId}` on create/update -> `PERMISSION_DENIED` (blocked by `hasOnly`).
2. **Unverified Email Spoofing**: Authenticated user with `email_verified: false` attempting `create` on `/manufacturingRequests/{requestId}` -> `PERMISSION_DENIED`.
3. **Identity Spoofing on Create**: Creating `/faults/{faultId}` with `authorId: "victim-uid"` while authenticated as `"attacker-uid"` -> `PERMISSION_DENIED`.
4. **PII Cross-Read Attack**: Authenticated user `"attacker-uid"` attempting `get` on `/users/victim-uid/private/contact` -> `PERMISSION_DENIED`.
5. **Orphaned Relational Write**: Creating `/manufacturingRequests/{requestId}` when `/users/$(request.auth.uid)` does not exist -> `PERMISSION_DENIED`.
6. **Terminal State Re-opening**: Updating `/manufacturingRequests/{requestId}` when `existing().status == 'completed'` -> `PERMISSION_DENIED`.
7. **Immutable Field Mutation**: Updating `createdAt` or `authorId` on `/jobs/{jobId}` -> `PERMISSION_DENIED`.
8. **Client Timestamp Forgery**: Creating `/marketListings/{listingId}` with a past/future `createdAt != request.time` -> `PERMISSION_DENIED`.
9. **Denial-of-Wallet String Overflow**: Submitting `descriptionAr` with 5,000 characters (> max 2000) to `/faults/{faultId}` -> `PERMISSION_DENIED`.
10. **ID Poisoning Attack**: Creating a document with a malformed or oversized ID containing spaces/slashes -> `PERMISSION_DENIED`.
11. **Value Poisoning on Update**: Updating `status` on `/faults/{faultId}` to `"hacked_status"` outside the allowed enum -> `PERMISSION_DENIED`.
12. **Unauthorized Private List Scraping**: Querying private documents belonging to another user without matching `visibility == 'public'` or `authorId == request.auth.uid` -> `PERMISSION_DENIED`.
