import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0a0d14',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Freelance Web Designer & Developer Portfolio | Next.js',
    template: '%s | Freelance Web Designer & Developer'
  },
  description: 'Bespoke, high-converting websites designed in Figma and engineered with Next.js 14, React & Tailwind CSS for ambitious businesses worldwide.',
  keywords: [
    'Freelance Web Designer',
    'Full-Stack Developer',
    'Next.js 14',
    'React Developer',
    'Tailwind CSS',
    'UI/UX Design',
    'Conversion Optimization',
    'E-Commerce Redesign'
  ],
  authors: [{ name: 'Studio Freelance' }],
  creator: 'Studio Freelance',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Freelance Web Designer & Developer | Bespoke Next.js Websites',
    description: 'Transform your brand with bespoke, lightning-fast digital flagship websites engineered for conversion.',
    siteName: 'Freelance Studio Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelance Web Designer & Developer | Next.js Portfolio',
    description: 'Bespoke, high-converting websites designed & coded for ambitious businesses and individuals.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
