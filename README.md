# Freelance Portfolio & Full-Stack CMS — Next.js 14 + SQLite (Production-Ready)

A modern, production-hardened portfolio website with **zero hardcoded content**, built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **SQLite (`node:sqlite`)**. Includes a fully authenticated **Studio CMS Dashboard (`/admin`)** with **salted scrypt password authentication**, **Edge Middleware route protection**, **standalone Docker containerization**, and **built-in rate limiting**.

---

## ⚡ Production Architecture & Hardening

### 1. Database Engine: SQLite in WAL Mode (`data/portfolio.db`)
- Powered by Node.js 22's native `DatabaseSync` engine (`node:sqlite`) — zero external native C++ compilation or third-party database subscriptions required.
- **WAL Mode (Write-Ahead Logging)** enabled (`PRAGMA journal_mode = WAL;` and `PRAGMA synchronous = NORMAL;`) to allow concurrent non-blocking reads while writes commit seamlessly.
- `PRAGMA busy_timeout = 5000;` prevents `SQLITE_BUSY` lock contention under concurrent load.
- 64MB memory page cache (`PRAGMA cache_size = -64000;`) delivering sub-10ms query responses.

### 2. Database Schema (7 Relational Tables)
The database schema is fully managed in [`src/lib/db.ts`](src/lib/db.ts):

| Table | What it stores | Managed via Admin? |
| :--- | :--- | :--- |
| **`profiles`** | Your name, role, email, location, availability badge, hero headline, intro, full bio, 4 counter stats, core tech stack tags, 4 philosophy pillars, and social URLs. | Yes (`/admin` → Profile & Stack tab) |
| **`projects`** | Case studies, titles, categories (Design, Dev, E-Com, Redesign), badges, image paths, summaries, challenge, solution, metric outcomes, and live URLs. | Yes (`/admin` → Projects tab) |
| **`services`** | Service packages, starting price tags, descriptions, and lists of bullet deliverables. | Yes (`/admin` → Services & Pricing tab) |
| **`process_steps`** | Sequential client roadmap: step numbers (01, 02...), timeline badges ("Week 1"), titles, descriptions, and deliverables. | Yes (`/admin` → Process Steps tab) |
| **`testimonials`** | Client reviews: client name, company, role, initials avatar, star rating (1–5), and testimonial quote. | Yes (`/admin` → Testimonials tab) |
| **`inquiries`** | Form submissions sent by prospective clients from the contact section (name, email, company, service requested, budget, timestamp, message). | Yes (`/admin` → Inquiries tab) |
| **`admins`** | Admin account credentials: username, password hash, and salt. | Yes (`/admin` → Admin Password tab) |

---

### 3. How Data Flows (Zero Hardcoded Data)

```text
       SQLite Database (`data/portfolio.db`)
                       │
                       ▼
      `src/app/page.tsx` (Next.js Server Component)
                       │
     ┌─────────────────┼──────────────────┐
     ▼                 ▼                  ▼
<Hero />          <Services />       <Projects />
(headline, stats,  (packages,         (filtered cards,
 availability)     deliverables)      case study modal)
     │                 │                  │
     ▼                 ▼                  ▼
<About />         <Process />        <Testimonials />
(bio, pillars,    (timeline,         (reviews,
 toolstack pills)  milestones)        ratings)
```

1. When a visitor loads the site, [`src/app/page.tsx`](src/app/page.tsx) executes on the server (`revalidate = 0`).
2. It calls `getDatabase()` from [`src/lib/db.ts`](src/lib/db.ts) and reads the latest state from SQLite.
3. It passes this data down to individual components as typed props.
4. **No hardcoded content**: Updating your headline, services, projects, or bio in `/admin` reflects immediately on the live website.

---

### 4. Database-Backed Authentication & Security
- **No Hardcoded Passwords**: Admin credentials are never stored in plaintext or hardcoded in configuration files. They reside in SQLite (`admins` table).
- **Salted Scrypt Hashing**: Passwords are hashed using Node's native `crypto.scryptSync` with an individual random 16-byte salt per user. Safe comparison uses `crypto.timingSafeEqual` to prevent timing attacks.
- **Dynamic Password Updating**: In `/admin` under **"Admin Password"**, you can change your username and password anytime without modifying code or restarting the server.
- **Edge Middleware Route Protection** ([`src/middleware.ts`](src/middleware.ts)): Intercepts all traffic to `/admin/:path*`. Unauthenticated requests redirect to `/login?from=/admin`. Authenticated admins visiting `/login` redirect to `/admin`.
- **JWT Session Tokens**: HMAC SHA-256 JWT stored in a secure, `httpOnly`, `sameSite=lax` cookie valid for 7 days.

---

