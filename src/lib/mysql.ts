import mysql from 'mysql2/promise';
import crypto from 'node:crypto';
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

let pool: mysql.Pool | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

export function isMySqlConfigured(): boolean {
  return !!(
    process.env.MYSQL_URL ||
    (process.env.DATABASE_URL && (
      process.env.DATABASE_URL.startsWith('mysql://') || 
      process.env.DATABASE_URL.startsWith('mysqls://') || 
      process.env.DATABASE_URL.startsWith('mysql2://')
    )) ||
    (process.env.MYSQL_HOST && process.env.MYSQL_DATABASE)
  );
}

export function getMySqlPool(): mysql.Pool {
  if (!pool) {
    const rawUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    if (rawUrl && (
      rawUrl.startsWith('mysql://') || 
      rawUrl.startsWith('mysqls://') || 
      rawUrl.startsWith('mysql2://')
    )) {
      const cleanUrl = rawUrl.replace(/^mysql2:\/\//, 'mysql://');
      const hasSslInUrl = cleanUrl.includes('ssl=') || cleanUrl.includes('ssl-mode=') || cleanUrl.includes('sslmode=');
      pool = mysql.createPool({
        uri: cleanUrl,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        ssl: hasSslInUrl ? undefined : { rejectUnauthorized: false }
      });
    } else {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'portfolio',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.MYSQL_SSL === 'false' ? undefined : { rejectUnauthorized: false }
      });
    }
  }
  return pool;
}

export async function ensureMySqlInitialized(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      const p = getMySqlPool();

      try {
        await p.execute(`
          CREATE TABLE IF NOT EXISTS profiles (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            subrole VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            experience VARCHAR(255) NOT NULL,
            timezone VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            availability VARCHAR(255) NOT NULL,
            headline TEXT NOT NULL,
            intro TEXT NOT NULL,
            bio TEXT NOT NULL,
            avatarUrl VARCHAR(500) NOT NULL,
            stats LONGTEXT NOT NULL,
            socials LONGTEXT NOT NULL,
            skills LONGTEXT NOT NULL,
            pillars LONGTEXT NOT NULL
          );
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS services (
            id VARCHAR(64) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            price VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            deliverables LONGTEXT NOT NULL,
            sort_order INT DEFAULT 0
          );
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR(64) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            badge VARCHAR(100),
            image VARCHAR(500) NOT NULL,
            tags LONGTEXT NOT NULL,
            summary TEXT NOT NULL,
            outcome TEXT,
            client VARCHAR(255),
            timeline VARCHAR(100),
            problem TEXT,
            solution TEXT,
            results LONGTEXT,
            liveUrl VARCHAR(500),
            sort_order INT DEFAULT 0
          );
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS process_steps (
            id VARCHAR(64) PRIMARY KEY,
            stepNumber VARCHAR(20) NOT NULL,
            badge VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            deliverables TEXT NOT NULL,
            sort_order INT DEFAULT 0
          );
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS testimonials (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            initials VARCHAR(10) NOT NULL,
            rating INT DEFAULT 5,
            quote TEXT NOT NULL,
            sort_order INT DEFAULT 0
          );
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS inquiries (
            id VARCHAR(64) PRIMARY KEY,
            createdAt VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            company VARCHAR(255),
            serviceType VARCHAR(100) NOT NULL,
            budget VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'new'
          );
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS admins (
            id VARCHAR(64) PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            salt VARCHAR(100) NOT NULL,
            created_at VARCHAR(50) NOT NULL,
            updated_at VARCHAR(50) NOT NULL
          );
        `);

        await seedMySqlIfEmpty(p);
        initialized = true;
        console.log('✅ Connected to MySQL database and verified schema.');
      } catch (err) {
        initPromise = null;
        console.error('MySQL initialization error:', err);
        throw err;
      }
    })();
  }
  return initPromise;
}

