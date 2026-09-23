# EMIS — City Education Management System

A city-wide **Education Management Information System** for managing schools, teachers, staff and students — with role-based access control, data scoping (city → district → school) and a full audit trail.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Prisma 7 (PostgreSQL)** and **Tailwind CSS v4**.

> **UI preview without a database:** run the dev server and open `/preview` — a clearly-labeled static demo of the dashboard and schools UI with sample data.

---

## Features

### Implemented

- **Authentication** — email/password sign-in, server-side sessions (httpOnly cookie, SHA-256 hashed tokens, 30-day expiry, sliding refresh), account lockout (5 failed attempts → 15-minute lock), scrypt password hashing.
- **Authorization (RBAC + scopes)** — permission keys per role, plus data scopes at **CITY / DISTRICT / SCHOOL** level. Every query is filtered by the caller's scope; `SUPER_ADMIN` bypasses scope checks.
- **Dashboard** — scope-filtered stats (active schools, teacher assignments, enrolled students, pending transfers), city announcements, recent audit activity.
- **Schools module (full CRUD)** — searchable, filterable, paginated list; detail page; create/edit with server-side Zod validation; soft archive with confirmation. All writes are audited with before/after snapshots.
- **Design system** — Tailwind v4 theme (indigo brand palette, card shadows), shared UI primitives (buttons, fields, cards, badges, empty/error states), custom icon set, responsive app shell with permission-aware sidebar, mobile drawer and user menu.
- **Global states** — 404, error boundary, dashboard loading skeletons.
- **Audit logging** — every create/update/archive records actor, action, entity, before/after JSON and request id, written transactionally.

### Roadmap (UI pending — data models and permissions already exist)

Teachers · Staff · Students · Transfers (review/approval workflow) · Supervision visits & inspections · Reports · Settings (users, roles, scopes) · Audit log viewer

---

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Actions, Turbopack)            |
| UI         | React 19, Tailwind CSS v4, Inter (next/font)                  |
| Database   | PostgreSQL via Prisma 7 with driver adapter (`@prisma/adapter-pg`) |
| Validation | Zod v4                                                        |
| Auth       | Custom session auth (no third-party dependency)               |
| Tooling    | TypeScript (strict), ESLint (flat config, next preset)        |

---

## Getting started

### Prerequisites

- **Node.js ≥ 22**
- A **PostgreSQL** database

### 1. Install

```bash
npm install
npm run prisma:generate
```

### 2. Configure environment

Create a `.env` file (see `.env.example`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

### 3. Migrate and seed

```bash
npm run prisma:migrate   # dev: create + apply migrations
npm run db:seed          # roles, permissions, org structure, demo users
```

### 4. Run

```bash
npm run dev              # http://localhost:3000
```

### Demo accounts

Created by the seed (password for all: `Password123!`):

| Email                       | Role              | Scope                    |
| --------------------------- | ----------------- | ------------------------ |
| `super.admin@emis.gov`      | SUPER_ADMIN       | Entire system            |
| `city.admin@emis.gov`       | CITY_ADMIN        | Addis Ababa (all districts) |
| `district.officer@emis.gov` | DISTRICT_OFFICER  | Bole district            |
| `principal@emis.gov`        | SCHOOL_PRINCIPAL  | Bole Primary School      |

Sign in with different accounts to see the sidebar and data scope change per role.

---

## Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start dev server                     |
| `npm run build`         | Production build                     |
| `npm run start`         | Start production server              |
| `npm run lint`          | ESLint                               |
| `npm run typecheck`     | `tsc --noEmit`                       |
| `npm run prisma:generate` | Generate Prisma Client             |
| `npm run prisma:migrate`  | Create/apply dev migration         |
| `npm run prisma:deploy`   | Apply migrations (CI/prod)         |
| `npm run prisma:studio`   | Prisma Studio                       |
| `npm run db:seed`         | Seed RBAC + demo data              |

---

## Architecture

Feature-sliced structure — server logic lives in features, routes stay thin:

```
src/
├── app/
│   ├── (auth)/login/          # Split-screen login page + form
│   ├── (dashboard)/           # Auth-guarded shell: dashboard, schools, modules
│   ├── preview/               # Static UI demo (no DB)
│   ├── layout.tsx             # Root layout (Inter, metadata)
│   └── globals.css            # Tailwind v4 design tokens
├── components/
│   ├── layout/                # AppShell, Sidebar, Topbar, branding
│   ├── icons.tsx              # Inline SVG icon set
│   └── ui.tsx                 # Button, Field, Card, Badge, states…
├── config/navigation.ts       # Permission-aware nav definition
├── features/
│   ├── auth/                  # actions / schemas / services
│   ├── dashboard/             # queries + components
│   └── schools/               # actions / components / queries / schemas / services
├── lib/
│   ├── auth/                  # session, password (scrypt), authorization, errors
│   ├── permissions/           # permission keys, scope filters, resource access
│   ├── audit/                 # transactional audit writer
│   ├── db/prisma.ts           # Prisma client (pg adapter, dev singleton)
│   └── format.ts              # date/number formatters
└── generated/prisma/          # Prisma Client output (generated)
prisma/
├── schema.prisma              # 25+ models: org, people, academics, workflow, RBAC
├── migrations/
└── seed.ts                    # roles, permissions, city/districts/schools, users
```

### Request flow (mutations)

```
Client form → Server Action → Zod parse → requirePermission(key)
  → scope/resource assertions → Prisma transaction
  → writeAudit(before/after) → revalidatePath → UI updates
```

### How scoping works

- Users get **roles** (which carry **permissions**) and **scopes** (CITY, DISTRICT or SCHOOL).
- Every read filters through `schoolScopeFilter` / `districtScopeFilter`; every write re-checks access with `assertSchoolAccess` / `assertDistrictAccess`.
- `SUPER_ADMIN` bypasses both — the check lives in one place, not scattered per route.

### Security notes

- Session tokens are random 256-bit values; only their SHA-256 hashes are stored. Cookies are `httpOnly`, `SameSite=Lax`, `Secure` in production.
- Login responses never reveal whether an email exists; failed attempts increment a counter that locks the account.
- Audit entries are written in the same transaction as the change they describe.

---

## UI design system

- **Tokens** defined once in `globals.css` (`@theme`): `brand` palette (indigo), card/pop shadows, Inter via `next/font`.
- **Primitives** in `src/components/ui.tsx`: buttons (primary/secondary/danger/ghost), inputs with focus rings, cards, badges (6 tones), empty states, error banners.
- **App shell**: fixed indigo sidebar (desktop) / slide-over drawer (mobile), sticky topbar with section title, notifications and account menu.
- Everything is keyboard-accessible (`aria-*`, focus rings) and respects `prefers-reduced-motion`.
