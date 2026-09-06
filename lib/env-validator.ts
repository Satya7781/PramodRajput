/**
 * Environment variable validator.
 * Called once at server startup (imported in instrumentation.ts).
 * Throws clearly if critical variables are missing or left at insecure defaults.
 */

interface EnvVar {
  key: string;
  required: boolean;
  insecureDefaults?: string[];
  description: string;
}

const ENV_SPEC: EnvVar[] = [
  {
    key: 'DATABASE_URL',
    required: true,
    description: 'Neon PostgreSQL connection string',
  },
  {
    key: 'JWT_SECRET',
    required: true,
    insecureDefaults: [
      'replace_with_a_very_long_random_secret_string_at_least_64_chars',
      'change-this-secret-in-production',
      'secret',
    ],
    description: 'JWT signing secret (min 64 chars recommended)',
  },
  {
    key: 'JWT_EXPIRES_IN',
    required: false,
    description: 'JWT token expiry (default: 7d)',
  },
  {
    key: 'CLOUDINARY_CLOUD_NAME',
    required: false,
    description: 'Cloudinary cloud name for media uploads',
  },
];

export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const spec of ENV_SPEC) {
    const value = process.env[spec.key];

    if (spec.required && !value) {
      missing.push(`  ✗ ${spec.key} — ${spec.description}`);
      continue;
    }

    if (value && spec.insecureDefaults?.includes(value)) {
      if (isProduction) {
        missing.push(`  ✗ ${spec.key} is set to an insecure default value. Change it before deploying.`);
      } else {
        warnings.push(`  ⚠ ${spec.key} is using a placeholder value — OK for dev, must change for production.`);
      }
    }
  }

  // JWT secret length check
  const jwtSecret = process.env.JWT_SECRET ?? '';
  if (jwtSecret.length > 0 && jwtSecret.length < 32) {
    const msg = `  ✗ JWT_SECRET is too short (${jwtSecret.length} chars). Use at least 32 chars; 64+ recommended.`;
    if (isProduction) missing.push(msg);
    else warnings.push(msg.replace('✗', '⚠'));
  }

  if (warnings.length > 0) {
    console.warn('\n[env-validator] Environment warnings:\n' + warnings.join('\n') + '\n');
  }

  if (missing.length > 0) {
    const prefix = isProduction ? 'FATAL' : 'ERROR';
    const message = `\n[env-validator] ${prefix}: Missing or insecure required environment variables:\n${missing.join('\n')}\n\nCopy .env.example to .env and fill in the values.\n`;
    if (isProduction) {
      throw new Error(message);
    } else {
      console.error(message);
    }
  }
}
