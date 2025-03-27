import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

// Admin email for access control
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

export async function GET(request) {
  try {
    // Create a regular Supabase client with cookies (user's perspective)
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Create an admin Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the user is authenticated and is an admin
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Auth error: ' + authError.message }, { status: 401 });
    }

    if (!data.user) {
      console.error('No user found in session');
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    console.log('Authenticated user:', data.user.email);

    // Check if the user is an admin
    if (data.user.email !== ADMIN_EMAIL && !request.headers.get('x-admin-token')) {
      console.error('User is not admin:', data.user.email);
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // At this point, we have an authenticated admin user

    // Fetch all profiles using the admin client to bypass RLS
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Fetch all users with their email from auth.users using admin client
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      // If we can't get auth users, just return profiles
      return NextResponse.json({ users: profiles });
    }

    // Combine profile data with auth user data
    const usersWithEmails = profiles.map(profile => {
      const authUser = authUsers.users.find(user => user.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'Email not found',
      };
    });

    return NextResponse.json({ users: usersWithEmails });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
