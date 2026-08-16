import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pramod Rajput | Serving People, Building Tomorrow',
  description: 'Official digital platform of Pramod Rajput — public servant, community leader, and advocate for grassroots development across Maharashtra.',
  openGraph: {
    title: 'Pramod Rajput | Serving People, Building Tomorrow',
    description: 'Official digital platform of Pramod Rajput — public servant, community leader, and advocate for grassroots development across Maharashtra.',
    images: [{ url: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
