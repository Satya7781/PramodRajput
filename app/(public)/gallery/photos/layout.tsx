import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Gallery',
  description: 'Browse photo albums from Pramod Rajput\'s community programs and public events.',
  alternates: { canonical: '/gallery/photos' },
};

export default function PhotoGalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
