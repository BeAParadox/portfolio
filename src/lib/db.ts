import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { 
  PortfolioDatabase, 
  Profile, 
  Project, 
  Service, 
  ProcessStep, 
  Testimonial, 
  Inquiry,
  AdminUser,
  StatItem,
  SocialLinks,
  PillarItem
} from './types';
import { safeJsonParse, serializeJson } from './json';
import {
  isMySqlConfigured,
  getMySqlPortfolioDatabase,
  updateMySqlProfile,
  createMySqlProject,
  updateMySqlProject,
  deleteMySqlProject,
  updateMySqlServices,
  updateMySqlProcessSteps,
  createMySqlTestimonial,
  updateMySqlTestimonial,
  deleteMySqlTestimonial,
  createMySqlInquiry,
  deleteMySqlInquiry,
  verifyMySqlAdminCredentials,
  updateMySqlAdminCredentials
} from './mysql';

export { safeJsonParse, serializeJson, isMySqlConfigured };

/**
 * Resolves the SQLite database file path.
 * 
 * In serverless environments (Vercel, AWS Lambda, Netlify), the project directory
 * (/var/task) is mounted as a strictly READ-ONLY filesystem.
 * To allow writes (INSERT, UPDATE, DELETE) without throwing EROFS / SQLITE_READONLY 500 errors,
 * we automatically copy the bundled template database to the writable temporary directory (/tmp).
 * 
 * In standard persistent environments (Docker, Railway, VPS, Local Dev), the database
 * resides persistently in process.cwd()/data/portfolio.db.
 */
