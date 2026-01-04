// backend/src/utils/validateEnv.ts
// ✅ FREE TIER: Strict validation, NO fallbacks

export function validateEnvironment() {
  const required = [
    'DATABASE_URL',    // ⚠️ WARNING: PostgreSQL on Fly = $2/mo minimum
    'JWT_SECRET',
    'REDIS_URL',       // ⚠️ WARNING: Redis on Fly = $1/mo minimum
    'CLIENT_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('');
    console.error('💡 FREE TIER ALTERNATIVES:');
    console.error('   - DATABASE_URL: Use free PostgreSQL from Neon, Supabase, or Railway');
    console.error('   - REDIS_URL: Use free Redis from Upstash or Railway');
    console.error('   - Fly.io PostgreSQL/Redis = NOT FREE (minimum $3/mo)');
    console.error('');
    process.exit(1);
  }

  // Validate JWT secret length (security)
  if (process.env.JWT_SECRET!.length < 32) {
    console.error('❌ FATAL: JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  // Validate URLs (catch typos early)
  try {
    new URL(process.env.DATABASE_URL!);
    new URL(process.env.REDIS_URL!);
    new URL(process.env.CLIENT_URL!);
  } catch (error) {
    console.error('❌ FATAL: Invalid URL in environment variables');
    console.error(error);
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
  console.log('⚠️  FREE TIER MODE: Ensure PostgreSQL + Redis are from free providers');
}