/**
 * Next.js Instrumentation file.
 * Runs once when the server starts (both dev and production).
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on the Node.js runtime (not edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env-validator');
    validateEnv();
  }
}