async function seedMySqlIfEmpty(p: mysql.Pool) {
  // Check profile
  const [profileRows]: any = await p.execute('SELECT COUNT(*) as count FROM profiles;');
  if (profileRows[0]?.count === 0) {
    console.log('Seeding initial profile into MySQL...');
    await p.execute(
      `INSERT INTO profiles (
        id, name, role, subrole, location, experience, timezone, email,
        availability, headline, intro, bio, avatarUrl, stats, socials, skills, pillars
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
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
          { value: '5+', label: 'Years of Experience' },
          { value: '40+', label: 'Websites Delivered' },
          { value: '99.8%', label: 'Client Satisfaction' },
          { value: '100%', label: 'On-Time Delivery' }
        ]),
        JSON.stringify({
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
          twitter: 'https://twitter.com',
          dribbble: 'https://dribbble.com'
        }),
        JSON.stringify([
          'Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Node.js',
          'MySQL / SQL', 'REST APIs', 'Shopify Liquid', 'WordPress / CMS', 'SEO Optimization', 'WCAG 2.1 AA'
        ]),
        JSON.stringify([
          { title: 'User-Centric Intent', desc: 'Layout, hierarchy, and micro-interactions planned around conversion.' },
          { title: 'Speed as a Feature', desc: 'Blazing-fast load times, 95+ Core Web Vitals, zero bloat.' },
          { title: 'Radical Reliability', desc: 'Fixed milestones, weekly Loom updates, no surprise costs.' },
          { title: 'Inclusive & Accessible', desc: 'Engineered according to WCAG 2.1 AA accessibility guidelines.' }
        ])
      ]
    );
  }

  // Check process steps
  const [stepRows]: any = await p.execute('SELECT COUNT(*) as count FROM process_steps;');
  if (stepRows[0]?.count === 0) {
    console.log('Seeding process steps into MySQL...');
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
      await p.execute(
        'INSERT INTO process_steps (id, stepNumber, badge, title, description, deliverables, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?);',
        [s.id, s.stepNumber, s.badge, s.title, s.description, s.deliverables, s.sort_order]
      );
    }
  }

  // Check services
  const [servRows]: any = await p.execute('SELECT COUNT(*) as count FROM services;');
  if (servRows[0]?.count === 0) {
    console.log('Seeding services into MySQL...');
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
      await p.execute(
        'INSERT INTO services (id, title, price, description, deliverables, sort_order) VALUES (?, ?, ?, ?, ?, ?);',
        [s.id, s.title, s.price, s.description, s.deliverables, s.sort_order]
      );
    }
  }

  // Check projects
  const [projRows]: any = await p.execute('SELECT COUNT(*) as count FROM projects;');
  if (projRows[0]?.count === 0) {
    console.log('Seeding projects into MySQL...');
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

    for (const proj of projects) {
      await p.execute(
        `INSERT INTO projects (
          id, title, category, badge, image, tags, summary, outcome,
          client, timeline, problem, solution, results, liveUrl, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [proj.id, proj.title, proj.category, proj.badge, proj.image, proj.tags, proj.summary, proj.outcome, proj.client, proj.timeline, proj.problem, proj.solution, proj.results, proj.liveUrl, proj.sort_order]
      );
    }
  }

  // Check testimonials
  const [testRows]: any = await p.execute('SELECT COUNT(*) as count FROM testimonials;');
  if (testRows[0]?.count === 0) {
    console.log('Seeding testimonials into MySQL...');
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
      await p.execute(
        'INSERT INTO testimonials (id, name, role, company, initials, rating, quote, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [t.id, t.name, t.role, t.company, t.initials, t.rating, t.quote, t.sort_order]
      );
    }
  }

  // Check admins
  const [adminRows]: any = await p.execute('SELECT COUNT(*) as count FROM admins;');
  if (adminRows[0]?.count === 0) {
    console.log('Seeding initial admin account into MySQL with cryptographic scrypt hash...');
    const salt = crypto.randomBytes(16).toString('hex');
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
    const hash = crypto.scryptSync(initialPassword, salt, 64).toString('hex');
    const now = new Date().toISOString();

    await p.execute(
      'INSERT INTO admins (id, username, password_hash, salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
      ['admin-1', 'admin', hash, salt, now, now]
    );
  }
}

