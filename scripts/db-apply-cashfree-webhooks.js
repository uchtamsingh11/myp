#!/usr/bin/env node

/**
 * This script applies the Cashfree webhooks database migration
 * to your Supabase instance.
 * 
 * Usage:
 * 1. Make sure you have the correct environment variables set
 *    (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
 * 2. Run: node scripts/db-apply-cashfree-webhooks.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
        console.error('Missing required environment variables:');
        if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
        if (!supabaseKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to migration file
const migrationFilePath = path.join(__dirname, '../supabase/migrations/20240612_create_cashfree_webhooks_table.sql');

// Create interface for user input
const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
});

async function main() {
        try {
                console.log('🔍 Checking if cashfree_webhooks table already exists...');

                // Check if table already exists
                const { data: tableExists, error: tableError } = await supabase
                        .from('cashfree_webhooks')
                        .select('id')
                        .limit(1)
                        .maybeSingle();

                if (!tableError) {
                        console.log('✅ Table cashfree_webhooks already exists');
                        rl.question('Do you want to recreate the table? This will DELETE all existing webhook data! (y/N): ', async (answer) => {
                                if (answer.toLowerCase() === 'y') {
                                        await dropAndRecreateTable();
                                } else {
                                        console.log('Operation canceled. Existing table was preserved.');
                                        rl.close();
                                }
                        });
                        return;
                }

                // Table doesn't exist, proceed with creation
                console.log('🛠 Table cashfree_webhooks does not exist. Creating now...');
                await createTable();
        } catch (error) {
                console.error('❌ Error:', error.message);
                rl.close();
                process.exit(1);
        }
}

async function createTable() {
        try {
                // Read migration file
                const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

                // Execute SQL
                const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

                if (error) {
                        console.error('❌ Error applying migration:', error.message);
                        rl.close();
                        process.exit(1);
                }

                console.log('✅ Successfully created cashfree_webhooks table!');
                rl.close();
        } catch (error) {
                console.error('❌ Error creating table:', error.message);
                rl.close();
                process.exit(1);
        }
}

async function dropAndRecreateTable() {
        try {
                // Drop existing table
                const dropSQL = 'DROP TABLE IF EXISTS public.cashfree_webhooks CASCADE;';

                // Execute drop SQL
                const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropSQL });

                if (dropError) {
                        console.error('❌ Error dropping table:', dropError.message);
                        rl.close();
                        process.exit(1);
                }

                console.log('🗑️ Dropped existing cashfree_webhooks table');

                // Create new table
                await createTable();
        } catch (error) {
                console.error('❌ Error recreating table:', error.message);
                rl.close();
                process.exit(1);
        }
}

// Start script
console.log('📊 Cashfree Webhooks Database Migration Script');
console.log('=============================================');
main(); 