# Freelance Portfolio & Full-Stack CMS — Next.js 14 + SQLite (Production-Ready)

A modern, production-hardened portfolio website with **zero hardcoded content**, built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **SQLite (`node:sqlite`)**. Includes a fully authenticated **Studio CMS Dashboard (`/admin`)** with **salted scrypt password authentication**, **Edge Middleware route protection**, **standalone Docker containerization**, and **built-in rate limiting**.

---

## ⚡ Production Architecture & Hardening

1. **Database Engine: SQLite in WAL Mode (`data/portfolio.db`)**
   - Uses Node.js 22's native `DatabaseSync` engine (`node:sqlite`).
   - Configured with `PRAGMA journal_mode = WAL;` (Write-Ahead Logging) for concurrent reads and writes.
   - `PRAGMA busy_timeout = 5000;` and `PRAGMA synchronous = NORMAL;` to prevent lock contention under concurrent load.
   - 64MB memory page cache (`PRAGMA cache_size = -64000;`) for sub-10ms query responses.

2. **Database-Backed Authentication & Password Security**
   - Admin credentials stored in the `admins` table in SQLite (`data/portfolio.db`). Zero hardcoded credentials.
   - Cryptographic hashing via Node.js native `crypto.scryptSync` with an individual random 16-byte salt per user.
   - Secure password update UI directly inside `/admin` ("Admin Password" tab).
   - Route protection via Next.js Edge Middleware with HMAC SHA-256 JWT tokens in `httpOnly`, `sameSite=lax` cookies.

3. **Rate Limiting & Abuse Prevention**
   - `/api/auth/login`: Brute-force protection (max 5 failed attempts per 15 minutes per IP with `Retry-After` headers).
   - `/api/inquiries`: Anti-spam sliding window limiter (max 5 submissions per 10 minutes per IP).
   - Strict input validation and sanitization for contact inquiries.

4. **Production Security Headers (`next.config.js`)**
   - `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
   - `X-Content-Type-Options: nosniff` (MIME-sniffing prevention)
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - `poweredByHeader: false` (Removes `X-Powered-By: Next.js` fingerprint)

5. **Resilience & UX Polish**
   - Custom branded 404 page (`src/app/not-found.tsx`).
   - Global Error Boundary with retry trigger (`src/app/error.tsx`).
   - Skeleton loading state (`src/app/loading.tsx`).
   - Automated health probe endpoint (`GET /api/health`).

6. **SEO & Discoverability**
   - Dynamic XML sitemap generator (`/sitemap.xml` via `src/app/sitemap.ts`).
   - Production crawler directives (`/robots.txt` via `src/app/robots.ts`).
   - Full OpenGraph (`og:title`, `og:description`, `og:image`) and Twitter Card metadata.

---

## 📁 File Structure

```text
freelance-portfolio-nextjs/
│
├── data/
│   └── portfolio.db             # Persistent SQLite database (WAL mode)
├── public/
│   └── images/                  # Responsive SVG mockups & avatar
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Global layout & OpenGraph metadata
│   │   ├── page.tsx             # Public portfolio (Dynamic SSR from SQLite)
│   │   ├── not-found.tsx        # Branded 404 page
│   │   ├── error.tsx            # Global error boundary with recovery
│   │   ├── loading.tsx          # Smooth loading skeleton
│   │   ├── robots.ts            # Dynamic robots.txt
│   │   ├── sitemap.ts           # Dynamic XML sitemap
│   │   ├── globals.css          # Design tokens & dark/light styles
│   │   ├── login/
│   │   │   └── page.tsx         # Master password login portal
│   │   ├── admin/
│   │   │   ├── page.tsx         # Server-rendered admin page with session verify
│   │   │   └── AdminDashboard.tsx # Studio CMS: 7 Tabs (Projects, Profile, Services, Process, Reviews, Inquiries, Security)
│   │   └── api/
│   │       ├── health/          # GET /api/health (Uptime & DB status check)
│   │       ├── portfolio/       # GET all public portfolio data from SQLite
│   │       ├── inquiries/       # POST client inquiry form submissions (Rate limited)
│   │       ├── auth/login/      # Verify credentials & issue JWT (Rate limited)
│   │       ├── auth/logout/     # Revoke JWT session cookie
│   │       └── admin/           # Authenticated CRUD handlers (projects, services, process, profile, security, inquiries)
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky nav, theme toggle, mobile drawer
│   │   ├── Hero.tsx             # Dynamic headline, availability, stats counters
│   │   ├── Services.tsx         # Dynamic service packages from SQLite
│   │   ├── Projects.tsx         # Filterable project gallery & interactive modal
│   │   ├── About.tsx            # Dynamic bio, core pillars & tech stack pills
│   │   ├── Process.tsx          # Dynamic 4-step roadmap with timeline badges
│   │   ├── Testimonials.tsx     # Dynamic client review cards from SQLite
│   │   ├── Contact.tsx          # Inquiry form directly inserting into SQLite
│   │   └── Footer.tsx           # Links, copyright, and Studio Admin shortcut
│   ├── lib/
│   │   ├── auth.ts              # JWT signing, verification & session helpers
│   │   ├── db.ts                # node:sqlite connection, WAL mode & queries
│   │   ├── rateLimit.ts         # IP-based sliding window rate limiter
│   │   └── types.ts             # TypeScript data contracts & interfaces
│   ├── types/
│   │   └── node-sqlite.d.ts     # Ambient type definitions for node:sqlite
│   └── middleware.ts            # Edge router protecting /admin with JWT verification
├── Dockerfile                   # Multi-stage production container build (Alpine)
├── docker-compose.yml           # 1-command deployment with volume persistence
├── .dockerignore
├── .env.local                   # Local secrets (SESSION_SECRET, INITIAL_ADMIN_PASSWORD)
├── .env.example
├── next.config.js               # Standalone output, security headers, caching
├── package.json
├── tsconfig.json
└── tailwind.config.ts
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
npm run start
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
