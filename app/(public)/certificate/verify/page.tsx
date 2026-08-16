import { ShieldCheck, Search } from 'lucide-react';
import { CertificateVerifyForm } from './verify-form';

export const metadata = {
  title: 'Verify Certificate — Pramod Rajput',
  description: 'Verify the authenticity of a certificate issued by the Pramod Rajput Digital Platform.',
};

export default function VerifyCertificatePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 mb-6 animate-scale-in">
              <ShieldCheck className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Certificate Verification</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Enter the certificate number to verify its authenticity. This confirms the certificate was issued
              through the Pramod Rajput Digital Platform.
            </p>
            <CertificateVerifyForm />
          </div>
        </div>
      </section>
    </div>
  );
}
