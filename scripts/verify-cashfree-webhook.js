#!/usr/bin/env node

/**
 * This script verifies your Cashfree webhook integration by:
 * 1. Checking environment variables 
 * 2. Testing webhook endpoint accessibility
 * 3. Verifying database connectivity
 * 
 * Usage:
 * 1. Make sure you have the correct environment variables set
 * 2. Run: node scripts/verify-cashfree-webhook.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const https = require('https');
const crypto = require('crypto');

// Create interface for user input
const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
});

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check environment variables
function checkEnvironmentVariables() {
        console.log('Checking environment variables...');

        const requiredVars = [
                'NEXT_PUBLIC_SUPABASE_URL',
                'SUPABASE_SERVICE_ROLE_KEY',
                'CASHFREE_APP_ID',
                'CASHFREE_SECRET_KEY',
                'CASHFREE_ENVIRONMENT',
                'NEXT_PUBLIC_APP_URL'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
                console.error('❌ Missing required environment variables:');
                missingVars.forEach(varName => console.error(`  - ${varName}`));
                return false;
        }

        console.log('✅ All required environment variables are set');

        // Check Cashfree environment value
        if (!['sandbox', 'production'].includes(process.env.CASHFREE_ENVIRONMENT)) {
                console.warn('⚠️ CASHFREE_ENVIRONMENT should be "sandbox" or "production"');
        }

        return true;
}

// Check webhook endpoint accessibility
async function checkWebhookEndpoint() {
        return new Promise((resolve) => {
                console.log('\nChecking webhook endpoint accessibility...');

                const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cashfree-webhook`;
                console.log(`Testing endpoint: ${webhookUrl}`);

                // Extract hostname and path from URL
                const url = new URL(webhookUrl);

                const options = {
                        hostname: url.hostname,
                        port: url.port || 443,
                        path: url.pathname,
                        method: 'GET',
                        timeout: 10000 // 10 second timeout
                };

                const req = https.request(options, (res) => {
                        let data = '';

                        res.on('data', (chunk) => {
                                data += chunk;
                        });

                        res.on('end', () => {
                                if (res.statusCode === 200) {
                                        console.log('✅ Webhook endpoint is accessible');
                                        try {
                                                const jsonData = JSON.parse(data);
                                                console.log('Response:', jsonData);
                                                resolve(true);
                                        } catch (e) {
                                                console.log('Response (not JSON):', data.substring(0, 100));
                                                resolve(true);
                                        }
                                } else {
                                        console.error(`❌ Webhook endpoint returned status code: ${res.statusCode}`);
                                        console.log('Response:', data);
                                        resolve(false);
                                }
                        });
                });

                req.on('error', (error) => {
                        console.error('❌ Error accessing webhook endpoint:', error.message);
                        resolve(false);
                });

                req.on('timeout', () => {
                        console.error('❌ Timeout accessing webhook endpoint');
                        req.destroy();
                        resolve(false);
                });

                req.end();
        });
}

// Check database connectivity and table existence
async function checkDatabase() {
        console.log('\nChecking database connection and table existence...');

        if (!supabaseUrl || !supabaseKey) {
                console.error('❌ Missing Supabase credentials');
                return false;
        }

        try {
                const supabase = createClient(supabaseUrl, supabaseKey);

                // Check connection by making a simple query
                const { data, error } = await supabase.from('cashfree_webhooks').select('id').limit(1);

                if (error) {
                        if (error.code === 'PGRST116') {
                                console.error('❌ Table "cashfree_webhooks" does not exist. Please run the migration script first.');
                                return false;
                        } else {
                                console.error('❌ Database connection error:', error.message);
                                return false;
                        }
                }

                console.log('✅ Successfully connected to database and verified table existence');
                return true;
        } catch (error) {
                console.error('❌ Error connecting to database:', error.message);
                return false;
        }
}

// Run a test webhook
async function sendTestWebhook() {
        return new Promise((resolve) => {
                rl.question('\nWould you like to send a test webhook? (y/N): ', async (answer) => {
                        if (answer.toLowerCase() !== 'y') {
                                console.log('Skipping test webhook...');
                                resolve(true);
                                return;
                        }

                        console.log('\nSending test webhook...');

                        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cashfree-webhook`;
                        const url = new URL(webhookUrl);

                        // Create a test webhook payload
                        const testOrderId = 'test_' + Date.now();
                        const payload = {
                                data: {
                                        order: {
                                                order_id: testOrderId,
                                                order_amount: 100,
                                                order_currency: 'INR',
                                                order_status: 'TEST'
                                        },
                                        payment: {
                                                cf_payment_id: 'test_' + Math.floor(Math.random() * 1000000),
                                                payment_status: 'TEST',
                                                payment_amount: 100,
                                                payment_currency: 'INR'
                                        }
                                },
                                type: 'TEST_WEBHOOK',
                                event_time: new Date().toISOString()
                        };

                        // Create signature for the test payload
                        const timestamp = Date.now().toString();
                        const stringPayload = JSON.stringify(payload);
                        const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;

                        const hmac = crypto.createHmac('sha256', webhookSecret);
                        hmac.update(timestamp + stringPayload);
                        const signature = hmac.digest('base64');

                        console.log(`Test Order ID: ${testOrderId}`);

                        const options = {
                                hostname: url.hostname,
                                port: url.port || 443,
                                path: url.pathname,
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                        'Content-Length': Buffer.byteLength(stringPayload),
                                        'x-webhook-signature': signature,
                                        'x-webhook-timestamp': timestamp,
                                        'x-idempotency-key': 'test-' + Date.now()
                                },
                                timeout: 10000
                        };

                        const req = https.request(options, (res) => {
                                let data = '';

                                res.on('data', (chunk) => {
                                        data += chunk;
                                });

                                res.on('end', () => {
                                        if (res.statusCode === 200) {
                                                console.log('✅ Test webhook sent successfully');
                                                console.log('Response:', data);

                                                // Check if the webhook was recorded in the database
                                                setTimeout(async () => {
                                                        try {
                                                                const supabase = createClient(supabaseUrl, supabaseKey);
                                                                const { data: webhookData, error } = await supabase
                                                                        .from('cashfree_webhooks')
                                                                        .select('*')
                                                                        .eq('order_id', testOrderId)
                                                                        .single();

                                                                if (error) {
                                                                        console.error('❌ Error verifying webhook in database:', error.message);
                                                                } else if (webhookData) {
                                                                        console.log('✅ Test webhook successfully recorded in database');
                                                                } else {
                                                                        console.error('❌ Test webhook not found in database');
                                                                }
                                                        } catch (err) {
                                                                console.error('Error checking database:', err);
                                                        }

                                                        resolve(true);
                                                }, 2000); // Wait 2 seconds for processing
                                        } else {
                                                console.error(`❌ Test webhook failed with status code: ${res.statusCode}`);
                                                console.log('Response:', data);
                                                resolve(false);
                                        }
                                });
                        });

                        req.on('error', (error) => {
                                console.error('❌ Error sending test webhook:', error.message);
                                resolve(false);
                        });

                        req.on('timeout', () => {
                                console.error('❌ Timeout sending test webhook');
                                req.destroy();
                                resolve(false);
                        });

                        req.write(stringPayload);
                        req.end();
                });
        });
}

// Display configuration summary
function displaySummary() {
        console.log('\n=== Cashfree Webhook Configuration Summary ===');
        console.log(`Cashfree Environment: ${process.env.CASHFREE_ENVIRONMENT || 'Not set'}`);
        console.log(`Webhook URL: ${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cashfree-webhook`);
        console.log(`Signature Validation: ${process.env.SKIP_SIGNATURE_CHECK === 'true' ? 'Disabled (Development only)' : 'Enabled'}`);

        console.log('\nTo complete setup:');
        console.log('1. Add this webhook URL to your Cashfree dashboard');
        console.log('2. Subscribe to payment events (Payment Success, Payment Failure, etc.)');
        console.log('3. Make a test payment to verify the complete flow');
        console.log('\nSee README-cashfree-webhook.md for more information.');
}

// Main function
async function main() {
        console.log('=== Cashfree Webhook Verification Tool ===\n');

        // Run checks
        const envVarsOk = checkEnvironmentVariables();
        if (!envVarsOk) {
                console.error('\n❌ Environment variable check failed. Please fix the issues above.');
                rl.close();
                process.exit(1);
        }

        const endpointOk = await checkWebhookEndpoint();
        if (!endpointOk) {
                console.error('\n❌ Webhook endpoint check failed. Please fix the issues above.');
                rl.close();
                process.exit(1);
        }

        const dbOk = await checkDatabase();
        if (!dbOk) {
                console.error('\n❌ Database check failed. Please fix the issues above.');
                rl.close();
                process.exit(1);
        }

        await sendTestWebhook();

        displaySummary();
        rl.close();
}

// Start the script
main().catch(error => {
        console.error('Unhandled error:', error);
        rl.close();
        process.exit(1);
}); 