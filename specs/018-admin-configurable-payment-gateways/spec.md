# Phase 18 — Admin-configurable Iranian payment gateways

**Status:** Clarified and implemented: Zarinpal and Zibal are live
providers; Pasargad is shown as deferred in the admin UI but has no credential,
enablement, or checkout path. The lifecycle prerequisite is revalidated.

## Why

Tuition and shop checkout currently dispatch directly to Zarinpal. The phase
will allow administrators to configure Zarinpal and Zibal without exposing
gateway credentials, while preserving existing payment, inventory, expiry,
and manual-refund invariants. Pasargad is deferred until its official
product/API contract can be verified.

## User stories

- As a student or shopper, I can pay through enabled, fully configured
  Zarinpal or Zibal.
- As an administrator, I can configure, enable, disable, and choose the
  default between Zarinpal and Zibal without retrieving stored credentials.
- As an administrator, I can see that Pasargad is deferred without controls
  that imply checkout is supported.
- As an operator, I can reliably identify and diagnose the provider and
  outcome for each payment without applying a payment twice.

## Clarified requirements

- **FR-18.1 — Separate typed adapters:** Retain Zarinpal and add a distinct
  Zibal adapter behind one server-side checkout/verification contract.
  Zibal's confirmed product is its Internet Payment Gateway (IPG). Do not add
  a Pasargad adapter or checkout path in this phase.
- **FR-18.2 — Admin configuration and secret handling:** An admin-only,
  Zod-validated configuration surface manages provider credentials,
  enablement, and the default. Checkout only accepts enabled, fully configured
  providers. Persist credentials only as authenticated encryption using a
  dedicated deployment-managed `PAYMENT_CONFIG_ENCRYPTION_KEY`; fail closed
  for writes, reads/decryption, and checkout if it is absent or invalid. Never
  persist plaintext as a fallback, return secret material in HTML/API
  responses, or log credentials or decrypted configuration. Admin reads expose
  configured/masked metadata only; replacement and clear operations do not
  retrieve the old value and are blocked only while provider transactions are
  within the callback window. That window extends one longest configured
  checkout lifetime beyond `expiresAt`; when expiration is absent, `createdAt`
  is used as the timestamp fallback.
- **FR-18.3 — Stable payment identity:** Persist an explicit provider identity
  on every tuition payment and shop order. Preserve existing Zarinpal
  references and pending transactions during migration; never reinterpret a
  reference or authority as a different provider's identifier.
- **FR-18.4 — Lifecycle and amounts:** Keep units explicit: shop amounts stay
  toman in storage; tuition `Payment.amount` remains rial; convert only at the
  adapter boundary as required by the verified provider contract. Verify
  callbacks server-side against the persisted provider, expected amount, and
  transaction. Success, cancellation, failure, duplicate callbacks, expiry,
  late success, and `REFUND_REQUIRED` handling must remain idempotent for both
  tuition and shop. Do not call any refund API; staff continue refunds outside
  the application and use the existing queue.
- **FR-18.5 — Deterministic provider tests:** Mock outbound HTTP at the
  Zarinpal and Zibal adapter boundaries. Cover request shape, response
  parsing, transport/provider errors, invalid references, amount mismatch,
  and verification failure. For both active providers, cover tuition credit
  and shop settlement exactly once, cancellation/failure, expired/late verified
  payment, repeated callback, and refund-required handling. Assert the API
  rejects Pasargad configuration/enablement and the UI has no Pasargad enable
  control. Unit/integration tests must not need live credentials or network
  access.
- **FR-18.6 — Evidence and operations:** Record a provider-by-provider
  checkout, verification, callback, and post-payment test matrix. Document
  required environment configuration, secret-key provisioning, units, and
  operational behavior. External sandbox checks are optional and must not be
  required in CI.

## Lifecycle prerequisite audit

The Phase 3–5 dependency is **revalidated as passing** against the current
checkout. On 2026-11-05, this command passed: 5 test files, 30 tests, 0
failures:

```text
npm test -- --run
  src/__tests__/pages/api/student/payments.test.ts
  src/__tests__/pages/api/student/payment-callback.test.ts
  src/__tests__/pages/api/shop/orders/callback.test.ts
  src/__tests__/lib/shop.test.ts
  src/__tests__/pages/api/admin/refunds.test.ts
```

