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

export interface Profile {
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
  stats: StatItem[];
  socials: SocialLinks;
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
}

export interface Service {
  id: string;
  title: string;
  price: string;
  description: string;
  deliverables: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  rating: number;
  quote: string;
}

export interface Inquiry {
  id: string;
  date: string;
  name: string;
  email: string;
  company?: string;
  serviceType: string;
  budget: string;
  message: string;
  status: "new" | "read";
}

export interface PortfolioDatabase {
  profile: Profile;
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
}
