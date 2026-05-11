# Morii Coffee — Frontend

A full-featured coffee shop web application built with Next.js 16 and the App Router. Covers the complete customer journey — browse, wishlist, cart, checkout, order tracking — plus a fully-featured admin panel for products, orders, users, promotions, and analytics.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Features

### Storefront
- **Product catalog** — browse, filter, and search with variant selection (size/type)
- **Shopping cart** — persistent across sessions via Zustand + localStorage
- **Wishlist** — save products for later, persisted client-side
- **Checkout** — delivery details, payment method selection (COD / MoMo / PayPal), order summary
- **Order tracking** — full lifecycle: Pending → Confirmed → Ready to Pickup → In Delivery → Delivered → Reviewed, with cancel support
- **Order history** — filter by status, view itemized receipts
- **Blog** — article listing and detail pages
- **Store locator** — find physical locations
- **Loyalty programme** — points balance and redemption
- **Reviews** — per-product ratings and comments
- **Notifications** — in-app notification feed
- **Authentication** — email/password + Google OAuth, JWT access/refresh token rotation
- **Internationalisation** — English and Vietnamese (VI/EN), locale stored in cookie
- **Dark mode** — class-based toggle via `next-themes`

### Admin Panel
- **Dashboard** — revenue, order, and user statistics with Recharts charts
- **Product management** — create / edit / delete products with image upload (MinIO)
- **Order management** — list with status filters, detail view, inline status update with valid-transitions guard
- **User management** — list, detail, role management
- **Banner campaigns** — create / edit / delete promotional banners
- **Promotions** — coupon and reward management
- **Reports** — sales analytics

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.1.6 |
| Language | TypeScript (strict) | 5.x |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS v4 + CSS variables (oklch) | 4.x |
| Component primitives | Radix UI | various |
| State management | Zustand (with `persist`) | 5.0.11 |
| Internationalisation | next-intl | 4.8.3 |
| Dark mode | next-themes | 0.4.6 |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.577.x |
| Carousel | Embla Carousel | 8.x |
| Charts | Recharts | 3.x |
| Toast notifications | React Toastify | 11.x |
| Testing | Jest 30 + Testing Library | 30.x / 16.x |
| Linting | ESLint 9 (eslint-config-next) | 9.x |
| Package manager | pnpm | — |

---

## Prerequisites

