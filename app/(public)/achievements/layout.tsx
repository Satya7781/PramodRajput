import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Discover Pramod Rajput\'s public service achievements and community initiatives.',
  alternates: { canonical: '/achievements' },
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
