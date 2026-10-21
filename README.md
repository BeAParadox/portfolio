# Freelance Portfolio & Authenticated CMS — Next.js 14 (App Router)

A modern, high-converting portfolio website for freelance web designers and developers built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. Features a protected **Studio CMS Dashboard (`/admin`)** with **secure password authentication (JWT session cookies)** and a **central database layer (`data/portfolio-db.json`)**.

---

## ⚡ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with Dark & Light mode)
- **Icons**: Lucide React
- **Authentication**: `jose` (JWT cookie sessions, Edge Middleware route protection)
- **Database**: File-backed JSON database with in-memory caching (`src/lib/db.ts` → `data/portfolio-db.json`)
- **API Routes**: Next.js Route Handlers (`/api/portfolio`, `/api/inquiries`, `/api/auth/*`, `/api/admin/*`)

---

## 📁 File Structure

```text
freelance-portfolio-nextjs/
│
├── public/
│   └── images/                 # Custom SVG mockups & avatar
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (Google Fonts Plus Jakarta & Outfit)
│   │   ├── page.tsx            # Public portfolio homepage (SSR with database)
│   │   ├── globals.css         # Tailwind directives & CSS design tokens
│   │   ├── login/
│   │   │   └── page.tsx        # Admin login portal with password verification
│   │   ├── admin/
│   │   │   ├── page.tsx        # Server-rendered admin page
│   │   │   └── AdminDashboard.tsx # Client CMS: Projects CRUD, Profile, Inquiries
│   │   └── api/
│   │       ├── portfolio/      # GET public portfolio data
│   │       ├── inquiries/      # POST client contact briefs
│   │       ├── auth/           # Login & logout route handlers
│   │       └── admin/          # Protected CRUD route handlers
│   ├── components/
│   │   ├── Navbar.tsx          # Responsive navigation & theme switcher
│   │   ├── Hero.tsx            # Headline, availability badge & trust stats
│   │   ├── Services.tsx        # 4 service packages & solo advantage card
│   │   ├── Projects.tsx        # Filterable project grid & case study modal
│   │   ├── About.tsx           # Bio, philosophy pillars & toolstack
│   │   ├── Process.tsx         # 4-step streamlined project roadmap
│   │   ├── Testimonials.tsx    # 5-star client review cards
│   │   ├── Contact.tsx         # Interactive inquiry form & email copy
│   │   └── Footer.tsx          # Copyright, links, & Studio Admin shortcut
│   ├── lib/
│   │   ├── auth.ts             # JWT token generation & password check
│   │   ├── db.ts               # Database CRUD operations
│   │   └── types.ts            # TypeScript interfaces
│   └── middleware.ts           # Route guard protecting /admin and redirecting to /login
├── data/
│   └── portfolio-db.json       # Central database file
├── .env.local                  # Local secrets (ADMIN_PASSWORD, SESSION_SECRET)
├── .env.example                # Template for production deployment
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Next.js Dev Server
```bash
npm run dev
```

### 3. Open in Browser
- **Public Portfolio**: [http://localhost:3000](http://localhost:3000)
- **Studio CMS Login**: [http://localhost:3000/login](http://localhost:3000/login)
  - Default master password: `admin123` *(change in `.env.local`)*
- **Protected Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Authentication & Route Protection

The admin portal is protected by **Next.js Edge Middleware** ([`src/middleware.ts`](src/middleware.ts)):
- When an unauthorized visitor navigates to `/admin`, the middleware redirects them to `/login`.
- After successful login, an `httpOnly`, `sameSite` session cookie is stored.
- When an authenticated admin visits `/login`, they are automatically redirected to `/admin`.
- Clicking **"Log Out"** destroys the session cookie and revokes access.

---

## 🌐 1-Click Production Deployment

### Option A: Vercel (Recommended — Free & Serverless)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel automatically detects Next.js.
4. Under **Environment Variables**, add:
   - `ADMIN_PASSWORD` = `YourCustomStrongPassword123!`
   - `SESSION_SECRET` = `AnyRandom32CharacterSecretString!`
5. Click **"Deploy"**. Your Next.js portfolio and authenticated CMS are live!

### Option B: Render / Railway / VPS

Run:
```bash
npm run build
npm start
```
Configure `ADMIN_PASSWORD` and `SESSION_SECRET` in your platform's environment variables dashboard.
# compony-portalv1
# compony-portalv1
# compony-portalv1
# portfolio
