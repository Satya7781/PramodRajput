import { Video as VideoIcon } from 'lucide-react';
import type { Video } from '@/lib/types';
import { VideoGrid } from './video-grid';

export const metadata = {
  title: 'Videos — Pramod Rajput',
  description: 'Watch videos from community events, initiatives, and outreach programs.',
};

async function getVideos(): Promise<Video[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/videos`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl animate-slide-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Gallery</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-6 text-balance">Videos</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Watch highlights from events, documentaries, and community stories.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No videos published yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
