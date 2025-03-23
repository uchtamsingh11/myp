'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  const [email, setEmail] = useState('Loading...');
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Function to get user data
    async function getUserEmail() {
      // Try to get user from client
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user:', error.message);
        setEmail('Error: ' + error.message);
        return;
      }
      
      if (data && data.user && data.user.email) {
        setEmail(data.user.email);
      } else {
        setEmail('No email found');
      }
    }
    
    getUserEmail();
  }, [supabase.auth]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header with email - using inline styles for maximum reliability */}
      <div style={{ 
        backgroundColor: 'black', 
        color: 'white', 
        padding: '20px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        USER EMAIL: {email}
      </div>
      
      {/* Simple dashboard content */}
      <div style={{ padding: '20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Dashboard</h1>
        <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
          Welcome to your dashboard. This is a simplified version to ensure the email display works correctly.
        </p>
      </div>
    </div>
  );
}