'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { setCoins, addCoins, subtractCoins } from '@/lib/services/coin-management';

// Admin email - this is the same as in the API route
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

export default function AdminUserData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [coinAmount, setCoinAmount] = useState(1);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Filtered users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.referral_code?.toLowerCase().includes(query) ||
      user.referral_used?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);

        // First check if the user is authenticated
        const { data: authData } = await supabase.auth.getSession();

        if (!authData.session) {
          setError('You must be logged in to view admin data');
          setLoading(false);
          return;
        }

        const userEmail = authData.session.user.email;
        console.log('Current user:', userEmail);

        // Check if the current user is an admin - check localStorage first, then email
        const isAdminFromStorage = localStorage.getItem('isAdmin') === 'true';
        if (!isAdminFromStorage && userEmail !== ADMIN_EMAIL) {
          setError('You do not have admin privileges');
          setLoading(false);
          return;
        }

        // Fetch users directly using email verification in the API
        try {
          // Pass the admin email as a query parameter in the GET request
          const url = `/api/admin/direct-users?email=${encodeURIComponent(userEmail)}`;

          // Add admin token if available from localStorage
          const headers = {
            'Content-Type': 'application/json',
          };

          if (isAdminFromStorage) {
            headers['x-admin-token'] = 'true';
          }

          const response = await fetch(url, {
            method: 'GET',
            headers,
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorData = { error: 'Unknown error' };

            try {
              // Try to parse the error as JSON if possible
              errorData = JSON.parse(errorText);
            } catch (parseError) {
              console.error('Error parsing error response:', parseError);
              errorData = { error: errorText || 'Failed to fetch users' };
            }

            console.error('API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch users');
          }

          // Get response as text first
          const responseText = await response.text();

          // Only try to parse if there's actual content
          if (responseText.trim()) {
            const responseData = JSON.parse(responseText);
            setUsers(responseData.users || []);
          } else {
            setError('No data returned from server');
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          setError('Failed to load users data: ' + error.message);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users data: ' + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const retryFetch = async () => {
    setRefreshing(true);
    setError(null);
    setRefreshSuccess(false);

    try {
      // Check authentication status
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You are not logged in. Please log in as admin first.');
      }

      const userEmail = session.user.email;

      // Check if admin
      const isAdminFromStorage = localStorage.getItem('isAdmin') === 'true';
      if (!isAdminFromStorage && userEmail !== ADMIN_EMAIL) {
        throw new Error('You do not have admin privileges');
      }

      // Log current authenticated user for debugging
      console.log('Refresh users data for admin:', userEmail);

      // Fetch users from our direct API endpoint
      try {
        // Pass the admin email as a query parameter in the GET request
        const url = `/api/admin/direct-users?email=${encodeURIComponent(userEmail)}`;

        // Add admin token if available from localStorage
        const headers = {
          'Content-Type': 'application/json',
        };

        if (isAdminFromStorage) {
          headers['x-admin-token'] = 'true';
        }

        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData = { error: 'Unknown error' };

          try {
            // Try to parse the error as JSON if possible
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorData = { error: errorText || 'Failed to fetch users' };
          }

          console.error('API error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch users');
        }

        // Get response as text first
        const responseText = await response.text();

        // Only try to parse if there's actual content
        if (responseText.trim()) {
          const responseData = JSON.parse(responseText);
          setUsers(responseData.users || []);
        } else {
          setError('No data returned from server');
        }
      } catch (error) {
        console.error('Retry error:', error);
        setError('Failed to load users data: ' + error.message);
      } finally {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Retry error:', error);
      setError('Failed to load users data: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to handle coin update
  const handleCoinUpdate = async (userId, amount, operation) => {
    if (!amount || amount <= 0) {
      setUpdateError('Please enter a valid amount (greater than 0)');
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Get the authenticated user's email
      const { data: authData } = await supabase.auth.getSession();

      if (!authData.session) {
        throw new Error('You must be logged in to update coins');
      }

      const adminEmail = authData.session.user.email;

      // Check if admin
      const isAdminFromStorage = localStorage.getItem('isAdmin') === 'true';
      if (!isAdminFromStorage && adminEmail !== ADMIN_EMAIL) {
        throw new Error('You do not have admin privileges');
      }

      let updatedBalance;
      let actionMessage;

      // Using the coin utility functions directly to modify the balance
      if (operation === 'add') {
        updatedBalance = await addCoins(userId, parseInt(amount, 10));
        actionMessage = `Added ${amount} coins successfully`;
      } else if (operation === 'subtract') {
        const result = await subtractCoins(userId, parseInt(amount, 10), false);
        if (!result.success) {
          throw new Error(result.error || 'Failed to subtract coins');
        }
        updatedBalance = result.newBalance;
        actionMessage = `Subtracted ${amount} coins successfully`;
      } else if (operation === 'set') {
        updatedBalance = await setCoins(userId, parseInt(amount, 10));
        actionMessage = `Set balance to ${amount} coins successfully`;
      } else {
        throw new Error('Invalid operation');
      }

      // Update the local users array with the updated coin balance
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, coin_balance: updatedBalance } : user
        )
      );

      // Show success message
      setUpdateSuccess(actionMessage);

      // Refresh the users list to ensure data is current
      retryFetch();

      // Clear the selected user and reset form after success
      setSelectedUser(null);
      setCoinAmount(1);

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating coins:', error);
      setUpdateError(error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to handle selecting a user for coin update
  const handleSelectUser = user => {
    setSelectedUser(user);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  // Function to cancel coin update
  const handleCancelUpdate = () => {
    setSelectedUser(null);
    setCoinAmount(1);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="relative">
          <div className="w-8 h-8 rounded-full absolute border-4 border-solid border-zinc-800"></div>
          <div className="w-8 h-8 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-8">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={retryFetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return <div className="text-center my-8 text-gray-400">No users found.</div>;
  }

  return (
    <div className="pt-2 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold pl-2">User Management</h2>
        <div className="flex items-center">
          {refreshSuccess && (
            <span className="text-green-500 mr-4 text-sm">Data refreshed successfully!</span>
          )}
          <button
            onClick={retryFetch}
            disabled={refreshing}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center ${refreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {refreshing ? (
              <>
                <div className="relative h-4 w-4 mr-2">
                  <div className="w-4 h-4 rounded-full absolute border-2 border-solid border-zinc-800"></div>
                  <div className="w-4 h-4 rounded-full animate-spin absolute border-2 border-solid border-indigo-500 border-t-transparent"></div>
                </div>
                Refreshing...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm border rounded-lg bg-zinc-800 border-zinc-700 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by email, name, or referral code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-400">
            Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} matching "
            {searchQuery}"
          </div>
        )}
      </div>

      {/* Coin update success or error messages */}
      {(updateSuccess || updateError) && (
        <div
          className={`mb-4 p-4 rounded ${updateSuccess ? 'bg-green-800/50 text-green-400' : 'bg-red-800/50 text-red-400'}`}
        >
          {updateSuccess || updateError}
        </div>
      )}

      {/* Coin management modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg max-w-md w-full border border-zinc-700">
            <h3 className="text-xl font-bold mb-4">
              Manage Coins: {selectedUser.full_name || selectedUser.email}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">
                Current coin balance:{' '}
                <span className="text-white font-bold">{selectedUser.coin_balance || 0}</span>
              </p>

              <label className="block text-sm font-medium text-gray-400 mb-1">Coin Amount</label>
              <input
                type="number"
                min="1"
                value={coinAmount}
                onChange={e => setCoinAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white mb-4"
              />

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => handleCoinUpdate(selectedUser.id, coinAmount, 'add')}
                  disabled={updateLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex justify-center items-center disabled:opacity-50"
                >
                  {updateLoading ? (
                    <div className="relative h-4 w-4 mr-2">
                      <div className="w-4 h-4 rounded-full absolute border-2 border-solid border-zinc-800"></div>
                      <div className="w-4 h-4 rounded-full animate-spin absolute border-2 border-solid border-indigo-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  Add Coins
                </button>
                <button
                  onClick={() => handleCoinUpdate(selectedUser.id, coinAmount, 'subtract')}
                  disabled={updateLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex justify-center items-center disabled:opacity-50"
                >
                  {updateLoading ? (
                    <div className="relative h-4 w-4 mr-2">
                      <div className="w-4 h-4 rounded-full absolute border-2 border-solid border-zinc-800"></div>
                      <div className="w-4 h-4 rounded-full animate-spin absolute border-2 border-solid border-indigo-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  Subtract Coins
                </button>
              </div>

              <button
                onClick={() => handleCoinUpdate(selectedUser.id, coinAmount, 'set')}
                disabled={updateLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex justify-center items-center disabled:opacity-50"
              >
                {updateLoading ? (
                  <div className="relative h-4 w-4 mr-2">
                    <div className="w-4 h-4 rounded-full absolute border-2 border-solid border-zinc-800"></div>
                    <div className="w-4 h-4 rounded-full animate-spin absolute border-2 border-solid border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-8a1 1 0 011-1h2a1 1 0 010 2h-2v2a1 1 0 11-2 0v-2H6a1 1 0 010-2h2V7a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                Set Exact Coin Balance
              </button>
            </div>

            <div className="flex justify-end">
              <button onClick={handleCancelUpdate} className="text-gray-400 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-zinc-900 rounded-lg border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Phone
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Referral Code
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Referral Used
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Coins
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.full_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.phone_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.referral_code || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.referral_used || 'None'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                  {user.coin_balance || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleSelectUser(user)}
                    className="text-blue-500 hover:text-blue-400 font-medium"
                  >
                    Manage Coins
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
