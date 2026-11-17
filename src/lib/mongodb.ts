import { MongoClient, Db } from 'mongodb';
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

// ============================================================================
// MONGODB CLIENT & CONNECTION POOL
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

export function isMongoConfigured(): boolean {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

export function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  const dbName = process.env.MONGODB_DB || 'portfolio';
  return client.db(dbName);
}

// ============================================================================
// DEFAULT SEED DATA
// ============================================================================

const defaultProfile: Profile = {
  id: 'default-profile',
  name: '[Your Name]',
  role: 'Freelance Web Designer & Developer',
  subrole: 'Design & Code',
  location: '[City, Country]',
  experience: '5+ Years Experience',
  timezone: 'UTC-5 (EST) / Global Flexibility',
  email: 'hello@yourname.dev',
  availability: 'Available for new projects · Q1/Q2 Booking',
  headline: 'Designing & building high-converting websites that elevate your brand.',
  intro: "Hi, I'm [Your Name] — an independent freelance web designer and full-stack developer based in [City, Country]. I partner with ambitious businesses and founders to craft bespoke, ultra-fast websites that look stunning and drive measurable growth.",
  bio: "I bridge the gap between creative visual design and robust Next.js code. With over 5+ years of experience, I turn complex business ideas into high-converting, accessible digital flagships.",
  avatarUrl: '/images/avatar.svg',
  stats: [
    { value: '5+', label: 'Years of Experience' },
    { value: '40+', label: 'Websites Delivered' },
    { value: '99.8%', label: 'Client Satisfaction' },
    { value: '100%', label: 'On-Time Delivery' }
  ],
  socials: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    dribbble: 'https://dribbble.com'
  },
  skills: [
    'Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Node.js',
    'MongoDB / NoSQL', 'REST APIs', 'Shopify Liquid', 'WordPress / CMS', 'SEO Optimization', 'WCAG 2.1 AA'
  ],
  pillars: [
    { title: 'User-Centric Intent', desc: 'Layout, hierarchy, and micro-interactions planned around conversion.' },
    { title: 'Speed as a Feature', desc: 'Blazing-fast load times, 95+ Core Web Vitals, zero bloat.' },
    { title: 'Radical Reliability', desc: 'Fixed milestones, weekly Loom updates, no surprise costs.' },
    { title: 'Inclusive & Accessible', desc: 'Engineered according to WCAG 2.1 AA accessibility guidelines.' }
  ]
};