- **Node.js** ≥ 18.17 (LTS recommended)
- **pnpm** ≥ 9 — `npm install -g pnpm`
- A running instance of the Morii Coffee backend API (default port `5100`)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/morii-coffee-fe.git
cd morii-coffee-fe
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values (see [Environment Variables](#environment-variables)).

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The admin panel is available at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Project Structure

```
morii-coffee-fe/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages & layouts
│   │   ├── admin/              # Admin panel
│   │   │   ├── banners/        # Banner CRUD
│   │   │   ├── orders/         # Order management + detail
│   │   │   ├── products/       # Product CRUD
│   │   │   ├── promotions/     # Coupons & rewards
│   │   │   ├── reports/        # Analytics dashboard
│   │   │   └── users/          # User management
│   │   ├── auth/callback/      # OAuth callback handler
│   │   ├── blog/               # Blog listing + [slug] detail
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout flow
│   │   ├── orders/             # Order history + [id] detail
│   │   ├── products/           # Product listing + [slug] detail
│   │   ├── profile/            # User profile
│   │   ├── stores/             # Store locator
│   │   ├── wishlist/           # Saved products
│   │   ├── loyalty/            # Loyalty points
│   │   ├── feedback/           # General feedback form
│   │   ├── sign-in/            # Authentication
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── change-password/
│   │   ├── globals.css         # Tailwind + CSS variable design tokens
│   │   └── layout.tsx          # Root layout (providers, fonts)
│   ├── components/
│   │   ├── admin/              # Admin-specific components (DataTable, StatCard, …)
│   │   ├── checkout/           # DeliveryForm, PaymentMethodSelector, PriceSummary
│   │   ├── home/               # Hero, ProductCard, FeaturedSection
│   │   ├── layout/             # Header, Footer, CartButton, Nav
│   │   ├── orders/             # OrderStatusProgress, OrderCard
│   │   ├── reviews/            # RatingStars, ReviewList
│   │   └── ui/                 # Primitive components (Button, Badge, Card, …)
│   ├── constants/              # App-wide constants (routes, tax, shipping)
│   ├── enums/                  # TypeScript enums
│   ├── helpers/                # Domain helpers (products, categories, banners)
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-admin-users.ts
│   │   ├── use-auth-guard.ts
│   │   ├── use-banners.ts
│   │   ├── use-categories.ts
│   │   ├── use-form-validation.ts
│   │   ├── use-orders.ts
│   │   ├── use-pagination.ts
│   │   ├── use-products.ts
│   │   ├── use-protected-route.ts
│   │   └── use-toast.ts
│   ├── i18n/
│   │   ├── request.ts          # next-intl server config
│   │   └── messages/
│   │       ├── en.json
│   │       └── vi.json
│   ├── interfaces/             # TypeScript interfaces (auth, banners, categories, …)
│   ├── lib/
│   │   ├── api.ts              # HTTP client (apiGet, apiPost, apiPatch, apiPut, apiDelete)
│   │   ├── constants.ts        # Shared runtime constants
│   │   └── utils.ts            # cn(), formatVND(), …
│   ├── services/               # API service functions (one file per domain)
│   │   ├── auth-service.ts
│   │   ├── banners-service.ts
│   │   ├── cart-service.ts
│   │   ├── categories-service.ts
│   │   ├── file-service.ts
│   │   ├── order-service.ts
│   │   ├── products-service.ts
│   │   └── user-service.ts
│   ├── stores/                 # Zustand stores (all persisted to localStorage)
│   │   ├── admin-store.ts
│   │   ├── auth-store.ts       # JWT tokens + user session
│   │   ├── cart-store.ts       # Cart items + quantities
│   │   ├── notification-store.ts
│   │   └── wishlist-store.ts
│   ├── types/
│   │   ├── index.ts            # Domain types (Order, Product, Cart, …)
│   │   └── api.ts              # Backend DTO types (ApiOrderDetail, ApiPagination, …)
│   └── utils/                  # Pure utility functions (formatCurrency, formatDate, …)
└── src/__tests__/              # Jest test suite (41 files)
    ├── components/             # Component rendering tests
    ├── hooks/                  # Hook behaviour tests (async, state)
    ├── lib/                    # Utility unit tests
    ├── services/               # Service + API mock tests
    ├── stores/                 # Zustand store tests
    └── utils/                  # Pure function tests
```

---

## Architecture

The application follows a **layered architecture** with strict separation between data fetching, state management, and rendering.

```
Browser
  │
  ├── Next.js App Router (src/app/)
  │     └── Page components call hooks or services directly
  │
  ├── Custom Hooks (src/hooks/)
  │     └── Orchestrate async service calls + local state (loading / error)
  │
  ├── Services (src/services/)
  │     └── Thin wrappers over src/lib/api.ts — one function per API endpoint
  │
  ├── HTTP Client (src/lib/api.ts)
  │     └── Handles auth headers, token refresh, envelope unwrapping { data }
  │
  ├── Zustand Stores (src/stores/)
  │     └── Client-side persistent state (cart, wishlist, auth session)
  │
  └── Backend API  ─────────────────────────────────  http://localhost:5100/api
```

**Key conventions:**

- `src/types/api.ts` — raw backend DTO shapes (prefixed `Api*`). Never used in UI directly.
- `src/types/index.ts` — mapped domain types used throughout the UI. Services translate between the two.
- Components only import from `hooks/`, `stores/`, `components/`, and `lib/utils`. They never call `apiGet` directly.
- Dark mode: class-based `.dark` on `<html>`, CSS variables in `globals.css` using the oklch colour space.
- i18n: all user-visible strings live in `src/i18n/messages/{en,vi}.json`. Locale is stored in a cookie.

### Order status lifecycle

```
PENDING → CONFIRMED → READY_TO_PICKUP → IN_DELIVERY → DELIVERED → REVIEWED
    └─────────────────────────────────────────────────────────── CANCELLED
```

Valid next-state transitions are enforced server-side. The admin UI fetches `/v1/orders/{id}/valid-statuses` and only renders reachable states in the update dropdown.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend API base URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5100/api

# Google OAuth / Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key

# Public app URL (used for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

All variables are prefixed `NEXT_PUBLIC_` and are safe to expose to the browser.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Jest test suite (watch mode) |
| `pnpm test:ci` | Run tests in CI mode (no watch, fail-fast) |
| `pnpm test:coverage` | Run tests with coverage report |

---

## Testing

The project uses **Jest 30** with **Testing Library** and **jsdom**.

```bash
# Run all tests
pnpm test

# Run a specific file
pnpm test src/__tests__/services/order-service.test.ts

# Coverage report
pnpm test:coverage
```

### Test layout

| Directory | What is tested |
|---|---|
| `__tests__/components/` | Rendering, props, user interactions (Button, StatCard, ProductCard, …) |
| `__tests__/hooks/` | Async state management, filter logic, auth guards |
| `__tests__/services/` | API call shapes, response mapping, error handling |
| `__tests__/stores/` | Zustand action / selector behaviour |
| `__tests__/utils/` | Pure functions (currency formatting, date, validation) |
| `__tests__/helpers/` | Domain helpers (product normalisation, category mapping) |

Service tests use module-level mocks (`jest.mock`) and dynamic imports with `jest.resetModules()` per test to ensure isolation. Hook tests use `renderHook` + `waitFor` for async state assertions.

---

## Deployment

### Vercel (recommended)

1. Import the repository in the [Vercel dashboard](https://vercel.com/new).
2. Set the environment variables listed above under [Environment Variables](#environment-variables).
3. Deploy — Vercel automatically runs `pnpm build` and serves the App Router output.

### Self-hosted

```bash
pnpm build
pnpm start       # listens on port 3000
```

Point a reverse proxy (nginx, Caddy) at port `3000`.

**Allowed image domains** — configured in `next.config.ts`:

| Hostname | Purpose |
|---|---|
| `images.unsplash.com` | Placeholder / stock images |
| `ddlda2rzhrys8.cloudfront.net` | Production CDN |
| `localhost:9000` | MinIO — local development |
| `moriicoffee.minio:9000` | MinIO — Docker Compose |

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Follow the conventions in [CLAUDE.md](CLAUDE.md) — plan first, atomic commits, verify before marking done.
3. Run `pnpm lint && pnpm test:ci` before opening a pull request.
4. Open a PR against `main` with a clear description of what changed and why.

---

*Built with Next.js · Deployed on Vercel*