// ------------------- MYSQL CRUD OPERATIONS -------------------

export async function getMySqlPortfolioDatabase(): Promise<PortfolioDatabase> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();

  // Profile
  const [profRows]: any = await p.execute('SELECT * FROM profiles WHERE id = ?;', ['default-profile']);
  const profileRow = profRows[0];
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
  const [projectRows]: any = await p.execute('SELECT * FROM projects ORDER BY sort_order ASC;');
  const projects: Project[] = projectRows.map((r: any) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    badge: r.badge || undefined,
    image: r.image,
    tags: safeJsonParse<string[]>(r.tags, []),
    summary: r.summary,
    outcome: r.outcome || undefined,
    client: r.client || undefined,
    timeline: r.timeline || undefined,
    problem: r.problem || undefined,
    solution: r.solution || undefined,
    results: r.results ? safeJsonParse<string[]>(r.results, []) : undefined,
    liveUrl: r.liveUrl || undefined,
    sort_order: r.sort_order
  }));

  // Services
  const [serviceRows]: any = await p.execute('SELECT * FROM services ORDER BY sort_order ASC;');
  const services: Service[] = serviceRows.map((r: any) => ({
    id: r.id,
    title: r.title,
    price: r.price,
    description: r.description,
    deliverables: safeJsonParse<string[]>(r.deliverables, []),
    sort_order: r.sort_order
  }));

  // Process Steps
  const [stepRows]: any = await p.execute('SELECT * FROM process_steps ORDER BY sort_order ASC;');
  const processSteps: ProcessStep[] = stepRows.map((r: any) => ({
    id: r.id,
    stepNumber: r.stepNumber,
    badge: r.badge,
    title: r.title,
    description: r.description,
    deliverables: r.deliverables,
    sort_order: r.sort_order
  }));

  // Testimonials
  const [testRows]: any = await p.execute('SELECT * FROM testimonials ORDER BY sort_order ASC;');
  const testimonials: Testimonial[] = testRows.map((r: any) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    company: r.company,
    initials: r.initials,
    rating: r.rating,
    quote: r.quote,
    sort_order: r.sort_order
  }));

  // Inquiries
  const [inqRows]: any = await p.execute('SELECT * FROM inquiries ORDER BY createdAt DESC;');
  const inquiries: Inquiry[] = inqRows.map((r: any) => ({
    id: r.id,
    createdAt: r.createdAt,
    name: r.name,
    email: r.email,
    company: r.company || undefined,
    serviceType: r.serviceType,
    budget: r.budget,
    message: r.message,
    status: r.status || 'new'
  }));

  // Admin Profile
  const [adminRows]: any = await p.execute('SELECT id, username, created_at, updated_at FROM admins LIMIT 1;');
  const adminRow = adminRows[0];
  const adminUser: AdminUser | undefined = adminRow ? {
    id: adminRow.id,
    username: adminRow.username,
    created_at: adminRow.created_at,
    updated_at: adminRow.updated_at
  } : undefined;

  return {
    profile,
    projects,
    services,
    processSteps,
    testimonials,
    inquiries,
    adminUser,
    isServerless: false
  };
}

export async function updateMySqlProfile(updates: Partial<Profile>): Promise<Profile> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();
  const current = (await getMySqlPortfolioDatabase()).profile;
  const merged: Profile = { ...current, ...updates };

  await p.execute(
    `UPDATE profiles SET
      name = ?, role = ?, subrole = ?, location = ?, experience = ?, timezone = ?,
      email = ?, availability = ?, headline = ?, intro = ?, bio = ?, avatarUrl = ?,
      stats = ?, socials = ?, skills = ?, pillars = ?
    WHERE id = 'default-profile';`,
    [
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
    ]
  );

  return merged;
}