export function resolveDatabasePath(): { dbPath: string; isServerless: boolean } {
  const isServerless = !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.NOW_REGION
  );

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'portfolio-data');
    const tmpDb = path.join(tmpDir, 'portfolio.db');
    const bundledDb = path.join(process.cwd(), 'data', 'portfolio.db');

    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      if (!fs.existsSync(tmpDb) && fs.existsSync(bundledDb)) {
        fs.copyFileSync(bundledDb, tmpDb);
        console.log('Copied bundled SQLite database to writable /tmp for serverless environment.');
      }
      return { dbPath: tmpDb, isServerless: true };
    } catch (err) {
      console.warn('Serverless /tmp storage warning:', err);
      return { dbPath: tmpDb, isServerless: true };
    }
  }

  // Standard persistent storage
  const localDir = path.join(process.cwd(), 'data');
  const localDb = path.join(localDir, 'portfolio.db');

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return { dbPath: localDb, isServerless: false };
  } catch {
    // If localDir cannot be created or written (e.g. read-only container), fall back to tmp
    const fallbackDir = path.join(os.tmpdir(), 'portfolio-data');
    const fallbackDb = path.join(fallbackDir, 'portfolio.db');
    try {
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      if (!fs.existsSync(fallbackDb) && fs.existsSync(localDb)) {
        fs.copyFileSync(localDb, fallbackDb);
      }
    } catch {}
    return { dbPath: fallbackDb, isServerless: true };
  }
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const { dbPath } = resolveDatabasePath();
    dbInstance = new DatabaseSync(dbPath);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: DatabaseSync) {
  // Production SQLite Pragma Optimizations (High concurrency WAL mode & 64MB cache)
  try {
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA busy_timeout = 5000;
      PRAGMA cache_size = -64000;
      PRAGMA foreign_keys = ON;
    `);
  } catch (err) {
    console.warn('SQLite PRAGMA setup note:', err);
  }

  // 1. Create Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      subrole TEXT NOT NULL,
      location TEXT NOT NULL,
      experience TEXT NOT NULL,
      timezone TEXT NOT NULL,
      email TEXT NOT NULL,
      availability TEXT NOT NULL,
      headline TEXT NOT NULL,
      intro TEXT NOT NULL,
      bio TEXT NOT NULL,
      avatarUrl TEXT NOT NULL,
      stats TEXT NOT NULL,
      socials TEXT NOT NULL,
      skills TEXT NOT NULL,
      pillars TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      badge TEXT,
      image TEXT NOT NULL,
      tags TEXT NOT NULL,
      summary TEXT NOT NULL,
      outcome TEXT,
      client TEXT,
      timeline TEXT,
      problem TEXT,
      solution TEXT,
      results TEXT,
      liveUrl TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS process_steps (
      id TEXT PRIMARY KEY,
      stepNumber TEXT NOT NULL,
      badge TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      initials TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      quote TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      createdAt TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      serviceType TEXT NOT NULL,
      budget TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new'
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Seed Initial Portfolio Records If Empty
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles;').get() as { count: number };
  if (profileCount.count === 0) {
    const insertProfile = db.prepare(`
      INSERT INTO profiles (
        id, name, role, subrole, location, experience, timezone, email,
        availability, headline, intro, bio, avatarUrl, stats, socials, skills, pillars
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    insertProfile.run(
      'default-profile',
      '[Your Name]',
      'Freelance Web Designer & Developer',
      'Design & Code',
      '[City, Country]',
      '5+ Years Experience',
      'UTC-5 (EST) / Global Flexibility',
      'hello@yourname.dev',
      'Available for new projects · Q1/Q2 Booking',
      'Designing & building high-converting websites that elevate your brand.',
      "Hi, I'm [Your Name] — an independent freelance web designer and full-stack developer based in [City, Country]. I partner with ambitious businesses and founders to craft bespoke, ultra-fast websites that look stunning and drive measurable growth.",
      "I bridge the gap between creative visual design and robust Next.js code. With over 5+ years of experience, I turn complex business ideas into high-converting, accessible digital flagships.",
      '/images/avatar.svg',
      JSON.stringify([
        { value: "5+", label: "Years of Experience" },
        { value: "40+", label: "Websites Delivered" },
        { value: "99.8%", label: "Client Satisfaction" },
        { value: "100%", label: "On-Time Delivery" }
      ]),
      JSON.stringify({
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        dribbble: "https://dribbble.com"
      }),
      JSON.stringify([
        "Next.js 14", "React", "TypeScript", "Tailwind CSS", "Figma", "Node.js",
        "SQLite / SQL", "REST APIs", "Shopify Liquid", "WordPress / CMS", "SEO Optimization", "WCAG 2.1 AA"
      ]),
      JSON.stringify([
        { title: "User-Centric Intent", desc: "Layout, hierarchy, and micro-interactions planned around conversion." },
        { title: "Speed as a Feature", desc: "Blazing-fast load times, 95+ Core Web Vitals, zero bloat." },
        { title: "Radical Reliability", desc: "Fixed milestones, weekly Loom updates, no surprise costs." },
        { title: "Inclusive & Accessible", desc: "Engineered according to WCAG 2.1 AA accessibility guidelines." }
      ])
    );
  }

  // Process Steps
  const processCount = db.prepare('SELECT COUNT(*) as count FROM process_steps;').get() as { count: number };
  if (processCount.count === 0) {
    const insertStep = db.prepare(`
      INSERT INTO process_steps (id, stepNumber, badge, title, description, deliverables, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);

    const steps = [
      {
        id: 'step-1',
        stepNumber: '01',
        badge: 'Discovery & UX',
        title: 'Strategy & Wireframing',
        description: 'We dive deep into your brand identity, target demographic, and conversion targets.',
        deliverables: 'Competitor audit, sitemap, interactive wireframes, technical scope outline',
        sort_order: 1
      },
      {
        id: 'step-2',
        stepNumber: '02',
        badge: 'UI Design',
        title: 'Visual Prototype in Figma',
        description: 'Crafting responsive visual layouts with a comprehensive typography hierarchy.',
        deliverables: 'High-fidelity Figma file, desktop & mobile mockups, micro-interaction spec',
        sort_order: 2
      },
      {
        id: 'step-3',
        stepNumber: '03',
        badge: 'Engineering',
        title: 'Modern Next.js & Full-Stack Code',
        description: 'Turning validated designs into clean, accessible, ultra-fast Next.js code.',
        deliverables: 'Modular React components, API routes, fast page load speeds',
        sort_order: 3
      },
      {
        id: 'step-4',
        stepNumber: '04',
        badge: 'Delivery',
        title: 'QA, Speed Audit & Go-Live',
        description: 'Rigorous cross-browser testing, SEO checklist, and smooth DNS cutover.',
        deliverables: 'Domain launch, Google Analytics / Search Console setup, 30-day bug warranty',
        sort_order: 4
      }
    ];

    for (const s of steps) {
      insertStep.run(s.id, s.stepNumber, s.badge, s.title, s.description, s.deliverables, s.sort_order);
    }
  }

  // Services
  const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services;').get() as { count: number };
  if (servicesCount.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (id, title, price, description, deliverables, sort_order)
      VALUES (?, ?, ?, ?, ?, ?);
    `);

    const services = [
      {
        id: 'serv-1',
        title: 'Website Design (UI/UX)',
        price: 'From $1,800',
        description: 'Tailored Figma design concepts crafted around conversion science and distinct brand personality.',
        deliverables: JSON.stringify([
          'User research & intuitive wireframing',
          'Interactive Figma prototypes (desktop & mobile)',
          'Design system (typography, palette, components)',
          'Conversion rate optimization (CRO) focus'
        ]),
        sort_order: 1
      },
      {
        id: 'serv-2',
        title: 'Website Development',
        price: 'From $2,400',
        description: 'Modern, robust code engineered for blazing-fast load speeds, clean semantics, and effortless scalability.',
        deliverables: JSON.stringify([
          'Semantic HTML5, CSS3/Tailwind & modern JavaScript',
          'CMS integrations (WordPress, Webflow, Sanity)',
          '95+ Google Lighthouse speed & Core Web Vitals',
          'Custom animations, interactive forms & APIs'
        ]),
        sort_order: 2
      },
      {
        id: 'serv-3',
        title: 'Responsive Redesigns',
        price: 'From $1,500',
        description: 'Transform an outdated, sluggish, or mobile-unfriendly site into a modern digital flagship.',
        deliverables: JSON.stringify([
          'Full UX & technical performance audit',
          'Mobile-first responsive architecture overhaul',
          'Asset compression & load-speed remediation',
          'SEO preservation & 301 redirect management'
        ]),
        sort_order: 3
      },
      {
        id: 'serv-4',
        title: 'Ongoing Support & Care',
        price: 'From $250/mo',
        description: 'Total peace of mind after launch. Ongoing security updates, content updates, and troubleshooting.',
        deliverables: JSON.stringify([
          '24/7 uptime monitoring & cloud backups',
          'Plugin, theme & framework security patching',
          'Monthly design tweaks & content updates',
          'Dedicated priority email & Slack channel'
        ]),
        sort_order: 4
      }
    ];

    for (const s of services) {
      insertService.run(s.id, s.title, s.price, s.description, s.deliverables, s.sort_order);
    }
  }

  // Projects
  const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects;').get() as { count: number };
  if (projectsCount.count === 0) {
    const insertProj = db.prepare(`
      INSERT INTO projects (
        id, title, category, badge, image, tags, summary, outcome,
        client, timeline, problem, solution, results, liveUrl, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    const projects = [
      {
        id: 'proj-1',
        title: 'Apex Analytics — Performance Telemetry Platform',
        category: 'development web-design',
        badge: 'B2B SaaS',
        image: '/images/project-1.svg',
        tags: JSON.stringify(['UI/UX Design', 'React', 'TypeScript']),
        summary: 'End-to-end design system and responsive front-end customer portal for a high-growth cloud telemetry service.',
        outcome: 'Result: +34% user retention, sub-100ms render speeds',
        client: 'Apex Analytics Corp. (Series A Startup)',
        timeline: '6 Weeks',
        problem: 'Apex needed to replace an uninspired internal dashboard with an enterprise-grade customer portal.',
        solution: 'Designed and engineered a modular dashboard with customizable KPI widgets, dark mode optimizations, and SVG charts.',
        results: JSON.stringify([
          '+34% increase in daily active user retention',
          'Sub-100ms dashboard widget render latency',
          'Helped close 12 new enterprise pilot contracts'
        ]),
        liveUrl: 'https://example.com/apex-preview',
        sort_order: 1
      },
      {
        id: 'proj-2',
        title: 'Lumina Maison — Luxury Architectural Goods',
        category: 'ecommerce web-design',
        badge: 'E-Commerce',
        image: '/images/project-2.svg',
        tags: JSON.stringify(['Shopify', 'Editorial UI', 'Liquid']),
        summary: 'Bespoke digital boutique combining tactile editorial typography and curated storytelling galleries.',
        outcome: 'Result: +62% mobile conversion, +$85 Average Order Value',
        client: 'Lumina Maison Studio (Milan & New York)',
        timeline: '5 Weeks',
        problem: 'A high-end home lifestyle atelier required an e-commerce platform reflecting luxury catalog standards.',
        solution: 'Engineered an ultra-minimalist, typography-forward shopping experience with smooth slide-out cart.',
        results: JSON.stringify([
          'Mobile checkout completion increased by 62%',
          'Average Order Value rose by $85 within 60 days',
          'Featured in Awwwards Site of the Day Nominees'
        ]),
        liveUrl: 'https://example.com/lumina-preview',
        sort_order: 2
      },
      {
        id: 'proj-3',
        title: 'Aura Health — Telehealth & Patient Portal',
        category: 'development web-design',
        badge: 'Healthcare',
        image: '/images/project-3.svg',
        tags: JSON.stringify(['Next.js', 'HIPAA Ready', 'Tailwind']),
        summary: 'Accessible, compassionate healthcare platform connecting patients with specialized clinicians.',
        outcome: 'Result: 4.9/5 patient satisfaction score, 100% WCAG AA compliant',
        client: 'Aura Integrated Health Network',
        timeline: '8 Weeks',
        problem: 'Patients found booking clinicians confusing, resulting in high drop-off on mobile devices.',
        solution: 'Designed an ultra-clear, calming intake funnel with 3-step scheduling and high accessibility.',
        results: JSON.stringify([
          'Intake completion rate jumped from 48% to 84%',
          '100% WCAG 2.1 AA accessibility audit score',
          'Reduced customer support scheduling tickets by 55%'
        ]),
        liveUrl: 'https://example.com/aura-preview',
        sort_order: 3
      },
      {
        id: 'proj-4',
        title: 'Kinetix Digital — Creative Design Agency',
        category: 'web-design',
        badge: 'Agency',
        image: '/images/project-4.svg',
        tags: JSON.stringify(['Figma', 'Motion Design', 'Branding']),
        summary: 'High-contrast portfolio showcasing brand strategy and visual campaigns with dark aesthetics.',
        outcome: 'Result: 3x increase in inbound client project inquiries',
        client: 'Kinetix Digital Collective',
        timeline: '3 Weeks',
        problem: 'Kinetix was winning awards but losing inbound leads because their old website failed to demonstrate their visual caliber.',
        solution: 'Built an immersive, editorial agency showcase featuring dynamic case study reveals and micro-animations.',
        results: JSON.stringify([
          'Inbound enterprise leads tripled within the first quarter',
          'Average time on site increased from 42s to 3m 18s',
          'Won Special Mention on Mindsparkle Mag'
        ]),
        liveUrl: 'https://example.com/kinetix-preview',
        sort_order: 4
      },
      {
        id: 'proj-5',
        title: 'Vanguard Wealth — Private Advisory Web App',
        category: 'development',
        badge: 'Fintech',
        image: '/images/project-5.svg',
        tags: JSON.stringify(['Security', 'TypeScript', 'Charts']),
        summary: 'Institutional wealth management portal providing high-net-worth clients with real-time portfolio allocation tracking.',
        outcome: 'Result: $120M+ assets onboarded through the portal',
        client: 'Vanguard Private Capital Advisory',
        timeline: '7 Weeks',
        problem: 'A private capital boutique needed a confidential, modern portal where institutional investors could view assets.',
        solution: 'Engineered a bank-grade client dashboard with multi-factor authentication and interactive allocation charts.',
        results: JSON.stringify([
          '$120M+ client capital onboarded in first 90 days',
          'Zero security vulnerabilities reported in third-party penetration test',
          'Client retention improved by 28%'
        ]),
        liveUrl: 'https://example.com/vanguard-preview',
        sort_order: 5
      },
      {
        id: 'proj-6',
        title: 'Terra Organic — Sustainable DTC Redesign',
        category: 'redesign ecommerce',
        badge: 'Redesign',
        image: '/images/project-6.svg',
        tags: JSON.stringify(['Mobile-First', 'PageSpeed', 'E-Commerce']),
        summary: 'Comprehensive overhaul of a sluggish organic beauty shop, rewriting asset pipelines and streamlining one-click checkout.',
        outcome: 'Result: Load time cut from 6.2s to 0.8s, bounce rate down 41%',
        client: 'Terra Organic Naturals',
        timeline: '4 Weeks',
        problem: 'An organic beauty brand suffered from slow 6.2-second load times on mobile devices, leading to high bounce rates.',
        solution: 'Performed a full design overhaul: compressed media pipelines, eliminated render-blocking scripts, and designed an intuitive mobile catalog.',
        results: JSON.stringify([
          'Page load time reduced from 6.2s to 0.8s (87% improvement)',
          'Mobile bounce rate dropped by 41%',
          'Core Web Vitals scores went from Failing to all Green'
        ]),
        liveUrl: 'https://example.com/terra-preview',
        sort_order: 6
      }
    ];

    for (const p of projects) {
      insertProj.run(p.id, p.title, p.category, p.badge, p.image, p.tags, p.summary, p.outcome, p.client, p.timeline, p.problem, p.solution, p.results, p.liveUrl, p.sort_order);
    }
  }

  // Testimonials
  const testimonialsCount = db.prepare('SELECT COUNT(*) as count FROM testimonials;').get() as { count: number };
  if (testimonialsCount.count === 0) {
    const insertTest = db.prepare(`
      INSERT INTO testimonials (id, name, role, company, initials, rating, quote, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `);

    const testimonials = [
      {
        id: 'test-1',
        name: 'Alex Morgan',
        role: 'Founder',
        company: 'CloudFlow Analytics',
        initials: 'AM',
        rating: 5,
        quote: '[Your Name] took our vague ideas and transformed them into a website that genuinely looks like it cost $30k. Our inbound lead quality improved immediately, and our bounce rate dropped by 35% in week one. Working together was seamless.',
        sort_order: 1
      },
      {
        id: 'test-2',
        name: 'Elena Rostova',
        role: 'Creative Director',
        company: 'Lumina Maison',
        initials: 'ER',
        rating: 5,
        quote: 'Finding someone who understands luxury visual design AND can write fast, clean code is nearly impossible. [Your Name] exceeded every expectation for Lumina Maison. The mobile checkout is lightning fast and our customers love it.',
        sort_order: 2
      },
      {
        id: 'test-3',
        name: 'David Chen',
        role: 'VP of Growth',
        company: 'Horizon Capital',
        initials: 'DC',
        rating: 5,
        quote: 'Every single deadline was hit ahead of schedule. The weekly Loom check-ins were fantastic, and [Your Name]’s proactive suggestions for conversion rate optimization made a huge difference to our bottom line. Highly recommended!',
        sort_order: 3
      }
    ];

    for (const t of testimonials) {
      insertTest.run(t.id, t.name, t.role, t.company, t.initials, t.rating, t.quote, t.sort_order);
    }
  }

  // Admin Account (scrypt hashed)
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins;').get() as { count: number };
  if (adminCount.count === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
    const hash = crypto.scryptSync(initialPassword, salt, 64).toString('hex');
    const now = new Date().toISOString();

    const insertAdmin = db.prepare(`
      INSERT INTO admins (id, username, password_hash, salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `);
    insertAdmin.run('admin-1', 'admin', hash, salt, now, now);
  }
}

// ------------------- INTERNAL SQLITE CRUD IMPLEMENTATIONS -------------------

export function getSqlitePortfolioDatabase(): PortfolioDatabase {
  const db = getDb();
  
  // Profile
  const profileRow = db.prepare('SELECT * FROM profiles WHERE id = ?;').get('default-profile') as Record<string, string>;
  const profile: Profile = profileRow ? {
    id: profileRow.id,
    name: profileRow.name,
    role: profileRow.role,
    subrole: profileRow.subrole,
    location: profileRow.location,
    experience: profileRow.experience,
    timezone: profileRow.timezone,
    email: profileRow.email,
    availability: profileRow.availability,
    headline: profileRow.headline,
    intro: profileRow.intro,
    bio: profileRow.bio,
    avatarUrl: profileRow.avatarUrl,
    stats: safeJsonParse<StatItem[]>(profileRow.stats, []),
    socials: safeJsonParse<SocialLinks>(profileRow.socials, {}),
    skills: safeJsonParse<string[]>(profileRow.skills, []),
    pillars: safeJsonParse<PillarItem[]>(profileRow.pillars, [])
  } : {
    name: '[Your Name]',
    role: 'Freelance Web Designer & Developer',
    subrole: 'Design & Code',
    location: '[City, Country]',
    experience: '5+ Years Experience',
    timezone: 'UTC-5',
    email: 'hello@yourname.dev',
    availability: 'Available for projects',
    headline: 'Designing & building high-converting websites',
    intro: '',
    bio: '',
    avatarUrl: '/images/avatar.svg',
    stats: [],
    socials: {},
    skills: [],
    pillars: []
  };

  // Projects
  const projectRows = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC;').all() as Array<Record<string, unknown>>;
  const projects: Project[] = projectRows.map(r => ({
    id: r.id as string,
    title: r.title as string,
    category: r.category as string,
    badge: (r.badge as string) || undefined,
    image: r.image as string,
    tags: safeJsonParse<string[]>(r.tags, []),
    summary: r.summary as string,
    outcome: (r.outcome as string) || undefined,
    client: (r.client as string) || undefined,
    timeline: (r.timeline as string) || undefined,
    problem: (r.problem as string) || undefined,
    solution: (r.solution as string) || undefined,
    results: r.results ? safeJsonParse<string[]>(r.results, []) : undefined,
    liveUrl: (r.liveUrl as string) || undefined,
    sort_order: r.sort_order as number
  }));

  // Services
  const serviceRows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC;').all() as Array<Record<string, unknown>>;
  const services: Service[] = serviceRows.map(r => ({
    id: r.id as string,
    title: r.title as string,
    price: r.price as string,
    description: r.description as string,
    deliverables: safeJsonParse<string[]>(r.deliverables, []),
    sort_order: r.sort_order as number
  }));

  // Process Steps
  const stepRows = db.prepare('SELECT * FROM process_steps ORDER BY sort_order ASC;').all() as Array<Record<string, unknown>>;
  const processSteps: ProcessStep[] = stepRows.map(r => ({
    id: r.id as string,
    stepNumber: r.stepNumber as string,
    badge: r.badge as string,
    title: r.title as string,
    description: r.description as string,
    deliverables: r.deliverables as string,
    sort_order: r.sort_order as number
  }));

  // Testimonials
  const testRows = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC;').all() as Array<Record<string, unknown>>;
  const testimonials: Testimonial[] = testRows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    role: r.role as string,
    company: r.company as string,
    initials: r.initials as string,
    rating: r.rating as number,
    quote: r.quote as string,
    sort_order: r.sort_order as number
  }));

  // Inquiries
  const inqRows = db.prepare('SELECT * FROM inquiries ORDER BY createdAt DESC;').all() as Array<Record<string, unknown>>;
  const inquiries: Inquiry[] = inqRows.map(r => ({
    id: r.id as string,
    createdAt: r.createdAt as string,
    name: r.name as string,
    email: r.email as string,
    company: (r.company as string) || undefined,
    serviceType: r.serviceType as string,
    budget: r.budget as string,
    message: r.message as string,
    status: (r.status as 'new' | 'read') || 'new'
  }));

  // Admin User Profile (Safe: excludes password_hash and salt)
  const adminRow = db.prepare('SELECT id, username, created_at, updated_at FROM admins LIMIT 1;').get() as Record<string, string> | undefined;
  const adminUser: AdminUser | undefined = adminRow ? {
    id: adminRow.id,
    username: adminRow.username,
    created_at: adminRow.created_at,
    updated_at: adminRow.updated_at
  } : undefined;

  const { isServerless } = resolveDatabasePath();

  return {
    profile,
    projects,
    services,
    processSteps,
    testimonials,
    inquiries,
    adminUser,
    isServerless
  };
}

function updateSqliteProfile(updates: Partial<Profile>): Profile {
  const db = getDb();
  const current = getSqlitePortfolioDatabase().profile;
  const merged: Profile = { ...current, ...updates };

  const stmt = db.prepare(`
    UPDATE profiles SET
      name = ?, role = ?, subrole = ?, location = ?, experience = ?, timezone = ?,
      email = ?, availability = ?, headline = ?, intro = ?, bio = ?, avatarUrl = ?,
      stats = ?, socials = ?, skills = ?, pillars = ?
    WHERE id = 'default-profile';
  `);

  stmt.run(
    merged.name,
    merged.role,
    merged.subrole,
    merged.location,
    merged.experience,
    merged.timezone,
    merged.email,
    merged.availability,
    merged.headline,
    merged.intro,
    merged.bio,
    merged.avatarUrl,
    serializeJson(merged.stats, '[]'),
    serializeJson(merged.socials, '{}'),
    serializeJson(merged.skills, '[]'),
    serializeJson(merged.pillars, '[]')
  );

  return merged;
}

function createSqliteProject(project: Omit<Project, 'id'>): Project {
  const db = getDb();
  const id = `proj-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO projects (
      id, title, category, badge, image, tags, summary, outcome,
      client, timeline, problem, solution, results, liveUrl, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  stmt.run(
    id,
    project.title,
    project.category,
    project.badge || null,
    project.image || '/images/project-1.svg',
    serializeJson(project.tags || [], '[]'),
    project.summary,
    project.outcome || null,
    project.client || null,
    project.timeline || null,
    project.problem || null,
    project.solution || null,
    project.results ? serializeJson(project.results, '[]') : null,
    project.liveUrl || null,
    project.sort_order || 0
  );

  return { id, ...project };
}

function updateSqliteProject(id: string, updates: Partial<Project>): Project | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?;').get(id) as Record<string, unknown>;
  if (!existing) return null;

  const currentTags = safeJsonParse<string[]>(existing.tags, []);
  const currentResults = existing.results ? safeJsonParse<string[]>(existing.results, []) : null;

  const title = updates.title !== undefined ? updates.title : (existing.title as string);
  const category = updates.category !== undefined ? updates.category : (existing.category as string);
  const badge = updates.badge !== undefined ? updates.badge : (existing.badge as string);
  const image = updates.image !== undefined ? updates.image : (existing.image as string);
  const tags = updates.tags !== undefined ? serializeJson(updates.tags, '[]') : serializeJson(currentTags, '[]');
  const summary = updates.summary !== undefined ? updates.summary : (existing.summary as string);
  const outcome = updates.outcome !== undefined ? updates.outcome : (existing.outcome as string);
  const client = updates.client !== undefined ? updates.client : (existing.client as string);
  const timeline = updates.timeline !== undefined ? updates.timeline : (existing.timeline as string);
  const problem = updates.problem !== undefined ? updates.problem : (existing.problem as string);
  const solution = updates.solution !== undefined ? updates.solution : (existing.solution as string);
  const results = updates.results !== undefined ? serializeJson(updates.results, '[]') : (currentResults ? serializeJson(currentResults, '[]') : null);
  const liveUrl = updates.liveUrl !== undefined ? updates.liveUrl : (existing.liveUrl as string);

  const stmt = db.prepare(`
    UPDATE projects SET
      title = ?, category = ?, badge = ?, image = ?, tags = ?, summary = ?,
      outcome = ?, client = ?, timeline = ?, problem = ?, solution = ?, results = ?, liveUrl = ?
    WHERE id = ?;
  `);

  stmt.run(title, category, badge, image, tags, summary, outcome, client, timeline, problem, solution, results, liveUrl, id);

  return {
    id,
    title,
    category,
    badge: badge || undefined,
    image,
    tags: safeJsonParse<string[]>(tags, []),
    summary,
    outcome: outcome || undefined,
    client: client || undefined,
    timeline: timeline || undefined,
    problem: problem || undefined,
    solution: solution || undefined,
    results: results ? safeJsonParse<string[]>(results, []) : undefined,
    liveUrl: liveUrl || undefined
  };
}

function deleteSqliteProject(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM projects WHERE id = ?;').run(id);
  return info.changes > 0;
}

function updateSqliteServices(services: Service[]): Service[] {
  const db = getDb();
  db.exec('DELETE FROM services;');
  const stmt = db.prepare(`
    INSERT INTO services (id, title, price, description, deliverables, sort_order)
    VALUES (?, ?, ?, ?, ?, ?);
  `);

  services.forEach((s, idx) => {
    const id = s.id || `serv-${idx + 1}`;
    stmt.run(id, s.title, s.price, s.description, serializeJson(s.deliverables || [], '[]'), idx + 1);
  });

  return services;
}

function updateSqliteProcessSteps(steps: ProcessStep[]): ProcessStep[] {
  const db = getDb();
  db.exec('DELETE FROM process_steps;');
  const stmt = db.prepare(`
    INSERT INTO process_steps (id, stepNumber, badge, title, description, deliverables, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `);

  steps.forEach((s, idx) => {
    const id = s.id || `step-${idx + 1}`;
    stmt.run(id, s.stepNumber, s.badge, s.title, s.description, s.deliverables, idx + 1);
  });

  return steps;
}

function createSqliteTestimonial(testimonial: Omit<Testimonial, 'id'>): Testimonial {
  const db = getDb();
  const id = `test-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO testimonials (id, name, role, company, initials, rating, quote, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `);
  stmt.run(
    id,
    testimonial.name,
    testimonial.role,
    testimonial.company,
    testimonial.initials,
    testimonial.rating,
    testimonial.quote,
    testimonial.sort_order || 0
  );
  return { id, ...testimonial };
}

function updateSqliteTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?;').get(id) as Record<string, unknown>;
  if (!existing) return null;

  const name = updates.name !== undefined ? updates.name : (existing.name as string);
  const role = updates.role !== undefined ? updates.role : (existing.role as string);
  const company = updates.company !== undefined ? updates.company : (existing.company as string);
  const initials = updates.initials !== undefined ? updates.initials : (existing.initials as string);
  const rating = updates.rating !== undefined ? updates.rating : (existing.rating as number);
  const quote = updates.quote !== undefined ? updates.quote : (existing.quote as string);

  const stmt = db.prepare(`
    UPDATE testimonials SET name = ?, role = ?, company = ?, initials = ?, rating = ?, quote = ?
    WHERE id = ?;
  `);
  stmt.run(name, role, company, initials, rating, quote, id);

  return { id, name, role, company, initials, rating, quote };
}

function deleteSqliteTestimonial(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM testimonials WHERE id = ?;').run(id);
  return info.changes > 0;
}

function createSqliteInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Inquiry {
  const db = getDb();
  const id = `inq-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const status = 'new';

  const stmt = db.prepare(`
    INSERT INTO inquiries (id, createdAt, name, email, company, serviceType, budget, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  stmt.run(
    id,
    createdAt,
    inquiry.name,
    inquiry.email,
    inquiry.company || null,
    inquiry.serviceType,
    inquiry.budget,
    inquiry.message,
    status
  );

  return {
    id,
    createdAt,
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company,
    serviceType: inquiry.serviceType,
    budget: inquiry.budget,
    message: inquiry.message,
    status
  };
}

function deleteSqliteInquiry(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM inquiries WHERE id = ?;').run(id);
  return info.changes > 0;
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPasswordHash(password: string, salt: string, storedHash: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufA = Buffer.from(computed, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function verifySqliteAdminCredentials(password: string, username?: string): { success: boolean; username?: string; error?: string } {
  const db = getDb();
  let row: Record<string, string> | undefined;

  if (username && username.trim()) {
    row = db.prepare('SELECT * FROM admins WHERE LOWER(username) = LOWER(?);').get(username.trim()) as Record<string, string> | undefined;
  } else {
    row = db.prepare('SELECT * FROM admins LIMIT 1;').get() as Record<string, string> | undefined;
  }

  if (!row) {
    return { success: false, error: 'Administrator user not found in database.' };
  }

  const isValid = verifyPasswordHash(password, row.salt, row.password_hash);
  if (!isValid) {
    return { success: false, error: 'Incorrect administrator password.' };
  }

  return { success: true, username: row.username };
}

function updateSqliteAdminCredentials(currentPassword: string, newPassword?: string, newUsername?: string): { success: boolean; error?: string } {
  const db = getDb();
  const current = db.prepare('SELECT * FROM admins LIMIT 1;').get() as Record<string, string> | undefined;

  if (!current) {
    return { success: false, error: 'Admin account not found in database.' };
  }

  const isCurrentValid = verifyPasswordHash(currentPassword, current.salt, current.password_hash);
  if (!isCurrentValid) {
    return { success: false, error: 'Current password verification failed. Please check your existing password.' };
  }

  const now = new Date().toISOString();
  let updatedUsername = current.username;
  let updatedHash = current.password_hash;
  let updatedSalt = current.salt;

  if (newUsername && newUsername.trim()) {
    updatedUsername = newUsername.trim();
  }

  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    updatedSalt = generateSalt();
    updatedHash = hashPassword(newPassword.trim(), updatedSalt);
  }

  const stmt = db.prepare(`
    UPDATE admins SET
      username = ?,
      password_hash = ?,
      salt = ?,
      updated_at = ?
    WHERE id = ?;
  `);

  stmt.run(updatedUsername, updatedHash, updatedSalt, now, current.id);

  return { success: true };
}

// ------------------- UNIFIED PUBLIC DATA LAYER API (MYSQL + SQLITE FALLBACK) -------------------

/**
 * Retrieves the full portfolio database.
 * If MySQL is configured via MYSQL_URL / DATABASE_URL, queries MySQL.
 * Otherwise, falls back gracefully to SQLite.
 */
export async function getPortfolioDatabase(): Promise<PortfolioDatabase> {
  if (isMySqlConfigured()) {
    try {
      return await getMySqlPortfolioDatabase();
    } catch (err) {
      console.error('MySQL query failed, falling back to SQLite:', err);
    }
  }
  return getSqlitePortfolioDatabase();
}

/**
 * Updates developer profile attributes.
 */
export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  if (isMySqlConfigured()) {
    try {
      return await updateMySqlProfile(updates);
    } catch (err) {
      console.error('MySQL updateProfile failed, falling back to SQLite:', err);
    }
  }
  return updateSqliteProfile(updates);
}

/**
 * Creates a new showcase project.
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  if (isMySqlConfigured()) {
    try {
      return await createMySqlProject(project);
    } catch (err) {
      console.error('MySQL createProject failed, falling back to SQLite:', err);
    }
  }
  return createSqliteProject(project);
}

/**
 * Updates an existing project by ID.
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  if (isMySqlConfigured()) {
    try {
      return await updateMySqlProject(id, updates);
    } catch (err) {
      console.error('MySQL updateProject failed, falling back to SQLite:', err);
    }
  }
  return updateSqliteProject(id, updates);
}

/**
 * Deletes a project by ID.
 */
export async function deleteProject(id: string): Promise<boolean> {
  if (isMySqlConfigured()) {
    try {
      return await deleteMySqlProject(id);
    } catch (err) {
      console.error('MySQL deleteProject failed, falling back to SQLite:', err);
    }
  }
  return deleteSqliteProject(id);
}

/**
 * Replaces services with updated list.
 */
export async function updateServices(services: Service[]): Promise<Service[]> {
  if (isMySqlConfigured()) {
    try {
      return await updateMySqlServices(services);
    } catch (err) {
      console.error('MySQL updateServices failed, falling back to SQLite:', err);
    }
  }
  return updateSqliteServices(services);
}

/**
 * Replaces process steps with updated sequence.
 */
export async function updateProcessSteps(steps: ProcessStep[]): Promise<ProcessStep[]> {
  if (isMySqlConfigured()) {
    try {
      return await updateMySqlProcessSteps(steps);
    } catch (err) {
      console.error('MySQL updateProcessSteps failed, falling back to SQLite:', err);
    }
  }
  return updateSqliteProcessSteps(steps);
}

/**
 * Creates a new client testimonial.
 */
export async function createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  if (isMySqlConfigured()) {
    try {
      return await createMySqlTestimonial(testimonial);
    } catch (err) {
      console.error('MySQL createTestimonial failed, falling back to SQLite:', err);
    }
  }
  return createSqliteTestimonial(testimonial);
}

/**
 * Updates a client testimonial.
 */
export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
  if (isMySqlConfigured()) {
    try {
      return await updateMySqlTestimonial(id, updates);
    } catch (err) {
      console.error('MySQL updateTestimonial failed, falling back to SQLite:', err);
    }
  }
  return updateSqliteTestimonial(id, updates);
}

/**
 * Deletes a testimonial by ID.
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
  if (isMySqlConfigured()) {
    try {
      return await deleteMySqlTestimonial(id);
    } catch (err) {
      console.error('MySQL deleteTestimonial failed, falling back to SQLite:', err);
    }
  }
  return deleteSqliteTestimonial(id);
}

/**
 * Creates a client project inquiry.
 */
export async function createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> {
  if (isMySqlConfigured()) {
    try {
      return await createMySqlInquiry(inquiry);
    } catch (err) {
      console.error('MySQL createInquiry failed, falling back to SQLite:', err);
    }
  }
  return createSqliteInquiry(inquiry);
}

/**
 * Deletes an inquiry by ID.
 */
export async function deleteInquiry(id: string): Promise<boolean> {
  if (isMySqlConfigured()) {
    try {
      return await deleteMySqlInquiry(id);
    } catch (err) {
      console.error('MySQL deleteInquiry failed, falling back to SQLite:', err);
    }
  }
  return deleteSqliteInquiry(id);
}

/**
 * Retrieves all client inquiries.
 */
export async function getInquiries(): Promise<Inquiry[]> {
  if (isMySqlConfigured()) {
    try {
      const db = await getMySqlPortfolioDatabase();
      return db.inquiries;
    } catch (err) {
      console.error('MySQL getInquiries failed, falling back to SQLite:', err);
    }
  }
  return getSqlitePortfolioDatabase().inquiries;
}

/**
 * Verifies admin password hash using scrypt timing-safe equality.
 */
export async function verifyAdminCredentials(
  password: string,
  username?: string
): Promise<{ success: boolean; username?: string; error?: string }> {
  if (isMySqlConfigured()) {
    try {
      return await verifyMySqlAdminCredentials(password, username);
    } catch (err) {
      console.error('MySQL verifyAdminCredentials failed, falling back to SQLite:', err);
    }
  }
  return verifySqliteAdminCredentials(password, username);
}

/**
 * Updates administrator username and/or password.
 */
export async function updateAdminCredentials(
  currentPassword: string,
  newPassword?: string,
  newUsername?: string
): Promise<{ success: boolean; error?: string }> {
  if (isMySqlConfigured()) {
    try {
      return await updateMySqlAdminCredentials(currentPassword, newPassword, newUsername);
    } catch (err) {
      console.error('MySQL updateAdminCredentials failed, falling back to SQLite:', err);
    }
  }
  return updateSqliteAdminCredentials(currentPassword, newPassword, newUsername);
}

// Convenient Aliases and Named Exports
export const getDatabase = getPortfolioDatabase;
export const addProject = createProject;
export const addTestimonial = createTestimonial;
export const addInquiry = createInquiry;
