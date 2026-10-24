import { getDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Projects from '@/components/Projects';
import About from '@/components/About';
import Process from '@/components/Process';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

// Revalidate on demand or every 60 seconds
export const revalidate = 0;

export default function HomePage() {
  const db = getDatabase();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar profile={db.profile} />
      <main id="main">
        <Hero profile={db.profile} />
        <Services services={db.services} />
        <Projects projects={db.projects} />
        <About profile={db.profile} />
        <Process processSteps={db.processSteps} />
        <Testimonials testimonials={db.testimonials} />
        <Contact profile={db.profile} />
      </main>
      <Footer profile={db.profile} />
    </div>
  );
}