const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Apex Analytics — Performance Telemetry Platform',
    category: 'development web-design',
    badge: 'B2B SaaS',
    image: '/images/project-1.svg',
    tags: ['UI/UX Design', 'React', 'TypeScript'],
    summary: 'End-to-end design system and responsive front-end customer portal for a high-growth cloud telemetry service.',
    outcome: 'Result: +34% user retention, sub-100ms render speeds',
    client: 'Apex Analytics Corp. (Series A Startup)',
    timeline: '6 Weeks',
    problem: 'Apex needed to replace an uninspired internal dashboard with an enterprise-grade customer portal.',
    solution: 'Designed and engineered a modular dashboard with customizable KPI widgets, dark mode optimizations, and SVG charts.',
    results: [
      '+34% increase in daily active user retention',
      'Sub-100ms dashboard widget render latency',
      'Helped close 12 new enterprise pilot contracts'
    ],
    liveUrl: 'https://example.com/apex-preview',
    sort_order: 1
  },
  {
    id: 'proj-2',
    title: 'Lumina Maison — Luxury Architectural Goods',
    category: 'ecommerce web-design',
    badge: 'E-Commerce',
    image: '/images/project-2.svg',
    tags: ['Shopify', 'Editorial UI', 'Liquid'],
    summary: 'Bespoke digital boutique combining tactile editorial typography and curated storytelling galleries.',
    outcome: 'Result: +62% mobile conversion, +$85 Average Order Value',
    client: 'Lumina Maison Studio (Milan & New York)',
    timeline: '5 Weeks',
    problem: 'A high-end home lifestyle atelier required an e-commerce platform reflecting luxury catalog standards.',
    solution: 'Engineered an ultra-minimalist, typography-forward shopping experience with smooth slide-out cart.',
    results: [
      'Mobile checkout completion increased by 62%',
      'Average Order Value rose by $85 within 60 days',
      'Featured in Awwwards Site of the Day Nominees'
    ],
    liveUrl: 'https://example.com/lumina-preview',
    sort_order: 2
  },
  {
    id: 'proj-3',
    title: 'Aura Health — Telehealth & Patient Portal',
    category: 'development web-design',
    badge: 'Healthcare',
    image: '/images/project-3.svg',
    tags: ['Next.js', 'HIPAA Ready', 'Tailwind'],
    summary: 'Accessible, compassionate healthcare platform connecting patients with specialized clinicians.',
    outcome: 'Result: 4.9/5 patient satisfaction score, 100% WCAG AA compliant',
    client: 'Aura Integrated Health Network',
    timeline: '8 Weeks',
    problem: 'Patients found booking clinicians confusing, resulting in high drop-off on mobile devices.',
    solution: 'Designed an ultra-clear, calming intake funnel with 3-step scheduling and high accessibility.',
    results: [
      'Intake completion rate jumped from 48% to 84%',
      '100% WCAG 2.1 AA accessibility audit score',
      'Reduced customer support scheduling tickets by 55%'
    ],
    liveUrl: 'https://example.com/aura-preview',
    sort_order: 3
  },
  {
    id: 'proj-4',
    title: 'Kinetix Digital — Creative Design Agency',
    category: 'web-design',
    badge: 'Agency',
    image: '/images/project-4.svg',
    tags: ['Figma', 'Motion Design', 'Branding'],
    summary: 'High-contrast portfolio showcasing brand strategy and visual campaigns with dark aesthetics.',
    outcome: 'Result: 3x increase in inbound client project inquiries',
    client: 'Kinetix Digital Collective',
    timeline: '3 Weeks',
    problem: 'Kinetix was winning awards but losing inbound leads because their old website failed to demonstrate their visual caliber.',
    solution: 'Built an immersive, editorial agency showcase featuring dynamic case study reveals and micro-animations.',
    results: [
      'Inbound enterprise leads tripled within the first quarter',
      'Average time on site increased from 42s to 3m 18s',
      'Won Special Mention on Mindsparkle Mag'
    ],
    liveUrl: 'https://example.com/kinetix-preview',
    sort_order: 4
  },
  {
    id: 'proj-5',
    title: 'Vanguard Wealth — Private Advisory Web App',
    category: 'development',
    badge: 'Fintech',
    image: '/images/project-5.svg',
    tags: ['Security', 'TypeScript', 'Charts'],
    summary: 'Institutional wealth management portal providing high-net-worth clients with real-time portfolio allocation tracking.',
    outcome: 'Result: $120M+ assets onboarded through the portal',
    client: 'Vanguard Private Capital Advisory',
    timeline: '7 Weeks',
    problem: 'A private capital boutique needed a confidential, modern portal where institutional investors could view assets.',
    solution: 'Engineered a bank-grade client dashboard with multi-factor authentication and interactive allocation charts.',
    results: [
      '$120M+ client capital onboarded in first 90 days',
      'Zero security vulnerabilities reported in third-party penetration test',
      'Client retention improved by 28%'
    ],
    liveUrl: 'https://example.com/vanguard-preview',
    sort_order: 5
  },
  {
    id: 'proj-6',
    title: 'Terra Organic — Sustainable DTC Redesign',
    category: 'redesign ecommerce',
    badge: 'Redesign',
    image: '/images/project-6.svg',
    tags: ['Mobile-First', 'PageSpeed', 'E-Commerce'],
    summary: 'Comprehensive overhaul of a sluggish organic beauty shop, rewriting asset pipelines and streamlining one-click checkout.',
    outcome: 'Result: Load time cut from 6.2s to 0.8s, bounce rate down 41%',
    client: 'Terra Organic Naturals',
    timeline: '4 Weeks',
    problem: 'An organic beauty brand suffered from slow 6.2-second load times on mobile devices, leading to high bounce rates.',
    solution: 'Performed a full design overhaul: compressed media pipelines, eliminated render-blocking scripts, and designed an intuitive mobile catalog.',
    results: [
      'Page load time reduced from 6.2s to 0.8s (87% improvement)',
      'Mobile bounce rate dropped by 41%',
      'Core Web Vitals scores went from Failing to all Green'
    ],
    liveUrl: 'https://example.com/terra-preview',
    sort_order: 6
  }
];

