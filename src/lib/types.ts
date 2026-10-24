export interface StatItem {
  value: string;
  label: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  dribbble?: string;
}

export interface PillarItem {
  title: string;
  desc: string;
}

export interface Profile {
  id?: string;
  name: string;
  role: string;
  subrole: string;
  location: string;
  experience: string;
  timezone: string;
  email: string;
  availability: string;
  headline: string;
  intro: string;
  bio: string;
  avatarUrl: string;
  stats: StatItem[];
  socials: SocialLinks;
  skills: string[];
  pillars: PillarItem[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  categoryLabel?: string;
  badge?: string;
  image: string;
  tags: string[];
  summary: string;
  outcome?: string;
  client?: string;
  timeline?: string;
  problem?: string;
  solution?: string;
  results?: string[];
  liveUrl?: string;
  sort_order?: number;
}

export interface Service {
  id: string;
  title: string;
  price: string;
  description: string;
  deliverables: string[];
  sort_order?: number;
}

export interface ProcessStep {
  id: string;
  stepNumber: string;
  badge: string;
  title: string;
  description: string;
  deliverables: string;
  sort_order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  rating: number;
  quote: string;
  sort_order?: number;
}

export interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company?: string;
  serviceType: string;
  budget: string;
  message: string;
  status: "new" | "read";
}

export interface AdminUser {
  id: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioDatabase {
  profile: Profile;
  projects: Project[];
  services: Service[];
  processSteps: ProcessStep[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  adminUser?: AdminUser;
}
