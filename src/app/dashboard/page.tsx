'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  const [email, setEmail] = useState('Loading...');
  const [userName, setUserName] = useState('User');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Function to get user data
    async function getUserData() {
      setIsLoading(true);
      // Try to get user from client
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user:', error.message);
        setEmail('Error: ' + error.message);
        setIsLoading(false);
        return;
      }
      
      if (data && data.user) {
        if (data.user.email) {
          setEmail(data.user.email);
        } else {
          setEmail('No email found');
        }
        
        // Try to get user's name from metadata or profile
        if (data.user.user_metadata && data.user.user_metadata.full_name) {
          setUserName(data.user.user_metadata.full_name);
        }
        
        // Alternative: get profile data from profile table
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', data.user.id)
            .single();
            
          if (profileData && profileData.full_name) {
            setUserName(profileData.full_name);
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
        }
      }
      
      setIsLoading(false);
    }
    
    getUserData();
  }, [supabase.auth]);

  // Mock data for the dashboard
  const accountStats = [
    { label: 'Balance', value: '$12,345.67', change: '+2.4%', positive: true },
    { label: 'Profit/Loss', value: '$1,234.56', change: '+5.6%', positive: true },
    { label: 'Winning Trades', value: '67%', change: '+3.2%', positive: true },
    { label: 'Open Positions', value: '5', change: '-1', positive: false }
  ];

  const recentActivities = [
    { id: 1, type: 'Trade', symbol: 'AAPL', action: 'Buy', amount: '10 shares', price: '$175.34', time: '10:30 AM', status: 'Completed' },
    { id: 2, type: 'Strategy', name: 'MA Crossover', action: 'Updated', time: '09:15 AM', status: 'Active' },
    { id: 3, type: 'Bot', name: 'Forex Scalper', action: 'Started', time: 'Yesterday', status: 'Running' },
    { id: 4, type: 'Trade', symbol: 'TSLA', action: 'Sell', amount: '5 shares', price: '$242.76', time: 'Yesterday', status: 'Completed' }
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      {/* Dashboard header with user info */}
      <header className="bg-zinc-800 p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-zinc-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">Welcome, {userName}</p>
            <p className="text-zinc-400 text-sm">{email}</p>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Account stats cards */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accountStats.map((stat, index) => (
                  <div key={index} className="bg-zinc-800 rounded-lg p-4 shadow-lg">
                    <p className="text-zinc-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold my-1">{stat.value}</p>
                    <p className={`text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      {stat.positive ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-6 6a1 1 0 001 1h6a1 1 0 001-1v-1a1 1 0 00-1-1H7a1 1 0 00-1 1v1z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 13a1 1 0 01-1 1H9a1 1 0 01-1-1v-1a1 1 0 011-1h2a1 1 0 011 1v1zm-6-6a1 1 0 001 1h6a1 1 0 001-1V6a1 1 0 00-1-1H7a1 1 0 00-1 1v1z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M14.707 7.293a1 1 0 00-1.414 0L10 10.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {stat.change}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick actions */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/dashboard/trading-view/webhook-url" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors">
                  <div className="bg-blue-500/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="font-medium">Webhook URL</p>
                </a>
                <a href="/dashboard/trading-view/json-generator" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors">
                  <div className="bg-green-500/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <p className="font-medium">JSON Generator</p>
                </a>
                <a href="/dashboard/broker-auth" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors">
                  <div className="bg-purple-500/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="font-medium">Broker Auth</p>
                </a>
                <a href="/dashboard/strategy" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors">
                  <div className="bg-amber-500/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="font-medium">Strategy</p>
                </a>
              </div>
            </section>

            {/* Recent activity */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-700">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Details</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {recentActivities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-zinc-700">
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {activity.type === 'Trade' ? (
                            <div>
                              <p className="font-medium">{activity.symbol} - {activity.action}</p>
                              <p className="text-zinc-400 text-sm">{activity.amount} @ {activity.price}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{activity.name}</p>
                              <p className="text-zinc-400 text-sm">{activity.action}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                          {activity.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            activity.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                            activity.status === 'Running' ? 'bg-blue-500/20 text-blue-400' : 
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <a href="/dashboard/activity" className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center">
                  View all activity
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}