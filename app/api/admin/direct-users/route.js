import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin email for access control
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

export async function GET(request) {
  try {
    // Get the session from the request
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Verify admin user
    if (email !== ADMIN_EMAIL && !request.headers.get('x-admin-token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create an admin Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      throw profilesError;
    }
    
    // Fetch all users with their email from auth.users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      // If we can't get auth users, just return profiles
      return NextResponse.json({ users: profiles });
    }
    
    // Combine profile data with auth user data
    const usersWithEmails = profiles.map(profile => {
      const authUser = authUsers.users?.find(user => user.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'Email not found'
      };
    });
    
    return NextResponse.json({ users: usersWithEmails });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get the client's email from the request body
    let email;
    
    try {
      const body = await request.json();
      email = body.email;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Bad Request: Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Check if the email is the admin email or has admin token
    if (email !== ADMIN_EMAIL && !request.headers.get('x-admin-token')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Create an admin Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      throw profilesError;
    }
    
    // Fetch all users with their email from auth.users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      // If we can't get auth users, just return profiles
      return NextResponse.json({ users: profiles });
    }
    
    // Combine profile data with auth user data
    const usersWithEmails = profiles.map(profile => {
      const authUser = authUsers.users?.find(user => user.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'Email not found'
      };
    });
    
    return NextResponse.json({ users: usersWithEmails });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
}