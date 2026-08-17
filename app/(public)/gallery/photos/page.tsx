import Link from 'next/link';
import { ImageIcon, ArrowRight } from 'lucide-react';
import type { PhotoAlbum } from '@/lib/types';

export const metadata = {
  title: 'Photo Gallery — Pramod Rajput',
  description: 'Browse photo albums from community events, outreach programs, and initiatives.',
};

async function getAlbums(): Promise<PhotoAlbum[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/albums`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function PhotosPage() {
  const albums = await getAlbums();

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Gallery</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">Photo Albums</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Moments captured from community events, outreach programs, and initiatives across Maharashtra.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album, i) => (
                <Link
                  key={album.id}
                  href={`/gallery/photos/${album.slug}`}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    {album.cover_image_url ? (
                      <img
                        src={album.cover_image_url}
                        alt={album.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-sm font-medium flex items-center gap-1">
                        View Album
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{album.title}</h3>
                    {album.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{album.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No photo albums available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
