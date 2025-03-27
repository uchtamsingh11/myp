/**
 * Environment configuration utilities
 */

/**
 * Get a required environment variable, throw if not defined
 */
function requiredEnv(key) {
        const value = process.env[key];
        if (!value) {
                throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
}

/**
 * Get an optional environment variable with fallback
 */
function optionalEnv(key, defaultValue = '') {
        return process.env[key] || defaultValue;
}

/**
 * Environment variables used throughout the application
 */
export const env = {
        // Application environment
        NODE_ENV: optionalEnv('NODE_ENV', 'development'),

        // Supabase configuration
        SUPABASE_URL: requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
        SUPABASE_ANON_KEY: requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        SUPABASE_SERVICE_KEY: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),

        // Application URLs
        APP_URL: optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

        // Feature flags
        ENABLE_FEATURE_X: optionalEnv('NEXT_PUBLIC_ENABLE_FEATURE_X', 'false') === 'true',
};

/**
 * Environment mode helpers
 */
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test'; 