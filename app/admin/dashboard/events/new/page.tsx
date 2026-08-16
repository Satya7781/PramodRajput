import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EventForm } from '@/components/admin/event-form';

export const metadata = { title: 'Create Event — Admin' };

export default function NewEventPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the details to create a new event.</p>
      </div>
      <EventForm />
    </div>
  );
}