const defaultServices: Service[] = [
  {
    id: 'serv-1',
    title: 'Website Design (UI/UX)',
    price: 'From $1,800',
    description: 'Tailored Figma design concepts crafted around conversion science and distinct brand personality.',
    deliverables: [
      'User research & intuitive wireframing',
      'Interactive Figma prototypes (desktop & mobile)',
      'Design system (typography, palette, components)',
      'Conversion rate optimization (CRO) focus'
    ],
    sort_order: 1
  },
  {
    id: 'serv-2',
    title: 'Website Development',
    price: 'From $2,400',
    description: 'Modern, robust code engineered for blazing-fast load speeds, clean semantics, and effortless scalability.',
    deliverables: [
      'Semantic HTML5, CSS3/Tailwind & modern JavaScript',
      'CMS integrations (WordPress, Webflow, Sanity)',
      '95+ Google Lighthouse speed & Core Web Vitals',
      'Custom animations, interactive forms & APIs'
    ],
    sort_order: 2
  },
  {
    id: 'serv-3',
    title: 'Responsive Redesigns',
    price: 'From $1,500',
    description: 'Transform an outdated, sluggish, or mobile-unfriendly site into a modern digital flagship.',
    deliverables: [
      'Full UX & technical performance audit',
      'Mobile-first responsive architecture overhaul',
      'Asset compression & load-speed remediation',
      'SEO preservation & 301 redirect management'
    ],
    sort_order: 3
  },
  {
    id: 'serv-4',
    title: 'Ongoing Support & Care',
    price: 'From $250/mo',
    description: 'Total peace of mind after launch. Ongoing security updates, content updates, and troubleshooting.',
    deliverables: [
      '24/7 uptime monitoring & cloud backups',
      'Plugin, theme & framework security patching',
      'Monthly design tweaks & content updates',
      'Dedicated priority email & Slack channel'
    ],
    sort_order: 4
  }
];