export async function createMySqlProject(project: Omit<Project, 'id'>): Promise<Project> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();
  const id = `proj-${Date.now()}`;

  await p.execute(
    `INSERT INTO projects (
      id, title, category, badge, image, tags, summary, outcome,
      client, timeline, problem, solution, results, liveUrl, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
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
    ]
  );

  return { id, ...project };
}

export async function updateMySqlProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();

  const [rows]: any = await p.execute('SELECT * FROM projects WHERE id = ?;', [id]);
  const existing = rows[0];
  if (!existing) return null;

  const currentTags = safeJsonParse<string[]>(existing.tags, []);
  const currentResults = existing.results ? safeJsonParse<string[]>(existing.results, []) : null;

  const title = updates.title !== undefined ? updates.title : existing.title;
  const category = updates.category !== undefined ? updates.category : existing.category;
  const badge = updates.badge !== undefined ? updates.badge : existing.badge;
  const image = updates.image !== undefined ? updates.image : existing.image;
  const tags = updates.tags !== undefined ? serializeJson(updates.tags, '[]') : serializeJson(currentTags, '[]');
  const summary = updates.summary !== undefined ? updates.summary : existing.summary;
  const outcome = updates.outcome !== undefined ? updates.outcome : existing.outcome;
  const client = updates.client !== undefined ? updates.client : existing.client;
  const timeline = updates.timeline !== undefined ? updates.timeline : existing.timeline;
  const problem = updates.problem !== undefined ? updates.problem : existing.problem;
  const solution = updates.solution !== undefined ? updates.solution : existing.solution;
  const results = updates.results !== undefined ? serializeJson(updates.results, '[]') : (currentResults ? serializeJson(currentResults, '[]') : null);
  const liveUrl = updates.liveUrl !== undefined ? updates.liveUrl : existing.liveUrl;

  await p.execute(
    `UPDATE projects SET
      title = ?, category = ?, badge = ?, image = ?, tags = ?, summary = ?,
      outcome = ?, client = ?, timeline = ?, problem = ?, solution = ?, results = ?, liveUrl = ?
    WHERE id = ?;`,
    [title, category, badge, image, tags, summary, outcome, client, timeline, problem, solution, results, liveUrl, id]
  );

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

export async function deleteMySqlProject(id: string): Promise<boolean> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();
  const [result]: any = await p.execute('DELETE FROM projects WHERE id = ?;', [id]);
  return (result?.affectedRows || 0) > 0;
}

export async function updateMySqlServices(services: Service[]): Promise<Service[]> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();

  await p.execute('DELETE FROM services;');
  for (let idx = 0; idx < services.length; idx++) {
    const s = services[idx];
    const id = s.id || `serv-${idx + 1}`;
    await p.execute(
      'INSERT INTO services (id, title, price, description, deliverables, sort_order) VALUES (?, ?, ?, ?, ?, ?);',
      [id, s.title, s.price, s.description, serializeJson(s.deliverables || [], '[]'), idx + 1]
    );
  }

  return services;
}

export async function updateMySqlProcessSteps(steps: ProcessStep[]): Promise<ProcessStep[]> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();

  await p.execute('DELETE FROM process_steps;');
  for (let idx = 0; idx < steps.length; idx++) {
    const s = steps[idx];
    const id = s.id || `step-${idx + 1}`;
    await p.execute(
      'INSERT INTO process_steps (id, stepNumber, badge, title, description, deliverables, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [id, s.stepNumber, s.badge, s.title, s.description, s.deliverables, idx + 1]
    );
  }

  return steps;
}

export async function createMySqlTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();
  const id = `test-${Date.now()}`;

  await p.execute(
    'INSERT INTO testimonials (id, name, role, company, initials, rating, quote, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    [id, testimonial.name, testimonial.role, testimonial.company, testimonial.initials, testimonial.rating, testimonial.quote, testimonial.sort_order || 0]
  );

  return { id, ...testimonial };
}

export async function updateMySqlTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();

  const [rows]: any = await p.execute('SELECT * FROM testimonials WHERE id = ?;', [id]);
  const existing = rows[0];
  if (!existing) return null;

  const name = updates.name !== undefined ? updates.name : existing.name;
  const role = updates.role !== undefined ? updates.role : existing.role;
  const company = updates.company !== undefined ? updates.company : existing.company;
  const initials = updates.initials !== undefined ? updates.initials : existing.initials;
  const rating = updates.rating !== undefined ? updates.rating : existing.rating;
  const quote = updates.quote !== undefined ? updates.quote : existing.quote;

  await p.execute(
    'UPDATE testimonials SET name = ?, role = ?, company = ?, initials = ?, rating = ?, quote = ? WHERE id = ?;',
    [name, role, company, initials, rating, quote, id]
  );

  return { id, name, role, company, initials, rating, quote };
}

export async function deleteMySqlTestimonial(id: string): Promise<boolean> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();
  const [result]: any = await p.execute('DELETE FROM testimonials WHERE id = ?;', [id]);
  return (result?.affectedRows || 0) > 0;
}

export async function createMySqlInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();
  const id = `inq-${Date.now()}`;
  const createdAt = new Date().toISOString();

  await p.execute(
    'INSERT INTO inquiries (id, createdAt, name, email, company, serviceType, budget, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [id, createdAt, inquiry.name, inquiry.email, inquiry.company || null, inquiry.serviceType, inquiry.budget, inquiry.message, 'new']
  );

  return { id, createdAt, status: 'new', ...inquiry };
}

export async function deleteMySqlInquiry(id: string): Promise<boolean> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();
  const [result]: any = await p.execute('DELETE FROM inquiries WHERE id = ?;', [id]);
  return (result?.affectedRows || 0) > 0;
}

export async function verifyMySqlAdminCredentials(password: string, username?: string): Promise<{ success: boolean; username?: string; error?: string }> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();

  let rows: any;
  if (username && username.trim()) {
    [rows] = await p.execute('SELECT * FROM admins WHERE LOWER(username) = LOWER(?);', [username.trim()]);
  } else {
    [rows] = await p.execute('SELECT * FROM admins LIMIT 1;');
  }

  const row = rows[0];
  if (!row) {
    return { success: false, error: 'Administrator user not found in database.' };
  }

  const computed = crypto.scryptSync(password, row.salt, 64).toString('hex');
  const bufA = Buffer.from(computed, 'hex');
  const bufB = Buffer.from(row.password_hash, 'hex');

  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return { success: false, error: 'Incorrect administrator password.' };
  }

  return { success: true, username: row.username };
}

export async function updateMySqlAdminCredentials(
  currentPassword: string,
  newPassword?: string,
  newUsername?: string
): Promise<{ success: boolean; error?: string }> {
  await ensureMySqlInitialized();
  const p = getMySqlPool();

  const [rows]: any = await p.execute('SELECT * FROM admins LIMIT 1;');
  const current = rows[0];
  if (!current) {
    return { success: false, error: 'Admin account not found in database.' };
  }

  const computed = crypto.scryptSync(currentPassword, current.salt, 64).toString('hex');
  const bufA = Buffer.from(computed, 'hex');
  const bufB = Buffer.from(current.password_hash, 'hex');

  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
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
    updatedSalt = crypto.randomBytes(16).toString('hex');
    updatedHash = crypto.scryptSync(newPassword.trim(), updatedSalt, 64).toString('hex');
  }

  await p.execute(
    'UPDATE admins SET username = ?, password_hash = ?, salt = ?, updated_at = ? WHERE id = ?;',
    [updatedUsername, updatedHash, updatedSalt, now, current.id]
  );

  return { success: true };
}
