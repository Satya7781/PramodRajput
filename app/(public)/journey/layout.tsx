import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journey',
  description: 'Follow Pramod Rajput\'s political and social service journey since 2009.',
  alternates: { canonical: '/journey' },
};

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
