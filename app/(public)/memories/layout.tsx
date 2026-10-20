import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Memories',
  description: 'Browse moments from community programs, outreach initiatives, and public events.',
  alternates: { canonical: '/memories' },
};

export default function MemoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
