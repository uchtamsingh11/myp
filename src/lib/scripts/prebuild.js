/**
 * Pre-build script to check environment variables
 * Runs before the build process to ensure all required environment variables are present
 */

// Load environment variables from .env files
require('dotenv').config();

// List of required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// Exit if any required environment variables are missing
if (missingEnvVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease add these variables to your .env file or deployment environment.');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables are present.');
console.log('Starting build process...');
process.exit(0);
