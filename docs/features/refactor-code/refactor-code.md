Here's the prompt:

---

Please do a **full codebase review and refactor** of the `morii-coffee-fe` repository. The goal is to eliminate code smell, reduce duplication, separate concerns properly, and make the codebase clean, maintainable, and scalable.

---

## Step 1 — Read & Audit First

Before making any changes, do a thorough read of the entire `src/` directory and identify:

1. **Pages with inline components** — components written directly inside `page.tsx` files instead of being extracted into separate files
2. **Logic that belongs elsewhere** — business logic, data transformation, API calls, or complex state management written directly inside page or component files instead of being moved to `hooks/`, `utils/`, `helpers/`, or `services/`
3. **Duplicated UI patterns** — buttons, inputs, forms, toasts, error messages, loading states, modals, badges, cards, and any other UI elements that appear in multiple places without a shared reusable component
4. **Sonar / lint violations** — unused variables, overly complex functions, missing return types, magic numbers, deeply nested conditionals, long functions, dead code, and anything that would fail a Sonar quality gate
5. **Any dead code or commented-out code** — remove it entirely

Document your findings before starting the refactor so you have a clear plan.

---

## Step 2 — Extract & Consolidate Shared UI Components

Create or consolidate shared components under `src/components/ui/`. For every UI pattern used in more than one place, extract it into a single reusable component. Examples include but are not limited to:

```
src/components/ui/
├── button.tsx               ← primary, secondary, ghost, danger variants
├── input.tsx                ← text, password, search, with label and error state
├── textarea.tsx
├── select.tsx
├── form-field.tsx           ← label + input + error message wrapper
├── toast.tsx                ← success, error, warning, info variants
├── error-message.tsx        ← inline field-level error display
├── loading-spinner.tsx
├── skeleton.tsx             ← loading skeleton for cards, tables, lists
├── modal.tsx                ← confirmation modal, generic dialog wrapper
├── badge.tsx                ← status badges, role badges
├── card.tsx
├── avatar.tsx               ← with fallback placeholder
├── image-with-fallback.tsx  ← next/image with onError fallback
├── data-table.tsx           ← reusable table with pagination
└── empty-state.tsx          ← empty list / no results state
```

Every extracted component must:
- Accept clearly typed props
- Handle all relevant states (loading, error, empty, disabled)
- Be consistent with the Morii Coffee design system (primary color `#146d4d`, Tailwind classes, dark mode support)

---

## Step 3 — Extract Logic Out of Pages & Components

For every page or component that contains inline logic, extract it to the appropriate layer:

**Custom hooks** (`src/hooks/`) — for stateful logic, side effects, and data fetching:
```
src/hooks/
├── use-auth.ts              ← sign in/up/out, token management
├── use-user-profile.ts      ← fetch and update profile
├── use-products.ts          ← product list, detail, mutations
├── use-categories.ts
├── use-banners.ts
├── use-admin-users.ts
└── ...
```

**Utility functions** (`src/utils/` or `src/lib/`) — for pure functions and helpers:
```
src/utils/
├── format-currency.ts       ← VND formatting
├── format-date.ts           ← date display helpers
├── image-url.ts             ← CDN URL helpers, MinIO URL detection
├── validate.ts              ← shared validation helpers
└── ...
```

**Constants** (`src/constants/`) — for magic values, enums, route paths:
```
src/constants/
├── routes.ts                ← all app routes as constants
├── api-endpoints.ts         ← all API path strings
└── app-config.ts            ← app-wide config values
```

---

## Step 4 — Clean Up Pages

After extracting components and logic, each `page.tsx` should:
- Contain **only** layout composition and page-level orchestration
- Import components from `src/components/`
- Import hooks from `src/hooks/`
- Have **no inline component definitions**
- Have **no raw fetch/API calls** — all API calls go through service files or hooks
- Be readable end-to-end in under 100 lines where possible

---

## Step 5 — Fix All Sonar & Lint Issues

Run `pnpm lint` and address every warning and error:
- Remove all unused imports, variables, and functions
- Replace magic numbers with named constants
- Break down functions longer than 30 lines into smaller focused functions
- Remove all `any` types — replace with proper TypeScript interfaces
- Ensure all async functions handle errors with `try/catch`
- Remove all `console.log` statements left from development
- Ensure consistent code style throughout — no mixed patterns

---

## Step 6 — Remove Dead Code

- Delete all commented-out code blocks
- Delete all dummy/mock data that is no longer used
- Delete any files that are no longer imported anywhere
- Delete any utility functions that are never called

---

## Step 7 — Build Verification

Before marking complete:
- Run `pnpm lint` — zero errors, zero warnings
- Run `pnpm build` — clean build with no TypeScript errors
- Spot-check 5 key user flows to ensure nothing broke during refactor:
  1. Sign in → view profile
  2. Browse products → view product detail
  3. Admin: manage products
  4. Admin: manage banners
  5. Admin: manage users

---

## Step 8 — Write Refactor Summary

After completing the refactor, create a summary document at:
```
docs/summaries/refactor-summary.md
```

Following the same structure and format as existing summary files in `docs/summaries/`, the document must cover:

- **Audit findings** — what was found before refactor (with specific examples)
- **Components extracted** — list of new shared components created, what they replaced
- **Logic extracted** — list of new hooks, utils, constants created
- **Pages cleaned up** — list of pages that were simplified and what was moved out
- **Sonar/lint fixes** — categories of issues resolved and approximate count
- **Dead code removed** — what was deleted
- **Before/after comparison** — pick 2-3 representative files and show the before/after structure
- **Conventions established** — document the patterns future contributors should follow to keep the codebase clean