const defaultProcessSteps: ProcessStep[] = [
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

const defaultTestimonials: Testimonial[] = [
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

// In-memory state for offline build / fallback
let memoryProfile: Profile = { ...defaultProfile };
let memoryProjects: Project[] = [...defaultProjects];
let memoryServices: Service[] = [...defaultServices];
let memoryProcessSteps: ProcessStep[] = [...defaultProcessSteps];
let memoryTestimonials: Testimonial[] = [...defaultTestimonials];
let memoryInquiries: Inquiry[] = [];
let memoryAdmin = {
  id: 'admin-1',
  username: 'admin',
  password_hash: crypto.scryptSync(process.env.INITIAL_ADMIN_PASSWORD || 'admin123', 'initial-fixed-salt-2026', 64).toString('hex'),
  salt: 'initial-fixed-salt-2026',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// ============================================================================
// INITIALIZATION & AUTO-SEEDING
// ============================================================================

export async function ensureMongoInitialized(): Promise<void> {
  if (initialized || !isMongoConfigured()) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const db = await getMongoDb();

        // 1. Profile
        const profileCount = await db.collection('profiles').countDocuments();
        if (profileCount === 0) {
          console.log('Seeding initial profile into MongoDB...');
          await db.collection('profiles').insertOne({ ...defaultProfile });
        }

        // 2. Projects
        const projectsCount = await db.collection('projects').countDocuments();
        if (projectsCount === 0) {
          console.log('Seeding projects into MongoDB...');
          await db.collection('projects').insertMany(defaultProjects.map(p => ({ ...p })));
        }

        // 3. Services
        const servicesCount = await db.collection('services').countDocuments();
        if (servicesCount === 0) {
          console.log('Seeding services into MongoDB...');
          await db.collection('services').insertMany(defaultServices.map(s => ({ ...s })));
        }

        // 4. Process Steps
        const processCount = await db.collection('process_steps').countDocuments();
        if (processCount === 0) {
          console.log('Seeding process steps into MongoDB...');
          await db.collection('process_steps').insertMany(defaultProcessSteps.map(p => ({ ...p })));
        }

        // 5. Testimonials
        const testimonialsCount = await db.collection('testimonials').countDocuments();
        if (testimonialsCount === 0) {
          console.log('Seeding testimonials into MongoDB...');
          await db.collection('testimonials').insertMany(defaultTestimonials.map(t => ({ ...t })));
        }

        // 6. Admin Account
        const adminCount = await db.collection('admins').countDocuments();
        if (adminCount === 0) {
          console.log('Seeding initial admin credentials into MongoDB...');
          const salt = crypto.randomBytes(16).toString('hex');
          const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
          const hash = crypto.scryptSync(initialPassword, salt, 64).toString('hex');
          const now = new Date().toISOString();

          await db.collection('admins').insertOne({
            id: 'admin-1',
            username: 'admin',
            password_hash: hash,
            salt,
            created_at: now,
            updated_at: now
          });
        }

        initialized = true;
        console.log('✅ Connected to MongoDB Atlas & verified collections.');
      } catch (err) {
        initPromise = null;
        console.error('MongoDB initialization warning:', err);
      }
    })();
  }
  return initPromise;
}

// Clean MongoDB _id helper
function cleanDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest as T;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getPortfolioDatabase(): Promise<PortfolioDatabase> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();

      const profileDoc = await db.collection('profiles').findOne({ id: 'default-profile' });
      const projectsDocs = await db.collection('projects').find({}).sort({ sort_order: 1 }).toArray();
      const servicesDocs = await db.collection('services').find({}).sort({ sort_order: 1 }).toArray();
      const processDocs = await db.collection('process_steps').find({}).sort({ sort_order: 1 }).toArray();
      const testimonialDocs = await db.collection('testimonials').find({}).sort({ sort_order: 1 }).toArray();
      const inquiryDocs = await db.collection('inquiries').find({}).sort({ createdAt: -1 }).toArray();
      const adminDoc = await db.collection('admins').findOne({}, { projection: { password_hash: 0, salt: 0 } });

      return {
        profile: profileDoc ? cleanDoc<Profile>(profileDoc) : defaultProfile,
        projects: projectsDocs.map(cleanDoc<Project>),
        services: servicesDocs.map(cleanDoc<Service>),
        processSteps: processDocs.map(cleanDoc<ProcessStep>),
        testimonials: testimonialDocs.map(cleanDoc<Testimonial>),
        inquiries: inquiryDocs.map(cleanDoc<Inquiry>),
        adminUser: adminDoc ? cleanDoc<AdminUser>(adminDoc) : undefined,
        isServerless: true
      };
    } catch (err) {
      console.error('MongoDB getPortfolioDatabase failed, using memory state:', err);
    }
  }

  // Offline / Build fallback
  return {
    profile: memoryProfile,
    projects: memoryProjects,
    services: memoryServices,
    processSteps: memoryProcessSteps,
    testimonials: memoryTestimonials,
    inquiries: memoryInquiries,
    adminUser: {
      id: memoryAdmin.id,
      username: memoryAdmin.username,
      created_at: memoryAdmin.created_at,
      updated_at: memoryAdmin.updated_at
    },
    isServerless: false
  };
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      await db.collection('profiles').updateOne(
        { id: 'default-profile' },
        { $set: updates },
        { upsert: true }
      );
      const updated = await db.collection('profiles').findOne({ id: 'default-profile' });
      return updated ? cleanDoc<Profile>(updated) : { ...defaultProfile, ...updates };
    } catch (err) {
      console.error('MongoDB updateProfile error:', err);
    }
  }

  memoryProfile = { ...memoryProfile, ...updates };
  return memoryProfile;
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const id = `proj-${Date.now()}`;
  const newProject: Project = { id, ...project };

  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      await db.collection('projects').insertOne({ ...newProject });
      return newProject;
    } catch (err) {
      console.error('MongoDB createProject error:', err);
    }
  }

  memoryProjects.push(newProject);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      const res = await db.collection('projects').findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: 'after' }
      );
      return res ? cleanDoc<Project>(res) : null;
    } catch (err) {
      console.error('MongoDB updateProject error:', err);
    }
  }

  const idx = memoryProjects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  memoryProjects[idx] = { ...memoryProjects[idx], ...updates };
  return memoryProjects[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      const res = await db.collection('projects').deleteOne({ id });
      return (res.deletedCount || 0) > 0;
    } catch (err) {
      console.error('MongoDB deleteProject error:', err);
    }
  }

  const initialLen = memoryProjects.length;
  memoryProjects = memoryProjects.filter(p => p.id !== id);
  return memoryProjects.length < initialLen;
}

