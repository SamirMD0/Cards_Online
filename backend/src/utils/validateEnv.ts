// backend/src/utils/validateEnv.ts - REPLACE ENTIRE FILE

export function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'REDIS_URL',
    'CLIENT_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('');
    console.error('💡 Set secrets with:');
    console.error('   flyctl secrets set KEY=value');
    console.error('');
    
    // ✅ FIX: Exit immediately instead of continuing
    process.exit(1);
  }

  // Validate JWT secret length (security)
  if (process.env.JWT_SECRET!.length < 32) {
    console.error('❌ FATAL: JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  // ✅ FIX: Add try-catch for URL validation
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
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL!.substring(0, 30)}...`);
  console.log(`   REDIS_URL: ${process.env.REDIS_URL!.substring(0, 30)}...`);
  console.log(`   CLIENT_URL: ${process.env.CLIENT_URL}`);
}