import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Freelance Web Designer & Developer Portfolio',
  description: 'Bespoke, high-converting websites designed & coded for ambitious businesses and individuals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakarta.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
