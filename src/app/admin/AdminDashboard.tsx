'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FolderKanban, 
  User, 
  Briefcase, 
  Star, 
  Inbox, 
  LogOut, 
  ExternalLink, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  CheckCircle2, 
  Search, 
  Mail,
  Workflow,
  Lock,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { PortfolioDatabase, Project, Testimonial, ProcessStep, PillarItem, StatItem } from '@/lib/types';

interface AdminDashboardProps {
  initialData: PortfolioDatabase;
}

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
  const router = useRouter();
  const [data, setData] = useState<PortfolioDatabase>(initialData);
  const [activeTab, setActiveTab] = useState<'projects' | 'profile' | 'services' | 'process' | 'testimonials' | 'inquiries' | 'security'>('projects');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter for Projects
  const [projectSearch, setProjectSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  // Security / Password update state
  const [securityForm, setSecurityForm] = useState({
    username: data.adminUser?.username || 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    if (confirm('Log out of Studio Dashboard?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    }
  };

  // ---------------- PROJECT CRUD ----------------
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title) return;

    try {
      const isNew = !editingProject.id;
      const res = await fetch('/api/admin/projects', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject)
      });

      if (res.ok) {
        const result = await res.json();
        if (isNew) {
          setData({ ...data, projects: [result.project, ...data.projects] });
          showToast(`Added project "${result.project.title}"`);
        } else {
          setData({
            ...data,
            projects: data.projects.map(p => p.id === result.project.id ? result.project : p)
          });
          showToast(`Updated project "${result.project.title}"`);
        }
        setIsProjectModalOpen(false);
        setEditingProject(null);
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.details || errData?.error || 'Failed to save project', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error saving project', 'error');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData({ ...data, projects: data.projects.filter(p => p.id !== id) });
          showToast(`Deleted "${title}"`);
        } else {
          const errData = await res.json().catch(() => null);
          showToast(errData?.details || errData?.error || 'Failed to delete project', 'error');
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Error deleting project', 'error');
      }
    }
  };

  // ---------------- PROFILE UPDATE ----------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.profile)
      });
      if (res.ok) {
        showToast('Profile, Hero, and Tech Stack updated in SQLite!');
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.details || errData?.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating profile', 'error');
    }
  };

  // ---------------- SERVICES UPDATE ----------------
  const handleSaveServices = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.services)
      });
      if (res.ok) {
        showToast('Services and pricing packages updated in SQLite!');
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.details || errData?.error || 'Failed to update services', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating services', 'error');
    }
  };

  // ---------------- PROCESS UPDATE ----------------
  const handleSaveProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/process', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.processSteps)
      });
      if (res.ok) {
        showToast('Process workflow steps updated in SQLite!');
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.details || errData?.error || 'Failed to update process steps', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating process steps', 'error');
    }
  };

  const handleAddProcessStep = () => {
    const nextNum = (data.processSteps?.length || 0) + 1;
    const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    const newStep: ProcessStep = {
      id: `step-${Date.now()}`,
      stepNumber: formattedNum,
      badge: `Phase ${nextNum}`,
      title: 'New Milestone',
      description: 'Describe this phase of the engagement.',
      deliverables: 'Key deliverables for this step.',
      sort_order: nextNum
    };
    setData({
      ...data,
      processSteps: [...(data.processSteps || []), newStep]
    });
  };

  const handleDeleteProcessStep = (id: string) => {
    setData({
      ...data,
      processSteps: data.processSteps.filter(s => s.id !== id)
    });
  };

  // ---------------- TESTIMONIAL CRUD ----------------
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial?.name || !editingTestimonial?.quote) return;

    try {
      const isNew = !editingTestimonial.id;
      const res = await fetch('/api/admin/testimonials', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTestimonial)
      });

      if (res.ok) {
        const result = await res.json();
        if (isNew) {
          setData({ ...data, testimonials: [...data.testimonials, result.testimonial] });
          showToast('Added new testimonial');
        } else {
          setData({
            ...data,
            testimonials: data.testimonials.map(t => t.id === result.testimonial.id ? result.testimonial : t)
          });
          showToast('Updated testimonial');
        }
        setIsTestimonialModalOpen(false);
        setEditingTestimonial(null);
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.details || errData?.error || 'Failed to save testimonial', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error saving testimonial', 'error');
    }
  };

  const handleDeleteTestimonial = async (id: string, name: string) => {
    if (confirm(`Delete testimonial from "${name}"?`)) {
      try {
        const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData({ ...data, testimonials: data.testimonials.filter(t => t.id !== id) });
          showToast('Testimonial removed');
        } else {
          const errData = await res.json().catch(() => null);
          showToast(errData?.details || errData?.error || 'Failed to delete testimonial', 'error');
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Error deleting testimonial', 'error');
      }
    }
  };

  // ---------------- INQUIRIES DELETE ----------------
  const handleDeleteInquiry = async (id: string) => {
    if (confirm('Delete this inquiry?')) {
      try {
        const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData({ ...data, inquiries: data.inquiries.filter(i => i.id !== id) });
          showToast('Inquiry deleted');
        } else {
          const errData = await res.json().catch(() => null);
          showToast(errData?.details || errData?.error || 'Failed to delete inquiry', 'error');
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Error deleting inquiry', 'error');
      }
    }
  };

  // ---------------- SECURITY / PASSWORD UPDATE ----------------
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    if (!securityForm.currentPassword) {
      setSecurityError('Please enter your current password to authorize changes.');
      return;
    }

    if (securityForm.newPassword) {
      if (securityForm.newPassword.length < 6) {
        setSecurityError('New password must be at least 6 characters long.');
        return;
      }
      if (securityForm.newPassword !== securityForm.confirmPassword) {
        setSecurityError('New password and confirmation do not match.');
        return;
      }
    }

    setSecurityLoading(true);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword || undefined,
          newUsername: securityForm.username !== data.adminUser?.username ? securityForm.username : undefined
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showToast('Admin password & credentials updated successfully in SQLite database!');
        setSecurityForm({
          username: securityForm.username,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        if (data.adminUser) {
          setData({
            ...data,
            adminUser: {
              ...data.adminUser,
              username: securityForm.username
            }
          });
        }
      } else {
        setSecurityError(result.error || 'Failed to update credentials.');
      }
    } catch {
      setSecurityError('Network error while saving credentials.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Filtered projects
  const filteredProjects = data.projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(projectSearch.toLowerCase())) ||
      (p.summary || '').toLowerCase().includes(projectSearch.toLowerCase());
    const matchesCat = projectFilter === 'all' || p.category?.includes(projectFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-surface border text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-4 ${
          toast.type === 'error' 
            ? 'border-red-500/50 text-red-400' 
            : 'border-emerald-500/40 text-emerald-400'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-surface-border p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-bg text-white font-mono font-bold text-xs flex items-center justify-center">
            ⚡
          </div>
          <div>
            <h1 className="font-display font-bold text-base">Studio CMS</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next.js + SQLite DB</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-grow">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'projects' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-surface-hover hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4" />
              <span>Projects</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">
              {data.projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-surface-hover hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile &amp; Stack</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'services' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-surface-hover hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Services &amp; Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('process')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'process' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-surface-hover hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Workflow className="w-4 h-4" />
              <span>Process Steps</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">
              {data.processSteps?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'testimonials' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-surface-hover hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Testimonials</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'inquiries' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-surface-hover hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4" />
              <span>Inquiries</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 font-bold">
              {data.inquiries?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'security' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-surface-hover hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Admin Password</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-surface-border flex flex-col gap-2 mt-6">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-6 sm:p-10 max-w-6xl w-full">

        {data.isServerless && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3.5 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-200 mb-1">Serverless Runtime Detected (Vercel)</p>
              <p className="text-slate-300 leading-relaxed text-xs">
                Your database writes are running in temporary storage (<code className="px-1.5 py-0.5 rounded bg-amber-950/70 font-mono text-amber-300 font-bold">/tmp</code>).
                Because Vercel serverless functions are stateless, modifications reset on cold starts or new deployments.
                For permanent 24/7 persistence with this SQLite setup, deploy with a persistent volume on <strong>Railway</strong>, <strong>Render</strong>, or <strong>Docker / VPS</strong>.
              </p>
            </div>
          </div>
        )}
        
        {/* TAB 1: PROJECTS */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">
                  Portfolio Projects ({filteredProjects.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Manage your showcase works, case studies, outcomes, and screenshots.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProject({
                    title: '',
                    category: 'web-design',
                    badge: '',
                    image: '/images/project-1.svg',
                    tags: ['Design', 'Development'],
                    summary: '',
                    outcome: '',
                    results: [],
                    problem: '',
                    solution: '',
                    liveUrl: ''
                  });
                  setIsProjectModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects by title, summary, or tags..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs sm:text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="web-design">Web Design</option>
                <option value="development">Development</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="redesign">Redesign</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                      <Image
                        src={project.image || '/images/project-1.svg'}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm sm:text-base text-foreground">
                          {project.title}
                        </h3>
                        {project.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {project.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                        {project.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setIsProjectModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit project"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.title)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE & STACK */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl">
            <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">
              Profile, Hero &amp; Tech Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8">
              Update your personal details, availability, hero copy, live stats, tech stack pills, and core principles.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
                <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider">Basic Identity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={data.profile.name}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, name: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Professional Role</label>
                    <input
                      type="text"
                      value={data.profile.role}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, role: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Location &amp; Remote Status</label>
                    <input
                      type="text"
                      value={data.profile.location}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, location: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Direct Email</label>
                    <input
                      type="email"
                      value={data.profile.email}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, email: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Experience</label>
                    <input
                      type="text"
                      value={data.profile.experience || ''}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, experience: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Timezone</label>
                    <input
                      type="text"
                      value={data.profile.timezone || ''}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, timezone: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Availability Status Badge</label>
                  <input
                    type="text"
                    value={data.profile.availability}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, availability: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
                <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider">Hero &amp; Bio Copy</h3>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Hero Headline</label>
                  <input
                    type="text"
                    value={data.profile.headline}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, headline: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Hero Introduction Text</label>
                  <textarea
                    rows={2}
                    value={data.profile.intro}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, intro: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">About Section Full Bio</label>
                  <textarea
                    rows={3}
                    value={data.profile.bio || ''}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, bio: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
                <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider">Hero Counter Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(data.profile.stats || []).map((stat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                      <div className="flex gap-2">
                        <div className="w-1/3">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Value</label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...data.profile.stats];
                              newStats[idx].value = e.target.value;
                              setData({ ...data, profile: { ...data.profile, stats: newStats } });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold"
                          />
                        </div>
                        <div className="w-2/3">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...data.profile.stats];
                              newStats[idx].label = e.target.value;
                              setData({ ...data, profile: { ...data.profile, stats: newStats } });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
                <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider">Core Toolstack &amp; Skills</h3>
                <p className="text-xs text-slate-400">Comma-separated list of frameworks, languages, and tools to display as pills.</p>
                <textarea
                  rows={2}
                  value={(data.profile.skills || []).join(', ')}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setData({ ...data, profile: { ...data.profile, skills } });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs font-mono text-foreground focus:outline-none focus:border-indigo-500"
                  placeholder="Next.js, React, TypeScript, Tailwind CSS, Figma, Node.js"
                />
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
                <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider">About Me Core Pillars</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(data.profile.pillars || []).map((pillar, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Pillar {idx + 1} Title</label>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const newPillars = [...data.profile.pillars];
                          newPillars[idx].title = e.target.value;
                          setData({ ...data, profile: { ...data.profile, pillars: newPillars } });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold"
                      />
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={pillar.desc}
                        onChange={(e) => {
                          const newPillars = [...data.profile.pillars];
                          newPillars[idx].desc = e.target.value;
                          setData({ ...data, profile: { ...data.profile, pillars: newPillars } });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
                <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider">Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={data.profile.socials?.github || ''}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, socials: { ...data.profile.socials, github: e.target.value } } })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={data.profile.socials?.linkedin || ''}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, socials: { ...data.profile.socials, linkedin: e.target.value } } })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Twitter / X URL</label>
                    <input
                      type="url"
                      value={data.profile.socials?.twitter || ''}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, socials: { ...data.profile.socials, twitter: e.target.value } } })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Dribbble URL</label>
                    <input
                      type="url"
                      value={data.profile.socials?.dribbble || ''}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, socials: { ...data.profile.socials, dribbble: e.target.value } } })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save All Profile Changes to Database</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SERVICES */}
        {activeTab === 'services' && (
          <div className="max-w-4xl">
            <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">
              Services &amp; Pricing Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8">
              Edit service titles, starting prices, descriptions, and bullet deliverables.
            </p>

            <form onSubmit={handleSaveServices} className="flex flex-col gap-6">
              {data.services.map((serv, sIdx) => (
                <div key={serv.id || sIdx} className="p-6 rounded-2xl bg-surface border border-surface-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Service Title</label>
                      <input
                        type="text"
                        value={serv.title}
                        onChange={(e) => {
                          const updated = [...data.services];
                          updated[sIdx].title = e.target.value;
                          setData({ ...data, services: updated });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Price Badge</label>
                      <input
                        type="text"
                        value={serv.price}
                        onChange={(e) => {
                          const updated = [...data.services];
                          updated[sIdx].price = e.target.value;
                          setData({ ...data, services: updated });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={serv.description}
                      onChange={(e) => {
                        const updated = [...data.services];
                        updated[sIdx].description = e.target.value;
                        setData({ ...data, services: updated });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Deliverables (one per line)</label>
                    <textarea
                      rows={3}
                      value={(serv.deliverables || []).join('\n')}
                      onChange={(e) => {
                        const updated = [...data.services];
                        updated[sIdx].deliverables = e.target.value.split('\n').filter(Boolean);
                        setData({ ...data, services: updated });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-sm font-mono text-xs"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save All Services to Database</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PROCESS STEPS */}
        {activeTab === 'process' && (
          <div className="max-w-4xl">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">
                  How It Works — Process Steps ({data.processSteps?.length || 0})
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Configure the sequential workflow milestones, timeline badges, and phase deliverables.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddProcessStep}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </div>

            <form onSubmit={handleSaveProcess} className="flex flex-col gap-6">
              {(data.processSteps || []).map((step, idx) => (
                <div key={step.id || idx} className="p-6 rounded-2xl bg-surface border border-surface-border relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      Step #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProcessStep(step.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-300"
                    >
                      Delete Step
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Number Display</label>
                      <input
                        type="text"
                        value={step.stepNumber}
                        onChange={(e) => {
                          const updated = [...data.processSteps];
                          updated[idx].stepNumber = e.target.value;
                          setData({ ...data, processSteps: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm font-mono"
                        placeholder="01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Timeline Badge</label>
                      <input
                        type="text"
                        value={step.badge}
                        onChange={(e) => {
                          const updated = [...data.processSteps];
                          updated[idx].badge = e.target.value;
                          setData({ ...data, processSteps: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm"
                        placeholder="Week 1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Milestone Title</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const updated = [...data.processSteps];
                          updated[idx].title = e.target.value;
                          setData({ ...data, processSteps: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm"
                        placeholder="Discovery & Strategy"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Milestone Description</label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => {
                        const updated = [...data.processSteps];
                        updated[idx].description = e.target.value;
                        setData({ ...data, processSteps: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Key Deliverables</label>
                    <input
                      type="text"
                      value={step.deliverables}
                      onChange={(e) => {
                        const updated = [...data.processSteps];
                        updated[idx].deliverables = e.target.value;
                        setData({ ...data, processSteps: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-slate-300"
                      placeholder="Creative brief, sitemap, wireframes..."
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save All Process Steps to Database</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">
                  Client Testimonials
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Manage social proof and reviews from past clients.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTestimonial({
                    name: '',
                    role: 'Founder',
                    company: '',
                    initials: 'CL',
                    rating: 5,
                    quote: ''
                  });
                  setIsTestimonialModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                <span>Add Testimonial</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.testimonials.map((test) => (
                <div key={test.id} className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
                  <div>
                    <div className="text-amber-400 text-xs mb-3">{'★'.repeat(test.rating || 5)}</div>
                    <p className="text-xs sm:text-sm text-slate-300 italic mb-4">&ldquo;{test.quote}&rdquo;</p>
                  </div>
                  <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-foreground">{test.name}</div>
                      <div className="text-[11px] text-slate-400">{test.role}, {test.company}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTestimonial(test);
                          setIsTestimonialModalOpen(true);
                        }}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(test.id, test.name)}
                        className="text-xs font-bold text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div>
            <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">
              Inbound Project Inquiries ({data.inquiries?.length || 0})
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8">
              Prospective client project briefs submitted via your portfolio contact form.
            </p>

            <div className="flex flex-col gap-4">
              {(!data.inquiries || data.inquiries.length === 0) ? (
                <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border text-slate-400">
                  <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No client inquiries received yet.</p>
                </div>
              ) : (
                data.inquiries.map((inq) => (
                  <div key={inq.id} className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-base text-foreground">{inq.name}</span>
                        <a href={`mailto:${inq.email}`} className="text-xs font-semibold text-indigo-400 hover:underline">{inq.email}</a>
                        {inq.company && <span className="text-xs text-slate-400">({inq.company})</span>}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-400">{inq.serviceType}</span>
                        <span className="text-xs text-slate-400">• Budget: {inq.budget}</span>
                        <span className="text-xs text-slate-500">
                          • {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
                        {inq.message}
                      </p>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <a
                        href={`mailto:${inq.email}?subject=Regarding%20your%20project%20inquiry`}
                        className="px-4 py-2 rounded-xl text-xs font-bold gradient-bg text-white text-center"
                      >
                        Reply
                      </a>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 7: SECURITY & ADMIN PASSWORD */}
        {activeTab === 'security' && (
          <div className="max-w-2xl">
            <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">
              Admin Password &amp; Account Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8">
              Update your administrator credentials stored in SQLite. Passwords are saved using cryptographic scrypt hashes with individual salts.
            </p>

            {securityError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSecurity} className="p-6 sm:p-8 rounded-3xl bg-surface border border-surface-border space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Admin Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={securityForm.username}
                    onChange={(e) => setSecurityForm({ ...securityForm, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  You can log in with this username from the login page.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    placeholder="Enter current password to authorize changes"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Change Password (Leave blank to keep current)
                </h4>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={securityLoading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{securityLoading ? 'Updating credentials...' : 'Update Password in Database'}</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* PROJECT ADD / EDIT MODAL */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-surface border border-surface-border p-6 sm:p-8">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-xl text-foreground mb-6">
              {editingProject.id ? 'Edit Project' : 'Add New Project'}
            </h3>

            <form onSubmit={handleSaveProject} className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category Filter *</label>
                  <select
                    value={editingProject.category || 'web-design'}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                  >
                    <option value="web-design">Web Design</option>
                    <option value="development">Web Development</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="redesign">Redesign</option>
                    <option value="development web-design">Development &amp; Design</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Corner Badge</label>
                  <input
                    type="text"
                    value={editingProject.badge || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, badge: e.target.value })}
                    placeholder="e.g. B2B SaaS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={(editingProject.tags || []).join(', ')}
                    onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Next.js, React, Tailwind"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Image Mockup Path</label>
                <input
                  type="text"
                  value={editingProject.image || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                  placeholder="/images/project-1.svg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Short Summary (Card preview) *</label>
                <textarea
                  rows={2}
                  required
                  value={editingProject.summary || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Outcome Box Callout</label>
                <input
                  type="text"
                  value={editingProject.outcome || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, outcome: e.target.value })}
                  placeholder="Result: +34% conversion"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">The Challenge (Modal)</label>
                <textarea
                  rows={2}
                  value={editingProject.problem || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, problem: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">The Solution (Modal)</label>
                <textarea
                  rows={2}
                  value={editingProject.solution || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Key Results Bullets (one per line)</label>
                <textarea
                  rows={3}
                  value={(editingProject.results || []).join('\n')}
                  onChange={(e) => setEditingProject({ ...editingProject, results: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={editingProject.liveUrl || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold gradient-bg text-white shadow-md shadow-indigo-500/25"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TESTIMONIAL ADD / EDIT MODAL */}
      {isTestimonialModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full rounded-3xl bg-surface border border-surface-border p-6 sm:p-8">
            <button
              onClick={() => setIsTestimonialModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-xl text-foreground mb-6">
              {editingTestimonial.id ? 'Edit Testimonial' : 'Add Testimonial'}
            </h3>

            <form onSubmit={handleSaveTestimonial} className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.name || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Role / Company *</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.company || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                    placeholder="e.g. Lumina Maison"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Client Quote *</label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.quote || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold gradient-bg text-white shadow-md shadow-indigo-500/25"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
