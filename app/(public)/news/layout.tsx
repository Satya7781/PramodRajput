import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News',
  description: 'Read the latest news and updates about Pramod Rajput\'s public service work.',
  alternates: { canonical: '/news' },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
