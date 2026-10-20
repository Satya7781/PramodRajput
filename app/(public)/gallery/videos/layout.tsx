import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Gallery',
  description: 'Watch videos from Pramod Rajput\'s community programs and public events.',
  alternates: { canonical: '/gallery/videos' },
};

export default function VideoGalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
