import fs from 'fs';
import path from 'path';
import { PortfolioDatabase, Project, Profile, Service, Testimonial, Inquiry } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'portfolio-db.json');

// In-memory cache for fast read operations and serverless environments
let memoryCache: PortfolioDatabase | null = null;

export function getDatabase(): PortfolioDatabase {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      memoryCache = JSON.parse(data);
      return memoryCache as PortfolioDatabase;
    }
  } catch (error) {
    console.error('Failed to read portfolio database from file, fallback to empty:', error);
  }

  // Fallback defaults
  return {
    profile: {
      name: "[Your Name]",
      role: "Freelance Web Designer & Developer",
      subrole: "Design & Development",
      location: "[City, Country]",
      experience: "5+ Years Independent Practice",
      timezone: "UTC-5 (EST) / Flexible for Global Clients",
      email: "hello@yourname.dev",
      availability: "Available for new projects · Q1/Q2 Booking",
      headline: "Designing & building high-converting websites that elevate your brand.",
      intro: "Hi, I'm [Your Name] — an independent freelance web designer and full-stack developer based in [City, Country]. I partner with ambitious businesses and founders to craft bespoke, ultra-fast websites that look stunning and drive measurable growth.",
      stats: [
        { value: "5+", label: "Years of Experience" },
        { value: "40+", label: "Websites Delivered" },
        { value: "99.8%", label: "Client Satisfaction" },
        { value: "100%", label: "On-Time Delivery" }
      ],
      socials: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        dribbble: "https://dribbble.com"
      }
    },
    projects: [],
    services: [],
    testimonials: [],
    inquiries: []
  };
}

export function saveDatabase(data: PortfolioDatabase): boolean {
  memoryCache = data;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.warn('Could not write to disk (read-only filesystem or serverless):', error);
    return false;
  }
}

// ----------------- CRUD HELPERS -----------------

// Projects
export function getProjects(): Project[] {
  return getDatabase().projects || [];
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function addProject(project: Omit<Project, 'id'>): Project {
  const db = getDatabase();
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    ...project
  };
  db.projects.unshift(newProject);
  saveDatabase(db);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const db = getDatabase();
  const index = db.projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  db.projects[index] = { ...db.projects[index], ...updates };
  saveDatabase(db);
  return db.projects[index];
}

export function deleteProject(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.projects.length;
  db.projects = db.projects.filter(p => p.id !== id);
  if (db.projects.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// Profile
export function getProfile(): Profile {
  return getDatabase().profile;
}

export function updateProfile(updates: Partial<Profile>): Profile {
  const db = getDatabase();
  db.profile = { ...db.profile, ...updates };
  saveDatabase(db);
  return db.profile;
}

// Services
export function getServices(): Service[] {
  return getDatabase().services || [];
}

export function updateServices(services: Service[]): Service[] {
  const db = getDatabase();
  db.services = services;
  saveDatabase(db);
  return db.services;
}

// Testimonials
export function getTestimonials(): Testimonial[] {
  return getDatabase().testimonials || [];
}

export function addTestimonial(testimonial: Omit<Testimonial, 'id'>): Testimonial {
  const db = getDatabase();
  const newTestimonial: Testimonial = {
    id: `test-${Date.now()}`,
    ...testimonial
  };
  db.testimonials.push(newTestimonial);
  saveDatabase(db);
  return newTestimonial;
}

export function updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
  const db = getDatabase();
  const index = db.testimonials.findIndex(t => t.id === id);
  if (index === -1) return null;
  db.testimonials[index] = { ...db.testimonials[index], ...updates };
  saveDatabase(db);
  return db.testimonials[index];
}

export function deleteTestimonial(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.testimonials.length;
  db.testimonials = db.testimonials.filter(t => t.id !== id);
  if (db.testimonials.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// Inquiries
export function getInquiries(): Inquiry[] {
  return getDatabase().inquiries || [];
}

export function addInquiry(inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>): Inquiry {
  const db = getDatabase();
  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'new',
    ...inquiry
  };
  db.inquiries.unshift(newInquiry);
  saveDatabase(db);
  return newInquiry;
}

export function deleteInquiry(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.inquiries.length;
  db.inquiries = db.inquiries.filter(i => i.id !== id);
  if (db.inquiries.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}
