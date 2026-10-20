import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificate Verification',
  description: 'Verify certificates issued for eligible community events and programs.',
  alternates: { canonical: '/certificate/verify' },
};

export default function CertificateVerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
