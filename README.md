# SafeSwap

> **Pay safe. Ship safe. Get paid.**

SafeSwap is a buyer-seller escrow and pre-order deposit platform built on Nomba's Virtual Account infrastructure. It protects Nigerian online buyers and vendors by holding funds in a dedicated virtual account per transaction — releasing payment only when the buyer confirms delivery, or automatically after a 48-hour window if no dispute is raised.

Built for the **DevCareer x Nomba Hackathon 2026**.

🔗 **Live Demo:** [safeswap-ten.vercel.app](https://safeswap-ten.vercel.app)

---

## The Problem

Nigerian social commerce runs on Instagram DMs and WhatsApp. Buyers pay upfront and get scammed. Vendors ship orders and get ghosted. There is no trusted payment layer between informal buyers and sellers — leading to billions lost annually to transaction fraud and broken trust.

---

## The Solution

SafeSwap assigns every transaction a unique **Nomba virtual account**. The buyer pays into escrow — funds are held securely until:

1. The vendor uploads **photo or video proof of dispatch**
2. The buyer **confirms receipt** — funds released instantly to vendor
3. Or the buyer does **not respond within 48 hours** — funds auto-release to vendor

Disputes trigger a **3-tier resolution system**: direct negotiation → platform admin review → auto-resolution.

---

## Core Escrow Flow

```
Vendor creates order
        ↓
Nomba Virtual Account assigned (one per order)
        ↓
Buyer pays deposit or full amount into escrow
        ↓
Funds held securely — vendor notified
        ↓
Vendor ships + uploads dispatch proof (photo/video)
        ↓
Buyer confirms receipt
        ↓
Funds released to vendor 

         ── OR ──

Buyer raises dispute
        ↓
Tier 1: Direct negotiation (48h window)
Tier 2: Admin reviews shipping proof vs buyer claim
Tier 3: Auto-release to vendor if buyer unresponsive
```

---

## Payment Edge Case Handling

| Scenario | SafeSwap Behaviour |
|---|---|
| Buyer pays exact deposit | Status → Deposit Paid, production unlocked |
| Buyer pays full amount | Status → Fully Paid, escrow holds funds |
| Buyer overpays | Surplus flagged — vendor chooses Refund or Apply as Credit |
| Buyer underpays | Warning shown, production stays locked, gap displayed |
| Multiple payments from same buyer | Each logged separately, running total reconciled automatically |
| Buyer unresponsive after shipping proof | 48h auto-release timer fires, funds go to vendor |

---

## Key Features

###  Dashboard
- Live summary: total orders, total collected, outstanding, held in escrow
- Production readiness bar showing how many orders have cleared deposit threshold
- Real-time activity feed of payment events

###  Orders
- Full order list with status badges, payment progress bars, and search/filter
- Create order form with full React Hook Form validation
- Supports both full upfront payment and deposit + balance on delivery

###  Order Detail
- Escrow account panel with copy-to-clipboard and WhatsApp share
- Payment timeline showing every transaction against the order
- Dispatch proof upload (photo/video evidence before funds release)
- Overpayment handler with refund or credit options
- **Demo helpers:** Simulate Payment Received + Simulate Buyer Confirms (mirrors real Nomba webhook behavior for live demos)

###  Production Queue ★
The standout differentiator. Maps payment status directly to production decisions:
- **Ready to Produce** — orders that have crossed the deposit threshold
- **Awaiting Deposit** — orders still below threshold with gap amount shown
- Bulk mark-as-in-production action
- WhatsApp reminder button pre-filled with outstanding balance

###  Buyers
- Lightweight CRM derived from order data — no separate database needed
- Payment health scores: Reliable Payer / Partial Payer / Has Defaulted
- Per-buyer order history and outstanding balance tracking

###  Disputes
- Live countdown timers per dispute (auto-resolves at zero)
- Side-by-side evidence view: vendor's shipping proof vs buyer's claim
- In-app message thread between buyer and vendor
- Admin decision panel: rule for vendor (release) or buyer (refund)
- Full audit trail of resolved disputes

###  Settings
- Business profile management with logo upload
- Default deposit threshold configuration (applies globally to new orders)
- Nomba connection status and webhook health monitor
- Notification preferences

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| State | React Context |
| Payment Infrastructure | Nomba Virtual Accounts API, Transactions API, Transfers API, Webhooks |
| Backend | Node.js + Express.js (in development) |
| Database | PostgreSQL (in development) |
| Hosting | Vercel (frontend) + Railway (backend, coming) |

---

## Project Structure

```
safeswap/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx              # Persistent sidebar + navbar layout
│       ├── page.tsx                # Dashboard
│       ├── orders/
│       │   ├── page.tsx            # Orders list
│       │   └── [id]/page.tsx       # Order detail
│       ├── production-queue/
│       │   └── page.tsx            # Production Queue
│       ├── buyers/
│       │   └── page.tsx            # Buyers CRM
│       ├── disputes/
│       │   └── page.tsx            # Disputes management
│       └── settings/
│           └── page.tsx            # Settings
├── components/
│   ├── ui/                         # Shared component library
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Stepper.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toggle.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.tsx              # Slim top bar (logo + account)
│   │   └── Sidebar.tsx             # Primary navigation
│   └── settings/
│       ├── BusinessProfileTab.tsx
│       ├── PaymentSettingsTab.tsx
│       ├── NombaConnectionTab.tsx
│       └── NotificationsTab.tsx
├── context/
│   ├── OrdersContext.tsx           # Global orders, payments, disputes state
│   └── VendorContext.tsx           # Vendor profile and preferences
└── lib/
    ├── types/                      # TypeScript type definitions
    ├── constants/
    │   └── statusConfig.ts         # Single source of truth for status colors
    ├── mock-data.ts                # Demo seed data
    └── utils.ts                    # Utility functions
```

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/Favics-T/safeswap.git
cd safeswap

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

No environment variables are needed to run the frontend — it currently uses in-memory mock data that simulates real Nomba webhook behavior.

---

## Nomba API Integration

SafeSwap is built around Nomba's Virtual Account infrastructure:

| Nomba API | Usage in SafeSwap |
|---|---|
| Virtual Accounts API | One unique account per order — automatic payment reconciliation |
| Transactions API | Per-order payment history and audit trail |
| Webhooks | Real-time payment notifications (verified with signing key) |
| Transfers API | Release escrow funds to vendor on delivery confirmation or refund buyer on dispute |

The backend integration (Node.js + Express) is currently in active development. The frontend is fully functional with simulated payment flows that mirror real Nomba webhook behavior — designed for seamless swap-in once the backend is ready.

---

## Demo Walkthrough

To see the full escrow lifecycle live:

1. Go to **Orders** → Create a new order (deposit + balance type)
2. Open the order → click **Demo: Simulate Nomba Webhook** → enter an amount
3. Watch the status update and payment timeline populate
4. Upload a dispatch proof image
5. Click **Simulate Buyer Confirms Receipt** → funds released
6. Check **Production Queue** — order moved correctly
7. Check **Buyers** — buyer's total spent updated

To see the dispute flow:
1. On any Shipped order, click **Raise Dispute**
2. Watch the 48h countdown timer run
3. Use **Admin Decision Panel** to resolve for vendor or buyer

---

## Team

| Name | Role |
|---|---|
| Taiwo | Frontend Lead + Product |
| Ogbolosingha Jeremiah | Backend (Node.js, Express.js, PostgreSQL) |

---

## Hackathon

**DevCareer x Nomba Hackathon 2026**
Built with Nomba's Virtual Account API as the core payment infrastructure.

---

*SafeSwap — Pay safe. Ship safe. Get paid.*