### 5. Rate Limiting & Abuse Prevention ([`src/lib/rateLimit.ts`](src/lib/rateLimit.ts))
- `/api/auth/login`: Brute-force protection (max 5 failed attempts per 15 minutes per IP with standard `Retry-After` HTTP 429 headers).
- `/api/inquiries`: Anti-spam sliding window limiter (max 5 submissions per 10 minutes per IP) with email regex validation and payload sanitization.

---

### 6. Production Security Headers ([`next.config.js`](next.config.js))
- `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
- `X-Content-Type-Options: nosniff` (MIME-sniffing prevention)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `poweredByHeader: false` (Removes `X-Powered-By: Next.js` fingerprint)

---

### 7. Resilience & Production UX Polish
- Custom branded 404 page ([`src/app/not-found.tsx`](src/app/not-found.tsx)).
- Global Error Boundary with 1-click retry trigger ([`src/app/error.tsx`](src/app/error.tsx)).
- Animated loading skeleton ([`src/app/loading.tsx`](src/app/loading.tsx)).
- Automated health probe endpoint ([`src/app/api/health/route.ts`](src/app/api/health/route.ts)).

---

### 8. SEO & Discoverability
- Dynamic XML sitemap generator ([`/sitemap.xml`](src/app/sitemap.ts)).
- Production crawler directives ([`/robots.txt`](src/app/robots.ts)) (allows public pages, disallows `/admin` and `/api/*`).
- Full OpenGraph (`og:title`, `og:description`, `og:image`) and Twitter Card metadata ([`src/app/layout.tsx`](src/app/layout.tsx)).

---

## 📁 Project Directory Structure (Enterprise Standard)

```text
freelance-portfolio-nextjs/
│
├── .dockerignore                 # Excludes build caches/node_modules from container image
├── .env.example                  # Template with non-sensitive env variable placeholders
├── .env.local                    # Secret keys (JWT secret, initial admin seed password)
├── .gitignore                    # Standard Next.js & SQLite temporary file exclusions
├── docker-compose.yml            # 1-command production container orchestration with volumes
├── Dockerfile                    # Multi-stage Alpine container build (standalone output)
├── next.config.js                # Standalone output, security headers & caching
├── package.json                  # Dependencies & scripts
├── postcss.config.js             # PostCSS plugins for Tailwind
├── tailwind.config.ts            # Tailwind CSS design system tokens
├── tsconfig.json                 # Strict TypeScript configuration with `@/*` path alias
│
├── data/                         # Persistent Database Layer
│   └── portfolio.db              # SQLite database file (WAL mode)
│
├── public/                       # Static Assets served directly by the web server
│   └── images/                   # Responsive SVG mockups & avatar
│
└── src/                          # Clean Source Directory Isolation
    ├── middleware.ts             # Next.js Edge Middleware (guards /admin with JWTs)
    │
    ├── types/                    # Ambient TypeScript Declarations
    │   └── node-sqlite.d.ts      # Type definitions for native node:sqlite
    │
    ├── lib/                      # Core Business Logic & Shared Utilities
    │   ├── auth.ts               # JWT signing, verification & session handling
    │   ├── db.ts                 # SQLite connection, schema, queries & mutations
    │   ├── rateLimit.ts          # IP-based sliding window rate limiter
    │   └── types.ts              # Data contracts and TypeScript interfaces
    │
    ├── components/               # Pure UI Presentation Layer (Reusable React Components)
    │   ├── Navbar.tsx            # Sticky navigation, mobile menu & theme toggle
    │   ├── Hero.tsx              # Availability badge, dynamic headline & live counters
    │   ├── Services.tsx          # 4 service packages & deliverables
    │   ├── Projects.tsx          # Filterable project gallery & case study modal
    │   ├── About.tsx             # Bio, core philosophy pillars & toolstack pills
    │   ├── Process.tsx           # 4-step workflow roadmap with timeline badges
    │   ├── Testimonials.tsx      # Client review cards & star ratings
    │   ├── Contact.tsx           # Inquiry submission form
    │   └── Footer.tsx            # Links, copyright & Studio Admin shortcut
    │
    └── app/                      # Next.js 14 App Router (Routing, Pages & API)
        ├── layout.tsx            # Root layout, Google Fonts & OpenGraph metadata
        ├── page.tsx              # Homepage (Server Component reading SQLite)
        ├── globals.css           # Tailwind base, utilities & color tokens
        ├── loading.tsx           # Next.js Suspense animated loading skeleton
        ├── error.tsx             # Global Error Boundary with "Try Again" recovery
        ├── not-found.tsx         # Custom branded 404 page
        ├── robots.ts             # Dynamic `/robots.txt` generator
        ├── sitemap.ts            # Dynamic `/sitemap.xml` generator
        │
        ├── login/
        │   └── page.tsx          # Public authentication route: `/login`
        │
        ├── admin/                # Protected CMS Route: `/admin`
        │   ├── page.tsx          # Server Component passing DB data to the dashboard
        │   └── AdminDashboard.tsx# Client Component (Tabbed CMS interface)
        │
        └── api/                  # Backend REST API Route Handlers
            ├── health/route.ts   # GET /api/health (Container & DB uptime monitor)
            ├── portfolio/route.ts# GET /api/portfolio (Public data)
            ├── inquiries/route.ts# POST /api/inquiries (Contact briefs with rate limit)
            ├── auth/
            │   ├── login/route.ts  # POST /api/auth/login (Database credential verify)
            │   └── logout/route.ts # POST /api/auth/logout (Revoke session cookie)
            └── admin/            # Authenticated CRUD Route Handlers
                ├── inquiries/route.ts
                ├── process/route.ts
                ├── profile/route.ts
                ├── projects/route.ts
                ├── security/route.ts
                ├── services/route.ts
                └── testimonials/route.ts
```

---

## 🚀 Running Locally

### 1. Start Development Server
```bash
cd C:\Users\Soham\.gemini\antigravity\scratch\freelance-portfolio-nextjs
npm run dev
```

### 2. Access in Browser
- **Public Portfolio**: [http://localhost:3000](http://localhost:3000)
- **Admin Login**: [http://localhost:3000/login](http://localhost:3000/login)
  - Default initial credentials: **Username:** `admin` | **Password:** `admin123`
- **Admin CMS Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Health Probe**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Robots**: [http://localhost:3000/robots.txt](http://localhost:3000/robots.txt)
- **Sitemap**: [http://localhost:3000/sitemap.xml](http://localhost:3000/sitemap.xml)

---

## 🛠️ Managing Content via the Admin Dashboard

The CMS at `/admin` includes 7 dedicated tabs:

1. **Projects Tab**: Add, edit, or delete case studies with categories, badges, summaries, challenges, solutions, and bullet results.
2. **Profile & Stack Tab**: Live-edit your name, role, location, email, availability badge, hero headline, intro, bio, 4 counter stats, toolstack tags, 4 pillars, and social URLs.
3. **Services & Pricing Tab**: Edit service titles, price badges, descriptions, and bullet deliverables.
4. **Process Steps Tab**: Customize workflow milestones: step numbers, timeline badges ("Week 1"), titles, descriptions, and deliverables.
5. **Testimonials Tab**: Add, edit, or delete client review quotes, star ratings, and company affiliations.
6. **Inquiries Tab**: Review client briefs submitted via the contact form, with 1-click email replies and deletion.
7. **Admin Password Tab**: Change your admin username and password directly in the database.

---

## 🧪 Automated Testing Suite

The repository includes an end-to-end regression and verification suite ([`tests/e2e-suite.js`](tests/e2e-suite.js)) covering 65 automated checks across the database engine, public pages, security headers, authentication, edge middleware, and admin CRUD operations:

```bash
npm test
```

### Test Coverage Highlights:
- **Database Engine**: WAL mode check, foreign key enforcement, 7-table schema audit, and scrypt cryptographic hash verification.
- **Health & Metadata**: `/api/health` db latency check, `/robots.txt` crawler rules, `/sitemap.xml` XML validation.
- **Security Headers**: HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
- **Inquiries API**: Email regex validation, missing required fields, payload sanitization, SQLite persistence.
- **Auth & Edge Middleware**: Unauthenticated route guard redirecting to `/login`, invalid credential rejection (401), JWT `admin_session_token` issuance, and clean cookie invalidation on logout.
- **Admin CMS CRUD**: Complete add/update/delete cycle for projects, testimonials, profile, and security settings.

---

## 🐳 Production Deployment with Docker (Recommended)

The application includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml`:

```bash
docker compose up -d --build
```

- **Tiny Image**: Uses Next.js standalone output tracing on Alpine Linux (~120MB).
- **Persistent Storage**: Maps a named volume (`portfolio_data:/app/data`) so the SQLite database survives container restarts and upgrades.
- **Auto Healthcheck**: Pings `/api/health` every 30s.
- **Unprivileged User**: Runs as `nextjs:nodejs` (non-root) for container security.

---

## 🌐 Production Deployment on VPS / Cloud Platforms (Railway, Render, Fly.io, DigitalOcean)

Run the production build:
```bash
npm run build
npm start
```

### Required Environment Variables:
| Variable | Description | Example |
| :--- | :--- | :--- |
| `SESSION_SECRET` | 32+ character random string for signing JWT cookies | `a8f9c1e4d2b7...` |
| `INITIAL_ADMIN_PASSWORD` | Optional password for very first database creation | `StrongPassword123!` |
| `NEXT_PUBLIC_SITE_URL` | Production domain used for sitemaps & OpenGraph | `https://yourdomain.com` |
| `PORT` | Web port | `3000` |

> [!IMPORTANT]
> When deploying to containerized hosts (Railway, Render, Fly.io), attach a **persistent volume** to `/app/data` so your SQLite database (`portfolio.db`) is preserved across redeploys.