export async function updateServices(services: Service[]): Promise<Service[]> {
  const prepared = services.map((s, idx) => ({
    id: s.id || `serv-${idx + 1}`,
    ...s,
    sort_order: idx + 1
  }));

  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      await db.collection('services').deleteMany({});
      if (prepared.length > 0) {
        await db.collection('services').insertMany(prepared.map(s => ({ ...s })));
      }
      return prepared;
    } catch (err) {
      console.error('MongoDB updateServices error:', err);
    }
  }

  memoryServices = prepared;
  return prepared;
}

export async function updateProcessSteps(steps: ProcessStep[]): Promise<ProcessStep[]> {
  const prepared = steps.map((s, idx) => ({
    id: s.id || `step-${idx + 1}`,
    ...s,
    sort_order: idx + 1
  }));

  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      await db.collection('process_steps').deleteMany({});
      if (prepared.length > 0) {
        await db.collection('process_steps').insertMany(prepared.map(p => ({ ...p })));
      }
      return prepared;
    } catch (err) {
      console.error('MongoDB updateProcessSteps error:', err);
    }
  }

  memoryProcessSteps = prepared;
  return prepared;
}

export async function createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const id = `test-${Date.now()}`;
  const newTestimonial: Testimonial = { id, ...testimonial };

  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      await db.collection('testimonials').insertOne({ ...newTestimonial });
      return newTestimonial;
    } catch (err) {
      console.error('MongoDB createTestimonial error:', err);
    }
  }

  memoryTestimonials.push(newTestimonial);
  return newTestimonial;
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      const res = await db.collection('testimonials').findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: 'after' }
      );
      return res ? cleanDoc<Testimonial>(res) : null;
    } catch (err) {
      console.error('MongoDB updateTestimonial error:', err);
    }
  }

  const idx = memoryTestimonials.findIndex(t => t.id === id);
  if (idx === -1) return null;
  memoryTestimonials[idx] = { ...memoryTestimonials[idx], ...updates };
  return memoryTestimonials[idx];
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      const res = await db.collection('testimonials').deleteOne({ id });
      return (res.deletedCount || 0) > 0;
    } catch (err) {
      console.error('MongoDB deleteTestimonial error:', err);
    }
  }

  const initialLen = memoryTestimonials.length;
  memoryTestimonials = memoryTestimonials.filter(t => t.id !== id);
  return memoryTestimonials.length < initialLen;
}

