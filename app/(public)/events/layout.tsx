import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description: 'View upcoming events, live programs, registrations, and past community activities.',
  alternates: { canonical: '/events' },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
