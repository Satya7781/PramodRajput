'use client';

/**
 * Direct certificate page — /certificate/[token]
 * Users can be sent a direct link using their verification_token.
 * This page looks up the certificate and redirects to the standard verify result page.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CertificateDirectPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!params?.token) return;
    // Redirect to the standard verify page using the token as the identifier
    // The verify API now accepts both certificate_number and verification_token
    router.replace(`/certificate/verify/${encodeURIComponent(params.token)}`);
  }, [params?.token, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading your certificate...</p>
      </div>
    </div>
  );
}