export async function createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> {
  const id = `inq-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const newInquiry: Inquiry = {
    id,
    createdAt,
    status: 'new',
    ...inquiry
  };

  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      await db.collection('inquiries').insertOne({ ...newInquiry });
      return newInquiry;
    } catch (err) {
      console.error('MongoDB createInquiry error:', err);
    }
  }

  memoryInquiries.unshift(newInquiry);
  return newInquiry;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      const res = await db.collection('inquiries').deleteOne({ id });
      return (res.deletedCount || 0) > 0;
    } catch (err) {
      console.error('MongoDB deleteInquiry error:', err);
    }
  }

  const initialLen = memoryInquiries.length;
  memoryInquiries = memoryInquiries.filter(i => i.id !== id);
  return memoryInquiries.length < initialLen;
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      const docs = await db.collection('inquiries').find({}).sort({ createdAt: -1 }).toArray();
      return docs.map(cleanDoc<Inquiry>);
    } catch (err) {
      console.error('MongoDB getInquiries error:', err);
    }
  }

  return memoryInquiries;
}

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

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

export async function verifyAdminCredentials(
  password: string,
  username?: string
): Promise<{ success: boolean; username?: string; error?: string }> {
  let admin: any = null;

  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      if (username && username.trim()) {
        admin = await db.collection('admins').findOne({
          username: { $regex: new RegExp(`^${username.trim()}$`, 'i') }
        });
      } else {
        admin = await db.collection('admins').findOne({});
      }
    } catch (err) {
      console.error('MongoDB verifyAdminCredentials error:', err);
    }
  }

  if (!admin) {
    admin = memoryAdmin;
  }

  if (!admin) {
    return { success: false, error: 'Administrator user not found in database.' };
  }

  const isValid = verifyPasswordHash(password, admin.salt, admin.password_hash);
  if (!isValid) {
    return { success: false, error: 'Incorrect administrator password.' };
  }

  return { success: true, username: admin.username };
}

export async function updateAdminCredentials(
  currentPassword: string,
  newPassword?: string,
  newUsername?: string
): Promise<{ success: boolean; error?: string }> {
  let admin: any = null;
  let db: Db | null = null;

  if (isMongoConfigured()) {
    try {
      await ensureMongoInitialized();
      db = await getMongoDb();
      admin = await db.collection('admins').findOne({});
    } catch (err) {
      console.error('MongoDB updateAdminCredentials fetch error:', err);
    }
  }

  if (!admin) {
    admin = memoryAdmin;
  }

  if (!admin) {
    return { success: false, error: 'Admin account not found in database.' };
  }

  const isCurrentValid = verifyPasswordHash(currentPassword, admin.salt, admin.password_hash);
  if (!isCurrentValid) {
    return { success: false, error: 'Current password verification failed. Please check your existing password.' };
  }

  const now = new Date().toISOString();
  let updatedUsername = admin.username;
  let updatedHash = admin.password_hash;
  let updatedSalt = admin.salt;

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

  if (db && isMongoConfigured()) {
    try {
      await db.collection('admins').updateOne(
        { id: admin.id || 'admin-1' },
        {
          $set: {
            username: updatedUsername,
            password_hash: updatedHash,
            salt: updatedSalt,
            updated_at: now
          }
        },
        { upsert: true }
      );
      return { success: true };
    } catch (err) {
      console.error('MongoDB updateAdminCredentials update error:', err);
    }
  }

  memoryAdmin = {
    ...memoryAdmin,
    username: updatedUsername,
    password_hash: updatedHash,
    salt: updatedSalt,
    updated_at: now
  };

  return { success: true };
}

// Aliases
export const getDatabase = getPortfolioDatabase;
export const addProject = createProject;
export const addTestimonial = createTestimonial;
export const addInquiry = createInquiry;
