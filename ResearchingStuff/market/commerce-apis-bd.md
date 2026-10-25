# Bangladesh commerce APIs: bKash checkout, Pathao and Steadfast couriers, BulkSMSBD

Reference for a possible future checkout. Research only, no code. All sources checked 2026-10-25.

**How to read the labels**
- **Official**: read on the vendor's own documentation site or in assets the vendor serves.
- **Official, live probe**: I called the vendor's endpoint with no credentials and quote its error reply. This proves the URL exists. It does not document the endpoint.
- **Unofficial, unverified**: comes from a third-party SDK or plugin. Confirm it against the vendor's docs before you build on it.

---

## 1. bKash Online Payment Gateway, Tokenized Checkout (v2)

Source: developer.bka.sh. The docs are public and need no login. Page index: https://developer.bka.sh/llms.txt (checked 2026-10-25).

### Base URLs
- **Sandbox**: `https://tokenized.sandbox.bka.sh/v2/tokenized-checkout`. Every endpoint page below shows this URL (checked 2026-10-25).
- **Production**: the overview gives only a pattern. It says "Sandbox endpoint `https://<service-name>.sandbox.bka.sh`" and "Production endpoint `https://<service-name>.pay.bka.sh`" (https://developer.bka.sh/docs, checked 2026-10-25). Applying that pattern gives **`https://tokenized.pay.bka.sh/v2/tokenized-checkout`**. That full URL is my inference: no official page prints it. Use whatever base URL comes with the production credentials.
- The sandbox is open to anyone, before onboarding is finished. bKash issues production credentials once onboarding is complete (same page).

### Auth flow
1. **Credentials** (four, all from bKash): `username`, `password`, `app_key`, `app_secret`.
2. **Grant Token**
   - Request: `POST /auth/grant-token`.
   - Headers: `username`, `password`, `Content-Type: application/json`.
   - Body: `{app_key, app_secret}`.
   - Response: `id_token`, `refresh_token` (valid 30 days), `expires_in` (3600), `token_type: Bearer`, `statusCode: "0000"`.
   - Source: https://developer.bka.sh/docs/grant-token.md, checked 2026-10-25.
3. **Refresh Token**
   - Request: `POST /auth/refresh-token`, same headers as Grant Token.
   - Body: `{app_key, app_secret, refresh_token}`.
   - Response: a new `id_token` and a new `refresh_token`.
   - Source: https://developer.bka.sh/docs/refresh-token.md, checked 2026-10-25.
4. **Payment API headers**: every payment call sends `Authorization: <id_token>`, `X-App-Key: <app_key>` and `Content-Type: application/json`.
5. **Token rules**
   - Refresh at minute 50 to 55.
   - **Do not call grant or refresh more than 2 times per hour.** Going over that blocks the app for 1 hour.
   - Cache the token server-side. Never put the secret or the refresh token in client code.
   - Source: https://developer.bka.sh/docs/token-managment-v2.md, checked 2026-10-25.
6. **Timeout**: every endpoint times out after 30 s.

### Endpoints
Paths are relative to the base URL above.

| Purpose | Method + path | Key request fields | Key response fields | Source (checked 2026-10-25) |
|---|---|---|---|---|
| Grant token | `POST /auth/grant-token` | headers `username`, `password`; body `app_key`, `app_secret` | `id_token`, `refresh_token`, `expires_in` | https://developer.bka.sh/docs/grant-token.md |
| Refresh token | `POST /auth/refresh-token` | `app_key`, `app_secret`, `refresh_token` | same as grant | https://developer.bka.sh/docs/refresh-token.md |
| Create payment | `POST /payment/create` | `payerReference` (≤255), `callbackURL`, `amount`, `currency: "BDT"`, `intent: "sale"`, `merchantInvoiceNumber` (≤255). Text fields must match `^[^<>&]*$` | `paymentId` (valid 24 h, can be executed once), `bkashURL` (send the customer here), `successCallbackURL` / `failureCallbackURL` / `cancelledCallbackURL`, `transactionStatus: "Initiated"`, `signature` | https://developer.bka.sh/docs/create-payment-3.md |
| Execute payment | `POST /payment/execute` | `paymentId` | `trxId`, `transactionStatus: "Completed"`, `amount`, `payerAccount`, `merchantInvoiceNumber`, `maxRefundableAmount` | https://developer.bka.sh/docs/execute-payment-4.md |
| Query payment | `POST /query/payment` | `paymentId` | `transactionStatus` (`Completed`, or `Initiated` when cancelled or failed), `verificationStatus` (`Complete` / `Incomplete`), `trxId`, `amount` | https://developer.bka.sh/docs/query-payment.md |
| Search transaction | `POST /general/search-transaction` | `trxId` | `transactionStatus`, `amount`, `payerAccount`, `completedTime`, `maxRefundableAmount` | https://developer.bka.sh/docs/search-transaction.md |
| Refund | `POST /refund/payment/transaction` | `paymentId`, `trxId`, `refundAmount`, `sku` (≤255), `reason` (≤255), all required | `refundTrxId`, `refundTransactionStatus: "Completed"`, `originalTrxId` | https://developer.bka.sh/docs/refund.md |
| Refund status | `POST /refund/payment/status` | `paymentId`, `trxId` | `refundTransactions[]` with `refundTrxId`, `refundTransactionStatus`, `refundAmount` | https://developer.bka.sh/docs/refund-status.md |

**Refund limits** (https://developer.bka.sh/docs/refund.md):
- At most 10 partial refunds per transaction.
- Only within 60 days of the payment.
- No duplicate refund within 10 minutes.
- If a refund call times out, call Refund Status before you retry.

**Inconsistencies in the docs**
- The field is written both `paymentId` and `paymentID`, and both `bkashURL` and `bKashURL`. The callback query string uses `paymentID`.
- The response fields `statusCode` / `statusMessage` (token calls) and `externalCode` / `errorMessageEn` (payment calls) differ by endpoint.
- Parse field names case-insensitively, or test against the sandbox.

### Minimal example
From create-payment-3.md:
```bash
curl -X POST 'https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/payment/create' \
  -H 'Authorization: <id_token>' -H 'X-App-Key: <app_key>' -H 'Content-Type: application/json' \
  -d '{"payerReference":"01XXXXXXXXX","callbackURL":"https://api.example.com/bkash/callback",
       "amount":"500.00","currency":"BDT","intent":"sale","merchantInvoiceNumber":"ORD-1001"}'
```

### Callback / redirect: how to verify
- **Redirect format**: bKash sends the customer's browser to `callbackURL?paymentID=<id>&status=success|failure|cancel&signature=<…>` (https://developer.bka.sh/docs/create-payment-3.md).
- **The redirect is not proof of payment.** The flow page says a success callback only means you should now call Execute. Mark the order paid only after Execute succeeds or Query returns `Completed` (https://developer.bka.sh/docs/tokenized-without-agreement.md, checked 2026-10-25).
- **Handling the callback**, all server-side:
  1. Look up the order by `paymentID`. Ignore the query `status` except to decide whether to bother calling Execute.
  2. Call Execute.
  3. Check that `transactionStatus == "Completed"` and that `amount` and `merchantInvoiceNumber` match your order.
  4. Store `trxId`.
- **If Execute times out**: call Query. `Initiated` means you may create a new payment. `Completed` means paid, so do not retry (execute-payment-4.md).
- **The `signature` parameter**: bKash documents no algorithm for checking it, so you cannot verify it. Rely on Execute and Query.
- **Duplicate callbacks**: they happen (a refresh, the back button). Keep the handler idempotent. Execute returns `2062` / `2117` when the payment is already completed. Treat that as "go and Query", not as a failure.

### Server-to-server webhook (IPN)
- **It exists**: "Instant Payment Notification" (https://developer.bka.sh/page/instant-payment-notification.md, checked 2026-10-25).
- **Delivery**: an HTTP POST in **AWS SNS envelope format**: `Type`, `MessageId`, `TopicArn`, `Message`, `Signature`, `SignatureVersion: "1"`, `SigningCertURL`.
- **Setup**: there is no self-service. You give your listener URL to bKash technical support during onboarding. Your endpoint first receives a `SubscriptionConfirmation` (with `SubscribeURL` and `Token`), which you must acknowledge.
- **Scope**: only **successful** payments are sent, and that includes payments made outside your checkout (USSD, the app, QR).
- **`Message` fields**: `trxID`, `transactionStatus`, `transactionType`, `amount`, `currency`, `dateTime`, `debitMSISDN`, `merchantInvoiceNumber`, `transactionReference`, plus coupon fields.
- **Verifying it**:
  - The page says notifications are signed, but it **does not document the verification procedure**.
  - The envelope matches standard AWS SNS, so the standard SNS check probably applies: fetch the PEM from `SigningCertURL`, which must be on an `sns.<region>.amazonaws.com` host, then verify `Signature` over the canonical string. That is my inference, not bKash's documentation. Confirm it with bKash.
  - Either way, re-check the amount with Search Transaction before acting.
  - IP allowlisting is not mentioned.
- **Practical role**: treat the IPN as a backup for missed callbacks, not as the main confirmation.

### Error codes that matter
Source: https://developer.bka.sh/docs/payment-error-codes.md and https://developer.bka.sh/docs/refund-error-codes.md (checked 2026-10-25).

| Code | Meaning |
|---|---|
| `2001` | invalid app key |
| `2002` | invalid payment ID |
| `2006` | invalid amount |
| `2007` | invalid currency |
| `2023` | insufficient balance |
| `2029` | duplicate transaction |
| `2056` | invalid payment state |
| `2062` | already completed |
| `2117` | execution already completed |
| `2065` | mandatory field missing |
| `503` | maintenance |
| `9999` | bad credentials on grant token (from grant-token.md) |
| `2071` | refund window passed |
| `2072` | refund amount not valid |
| `2077` | invalid trxId |
| `2127` | transaction not yet completed |

The docs say to show customers `errorMessageEn`, not the code.

### Onboarding prerequisites and fees
- **Official, developer portal** (https://developer.bka.sh/docs, checked 2026-10-25): you become a bKash merchant through onboarding. That means an organization account, the required documents ("such as KYC") and a signed agreement, with help from a Merchant Account Manager. No document checklist is published there.
- **Not verified**: bkash.com pages (merchant sign-up, PGW terms) returned **HTTP 403 to automated fetch** on 2026-10-25, so I could not read them. Search snippets suggest the merchant sign-up asks for an NID, a trade license (number and expiry) and a bank account, and that a "Personal Retail Account" exists for sellers with no trade license. Confirm on https://www.bkash.com/en/business/merchant in a browser.
- **Fees**: **no PGW fee (MDR) is published** on developer.bka.sh. The FAQ mentions only "Dynamic Charging", which lets the merchant pass a fee to the customer (https://developer.bka.sh/docs/faq.md). Get the rate from your bKash account manager.
- **Sandbox test wallets, OTP and PIN**: not on the public pages. bKash provides them along with the sandbox credentials.

---

## 2. Pathao Courier Merchant API

### Where the docs are
- The docs live at **https://merchant.pathao.com/courier/developer-api** ("Developer's API" in the logged-in merchant panel). The page is a Vue single-page app.
- Fetching it returns only an HTML shell. The content below was read from Pathao's own publicly served bundle, `https://merchant.pathao.com/assets/developer-api-DyOWD1xw.js` (and `store-vEcQkN0R.js` for the sandbox credentials), checked 2026-10-25.
- These are official text, but **seeing them in a browser needs a merchant login**.
- Every endpoint below has this source: https://merchant.pathao.com/courier/developer-api (bundle `developer-api-DyOWD1xw.js`), checked 2026-10-25.

### Base URLs
- **Sandbox**: `https://courier-api-sandbox.pathao.com`.
  - Public sandbox credentials: printed in the merchant panel API docs (not copied here so secret scanners stay quiet).
- **Live**: `https://api-hermes.pathao.com`. The docs note it is "changeable by Pathao in future".
- **Live credentials**: the merchant generates `client_id` / `client_secret` in the panel under "Merchant API Credentials". Username and password are the merchant login.

### Auth flow (OAuth2 password grant)
- **Get a token**:
  - Request: `POST /aladdin/api/v1/issue-token`.
  - Body: `{client_id, client_secret, username, password, grant_type:"password"}`.
  - Success (200): `{access_token, refresh_token, token_type:"Bearer", expires_in}`.
  - Wrong credentials (400): "The user credentials were incorrect."
- **Refresh**: same path, body `{client_id, client_secret, refresh_token, grant_type:"refresh_token"}`.
- **Then**: send `Authorization: Bearer <access_token>` on every call.
- **Token lifetime**: the docs give `expires_in` only as "timestamp", so the lifetime is **not documented**. Cache the token and refresh it when you get a 401.

### Endpoints

| Purpose | Method + path | Key request fields | Key response fields |
|---|---|---|---|
| Issue / refresh token | `POST /aladdin/api/v1/issue-token` | see above | `access_token`, `refresh_token`, `expires_in` |
| Create store | `POST /aladdin/api/v1/stores` | `name` (3–50), `contact_name`, `contact_number`, `secondary_contact` (optional), `address` (10–65), `city_id`, `zone_id`, `area_id` | 200 "Store created successfully, Please wait one hour for approval." |
| List stores | `GET /aladdin/api/v1/stores` | none | `data.data[]`: `store_id`, `store_name`, `store_address`, `is_active`, `city_id`, `zone_id`, `hub_id`, `is_default_store` |
| Cities | `GET /aladdin/api/v1/city-list` | none | `data.data[]`: `city_id`, `city_name` |
| Zones | `GET /aladdin/api/v1/cities/{city_id}/zone-list` | none | `zone_id`, `zone_name` |
| Areas | `GET /aladdin/api/v1/zones/{zone_id}/area-list` | none | `area_id`, `area_name`, `home_delivery_available`, `pickup_available` |
| Price calculation | `POST /aladdin/api/v1/merchant/price-plan` | `store_id`, `item_type`, `delivery_type`, `item_weight`, `recipient_city`, `recipient_zone` (all required) | `price`, `discount`, `promo_discount`, `plan_id`, `cod_enabled`, `cod_percentage` (e.g. 0.01), `additional_charge`, `final_price` |
| Create order | `POST /aladdin/api/v1/orders` | `store_id`, `merchant_order_id` (optional), `recipient_name` (3–100), `recipient_phone` (11 chars in BD), `recipient_address` (10–220), `recipient_city` / `recipient_zone` / `recipient_area` (**optional in BD**: "do not send a null value", Pathao fills them from the address), `delivery_type` (48 normal, 12 on-demand), `item_type` (1 document, 2 parcel), `item_quantity`, `item_weight` (0.5–10 kg), `amount_to_collect` (int, 0 if not COD), `item_description` (optional), `special_instruction` (optional) | 200 `data`: `consignment_id`, `merchant_order_id`, `order_status: "Pending"`, `delivery_fee` |
| Bulk create | `POST /aladdin/api/v1/orders/bulk` | `{orders:[ …same fields… ]}` | **202** "Your bulk order creation request is accepted, please wait…": asynchronous, and **no consignment IDs are returned**. They arrive later through the webhook (`order.created`) |
| Order status | `GET /aladdin/api/v1/orders/{consignment_id}/info` | none | `consignment_id`, `merchant_order_id`, `order_status`, `order_status_slug`, `updated_at`, `invoice_id`. 404 "Invalid order id" |

**Notes on the docs**
- One older doc table still marks `recipient_city` and `recipient_zone` as required. The newer BD parameter table marks them optional. The price-plan call still needs them, so in practice keep the city, zone and area lookups.
- "C2C" merchants see a variant of Create order that also requires `sender_name` and `sender_phone`.

### Minimal example
```bash
curl -X POST 'https://courier-api-sandbox.pathao.com/aladdin/api/v1/orders' \
  -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' \
  -d '{"store_id":123,"merchant_order_id":"ORD-1001","recipient_name":"Rahim",
       "recipient_phone":"017XXXXXXXX","recipient_address":"House 3, Road 14, Dhanmondi, Dhaka-1205",
       "delivery_type":48,"item_type":2,"item_quantity":1,"item_weight":0.5,"amount_to_collect":0}'
```

### Errors and status codes
| HTTP | Meaning |
|---|---|
| 200 | ok |
| 202 | bulk accepted |
| 400 | bad credentials |
| 404 | unknown consignment |
| 422 | validation; the body is `{message:"Please fix the given errors", errors:{field:[msg]}}` |

### Webhook
- **Setup**: the merchant sets a webhook URL and a webhook secret in the panel.
- **Delivery**: a `POST` with `Content-Type: application/json`.
- **Verification**: the request carries the header **`X-PATHAO-Signature: <your webhook_secret>`**. This is a **shared secret sent as-is, not an HMAC**. Verify it with a constant-time string compare against the secret you set, which also means the secret must stay out of any client code.
- **Integration test the panel runs**:
  - It first sends `{"event":"webhook_integration"}`.
  - Your URL must be reachable, resolve within 3 redirects, have a valid TLS certificate, answer within **10 s**, and return **HTTP 202** for this event.
  - It must also return a response header whose name and value are shown in your panel (`webhookHeaderKey` / `webhookHeaderValue`). This is currently optional, unless your account is in "strict" mode. The docs warn it will become mandatory.
- **Events**:
  - `order.created`, `order.updated`, `order.pickup-requested`, `order.assigned-for-pickup`.
  - Picked, Pickup Failed / Cancelled, At the Sorting Hub, In Transit, `order.received-at-last-mile-hub`, Assigned for Delivery.
  - Delivered, Partial Delivery, Return, Delivery Failed, On Hold, Payment Invoice, Paid Return, Exchange.
  - Store Created / Updated, Return Id Created, Return In Transit, Returned To Merchant.
- **Payload**:
  - Always: `consignment_id` (14 chars), `merchant_order_id`, `updated_at` (UTC+6).
  - On the newer event payloads: `event`, `timestamp`, `store_id`, `delivery_fee`.
  - Status events: `order_status` and `order_status_slug`, sometimes `reason`.
  - Partial delivery: `collected_amount`.
  - Payment Invoice: `payment_status` and `invoice_id`.

### Onboarding and fees
- **Onboarding**: sign up as a merchant at merchant.pathao.com. Credentials are self-serve in the panel. A new store needs about **1 hour for approval** before you can use it on orders.
- **Business document requirements**: not stated in the API docs. Not verified.
- **Fees**: no public rate card was checked. Prices are per merchant and per route; get them from `price-plan`. The sample response shows a COD fee as `cod_percentage: 0.01` (1%), but that is a sample, not a published tariff.

---

## 3. Steadfast Courier API

### Docs status
- **The official API docs are not public.** `https://steadfast.com.bd/user/api` redirects (302) to `/login`. Public pages (`/`, `/business`) only say "API and plugins: push orders straight from your own site and read the status back" (https://steadfast.com.bd/business, checked 2026-10-25).
- I did not reconstruct the docs from blogs. What follows is split by how well I could verify it.

### Verified by live probe (official host, no credentials, 2026-10-25)
- `GET https://portal.packzy.com/api/v1/get_balance` returns `401 {"status":401,"message":"Unauthorized Access (missing API credentials)"}`.
- `GET https://portal.packzy.com/api/v1/status_by_cid/{id}` returns 401, same body.
- `POST https://portal.packzy.com/api/v1/create_order` returns 401, same body.
- So **`https://portal.packzy.com/api/v1` is the live API host**.
- `portal.steadfast.com.bd`, which some SDKs default to, did not resolve from here.

### Unofficial, unverified: WordPress plugin "SteadFast API"
- Source: https://plugins.svn.wordpress.org/steadfast-api/trunk/includes/functions.php (checked 2026-10-25).
- Contributors include `steadfastit`, and the plugin links to steadfast.com.bd, so it is probably Steadfast's own plugin. It is still not API documentation.
- **Auth headers**: `api-key: <key>`, `secret-key: <secret>`, `Content-Type: application/json`. The key and secret come from the merchant panel.
- **`POST /create_order`**
  - Body: `invoice` (unique), `recipient_name`, `recipient_phone` (the plugin normalizes it to 11 digits, starting `0`), `recipient_address`, `cod_amount`, `note`.
  - Response: `{status:200, consignment:{consignment_id, invoice, tracking_code, status, …}}`.
  - Validation error: `{status:400, errors:{field:[msg]}}`.
- **`GET /status_by_cid/{consignment_id}`** returns `{status, delivery_status}`.
- **`GET /get_balance`** returns `{status, current_balance}`.
- **`GET /fraud_check/score/{phone}`** is also called by the plugin. This is the buyer delivery and return history ("Delivery Risk Check").

### Unofficial, unverified: SDK listings
- Sources: https://github.com/steadfast-it/SteadFast-Courier-Laravel-Package and https://steadfast-python.readthedocs.io/en/latest/order_management.html (checked 2026-10-25).
- The GitHub org `steadfast-it` makes no claim to be official.
- **Bulk create**: up to **500** orders per request. Each result has `status` `success` or `error`, with `consignment_id` and `tracking_code` set to null on error. The HTTP path is not shown. Commonly cited as `POST /create_order/bulk-order`; **not verified**.
- **Status lookups** by consignment ID, invoice and tracking code. Commonly cited paths are `/status_by_cid/{id}`, `/status_by_invoice/{invoice}` and `/status_by_trackingcode/{code}`. Only the first is verified (by the probe above).
- **`delivery_status` values**: `pending`, `delivered_approval_pending`, `partial_delivered_approval_pending`, `cancelled_approval_pending`, `unknown_approval_pending`, `delivered`, `partial_delivered`, `cancelled`, `hold`, `in_review`, `unknown`.
- **Python SDK extras**: it adds `delivery_type` (0 home, 1 point) and length limits: name ≤100, address ≤250, phone exactly 11 digits.
- **Webhook**: Steadfast POSTs status changes to your callback URL, which you set in the panel.
  - Auth: `Authorization: Bearer <token you configure>`, with a 401 on mismatch.
  - Payload: `consignment_id` (fallback `tracking_code`), `invoice`, `status`, `cod_amount`, `updated_at`.
  - The WP plugin (`includes/class-hooks.php`) also accepts the token as a URL query parameter when hosts strip the header.

### Minimal example (unofficial, unverified header names)
```bash
curl -X POST 'https://portal.packzy.com/api/v1/create_order' \
  -H 'api-key: <API_KEY>' -H 'secret-key: <SECRET_KEY>' -H 'Content-Type: application/json' \
  -d '{"invoice":"ORD-1001","recipient_name":"Rahim","recipient_phone":"017XXXXXXXX",
       "recipient_address":"House 3, Road 14, Dhanmondi, Dhaka","cod_amount":0,"note":""}'
```

### Onboarding and fees (official)
- **Onboarding**: register at https://steadfast.com.bd/register. Terms §2 say verification "may include phone calls, document submission and validation of the business address", and the account is activated after that (https://steadfast.com.bd/terms-and-condition, checked 2026-10-25).
- **COD charge**: "charged at a fixed rate of 1% after deducting the delivery charges of the collected amount" (terms).
- **Pricing page** (https://steadfast.com.bd/pricing, checked 2026-10-25):
  - "A 1% cash on delivery and risk management charge applies."
  - "Pick and drop service has a minimum charge of ৳80."
  - "Charges exclude VAT and tax."
  - Negotiated rates override the standard ones.
  - Delivery charges come from an on-page calculator (`/pricing/quote`). I did not capture specific taka rates.

---

## 4. BulkSMSBD send-SMS API (note)

**BulkSMSBD's send-SMS API is not publicly documented.** bulksmsbd.net serves only a login page, and the doc paths I tried (`/api`, `/api-doc`, `/developer`) returned 404 (checked 2026-10-25).

**Live probe (official host, no credentials, 2026-10-25):**
- `https://bulksmsbd.net/api/smsapi` replies `{"response_code":1003,"error_message":"Please Required all fields…"}`.
- `https://bulksmsbd.net/api/getBalanceApi` replies `{"response_code":1003,"error_message":["The api key field is required."]}`.
- Both endpoints exist and authenticate with an API key.

**Unofficial, unverified** (a WordPress plugin listing and the pub.dev `bulksmsbd` package):
- Parameters are `api_key`, `senderid`, `number` and `message`.
- You need an approved sender ID.
- IP allowlisting is on by default in the dashboard and must be adjusted for your server's IP.

The parameter list and the response-code table are in the logged-in dashboard. Confirm them there before use.

---

## Gotchas for a static site

A static export (GitHub Pages, Next `output: export`) **cannot call any of these APIs from the browser**. There are three reasons:

- **Secrets**: every one of these APIs needs secrets: the bKash `app_secret` and password, the Pathao `client_secret` and password, the Steadfast `secret-key`, the BulkSMSBD `api_key`. Anything shipped to the browser is public.
- **Token state**: bKash allows only 2 grant or refresh calls per hour per app. A per-visitor token flow would lock the app within minutes, so the token must be cached in one server-side place.
- **CORS and inbound requests**: these are server-to-server APIs. I did not test CORS headers, but none of the docs promise browser access. Webhooks (Pathao, Steadfast, bKash IPN) and the bKash callback need an HTTPS endpoint that **receives** requests, which a static host cannot provide.

**The smallest server piece that covers it:** one small serverless backend, such as Cloudflare Workers, Vercel/Netlify functions or a single tiny VPS app. It needs:
1. **Secrets in env vars**, plus a **tiny persistent store** (KV, D1, Postgres or SQLite) for:
   - the cached bKash token and refresh token,
   - Pathao tokens,
   - orders: id, amount, `paymentID`, `trxId`, status, consignment ID.
2. **`POST /api/checkout`**: rebuilds the amount from the server's own price list (never trust a browser-sent amount), creates the order row, calls bKash Create, and returns `bkashURL`.
3. **`GET /api/bkash/callback`**: the bKash `callbackURL`. It calls Execute, falls back to Query on timeout, compares amount and invoice, marks the order paid idempotently, then redirects to a static "thank you / failed" page.
4. **`POST /api/webhooks/pathao`**:
   - checks the `X-PATHAO-Signature` value against the secret,
   - returns **202** within 10 s and sends the panel's response header,
   - updates the order.
5. **`POST /api/webhooks/steadfast`**: checks the Bearer token and updates the order.
6. **Optional `POST /api/webhooks/bkash-ipn`**: confirms the SNS subscription and checks the SNS signature. Use it as a backup when a callback is lost.
7. **Shipment creation**: an admin-only route or a job that, after payment, calls Pathao `orders` (or Steadfast `create_order`) and optionally BulkSMSBD.

**Other practical notes**
- **bKash `callbackURL`** must be the backend URL, not a static page.
- **BulkSMSBD and IP allowlisting**: serverless egress IPs change, so either turn allowlisting off or use a fixed-IP host.
- **COD**: courier COD (`amount_to_collect` / `cod_amount`) and bKash prepaid are separate. Set COD to 0 for orders already paid through bKash.
