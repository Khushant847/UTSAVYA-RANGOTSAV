# UTSAVYA RANGOTSAV — Event Ticket Booking Platform

A production-ready ticket booking website and admin portal for **UTSAVYA RANGOTSAV**, a premium Dandiya & Garba Night organized by **UTSAVYA CELEBRATION** (17 October 2026, Faridabad).

## Features

- **Public Website** — Festive premium UI (midnight navy, royal purple, metallic gold), event details, pass pricing, terms & contact.
- **Booking Flow** — Enter details → Select pass (Single ₹249 / Duo ₹449 / Family ₹999) → Pay → Digital ticket.
- **Razorpay Payments** — Server-side order creation, HMAC signature verification, webhook handling (idempotent), no secret keys in frontend.
- **Digital Ticket** — Unique Booking ID (`UTS26-XXXXXX`), Ticket ID (`UV26-XXXXXXXX`), secure QR token.
- **QR Entry System** — Atomically enforced entries (`allowedEntries` / `usedEntries` / `remainingEntries`). One QR cannot permit unlimited entry.
- **Email Confirmation** — Automated ticket email via Resend after successful payment and via webhook.
- **Admin Portal** — `/admin` login, live dashboard, mobile QR scanner, ticket management with CSV export, scan logs, settings.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn-style components |
| Database | Firebase Firestore (Admin SDK server-side only) |
| Auth | Firebase Authentication (Email/Password) + session cookies |
| Payments | Razorpay (Checkout.js + Node SDK) |
| QR | qrcode.react (display) + html5-qrcode (admin scanner) |
| Email | Resend |
| Migration/Deploy | Vercel or Firebase App Hosting |

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in your credentials
npm run dev                  # http://localhost:3000
```

## Where to Add Your Credentials

Edit **`.env.local`** and replace the placeholders:

```
# ─────────────────────────────────────────────
# 1. FIREBASE (https://console.firebase.google.com)
# ─────────────────────────────────────────────
# Create a Firebase project, enable:
#   • Authentication → Email/Password provider
#   • Cloud Firestore database
# Then add a web app in Project Settings → Your apps.
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Service account JSON for the ADMIN SDK.
# Project Settings → Service accounts → Generate new private key.
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ─────────────────────────────────────────────
# 2. RAZORPAY (https://dashboard.razorpay.com)
# ─────────────────────────────────────────────
# Create API keys (test mode for development: rzp_test_*).
# Webhook → add URL https://yourdomain.com/api/razorpay/webhook
# and subscribe to event: payment.captured, payment.failed,
# refund.created, refund.processed.
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...   # same public key id
RAZORPAY_WEBHOOK_SECRET=...       # set in webhook settings

# ─────────────────────────────────────────────
# 3. RESEND (https://resend.com) — for emails
# ─────────────────────────────────────────────
RESEND_API_KEY=...
EMAIL_FROM=UTSAVYA RANGOTSAV <noreply@yourdomain.com>

# ─────────────────────────────────────────────
# 4. APP
# ─────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000   # production: https://yourdomain.com
```

## Setting Up Firestore

1. Create collections: `tickets`, `payments`, `scanLogs`, `admins`.
2. Deploy security rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```
3. Deploy indexes (for ticket filtering/QR lookup):
   ```bash
   npx firebase deploy --only firestore:indexes
   ```

## Adding an Admin

1. In Firebase Console → Authentication → Add user → create an Email/Password admin account.
2. Note the **UID** of that user.
3. In Firestore → `admins` collection → create a document with ID = the UID:
   ```json
   {
     "email": "you@example.com",
     "displayName": "Your Name",
     "role": "super_admin",
     "isActive": true,
     "createdAt": <server timestamp>
   }
   ```
4. Login at `http://localhost:3000/admin`.

## Architecture

```
User Browser                            Admin Browser
     │                                        │
     ▼                                        ▼
Public Booking Flow                    /admin portal (auth via session cookie)
     │                                        │
     ├─ createRazorpayOrder (Server Action)   ├─ Dashboard (live stats)
     │      └─ creates Firestore ticket       ├─ Scanner (html5-qrcode)
     │      └─ creates Razorpay order         │      └─ scanTicket() atomic
     │                                        ├─ Tickets (search/filter/CSV)
     │  Razorpay Checkout modal               └─ Scan Logs
     │      └─ verifyPayment() HMAC check
     ▼                                        ▼
Firebase Firestore (Admin SDK only)
     ▲                                        ▲
     └─ Razorpay Webhook (idempotent,         └─ Email via Resend
         signature verified)                        (ticket confirmation)
```

### Key Security Decisions

- **Firestore is accessed ONLY via the Admin SDK** on the server. Direct client reads/writes are denied by rules — no client-side data tampering is possible.
- **Prices are computed server-side** from the pass type. The client never sends an amount.
- **QR entry consumption is atomic** (Firestore transaction), preventing double-scan at the same moment.
- **Razorpay webhook signature is verified** with HMAC-SHA256 using `RAZORPAY_WEBHOOK_SECRET`; duplicate events are idempotently ignored.
- **No admin credentials or secret API keys** exist in client code.

## Testing Checklist

- [ ] Single Pass payment (₹249)
- [ ] Duo Pass payment (₹449)
- [ ] Family Pass payment (₹999)
- [ ] Failed payment → "TRY AGAIN"
- [ ] Duplicate payment callback/webhook → no duplicate ticket
- [ ] QR renders on digital pass
- [ ] Valid QR scan → entry consumed (1/n)
- [ ] Repeated scan → remaining entries reduces / invalid when 0
- [ ] Simultaneous scans → only one accepted (atomic)
- [ ] Admin login
- [ ] Dashboard statistics update
- [ ] CSV export
- [ ] Mobile responsiveness
- [ ] Email ticket delivery
- [ ] Price tampering rejected server-side
- [ ] Unauthorized /admin access → redirected to login