Implementation evidence:

- Tuition checkout uses `CHECKOUT_TTL_MS` (15 minutes), marks expired
  pending Zarinpal payments `FAILED`, and creates payments with `expiresAt`.
- Tuition callback verifies the provider amount and current persisted state;
  verified expired payments become `REFUND_REQUIRED` without increasing
  registration `paidAmount`.
- Shop expiry, cancellation, and provider-failure paths use
  `releaseOrderReservation`; its conditional decrement requires
  `reserved >= quantity` and throws on mismatch. Callback state checks cover
  repeated and late callbacks so settled/refund-required orders do not release
  or decrement inventory twice.
- The admin refund route lists only `REFUND_REQUIRED` payments/orders and
  conditionally marks them `REFUNDED` after external handling. No gateway
  refund call is made.

The test run revalidated these cases in this worktree; the Phase 3–5
convergence files also record earlier broader test/typecheck/lint results.
This audit authorizes provider dispatch changes for the confirmed Zarinpal and
Zibal products.

## Provider documentation and deferred integration

Official Zibal documentation was verified on 2026-11-05:

- The provider help site, <https://help.zibal.ir/#docs>, links to the official
  IPG API page at <https://help.zibal.ir/ipg/>. Its WordPress API page record
  is <https://help.zibal.ir/wp-json/wp/v2/pages/999?_fields=title,link,content>.
- The page embeds the official OpenAPI definition at
  <https://api.zibal.ir/static/helpdocs/ipg.json>. Its server is
  `https://gateway.zibal.ir`.
- `POST /v1/request` requires JSON `merchant` (string), `amount` (integer,
  **rial**), and `callbackUrl`; optional fields include `description` and
  `orderId`. A successful request supplies `trackId`; `result: 100` is the
  documented successful request. The docs explicitly use `merchant: "zibal"`
  for testing.
- The browser payment URL is `GET /start/{trackId}` on the gateway host; the
  browser must send a `Referer` whose domain matches the merchant's registered
  website. Normal browser navigation sends this automatically.
- The callback is a GET query string with `success`, `trackId`, optional
  `orderId`, and `status`. `success=1` is not proof of payment: the official
  docs require `POST /v1/verify` with JSON `merchant` and integer `trackId`.
  Verification returns `result`, `status`, and `amount` (rial). Official
  result codes identify `100` as successful, `201` as already verified, and
  `202` as unpaid or failed. The implementation must accept verified results
  `100`/`201` only with paid status and exact expected rial amount before
  applying a payment.
- The docs do not specify a separate bearer/basic-auth scheme; the `merchant`
  JSON field is the authentication credential. Persist it as an encrypted
  secret, including the test value if ever used outside mocks.

The official PEP page requested for Pasargad,
<https://pep.co.ir/ipg/>, returned HTTP 403 in this research environment. The
exact Pasargad product, API endpoints, credential fields,
callback/verification contract, and merchant-account readiness remain
unverified. Phase 18 must not configure, enable, or dispatch Pasargad. The
admin page may show a clearly labeled deferred/disabled informational row with
no credential or enable controls; the API must reject `PASARGAD` mutations and
checkout must never select it.

Before deploying configured database credentials, the operator must provision
`PAYMENT_CONFIG_ENCRYPTION_KEY` in the deployment secret manager. The
implementation contract is a base64-encoded 32-byte key used for authenticated
encryption; absent or invalid key must fail closed for credential
encryption/decryption and gateway selection. This is a deployment prerequisite,
not a blocker to implementing and testing this phase.

## Success criteria

- Zarinpal and Zibal can be selected only while enabled and fully configured;
  Pasargad is visibly deferred and cannot be configured or selected.
- Config and callback identity preserve provider and reference separately.
- Secret handling uses authenticated encryption and fails closed without the
  encryption key; no secret is returned or logged.
- Currency units and provider conversions are explicit and tested.
- Zarinpal and Zibal lifecycle scenarios in FR-18.5 are mocked and idempotent;
  Pasargad enablement is rejected; no refund endpoint is called.
- Admin configuration and payment behavior are documented, and targeted tests,
  typecheck, lint, plus relevant browser checks pass.
